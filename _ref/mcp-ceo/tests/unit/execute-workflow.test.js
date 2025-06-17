/**
 * FlowMind Principle: BIDIRECTIONAL FLOW = INTELLIGENCE
 * This test validates that execute_workflow enables context switching
 * for emergent intelligence through recipe assembly
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { executeWorkflow } from '../../src/mcp/tools/execute-workflow.js'
import { ContextRegistry } from '../../src/context-registry.js'
import { ContextAssembler } from '../../src/context-assembler.js'

describe('executeWorkflow Tool', () => {
  let registry, assembler

  beforeEach(() => {
    registry = new ContextRegistry()
    assembler = new ContextAssembler(registry)
  })

  it('should load workflow context and assemble step recipe', async () => {
    // Mock workflow context
    const params = {
      workflowId: 'deep-analysis',
      challenge: 'Should we launch the product?',
      step: 1
    }

    const result = await executeWorkflow(params, { registry, assembler })
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.step).toBe(1)
    expect(result.hasNextStep).toBeDefined()
  })

  it('should handle context switching between steps', async () => {
    const step1 = await executeWorkflow({
      workflowId: 'deep-analysis',
      challenge: 'test challenge',
      step: 1
    }, { registry, assembler })

    // Simulate LLM providing results for step 1
    const mockResults = { insights: 'Step 1 analysis complete' }

    const step2 = await executeWorkflow({
      workflowId: 'deep-analysis', 
      challenge: null,
      step: 2,
      previousResults: mockResults
    }, { registry, assembler })

    // Different steps should potentially have different contexts
    expect(step2.step).toBe(2)
    expect(step2.previousResults).toBeDefined()
    expect(step2.previousResults.insights).toBe('Step 1 analysis complete')
  })

  it('should follow FlowMind constitutional principles', async () => {
    const result = await executeWorkflow({
      workflowId: 'test-workflow',
      challenge: 'test',
      step: 1
    }, { registry, assembler })

    // LLM IS THE RUNTIME: Tool enables LLM reasoning, doesn't provide answers
    expect(result.llm_instructions).toBeDefined()
    
    // CONTEXT SWITCHING = INTELLIGENCE: Each step can have different context
    expect(result.context).toBeDefined()
  })
})