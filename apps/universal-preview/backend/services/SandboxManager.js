const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class SandboxManager extends EventEmitter {
  constructor() {
    super();
    this.docker = new Docker();
    this.activeSandboxes = new Map();
    this.maxConcurrentSandboxes = 10;
    this.defaultTimeout = 300000; // 5 minutes
    this.resourceLimits = {
      memory: '512m',
      cpuPeriod: 100000,
      cpuQuota: 50000, // 0.5 CPU
      pidsLimit: 256
    };
  }

  async createSandbox(project, executionConfig) {
    console.log(`🏗️  Creating sandbox for ${project.name}`);
    
    if (this.activeSandboxes.size >= this.maxConcurrentSandboxes) {
      throw new Error('Maximum concurrent sandboxes reached');
    }

    const sandboxId = uuidv4();
    const sandbox = {
      id: sandboxId,
      projectId: project.id,
      projectName: project.name,
      container: null,
      status: 'initializing',
      createdAt: new Date().toISOString(),
      logs: [],
      config: executionConfig
    };

    this.activeSandboxes.set(sandboxId, sandbox);

    try {
      await this.buildSandboxContainer(sandbox, project, executionConfig);
      sandbox.status = 'ready';
      
      this.emit('sandboxCreated', sandbox);
      console.log(`✅ Sandbox ${sandboxId} ready for ${project.name}`);
      
      return sandbox;
    } catch (error) {
      sandbox.status = 'failed';
      sandbox.error = error.message;
      this.emit('sandboxFailed', sandbox, error);
      throw error;
    }
  }

  async buildSandboxContainer(sandbox, project, config) {
    const containerName = `sandbox-${sandbox.id}`;
    
    // Prepare container configuration
    const containerConfig = {
      Image: config.image || this.getDefaultImage(project),
      name: containerName,
      Env: this.buildEnvironment(config),
      WorkingDir: config.workdir || '/app',
      NetworkMode: 'sandbox-network',
      HostConfig: {
        Memory: this.parseMemoryLimit(config.resourceLimits?.memory || this.resourceLimits.memory),
        CpuPeriod: this.resourceLimits.cpuPeriod,
        CpuQuota: this.resourceLimits.cpuQuota,
        PidsLimit: this.resourceLimits.pidsLimit,
        ReadonlyRootfs: false,
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=100m'
        },
        Ulimits: [
          { Name: 'nproc', Soft: 1024, Hard: 1024 },
          { Name: 'nofile', Soft: 1024, Hard: 1024 }
        ],
        SecurityOpt: ['no-new-privileges:true'],
        CapDrop: ['ALL'],
        CapAdd: ['CHOWN', 'DAC_OVERRIDE', 'SETGID', 'SETUID']
      },
      Volumes: {},
      ExposedPorts: this.buildExposedPorts(config),
      Cmd: config.command ? config.command.split(' ') : null
    };

    // Add port bindings if specified
    if (config.ports && config.ports.length > 0) {
      containerConfig.HostConfig.PortBindings = this.buildPortBindings(config.ports);
    }

    // Create and start container
    const container = await this.docker.createContainer(containerConfig);
    sandbox.container = container;

    // Copy project files if needed
    if (project.localPath) {
      await this.copyProjectToContainer(container, project.localPath);
    }

    // Install dependencies if specified
    if (config.installCommand) {
      await this.runInstallCommand(container, config.installCommand);
    }

    await container.start();
    
    // Set up cleanup timeout
    this.scheduleCleanup(sandbox, config.timeout || this.defaultTimeout);
  }

  async executeInSandbox(sandboxId, command, options = {}) {
    console.log(`⚡ Executing command in sandbox ${sandboxId}: ${command}`);
    
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    if (sandbox.status !== 'ready') {
      throw new Error(`Sandbox ${sandboxId} is not ready (status: ${sandbox.status})`);
    }

    const container = sandbox.container;
    
    try {
      const exec = await container.exec({
        Cmd: command.split(' '),
        AttachStdout: true,
        AttachStderr: true,
        Env: options.env || []
      });

      const stream = await exec.start({ hijack: true, stdin: false });
      
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        container.modem.demuxStream(stream, 
          // stdout
          (chunk) => {
            const data = chunk.toString();
            stdout += data;
            this.emit('sandboxOutput', sandboxId, 'stdout', data);
            sandbox.logs.push({ type: 'stdout', data, timestamp: new Date().toISOString() });
          },
          // stderr
          (chunk) => {
            const data = chunk.toString();
            stderr += data;
            this.emit('sandboxOutput', sandboxId, 'stderr', data);
            sandbox.logs.push({ type: 'stderr', data, timestamp: new Date().toISOString() });
          }
        );

        stream.on('end', async () => {
          try {
            const inspect = await exec.inspect();
            resolve({
              exitCode: inspect.ExitCode,
              stdout,
              stderr,
              success: inspect.ExitCode === 0
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', reject);
        
        // Timeout handling
        const timeout = options.timeout || 30000;
        setTimeout(() => {
          stream.destroy();
          reject(new Error('Command execution timeout'));
        }, timeout);
      });
      
    } catch (error) {
      console.error(`❌ Execution failed in sandbox ${sandboxId}:`, error.message);
      throw error;
    }
  }

  async streamExecution(sandboxId, command, options = {}) {
    console.log(`📡 Streaming execution in sandbox ${sandboxId}: ${command}`);
    
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const container = sandbox.container;
    
    const exec = await container.exec({
      Cmd: command.split(' '),
      AttachStdout: true,
      AttachStderr: true,
      Env: options.env || []
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    
    // Return stream for real-time processing
    return {
      stream,
      process: (onStdout, onStderr, onEnd) => {
        container.modem.demuxStream(stream, 
          (chunk) => {
            const data = chunk.toString();
            this.emit('sandboxOutput', sandboxId, 'stdout', data);
            sandbox.logs.push({ type: 'stdout', data, timestamp: new Date().toISOString() });
            if (onStdout) onStdout(data);
          },
          (chunk) => {
            const data = chunk.toString();
            this.emit('sandboxOutput', sandboxId, 'stderr', data);
            sandbox.logs.push({ type: 'stderr', data, timestamp: new Date().toISOString() });
            if (onStderr) onStderr(data);
          }
        );

        stream.on('end', async () => {
          const inspect = await exec.inspect();
          if (onEnd) onEnd({
            exitCode: inspect.ExitCode,
            success: inspect.ExitCode === 0
          });
        });
      }
    };
  }

  async getSandboxLogs(sandboxId, options = {}) {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const { limit = 100, since, type } = options;
    let logs = sandbox.logs;

    if (since) {
      logs = logs.filter(log => new Date(log.timestamp) > new Date(since));
    }

    if (type) {
      logs = logs.filter(log => log.type === type);
    }

    return logs.slice(-limit);
  }

  async getSandboxStatus(sandboxId) {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return null;
    }

    if (sandbox.container) {
      const containerInfo = await sandbox.container.inspect();
      sandbox.containerStatus = containerInfo.State.Status;
    }

    return {
      id: sandbox.id,
      status: sandbox.status,
      containerStatus: sandbox.containerStatus,
      projectId: sandbox.projectId,
      projectName: sandbox.projectName,
      createdAt: sandbox.createdAt,
      uptime: Date.now() - new Date(sandbox.createdAt).getTime(),
      logCount: sandbox.logs.length
    };
  }

  async destroySandbox(sandboxId, force = false) {
    console.log(`🗑️  Destroying sandbox ${sandboxId}`);
    
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      return false;
    }

    try {
      if (sandbox.container) {
        if (force) {
          await sandbox.container.kill();
        } else {
          await sandbox.container.stop({ t: 10 }); // 10 second graceful stop
        }
        await sandbox.container.remove({ force: true });
      }

      this.activeSandboxes.delete(sandboxId);
      this.emit('sandboxDestroyed', sandbox);
      
      console.log(`✅ Sandbox ${sandboxId} destroyed`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to destroy sandbox ${sandboxId}:`, error.message);
      throw error;
    }
  }

  async listActiveSandboxes() {
    const sandboxes = [];
    
    for (const [id, sandbox] of this.activeSandboxes) {
      sandboxes.push(await this.getSandboxStatus(id));
    }
    
    return sandboxes;
  }

  async cleanupOrphanedSandboxes() {
    console.log('🧹 Cleaning up orphaned sandboxes...');
    
    const containers = await this.docker.listContainers({
      all: true,
      filters: { name: ['sandbox-'] }
    });

    let cleaned = 0;
    for (const containerInfo of containers) {
      const container = this.docker.getContainer(containerInfo.Id);
      try {
        await container.remove({ force: true });
        cleaned++;
      } catch (error) {
        console.warn(`⚠️  Failed to clean orphaned container ${containerInfo.Id}`);
      }
    }

    console.log(`✅ Cleaned ${cleaned} orphaned containers`);
    return cleaned;
  }

  // Helper methods
  getDefaultImage(project) {
    const language = project.analysis?.language;
    const images = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-slim',
      'rust': 'rust:1.70-slim',
      'go': 'golang:1.21-alpine'
    };
    return images[language] || 'node:18-alpine';
  }

  buildEnvironment(config) {
    const env = [
      'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      'NODE_ENV=sandbox',
      'PYTHONUNBUFFERED=1'
    ];

    if (config.environment) {
      env.push(...config.environment);
    }

    return env;
  }

  buildExposedPorts(config) {
    const ports = {};
    
    if (config.ports) {
      config.ports.forEach(portMapping => {
        const [containerPort] = portMapping.split(':');
        ports[`${containerPort}/tcp`] = {};
      });
    }

    return ports;
  }

  buildPortBindings(ports) {
    const bindings = {};
    
    ports.forEach(portMapping => {
      const [containerPort, hostPort] = portMapping.split(':');
      bindings[`${containerPort}/tcp`] = [{ HostPort: hostPort || '0' }];
    });

    return bindings;
  }

  parseMemoryLimit(memoryStr) {
    const units = { b: 1, k: 1024, m: 1024**2, g: 1024**3 };
    const match = memoryStr.toLowerCase().match(/^(\d+)([bkmg]?)$/);
    
    if (!match) return 512 * 1024 * 1024; // Default 512MB
    
    const [, amount, unit] = match;
    return parseInt(amount) * (units[unit] || units.b);
  }

  async copyProjectToContainer(container, localPath) {
    console.log(`📁 Copying project files to container...`);
    
    try {
      // Create tar archive of project files
      const tar = require('tar-stream');
      const pack = tar.pack();
      
      await this.addDirectoryToTar(pack, localPath, '');
      pack.finalize();
      
      // Upload to container
      await container.putArchive(pack, { path: '/app' });
      
    } catch (error) {
      console.error('❌ Failed to copy project files:', error.message);
      throw error;
    }
  }

  async addDirectoryToTar(pack, dirPath, basePath) {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      if (item.startsWith('.') && !['package.json', 'dockerfile'].includes(item.toLowerCase())) {
        continue; // Skip hidden files
      }
      
      const fullPath = path.join(dirPath, item);
      const tarPath = path.join(basePath, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        await this.addDirectoryToTar(pack, fullPath, tarPath);
      } else {
        const content = await fs.readFile(fullPath);
        pack.entry({ name: tarPath, size: stats.size }, content);
      }
    }
  }

  async runInstallCommand(container, installCommand) {
    console.log(`📦 Running install command: ${installCommand}`);
    
    const exec = await container.exec({
      Cmd: installCommand.split(' '),
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      container.modem.demuxStream(stream, 
        (chunk) => { output += chunk.toString(); },
        (chunk) => { output += chunk.toString(); }
      );

      stream.on('end', async () => {
        const inspect = await exec.inspect();
        if (inspect.ExitCode === 0) {
          console.log('✅ Install command completed successfully');
          resolve(output);
        } else {
          console.error('❌ Install command failed');
          reject(new Error(`Install failed with exit code ${inspect.ExitCode}: ${output}`));
        }
      });

      stream.on('error', reject);
    });
  }

  scheduleCleanup(sandbox, timeout) {
    setTimeout(async () => {
      if (this.activeSandboxes.has(sandbox.id)) {
        console.log(`⏰ Auto-cleaning up sandbox ${sandbox.id} after timeout`);
        await this.destroySandbox(sandbox.id, true);
      }
    }, timeout);
  }

  async healthCheck() {
    try {
      await this.docker.ping();
      return {
        status: 'healthy',
        activeSandboxes: this.activeSandboxes.size,
        maxConcurrent: this.maxConcurrentSandboxes
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = SandboxManager;