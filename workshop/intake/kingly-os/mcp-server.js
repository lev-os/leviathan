import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { KinglyOS } from './kingly-os.js';
import { llmClient } from './llm-providers/llm-client.js';

class KinglyMCPServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.kinglyOS = new KinglyOS();
    this.clients = new Map();
    this.tools = this.initializeTools();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  initializeTools() {
    return {
      // Core Kingly OS tools
      'kingly-process-request': {
        name: 'kingly-process-request',
        description: 'Process a request through the Kingly OS with intelligent routing and context assembly',
        inputSchema: {
          type: 'object',
          properties: {
            user: { type: 'string', description: 'User identifier' },
            message: { type: 'string', description: 'The request message' },
            options: {
              type: 'object',
              properties: {
                forceMode: { type: 'string', enum: ['workflow', 'learning', 'default'] },
                preferredAgent: { type: 'string' },
                maxTokens: { type: 'number' }
              }
            }
          },
          required: ['user', 'message']
        }
      },
      
      'kingly-set-preference': {
        name: 'kingly-set-preference',
        description: 'Set user preferences for response style and behavior',
        inputSchema: {
          type: 'object',
          properties: {
            user: { type: 'string', description: 'User identifier' },
            key: { type: 'string', description: 'Preference key (style, responseFormat, etc.)' },
            value: { type: 'string', description: 'Preference value' }
          },
          required: ['user', 'key', 'value']
        }
      },

      'kingly-add-workflow': {
        name: 'kingly-add-workflow',
        description: 'Add a custom workflow for repeated task patterns',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workflow name' },
            trigger: { type: 'string', description: 'Regex pattern for triggering' },
            agents: { type: 'array', items: { type: 'string' }, description: 'Agents in workflow' },
            sequence: { type: 'string', enum: ['sequential', 'parallel'], default: 'sequential' }
          },
          required: ['name', 'trigger', 'agents']
        }
      },

      'kingly-provide-feedback': {
        name: 'kingly-provide-feedback',
        description: 'Provide feedback on interaction quality for learning',
        inputSchema: {
          type: 'object',
          properties: {
            user: { type: 'string', description: 'User identifier' },
            success: { type: 'boolean', description: 'Was the interaction successful' },
            quality: { type: 'number', minimum: 0, maximum: 1, description: 'Quality score 0-1' },
            feedback: { type: 'string', description: 'Optional feedback text' }
          },
          required: ['user', 'success', 'quality']
        }
      },

      'kingly-get-metrics': {
        name: 'kingly-get-metrics',
        description: 'Get system metrics and performance data',
        inputSchema: {
          type: 'object',
          properties: {
            includeAgentMetrics: { type: 'boolean', default: false },
            includeLLMStats: { type: 'boolean', default: false }
          }
        }
      },

      'kingly-health-check': {
        name: 'kingly-health-check',
        description: 'Check health of Kingly OS and LLM providers',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    };
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  setupRoutes() {
    // MCP capabilities endpoint
    this.app.get('/capabilities', (req, res) => {
      res.json({
        tools: Object.values(this.tools),
        version: '1.0.0',
        name: 'kingly-os-mcp-server',
        description: 'Kingly OS MCP Server with bidirectional AI agent communication'
      });
    });

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const health = await this.handleHealthCheck();
      res.json(health);
    });

    // Tool execution endpoint
    this.app.post('/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const { arguments: args } = req.body;
        
        const result = await this.executeTool(toolName, args);
        res.json({ result });
      } catch (error) {
        res.status(500).json({ 
          error: error.message,
          type: 'tool_execution_error'
        });
      }
    });

    // Direct API endpoint for simple requests
    this.app.post('/api/process', async (req, res) => {
      try {
        const result = await this.kinglyOS.processRequest(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      this.clients.set(clientId, { ws, connectedAt: Date.now() });
      
      console.log(`🔌 Client connected: ${clientId}`);
      
      ws.send(JSON.stringify({
        type: 'connection',
        clientId,
        capabilities: Object.keys(this.tools),
        message: 'Connected to Kingly OS MCP Server'
      }));

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          const response = await this.handleWebSocketMessage(clientId, message);
          ws.send(JSON.stringify(response));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message,
            timestamp: Date.now()
          }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 Client disconnected: ${clientId}`);
      });
    });
  }

  async handleWebSocketMessage(clientId, message) {
    const { type, id, tool, arguments: args } = message;

    switch (type) {
      case 'tool_call':
        const result = await this.executeTool(tool, args);
        return {
          type: 'tool_result',
          id,
          result,
          timestamp: Date.now()
        };

      case 'stream_request':
        // For streaming responses in the future
        return {
          type: 'stream_started',
          id,
          message: 'Streaming not yet implemented'
        };

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  async executeTool(toolName, args) {
    switch (toolName) {
      case 'kingly-process-request':
        return await this.handleProcessRequest(args);
      
      case 'kingly-set-preference':
        return this.handleSetPreference(args);
      
      case 'kingly-add-workflow':
        return this.handleAddWorkflow(args);
      
      case 'kingly-provide-feedback':
        return this.handleProvideFeedback(args);
      
      case 'kingly-get-metrics':
        return this.handleGetMetrics(args);
      
      case 'kingly-health-check':
        return await this.handleHealthCheck();
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async handleProcessRequest(args) {
    const { user, message, options = {} } = args;
    
    const result = await this.kinglyOS.processRequest({
      user,
      message,
      ...options
    });

    // If we have a valid result with context, get actual LLM response
    if (result.context && result.agent && !options.skipLLM) {
      try {
        const llmResponse = await llmClient.generateResponse(
          result.context,
          message,
          {
            maxTokens: options.maxTokens,
            provider: options.provider
          }
        );

        return {
          ...result,
          response: llmResponse.content,
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            usage: llmResponse.usage
          }
        };
      } catch (error) {
        console.warn('LLM call failed, returning context only:', error.message);
        return {
          ...result,
          response: `[Context assembled but LLM unavailable: ${error.message}]`,
          llmMetadata: { error: error.message }
        };
      }
    }

    return result;
  }

  handleSetPreference(args) {
    const { user, key, value } = args;
    this.kinglyOS.setUserPreference(user, key, value);
    return { success: true, message: `Set ${key}=${value} for user ${user}` };
  }

  handleAddWorkflow(args) {
    const { name, trigger, agents, sequence = 'sequential' } = args;
    this.kinglyOS.addWorkflow(name, {
      trigger: new RegExp(trigger, 'i'),
      agents,
      sequence
    });
    return { success: true, message: `Added workflow: ${name}` };
  }

  handleProvideFeedback(args) {
    const { user, success, quality, feedback } = args;
    this.kinglyOS.completeInteraction(user, { success, quality, feedback });
    return { success: true, message: 'Feedback recorded' };
  }

  handleGetMetrics(args) {
    const { includeAgentMetrics = false, includeLLMStats = false } = args;
    
    const metrics = {
      system: this.kinglyOS.getSystemMetrics(),
      server: {
        connectedClients: this.clients.size,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    if (includeAgentMetrics) {
      metrics.agents = {};
      for (const agentType of ['researcher', 'writer', 'dev', 'ceo', 'qa']) {
        metrics.agents[agentType] = this.kinglyOS.getAgentMetrics(agentType);
      }
    }

    if (includeLLMStats) {
      metrics.llm = llmClient.getStats();
    }

    return metrics;
  }

  async handleHealthCheck() {
    const kinglyHealth = this.kinglyOS.getSystemMetrics();
    const llmHealth = await llmClient.healthCheck();
    
    return {
      status: 'healthy',
      timestamp: Date.now(),
      kingly: kinglyHealth,
      llmProviders: llmHealth,
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        connectedClients: this.clients.size
      }
    };
  }

  start(port = process.env.MCP_SERVER_PORT || 3001) {
    this.server.listen(port, () => {
      console.log(`🚀 Kingly OS MCP Server running on port ${port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
      console.log(`🔧 HTTP API: http://localhost:${port}`);
      console.log(`💊 Health check: http://localhost:${port}/health`);
    });
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(({ ws }) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new KinglyMCPServer();
  server.start();
}

export { KinglyMCPServer };