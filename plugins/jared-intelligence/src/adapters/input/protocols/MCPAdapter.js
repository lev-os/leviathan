/**
 * MCPAdapter - MCP Protocol to Domain Adapter
 * Transforms MCP protocol requests into domain commands
 */

export class MCPAdapter {
  constructor(conversationPort, intelligencePort) {
    this.conversation = conversationPort;
    this.intelligence = intelligencePort;
  }

  /**
   * Handle MCP tool call for chat_with_jared
   */
  async handleChatTool(params) {
    // Transform MCP protocol to domain context
    const domainContext = this.transformMCPContext(params);
    
    // Process through domain
    const response = await this.conversation.processMessage(
      params.message,
      domainContext
    );
    
    // Transform domain response to MCP format
    return this.transformToMCPResponse(response);
  }

  /**
   * Handle MCP tool call for gather_intelligence
   */
  async handleIntelligenceTool(params) {    const domainQuery = this.transformMCPQuery(params);
    const intelligence = await this.intelligence.gatherIntelligence(domainQuery);
    return this.transformToMCPIntelligence(intelligence);
  }

  /**
   * Transform MCP context to domain format
   */
  transformMCPContext(params) {
    return {
      user: params.user || 'mcp-user',
      channel: params.channel || 'mcp',
      platform: 'mcp',
      sessionId: params.sessionId,
      timestamp: new Date(),
      metadata: params.metadata || {}
    };
  }

  /**
   * Transform MCP query to domain format
   */
  transformMCPQuery(params) {
    return {
      keywords: params.keywords || [],
      sources: params.sources || ['all'],
      timeRange: params.timeRange || '24h',
      categories: params.categories || [],
      limit: params.limit || 10
    };
  }

  /**
   * Transform domain response to MCP format
   */
  transformToMCPResponse(response) {
    return {
      success: true,
      data: {
        message: response.message,
        suggestions: response.suggestions || [],
        context: response.context
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Transform intelligence results to MCP format
   */
  transformToMCPIntelligence(intelligence) {
    return {
      success: true,
      data: {
        results: intelligence.map(item => ({
          title: item.title,
          source: item.source,
          url: item.url,
          relevance: item.relevance,
          summary: item.summary,
          timestamp: item.timestamp
        })),
        total: intelligence.length
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * MCP Server tool definitions
   */
  getToolDefinitions() {
    return [
      {
        name: 'chat_with_jared',
        description: 'Have a conversation with Jared AI Intelligence Coordinator',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Your message to Jared' },
            context: { type: 'object', description: 'Optional conversation context' }
          },
          required: ['message']
        }
      },
      {
        name: 'gather_intelligence',
        description: 'Gather intelligence on specific topics or keywords',
        inputSchema: {
          type: 'object',
          properties: {
            keywords: { type: 'array', items: { type: 'string' } },
            sources: { type: 'array', items: { type: 'string' } },
            timeRange: { type: 'string', enum: ['1h', '24h', '7d', '30d'] },
            limit: { type: 'number', minimum: 1, maximum: 100 }
          },
          required: ['keywords']
        }
      }
    ];
  }
}