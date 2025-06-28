#!/usr/bin/env node

/**
 * Kingly Agent MCP Server - Refactored with Command Registry
 * Uses isolated command functions for better testing and modularity
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CommandRegistry } from './core/command-registry.js';
import { SemanticLookup } from './semantic-lookup.js';
import { ContextLoader } from './context-loader.js';
import { CEOBinding } from './ceo-binding.js';
import { SessionManager } from './session-manager.js';
import { IntelligenceCoordinator } from './intelligence-coordinator.js';

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

    // Initialize services
    this.semanticLookup = new SemanticLookup();
    this.contextLoader = new ContextLoader();
    this.ceoBinding = new CEOBinding();
    this.sessionManager = new SessionManager();
    this.intelligenceCoordinator = new IntelligenceCoordinator();
    
    // Initialize command registry
    this.commandRegistry = new CommandRegistry();
    
    this.setupServer();
  }

  async initialize() {
    // Initialize services
    await this.semanticLookup.initialize?.();
    await this.workflowLoader.initialize?.();
    
    // Initialize command registry with service dependencies
    await this.commandRegistry.initialize({
      semanticLookup: this.semanticLookup,
      workflowLoader: this.workflowLoader,
      ceoBinding: this.ceoBinding,
      sessionManager: this.sessionManager,
      intelligenceCoordinator: this.intelligenceCoordinator
    });

    // Register session
    this.sessionManager.registerSession(this.ceoBinding.sessionId, {
      agent: this.ceoBinding.currentAgent,
      workspace: this.ceoBinding.workspaceContext?.workspace || 'unknown',
      network_intelligence: this.ceoBinding.networkIntelligence
    });
  }

  setupServer() {
    // List tools handler - dynamically generated from command registry
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.commandRegistry.getMCPTools()
    }));

    // Call tool handler - routes to command registry
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        // Convert MCP tool name back to command name
        const commandName = name.replace(/Tool$/, '').replace(/_/g, '-');
        
        return await this.commandRegistry.executeCommand(commandName, args || {});
        
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kingly Agent MCP server running on stdio');
  }
}

// Main execution
async function main() {
  const server = new KinglyAgentServer();
  await server.initialize();
  await server.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}