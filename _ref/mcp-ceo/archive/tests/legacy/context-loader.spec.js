import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { 
  ContextAssembler, 
  YamlContextLoader, 
  MarkdownContextLoader,
  ContextLoadError 
} from '../../src/context-assembler.js'
import { FlowMind } from '../../src/flowmind.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Context Loader Tests', () => {
  const testDataDir = path.join(__dirname, 'test-data')
  
  beforeAll(async () => {
    // Create test data directory
    await fs.mkdir(testDataDir, { recursive: true })
    
    // Create test YAML file with proper FlowMind structure
    await fs.writeFile(
      path.join(testDataDir, 'test-config.yaml'),
      `metadata:
  type: "config"
  id: "test-config"
  name: "Test Configuration"
  
config:
  system_prompt: "Test system prompt"
  personalities:
    test_personality:
      role: "Test role"
      activation_triggers: ["test"]
`
    )
    
    // Create test Markdown file
    await fs.writeFile(
      path.join(testDataDir, 'test-personality.md'),
      `# Test Personality

## Core Role
Test personality for unit testing

## Approach
- Test approach 1
- Test approach 2

## Bootstrap Focus
Test bootstrap focus
`
    )
  })
  
  afterAll(async () => {
    // Clean up test data
    await fs.rm(testDataDir, { recursive: true, force: true })
  })

  describe('YamlContextLoader', () => {
    it('should load YAML files correctly', async () => {
      const loader = new YamlContextLoader({ basePath: testDataDir })
      const flowMind = await loader.load('test-config.yaml')
      
      // Check it returns a FlowMind instance
      expect(flowMind).toBeInstanceOf(FlowMind)
      expect(flowMind.type).toBe('config')
      expect(flowMind.id).toBe('test-config')
      expect(flowMind.name).toBe('Test Configuration')
      
      // Check raw access for backward compatibility
      expect(flowMind.raw.config).toHaveProperty('system_prompt')
      expect(flowMind.raw.config.system_prompt).toBe('Test system prompt')
    })
    
    it('should cache loaded files', async () => {
      const loader = new YamlContextLoader({ basePath: testDataDir })
      const config1 = await loader.load('test-config.yaml')
      const config2 = await loader.load('test-config.yaml')
      
      expect(config1).toBe(config2) // Same reference = cached
    })
    
    it('should validate schema if provided', async () => {
      const loader = new YamlContextLoader({ basePath: testDataDir })
      const flowMind = await loader.load('test-config.yaml')
      
      expect(flowMind).toBeInstanceOf(FlowMind)
      expect(flowMind.config).toHaveProperty('system_prompt')
    })
    
    it('should throw on missing file', async () => {
      const loader = new YamlContextLoader({ basePath: testDataDir })
      await expect(loader.load('missing.yaml')).rejects.toThrow(ContextLoadError)
    })
  })

  describe('MarkdownContextLoader', () => {
    it('should load and parse Markdown files', async () => {
      const loader = new MarkdownContextLoader({ basePath: testDataDir })
      const flowMind = await loader.load('test-personality.md')
      
      // Check it returns a FlowMind instance
      expect(flowMind).toBeInstanceOf(FlowMind)
      expect(flowMind.type).toBe('pattern')
      expect(flowMind.id).toBe('test-personality')
      expect(flowMind.name).toBe('Test Personality')
      
      // Check pattern config has parsed content
      expect(flowMind.config).toHaveProperty('title', 'Test Personality')
      expect(flowMind.config).toHaveProperty('description')
    })
    
    it('should cache loaded files', async () => {
      const loader = new MarkdownContextLoader({ basePath: testDataDir })
      const p1 = await loader.load('test-personality.md')
      const p2 = await loader.load('test-personality.md')
      
      expect(p1).toBe(p2)
    })
  })

  describe('ContextAssembler', () => {
    it('should route to correct loader based on prefix', async () => {
      const assembler = new ContextAssembler({
        yaml: { basePath: testDataDir },
        markdown: { basePath: testDataDir }
      })
      
      const yamlContent = await assembler.load('yaml:test-config.yaml')
      expect(yamlContent).toBeInstanceOf(FlowMind)
      expect(yamlContent.config).toHaveProperty('system_prompt')
      
      const mdContent = await assembler.load('markdown:test-personality.md')
      expect(mdContent).toBeInstanceOf(FlowMind)
      expect(mdContent.name).toBe('Test Personality')
    })
    
    it('should load real CEO config from project root', async () => {
      const assembler = new ContextAssembler({
        yaml: { basePath: path.join(__dirname, '../../') }
      })
      
      const flowMind = await assembler.load('yaml:ceo-config.yaml')
      expect(flowMind).toBeInstanceOf(FlowMind)
      
      // The ceo-config.yaml doesn't have metadata, so check raw structure
      expect(flowMind.raw).toHaveProperty('personalities')
      expect(Object.keys(flowMind.raw.personalities)).toHaveLength(8)
    })
    
    it('should load real Kingly contexts', async () => {
      const assembler = new ContextAssembler({
        yaml: { basePath: path.join(__dirname, '../../contexts') }
      })
      
      const ceoAgent = await assembler.load('yaml:agents/ceo/context.yaml')
      expect(ceoAgent).toBeInstanceOf(FlowMind)
      
      // Test correct FlowMind interface (1:1 YAML mapping)
      expect(ceoAgent.type).toBe('agent')
      expect(ceoAgent.id).toBe('ceo')
      expect(ceoAgent.name).toBe('Chief Executive Officer') // From metadata.name
      expect(ceoAgent.shortName).toBe('ceo') // From metadata.id
      
      // Check config access
      expect(ceoAgent.capabilities).toContain('strategic_planning')
      expect(ceoAgent.hasCapability('strategic_planning')).toBe(true)
      
      // Raw access still works
      expect(ceoAgent.raw).toHaveProperty('agent_config')
    })
  })
})