/**
 * Real Chain Workflow Example
 * 
 * Demonstrates a practical use case: Research → Analyze → Synthesize
 * This example shows how to chain Leviathan agents for complex tasks.
 */

import { EnhancedChainWorkflow } from '../src/workflows/chain-enhanced.js';

async function runRealChainExample() {
  console.log('🚀 Real Chain Workflow Example');
  console.log('================================\n');
  
  // Use Case: Research and analyze a technical topic
  const topic = 'multi-agent orchestration patterns';
  
  // Define the chain configuration
  const chainConfig = {
    sequence: ['researcher', 'analyzer', 'synthesizer'],
    agents: {
      researcher: {
        instruction: 'Find relevant information and existing implementations',
        useSemanticLookup: true,
        searchDepth: 'comprehensive'
      },
      analyzer: {
        instruction: 'Analyze the research findings and identify key patterns',
        focusAreas: ['architecture', 'benefits', 'challenges'],
        outputFormat: 'structured'
      },
      synthesizer: {
        instruction: 'Create actionable recommendations for Leviathan',
        perspective: 'implementation',
        maxLength: 500
      }
    }
  };
  
  // Create and execute the workflow
  const workflow = new EnhancedChainWorkflow(chainConfig);
  
  try {
    console.log(`📚 Researching: "${topic}"\n`);
    
    const result = await workflow.execute({
      query: topic,
      context: 'Leviathan agent system enhancement',
      depth: 'detailed'
    });
    
    console.log('\n✅ Chain Workflow Completed Successfully!');
    console.log('=========================================\n');
    
    // Display results
    console.log('📊 Execution Summary:');
    console.log(`- Total Duration: ${result.totalDuration}ms`);
    console.log(`- Steps Executed: ${result.executionLog.length}`);
    console.log(`- Session ID: ${result.sessionId || 'N/A'}\n`);
    
    console.log('📝 Step-by-Step Results:');
    result.executionLog.forEach((step, index) => {
      console.log(`\n${index + 1}. ${step.agent} (${step.duration}ms)`);
      console.log('   Input:', JSON.stringify(step.input).slice(0, 100) + '...');
      console.log('   Output:', JSON.stringify(step.output).slice(0, 200) + '...');
    });
    
    console.log('\n🎯 Final Output:');
    console.log(result.finalOutput);
    
    // Demonstrate session continuity
    if (result.sessionId) {
      console.log('\n📌 To continue this session:');
      console.log(`   lev checkpoint --resume --session ${result.sessionId}`);
    }
    
  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Additional example: Code Review Chain
async function runCodeReviewChain() {
  console.log('\n🔍 Code Review Chain Example');
  console.log('============================\n');
  
  const reviewConfig = {
    sequence: ['linter', 'security-checker', 'reviewer', 'report-generator'],
    agents: {
      'linter': {
        instruction: 'Check code style and common issues',
        rules: 'leviathan-style-guide',
        severity: 'warning'
      },
      'security-checker': {
        instruction: 'Scan for security vulnerabilities',
        scanners: ['pattern-match', 'dependency-check'],
        reportFormat: 'sarif'
      },
      'reviewer': {
        instruction: 'Provide architectural and design feedback',
        perspective: 'senior-engineer',
        focusAreas: ['maintainability', 'performance', 'scalability']
      },
      'report-generator': {
        instruction: 'Generate comprehensive code review report',
        format: 'markdown',
        includeMetrics: true
      }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(reviewConfig);
  
  try {
    const result = await workflow.execute({
      filePath: '/Users/jean-patricksmith/digital/leviathan/agent/src/hybrid-router.js',
      reviewType: 'comprehensive',
      baseline: 'main'
    });
    
    console.log('✅ Code review completed!');
    console.log('Final report:', result.finalOutput);
    
  } catch (error) {
    console.error('Code review failed:', error);
  }
}

// Run examples
async function main() {
  // Run the research chain
  await runRealChainExample();
  
  // Optionally run code review chain
  // await runCodeReviewChain();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runRealChainExample, runCodeReviewChain };