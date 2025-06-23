/**
 * Claude Code Direct Adapter
 * Bypasses MCP protocol overhead for direct method calls
 * Implements WorkspaceManagementPort for Claude Code integration
 */

import { WorkspaceManagementPort } from '../../ports/workspace-management.js';

export class ClaudeCodeAdapter extends WorkspaceManagementPort {
  constructor(workspaceService, backgroundExec, agentComm, contextCapture) {
    super();
    this.workspaceService = workspaceService;
    this.backgroundExec = backgroundExec;
    this.agentComm = agentComm;
    this.contextCapture = contextCapture;
  }

  // Direct workspace operations - no protocol translation needed
  async createWorkspace(name, path, description) {
    return await this.workspaceService.createWorkspace(name, path, description);
  }

  async listWorkspaces() {
    return await this.workspaceService.listWorkspaces();
  }

  async getWorkspace(name) {
    return await this.workspaceService.getWorkspace(name);
  }

  async setActiveWorkspace(name) {
    return await this.workspaceService.setActiveWorkspace(name);
  }

  async deleteWorkspace(name) {
    return await this.workspaceService.deleteWorkspace(name);
  }

  // Direct project operations
  async createProject(workspaceName, projectName, description, path) {
    return await this.workspaceService.createProject(
      workspaceName, 
      projectName, 
      description, 
      path
    );
  }

  async listProjects(workspaceName) {
    return await this.workspaceService.listProjects(workspaceName);
  }

  async getProject(workspaceName, projectName) {
    return await this.workspaceService.getProject(workspaceName, projectName);
  }

  // Direct task operations
  async createTask(projectName, title, description, context) {
    return await this.workspaceService.createTask(
      projectName, 
      title, 
      description, 
      context
    );
  }

  async createEnhancedTask(projectName, title, description, files, commands, conversation) {
    const context = {
      files: files || [],
      commands: commands || [],
      conversation: conversation || '',
      timestamp: new Date().toISOString()
    };
    
    return await this.workspaceService.createTask(
      projectName, 
      title, 
      description, 
      context
    );
  }

  async assessTaskConfidence(taskId, confidence, factors, reasoning) {
    return await this.workspaceService.assessTaskConfidence(
      taskId, 
      confidence, 
      factors, 
      reasoning
    );
  }

  async splitTask(taskId, subtasks, reason) {
    return await this.workspaceService.splitTask(taskId, subtasks, reason);
  }

  async executeTask(taskId, agent, approach) {
    return await this.workspaceService.executeTask(taskId, agent, approach);
  }

  async getTask(taskId) {
    return await this.workspaceService.getTask(taskId);
  }

  async listTasks(projectName, status) {
    return await this.workspaceService.listTasks(projectName, status);
  }

  // Context operations
  async getCurrentContext() {
    return await this.workspaceService.getCurrentContext();
  }

  async captureContext(description) {
    if (!this.contextCapture) {
      throw new Error('Context capture not configured');
    }
    
    const context = await this.workspaceService.getCurrentContext();
    return await this.contextCapture.captureContext({
      ...context,
      description,
      timestamp: new Date().toISOString()
    });
  }

  async restoreContext(contextData) {
    if (!this.contextCapture) {
      throw new Error('Context capture not configured');
    }
    
    return await this.contextCapture.restoreContext(contextData);
  }

  // Task relationship operations
  async addTaskDependency(taskId, dependsOnTaskId, type = 'blocks') {
    return await this.workspaceService.addTaskDependency(
      taskId, 
      dependsOnTaskId, 
      type
    );
  }

  async addTaskRelation(taskId, relatedTaskId, relationType) {
    return await this.workspaceService.addTaskRelation(
      taskId, 
      relatedTaskId, 
      relationType
    );
  }

  // Agent communication (if needed)
  async routeToAgent(agentUrl) {
    return await this.agentComm.routeToAgent(agentUrl);
  }

  async findBestAgent(request) {
    return await this.agentComm.findBestAgent(request);
  }

  // Background execution (if needed)
  async spawnProcess(command, options) {
    return await this.backgroundExec.spawn(command, options);
  }

  async listProcesses() {
    return await this.backgroundExec.list();
  }

  // Convenience method for batch operations
  async batchOperation(operations) {
    const results = [];
    for (const op of operations) {
      try {
        const result = await this[op.method](...op.args);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  // Get method metadata (useful for Claude to understand available operations)
  getAvailableMethods() {
    return {
      workspace: [
        'createWorkspace', 'listWorkspaces', 'getWorkspace', 
        'setActiveWorkspace', 'deleteWorkspace'
      ],
      project: [
        'createProject', 'listProjects', 'getProject'
      ],
      task: [
        'createTask', 'createEnhancedTask', 'assessTaskConfidence',
        'splitTask', 'executeTask', 'getTask', 'listTasks',
        'addTaskDependency', 'addTaskRelation'
      ],
      context: [
        'getCurrentContext', 'captureContext', 'restoreContext'
      ],
      agent: [
        'routeToAgent', 'findBestAgent'
      ],
      process: [
        'spawnProcess', 'listProcesses'
      ]
    };
  }
}