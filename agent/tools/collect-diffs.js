#!/usr/bin/env node

/**
 * Collect Diffs Tool - Systematic diff collection for duplicate groups
 * 
 * Purpose: Generate side-by-side diffs for all duplicate groups to enable
 * systematic manual analysis and consolidation decisions.
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

const execCommand = promisify(spawn);

class DiffCollector {
  constructor() {
    this.diffsDir = './diffs';
    this.trackerPath = './context-consolidation/tracker.csv';
    this.auditPath = './context-consolidation/innovation-audit.md';
    this.duplicateGroups = [];
  }

  async collect() {
    console.log('🔍 Starting systematic diff collection...');
    
    // Ensure diffs directory exists
    await fs.mkdir(this.diffsDir, { recursive: true });
    
    // Parse duplicate groups from innovation audit
    await this.parseDuplicateGroups();
    
    // Generate diffs for each group
    await this.generateDiffs();
    
    // Update tracker.csv with diff column
    await this.updateTracker();
    
    console.log('✅ Diff collection complete - check ./diffs/ directory');
  }

  async parseDuplicateGroups() {
    console.log('📋 Parsing duplicate groups from innovation audit...');
    
    const auditContent = await fs.readFile(this.auditPath, 'utf-8');
    const lines = auditContent.split('\n');
    
    let currentGroup = null;
    let groupCounter = 1;
    
    for (const line of lines) {
      // Match duplicate group headers
      const groupMatch = line.match(/^### Duplicate Group \((\d+) files?\)$/);
      if (groupMatch) {
        if (currentGroup && currentGroup.files.length > 0) {
          this.duplicateGroups.push(currentGroup);
        }
        
        currentGroup = {
          id: `group_${groupCounter.toString().padStart(3, '0')}`,
          fileCount: parseInt(groupMatch[1]),
          files: [],
          diffFiles: []
        };
        groupCounter++;
        continue;
      }
      
      // Match file entries
      const fileMatch = line.match(/^- (.+)$/);
      if (fileMatch && currentGroup) {
        currentGroup.files.push(fileMatch[1]);
      }
    }
    
    // Add the last group
    if (currentGroup && currentGroup.files.length > 0) {
      this.duplicateGroups.push(currentGroup);
    }
    
    console.log(`📊 Found ${this.duplicateGroups.length} duplicate groups`);
  }

  async generateDiffs() {
    console.log('🔄 Generating diffs for all duplicate groups...');
    
    for (const group of this.duplicateGroups) {
      await this.generateGroupDiffs(group);
    }
  }

  async generateGroupDiffs(group) {
    console.log(`  📝 Processing ${group.id} (${group.fileCount} files)`);
    
    if (group.files.length < 2) {
      console.log(`    ⚠️  Skipping ${group.id} - only ${group.files.length} file(s)`);
      return;
    }
    
    // Create group directory
    const groupDir = path.join(this.diffsDir, group.id);
    await fs.mkdir(groupDir, { recursive: true });
    
    // Generate summary file
    const summaryContent = this.generateGroupSummary(group);
    await fs.writeFile(path.join(groupDir, 'summary.md'), summaryContent);
    
    // Generate pairwise diffs
    for (let i = 0; i < group.files.length - 1; i++) {
      for (let j = i + 1; j < group.files.length; j++) {
        const file1 = group.files[i];
        const file2 = group.files[j];
        
        const diffFileName = `diff_${i + 1}_vs_${j + 1}.txt`;
        const diffPath = path.join(groupDir, diffFileName);
        
        try {
          await this.generateDiff(file1, file2, diffPath);
          group.diffFiles.push(diffFileName);
        } catch (error) {
          console.log(`    ❌ Failed to diff ${path.basename(file1)} vs ${path.basename(file2)}: ${error.message}`);
        }
      }
    }
    
    // If only 2 files, create a simplified main diff
    if (group.files.length === 2) {
      const mainDiffPath = path.join(groupDir, 'main_diff.txt');
      try {
        await this.generateDiff(group.files[0], group.files[1], mainDiffPath);
        group.diffFiles.push('main_diff.txt');
      } catch (error) {
        console.log(`    ❌ Failed to create main diff: ${error.message}`);
      }
    }
    
    console.log(`    ✅ Generated ${group.diffFiles.length} diff files for ${group.id}`);
  }

  generateGroupSummary(group) {
    const files = group.files.map((file, index) => `${index + 1}. ${file}`).join('\n');
    
    return `# Duplicate Group: ${group.id}

## Files (${group.fileCount} total):
${files}

## Analysis Notes:
- [ ] Reviewed all files
- [ ] Identified canonical version
- [ ] Noted unique features in each version
- [ ] Made consolidation decision

## Consolidation Decision:
**Canonical:** TBD
**Reason:** TBD
**Action:** TBD

## Review Checklist:
- [ ] Content comparison complete
- [ ] Constitutional compliance checked
- [ ] Dependencies/inheritance verified
- [ ] Backup created before consolidation
- [ ] Consolidation executed
- [ ] Tests verified after consolidation

## Notes:
(Add manual analysis notes here)
`;
  }

  async generateDiff(file1, file2, outputPath) {
    return new Promise((resolve, reject) => {
      // Use git diff for better formatting, fall back to diff if git not available
      const command = 'git';
      const args = ['diff', '--no-index', '--no-prefix', file1, file2];
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', async (code) => {
        try {
          // Git diff returns 1 when files differ, which is expected
          if (code === 0 || code === 1) {
            if (stdout.trim() === '') {
              stdout = 'Files are identical.\n';
            }
            
            const diffContent = `# Diff: ${path.basename(file1)} vs ${path.basename(file2)}

## File 1: ${file1}
## File 2: ${file2}

\`\`\`diff
${stdout}
\`\`\`

## Analysis:
- [ ] Reviewed differences
- [ ] Identified unique content in file 1
- [ ] Identified unique content in file 2
- [ ] Determined preferred version
- [ ] Noted consolidation strategy

## Decision:
**Preferred:** TBD
**Reason:** TBD
`;
            
            await fs.writeFile(outputPath, diffContent);
            resolve();
          } else {
            reject(new Error(`Git diff failed with code ${code}: ${stderr}`));
          }
        } catch (error) {
          reject(error);
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async updateTracker() {
    console.log('📊 Updating tracker.csv with diff column...');
    
    try {
      const trackerContent = await fs.readFile(this.trackerPath, 'utf-8');
      const lines = trackerContent.split('\n');
      
      if (lines.length === 0) {
        console.log('❌ Tracker file is empty');
        return;
      }
      
      // Add diff_group column to header
      const header = lines[0];
      const newHeader = header.replace('notes', 'diff_group,notes');
      lines[0] = newHeader;
      
      // Create file path to group mapping
      const fileToGroup = new Map();
      for (const group of this.duplicateGroups) {
        for (const file of group.files) {
          fileToGroup.set(file, group.id);
        }
      }
      
      // Update each data row
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        // Parse CSV row (simple parsing - assumes no commas in quoted values)
        const parts = lines[i].split('","');
        if (parts.length < 2) continue;
        
        // Extract file path (first column, remove quotes)
        const filePath = parts[0].replace(/^"/, '');
        const groupId = fileToGroup.get(filePath) || '';
        
        // Insert diff_group column before notes (last column)
        const lastPart = parts[parts.length - 1];
        parts[parts.length - 1] = `"${groupId}","${lastPart.replace(/"$/, '')}`;
        
        lines[i] = parts.join('","');
      }
      
      // Write updated tracker
      const updatedContent = lines.join('\n');
      await fs.writeFile(this.trackerPath, updatedContent);
      
      console.log('✅ Tracker updated with diff_group column');
    } catch (error) {
      console.error('❌ Failed to update tracker:', error.message);
    }
  }

  async generateDiffIndex() {
    console.log('📋 Generating diff index...');
    
    let indexContent = `# Diff Analysis Index

Generated: ${new Date().toISOString()}
Total Groups: ${this.duplicateGroups.length}

## Quick Navigation:

`;
    
    for (const group of this.duplicateGroups) {
      const fileCount = group.files.length;
      const firstFile = path.basename(group.files[0]) || 'unknown';
      
      indexContent += `- [${group.id}](${group.id}/summary.md) - ${fileCount} files - ${firstFile}\n`;
    }
    
    indexContent += `\n## Analysis Workflow:

1. **Review each group's summary.md**
2. **Examine relevant diff files**
3. **Update summary.md with analysis**
4. **Update tracker.csv with decisions**
5. **Execute consolidation manually**
6. **Mark as complete in tracker**

## Priority Groups:

### High Priority (Core Components):
`;
    
    // Identify high priority groups
    const highPriorityPatterns = ['base-agent', 'constitutional', 'eeps'];
    for (const group of this.duplicateGroups) {
      const hasHighPriority = group.files.some(file => 
        highPriorityPatterns.some(pattern => file.includes(pattern))
      );
      
      if (hasHighPriority) {
        const desc = path.basename(group.files[0]);
        indexContent += `- [${group.id}](${group.id}/summary.md) - ${desc}\n`;
      }
    }
    
    await fs.writeFile(path.join(this.diffsDir, 'index.md'), indexContent);
    console.log('✅ Diff index generated');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const collector = new DiffCollector();
  try {
    await collector.collect();
    await collector.generateDiffIndex();
  } catch (error) {
    console.error('💥 Diff collection failed:', error.message);
    process.exit(1);
  }
}