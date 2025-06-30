import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

interface Service {
  name: string;
  type: 'node' | 'python' | 'executable';
  path: string;
  args?: string[];
  env?: Record<string, string>;
  autoRestart?: boolean;
  port?: number;
}

interface ServiceStatus {
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'error';
  pid?: number;
  port?: number;
  error?: string;
  uptime?: number;
}

export class ServiceManager extends EventEmitter {
  private services: Map<string, Service> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private startTimes: Map<string, Date> = new Map();
  private restartAttempts: Map<string, number> = new Map();

  constructor() {
    super();
    this.registerServices();
  }

  private registerServices() {
    // Telegram Bot Service
    this.addService({
      name: 'telegram-bot',
      type: 'node',
      path: 'packages/tg/src/index.js',
      env: {
        NODE_ENV: 'production',
        DB_PATH: app.getPath('userData') + '/tg.db'
      },
      autoRestart: true
    });

    // Crypto Hedge Fund Service (Python)
    if (app.isPackaged) {
      // Production: Use PyInstaller executable
      this.addService({
        name: 'crypto-hedge-fund',
        type: 'executable',
        path: 'crypto-hedge-fund-server',
        args: ['--port', '8765'],
        port: 8765,
        autoRestart: true
      });
    } else {
      // Development: Use Python
      this.addService({
        name: 'crypto-hedge-fund',
        type: 'python',
        path: 'packages/crypto-hedge-fund',
        args: ['-m', 'uvicorn', 'app.backend.main:app', '--port', '8765'],
        port: 8765,
        env: {
          PYTHONPATH: path.join(process.cwd(), 'packages/crypto-hedge-fund')
        },
        autoRestart: true
      });
    }

    // Trading Engine Service
    this.addService({
      name: 'trading-engine',
      type: 'node',
      path: 'packages/trading-engine/dist/index.js',
      args: ['--mode', 'production'],
      port: 8766,
      env: {
        SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      },
      autoRestart: true
    });

    // Data Pipeline Service
    this.addService({
      name: 'data-pipeline',
      type: 'node',
      path: 'packages/data-pipeline/dist/index.js',
      port: 8767,
      autoRestart: true
    });
  }

  addService(service: Service) {
    this.services.set(service.name, service);
  }

  async startService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (this.processes.has(name)) {
      console.log(`Service ${name} already running`);
      return;
    }

    console.log(`Starting service: ${name}`);
    this.emit('service:starting', { name });

    try {
      const process = await this.spawnService(service);
      
      this.processes.set(name, process);
      this.startTimes.set(name, new Date());
      
      // Handle process output
      process.stdout?.on('data', (data) => {
        console.log(`[${name}] ${data.toString()}`);
        this.emit('service:log', { name, data: data.toString() });
      });

      process.stderr?.on('data', (data) => {
        console.error(`[${name} ERROR] ${data.toString()}`);
        this.emit('service:error', { name, error: data.toString() });
      });

      // Handle process exit
      process.on('exit', (code) => {
        console.log(`Service ${name} exited with code ${code}`);
        this.processes.delete(name);
        this.emit('service:stopped', { name, code });

        // Auto-restart if enabled
        if (service.autoRestart && code !== 0) {
          const attempts = this.restartAttempts.get(name) || 0;
          if (attempts < 3) {
            console.log(`Attempting to restart ${name} (attempt ${attempts + 1})`);
            this.restartAttempts.set(name, attempts + 1);
            setTimeout(() => this.startService(name), 5000);
          } else {
            this.emit('service:failed', { name, error: 'Max restart attempts reached' });
          }
        }
      });

      // Wait for service to be ready
      if (service.port) {
        await this.waitForPort(service.port, 30000);
      }

      this.restartAttempts.set(name, 0);
      this.emit('service:running', { name });
      
    } catch (error) {
      this.emit('service:error', { name, error: error.message });
      throw error;
    }
  }

  private async spawnService(service: Service): Promise<ChildProcess> {
    let command: string;
    let args: string[] = [];
    
    const basePath = app.isPackaged 
      ? process.resourcesPath 
      : process.cwd();

    switch (service.type) {
      case 'node':
        command = process.execPath;
        args = [path.join(basePath, service.path), ...(service.args || [])];
        break;
        
      case 'python':
        command = 'python3';
        args = service.args || [];
        break;
        
      case 'executable':
        command = path.join(basePath, service.path);
        args = service.args || [];
        break;
    }

    const env = {
      ...process.env,
      ...service.env,
      // Pass through API keys from main process
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY,
    };

    return spawn(command, args, {
      cwd: service.type === 'python' ? path.join(basePath, service.path) : basePath,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }

  async stopService(name: string): Promise<void> {
    const process = this.processes.get(name);
    if (!process) {
      console.log(`Service ${name} not running`);
      return;
    }

    console.log(`Stopping service: ${name}`);
    
    return new Promise((resolve) => {
      process.once('exit', () => {
        this.processes.delete(name);
        resolve();
      });

      // Try graceful shutdown
      process.kill('SIGTERM');

      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.processes.has(name)) {
          process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  async startAll(): Promise<void> {
    console.log('Starting all services...');
    
    // Start services in order of dependencies
    const startOrder = [
      'data-pipeline',      // Data first
      'crypto-hedge-fund',  // Analysis second
      'trading-engine',     // Trading third
      'telegram-bot'        // UI last
    ];

    for (const serviceName of startOrder) {
      if (this.services.has(serviceName)) {
        try {
          await this.startService(serviceName);
          // Give each service time to initialize
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to start ${serviceName}:`, error);
        }
      }
    }
  }

  async stopAll(): Promise<void> {
    console.log('Stopping all services...');
    
    const stopPromises = Array.from(this.processes.keys()).map(name => 
      this.stopService(name)
    );
    
    await Promise.all(stopPromises);
  }

  getStatus(): ServiceStatus[] {
    return Array.from(this.services.keys()).map(name => {
      const service = this.services.get(name)!;
      const process = this.processes.get(name);
      const startTime = this.startTimes.get(name);
      
      return {
        name,
        status: process ? 'running' : 'stopped',
        pid: process?.pid,
        port: service.port,
        uptime: startTime ? Date.now() - startTime.getTime() : undefined
      };
    });
  }

  private async waitForPort(port: number, timeout: number): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) {
          return;
        }
      } catch {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Service failed to start on port ${port}`);
  }
}

// Export singleton
export const serviceManager = new ServiceManager();