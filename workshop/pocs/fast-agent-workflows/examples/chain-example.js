/**
 * Chain Workflow Example
 * 
 * Demonstrates how to use the chain workflow pattern
 * to process data through multiple agents in sequence.
 */

import { WorkflowEngine } from '../src/index.js';

async function runChainExample() {
  // Initialize workflow engine
  const engine = new WorkflowEngine();
  
  // Define a chain workflow configuration
  const chainConfig = {
    sequence: ['researcher', 'analyzer', 'summarizer'],
    agents: {
      researcher: {
        instruction: 'Search for information about the topic',
        servers: ['web-search'],
        initialInput: 'AI agent orchestration patterns'
      },
      analyzer: {
        instruction: 'Analyze the research findings for key patterns',
        servers: []
      },
      summarizer: {
        instruction: 'Create a concise summary of the analysis',
        servers: []
      }
    }
  };
  
  console.log('Starting Chain Workflow Example...\n');
  
  try {
    // Execute the chain workflow
    const result = await engine.execute('chain', chainConfig);
    
    console.log('Chain Workflow Completed!');
    console.log('=========================\n');
    
    console.log('Final Result:', result.finalResult);
    console.log('\nExecution Log:');
    result.executionLog.forEach((log, index) => {
      console.log(`\nStep ${index + 1}: ${log.agent}`);
      console.log(`Duration: ${log.duration}ms`);
      console.log(`Output:`, log.output);
    });
    
  } catch (error) {
    console.error('Chain workflow failed:', error);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runChainExample().catch(console.error);
}

export { runChainExample };