/**
 * Three-Tier Research Demo
 * 
 * Demonstrates how the orchestrator manages complex research workflows
 * with parallel execution, dynamic deep dives, and output synthesis
 */

import { WorkflowOrchestrator, FlowMind } from '../src/index.js';

async function runThreeTierResearchDemo() {
  console.log('🔬 Three-Tier Research Orchestration Demo');
  console.log('=========================================\n');
  
  // Define the three-tier research workflow
  const workflowYaml = {
    metadata: {
      type: 'workflow',
      id: 'three-tier-research-demo',
      version: '1.0.0',
      description: 'Progressive research: broad → deep → strategic'
    },
    
    workflow_config: {
      philosophy: 'Start broad, dive deep on discoveries, validate strategically',
      
      tier_structure: {
        tier_1: {
          name: 'Broad Base Research',
          duration: '30_minutes',
          approach: 'parallel_exploration',
          parallel: true
        },
        tier_2: {
          name: 'Dynamic Deep Dives', 
          duration: '45_minutes',
          approach: 'relevance_driven'
        },
        tier_3: {
          name: 'Strategic Validation',
          duration: '30_minutes', 
          approach: 'positioning_focus'
        }
      },
      
      steps: [
        // Tier 1: Parallel research streams
        {
          id: 'tier-1-parallel',
          name: 'Broad Base Research',
          parallel: [
            {
              id: 'technical-research',
              name: 'Technical Analysis',
              agent: 'deep-researcher',
              instruction: 'Research technical aspects and implementation patterns'
            },
            {
              id: 'market-research',
              name: 'Market Analysis',
              agent: 'market-analyst',
              instruction: 'Analyze market trends and competitive landscape'
            },
            {
              id: 'user-research',
              name: 'User Research',
              agent: 'ux-researcher',
              instruction: 'Understand user needs and pain points'
            },
            {
              id: 'academic-research',
              name: 'Academic Research',
              agent: 'academic-researcher',
              instruction: 'Find relevant papers and theoretical foundations'
            }
          ]
        },
        
        // Tier 2: Dynamic deep dives based on Tier 1
        {
          id: 'tier-2-synthesis',
          name: 'Identify High-Value Topics',
          instruction: 'Analyze Tier 1 outputs and identify top 3 areas for deep dive',
          expectedOutputs: ['focusAreas', 'rationale']
        },
        {
          id: 'tier-2-deep-dive',
          name: 'Deep Dive Research',
          instruction: 'Conduct deep research on identified focus areas',
          inputRequirements: {
            includePrevious: true,
            extract: ['focusAreas']
          }
        },
        
        // Tier 3: Strategic validation
        {
          id: 'tier-3-validation',
          name: 'Strategic Validation',
          agent: 'strategic-advisor',
          instruction: 'Validate findings for competitive advantage and actionability',
          inputRequirements: {
            includeMarkdown: true,
            includeFiles: true
          }
        },
        {
          id: 'final-synthesis',
          name: 'Create Final Report',
          template: 'research-report.md',
          instruction: 'Synthesize all findings into actionable intelligence report',
          expectedOutputs: ['report.md', 'executive-summary.md', 'next-steps.json']
        }
      ]
    }
  };
  
  // Create orchestrator with output tracking
  const orchestrator = new WorkflowOrchestrator({
    preserveOutputs: true,
    outputDir: './research-outputs',
    enableParallel: true,
    
    onEvent: (event, data) => {
      if (event === 'llm:inject') {
        console.log(`\n🔄 [${data.context.stepId}] ${data.context.step.name}`);
        
        // Simulate different types of research outputs
        simulateResearchStep(orchestrator, data.callbackId, data.context);
      }
    }
  });
  
  // Research topic
  const input = {
    topic: "AI-native operating systems",
    scope: "Technical feasibility and market opportunity",
    depth: "comprehensive",
    timeframe: "2025-2030"
  };
  
  console.log('📚 Research Topic:', input.topic);
  console.log('🔍 Scope:', input.scope);
  console.log('📊 Depth:', input.depth);
  console.log('📅 Timeframe:', input.timeframe);
  console.log('\n🚀 Starting three-tier research...\n');
  
  // Execute the research workflow
  const result = await orchestrator.orchestrate(workflowYaml, input);
  
  console.log('\n✅ Research Complete!');
  console.log('====================\n');
  
  // Display results
  displayResearchResults(result);
}

/**
 * Simulate research step execution
 */
