/**
 * Claude Code Integration Module
 * High-level interface for Claude Code to interact with Kingly
 * Provides convenient methods and maintains bidirectional architecture
 */

import { createClaudeAdapter } from './infrastructure/dependency-injection.js';

export class ClaudeCodeIntegration {
  constructor(config = {}) {
    this.config = {
      kinglyPath: config.kinglyPath || './.kingly',
      agentsPath: config.agentsPath || './agents',
      ...config
    };
    
    this.adapter = createClaudeAdapter(this.config);
    this._contextStack = [];
  }

  // Workspace management with convenient interface
  async workspace(command, args = {}) {
    switch(command) {
      case 'create':
        return this.adapter.createWorkspace(args.name, args.path, args.description);
      
      case 'list':
        return this.adapter.listWorkspaces();
      
      case 'get':
        return this.adapter.getWorkspace(args.name);
      
      case 'activate':
      case 'use':
        return this.adapter.setActiveWorkspace(args.name);
      
      case 'delete':
        return this.adapter.deleteWorkspace(args.name);
      
      case 'current':
        const context = await this.adapter.getCurrentContext();
        return context.workspace;
      
      default:
        throw new Error(`Unknown workspace command: ${command}`);
    }
  }

  // Project management
  async project(command, args = {}) {
    switch(command) {
      case 'create':
        return this.adapter.createProject(
          args.workspace || (await this.getCurrentWorkspace()),
          args.name,
          args.description,
          args.path
        );
      
      case 'list':
        return this.adapter.listProjects(
          args.workspace || (await this.getCurrentWorkspace())
        );
      
      case 'get':
        return this.adapter.getProject(
          args.workspace || (await this.getCurrentWorkspace()),
          args.name
        );
      
      default:
        throw new Error(`Unknown project command: ${command}`);
    }
  }

  // Task management with confidence assessment
  async task(command, args = {}) {
    switch(command) {
      case 'create':
        if (args.files || args.commands || args.conversation) {
          return this.adapter.createEnhancedTask(
            args.project || (await this.getCurrentProject()),
            args.title,
            args.description,
            args.files,
            args.commands,
            args.conversation
          );
        }
        return this.adapter.createTask(
          args.project || (await this.getCurrentProject()),
          args.title,
          args.description,
          args.context
        );
      
      case 'assess':
        return this.adapter.assessTaskConfidence(
          args.taskId,
          args.confidence,
          args.factors,
          args.reasoning
        );
      
      case 'split':
        return this.adapter.splitTask(
          args.taskId,
          args.subtasks,
          args.reason
        );
      
      case 'execute':
        return this.adapter.executeTask(
          args.taskId,
          args.agent,
          args.approach
        );
      
      case 'get':
        return this.adapter.getTask(args.taskId);
      
      case 'list':
        return this.adapter.listTasks(
          args.project || (await this.getCurrentProject()),
          args.status
        );
      
      case 'relate':
        return this.adapter.addTaskRelation(
          args.taskId,
          args.relatedTaskId,
          args.relationType
        );
      
      case 'depend':
        return this.adapter.addTaskDependency(
          args.taskId,
          args.dependsOnTaskId,
          args.type
        );
      
      default:
        throw new Error(`Unknown task command: ${command}`);
    }
  }

  // Context management
  async context(command = 'get', args = {}) {
    switch(command) {
      case 'get':
      case 'current':
        return this.adapter.getCurrentContext();
      
      case 'capture':
      case 'save':
        const captured = await this.adapter.captureContext(args.description);
        this._contextStack.push(captured);
        return captured;
      
      case 'restore':
        return this.adapter.restoreContext(args.contextData || this._contextStack.pop());
      
      case 'stack':
        return this._contextStack;
      
      default:
        throw new Error(`Unknown context command: ${command}`);
    }
  }

  // Agent operations
  async agent(command, args = {}) {
    switch(command) {
      case 'route':
        return this.adapter.routeToAgent(args.agentUrl);
      
      case 'find':
      case 'best':
        return this.adapter.findBestAgent(args.request);
      
      default:
        throw new Error(`Unknown agent command: ${command}`);
    }
  }

  // Process management
  async process(command, args = {}) {
    switch(command) {
      case 'spawn':
      case 'run':
        return this.adapter.spawnProcess(args.command, args.options);
      
      case 'list':
        return this.adapter.listProcesses();
      
      default:
        throw new Error(`Unknown process command: ${command}`);
    }
  }

  // Helper methods
  async getCurrentWorkspace() {
    const context = await this.adapter.getCurrentContext();
    if (!context.workspace) {
      throw new Error('No active workspace');
    }
    return context.workspace;
  }

  async getCurrentProject() {
    const context = await this.adapter.getCurrentContext();
    if (!context.project) {
      throw new Error('No active project');
    }
    return context.project;
  }

  // Convenience method for common workflows
  async quickTask(title, description, options = {}) {
    // Ensure we have a workspace and project
    const context = await this.context();
    
    if (!context.workspace) {
      await this.workspace('create', {
        name: 'default',
        path: './default-workspace',
        description: 'Default workspace for quick tasks'
      });
      await this.workspace('activate', { name: 'default' });
    }
    
    if (!context.project) {
      await this.project('create', {
        name: 'quick-tasks',
        description: 'Quick task container'
      });
    }
    
    // Create the task
    return await this.task('create', {
      title,
      description,
      ...options
    });
  }

  // Batch operations for efficiency
  async batch(operations) {
    return this.adapter.batchOperation(operations);
  }

  // Get available operations (helpful for Claude)
  getCapabilities() {
    return {
      commands: {
        workspace: ['create', 'list', 'get', 'activate', 'use', 'delete', 'current'],
        project: ['create', 'list', 'get'],
        task: ['create', 'assess', 'split', 'execute', 'get', 'list', 'relate', 'depend'],
        context: ['get', 'current', 'capture', 'save', 'restore', 'stack'],
        agent: ['route', 'find', 'best'],
        process: ['spawn', 'run', 'list']
      },
      methods: this.adapter.getAvailableMethods(),
      features: [
        'Direct method calls (no MCP overhead)',
        'Automatic context management',
        'Batch operations',
        'Quick task creation',
        'Context stack for save/restore'
      ]
    };
  }
}

// Export convenience function
export function createClaudeIntegration(config) {
  return new ClaudeCodeIntegration(config);
}