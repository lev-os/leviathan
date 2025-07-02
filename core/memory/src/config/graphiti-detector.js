/**
 * Graphiti Service Detection System
 * Auto-detects running Graphiti gRPC services and deployment options
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import os from 'os';

const execAsync = promisify(exec);

export class GraphitiDetector {
  constructor(config = {}) {
    this.detectionResults = null;
    this.config = {
      grpcAddress: config.grpcAddress || process.env.GRAPHITI_GRPC_ADDRESS || 'localhost',
      grpcPort: config.grpcPort || process.env.GRAPHITI_GRPC_PORT || 50051,
      timeout: config.timeout || process.env.GRAPHITI_TIMEOUT || 10000,
      ...config
    };
  }

  /**
   * Main detection method - runs all detection strategies
   */
  async detect() {
    const results = {
      grpc_service: await this.detectGRPCService(),
      python_process: await this.detectPythonProcess(),
      docker_container: await this.detectDockerContainer(),
      local_installation: await this.detectLocalInstallation(),
      recommended: null
    };

    // Determine recommended setup
    results.recommended = this.selectRecommended(results);
    
    this.detectionResults = results;
    return results;
  }

  /**
   * Detect running Graphiti gRPC service
   */
  async detectGRPCService() {
    const result = {
      running: false,
      address: `${this.config.grpcAddress}:${this.config.grpcPort}`,
      port: parseInt(this.config.grpcPort),
      health: null,
      version: null,
      pid: null
    };

    try {
      // Check if gRPC port is accessible
      result.running = await this.checkPort(this.config.grpcPort, this.config.grpcAddress);
      
      if (result.running) {
        // Try to get service health/info
        result.health = await this.checkGRPCHealth();
        
        // Try to identify the process using the port
        result.pid = await this.getProcessByPort(this.config.grpcPort);
      }

      return result;
    } catch (error) {
      console.warn('Error detecting Graphiti gRPC service:', error.message);
      return result;
    }
  }

  /**
   * Detect Graphiti Python processes
   */
  async detectPythonProcess() {
    const result = {
      processes: [],
      graphiti_processes: [],
      memory_service_processes: []
    };

    try {
      const platform = os.platform();
      let command;
      
      if (platform === 'win32') {
        command = 'tasklist /FI "IMAGENAME eq python.exe" /FO CSV';
      } else {
        command = 'ps aux | grep -E "(graphiti|memory.*service)" | grep -v grep';
      }

      const { stdout } = await execAsync(command);
      
      // Parse process information
      const lines = stdout.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.toLowerCase().includes('graphiti')) {
          result.graphiti_processes.push(this.parseProcessLine(line));
        } else if (line.toLowerCase().includes('memory') && line.toLowerCase().includes('service')) {
          result.memory_service_processes.push(this.parseProcessLine(line));
        }
        
        if (line.toLowerCase().includes('python')) {
          result.processes.push(this.parseProcessLine(line));
        }
      }

      return result;
    } catch (error) {
      console.warn('Error detecting Graphiti Python processes:', error.message);
      return result;
    }
  }

  /**
   * Detect Graphiti Docker containers
   */
  async detectDockerContainer() {
    const result = {
      available: false,
      containers: [],
      images: [],
      running: false
    };

    try {
      // Check if Docker is available
      await execAsync('docker --version');
      result.available = true;

      // Check for Graphiti-related containers
      const { stdout: containerStdout } = await execAsync(
        'docker ps -a --filter "name=graphiti" --format "{{.Names}}\\t{{.Status}}\\t{{.Ports}}"'
      );
      
      if (containerStdout.trim()) {
        result.containers = containerStdout.trim().split('\n').map(line => {
          const [name, status, ports] = line.split('\t');
          return { 
            name, 
            status, 
            ports, 
            running: status.includes('Up') 
          };
        });
        result.running = result.containers.some(c => c.running);
      }

      // Check for Graphiti-related images
      const { stdout: imageStdout } = await execAsync(
        'docker images --filter "reference=*graphiti*" --format "{{.Repository}}:{{.Tag}}\\t{{.Size}}"'
      );
      
      if (imageStdout.trim()) {
        result.images = imageStdout.trim().split('\n').map(line => {
          const [image, size] = line.split('\t');
          return { image, size };
        });
      }

      return result;
    } catch (error) {
      // Docker not available or no Graphiti containers
      return result;
    }
  }

  /**
   * Detect local Graphiti installation
   */
  async detectLocalInstallation() {
    const result = {
      pip_installed: false,
      conda_installed: false,
      version: null,
      installation_path: null
    };

    try {
      // Check pip installation
      try {
        const { stdout: pipStdout } = await execAsync('pip show graphiti-core');
        if (pipStdout) {
          result.pip_installed = true;
          const versionMatch = pipStdout.match(/Version: (.+)/);
          if (versionMatch) {
            result.version = versionMatch[1].trim();
          }
        }
      } catch (e) {
        // Not installed via pip
      }

      // Check conda installation
      try {
        const { stdout: condaStdout } = await execAsync('conda list graphiti');
        if (condaStdout && condaStdout.includes('graphiti')) {
          result.conda_installed = true;
        }
      } catch (e) {
        // Not installed via conda
      }

      // Try to find installation path
      if (result.pip_installed || result.conda_installed) {
        try {
          const { stdout: pathStdout } = await execAsync('python -c "import graphiti; print(graphiti.__file__)"');
          result.installation_path = pathStdout.trim();
        } catch (e) {
          // Could not determine path
        }
      }

      return result;
    } catch (error) {
      console.warn('Error detecting local Graphiti installation:', error.message);
      return result;
    }
  }

  /**
   * Check if a port is accessible
   */
  async checkPort(port, host = 'localhost', timeout = 3000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let connected = false;

      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        connected = true;
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  /**
   * Check gRPC service health (basic connectivity test)
   */
  async checkGRPCHealth() {
    try {
      // This is a basic connectivity test
      // In a real implementation, you might use a gRPC client to call a health check method
      return {
        status: 'responsive',
        timestamp: new Date().toISOString(),
        method: 'port_check'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get process ID using specific port
   */
  async getProcessByPort(port) {
    try {
      const platform = os.platform();
      let command;
      
      if (platform === 'win32') {
        command = `netstat -ano | findstr :${port}`;
      } else {
        command = `lsof -t -i :${port}`;
      }

      const { stdout } = await execAsync(command);
      
      if (platform === 'win32') {
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1]; // PID is last column
          }
        }
      } else {
        const pid = stdout.trim().split('\n')[0];
        return pid || null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse process line from ps/tasklist output
   */
  parseProcessLine(line) {
    const trimmed = line.trim();
    
    // Basic parsing - this could be enhanced based on specific needs
    return {
      raw: trimmed,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Select the recommended setup based on detection results
   */
  selectRecommended(results) {
    // Priority order: Running gRPC service > Docker container > Python process > Local installation
    
    if (results.grpc_service.running && results.grpc_service.health?.status === 'responsive') {
      return {
        type: 'existing_service',
        reason: 'Graphiti gRPC service is already running and responsive',
        config: {
          grpcAddress: this.config.grpcAddress,
          grpcPort: this.config.grpcPort,
          skipServiceStart: true,
          useExisting: true
        }
      };
    }

    if (results.docker_container.running) {
      return {
        type: 'docker_container',
        reason: 'Graphiti Docker container is running',
        config: {
          deploymentMode: 'docker',
          grpcAddress: this.config.grpcAddress,
          grpcPort: this.config.grpcPort,
          useDockerContainer: true
        }
      };
    }

    if (results.python_process.graphiti_processes.length > 0) {
      return {
        type: 'python_process',
        reason: 'Graphiti Python process detected',
        config: {
          deploymentMode: 'native',
          grpcAddress: this.config.grpcAddress,
          grpcPort: this.config.grpcPort,
          usePythonProcess: true
        }
      };
    }

    if (results.local_installation.pip_installed || results.local_installation.conda_installed) {
      return {
        type: 'local_installation',
        reason: 'Local Graphiti installation available',
        config: {
          deploymentMode: 'native',
          grpcAddress: this.config.grpcAddress,
          grpcPort: this.config.grpcPort,
          canStartService: true,
          version: results.local_installation.version
        }
      };
    }

    if (results.docker_container.available) {
      return {
        type: 'docker_available',
        reason: 'Docker available - can run Graphiti container',
        config: {
          deploymentMode: 'docker',
          grpcAddress: this.config.grpcAddress,
          grpcPort: this.config.grpcPort,
          requiresDockerImage: true
        }
      };
    }

    return {
      type: 'not_available',
      reason: 'No Graphiti installation or service detected',
      config: {
        deploymentMode: 'manual',
        requiresInstallation: true
      }
    };
  }

  /**
   * Get human-readable detection summary
   */
  getSummary() {
    if (!this.detectionResults) {
      return 'Detection not run yet';
    }

    const { grpc_service, python_process, docker_container, local_installation, recommended } = this.detectionResults;
    
    let summary = '🧠 Graphiti Detection Results:\n\n';
    
    summary += `🌐 gRPC Service: ${grpc_service.running ? '✅ Running' : '❌ Not running'}`;
    if (grpc_service.running) {
      summary += ` (${grpc_service.address})`;
    }
    summary += '\n';
    
    summary += `🐍 Python Process: ${python_process.graphiti_processes.length > 0 ? '✅ Found' : '❌ Not found'}`;
    if (python_process.graphiti_processes.length > 0) {
      summary += ` (${python_process.graphiti_processes.length} processes)`;
    }
    summary += '\n';
    
    summary += `🐳 Docker: ${docker_container.available ? '✅ Available' : '❌ Not available'}`;
    if (docker_container.containers.length > 0) {
      summary += ` (${docker_container.containers.length} containers found)`;
    }
    summary += '\n';
    
    summary += `📦 Local Install: ${local_installation.pip_installed || local_installation.conda_installed ? '✅ Installed' : '❌ Not installed'}`;
    if (local_installation.version) {
      summary += ` (v${local_installation.version})`;
    }
    summary += '\n';
    
    summary += `\n💡 Recommended: ${recommended.type.toUpperCase()}\n`;
    summary += `   ${recommended.reason}\n`;
    
    return summary;
  }
}