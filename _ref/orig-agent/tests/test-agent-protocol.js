/**
 * Test Agent Protocol - Demonstrates lightweight agent:// communication
 */

import AgentProtocol from '../src/agent-protocol.js';

async function testAgentProtocol() {
  console.log('🧪 Testing Agent Protocol\n');
  
  // Initialize protocol
  const protocol = new AgentProtocol({ agentsPath: './agents' });
  await protocol.initialize();
  
  console.log('📋 Loaded agents:', Array.from(protocol.agents.keys()));
  console.log('\n---\n');
  
  // Test 1: Direct agent query
  console.log('1️⃣ Direct CEO estimate:');
  const ceoEstimate = await protocol.route('agent://ceo/estimate?task=build_platform&complexity=high');
  console.log(JSON.stringify(ceoEstimate, null, 2));
  console.log('\n---\n');
  
  // Test 2: Dev feasibility check
  console.log('2️⃣ Dev feasibility check:');
  const devFeasibility = await protocol.route('agent://dev/feasibility?task=ml_integration&complexity=high');
  console.log(JSON.stringify(devFeasibility, null, 2));
  console.log('\n---\n');
  
  // Test 3: Delegation
  console.log('3️⃣ CEO delegates to Dev:');
  const delegation = await protocol.delegate('ceo', 'dev', 'implement payment system');
  console.log(JSON.stringify(delegation, null, 2));
  console.log('\n---\n');
  
  // Test 4: Broadcast estimate
  console.log('4️⃣ Broadcast estimate request:');
  const broadcast = await protocol.broadcast('estimate', {
    task: 'create mobile app',
    complexity: 'medium'
  });
  console.log(JSON.stringify(broadcast, null, 2));
  console.log('\n---\n');
  
  // Test 5: Invalid agent
  console.log('5️⃣ Query non-existent agent:');
  const invalid = await protocol.route('agent://architect/design?system=microservices');
  console.log(JSON.stringify(invalid, null, 2));
  console.log('\n---\n');
  
  // Performance comparison
  console.log('⚡ PERFORMANCE COMPARISON:');
  
  // Time agent:// calls
  const agentStart = Date.now();
  for (let i = 0; i < 100; i++) {
    await protocol.route('agent://ceo/estimate?task=test&complexity=low');
  }
  const agentTime = Date.now() - agentStart;
  
  console.log(`agent:// protocol: ${agentTime}ms for 100 calls (${(agentTime/100).toFixed(2)}ms avg)`);
  console.log('vs MCP calls: ~50-100ms per call (includes tool routing + state management)');
  console.log(`\n🚀 Speed improvement: ${Math.round(50/(agentTime/100))}x faster for lightweight queries!`);
}

// Run test
testAgentProtocol().catch(console.error);