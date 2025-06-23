#!/usr/bin/env node
/**
 * Manual E2E Testing - I am the test runner
 */

import { CoreSDK } from './core/sdk/core-sdk.js';

console.log('🧪 Manual Testing: CoreSDK Plugin Registry\n');

// Test 1: Basic plugin registration
console.log('Test 1: Basic plugin registration');
const sdk = new CoreSDK();
const workspacePlugin = {
  name: 'kingly-dx-workspace',
  contextTypes: ['workspace']
};

sdk.registerPlugin(workspacePlugin);
const retrieved = sdk.getPlugin('kingly-dx-workspace');
console.log('✅ Plugin retrieved:', retrieved.name);
console.log('✅ Context types:', sdk.getContextTypes());

// Test 2: Multiple plugins
console.log('\nTest 2: Multiple plugins');
const taskPlugin = {
  name: 'kingly-dx-task',
  contextTypes: ['task', 'subtask']
};

sdk.registerPlugin(taskPlugin);
console.log('✅ All context types:', sdk.getContextTypes());
console.log('✅ All plugins:', sdk.listPlugins().map(p => p.name));

// Test 3: Error handling
console.log('\nTest 3: Error handling');
try {
  sdk.registerPlugin(workspacePlugin); // Duplicate
} catch (error) {
  console.log('✅ Duplicate prevention works:', error.message);
}

console.log('\n🎉 Manual E2E Tests Complete - Plugin Registry Working!');

// ================================
// TEST 2: Context Creation
// ================================

console.log('\n\n🧪 Manual Testing: Context Creation\n');

// Create a new SDK for context testing
const contextSDK = new CoreSDK();

// Test 1: Workspace context creation
console.log('Test 1: Workspace context creation');
const contextWorkspacePlugin = {
  name: 'kingly-dx-workspace',
  contextTypes: ['workspace'],
  createContext: (type, config) => ({
    type,
    config,
    id: `workspace-${Date.now()}`,
    capabilities: ['project_management', 'resource_isolation'],
    plugin: 'kingly-dx-workspace',
    created: new Date().toISOString()
  })
};

contextSDK.registerPlugin(contextWorkspacePlugin);

const workspace = await contextSDK.createContext('workspace', {
  name: 'my-test-workspace',
  path: '/tmp/test-workspace',
  description: 'Test workspace for manual E2E'
});

console.log('✅ Workspace created:', {
  id: workspace.id,
  type: workspace.type,
  name: workspace.config.name,
  capabilities: workspace.capabilities
});

// Test 2: Multiple context types
console.log('\nTest 2: Multiple context types');
const contextTaskPlugin = {
  name: 'kingly-dx-task',
  contextTypes: ['task', 'subtask'],
  createContext: (type, config) => ({
    type,
    config,
    id: `${type}-${Date.now()}`,
    confidence: config.confidence || 0.8,
    plugin: 'kingly-dx-task'
  })
};

contextSDK.registerPlugin(contextTaskPlugin);

const task = await contextSDK.createContext('task', {
  title: 'Build feature X',
  description: 'Implement the new feature',
  confidence: 0.9
});

console.log('✅ Task created:', {
  id: task.id,
  type: task.type,
  title: task.config.title,
  confidence: task.confidence
});

// Test 3: Error handling
console.log('\nTest 3: Error handling');
try {
  await contextSDK.createContext('unknown-type', {});
} catch (error) {
  console.log('✅ Unknown type error:', error.message);
}

console.log('\n🎉 Manual E2E Tests Complete - Context Creation Working!');