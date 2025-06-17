#!/usr/bin/env node
/**
 * MCP-CEO Server - Clean version using ceo-core
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { ArchitectOfAbundanceCEO, TerminalLogger, WORKFLOWS, loadWorkflows } from './ceo-core.js'
import { randomUUID } from 'crypto'

// Global instances
const logger = new TerminalLogger()
let ceo = null

// Tool implementations
export const toolImplementations = {
  architect_of_abundance: async (args) => {
    if (!ceo) {
      ceo = new ArchitectOfAbundanceCEO()
      await ceo.initialize()
    }
    
    if (args.workflow_request) {
      const { type, session_id, step, previous_results } = args.workflow_request
      const sessionId = session_id || randomUUID()
      
      // If this is step 1, pass the challenge as part of previous_results
      const enrichedPreviousResults = step === 1 || !step ? 
        { ...previous_results, challenge: args.challenge } : 
        previous_results
      
      const result = await ceo.executeWorkflowStep(type, step || 1, sessionId, enrichedPreviousResults)
      return result
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

// MCP Server setup - only run if main module
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    logger.banner()
    logger.system('INITIALIZING MCP SERVER v2.0')

    // Initialize CEO
    ceo = new ArchitectOfAbundanceCEO()
    await ceo.initialize()
    await loadWorkflows()

    // Create MCP server
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

    // Define tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'architect_of_abundance',
            description: 'Analyze any challenge through the Architect of Abundance multi-personality system',
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
                },
                workflow_request: {
                  type: 'object',
                  description: 'Workflow execution parameters (optional)',
                },
              },
              required: ['challenge'],
            },
          },
          {
            name: 'bootstrap_assessment',
            description: 'Assess how to bootstrap any solution from minimal resources',
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
      
      logger.log('🎯', 'tool', `${name} called`, {
        hasWorkflow: !!args.workflow_request,
        challenge: args.challenge?.substring(0, 50) + '...',
      })

      try {
        const result = await toolImplementations[name](args)
        return result
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`,
          }],
          isError: true,
        }
      }
    })

    // Start server
    const transport = new StdioServerTransport()
    await server.connect(transport)

    logger.system('SERVER ONLINE - WORKFLOW SUPPORT ENABLED')
    logger.log('🚀', 'status', 'Ready to reduce global cortisol levels', {
      workflows: Object.keys(WORKFLOWS).length,
      personalities: 8,
      mode: 'BOOTSTRAP SOVEREIGNTY',
    })
  }

  main().catch((error) => {
    logger.log('💀', 'fatal', 'SYSTEM CRASH', { error: error.message, stack: error.stack })
    logger.system('SHUTTING DOWN - FATAL ERROR')
    process.exit(1)
  })
}