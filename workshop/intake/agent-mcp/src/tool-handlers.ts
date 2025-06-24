import { SimpleStore } from './simple-store.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parse, stringify } from 'yaml';
import { spawn, ChildProcess } from 'child_process';

export class ToolHandlers {
  private store = new SimpleStore();
  private runningProcesses = new Map<string, ChildProcess>();

  async handleRememberContext(args: Record<string, any>) {
    if (!args.key || !args.value) throw new Error('Key and value required');
    await this.store.remember(args.key, args.value, args.category);
    return `🧠 Remembered: ${args.key} = ${args.value}`;
  }

  async handleRecallContext(args: Record<string, any>) {
    if (!args.key) throw new Error('Key required');
    const memory = await this.store.recall(args.key);
    return memory ? `🧠 Recalled: ${args.key} = ${memory}` : `❌ No memory found`;
  }

  async handleListMemories(args: Record<string, any>) {
    const memories = await this.store.listMemories(args.category);
    const list = Object.entries(memories).map(([k, v]) => `• ${k}: ${v}`).join('\n');
    return list || 'No memories found';
  }

  async handleCreateTask(args: Record<string, any>) {
    if (!args.title) throw new Error('Title required');
    const task = await this.store.createTask({
      title: args.title,
      description: args.description,
      project: args.project || 'General'
    });
    return `✅ Created task: "${task.title}" (ID: ${task.id})`;
  }

