#!/usr/bin/env node

/**
 * Test dynamic checklist options in MCP
 */

import { MCPToolHandlers } from '../src/mcp-tool-handlers.js';

async function testDynamicOptions() {
  console.log('🧪 TESTING DYNAMIC CHECKLIST OPTIONS');
  console.log('='.repeat(50));
  
  const handlers = new MCPToolHandlers({
    workspacePath: './.kingly-test'
  });
  
  await handlers.initialize();
  
  // Test task creation
  console.log('\n1️⃣ Creating task...');
  const createResult = await handlers.handleCreateTask({
    title: 'Build user authentication',
    description: 'Login, register, JWT tokens',
    project: 'test-dynamic-options'
  });
  
  console.log('\n✅ Result:');
  console.log('Message:', createResult.message);
  
  if (createResult.nextAction) {
    console.log('\n📋 Next Action:');
    console.log('Instruction:', createResult.nextAction.instruction);
    
    if (createResult.nextAction.options) {
      console.log('\n🔢 Options:');
      createResult.nextAction.options.forEach((opt, i) => {
        console.log(opt);
      });
    }
  }
  
  // Extract task ID for next test
  const taskId = createResult.message.match(/ID: ([^)]+)/)[1];
  
  // Test low confidence assessment
  console.log('\n\n2️⃣ Testing low confidence assessment...');
  const lowConfResult = await handlers.handleAssessTaskConfidence({
    taskId: taskId,
    confidence: 0.4,
    factors: { complexity: 'high', unknowns: 'many' },
    reasoning: 'Complex multi-component system'
  });
  
  console.log('\n✅ Low Confidence Result:');
  console.log('Message:', lowConfResult.message);
  if (lowConfResult.nextAction && lowConfResult.nextAction.options) {
    console.log('\n🔢 Split Options:');
    lowConfResult.nextAction.options.forEach(opt => console.log(opt));
  }
  
  // Test high confidence assessment
  console.log('\n\n3️⃣ Testing high confidence assessment...');
  const highConfResult = await handlers.handleAssessTaskConfidence({
    taskId: taskId,
    confidence: 0.9,
    factors: { complexity: 'low' },
    reasoning: 'Simple implementation'
  });
  
  console.log('\n✅ High Confidence Result:');
  console.log('Message:', highConfResult.message);
  if (highConfResult.nextAction && highConfResult.nextAction.options) {
    console.log('\n🔢 Execute Options:');
    highConfResult.nextAction.options.forEach(opt => console.log(opt));
  }
}

testDynamicOptions().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});