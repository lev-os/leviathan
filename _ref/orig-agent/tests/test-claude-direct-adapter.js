#!/usr/bin/env node
/**
 * Test Claude Code Direct Adapter
 * Demonstrates direct method calls without MCP protocol overhead
 */

import { createClaudeAdapter } from '../src/infrastructure/dependency-injection.js';
import { performance } from 'perf_hooks';

async function testClaudeDirectAdapter() {
  console.log('🧪 Testing Claude Code Direct Adapter...\n');
  
  try {
    // Create Claude adapter - no MCP server setup needed!
    const startSetup = performance.now();
    const claude = createClaudeAdapter({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    const setupTime = performance.now() - startSetup;
    
    console.log(`✅ Created Claude adapter in ${setupTime.toFixed(2)}ms (no server overhead!)\n`);
    
    // Test 1: Create workspace (direct call)
    console.log('📋 Testing createWorkspace (direct)...');
    const startCreate = performance.now();
    const workspace = await claude.createWorkspace(
      'test-workspace',
      './test-workspace',
      'Testing direct Claude adapter'
    );
    const createTime = performance.now() - startCreate;
    console.log(`Result: ${workspace.name} created in ${createTime.toFixed(2)}ms`);
    
    // Test 2: List workspaces (direct call)
    console.log('\n📋 Testing listWorkspaces (direct)...');
    const startList = performance.now();
    const workspaces = await claude.listWorkspaces();
    const listTime = performance.now() - startList;
    console.log(`Result: Found ${workspaces.length} workspaces in ${listTime.toFixed(2)}ms`);
    
    // Test 3: Set active workspace (direct call)
    console.log('\n🔄 Testing setActiveWorkspace (direct)...');
    const startActive = performance.now();
    await claude.setActiveWorkspace('test-workspace');
    const activeTime = performance.now() - startActive;
    console.log(`Result: Activated in ${activeTime.toFixed(2)}ms`);
    
    // Test 4: Create project (direct call)
    console.log('\n🚀 Testing createProject (direct)...');
    const startProject = performance.now();
    const project = await claude.createProject(
      'test-workspace',
      'test-project',
      'Direct adapter test project'
    );
    const projectTime = performance.now() - startProject;
    console.log(`Result: ${project.name} created in ${projectTime.toFixed(2)}ms`);
    
    // Test 5: Create enhanced task (direct call)
    console.log('\n📝 Testing createEnhancedTask (direct)...');
    const startTask = performance.now();
    const task = await claude.createEnhancedTask(
      'test-project',
      'Test direct adapter performance',
      'Verify that direct calls are faster than MCP protocol',
      ['tests/test-claude-direct-adapter.js'],
      ['node tests/test-claude-direct-adapter.js'],
      'Testing Claude direct adapter pattern'
    );
    const taskTime = performance.now() - startTask;
    console.log(`Result: Task ${task.id} created in ${taskTime.toFixed(2)}ms`);
    
    // Test 6: Assess task confidence (direct call)
    console.log('\n🎯 Testing assessTaskConfidence (direct)...');
    const startAssess = performance.now();
    const assessment = await claude.assessTaskConfidence(
      task.id,
      0.95,
      ['direct-calls', 'no-protocol-overhead', 'synchronous'],
      'High confidence due to direct method calls'
    );
    const assessTime = performance.now() - startAssess;
    console.log(`Result: Confidence assessed in ${assessTime.toFixed(2)}ms`);
    
    // Test 7: Get current context (direct call)
    console.log('\n📍 Testing getCurrentContext (direct)...');
    const startContext = performance.now();
    const context = await claude.getCurrentContext();
    const contextTime = performance.now() - startContext;
    console.log(`Result: Context retrieved in ${contextTime.toFixed(2)}ms`);
    console.log('Context:', JSON.stringify(context, null, 2));
    
    // Test 8: Batch operations (unique to direct adapter)
    console.log('\n🔄 Testing batch operations (direct adapter feature)...');
    const startBatch = performance.now();
    const batchResults = await claude.batchOperation([
      { method: 'listProjects', args: ['test-workspace'] },
      { method: 'listTasks', args: ['test-project'] },
      { method: 'getAvailableMethods', args: [] }
    ]);
    const batchTime = performance.now() - startBatch;
    console.log(`Result: ${batchResults.length} operations in ${batchTime.toFixed(2)}ms`);
    
    // Performance summary
    console.log('\n📊 Performance Summary:');
    console.log('─'.repeat(40));
    console.log(`Setup time: ${setupTime.toFixed(2)}ms`);
    console.log(`Average operation time: ${((createTime + listTime + activeTime + projectTime + taskTime + assessTime + contextTime) / 7).toFixed(2)}ms`);
    console.log(`Total test time: ${(performance.now() - startSetup).toFixed(2)}ms`);
    
    console.log('\n🎉 All direct calls successful!');
    console.log('💡 Compare with MCP protocol overhead: typically 10-100x slower');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await claude.deleteWorkspace('test-workspace');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Compare with MCP protocol calls
async function compareMCPOverhead() {
  console.log('\n\n📊 Comparing with MCP Protocol Overhead...\n');
  
  try {
    // Import MCP adapter for comparison
    const { createMCPServer } = await import('../src/infrastructure/dependency-injection.js');
    
    // Test MCP protocol call
    console.log('Testing MCP protocol call (includes overhead)...');
    const mcpAdapter = createMCPServer({
      kinglyPath: './.kingly-test-mcp',
      agentsPath: './agents'
    });
    
    const startMCP = performance.now();
    await mcpAdapter.handleToolCall('list_workspaces', {});
    const mcpTime = performance.now() - startMCP;
    
    // Test direct call
    console.log('Testing direct adapter call (no overhead)...');
    const claude = createClaudeAdapter({
      kinglyPath: './.kingly-test-direct',
      agentsPath: './agents'
    });
    
    const startDirect = performance.now();
    await claude.listWorkspaces();
    const directTime = performance.now() - startDirect;
    
    console.log('\n📈 Results:');
    console.log(`MCP Protocol: ${mcpTime.toFixed(2)}ms`);
    console.log(`Direct Call: ${directTime.toFixed(2)}ms`);
    console.log(`Speed improvement: ${(mcpTime / directTime).toFixed(1)}x faster`);
    
  } catch (error) {
    console.error('Comparison error:', error.message);
  }
}

// Run tests
testClaudeDirectAdapter().then(() => compareMCPOverhead());