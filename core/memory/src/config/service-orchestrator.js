/**
 * Service Orchestrator
 * Manages different deployment modes for Neo4j + Graphiti services
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

export class ServiceOrchestrator extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.services = new Map();
    this.healthChecks = new Map();
  }

  /**
   * Start services based on deployment mode
   */
  async start() {
    const mode = this.config.deploymentMode;
    console.log(`🚀 Starting services in ${mode} mode...`);

    switch (mode) {
      case 'desktop':
      case 'external':
        return await this.startExternalMode();
      
      case 'docker':
        return await this.startDockerMode();
      
      case 'native':
        return await this.startNativeMode();
      
      default:
        throw new Error(`Unknown deployment mode: ${mode}`);
    }
  }

  /**
   * External mode: Only start Graphiti service, use existing Neo4j
   */  /**
   * External mode: Only start Graphiti service, use existing Neo4j
   */
  async startExternalMode() {
    console.log('📱 Using external Neo4j instance...');
    
    // Test Neo4j connection first
    const neo4jHealthy = await this.checkNeo4jHealth();
    if (!neo4jHealthy) {
      throw new Error('Cannot connect to external Neo4j instance. Please ensure it\'s running and accessible.');
    }

    // Start Graphiti gRPC service
    await this.startGraphitiService();
    
    console.log('✅ External mode services started successfully');
    return { mode: 'external', services: ['graphiti-grpc'] };
  }

  /**
   * Docker mode: Use docker-compose for both services
   */
  async startDockerMode() {
    console.log('🐳 Starting Docker Compose services...');
    
    try {
      // Check if docker-compose.yml exists
      const composePath = path.join(process.cwd(), 'docker-compose.yml');
      await fs.access(composePath);
      
      // Generate external compose file if using external Neo4j
      if (this.config.neo4j.source === 'external') {
        await this.generateExternalComposeFile();
      }
      
      // Start services
      const { stdout, stderr } = await execAsync('docker-compose up -d');
      console.log('Docker compose output:', stdout);
      
      if (stderr) {
        console.warn('Docker compose warnings:', stderr);
      }
      
      // Wait for services to be healthy
      await this.waitForDockerServices();
      
      console.log('✅ Docker services started successfully');
      return { mode: 'docker', services: ['neo4j', 'graphiti-service'] };
      
    } catch (error) {
      console.error('Failed to start Docker services:', error.message);
      throw error;
    }
  }

  /**
   * Native mode: Run Graphiti service as native Python process
   */
  async startNativeMode() {
    console.log('⚡ Starting native Python services...');
    
    // Test Neo4j connection
    const neo4jHealthy = await this.checkNeo4jHealth();
    if (!neo4jHealthy) {
      throw new Error('Cannot connect to Neo4j. Please ensure it\'s running.');
    }
    
    // Start Python Graphiti service
    await this.startNativeGraphitiService();
    
    console.log('✅ Native services started successfully');
    return { mode: 'native', services: ['graphiti-native'] };
  }

  /**
   * Start Graphiti gRPC service (containerized)
   */
  async startGraphitiService() {
    try {
      const containerName = 'leviathan-graphiti-service';
      
      // Stop existing container if running
      try {
        await execAsync(`docker stop ${containerName}`);
        await execAsync(`docker rm ${containerName}`);
      } catch (e) {
        // Container wasn't running
      }
      
      // Build and start container
      const buildPath = path.join(process.cwd(), 'graphiti-service');
      await execAsync(`docker build -t ${containerName} ${buildPath}`);
      
      const runCommand = [
        'docker run -d',
        `--name ${containerName}`,
        `-p ${this.config.graphiti.grpcAddress.split(':')[1]}:50051`,
        `-e NEO4J_URI=${this.config.neo4j.uri}`,
        `-e NEO4J_USERNAME=${this.config.neo4j.username}`,
        `-e NEO4J_PASSWORD=${this.config.neo4j.password}`,
        '--network host',
        containerName
      ].join(' ');
      
      await execAsync(runCommand);
      
      // Wait for service to be ready
      await this.waitForGraphitiHealth();
      
      this.services.set('graphiti-grpc', containerName);
      console.log('✅ Graphiti gRPC service started');
      
    } catch (error) {
      console.error('Failed to start Graphiti service:', error.message);
      throw error;
    }
  }  /**
   * Start native Python Graphiti service
   */
  async startNativeGraphitiService() {
    try {
      const servicePath = path.join(process.cwd(), 'graphiti-service', 'src', 'memory_service.py');
      
      // Set environment variables
      const env = {
        ...process.env,
        NEO4J_URI: this.config.neo4j.uri,
        NEO4J_USERNAME: this.config.neo4j.username,
        NEO4J_PASSWORD: this.config.neo4j.password,
        GRPC_PORT: this.config.graphiti.grpcAddress.split(':')[1] || '50051'
      };
      
      // Start Python service
      const pythonProcess = spawn('python', [servicePath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(servicePath)
      });
      
      // Handle process events
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Graphiti: ${data.toString().trim()}`);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Graphiti Error: ${data.toString().trim()}`);
      });
      
      pythonProcess.on('close', (code) => {
        console.log(`Graphiti service exited with code ${code}`);
        this.emit('service-stopped', { service: 'graphiti-native', code });
      });
      
      // Wait for service to be ready
      await this.waitForGraphitiHealth();
      
      this.services.set('graphiti-native', pythonProcess);
      console.log('✅ Native Graphiti service started');
      
    } catch (error) {
      console.error('Failed to start native Graphiti service:', error.message);
      throw error;
    }
  }

  /**
   * Generate docker-compose file for external Neo4j mode
   */
  async generateExternalComposeFile() {
    const externalCompose = `
version: '3.8'

services:
  # Graphiti gRPC Memory Service (External Neo4j Mode)
  graphiti-service:
    build:
      context: ./graphiti-service
      dockerfile: Dockerfile
    ports:
      - "${this.config.graphiti.grpcAddress.split(':')[1] || '50051'}:50051"
    environment:
      - NEO4J_URI=${this.config.neo4j.uri}
      - NEO4J_USERNAME=${this.config.neo4j.username}
      - NEO4J_PASSWORD=${this.config.neo4j.password}
      - GRPC_PORT=50051
    restart: unless-stopped
    network_mode: host
    healthcheck:
      test: ["CMD", "python", "-c", "import grpc; grpc.channel_ready_future(grpc.insecure_channel('localhost:50051')).result(timeout=5)"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  default:
    external: true
    name: bridge
`;

    await fs.writeFile('docker-compose.external.yml', externalCompose.trim());
    console.log('📝 Generated docker-compose.external.yml for external Neo4j mode');
  }

  /**
   * Health check for Neo4j connection
   */
  async checkNeo4jHealth() {
    try {
      const neo4j = await import('neo4j-driver');
      const driver = neo4j.driver(
        this.config.neo4j.uri,
        neo4j.auth.basic(this.config.neo4j.username, this.config.neo4j.password),
        { connectionTimeout: 5000 }
      );
      
      const session = driver.session();
      await session.run('RETURN 1 as test');
      await session.close();
      await driver.close();
      
      return true;
    } catch (error) {
      console.warn('Neo4j health check failed:', error.message);
      return false;
    }
  }  /**
   * Wait for Graphiti service to be healthy
   */
  async waitForGraphitiHealth(maxRetries = 30, interval = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Try to connect to gRPC service
        const grpc = await import('@grpc/grpc-js');
        const protoLoader = await import('@grpc/proto-loader');
        
        const PROTO_PATH = path.join(process.cwd(), 'graphiti-service', 'proto', 'memory.proto');
        const packageDefinition = protoLoader.loadSync(PROTO_PATH);
        const memoryProto = grpc.loadPackageDefinition(packageDefinition).memory;
        
        const client = new memoryProto.MemoryService(
          this.config.graphiti.grpcAddress,
          grpc.credentials.createInsecure()
        );
        
        // Simple health check call
        await new Promise((resolve, reject) => {
          client.GetConfig({}, (error, response) => {
            if (error) reject(error);
            else resolve(response);
          });
        });
        
        console.log('✅ Graphiti service is healthy');
        return true;
        
      } catch (error) {
        console.log(`🔄 Waiting for Graphiti service... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Graphiti service failed to become healthy');
  }

  /**
   * Wait for Docker services to be healthy
   */
  async waitForDockerServices(maxRetries = 30, interval = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const { stdout } = await execAsync('docker-compose ps --format json');
        const services = JSON.parse(`[${stdout.trim().split('\n').join(',')}]`);
        
        const allHealthy = services.every(service => 
          service.State === 'running' && 
          (service.Health === 'healthy' || service.Health === '')
        );
        
        if (allHealthy) {
          console.log('✅ All Docker services are healthy');
          return true;
        }
        
        console.log(`🔄 Waiting for Docker services... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, interval));
        
      } catch (error) {
        console.log(`🔄 Checking Docker services... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Docker services failed to become healthy');
  }

  /**
   * Stop all services
   */
  async stop() {
    console.log('🛑 Stopping services...');
    
    for (const [name, service] of this.services) {
      try {
        if (typeof service === 'string') {
          // Docker container
          await execAsync(`docker stop ${service}`);
          console.log(`✅ Stopped ${name}`);
        } else if (service.kill) {
          // Node process
          service.kill('SIGTERM');
          console.log(`✅ Stopped ${name}`);
        }
      } catch (error) {
        console.warn(`Failed to stop ${name}:`, error.message);
      }
    }
    
    // Stop docker-compose if in docker mode
    if (this.config.deploymentMode === 'docker') {
      try {
        await execAsync('docker-compose down');
        console.log('✅ Stopped Docker Compose services');
      } catch (error) {
        console.warn('Failed to stop Docker Compose:', error.message);
      }
    }
    
    this.services.clear();
    console.log('🏁 All services stopped');
  }

  /**
   * Get service status
   */
  async getStatus() {
    const status = {
      mode: this.config.deploymentMode,
      services: {},
      healthy: true
    };
    
    // Check Neo4j
    status.services.neo4j = await this.checkNeo4jHealth();
    
    // Check Graphiti
    try {
      await this.waitForGraphitiHealth(1, 1000); // Quick check
      status.services.graphiti = true;
    } catch (error) {
      status.services.graphiti = false;
    }
    
    status.healthy = Object.values(status.services).every(s => s === true);
    
    return status;
  }
}