async function simulateResearchStep(orchestrator, callbackId, context) {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  let response;
  
  switch (context.stepId) {
    case 'technical-research':
      response = generateTechnicalResearch(context.input);
      break;
      
    case 'market-research':
      response = generateMarketResearch(context.input);
      break;
      
    case 'user-research':
      response = generateUserResearch(context.input);
      break;
      
    case 'academic-research':
      response = generateAcademicResearch(context.input);
      break;
      
    case 'tier-2-synthesis':
      response = synthesizeTier1Results(context.input);
      break;
      
    case 'tier-2-deep-dive':
      response = generateDeepDive(context.input);
      break;
      
    case 'tier-3-validation':
      response = validateStrategically(context.input);
      break;
      
    case 'final-synthesis':
      response = createFinalReport(context.input);
      break;
      
    default:
      response = { output: `Completed ${context.stepId}` };
  }
  
  console.log(`   ✅ ${context.stepId} complete`);
  await orchestrator.handleLLMCallback(callbackId, response);
}

/**
 * Generate technical research output
 */
function generateTechnicalResearch(input) {
  return {
    output: `# Technical Analysis: ${input.topic}

## Key Findings

### Architecture Patterns
- **Microkernel Architecture**: Emerging as dominant pattern for AI-OS
- **LLM-as-Runtime**: Revolutionary approach where LLM serves as execution engine
- **Bi-directional Communication**: Critical for context switching and emergence

### Implementation Challenges
1. **Performance**: Context switching overhead in LLM orchestration
2. **State Management**: Maintaining coherence across personality switches
3. **Resource Usage**: GPU/TPU requirements for real-time operation

### Technical Opportunities
- **Semantic Control Flow**: Natural language as programming paradigm
- **Emergent Behaviors**: Intelligence beyond individual components
- **Self-Optimization**: Systems that improve through usage

## Code Samples
\`\`\`javascript
// Example: FlowMind context switching
const context = await orchestrator.switchContext('analytical-personality');
const result = await llm.process(context);
await orchestrator.adaptFromFeedback(result);
\`\`\`

## Recommended Technologies
- **Rust**: For high-performance kernel components
- **TypeScript**: For orchestration layer
- **WASM**: For sandboxed execution
- **gRPC**: For inter-process communication`,
    
    files: [
      {
        name: 'technical-analysis.md',
        content: 'Full technical analysis document...'
      },
      {
        name: 'architecture-diagram.svg',
        content: '<svg>...</svg>'
      }
    ],
    
    metrics: {
      feasibility: 0.85,
      complexity: 0.9,
      innovation: 0.95
    }
  };
}

/**
 * Generate market research output
 */
function generateMarketResearch(input) {
  return {
    output: `# Market Analysis: ${input.topic}

## Market Size & Growth
- **Current Market**: $2.3B (2024)
- **Projected Market**: $45.6B (2030)
- **CAGR**: 82.3%

## Key Players
1. **Anthropic**: Claude-based systems
2. **OpenAI**: GPT-OS initiatives
3. **Google**: Gemini OS research
4. **Startups**: 50+ stealth companies

## Market Trends
- Shift from tool-based to OS-based AI
- Enterprise demand for autonomous systems
- Developer tools becoming AI-native

## Competitive Advantages
- First-mover in true AI-native OS
- Open-source community approach
- Extensible plugin architecture`,
    
    data: {
      marketSize: { 2024: 2.3, 2030: 45.6, unit: 'billion_usd' },
      competitors: ['Anthropic', 'OpenAI', 'Google', 'Microsoft'],
      trends: ['ai-native', 'autonomous', 'developer-first']
    }
  };
}

/**
 * Generate user research output
 */
function generateUserResearch(input) {
  return {
    output: `# User Research: ${input.topic}

## User Segments
1. **AI Researchers**: Need flexible experimentation platform
2. **Enterprise Developers**: Require stable, scalable solutions
3. **Startups**: Want rapid prototyping capabilities
4. **Hobbyists**: Seek accessible, well-documented tools

## Pain Points
- Current tools are fragmented
- Steep learning curves
- Limited extensibility
- Poor multi-agent coordination

## Desired Features
- Seamless workflow orchestration
- Visual debugging tools
- One-click deployment
- Community marketplace`,
    
    insights: [
      "Users want simplicity without sacrificing power",
      "Visual tools critical for adoption",
      "Community ecosystem is key differentiator"
    ]
  };
}

/**
 * Generate academic research output
 */
function generateAcademicResearch(input) {
  return {
    output: `# Academic Research: ${input.topic}

## Relevant Papers
1. "FlowMind: Bi-directional LLM Orchestration" (2024)
2. "Emergent Intelligence in Multi-Agent Systems" (2023)
3. "Semantic Operating Systems: A New Paradigm" (2024)

## Theoretical Foundations
- **Distributed Cognition Theory**
- **Emergent Systems Theory**
- **Semantic Computing Principles**

## Research Gaps
- Limited work on LLM-as-runtime architecture
- Need for formal verification methods
- Lack of standardized benchmarks`,
    
    files: [
      {
        name: 'bibliography.bib',
        content: '@article{flowmind2024,...}'
      }
    ],
    
    recommendations: [
      "Collaborate with MIT CSAIL",
      "Establish research consortium",
      "Publish foundational papers"
    ]
  };
}

