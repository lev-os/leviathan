/**
 * Application Service: Workspace Management
 * Orchestrates domain logic using ports
 */

import { Workspace, Project } from '../domain/workspace.js';
import { Task } from '../domain/task.js';

export class WorkspaceService {
  constructor(persistencePort, agentCommPort, contextCapturePort = null) {
    this.persistence = persistencePort;
    this.agentComm = agentCommPort;
    this.contextCapture = contextCapturePort;
    this.currentWorkspace = null;
    this.currentProject = null;
  }

  // Workspace operations
  async createWorkspace(name, path, description = '') {
    if (!Workspace.isValidName(name)) {
      throw new Error('Invalid workspace name');
    }

    const workspace = new Workspace(name, path, description);
    await this.persistence.saveWorkspace(workspace);
    
    return workspace;
  }

  async listWorkspaces() {
    return await this.persistence.listWorkspaces();
  }

  async setActiveWorkspace(name) {
    const workspace = await this.persistence.loadWorkspace(name);
    if (!workspace) {
      throw new Error(`Workspace '${name}' not found`);
    }
    this.currentWorkspace = workspace;
    return workspace;
  }

  async deleteWorkspace(name) {
    const workspace = await this.persistence.loadWorkspace(name);
    if (!workspace) {
      throw new Error(`Workspace '${name}' not found`);
    }
    await this.persistence.deleteWorkspace(name);
    
    // Clear current workspace if it was deleted
    if (this.currentWorkspace?.name === name) {
      this.currentWorkspace = null;
    }
    
    return true;
  }

  // Project operations  
  async createProject(workspaceName, projectName, description = '', path = '') {
    if (!Project.isValidName(projectName)) {
      throw new Error('Invalid project name');
    }

    const workspace = await this.persistence.loadWorkspace(workspaceName);
    if (!workspace) {
      throw new Error(`Workspace '${workspaceName}' not found`);
    }

    const project = new Project(projectName, workspaceName, description, path);
    workspace.addProject(project);
    
    await this.persistence.saveWorkspace(workspace);
    await this.persistence.saveProject(project);
    
    return project;
  }

  async listProjects(workspaceName) {
    const workspace = await this.persistence.loadWorkspace(workspaceName);
    if (!workspace) {
      throw new Error(`Workspace '${workspaceName}' not found`);
    }
    
    return Array.from(workspace.projects.values());
  }

  // Task operations
  async createTask(projectName, title, description, context = {}) {
    // Validate project exists
    const project = await this.persistence.loadProject(projectName);
    if (!project) {
      throw new Error(`Project '${projectName}' not found`);
    }
    
    const task = new Task(title, description, projectName);
    task.addContext('created_context', context);
    
    await this.persistence.saveTask(task);
    return task;
  }

  async createEnhancedTask(projectName, title, description, contextData = {}) {
    const task = new Task(title, description, projectName);
    
    // Add enhanced context capture
    const timestamp = new Date().toISOString();
    
    // Session context
    if (contextData.sessionContext) {
      task.addContext('session_context', {
        captured_at: timestamp,
        ...contextData.sessionContext
      });
    }
    
    // File context
    if (contextData.files && contextData.files.length > 0) {
      task.addContext('files_context', {
        captured_at: timestamp,
        related_files: contextData.files,
        file_count: contextData.files.length
      });
    }
    
    // Command context
    if (contextData.commands && contextData.commands.length > 0) {
      task.addContext('commands_context', {
        captured_at: timestamp,
        recent_commands: contextData.commands,
        command_count: contextData.commands.length
      });
    }
    
    // Conversation context
    if (contextData.conversation) {
      task.addContext('conversation_context', {
        captured_at: timestamp,
        conversation_summary: contextData.conversation,
        conversation_length: contextData.conversation.length
      });
    }
    
    // Add metadata about context capture
    task.addContext('capture_metadata', {
      captured_at: timestamp,
      context_types: Object.keys(contextData).filter(key => contextData[key] && 
        (Array.isArray(contextData[key]) ? contextData[key].length > 0 : true)),
      enhanced_creation: true
    });
    
    await this.persistence.saveTask(task);
    return task;
  }

