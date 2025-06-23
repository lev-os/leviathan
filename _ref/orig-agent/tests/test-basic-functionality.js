#!/usr/bin/env node
/**
 * Test if our basic functionality actually works
 */

async function testBasicFunctionality() {
  console.log('🧪 Testing if Kingly Agent actually works...\n');
  
  try {
    // Test 1: Can we import our dependencies?
    console.log('1. Testing imports...');
    const { createMCPServer } = await import('./src/infrastructure/dependency-injection.js');
    console.log('✅ Dependency injection imports');
    
    // Test 2: Can we create an MCP adapter?
    console.log('2. Creating MCP adapter...');
    const mcpAdapter = createMCPServer({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    console.log('✅ MCP adapter created');
    
    // Test 3: Do we have tools?
    console.log('3. Checking tools...');
    const tools = mcpAdapter.getTools();
    console.log(`✅ Found ${tools.length} tools`);
    tools.slice(0, 5).forEach(tool => console.log(`   - ${tool.name}`));
    
    // Test 4: Can we call a simple tool?
    console.log('4. Testing tool call...');
    const result = await mcpAdapter.handleToolCall('list_workspaces', {});
    console.log('✅ Tool call succeeded:', result.message);
    
    console.log('\n🎉 Basic functionality WORKS!');
    return true;
    
  } catch (error) {
    console.error('❌ BROKEN:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testBasicFunctionality();