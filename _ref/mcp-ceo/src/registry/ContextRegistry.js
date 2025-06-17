/**
 * Context Registry - Boot-time Context Loading
 * 
 * Handles file discovery, loading, and caching of FlowMind contexts.
 * This is the REGISTRY responsibility from ADR-002.
 */

import fs from 'fs/promises'
import yaml from 'yaml'
import path from 'path'
import { FlowMind, FlowMindFactory } from '../flowmind.js'

// Error Classes
export class ContextLoadError extends Error {
  constructor(message, path, originalError = null) {
    super(message)
    this.name = 'ContextLoadError'
    this.path = path
    this.originalError = originalError
  }
}

export class ContextParseError extends Error {
  constructor(message, content, position = null) {
    super(message)
    this.name = 'ContextParseError'
    this.content = content
    this.position = position
  }
}

export class ContextValidationError extends Error {
  constructor(message, context, schema) {
    super(message)
    this.name = 'ContextValidationError'
    this.context = context
    this.schema = schema
    this.violations = []
  }
}

// Schema Definitions (relaxed for real contexts)
const schemas = {
  agent: {
    required: ['metadata'],
    metadata: {
      required: ['type', 'id'],  // Removed 'name' requirement
      type: { enum: ['agent'] }
    }
    // Made agent_config optional since EEPS agents have different structure
  },
  workflow: {
    required: ['metadata'],
    metadata: {
      required: ['type', 'id'],
      type: { enum: ['workflow'] }
    }
  },
  pattern: {
    required: ['metadata'],
    metadata: {
      required: ['type', 'id'],
      type: { enum: ['pattern'] }
    }
  }
}

// Context Validator
export class ContextValidator {
  validate(context, contextType) {
    const schema = schemas[contextType]
    if (!schema) {
      return true // Unknown types pass validation
    }
    
    const violations = []
    
    // Check required top-level properties
    if (schema.required) {
      for (const prop of schema.required) {
        if (!context[prop]) {
          violations.push(`Missing required property: ${prop}`)
        }
      }
    }
    
    // Check metadata requirements
    if (schema.metadata && context.metadata) {
      if (schema.metadata.required) {
        for (const prop of schema.metadata.required) {
          if (!context.metadata[prop]) {
            violations.push(`Missing required metadata property: ${prop}`)
          }
        }
      }
      
      if (schema.metadata.type && schema.metadata.type.enum) {
        if (!schema.metadata.type.enum.includes(context.metadata.type)) {
          violations.push(`Invalid metadata.type: ${context.metadata.type}`)
        }
      }
    }
    
    if (violations.length > 0) {
      const error = new ContextValidationError(
        `Validation failed: ${violations.join(', ')}`,
        context,
        schema
      )
      error.violations = violations
      throw error
    }
    
    return true
  }
}

// YAML Context Loader - Returns FlowMind instances
export class YamlContextLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || './'
    this.cache = new Map()
    this.validator = new ContextValidator()
  }

  async load(filePath) {
    const fullPath = path.resolve(this.basePath, filePath)
    
    // Check cache first
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)
    }

    try {
      const content = await fs.readFile(fullPath, 'utf8')
      const parsed = yaml.parse(content)
      
      // Basic validation - detect context type
      if (parsed.metadata && parsed.metadata.type) {
        this.validator.validate(parsed, parsed.metadata.type)
      }
      
      // Create FlowMind instance
      const flowMind = FlowMindFactory.create(fullPath, parsed)
      
      // Cache and return
      this.cache.set(fullPath, flowMind)
      return flowMind
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new ContextLoadError(`File not found: ${filePath}`, filePath, error)
      }
      if (error instanceof ContextValidationError) {
        throw error
      }
      throw new ContextParseError(`Failed to parse YAML: ${error.message}`, filePath)
    }
  }
}

