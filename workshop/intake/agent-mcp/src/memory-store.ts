import fs from 'fs/promises';
import path from 'path';
import { Memory } from './types.js';

export class MemoryStore {
  private memoryPath: string;
  private memory: Map<string, Memory>;

  constructor() {
    const projectRoot = process.env.PROJECT_ROOT || '../';
    this.memoryPath = path.join(process.cwd(), projectRoot, '.memory.json');
    this.memory = new Map();
    this.loadMemory();
  }

  async remember(key: string, value: any, category?: string): Promise<void> {
    const memoryKey = category ? `${category}:${key}` : key;
    this.memory.set(memoryKey, {
      value,
      timestamp: new Date().toISOString(),
      category
    });
    await this.saveMemory();
  }

  async recall(key: string, category?: string): Promise<any> {
    const memoryKey = category ? `${category}:${key}` : key;
    const memory = this.memory.get(memoryKey);
    return memory?.value;
  }

  async getAllMemories(category?: string): Promise<Record<string, Memory>> {
    const memories: Record<string, Memory> = {};
    
    for (const [key, memory] of this.memory.entries()) {
      if (!category || memory.category === category) {
        memories[key] = memory;
      }
    }
    
    return memories;
  }

  async forgetMemory(key: string, category?: string): Promise<boolean> {
    const memoryKey = category ? `${category}:${key}` : key;
    const deleted = this.memory.delete(memoryKey);
    if (deleted) {
      await this.saveMemory();
    }
    return deleted;
  }

  private async loadMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryPath, 'utf-8');
      const memories = JSON.parse(data);
      this.memory = new Map(Object.entries(memories));
    } catch (error) {
      this.memory = new Map();
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      const memories = Object.fromEntries(this.memory.entries());
      await fs.writeFile(this.memoryPath, JSON.stringify(memories, null, 2));
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }
}
