import { describe, it, expect, beforeAll } from 'vitest'
import { createContextRegistry } from '../../src/context-registry.js'
import { ContextAssembler } from '../../src/context-assembler.js'
import { FlowMind } from '../../src/flowmind.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('FlowMind Context Integration Tests', () => {
  let registry
  let assembler
  
  beforeAll(async () => {
    // Initialize context system
    assembler = new ContextAssembler({
      yaml: { basePath: path.join(__dirname, '../../contexts') }
    })
    
    registry = createContextRegistry({ assembler })
    await registry.scan()
  })
  
  describe('Context Discovery', () => {
    it('should discover all context types', async () => {
      const types = registry.getTypes()
      
      // We know we have at least these types
      expect(types).toContain('workflow')
      expect(types).toContain('agent')
      expect(types).toContain('pattern')
      expect(types).toContain('workspace')  // Not 'type' - actual types like workspace, project, etc.
      expect(types).toContain('project')
      expect(types).toContain('task')
    })
    
    it('should load all workflow contexts as FlowMind instances', () => {
      const workflows = registry.getContextsByType('workflow')
      
      expect(workflows.length).toBeGreaterThan(0)
      workflows.forEach(context => {
        expect(context).toBeInstanceOf(FlowMind)
        expect(context.type).toBe('workflow')
        expect(context.id).toBeTruthy()
        expect(context.name).toBeTruthy()
      })
    })
    
    it('should find cognitive-parliament workflow context', () => {
      const parliament = registry.getContext('cognitive-parliament')
      
      expect(parliament).toBeDefined()
      expect(parliament).toBeInstanceOf(FlowMind)
      expect(parliament.type).toBe('workflow')
      expect(parliament.name).toBe('cognitive-parliament')  // name defaults to id if not specified
      
      // Check workflow-specific config
      expect(parliament.raw.workflow_config).toBeDefined()
      expect(parliament.raw.workflow_config.philosophy).toBeDefined()
    })
    
    it('should find multi-expert-validation workflow context', () => {
      const validation = registry.getContext('multi-perspective-validation')
      
      expect(validation).toBeDefined()
      expect(validation).toBeInstanceOf(FlowMind)
      expect(validation.type).toBe('workflow')
      expect(validation.name).toBe('multi-perspective-validation')  // name defaults to id
      
      // Check expert perspectives
      expect(validation.raw.workflow_config.expert_perspectives).toBeDefined()
      expect(validation.raw.workflow_config.expert_perspectives.legal_lens).toBeDefined()
    })
  })
  
  describe('Agent Context Discovery', () => {
    it('should discover agent contexts', () => {
      const agents = registry.getContextsByType('agent')
      
      expect(agents.length).toBeGreaterThan(0)
      agents.forEach(agent => {
        expect(agent).toBeInstanceOf(FlowMind)
        expect(agent.type).toBe('agent')
      })
    })
    
    it('should load CEO agent context', () => {
      const ceo = registry.getContext('ceo')
      
      expect(ceo).toBeDefined()
      expect(ceo.type).toBe('agent')
      expect(ceo.name).toBe('Chief Executive Officer')
      expect(ceo.capabilities).toContain('strategic_planning')
    })
  })
  
  describe('Pattern Context Discovery', () => {
    it('should discover pattern contexts', () => {
      const patterns = registry.getContextsByType('pattern')
      
      expect(patterns.length).toBeGreaterThan(0)
      patterns.forEach(pattern => {
        expect(pattern).toBeInstanceOf(FlowMind)
        expect(pattern.type).toBe('pattern')
      })
    })
    
    it('should load SWOT analysis pattern', () => {
      const swot = registry.getContext('swot-analysis')
      
      expect(swot).toBeDefined()
      expect(swot.type).toBe('pattern')
      expect(swot.name).toBe('swot-analysis')  // name defaults to id
    })
  })
  
  describe('Context Relationships', () => {
    it('should find contexts that reference other contexts', async () => {
      const { ContextDiscovery } = await import('../../src/context-registry.js')
      const discovery = new ContextDiscovery(registry)
      
      // Find contexts that reference CEO
      const ceoRelated = discovery.findRelated('ceo')
      
      expect(ceoRelated.length).toBeGreaterThan(0)
    })
  })
  
  describe('Everything is a Context', () => {
    it('should treat all discovered items as FlowMind contexts', () => {
      const allContexts = registry.getAllContexts()
      
      expect(allContexts.length).toBeGreaterThan(0)
      
      // EVERYTHING is a FlowMind context
      allContexts.forEach(context => {
        expect(context).toBeInstanceOf(FlowMind)
        // ID might be a path if no metadata.id exists
        expect(context.id || context._path).toBeTruthy()
        expect(context.type).toBeTruthy()
        
        // All contexts have the same interface
        expect(typeof context.raw).toBe('object')
        expect(typeof context.metadata).toBe('object')
      })
    })
    
    it('should have no type hierarchies - only data differences', () => {
      const workflow = registry.getContext('cognitive-parliament')
      const agent = registry.getContext('ceo')
      const pattern = registry.getContext('swot-analysis')
      
      // All are FlowMind instances
      expect(workflow.constructor).toBe(FlowMind)
      expect(agent.constructor).toBe(FlowMind)
      expect(pattern.constructor).toBe(FlowMind)
      
      // Behavior differences come from type property, not class
      expect(workflow.type).toBe('workflow')
      expect(agent.type).toBe('agent')
      expect(pattern.type).toBe('pattern')
    })
  })
  
  describe('Context Registry Export', () => {
    it('should export complete registry state', () => {
      const exportData = registry.export()
      
      expect(exportData.contexts).toBeDefined()
      expect(exportData.types).toBeDefined()
      expect(exportData.stats).toBeDefined()
      expect(exportData.stats.total).toBe(registry.getAllContexts().length)
      
      // Check type groupings
      Object.entries(exportData.types).forEach(([type, ids]) => {
        expect(Array.isArray(ids)).toBe(true)
        expect(exportData.stats.byType[type]).toBe(ids.length)
      })
    })
  })
})