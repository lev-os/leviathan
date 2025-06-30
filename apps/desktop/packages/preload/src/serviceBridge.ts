import { ipcRenderer } from 'electron';

interface ServiceInfo {
  id: string;
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'error';
  healthCheck?: string;
  lastError?: string;
}

export const serviceBridge = {
  // Get list of all services
  listServices: (): Promise<ServiceInfo[]> => 
    ipcRenderer.invoke('services:list'),
  
  // Start a service
  startService: (serviceId: string): Promise<boolean> => 
    ipcRenderer.invoke('services:start', serviceId),
  
  // Stop a service
  stopService: (serviceId: string): Promise<boolean> => 
    ipcRenderer.invoke('services:stop', serviceId),
  
  // Restart a service
  restartService: (serviceId: string): Promise<boolean> => 
    ipcRenderer.invoke('services:restart', serviceId),
  
  // Get status of a specific service
  getServiceStatus: (serviceId: string): Promise<ServiceInfo | null> => 
    ipcRenderer.invoke('services:status', serviceId),
  
  // Listen for service status changes
  onServiceStatusChange: (callback: (serviceId: string, status: ServiceInfo) => void) => {
    const listener = (_: any, serviceId: string, status: ServiceInfo) => callback(serviceId, status);
    ipcRenderer.on('service:status-changed', listener);
    
    // Return cleanup function
    return () => ipcRenderer.removeListener('service:status-changed', listener);
  }
};

export type ServiceBridge = typeof serviceBridge;