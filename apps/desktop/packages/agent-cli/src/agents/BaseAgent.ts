import { EventEmitter } from 'eventemitter3';
import { AgentConfig, AgentMessage, AgentStatus, LLMProvider } from '../types.js';

export abstract class BaseAgent extends EventEmitter {
  protected config: AgentConfig;
  protected llmProvider: LLMProvider;
  protected status: AgentStatus;
  protected taskQueue: any[] = [];
  protected isProcessing = false;

  constructor(config: AgentConfig, llmProvider: LLMProvider) {
    super();
    this.config = config;
    this.llmProvider = llmProvider;
    this.status = {
      id: config.id,
      name: config.name,
      status: 'idle',
      tasksCompleted: 0,
      tasksInQueue: 0,
      lastActivity: new Date(),
      healthCheck: true
    };
  }

  abstract execute(task: any): Promise<any>;

  protected abstract getSystemPrompt(): string;

  async processTask(task: any): Promise<any> {
    this.updateStatus('working', `Processing: ${task.type}`);
    
    try {
      const result = await this.execute(task);
      this.status.tasksCompleted++;
      this.updateStatus('idle');
      this.emit('task-completed', { task, result });
      return result;
    } catch (error) {
      this.updateStatus('error', error.message);
      this.emit('task-error', { task, error });
      throw error;
    }
  }

  async sendMessage(message: AgentMessage): Promise<void> {
    this.emit('message', message);
  }

  protected updateStatus(status: AgentStatus['status'], currentTask?: string): void {
    this.status.status = status;
    this.status.currentTask = currentTask;
    this.status.lastActivity = new Date();
    this.status.tasksInQueue = this.taskQueue.length;
    this.emit('status-update', this.status);
  }

  getStatus(): AgentStatus {
    return { ...this.status };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Basic LLM connectivity test
      await this.llmProvider.generate("Health check", {});
      this.status.healthCheck = true;
      return true;
    } catch {
      this.status.healthCheck = false;
      return false;
    }
  }
}
