/**
 * MCP Adapter for Workflow Orchestrator
 * 
 * Provides MCP tools for bi-directional workflow orchestration
 * Integrates with Leviathan's MCP infrastructure
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowOrchestrator } from '../../core/workflow-orchestrator.js';

export class WorkflowMCP {
  constructor(options = {}) {
    this.orchestrator = new WorkflowOrchestrator({
      preserveOutputs: true,
      outputDir: options.outputDir || './.workflow-outputs',
      onEvent: this.handleOrchestratorEvent.bind(this)
    });
    
    this.contextPaths = options.contextPaths || [
      path.join(process.env.HOME || '', 'c'),
      path.join(process.cwd(), 'contexts')
    ];
    
    // Track active orchestrations for LLM callbacks
    this.activeOrchestrations = new Map();
    
    // LLM provider configuration
    this.llmProvider = options.llmProvider || this.createDefaultProvider();
  }

  /**
   * Get MCP tool definitions
   */
  getTools() {
    return [
      {
        name: 'workflow_execute',
        description: 'Execute a workflow with bi-directional orchestration',
        inputSchema: {
          type: 'object',
          properties: {
            workflow: {
              type: 'string',
              description: 'Workflow name or path'
            },
            input: {
              type: 'object',
              description: 'Input data for the workflow'
            },
            options: {
              type: 'object',
              properties: {
                parallel: { type: 'boolean' },
                timeout: { type: 'number' }
              }
            }
          },
          required: ['workflow', 'input']
        }
      },
      {
        name: 'workflow_list',
        description: 'List available workflows',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Filter by workflow type'
            },
            category: {
              type: 'string',
              description: 'Filter by category'
            }
          }
        }
      },
      {
        name: 'workflow_info',
        description: 'Get detailed information about a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflow: {
              type: 'string',
              description: 'Workflow name or ID'
            }
          },
          required: ['workflow']
        }
      },
      {
        name: 'workflow_callback',
        description: 'Handle LLM callback for active orchestration',
        inputSchema: {
          type: 'object',
          properties: {
            callbackId: {
              type: 'string',
              description: 'Callback ID from orchestration'
            },
            response: {
              type: 'object',
              description: 'LLM response data'
            }
          },
          required: ['callbackId', 'response']
        }
      },
      {
        name: 'workflow_status',
        description: 'Get status of active orchestrations',
        inputSchema: {
          type: 'object',
          properties: {
            orchestrationId: {
              type: 'string',
              description: 'Specific orchestration ID (optional)'
            }
          }
        }
      }
    ];
  }

  /**
   * Handle tool invocations
   */
  async handleTool(name, args) {
    switch (name) {
      case 'workflow_execute':
        return await this.executeWorkflow(args);
      
      case 'workflow_list':
        return await this.listWorkflows(args);
      
      case 'workflow_info':
        return await this.getWorkflowInfo(args);
      
      case 'workflow_callback':
        return await this.handleCallback(args);
      
      case 'workflow_status':
        return await this.getStatus(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow({ workflow, input, options = {} }) {
    try {
      // Load workflow
      const workflowData = await this.loadWorkflow(workflow);
      
      // Generate orchestration ID
      const orchestrationId = `orch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      // Track active orchestration
      this.activeOrchestrations.set(orchestrationId, {
        workflow: workflowData.metadata?.id || workflow,
        startTime: Date.now(),
        status: 'running',
        pendingCallbacks: new Map()
      });
      
      // Execute with orchestrator
      const result = await this.orchestrator.orchestrate(
        workflowData,
        input,
        orchestrationId
      );
      
      // Update status
      const orchestration = this.activeOrchestrations.get(orchestrationId);
      orchestration.status = result.success ? 'completed' : 'failed';
      orchestration.result = result;
      
      return {
        orchestrationId,
        success: result.success,
        workflow: result.workflow,
        duration: result.duration,
        outputs: result.outputs,
        summary: result.result?.summary,
        pendingCallbacks: Array.from(orchestration.pendingCallbacks.keys())
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List available workflows
   */
  async listWorkflows({ type, category } = {}) {
    const workflows = await this.discoverWorkflows();
    
    // Apply filters
    let filtered = workflows;
    if (type) {
      filtered = workflows.filter(w => w.type === type);
    }
    if (category) {
      filtered = workflows.filter(w => w.category === category);
    }
    
    // Group by category
    const grouped = {};
    for (const workflow of filtered) {
      const cat = workflow.category || 'uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id: workflow.id,
        description: workflow.description,
        type: workflow.type,
        steps: workflow.steps
      });
    }
    
    return {
      total: filtered.length,
      workflows: grouped
    };
  }

  /**
   * Get workflow information
   */
  async getWorkflowInfo({ workflow }) {
    try {
      const workflowData = await this.loadWorkflow(workflow);
      
      const info = {
        id: workflowData.metadata?.id,
        type: workflowData.metadata?.type,
        version: workflowData.metadata?.version,
        description: workflowData.metadata?.description,
        philosophy: workflowData.workflow_config?.philosophy,
        steps: this.extractSteps(workflowData),
        triggers: workflowData.workflow_config?.triggers,
        personalities: workflowData.workflow_config?.personality_system?.eeps_mapping
          ? Object.keys(workflowData.workflow_config.personality_system.eeps_mapping)
          : undefined
      };
      
      return info;
      
    } catch (error) {
      return {
        error: `Could not load workflow: ${error.message}`
      };
    }
  }

  /**
   * Handle LLM callback
   */
  async handleCallback({ callbackId, response }) {
    // Find orchestration with this callback
    for (const [orchId, orchestration] of this.activeOrchestrations) {
      if (orchestration.pendingCallbacks.has(callbackId)) {
        // Handle through orchestrator
        await this.orchestrator.handleLLMCallback(callbackId, response);
        
        // Remove from pending
        orchestration.pendingCallbacks.delete(callbackId);
        
        return {
          success: true,
          orchestrationId: orchId,
          remainingCallbacks: orchestration.pendingCallbacks.size
        };
      }
    }
    
    return {
      success: false,
      error: 'Callback ID not found in any active orchestration'
    };
  }

  /**
   * Get orchestration status
   */
  async getStatus({ orchestrationId } = {}) {
    if (orchestrationId) {
      const orchestration = this.activeOrchestrations.get(orchestrationId);
      if (!orchestration) {
        return { error: 'Orchestration not found' };
      }
      
      return {
        orchestrationId,
        workflow: orchestration.workflow,
        status: orchestration.status,
        duration: Date.now() - orchestration.startTime,
        pendingCallbacks: Array.from(orchestration.pendingCallbacks.keys()),
        result: orchestration.result
      };
    }
    
    // Return all active orchestrations
    const statuses = [];
    for (const [id, orchestration] of this.activeOrchestrations) {
      statuses.push({
        orchestrationId: id,
        workflow: orchestration.workflow,
        status: orchestration.status,
        duration: Date.now() - orchestration.startTime,
        pendingCallbacks: orchestration.pendingCallbacks.size
      });
    }
    
    return {
      active: statuses.filter(s => s.status === 'running'),
      completed: statuses.filter(s => s.status === 'completed'),
      failed: statuses.filter(s => s.status === 'failed')
    };
  }

  /**
   * Handle orchestrator events
   */
  handleOrchestratorEvent(event, data) {
    if (event === 'llm:inject') {
      // Track pending callback
      const orchestration = this.activeOrchestrations.get(data.orchestrationId);
      if (orchestration) {
        orchestration.pendingCallbacks.set(data.callbackId, {
          context: data.context,
          timestamp: Date.now()
        });
      }
      
      // If we have a real LLM provider, invoke it
      if (this.llmProvider) {
        this.invokeLLM(data.callbackId, data.context);
      }
    }
  }

  /**
   * Invoke LLM with context
   */
  async invokeLLM(callbackId, context) {
    try {
      const response = await this.llmProvider.invoke(context);
      await this.orchestrator.handleLLMCallback(callbackId, response);
    } catch (error) {
      console.error('LLM invocation failed:', error);
      // Let the orchestration timeout handle it
    }
  }

  /**
   * Create default LLM provider (simulation for now)
   */
  createDefaultProvider() {
    return {
      invoke: async (context) => {
        // Simulate LLM processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          output: `Processed: ${context.stepId}`,
          timestamp: new Date().toISOString()
        };
      }
    };
  }

  /**
   * Load workflow from various sources
   */
  async loadWorkflow(workflow) {
    // Try direct file path first
    if (workflow.endsWith('.yaml') || workflow.endsWith('.yml')) {
      const content = await fs.readFile(workflow, 'utf-8');
      return yaml.load(content);
    }
    
    // Search in context paths
    for (const contextPath of this.contextPaths) {
      const searchPaths = [
        path.join(contextPath, 'workflows', workflow, 'context.yaml'),
        path.join(contextPath, 'patterns', workflow, 'context.yaml'),
        path.join(contextPath, 'agents', workflow, 'context.yaml'),
        path.join(contextPath, workflow + '.yaml'),
        path.join(contextPath, workflow, 'context.yaml')
      ];
      
      for (const searchPath of searchPaths) {
        try {
          const content = await fs.readFile(searchPath, 'utf-8');
          return yaml.load(content);
        } catch (err) {
          // Continue searching
        }
      }
    }
    
    throw new Error(`Workflow not found: ${workflow}`);
  }

  /**
   * Discover available workflows
   */
  async discoverWorkflows() {
    const workflows = [];
    
    for (const contextPath of this.contextPaths) {
      try {
        const categories = ['workflows', 'patterns', 'agents'];
        
        for (const category of categories) {
          const categoryPath = path.join(contextPath, category);
          
          try {
            const entries = await fs.readdir(categoryPath, { withFileTypes: true });
            
            for (const entry of entries) {
              if (entry.isDirectory()) {
                try {
                  const workflowPath = path.join(categoryPath, entry.name, 'context.yaml');
                  const content = await fs.readFile(workflowPath, 'utf-8');
                  const data = yaml.load(content);
                  
                  workflows.push({
                    id: data.metadata?.id || entry.name,
                    type: data.metadata?.type || category.slice(0, -1),
                    category,
                    description: data.metadata?.description || '',
                    steps: this.extractSteps(data).length,
                    path: workflowPath
                  });
                } catch (err) {
                  // Skip invalid workflows
                }
              }
            }
          } catch (err) {
            // Skip missing categories
          }
        }
      } catch (err) {
        // Skip missing context paths
      }
    }
    
    return workflows;
  }

  /**
   * Extract steps from workflow data
   */
  extractSteps(workflow) {
    if (workflow.workflow_config?.steps) {
      return workflow.workflow_config.steps;
    }
    
    if (workflow.workflow_config?.analysis_rounds) {
      return Object.entries(workflow.workflow_config.analysis_rounds).map(([key, value]) => ({
        id: key,
        name: value.description || key
      }));
    }
    
    if (workflow.workflow_config?.tier_structure) {
      return Object.entries(workflow.workflow_config.tier_structure).map(([key, value]) => ({
        id: key,
        name: value.name || key
      }));
    }
    
    return [];
  }

  /**
   * Clean up old orchestrations
   */
  cleanup(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [id, orchestration] of this.activeOrchestrations) {
      if (now - orchestration.startTime > maxAge && orchestration.status !== 'running') {
        this.activeOrchestrations.delete(id);
      }
    }
  }
}

/**
 * Create MCP server configuration
 */
export function createMCPServer(options = {}) {
  const mcp = new WorkflowMCP(options);
  
  return {
    name: 'workflow-orchestrator',
    version: '1.0.0',
    description: 'Bi-directional workflow orchestration for Leviathan',
    tools: mcp.getTools(),
    handler: async (tool, args) => mcp.handleTool(tool, args)
  };
}