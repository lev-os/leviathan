/**
 * Cognitive Parliament Demo
 * 
 * Demonstrates bi-directional orchestration with the cognitive parliament workflow
 * Shows how the CLI orchestrates the LLM through multiple personality contexts
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowOrchestrator, FlowMind } from '../src/index.js';

async function runCognitiveParliamentDemo() {
  console.log('🧠 Cognitive Parliament Orchestration Demo');
  console.log('=========================================\n');
  
  // Load the cognitive parliament workflow
  const workflowPath = path.join(
    process.env.HOME || '',
    'c/workflows/cognitive-parliament/context.yaml'
  );
  
  let workflowYaml;
  try {
    const content = await fs.readFile(workflowPath, 'utf-8');
    workflowYaml = yaml.load(content);
  } catch (error) {
    console.error('Could not load workflow:', error.message);
    console.log('\nUsing demo workflow instead...\n');
    workflowYaml = getDemoWorkflow();
  }
  
  // Create orchestrator with demo event handler
  const orchestrator = new WorkflowOrchestrator({
    onEvent: (event, data) => {
      console.log(`\n🔔 EVENT: ${event}`);
      
      if (event === 'llm:inject') {
        console.log('📤 Injecting context into LLM:');
        console.log(`   Callback ID: ${data.callbackId}`);
        console.log(`   Instruction: ${data.instruction.slice(0, 200)}...`);
        
        // Simulate LLM processing and callback
        simulateLLMProcessing(orchestrator, data.callbackId, data.context);
      }
    }
  });
  
  // Test question for parliament
  const input = {
    question: "Should we integrate fast-agent workflows into Leviathan?",
    context: "We need to enhance multi-agent orchestration capabilities",
    constraints: [
      "Maintain backward compatibility",
      "Preserve session management",
      "Enable unlimited agent chains"
    ]
  };
  
  console.log('📋 Input Question:', input.question);
  console.log('🎯 Context:', input.context);
  console.log('⚠️  Constraints:', input.constraints.join(', '));
  console.log('\n🚀 Starting orchestration...\n');
  
  // Execute the workflow
  const result = await orchestrator.orchestrate(workflowYaml, input);
  
  console.log('\n✅ Orchestration Complete!');
  console.log('========================\n');
  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Simulate LLM processing for demo
 */
async function simulateLLMProcessing(orchestrator, callbackId, context) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`\n🤖 LLM Processing as ${context.personality || context.stepId}...`);
  
  // Generate response based on personality
  let response;
  
  if (context.personality) {
    response = generatePersonalityResponse(context.personality, context.input);
  } else if (context.stepId === 'synthesis') {
    response = generateSynthesisResponse(context.allPerspectives);
  } else {
    response = {
      output: `Processed step ${context.stepId}`,
      timestamp: new Date().toISOString()
    };
  }
  
  console.log(`✅ LLM Response generated`);
  
  // Send callback
  await orchestrator.handleLLMCallback(callbackId, response);
}

/**
 * Generate personality-specific response
 */
