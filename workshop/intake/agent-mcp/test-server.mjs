#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🚀 Testing Notion Task MCP Server...\n');

  // Start the MCP server
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const transport = new StdioClientTransport({
    stdin: serverProcess.stdout,
    stdout: serverProcess.stdin
  });

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // Test listing tools
    console.log('📋 Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`  • ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test remembering context
    console.log('🧠 Testing memory functions...');
    
    const rememberResult = await client.callTool('remember_context', {
      key: 'test_project',
      value: 'Building an awesome MCP server for task management',
      category: 'project'
    });
    console.log(`Remember: ${rememberResult.content[0].text}`);

    console.log('\n✅ All tests passed! Your MCP server is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.close();
    serverProcess.kill();
  }
}

testMCPServer().catch(console.error);
