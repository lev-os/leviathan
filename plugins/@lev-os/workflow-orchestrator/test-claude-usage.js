/**
 * Test: Claude Calling Workflow Orchestrator
 * 
 * This demonstrates how I (Claude) should be calling the workflow orchestrator
 * as if it were an MCP tool available to me
 */

import { WorkflowOrchestrator } from './src/core/workflow-orchestrator.js';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Simulate the workflow_execute tool that would be available to me
 */
async function workflow_execute({ workflow, input, options = {} }) {
  console.log('🔧 Claude calling workflow_execute tool');
  console.log(`   Workflow: ${workflow}`);
  console.log(`   Input: ${JSON.stringify(input, null, 2)}`);
  
  // Create orchestrator with bi-directional handler
  const orchestrator = new WorkflowOrchestrator({
    preserveOutputs: true,
    enableParallel: options.parallel || false,
    onEvent: (event, data) => {
      if (event === 'llm:inject') {
        console.log(`\n🧠 Context injection received by Claude:`);
        console.log(`   Callback ID: ${data.callbackId}`);
        console.log(`   Context: ${JSON.stringify(data.context, null, 2)}`);
        
        // I (Claude) process the injected context and respond
        claudeProcessContext(orchestrator, data.callbackId, data.context);
      }
    }
  });
  
  // Load the workflow
  const workflowData = await loadWorkflow(workflow);
  
  // Execute the orchestration
  return await orchestrator.orchestrate(workflowData, input);
}

/**
 * This simulates how I (Claude) would process injected contexts
 */
async function claudeProcessContext(orchestrator, callbackId, context) {
  // Simulate Claude thinking time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`\n🤔 Claude processing context...`);
  
  let response;
  
  if (context.personality) {
    // I'm being asked to think as a specific personality
    console.log(`   🎭 Embodying personality: ${context.personality}`);
    response = processAsPersonality(context.personality, context.input);
  } else if (context.stepId) {
    // I'm being asked to execute a workflow step
    console.log(`   📋 Executing step: ${context.stepId}`);
    response = processWorkflowStep(context.stepId, context.input);
  } else {
    // Generic processing
    response = {
      output: `Processed context: ${JSON.stringify(context)}`,
      timestamp: new Date().toISOString()
    };
  }
  
  console.log(`✅ Claude responding with output`);
  
  // I callback to the orchestrator with my response
  await orchestrator.handleLLMCallback(callbackId, response);
}

/**
 * How I (Claude) would process as different personalities
 */
function processAsPersonality(personality, input) {
  const responses = {
    'sfj_caregiver': {
      output: `**As SFJ Caregiver (Disgust/Sympathy perspective):**

Looking at integrating fast-agent workflows into Leviathan, I'm deeply concerned about:

**Risks I'm disgusted by:**
- Rushed integration without proper user impact assessment
- Breaking existing user workflows people depend on
- Adding complexity that hurts the user experience

**What deserves sympathy:**
- Current users struggling with session management limitations
- Developers who need better orchestration tools
- The maintenance burden on the team

**My recommendation:** Proceed with extreme caution. Start with extensive user research and backwards compatibility guarantees. The human cost of breaking existing workflows is too high to ignore.`,
      insights: ['User impact must be primary concern', 'Backwards compatibility non-negotiable'],
      concerns: ['Breaking existing workflows', 'Added complexity', 'User experience degradation']
    },
    
    'nfp_advocate': {
      output: `**As NFP Advocate (Stress/Compassion perspective):**

This integration represents an exciting opportunity for growth! Here's what I see:

**Exciting possibilities:**
- Unlimited agent chains could revolutionize how we think about AI workflows
- Better orchestration unlocks creative new use cases
- Enhanced multi-agent capabilities align with future AI trends

**Compassionate considerations:**
- Developers are stressed by current limitations - this could relieve that
- Users want more powerful tools but need gentle transitions
- The Leviathan ecosystem needs to evolve to stay relevant

**My vision:** Embrace this integration as a strategic leap forward, but implement it with compassion for all stakeholders. Create migration paths and extensive documentation.`,
      insights: ['Strategic opportunity for ecosystem evolution', 'Need compassionate implementation'],
      opportunities: ['Unlimited agent chains', 'Creative new use cases', 'Future-proofing']
    }
  };
  
  return responses[personality] || {
    output: `Analysis from ${personality} perspective: ${JSON.stringify(input)}`
  };
}

