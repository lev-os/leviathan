/**
 * Leviathan-DX Plugin
 * Workspace/Project/Task organizational flavor for CoreSDK
 */

import { WorkspacePlugin } from './workspace.js';
import { ProjectPlugin } from './project.js';
import { TaskPlugin } from './task.js';
import { CoreSDK } from '../../sdk/core-sdk.js';

export class LeviathanDX {
  constructor() {
    this.sdk = new CoreSDK();
    this.setupPlugins();
  }

  setupPlugins() {
    // Register all leviathan-dx plugins
    this.sdk.registerPlugin(new WorkspacePlugin());
    this.sdk.registerPlugin(new ProjectPlugin());
    this.sdk.registerPlugin(new TaskPlugin());
  }

  // Workspace operations
  async createWorkspace(name, path, description = '') {
    return await this.sdk.createContext('workspace', {
      name,
      path, 
      description
    });
  }

  async listWorkspaces() {
    // TODO: Implement listing through memory adapter
    return [];
  }

  async getWorkspace(name) {
    // TODO: Implement retrieval through memory adapter
    return null;
  }

  // Project operations
  async createProject(workspaceName, projectName, description = '', path = '') {
    return await this.sdk.createContext('project', {
      name: projectName,
      workspace: workspaceName,
      description,
      path
    });
  }

  async listProjects(workspaceName) {
    // TODO: Implement listing through memory adapter
    return [];
  }

  async getProject(workspaceName, projectName) {
    // TODO: Implement retrieval through memory adapter
    return null;
  }

  // Task operations
  async createTask(projectName, title, description, context = {}) {
    return await this.sdk.createContext('task', {
      title,
      description,
      project: projectName,
      context
    });
  }

  async listTasks(projectName, status) {
    // TODO: Implement listing through memory adapter
    return [];
  }

  async getTask(taskId) {
    // TODO: Implement retrieval through memory adapter
    return null;
  }

  // Enhanced task operations
  async assessTaskConfidence(taskId, confidence, factors, reasoning) {
    // TODO: Implement confidence assessment
    return { taskId, confidence, shouldSplit: confidence < 0.8 };
  }

  async splitTask(taskId, subtasks, reason) {
    // TODO: Implement task splitting
    return { taskId, subtasks, reason };
  }

  // Context operations
  async getCurrentContext() {
    return {
      workspace: null,
      project: null,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance for easy usage
export const leviathan = new LeviathanDX();