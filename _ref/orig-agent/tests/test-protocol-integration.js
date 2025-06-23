/**
 * Test Protocol Integration - Shows all three protocols working together
 * agent:// → mcp:// → spawn://
 */

import KinglyAgent from '../src/index.js';

async function testProtocolIntegration() {
  console.log('🎯 Testing Full Protocol Integration\n');
  
  const agent = new KinglyAgent({
    workspacePath: './.kingly',
    agentsPath: './agents'
  });
  
  // Wait for protocols to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📡 SCENARIO: Build a Payment System\n');
  
  // Step 1: Quick feasibility check with agent://
  console.log('1️⃣ Quick feasibility check (agent://)');
  const feasibility = await agent.handleToolCall('agent_query', {
    url: 'agent://dev/feasibility?task=payment_system&complexity=high'
  });
  console.log(`Result: ${feasibility.result.feasible ? '✅ Feasible' : '❌ Not feasible'}`);
  console.log(`Confidence: ${feasibility.result.confidence}\n`);
  
  // Step 2: Get estimates from all agents
  console.log('2️⃣ Broadcast estimate request (agent://)');
  const estimates = await agent.handleToolCall('agent_broadcast', {
    action: 'estimate',
    params: { task: 'payment_system', complexity: 'high' }
  });
  
  estimates.responses.forEach(r => {
    console.log(`${r.agent}: ${r.result.estimate} (confidence: ${r.result.confidence})`);
  });
  console.log('');
  
  // Step 3: Create tracked task with MCP
  console.log('3️⃣ Create tracked task (mcp://)');
  const task = await agent.handleToolCall('create_task', {
    title: 'Implement payment system',
    description: 'Stripe integration with subscription management',
    project: 'ecommerce-v2'
  });
  console.log(`Task created: ${task.message}`);
  console.log('Protocol routing suggestions included!\n');
  
  // Extract task ID from message
  const taskIdMatch = task.message.match(/ID: ([^)]+)/);
  const taskId = taskIdMatch ? taskIdMatch[1] : 'task_unknown';
  
  // Step 4: Assess confidence (triggers Perplexity if < 70%)
  console.log('4️⃣ Assess confidence (mcp://)');
  const assessment = await agent.handleToolCall('assess_task_confidence', {
    taskId: taskId,
    confidence: 0.65,  // Below threshold!
    factors: {
      complexity: 'high',
      experience: 'medium',
      dependencies: 'external APIs'
    },
    reasoning: 'Complex payment flows, need research'
  });
  
  if (assessment.research?.needed) {
    console.log('🔬 Research triggered! Perplexity prompt ready.');
    console.log(`Urgency: ${assessment.research.urgency}\n`);
  }
  
  // Step 5: Spawn background research
  console.log('5️⃣ Spawn deep research (spawn://)');
  const spawn = await agent.handleToolCall('start_spawn', {
    taskType: 'research',
    taskData: {
      task: 'Payment system architecture',
      depth: 'comprehensive',
      focus: ['Stripe API', 'subscription models', 'PCI compliance']
    },
    callingAgent: 'dev',
    callbackTool: 'process_research',
    project: 'ecommerce-v2'
  });
  
  console.log(`Research spawn: ${spawn.spawnId}`);
  console.log('Status: Running in background...\n');
  
  // Step 6: Continue working while spawn runs
  console.log('6️⃣ Meanwhile, delegate to CEO for prioritization');
  const delegation = await agent.handleToolCall('agent_delegate', {
    from: 'dev',
    to: 'ceo',
    task: 'Prioritize payment features'
  });
  console.log('CEO analysis:', delegation.result.analysis);
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PROTOCOL ORCHESTRATION COMPLETE\n');
  console.log('Flow: agent:// (instant) → mcp:// (tracked) → spawn:// (background)');
  console.log('- Feasibility checked instantly');
  console.log('- Task tracked with full audit trail');
  console.log('- Research running in background');
  console.log('- Work continues without blocking');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testProtocolIntegration().catch(console.error);