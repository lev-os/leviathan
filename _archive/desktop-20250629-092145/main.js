const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Keep references to prevent garbage collection
let mainWindow = null;
let tray = null;
const services = new Map();

// Service configurations
const SERVICE_CONFIG = {
  neo4j: {
    name: 'Neo4j Database',
    command: 'neo4j',
    args: ['console'],
    cwd: process.env.NEO4J_HOME || '/usr/local/neo4j',
    env: { ...process.env }
  },
  graphiti: {
    name: 'Graphiti Memory',
    command: 'python',
    args: [path.join(__dirname, '../memory/graphiti-service/src/memory_service.py')],
    cwd: path.join(__dirname, '../memory/graphiti-service'),
    env: { ...process.env, PYTHONPATH: path.join(__dirname, '../memory/.venv/lib/python3.11/site-packages') }
  },
  agent: {
    name: 'Leviathan Agent',
    command: 'node',
    args: [path.join(__dirname, '../../agent/src/index.js')],
    cwd: path.join(__dirname, '../../agent'),
    env: { ...process.env }
  }
};// Service management class
class ServiceManager {
  constructor() {
    this.services = new Map();
  }

  start(serviceId) {
    if (this.services.has(serviceId)) {
      const service = this.services.get(serviceId);
      if (service.process && !service.process.killed) {
        return { success: false, error: 'Service already running' };
      }
    }

    const config = SERVICE_CONFIG[serviceId];
    if (!config) {
      return { success: false, error: 'Unknown service' };
    }

    try {
      const process = spawn(config.command, config.args, {
        cwd: config.cwd,
        env: config.env,
        detached: false
      });

      process.on('error', (err) => {
        console.error(`Service ${serviceId} error:`, err);
        this.updateStatus(serviceId, 'failed');
      });

      process.on('exit', (code) => {
        console.log(`Service ${serviceId} exited with code ${code}`);
        this.updateStatus(serviceId, 'stopped');
      });      this.services.set(serviceId, {
        process,
        pid: process.pid,
        startTime: Date.now(),
        status: 'running'
      });

      return { success: true, pid: process.pid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  stop(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || !service.process) {
      return { success: false, error: 'Service not running' };
    }

    try {
      service.process.kill('SIGTERM');
      setTimeout(() => {
        if (!service.process.killed) {
          service.process.kill('SIGKILL');
        }
      }, 5000);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }  restart(serviceId) {
    this.stop(serviceId);
    setTimeout(() => this.start(serviceId), 1000);
    return { success: true };
  }

  getStatus() {
    const status = {};
    for (const [id, config] of Object.entries(SERVICE_CONFIG)) {
      const service = this.services.get(id);
      status[id] = {
        name: config.name,
        status: service ? service.status : 'stopped',
        pid: service ? service.pid : null,
        uptime: service ? Date.now() - service.startTime : 0
      };
    }
    return status;
  }

  updateStatus(serviceId, status) {
    const service = this.services.get(serviceId);
    if (service) {
      service.status = status;
    }
  }
}

const serviceManager = new ServiceManager();// Electron app lifecycle
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Status', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Start All', click: () => startAllServices() },
    { label: 'Stop All', click: () => stopAllServices() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      app.isQuiting = true;
      app.quit();
    }}
  ]);  tray.setToolTip('Leviathan Desktop');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Service control functions
function startAllServices() {
  for (const serviceId of Object.keys(SERVICE_CONFIG)) {
    serviceManager.start(serviceId);
  }
}

function stopAllServices() {
  for (const serviceId of Object.keys(SERVICE_CONFIG)) {
    serviceManager.stop(serviceId);
  }
}

// IPC handlers
ipcMain.handle('get-status', () => {
  return serviceManager.getStatus();
});

ipcMain.handle('start-service', (event, serviceId) => {
  return serviceManager.start(serviceId);
});

ipcMain.handle('stop-service', (event, serviceId) => {
  return serviceManager.stop(serviceId);
});ipcMain.handle('restart-service', (event, serviceId) => {
  return serviceManager.restart(serviceId);
});

// App events
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Hide dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', (event) => {
  // Keep app running in system tray
  event.preventDefault();
});

app.on('before-quit', () => {
  // Stop all services before quitting
  stopAllServices();
});

// Set auto-launch
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true
});