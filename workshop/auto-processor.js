#!/usr/bin/env node

/**
 * Autonomous Workshop Intake Processor
 * Runs the _auto.md prompt as a background worker with streaming output
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class AutoProcessor extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.baseDir = process.cwd();
    this.autoPromptPath = path.join(this.baseDir, '_auto.md');
    this.outputDir = path.join(this.baseDir, 'tmp', 'auto-runs');
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    this.emit('status', { type: 'init', message: 'Auto-processor initialized' });
  }

  async readAutoPrompt() {
    try {
      const content = await fs.readFile(this.autoPromptPath, 'utf8');
      // Extract the system prompt from _auto.md (starts at "You are a workshop intake processor")
      const promptStart = content.indexOf('You are a workshop intake processor');
      if (promptStart === -1) {
        throw new Error('Could not find system prompt in _auto.md');
      }
      return content.substring(promptStart);
    } catch (error) {
      this.emit('error', { type: 'prompt_read', error: error.message });
      throw error;
    }
  }

  async startWorker(workerId = 'auto-1') {
    if (this.processes.has(workerId)) {
      this.emit('status', { 
        type: 'warning', 
        message: `Worker ${workerId} already running`,
        workerId 
      });
      return;
    }

    try {
      const prompt = await this.readAutoPrompt();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFile = path.join(this.outputDir, `${workerId}-${timestamp}.log`);

      this.emit('status', { 
        type: 'start', 
        message: `Starting worker ${workerId}`,
        workerId,
        outputFile 
      });

      // Run claude with the auto prompt
      const claudeProcess = spawn('claude', [prompt], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: 'cli' },
        shell: true
      });

      // Set up streaming capture using writeFileSync for simplicity
      claudeProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        require('fs').appendFileSync(outputFile, chunk);
        this.emit('output', { 
          workerId, 
          type: 'stdout', 
          data: chunk,
          timestamp: new Date().toISOString()
        });
      });

      claudeProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        require('fs').appendFileSync(outputFile, `[STDERR] ${chunk}`);
        this.emit('output', { 
          workerId, 
          type: 'stderr', 
          data: chunk,
          timestamp: new Date().toISOString()
        });
      });

      claudeProcess.on('close', (code) => {
        this.processes.delete(workerId);
        this.emit('status', { 
          type: 'complete', 
          message: `Worker ${workerId} finished with code ${code}`,
          workerId,
          exitCode: code
        });
      });

      claudeProcess.on('error', (error) => {
        this.processes.delete(workerId);
        this.emit('error', { 
          type: 'process_error',
          message: error.message,
          workerId,
          error 
        });
      });

      this.processes.set(workerId, {
        process: claudeProcess,
        outputFile,
        startTime: new Date(),
        pid: claudeProcess.pid
      });

    } catch (error) {
      this.emit('error', { 
        type: 'start_error',
        message: error.message,
        workerId,
        error 
      });
    }
  }

  stopWorker(workerId) {
    const worker = this.processes.get(workerId);
    if (!worker) {
      this.emit('status', { 
        type: 'warning', 
        message: `Worker ${workerId} not found`,
        workerId 
      });
      return;
    }

    worker.process.kill('SIGTERM');
    this.emit('status', { 
      type: 'stop', 
      message: `Worker ${workerId} stopped`,
      workerId 
    });
  }

  getStatus() {
    const workers = Array.from(this.processes.entries()).map(([id, worker]) => ({
      id,
      pid: worker.pid,
      startTime: worker.startTime,
      outputFile: worker.outputFile,
      uptime: Date.now() - worker.startTime.getTime()
    }));

    return {
      activeWorkers: workers.length,
      workers,
      outputDir: this.outputDir
    };
  }

  async getIntakeStatus() {
    try {
      const trackerPath = path.join(this.baseDir, 'tracker.txt');
      let processed = [];
      
      try {
        const trackerContent = await fs.readFile(trackerPath, 'utf8');
        processed = trackerContent.split('\n').filter(line => line.trim());
      } catch (error) {
        // tracker.txt doesn't exist yet
      }

      // Get total repositories (simplified count)
      const intakePath = path.join(process.env.HOME, 'lev', 'workshop', 'intake');
      const items = await fs.readdir(intakePath, { withFileTypes: true });
      const repoCount = items.filter(item => item.isDirectory()).length;

      return {
        processed: processed.length,
        total: repoCount,
        percentage: repoCount > 0 ? Math.round((processed.length / repoCount) * 100) : 0,
        lastProcessed: processed[processed.length - 1] || 'none'
      };
    } catch (error) {
      return {
        processed: 0,
        total: 0,
        percentage: 0,
        error: error.message
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const processor = new AutoProcessor();
  
  const command = process.argv[2];
  const workerId = process.argv[3] || 'auto-1';

  processor.on('status', (data) => {
    console.log(`[STATUS] ${data.message}`);
  });

  processor.on('error', (data) => {
    console.error(`[ERROR] ${data.message}`);
  });

  processor.on('output', (data) => {
    // Only show recent output to avoid spam
    if (data.type === 'stdout') {
      process.stdout.write(data.data);
    }
  });

  processor.init().then(() => {
    switch (command) {
      case 'start':
        processor.startWorker(workerId);
        break;
      case 'stop':
        processor.stopWorker(workerId);
        process.exit(0);
        break;
      case 'status':
        const status = processor.getStatus();
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
        break;
      case 'intake':
        processor.getIntakeStatus().then(status => {
          console.log(JSON.stringify(status, null, 2));
          process.exit(0);
        });
        break;
      default:
        console.log('Usage: node auto-processor.js [start|stop|status|intake] [workerId]');
        process.exit(1);
    }
  });
}

module.exports = AutoProcessor;