/**
 * How I (Claude) would process workflow steps
 */
function processWorkflowStep(stepId, input) {
  if (stepId.includes('synthesis')) {
    return {
      output: `## Multi-Perspective Synthesis

**Consensus Areas:**
- Integration has strategic value for Leviathan's future
- Backwards compatibility is essential
- Implementation approach matters more than timing

**Key Tensions:**
- Innovation urgency vs. stability requirements
- User needs vs. technical capabilities
- Short-term disruption vs. long-term benefits

**Recommended Path Forward:**
1. **Phase 1**: Research and compatibility layer development
2. **Phase 2**: Gradual rollout with extensive testing
3. **Phase 3**: Full integration with migration support

**Confidence Level**: High (based on multi-perspective analysis)`,
      
      recommendations: [
        'Develop compatibility layer first',
        'Implement gradual rollout strategy',
        'Prioritize user research and feedback'
      ],
      
      synthesis: {
        consensus: 'Strategic value with careful implementation',
        confidence: 0.85,
        approach: 'phased_integration'
      }
    };
  }
  
  return {
    output: `Processed workflow step: ${stepId}`,
    stepAnalysis: `Analysis of ${stepId} with input: ${JSON.stringify(input)}`
  };
}

/**
 * Load workflow from various sources
 */
async function loadWorkflow(workflow) {
  // Try to load from ~/c first
  const contextPath = path.join(process.env.HOME || '', 'c');
  const searchPaths = [
    path.join(contextPath, 'workflows', workflow, 'context.yaml'),
    path.join(contextPath, 'patterns', workflow, 'context.yaml'),
    path.join(contextPath, 'agents', workflow, 'context.yaml')
  ];
  
  for (const searchPath of searchPaths) {
    try {
      const content = await fs.readFile(searchPath, 'utf-8');
      return yaml.load(content);
    } catch (err) {
      // Continue searching
    }
  }
  
  // Fall back to demo workflow
  return getDemoWorkflow();
}

/**
 * Demo workflow for testing
 */
function getDemoWorkflow() {
  return {
    metadata: {
      type: 'pattern',
      id: 'cognitive-parliament',
      description: 'Multi-perspective decision analysis'
    },
    workflow_config: {
      personality_system: {
        eeps_mapping: {
          sfj_caregiver: {
            core_emotion: 'disgust',
            moral_projection: 'sympathy'
          },
          nfp_advocate: {
            core_emotion: 'stress',
            moral_projection: 'compassion'
          }
        }
      }
    }
  };
}

/**
 * Test the bi-directional flow
 */
async function testClaudeUsage() {
  console.log('🚀 Testing Claude calling workflow orchestrator');
  console.log('==============================================\n');
  
  try {
    // This is how I (Claude) would call the tool
    const result = await workflow_execute({
      workflow: 'cognitive-parliament',
      input: {
        question: 'Should we integrate fast-agent workflows into Leviathan?',
        context: 'Strategic decision about enhancing multi-agent orchestration',
        constraints: ['Maintain backwards compatibility', 'Preserve session management']
      },
      options: {
        parallel: false
      }
    });
    
    console.log('\n🎉 Orchestration complete!');
    console.log('==========================');
    console.log(`Success: ${result.success}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Steps: ${result.outputs?.steps?.length || 0}`);
    
    if (result.outputs?.steps) {
      console.log('\n📊 Step Outputs:');
      result.outputs.steps.forEach((step, i) => {
        console.log(`${i + 1}. ${step.stepId}: ${step.raw?.output?.slice(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testClaudeUsage().catch(console.error);
}

export { workflow_execute, testClaudeUsage };