  async handleExecuteAgentTask(args: Record<string, any>) {
    const { taskId, agent, mode = 'auto' } = args;
    
    // Fast basic validations (no semantic validation - trust desktop agent)
    if (!taskId || !agent) {
      throw new Error('taskId and agent are required');
    }
    
    // Check if task already running
    if (this.runningProcesses.has(taskId)) {
      throw new Error(`Task ${taskId} is already running`);
    }
    
    const projectRoot = process.env.PROJECT_ROOT || '../';
    
    // Verify task exists in tasks.yaml
    const tasksPath = path.join(process.cwd(), projectRoot, '.memory/tasks.yaml');
    let tasks: any;
    try {
      const content = await fs.readFile(tasksPath, 'utf-8');
      tasks = parse(content);
    } catch (error) {
      throw new Error(`Failed to load tasks.yaml: ${error}`);
    }
    
    const task = tasks.tasks[taskId];
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Verify agent prompt file exists
    const promptPath = path.resolve(`./agents/${agent}/${mode}.md`);
    try {
      await fs.access(promptPath);
    } catch {
      throw new Error(`Agent prompt not found: agents/${agent}/${mode}.md`);
    }
    
    // Create handoff directory
    const handoffDir = path.join(process.cwd(), projectRoot, '.memory/handoff');
    await fs.mkdir(handoffDir, { recursive: true });
    
    // Initialize status file
    const statusFile = path.join(handoffDir, `${taskId}-status.yaml`);
    const initialStatus = {
      task: taskId,
      agent: agent,
      mode: mode,
      status: 'spawning',
      timestamp: new Date().toISOString(),
      handoff_context: {
        task_title: task.title,
        task_goal: task.goal,
        context_files: task.context_refs || []
      }
    };
    
    await fs.writeFile(statusFile, stringify(initialStatus));
    
    // Build Claude Code prompt
    const taskPrompt = `Load system prompt from ${promptPath} and execute task ${taskId}. Your working directory is ${process.cwd()}.`;
    
    // Spawn Claude Code CLI process
    const claudeProcess = spawn('claude', [
      '-p', taskPrompt,
      '--output-format', 'json',
      '--dangerously-skip-permissions'
    ], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Track the running process
    this.runningProcesses.set(taskId, claudeProcess);
    
    // Update status to running
    const runningStatus = {
      ...initialStatus,
      status: 'running',
      pid: claudeProcess.pid,
      started_at: new Date().toISOString()
    };
    
    await fs.writeFile(statusFile, stringify(runningStatus));
    
    // Handle process completion
    claudeProcess.on('exit', async (code) => {
      this.runningProcesses.delete(taskId);
      
      const completionStatus = {
        ...runningStatus,
        status: code === 0 ? 'completed' : 'failed',
        exit_code: code,
        completed_at: new Date().toISOString()
      };
      
      await fs.writeFile(statusFile, stringify(completionStatus));
    });
    
    // Handle process errors
    claudeProcess.on('error', async (error) => {
      this.runningProcesses.delete(taskId);
      
      const errorStatus = {
        ...runningStatus,
        status: 'error',
        error: {
          type: 'process_error',
          message: error.message
        },
        failed_at: new Date().toISOString()
      };
      
      await fs.writeFile(statusFile, stringify(errorStatus));
    });
    
    return `✅ Agent ${agent} spawned for task ${taskId} (PID: ${claudeProcess.pid})

Status tracking: .memory/handoff/${taskId}-status.yaml
Decision log: .memory/handoff/${taskId}-decisions.log

Use check_agent_status to monitor progress.`;
  }

  async handleCheckAgentStatus(args: Record<string, any>) {
    const { taskId } = args;
    const projectRoot = process.env.PROJECT_ROOT || '../';
    
    const statusFile = path.join(process.cwd(), projectRoot, '.memory/handoff', `${taskId}-status.yaml`);
    
    try {
      const statusContent = await fs.readFile(statusFile, 'utf-8');
      const status = parse(statusContent);
      
      const decisionLog = path.join(process.cwd(), projectRoot, '.memory/handoff', `${taskId}-decisions.log`);
      
      let decisions = '';
      try {
        decisions = await fs.readFile(decisionLog, 'utf-8');
      } catch (e) {
        decisions = 'No decisions logged yet';
      }
      
      return `## Task ${taskId} Status

**Current Status**: ${status.status}
**Progress**: ${status.progress || 0}%
**Last Updated**: ${status.timestamp}
**Agent**: ${status.agent}
**Mode**: ${status.mode}

### Current Action
${status.current_action || 'No action reported'}

### Files Modified
${(status.files_modified || []).map((f: string) => `- ${f}`).join('\n') || 'None yet'}

### Recent Decisions
${decisions.split('\n').slice(-5).join('\n') || 'No decisions logged'}`;
    } catch (error) {
      return `❌ No status found for task ${taskId}`;
    }
  }

  async handleKillAgent(args: Record<string, any>) {
    const { taskId } = args;
    
    if (!taskId) {
      throw new Error('taskId required');
    }
    
    const childProcess = this.runningProcesses.get(taskId);
    if (!childProcess) {
      return `❌ No running process found for task ${taskId}`;
    }
    
    try {
      childProcess.kill('SIGTERM');
      this.runningProcesses.delete(taskId);
      
      // Update status file
      const projectRoot = process.env.PROJECT_ROOT || '../';
      const statusFile = path.join(process.cwd(), projectRoot, '.memory/handoff', `${taskId}-status.yaml`);
      
      try {
        const statusContent = await fs.readFile(statusFile, 'utf-8');
        const status = parse(statusContent);
        
        const killedStatus = {
          ...status,
          status: 'killed',
          killed_at: new Date().toISOString()
        };
        
        await fs.writeFile(statusFile, stringify(killedStatus));
      } catch {
        // Status file might not exist, that's ok
      }
      
      return `✅ Killed agent process for task ${taskId}`;
    } catch (error) {
      return `❌ Failed to kill process: ${error}`;
    }
  }

  async handleListRunningAgents(args: Record<string, any>) {
    if (this.runningProcesses.size === 0) {
      return 'No agents currently running';
    }
    
    const processes = Array.from(this.runningProcesses.entries()).map(([taskId, childProcess]) => {
      return `• Task ${taskId}: PID ${childProcess.pid}`;
    });
    
    return `Running agents:\n${processes.join('\n')}`;
  }

  async handleSpawnClaudeInstance(args: Record<string, any>): Promise<string> {
    const { 
      name, 
      port = null, 
      workspace = './workspaces/default',
      project = 'default',
      detached = true 
    } = args;
    
    if (!name) {
      throw new Error('Instance name is required');
    }
    
    // Auto-assign port if not provided
    const assignedPort = port || await this.findAvailablePort();
    
    // Check if instance already exists
    const containerName = `claude-code-${name}`;
    const checkCmd = spawn('docker', ['ps', '-q', '-f', `name=${containerName}`]);
    
    return new Promise((resolve, reject) => {
      let output = '';
      checkCmd.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      checkCmd.on('close', async (code) => {
        if (output.trim()) {
          reject(new Error(`Claude instance "${name}" already exists (container: ${containerName})`));
          return;
        }
        
        try {
          // Create workspace directory if it doesn't exist
          await fs.mkdir(workspace, { recursive: true });
          
          // Docker run command for new Claude Code instance
          const dockerArgs = [
            'run',
            '-d',
            '--name', containerName,
            '-p', `${assignedPort}:54545`,
            '-v', `${path.resolve(workspace)}:/workspace`,
            '-v', `${process.env.HOME}/.claude:/root/.claude`,
            '-e', `CLAUDE_PORT=${assignedPort}`,
            '-e', `PROJECT_NAME=${project}`,
            '--restart', 'unless-stopped',
            'claude-code-image'
          ];
          
          const dockerProcess = spawn('docker', dockerArgs);
          let containerId = '';
          let errorOutput = '';
          
          dockerProcess.stdout.on('data', (data) => {
            containerId += data.toString().trim();
          });
          
          dockerProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          dockerProcess.on('close', (exitCode) => {
            if (exitCode === 0) {
              // Store the container info for management
              this.runningProcesses.set(`claude-${name}`, dockerProcess);
              
              resolve(`🚀 Claude instance "${name}" spawned successfully!
📦 Container: ${containerName}
🌐 Port: ${assignedPort}
📁 Workspace: ${workspace}
🔗 Access: http://localhost:${assignedPort}
🆔 Container ID: ${containerId.substring(0, 12)}

Use 'docker logs ${containerName}' to check startup logs.`);
            } else {
              reject(new Error(`Failed to spawn Claude instance: ${errorOutput}`));
            }
          });
          
          dockerProcess.on('error', (error) => {
            reject(new Error(`Docker spawn error: ${error.message}`));
          });
          
        } catch (error) {
          reject(new Error(`Workspace creation failed: ${error}`));
        }
      });
    });
  }

  async handleListClaudeInstances(args: Record<string, any>): Promise<string> {
    const dockerProcess = spawn('docker', ['ps', '--filter', 'name=claude-code-', '--format', 'table {{.Names}}\t{{.Status}}\t{{.Ports}}']);
    
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      
      dockerProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      dockerProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      dockerProcess.on('close', (exitCode) => {
        if (exitCode === 0) {
          if (output.trim().split('\n').length <= 1) {
            resolve('📭 No Claude instances currently running');
          } else {
            resolve(`🏃 Running Claude instances:\n\n${output}`);
          }
        } else {
          reject(new Error(`Failed to list instances: ${errorOutput}`));
        }
      });
    });
  }

  async handleStopClaudeInstance(args: Record<string, any>): Promise<string> {
    const { name, force = false } = args;
    
    if (!name) {
      throw new Error('Instance name is required');
    }
    
    const containerName = `claude-code-${name}`;
    const command = force ? 'kill' : 'stop';
    const dockerProcess = spawn('docker', [command, containerName]);
    
    return new Promise((resolve, reject) => {
      let errorOutput = '';
      
      dockerProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      dockerProcess.on('close', (exitCode) => {
        if (exitCode === 0) {
          // Remove from our tracking
          this.runningProcesses.delete(`claude-${name}`);
          resolve(`🛑 Claude instance "${name}" ${force ? 'killed' : 'stopped'} successfully`);
        } else {
          reject(new Error(`Failed to stop instance: ${errorOutput}`));
        }
      });
    });
  }

  async handleClaudeInstanceLogs(args: Record<string, any>): Promise<string> {
    const { name, lines = 50, follow = false } = args;
    
    if (!name) {
      throw new Error('Instance name is required');
    }
    
    const containerName = `claude-code-${name}`;
    const dockerArgs = ['logs'];
    
    if (follow) dockerArgs.push('-f');
    dockerArgs.push('--tail', lines.toString(), containerName);
    
    const dockerProcess = spawn('docker', dockerArgs);
    
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      
      dockerProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      dockerProcess.stderr.on('data', (data) => {
        if (data.toString().includes('Error:')) {
          errorOutput += data.toString();
        } else {
          output += data.toString(); // Docker logs go to stderr sometimes
        }
      });
      
      dockerProcess.on('close', (exitCode) => {
        if (exitCode === 0) {
          resolve(`📋 Logs for Claude instance "${name}":\n\n${output}`);
        } else {
          reject(new Error(`Failed to get logs: ${errorOutput}`));
        }
      });
    });
  }

  private async findAvailablePort(): Promise<number> {
    // Start checking from 54545 and find first available port
    const startPort = 54545;
    const maxPort = 54600;
    
    for (let port = startPort; port <= maxPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    
    throw new Error('No available ports found in range 54545-54600');
  }

  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const testProcess = spawn('netstat', ['-tlnp']);
      let output = '';
      
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.on('close', () => {
        const isUsed = output.includes(`:${port} `);
        resolve(!isUsed);
      });
      
      testProcess.on('error', () => {
        // If netstat fails, assume port is available
        resolve(true);
      });
    });
  }
}
