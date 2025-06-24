import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn, ChildProcess } from 'child_process';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export interface TasksFile {
  tasks: Record<string, any>;
  _active?: string;
}

export class TestEnvironment {
  private tempDir: string;
  private mcpServer?: ChildProcess;
  private originalCwd: string;

  constructor() {
    this.originalCwd = process.cwd();
    this.tempDir = '';
  }

  async setup(): Promise<TestEnvironment> {
    // Create temp directory structure
    this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-test-'));
    await this.createDirectoryStructure();
    
    // Copy source files if needed for integration tests
    await this.copySourceFiles();
    
    return this;
  }

  async teardown(): Promise<void> {
    if (this.mcpServer) {
      this.mcpServer.kill('SIGTERM');
      await this.waitForProcessExit(this.mcpServer);
    }
    
    if (this.tempDir) {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    }
  }

  async startMCPServer(): Promise<void> {
    const serverPath = path.join(__dirname, '../../dist/index.js');
    
    this.mcpServer = spawn('node', ['--experimental-specifier-resolution=node', serverPath], {
      cwd: this.tempDir,
      env: { 
        ...process.env, 
        TEST_MODE: 'true',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Capture stderr for debugging
    let stderr = '';
    this.mcpServer.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for server to start
    await this.delay(1000);
    
    if (this.mcpServer.exitCode !== null) {
      throw new Error(`MCP server failed to start with exit code ${this.mcpServer.exitCode}. Stderr: ${stderr}`);
    }
  }

  async sendMCPRequest(request: any): Promise<any> {
    if (!this.mcpServer) {
      throw new Error('MCP server not started');
    }

    const server = this.mcpServer;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP request timeout'));
      }, 5000);

      let responseData = '';
      
      const dataHandler = (chunk: Buffer) => {
        responseData += chunk.toString();
        try {
          const response = JSON.parse(responseData);
          clearTimeout(timeout);
          server.stdout?.off('data', dataHandler);
          resolve(response);
        } catch {
          // Not complete JSON yet, continue listening
        }
      };

      if (!server.stdout || !server.stdin) {
        clearTimeout(timeout);
        reject(new Error('MCP server streams not available'));
        return;
      }
      
      server.stdout.on('data', dataHandler);
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async createDirectoryStructure(): Promise<void> {
    const dirs = [
      '.memory',
      '.memory/context',
      '.memory/handoff',
      '.memory/sessions',
      'agents',
      'agents/codecatalyst'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.tempDir, dir), { recursive: true });
    }
  }

  async copySourceFiles(): Promise<void> {
    // Copy built files for integration testing
    const sourceDist = path.join(this.originalCwd, 'dist');
    const targetDist = path.join(this.tempDir, 'dist');
    
    try {
      await fs.access(sourceDist);
      await this.copyDirectory(sourceDist, targetDist);
    } catch {
      // Dist directory doesn't exist, skip
    }
  }

  async copyDirectory(source: string, target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  async readTasks(): Promise<TasksFile> {
    try {
      const content = await fs.readFile(
        path.join(this.tempDir, '.memory/tasks.yaml'), 
        'utf-8'
      );
      return parseYaml(content) as TasksFile;
    } catch {
      return { tasks: {}, _active: undefined };
    }
  }

  async writeTasks(tasks: TasksFile): Promise<void> {
    await fs.writeFile(
      path.join(this.tempDir, '.memory/tasks.yaml'),
      stringifyYaml(tasks)
    );
  }

  async createTask(title: string, goal?: string): Promise<{ id: string; task: any }> {
    const tasks = await this.readTasks();
    const taskId = `TASK-${Date.now().toString().slice(-6)}-TEST`;
    
    const task = {
      title,
      goal,
      status: 'created',
      created: new Date().toISOString(),
      context_refs: [],
      progress: 0,
      decision_logs: []
    };
    
    tasks.tasks[taskId] = task;
    if (!tasks._active) {
      tasks._active = taskId;
    }
    
    await this.writeTasks(tasks);
    return { id: taskId, task };
  }

  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    const tasks = await this.readTasks();
    if (tasks.tasks[taskId]) {
      tasks.tasks[taskId].progress = progress;
      await this.writeTasks(tasks);
    }
  }

  async completeTask(taskId: string): Promise<void> {
    const tasks = await this.readTasks();
    if (tasks.tasks[taskId]) {
      tasks.tasks[taskId].status = 'completed';
      tasks.tasks[taskId].progress = 100;
      await this.writeTasks(tasks);
    }
  }

  async writeContext(contextId: string, content: string): Promise<void> {
    await fs.writeFile(
      path.join(this.tempDir, `.memory/context/${contextId}.md`),
      content
    );
  }

  async readContext(contextId: string): Promise<string> {
    return await fs.readFile(
      path.join(this.tempDir, `.memory/context/${contextId}.md`),
      'utf-8'
    );
  }

  async listContextFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(path.join(this.tempDir, '.memory/context'));
      return files.filter(f => f.endsWith('.md'));
    } catch {
      return [];
    }
  }

  async writeHandoffStatus(taskId: string, status: any): Promise<void> {
    await fs.writeFile(
      path.join(this.tempDir, `.memory/handoff/${taskId}-status.yaml`),
      stringifyYaml(status)
    );
  }

  async readHandoffStatus(taskId: string): Promise<any> {
    try {
      const content = await fs.readFile(
        path.join(this.tempDir, `.memory/handoff/${taskId}-status.yaml`),
        'utf-8'
      );
      return parseYaml(content);
    } catch {
      return null;
    }
  }

  async writeDecisionLog(taskId: string, decisions: any[]): Promise<void> {
    const logContent = decisions.map(d => 
      `[${d.timestamp}] ${d.decision}\nRationale: ${d.rationale}\n---\n`
    ).join('\n');
    
    await fs.writeFile(
      path.join(this.tempDir, `.memory/handoff/${taskId}-decisions.log`),
      logContent
    );
  }

  async readDecisionLog(taskId: string): Promise<string> {
    try {
      return await fs.readFile(
        path.join(this.tempDir, `.memory/handoff/${taskId}-decisions.log`),
        'utf-8'
      );
    } catch {
      return '';
    }
  }

  getTempDir(): string {
    return this.tempDir;
  }

  private async waitForProcessExit(process: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      if (process.exitCode !== null) {
        resolve();
        return;
      }
      process.on('exit', () => resolve());
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export async function createTestEnvironment(): Promise<TestEnvironment> {
  const env = new TestEnvironment();
  await env.setup();
  return env;
}
