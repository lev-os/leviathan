#!/usr/bin/env node
/**
 * Kingly Agent MCP Server
 * Official MCP SDK integration with ports & adapters architecture
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './infrastructure/dependency-injection.js';

// Create our application's MCP adapter using dependency injection
const mcpAdapter = createMCPServer({
  kinglyPath: process.env.KINGLY_PATH || '.kingly',
  agentsPath: process.env.AGENTS_PATH || './agents'
});

// Create official MCP SDK server
const server = new Server(
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

// Register all tools from our MCP adapter
const tools = mcpAdapter.getTools();
console.log(`🔧 Registering ${tools.length} tools with MCP server`);

tools.forEach(tool => {
  server.setRequestHandler(
    { method: 'tools/call', params: { name: tool.name } },
    async (request) => {
      try {
        const result = await mcpAdapter.handleToolCall(tool.name, request.params.arguments || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text', 
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  );
});

// List tools handler
server.setRequestHandler({ method: 'tools/list' }, async () => {
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

// Global reference for hot reload
global.mcpServer = server;
global.mcpAdapter = mcpAdapter;

// Start server
async function startServer() {
  const transport = new StdioServerTransport();
  
  console.log('🚀 Starting Kingly Agent MCP Server...');
  console.log(`📋 Available tools: ${tools.length}`);
  
  await server.connect(transport);
  console.log('✅ Kingly Agent MCP Server running via stdio');
}

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});

// Start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export { server, mcpAdapter };