function generatePersonalityResponse(personality, input) {
  const responses = {
    sfj_caregiver: {
      output: `## Caregiver Perspective (SFJ)

As the caregiver focused on stability and harmony, I see several concerns:

**Stability Considerations:**
- Integration could disrupt existing workflows that teams rely on
- Need careful migration path to avoid breaking changes
- Must preserve the trust users have in current system

**Harmony Factors:**
- Fast-agent patterns could complement Leviathan's strengths
- Gradual adoption would maintain team cohesion
- Documentation and training essential for smooth transition

**Recommendation:** Proceed cautiously with pilot program first.`,
      
      insights: [
        "Prioritize backward compatibility",
        "Create comprehensive migration guides",
        "Establish support channels for transition"
      ],
      
      concerns: [
        "Risk of fragmenting the ecosystem",
        "Learning curve for existing users",
        "Potential for increased complexity"
      ]
    },
    
    nfp_advocate: {
      output: `## Advocate Perspective (NFP)

This is an exciting opportunity to empower developers! Here's my passionate take:

**Bold Vision:**
- Fast-agent workflows unlock creative possibilities
- Developers can build more sophisticated AI systems
- Removes artificial limitations on agent coordination

**Action Items:**
- Launch community hackathon to explore patterns
- Create showcase of breakthrough use cases
- Empower early adopters as evangelists

**Call to Action:** Don't let fear hold us back - embrace the future!`,
      
      insights: [
        "Huge potential for innovation",
        "Community excitement will drive adoption",
        "First-mover advantage in AI orchestration"
      ],
      
      recommendations: [
        "Start integration immediately",
        "Build public demos",
        "Engage community leaders"
      ]
    },
    
    ntj_strategist: {
      output: `## Strategist Perspective (NTJ)

From a strategic control perspective, this decision has major implications:

**Power Dynamics:**
- Fast-agent gives us orchestration superiority
- Positions Leviathan as the premium choice
- Creates defensible technical moat

**Execution Strategy:**
1. Acquire key fast-agent expertise
2. Integrate core patterns first
3. Build proprietary enhancements
4. Lock in enterprise customers

**Strategic Assessment:** Critical competitive advantage - must act decisively.`,
      
      insights: [
        "Market leadership opportunity",
        "Technical differentiation",
        "Enterprise value creation"
      ],
      
      metrics: {
        marketImpact: "high",
        technicalRisk: "medium",
        strategicValue: "critical"
      }
    }
  };
  
  return responses[personality] || {
    output: `${personality} analysis of the integration proposal...`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate synthesis response
 */
function generateSynthesisResponse(allPerspectives) {
  return {
    output: `## Synthesis of All Perspectives

After analyzing all personality perspectives with entropy-based weighting:

**Consensus Points:**
- Fast-agent integration offers significant value
- Implementation approach is where perspectives diverge
- All agree on maintaining Leviathan's core strengths

**Synthesis Recommendation:**
Given medium entropy level (balanced stability/change needs):

1. **Phase 1**: Pilot integration with Chain and Orchestrator patterns
2. **Phase 2**: Community feedback and iteration
3. **Phase 3**: Full integration with backward compatibility

**Key Success Factors:**
- Caregiver's stability concerns addressed via phased approach
- Advocate's innovation vision realized through pilot program
- Strategist's competitive advantage captured with proprietary enhancements

**Final Decision:** PROCEED with phased integration plan.`,
    
    confidence: 0.85,
    
    nextSteps: [
      "Form integration task force",
      "Define pilot program scope",
      "Create compatibility test suite",
      "Develop migration documentation"
    ],
    
    synthesis: {
      approach: "phased",
      timeline: "3-6 months",
      risk: "managed"
    }
  };
}

/**
 * Get demo workflow if file not found
 */
function getDemoWorkflow() {
  return {
    metadata: {
      type: 'workflow',
      id: 'cognitive-parliament-demo',
      version: '1.0.0',
      description: 'Demo cognitive parliament for orchestration'
    },
    
    workflow_config: {
      philosophy: 'Multiple personalities analyze decisions',
      
      personality_system: {
        sfj_caregiver: {
          core_emotion: 'disgust',
          moral_projection: 'sympathy',
          anti_group_think_prompt: 'Focus only on stability and user needs'
        },
        nfp_advocate: {
          core_emotion: 'stress',
          moral_projection: 'compassion', 
          anti_group_think_prompt: 'Be bold and advocate for change'
        },
        ntj_strategist: {
          core_emotion: 'fear',
          moral_projection: 'control',
          anti_group_think_prompt: 'Focus on strategic advantage'
        }
      },
      
      analysis_rounds: {
        isolation: {
          description: 'Each personality analyzes independently'
        },
        synthesis: {
          description: 'Combine all perspectives'
        }
      }
    }
  };
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runCognitiveParliamentDemo().catch(console.error);
}

export { runCognitiveParliamentDemo };