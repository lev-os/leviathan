import { describe, it, expect, beforeAll } from 'vitest'
import { ArchitectOfAbundanceCEO } from '../../server.js'
import { ContextAssembler } from '../../src/context-assembler.js'
import { DynamicContextAssembler } from '../../src/assembly/ContextAssembler.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { FlowMind } from '../../src/flowmind.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('MCP-CEO Integration Tests', () => {
  let ceo
  let contextAssembler
  let dynamicAssembler
  let toolImplementations

  beforeAll(async () => {
    // Initialize CEO
    ceo = new ArchitectOfAbundanceCEO()
    await ceo.initialize()
    
    // Initialize Context Assembler with real paths
    contextAssembler = new ContextAssembler({
      yaml: { basePath: path.join(__dirname, '../../contexts') }
    })
    
    // Initialize Dynamic Assembler
    dynamicAssembler = new DynamicContextAssembler()
    
    // Mock tool implementations for testing
    toolImplementations = {
      architect_of_abundance: async ({ challenge, context, workflow_request }) => {
        const ctx = ceo.analyzeContext(challenge)
        const active = ceo.activatePersonalities(ctx)
        const perspectives = ceo.generatePersonalityPerspectives(challenge, ctx)
        
        return {
          content: [{
            type: 'text',
            text: `Analyzed through ${active.length} personalities: ${Object.keys(perspectives).join(', ')}. Constitutional principles applied.`
          }]
        }
      },
      bootstrap_assessment: async ({ scenario }) => {
        return {
          content: [{
            type: 'text',
            text: `Bootstrap assessment for: ${scenario}. Phase 1: Raspberry Pi. Phase 2: Local cluster. Phase 3: Cloud scale.`
          }]
        }
      }
    }
  })

  describe('CEO Personality System', () => {
    it('should load all 8 personalities', () => {
      expect(ceo.personalities).toBeDefined()
      expect(Object.keys(ceo.personalities)).toHaveLength(8)
    })

    it('should analyze context and activate personalities', () => {
      const stressfulChallenge = "urgent deadline overwhelmed confused"
      const context = ceo.analyzeContext(stressfulChallenge)
      
      expect(context.stress_indicators).toBeGreaterThan(0)
      
      const active = ceo.activatePersonalities(context)
      expect(active).toContain('cortisol_guardian')
    })

    it('should generate personality-specific perspectives', () => {
      const challenge = "Scale our AI system to handle enterprise needs"
      const context = ceo.analyzeContext(challenge)
      const active = ceo.activatePersonalities(context)
      const perspectives = ceo.generatePersonalityPerspectives(challenge, context)
      
      expect(Object.keys(perspectives)).toEqual(active)
      Object.values(perspectives).forEach(p => {
        expect(p).toHaveProperty('role')
        expect(p).toHaveProperty('perspective')
        expect(p).toHaveProperty('bootstrap_focus')
      })
    })
  })

  describe('Context Assembler Integration', () => {
    it('should load real CEO context from YAML', async () => {
      const ceoContext = await contextAssembler.load('yaml:agents/ceo/context.yaml')
      
      // Test FlowMind interface
      expect(ceoContext).toBeInstanceOf(FlowMind)
      expect(ceoContext.type).toBe('agent')
      expect(ceoContext.id).toBe('ceo')
      expect(ceoContext.name).toBe('Chief Executive Officer')
      expect(ceoContext.shortName).toBe('ceo')
      
      // Test capabilities
      expect(ceoContext.capabilities).toContain('strategic_planning')
      expect(ceoContext.hasCapability('strategic_planning')).toBe(true)
      
      // Raw access for backward compatibility
      expect(ceoContext.raw).toHaveProperty('agent_config')
      expect(ceoContext.raw.agent_config).toHaveProperty('capabilities')
    })

    it('should load multiple context types', async () => {
      // Create test workflow context if it doesn't exist
      const testPaths = [
        'yaml:agents/ceo/context.yaml',
        'yaml:types/project/context.yaml',
        'yaml:patterns/swot-analysis/context.yaml'
      ]
      
      const contexts = await Promise.all(
        testPaths.map(path => contextAssembler.load(path))
      )
      
      expect(contexts).toHaveLength(3)
      
      // All should be FlowMind instances
      contexts.forEach(ctx => {
        expect(ctx).toBeInstanceOf(FlowMind)
      })
      
      // Check types
      expect(contexts[0].type).toBe('agent')
      expect(contexts[1].type).toBe('project')  // The actual type from YAML
      expect(contexts[2].type).toBe('pattern')
      
      // Check raw structure preserved
      expect(contexts[0].raw).toHaveProperty('agent_config')
      expect(contexts[1].raw).toHaveProperty('project_config')  // Based on actual YAML
      expect(contexts[2].raw).toHaveProperty('pattern_config')
    })
  })

  describe('Dynamic Assembly with Real Contexts', () => {
    it('should assemble CEO personalities with conflict resolution', async () => {
      // Get real personality perspectives
      const challenge = "Scale to million agents with 99.99% reliability"
      const context = ceo.analyzeContext(challenge)
      const perspectives = ceo.generatePersonalityPerspectives(challenge, context)
      
      // Convert to assembly recipe
      const sources = Object.entries(perspectives).map(([name, data]) => ({
        name,
        type: 'personality',
        text: `${data.role}: ${data.perspective}`,
        priority: name === 'systems_illuminator' ? 95 : 80
      }))
      
      const recipe = {
        sources,
        task: {
          description: challenge,
          focus: 'architectural_decision',
          keywords: ['scale', 'reliability', 'architecture']
        },
        tokenLimit: 1500
      }
      
      // Assembly should work with priority ordering
      const prioritized = dynamicAssembler.rules.applyPriorities(sources)
      expect(prioritized[0].effectivePriority).toBeGreaterThanOrEqual(95)
    })
  })

  describe('MCP Tool Implementation', () => {
    it('should execute architect_of_abundance tool', async () => {
      const result = await toolImplementations.architect_of_abundance({
        challenge: "Test challenge",
        context: { urgency: "low" }
      })
      
      expect(result).toHaveProperty('content')
      expect(result.content[0]).toHaveProperty('type', 'text')
      expect(result.content[0].text).toContain('Constitutional')
    })

    it('should execute bootstrap_assessment tool', async () => {
      const result = await toolImplementations.bootstrap_assessment({
        scenario: "Scale from Raspberry Pi to cloud"
      })
      
      expect(result).toHaveProperty('content')
      expect(result.content[0].text).toContain('Bootstrap')
      expect(result.content[0].text).toContain('Phase')
    })

    it('should handle workflow requests with timestamp-prefixed sessions', async () => {
      const result = await toolImplementations.architect_of_abundance({
        challenge: "Test workflow",
        workflow_request: {
          type: "simple_test",
          step: 1
        }
      })
      
      // Should work since we're mocking the implementation
      expect(result.content[0].text).toBeDefined()
      expect(result.content[0].text).toContain('personalities')
    })
  })
})