#!/usr/bin/env node

/**
 * Validation script for Leviathan documentation consolidation
 * Verifies that all source files referenced in the consolidation plan exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Base path for the project
const BASE_PATH = path.resolve(__dirname, '..');

// Read and parse the consolidation tracker
function readTrackerCSV() {
  const csvPath = path.join(__dirname, 'consolidation-tracker.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  return csv.parse(content, {
    columns: true,
    skip_empty_lines: true
  });
}

// Extract file paths from source_files column
function extractFilePaths(sourceFiles) {
  const paths = [];
  
  // Handle various formats in the CSV
  // Format 1: "file.md"
  // Format 2: "file1.md, file2.md"
  // Format 3: "file.md lines 10-30"
  // Format 4: "_ref/orig-agent/drafts/ (48 files)"
  
  const entries = sourceFiles.split(',').map(s => s.trim());
  
  for (const entry of entries) {
    // Remove line number references
    let cleanPath = entry.replace(/\s+lines?\s+\d+(-\d+)?/gi, '').trim();
    
    // Remove file count annotations
    cleanPath = cleanPath.replace(/\s*\(\d+\s+files?\)/gi, '').trim();
    
    // Skip empty or N/A entries
    if (!cleanPath || cleanPath === 'N/A') continue;
    
    // Handle directory references
    if (cleanPath.endsWith('/')) {
      paths.push({ path: cleanPath, isDirectory: true });
    } else {
      paths.push({ path: cleanPath, isDirectory: false });
    }
  }
  
  return paths;
}

// Check if a file or directory exists
function checkPath(relativePath, isDirectory) {
  const fullPath = path.join(BASE_PATH, relativePath);
  
  try {
    const stats = fs.statSync(fullPath);
    if (isDirectory) {
      return stats.isDirectory();
    } else {
      return stats.isFile();
    }
  } catch (error) {
    return false;
  }
}

// Main validation function
function validateSources() {
  console.log(`${colors.blue}=== Leviathan Documentation Source Validation ===${colors.reset}\n`);
  
  const tasks = readTrackerCSV();
  const results = {
    total: 0,
    found: 0,
    missing: [],
    directories: 0
  };
  
  // Group by phase for better output
  const phases = {};
  tasks.forEach(task => {
    if (!phases[task.Phase]) {
      phases[task.Phase] = [];
    }
    phases[task.Phase].push(task);
  });
  
  // Validate each phase
  Object.keys(phases).sort().forEach(phase => {
    console.log(`${colors.yellow}Phase ${phase}:${colors.reset}`);
    
    phases[phase].forEach(task => {
      const paths = extractFilePaths(task.Source_Files);
      
      paths.forEach(({ path: filePath, isDirectory }) => {
        results.total++;
        
        const exists = checkPath(filePath, isDirectory);
        
        if (exists) {
          results.found++;
          if (isDirectory) results.directories++;
          console.log(`  ${colors.green}✓${colors.reset} ${task.Task_ID}: ${filePath}`);
        } else {
          results.missing.push({
            taskId: task.Task_ID,
            taskName: task.Task_Name,
            path: filePath,
            isDirectory
          });
          console.log(`  ${colors.red}✗${colors.reset} ${task.Task_ID}: ${filePath} ${colors.red}(NOT FOUND)${colors.reset}`);
        }
      });
    });
    
    console.log('');
  });
  
  // Summary report
  console.log(`${colors.blue}=== Validation Summary ===${colors.reset}`);
  console.log(`Total paths checked: ${results.total}`);
  console.log(`${colors.green}Found: ${results.found}${colors.reset} (${results.directories} directories)`);
  console.log(`${colors.red}Missing: ${results.missing.length}${colors.reset}`);
  
  if (results.missing.length > 0) {
    console.log(`\n${colors.red}Missing files/directories:${colors.reset}`);
    results.missing.forEach(({ taskId, taskName, path, isDirectory }) => {
      const type = isDirectory ? 'directory' : 'file';
      console.log(`  - ${taskId} (${taskName}): ${path} [${type}]`);
    });
  }
  
  // Check for specific critical files mentioned in inventory
  console.log(`\n${colors.blue}=== Critical File Validation ===${colors.reset}`);
  const criticalFiles = [
    '_01-whisper.md',
    '_core.md',
    '_ref/orig-agent/CORE_PRINCIPLES.md',
    '_ref/mcp-ceo/CLAUDE.md',
    '_ref/mcp-ceo/docs/adr/007-flowmind-semantic-control-language.md',
    '_ref/mcp-ceo/docs/BIDIRECTIONAL-FLOW-DIAGRAM.md',
    'workshop/WORKSHOP-INTELLIGENCE-MASTER-PLAN.md'
  ];
  
  criticalFiles.forEach(file => {
    const exists = checkPath(file, false);
    const status = exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${status} ${file}`);
  });
  
  // Return exit code based on validation results
  process.exit(results.missing.length > 0 ? 1 : 0);
}

// Run validation
try {
  validateSources();
} catch (error) {
  console.error(`${colors.red}Error during validation: ${error.message}${colors.reset}`);
  process.exit(1);
}