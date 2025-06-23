/**
 * Kingly Agent MCP Server
 * LLM-first architecture with fast task/workspace management
 * Integrates agent-mcp functionality for production use
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { MCPToolHandlers } from './mcp-tool-handlers.js';

export class KinglyAgentMCP {
  constructor(config = {}) {
    this.config = {
      agentsPath: config.agentsPath || './agents',
      workspacePath: config.workspacePath || './.kingly',
      ...config
    };
    
    this.toolHandlers = new MCPToolHandlers(this.config);
    this.initialized = false;
    this.agentCache = new Map();
    this.hotReloadManager = null;
  }

  async initialize() {
    if (!this.initialized) {
      await this.toolHandlers.initialize();
      this.initialized = true;
    }
    return this;
  }

  // Agent Route Table for LLM
  async getRouteTable() {
    const agents = await this.loadAllAgents();
    const workflows = await this.loadWorkflows();
    
    return {
      agents: agents.map(agent => ({
        id: agent.metadata.id,
        name: agent.metadata.name,
        description: agent.metadata.description,
        tags: agent.tags,
        capabilities: agent.capabilities?.map(cap => ({
          id: cap.id,
          description: cap.description,
          patterns: cap.patterns
        })) || []
      })),
      workflows: workflows,
      routingGuidance: {
        instruction: "Route requests based on agent tags and capabilities. Create synthetic workflows for multi-step tasks.",
        complexity: "Use assess_task_confidence for each task. If confidence < 80%, use split_task to break into smaller pieces.",
        handoffs: "Use agent handoff patterns for sequential work.",
        confidenceThreshold: 0.8
      }
    };
  }

  // Task Management with Confidence Assessment
  async createTask(title, description, project, context) {
    await this.initialize();
    return await this.toolHandlers.handleCreateTask({
      title, description, project, context
    });
  }

  async assessTaskConfidence(taskId, confidence, factors, reasoning) {
    await this.initialize();
    return await this.toolHandlers.handleAssessTaskConfidence({
      taskId, confidence, factors, reasoning
    });
  }

  async splitTask(taskId, reason, subtasks, confidence) {
    await this.initialize();
    return await this.toolHandlers.handleSplitTask({
      taskId, reason, subtasks, confidence
    });
  }

  async executeTask(taskId, agent, approach) {
    await this.initialize();
    return await this.toolHandlers.handleExecuteTask({
      taskId, agent, approach
    });
  }

  // Memory Management
  async rememberContext(key, value, category) {
    await this.initialize();
    return await this.toolHandlers.handleRememberContext({ key, value, category });
  }

  async recallContext(key, category) {
    await this.initialize();
    return await this.toolHandlers.handleRecallContext({ key, category });
  }

  // Project Management
  async createProject(projectId, title, workingDirectory) {
    await this.initialize();
    return await this.toolHandlers.handleCreateProject({
      projectId, title, workingDirectory
    });
  }

  async createEnhancedTask(projectId, taskData) {
    await this.initialize();
    return await this.toolHandlers.handleCreateEnhancedTask({
      projectId, taskData
    });
  }

  // Workspace State
  async getWorkspaceState() {
    await this.initialize();
    return await this.toolHandlers.handleGetWorkspaceState();
  }

  async getTask(taskId) {
    await this.initialize();
    return await this.toolHandlers.handleGetTask({ taskId });
  }

  async listTasks(project, status) {
    await this.initialize();
    return await this.toolHandlers.handleListTasks({ project, status });
  }

  // Agent loading (preserved from original)
  async loadAllAgents() {
    const agentsDir = this.config.agentsPath;
    if (!await fs.pathExists(agentsDir)) {
      return [];
    }

    const files = await fs.readdir(agentsDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    
    const agents = [];
    for (const file of yamlFiles) {
      try {
        const agent = await this.loadAgent(path.basename(file, path.extname(file)));
        if (agent) agents.push(agent);
      } catch (error) {
        console.warn(`Failed to load agent ${file}:`, error.message);
      }
    }
    
    return agents;
  }

  async loadAgent(agentId) {
    const agentPath = path.join(this.config.agentsPath, `${agentId}.yaml`);
    if (!await fs.pathExists(agentPath)) {
      return null;
    }

    const content = await fs.readFile(agentPath, 'utf8');
    const agent = yaml.load(content);
    
    // Cache the agent for hot reload
    this.agentCache.set(agentId, agent);
    
    return agent;
  }
  
  // Hot reload support
  async reloadAgent(agentId, newDefinition) {
    console.log(`🔄 Reloading agent: ${agentId}`);
    
    // Update cache
    this.agentCache.set(agentId, newDefinition);
    
    // Notify tool handlers if they need to update
    if (this.toolHandlers.reloadAgent) {
      await this.toolHandlers.reloadAgent(agentId, newDefinition);
    }
    
    return { success: true, agentId };
  }
  
  async reloadModule(modulePath) {
    console.log(`📦 Reloading module: ${path.basename(modulePath)}`);
    
    // If it's a tool handler module, reload it
    if (modulePath.includes('mcp-tool-handlers')) {
      // Clear module cache
      delete require.cache[require.resolve(modulePath)];
      
      // Re-import with cache bust
      const bustCache = `?t=${Date.now()}`;
      const { MCPToolHandlers } = await import(`${modulePath}${bustCache}`);
      
      // Create new instance with existing config
      this.toolHandlers = new MCPToolHandlers(this.config);
      await this.toolHandlers.initialize();
      
      console.log('✅ Tool handlers reloaded');
    }
    
    return { success: true, module: path.basename(modulePath) };
  }
  
  // Enable hot reload
  enableHotReload(hotReloadManager) {
    this.hotReloadManager = hotReloadManager;
    console.log('🔥 Hot reload enabled for MCP server');
  }

  async loadWorkflows() {
    const workflowsDir = './workflows';
    if (!await fs.pathExists(workflowsDir)) {
      return [];
    }

    const files = await fs.readdir(workflowsDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml'));
    
    const workflows = [];
    for (const file of yamlFiles) {
      try {
        const content = await fs.readFile(path.join(workflowsDir, file), 'utf8');
        const workflow = yaml.load(content);
        workflows.push(workflow);
      } catch (error) {
        console.warn(`Failed to load workflow ${file}:`, error.message);
      }
    }
    
    return workflows;
  }

  // Get all MCP tool definitions
  getTools() {
    const baseTools = [
      {
        name: "get_route_table",
        description: "Get available agents, their capabilities, and routing guidance for request routing",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ];

    // Combine with task management tools
    return [...baseTools, ...this.toolHandlers.getToolDefinitions()];
  }

  // Route tool calls to appropriate handlers
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'get_route_table':
        return await this.getRouteTable();
      
      // Task Management Tools
      case 'create_task':
        return await this.toolHandlers.handleCreateTask(args);
      case 'assess_task_confidence':
        return await this.toolHandlers.handleAssessTaskConfidence(args);
      case 'split_task':
        return await this.toolHandlers.handleSplitTask(args);
      case 'execute_task':
        return await this.toolHandlers.handleExecuteTask(args);
      case 'get_task':
        return await this.toolHandlers.handleGetTask(args);
      case 'list_tasks':
        return await this.toolHandlers.handleListTasks(args);
      
      // Memory Management Tools
      case 'remember_context':
        return await this.toolHandlers.handleRememberContext(args);
      case 'recall_context':
        return await this.toolHandlers.handleRecallContext(args);
      case 'list_memories':
        return await this.toolHandlers.handleListMemories(args);
      
      // Project Management Tools
      case 'create_project':
        return await this.toolHandlers.handleCreateProject(args);
      case 'list_projects':
        return await this.toolHandlers.handleListProjects(args);
      case 'get_project':
        return await this.toolHandlers.handleGetProject(args);
      case 'create_enhanced_task':
        return await this.toolHandlers.handleCreateEnhancedTask(args);
      
      // Workspace & Project Management Tools
      case 'create_workspace':
        return await this.toolHandlers.handleCreateWorkspace(args);
      case 'list_workspaces':
        return await this.toolHandlers.handleDiscoverWorkspaces(args);
      case 'set_workspace':
        return await this.toolHandlers.handleSetWorkspace(args);
      case 'create_project':
        return await this.toolHandlers.handleCreateProject(args);
      case 'discover_projects':
        return await this.toolHandlers.handleDiscoverProjects(args);
      case 'set_project':
        return await this.toolHandlers.handleSetProject(args);
      case 'get_current_context':
        return await this.toolHandlers.handleGetCurrentContext(args);
      case 'get_workspace_state':
        return await this.toolHandlers.handleGetWorkspaceState(args);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}