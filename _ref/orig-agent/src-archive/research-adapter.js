/**
 * Research Adapter - Pluggable research providers
 * Default: Perplexity (via direct API or MCP)
 * Future: OpenAI, Anthropic, Google, etc.
 */

import fetch from 'node-fetch';

export class ResearchAdapter {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || process.env.KINGLY_RESEARCH_PROVIDER || 'perplexity-mcp',
      apiKey: config.apiKey || process.env.PERPLEXITY_API_KEY,
      timeout: config.timeout || 30000,
      background: config.background || false,
      ...config
    };
    
    this.providers = new Map();
    this.registerDefaultProviders();
  }
  
  registerDefaultProviders() {
    // Perplexity via MCP (current approach)
    this.registerProvider('perplexity-mcp', {
      name: 'Perplexity via MCP',
      execute: async (prompt) => {
        // This requires the user to call MCP
        return {
          type: 'mcp_instruction',
          instruction: `Use Perplexity to research: ${prompt}`,
          tool: 'mcp__perplexity-ask__perplexity_ask',
          params: {
            messages: [{
              role: 'user',
              content: prompt
            }]
          }
        };
      }
    });
    
    // Direct Perplexity API (if API key available)
    this.registerProvider('perplexity-api', {
      name: 'Perplexity Direct API',
      requiresApiKey: true,
      execute: async (prompt) => {
        if (!this.config.apiKey) {
          throw new Error('Perplexity API key required for direct API access');
        }
        
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'pplx-7b-online',
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        });
        
        const data = await response.json();
        return {
          type: 'direct_result',
          content: data.choices[0].message.content,
          citations: data.citations || []
        };
      }
    });
    
    // Mock provider for testing
    this.registerProvider('mock', {
      name: 'Mock Research',
      execute: async (prompt) => {
        return {
          type: 'mock_result',
          content: `Mock research for: ${prompt}`,
          confidence_boost: 0.15
        };
      }
    });
  }
  
  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }
  
  async research(prompt, options = {}) {
    const provider = this.providers.get(this.config.provider);
    if (!provider) {
      throw new Error(`Research provider not found: ${this.config.provider}`);
    }
    
    // Check if we should run in background
    const runInBackground = options.background ?? this.config.background;
    
    if (runInBackground) {
      // Return immediately with a research ticket
      const ticketId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Start research in background (non-blocking)
      this.runBackgroundResearch(ticketId, prompt, provider);
      
      return {
        type: 'background_research',
        ticketId: ticketId,
        status: 'started',
        message: 'Research running in background',
        checkUrl: `agent://research/status?ticket=${ticketId}`
      };
    } else {
      // Run synchronously
      return await provider.execute(prompt);
    }
  }
  
  async runBackgroundResearch(ticketId, prompt, provider) {
    // Store ticket status
    if (!global.researchTickets) {
      global.researchTickets = new Map();
    }
    
    global.researchTickets.set(ticketId, {
      status: 'running',
      startTime: Date.now(),
      prompt: prompt
    });
    
    try {
      const result = await provider.execute(prompt);
      global.researchTickets.set(ticketId, {
        status: 'completed',
        result: result,
        duration: Date.now() - global.researchTickets.get(ticketId).startTime
      });
    } catch (error) {
      global.researchTickets.set(ticketId, {
        status: 'failed',
        error: error.message,
        duration: Date.now() - global.researchTickets.get(ticketId).startTime
      });
    }
  }
  
  async checkResearch(ticketId) {
    if (!global.researchTickets?.has(ticketId)) {
      return {
        error: 'Research ticket not found',
        ticketId: ticketId
      };
    }
    
    return global.researchTickets.get(ticketId);
  }
}

export default ResearchAdapter;