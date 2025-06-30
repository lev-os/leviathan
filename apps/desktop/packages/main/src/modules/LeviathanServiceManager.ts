import { app, ipcMain, dialog } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import type { AppModule } from '../AppModule.js';
import type { ModuleContext } from '../ModuleContext.js';

interface Service {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
  healthCheck?: string;
  process?: ChildProcess;
  status: 'stopped' | 'starting' | 'running' | 'error';
  lastError?: string;
}

export class LeviathanServiceManager implements AppModule {
  private services: Map<string, Service> = new Map();
  
  constructor() {
    // Define Leviathan services
    this.services.set('neo4j', {
      name: 'Neo4j Database',
      command: 'neo4j',
      args: ['console'],
      cwd: process.env.NEO4J_HOME || '/usr/local/neo4j',
      healthCheck: 'http://localhost:7474',
      status: 'stopped'
    });
    
    this.services.set('graphiti', {
      name: 'Graphiti Memory',
      command: 'python',
      args: ['src/memory_service.py'],
      cwd: path.join(app.getAppPath(), '../../../memory/graphiti-service'),
      healthCheck: 'http://localhost:50051',
      status: 'stopped'
    });
    
    this.services.set('agent', {
      name: 'Leviathan Agent',
      command: 'node',
      args: ['src/index.js'],
      cwd: path.join(app.getAppPath(), '../../../agent'),
      healthCheck: 'http://localhost:3001',
      status: 'stopped'
    });
  }
  
  async enable(context: ModuleContext): Promise<void> {
    // Set up IPC handlers
    ipcMain.handle('services:list', () => {
      return Array.from(this.services.entries()).map(([id, service]) => ({
        id,
        name: service.name,
        status: service.status,
        healthCheck: service.healthCheck,
        lastError: service.lastError
      }));
    });
    
    ipcMain.handle('services:start', async (_, serviceId: string) => {
      return this.startService(serviceId);
    });
    
    ipcMain.handle('services:stop', async (_, serviceId: string) => {
      return this.stopService(serviceId);
    });
    
    ipcMain.handle('services:restart', async (_, serviceId: string) => {
      await this.stopService(serviceId);
      return this.startService(serviceId);
    });
    
    ipcMain.handle('services:status', async (_, serviceId: string) => {
      const service = this.services.get(serviceId);
      if (!service) return null;
      
      return {
        id: serviceId,
        name: service.name,
        status: service.status,
        healthCheck: service.healthCheck,
        lastError: service.lastError
      };
    });
    
    // Clean up on app quit
    app.on('before-quit', () => {
      this.stopAllServices();
    });
  }
  
  private async startService(serviceId: string): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service) {
      console.error(`Service ${serviceId} not found`);
      return false;
    }
    
    if (service.status === 'running') {
      console.log(`Service ${serviceId} is already running`);
      return true;
    }
    
    try {
      service.status = 'starting';
      
      // Check if cwd exists
      if (service.cwd && !fs.existsSync(service.cwd)) {
        throw new Error(`Working directory does not exist: ${service.cwd}`);
      }
      
      // Spawn the process
      service.process = spawn(service.command, service.args, {
        cwd: service.cwd,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      service.process.stdout?.on('data', (data) => {
        console.log(`[${serviceId}] ${data.toString()}`);
      });
      
      service.process.stderr?.on('data', (data) => {
        console.error(`[${serviceId}] ${data.toString()}`);
      });
      
      service.process.on('error', (error) => {
        console.error(`[${serviceId}] Process error:`, error);
        service.status = 'error';
        service.lastError = error.message;
      });
      
      service.process.on('exit', (code, signal) => {
        console.log(`[${serviceId}] Process exited with code ${code} and signal ${signal}`);
        service.status = 'stopped';
        service.process = undefined;
      });
      
      // Give the service time to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if process is still running
      if (service.process && !service.process.killed) {
        service.status = 'running';
        service.lastError = undefined;
        return true;
      } else {
        service.status = 'error';
        return false;
      }
    } catch (error) {
      console.error(`Failed to start service ${serviceId}:`, error);
      service.status = 'error';
      service.lastError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }
  
  private async stopService(serviceId: string): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service || !service.process) {
      console.log(`Service ${serviceId} is not running`);
      return true;
    }
    
    try {
      service.process.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise<void>((resolve) => {
        let timeout: NodeJS.Timeout;
        
        const checkExit = () => {
          if (!service.process || service.process.killed) {
            clearTimeout(timeout);
            resolve();
          }
        };
        
        // Check every 100ms
        const interval = setInterval(checkExit, 100);
        
        // Force kill after 5 seconds
        timeout = setTimeout(() => {
          clearInterval(interval);
          if (service.process && !service.process.killed) {
            service.process.kill('SIGKILL');
          }
          resolve();
        }, 5000);
      });
      
      service.status = 'stopped';
      service.process = undefined;
      return true;
    } catch (error) {
      console.error(`Failed to stop service ${serviceId}:`, error);
      return false;
    }
  }
  
  private stopAllServices(): void {
    for (const [serviceId, service] of this.services) {
      if (service.process) {
        console.log(`Stopping service ${serviceId}...`);
        this.stopService(serviceId);
      }
    }
  }
}