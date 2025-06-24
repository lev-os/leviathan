#!/usr/bin/env node

// Create a git worktree for hexagonal architecture refactor
import { worktreeManager } from '../packages/commands/src/worktree-manager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createRefactorWorktree() {
  try {
    // Configure worktree manager
    await worktreeManager.configure({
      worktreeBasePath: path.join(__dirname, '..', '.worktrees')
    });

    console.log('🏗️  Creating hexagonal refactor worktree...');
    
    const worktree = await worktreeManager.createWorktree('hexagonal-refactor', null, {
      context: 'Hexagonal architecture refactor - Core SDK extraction and adapter pattern implementation',
      sourcePath: path.join(__dirname, '..')
    });

    console.log('✅ Worktree created successfully!');
    console.log(`📁 Path: ${worktree.path}`);
    console.log(`🌿 Branch: ${worktree.branch}`);
    console.log('');
    console.log('🚀 To work in the refactor worktree:');
    console.log(`cd ${worktree.path}`);
    console.log('code .');
    console.log('');
    console.log('🔄 To return to main directory:');
    console.log(`cd ${process.cwd()}`);

  } catch (error) {
    console.error('❌ Failed to create worktree:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createRefactorWorktree();
}