#!/usr/bin/env node
/**
 * Test Claude Direct Adapter - I am testing as Claude would use it
 */

import { ClaudeDirectAdapter } from './core/adapters/claude-direct-adapter.js';

console.log('🤖 Claude Testing: Direct Adapter Integration\n');

const adapter = new ClaudeDirectAdapter();

// Test 1: System Info
console.log('=== System Info ===');
const systemInfo = await adapter.getSystemInfo();
console.log('✅ System Info:', systemInfo);

// Test 2: Create Workspace
console.log('\n=== Create Workspace ===');
const workspaceResult = await adapter.createWorkspace('test-workspace', '/tmp/test-workspace', 'Test workspace from Claude');
console.log('✅ Workspace Creation:', workspaceResult);

if (workspaceResult.success) {
  console.log('   - ID:', workspaceResult.workspace.id);
  console.log('   - Name:', workspaceResult.workspace.name);
  console.log('   - Capabilities:', workspaceResult.workspace.capabilities);
}

// Test 3: Create Project  
console.log('\n=== Create Project ===');
const projectResult = await adapter.createProject('test-workspace', 'test-project', 'Test project from Claude');
console.log('✅ Project Creation:', projectResult);

if (projectResult.success) {
  console.log('   - ID:', projectResult.project.id);
  console.log('   - Name:', projectResult.project.name);
  console.log('   - Workspace:', projectResult.project.workspace);
}

// Test 4: Create Task
console.log('\n=== Create Task ===');
const taskResult = await adapter.createTask('test-project', 'Build feature X', 'Implement the new feature using TDD');
console.log('✅ Task Creation:', taskResult);

if (taskResult.success) {
  console.log('   - ID:', taskResult.task.id);
  console.log('   - Title:', taskResult.task.title);
  console.log('   - Project:', taskResult.task.project);
  console.log('   - Status:', taskResult.task.status);
}

// Test 5: Get Current Context
console.log('\n=== Current Context ===');
const contextResult = await adapter.getCurrentContext();
console.log('✅ Current Context:', contextResult);

console.log('\n🎉 Claude Direct Testing Complete!');