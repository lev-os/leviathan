/**
 * Simplified Claude Code Adapter
 * Clean implementation without backwards compatibility
 */

import { TaskAdapter } from './task-adapter.js';
import { WorkspaceService } from '../../application/workspace-service.js';

export class ClaudeCodeAdapter {
  constructor() {
    this.workspaceService = new WorkspaceService();
    this.taskAdapter = new TaskAdapter(this.workspaceService);
  }
  
  // Task operations delegate to TaskAdapter
  async createTask(params) {
    return await this.taskAdapter.createTask(params);
  }
  
  async getTaskFiles(taskId) {
    return await this.taskAdapter.getTaskFiles(taskId);
  }
  
  async getTaskMetadata(taskId) {
    return await this.taskAdapter.getTaskMetadata(taskId);
  }
  
  async getTaskContent(taskId) {
    return await this.taskAdapter.getTaskContent(taskId);
  }
  
  async getTaskHandler(taskId) {
    return await this.taskAdapter.getTaskHandler(taskId);
  }
  
  async getTaskWorkflow(taskId) {
    return await this.taskAdapter.getTaskWorkflow(taskId);
  }
  
  async getTaskDependencies(taskId) {
    return await this.taskAdapter.getTaskDependencies(taskId);
  }
  
  // Workspace operations
  async createWorkspace(name, path, description) {
    return await this.workspaceService.createWorkspace(name, path, description);
  }
  
  async getWorkspace(name) {
    return await this.workspaceService.getWorkspace(name);
  }
  
  // Context operations (to be implemented with Universal Context)
  async loadContext(name) {
    // Placeholder for context loading
    return { name, loaded: true };
  }
  
  async resolveContext(name) {
    // Placeholder for context resolution
    return { name, resolved: true };
  }
  
  // Memory operations (to be implemented with Memory MVP)
  memory = {
    search: async (query) => {
      // Placeholder for memory search
      return { query, results: [] };
    },
    
    store: async (data) => {
      // Placeholder for memory storage
      return { stored: true, id: Date.now() };
    }
  };
}