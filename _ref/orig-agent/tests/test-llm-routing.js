/**
 * LLM-First Routing Test
 * Demonstrates how LLM would use MCP tools for routing and task management
 */

import { KinglyAgent } from '../src/index.js';

async function testLLMRouting() {
  console.log('🧪 Testing LLM-First Routing Approach...\n');

  const agent = new KinglyAgent({
    agentsPath: './agents',
    workspacePath: './.kingly-test'
  });

  try {
    // 1. LLM gets route table to understand available agents
    console.log('1️⃣ LLM gets route table...');
    const routeTable = await agent.getRouteTable();
    
    console.log('Available agents:', routeTable.agents.map(a => a.id).join(', '));
    console.log('Routing guidance:', routeTable.routingGuidance.instruction);
    
    // 2. LLM analyzes a complex request and creates workflow
    console.log('\n2️⃣ LLM creates synthetic workflow for complex request...');
    const complexRequest = "Build a complete user authentication system with OAuth and database";
    
    // LLM would analyze this and create workflow steps:
    const workflow = await agent.createWorkflow('user-auth-system', [
      { agent: 'ceo', task: 'Plan user authentication strategy and requirements' },
      { agent: 'dev', task: 'Design database schema for user management' },
      { agent: 'dev', task: 'Implement OAuth integration' },
      { agent: 'dev', task: 'Create user registration and login endpoints' },
      { agent: 'dev', task: 'Add security middleware and validation' }
    ], { 
      complexity: 'high',
      estimated_time: '2-3 days',
      dependencies: ['database', 'oauth_provider']
    });
    
    console.log('Created workflow:', workflow.name);
    console.log('Steps:', workflow.steps.length);

    // 3. LLM executes individual tasks
    console.log('\n3️⃣ LLM executes workflow steps...');
    for (const step of workflow.steps.slice(0, 2)) { // Just test first 2
      const result = await agent.executeTask(step.agent, step.task, workflow.context);
      console.log(`✅ ${step.agent}: ${step.task.substring(0, 50)}...`);
    }

    // 4. LLM gets workspace context
    console.log('\n4️⃣ LLM checks workspace context...');
    const context = await agent.getWorkspaceContext();
    console.log('Workspace state:', context.workspace || 'default');

    console.log('\n✅ LLM-first routing test completed!');
    console.log('\n🎯 Key Insight: LLM handles all routing logic, JavaScript just provides data and persistence.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLLMRouting();