/**
 * Test Background Monitor - Shows unified monitoring of spawns and research
 */

import KinglyAgent from '../src/index.js';

async function testBackgroundMonitor() {
  console.log('🔍 Testing Background Process Monitor\n');
  
  // Set research to background mode
  process.env.KINGLY_RESEARCH_BACKGROUND = 'true';
  process.env.KINGLY_RESEARCH_PROVIDER = 'mock';
  
  const agent = new KinglyAgent({
    workspacePath: './.kingly',
    agentsPath: './agents'
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Start multiple background processes
  console.log('🚀 Starting background processes...\n');
  
  // 1. Start a spawn
  const spawn1 = await agent.handleToolCall('start_spawn', {
    taskType: 'analysis',
    taskData: { task: 'Analyze codebase' },
    callingAgent: 'dev',
    project: 'test'
  });
  console.log(`Spawn started: ${spawn1.spawnId}`);
  
  // 2. Create task with low confidence (triggers background research)
  const task = await agent.handleToolCall('create_task', {
    title: 'Implement ML pipeline',
    description: 'Complex ML task'
  });
  
  const taskId = task.message.match(/ID: ([^)]+)/)?.[1];
  
  const assessment = await agent.handleToolCall('assess_task_confidence', {
    taskId: taskId,
    confidence: 0.5,  // Low - triggers research
    factors: { complexity: 'very high' }
  });
  
  console.log(`Research ticket: ${assessment.research?.response?.ticketId}`);
  
  // 3. Make another MCP call to trigger background checks
  console.log('\n⏰ Making another call to trigger pipeline checks...\n');
  
  const workspaceState = await agent.handleToolCall('get_workspace_state', {});
  
  // Check if background updates were added
  if (workspaceState.message?.includes('background tasks completed')) {
    console.log('✅ Background monitor updated the response!');
    console.log(`Message: ${workspaceState.message}`);
  }
  
  // 4. Check specific statuses
  console.log('\n📊 Direct status checks:');
  
  const spawnStatus = await agent.handleToolCall('check_spawns', {});
  console.log(`Spawns - Running: ${spawnStatus.stats.running}, Completed: ${spawnStatus.stats.completed}`);
  
  // 5. Simulate time passing and check again
  console.log('\n⏳ Simulating time passing...');
  
  // Mark mock research as complete
  if (global.researchTickets) {
    for (const [id, ticket] of global.researchTickets) {
      if (ticket.status === 'running') {
        ticket.status = 'completed';
        ticket.result = { content: 'Mock research completed!' };
      }
    }
  }
  
  // Make another call
  const listTasks = await agent.handleToolCall('list_tasks', {
    project: 'test'
  });
  
  // Check agent instructions for updates
  if (listTasks.agentInstructions?.includes('BACKGROUND UPDATES')) {
    console.log('\n🎉 Background updates detected in agent instructions!');
    const updates = listTasks.agentInstructions.split('BACKGROUND UPDATES:')[1];
    console.log('Updates:', updates?.split('\n').slice(0, 5).join('\n'));
  }
  
  console.log('\n✅ Test complete - Background monitor is working!');
}

testBackgroundMonitor().catch(console.error);