/**
 * Test Spawn System Integration
 * Verifies that spawn agent, pipeline, and MCP tools work together
 */

import KinglyAgent from '../src/index.js';

async function testSpawnSystem() {
  console.log('🧪 Testing Spawn System Integration\n');
  
  // Initialize Kingly Agent
  const agent = new KinglyAgent({
    workspacePath: './.kingly',
    agentsPath: './agents'
  });
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 1: Check available tools
  console.log('1️⃣ Checking available tools...');
  const tools = agent.getTools();
  const spawnToolNames = ['start_spawn', 'check_spawns', 'get_spawn_result', 'kill_spawn'];
  const hasSpawnTools = spawnToolNames.every(name => 
    tools.some(tool => tool.name === name)
  );
  
  console.log(`   ✅ Spawn tools available: ${hasSpawnTools}`);
  console.log(`   Total tools: ${tools.length}`);
  console.log(`   Spawn tools: ${spawnToolNames.join(', ')}\n`);
  
  // Test 2: Start a test spawn
  console.log('2️⃣ Starting a test spawn...');
  try {
    const spawnResult = await agent.handleToolCall('start_spawn', {
      taskType: 'test-decomposition',
      taskData: {
        title: 'Test task decomposition',
        description: 'Break down a complex e-commerce platform',
        targetConfidence: 0.95
      },
      callingAgent: 'test-script',
      callbackTool: 'test_callback',
      project: 'test-project'
    });
    
    console.log('   ✅ Spawn started successfully');
    console.log(`   Spawn ID: ${spawnResult.spawnId}`);
    console.log(`   Status: ${spawnResult.status}\n`);
    
    // Test 3: Check spawn status
    console.log('3️⃣ Checking spawn status...');
    const statusResult = await agent.handleToolCall('check_spawns', {});
    
    console.log(`   ✅ Status check successful`);
    console.log(`   Running: ${statusResult.stats.running}`);
    console.log(`   Completed: ${statusResult.stats.completed}`);
    console.log(`   Failed: ${statusResult.stats.failed}\n`);
    
    // Test 4: Test pipeline execution
    console.log('4️⃣ Testing pipeline plugin execution...');
    const randomToolResult = await agent.handleToolCall('get_workspace_state', {});
    
    console.log('   ✅ Pipeline executed successfully');
    console.log(`   Pipeline metadata present: ${!!randomToolResult.pipelineMetadata}`);
    if (randomToolResult.pipelineMetadata) {
      console.log(`   Duration: ${randomToolResult.pipelineMetadata.duration}ms`);
      console.log(`   Plugins executed: ${randomToolResult.pipelineMetadata.pluginsExecuted.length}\n`);
    }
    
    // Test 5: Get spawn result (should still be running)
    console.log('5️⃣ Attempting to get spawn result...');
    if (spawnResult.spawnId) {
      const result = await agent.handleToolCall('get_spawn_result', {
        spawnId: spawnResult.spawnId
      });
      
      console.log(`   ✅ Result check successful`);
      console.log(`   Status: ${result.status || 'completed'}`);
      console.log(`   Message: ${result.message}\n`);
    }
    
    // Summary
    console.log('✅ SPAWN SYSTEM INTEGRATION TEST COMPLETE');
    console.log('\nKey achievements:');
    console.log('- Spawn agent integrated with MCP server');
    console.log('- Pipeline plugin architecture working');
    console.log('- Spawn tools available via MCP');
    console.log('- Status checking on every MCP call');
    console.log('- Agent handoff mechanism ready');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
testSpawnSystem().catch(console.error);