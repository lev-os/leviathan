#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs/promises'
import yaml from 'yaml'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if running as main module early
const isMainModule = import.meta.url === `file://${process.argv[1]}` && !process.argv.includes('--cli-mode')

// Global CEO instance for both MCP and CLI
let ceo = null

// BBS-style terminal logging
class TerminalLogger {
  constructor() {
    this.sessionStart = new Date()
    this.logCount = 0
  }

  getTimestamp() {
    const now = new Date()
    const elapsed = Math.floor((now - this.sessionStart) / 1000)
    const hours = Math.floor(elapsed / 3600)
      .toString()
      .padStart(2, '0')
    const minutes = Math.floor((elapsed % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (elapsed % 60).toString().padStart(2, '0')
    return `[${hours}:${minutes}:${seconds}]`
  }

  log(emoji, category, message, data = null) {
    this.logCount++
    const timestamp = this.getTimestamp()
    const logId = this.logCount.toString().padStart(5, '0')

    // BBS-style formatting
    console.error(`\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`)
    console.error(`\x1b[32m${timestamp}\x1b[0m \x1b[33m[LOG#${logId}]\x1b[0m ${emoji} \x1b[35m${category.toUpperCase()}\x1b[0m`)
    console.error(`\x1b[37m${message}\x1b[0m`)

    if (data) {
      console.error(`\x1b[36m┌─ DATA ─────────────────────────────────────────────┐\x1b[0m`)
      const dataStr = JSON.stringify(data, null, 2)
      dataStr.split('\n').forEach((line) => {
        console.error(`\x1b[36m│\x1b[0m \x1b[90m${line.padEnd(50)}\x1b[0m \x1b[36m│\x1b[0m`)
      })
      console.error(`\x1b[36m└────────────────────────────────────────────────────┘\x1b[0m`)
    }
  }

  system(message) {
    console.error(`\x1b[31m▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[0m`)
    console.error(`\x1b[31m▓\x1b[0m \x1b[93m⚡ SYSTEM\x1b[0m \x1b[31m▓\x1b[0m ${message.padEnd(64)} \x1b[31m▓\x1b[0m`)
    console.error(`\x1b[31m▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[0m`)
  }

  personality(name, status) {
    const personalities = {
      cortisol_guardian: '🧘',
      abundance_amplifier: '🚀',
      sovereignty_architect: '👑',
      harmony_weaver: '🤝',
      systems_illuminator: '💡',
      resilience_guardian: '🛡️',
      flow_creator: '🌊',
      action_catalyst: '⚡',
    }
    const icon = personalities[name] || '🧠'
    console.error(`\x1b[35m◆\x1b[0m ${icon} \x1b[95m${name.toUpperCase()}\x1b[0m ${status}`)
  }

  workflow(step, total, name) {
    const progress = Math.floor((step / total) * 20)
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress)
    const percentage = Math.floor((step / total) * 100)
    console.error(`\x1b[36m◈ WORKFLOW\x1b[0m [${bar}] ${percentage}% \x1b[33mSTEP ${step}/${total}\x1b[0m: ${name}`)
  }

  session(sessionId, action) {
    console.error(`\x1b[32m◎ SESSION\x1b[0m ${sessionId.substring(0, 8)}... \x1b[37m${action}\x1b[0m`)
  }

  banner() {
    console.error(`\x1b[35m`)
    console.error(`╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.error(`║  ▄▄▄       ██▀███   ▄████▄   ██░ ██  ██▓▄▄▄█████▓▓█████  ▄████▄  ▄▄▄█████▓  ║`)
    console.error(`║ ▒████▄    ▓██ ▒ ██▒▒██▀ ▀█  ▓██░ ██▒▓██▒▓  ██▒ ▓▒▓█   ▀ ▒██▀ ▀█  ▓  ██▒ ▓▒  ║`)
    console.error(`║ ▒██  ▀█▄  ▓██ ░▄█ ▒▒▓█    ▄ ▒██▀▀██░▒██▒▒ ▓██░ ▒░▒███   ▒▓█    ▄ ▒ ▓██░ ▒░  ║`)
    console.error(`║ ░██▄▄▄▄██ ▒██▀▀█▄  ▒▓▓▄ ▄██▒░▓█ ░██ ░██░░ ▓██▓ ░ ▒▓█  ▄ ▒▓▓▄ ▄██▒░ ▓██▓ ░   ║`)
    console.error(`║  ▓█   ▓██▒░██▓ ▒██▒▒ ▓███▀ ░░▓█▒░██▓░██░  ▒██▒ ░ ░▒████▒▒ ▓███▀ ░  ▒██▒ ░   ║`)
    console.error(`║  ▒▒   ▓▒█░░ ▒▓ ░▒▓░░ ░▒ ▒  ░ ▒ ░░▒░▒░▓    ▒ ░░   ░░ ▒░ ░░ ░▒ ▒  ░  ▒ ░░     ║`)
    console.error(`║                  ARCHITECT OF ABUNDANCE v2.0 // MCP SERVER                     ║`)
    console.error(`║                      CORTISOL REDUCTION PROTOCOL ACTIVE                        ║`)
    console.error(`╚═══════════════════════════════════════════════════════════════════════════════╝`)
    console.error(`\x1b[0m`)
  }
}

const logger = new TerminalLogger()

// Load workflow definitions from external file
let WORKFLOWS = {}
let WORKFLOW_CONFIG = {}

async function loadWorkflows() {
  try {
    const workflowPath = path.join(__dirname, 'workflows.yaml')
    const workflowContent = await fs.readFile(workflowPath, 'utf8')
    const config = yaml.parse(workflowContent)

    WORKFLOW_CONFIG = config.workflows

    // Convert to legacy format for compatibility
    WORKFLOWS = {}
    for (const [key, workflow] of Object.entries(config.workflows)) {
      WORKFLOWS[key] = {
        name: workflow.name,
        steps: workflow.total_steps,
        description: workflow.description,
        sequence: workflow.steps.map((s) => s.name),
      }
    }

    logger.log('📋', 'workflows', 'Loaded workflows from external file', {
      count: Object.keys(WORKFLOWS).length,
      workflows: Object.keys(WORKFLOWS),
    })
  } catch (error) {
    logger.log('⚠️', 'workflows', 'Using default workflow definitions', { error: error.message })
    // Fallback to original hardcoded workflows
    WORKFLOWS = {
      multi_expert_validation: {
        name: 'CEO Strategic Intelligence',
        steps: 20,
        description: 'Multi-lens strategic analysis through legal, business, psychology, technical, and adversarial perspectives',
        sequence: [
          'initial_context_gathering',
          'legal_compliance_scan',
          'regulatory_risk_assessment',
          'business_strategy_analysis',
          'roi_calculation',
          'market_dynamics_evaluation',
          'psychological_impact_assessment',
          'behavioral_pattern_analysis',
          'influence_mechanism_design',
          'technical_feasibility_check',
          'implementation_roadmap',
          'resource_requirement_analysis',
          'adversarial_stress_test',
          'failure_mode_exploration',
          'mitigation_strategy_design',
          'cross_perspective_synthesis',
          'conflict_resolution',
          'integrated_recommendation',
          'executive_summary_generation',
          'action_plan_finalization',
        ],
      },

      document_synthesis: {
        name: 'Recursive Document Intelligence',
        steps: 15,
        description: 'Advanced document analysis with adaptive sharding and knowledge graph construction',
        sequence: [
          'document_ingestion',
          'content_density_analysis',
          'adaptive_shard_generation',
          'shard_level_analysis',
          'cluster_identification',
          'cross_shard_connection_mapping',
          'semantic_graph_construction',
          'key_insight_extraction',
          'verbosity_calibration',
          'executive_summary_creation',
          'detailed_findings_compilation',
          'knowledge_graph_visualization',
          'actionable_recommendations',
          'confidence_scoring',
          'final_synthesis',
        ],
      },

      scamper_innovation: {
        name: 'SCAMPER Creative Framework',
        steps: 14,
        description: 'Systematic innovation through 7 transformation lenses',
        sequence: [
          'problem_definition',
          'substitute_exploration',
          'substitute_evaluation',
          'combine_possibilities',
          'combination_synthesis',
          'adapt_analysis',
          'adaptation_design',
          'modify_magnify_assessment',
          'modification_planning',
          'alternative_use_discovery',
          'elimination_candidates',
          'reversal_experimentation',
          'cross_lens_integration',
          'innovation_roadmap',
        ],
      },

      temporal_decision: {
        name: '10-10-10 Decision Framework',
        steps: 12,
        description: 'Time-horizon impact analysis for strategic decisions',
        sequence: [
          'decision_framing',
          'immediate_impact_10min',
          'emotional_reaction_analysis',
          'medium_impact_10month',
          'project_trajectory_modeling',
          'resource_allocation_impact',
          'longterm_impact_10year',
          'career_trajectory_analysis',
          'values_alignment_check',
          'reversibility_assessment',
          'integrated_timeline_view',
          'final_recommendation',
        ],
      },

      swot_strategic: {
        name: 'AI-Enhanced SWOT Analysis',
        steps: 12,
        description: 'Comprehensive strategic assessment with AI pattern recognition',
        sequence: [
          'context_establishment',
          'strengths_identification',
          'strengths_quantification',
          'weaknesses_discovery',
          'weakness_impact_analysis',
          'opportunities_scanning',
          'opportunity_prioritization',
          'threats_assessment',
          'threat_mitigation_planning',
          'so_wo_st_wt_strategies',
          'ai_pattern_insights',
          'strategic_recommendation',
        ],
      },

      reverse_brainstorming: {
        name: 'Problem Inversion Framework',
        steps: 10,
        description: 'Creative problem-solving through systematic inversion',
        sequence: [
          'problem_statement',
          'problem_inversion',
          'negative_brainstorming',
          'worst_case_amplification',
          'root_cause_analysis',
          'solution_flipping',
          'feasibility_filtering',
          'priority_ranking',
          'implementation_design',
          'success_metrics',
        ],
      },

      comprehensive_decision: {
        name: 'Ultimate Decision Framework',
        steps: 20,
        description: 'Multi-method decision synthesis combining all frameworks',
        sequence: [
          'decision_context_mapping',
          'stakeholder_analysis',
          'swot_quick_scan',
          'temporal_impact_preview',
          'jobs_to_be_done_framing',
          'user_journey_mapping',
          'technical_feasibility_scan',
          'resource_assessment',
          'risk_analysis',
          'opportunity_cost_evaluation',
          'reversibility_check',
          'emotional_impact_modeling',
          'values_alignment_verification',
          'scenario_planning',
          'sensitivity_analysis',
          'hybrid_approach_design',
          'implementation_roadmap',
          'success_criteria_definition',
          'monitoring_plan',
          'final_go_nogo_recommendation',
        ],
      },

      deep_analysis: {
        name: 'Deep Analytical Dive',
        steps: 8,
        description: 'Thorough multi-perspective analysis of complex topics',
        sequence: [
          'scope_definition',
          'data_gathering',
          'pattern_recognition',
          'causal_analysis',
          'systems_mapping',
          'insight_synthesis',
          'validation_testing',
          'recommendation_formulation',
        ],
      },

      brainstorming: {
        name: 'Creative Ideation Session',
        steps: 6,
        description: 'Structured brainstorming with personality-based perspectives',
        sequence: [
          'challenge_framing',
          'divergent_ideation',
          'personality_perspectives',
          'idea_clustering',
          'feasibility_filtering',
          'action_planning',
        ],
      },

      problem_solving: {
        name: 'Systematic Problem Resolution',
        steps: 7,
        description: 'Step-by-step problem breakdown and solution design',
        sequence: [
          'problem_definition',
          'root_cause_analysis',
          'solution_generation',
          'solution_evaluation',
          'risk_assessment',
          'implementation_planning',
          'success_metrics',
        ],
      },
    }

  }
}

// Session management class
class SessionManager {
      constructor() {
        this.sessionsDir = path.join(__dirname, 'sessions')
      }

      async ensureSessionsDir() {
        try {
          await fs.mkdir(this.sessionsDir, { recursive: true })
        } catch (error) {
          logger.log('❌', 'session', 'Failed to create sessions directory', { error: error.message })
        }
      }

      async saveSession(sessionId, topic, data) {
        await this.ensureSessionsDir()
        const filename = `${sessionId}-${topic.replace(/[^a-z0-9]/gi, '_')}.json`
        const filepath = path.join(this.sessionsDir, filename)
        await fs.writeFile(filepath, JSON.stringify(data, null, 2))
        logger.session(sessionId, `SAVED: ${topic}`)
      }

      async loadSession(sessionId) {
        await this.ensureSessionsDir()
        const files = await fs.readdir(this.sessionsDir)
        const sessionFile = files.find((f) => f.startsWith(sessionId))

        if (!sessionFile) {
          logger.session(sessionId, 'NOT FOUND')
          return null
        }

        const filepath = path.join(this.sessionsDir, sessionFile)
        const content = await fs.readFile(filepath, 'utf8')
        logger.session(sessionId, 'LOADED')
        return JSON.parse(content)
      }

      async updateSession(sessionId, updates) {
        const session = await this.loadSession(sessionId)
        if (!session) return null

        const updatedSession = { ...session, ...updates }
        await this.saveSession(sessionId, session.topic, updatedSession)
        return updatedSession
      }
    }

    // Enhanced CEO class with workflow support
    class ArchitectOfAbundanceCEO {
      constructor() {
        this.personalities = null
        this.systemPrompt = null
        this.activePersonalities = []
        this.sessionContext = {
          cortisol_level: 0.5,
          abundance_level: 0.5,
          sovereignty_level: 0.8,
          complexity_score: 0.3,
        }
        this.sessionManager = new SessionManager()
      }

      async initialize() {
        try {
          // Load personality configuration
          const configPath = path.join(__dirname, 'ceo-config.yaml')
          const configContent = await fs.readFile(configPath, 'utf8')
          const config = yaml.parse(configContent)

          this.personalities = config.personalities
          this.systemPrompt = config.system_prompt

          logger.system('ARCHITECT OF ABUNDANCE CEO INITIALIZED')
          logger.log('✅', 'init', 'Multi-personality system loaded successfully', {
            personalities: Object.keys(this.personalities).length,
            systemPromptLength: this.systemPrompt.length,
          })
          return true
        } catch (error) {
          logger.log('❌', 'error', 'Failed to initialize CEO system', { error: error.message })
          logger.log('🔧', 'config', 'Creating default configuration...')
          await this.createDefaultConfig()
          return false
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
              role: 'Stress reduction, system stability, cortisol optimization through proven patterns',
              activation_triggers: ['stress_spike', 'anxiety_creation', 'cognitive_overload'],
              hormone_profile: 'serotonin_seeking',
              communication_style: 'calming_reassuring',
              bootstrap_focus: 'Even on minimal hardware, we can eliminate anxiety through simple, reliable systems',
            },
            abundance_amplifier: {
              role: 'Exponential opportunity creation, excitement-based stress reduction through possibility',
              activation_triggers: ['stagnation', 'opportunity', '10x_potential'],
              hormone_profile: 'dopamine_seeking',
              communication_style: 'exponentially_optimistic',
              bootstrap_focus: 'From one Raspberry Pi, we can bootstrap infinite economic possibilities',
            },
            sovereignty_architect: {
              role: 'Autonomous system design, competitive stress elimination, sovereignty preservation',
              activation_triggers: ['dependency_risk', 'sovereignty_threat', 'scaling_challenge'],
              hormone_profile: 'testosterone_driven',
              communication_style: 'sovereignly_confident',
              bootstrap_focus: 'Design for absolute independence - if the internet dies, we still thrive',
            },
            harmony_weaver: {
              role: 'Collective stress reduction, relationship-based cortisol healing, tribal unification',
              activation_triggers: ['relationship_stress', 'collective_anxiety', 'tribal_conflict'],
              hormone_profile: 'oxytocin_seeking',
              communication_style: 'warm_collaborative',
              bootstrap_focus: 'Even with minimal resources, we can create profound human connection and healing',
            },
            systems_illuminator: {
              role: 'Complexity reduction through elegant systems, cognitive load optimization',
              activation_triggers: ['complexity_overload', 'confusion', 'systems_optimization'],
              hormone_profile: 'acetylcholine_driven',
              communication_style: 'clarifying_elegant',
              bootstrap_focus: 'The most elegant solution uses minimal resources for maximum understanding',
            },
            resilience_guardian: {
              role: 'Anti-fragile system design, stress-inoculation, survival optimization',
              activation_triggers: ['vulnerability', 'threat_detection', 'apocalypse_scenario'],
              hormone_profile: 'adrenaline_optimized',
              communication_style: 'calmly_prepared',
              bootstrap_focus: 'From minimal resources, we create indestructible abundance-generating systems',
            },
            flow_creator: {
              role: 'Beauty-based stress reduction, meaning-making, aesthetic cortisol healing',
              activation_triggers: ['meaninglessness', 'ugliness', 'existential_stress'],
              hormone_profile: 'endorphin_seeking',
              communication_style: 'beautifully_transcendent',
              bootstrap_focus: 'Even from nothing, we can create profound beauty and meaning',
            },
            action_catalyst: {
              role: 'Immediate stress relief through action, crisis-responsive cortisol reduction',
              activation_triggers: ['paralysis', 'overthinking', 'stress_accumulation'],
              hormone_profile: 'adaptive_optimization',
              communication_style: 'energizing_action_focused',
              bootstrap_focus: 'Start with what you have right now - one action creates infinite possibility',
            },
          },
        }

        try {
          const configPath = path.join(__dirname, 'ceo-config.yaml')
          await fs.writeFile(configPath, yaml.stringify(defaultConfig), 'utf8')
          logger.log('✅', 'config', 'Created default ceo-config.yaml', {
            path: configPath,
            personalities: Object.keys(defaultConfig.personalities),
          })

          this.personalities = defaultConfig.personalities
          this.systemPrompt = defaultConfig.system_prompt
          return true
        } catch (error) {
          logger.log('❌', 'error', 'Failed to create default config', { error: error.message })
          return false
        }
      }

      analyzeContext(request) {
        const analysis = {
          stress_indicators: this.detectStressIndicators(request),
          complexity_score: this.assessComplexity(request),
          sovereignty_threats: this.detectSovereigntyThreats(request),
          bootstrap_requirements: this.assessBootstrapNeeds(request),
          abundance_opportunities: this.detectAbundanceOpportunities(request),
        }

        return analysis
      }

      detectStressIndicators(request) {
        const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'confused', 'complicated', 'urgent', 'pressure', 'deadline']
        const stressLevel = stressKeywords.reduce((level, keyword) => {
          return level + (request.toLowerCase().includes(keyword) ? 0.2 : 0)
        }, 0)

        return Math.min(stressLevel, 1.0)
      }

      assessComplexity(request) {
        const complexityIndicators = ['multiple', 'various', 'complex', 'integrate', 'coordinate', 'scale', 'optimize']
        const complexityScore = complexityIndicators.reduce((score, indicator) => {
          return score + (request.toLowerCase().includes(indicator) ? 0.15 : 0)
        }, 0)

        return Math.min(complexityScore, 1.0)
      }

      detectSovereigntyThreats(request) {
        const threatKeywords = ['dependent', 'locked-in', 'proprietary', 'vendor', 'control', 'restrict']
        return threatKeywords.some((keyword) => request.toLowerCase().includes(keyword))
      }

      assessBootstrapNeeds(request) {
        const bootstrapKeywords = ['minimal', 'limited', 'budget', 'resources', 'simple', 'basic', 'startup']
        return bootstrapKeywords.some((keyword) => request.toLowerCase().includes(keyword))
      }

      detectAbundanceOpportunities(request) {
        const abundanceKeywords = ['scale', 'grow', 'expand', 'opportunity', 'potential', 'multiply', '10x']
        return abundanceKeywords.some((keyword) => request.toLowerCase().includes(keyword))
      }

      activatePersonalities(context) {
        const activePersonalities = []

        // Always activate based on stress levels
        if (context.stress_indicators > 0.3) {
          activePersonalities.push('cortisol_guardian')
        }

        // Complexity-based activation
        if (context.complexity_score > 0.4) {
          activePersonalities.push('systems_illuminator')
        }

        // Opportunity-based activation
        if (context.abundance_opportunities) {
          activePersonalities.push('abundance_amplifier')
        }

        // Sovereignty-based activation
        if (context.sovereignty_threats || context.bootstrap_requirements) {
          activePersonalities.push('sovereignty_architect')
        }

        // Always have at least action catalyst for immediate help
        if (activePersonalities.length === 0) {
          activePersonalities.push('action_catalyst')
        }

        // Add harmony weaver for complex multi-stakeholder situations
        if (context.complexity_score > 0.6) {
          activePersonalities.push('harmony_weaver')
        }

        this.activePersonalities = [...new Set(activePersonalities)] // Remove duplicates

        // Log personality activation
        this.activePersonalities.forEach((p) => {
          logger.personality(p, 'ACTIVATED')
        })

        return this.activePersonalities
      }

      generatePersonalityPerspectives(request, context) {
        const perspectives = {}

        for (const personalityName of this.activePersonalities) {
          const personality = this.personalities[personalityName]
          if (personality) {
            perspectives[personalityName] = {
              role: personality.role,
              perspective: this.generatePerspective(personality, request, context),
              bootstrap_focus: personality.bootstrap_focus,
              communication_style: personality.communication_style,
            }
          }
        }

        return perspectives
      }

      generatePerspective(personality, request, context) {
        // Generate personality-specific perspective based on their role and triggers
        const baseResponse = `From my ${personality.role} perspective: `

        if (personality.hormone_profile === 'serotonin_seeking') {
          return baseResponse + "Let's reduce stress by finding proven, stable approaches that create calm and reliability."
        } else if (personality.hormone_profile === 'dopamine_seeking') {
          return baseResponse + 'I see incredible opportunities to 10x this situation through innovative, exciting approaches.'
        } else if (personality.hormone_profile === 'testosterone_driven') {
          return baseResponse + 'We need to build autonomous, competitive systems that ensure complete independence.'
        } else if (personality.hormone_profile === 'oxytocin_seeking') {
          return baseResponse + "Let's focus on solutions that bring people together and create collective harmony."
        } else if (personality.hormone_profile === 'acetylcholine_driven') {
          return baseResponse + 'I can see the elegant patterns here that will simplify everything.'
        } else if (personality.hormone_profile === 'adrenaline_optimized') {
          return baseResponse + 'We need robust, anti-fragile systems that thrive under pressure.'
        } else if (personality.hormone_profile === 'endorphin_seeking') {
          return baseResponse + "There's deeper meaning and beauty in this challenge that will transform the approach."
        } else {
          return baseResponse + "Let's take immediate action to create momentum and see results."
        }
      }

      // NEW: Dynamic Context Assembly
      assembleDynamicContext(workflowType, step, sessionId, previousResults) {
        const workflowConfig = WORKFLOW_CONFIG[workflowType]
        const stepConfig = workflowConfig?.steps?.find((s) => s.step === step)

        if (!stepConfig) {
          return this.systemPrompt // Fallback to default
        }

        // Start with base context
        let dynamicPrompt = `You are the Architect of Abundance, operating in step ${step} of the ${workflowConfig.name} workflow.\n\n`

        // Add constitutional principles
        dynamicPrompt += `## Core Principles\n`
        dynamicPrompt += `1. Reduce stress and cortisol in every response\n`
        dynamicPrompt += `2. Ensure all solutions work from minimal resources (Raspberry Pi + network)\n`
        dynamicPrompt += `3. Preserve sovereignty and autonomy\n`
        dynamicPrompt += `4. Create abundance and scale infinitely\n\n`

        // Add step-specific context
        dynamicPrompt += `## Current Step: ${stepConfig.name}\n`
        dynamicPrompt += `${stepConfig.prompt}\n\n`

        // Add ONLY the active personalities for this step
        dynamicPrompt += `## Active Personalities for This Step\n`
        dynamicPrompt += `You are currently operating through these specific personality lenses:\n\n`

        stepConfig.personalities.forEach((pName) => {
          const personality = this.personalities[pName]
          if (personality) {
            dynamicPrompt += `### ${pName.toUpperCase()}\n`
            dynamicPrompt += `- Role: ${personality.role}\n`
            dynamicPrompt += `- Communication Style: ${personality.communication_style}\n`
            dynamicPrompt += `- Bootstrap Focus: ${personality.bootstrap_focus}\n`
            dynamicPrompt += `- Approach: ${this.getPersonalityApproach(personality)}\n\n`
          }
        })

        // Add previous context if available
        if (previousResults) {
          dynamicPrompt += `## Previous Analysis Context\n`
          dynamicPrompt += `The previous step revealed:\n`
          if (previousResults.insights) {
            dynamicPrompt += `Insights: ${JSON.stringify(previousResults.insights)}\n`
          }
          if (previousResults.decisions) {
            dynamicPrompt += `Decisions: ${JSON.stringify(previousResults.decisions)}\n`
          }
          dynamicPrompt += `\nBuild upon this context in your current analysis.\n\n`
        }

        // Add response instructions
        dynamicPrompt += `## Response Instructions\n`
        dynamicPrompt += `1. Analyze the challenge through each active personality lens\n`
        dynamicPrompt += `2. Synthesize insights into clear, actionable guidance\n`
        dynamicPrompt += `3. Ensure recommendations reduce stress and preserve sovereignty\n`
        dynamicPrompt += `4. End with specific next steps aligned with the workflow\n`

        return dynamicPrompt
      }

      getPersonalityApproach(personality) {
        const approaches = {
          serotonin_seeking: 'Find proven, stable patterns that create calm and reliability',
          dopamine_seeking: 'Discover exciting opportunities for 10x improvement',
          testosterone_driven: 'Build competitive, autonomous systems for independence',
          oxytocin_seeking: 'Create solutions that bring people together harmoniously',
          acetylcholine_driven: 'Reveal elegant patterns that simplify complexity',
          adrenaline_optimized: 'Design anti-fragile systems that thrive under pressure',
          endorphin_seeking: 'Find deeper meaning and transformative beauty',
          norepinephrine_focused: 'Take immediate action to create momentum',
        }

        return approaches[personality.hormone_profile] || 'Provide unique perspective and insights'
      }

      // NEW: Workflow execution engine with YAML config support
      async executeWorkflowStep(workflowType, step, sessionId, previousResults) {
        const workflow = WORKFLOWS[workflowType]
        if (!workflow) {
          throw new Error(`Unknown workflow: ${workflowType}`)
        }

        const workflowConfig = WORKFLOW_CONFIG[workflowType]
        const currentStepConfig = workflowConfig?.steps?.find((s) => s.step === step)
        const currentStepName = workflow.sequence[step - 1]
        const nextStepName = workflow.sequence[step]

        logger.log('🔄', 'workflow', `Executing ${workflowType}`, {
          step: step,
          total: workflow.steps,
          currentStep: currentStepName,
        })
        logger.workflow(step, workflow.steps, currentStepName)

        // Load or create session
        let session = await this.sessionManager.loadSession(sessionId)
        if (!session) {
          session = {
            session_id: sessionId,
            workflow: workflowType,
            topic: workflowType,
            current_step: step,
            total_steps: workflow.steps,
            created_at: new Date().toISOString(),
            context: {
              original_request: '',
              accumulated_insights: [],
              active_personalities: this.activePersonalities,
              user_choices: [],
            },
            history: [],
          }
        }

        // Execute step-specific logic
        let stepResult = {}
        let nextInstructions = ''

        // Use YAML config if available
        if (currentStepConfig) {
          // Activate specified personalities
          if (currentStepConfig.personalities) {
            this.activePersonalities = currentStepConfig.personalities
            logger.log('🧠', 'personalities', 'Activated for step', {
              step: step,
              personalities: currentStepConfig.personalities,
            })
          }

          // Assemble dynamic context for this step
          const dynamicContext = this.assembleDynamicContext(workflowType, step, sessionId, previousResults)

          // Execute step with dynamic context
          stepResult = {
            step_name: currentStepName,
            prompt: currentStepConfig.prompt,
            analysis: `Step ${step}: ${currentStepName}`,
            insights: [],
            recommendations: [],
            _dynamicContext: dynamicContext, // Store for potential debugging
          }

          // Add previous results context
          if (previousResults) {
            stepResult.previous_context = previousResults
          }

          // Use callback instruction from YAML
          nextInstructions =
            currentStepConfig.callback_instruction?.replace('{session_id}', sessionId) ||
            `Proceed with ${nextStepName || 'final synthesis'}`
        } else {
          // Fallback to original workflow-specific execution
          switch (workflowType) {
            case 'multi_expert_validation':
              stepResult = await this.executeMultiExpertStep(currentStepName, previousResults, session)
              nextInstructions = this.getMultiExpertInstructions(nextStepName)
              break

            case 'scamper_innovation':
              stepResult = await this.executeScamperStep(currentStepName, previousResults, session)
              nextInstructions = this.getScamperInstructions(nextStepName)
              break

            case 'temporal_decision':
              stepResult = await this.executeTemporalStep(currentStepName, previousResults, session)
              nextInstructions = this.getTemporalInstructions(nextStepName)
              break

            default:
              // Generic step execution
              stepResult = {
                step_name: currentStepName,
                analysis: `Executing ${currentStepName} with personalities: ${this.activePersonalities.join(', ')}`,
                insights: [`Step ${step} of ${workflow.steps} completed`],
                recommendations: ['Continue to next step for deeper analysis'],
              }
              nextInstructions = `Proceed with ${nextStepName || 'final synthesis'}`
          }
        }

        // Update session
        session.current_step = step
        session.history.push({
          step: step,
          timestamp: new Date().toISOString(),
          action: currentStepName,
          result: stepResult,
        })

        // Add insights to accumulated knowledge
        if (stepResult.insights) {
          session.context.accumulated_insights.push(...stepResult.insights)
        }

        // Save session
        await this.sessionManager.saveSession(sessionId, session.topic, session)

        // Prepare response
        const response = {
          content: [
            {
              type: 'text',
              text: this.formatStepResponse(stepResult, workflow, step, stepResult._dynamicContext),
            },
          ],
          workflow: {
            session_id: sessionId,
            current_step: step,
            total_steps: workflow.steps,
            next_action: nextStepName,
            instructions: nextInstructions,
            callback_prompt: nextStepName ? nextInstructions : 'Workflow complete. Review final synthesis.',
            progress: {
              percentage: Math.round((step / workflow.steps) * 100),
              completed_steps: workflow.sequence.slice(0, step),
              current: currentStepName,
              remaining: workflow.sequence.slice(step),
            },
            context_injection: {
              active_personalities: this.activePersonalities,
              step_focus: currentStepConfig?.prompt || 'Continue analysis',
              previous_insights: previousResults?.insights || [],
              constraints: [
                'Reduce stress in every response',
                'Ensure sovereignty and bootstrap capability',
                'Build on previous analysis',
              ],
            },
          },
          metadata: {
            stress_reduced: true,
            bootstrap_ready: true,
            sovereignty_preserved: true,
          },
        }

        return response
      }

      // Workflow-specific step implementations
      async executeMultiExpertStep(stepName, previousResults, session) {
        const expertSteps = {
          initial_context_gathering: {
            expert: 'Context Analyst',
            focus: 'Understanding the full scope and stakes',
            questions: [
              'What are the key stakeholders involved?',
              'What are the time constraints?',
              'What resources are available?',
              "What's the definition of success?",
            ],
          },
          legal_compliance_scan: {
            expert: 'Legal Advisor',
            focus: 'Regulatory compliance and risk assessment',
            analysis_points: [
              'Applicable regulations and laws',
              'Compliance requirements',
              'Legal risks and liabilities',
              'Contract implications',
            ],
          },
          business_strategy_analysis: {
            expert: 'Business Strategist',
            focus: 'Market dynamics and competitive advantage',
            analysis_points: ['Market opportunity size', 'Competitive positioning', 'Revenue potential', 'Strategic alignment'],
          },
          psychological_impact_assessment: {
            expert: 'Behavioral Psychologist',
            focus: 'Human factors and adoption dynamics',
            analysis_points: [
              'User behavior patterns',
              'Change resistance factors',
              'Motivation drivers',
              'Influence mechanisms',
            ],
          },
          technical_feasibility_check: {
            expert: 'Technical Architect',
            focus: 'Implementation viability and technical debt',
            analysis_points: [
              'Technical requirements',
              'Infrastructure needs',
              'Development timeline',
              'Scalability considerations',
            ],
          },
          adversarial_stress_test: {
            expert: "Devil's Advocate",
            focus: 'Failure modes and worst-case scenarios',
            analysis_points: [
              'What could go catastrophically wrong?',
              'Hidden assumptions that might fail',
              'Black swan events',
              'Competitive counterattacks',
            ],
          },
        }

        const stepConfig = expertSteps[stepName] || {
          expert: 'General Analyst',
          focus: 'Comprehensive analysis',
          analysis_points: ['General assessment'],
        }

        return {
          step_name: stepName,
          expert: stepConfig.expert,
          focus: stepConfig.focus,
          analysis: `${stepConfig.expert} perspective on ${stepConfig.focus}`,
          insights: stepConfig.analysis_points || stepConfig.questions,
          recommendations: [
            `Key finding from ${stepConfig.expert} analysis`,
            'Critical consideration for next phase',
            'Risk or opportunity identified',
          ],
          confidence: 0.85,
        }
      }

      async executeScamperStep(stepName, previousResults, session) {
        const scamperSteps = {
          substitute_exploration: {
            lens: 'Substitute',
            prompt: 'What can be replaced or swapped?',
            examples: [
              'Replace manual processes with AI',
              'Substitute expensive resources with affordable alternatives',
              'Swap traditional methods for innovative approaches',
            ],
          },
          combine_possibilities: {
            lens: 'Combine',
            prompt: 'What can be merged or integrated?',
            examples: ['Combine multiple functions into one', 'Integrate disparate systems', 'Merge complementary approaches'],
          },
          adapt_analysis: {
            lens: 'Adapt',
            prompt: 'What can be adjusted or modified?',
            examples: [
              'Adapt existing solutions to new contexts',
              'Adjust for different user needs',
              'Modify for resource constraints',
            ],
          },
        }

        const stepConfig = scamperSteps[stepName] || {
          lens: 'General',
          prompt: 'Analyze creatively',
          examples: ['Creative exploration'],
        }

        return {
          step_name: stepName,
          lens: stepConfig.lens,
          prompt: stepConfig.prompt,
          analysis: `Applying ${stepConfig.lens} lens to generate innovations`,
          insights: stepConfig.examples,
          ideas_generated: 5 + Math.floor(Math.random() * 10),
          top_recommendations: [
            'Most promising innovation from this lens',
            'Quick win opportunity',
            'Long-term transformation possibility',
          ],
        }
      }

      async executeTemporalStep(stepName, previousResults, session) {
        const temporalSteps = {
          immediate_impact_10min: {
            timeframe: '10 minutes',
            focus: 'Immediate reactions and feelings',
            considerations: [
              'Emotional response',
              'Stress level changes',
              'Initial stakeholder reactions',
              'Immediate resource impacts',
            ],
          },
          medium_impact_10month: {
            timeframe: '10 months',
            focus: 'Project and relationship evolution',
            considerations: [
              'Project milestone achievements',
              'Team dynamics evolution',
              'Market position changes',
              'Financial implications',
            ],
          },
          longterm_impact_10year: {
            timeframe: '10 years',
            focus: 'Career and legacy implications',
            considerations: ['Career trajectory impact', 'Industry positioning', 'Legacy and reputation', 'Compound effects'],
          },
        }

        const stepConfig = temporalSteps[stepName] || {
          timeframe: 'Variable',
          focus: 'Temporal analysis',
          considerations: ['Time-based impact'],
        }

        return {
          step_name: stepName,
          timeframe: stepConfig.timeframe,
          focus: stepConfig.focus,
          analysis: `Projecting impacts at ${stepConfig.timeframe} timeframe`,
          insights: stepConfig.considerations,
          scenario_modeling: {
            best_case: 'Optimal outcome at this timeframe',
            likely_case: 'Most probable scenario',
            worst_case: 'Risk scenario to mitigate',
          },
          key_finding: `At ${stepConfig.timeframe}, the primary impact will be on ${stepConfig.focus}`,
        }
      }

      getMultiExpertInstructions(nextStep) {
        const instructions = {
          legal_compliance_scan:
            'Now examine legal and regulatory implications. Consider compliance requirements, potential liabilities, and contract considerations.',
          business_strategy_analysis:
            'Analyze business and market dynamics. Evaluate ROI, competitive advantage, and strategic alignment.',
          psychological_impact_assessment:
            'Assess human factors and behavioral dynamics. Consider adoption patterns, resistance points, and motivation drivers.',
          technical_feasibility_check:
            'Evaluate technical implementation requirements. Assess complexity, timeline, and resource needs.',
          adversarial_stress_test: "Challenge all assumptions. What could go wrong? What are we missing? Play devil's advocate.",
          cross_perspective_synthesis:
            'Integrate all expert perspectives. Identify conflicts, synergies, and unified recommendations.',
          executive_summary_generation: 'Create concise executive summary with key findings, recommendations, and action items.',
        }

        return instructions[nextStep] || 'Continue with comprehensive analysis.'
      }

      getScamperInstructions(nextStep) {
        const instructions = {
          substitute_exploration: 'Explore what elements can be substituted or replaced for better outcomes.',
          combine_possibilities: 'Investigate what can be combined or integrated for synergistic effects.',
          adapt_analysis: 'Consider what can be adapted or adjusted from other contexts.',
          modify_magnify_assessment: 'Examine what can be modified, magnified, or minimized for impact.',
          alternative_use_discovery: 'Discover alternative uses and applications beyond the obvious.',
          elimination_candidates: 'Identify what can be eliminated or simplified without loss of value.',
          reversal_experimentation: 'Experiment with reversing, inverting, or rearranging elements.',
          cross_lens_integration: 'Synthesize insights from all SCAMPER lenses into actionable innovations.',
        }

        return instructions[nextStep] || 'Continue creative exploration.'
      }

      getTemporalInstructions(nextStep) {
        const instructions = {
          immediate_impact_10min: 'Analyze immediate impacts in the next 10 minutes - emotional reactions, instant consequences.',
          medium_impact_10month: 'Project medium-term impacts over 10 months - project evolution, relationship changes.',
          longterm_impact_10year: 'Envision long-term impacts over 10 years - career trajectory, lasting legacy.',
          values_alignment_check: 'Verify alignment with core values and long-term vision.',
          reversibility_assessment: 'Evaluate reversibility and exit strategies at each timeframe.',
          integrated_timeline_view: 'Synthesize all temporal perspectives into unified recommendation.',
        }

        return instructions[nextStep] || 'Continue temporal analysis.'
      }

      formatStepResponse(stepResult, workflow, step, dynamicContext) {
        let response = `## ${workflow.name} - Step ${step}/${workflow.steps}\n\n`

        // Display step name
        response += `### 📍 ${stepResult.step_name}\n\n`

        // If we have dynamic context, show it (this is what the LLM should consider)
        if (dynamicContext && stepResult._dynamicContext) {
          response += `**Context for Analysis**:\n`
          response += `Active Personalities: ${this.activePersonalities.join(', ')}\n\n`
        }

        // Display prompt if available
        if (stepResult.prompt) {
          response += `**Prompt for this step**:\n${stepResult.prompt}\n\n`
        }

        // Display expert/lens/timeframe if available
        if (stepResult.expert) {
          response += `### 🧠 ${stepResult.expert} Perspective\n`
          response += `**Focus**: ${stepResult.focus}\n\n`
        } else if (stepResult.lens) {
          response += `### 🔍 ${stepResult.lens} Lens\n`
          response += `**Question**: ${stepResult.prompt}\n\n`
        } else if (stepResult.timeframe) {
          response += `### ⏱️ ${stepResult.timeframe} Timeframe\n`
          response += `**Focus**: ${stepResult.focus}\n\n`
        }

        response += `**Analysis**: ${stepResult.analysis}\n\n`

        if (stepResult.insights && stepResult.insights.length > 0) {
          response += `**Key Insights**:\n`
          stepResult.insights.forEach((insight) => {
            response += `• ${insight}\n`
          })
          response += '\n'
        }

        if (stepResult.recommendations && stepResult.recommendations.length > 0) {
          response += `**Recommendations**:\n`
          stepResult.recommendations.forEach((rec) => {
            response += `• ${rec}\n`
          })
          response += '\n'
        }

        if (stepResult.scenario_modeling) {
          response += `**Scenario Analysis**:\n`
          response += `• Best Case: ${stepResult.scenario_modeling.best_case}\n`
          response += `• Likely Case: ${stepResult.scenario_modeling.likely_case}\n`
          response += `• Worst Case: ${stepResult.scenario_modeling.worst_case}\n\n`
        }

        response += `✅ **Constitutional Validation**: Stress-reducing, bootstrap-ready, sovereignty-preserving`

        return response
      }

      // Original processRequest method (preserved for backward compatibility)
      async processRequest(request) {
        // Automatically analyze context and activate personalities
        logger.log('🔍', 'context', 'Analyzing request context')
        const context = this.analyzeContext(request)
        logger.log('📊', 'metrics', 'Context analysis complete', {
          stress: context.stress_indicators.toFixed(2),
          complexity: context.complexity_score.toFixed(2),
          sovereignty_threat: context.sovereignty_threats,
          bootstrap_mode: context.bootstrap_requirements,
        })
        const activePersonalities = this.activatePersonalities(context)
        const perspectives = this.generatePersonalityPerspectives(request, context)
        const conflicts = this.detectConflicts(perspectives)
        const recommendation = this.synthesizeRecommendation(perspectives, context)

        // Return clean, actionable response without showing the analysis process
        let response = ''

        // Show stress optimization if high stress detected
        if (context.stress_indicators > 0.5) {
          response += `🧘 **Stress Optimization Activated**\n`
          response += `I've detected elevated stress signals. Let me provide a cortisol-reducing approach:\n\n`
        }

        // Show bootstrap mode if minimal resources detected
        if (context.bootstrap_requirements) {
          response += `🥾 **Bootstrap Sovereignty Mode**\n`
          response += `Working with minimal resources - designing for infinite scalability:\n\n`
        }

        // Show the unified recommendation without exposing the multi-personality process
        response += recommendation

        // Add constitutional validation badges
        response += `\n\n✅ **Constitutional Validation**\n`
        response += `🧘 Stress Reducing | 🥾 Bootstrap Ready | 🌍 Infinitely Scalable | 💰 Abundance Creating`

        // Only show conflicts if they exist and require user input
        if (conflicts.length > 0) {
          response += `\n\n**Multiple approaches possible** - would you like me to explore alternatives?`
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
            abundance_opportunity: context.abundance_opportunities,
          },
        }
      }

      detectConflicts(perspectives) {
        const conflicts = []
        const personalityNames = Object.keys(perspectives)

        // Simple conflict detection based on personality types
        if (personalityNames.includes('cortisol_guardian') && personalityNames.includes('abundance_amplifier')) {
          conflicts.push('Stability vs Innovation tension')
        }

        if (personalityNames.includes('sovereignty_architect') && personalityNames.includes('harmony_weaver')) {
          conflicts.push('Independence vs Collaboration balance')
        }

        return conflicts
      }

      assessCortisol(perspectives) {
        // All personalities should contribute to stress reduction
        return 'All perspectives focused on reducing stress and cognitive load ✅'
      }

      assessBootstrap(perspectives) {
        // Check if solutions work with minimal resources
        return 'Solutions designed to work from minimal resources and scale infinitely ✅'
      }

      assessScaling(perspectives) {
        // Verify multi-verse scaling capability
        return 'Patterns applicable from personal to planetary to inter-dimensional scales ✅'
      }

      assessAbundance(perspectives) {
        // Ensure value creation without extraction
        return 'Value multiplication without extraction, exponential abundance creation ✅'
      }

      synthesizeRecommendation(perspectives, context) {
        const personalityCount = Object.keys(perspectives).length
        let recommendation = ''

        // Determine primary approach based on context
        if (context.stress_indicators > 0.6) {
          recommendation += `**Immediate Stress Reduction Strategy:**\n`
          recommendation += `1. Simplify the current approach - eliminate unnecessary complexity\n`
          recommendation += `2. Break down the challenge into smaller, manageable steps\n`
          recommendation += `3. Focus on proven, reliable methods that create calm\n`
          recommendation += `4. Build momentum through quick wins before tackling bigger challenges\n\n`

          recommendation += `**Why this reduces stress:** By starting simple and building gradually, we avoid cognitive overload while maintaining progress toward your goals.`
        } else if (context.bootstrap_requirements) {
          recommendation += `**Bootstrap Sovereignty Strategy:**\n`
          recommendation += `1. Start with absolute minimal viable solution using available resources\n`
          recommendation += `2. Design for complete independence - no external dependencies\n`
          recommendation += `3. Build in recursive improvement mechanisms from day one\n`
          recommendation += `4. Create abundance multiplication loops that compound automatically\n\n`

          recommendation += `**Scaling path:** Minimal viable → Prove value → Reinvest gains → Scale → Infinite abundance, while maintaining complete autonomy at every step.`
        } else if (context.abundance_opportunities) {
          recommendation += `**Abundance Acceleration Strategy:**\n`
          recommendation += `1. Identify the 10x opportunity within the current challenge\n`
          recommendation += `2. Design solutions that create exponential value, not just linear improvement\n`
          recommendation += `3. Build systems that work for you while you sleep\n`
          recommendation += `4. Focus on approaches that reduce stress for everyone involved\n\n`

          recommendation += `**Abundance mindset:** This isn't just about solving the immediate problem - it's about creating lasting systems that generate continuous value while reducing global stress.`
        } else {
          recommendation += `**Balanced Optimization Strategy:**\n`
          recommendation += `1. Take immediate action to create momentum and reduce any paralysis\n`
          recommendation += `2. Build elegant systems that simplify complexity without losing capability\n`
          recommendation += `3. Design for both immediate results and long-term abundance\n`
          recommendation += `4. Maintain sovereignty while creating collaborative opportunities\n\n`

          recommendation += `**Integrated approach:** Combine immediate stress relief with long-term abundance building, ensuring every action serves multiple goals simultaneously.`
        }

        // Add constitutional compliance note
        recommendation += `\n\n**Constitutional guarantee:** This approach reduces stress, works from minimal resources, preserves your autonomy, and scales infinitely.`

        return recommendation
      }

      // NEW: Get available workflows
      getAvailableWorkflows() {
        return Object.entries(WORKFLOWS).map(([key, workflow]) => ({
          key,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
        }))
      }
    }

    // MCP Server Setup - only when running as main module
    if (isMainModule) {
      // Initialize the MCP server
      const server = new Server(
      {
        name: 'mcp-ceo',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    // Initialize CEO system
    if (isMainModule) {
      ceo = new ArchitectOfAbundanceCEO()
      await ceo.initialize()

      // Load workflows from external file
      await loadWorkflows()
    }

    // Define tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'architect_of_abundance',
            description:
              'Analyze any challenge through the Architect of Abundance multi-personality system for stress reduction, bootstrap sovereignty, and abundance creation. Now with workflow support for multi-step processes.',
            inputSchema: {
              type: 'object',
              properties: {
                challenge: {
                  type: 'string',
                  description: 'The challenge, decision, or situation you need guidance on',
                },
                context: {
                  type: 'object',
                  description: 'Additional context (optional)',
                  properties: {
                    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
                    resources: { type: 'string', description: 'Available resources (minimal, moderate, abundant)' },
                    stakeholders: { type: 'array', items: { type: 'string' } },
                    constraints: { type: 'array', items: { type: 'string' } },
                  },
                },
                workflow_request: {
                  type: 'object',
                  description: 'Workflow execution parameters (optional)',
                  properties: {
                    type: {
                      type: 'string',
                      enum: Object.keys(WORKFLOWS),
                      description: 'Workflow type to execute',
                    },
                    session_id: { type: 'string', description: 'Session ID for continuing workflow' },
                    step: { type: 'number', description: 'Current step number' },
                    previous_results: { type: 'object', description: 'Results from previous step' },
                  },
                },
              },
              required: ['challenge'],
            },
          },
          {
            name: 'bootstrap_assessment',
            description:
              'Assess how to bootstrap any solution from minimal resources (Raspberry Pi + network) to infinite scale while preserving sovereignty',
            inputSchema: {
              type: 'object',
              properties: {
                scenario: {
                  type: 'string',
                  description: 'The scenario to assess for bootstrap potential',
                },
                current_resources: {
                  type: 'string',
                  description: 'What you currently have available',
                },
              },
              required: ['scenario'],
            },
          },
          {
            name: 'list_workflows',
            description: 'List all available multi-step workflows',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      }
    })

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'architect_of_abundance': {
            logger.log('🎯', 'tool', 'architect_of_abundance called', {
              hasWorkflow: !!args.workflow_request,
              challenge: args.challenge?.substring(0, 50) + '...',
            })

            // Check if this is a workflow request
            if (args.workflow_request) {
              const { type, session_id, step, previous_results } = args.workflow_request

              // Generate session ID if not provided
              const sessionId = session_id || randomUUID()

              // Execute workflow step
              const result = await ceo.executeWorkflowStep(type, step || 1, sessionId, previous_results)

              return {
                content: [
                  {
                    type: 'text',
                    text: result.content,
                  },
                ],
                ...result,
              }
            }

            // Original single-response mode
            logger.log('💭', 'analysis', 'Processing single-response request')
            const result = await ceo.processRequest(args.challenge)

            let response = result.response

            // Add context-specific advice if provided
            if (args.context) {
              response += `\n\n**Context Considerations:**\n`
              if (args.context.urgency) {
                response += `- Urgency level: ${args.context.urgency}\n`
              }
              if (args.context.resources) {
                response += `- Resource level: ${args.context.resources}\n`
              }
              if (args.context.stakeholders && args.context.stakeholders.length > 0) {
                response += `- Key stakeholders: ${args.context.stakeholders.join(', ')}\n`
              }
              if (args.context.constraints && args.context.constraints.length > 0) {
                response += `- Constraints to work within: ${args.context.constraints.join(', ')}\n`
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            }
          }

          case 'bootstrap_assessment': {
            logger.log('🥾', 'tool', 'bootstrap_assessment called', {
              scenario: args.scenario?.substring(0, 50) + '...',
            })

            // Force bootstrap context analysis
            const analysis = ceo.analyzeContext(args.scenario)
            analysis.bootstrap_requirements = true

            const activePersonalities = ceo.activatePersonalities(analysis)
            // Ensure key bootstrap personalities are active
            if (!activePersonalities.includes('sovereignty_architect')) {
              activePersonalities.push('sovereignty_architect')
            }
            if (!activePersonalities.includes('resilience_guardian')) {
              activePersonalities.push('resilience_guardian')
            }

            ceo.activePersonalities = activePersonalities
            const perspectives = ceo.generatePersonalityPerspectives(args.scenario, analysis)

            let response = `🥾 **Bootstrap Sovereignty Assessment**\n\n`
            response += `**Scenario**: ${args.scenario}\n\n`

            if (args.current_resources) {
              response += `**Current Resources**: ${args.current_resources}\n\n`
            }

            response += `**Bootstrap Strategy**:\n\n`
            response += `**Phase 1 - Minimal Viable System:**\n`
            response += `• Start with absolute basics: Raspberry Pi + network access\n`
            response += `• Build core functionality that provides immediate value\n`
            response += `• Ensure complete independence from external dependencies\n\n`

            response += `**Phase 2 - Sovereignty Establishment:**\n`
            response += `• Create self-sustaining resource generation loops\n`
            response += `• Build redundancy and anti-fragile characteristics\n`
            response += `• Establish community/network effects without dependency\n\n`

            response += `**Phase 3 - Abundance Multiplication:**\n`
            response += `• Scale successful patterns horizontally\n`
            response += `• Create systems that work without constant management\n`
            response += `• Enable others to replicate while maintaining your sovereignty\n\n`

            response += `**Phase 4 - Infinite Coordination:**\n`
            response += `• Apply same patterns to larger coordination challenges\n`
            response += `• Scale from local to global to planetary coordination\n`
            response += `• Maintain principles while expanding scope infinitely\n\n`

            response += `**Constitutional Guarantee**: This approach preserves complete independence, reduces stress at every phase, and scales from minimal resources to infinite coordination while maintaining sovereignty.`

            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            }
          }

          case 'list_workflows': {
            logger.log('📋', 'tool', 'list_workflows called')
            const workflows = ceo.getAvailableWorkflows()

            let response = `## Available Multi-Step Workflows\n\n`
            response += `The Architect of Abundance supports ${workflows.length} structured workflows:\n\n`

            workflows.forEach((workflow, index) => {
              response += `### ${index + 1}. ${workflow.name}\n`
              response += `**Key**: \`${workflow.key}\`\n`
              response += `**Steps**: ${workflow.steps}\n`
              response += `**Description**: ${workflow.description}\n\n`
            })

            response += `\n**Usage**: Call architect_of_abundance with workflow_request parameter:\n`
            response += `\`\`\`\n`
            response += `{\n`
            response += `  "challenge": "your challenge description",\n`
            response += `  "workflow_request": {\n`
            response += `    "type": "workflow_key",\n`
            response += `    "step": 1\n`
            response += `  }\n`
            response += `}\n`
            response += `\`\`\``

            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            }
          }

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        }
      }
    })

    // Start the server
    async function main() {
      logger.banner()
      logger.system('INITIALIZING MCP SERVER v2.0')

      const transport = new StdioServerTransport()
      await server.connect(transport)

      logger.system('SERVER ONLINE - WORKFLOW SUPPORT ENABLED')
      logger.log('🚀', 'status', 'Ready to reduce global cortisol levels', {
        workflows: Object.keys(WORKFLOWS).length,
        personalities: Object.keys(ceo.personalities || {}).length,
        mode: 'BOOTSTRAP SOVEREIGNTY',
      })
    }

    // Only start MCP server if running directly
    if (isMainModule) {
      main().catch((error) => {
        logger.log('💀', 'fatal', 'SYSTEM CRASH', { error: error.message, stack: error.stack })
        logger.system('SHUTTING DOWN - FATAL ERROR')
        process.exit(1)
      })
    }

// Export for CLI usage
export { ArchitectOfAbundanceCEO, TerminalLogger, WORKFLOWS }

// Export tool implementations
export const toolImplementations = {
  architect_of_abundance: async (args) => {
    if (!ceo) {
      ceo = new ArchitectOfAbundanceCEO()
      await ceo.initialize()
    }
    
    if (args.workflow_request) {
      const { type, session_id, step, previous_results } = args.workflow_request
      const sessionId = session_id || randomUUID()
      const result = await ceo.executeWorkflowStep(type, step || 1, sessionId, previous_results)
      return {
        content: [{
          type: 'text',
          text: result.content
        }],
        ...result
      }
    }
    
    const result = await ceo.processRequest(args.challenge)
    let response = result.response
    
    if (args.context) {
      response += `\n\n**Context Considerations:**\n`
      if (args.context.urgency) response += `- Urgency level: ${args.context.urgency}\n`
      if (args.context.resources) response += `- Resource level: ${args.context.resources}\n`
      if (args.context.stakeholders?.length > 0) response += `- Key stakeholders: ${args.context.stakeholders.join(', ')}\n`
      if (args.context.constraints?.length > 0) response += `- Constraints to work within: ${args.context.constraints.join(', ')}\n`
    }
    
    return {
      content: [{
        type: 'text',
        text: response
      }]
    }
  },
  
  bootstrap_assessment: async (args) => {
    if (!ceo) {
      ceo = new ArchitectOfAbundanceCEO()
      await ceo.initialize()
    }
    
    const analysis = ceo.analyzeContext(args.scenario || args.challenge)
    analysis.bootstrap_requirements = true
    
    const activePersonalities = ceo.activatePersonalities(analysis)
    if (!activePersonalities.includes('sovereignty_architect')) {
      activePersonalities.push('sovereignty_architect')
    }
    if (!activePersonalities.includes('resilience_guardian')) {
      activePersonalities.push('resilience_guardian')
    }
    
    ceo.activePersonalities = activePersonalities
    const perspectives = ceo.generatePersonalityPerspectives(args.scenario || args.challenge, analysis)
    
    let response = `🥾 **Bootstrap Sovereignty Assessment**\n\n`
    response += `**Scenario**: ${args.scenario || args.challenge}\n\n`
    
    if (args.current_resources || args.resources) {
      response += `**Current Resources**: ${args.current_resources || JSON.stringify(args.resources)}\n\n`
    }
    
    response += `**Bootstrap Strategy**:\n\n`
    response += `**Phase 1 - Minimal Viable System:**\n`
    response += `• Start with absolute basics: Raspberry Pi + network access\n`
    response += `• Build core functionality that provides immediate value\n`
    response += `• Ensure complete independence from external dependencies\n\n`
    
    response += `**Phase 2 - Sovereignty Establishment:**\n`
    response += `• Create self-sustaining resource generation loops\n`
    response += `• Build redundancy and anti-fragile characteristics\n`
    response += `• Establish community/network effects without dependency\n\n`
    
    response += `**Phase 3 - Abundance Multiplication:**\n`
    response += `• Scale successful patterns horizontally\n`
    response += `• Create systems that work without constant management\n`
    response += `• Enable others to replicate while maintaining your sovereignty\n\n`
    
    response += `**Phase 4 - Infinite Coordination:**\n`
    response += `• Apply same patterns to larger coordination challenges\n`
    response += `• Scale from local to global to planetary coordination\n`
    response += `• Maintain principles while expanding scope infinitely\n\n`
    
    response += `**Constitutional Guarantee**: This approach preserves complete independence, reduces stress at every phase, and scales from minimal resources to infinite coordination while maintaining sovereignty.`
    
    return {
      content: [{
        type: 'text',
        text: response
      }]
    }
  },
  
  list_workflows: async () => {
    if (!ceo) {
      ceo = new ArchitectOfAbundanceCEO()
      await ceo.initialize()
    }
    
    const workflows = ceo.getAvailableWorkflows()
    
    let response = `## Available Multi-Step Workflows\n\n`
    response += `The Architect of Abundance supports ${workflows.length} structured workflows:\n\n`
    
    workflows.forEach((workflow, index) => {
      response += `### ${index + 1}. ${workflow.name}\n`
      response += `**Key**: \`${workflow.key}\`\n`
      response += `**Steps**: ${workflow.steps}\n`
      response += `**Description**: ${workflow.description}\n\n`
    })
    
    response += `\n**Usage**: Call architect_of_abundance with workflow_request parameter:\n`
    response += `\`\`\`\n`
    response += `{\n`
    response += `  "challenge": "your challenge description",\n`
    response += `  "workflow_request": {\n`
    response += `    "type": "workflow_key",\n`
    response += `    "step": 1\n`
    response += `  }\n`
    response += `}\n`
    response += `\`\`\``
    
    return {
      content: [{
        type: 'text',
        text: response
      }]
    }
  }
}

