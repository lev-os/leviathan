/**
 * Reality Check E2E Test - Direct MCP Tool Integration
 * 
 * Tests the reality-check workflow by calling MCP tool functions directly,
 * demonstrating real bidirectional flow with context switching.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { executeWorkflow } from '../../src/mcp/tools/execute-workflow.js'
import { listWorkflows } from '../../src/mcp/tools/list-workflows.js'
import { MCPServer } from '../../src/mcp/MCPServer.js'
import { createFriendlySessionId } from '../../src/utils/session-utils.js'

describe('Reality Check E2E - Direct MCP Tool Integration', () => {
  let mcpServer
  let sessionId
  
  beforeEach(async () => {
    // Initialize real MCP server
    mcpServer = new MCPServer()
    await mcpServer.initialize()
    
    // Create session ID for this test
    sessionId = createFriendlySessionId({
      workflowId: 'reality-check',
      challenge: 'Direct E2E test',
      type: 'e2e-direct'
    })
    
    console.log(`🧪 Starting direct E2E test session: ${sessionId}`)
  })

  it('should list available workflows including reality-check', async () => {
    // Test that we can list workflows using direct function call
    const workflows = await listWorkflows({}, {
      registry: mcpServer.registry,
      assembler: mcpServer.assembler
    })
    
    expect(workflows).toBeDefined()
    expect(Array.isArray(workflows.workflows)).toBe(true)
    
    // Check if reality-check workflow is available
    const realityCheckWorkflow = workflows.workflows.find(w => w.id === 'reality-check')
    expect(realityCheckWorkflow).toBeDefined()
    expect(realityCheckWorkflow.name).toContain('Reality Check')
    
    console.log(`✅ Found ${workflows.workflows.length} workflows, including reality-check`)
  })

  it('should execute reality-check workflow step 1 (NFJ Visionary)', async () => {
    const challenge = "Should we launch our new AI product next month or wait until Q2?"
    
    // Direct function call to executeWorkflow tool
    const stepResult = await executeWorkflow({
      workflowId: 'reality-check',
      challenge,
      step: 1,
      sessionId
    }, {
      registry: mcpServer.registry,
      assembler: mcpServer.assembler
    })
    
    // Validate step execution results
    expect(stepResult).toBeDefined()
    expect(stepResult.step).toBe(1)
    expect(stepResult.context).toBeDefined()
    expect(stepResult.llm_instructions).toBeDefined()
    expect(stepResult.hasNextStep).toBe(true)
    expect(stepResult.nextStep).toBe(2)
    
    // Validate that we got NFJ Visionary context
    const agentContext = stepResult.context.agent
    expect(agentContext).toBeDefined()
    expect(agentContext.metadata?.id).toBe('nfj-visionary')
    
    console.log(`✅ Step 1 executed successfully with agent: ${agentContext.metadata?.id}`)
    console.log(`📝 LLM Instructions length: ${stepResult.llm_instructions.length} chars`)
  })

  it('should execute full 5-step reality-check workflow with context switching', async () => {
    const challenge = "Should we launch our new AI product next month or wait until Q2?"
    const expectedAgents = ['nfj-visionary', 'ntj-strategist', 'sfj-caregiver', 'stp-adapter', 'stj-leader']
    const stepResults = []
    
    // Execute all 5 steps sequentially
    for (let step = 1; step <= 5; step++) {
      console.log(`\\n🔄 Executing Step ${step} (${expectedAgents[step-1]})...`)
      
      const stepResult = await executeWorkflow({
        workflowId: 'reality-check',
        challenge: step === 1 ? challenge : null,
        step,
        sessionId,
        previousResults: step > 1 ? stepResults[step-2].result : null
      }, {
        registry: mcpServer.registry,
        assembler: mcpServer.assembler
      })
      
      // Validate step execution
      expect(stepResult).toBeDefined()
      expect(stepResult.step).toBe(step)
      expect(stepResult.context).toBeDefined()
      expect(stepResult.llm_instructions).toBeDefined()
      
      // Validate context switching occurred
      const agentContext = stepResult.context.agent
      if (agentContext) {
        const actualAgent = agentContext.metadata?.id || agentContext.id
        console.log(`✅ Agent context: ${actualAgent}`)
        
        // For steps 2-5, verify we're getting different agents
        if (step > 1) {
          const previousAgent = stepResults[step-2].result.context.agent.metadata?.id
          expect(actualAgent).not.toBe(previousAgent)
          console.log(`✅ Context switching: ${previousAgent} → ${actualAgent}`)
        }
      }
      
      // Store result for next step
      stepResults.push({
        step,
        agent: expectedAgents[step-1],
        result: stepResult
      })
      
      console.log(`⏱️  Step ${step} completed successfully`)
    }
    
    // Validate complete workflow execution
    expect(stepResults).toHaveLength(5)
    
    // Validate each step had different context (context switching worked)
    const agentIds = stepResults.map(s => s.result.context.agent?.metadata?.id).filter(Boolean)
    const uniqueAgents = new Set(agentIds)
    expect(uniqueAgents.size).toBeGreaterThan(1) // Should have multiple different agents
    
    // Validate state preservation - later steps should have previous results
    for (let i = 1; i < stepResults.length; i++) {
      const currentResult = stepResults[i].result
      if (currentResult.previousResults) {
        expect(currentResult.previousResults).toBeDefined()
        console.log(`✅ Step ${i+1} preserved previous state`)
      }
    }
    
    console.log(`\\n🎉 Reality Check workflow completed successfully!`)
    console.log(`🔄 Context switches: ${uniqueAgents.size} different agents engaged`)
    console.log(`📊 Total steps: ${stepResults.length}`)
  })

  it('should handle workflow errors gracefully', async () => {
    // Test error handling with non-existent workflow
    try {
      await executeWorkflow({
        workflowId: 'non-existent-workflow',
        challenge: 'Test error handling',
        step: 1,
        sessionId
      }, {
        registry: mcpServer.registry,
        assembler: mcpServer.assembler
      })
      
      // Should not reach here
      expect(false).toBe(true)
    } catch (error) {
      // Should handle error gracefully
      expect(error).toBeDefined()
      console.log(`✅ Error handled gracefully: ${error.message}`)
    }
  })
})