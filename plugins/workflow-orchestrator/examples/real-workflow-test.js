/**
 * Real Workflow Test
 * 
 * Tests the orchestrator with actual YAML workflows from ~/c
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowOrchestrator } from '../src/index.js';

async function testRealWorkflows() {
  console.log('🔄 Testing Real Workflows from ~/c');
  console.log('==================================\n');
  
  // Test cognitive parliament first
  await testCognitiveParliament();
  
  // Test three-tier research
  await testThreeTierResearch();
  
  // Test kingly builder
  await testKinglyBuilder();
}

async function testCognitiveParliament() {
  console.log('🧠 Testing Cognitive Parliament Workflow');
  console.log('----------------------------------------');
  
  try {
    const workflowPath = path.join(
      process.env.HOME || '',
      'c/workflows/cognitive-parliament/context.yaml'
    );
    
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflowYaml = yaml.load(content);
    
    console.log('✅ Loaded real cognitive parliament YAML');
    console.log(`   Type: ${workflowYaml.metadata?.type}`);
    console.log(`   ID: ${workflowYaml.metadata?.id}`);
    console.log(`   Personalities: ${Object.keys(workflowYaml.workflow_config?.personality_system?.eeps_mapping || {}).length}`);
    
    // Create orchestrator with personality simulation
    const orchestrator = new WorkflowOrchestrator({
      onEvent: (event, data) => {
        if (event === 'llm:inject') {
          console.log(`\n🔄 Context Switch: ${data.context.stepId}`);
          
          // Simulate personality-specific responses
          simulatePersonalityResponse(orchestrator, data.callbackId, data.context);
        }
      }
    });
    
    const input = {
      question: "Should we build this workflow orchestrator?",
      context: "Evaluating the technical and strategic implications"
    };
    
    console.log('\n🚀 Executing real cognitive parliament...');
    const result = await orchestrator.orchestrate(workflowYaml, input);
    
    console.log(`\n✅ Real Cognitive Parliament Complete!`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Steps: ${result.outputs?.steps?.length || 0}`);
    console.log(`   Success: ${result.success}`);
    
  } catch (error) {
    console.log('⚠️  Could not load real cognitive parliament:', error.message);
    console.log('   This is expected if ~/c workflows are not available');
  }
  
  console.log('\n');
}

async function testThreeTierResearch() {
  console.log('🔬 Testing Three-Tier Research Workflow');
  console.log('---------------------------------------');
  
  try {
    const workflowPath = path.join(
      process.env.HOME || '',
      'c/workflows/research/three-tier-deep/context.yaml'
    );
    
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflowYaml = yaml.load(content);
    
    console.log('✅ Loaded real three-tier research YAML');
    console.log(`   Type: ${workflowYaml.metadata?.type}`);
    console.log(`   ID: ${workflowYaml.metadata?.id}`);
    console.log(`   Tiers: ${Object.keys(workflowYaml.workflow_config?.tier_structure || {}).length}`);
    
    const orchestrator = new WorkflowOrchestrator({
      enableParallel: true,
      onEvent: (event, data) => {
        if (event === 'llm:inject') {
          console.log(`\n🔄 Research Step: ${data.context.stepId}`);
          simulateResearchResponse(orchestrator, data.callbackId, data.context);
        }
      }
    });
    
    const input = {
      topic: "Workflow orchestration systems",
      scope: "Technical analysis and market research",
      depth: "comprehensive"
    };
    
    console.log('\n🚀 Executing real three-tier research...');
    const result = await orchestrator.orchestrate(workflowYaml, input);
    
    console.log(`\n✅ Real Three-Tier Research Complete!`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Steps: ${result.outputs?.steps?.length || 0}`);
    console.log(`   Success: ${result.success}`);
    
  } catch (error) {
    console.log('⚠️  Could not load real three-tier research:', error.message);
  }
  
  console.log('\n');
}

async function testKinglyBuilder() {
  console.log('🏗️  Testing Kingly Builder Workflow');
  console.log('----------------------------------');
  
  try {
    const workflowPath = path.join(
      process.env.HOME || '',
      'c/workflows/kingly-builder/context.yaml'
    );
    
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflowYaml = yaml.load(content);
    
    console.log('✅ Loaded real kingly builder YAML');
    console.log(`   Type: ${workflowYaml.metadata?.type}`);
    console.log(`   ID: ${workflowYaml.metadata?.id}`);
    console.log(`   Steps: ${workflowYaml.workflow_config?.steps?.length || 0}`);
    
    const orchestrator = new WorkflowOrchestrator({
      onEvent: (event, data) => {
        if (event === 'llm:inject') {
          console.log(`\n🔄 Builder Step: ${data.context.stepId}`);
          simulateBuilderResponse(orchestrator, data.callbackId, data.context);
        }
      }
    });
    
    const input = {
      request: "Build a workflow orchestration system",
      requirements: ["bi-directional flow", "context switching", "output tracking"]
    };
    
    console.log('\n🚀 Executing real kingly builder...');
    const result = await orchestrator.orchestrate(workflowYaml, input);
    
    console.log(`\n✅ Real Kingly Builder Complete!`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Steps: ${result.outputs?.steps?.length || 0}`);
    console.log(`   Success: ${result.success}`);
    
  } catch (error) {
    console.log('⚠️  Could not load real kingly builder:', error.message);
  }
  
  console.log('\n');
}

async function simulatePersonalityResponse(orchestrator, callbackId, context) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const responses = {
    'isolation': {
      output: 'Isolation phase complete - each personality analyzed independently'
    },
    'perspective': {
      output: `Multiple perspectives gathered:
- SFJ Caregiver: Focus on stability and user needs
- NFP Advocate: Bold vision for innovation
- NTJ Strategist: Strategic competitive advantage
- Other personalities: Various complementary viewpoints`
    },
    'synthesis': {
      output: `## Multi-Perspective Synthesis

**Consensus**: Workflow orchestrator provides significant value
**Entropy Level**: Medium (balanced approach recommended)
**Recommendation**: Proceed with phased implementation

**Key Insights**:
- Technical feasibility confirmed
- Market opportunity validated  
- Risk mitigation through staged rollout`,
      insights: ['Strong technical foundation', 'Clear market need', 'Manageable implementation'],
      recommendations: ['Build core SDK first', 'Test with pilot users', 'Expand gradually']
    }
  };
  
  const response = responses[context.stepId] || responses['synthesis'];
  await orchestrator.handleLLMCallback(callbackId, response);
}

async function simulateResearchResponse(orchestrator, callbackId, context) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const response = {
    output: `Research findings for ${context.stepId}:
- Technical analysis complete
- Market data gathered
- User insights collected
- Academic research reviewed`,
    files: [`${context.stepId}-research.md`],
    insights: [`Key finding from ${context.stepId}`]
  };
  
  await orchestrator.handleLLMCallback(callbackId, response);
}

async function simulateBuilderResponse(orchestrator, callbackId, context) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const responses = {
    'step-1': {
      output: 'Request analyzed - workflow orchestration system requirements identified',
      analysis: 'User needs bi-directional flow with context switching'
    },
    'step-2': {
      output: 'Architecture suggested - hexagonal design with core SDK and adapters',
      architecture: 'Core SDK → CLI Adapter → MCP Integration'
    },
    'step-3': {
      output: 'Templates recommended - FlowMind base class and orchestration engine',
      templates: ['FlowMind.js', 'WorkflowOrchestrator.js', 'ContextSwitcher.js']
    }
  };
  
  const response = responses[context.stepId] || {
    output: `Builder step ${context.stepId} complete`
  };
  
  await orchestrator.handleLLMCallback(callbackId, response);
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealWorkflows().catch(console.error);
}

export { testRealWorkflows };