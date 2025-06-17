/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        CONTEXT REGISTRY SYSTEM                            ║
 * ║                    Everything is a Context, Discoverable                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * This registry embodies FlowMind Constitutional Truth #2: EVERYTHING IS A CONTEXT
 * 
 * Not a "workflow registry" - that's old thinking. This discovers ALL contexts:
 * - Agents (type: "agent")
 * - Workflows (type: "workflow") 
 * - Patterns (type: "pattern")
 * - Types (type: "type")
 * - Themes, preferences, tools, instances... EVERYTHING
 * 
 * The registry doesn't categorize or organize. It discovers and presents.
 * Organization emerges from context relationships, not code structure.
 */

import { ContextAssembler } from './context-assembler.js'
import { FlowMind } from './flowmind.js'
import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

export class ContextRegistry {
  constructor(contextAssembler) {
    this.assembler = contextAssembler || new ContextAssembler()
    this.contexts = new Map() // id -> FlowMind instance
    this.byType = new Map() // type -> Set of ids
    this.scanPaths = [
      // MCP-CEO contexts (our source of truth for now)
      { basePath: 'contexts', recursive: true },
      // Future: Kingly contexts via ka symlink
      // { basePath: 'ka/core/agent/contexts', recursive: true }
    ]
  }

  /**
   * Scan all configured paths for contexts
   * Remember: We're not looking for "workflows" - we're looking for CONTEXTS
   */
  async scan() {
    this.contexts.clear()
    this.byType.clear()
    
    for (const scanPath of this.scanPaths) {
      await this.scanPath(scanPath.basePath, scanPath.recursive)
    }
    
    return {
      total: this.contexts.size,
      byType: Object.fromEntries(
        Array.from(this.byType.entries()).map(([type, ids]) => [type, ids.size])
      )
    }
  }

  /**
   * Scan a directory for context.yaml files
   * Everything with a context.yaml is a context. No exceptions.
   */
  async scanPath(basePath, recursive = true) {
    const pattern = recursive ? '**/context.yaml' : '*/context.yaml'
    const contextFiles = await glob(pattern, { 
      cwd: basePath,
      ignore: ['node_modules/**', '.git/**']
    })
    
    for (const contextFile of contextFiles) {
      const contextPath = path.dirname(contextFile)
      
      try {
        // Load through assembler to get FlowMind instance
        // Use relative path since assembler should have basePath configured
        const yamlPath = `yaml:${contextFile}`
        const flowMind = await this.assembler.load(yamlPath)
        
        // Register by ID - skip if no ID
        const id = flowMind.id || contextPath
        if (!flowMind.id) {
          console.warn(`Context at ${contextFile} has no ID, using path: ${contextPath}`)
        }
        
        this.contexts.set(id, flowMind)
        
        // Track by type
        const type = flowMind.type || 'unknown'
        if (!this.byType.has(type)) {
          this.byType.set(type, new Set())
        }
        this.byType.get(type).add(id)
        
      } catch (error) {
        console.error(`Failed to load context at ${contextFile}:`, error.message)
      }
    }
  }

  /**
   * Get all contexts (no filtering - everything is valid)
   */
  getAllContexts() {
    return Array.from(this.contexts.values())
  }

  /**
   * Get contexts by type
   * Note: This is convenience, not categorization. All contexts are equal.
   */
  getContextsByType(type) {
    const ids = this.byType.get(type) || new Set()
    return Array.from(ids).map(id => this.contexts.get(id))
  }

  /**
   * Get a specific context by ID
   */
  getContext(id) {
    return this.contexts.get(id)
  }

  /**
   * Get all known context types
   * This emerges from what exists, not from predefined categories
   */
  getTypes() {
    return Array.from(this.byType.keys())
  }

  /**
   * For backward compatibility with "workflow" thinking
   * Workflows are just contexts with type: "workflow"
   */
  getWorkflows() {
    return this.getContextsByType('workflow')
  }

  /**
   * Export registry state for debugging/visualization
   */
  export() {
    const exportData = {
      contexts: {},
      types: {},
      stats: {
        total: this.contexts.size,
        byType: {}
      }
    }
    
    // Export all contexts
    this.contexts.forEach((flowMind, id) => {
      exportData.contexts[id] = {
        id: flowMind.id,
        name: flowMind.name,
        type: flowMind.type,
        path: flowMind.path,
        metadata: flowMind.metadata
      }
    })
    
    // Export type groupings
    this.byType.forEach((ids, type) => {
      exportData.types[type] = Array.from(ids)
      exportData.stats.byType[type] = ids.size
    })
    
    return exportData
  }
}

/**
 * Context Discovery Utilities
 * These help find contexts without imposing structure
 */
export class ContextDiscovery {
  constructor(registry) {
    this.registry = registry
  }

  /**
   * Find contexts that match semantic criteria
   * The LLM evaluates these, not regex!
   */
  async findBySemantic(criteria) {
    // TODO: Implement LLM-based semantic search
    // For now, return all contexts for LLM to filter
    return this.registry.getAllContexts()
  }

  /**
   * Find contexts with specific capabilities
   */
  findByCapability(capability) {
    return this.registry.getAllContexts().filter(context => 
      context.hasCapability && context.hasCapability(capability)
    )
  }

  /**
   * Find contexts that reference other contexts
   * This reveals the emergent relationship graph
   */
  findRelated(contextId) {
    const related = new Set()
    
    this.registry.getAllContexts().forEach(context => {
      // Check if this context references the target
      const yaml = context?.raw
      if (!yaml) return // Skip if no raw data
      
      try {
        const yamlString = JSON.stringify(yaml)
        if (yamlString && typeof yamlString === 'string' && yamlString.includes(contextId)) {
          related.add(context.id)
        }
      } catch (error) {
        console.warn(`Failed to stringify context ${context?.id || 'unknown'} for relationship search:`, error.message)
      }
    })
    
    return Array.from(related).map(id => this.registry.getContext(id)).filter(Boolean)
  }
}

// Export factory function for convenience
export function createContextRegistry(options = {}) {
  const assembler = options.assembler || new ContextAssembler({
    yaml: { basePath: path.resolve('contexts') }
  })
  
  return new ContextRegistry(assembler)
}