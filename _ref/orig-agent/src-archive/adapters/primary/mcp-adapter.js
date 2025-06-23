/**
 * MCP Adapter
 * Implements WorkspaceManagementPort for MCP protocol
 * Translates MCP tool calls to business logic calls
 */

import { WorkspaceManagementPort } from '../../ports/workspace-management.js';

export class MCPAdapter extends WorkspaceManagementPort {
  constructor(workspaceService, backgroundExec, agentComm) {
    super();
    this.workspaceService = workspaceService;
    this.backgroundExec = backgroundExec;
    this.agentComm = agentComm;
  }

  // MCP Tool Definitions
  getTools() {
    return [
      {
        name: 'create_workspace',
        description: 'Create a new workspace for organizing projects',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workspace name' },
            path: { type: 'string', description: 'Base directory path' },
            description: { type: 'string', description: 'Optional description' }
          },
          required: ['name', 'path']
        }
      },
      {
        name: 'list_workspaces',
        description: 'List all available workspaces',
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'delete_workspace',
        description: 'Delete a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workspace name to delete' }
          },
          required: ['name']
        }
      },
      {
        name: 'create_task',
        description: 'Create a new task',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Project name' },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            context: { type: 'object', description: 'Additional context' }
          },
          required: ['project', 'title', 'description']
        }
      },
      {
        name: 'assess_task_confidence',
        description: 'Assess confidence level for task completion',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'Task ID' },
            confidence: { type: 'number', description: 'Confidence 0-1' },
            factors: { type: 'array', description: 'Contributing factors' },
            reasoning: { type: 'string', description: 'Assessment reasoning' }
          },
          required: ['taskId', 'confidence']
        }
      },
      {
        name: 'create_project',
        description: 'Create a new project within a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: { type: 'string', description: 'Workspace name' },
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description' },
            path: { type: 'string', description: 'Project path (optional)' }
          },
          required: ['workspace', 'name', 'description']
        }
      },
      {
        name: 'list_projects',
        description: 'List all projects in a workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspace: { type: 'string', description: 'Workspace name' }
          },
          required: ['workspace']
        }
      },
      {
        name: 'set_active_workspace',
        description: 'Set the active workspace context',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workspace name to activate' }
          },
          required: ['name']
        }
      },
      {
        name: 'get_current_context',
        description: 'Get current workspace and project context',
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'create_enhanced_task',
        description: 'Create a task with automatic context capture from current session',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Project name' },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            sessionContext: { type: 'object', description: 'Current session context to capture' },
            files: { type: 'array', description: 'Related files paths' },
            commands: { type: 'array', description: 'Recent commands executed' },
            conversation: { type: 'string', description: 'Conversation summary' }
          },
          required: ['project', 'title', 'description']
        }
      },
      {
        name: 'get_task_context',
        description: 'Retrieve full context for a task including captured session data',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'Task ID to retrieve context for' }
          },
          required: ['taskId']
        }
      },
      {
        name: 'save_all_this',
        description: 'Save everything from current context as a new task - lazy mode workflow',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title (optional, will auto-generate if not provided)' },
            project: { type: 'string', description: 'Project name (optional, will use current or default)' },
            description: { type: 'string', description: 'Task description (optional, will auto-generate)' },
            autoCapture: { type: 'boolean', description: 'Auto-capture current directory, files, and session', default: true }
          },
          required: []
        }
      },
      {
        name: 'add_task_dependency',
        description: 'Add a dependency relationship between tasks',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'Task that will be blocked' },
            dependsOnTaskId: { type: 'string', description: 'Task that must complete first' },
            reason: { type: 'string', description: 'Reason for the dependency' }
          },
          required: ['taskId', 'dependsOnTaskId']
        }
      },
      {
        name: 'add_task_relation',
        description: 'Add a general relationship between tasks (not a blocking dependency)',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'First task' },
            relatedTaskId: { type: 'string', description: 'Related task' },
            relationshipType: { type: 'string', description: 'Type of relationship (e.g., "similar", "follows", "alternative")' }
          },
          required: ['taskId', 'relatedTaskId']
        }
      },
      {
        name: 'capture_current_context',
        description: 'Capture current work context using the context capture protocol',
        inputSchema: {
          type: 'object',
          properties: {
            strategies: { 
              type: 'array', 
              description: 'Context capture strategies to use',
              items: { type: 'string' },
              default: ['filesystem', 'git', 'environment']
            }
          },
          required: []
        }
      },
      {
        name: 'restore_context',
        description: 'Analyze and potentially restore a previously captured context',
        inputSchema: {
          type: 'object',
          properties: {
            contextData: { type: 'object', description: 'Previously captured context data' }
          },
          required: ['contextData']
        }
      },
      // Add more tools as needed...
    ];
  }

  // MCP Tool Call Routing
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'create_workspace':
        return await this.handleCreateWorkspace(args);
      case 'list_workspaces':
        return await this.handleListWorkspaces(args);
      case 'delete_workspace':
        return await this.handleDeleteWorkspace(args);
      case 'create_task':
        return await this.handleCreateTask(args);
      case 'assess_task_confidence':
        return await this.handleAssessTaskConfidence(args);
      case 'create_project':
        return await this.handleCreateProject(args);
      case 'list_projects':
        return await this.handleListProjects(args);
      case 'set_active_workspace':
        return await this.handleSetActiveWorkspace(args);
      case 'get_current_context':
        return await this.handleGetCurrentContext(args);
      case 'create_enhanced_task':
        return await this.handleCreateEnhancedTask(args);
      case 'get_task_context':
        return await this.handleGetTaskContext(args);
      case 'save_all_this':
        return await this.handleSaveAllThis(args);
      case 'add_task_dependency':
        return await this.handleAddTaskDependency(args);
      case 'add_task_relation':
        return await this.handleAddTaskRelation(args);
      case 'capture_current_context':
        return await this.handleCaptureCurrentContext(args);
      case 'restore_context':
        return await this.handleRestoreContext(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Tool Handler Methods
  async handleCreateWorkspace(args) {
    const workspace = await this.workspaceService.createWorkspace(
      args.name, 
      args.path, 
      args.description
    );
    return {
      message: `✅ Created workspace: ${workspace.name}`,
      workspace: workspace
    };
  }

  async handleListWorkspaces(args) {
    const workspaces = await this.workspaceService.listWorkspaces();
    return {
      message: `📋 Found ${workspaces.length} workspaces`,
      workspaces: workspaces
    };
  }

  async handleDeleteWorkspace(args) {
    await this.workspaceService.deleteWorkspace(args.name);
    return {
      message: `🗑️ Deleted workspace: ${args.name}`
    };
  }

  async handleCreateTask(args) {
    const task = await this.workspaceService.createTask(
      args.project,
      args.title,
      args.description,
      args.context
    );
    return {
      message: `✅ Created task: ${task.title}`,
      task: task
    };
  }

  async handleAssessTaskConfidence(args) {
    const result = await this.workspaceService.assessTaskConfidence(
      args.taskId,
      args.confidence,
      args.factors,
      args.reasoning
    );
    return {
      message: `🎯 Task confidence assessed: ${result.task.confidence}`,
      ...result
    };
  }

  async handleCreateProject(args) {
    const project = await this.workspaceService.createProject(
      args.workspace,
      args.name,
      args.description,
      args.path
    );
    return {
      message: `🚀 Created project: ${project.name} in workspace ${args.workspace}`,
      project: project
    };
  }

  async handleListProjects(args) {
    const projects = await this.workspaceService.listProjects(args.workspace);
    return {
      message: `📦 Found ${projects.length} projects in workspace ${args.workspace}`,
      projects: projects
    };
  }

  async handleSetActiveWorkspace(args) {
    await this.workspaceService.setActiveWorkspace(args.name);
    return {
      message: `🔄 Set active workspace: ${args.name}`,
      activeWorkspace: args.name
    };
  }

  async handleGetCurrentContext(args) {
    const context = await this.workspaceService.getCurrentContext();
    return {
      message: `📍 Current context retrieved`,
      context: context
    };
  }

  async handleCreateEnhancedTask(args) {
    const task = await this.workspaceService.createEnhancedTask(
      args.project,
      args.title,
      args.description,
      {
        sessionContext: args.sessionContext || {},
        files: args.files || [],
        commands: args.commands || [],
        conversation: args.conversation || ''
      }
    );
    return {
      message: `🚀 Created enhanced task: ${task.title} with captured context`,
      task: task,
      contextCaptured: {
        files: args.files?.length || 0,
        commands: args.commands?.length || 0,
        hasConversation: !!args.conversation
      }
    };
  }

  async handleGetTaskContext(args) {
    const context = await this.workspaceService.getTaskContext(args.taskId);
    return {
      message: `📋 Retrieved context for task: ${args.taskId}`,
      taskContext: context
    };
  }

  async handleSaveAllThis(args) {
    const result = await this.workspaceService.saveAllThis({
      title: args.title,
      project: args.project,
      description: args.description,
      autoCapture: args.autoCapture !== false // defaults to true
    });
    
    return {
      message: `💾 Saved current context as task: ${result.task.title}`,
      task: result.task,
      capturedContext: result.capturedContext,
      autoGenerated: result.autoGenerated
    };
  }

  async handleAddTaskDependency(args) {
    const result = await this.workspaceService.addTaskDependency(
      args.taskId,
      args.dependsOnTaskId,
      args.reason
    );
    return {
      message: `🔗 Added dependency: ${args.taskId} depends on ${args.dependsOnTaskId}`,
      dependency: result
    };
  }

  async handleAddTaskRelation(args) {
    const result = await this.workspaceService.addTaskRelation(
      args.taskId,
      args.relatedTaskId,
      args.relationshipType || 'related'
    );
    return {
      message: `🔗 Added relationship: ${args.taskId} relates to ${args.relatedTaskId}`,
      relationship: result
    };
  }

  async handleCaptureCurrentContext(args) {
    const context = await this.workspaceService.captureCurrentContext(
      args.strategies || ['filesystem', 'git', 'environment']
    );
    return {
      message: `📷 Captured current context using ${context.strategies_used.length} strategies`,
      capturedContext: context
    };
  }

  async handleRestoreContext(args) {
    const restoration = await this.workspaceService.restoreContext(args.contextData);
    return {
      message: `🔄 Analyzed context restoration capabilities`,
      restoration: restoration
    };
  }
}