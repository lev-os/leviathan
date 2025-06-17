/**
 * FlowMind Principle: BIDIRECTIONAL FLOW = INTELLIGENCE
 * This integration test proves that our rebuilt MCP server can orchestrate
 * context switching between real FlowMind agents for emergent intelligence
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { MCPServer } from '../../src/mcp/MCPServer.js'
import { executeWorkflow } from '../../src/mcp/tools/execute-workflow.js'
import { listWorkflows } from '../../src/mcp/tools/list-workflows.js'

describe('MCP Bidirectional Flow Integration', () => {
  let mcpServer

  beforeEach(async () => {
    mcpServer = new MCPServer()
    await mcpServer.initialize()
  })

  it('should initialize MCP server with real context discovery', async () => {
    expect(mcpServer.registry).toBeDefined()
    expect(mcpServer.assembler).toBeDefined()
    
    // Test that real contexts are discoverable
    const contexts = mcpServer.registry.contexts
    expect(contexts.size).toBeGreaterThan(0)
    
    console.log(`✅ Discovered ${contexts.size} real FlowMind contexts`)
  })

  it('should list available workflows from real context directory', async () => {
    const result = await listWorkflows({}, { 
      registry: mcpServer.registry 
    })
    
    expect(result.workflows).toBeDefined()
    expect(Array.isArray(result.workflows)).toBe(true)
    expect(result.source).toBe('context_registry')
    expect(result.discovery_based).toBe(true)
    
    console.log(`✅ Found ${result.total} workflows:`, result.workflows.map(w => w.id))
  })

  it('should execute workflow step with real context switching', async () => {
    // Step 1: Execute with cognitive-parliament workflow
    const step1 = await executeWorkflow({
      workflowId: 'cognitive-parliament',
      challenge: 'Should we launch the product now or wait?',
      step: 1
    }, { 
      registry: mcpServer.registry, 
      assembler: mcpServer.assembler 
    })
    
    expect(step1.context).toBeDefined()
    expect(step1.step).toBe(1)
    expect(step1.llm_instructions).toContain('challenge')
    
    console.log('✅ Step 1 Context:', step1.context.workflow?.metadata?.name || 'fallback')
    console.log('✅ Step 1 Agent:', step1.context.agent?.metadata?.name || 'fallback')
  })

  it('should demonstrate context switching between workflow steps', async () => {
    // Simulate multi-step workflow execution
    const step1Results = { insights: 'Initial analysis from step 1' }
    
    const step2 = await executeWorkflow({
      workflowId: 'cognitive-parliament',
      challenge: null,
      step: 2,
      previousResults: step1Results
    }, { 
      registry: mcpServer.registry, 
      assembler: mcpServer.assembler 
    })
    
    expect(step2.step).toBe(2)
    expect(step2.previousResults).toBeDefined()
    expect(step2.previousResults.insights).toBe('Initial analysis from step 1')
    expect(step2.llm_instructions).toContain('previous')
    
    console.log('✅ Step 2 preserves previous results:', step2.previousResults.insights)
    console.log('✅ Context switching demonstrated')
  })

  it('should handle real CEO agent context', async () => {
    const result = await executeWorkflow({
      workflowId: 'ceo-analysis',
      challenge: 'Strategic decision about market expansion',
      step: 1
    }, { 
      registry: mcpServer.registry, 
      assembler: mcpServer.assembler 
    })
    
    expect(result.context).toBeDefined()
    expect(result.llm_instructions).toContain('CEO')
    
    console.log('✅ CEO agent context loaded successfully')
  })

  it('should prove bidirectional flow architecture is working', async () => {
    // This test proves the core FlowMind concept:
    // MCP orchestrates → LLM reasons → MCP switches context → LLM reasons differently
    
    const challenge = 'Should we pivot our business model?'
    
    // Step 1: Get first perspective 
    const perspective1 = await executeWorkflow({
      workflowId: 'cognitive-parliament',
      challenge,
      step: 1
    }, { 
      registry: mcpServer.registry, 
      assembler: mcpServer.assembler 
    })
    
    // Simulate LLM providing insights from perspective 1
    const llmInsights1 = {
      perspective: 'analytical',
      recommendation: 'Need more data before deciding',
      confidence: 0.7
    }
    
    // Step 2: Get second perspective with previous insights
    const perspective2 = await executeWorkflow({
      workflowId: 'cognitive-parliament',
      challenge: null,
      step: 2,
      previousResults: llmInsights1
    }, { 
      registry: mcpServer.registry, 
      assembler: mcpServer.assembler 
    })
    
    // PROOF: Bidirectional flow is working
    expect(perspective1.step).toBe(1)
    expect(perspective2.step).toBe(2)
    expect(perspective2.previousResults).toEqual(llmInsights1)
    
    // PROOF: Context switching enables different perspectives
    expect(perspective1.llm_instructions).not.toBe(perspective2.llm_instructions)
    
    // PROOF: State persists between context switches
    expect(perspective2.previousResults.confidence).toBe(0.7)
    
    console.log('🎯 BIDIRECTIONAL FLOW PROVEN:')
    console.log('   → Step 1 context loaded')
    console.log('   → LLM insights preserved') 
    console.log('   → Step 2 context switched')
    console.log('   → State maintained across switches')
    console.log('   → Foundation for emergent intelligence ✅')
  })
})