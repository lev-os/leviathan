#!/usr/bin/env node
/**
 * Comprehensive MCP Tools Test
 * Test all the requested functionality step by step
 */

import KinglyAgent from './src/index.js';

async function testComprehensiveMCP() {
  console.log('🧪 Testing Kingly Agent MCP Tools Comprehensive Functionality...\n');
  
  try {
    // Step 1: Import the dependency injection system
    console.log('📋 Step 1: Import the dependency injection system');
    const agent = new KinglyAgent({
      kinglyPath: './.kingly-test',
      agentsPath: './agents'
    });
    
    // Wait for initialization
    console.log('⏳ Waiting for agent initialization...');
    while (!agent.protocolsReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('✅ Dependency injection system loaded and agent initialized\n');
    
    // Step 2: Create an MCP adapter
    console.log('📋 Step 2: Create an MCP adapter');
    const tools = agent.getTools();
    console.log(`✅ MCP adapter created with ${tools.length} tools available\n`);
    
    // Step 3: Call list_workspaces to see existing workspaces
    console.log('📋 Step 3: Call list_workspaces to see existing workspaces');
    const listResult = await agent.handleToolCall('list_workspaces', {});
    console.log(`✅ ${listResult.message}`);
    console.log(`📊 Found workspaces:`, listResult.workspaces.map(w => w.name).join(', ') || 'none');
    console.log('');
    
    // Step 4: Call get_current_context to check context
    console.log('📋 Step 4: Call get_current_context to check context');
    const contextResult = await agent.handleToolCall('get_current_context', {});
    console.log(`✅ ${contextResult.message}`);
    console.log(`📊 Current context:`, JSON.stringify(contextResult.context, null, 2));
    console.log('');
    
    // Step 5: Call set_active_workspace with 'kingly-agent'
    console.log('📋 Step 5: Call set_active_workspace with \'kingly-agent\'');
    try {
      // First create the workspace if it doesn't exist
      const createWsResult = await agent.handleToolCall('create_workspace', {
        name: 'kingly-agent',
        path: '/Users/jean-patricksmith/digital/aiforge/aiforge/kingly-agent',
        description: 'Kingly Agent development workspace'
      });
      console.log(`✅ ${createWsResult.message}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Workspace kingly-agent already exists');
      } else {
        throw error;
      }
    }
    
    const setActiveResult = await agent.handleToolCall('set_active_workspace', {
      name: 'kingly-agent'
    });
    console.log(`✅ ${setActiveResult.message}`);
    console.log('');
    
    // Step 6: Try creating a project
    console.log('📋 Step 6: Try creating a project');
    const createProjectResult = await agent.handleToolCall('create_project', {
      workspace: 'kingly-agent',
      name: 'test-project',
      description: 'Test project for comprehensive MCP testing',
      path: './test-project'
    });
    console.log(`✅ ${createProjectResult.message}`);
    console.log(`📊 Project created:`, createProjectResult.project);
    console.log('');
    
    // Step 7: Try creating a task
    console.log('📋 Step 7: Try creating a task');
    const createTaskResult = await agent.handleToolCall('create_task', {
      project: 'test-project',
      title: 'Test MCP functionality',
      description: 'A test task to verify that the MCP adapter can create tasks properly',
      context: {
        test_type: 'comprehensive_mcp_test',
        created_by: 'automated_test',
        features_tested: [
          'dependency_injection',
          'mcp_adapter',
          'workspace_listing',
          'context_checking',
          'workspace_activation',
          'project_creation',
          'task_creation'
        ]
      }
    });
    console.log(`✅ ${createTaskResult.message}`);
    console.log(`📊 Task created:`, {
      id: createTaskResult.task.id,
      title: createTaskResult.task.title,
      status: createTaskResult.task.status,
      project: createTaskResult.task.project
    });
    console.log('');
    
    // Additional tests: Enhanced task creation
    console.log('📋 Bonus: Test enhanced task creation');
    const enhancedTaskResult = await agent.handleToolCall('create_enhanced_task', {
      project: 'test-project',
      title: 'Enhanced test task with context',
      description: 'Testing the enhanced task creation with captured context',
      sessionContext: {
        currentDirectory: process.cwd(),
        testMode: true,
        architecture: 'ports_and_adapters'
      },
      files: ['test-comprehensive-mcp.js', 'src/index.js'],
      commands: ['node test-comprehensive-mcp.js'],
      conversation: 'Testing comprehensive MCP functionality with step-by-step verification'
    });
    console.log(`✅ ${enhancedTaskResult.message}`);
    console.log(`📊 Enhanced task context captured:`, enhancedTaskResult.contextCaptured);
    console.log('');
    
    // Test save_all_this workflow
    console.log('📋 Bonus: Test save_all_this lazy mode workflow');
    const saveAllResult = await agent.handleToolCall('save_all_this', {
      title: 'MCP Testing Session',
      project: 'test-project',
      description: 'Complete MCP testing session with all features verified'
    });
    console.log(`✅ ${saveAllResult.message}`);
    console.log(`📊 Auto-generated:`, saveAllResult.autoGenerated);
    console.log('');
    
    // Final verification: List all workspaces and projects
    console.log('📋 Final verification: List all workspaces and projects');
    const finalListResult = await agent.handleToolCall('list_workspaces', {});
    console.log(`✅ Final workspace count: ${finalListResult.workspaces.length}`);
    
    const projectsResult = await agent.handleToolCall('list_projects', {
      workspace: 'kingly-agent'
    });
    console.log(`✅ Projects in kingly-agent workspace: ${projectsResult.projects.length}`);
    console.log('');
    
    console.log('🎉 Comprehensive MCP Test Successful!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('✅ Dependency injection system - WORKING');
    console.log('✅ MCP adapter creation - WORKING');
    console.log('✅ list_workspaces - WORKING');
    console.log('✅ get_current_context - WORKING');
    console.log('✅ set_active_workspace - WORKING');
    console.log('✅ create_project - WORKING');
    console.log('✅ create_task - WORKING');
    console.log('✅ create_enhanced_task - WORKING');
    console.log('✅ save_all_this - WORKING');
    console.log('');
    console.log('🏗️ Ports & Adapters Architecture: FULLY FUNCTIONAL');
    
  } catch (error) {
    console.error('❌ Test failed at some step:', error.message);
    console.error('Stack:', error.stack);
    
    console.log('');
    console.log('🔍 Debugging Information:');
    console.log('- Check if all required domain classes exist');
    console.log('- Check if all adapters are properly implemented');
    console.log('- Check if persistence layer is working');
    console.log('- Check if dependency injection wiring is correct');
  }
}

testComprehensiveMCP();