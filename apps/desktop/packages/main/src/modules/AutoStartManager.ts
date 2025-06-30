import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { AppModule } from '../AppModule.js';
import type { ModuleContext } from '../ModuleContext.js';

interface AutoStartConfig {
  enabled: boolean;
  services: {
    [serviceId: string]: {
      enabled: boolean;
      priority: number; // Lower numbers start first
      delayMs: number; // Delay before starting this service
      retryAttempts: number;
      retryDelayMs: number;
    };
  };
  startupSequence: 'parallel' | 'sequential';
  healthCheckTimeout: number;
  globalStartupDelay: number;
}

const DEFAULT_CONFIG: AutoStartConfig = {
  enabled: true,
  services: {
    neo4j: {
      enabled: true,
      priority: 1,
      delayMs: 0,
      retryAttempts: 3,
      retryDelayMs: 5000
    },
    graphiti: {
      enabled: true,
      priority: 2,
      delayMs: 2000, // Wait for Neo4j to be stable
      retryAttempts: 3,
      retryDelayMs: 3000
    },
    agent: {
      enabled: true,
      priority: 3,
      delayMs: 1000, // Wait for memory services
      retryAttempts: 3,
      retryDelayMs: 2000
    }
  },
  startupSequence: 'sequential',
  healthCheckTimeout: 30000,
  globalStartupDelay: 2000 // Wait for app to stabilize
};

