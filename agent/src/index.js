#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPAdapter } from './adapters/mcp/mcp-adapter.js';
import { CoreInitializer } from './core/core-initializer.js';

class KinglyAgentServer {
  constructor() {
    this.server = new Server(
      {
        name: 'kingly-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize core systems and MCP adapter
    this.coreInitializer = new CoreInitializer();
    this.mcpAdapter = new MCPAdapter();
    
    // Initialize systems
    this.initializeServer();
    
    this.setupToolHandlers();
  }

  async initializeServer() {
    try {
      // Initialize all core systems
      const dependencies = await this.coreInitializer.initializeCore();
      
      // Initialize MCP adapter with core dependencies
      await this.mcpAdapter.initialize(dependencies);
    } catch (error) {
      console.error('Failed to initialize server:', error.message);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Auto-bootstrap: get all MCP tools from adapter
      const tools = this.mcpAdapter.getMCPTools();
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const args = request.params.arguments || {};

        // Auto-bootstrap: route all tool calls through MCP adapter
        return await this.mcpAdapter.handleToolCall(toolName, args);
      } catch (error) {
        console.error('Tool error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kingly Agent MCP server running on stdio');
  }
}

const server = new KinglyAgentServer();
server.run().catch(console.error);