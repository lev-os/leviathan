#!/usr/bin/env node

/**
 * Cleanup Identical Diffs Tool
 * 
 * Purpose: Identify groups with identical files, mark them in CSV as "identical",
 * and remove their diff directories to focus manual review on actual differences.
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class IdenticalDiffCleaner {
  constructor() {
    this.diffsDir = './diffs';
    this.trackerPath = './context-consolidation/tracker.csv';
    this.identicalGroups = [];
    this.removedGroups = [];
  }

  async cleanup() {
    console.log('🔍 Identifying identical files and cleaning up diffs...');
    
    // Find all diff groups
    const groups = await this.findDiffGroups();
    
    // Check each group for identical files
    for (const group of groups) {
      const isIdentical = await this.checkGroupIdentical(group);
      if (isIdentical) {
        this.identicalGroups.push(group);
        await this.removeDiffDirectory(group);
      }
    }
    
    // Update tracker CSV
    await this.updateTrackerCSV();
    
    // Generate cleanup report
    await this.generateCleanupReport();
    
    console.log(`✅ Cleanup complete: ${this.identicalGroups.length} identical groups removed`);
  }

  async findDiffGroups() {
    const groups = [];
    
    try {
      const entries = await fs.readdir(this.diffsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('group_')) {
          groups.push(entry.name);
        }
      }
    } catch (error) {
      console.log('⚠️  Diffs directory not found or empty');
      return [];
    }
    
    return groups.sort();
  }

  async checkGroupIdentical(groupId) {
    const groupPath = path.join(this.diffsDir, groupId);
    
    try {
      // Read summary to get file list
      const summaryPath = path.join(groupPath, 'summary.md');
      const summaryContent = await fs.readFile(summaryPath, 'utf-8');
      
      // Extract file paths from summary
      const fileMatches = summaryContent.match(/^\d+\. (.+)$/gm);
      if (!fileMatches || fileMatches.length < 2) {
        return false;
      }
      
      const files = fileMatches.map(match => match.replace(/^\d+\. /, ''));
      
      // Calculate hash for each file
      const hashes = [];
      for (const file of files) {
        try {
          // Convert relative path to absolute path
          const absolutePath = path.resolve('/Users/jean-patricksmith', file);
          const content = await fs.readFile(absolutePath, 'utf-8');
          const hash = crypto.createHash('sha256').update(content).digest('hex');
          hashes.push(hash);
        } catch (error) {
          console.log(`    ⚠️  Cannot read ${file}: ${error.message}`);
          return false; // If we can't read a file, don't assume identical
        }
      }
      
      // Check if all hashes are identical
      const allIdentical = hashes.every(hash => hash === hashes[0]);
      
      if (allIdentical) {
        console.log(`  🔗 ${groupId}: All ${files.length} files are identical`);
        return true;
      } else {
        console.log(`  📝 ${groupId}: Files have differences (keeping for review)`);
        return false;
      }
      
    } catch (error) {
      console.log(`  ❌ Error checking ${groupId}: ${error.message}`);
      return false;
    }
  }

  async removeDiffDirectory(groupId) {
    const groupPath = path.join(this.diffsDir, groupId);
    
    try {
      await fs.rm(groupPath, { recursive: true, force: true });
      this.removedGroups.push(groupId);
      console.log(`  🗑️  Removed ${groupId} (identical files)`);
    } catch (error) {
      console.log(`  ❌ Failed to remove ${groupId}: ${error.message}`);
    }
  }

  async updateTrackerCSV() {
    console.log('📊 Updating tracker CSV with identical file markings...');
    
    try {
      const trackerContent = await fs.readFile(this.trackerPath, 'utf-8');
      const lines = trackerContent.split('\n');
      
      if (lines.length === 0) {
        console.log('❌ Tracker file is empty');
        return;
      }
      
      // Build mapping of group ID to files
      const groupToFiles = new Map();
      for (const groupId of this.identicalGroups) {
        const groupPath = path.join(this.diffsDir, groupId);
        try {
          // Try to read summary before it was deleted (from backup or reconstruct)
          // For now, we'll identify by diff_group column in CSV
          groupToFiles.set(groupId, []);
        } catch (error) {
          // Group already deleted, we'll identify from CSV
        }
      }
      
      // Update CSV rows
      let updatedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        // Parse CSV row (handle quoted fields)
        const row = this.parseCSVRow(lines[i]);
        if (row.length < 11) continue; // Need at least diff_group column
        
        const diffGroup = row[10] || ''; // diff_group column
        
        if (this.identicalGroups.includes(diffGroup)) {
          // Mark as identical in consolidation_decision column (index 9)
          row[9] = 'identical_files';
          // Update review_status column (index 8)
          row[8] = 'auto_reviewed';
          // Add note
          const notes = row[11] || '';
          row[11] = notes ? `${notes}; Auto-marked: identical files` : 'Auto-marked: identical files';
          
          lines[i] = this.formatCSVRow(row);
          updatedCount++;
        }
      }
      
      // Write updated tracker
      const updatedContent = lines.join('\n');
      await fs.writeFile(this.trackerPath, updatedContent);
      
      console.log(`✅ Updated ${updatedCount} rows in tracker CSV`);
    } catch (error) {
      console.error('❌ Failed to update tracker CSV:', error.message);
    }
  }

  parseCSVRow(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current);
    
    return result;
  }

  formatCSVRow(fields) {
    return fields.map(field => `"${field.replace(/"/g, '""')}"`).join(',');
  }

  async generateCleanupReport() {
    const reportContent = `# Identical Files Cleanup Report

Generated: ${new Date().toISOString()}

## Summary
- **Total groups processed:** ${this.identicalGroups.length + this.removedGroups.length}
- **Identical groups found:** ${this.identicalGroups.length}
- **Diff directories removed:** ${this.removedGroups.length}
- **Tracker CSV updated:** Yes

## Identical Groups (Auto-marked in CSV):
${this.identicalGroups.map(group => `- ${group}`).join('\n')}

## Manual Review Still Needed:
Check remaining groups in ./diffs/ directory - these contain actual differences requiring human analysis.

## Next Steps:
1. Focus manual review on remaining diff groups
2. Use tracker CSV to track consolidation decisions  
3. Execute consolidation for high-priority groups first
4. Test after each consolidation

## Consolidation Strategy for Identical Files:
Since these files are identical, you can:
1. Choose any one as canonical (typically the mcp-mvp version)
2. Remove duplicates safely
3. Update any references if needed
4. Archive removed files for safety
`;

    await fs.writeFile(path.join(this.diffsDir, 'cleanup-report.md'), reportContent);
    console.log('📋 Generated cleanup report: diffs/cleanup-report.md');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new IdenticalDiffCleaner();
  try {
    await cleaner.cleanup();
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message);
    process.exit(1);
  }
}