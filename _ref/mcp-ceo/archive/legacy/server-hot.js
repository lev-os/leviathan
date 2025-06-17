#!/usr/bin/env node
/**
 * MCP-CEO Server with Hot Reload
 * The server wrapper that never restarts, hot-reloading the core logic
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { watch } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Module cache for hot reloading
let coreModule = null
let toolImplementations = null

// Load or reload the core module
async function loadCore() {
  const modulePath = join(__dirname, 'ceo-core.js')
  
  // Clear from cache if exists
  const url = `file://${modulePath}`
  if (import.meta.cache && import.meta.cache.delete) {
    import.meta.cache.delete(url)
  }
  
  // Add timestamp to bust cache
  const module = await import(`${url}?t=${Date.now()}`)
  
  coreModule = module
  
  // Initialize CEO and load workflows
  const ceo = new module.ArchitectOfAbundanceCEO()
  await ceo.initialize()
  await module.loadWorkflows()
  
  // Build tool implementations
  toolImplementations = {
    architect_of_abundance: async (args) => {
      if (args.workflow_request) {
        const { type, session_id, step, previous_results } = args.workflow_request
        const sessionId = session_id || randomUUID()
        
        const enrichedPreviousResults = step === 1 || !step ? 
          { ...previous_results, challenge: args.challenge } : 
          previous_results
        
        const result = await ceo.executeWorkflowStep(type, step || 1, sessionId, enrichedPreviousResults)
        return result
      }
      
      const result = await ceo.processRequest(args.challenge)
      return {
        content: [{
          type: 'text',
          text: result.response
        }]
      }
    },
    
    bootstrap_assessment: async (args) => {
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
    },
    
    execute_workflow: async (args) => {
      const { workflow_type, challenge } = args
      
      // Validate workflow exists
      const workflows = ceo.getAvailableWorkflows()
      const workflow = workflows.find(w => w.key === workflow_type)
      if (!workflow) {
        throw new Error(`Unknown workflow: ${workflow_type}. Available: ${workflows.map(w => w.key).join(', ')}`)
      }
      
      // Create session
      const sessionId = randomUUID()
      
      // Initialize session by calling step 1 internally to create the session structure
      const step1Result = await ceo.executeWorkflowStep(workflow_type, 1, sessionId, { challenge })
      
      // Create initialization message
      let response = `## Workflow Initialized: ${workflow.name}\n\n`
      response += `**Session ID**: ${sessionId}\n`
      response += `**Challenge**: ${challenge}\n`
      response += `**Total Steps**: ${workflow.steps}\n\n`
      
      response += `### Description\n${workflow.description}\n\n`
      
      response += `### To Begin\n`
      response += `Execute the first step by calling:\n\n`
      response += `\`\`\`\n`
      response += `architect_of_abundance with workflow_request: {\n`
      response += `  type: "${workflow_type}",\n`
      response += `  step: 1,\n`
      response += `  session_id: "${sessionId}"\n`
      response += `}\n`
      response += `\`\`\`\n\n`
      
      response += `### What Will Happen\n`
      response += `1. You'll receive specific instructions for each step\n`
      response += `2. Process those instructions and generate a response\n`
      response += `3. Call back with your response to get the next step\n`
      response += `4. Continue until all ${workflow.steps} steps are complete\n\n`
      
      response += `### Session Files\n`
      response += `Results will be saved to: \`./sessions/${sessionId}/\`\n`
      
      return {
        content: [{
          type: 'text',
          text: response
        }],
        metadata: {
          sessionId,
          workflowType: workflow_type,
          challenge
        }
      }
    }
  }
  
  console.error('[HOT RELOAD] Core module loaded successfully')
  return ceo
}

// Import crypto for UUID
import { randomUUID } from 'crypto'

// Main server function
async function main() {
  console.error('🔥 HOT RELOAD MCP SERVER STARTING...')
  
  // Initial load
  await loadCore()
  
  // Watch for changes to ceo-core.js
  const watchPath = join(__dirname, 'ceo-core.js')
  watch(watchPath, async (eventType) => {
    if (eventType === 'change') {
      console.error('[HOT RELOAD] Detected change in ceo-core.js, reloading...')
      try {
        await loadCore()
        console.error('[HOT RELOAD] ✅ Reload successful')
      } catch (error) {
        console.error('[HOT RELOAD] ❌ Reload failed:', error.message)
      }
    }
  })
  
  // Create MCP server
  const server = new Server(
    {
      name: 'mcp-ceo-hot',
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
        {
          name: 'execute_workflow',
          description: 'Initialize a workflow session for step-by-step execution',
          inputSchema: {
            type: 'object',
            properties: {
              workflow_type: {
                type: 'string',
                description: 'The workflow to execute (e.g. simple_test, deep_analysis)',
                enum: Object.keys(coreModule.WORKFLOWS)
              },
              challenge: {
                type: 'string',
                description: 'The challenge or question to analyze through the workflow'
              }
            },
            required: ['workflow_type', 'challenge']
          }
        },
      ],
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    
    console.error(`[TOOL CALL] ${name}`, {
      hasWorkflow: !!args.workflow_request,
      step: args.workflow_request?.step,
    })

    try {
      if (!toolImplementations[name]) {
        throw new Error(`Unknown tool: ${name}`)
      }
      
      const result = await toolImplementations[name](args)
      return result
    } catch (error) {
      console.error(`[ERROR] Tool ${name} failed:`, error)
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

  console.error('🚀 HOT RELOAD SERVER READY - Edit ceo-core.js to see changes instantly!')
}

main().catch((error) => {
  console.error('💀 FATAL ERROR:', error)
  process.exit(1)
})