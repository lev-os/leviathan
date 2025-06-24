/**
 * Basic Assembly Test - Test core context assembly functionality
 */

import { KinglyOS } from '../kingly-os.js';

export async function runBasicAssemblyTest() {
  console.log('🧪 RUNNING BASIC ASSEMBLY TEST');
  console.log('='.repeat(50));
  
  const kinglyOS = new KinglyOS();
  await kinglyOS.initialize();
  
  const tests = [
    {
      name: 'Simple Research Request',
      request: 'Research the impact of AI on education',
      context: { user: 'jean-patrick' },
      expectedAgent: 'researcher'
    },
    {
      name: 'Writing Request',
      request: 'Write a blog post about sustainable technology',
      context: { user: 'jean-patrick' },
      expectedAgent: 'writer'
    },
    {
      name: 'Development Request', 
      request: 'Implement a user authentication system',
      context: { user: 'jean-patrick' },
      expectedAgent: 'dev'
    },
    {
      name: 'Complex Planning Request',
      request: 'Create a comprehensive business strategy for AI startup',
      context: { user: 'jean-patrick' },
      expectedAgent: 'ceo'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.name}`);
    console.log(`Request: "${test.request}"`);
    
    try {
      const decision = await kinglyOS.route(test.request, test.context);
      
      console.log(`✅ Agent routed: ${decision.agent}`);
      console.log(`🎯 Mode: ${decision.mode}`);
      console.log(`📊 Confidence: ${decision.confidence}`);
      
      if (decision.workflow) {
        console.log(`🔄 Workflow: ${decision.workflow}`);
      }
      
      if (decision.mode === 'learning') {
        console.log(`🧪 Learning triggered: ${decision.learning_result.objective}`);
        console.log(`⚡ Experiments: ${decision.learning_result.experiments}`);
      }
      
      // Test assembly quality
      const assemblyResult = decision.result;
      console.log(`💬 Assembly tokens: ${assemblyResult.metadata.tokensUsed}`);
      console.log(`🎯 Assembly confidence: ${assemblyResult.metadata.confidence}`);
      console.log(`📝 Follow-up options: ${assemblyResult.followUpOptions.length}`);
      
      results.push({
        test: test.name,
        success: true,
        agent: decision.agent,
        mode: decision.mode,
        confidence: decision.confidence,
        assembly: {
          tokens: assemblyResult.metadata.tokensUsed,
          confidence: assemblyResult.metadata.confidence,
          followUpOptions: assemblyResult.followUpOptions.length
        }
      });
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 BASIC ASSEMBLY TEST RESULTS');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  console.log(`✅ Successful tests: ${successful.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgConfidence = successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length;
    const avgTokens = successful.reduce((sum, r) => sum + r.assembly.tokens, 0) / successful.length;
    
    console.log(`📊 Average routing confidence: ${avgConfidence.toFixed(2)}`);
    console.log(`💬 Average token usage: ${avgTokens.toFixed(0)}`);
    console.log(`🎯 Assembly working: ${successful.every(r => r.assembly.confidence > 0.5) ? 'YES' : 'NO'}`);
  }
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed tests:');
    failed.forEach(f => console.log(`  - ${f.test}: ${f.error}`));
  }
  
  return {
    testName: 'Basic Assembly Test',
    totalTests: results.length,
    successful: successful.length,
    failed: failed.length,
    results: results
  };
}

export async function testContextAssemblyDetails() {
  console.log('\n🔍 DETAILED CONTEXT ASSEMBLY TEST');
  console.log('='.repeat(50));
  
  const kinglyOS = new KinglyOS();
  await kinglyOS.initialize();
  
  // Test specific assembly scenarios
  const assemblyTests = [
    {
      scenario: 'New Project Research',
      agent: 'researcher',
      task: 'Research emerging trends in quantum computing',
      context: { history: [] }, // New project
      expectedInjections: ['new_project']
    },
    {
      scenario: 'Follow-up Research',
      agent: 'researcher', 
      task: 'Research additional quantum computing applications',
      context: { history: [{ agent: 'researcher', task: 'previous research' }] },
      expectedInjections: ['followup_research']
    },
    {
      scenario: 'Post-Research Writing',
      agent: 'writer',
      task: 'Write article about quantum computing',
      context: { research_complete: true },
      expectedInjections: ['post_research']
    }
  ];
  
  for (const test of assemblyTests) {
    console.log(`\n🔬 Testing: ${test.scenario}`);
    
    try {
      const assemblyRequest = {
        agent: test.agent,
        task: test.task,
        context: test.context,
        user: 'jean-patrick',
        workflow: null,
        history: test.context.history || []
      };
      
      const assembled = await kinglyOS.assembleContext(assemblyRequest);
      
      console.log(`📝 Base prompt: "${assembled.instructions.split('\n')[0]}"`);
      console.log(`⚙️ Rules used: ${assembled.metadata.rulesUsed.join(', ')}`);
      console.log(`📋 Prepends: ${assembled.metadata.prependCount}`);
      console.log(`📋 Appends: ${assembled.metadata.appendCount}`);
      console.log(`💬 Estimated tokens: ${assembled.estimatedTokens}`);
      console.log(`🎯 Confidence: ${assembled.confidence}`);
      
      if (assembled.learningMode.recommended) {
        console.log(`🧪 Learning mode: ${assembled.learningMode.reason}`);
      }
      
    } catch (error) {
      console.log(`❌ Assembly test failed: ${error.message}`);
    }
  }
  
  return { testName: 'Context Assembly Details', completed: true };
}