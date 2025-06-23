#!/usr/bin/env node

/**
 * Batch Move Command - Prototype Agentic DX Tool
 * Intelligent file operations with pattern matching and context awareness
 */

import { glob } from 'glob';
import { move, ensureDir } from 'fs-extra';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

class BatchMoveCommand {
  constructor() {
    this.operations = [];
    this.dryRun = false;
  }

  async batchMoveByPattern(options) {
    const { pattern, to, reason, confirm = true, semantic = false } = options;
    
    console.log(`🔄 Batch Move: ${pattern} → ${to}`);
    console.log(`📝 Reason: ${reason}`);
    
    // Find matching files
    let files;
    if (semantic) {
      files = await this.semanticFileSearch(pattern);
    } else {
      files = await glob(pattern, { cwd: process.cwd() });
    }
    
    console.log(`📁 Found ${files.length} files matching pattern`);
    
    if (files.length === 0) {
      console.log('❌ No files found matching pattern');
      return;
    }
    
    // Preview operations
    console.log('\n📋 Planned operations:');
    for (const file of files) {
      const destPath = join(to, file.split('/').pop());
      console.log(`  ${file} → ${destPath}`);
      this.operations.push({ from: file, to: destPath, reason });
    }
    
    // Confirm if requested
    if (confirm && !this.dryRun) {
      console.log('\n❓ Proceed with batch move? (y/N)');
      // In real implementation, would wait for user input
      console.log('✅ Proceeding (auto-confirmed for demo)');
    }
    
    // Execute moves
    if (!this.dryRun) {
      await this.executeMoves();
    } else {
      console.log('🔍 Dry run complete - no files moved');
    }
    
    return this.operations;
  }
  
  async semanticFileSearch(query) {
    // Semantic search simulation - in real implementation would use LLM
    console.log(`🧠 Semantic search for: "${query}"`);
    
    // For demo, search file contents for matching concepts
    const allFiles = await glob('**/*.md', { cwd: process.cwd() });
    const semanticMatches = [];
    
    for (const file of allFiles) {
      try {
        const content = await readFile(file, 'utf-8');
        
        // Simple keyword matching (real implementation would use LLM)
        const keywords = this.extractSemanticKeywords(query);
        const hasMatch = keywords.some(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
          semanticMatches.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return semanticMatches;
  }
  
  extractSemanticKeywords(query) {
    // Simple semantic keyword extraction (real implementation would use LLM)
    const semanticMap = {
      'traditional algorithms': ['regex', 'if.*else', 'pattern.*match', 'for.*loop', 'while.*loop'],
      'memory systems': ['memory', 'storage', 'retrieval', 'cache', 'persistence'],
      'context inheritance': ['inherit', 'context', 'parent', 'cascade', 'hierarchy']
    };
    
    return semanticMap[query.toLowerCase()] || [query];
  }
  
  async executeMoves() {
    console.log('\n🚀 Executing batch move operations...');
    
    for (const op of this.operations) {
      try {
        // Ensure destination directory exists
        await ensureDir(dirname(op.to));
        
        // Move the file
        await move(op.from, op.to);
        console.log(`✅ Moved: ${op.from} → ${op.to}`);
        
      } catch (error) {
        console.error(`❌ Failed to move ${op.from}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Batch move complete! ${this.operations.length} files processed`);
  }
  
  // Rollback capability
  async rollback() {
    console.log('🔄 Rolling back batch move operations...');
    
    for (const op of this.operations.reverse()) {
      try {
        await move(op.to, op.from);
        console.log(`↩️ Restored: ${op.to} → ${op.from}`);
      } catch (error) {
        console.error(`❌ Failed to rollback ${op.to}: ${error.message}`);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = new BatchMoveCommand();
  
  if (args[0] === '--dry-run') {
    command.dryRun = true;
    args.shift();
  }
  
  const [pattern, to, reason] = args;
  
  if (!pattern || !to) {
    console.log(`
🤖 Batch Move Command - Agentic DX Tool

Usage:
  node batch-move.js [--dry-run] <pattern> <destination> [reason]

Examples:
  # Move all vision docs to drafts
  node batch-move.js "docs/vision/*" "drafts/" "future_research"
  
  # Semantic search and move
  node batch-move.js --semantic "traditional algorithms" "drafts/legacy/" "llm_first_refactor"
  
  # Dry run first
  node batch-move.js --dry-run "docs/specs/*complex*" "docs/backlog/" "complexity_threshold"
`);
    return;
  }
  
  await command.batchMoveByPattern({
    pattern,
    to,
    reason: reason || 'batch_operation',
    confirm: false, // Auto-confirm for demo
    semantic: args.includes('--semantic')
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BatchMoveCommand };