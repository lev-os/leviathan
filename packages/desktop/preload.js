const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('api', {
  getStatus: () => ipcRenderer.invoke('get-status'),
  startService: (serviceId) => ipcRenderer.invoke('start-service', serviceId),
  stopService: (serviceId) => ipcRenderer.invoke('stop-service', serviceId),
  restartService: (serviceId) => ipcRenderer.invoke('restart-service', serviceId)
});