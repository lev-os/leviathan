#!/usr/bin/env node
/**
 * Direct test of project management tools
 */

async function testDirectly() {
  try {
    console.log('🧪 Testing project management tools directly...\n');
    
    // Test import
    const { createMCPServer } = await import('./src/infrastructure/dependency-injection.js');
    console.log('✅ Successfully imported dependency injection');
    
    // Create MCP adapter
    const mcpAdapter = createMCPServer({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    console.log('✅ Created MCP adapter');
    
    // Test tools list
    const tools = mcpAdapter.getTools();
    console.log(`📋 Available tools: ${tools.length}`);
    
    // Check for project tools
    const projectTools = ['create_project', 'list_projects', 'set_active_workspace', 'get_current_context'];
    const foundTools = tools.filter(t => projectTools.includes(t.name));
    console.log(`🎯 Found ${foundTools.length} project management tools:`);
    foundTools.forEach(tool => console.log(`   - ${tool.name}`));
    
    if (foundTools.length === projectTools.length) {
      console.log('\n🎉 All project management tools are available!');
    } else {
      console.log('\n⚠️ Some project management tools are missing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectly();