/**
 * Claude Direct Adapter
 * Test harness - bypasses MCP protocol for direct method calls  
 * Uses KinglyDX plugin system for workspace/project/task operations
 */

import { kinglydx } from '../plugins/kingly-dx/index.js';

export class ClaudeDirectAdapter {
  constructor() {
    this.kinglydx = kinglydx;
  }

  // ===== WORKSPACE OPERATIONS =====
  
  async createWorkspace(name, path, description = '') {
    try {
      const workspace = await this.kinglydx.createWorkspace(name, path, description);
      return {
        success: true,
        workspace,
        message: `Workspace '${name}' created successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create workspace '${name}'`
      };
    }
  }

  async listWorkspaces() {
    try {
      const workspaces = await this.kinglydx.listWorkspaces();
      return {
        success: true,
        workspaces,
        count: workspaces.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        workspaces: []
      };
    }
  }

  async getWorkspace(name) {
    try {
      const workspace = await this.kinglydx.getWorkspace(name);
      if (!workspace) {
        return {
          success: false,
          message: `Workspace '${name}' not found`
        };
      }
      return {
        success: true,
        workspace
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== PROJECT OPERATIONS =====

  async createProject(workspaceName, projectName, description = '', path = '') {
    try {
      const project = await this.kinglydx.createProject(workspaceName, projectName, description, path);
      return {
        success: true,
        project,
        message: `Project '${projectName}' created in workspace '${workspaceName}'`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create project '${projectName}'`
      };
    }
  }

  async listProjects(workspaceName) {
    try {
      const projects = await this.kinglydx.listProjects(workspaceName);
      return {
        success: true,
        projects,
        count: projects.length,
        workspace: workspaceName
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        projects: []
      };
    }
  }

  async getProject(workspaceName, projectName) {
    try {
      const project = await this.kinglydx.getProject(workspaceName, projectName);
      if (!project) {
        return {
          success: false,
          message: `Project '${projectName}' not found in workspace '${workspaceName}'`
        };
      }
      return {
        success: true,
        project
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== TASK OPERATIONS =====

  async createTask(projectName, title, description, context = {}) {
    try {
      const task = await this.kinglydx.createTask(projectName, title, description, context);
      return {
        success: true,
        task,
        message: `Task '${title}' created in project '${projectName}'`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create task '${title}'`
      };
    }
  }

  async listTasks(projectName, status = null) {
    try {
      const tasks = await this.kinglydx.listTasks(projectName, status);
      return {
        success: true,
        tasks,
        count: tasks.length,
        project: projectName,
        filter: status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tasks: []
      };
    }
  }

  async getTask(taskId) {
    try {
      const task = await this.kinglydx.getTask(taskId);
      if (!task) {
        return {
          success: false,
          message: `Task '${taskId}' not found`
        };
      }
      return {
        success: true,
        task
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async assessTaskConfidence(taskId, confidence, factors = [], reasoning = '') {
    try {
      const assessment = await this.kinglydx.assessTaskConfidence(taskId, confidence, factors, reasoning);
      return {
        success: true,
        assessment,
        message: `Task confidence assessed: ${confidence}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async splitTask(taskId, subtasks, reason = '') {
    try {
      const splitResult = await this.kinglydx.splitTask(taskId, subtasks, reason);
      return {
        success: true,
        splitResult,
        message: `Task split into ${subtasks.length} subtasks`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== CONTEXT OPERATIONS =====

  async getCurrentContext() {
    try {
      const context = await this.kinglydx.getCurrentContext();
      return {
        success: true,
        context
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: null
      };
    }
  }

  // ===== UTILITY OPERATIONS =====

  async getAvailableMethods() {
    return {
      workspace: [
        'createWorkspace', 'listWorkspaces', 'getWorkspace'
      ],
      project: [
        'createProject', 'listProjects', 'getProject'
      ],
      task: [
        'createTask', 'listTasks', 'getTask', 
        'assessTaskConfidence', 'splitTask'
      ],
      context: [
        'getCurrentContext'
      ]
    };
  }

  async getSystemInfo() {
    return {
      adapter: 'Claude Direct Adapter',
      version: '2.0.0',
      engine: 'CoreSDK + KinglyDX Plugin',
      timestamp: new Date().toISOString(),
      capabilities: [
        'workspace_management',
        'project_management', 
        'task_management',
        'confidence_assessment',
        'task_splitting',
        'context_tracking'
      ]
    };
  }
}