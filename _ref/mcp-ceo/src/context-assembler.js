/**
 * Context Assembler - Legacy Compatibility Layer
 * 
 * DEPRECATED: This file is being phased out.
 * Use src/assembly/ContextAssembler.js for new development.
 * 
 * Keeping for backward compatibility during transition.
 */

import { ContextRegistry } from './registry/ContextRegistry.js'
import { ContextAssembler as NewContextAssembler } from './assembly/ContextAssembler.js'

// Re-export error classes for compatibility
export {
  ContextLoadError,
  ContextParseError,
  ContextValidationError,
  ContextValidator,
  YamlContextLoader,
  MarkdownContextLoader,
  MemoryContextLoader
} from './registry/ContextRegistry.js'

/**
 * Legacy Context Assembler - Delegates to new architecture
 * 
 * @deprecated Use ContextRegistry + ContextAssembler instead
 */
export class ContextAssembler {
  constructor(config = {}) {
    // Create registry for loading
    this.registry = new ContextRegistry(config)
    
    // Create assembler for recipe assembly
    this.assembler = new NewContextAssembler(this.registry, config)
  }
  
  /**
   * Load a context and return a FlowMind instance
   * @deprecated Use ContextRegistry.load() instead
   */
  async load(contextPath) {
    return this.registry.load(contextPath)
  }
  
  /**
   * Load multiple contexts
   * @deprecated Use ContextRegistry.loadMultiple() instead
   */
  async loadMultiple(contextPaths) {
    return this.registry.loadMultiple(contextPaths)
  }
  
  /**
   * Load a context without prefix (assumes YAML)
   * @deprecated Use ContextRegistry.loadContext() instead
   */
  async loadContext(filePath) {
    return this.registry.loadContext(filePath)
  }
  
  /**
   * Assemble a recipe (NEW: delegates to proper assembler)
   */
  async assemble(recipe) {
    return this.assembler.assemble(recipe)
  }
}