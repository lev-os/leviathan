#!/usr/bin/env node
/**
 * Test basic imports
 */

console.log('Testing imports...');

try {
  console.log('1. Testing workspace domain...');
  const { Workspace, Project } = await import('./src/domain/workspace.js');
  console.log('✅ Workspace and Project imported');
  
  console.log('2. Testing task domain...');
  const { Task } = await import('./src/domain/task.js');
  console.log('✅ Task imported');
  
  console.log('3. Testing workspace service...');
  const { WorkspaceService } = await import('./src/application/workspace-service.js');
  console.log('✅ WorkspaceService imported');
  
  console.log('4. Testing MCP adapter...');
  const { MCPAdapter } = await import('./src/adapters/primary/mcp-adapter.js');
  console.log('✅ MCPAdapter imported');
  
  console.log('5. Testing dependency injection...');
  const { createMCPServer } = await import('./src/infrastructure/dependency-injection.js');
  console.log('✅ Dependency injection imported');
  
  console.log('\n🎉 All imports successful!');
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}