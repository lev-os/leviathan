import { app, ipcMain } from 'electron';
import { serviceManager } from './ServiceManager.js';
import { devMode } from './DevModeManager.js';
import type { ModuleContext } from '../ModuleContext.js';
import type { AppModule } from '../AppModule.js';

export class ServiceManagerInit implements AppModule {
  async enable(context: ModuleContext): Promise<void> {
    // Set up IPC handlers
    ipcMain.handle('services:status', async () => {
      return {
        services: serviceManager.getStatus()
      };
    });

    ipcMain.handle('services:start', async (_, serviceName: string) => {
      if (serviceName === 'all') {
        await serviceManager.startAll();
      } else {
        await serviceManager.startService(serviceName);
      }
      return { success: true };
    });

    ipcMain.handle('services:stop', async (_, serviceName: string) => {
      if (serviceName === 'all') {
        await serviceManager.stopAll();
      } else {
        await serviceManager.stopService(serviceName);
      }
      return { success: true };
    });

    ipcMain.handle('services:restart', async (_, serviceName: string) => {
      await serviceManager.stopService(serviceName);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await serviceManager.startService(serviceName);
      return { success: true };
    });

    // Forward service events to renderer
    serviceManager.on('service:log', (data) => {
      context.mainWindow?.webContents.send('service:log', data);
    });

    serviceManager.on('service:error', (data) => {
      context.mainWindow?.webContents.send('service:error', data);
    });

    serviceManager.on('service:starting', (data) => {
      context.mainWindow?.webContents.send('service:starting', data);
    });

    serviceManager.on('service:running', (data) => {
      context.mainWindow?.webContents.send('service:running', data);
    });

    serviceManager.on('service:stopped', (data) => {
      context.mainWindow?.webContents.send('service:stopped', data);
    });

    // Start essential services when app is ready
    app.on('ready', async () => {
      console.log('Starting essential services...');
      
      if (devMode.isDevelopment()) {
        console.log('🔧 Development mode detected - services use hot-reload');
        console.log('💡 Run ./dev-start.sh for the full dev experience with tmux');
      }
      
      // Start data pipeline first as other services depend on it
      try {
        await serviceManager.startService('data-pipeline');
      } catch (error) {
        console.error('Failed to start data pipeline:', error);
      }

      // Start crypto hedge fund for AI analysis
      try {
        await serviceManager.startService('crypto-hedge-fund');
      } catch (error) {
        console.error('Failed to start crypto hedge fund:', error);
      }

      // Don't auto-start telegram bot or trading engine - let user control these
    });

    // Clean shutdown
    app.on('before-quit', async (event) => {
      event.preventDefault();
      
      console.log('Shutting down all services...');
      await serviceManager.stopAll();
      
      app.exit(0);
    });
  }
}

export const serviceManagerInit = new ServiceManagerInit();