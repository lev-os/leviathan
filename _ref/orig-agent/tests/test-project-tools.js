#!/usr/bin/env node
/**
 * Test Project Management Tools
 */

import { createDependencyContainer } from './src/infrastructure/dependency-injection.js';

async function testProjectTools() {
  console.log('🧪 Testing Project Management Tools...\n');
  
  try {
    // Create dependencies
    const container = createDependencyContainer({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    
    const mcpAdapter = container.mcpAdapter;
    
    console.log('✅ Dependencies initialized');
    
    // Test tools availability
    const tools = mcpAdapter.getTools();
    const projectTools = tools.filter(t => 
      ['create_project', 'list_projects', 'set_active_workspace', 'get_current_context'].includes(t.name)
    );
    
    console.log(`📋 Project management tools available: ${projectTools.length}`);
    projectTools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    
    // Create test workspace first
    console.log('\n🏗️ Creating test workspace...');
    await mcpAdapter.handleToolCall('create_workspace', {
      name: 'test-workspace',
      path: '/tmp/test',
      description: 'Test workspace for project tools'
    });
    console.log('✅ Test workspace created');
    
    // Set active workspace
    console.log('\n🔄 Setting active workspace...');
    const setActiveResult = await mcpAdapter.handleToolCall('set_active_workspace', {
      name: 'test-workspace'
    });
    console.log('✅', setActiveResult.message);
    
    // Get current context
    console.log('\n📍 Getting current context...');
    const contextResult = await mcpAdapter.handleToolCall('get_current_context', {});
    console.log('✅', contextResult.message);
    console.log('Context:', JSON.stringify(contextResult.context, null, 2));
    
    // Create test project
    console.log('\n🚀 Creating test project...');
    const projectResult = await mcpAdapter.handleToolCall('create_project', {
      workspace: 'test-workspace',
      name: 'test-project',
      description: 'A test project for validation'
    });
    console.log('✅', projectResult.message);
    
    // List projects
    console.log('\n📦 Listing projects...');
    const listProjectsResult = await mcpAdapter.handleToolCall('list_projects', {
      workspace: 'test-workspace'
    });
    console.log('✅', listProjectsResult.message);
    
    console.log('\n🎉 Project Management Tools Test Successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProjectTools();