#!/usr/bin/env node
/**
 * Test Simple MCP Tools Access
 * Bypass the server, test tools directly
 */

import KinglyAgent from './src/index.js';

async function testTools() {
  console.log('🧪 Testing Kingly Agent Tools Directly...\n');
  
  try {
    // Initialize agent
    const agent = new KinglyAgent();
    
    // Wait for initialization
    while (!agent.protocolsReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Agent initialized');
    
    // Get available tools
    const tools = agent.getTools();
    console.log(`📋 Available tools (${tools.length}):`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    
    // Test workspace tools specifically
    console.log('\n🔍 Testing workspace tools...');
    const workspaceTools = tools.filter(t => t.name.includes('workspace'));
    console.log(`Found ${workspaceTools.length} workspace tools:`, workspaceTools.map(t => t.name));
    
    // Test a simple tool call
    console.log('\n🎯 Testing list_workspaces...');
    const result = await agent.handleToolCall('list_workspaces', {});
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTools();