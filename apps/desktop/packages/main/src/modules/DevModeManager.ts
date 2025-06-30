import { app } from 'electron';
import path from 'path';
import { spawn, ChildProcess, exec } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

interface ServiceConfig {
  name: string;
  type: 'python' | 'node' | 'executable';
  path: string;
  args?: string[];
  env?: Record<string, string>;
  port?: number;
  watch?: boolean;
  cwd?: string;
}

interface ServiceStatus {
  name: string;
  pid: number;
  running: boolean;
  uptime: number;
  port?: number;
}

export class DevModeManager extends EventEmitter {
  private isDev: boolean;
  private processes: Map<string, ChildProcess> = new Map();
  private startTimes: Map<string, number> = new Map();

  constructor() {
    super();
    this.isDev = !app.isPackaged;
  }

  isDevelopment(): boolean {
    return this.isDev;
  }

  /**
   * In dev mode, use local Python/Node directly
   * In production, use embedded runtime
   */
  async getPythonCommand(): Promise<{ command: string; args: string[] }> {
    if (this.isDev) {
      // Dev mode: Find best Python (venv > system)
      const pythonPath = await this.findSystemPython();
      return {
        command: pythonPath,
        args: []
      };
    } else {
      // Production: Use system Python (PythonRuntime removed for Leviathan)
      return {
        command: 'python3',
        args: []
      };
    }
  }

  private async findSystemPython(): Promise<string> {
    // Prefer venv if active
    if (process.env.VIRTUAL_ENV) {
      const venvPython = path.join(process.env.VIRTUAL_ENV, 'bin', 'python');
      try {
        await fs.access(venvPython);
        return venvPython;
      } catch {}
    }
    
    // Check common locations
    const candidates = [
      'python3',
      'python',
      '/usr/local/bin/python3',
      '/opt/homebrew/bin/python3'
    ];
    
    for (const cmd of candidates) {
      try {
        const { stdout } = await execAsync(`which ${cmd}`);
        const pythonPath = stdout.trim();
        // Verify it's Python 3.8+
        const { stdout: version } = await execAsync(`${pythonPath} --version`);
        if (version.includes('Python 3.')) {
          return pythonPath;
        }
      } catch {}
    }
    throw new Error('Python 3.8+ not found. Please install Python.');
  }

  /**
   * Start a service with hot-reload in dev mode
   */
  async startDevService(config: ServiceConfig): Promise<void> {
    if (!this.isDev && config.watch !== false) {
      throw new Error('Hot-reload is only available in development');
    }

    console.log(`[DEV] Starting ${config.name}...`);
    this.startTimes.set(config.name, Date.now());

    let command: string;
    let args: string[] = [];

    if (config.type === 'python') {
      // Python hot-reload
      const pythonPath = await this.findSystemPython();
      
      if (config.watch !== false) {
        // Use nodemon for Python hot-reload
        command = 'npx';
        args = [
          'nodemon',
          '--exec', pythonPath,
          '--watch', path.dirname(config.path),
          '--ext', 'py',
          '--legacy-watch',
          config.path,
          ...(config.args || [])
        ];
      } else {
        // Direct Python execution
        command = pythonPath;
        args = [config.path, ...(config.args || [])];
      }
    } else if (config.type === 'node') {
      // Node hot-reload
      if (config.watch !== false) {
        command = 'npx';
        args = ['tsx', 'watch', config.path, ...(config.args || [])];
      } else {
        command = 'node';
        args = [config.path, ...(config.args || [])];
      }
    } else {
      // Direct executable
      command = config.path;
      args = config.args || [];
    }

    const proc = spawn(command, args, {
      cwd: config.cwd || path.dirname(config.path),
      env: {
        ...process.env,
        ...config.env,
        NODE_ENV: 'development',
        PYTHONUNBUFFERED: '1',
        FORCE_COLOR: '1'
      },
      stdio: 'pipe'
    });

    // Color-coded output based on service type
    const color = config.type === 'python' ? '\x1b[36m' : '\x1b[32m'; // Cyan for Python, Green for Node
    
    proc.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach((line: string) => {
        if (line) console.log(`${color}[${config.name}]\x1b[0m ${line}`);
      });
    });
    
    proc.stderr?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach((line: string) => {
        if (line) console.error(`\x1b[31m[${config.name}]\x1b[0m ${line}`);
      });
    });

    this.processes.set(config.name, proc);

    proc.on('exit', (code) => {
      console.log(`[DEV] ${config.name} exited with code ${code}`);
      this.processes.delete(config.name);
      this.startTimes.delete(config.name);
      this.emit('service-exit', { name: config.name, code });
    });

    // Emit ready event when service starts successfully
    setTimeout(() => {
      if (!proc.killed) {
        this.emit('service-ready', { name: config.name, port: config.port });
      }
    }, 1000);
  }

  /**
   * Get status of all running services
   */
  getServiceStatus(): ServiceStatus[] {
    const statuses: ServiceStatus[] = [];
    
    for (const [name, proc] of this.processes) {
      const startTime = this.startTimes.get(name) || Date.now();
      statuses.push({
        name,
        pid: proc.pid || 0,
        running: !proc.killed && proc.exitCode === null,
        uptime: Date.now() - startTime,
        port: undefined // Can be extended to track ports
      });
    }
    
    return statuses;
  }

  /**
   * Restart a specific service
   */
  async restartService(name: string, config: ServiceConfig): Promise<void> {
    const proc = this.processes.get(name);
    if (proc) {
      console.log(`[DEV] Restarting ${name}...`);
      proc.kill();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cleanup
    }
    await this.startDevService(config);
  }

  /**
   * Stop all dev services gracefully
   */
  async stopAll(): Promise<void> {
    const stopPromises: Promise<void>[] = [];
    
    for (const [name, proc] of this.processes) {
      stopPromises.push(
        new Promise<void>((resolve) => {
          console.log(`[DEV] Stopping ${name}...`);
          
          const timeout = setTimeout(() => {
            proc.kill('SIGKILL');
            resolve();
          }, 5000);
          
          proc.once('exit', () => {
            clearTimeout(timeout);
            console.log(`[DEV] ${name} stopped`);
            resolve();
          });
          
          proc.kill('SIGTERM');
        })
      );
    }
    
    await Promise.all(stopPromises);
    this.processes.clear();
    this.startTimes.clear();
  }
}

export const devMode = new DevModeManager();