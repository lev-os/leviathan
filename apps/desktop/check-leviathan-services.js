#!/usr/bin/env node

/**
 * Real-time Leviathan Service Status Checker
 * Detects running Leviathan services and provides health status
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Leviathan service definitions with actual detection
const leviathanServices = [
  {
    id: 'neo4j',
    name: 'Neo4j Database',
    ports: [7474, 7687],
    healthChecks: [
      'http://localhost:7474',
      'bolt://localhost:7687'
    ],
    processNames: ['neo4j', 'java.*neo4j'],
    autoStart: true
  },
  {
    id: 'graphiti',
    name: 'Graphiti Memory',
    ports: [50051],
    healthChecks: ['http://localhost:50051'],
    processNames: ['python.*memory_service', 'python.*graphiti'],
    workingDir: '/Users/jean-patricksmith/digital/leviathan/memory/graphiti-service',
    autoStart: true
  },
  {
    id: 'agent',
    name: 'Leviathan Agent MCP',
    ports: [3001],
    healthChecks: ['http://localhost:3001/status'],
    processNames: ['node.*agent', 'node.*index.js.*agent'],
    workingDir: '/Users/jean-patricksmith/digital/leviathan/agent',
    autoStart: true
  },
  {
    id: 'graphiti',
    name: 'Graphiti Memory',
    ports: [8000],
    healthChecks: ['http://localhost:8000/health'],
    processNames: ['python.*graphiti', 'uvicorn.*graphiti'],
    autoStart: false // Optional service
  }
];

class ServiceStatusChecker {
  constructor() {
    this.serviceStatuses = new Map();
  }

  async checkPortUsage(port) {
    try {
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      return pids.length > 0 ? pids : null;
    } catch (error) {
      return null;
    }
  }

  async checkProcessByName(processPattern) {
    try {
      const { stdout } = await execAsync(`pgrep -f "${processPattern}"`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      return pids.length > 0 ? pids : null;
    } catch (error) {
      return null;
    }
  }

  async checkHttpHealth(url) {
    try {
      const response = await fetch(url, { 
        timeout: 3000,
        headers: { 'User-Agent': 'Leviathan-Desktop-Health-Check' }
      });
      return {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  async checkDockerContainer(imageName) {
    try {
      const { stdout } = await execAsync(`docker ps --filter "ancestor=${imageName}" --format "{{.ID}}"`);
      const containerIds = stdout.trim().split('\n').filter(id => id);
      return containerIds.length > 0 ? containerIds : null;
    } catch (error) {
      return null;
    }
  }

  async checkSingleService(service) {
    const status = {
      id: service.id,
      name: service.name,
      running: false,
      healthy: false,
      ports: {},
      processes: [],
      health: {},
      docker: null,
      autoStart: service.autoStart
    };

    // Check ports
    for (const port of service.ports) {
      const pids = await this.checkPortUsage(port);
      status.ports[port] = pids ? { active: true, pids } : { active: false };
      if (pids) status.running = true;
    }

    // Check processes
    for (const processPattern of service.processNames) {
      const pids = await this.checkProcessByName(processPattern);
      if (pids) {
        status.processes.push({ pattern: processPattern, pids });
        status.running = true;
      }
    }

    // Check Docker if specified
    if (service.dockerImage) {
      const containerIds = await this.checkDockerContainer(service.dockerImage);
      status.docker = containerIds ? { active: true, containers: containerIds } : { active: false };
      if (containerIds) status.running = true;
    }

    // Check health endpoints
    for (const healthUrl of service.healthChecks) {
      if (healthUrl.startsWith('http')) {
        const health = await this.checkHttpHealth(healthUrl);
        status.health[healthUrl] = health;
        if (health.ok) status.healthy = true;
      }
    }

    return status;
  }

  async checkAllServices() {
    console.log('🔍 Checking Leviathan Services...\n');
    
    const results = await Promise.all(
      leviathanServices.map(service => this.checkSingleService(service))
    );

    results.forEach(status => {
      this.serviceStatuses.set(status.id, status);
      this.printServiceStatus(status);
    });

    return results;
  }

  printServiceStatus(status) {
    const runningIcon = status.running ? '🟢' : '🔴';
    const healthIcon = status.healthy ? '💚' : status.running ? '⚠️' : '💔';
    const autoStartIcon = status.autoStart ? '⚡' : '📴';
    
    console.log(`${runningIcon} ${healthIcon} ${autoStartIcon} ${status.name} (${status.id})`);
    
    // Port status
    const activePorts = Object.entries(status.ports)
      .filter(([_, data]) => data.active)
      .map(([port, _]) => port);
    
    if (activePorts.length > 0) {
      console.log(`   🌐 Ports: ${activePorts.join(', ')}`);
    }
    
    // Process status  
    if (status.processes.length > 0) {
      console.log(`   ⚙️  Processes: ${status.processes.length} active`);
    }
    
    // Docker status
    if (status.docker?.active) {
      console.log(`   🐳 Docker: ${status.docker.containers.length} container(s)`);
    }
    
    // Health status
    const healthyEndpoints = Object.entries(status.health)
      .filter(([_, health]) => health.ok)
      .map(([url, _]) => url);
    
    if (healthyEndpoints.length > 0) {
      console.log(`   🏥 Health: ${healthyEndpoints.length} endpoint(s) OK`);
    }
    
    console.log('');
  }

  generateServiceSummary() {
    const total = this.serviceStatuses.size;
    const running = Array.from(this.serviceStatuses.values()).filter(s => s.running).length;
    const healthy = Array.from(this.serviceStatuses.values()).filter(s => s.healthy).length;
    const autoStartEnabled = Array.from(this.serviceStatuses.values()).filter(s => s.autoStart).length;
    
    console.log('📊 Service Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   Running: ${running}/${total}`);
    console.log(`   Healthy: ${healthy}/${total}`);
    console.log(`   Auto-start enabled: ${autoStartEnabled}/${total}`);
    console.log('');
    
    return { total, running, healthy, autoStartEnabled };
  }

  async startMissingServices() {
    console.log('🚀 Starting missing auto-start services...\n');
    
    const missingServices = Array.from(this.serviceStatuses.values())
      .filter(s => s.autoStart && !s.running);
    
    if (missingServices.length === 0) {
      console.log('✅ All auto-start services are already running.');
      return;
    }
    
    for (const service of missingServices) {
      console.log(`🔄 Starting ${service.name}...`);
      await this.startService(service);
    }
  }

  async startService(serviceStatus) {
    const service = leviathanServices.find(s => s.id === serviceStatus.id);
    
    try {
      switch (service.id) {
        case 'neo4j':
          console.log('   Starting Neo4j...');
          // Try common Neo4j start commands
          await execAsync('neo4j start || brew services start neo4j || systemctl start neo4j').catch(() => {
            console.log('   ⚠️  Could not auto-start Neo4j. Please start manually.');
          });
          break;
          
        case 'qdrant':
          console.log('   Starting Qdrant via Docker...');
          await execAsync('docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest').catch(() => {
            console.log('   ⚠️  Could not start Qdrant. Check Docker installation.');
          });
          break;
          
        case 'agent':
          console.log('   Starting Leviathan Agent...');
          if (service.workingDir) {
            // Start agent in background
            const agentProcess = spawn('node', ['src/index.js'], {
              cwd: service.workingDir,
              detached: true,
              stdio: 'ignore'
            });
            agentProcess.unref();
            console.log(`   🎯 Agent started with PID: ${agentProcess.pid}`);
          }
          break;
          
        default:
          console.log(`   ⚠️  No auto-start procedure for ${service.name}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to start ${service.name}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log('🧙🏽‍♂️ KINGLY AI - Leviathan Service Status Check\n');
  
  const checker = new ServiceStatusChecker();
  
  // Check current status
  await checker.checkAllServices();
  
  // Generate summary
  const summary = checker.generateServiceSummary();
  
  // Optionally start missing services
  if (process.argv.includes('--start')) {
    await checker.startMissingServices();
    
    // Recheck after starting
    console.log('🔄 Rechecking services after start attempts...\n');
    await checker.checkAllServices();
    checker.generateServiceSummary();
  }
  
  // Output recommendations
  console.log('💡 Recommendations:');
  if (summary.running < summary.total) {
    console.log('   - Run with --start flag to auto-start services');
    console.log('   - Check individual service logs for issues');
  }
  if (summary.healthy < summary.running) {
    console.log('   - Some services are running but not healthy');
    console.log('   - Check service configuration and logs');
  }
  if (summary.running === summary.total && summary.healthy === summary.running) {
    console.log('   🎉 All services are running and healthy!');
  }
}

// Handle CLI usage
if (process.argv.includes('--help')) {
  console.log('Leviathan Service Status Checker');
  console.log('');
  console.log('Usage:');
  console.log('  node check-leviathan-services.js           # Check status only');
  console.log('  node check-leviathan-services.js --start   # Check and start missing services');
  console.log('  node check-leviathan-services.js --help    # Show this help');
  process.exit(0);
}

main().catch(console.error);