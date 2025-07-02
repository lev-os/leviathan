/**
 * Neo4j Detection System
 * Auto-detects available Neo4j instances and deployment options
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export class Neo4jDetector {
  constructor(config = {}) {
    this.detectionResults = null;
    this.config = {
      neo4jHttpPort: config.neo4jHttpPort || process.env.NEO4J_HTTP_PORT || 7474,
      neo4jBoltPort: config.neo4jBoltPort || process.env.NEO4J_BOLT_PORT || 7687,
      neo4jUri: config.neo4jUri || process.env.NEO4J_URI || 'bolt://localhost:7687',
      ...config
    };
  }

  /**
   * Main detection method - runs all detection strategies
   */
  async detect() {
    const results = {
      desktop: await this.detectDesktop(),
      docker: await this.detectDocker(),
      existing: await this.detectExistingInstance(),
      processes: await this.detectProcesses(),
      recommended: null
    };

    // Determine recommended setup
    results.recommended = this.selectRecommended(results);
    
    this.detectionResults = results;
    return results;
  }  /**
   * Detect Neo4j Desktop installation
   */
  async detectDesktop() {
    const result = {
      found: false,
      version: null,
      dataPath: null,
      running: false,
      ports: { 
        http: parseInt(this.config.neo4jHttpPort), 
        bolt: parseInt(this.config.neo4jBoltPort) 
      }
    };

    try {
      // Check for Neo4j Desktop on different platforms
      const platform = os.platform();
      let desktopPaths = [];
      
      if (platform === 'darwin') {
        desktopPaths = [
          '/Applications/Neo4j Desktop.app',
          path.join(os.homedir(), 'Applications/Neo4j Desktop.app')
        ];
      } else if (platform === 'win32') {
        desktopPaths = [
          path.join(os.homedir(), 'AppData/Local/Programs/Neo4j Desktop'),
          'C:\\Program Files\\Neo4j Desktop'
        ];
      } else {
        desktopPaths = [
          path.join(os.homedir(), '.local/share/Neo4j Desktop'),
          '/opt/neo4j-desktop'
        ];
      }

      // Check if Desktop is installed
      for (const desktopPath of desktopPaths) {
        try {
          await fs.access(desktopPath);
          result.found = true;
          result.dataPath = desktopPath;
          break;
        } catch (e) {
          // Path doesn't exist, continue
        }
      }

      // Check if Desktop Neo4j is running on configured ports
      if (result.found) {
        result.running = await this.checkPort(this.config.neo4jHttpPort) && 
                        await this.checkPort(this.config.neo4jBoltPort);
      }

      return result;
    } catch (error) {
      console.warn('Error detecting Neo4j Desktop:', error.message);
      return result;
    }
  }

  /**
   * Detect Docker availability and Neo4j containers
   */
  async detectDocker() {
    const result = {
      available: false,
      containers: [],
      composeFile: null,
      running: false
    };

    try {
      // Check if Docker is available
      await execAsync('docker --version');
      result.available = true;

      // Check for existing Neo4j containers
      const { stdout } = await execAsync('docker ps -a --filter "ancestor=neo4j" --format "{{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
      
      if (stdout.trim()) {
        result.containers = stdout.trim().split('\n').map(line => {
          const [name, status, ports] = line.split('\t');
          return { name, status, ports, running: status.includes('Up') };
        });
        result.running = result.containers.some(c => c.running);
      }

      // Check for docker-compose file
      const composePath = path.join(process.cwd(), 'docker-compose.yml');
      try {
        await fs.access(composePath);
        result.composeFile = composePath;
      } catch (e) {
        // No compose file
      }

      return result;
    } catch (error) {
      // Docker not available
      return result;
    }
  }  /**
   * Detect existing Neo4j instance (running service)
   */
  async detectExistingInstance() {
    const httpPort = parseInt(this.config.neo4jHttpPort);
    const boltPort = parseInt(this.config.neo4jBoltPort);
    
    const result = {
      http: { port: httpPort, accessible: false },
      bolt: { port: boltPort, accessible: false },
      version: null,
      authentication: null
    };

    try {
      // Check configured ports
      result.http.accessible = await this.checkPort(httpPort);
      result.bolt.accessible = await this.checkPort(boltPort);

      // Try to get version info if HTTP is accessible
      if (result.http.accessible) {
        try {
          const response = await fetch(`http://localhost:${httpPort}/db/data/`);
          const data = await response.json();
          result.version = data.neo4j_version;
        } catch (e) {
          // Couldn't get version info
        }
      }

      return result;
    } catch (error) {
      console.warn('Error detecting existing Neo4j instance:', error.message);
      return result;
    }
  }

  /**
   * Detect Neo4j processes
   */
  async detectProcesses() {
    const result = {
      neo4j: [],
      java: [],
      related: []
    };

    try {
      const platform = os.platform();
      let command;
      
      if (platform === 'win32') {
        command = 'tasklist /FI "IMAGENAME eq java.exe" /FO CSV';
      } else {
        command = 'ps aux | grep -i neo4j';
      }

      const { stdout } = await execAsync(command);
      
      // Parse process information
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('neo4j')) {
          result.neo4j.push(line.trim());
        } else if (line.toLowerCase().includes('java') && 
                   (line.includes('neo4j') || line.includes('bolt'))) {
          result.java.push(line.trim());
        }
      }

      return result;
    } catch (error) {
      console.warn('Error detecting Neo4j processes:', error.message);
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
  }  /**
   * Select the recommended setup based on detection results
   */
  selectRecommended(results) {
    // Priority order: Desktop (if running) > Existing Instance > Docker > Fallback
    
    if (results.desktop.found && results.desktop.running) {
      return {
        type: 'desktop',
        reason: 'Neo4j Desktop is installed and running',
        config: {
          neo4jUri: this.config.neo4jUri,
          deploymentMode: 'desktop',
          requiresGraphitiService: true
        }
      };
    }

    if (results.existing.bolt.accessible) {
      return {
        type: 'existing',
        reason: 'Existing Neo4j instance detected on standard ports',
        config: {
          neo4jUri: this.config.neo4jUri,
          deploymentMode: 'external',
          requiresGraphitiService: true
        }
      };
    }

    if (results.docker.available) {
      return {
        type: 'docker',
        reason: 'Docker available - can use containerized setup',
        config: {
          neo4jUri: 'bolt://neo4j:7687',
          deploymentMode: 'docker',
          requiresGraphitiService: true,
          useCompose: true
        }
      };
    }

    return {
      type: 'fallback',
      reason: 'No Neo4j detected - will need manual installation',
      config: {
        deploymentMode: 'manual',
        requiresSetup: true
      }
    };
  }

  /**
   * Generate configuration based on detection results
   */
  generateConfig(deploymentMode = null) {
    if (!this.detectionResults) {
      throw new Error('Must run detect() first');
    }

    const mode = deploymentMode || this.detectionResults.recommended.type;
    const baseConfig = {
      timestamp: new Date().toISOString(),
      detectionResults: this.detectionResults,
      deploymentMode: mode
    };

    switch (mode) {
      case 'desktop':
        return {
          ...baseConfig,
          neo4j: {
            uri: this.config.neo4jUri,
            username: 'neo4j',
            password: null, // User needs to provide
            source: 'desktop'
          },
          graphiti: {
            mode: 'service',
            serviceOnly: true,
            neo4jExternal: true
          }
        };

      case 'existing':
        return {
          ...baseConfig,
          neo4j: {
            uri: this.config.neo4jUri,
            username: 'neo4j',
            password: null, // User needs to provide
            source: 'external'
          },
          graphiti: {
            mode: 'service',
            serviceOnly: true,
            neo4jExternal: true
          }
        };

      case 'docker':
        return {
          ...baseConfig,
          neo4j: {
            uri: 'bolt://neo4j:7687',
            username: 'neo4j',
            password: 'lev-mem123',
            source: 'docker'
          },
          graphiti: {
            mode: 'compose',
            serviceOnly: false,
            neo4jExternal: false
          }
        };

      default:
        return {
          ...baseConfig,
          requiresManualSetup: true,
          instructions: [
            'Install Neo4j Desktop or start a Neo4j instance',
            'Run detection again after setup'
          ]
        };
    }
  }

  /**
   * Get human-readable detection summary
   */
  getSummary() {
    if (!this.detectionResults) {
      return 'Detection not run yet';
    }

    const { desktop, docker, existing, recommended } = this.detectionResults;
    
    let summary = '🔍 Neo4j Detection Results:\n\n';
    
    summary += `📱 Desktop: ${desktop.found ? '✅ Found' : '❌ Not found'}`;
    if (desktop.found) {
      summary += ` (${desktop.running ? 'Running' : 'Stopped'})`;
    }
    summary += '\n';
    
    summary += `🐳 Docker: ${docker.available ? '✅ Available' : '❌ Not available'}`;
    if (docker.containers.length > 0) {
      summary += ` (${docker.containers.length} Neo4j containers found)`;
    }
    summary += '\n';
    
    summary += `🔗 Existing Instance: ${existing.bolt.accessible ? '✅ Running' : '❌ Not accessible'}\n`;
    
    summary += `\n💡 Recommended: ${recommended.type.toUpperCase()}\n`;
    summary += `   ${recommended.reason}\n`;
    
    return summary;
  }
}