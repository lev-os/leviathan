/**
 * Agent Protocol Integration - Bridge between agent:// and MCP
 * Enables lightweight queries with MCP fallback for decisions
 */

import AgentProtocol from './agent-protocol.js';

export class AgentProtocolIntegration {
  constructor(mcpServer) {
    this.mcp = mcpServer;
    this.agentProtocol = new AgentProtocol({
      agentsPath: './agents'
    });
  }

  async initialize() {
    await this.agentProtocol.initialize();
    
    // Add agent protocol tools to MCP
    this.registerMCPTools();
    
    // Add delegation handler to MCP pipeline
    this.registerPipelinePlugin();
    
    // Register research monitor if background monitor exists
    if (this.mcp.backgroundMonitor) {
      this.registerResearchMonitor();
    }
    
    return this;
  }
  
  // Monitor background research tickets
  registerResearchMonitor() {
    this.mcp.backgroundMonitor.register('research', async () => {
      const completed = [];
      const pending = [];
      const failed = [];
      
      if (global.researchTickets) {
        for (const [ticketId, ticket] of global.researchTickets) {
          if (ticket.status === 'completed') {
            completed.push({ ticketId, ...ticket });
          } else if (ticket.status === 'running') {
            pending.push({ ticketId });
          } else if (ticket.status === 'failed') {
            failed.push({ ticketId, ...ticket });
          }
        }
      }
      
      return { completed, pending, failed };
    });
  }

  // Register MCP tools for agent protocol
  registerMCPTools() {
    // Add to MCP's tool definitions
    const tools = [
      {
        name: 'agent_query',
        description: 'Query an agent via lightweight agent:// protocol',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Agent URL (e.g., agent://ceo/estimate?task=X)'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'agent_delegate',
        description: 'Delegate task between agents',
        inputSchema: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source agent ID' },
            to: { type: 'string', description: 'Target agent ID' },
            task: { type: 'string', description: 'Task to delegate' }
          },
          required: ['from', 'to', 'task']
        }
      },
      {
        name: 'agent_broadcast',
        description: 'Query all capable agents',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action to broadcast' },
            params: { type: 'object', description: 'Parameters for action' }
          },
          required: ['action']
        }
      }
    ];

    // Register handlers
    this.mcp.registerToolHandler('agent_query', async (args) => {
      return await this.agentProtocol.route(args.url);
    });

    this.mcp.registerToolHandler('agent_delegate', async (args) => {
      return await this.agentProtocol.delegate(args.from, args.to, args.task);
    });

    this.mcp.registerToolHandler('agent_broadcast', async (args) => {
      return await this.agentProtocol.broadcast(args.action, args.params || {});
    });
  }

  // Add to MCP pipeline for decision escalation
  registerPipelinePlugin() {
    if (this.mcp.pipeline) {
      this.mcp.pipeline.addPlugin({
        name: 'agent-protocol-bridge',
        priority: 90,
        pre: async (context) => {
          // Check if this is a lightweight query candidate
          if (context.toolName === 'get_route_table') {
            // Enhance route table with agent:// endpoints
            context.metadata.agentEndpoints = this.getAgentEndpoints();
          }
        },
        post: async (context) => {
          // Add delegation suggestions based on confidence
          if (context.result?.confidence && context.result.confidence < 0.7) {
            const suggestions = await this.suggestDelegation(context);
            context.result.delegationSuggestions = suggestions;
          }
        }
      });
    }
  }

  // Get all agent:// endpoints
  getAgentEndpoints() {
    const endpoints = [];
    
    for (const [agentId, agent] of this.agentProtocol.agents) {
      agent.capabilities.forEach(cap => {
        endpoints.push({
          agent: agentId,
          action: cap.id,
          url: `agent://${agentId}/${cap.id}`,
          description: cap.description
        });
      });
    }
    
    return endpoints;
  }

  // Suggest delegation based on task
  async suggestDelegation(context) {
    const { toolName, args } = context;
    
    // Broadcast to all agents for estimates
    const estimates = await this.agentProtocol.broadcast('estimate', {
      task: args.title || args.description || 'unknown',
      context: toolName
    });
    
    // Sort by confidence
    const sorted = estimates.responses
      .filter(r => r.result?.confidence)
      .sort((a, b) => b.result.confidence - a.result.confidence);
    
    return {
      bestAgent: sorted[0]?.agent,
      allEstimates: sorted,
      recommendation: sorted[0]?.result.confidence > 0.8 
        ? `Delegate to ${sorted[0].agent}` 
        : 'Needs deeper analysis'
    };
  }
}

// Helper to integrate with existing MCP server
export function integrateAgentProtocol(mcpServer) {
  const integration = new AgentProtocolIntegration(mcpServer);
  
  // Add registerToolHandler method if not exists
  if (!mcpServer.registerToolHandler) {
    mcpServer.toolHandlers = mcpServer.toolHandlers || {};
    mcpServer.registerToolHandler = function(name, handler) {
      this.toolHandlers[name] = handler;
    };
    
    // Update handleToolCall to check custom handlers
    const original = mcpServer.handleToolCall.bind(mcpServer);
    mcpServer.handleToolCall = async function(toolName, args) {
      if (this.toolHandlers[toolName]) {
        return await this.toolHandlers[toolName](args);
      }
      return await original(toolName, args);
    };
  }
  
  return integration.initialize();
}

export default AgentProtocolIntegration;