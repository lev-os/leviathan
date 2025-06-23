#!/usr/bin/env node
/**
 * Test Tool Registry
 */

import { toolRegistry } from './src/tool-registry.js';

async function test() {
  console.log('🧪 Testing Tool Registry...\n');
  
  try {
    // Scan tools
    await toolRegistry.scanTools();
    
    // Show tools
    const tools = toolRegistry.getToolDefinitions();
    console.log(`📋 Available Tools (${tools.length}):`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    
    // Test workspace tool
    console.log('\n🎯 Testing list_workspaces tool...');
    const result = await toolRegistry.handleToolCall('list_workspaces', {});
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    
    // Health check
    const health = await toolRegistry.healthCheck();
    console.log('\n🏥 Health Check:', health);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();