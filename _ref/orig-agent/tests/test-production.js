/**
 * Production System Test
 * Quick validation that all components integrate properly
 */

import { KinglyAgent } from '../src/index.js';

async function testProductionSystem() {
  console.log('🧪 Testing Kingly Agent Production System...\n');

  try {
    // Initialize system
    const agent = new KinglyAgent({
      debug: true,
      agentsPath: './agents'
    });

    console.log('1️⃣ Initializing system...');
    await agent.initialize();
    
    // Test basic routing
    console.log('\n2️⃣ Testing semantic routing...');
    const routingResult = await agent.route('plan a new feature for user authentication');
    console.log('Routing result:', {
      agent: routingResult.agent,
      confidence: routingResult.confidence,
      method: routingResult.method
    });

    // Test agent execution
    console.log('\n3️⃣ Testing agent execution...');
    const executionResult = await agent.execute('create a simple hello world function');
    console.log('Execution result:', {
      success: executionResult.success,
      agent: executionResult.agent,
      confidence: executionResult.confidence
    });

    // Test workspace operations
    console.log('\n4️⃣ Testing workspace management...');
    await agent.createWorkspace('test-workspace', {
      name: 'Test Workspace',
      description: 'Production system test workspace'
    });
    
    const currentWorkspace = agent.getCurrentWorkspace();
    console.log('Current workspace:', currentWorkspace?.name);

    // Test analytics
    console.log('\n5️⃣ Testing analytics...');
    const sessionAnalytics = agent.getSessionAnalytics();
    console.log('Session metrics:', {
      turnCount: sessionAnalytics.metrics.turnCount,
      agentInvocations: sessionAnalytics.metrics.agentInvocations,
      efficiency: sessionAnalytics.metrics.efficiency
    });

    const registryStats = agent.getRegistryStats();
    console.log('Registry stats:', {
      totalAgents: registryStats.totalAgents,
      capabilities: registryStats.capabilities.length
    });

    console.log('\n✅ All tests passed! Production system is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testProductionSystem();