// Git worktree management for parallel development
import { logger, tracer, monitor } from '@lev/debug';
import path from 'path';
import fs from 'fs-extra';

class KinglyWorktreeManager {
  constructor() {
    this.config = null;
    this.worktrees = new Map();
  }

  async configure(config) {
    this.config = config;
    
    // Ensure worktree base path exists
    if (config.worktreeBasePath) {
      await fs.ensureDir(config.worktreeBasePath);
      logger.info('Worktree manager configured', { 
        basePath: config.worktreeBasePath 
      });
    }
  }

  // Create new git worktree for parallel development
  async createWorktree(name, branch = null, options = {}) {
    const trace = tracer.start('worktree-create', { name, branch });
    
    try {
      // Validate name
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        throw new Error('Worktree name must be alphanumeric with dashes/underscores only');
      }

      const worktreePath = path.join(this.config.worktreeBasePath, name);
      
      // Check if worktree already exists
      if (this.worktrees.has(name) || await fs.pathExists(worktreePath)) {
        throw new Error(`Worktree already exists: ${name}`);
      }

      logger.info('Creating worktree', { name, branch, path: worktreePath });
      trace.addEvent('worktree-creation-started', { name, path: worktreePath });

      // Import process manager for git operations
      const { processManager } = await import('./process-manager.js');
      
      // Determine branch strategy
      let gitArgs;
      if (branch) {
        // Create worktree from existing branch
        gitArgs = ['worktree', 'add', worktreePath, branch];
      } else {
        // Create worktree with new branch
        const newBranch = `worktree/${name}`;
        gitArgs = ['worktree', 'add', '-b', newBranch, worktreePath];
      }

      // Execute git worktree add
      const result = await processManager.execute('git', gitArgs, {
        cwd: options.sourcePath || process.cwd(),
        timeout: options.timeout || 30000
      });

      if (!result.success) {
        throw new Error(`Git worktree creation failed: ${result.stderr}`);
      }

      // Create worktree record
      const worktree = {
        name,
        path: worktreePath,
        branch: branch || `worktree/${name}`,
        createdAt: Date.now(),
        active: true,
        context: options.context || null,
        sessions: []
      };

      this.worktrees.set(name, worktree);
      
      trace.addEvent('worktree-created', { 
        name, 
        path: worktreePath,
        branch: worktree.branch 
      });

      monitor.trackCommand('git-worktree-add', { 
        success: true, 
        duration: trace.duration() 
      });

      logger.info('Worktree created successfully', { 
        name, 
        path: worktreePath,
        branch: worktree.branch 
      });

      trace.end({ success: true, worktree });
      return worktree;

    } catch (error) {
      trace.addEvent('worktree-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      
      logger.error('Worktree creation failed', { name, error: error.message });
      throw error;
    }
  }

  // Remove git worktree
  async removeWorktree(name, options = {}) {
    const trace = tracer.start('worktree-remove', { name });
    
    try {
      const worktree = this.worktrees.get(name);
      if (!worktree) {
        throw new Error(`Worktree not found: ${name}`);
      }

      logger.info('Removing worktree', { name, path: worktree.path });
      trace.addEvent('worktree-removal-started', { name });

      // Import process manager for git operations
      const { processManager } = await import('./process-manager.js');
      
      // Force cleanup if requested
      const gitArgs = ['worktree', 'remove'];
      if (options.force) {
        gitArgs.push('--force');
      }
      gitArgs.push(worktree.path);

      // Execute git worktree remove
      const result = await processManager.execute('git', gitArgs, {
        timeout: options.timeout || 30000
      });

      if (!result.success && !options.force) {
        // Try force removal if initial attempt failed
        logger.warn('Normal worktree removal failed, trying force removal', { 
          name, 
          error: result.stderr 
        });
        
        const forceResult = await processManager.execute('git', 
          ['worktree', 'remove', '--force', worktree.path], 
          { timeout: options.timeout || 30000 }
        );
        
        if (!forceResult.success) {
          throw new Error(`Git worktree removal failed: ${forceResult.stderr}`);
        }
      }

      // Clean up directory if it still exists
      if (await fs.pathExists(worktree.path)) {
        await fs.remove(worktree.path);
      }

      // Remove from tracking
      this.worktrees.delete(name);
      
      trace.addEvent('worktree-removed', { name });
      monitor.trackCommand('git-worktree-remove', { 
        success: true, 
        duration: trace.duration() 
      });

      logger.info('Worktree removed successfully', { name });
      trace.end({ success: true });

    } catch (error) {
      trace.addEvent('worktree-removal-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      
      logger.error('Worktree removal failed', { name, error: error.message });
      throw error;
    }
  }

  // List all worktrees
  async listWorktrees() {
    const trace = tracer.start('worktree-list');
    
    try {
      // Import process manager for git operations
      const { processManager } = await import('./process-manager.js');
      
      // Get git worktree list
      const result = await processManager.execute('git', ['worktree', 'list', '--porcelain'], {
        timeout: 10000
      });

      if (!result.success) {
        throw new Error(`Git worktree list failed: ${result.stderr}`);
      }

      // Parse git output
      const gitWorktrees = this._parseWorktreeList(result.stdout);
      
      // Merge with our tracking data
      const tracked = Array.from(this.worktrees.values());
      const merged = tracked.map(wt => {
        const gitData = gitWorktrees.find(gw => gw.path === wt.path);
        return {
          ...wt,
          gitStatus: gitData ? 'active' : 'missing',
          gitBranch: gitData?.branch || wt.branch
        };
      });

      trace.addEvent('worktrees-listed', { count: merged.length });
      trace.end({ success: true, worktrees: merged });
      
      return {
        worktrees: merged,
        summary: {
          total: merged.length,
          active: merged.filter(wt => wt.gitStatus === 'active').length,
          missing: merged.filter(wt => wt.gitStatus === 'missing').length
        }
      };

    } catch (error) {
      trace.addEvent('list-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      throw error;
    }
  }

  // Get specific worktree info
  getWorktree(name) {
    return this.worktrees.get(name);
  }

  // Cleanup orphaned worktrees
  async cleanup() {
    const trace = tracer.start('worktree-cleanup');
    let cleaned = 0;
    
    try {
      const { worktrees } = await this.listWorktrees();
      
      for (const worktree of worktrees) {
        if (worktree.gitStatus === 'missing') {
          logger.info('Cleaning up missing worktree', { name: worktree.name });
          this.worktrees.delete(worktree.name);
          cleaned++;
        }
      }
      
      trace.addEvent('cleanup-completed', { cleaned });
      trace.end({ success: true, cleaned });
      
      if (cleaned > 0) {
        logger.info('Worktree cleanup completed', { cleaned });
      }
      
      return { cleaned };

    } catch (error) {
      trace.addEvent('cleanup-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      throw error;
    }
  }

  // Parse git worktree list output
  _parseWorktreeList(output) {
    const worktrees = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    let current = {};
    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        if (current.path) {
          worktrees.push(current);
        }
        current = { path: line.slice(9) };
      } else if (line.startsWith('branch ')) {
        current.branch = line.slice(7);
      } else if (line.startsWith('HEAD ')) {
        current.head = line.slice(4);
      }
    }
    
    if (current.path) {
      worktrees.push(current);
    }
    
    return worktrees;
  }
}

// Singleton instance
export const worktreeManager = new KinglyWorktreeManager();