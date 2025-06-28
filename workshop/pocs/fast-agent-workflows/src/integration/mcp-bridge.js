/**
 * MCP Bridge
 * 
 * Bridges fast-agent workflows to Leviathan's MCP tool system.
 * Exposes workflows as callable MCP tools.
 */

export class MCPBridge {
  constructor() {
    this.tools = new Map();
  }
  
  /**
   * Create MCP tools from workflow definitions
   */
  createWorkflowTools(workflows) {
    const tools = {};
    
    // Chain workflow tool
    tools['workflow_chain'] = {
      description: 'Execute agents in sequence, passing output between them',
      parameters: {
        sequence: {
          type: 'array',
          description: 'Array of agent names to execute in order',
          required: true
        },
        agents: {
          type: 'object',
          description: 'Agent configurations keyed by name',
          required: true
        }
      },
      handler: async (params) => {
        const ChainWorkflow = workflows.get('chain');
        const workflow = new ChainWorkflow(null, params);
        return await workflow.execute();
      }
    };
    
    // Orchestrator workflow tool
    tools['workflow_orchestrate'] = {
      description: 'Dynamically plan and delegate tasks to specialized agents',
      parameters: {
        objective: {
          type: 'string',
          description: 'The objective to achieve through orchestration',
          required: true
        },
        agents: {
          type: 'object',
          description: 'Available agents for delegation',
          required: true
        },
        planType: {
          type: 'string',
          description: 'Planning type: "full" or "iterative"',
          default: 'iterative'
        }
      },
      handler: async (params) => {
        const OrchestratorWorkflow = workflows.get('orchestrator');
        const workflow = new OrchestratorWorkflow(null, params);
        return await workflow.execute();
      }
    };
    
    // Evaluator-Optimizer tool
    tools['workflow_refine'] = {
      description: 'Iteratively refine output through evaluation cycles',
      parameters: {
        objective: {
          type: 'string',
          description: 'What to generate and refine',
          required: true
        },
        generatorAgent: {
          type: 'string',
          description: 'Agent that generates content',
          required: true
        },
        evaluatorAgent: {
          type: 'string',
          description: 'Agent that evaluates and provides feedback',
          required: true
        },
        minRating: {
          type: 'string',
          description: 'Minimum quality rating to achieve',
          default: 'GOOD'
        },
        maxRefinements: {
          type: 'integer',
          description: 'Maximum refinement iterations',
          default: 3
        }
      },
      handler: async (params) => {
        const EvaluatorOptimizer = workflows.get('evaluator');
        const workflow = new EvaluatorOptimizer(null, params);
        return await workflow.execute();
      }
    };
    
    return tools;
  }
  
  /**
   * Register workflow tools with Leviathan's MCP server
   */
  async registerWithMCP(mcpServer, workflowTools) {
    for (const [name, tool] of Object.entries(workflowTools)) {
      await mcpServer.registerTool(name, tool);
    }
  }
}