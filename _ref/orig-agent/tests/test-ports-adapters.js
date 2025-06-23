#!/usr/bin/env node
/**
 * Test Ports & Adapters Architecture
 */

import KinglyAgent from './src/index.js';

async function testArchitecture() {
  console.log('🧪 Testing Ports & Adapters Architecture...\n');
  
  try {
    const agent = new KinglyAgent({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    
    // Wait for initialization
    console.log('⏳ Waiting for agent initialization...');
    while (!agent.protocolsReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Agent initialized');
    
    // Test tools
    const tools = agent.getTools();
    console.log(`📋 Available tools: ${tools.length}`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    
    // Test workspace creation
    console.log('\n🏗️ Testing workspace creation...');
    const workspaceResult = await agent.handleToolCall('create_workspace', {
      name: 'test-workspace',
      path: '/tmp/test',
      description: 'Test workspace for ports & adapters'
    });
    console.log('✅ Workspace created:', workspaceResult.message);
    
    // Test workspace listing
    console.log('\n📋 Testing workspace listing...');
    const listResult = await agent.handleToolCall('list_workspaces', {});
    console.log('✅ Workspaces found:', listResult.message);
    
    console.log('\n🎉 Ports & Adapters Architecture Test Successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testArchitecture();