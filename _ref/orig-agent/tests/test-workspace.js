#!/usr/bin/env node

import { WorkspaceProjectManager } from './src/workspace-project-tools.js';

async function testWorkspace() {
  console.log('🧪 Testing Workspace Foundation...\n');
  
  const wpm = new WorkspaceProjectManager();
  
  try {
    // Create test workspace
    console.log('1️⃣ Creating workspace...');
    const workspace = await wpm.createWorkspace({
      name: 'test-workspace',
      description: 'Testing the workspace foundation',
      path: '/Users/jean-patricksmith/digital/aiforge/aiforge'
    });
    console.log('✅ Workspace created:', workspace.name);
    
    // List workspaces
    console.log('\n2️⃣ Listing workspaces...');
    const workspaces = await wpm.listWorkspaces();
    console.log('📋 Available workspaces:');
    workspaces.forEach(w => {
      console.log(`   - ${w.name}: ${w.description}`);
    });
    
    // Set active workspace
    console.log('\n3️⃣ Setting active workspace...');
    await wpm.setActiveWorkspace('test-workspace');
    console.log('✅ Active workspace set');
    
    // Create test project
    console.log('\n4️⃣ Creating project...');
    const project = await wpm.createProject({
      name: 'foundation-test',
      description: 'Testing project creation',
      path: '/Users/jean-patricksmith/digital/aiforge/aiforge/kingly-agent'
    });
    console.log('✅ Project created:', project.name);
    
    // Create test task
    console.log('\n5️⃣ Creating task...');
    const task = await wpm.createTask({
      title: 'Test workspace integration',
      description: 'Verify that workspace tools work correctly',
      project: 'foundation-test',
      context: {
        conversation: 'Initial testing of workspace foundation',
        files: ['test-workspace.js'],
        decisions: ['Use simple test workflow']
      }
    });
    console.log('✅ Task created:', task.title);
    
    // List tasks
    console.log('\n6️⃣ Listing tasks...');
    const tasks = await wpm.listTasks('foundation-test');
    console.log('📋 Project tasks:');
    tasks.forEach(t => {
      console.log(`   - ${t.title} (${t.status})`);
    });
    
    console.log('\n🎉 Workspace foundation test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testWorkspace();