  async getTaskContext(taskId) {
    const task = await this.persistence.loadTask(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    return {
      taskId: task.id,
      title: task.title,
      description: task.description,
      project: task.project,
      status: task.status,
      confidence: task.confidence,
      context: task.context,
      created: task.created,
      updated: task.updated
    };
  }

  async assessTaskConfidence(taskId, confidence, factors = [], reasoning = '') {
    const task = await this.persistence.loadTask(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    task.assessConfidence(confidence, factors, reasoning);
    await this.persistence.saveTask(task);
    
    return {
      task,
      shouldSplit: task.needsSplitting(),
      readyForExecution: task.isReadyForExecution()
    };
  }

  async splitTask(taskId, subtasks, reason = '') {
    const task = await this.persistence.loadTask(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    task.split(subtasks, reason);
    await this.persistence.saveTask(task);
    
    return task;
  }

  async executeTask(taskId, agent, approach = '') {
    const task = await this.persistence.loadTask(taskId);
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }

    if (!task.isReadyForExecution()) {
      throw new Error(`Task confidence too low: ${task.confidence} < ${Task.CONFIDENCE_THRESHOLD}`);
    }

    task.execute(agent, approach);
    await this.persistence.saveTask(task);
    
    return task;
  }

  // Task relationship operations
  async addTaskDependency(taskId, dependsOnTaskId, reason = '') {
    const task = await this.persistence.loadTask(taskId);
    const dependsOnTask = await this.persistence.loadTask(dependsOnTaskId);
    
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }
    if (!dependsOnTask) {
      throw new Error(`Dependency task '${dependsOnTaskId}' not found`);
    }

    // Add blocked_by relationship to the dependent task
    task.addBlockedBy(dependsOnTaskId, reason);
    
    // Add blocks relationship to the blocking task
    dependsOnTask.addBlocks(taskId);
    
    // Save both tasks
    await this.persistence.saveTask(task);
    await this.persistence.saveTask(dependsOnTask);
    
    return {
      taskId,
      dependsOnTaskId,
      reason,
      created: new Date().toISOString()
    };
  }

  async addTaskRelation(taskId, relatedTaskId, relationshipType = 'related') {
    const task = await this.persistence.loadTask(taskId);
    const relatedTask = await this.persistence.loadTask(relatedTaskId);
    
    if (!task) {
      throw new Error(`Task '${taskId}' not found`);
    }
    if (!relatedTask) {
      throw new Error(`Related task '${relatedTaskId}' not found`);
    }

    // Add bidirectional relationships
    task.addRelatesTo(relatedTaskId, relationshipType);
    relatedTask.addRelatesTo(taskId, relationshipType);
    
    // Save both tasks
    await this.persistence.saveTask(task);
    await this.persistence.saveTask(relatedTask);
    
    return {
      taskId,
      relatedTaskId,
      relationshipType,
      created: new Date().toISOString()
    };
  }

  // Lazy mode: Save All This workflow
  async saveAllThis(options = {}) {
    const timestamp = new Date().toISOString();
    const autoGenerated = {};
    
    // Auto-generate project if not provided
    let projectName = options.project;
    if (!projectName && this.currentProject) {
      projectName = this.currentProject.name;
    } else if (!projectName) {
      projectName = 'default-project';
      autoGenerated.project = projectName;
    }
    
    // Auto-generate title if not provided
    let title = options.title;
    if (!title) {
      title = `Work session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      autoGenerated.title = title;
    }
    
    // Auto-generate description if not provided
    let description = options.description;
    if (!description) {
      description = `Auto-captured work session from ${timestamp}`;
      autoGenerated.description = description;
    }
    
    // Capture current context automatically if enabled
    const capturedContext = {};
    if (options.autoCapture !== false) {
      try {
        // Capture current workspace/project context
        const currentContext = await this.getCurrentContext();
        capturedContext.workspace_context = currentContext;
        
        // Capture working directory (would need access to process.cwd())
        capturedContext.working_directory = process.cwd ? process.cwd() : 'unknown';
        
        // Capture timestamp and session info
        capturedContext.session_info = {
          captured_at: timestamp,
          user_agent: 'kingly-agent',
          auto_captured: true
        };
        
      } catch (error) {
        console.warn('Failed to auto-capture some context:', error.message);
        capturedContext.capture_errors = [error.message];
      }
    }
    
    // Create the enhanced task
    const task = await this.createEnhancedTask(projectName, title, description, {
      sessionContext: capturedContext,
      files: [], // Could be enhanced to capture current files
      commands: [], // Could be enhanced to capture recent commands
      conversation: `Auto-saved work session at ${timestamp}`
    });
    
    return {
      task,
      capturedContext,
      autoGenerated
    };
  }

  // Context operations
  async getCurrentContext() {
    const context = {
      workspace: this.currentWorkspace?.name || null,
      project: this.currentProject?.name || null,
      workspaceDetails: null,
      projectDetails: null
    };

    if (this.currentWorkspace) {
      context.workspaceDetails = {
        name: this.currentWorkspace.name,
        path: this.currentWorkspace.path,
        description: this.currentWorkspace.description,
        projectCount: this.currentWorkspace.projects.size
      };
    }

    if (this.currentProject) {
      context.projectDetails = {
        name: this.currentProject.name,
        workspace: this.currentProject.workspace,
        description: this.currentProject.description,
        path: this.currentProject.path
      };
    }

    return context;
  }

  // Context capture protocol operations
  async captureCurrentContext(strategies = ['filesystem', 'git', 'environment']) {
    if (!this.contextCapture) {
      throw new Error('Context capture adapter not available');
    }
    
    const capturedContext = await this.contextCapture.captureContext(strategies);
    
    // Also include current kingly-agent context
    capturedContext.context.kingly = await this.getCurrentContext();
    
    return capturedContext;
  }

  async restoreContext(contextData) {
    if (!this.contextCapture) {
      throw new Error('Context capture adapter not available');
    }
    
    return await this.contextCapture.restoreContext(contextData);
  }
}