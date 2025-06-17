#!/usr/bin/env node
/**
 * MCP Client - Direct connection to MCP servers
 * Spawns MCP server process and communicates via JSON-RPC over stdio
 */

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class MCPClient {
  constructor(serverPath = null) {
    this.client = null;
    this.transport = null;
    this.serverPath = serverPath || join(__dirname, 'server.js');
  }

  async connect() {
    try {
      // Create transport - spawns the MCP server as a child process
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [this.serverPath],
        env: process.env
      });

      // Create client
      this.client = new Client({
        name: 'mcp-direct-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      // Connect - establishes JSON-RPC communication
      await this.client.connect(this.transport);
      
      console.log('✅ Connected to MCP server');
      
      // List available tools
      const tools = await this.client.listTools();
      console.log('📋 Available tools:', tools.tools.map(t => t.name).join(', '));
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect:', error.message);
      return false;
    }
  }

  async callTool(toolName, args) {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    try {
      const result = await this.client.callTool(toolName, args);
      return result;
    } catch (error) {
      console.error(`❌ Tool call failed for ${toolName}:`, error.message);
      throw error;
    }
  }

  async getResources() {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    try {
      const resources = await this.client.listResources();
      return resources;
    } catch (error) {
      console.error('❌ Failed to get resources:', error.message);
      throw error;
    }
  }

  async readResource(uri) {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    
    try {
      const content = await this.client.readResource(uri);
      return content;
    } catch (error) {
      console.error(`❌ Failed to read resource ${uri}:`, error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('👋 Disconnected from MCP server');
    }
  }
}

// Test the client if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const client = new MCPClient();
  
  async function test() {
    // Connect
    const connected = await client.connect();
    if (!connected) {
      process.exit(1);
    }
    
    try {
      // Test architect_of_abundance
      console.log('\n🏛️ Testing architect_of_abundance tool...');
      const response = await client.callTool('architect_of_abundance', {
        challenge: 'How do I manage stress while scaling my startup?'
      });
      console.log('Response:', JSON.stringify(response, null, 2));
      
      // Test bootstrap_assessment
      console.log('\n🚀 Testing bootstrap_assessment tool...');
      const bootstrap = await client.callTool('bootstrap_assessment', {
        challenge: 'I have a Raspberry Pi and want to build a global service',
        resources: {
          hardware: ['Raspberry Pi 4', 'home internet'],
          budget: '$100',
          skills: ['basic programming']
        }
      });
      console.log('Bootstrap response:', JSON.stringify(bootstrap, null, 2));
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      await client.disconnect();
    }
  }
  
  test().catch(console.error);
}

export default MCPClient;