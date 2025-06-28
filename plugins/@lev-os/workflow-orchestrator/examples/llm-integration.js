/**
 * LLM Integration Example
 * 
 * Shows how to connect the workflow orchestrator to real LLMs
 */

import { WorkflowOrchestrator } from '../src/core/workflow-orchestrator.js';
import { LLMProvider } from '../src/llm/llm-provider.js';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

async function testLLMIntegration() {
  console.log('🤖 Testing Real LLM Integration');
  console.log('================================\n');
  
  // Create LLM provider
  const llmProvider = LLMProvider.fromEnvironment();
  console.log(`✅ Using LLM provider: ${llmProvider.provider}`);
  console.log(`   Model: ${llmProvider.model}\n`);
  
  // Create orchestrator with real LLM connection
  const orchestrator = new WorkflowOrchestrator({
    preserveOutputs: true,
    callbackTimeout: 60000, // 1 minute for real LLM responses
    onEvent: async (event, data) => {
      if (event === 'llm:inject') {
        console.log(`\n🔄 Invoking LLM for: ${data.context.stepId || data.context.personality}`);
        
        try {
          // Invoke real LLM
          const response = await llmProvider.invoke(data.context);
          
          console.log('✅ LLM Response received');
          console.log(`   Output length: ${response.output.length} chars`);
          if (response.files) {
            console.log(`   Files created: ${response.files.join(', ')}`);
          }
          if (response.insights) {
            console.log(`   Insights: ${response.insights.length}`);
          }
          
          // Send response back to orchestrator
          await orchestrator.handleLLMCallback(data.callbackId, response);
          
        } catch (error) {
          console.error('❌ LLM invocation failed:', error.message);
          // Let the orchestration timeout
        }
      }
    }
  });
  
  // Test with a simple workflow
  await testSimpleWorkflow(orchestrator);
  
  // Test with cognitive parliament if API key available
  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    await testCognitiveParliament(orchestrator);
  }
}

async function testSimpleWorkflow(orchestrator) {
  console.log('\n📝 Testing Simple Workflow with Real LLM');
  console.log('----------------------------------------');
  
  const workflow = {
    metadata: {
      type: 'workflow',
      id: 'test-llm-workflow',
      description: 'Test workflow for LLM integration'
    },
    workflow_config: {
      steps: [
        {
          id: 'analyze',
          name: 'Analyze Request',
          instruction: 'Analyze the user request and identify key requirements. Output a structured analysis with: 1) Main objective, 2) Key requirements, 3) Potential challenges'
        },
        {
          id: 'plan',
          name: 'Create Plan',
          instruction: 'Based on the analysis, create a detailed implementation plan. Include specific steps, technologies, and estimated effort.'
        },
        {
          id: 'summarize',
          name: 'Summarize',
          instruction: 'Create a concise executive summary of the analysis and plan. Format as markdown with clear sections.'
        }
      ]
    }
  };
  
  const input = {
    request: 'Build a real-time collaborative document editor',
    constraints: ['Must support 100+ concurrent users', 'Need offline mode', 'Version history required']
  };
  
  console.log('🚀 Executing workflow with real LLM...');
  
  try {
    const result = await orchestrator.orchestrate(workflow, input);
    
    console.log('\n✅ Workflow completed!');
    console.log(`   Success: ${result.success}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Steps completed: ${result.outputs?.steps?.length || 0}`);
    
    if (result.outputs?.summary) {
      console.log('\n📊 Final Summary:');
      console.log(result.outputs.summary);
    }
    
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

async function testCognitiveParliament(orchestrator) {
  console.log('\n\n🧠 Testing Cognitive Parliament with Real LLM');
  console.log('--------------------------------------------');
  
  try {
    // Load real cognitive parliament workflow
    const workflowPath = path.join(
      process.env.HOME || '',
      'c/workflows/cognitive-parliament/context.yaml'
    );
    
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflow = yaml.load(content);
    
    console.log('✅ Loaded cognitive parliament workflow');
    console.log(`   Personalities: ${Object.keys(workflow.workflow_config?.personality_system?.eeps_mapping || {}).length}`);
    
    const input = {
      question: 'Should we migrate our monolithic application to microservices?',
      context: 'We have a 5-year-old monolith with 500k LOC, 20 developers, and growing performance issues'
    };
    
    console.log('\n🚀 Executing cognitive parliament with real LLM...');
    console.log('   This will invoke multiple personality perspectives');
    
    const result = await orchestrator.orchestrate(workflow, input);
    
    console.log('\n✅ Cognitive Parliament Complete!');
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Success: ${result.success}`);
    
    if (result.outputs?.summary) {
      console.log('\n🎭 Multi-Perspective Synthesis:');
      console.log(result.outputs.summary);
    }
    
  } catch (error) {
    if (error.message.includes('ENOENT')) {
      console.log('⚠️  Cognitive parliament workflow not found - skipping');
    } else {
      console.error('❌ Cognitive parliament failed:', error.message);
    }
  }
}

// Example of creating a custom LLM provider
function createCustomProvider() {
  return new LLMProvider({
    provider: 'claude',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229',
    temperature: 0.8,
    systemPrompt: `You are an expert workflow orchestration agent with deep knowledge of software architecture and system design.

When analyzing requests, provide detailed technical insights and practical recommendations. Structure your outputs clearly with markdown formatting.

For personality-based responses (cognitive parliament), fully embody the specified personality archetype and provide unique perspectives based on that worldview.`
  });
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testLLMIntegration().catch(console.error);
}

export { testLLMIntegration };