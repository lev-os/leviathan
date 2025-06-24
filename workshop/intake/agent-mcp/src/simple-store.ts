import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Task {
  title: string;
  goal?: string;
  status: 'created' | 'ready' | 'in-progress' | 'blocked' | 'completed';
  created: string;
  context_refs?: Array<{
    id: string;
    purpose: string;
  }>;
  progress?: number;
  decision_logs?: Array<{
    time: string;
    decision: string;
    rationale: string;
    context_ref?: string;
  }>;
}

interface TasksFile {
  tasks: Record<string, Task>;
  _active?: string;
}

interface SimpleTask {
  id: string;
  title: string;
  description?: string;
  project?: string;
  created: string;
}

export class SimpleStore {
  private basePath = path.join(__dirname, '..');
  private tasksPath = path.join(this.basePath, '.memory', 'tasks.yaml');
  private memoryPath = path.join(this.basePath, '.memory.json');

  async remember(key: string, value: any, category?: string): Promise<void> {
    const memories = await this.loadFile(this.memoryPath, {});
    memories[key] = { value, category, timestamp: new Date().toISOString() };
    await this.saveFile(this.memoryPath, memories);
  }

  async recall(key: string): Promise<any> {
    const memories = await this.loadFile(this.memoryPath, {});
    return memories[key]?.value;
  }

  async listMemories(category?: string): Promise<Record<string, any>> {
    const memories = await this.loadFile(this.memoryPath, {});
    const result: Record<string, any> = {};
    
    for (const [key, data] of Object.entries(memories)) {
      const memData = data as any;
      if (!category || memData.category === category) {
        result[key] = memData.value;
      }
    }
    
    return result;
  }

  async createTask(task: Omit<SimpleTask, 'id' | 'created'>): Promise<SimpleTask> {
    const tasksData = await this.loadYamlFile(this.tasksPath, { tasks: {}, _active: null });
    const taskId = `TASK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const newTask: Task = {
      title: task.title,
      goal: task.description,
      status: 'created',
      created: new Date().toISOString(),
      context_refs: [],
      progress: 0,
      decision_logs: []
    };
    
    tasksData.tasks[taskId] = newTask;
    if (!tasksData._active) {
      tasksData._active = taskId;
    }
    
    await this.saveYamlFile(this.tasksPath, tasksData);
    
    return {
      id: taskId,
      title: newTask.title,
      description: newTask.goal,
      project: task.project,
      created: newTask.created
    };
  }

  async getTasks(): Promise<TasksFile> {
    return await this.loadYamlFile(this.tasksPath, { tasks: {}, _active: null });
  }

  async updateTaskStatus(taskId: string, status: Task['status'], progress?: number): Promise<void> {
    const tasksData = await this.getTasks();
    if (tasksData.tasks[taskId]) {
      tasksData.tasks[taskId].status = status;
      if (progress !== undefined) {
        tasksData.tasks[taskId].progress = progress;
      }
      await this.saveYamlFile(this.tasksPath, tasksData);
    }
  }

  async addDecisionLog(taskId: string, decision: string, rationale: string, contextRef?: string): Promise<void> {
    const tasksData = await this.getTasks();
    if (tasksData.tasks[taskId]) {
      if (!tasksData.tasks[taskId].decision_logs) {
        tasksData.tasks[taskId].decision_logs = [];
      }
      tasksData.tasks[taskId].decision_logs!.push({
        time: new Date().toISOString(),
        decision,
        rationale,
        context_ref: contextRef
      });
      await this.saveYamlFile(this.tasksPath, tasksData);
    }
  }

  private async loadYamlFile(filePath: string, defaultValue: any): Promise<any> {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const data = await fs.readFile(filePath, 'utf-8');
      return parseYaml(data) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private async saveYamlFile(filePath: string, data: any): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, stringifyYaml(data));
  }

  private async loadFile(filePath: string, defaultValue: any): Promise<any> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private async saveFile(filePath: string, data: any): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}
