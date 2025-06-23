/**
 * Debug Background Monitor Integration
 */

import KinglyAgent from '../src/index.js';

async function debugMonitor() {
  console.log('🐛 Debugging Background Monitor\n');
  
  // Enable debug logging
  process.env.DEBUG_MONITOR = 'true';
  process.env.KINGLY_RESEARCH_BACKGROUND = 'true';
  process.env.KINGLY_RESEARCH_PROVIDER = 'mock';
  
  const agent = new KinglyAgent();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create a simple task
  console.log('Creating task...');
  const task = await agent.handleToolCall('create_task', {
    title: 'Test task'
  });
  
  // Extract task ID and assess with low confidence
  const taskId = task.message.match(/ID: ([^)]+)/)?.[1];
  console.log(`\nAssessing task ${taskId} with low confidence...`);
  
  const assessment = await agent.handleToolCall('assess_task_confidence', {
    taskId: taskId,
    confidence: 0.5
  });
  
  console.log(`Research started: ${assessment.research?.response?.ticketId}`);
  
  // Force complete the research
  if (global.researchTickets) {
    for (const [id, ticket] of global.researchTickets) {
      console.log(`\nForcing research ${id} to complete...`);
      ticket.status = 'completed';
      ticket.result = { content: 'Test completed' };
    }
  }
  
  // Make another call to trigger monitors
  console.log('\nTriggering monitor check with list_tasks...');
  const result = await agent.handleToolCall('list_tasks', {});
  
  // Check if updates were injected
  if (result.agentInstructions?.includes('BACKGROUND UPDATES')) {
    console.log('\n✅ SUCCESS! Background updates found in agent instructions!');
  } else if (result.message?.includes('background tasks completed')) {
    console.log('\n✅ SUCCESS! Background updates found in message!');
  } else {
    console.log('\n❌ No background updates detected');
    console.log('Result:', JSON.stringify(result, null, 2));
  }
}

debugMonitor().catch(console.error);