/**
 * Synthesize Tier 1 results
 */
function synthesizeTier1Results(input) {
  return {
    output: `# Tier 1 Synthesis

Based on parallel research streams, identified high-value areas:

1. **LLM-Runtime Architecture** (Technical + Academic convergence)
2. **Enterprise Orchestration** (Market + User demand alignment)  
3. **Community Ecosystem** (User needs + Market differentiator)`,
    
    focusAreas: [
      "LLM-Runtime Architecture",
      "Enterprise Orchestration",
      "Community Ecosystem"
    ],
    
    rationale: "These areas show strongest signal across all research dimensions"
  };
}

/**
 * Generate deep dive research
 */
function generateDeepDive(input) {
  const focusAreas = input.focusAreas || [];
  
  return {
    output: `# Deep Dive Analysis

## ${focusAreas[0]}: LLM-Runtime Architecture
- Detailed implementation strategies
- Performance optimization techniques
- Case studies from early adopters

## ${focusAreas[1]}: Enterprise Orchestration
- Workflow patterns for scale
- Integration with existing systems
- Security and compliance considerations

## ${focusAreas[2]}: Community Ecosystem
- Plugin development framework
- Marketplace economics
- Growth strategies`,
    
    files: [
      {
        name: 'deep-dive-llm-runtime.pdf',
        content: 'Detailed 50-page analysis...'
      },
      {
        name: 'enterprise-patterns.md',
        content: 'Enterprise workflow patterns...'
      }
    ]
  };
}

/**
 * Validate strategically
 */
function validateStrategically(input) {
  return {
    output: `# Strategic Validation

## Competitive Positioning
✅ **Unique Value**: First true AI-native OS with bi-directional orchestration
✅ **Defensibility**: Open-source community + proprietary enterprise features
✅ **Timing**: Market inflection point approaching

## Risk Assessment
⚠️  **Technical Risk**: MEDIUM - Requires R&D investment
⚠️  **Market Risk**: LOW - Clear demand signals
⚠️  **Execution Risk**: MEDIUM - Need strong team

## Strategic Recommendation
**GO** - Proceed with phased development and community building`,
    
    validation: {
      score: 0.88,
      recommendation: 'proceed',
      confidence: 'high'
    }
  };
}

/**
 * Create final report
 */
function createFinalReport(input) {
  return {
    output: `# AI-Native Operating Systems: Research Report

## Executive Summary
The research validates strong opportunity for AI-native operating systems...

## Key Findings
1. Technical feasibility confirmed with FlowMind architecture
2. Market opportunity of $45B by 2030
3. Clear user demand across all segments
4. Academic foundation supports approach

## Recommendations
1. Begin development of core orchestration engine
2. Build community with open-source release
3. Partner with enterprises for pilot programs

## Next Steps
See next-steps.json for detailed action plan`,
    
    files: [
      {
        name: 'report.md',
        content: 'Full 100-page research report...'
      },
      {
        name: 'executive-summary.md',
        content: 'One-page executive summary...'
      },
      {
        name: 'next-steps.json',
        content: JSON.stringify({
          immediate: ['Form technical team', 'Define MVP scope'],
          shortTerm: ['Build prototype', 'Engage community'],
          longTerm: ['Scale platform', 'Expand ecosystem']
        }, null, 2)
      }
    ]
  };
}

/**
 * Display research results
 */
function displayResearchResults(result) {
  console.log('📊 Research Summary:');
  console.log(`   Total Duration: ${result.duration}ms`);
  console.log(`   Files Generated: ${result.outputs?.fileCount || 0}`);
  console.log(`   Research Steps: ${result.outputs?.steps?.length || 0}`);
  
  if (result.outputs?.files) {
    console.log('\n📁 Output Files:');
    result.outputs.files.forEach(file => {
      console.log(`   - ${file.name} (${file.type})`);
    });
  }
  
  if (result.result?.outputs?.highlights) {
    console.log('\n✨ Key Insights:');
    result.result.outputs.highlights.forEach(highlight => {
      console.log(`   - ${highlight}`);
    });
  }
  
  console.log('\n🎯 Research complete! Check ./research-outputs for all files.');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runThreeTierResearchDemo().catch(console.error);
}

export { runThreeTierResearchDemo };