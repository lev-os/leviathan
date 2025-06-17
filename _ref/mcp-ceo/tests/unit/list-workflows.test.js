/**
 * FlowMind Principle: EVERYTHING IS A CONTEXT
 * This test validates that list_workflows discovers available
 * workflow contexts from the registry for bidirectional flow
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { listWorkflows } from '../../src/mcp/tools/list-workflows.js'
import { ContextRegistry } from '../../src/context-registry.js'

describe('listWorkflows Tool', () => {
  let registry

  beforeEach(() => {
    registry = new ContextRegistry()
  })

  it('should discover available workflows from context registry', async () => {
    const result = await listWorkflows({}, { registry })
    
    expect(result).toBeDefined()
    expect(result.workflows).toBeDefined()
    expect(Array.isArray(result.workflows)).toBe(true)
  })

  it('should return workflow metadata for each discovered workflow', async () => {
    const result = await listWorkflows({}, { registry })
    
    // Should have at least some workflow contexts
    if (result.workflows.length > 0) {
      const workflow = result.workflows[0]
      expect(workflow.id).toBeDefined()
      expect(workflow.name).toBeDefined()
    }
  })

  it('should follow FlowMind constitutional principles', async () => {
    const result = await listWorkflows({}, { registry })

    // EVERYTHING IS A CONTEXT: Uses registry to discover workflows
    expect(result.source).toBe('context_registry')
    
    // No hardcoded workflows, discovery-based
    expect(result.discovery_based).toBe(true)
  })
})