// Markdown Context Loader - Returns FlowMind-compatible structure
export class MarkdownContextLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || './'
    this.cache = new Map()
  }

  async load(filePath) {
    const fullPath = path.resolve(this.basePath, filePath)
    
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)
    }

    try {
      const content = await fs.readFile(fullPath, 'utf8')
      const parsed = this.parseMarkdown(content)
      
      // Convert to FlowMind-compatible structure
      const yamlStructure = {
        metadata: {
          type: 'pattern',
          id: path.basename(filePath, '.md'),
          name: parsed.title || parsed.name || path.basename(filePath, '.md'),
          source: 'markdown'
        },
        pattern_config: {
          content: content,
          ...parsed
        }
      }
      
      // Create FlowMind instance
      const flowMind = FlowMindFactory.create(fullPath, yamlStructure)
      
      this.cache.set(fullPath, flowMind)
      return flowMind
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new ContextLoadError(`File not found: ${filePath}`, filePath, error)
      }
      throw error
    }
  }

  parseMarkdown(content) {
    const context = {}
    
    try {
      // Extract title from first H1
      const titleMatch = content.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        context.title = titleMatch[1].trim()
      }
      
      // Extract structured blocks
      const blockRegex = /```([\w-]+)\n([\s\S]*?)```/g
      let match
      while ((match = blockRegex.exec(content)) !== null) {
        const [, tag, blockContent] = match
        context[tag] = this.parseBlockContent(blockContent.trim())
      }
      
      // Extract plain markdown sections
      let plainContent = content.replace(/^#.*$/m, '')
      plainContent = plainContent.replace(blockRegex, '')
      plainContent = plainContent.trim()
      
      if (plainContent) {
        context.description = plainContent
      }
      
      return context
    } catch (error) {
      throw new ContextParseError(`Failed to parse Markdown: ${error.message}`, content)
    }
  }
  
  parseBlockContent(content) {
    // Check if it's a list
    if (content.includes('\n-') || content.startsWith('-')) {
      return content.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0)
    }
    return content
  }
}

// Memory Context Loader - Returns FlowMind-compatible structure
export class MemoryContextLoader {
  constructor(options = {}) {
    this.sessionStore = options.sessionStore || './sessions'
    this.memorySystem = options.memorySystem || null
  }

  async load(contextPath) {
    const parts = contextPath.split(':')
    const type = parts[0]
    
    switch (type) {
      case 'session':
        return this.loadSessionContext(parts.slice(1).join(':'))
      case 'memory':
        return this.loadMemoryContext(parts.slice(1).join(':'))
      default:
        throw new ContextLoadError(`Unknown memory type: ${type}`, contextPath)
    }
  }
  
  async loadSessionContext(sessionPath) {
    const match = sessionPath.match(/^(.+?)\/step:(\d+)\/(.+)$/)
    if (!match) {
      throw new ContextLoadError(`Invalid session path: ${sessionPath}`, sessionPath)
    }
    
    const [, sessionId, step, component] = match
    const stepPath = path.join(this.sessionStore, sessionId, `step-${step}`)
    
    try {
      let content, metadata
      
      switch (component) {
        case 'response':
          const responsePath = path.join(stepPath, 'response.md')
          content = await fs.readFile(responsePath, 'utf8')
          metadata = await this.extractResponseMetadata(content)
          break
        
        case 'input':
          const inputPath = path.join(stepPath, 'input.md')
          content = await fs.readFile(inputPath, 'utf8')
          metadata = { type: 'input' }
          break
          
        default:
          throw new ContextLoadError(`Unknown component: ${component}`, sessionPath)
      }
      
      // Convert to FlowMind-compatible structure
      const yamlStructure = {
        metadata: {
          type: 'memory',
          id: `${sessionId}-${step}-${component}`,
          name: `Session ${sessionId} Step ${step} ${component}`,
          ...metadata
        },
        memory_config: {
          content,
          session_id: sessionId,
          step: parseInt(step),
          component
        }
      }
      
      return FlowMindFactory.create(sessionPath, yamlStructure)
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new ContextLoadError(`Session data not found: ${sessionPath}`, sessionPath, error)
      }
      throw error
    }
  }
  
  async extractResponseMetadata(content) {
    const timestampMatch = content.match(/\*\*Completed at\*\*:\s*(.+)/i)
    const personalityMatch = content.match(/personality:\s*(\w+)/i)
    
    return {
      timestamp: timestampMatch ? timestampMatch[1] : null,
      personality: personalityMatch ? personalityMatch[1] : null,
      type: 'response'
    }
  }
  
  async loadMemoryContext(memoryPath) {
    if (!this.memorySystem) {
      throw new ContextLoadError('Memory system not configured', memoryPath)
    }
    
    const [memoryType, ...query] = memoryPath.split('/')
    const memoryData = await this.memorySystem.query(memoryType, query.join('/'))
    
    // Convert to FlowMind-compatible structure
    const yamlStructure = {
      metadata: {
        type: 'memory',
        id: memoryPath.replace(/\//g, '-'),
        name: `Memory: ${memoryType}`,
        memory_type: memoryType
      },
      memory_config: memoryData
    }
    
    return FlowMindFactory.create(memoryPath, yamlStructure)
  }
}