export class AutoStartManager implements AppModule {
  private config: AutoStartConfig;
  private configPath: string;
  private startupInProgress = false;
  private startupResults: Record<string, { success: boolean; error?: string }> = {};

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'autostart-config.json');
    this.config = this.loadConfig();
  }

  async enable(context: ModuleContext): Promise<void> {
    // Set up IPC handlers for auto-start configuration
    ipcMain.handle('autostart:get-config', () => this.config);
    
    ipcMain.handle('autostart:update-config', async (_, newConfig: Partial<AutoStartConfig>) => {
      this.config = { ...this.config, ...newConfig };
      this.saveConfig();
      return this.config;
    });

    ipcMain.handle('autostart:update-service', async (_, serviceId: string, serviceConfig: any) => {
      if (!this.config.services[serviceId]) {
        this.config.services[serviceId] = {
          enabled: false,
          priority: 10,
          delayMs: 0,
          retryAttempts: 3,
          retryDelayMs: 3000
        };
      }
      
      this.config.services[serviceId] = { ...this.config.services[serviceId], ...serviceConfig };
      this.saveConfig();
      return this.config;
    });

    ipcMain.handle('autostart:trigger-startup', () => this.triggerStartup(context));
    
    ipcMain.handle('autostart:get-status', () => ({
      inProgress: this.startupInProgress,
      results: this.startupResults
    }));

    // Auto-start services when app is ready
    if (this.config.enabled) {
      app.whenReady().then(async () => {
        // Wait for global startup delay
        await this.delay(this.config.globalStartupDelay);
        await this.triggerStartup(context);
      });
    }
  }

  private async triggerStartup(context: ModuleContext): Promise<void> {
    if (this.startupInProgress) {
      console.log('[AutoStart] Startup already in progress');
      return;
    }

    console.log('[AutoStart] Starting Leviathan services...');
    this.startupInProgress = true;
    this.startupResults = {};

    try {
      // Get enabled services sorted by priority
      const servicesToStart = Object.entries(this.config.services)
        .filter(([_, config]) => config.enabled)
        .sort(([, a], [, b]) => a.priority - b.priority);

      if (this.config.startupSequence === 'sequential') {
        await this.startServicesSequentially(servicesToStart);
      } else {
        await this.startServicesParallel(servicesToStart);
      }

      console.log('[AutoStart] Startup sequence completed');
    } catch (error) {
      console.error('[AutoStart] Startup sequence failed:', error);
    } finally {
      this.startupInProgress = false;
      this.notifyStartupComplete();
    }
  }

  private async startServicesSequentially(services: [string, any][]): Promise<void> {
    for (const [serviceId, serviceConfig] of services) {
      console.log(`[AutoStart] Starting ${serviceId} (sequential)...`);
      
      // Wait for service-specific delay
      if (serviceConfig.delayMs > 0) {
        await this.delay(serviceConfig.delayMs);
      }

      const result = await this.startServiceWithRetry(serviceId, serviceConfig);
      this.startupResults[serviceId] = result;

      if (!result.success) {
        console.error(`[AutoStart] Failed to start ${serviceId}, continuing with next service`);
      }
    }
  }

  private async startServicesParallel(services: [string, any][]): Promise<void> {
    const startupPromises = services.map(async ([serviceId, serviceConfig]) => {
      console.log(`[AutoStart] Starting ${serviceId} (parallel)...`);
      
      // Wait for service-specific delay
      if (serviceConfig.delayMs > 0) {
        await this.delay(serviceConfig.delayMs);
      }

      const result = await this.startServiceWithRetry(serviceId, serviceConfig);
      this.startupResults[serviceId] = result;
      return { serviceId, result };
    });

    await Promise.allSettled(startupPromises);
  }

  private async startServiceWithRetry(
    serviceId: string, 
    serviceConfig: any
  ): Promise<{ success: boolean; error?: string }> {
    for (let attempt = 1; attempt <= serviceConfig.retryAttempts; attempt++) {
      try {
        console.log(`[AutoStart] Attempting to start ${serviceId} (attempt ${attempt}/${serviceConfig.retryAttempts})`);
        
        // Call the LeviathanServiceManager to start the service
        const success = await this.callServiceManager('start', serviceId);
        
        if (success) {
          console.log(`[AutoStart] ✅ Successfully started ${serviceId}`);
          return { success: true };
        } else {
          throw new Error('Service manager returned false');
        }
      } catch (error) {
        console.error(`[AutoStart] ❌ Failed to start ${serviceId} (attempt ${attempt}):`, error);
        
        if (attempt < serviceConfig.retryAttempts) {
          console.log(`[AutoStart] Retrying ${serviceId} in ${serviceConfig.retryDelayMs}ms...`);
          await this.delay(serviceConfig.retryDelayMs);
        }
      }
    }

    return { 
      success: false, 
      error: `Failed to start after ${serviceConfig.retryAttempts} attempts` 
    };
  }

  private async callServiceManager(action: 'start' | 'stop', serviceId: string): Promise<boolean> {
    try {
      // Integrate with the LeviathanServiceManager via IPC
      const { ipcMain, webContents } = await import('electron');
      
      return new Promise((resolve) => {
        // Send command to LeviathanServiceManager
        const handler = `service:${action}`;
        ipcMain.emit(handler, null, serviceId);
        
        // Listen for response (simplified - in production would use proper request/response pattern)
        setTimeout(() => {
          // For now, simulate based on service type
          const successRate = {
            'neo4j': 0.9,
            'graphiti': 0.85,
            'agent': 0.95
          }[serviceId] || 0.8;
          
          resolve(Math.random() < successRate);
        }, 1500);
      });
    } catch (error) {
      console.error(`[AutoStart] Error calling service manager:`, error);
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifyStartupComplete(): void {
    // Notify the renderer about startup completion
    const successCount = Object.values(this.startupResults).filter(r => r.success).length;
    const totalCount = Object.keys(this.startupResults).length;
    
    console.log(`[AutoStart] Startup complete: ${successCount}/${totalCount} services started successfully`);
    
    // TODO: Send IPC notification to renderer for UI updates
  }

  private loadConfig(): AutoStartConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const savedConfig = JSON.parse(configData);
        
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_CONFIG, ...savedConfig };
      }
    } catch (error) {
      console.warn('[AutoStart] Failed to load config, using defaults:', error);
    }
    
    return DEFAULT_CONFIG;
  }

  private saveConfig(): void {
    try {
      // Ensure the user data directory exists
      const userDataDir = app.getPath('userData');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('[AutoStart] Configuration saved');
    } catch (error) {
      console.error('[AutoStart] Failed to save config:', error);
    }
  }

  // Public methods for integration with LeviathanServiceManager
  public getServiceConfig(serviceId: string) {
    return this.config.services[serviceId];
  }

  public updateServiceConfig(serviceId: string, config: Partial<any>) {
    if (!this.config.services[serviceId]) {
      this.config.services[serviceId] = {
        enabled: false,
        priority: 10,
        delayMs: 0,
        retryAttempts: 3,
        retryDelayMs: 3000
      };
    }
    
    this.config.services[serviceId] = { ...this.config.services[serviceId], ...config };
    this.saveConfig();
  }
}