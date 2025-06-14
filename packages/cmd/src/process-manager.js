// Ultra-lightweight process management with execa
import { execa } from 'execa';
import psTree from 'ps-tree';
import kill from 'tree-kill';
import { logger, tracer, monitor } from '@kingly/debug';

class KinglyProcessManager {
  constructor() {
    this.processes = new Map();
    this.config = null;
  }

  async configure(config) {
    this.config = config;
    logger.info('Process manager configured', { 
      timeout: config.processTimeout,
      maxProcesses: config.maxConcurrentProcesses 
    });
  }

  // Execute command with tracking and cleanup
  async execute(command, args = [], options = {}) {
    const trace = tracer.start('process-execution', { command, args });
    
    try {
      // Check process limits
      if (this.processes.size >= this.config.maxConcurrentProcesses) {
        throw new Error(`Maximum concurrent processes reached: ${this.config.maxConcurrentProcesses}`);
      }

      // Prepare execution options
      const execOptions = {
        timeout: options.timeout || this.config.processTimeout,
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        stdio: options.stdio || 'pipe',
        ...options.execaOptions
      };

      logger.info('Executing command', { command, args, options: execOptions });
      trace.addEvent('command-started', { command, args, pid: 'pending' });

      // Execute with execa
      const subprocess = execa(command, args, execOptions);
      const processId = `${command}-${Date.now()}`;
      
      // Track process
      this.processes.set(processId, {
        id: processId,
        command,
        args,
        subprocess,
        startTime: Date.now(),
        trace
      });

      trace.addEvent('process-spawned', { pid: subprocess.pid, processId });

      // Wait for completion
      const result = await subprocess;
      
      // Clean up tracking
      this.processes.delete(processId);
      
      trace.addEvent('command-completed', { 
        exitCode: result.exitCode,
        duration: Date.now() - this.processes.get(processId)?.startTime 
      });
      
      monitor.trackCommand(command, { 
        success: true, 
        duration: trace.duration() 
      });
      
      logger.info('Command completed successfully', { 
        command, 
        exitCode: result.exitCode,
        duration: trace.duration()
      });

      trace.end({ success: true, exitCode: result.exitCode });
      
      return {
        success: true,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: trace.duration()
      };

    } catch (error) {
      trace.addEvent('command-error', { error: error.message });
      monitor.trackCommand(command, { success: false, error: error.message });
      
      logger.error('Command execution failed', { 
        command, 
        error: error.message,
        exitCode: error.exitCode 
      });

      trace.end({ success: false, error: error.message });
      
      throw error;
    }
  }

  // Kill process by ID
  async killProcess(processId) {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process not found: ${processId}`);
    }

    const trace = tracer.start('process-kill', { processId });
    
    try {
      logger.info('Killing process', { processId, pid: process.subprocess.pid });
      
      // Use tree-kill for cleanup
      await new Promise((resolve, reject) => {
        kill(process.subprocess.pid, 'SIGTERM', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      
      this.processes.delete(processId);
      trace.addEvent('process-killed', { processId });
      trace.end({ success: true });
      
      logger.info('Process killed successfully', { processId });
      
    } catch (error) {
      trace.addEvent('kill-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      throw error;
    }
  }

  // Get all tracked processes
  getProcesses() {
    return Array.from(this.processes.values()).map(p => ({
      id: p.id,
      command: p.command,
      args: p.args,
      pid: p.subprocess.pid,
      startTime: p.startTime,
      duration: Date.now() - p.startTime
    }));
  }

  // Cleanup all processes
  async cleanup() {
    const processIds = Array.from(this.processes.keys());
    logger.info('Cleaning up processes', { count: processIds.length });
    
    await Promise.allSettled(
      processIds.map(id => this.killProcess(id))
    );
  }
}

// Singleton instance
export const processManager = new KinglyProcessManager();