// Main Context Registry - Boot-time loading and caching
export class ContextRegistry {
  constructor(config = {}) {
    this.loaders = {
      yaml: new YamlContextLoader(config.yaml || {}),
      markdown: new MarkdownContextLoader(config.markdown || {}),
      memory: new MemoryContextLoader(config.memory || {})
    }
    
    this.cache = config.cache || new Map()
    this.contextIndex = new Map() // For protocol URI resolution
  }
  
  /**
   * Load a context and return a FlowMind instance
   * @param {string} contextPath - Path with loader prefix (e.g., "yaml:contexts/agents/ceo/context.yaml")
   * @returns {Promise<FlowMind>} The loaded context as a FlowMind instance
   */
  async load(contextPath) {
    const colonIndex = contextPath.indexOf(':')
    if (colonIndex === -1) {
      throw new ContextLoadError('Invalid context path - missing loader prefix', contextPath)
    }
    
    const loaderType = contextPath.substring(0, colonIndex)
    const filePath = contextPath.substring(colonIndex + 1)
    
    const loader = this.loaders[loaderType]
    if (!loader) {
      throw new ContextLoadError(`Unknown loader type: ${loaderType}`, contextPath)
    }
    
    return loader.load(filePath)
  }
  
  /**
   * Load multiple contexts
   * @param {Array<string>} contextPaths - Array of context paths
   * @returns {Promise<Array<FlowMind>>} Array of FlowMind instances
   */
  async loadMultiple(contextPaths) {
    const promises = contextPaths.map(path => this.load(path))
    return Promise.all(promises)
  }
  
  /**
   * Load a context without prefix (assumes YAML)
   * For backward compatibility with tests
   * @param {string} filePath - Direct file path
   * @returns {Promise<FlowMind>} The loaded context as a FlowMind instance
   */
  async loadContext(filePath) {
    // Default to YAML loader for backward compatibility
    return this.loaders.yaml.load(filePath)
  }

  /**
   * Boot-time: Scan and index contexts for protocol URI resolution
   */
  async scan(baseDir = './contexts') {
    // TODO: Implement context discovery and indexing
    // This will scan the contexts directory and build an index
    // for protocol URI resolution (agent://ceo -> contexts/agents/ceo/context.yaml)
  }

  /**
   * Get context by protocol URI (e.g., agent://ceo)
   */
  async getContext(uri) {
    // TODO: Implement protocol URI resolution
    // For now, fallback to direct loading
    if (uri.includes('://')) {
      throw new Error(`Protocol URI resolution not implemented yet: ${uri}`)
    }
    return this.load(uri)
  }
}