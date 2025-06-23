/**
 * Main Server Entry Point
 * Uses ports & adapters architecture
 */

import { createMCPServer } from './dependency-injection.js';

export async function startKinglyAgent(config = {}) {
  console.log('🚀 Starting Kingly Agent with Ports & Adapters Architecture...');
  
  // Create MCP server using dependency injection
  const mcpAdapter = createMCPServer(config);
  
  console.log('✅ Kingly Agent initialized with ports & adapters');
  console.log(`📋 Available tools: ${mcpAdapter.getTools().length}`);
  
  return {
    mcpAdapter,
    getTools: () => mcpAdapter.getTools(),
    handleToolCall: (toolName, args) => mcpAdapter.handleToolCall(toolName, args),
    config
  };
}

// For backward compatibility
export class KinglyAgent {
  constructor(config = {}) {
    this.config = config;
    this.protocolsReady = false;
    this.mcpAdapter = null;
    this.initializeAgent();
  }

  async initializeAgent() {
    try {
      const result = await startKinglyAgent(this.config);
      this.mcpAdapter = result.mcpAdapter;
      this.protocolsReady = true;
      console.log('✅ KinglyAgent backward compatibility layer ready');
    } catch (error) {
      console.error('❌ Failed to initialize KinglyAgent:', error);
    }
  }

  getTools() {
    return this.mcpAdapter ? this.mcpAdapter.getTools() : [];
  }

  async handleToolCall(toolName, args) {
    if (!this.mcpAdapter) {
      throw new Error('KinglyAgent not initialized');
    }
    return await this.mcpAdapter.handleToolCall(toolName, args);
  }
}

export default KinglyAgent;