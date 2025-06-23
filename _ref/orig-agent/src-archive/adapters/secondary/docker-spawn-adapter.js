/**
 * Docker Spawn Adapter - Manages Claude Code containers
 * Handles context passing via environment variables and file mounts
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export class DockerSpawnAdapter {
  constructor(config = {}) {
    // Load spawn config
    this.configPath = config.configPath || './spawn-config.yaml';
    this.configLoaded = false;
    
    // Set default config immediately
    this.config = {
      docker: {
        image: 'kingly/claude-agent:latest',
        resources: { memory: '2g', cpu_shares: 1024 }
      },
      paths: {
        context_dir: './.kingly/spawns/contexts',
        results_dir: './.kingly/spawns/results',
        logs_dir: './.kingly/spawns/logs',
        data_dir: './.kingly/data'
      },
      execution: {
        timeout_seconds: 300
      }
    };
  }
  
  async loadConfig() {
    if (this.configLoaded) return;
    
    try {
      if (await fs.pathExists(this.configPath)) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        const fullConfig = yaml.load(configContent);
        if (fullConfig.spawn) {
          // Deep merge with defaults
          this.config = this.deepMerge(this.config, fullConfig.spawn);
        }
      }
    } catch (error) {
      console.warn('Using default config:', error.message);
    }
    
    this.configLoaded = true;
  }
  
  deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
    
    function isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  }
  
  async startContainer(spawnId, taskType, taskData) {
    // 1. Prepare context
    const contextPath = await this.prepareContext(spawnId, taskType, taskData);
    
    // 2. Build Docker command
    const dockerCmd = this.buildDockerCommand(spawnId, taskType, contextPath);
    
    // 3. Start container
    const containerInfo = await this.runDocker(dockerCmd, spawnId);
    
    return containerInfo;
  }
  
  async prepareContext(spawnId, taskType, taskData) {
    const contextDir = path.join(this.config.paths.context_dir, spawnId);
    await fs.ensureDir(contextDir);
    
    // Create context.json with all necessary info
    const context = {
      spawnId,
      taskType,
      taskData,
      agentCard: await this.getAgentCard(taskData.agent || 'dev'),
      taskId: taskData.taskId,
      instructions: this.getInstructions(taskType, taskData)
    };
    
    const contextPath = path.join(contextDir, 'context.json');
    await fs.writeJson(contextPath, context, { spaces: 2 });
    
    return contextDir;
  }
  
  async getAgentCard(agentId) {
    try {
      const agentPath = path.join('./agents', `${agentId}.yaml`);
      const content = await fs.readFile(agentPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      // Default agent
      return {
        metadata: { id: 'dev', name: 'Developer' },
        system_prompt: 'You are a helpful development assistant.'
      };
    }
  }
  
  getInstructions(taskType, taskData) {
    const baseInstructions = `You are running in agent mode for task: ${taskData.taskId}

CONTEXT:
- Task Type: ${taskType}
- Agent: ${taskData.agent || 'dev'}
- Project: ${taskData.project || 'default'}

YOUR MISSION:`;

    // Task-specific instructions
    switch (taskType) {
      case 'test':
        return baseInstructions + `
1. Read the task details from context.json
2. Run the test suite for the project
3. Analyze any failures
4. Write test results to /workspace/results/test-report.json
5. Update task status based on test results`;

      case 'code_generation':
        return baseInstructions + `
1. Read the task requirements from context.json
2. Generate the requested code
3. Write generated files to /workspace/results/
4. Create a summary.md explaining what was generated
5. Update task status to 'completed'`;

      case 'complex_analysis':
        return baseInstructions + `
1. Read the analysis requirements from context.json
2. Perform deep analysis of the codebase/problem
3. Write findings to /workspace/results/analysis.md
4. Include recommendations and next steps
5. Update task confidence based on findings`;

      default:
        return baseInstructions + `
1. Read task details from context.json
2. Execute the requested task
3. Write results to /workspace/results/
4. Update task status when complete`;
    }
  }
  
  buildDockerCommand(spawnId, taskType, contextPath) {
    const {
      image,
      resources,
      volumes
    } = this.config.docker;
    
    const resultsDir = path.join(this.config.paths.results_dir, spawnId);
    const agentsDir = path.resolve('./agents');
    
    // Ensure results directory exists
    fs.ensureDirSync(resultsDir);
    
    const cmd = [
      'docker', 'run',
      '--rm',  // Remove container when done
      '--name', spawnId,
      
      // Resource limits
      '--memory', resources.memory,
      '--cpu-shares', resources.cpu_shares,
      
      // Environment variables
      '-e', `KINGLY_SPAWN_ID=${spawnId}`,
      '-e', `KINGLY_TASK_TYPE=${taskType}`,
      '-e', 'CLAUDE_CODE_MODE=agent',
      '-e', 'CLAUDE_AUTO_APPROVE=true',
      
      // Volume mounts
      '-v', `${path.resolve(contextPath)}:/workspace/context:ro`,
      '-v', `${path.resolve(resultsDir)}:/workspace/results:rw`,
      '-v', `${agentsDir}:/workspace/agents:ro`,
      
      // Image and command
      image,
      'claude-code',
      '--agent-mode',
      '--context', '/workspace/context/context.json',
      '--output', '/workspace/results'
    ];
    
    return cmd;
  }
  
  async runDocker(dockerCmd, spawnId) {
    const logPath = path.join(this.config.paths.logs_dir, `${spawnId}.log`);
    await fs.ensureDir(this.config.paths.logs_dir);
    
    // Check if Docker is available
    const dockerAvailable = await this.checkDockerAvailable();
    if (!dockerAvailable) {
      return this.runSimulation(spawnId, logPath);
    }
    
    const logStream = await fs.createWriteStream(logPath);
    
    return new Promise((resolve, reject) => {
      const dockerProcess = spawn(dockerCmd[0], dockerCmd.slice(1), {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Capture output
      dockerProcess.stdout.pipe(logStream);
      dockerProcess.stderr.pipe(logStream);
      
      // Get container ID from first output
      let containerId = null;
      dockerProcess.stdout.once('data', (data) => {
        // Docker outputs container ID as first line
        containerId = data.toString().trim();
      });
      
      // Handle errors
      dockerProcess.on('error', (error) => {
        logStream.end();
        reject(error);
      });
      
      // Don't wait for exit - container runs in background
      setTimeout(() => {
        resolve({
          id: containerId || spawnId,
          pid: dockerProcess.pid,
          logPath
        });
      }, 2000); // Give Docker time to start
    });
  }
  
  async checkContainer(containerId) {
    return new Promise((resolve) => {
      const checkProcess = spawn('docker', ['inspect', '-f', '{{.State.Status}}', containerId]);
      
      let status = '';
      checkProcess.stdout.on('data', (data) => {
        status = data.toString().trim();
      });
      
      checkProcess.on('exit', (code) => {
        if (code !== 0) {
          resolve('not_found');
        } else if (status === 'running') {
          resolve('running');
        } else if (status === 'exited') {
          resolve('exited');
        } else {
          resolve('failed');
        }
      });
    });
  }
  
  async retrieveResults(containerId) {
    const resultsDir = path.join(this.config.paths.results_dir, containerId);
    const results = {};
    
    try {
      // Read all files in results directory
      const files = await fs.readdir(resultsDir);
      
      for (const file of files) {
        const filePath = path.join(resultsDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile()) {
          const ext = path.extname(file);
          if (['.json', '.md', '.txt', '.yml', '.yaml'].includes(ext)) {
            results[file] = await fs.readFile(filePath, 'utf8');
          }
        }
      }
      
      // Parse key result files
      if (results['summary.json']) {
        results.summary = JSON.parse(results['summary.json']);
      }
      
      if (results['task-update.json']) {
        results.taskUpdate = JSON.parse(results['task-update.json']);
      }
      
    } catch (error) {
      console.error('Error retrieving results:', error);
    }
    
    return results;
  }
  
  async getContainerLogs(spawnId) {
    try {
      // Get logs from Docker container
      const { stdout } = await this.runCommandWithOutput(['docker', 'logs', spawnId]);
      return stdout;
    } catch (error) {
      console.error('Error getting container logs:', error);
      
      // Try getting logs from file instead
      const logPath = path.join(this.config.paths.logs_dir, `${spawnId}.log`);
      if (await fs.pathExists(logPath)) {
        return await fs.readFile(logPath, 'utf8');
      }
      
      return null;
    }
  }
  
  async cleanup(containerId) {
    // Stop and remove container
    try {
      await this.runCommand(['docker', 'stop', containerId]);
      await this.runCommand(['docker', 'rm', containerId]);
    } catch (error) {
      // Container might already be stopped/removed
    }
  }
  
  async runCommand(cmd) {
    return new Promise((resolve, reject) => {
      const process = spawn(cmd[0], cmd.slice(1));
      process.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Command failed: ${cmd.join(' ')}`));
      });
    });
  }
  
  async runCommandWithOutput(cmd) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      const process = spawn(cmd[0], cmd.slice(1));
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('exit', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed: ${cmd.join(' ')}\n${stderr}`));
        }
      });
    });
  }
  
  async checkDockerAvailable() {
    try {
      await this.runCommand(['docker', 'version']);
      return true;
    } catch {
      return false;
    }
  }
  
  async runSimulation(spawnId, logPath) {
    console.log('🔄 Running in Docker simulation mode');
    
    // Simulate Docker execution
    const logs = [
      `[SIMULATION] Starting container ${spawnId}`,
      '[SIMULATION] Loading context...',
      '[SIMULATION] Context loaded successfully',
      '[SIMULATION] Executing task...',
      '[SIMULATION] Creating hello.js file',
      '[SIMULATION] Task completed successfully',
      '[SIMULATION] Saving results...',
      '[SIMULATION] Container exiting with code 0'
    ];
    
    // Write simulated logs
    await fs.writeFile(logPath, logs.join('\n') + '\n');
    
    // Simulate results
    const resultsDir = path.join(this.config.paths.data_dir, 'spawns', spawnId, 'results');
    await fs.ensureDir(resultsDir);
    
    await fs.writeJson(
      path.join(resultsDir, 'summary.json'),
      {
        status: 'completed',
        summary: 'Simulated execution completed',
        spawnId: spawnId,
        exitCode: 0,
        simulation: true
      },
      { spaces: 2 }
    );
    
    // Create simulated output file
    const contextPath = path.join(this.config.paths.data_dir, 'spawns', spawnId, 'context', 'context.json');
    if (await fs.pathExists(contextPath)) {
      const context = await fs.readJson(contextPath);
      const workDir = context.taskData.workingDirectory;
      if (workDir) {
        await fs.ensureDir(workDir);
        await fs.writeFile(
          path.join(workDir, 'hello.js'),
          `// Simulated output\nconsole.log("Hello from Docker Claude!");\nconsole.log("Timestamp:", new Date().toISOString());\n`
        );
      }
    }
    
    return {
      containerId: `sim-${spawnId}`,
      logPath,
      exitCode: 0
    };
  }
}

export default DockerSpawnAdapter;