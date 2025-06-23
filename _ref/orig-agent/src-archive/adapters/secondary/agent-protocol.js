/**
 * Agent Protocol Handler - Lightweight inter-agent communication
 * agent:// protocol for fast, stateless agent queries
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export class AgentProtocol {
  constructor(config = {}) {
    this.config = {
      agentsPath: config.agentsPath || './agents',
      ...config
    };
    
    this.agents = new Map();
    this.handlers = new Map();
  }

  async initialize() {
    // Load all agent cards
    await this.loadAgentCards();
    
    // Register built-in handlers
    this.registerBuiltinHandlers();
    
    return this;
  }

  async loadAgentCards() {
    const agentFiles = await fs.readdir(this.config.agentsPath);
    
    for (const file of agentFiles) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const agentPath = path.join(this.config.agentsPath, file);
        const content = await fs.readFile(agentPath, 'utf8');
        const agentCard = yaml.load(content);
        
        const agentId = agentCard.metadata.id;
        this.agents.set(agentId, {
          ...agentCard,
          cardPath: agentPath
        });
      }
    }
  }

  // Parse agent:// URLs
  parseAgentUrl(url) {
    // agent://ceo/estimate?task=build_app&complexity=high
    const match = url.match(/^agent:\/\/([^\/]+)\/([^?]+)(?:\?(.*))?$/);
    if (!match) throw new Error(`Invalid agent URL: ${url}`);
    
    const [, agentId, action, queryString] = match;
    const params = new URLSearchParams(queryString || '');
    
    return {
      agentId,
      action,
      params: Object.fromEntries(params)
    };
  }

  // Route agent:// requests
  async route(url) {
    const { agentId, action, params } = this.parseAgentUrl(url);
    
    // Check if agent exists
    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        error: `Agent not found: ${agentId}`,
        availableAgents: Array.from(this.agents.keys())
      };
    }
    
    // Check if agent has this capability
    const capability = this.findCapability(agent, action);
    if (!capability) {
      return {
        error: `Agent ${agentId} doesn't support action: ${action}`,
        availableActions: agent.capabilities.map(c => c.id)
      };
    }
    
    // Check for custom handler
    const handlerKey = `${agentId}:${action}`;
    if (this.handlers.has(handlerKey)) {
      const handler = this.handlers.get(handlerKey);
      return await handler(params, agent, capability);
    }
    
    // Default pattern-based response
    return this.defaultHandler(agentId, action, params, agent, capability);
  }

  // Find matching capability
  findCapability(agent, action) {
    return agent.capabilities.find(cap => 
      cap.id === action || 
      cap.patterns?.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(action);
      })
    );
  }

  // Default handler for pattern-based responses
  async defaultHandler(agentId, action, params, agent, capability) {
    // Simulate agent thinking based on its persona
    const response = {
      agent: agentId,
      action: action,
      capability: capability.id,
      params: params,
      timestamp: new Date().toISOString()
    };

    // Add agent-specific responses
    switch (action) {
      case 'estimate':
        response.result = this.generateEstimate(agent, params);
        break;
        
      case 'analyze':
        response.result = this.generateAnalysis(agent, params);
        break;
        
      case 'recommend':
        response.result = this.generateRecommendation(agent, params);
        break;
        
      default:
        response.result = {
          message: `${agent.metadata.name} processed ${action}`,
          confidence: 0.8,
          needsDeepWork: true
        };
    }
    
    return response;
  }

  // Built-in response generators
  generateEstimate(agent, params) {
    const complexity = params.complexity || 'medium';
    const baseEstimates = {
      ceo: { low: 1, medium: 3, high: 7 },
      dev: { low: 2, medium: 5, high: 10 },
      architect: { low: 1, medium: 2, high: 5 }
    };
    
    const agentEstimates = baseEstimates[agent.metadata.id] || baseEstimates.dev;
    const days = agentEstimates[complexity] || 5;
    
    return {
      estimate: `${days} days`,
      confidence: agent.metadata.id === 'dev' ? 0.9 : 0.7,
      factors: {
        complexity: complexity,
        expertise: agent.tags?.skills || []
      }
    };
  }

  generateAnalysis(agent, params) {
    return {
      analysis: `${agent.metadata.name} analysis of ${params.target || 'request'}`,
      insights: [
        'Pattern detected in request',
        'Aligns with agent expertise',
        'Recommend deeper investigation'
      ],
      confidence: 0.75
    };
  }

  generateRecommendation(agent, params) {
    return {
      recommendation: `${agent.metadata.name} recommends`,
      options: [
        { action: 'investigate', priority: 'high' },
        { action: 'delegate', to: 'specialist' },
        { action: 'defer', reason: 'needs research' }
      ],
      confidence: 0.8
    };
  }

  // Register custom handlers
  registerHandler(agentId, action, handler) {
    const key = `${agentId}:${action}`;
    this.handlers.set(key, handler);
  }

  // Register built-in handlers for common patterns
  registerBuiltinHandlers() {
    // CEO-specific handlers
    this.registerHandler('ceo', 'prioritize', async (params, agent) => {
      const items = params.items?.split(',') || [];
      return {
        agent: 'ceo',
        action: 'prioritize',
        result: {
          priorities: items.map((item, idx) => ({
            item: item.trim(),
            priority: idx + 1,
            reasoning: 'Business value and strategic alignment'
          })),
          methodology: 'Strategic impact assessment'
        }
      };
    });

    // Dev-specific handlers
    this.registerHandler('dev', 'feasibility', async (params, agent) => {
      return {
        agent: 'dev',
        action: 'feasibility',
        result: {
          feasible: params.complexity !== 'impossible',
          concerns: [
            'Technical complexity',
            'Resource requirements',
            'Timeline constraints'
          ],
          confidence: 0.85
        }
      };
    });
  }

  // Delegation helper
  async delegate(fromAgent, toAgent, task) {
    const delegationUrl = `agent://${toAgent}/analyze?task=${encodeURIComponent(task)}&delegatedBy=${fromAgent}`;
    return await this.route(delegationUrl);
  }

  // Multi-agent query
  async broadcast(action, params) {
    const results = [];
    
    for (const [agentId, agent] of this.agents) {
      const capability = this.findCapability(agent, action);
      if (capability) {
        const url = `agent://${agentId}/${action}?${new URLSearchParams(params)}`;
        const result = await this.route(url);
        results.push(result);
      }
    }
    
    return {
      action: action,
      responses: results,
      summary: `${results.length} agents responded`
    };
  }
}

export default AgentProtocol;