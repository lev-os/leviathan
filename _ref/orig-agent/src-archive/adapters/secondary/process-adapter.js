/**
 * Process Adapter - Lightweight process management
 * For dev servers, builds, and local processes (not Docker)
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export class ProcessAdapter {
  constructor(config = {}) {
    this.config = {
      logsPath: config.logsPath || './.kingly/processes/logs',
      registryPath: config.registryPath || './.kingly/processes/registry.json',
      ...config
    };
    
    this.processes = new Map();
    this.loadRegistry();
  }
  
  async loadRegistry() {
    try {
      const data = await fs.readJson(this.config.registryPath);
      // Reconstruct Map from saved data
      data.processes?.forEach(([id, meta]) => {
        this.processes.set(id, meta);
      });
      
      // Check if old processes are still running
      await this.validateProcesses();
    } catch (error) {
      // Fresh start
      this.processes = new Map();
    }
  }
  
  async saveRegistry() {
    await fs.ensureDir(path.dirname(this.config.registryPath));
    await fs.writeJson(this.config.registryPath, {
      processes: Array.from(this.processes.entries()),
      updated: new Date().toISOString()
    });
  }
  
  async validateProcesses() {
    // Check if PIDs are still running
    for (const [id, meta] of this.processes) {
      if (meta.status === 'running' && meta.pid) {
        try {
          // Check if process exists
          process.kill(meta.pid, 0);
        } catch (error) {
          // Process no longer exists
          meta.status = 'orphaned';
          meta.endTime = new Date().toISOString();
        }
      }
    }
  }
  
  async startProcess(command, options = {}) {
    const processId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logFile = path.join(this.config.logsPath, `${processId}.log`);
    
    await fs.ensureDir(this.config.logsPath);
    
    const meta = {
      id: processId,
      command: command,
      cwd: options.cwd || process.cwd(),
      type: options.type || 'generic',
      taskId: options.taskId,
      status: 'starting',
      startTime: new Date().toISOString(),
      logFile: logFile
    };
    
    this.processes.set(processId, meta);
    
    // Create log stream
    const logStream = await fs.createWriteStream(logFile);
    
    // Spawn the process
    const child = spawn(command, {
      cwd: meta.cwd,
      shell: true,
      env: {
        ...process.env,
        KINGLY_PROCESS_ID: processId,
        KINGLY_TASK_ID: options.taskId || ''
      }
    });
    
    meta.pid = child.pid;
    meta.status = 'running';
    
    // Pipe output to log file
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);
    
    // Handle process exit
    child.on('exit', (code) => {
      meta.status = code === 0 ? 'completed' : 'failed';
      meta.exitCode = code;
      meta.endTime = new Date().toISOString();
      logStream.end();
      this.saveRegistry();
    });
    
    // Handle errors
    child.on('error', (error) => {
      meta.status = 'error';
      meta.error = error.message;
      meta.endTime = new Date().toISOString();
      logStream.end();
      this.saveRegistry();
    });
    
    await this.saveRegistry();
    
    return {
      processId,
      pid: child.pid,
      status: 'running',
      message: `Started: ${command}`,
      logs: logFile
    };
  }
  
  async killProcess(processId, signal = 'SIGTERM') {
    const meta = this.processes.get(processId);
    
    if (!meta) {
      return {
        error: 'Process not found',
        processId
      };
    }
    
    if (meta.status !== 'running') {
      return {
        error: `Process not running (status: ${meta.status})`,
        processId
      };
    }
    
    try {
      process.kill(meta.pid, signal);
      meta.status = 'killed';
      meta.endTime = new Date().toISOString();
      await this.saveRegistry();
      
      return {
        message: `Process ${processId} killed`,
        pid: meta.pid
      };
    } catch (error) {
      return {
        error: `Failed to kill process: ${error.message}`,
        processId
      };
    }
  }
  
  async getProcessStatus(processId, options = {}) {
    const meta = this.processes.get(processId);
    
    if (!meta) {
      return { error: 'Process not found' };
    }
    
    // Always provide log info, but only read content if requested
    let logs = null;
    if (meta.logFile && await fs.pathExists(meta.logFile)) {
      const stats = await fs.stat(meta.logFile);
      
      logs = {
        file: meta.logFile,
        size: stats.size,
        sizeHuman: this.formatBytes(stats.size),
        modified: stats.mtime
      };
      
      // Only read log content if tail option is specified
      if (options.tail) {
        const fullLogs = await fs.readFile(meta.logFile, 'utf8');
        const lines = fullLogs.split('\n');
        const tailCount = typeof options.tail === 'number' ? options.tail : 50;
        
        logs.snippet = lines.slice(-tailCount).join('\n');
        logs.totalLines = lines.length;
        logs.showing = `last ${Math.min(tailCount, lines.length)} lines`;
      }
    }
    
    return {
      ...meta,
      logs,
      duration: meta.endTime ? 
        new Date(meta.endTime) - new Date(meta.startTime) : 
        Date.now() - new Date(meta.startTime).getTime(),
      monitoring: {
        logFile: meta.logFile,
        readCommand: `cat ${meta.logFile}`,
        tailCommand: `tail -f ${meta.logFile}`,
        lastNCommand: (n) => `tail -n ${n} ${meta.logFile}`
      }
    };
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  async listProcesses(filter = {}) {
    await this.validateProcesses();
    
    let processes = Array.from(this.processes.values());
    
    if (filter.status) {
      processes = processes.filter(p => p.status === filter.status);
    }
    
    if (filter.type) {
      processes = processes.filter(p => p.type === filter.type);
    }
    
    if (filter.taskId) {
      processes = processes.filter(p => p.taskId === filter.taskId);
    }
    
    return processes;
  }
  
  // Common process types
  async startDevServer(projectPath, taskId) {
    return await this.startProcess('pnpm run dev', {
      cwd: projectPath,
      type: 'dev-server',
      taskId
    });
  }
  
  async startBuild(projectPath, taskId) {
    return await this.startProcess('pnpm run build', {
      cwd: projectPath,
      type: 'build',
      taskId
    });
  }
  
  async startTest(projectPath, taskId, testCommand = 'pnpm test') {
    return await this.startProcess(testCommand, {
      cwd: projectPath,
      type: 'test',
      taskId
    });
  }
}

export default ProcessAdapter;