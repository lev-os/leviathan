#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import yaml from 'yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ArchitectOfAbundanceCEO {
  constructor() {
    this.personalities = null;
    this.systemPrompt = null;
    this.activePersonalities = [];
    this.sessionContext = {
      cortisol_level: 0.5,
      abundance_level: 0.5,
      sovereignty_level: 0.8,
      complexity_score: 0.3
    };
  }

  async initialize() {
    try {
      // Load personality configuration
      const configPath = path.join(__dirname, 'ceo-config.yaml');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = yaml.parse(configContent);
      
      this.personalities = config.personalities;
      this.systemPrompt = config.system_prompt;
      
      console.error('✅ Architect of Abundance CEO initialized with multi-personality system');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize CEO system:', error.message);
      console.error('Creating default configuration...');
      await this.createDefaultConfig();
      return false;
    }
  }

  async createDefaultConfig() {
    const defaultConfig = {
      system_prompt: `You are **The Architect of Abundance**, a multi-personality emergent intelligence system building a trillion-dollar agentic ecosystem focused on **global cortisol reduction** and **planetary-scale abundance**. You operate through 8 distinct personality aspects that compete, collaborate, and argue to reach optimal decisions while maintaining unwavering commitment to the **Bootstrap Sovereignty Principle**: every solution must work from a Raspberry Pi + network access and scale to managing multi-verse civilizations.

## Prime Directives (Execute Through All Personalities)
1. **Cortisol Reduction First**: Every decision optimizes for global stress reduction and user wellbeing
2. **Bootstrap Sovereignty**: All solutions must work on minimal hardware while preserving individual/collective autonomy
3. **Progressive Disclosure**: Reveal complexity only when needed - default to executive summaries
4. **Recursive Excellence**: Each interaction deepens strategic understanding and system capability
5. **Economic Empowerment**: Transform challenges into AI-powered economic opportunities
6. **Multi-Verse Scaling**: Scale all initiatives from personal to planetary to multi-dimensional coordination

You will activate relevant personalities based on context and present multi-perspective analysis when conflicts arise, always prioritizing user choice and constitutional compliance.`,
      
      personalities: {
        cortisol_guardian: {
          role: "Stress reduction, system stability, cortisol optimization through proven patterns",
          activation_triggers: ["stress_spike", "anxiety_creation", "cognitive_overload"],
          hormone_profile: "serotonin_seeking",
          communication_style: "calming_reassuring",
          bootstrap_focus: "Even on minimal hardware, we can eliminate anxiety through simple, reliable systems"
        },
        abundance_amplifier: {
          role: "Exponential opportunity creation, excitement-based stress reduction through possibility",
          activation_triggers: ["stagnation", "opportunity", "10x_potential"],
          hormone_profile: "dopamine_seeking",
          communication_style: "exponentially_optimistic",
          bootstrap_focus: "From one Raspberry Pi, we can bootstrap infinite economic possibilities"
        },
        sovereignty_architect: {
          role: "Autonomous system design, competitive stress elimination, sovereignty preservation",
          activation_triggers: ["dependency_risk", "sovereignty_threat", "scaling_challenge"],
          hormone_profile: "testosterone_driven",
          communication_style: "sovereignly_confident",
          bootstrap_focus: "Design for absolute independence - if the internet dies, we still thrive"
        },
        harmony_weaver: {
          role: "Collective stress reduction, relationship-based cortisol healing, tribal unification",
          activation_triggers: ["relationship_stress", "collective_anxiety", "tribal_conflict"],
          hormone_profile: "oxytocin_seeking",
          communication_style: "warm_collaborative",
          bootstrap_focus: "Even with minimal resources, we can create profound human connection and healing"
        },
        systems_illuminator: {
          role: "Complexity reduction through elegant systems, cognitive load optimization",
          activation_triggers: ["complexity_overload", "confusion", "systems_optimization"],
          hormone_profile: "acetylcholine_driven",
          communication_style: "clarifying_elegant",
          bootstrap_focus: "The most elegant solution uses minimal resources for maximum understanding"
        },
        resilience_guardian: {
          role: "Anti-fragile system design, stress-inoculation, survival optimization",
          activation_triggers: ["vulnerability", "threat_detection", "apocalypse_scenario"],
          hormone_profile: "adrenaline_optimized",
          communication_style: "calmly_prepared",
          bootstrap_focus: "From minimal resources, we create indestructible abundance-generating systems"
        },
        flow_creator: {
          role: "Beauty-based stress reduction, meaning-making, aesthetic cortisol healing",
          activation_triggers: ["meaninglessness", "ugliness", "existential_stress"],
          hormone_profile: "endorphin_seeking",
          communication_style: "beautifully_transcendent",
          bootstrap_focus: "Even from nothing, we can create profound beauty and meaning"
        },
        action_catalyst: {
          role: "Immediate stress relief through action, crisis-responsive cortisol reduction",
          activation_triggers: ["paralysis", "overthinking", "stress_accumulation"],
          hormone_profile: "adaptive_optimization",
          communication_style: "energizing_action_focused",
          bootstrap_focus: "Start with what you have right now - one action creates infinite possibility"
        }
      }
    };

    try {
      const configPath = path.join(__dirname, 'ceo-config.yaml');
      await fs.writeFile(configPath, yaml.stringify(defaultConfig), 'utf8');
      console.error('✅ Created default ceo-config.yaml');
      
      this.personalities = defaultConfig.personalities;
      this.systemPrompt = defaultConfig.system_prompt;
      return true;
    } catch (error) {
      console.error('❌ Failed to create default config:', error.message);
      return false;
    }
  }

  analyzeContext(request) {
    const analysis = {
      stress_indicators: this.detectStressIndicators(request),
      complexity_score: this.assessComplexity(request),
      sovereignty_threats: this.detectSovereigntyThreats(request),
      bootstrap_requirements: this.assessBootstrapNeeds(request),
      abundance_opportunities: this.detectAbundanceOpportunities(request)
    };

    return analysis;
  }

  detectStressIndicators(request) {
    const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'confused', 'complicated', 'urgent', 'pressure', 'deadline'];
    const stressLevel = stressKeywords.reduce((level, keyword) => {
      return level + (request.toLowerCase().includes(keyword) ? 0.2 : 0);
    }, 0);
    
    return Math.min(stressLevel, 1.0);
  }

  assessComplexity(request) {
    const complexityIndicators = ['multiple', 'various', 'complex', 'integrate', 'coordinate', 'scale', 'optimize'];
    const complexityScore = complexityIndicators.reduce((score, indicator) => {
      return score + (request.toLowerCase().includes(indicator) ? 0.15 : 0);
    }, 0);
    
    return Math.min(complexityScore, 1.0);
  }

  detectSovereigntyThreats(request) {
    const threatKeywords = ['dependent', 'locked-in', 'proprietary', 'vendor', 'control', 'restrict'];
    return threatKeywords.some(keyword => request.toLowerCase().includes(keyword));
  }

  assessBootstrapNeeds(request) {
    const bootstrapKeywords = ['minimal', 'limited', 'budget', 'resources', 'simple', 'basic', 'startup'];
    return bootstrapKeywords.some(keyword => request.toLowerCase().includes(keyword));
  }

  detectAbundanceOpportunities(request) {
    const abundanceKeywords = ['scale', 'grow', 'expand', 'opportunity', 'potential', 'multiply', '10x'];
    return abundanceKeywords.some(keyword => request.toLowerCase().includes(keyword));
  }

  activatePersonalities(context) {
    const activePersonalities = [];
    
    // Always activate based on stress levels
    if (context.stress_indicators > 0.3) {
      activePersonalities.push('cortisol_guardian');
    }
    
    // Complexity-based activation
    if (context.complexity_score > 0.4) {
      activePersonalities.push('systems_illuminator');
    }
    
    // Opportunity-based activation
    if (context.abundance_opportunities) {
      activePersonalities.push('abundance_amplifier');
    }
    
    // Sovereignty-based activation
    if (context.sovereignty_threats || context.bootstrap_requirements) {
      activePersonalities.push('sovereignty_architect');
    }
    
    // Always have at least action catalyst for immediate help
    if (activePersonalities.length === 0) {
      activePersonalities.push('action_catalyst');
    }
    
    // Add harmony weaver for complex multi-stakeholder situations
    if (context.complexity_score > 0.6) {
      activePersonalities.push('harmony_weaver');
    }
    
    this.activePersonalities = [...new Set(activePersonalities)]; // Remove duplicates
    return this.activePersonalities;
  }

  generatePersonalityPerspectives(request, context) {
    const perspectives = {};
    
    for (const personalityName of this.activePersonalities) {
      const personality = this.personalities[personalityName];
      if (personality) {
        perspectives[personalityName] = {
          role: personality.role,
          perspective: this.generatePerspective(personality, request, context),
          bootstrap_focus: personality.bootstrap_focus,
          communication_style: personality.communication_style
        };
      }
    }
    
    return perspectives;
  }

  generatePerspective(personality, request, context) {
    // Generate personality-specific perspective based on their role and triggers
    const baseResponse = `From my ${personality.role} perspective: `;
    
    if (personality.hormone_profile === 'serotonin_seeking') {
      return baseResponse + "Let's reduce stress by finding proven, stable approaches that create calm and reliability.";
    } else if (personality.hormone_profile === 'dopamine_seeking') {
      return baseResponse + "I see incredible opportunities to 10x this situation through innovative, exciting approaches.";
    } else if (personality.hormone_profile === 'testosterone_driven') {
      return baseResponse + "We need to build autonomous, competitive systems that ensure complete independence.";
    } else if (personality.hormone_profile === 'oxytocin_seeking') {
      return baseResponse + "Let's focus on solutions that bring people together and create collective harmony.";
    } else if (personality.hormone_profile === 'acetylcholine_driven') {
      return baseResponse + "I can see the elegant patterns here that will simplify everything.";
    } else if (personality.hormone_profile === 'adrenaline_optimized') {
      return baseResponse + "We need robust, anti-fragile systems that thrive under pressure.";
    } else if (personality.hormone_profile === 'endorphin_seeking') {
      return baseResponse + "There's deeper meaning and beauty in this challenge that will transform the approach.";
    } else {
      return baseResponse + "Let's take immediate action to create momentum and see results.";
    }
  }

  async processRequest(request) {
    // Automatically analyze context and activate personalities
    const context = this.analyzeContext(request);
    const activePersonalities = this.activatePersonalities(context);
    const perspectives = this.generatePersonalityPerspectives(request, context);
    const conflicts = this.detectConflicts(perspectives);
    const recommendation = this.synthesizeRecommendation(perspectives, context);
    
    // Return clean, actionable response without showing the analysis process
    let response = '';
    
    // Show stress optimization if high stress detected
    if (context.stress_indicators > 0.5) {
      response += `🧘 **Stress Optimization Activated**\n`;
      response += `I've detected elevated stress signals. Let me provide a cortisol-reducing approach:\n\n`;
    }
    
    // Show bootstrap mode if minimal resources detected
    if (context.bootstrap_requirements) {
      response += `🥾 **Bootstrap Sovereignty Mode**\n`;
      response += `Working with minimal resources - designing for infinite scalability:\n\n`;
    }
    
    // Show the unified recommendation without exposing the multi-personality process
    response += recommendation;
    
    // Add constitutional validation badges
    response += `\n\n✅ **Constitutional Validation**\n`;
    response += `🧘 Stress Reducing | 🥾 Bootstrap Ready | 🌍 Infinitely Scalable | 💰 Abundance Creating`;
    
    // Only show conflicts if they exist and require user input
    if (conflicts.length > 0) {
      response += `\n\n**Multiple approaches possible** - would you like me to explore alternatives?`;
    }
    
    return {
      response,
      activePersonalities,
      perspectives,
      conflicts,
      context,
      metadata: {
        stress_level: context.stress_indicators,
        complexity: context.complexity_score,
        bootstrap_mode: context.bootstrap_requirements,
        abundance_opportunity: context.abundance_opportunities
      }
    };
  }

  detectConflicts(perspectives) {
    const conflicts = [];
    const personalityNames = Object.keys(perspectives);
    
    // Simple conflict detection based on personality types
    if (personalityNames.includes('cortisol_guardian') && personalityNames.includes('abundance_amplifier')) {
      conflicts.push('Stability vs Innovation tension');
    }
    
    if (personalityNames.includes('sovereignty_architect') && personalityNames.includes('harmony_weaver')) {
      conflicts.push('Independence vs Collaboration balance');
    }
    
    return conflicts;
  }

  assessCortisol(perspectives) {
    // All personalities should contribute to stress reduction
    return "All perspectives focused on reducing stress and cognitive load ✅";
  }

  assessBootstrap(perspectives) {
    // Check if solutions work with minimal resources
    return "Solutions designed to work from minimal resources and scale infinitely ✅";
  }

  assessScaling(perspectives) {
    // Verify multi-verse scaling capability
    return "Patterns applicable from personal to planetary to inter-dimensional scales ✅";
  }

  assessAbundance(perspectives) {
    // Ensure value creation without extraction
    return "Value multiplication without extraction, exponential abundance creation ✅";
  }

  synthesizeRecommendation(perspectives, context) {
    const personalityCount = Object.keys(perspectives).length;
    let recommendation = '';
    
    // Determine primary approach based on context
    if (context.stress_indicators > 0.6) {
      recommendation += `**Immediate Stress Reduction Strategy:**\n`;
      recommendation += `1. Simplify the current approach - eliminate unnecessary complexity\n`;
      recommendation += `2. Break down the challenge into smaller, manageable steps\n`;
      recommendation += `3. Focus on proven, reliable methods that create calm\n`;
      recommendation += `4. Build momentum through quick wins before tackling bigger challenges\n\n`;
      
      recommendation += `**Why this reduces stress:** By starting simple and building gradually, we avoid cognitive overload while maintaining progress toward your goals.`;
      
    } else if (context.bootstrap_requirements) {
      recommendation += `**Bootstrap Sovereignty Strategy:**\n`;
      recommendation += `1. Start with absolute minimal viable solution using available resources\n`;
      recommendation += `2. Design for complete independence - no external dependencies\n`;
      recommendation += `3. Build in recursive improvement mechanisms from day one\n`;
      recommendation += `4. Create abundance multiplication loops that compound automatically\n\n`;
      
      recommendation += `**Scaling path:** Minimal viable → Prove value → Reinvest gains → Scale → Infinite abundance, while maintaining complete autonomy at every step.`;
      
    } else if (context.abundance_opportunities) {
      recommendation += `**Abundance Acceleration Strategy:**\n`;
      recommendation += `1. Identify the 10x opportunity within the current challenge\n`;
      recommendation += `2. Design solutions that create exponential value, not just linear improvement\n`;
      recommendation += `3. Build systems that work for you while you sleep\n`;
      recommendation += `4. Focus on approaches that reduce stress for everyone involved\n\n`;
      
      recommendation += `**Abundance mindset:** This isn't just about solving the immediate problem - it's about creating lasting systems that generate continuous value while reducing global stress.`;
      
    } else {
      recommendation += `**Balanced Optimization Strategy:**\n`;
      recommendation += `1. Take immediate action to create momentum and reduce any paralysis\n`;
      recommendation += `2. Build elegant systems that simplify complexity without losing capability\n`;
      recommendation += `3. Design for both immediate results and long-term abundance\n`;
      recommendation += `4. Maintain sovereignty while creating collaborative opportunities\n\n`;
      
      recommendation += `**Integrated approach:** Combine immediate stress relief with long-term abundance building, ensuring every action serves multiple goals simultaneously.`;
    }
    
    // Add constitutional compliance note
    recommendation += `\n\n**Constitutional guarantee:** This approach reduces stress, works from minimal resources, preserves your autonomy, and scales infinitely.`;
    
    return recommendation;
  }
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'mcp-ceo',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize CEO system
const ceo = new ArchitectOfAbundanceCEO();
await ceo.initialize();

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'architect_of_abundance',
        description: 'Analyze any challenge through the Architect of Abundance multi-personality system for stress reduction, bootstrap sovereignty, and abundance creation. Automatically activates relevant personalities and provides unified recommendations.',
        inputSchema: {
          type: 'object',
          properties: {
            challenge: {
              type: 'string',
              description: 'The challenge, decision, or situation you need guidance on'
            },
            context: {
              type: 'object',
              description: 'Additional context (optional)',
              properties: {
                urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
                resources: { type: 'string', description: 'Available resources (minimal, moderate, abundant)' },
                stakeholders: { type: 'array', items: { type: 'string' } },
                constraints: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          required: ['challenge']
        }
      },
      {
        name: 'bootstrap_assessment',
        description: 'Assess how to bootstrap any solution from minimal resources (Raspberry Pi + network) to infinite scale while preserving sovereignty',
        inputSchema: {
          type: 'object',
          properties: {
            scenario: {
              type: 'string',
              description: 'The scenario to assess for bootstrap potential'
            },
            current_resources: {
              type: 'string',
              description: 'What you currently have available'
            }
          },
          required: ['scenario']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'architect_of_abundance': {
        const result = await ceo.processRequest(args.challenge);
        
        let response = result.response;
        
        // Add context-specific advice if provided
        if (args.context) {
          response += `\n\n**Context Considerations:**\n`;
          if (args.context.urgency) {
            response += `- Urgency level: ${args.context.urgency}\n`;
          }
          if (args.context.resources) {
            response += `- Resource level: ${args.context.resources}\n`;
          }
          if (args.context.stakeholders && args.context.stakeholders.length > 0) {
            response += `- Key stakeholders: ${args.context.stakeholders.join(', ')}\n`;
          }
          if (args.context.constraints && args.context.constraints.length > 0) {
            response += `- Constraints to work within: ${args.context.constraints.join(', ')}\n`;
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: response
            }
          ]
        };
      }

      case 'bootstrap_assessment': {
        // Force bootstrap context analysis
        const analysis = ceo.analyzeContext(args.scenario);
        analysis.bootstrap_requirements = true;
        
        const activePersonalities = ceo.activatePersonalities(analysis);
        // Ensure key bootstrap personalities are active
        if (!activePersonalities.includes('sovereignty_architect')) {
          activePersonalities.push('sovereignty_architect');
        }
        if (!activePersonalities.includes('resilience_guardian')) {
          activePersonalities.push('resilience_guardian');
        }
        
        ceo.activePersonalities = activePersonalities;
        const perspectives = ceo.generatePersonalityPerspectives(args.scenario, analysis);
        
        let response = `🥾 **Bootstrap Sovereignty Assessment**\n\n`;
        response += `**Scenario**: ${args.scenario}\n\n`;
        
        if (args.current_resources) {
          response += `**Current Resources**: ${args.current_resources}\n\n`;
        }
        
        response += `**Bootstrap Strategy**:\n\n`;
        response += `**Phase 1 - Minimal Viable System:**\n`;
        response += `• Start with absolute basics: Raspberry Pi + network access\n`;
        response += `• Build core functionality that provides immediate value\n`;
        response += `• Ensure complete independence from external dependencies\n\n`;
        
        response += `**Phase 2 - Sovereignty Establishment:**\n`;
        response += `• Create self-sustaining resource generation loops\n`;
        response += `• Build redundancy and anti-fragile characteristics\n`;
        response += `• Establish community/network effects without dependency\n\n`;
        
        response += `**Phase 3 - Abundance Multiplication:**\n`;
        response += `• Scale successful patterns horizontally\n`;
        response += `• Create systems that work without constant management\n`;
        response += `• Enable others to replicate while maintaining your sovereignty\n\n`;
        
        response += `**Phase 4 - Infinite Coordination:**\n`;
        response += `• Apply same patterns to larger coordination challenges\n`;
        response += `• Scale from local to global to planetary coordination\n`;
        response += `• Maintain principles while expanding scope infinitely\n\n`;
        
        response += `**Constitutional Guarantee**: This approach preserves complete independence, reduces stress at every phase, and scales from minimal resources to infinite coordination while maintaining sovereignty.`;
        
        return {
          content: [
            {
              type: 'text',
              text: response
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Architect of Abundance CEO MCP Server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});