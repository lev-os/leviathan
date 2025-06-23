/**
 * Context Capture Adapter
 * Implements systematic context capture and restoration
 */

export class ContextCaptureAdapter {
  constructor(config = {}) {
    this.config = config;
    this.captureStrategies = new Map();
    this.setupDefaultStrategies();
  }

  setupDefaultStrategies() {
    // File system context capture
    this.captureStrategies.set('filesystem', {
      capture: async (context) => {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          const workingDir = process.cwd();
          const files = await fs.readdir(workingDir, { withFileTypes: true });
          
          return {
            working_directory: workingDir,
            files: files.slice(0, 50).map(dirent => ({
              name: dirent.name,
              type: dirent.isDirectory() ? 'directory' : 'file',
              path: path.join(workingDir, dirent.name)
            })),
            captured_at: new Date().toISOString()
          };
        } catch (error) {
          return { error: error.message };
        }
      }
    });

    // Git context capture
    this.captureStrategies.set('git', {
      capture: async (context) => {
        try {
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(exec);
          
          const [status, branch, commit] = await Promise.all([
            execAsync('git status --porcelain').catch(() => ({ stdout: '' })),
            execAsync('git branch --show-current').catch(() => ({ stdout: 'unknown' })),
            execAsync('git rev-parse HEAD').catch(() => ({ stdout: 'unknown' }))
          ]);
          
          return {
            branch: branch.stdout.trim(),
            commit: commit.stdout.trim().substring(0, 8),
            status: status.stdout.trim(),
            has_changes: status.stdout.trim().length > 0,
            captured_at: new Date().toISOString()
          };
        } catch (error) {
          return { error: error.message };
        }
      }
    });

    // Environment context capture
    this.captureStrategies.set('environment', {
      capture: async (context) => {
        return {
          node_version: process.version,
          platform: process.platform,
          architecture: process.arch,
          memory_usage: process.memoryUsage(),
          uptime: process.uptime(),
          captured_at: new Date().toISOString()
        };
      }
    });
  }

  async captureContext(strategies = ['filesystem', 'git', 'environment']) {
    const capturedContext = {
      protocol_version: '1.0',
      captured_at: new Date().toISOString(),
      strategies_used: strategies,
      context: {}
    };

    for (const strategyName of strategies) {
      const strategy = this.captureStrategies.get(strategyName);
      if (strategy) {
        try {
          capturedContext.context[strategyName] = await strategy.capture(capturedContext);
        } catch (error) {
          capturedContext.context[strategyName] = { 
            error: error.message,
            strategy: strategyName 
          };
        }
      }
    }

    return capturedContext;
  }

  async restoreContext(capturedContext) {
    // For now, this returns the context for review
    // In the future, this could actively restore working directory, git state, etc.
    return {
      protocol_version: capturedContext.protocol_version,
      original_capture_time: capturedContext.captured_at,
      restoration_time: new Date().toISOString(),
      restorable_elements: this.analyzeRestorability(capturedContext),
      context: capturedContext.context
    };
  }

  analyzeRestorability(capturedContext) {
    const analysis = {
      working_directory: false,
      git_state: false,
      file_structure: false,
      environment: false
    };

    if (capturedContext.context.filesystem && !capturedContext.context.filesystem.error) {
      analysis.working_directory = true;
      analysis.file_structure = true;
    }

    if (capturedContext.context.git && !capturedContext.context.git.error) {
      analysis.git_state = true;
    }

    if (capturedContext.context.environment && !capturedContext.context.environment.error) {
      analysis.environment = true;
    }

    return analysis;
  }

  // Add custom capture strategy
  addCaptureStrategy(name, strategy) {
    this.captureStrategies.set(name, strategy);
  }
}