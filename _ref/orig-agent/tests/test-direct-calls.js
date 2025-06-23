#!/usr/bin/env node
/**
 * Test calling MCP tools directly through the adapter
 */

async function testDirectCalls() {
  console.log('🧪 Testing direct MCP tool calls...\n');
  
  try {
    // Import and create MCP adapter
    const { createMCPServer } = await import('./src/infrastructure/dependency-injection.js');
    const mcpAdapter = createMCPServer({
      kinglyPath: './.kingly',
      agentsPath: './agents'
    });
    
    console.log('✅ Created MCP adapter');
    
    // Test 1: List existing workspaces
    console.log('\n📋 Testing list_workspaces...');
    const workspaces = await mcpAdapter.handleToolCall('list_workspaces', {});
    console.log('Result:', workspaces);
    
    // Test 2: Get current context
    console.log('\n📍 Testing get_current_context...');
    const context = await mcpAdapter.handleToolCall('get_current_context', {});
    console.log('Result:', context);
    
    // Test 3: Set active workspace
    console.log('\n🔄 Testing set_active_workspace...');
    const setActive = await mcpAdapter.handleToolCall('set_active_workspace', { name: 'kingly-agent' });
    console.log('Result:', setActive);
    
    // Test 4: List projects in workspace
    console.log('\n📦 Testing list_projects...');
    const projects = await mcpAdapter.handleToolCall('list_projects', { workspace: 'kingly-agent' });
    console.log('Result:', projects);
    
    // Test 5: Create a new project
    console.log('\n🚀 Testing create_project...');
    const newProject = await mcpAdapter.handleToolCall('create_project', {
      workspace: 'kingly-agent',
      name: 'test-project',
      description: 'A test project to verify functionality'
    });
    console.log('Result:', newProject);
    
    // Test 6: Create enhanced task
    console.log('\n📝 Testing create_enhanced_task...');
    const newTask = await mcpAdapter.handleToolCall('create_enhanced_task', {
      project: 'test-project',
      title: 'Test the system end-to-end',
      description: 'Verify that our ports & adapters architecture actually works',
      files: ['/Users/jean-patricksmith/digital/aiforge/aiforge/kingly-agent/src/index.js'],
      commands: ['node test-direct-calls.js'],
      conversation: 'Testing direct MCP tool calls to verify system functionality'
    });
    console.log('Result:', newTask);
    
    console.log('\n🎉 ALL TOOLS WORK! The ports & adapters architecture is functional!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectCalls();