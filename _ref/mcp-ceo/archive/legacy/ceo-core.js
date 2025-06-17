/**
 * CEO Core - Extracted business logic for MCP-CEO
 * Can be used by both MCP server and CLI
 */

import fs from 'fs/promises'
import yaml from 'yaml'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// BBS-style terminal logging
export class TerminalLogger {
  constructor() {
    this.sessionStart = new Date()
    this.logCount = 0
  }

  getTimestamp() {
    const now = new Date()
    const elapsed = Math.floor((now - this.sessionStart) / 1000)
    const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0')
    const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')
    const seconds = (elapsed % 60).toString().padStart(2, '0')
    return `[${hours}:${minutes}:${seconds}]`
  }

  log(emoji, category, message, data = null) {
    this.logCount++
    const timestamp = this.getTimestamp()
    const logId = this.logCount.toString().padStart(5, '0')

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
    console.error(`\x1b[31m▓\x1b[0m \x1b[93m⚡ SYSTEM\x1b[0m \x1b[31m▓\x1b[0m ${message.padEnd(60)} \x1b[31m▓\x1b[0m`)
    console.error(`\x1b[31m▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[0m`)
  }

  personality(name, status = 'ACTIVATED') {
    const personalities = {
      cortisol_guardian: '🧘',
      abundance_amplifier: '💰',
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
    console.error(`\x1b[34m◎ SESSION\x1b[0m ${sessionId.substring(0, 12)}... \x1b[32m${action}\x1b[0m`)
  }

  banner() {
    console.error(`\x1b[35m
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ▄▄▄       ██▀███   ▄████▄   ██░ ██  ██▓▄▄▄█████▓▓█████  ▄████▄  ▄▄▄█████▓  ║
║ ▒████▄    ▓██ ▒ ██▒▒██▀ ▀█  ▓██░ ██▒▓██▒▓  ██▒ ▓▒▓█   ▀ ▒██▀ ▀█  ▓  ██▒ ▓▒  ║
║ ▒██  ▀█▄  ▓██ ░▄█ ▒▒▓█    ▄ ▒██▀▀██░▒██▒▒ ▓██░ ▒░▒███   ▒▓█    ▄ ▒ ▓██░ ▒░  ║
║ ░██▄▄▄▄██ ▒██▀▀█▄  ▒▓▓▄ ▄██▒░▓█ ░██ ░██░░ ▓██▓ ░ ▒▓█  ▄ ▒▓▓▄ ▄██▒░ ▓██▓ ░   ║
║  ▓█   ▓██▒░██▓ ▒██▒▒ ▓███▀ ░░▓█▒░██▓░██░  ▒██▒ ░ ░▒████▒▒ ▓███▀ ░  ▒██▒ ░   ║
║  ▒▒   ▓▒█░░ ▒▓ ░▒▓░░ ░▒ ▒  ░ ▒ ░░▒░▒░▓    ▒ ░░   ░░ ▒░ ░░ ░▒ ▒  ░  ▒ ░░     ║
║                  ARCHITECT OF ABUNDANCE v2.0 // MCP SERVER                     ║
║                      CORTISOL REDUCTION PROTOCOL ACTIVE                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝
\x1b[0m`)
  }
}

// Session Manager - Enhanced with folder per session and markdown
class SessionManager {
  constructor(sessionsPath = './sessions') {
    this.sessionsPath = sessionsPath
  }

  async ensureSessionDir(sessionId) {
    const sessionDir = path.join(this.sessionsPath, sessionId)
    await fs.mkdir(sessionDir, { recursive: true })
    return sessionDir
  }

  async saveStep(sessionId, step, stepData) {
    const sessionDir = await this.ensureSessionDir(sessionId)
    const stepDir = path.join(sessionDir, `step-${step}`)
    await fs.mkdir(stepDir, { recursive: true })
    
    // Save complete data as JSON
    const jsonPath = path.join(stepDir, 'complete.json')
    await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
    
    // Save input (what MCP asked LLM to do)
    const inputPath = path.join(stepDir, 'input.md')
    const inputMd = this.formatStepInput(step, stepData)
    await fs.writeFile(inputPath, inputMd)
    
    // Save instructions for LLM
    const instructionsPath = path.join(stepDir, 'instructions.md')
    const instructionsMd = this.formatStepInstructions(step, stepData)
    await fs.writeFile(instructionsPath, instructionsMd)
    
    // Response will be saved later when LLM calls back
    const responsePath = path.join(stepDir, 'response.md')
    await fs.writeFile(responsePath, '*Awaiting LLM response...*')
    
    // Save summary
    const summaryPath = path.join(stepDir, 'summary.md')
    const summaryMd = this.formatStepSummary(step, stepData)
    await fs.writeFile(summaryPath, summaryMd)
    
    // Keep legacy format for backward compatibility
    const legacyJsonPath = path.join(sessionDir, `step-${step}.json`)
    const legacyMdPath = path.join(sessionDir, `step-${step}.md`)
    await fs.writeFile(legacyJsonPath, JSON.stringify(stepData, null, 2))
    await fs.writeFile(legacyMdPath, this.formatStepMarkdown(step, stepData))
    
    return { stepDir, jsonPath, inputPath, responsePath, summaryPath }
  }

  formatStepMarkdown(step, stepData) {
    let md = `# Step ${step}: ${stepData.name}\n\n`
    md += `**Timestamp**: ${stepData.timestamp}\n\n`
    
    md += `## Input\n\n`
    md += `### Step Instructions\n${stepData.input.stepPrompt}\n\n`
    md += `### Active Personalities\n${stepData.input.activePersonalities.map(p => `- ${p}`).join('\n')}\n\n`
    md += `### Previous Context\n\`\`\`json\n${JSON.stringify(stepData.input.previousContext, null, 2)}\n\`\`\`\n\n`
    
    md += `## Processing\n\n`
    md += `### Context Prompt (Full)\n<details>\n<summary>Click to expand full prompt</summary>\n\n\`\`\`\n${stepData.input.contextPrompt}\n\`\`\`\n</details>\n\n`
    
    md += `## Output\n\n`
    md += `### Response\n${stepData.output.response}\n\n`
    
    if (stepData.output.callbackInstruction) {
      md += `### Callback Instructions\n${stepData.output.callbackInstruction}\n\n`
    }
    
    if (stepData.output.nextStep) {
      md += `### Next Step\n${stepData.output.nextStep}\n`
    }
    
    return md
  }

  formatStepInput(step, stepData) {
    let md = `# Step ${step} Input: ${stepData.name}\n\n`
    md += `**Generated at**: ${stepData.timestamp}\n\n`
    md += `## Task for This Step\n\n`
    md += `${stepData.input.stepPrompt}\n\n`
    md += `## Active Personalities\n\n`
    stepData.input.activePersonalities.forEach(p => {
      md += `### ${p.replace(/_/g, ' ').toUpperCase()}\n`
      // Note: personalities would need to be passed in or stored globally
      md += `\n`
    })
    md += `## Previous Context Available\n\n`
    md += `\`\`\`json\n${JSON.stringify(stepData.input.previousContext, null, 2)}\n\`\`\`\n`
    return md
  }

  formatStepInstructions(step, stepData) {
    let md = `# Instructions for Step ${step}\n\n`
    md += `${stepData.output.instructions || stepData.input.contextPrompt}\n\n`
    md += `## How to Continue\n\n`
    md += `After processing the above, call:\n\n`
    md += `\`\`\`\n${stepData.output.callbackInstruction || 'See instructions above'}\n\`\`\`\n`
    return md
  }

  formatStepSummary(step, stepData) {
    let md = `# Step ${step} Summary: ${stepData.name}\n\n`
    md += `**Status**: ${stepData.output.response ? '✅ Complete' : '⏳ Awaiting Response'}\n\n`
    md += `## Quick Overview\n\n`
    md += `- **Task**: ${stepData.input.stepPrompt.split('\n')[0]}...\n`
    md += `- **Personalities**: ${stepData.input.activePersonalities.join(', ')}\n`
    md += `- **Started**: ${stepData.timestamp}\n`
    if (stepData.output.completedAt) {
      md += `- **Completed**: ${stepData.output.completedAt}\n`
    }
    return md
  }

  async saveSession(sessionId, sessionData) {
    const sessionDir = await this.ensureSessionDir(sessionId)
    
    // Save main session file
    const sessionPath = path.join(sessionDir, 'session.json')
    await fs.writeFile(sessionPath, JSON.stringify(sessionData, null, 2))
    
    // Save session summary markdown
    const summaryPath = path.join(sessionDir, 'README.md')
    const summary = this.formatSessionSummary(sessionData)
    await fs.writeFile(summaryPath, summary)
    
    return sessionPath
  }

  formatSessionSummary(sessionData) {
    let md = `# Workflow Session: ${sessionData.workflow}\n\n`
    md += `**Session ID**: ${sessionData.id}\n`
    md += `**Started**: ${sessionData.startTime}\n`
    md += `**Topic**: ${sessionData.topic || 'Unknown'}\n\n`
    
    md += `## Steps Completed\n\n`
    Object.entries(sessionData.steps || {}).forEach(([stepNum, stepInfo]) => {
      md += `${stepNum}. ${stepInfo.name || 'Step ' + stepNum} - ${stepInfo.timestamp}\n`
    })
    
    md += `\n## Context Evolution\n\n`
    Object.entries(sessionData.context || {}).forEach(([key, value]) => {
      md += `### ${key}\n${JSON.stringify(value, null, 2)}\n\n`
    })
    
    return md
  }

  async load(sessionId) {
    const sessionDir = path.join(this.sessionsPath, sessionId)
    const sessionPath = path.join(sessionDir, 'session.json')
    
    try {
      const content = await fs.readFile(sessionPath, 'utf8')
      return JSON.parse(content)
    } catch (e) {
      // Try legacy format
      const files = await fs.readdir(this.sessionsPath).catch(() => [])
      const sessionFile = files.find((f) => f.startsWith(sessionId) && f.endsWith('.json'))
      if (sessionFile) {
        const filepath = path.join(this.sessionsPath, sessionFile)
        const content = await fs.readFile(filepath, 'utf8')
        return JSON.parse(content)
      }
      return null
    }
  }

  async updateStep(sessionId, step, updateData) {
    console.log(`[DEBUG] updateStep called for session ${sessionId}, step ${step}`)
    const sessionDir = await this.ensureSessionDir(sessionId)
    const stepDir = path.join(sessionDir, `step-${step}`)
    
    // Load existing step data
    const jsonPath = path.join(stepDir, 'complete.json')
    let stepData = {}
    try {
      const content = await fs.readFile(jsonPath, 'utf8')
      stepData = JSON.parse(content)
    } catch (e) {
      // Try legacy location
      try {
        const legacyPath = path.join(sessionDir, `step-${step}.json`)
        const content = await fs.readFile(legacyPath, 'utf8')
        stepData = JSON.parse(content)
      } catch (e2) {
        console.error('Could not load step data:', e2)
      }
    }
    
    // Update with new data
    stepData.output = {
      ...stepData.output,
      ...updateData
    }
    
    // Save updated complete data
    await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
    
    // Update response file if response is included
    let responsePath = null
    if (updateData.response) {
      responsePath = path.join(stepDir, 'response.md')
      let responseMd = `# Step ${step} Response\n\n`
      responseMd += `**Completed at**: ${updateData.completedAt}\n\n`
      responseMd += `## LLM Response\n\n`
      responseMd += `${updateData.response}\n`
      await fs.writeFile(responsePath, responseMd)
      
      // Update summary
      const summaryPath = path.join(stepDir, 'summary.md')
      const summaryMd = this.formatStepSummary(step, stepData)
      await fs.writeFile(summaryPath, summaryMd)
    }
    
    // Update legacy files
    const legacyJsonPath = path.join(sessionDir, `step-${step}.json`)
    const legacyMdPath = path.join(sessionDir, `step-${step}.md`)
    await fs.writeFile(legacyJsonPath, JSON.stringify(stepData, null, 2))
    await fs.writeFile(legacyMdPath, this.formatStepMarkdownWithResponse(step, stepData))
    
    return { stepDir, jsonPath, responsePath }
  }
  
  formatStepMarkdownWithResponse(step, stepData) {
    let md = `# Step ${step}: ${stepData.name}\n\n`
    md += `**Timestamp**: ${stepData.timestamp}\n`
    md += `**Completed**: ${stepData.output.completedAt || 'In Progress'}\n\n`
    
    md += `## Input (What MCP Asked)\n\n`
    md += `### Task\n${stepData.input.stepPrompt}\n\n`
    md += `### Active Personalities\n${stepData.input.activePersonalities.map(p => `- ${p}`).join('\n')}\n\n`
    
    md += `## Output (What LLM Responded)\n\n`
    if (stepData.output.response) {
      md += `### Response\n${stepData.output.response}\n\n`
    } else {
      md += `### Response\n*Awaiting LLM response...*\n\n`
    }
    
    md += `## Next Step Instructions\n`
    if (stepData.output.callbackInstruction) {
      md += `${stepData.output.callbackInstruction}\n`
    }
    
    return md
  }
}

// Workflows (moved outside for easier access)
export const WORKFLOWS = {}

export async function loadWorkflows() {
  try {
    const workflowPath = path.join(__dirname, 'workflows.yaml')
    const workflowContent = await fs.readFile(workflowPath, 'utf8')
    const workflowData = yaml.parse(workflowContent)
    
    Object.assign(WORKFLOWS, workflowData.workflows)
    
    const logger = new TerminalLogger()
    logger.log('📋', 'workflows', 'Loaded workflows from external file', {
      count: Object.keys(WORKFLOWS).length,
      workflows: Object.keys(WORKFLOWS),
    })
  } catch (error) {
    console.error('Failed to load workflows:', error.message)
    // Load default workflows if external file fails
    Object.assign(WORKFLOWS, getDefaultWorkflows())
  }
}

function getDefaultWorkflows() {
  return {
    simple_test: {
      name: 'Simple Test Workflow',
      description: 'Basic 3-step workflow for testing',
      steps: 3,
      sequence: [
        { id: 1, name: 'define_challenge', prompt: 'Define the challenge clearly' },
        { id: 2, name: 'analyze_context', prompt: 'Analyze the context and constraints' },
        { id: 3, name: 'synthesize_solution', prompt: 'Synthesize the final solution' },
      ],
    },
    deep_analysis: {
      name: 'Deep Analysis Workflow',
      description: 'Comprehensive multi-perspective analysis of complex challenges',
      steps: 8,
      sequence: [
        { id: 1, name: 'challenge_definition', prompt: 'Define and frame the core challenge' },
        { id: 2, name: 'stakeholder_mapping', prompt: 'Map all stakeholders and their concerns' },
        { id: 3, name: 'system_dynamics', prompt: 'Analyze system dynamics and feedback loops' },
        { id: 4, name: 'opportunity_scan', prompt: 'Scan for hidden opportunities' },
        { id: 5, name: 'risk_assessment', prompt: 'Assess risks and mitigation strategies' },
        { id: 6, name: 'resource_optimization', prompt: 'Optimize resource allocation' },
        { id: 7, name: 'implementation_path', prompt: 'Design implementation pathway' },
        { id: 8, name: 'success_metrics', prompt: 'Define success metrics and validation' },
      ],
    },
  }
}

// CEO System Class
export class ArchitectOfAbundanceCEO {
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
    this.logger = new TerminalLogger()
  }

  async initialize() {
    try {
      const configPath = path.join(__dirname, 'ceo-config.yaml')
      const configContent = await fs.readFile(configPath, 'utf8')
      const config = yaml.parse(configContent)

      this.personalities = config.personalities
      this.systemPrompt = config.system_prompt

      this.logger.system('ARCHITECT OF ABUNDANCE CEO INITIALIZED')
      this.logger.log('✅', 'init', 'Multi-personality system loaded successfully', {
        personalities: Object.keys(this.personalities).length,
        systemPromptLength: this.systemPrompt.length,
      })
      return true
    } catch (error) {
      this.logger.log('❌', 'error', 'Failed to initialize CEO system', { error: error.message })
      this.logger.log('🔧', 'config', 'Creating default configuration...')
      await this.createDefaultConfig()
      return false
    }
  }

  async createDefaultConfig() {
    const defaultConfig = await this.getDefaultConfig()
    const configPath = path.join(__dirname, 'ceo-config.yaml')
    await fs.writeFile(configPath, yaml.stringify(defaultConfig))
    await this.initialize()
  }

  async getDefaultConfig() {
    // Return the full default config (abbreviated here for space)
    return {
      system_prompt: "You are **The Architect of Abundance**...",
      personalities: {
        cortisol_guardian: {
          role: 'Stress reduction, system stability, cortisol optimization through proven patterns',
          activation_triggers: ['stress_spike', 'anxiety_creation', 'cognitive_overload'],
          hormone_profile: 'serotonin_seeking',
          communication_style: 'calming_reassuring',
          bootstrap_focus: 'Even on minimal hardware, we can eliminate anxiety through simple, reliable systems',
        },
        // ... other personalities
      }
    }
  }

  analyzeContext(challenge) {
    const analysis = {
      stress_indicators: 0,
      opportunity_indicators: 0,
      complexity_indicators: 0,
      sovereignty_risks: 0,
      bootstrap_requirements: false,
    }

    const lowerChallenge = challenge.toLowerCase()
    
    if (lowerChallenge.match(/stress|anxiety|overwhelm|pressure|deadline/)) {
      analysis.stress_indicators++
    }
    if (lowerChallenge.match(/opportunity|growth|scale|expand|potential/)) {
      analysis.opportunity_indicators++
    }
    if (lowerChallenge.match(/complex|complicated|difficult|challenging|multiple/)) {
      analysis.complexity_indicators++
    }
    if (lowerChallenge.match(/depend|rely|external|vendor|platform/)) {
      analysis.sovereignty_risks++
    }
    if (lowerChallenge.match(/bootstrap|minimal|limited|raspberry|start/)) {
      analysis.bootstrap_requirements = true
    }

    return analysis
  }

  activatePersonalities(contextAnalysis) {
    const active = []

    if (contextAnalysis.stress_indicators > 0) {
      active.push('cortisol_guardian')
    }
    if (contextAnalysis.opportunity_indicators > 0) {
      active.push('abundance_amplifier')
    }
    if (contextAnalysis.sovereignty_risks > 0 || contextAnalysis.bootstrap_requirements) {
      active.push('sovereignty_architect')
    }
    if (contextAnalysis.complexity_indicators > 0) {
      active.push('systems_illuminator')
    }

    if (active.length === 0) {
      active.push('cortisol_guardian', 'abundance_amplifier')
    }

    active.forEach((p) => this.logger.personality(p))

    return active
  }

  generatePersonalityPerspectives(challenge, analysis) {
    const perspectives = {}

    this.activePersonalities.forEach((personalityKey) => {
      const personality = this.personalities[personalityKey]
      perspectives[personalityKey] = {
        viewpoint: `From the ${personalityKey.replace('_', ' ')} perspective...`,
        recommendation: `Based on ${personality.role}...`,
        bootstrap_note: personality.bootstrap_focus,
      }
    })

    return perspectives
  }

  synthesizeRecommendation(perspectives, analysis) {
    let recommendation = `## Unified Recommendation\n\n`

    if (analysis.stress_indicators > 0) {
      recommendation += `**Immediate Stress Reduction Strategy:**\n`
      recommendation += `1. Take three deep breaths right now - this physiologically reduces cortisol\n`
      recommendation += `2. Break the challenge into micro-steps that can be completed in 5 minutes\n`
      recommendation += `3. Focus only on the next immediate action, not the entire scope\n\n`
    }

    recommendation += `**Bootstrap Implementation Path:**\n`
    recommendation += `• Start with what you have right now - no new resources needed\n`
    recommendation += `• Build the smallest working version first (your "Raspberry Pi" version)\n`
    recommendation += `• Ensure it works completely independently before scaling\n`
    recommendation += `• Each expansion maintains the same sovereignty principle\n\n`

    if (Object.keys(perspectives).length > 2) {
      recommendation += `**Multi-Perspective Synthesis:**\n`
      Object.entries(perspectives).forEach(([key, persp]) => {
        recommendation += `• **${key.replace(/_/g, ' ').toUpperCase()}**: ${persp.bootstrap_note}\n`
      })
      recommendation += `\n`
    } else {
      recommendation += `**Balanced Optimization Strategy:**\n`
      recommendation += `1. Take immediate action to create momentum and reduce any paralysis\n`
      recommendation += `2. Build elegant systems that simplify complexity without losing capability\n`
      recommendation += `3. Design for both immediate results and long-term abundance\n`
      recommendation += `4. Maintain sovereignty while creating collaborative opportunities\n\n`

      recommendation += `**Integrated approach:** Combine immediate stress relief with long-term abundance building, ensuring every action serves multiple goals simultaneously.`
    }

    recommendation += `\n\n**Constitutional guarantee:** This approach reduces stress, works from minimal resources, preserves your autonomy, and scales infinitely.`

    return recommendation
  }

  assembleDynamicContext(workflow, step, previousContext = {}, currentStep) {
    // Use personalities from step if defined, otherwise use defaults
    const relevantPersonalities = currentStep.personalities || ['cortisol_guardian', 'abundance_amplifier']
    
    const contextPrompt = `
${this.systemPrompt}

## Current Workflow: ${workflow.name}
## Step ${step} of ${workflow.total_steps || workflow.steps.length}: ${currentStep.name}

### Active Personalities for This Step:
${relevantPersonalities.map((p) => `- ${p}: ${this.personalities[p]?.role || 'Unknown role'}`).join('\n')}

### Previous Context:
${JSON.stringify(previousContext, null, 2)}

### Step Instructions:
${currentStep.prompt}

Generate a response that advances this workflow step while maintaining constitutional principles.
`

    return { contextPrompt, activePersonalities: relevantPersonalities }
  }

  async processRequest(challenge) {
    const analysis = this.analyzeContext(challenge)
    this.activePersonalities = this.activatePersonalities(analysis)
    const perspectives = this.generatePersonalityPerspectives(challenge, analysis)
    const recommendation = this.synthesizeRecommendation(perspectives, analysis)

    return {
      response: recommendation,
      metadata: {
        activePersonalities: this.activePersonalities,
        analysis,
      },
    }
  }


  async executeWorkflowStep(workflowType, step, sessionId, previousResults = null) {
    console.log(`[DEBUG] executeWorkflowStep: type=${workflowType}, step=${step}, hasPrevResults=${!!previousResults}`)
    if (previousResults) {
      console.log(`[DEBUG] previousResults keys:`, Object.keys(previousResults))
    }
    const workflow = WORKFLOWS[workflowType]
    if (!workflow) {
      throw new Error(`Unknown workflow type: ${workflowType}`)
    }

    const totalSteps = workflow.total_steps || workflow.steps?.length || 0
    if (step > totalSteps) {
      throw new Error(`Step ${step} exceeds workflow length of ${totalSteps}`)
    }

    workflow.key = workflowType
    const currentStep = workflow.steps?.[step - 1]
    if (!currentStep) {
      throw new Error(`Step ${step} not found in workflow`)
    }

    this.logger.workflow(step, totalSteps, currentStep.name)

    let session = await this.sessionManager.load(sessionId)
    if (!session) {
      session = {
        id: sessionId,
        workflow: workflowType,
        startTime: new Date().toISOString(),
        steps: {},
        context: {},
        challenge: previousResults?.challenge || ''
      }
    }

    // If we have previous results, this is a callback with the actual response
    if (previousResults?.response) {
      // Save the previous step's actual response
      const prevStep = step - 1
      if (prevStep > 0) {
        session.context[`step_${prevStep}_response`] = previousResults.response
        session.steps[prevStep] = {
          ...session.steps[prevStep],
          actualResponse: previousResults.response,
          completedAt: new Date().toISOString()
        }
        
        // Also save the response to the step file
        console.log(`[DEBUG] Saving response for step ${prevStep}:`, previousResults.response.substring(0, 50) + '...')
        await this.sessionManager.updateStep(sessionId, prevStep, {
          response: previousResults.response,
          completedAt: new Date().toISOString()
        })
      }
    }

    const { contextPrompt, activePersonalities } = this.assembleDynamicContext(workflow, step, session.context, currentStep)

    activePersonalities.forEach((p) => this.logger.personality(p))

    // This is the key change - we return the instructions, not a mock response
    const instructionsForLLM = contextPrompt
    
    // Create detailed step data for logging
    const stepData = {
      step: step,
      name: currentStep.name,
      timestamp: new Date().toISOString(),
      input: {
        contextPrompt: instructionsForLLM,
        activePersonalities,
        previousContext: session.context,
        workflowType: workflowType,
        stepPrompt: currentStep.prompt,
        challenge: session.challenge
      },
      output: {
        instructions: instructionsForLLM,
        waitingForResponse: true,
        nextStep: step < totalSteps ? workflow.steps[step]?.name : null,
        callbackInstruction: currentStep.callback_instruction
      }
    }

    // Save individual step
    await this.sessionManager.saveStep(sessionId, step, stepData)

    // Update session
    session.steps[step] = {
      name: currentStep.name,
      timestamp: stepData.timestamp,
      completed: true
    }
    // Don't save undefined response here - this is for the instructions phase
    // Response will be saved when we get the callback with previous_results
    session.lastStep = step
    session.topic = workflow.name.toLowerCase().replace(/\s+/g, '_')

    // Save updated session
    await this.sessionManager.saveSession(sessionId, session)
    this.logger.session(sessionId, `SAVED: ${session.topic}`)

    return {
      content: [{
        type: 'text',
        text: this.formatWorkflowInstructions(stepData, workflow, step, currentStep, totalSteps, sessionId)
      }],
      metadata: {
        workflow: {
          type: workflowType,
          session_id: sessionId,
          current_step: step,
          total_steps: totalSteps,
          next_step: step < totalSteps ? step + 1 : null,
          completed: step >= totalSteps,
          awaiting_response: true
        },
      },
    }
  }

  formatWorkflowInstructions(stepData, workflow, step, currentStep, totalSteps, sessionId) {
    let response = `## ${workflow.name} - Step ${step}/${totalSteps}: ${currentStep.name}\n\n`
    
    response += `**Your Task**: ${currentStep.prompt}\n\n`
    
    response += `**Active Personalities for this step**:\n`
    stepData.input.activePersonalities.forEach(p => {
      const personality = this.personalities[p]
      response += `- **${p.replace(/_/g, ' ').toUpperCase()}**: ${personality?.role || 'Unknown role'}\n`
    })
    
    response += `\n**Instructions**: Process the above task acting as the specified personalities. Consider the previous context and provide a comprehensive response that advances the workflow.\n\n`
    
    if (Object.keys(stepData.input.previousContext).length > 0) {
      response += `**Previous Context Available**: Yes (see step data for details)\n\n`
    }
    
    response += `---\n**To Continue**: After processing, call this tool again with:\n`
    response += `\`\`\`\n`
    response += `architect_of_abundance with workflow_request: {\n`
    response += `  type: "${workflow.key}",\n`
    response += `  step: ${step + 1},\n`
    response += `  session_id: "${sessionId}",\n`
    response += `  previous_results: {\n`
    response += `    response: "YOUR DETAILED RESPONSE HERE"\n`
    response += `  }\n`
    response += `}\n`
    response += `\`\`\`\n`
    
    return response
  }

  getAvailableWorkflows() {
    return Object.entries(WORKFLOWS).map(([key, workflow]) => ({
      key,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.total_steps || workflow.steps?.length || 0,
    }))
  }

  async executeFullWorkflow(workflowType, challenge, llmCallback) {
    const workflow = WORKFLOWS[workflowType]
    if (!workflow) {
      throw new Error(`Unknown workflow type: ${workflowType}`)
    }

    const sessionId = randomUUID()
    const totalSteps = workflow.total_steps || workflow.steps?.length || 0
    
    this.logger.system(`EXECUTING FULL WORKFLOW: ${workflow.name}`)
    this.logger.log('🚀', 'workflow', `Starting ${totalSteps}-step process`, {
      workflow: workflowType,
      sessionId: sessionId.substring(0, 12) + '...'
    })

    const results = {
      sessionId,
      workflow: workflowType,
      challenge,
      steps: [],
      files: [],
      startTime: new Date().toISOString()
    }

    // Execute each step sequentially
    for (let step = 1; step <= totalSteps; step++) {
      this.logger.log('⚡', 'step', `Executing step ${step}/${totalSteps}`)
      
      // Get instructions for this step
      const stepResult = await this.executeWorkflowStep(
        workflowType, 
        step, 
        sessionId,
        step === 1 ? { challenge } : null
      )

      // Extract the instructions from the response
      const instructions = stepResult.content[0].text
      
      // Call the LLM to process this step
      if (llmCallback) {
        const llmResponse = await llmCallback(instructions, step, totalSteps)
        
        // Save the response and continue to next step
        if (llmResponse) {
          await this.executeWorkflowStep(
            workflowType,
            step + 1,
            sessionId,
            { response: llmResponse }
          )
          
          results.steps.push({
            step,
            name: workflow.steps[step - 1].name,
            response: llmResponse
          })
        }
      } else {
        // If no callback, just collect the instructions
        results.steps.push({
          step,
          name: workflow.steps[step - 1].name,
          instructions: instructions
        })
      }
    }

    // Collect all generated files
    const sessionDir = path.join(this.sessionManager.sessionsPath, sessionId)
    results.files = {
      sessionDir,
      sessionFile: path.join(sessionDir, 'session.json'),
      summaryFile: path.join(sessionDir, 'README.md'),
      stepFiles: []
    }

    for (let i = 1; i <= totalSteps; i++) {
      results.files.stepFiles.push({
        json: path.join(sessionDir, `step-${i}.json`),
        markdown: path.join(sessionDir, `step-${i}.md`)
      })
    }

    results.endTime = new Date().toISOString()
    
    this.logger.system(`WORKFLOW COMPLETE: ${sessionId.substring(0, 12)}...`)
    
    // Return completion message with file paths
    let completionMessage = `## Workflow Complete: ${workflow.name}\n\n`
    completionMessage += `**Session ID**: ${sessionId}\n`
    completionMessage += `**Steps Completed**: ${totalSteps}\n\n`
    completionMessage += `### Generated Files:\n`
    completionMessage += `- Session: ${results.files.sessionFile}\n`
    completionMessage += `- Summary: ${results.files.summaryFile}\n`
    completionMessage += `- Step Files: ${totalSteps * 2} files (JSON + Markdown for each step)\n\n`
    
    if (totalSteps >= 10) {
      completionMessage += `### Recommendation:\n`
      completionMessage += `**Execute document_synthesis workflow** to consolidate the ${totalSteps} steps into a comprehensive analysis.\n\n`
      completionMessage += `Call with:\n`
      completionMessage += `\`\`\`\n`
      completionMessage += `architect_of_abundance with workflow_request: {\n`
      completionMessage += `  type: "document_synthesis",\n`
      completionMessage += `  step: 1,\n`
      completionMessage += `  context: {\n`
      completionMessage += `    source_session: "${sessionId}",\n`
      completionMessage += `    source_workflow: "${workflowType}"\n`
      completionMessage += `  }\n`
      completionMessage += `}\n`
      completionMessage += `\`\`\`\n`
    }
    
    results.completionMessage = completionMessage
    return results
  }
}