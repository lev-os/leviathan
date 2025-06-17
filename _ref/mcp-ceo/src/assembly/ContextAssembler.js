/**
 * Context Assembler - Runtime Recipe Assembly
 * 
 * The "Context Chef" that creates coherent perspectives for workflow steps.
 * This is the ASSEMBLER responsibility from ADR-002.
 */

import { ContextTracker } from '../tracking/ContextTracker.js'

/**
 * Simple Context Assembler for v0.1.0
 * Focus: Basic recipe assembly, no complex features yet
 */
export class ContextAssembler {
  constructor(registry, config = {}) {
    this.registry = registry  // Source of pre-compiled FlowMind instances
    this.tracker = config.tracker || new ContextTracker()
  }
  
  /**
   * Assemble a recipe into a coherent context
   * @param {Object|string} recipe - Recipe specification or simple URI
   * @returns {Promise<Object>} Assembled context
   */
  async assemble(recipe) {
    // Handle simple URI recipes
    if (typeof recipe === 'string') {
      return this.assembleSimple(recipe)
    }
    
    // Handle complex recipes
    return this.assembleComplex(recipe)
  }
  
  /**
   * Simple assembly: just load a single context
   */
  async assembleSimple(uri) {
    const context = await this.registry.getContext(uri)
    return {
      assembled: context.raw,
      metadata: {
        assemblyId: this.tracker.generateId(),
        contextsUsed: 1,
        strategy: 'simple'
      }
    }
  }
  
  /**
   * Complex assembly: merge multiple contexts with rules
   */
  async assembleComplex(recipe) {
    const assemblyId = this.tracker.generateId()
    
    // Step 1: Load base context
    const baseContext = await this.registry.getContext(recipe.base)
    
    // Step 2: Load mix contexts if specified
    const mixContexts = []
    if (recipe.mix && Array.isArray(recipe.mix)) {
      for (const uri of recipe.mix) {
        const context = await this.registry.getContext(uri)
        mixContexts.push(context)
      }
    }
    
    // Step 3: Apply simple merging (v0.1.0 scope)
    const assembled = this.simpleMerge(baseContext, mixContexts, recipe)
    
    // Track the assembly
    this.tracker.trackContribution(
      'context_assembler',
      `Assembled ${1 + mixContexts.length} contexts`,
      { 
        base: recipe.base,
        mix: recipe.mix || [],
        strategy: 'simple_merge'
      }
    )
    
    return {
      assembled,
      metadata: {
        assemblyId,
        contextsUsed: 1 + mixContexts.length,
        strategy: 'simple_merge'
      },
      tracking: this.tracker.exportTracking()
    }
  }
  
  /**
   * Simple merging strategy for v0.1.0
   * Base context wins conflicts, deep merge for non-conflicting properties
   */
  simpleMerge(baseContext, mixContexts, recipe) {
    let result = { ...baseContext.raw }
    
    // Merge each mix context
    for (const context of mixContexts) {
      result = this.deepMerge(result, context.raw)
    }
    
    // Add recipe-specific data if provided
    if (recipe.challenge) {
      result.challenge = recipe.challenge
    }
    
    if (recipe.step_context) {
      result.step_context = recipe.step_context
    }
    
    if (recipe.previous_results) {
      result.previous_results = recipe.previous_results
    }
    
    return result
  }
  
  /**
   * Deep merge helper - base wins conflicts
   */
  deepMerge(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && 
            typeof target[key] === 'object' && target[key] !== null &&
            !Array.isArray(source[key]) && !Array.isArray(target[key])) {
          // Recursively merge objects
          result[key] = this.deepMerge(target[key], source[key])
        } else if (!target.hasOwnProperty(key)) {
          // Only add if not already in target (base wins)
          result[key] = source[key]
        }
        // If target already has the key, target wins (no override)
      }
    }
    
    return result
  }
}

/**
 * Dynamic Context Assembler - Simplified stub for v0.1.0
 * 
 * TODO v0.2.0: Uncomment and enable sophisticated assembly rules
 * when we need auto-discovery and complex workflows
 */
export class DynamicContextAssembler {
  constructor(config = {}) {
    // Handle both new and old patterns
    this.registry = config.registry || config.contextLoader
    this.tracker = config.tracker
    
    if (this.registry) {
      this.assembler = new ContextAssembler(this.registry, config)
    } else {
      // Backward compatibility: create mock registry for tests
      this.registry = {
        async getContext(uri) {
          throw new Error(`Protocol URI resolution not implemented: ${uri}`)
        }
      }
      this.assembler = new ContextAssembler(this.registry, config)
    }
    
    // TODO v0.2.0: Re-enable these features
    // this.rules = new AssemblyRules(config.rules)
    // this.conflictResolver = new ConflictResolver(config.conflictStrategy)
    // this.relevanceFilter = new RelevanceFilter(config.relevance)
    // this.tokenOptimizer = new TokenOptimizer(config.tokens)
  }
  
  async assemble(recipe) {
    // For old-style recipes with sources array, use mock approach
    if (recipe.sources && Array.isArray(recipe.sources)) {
      return this.assembleLegacy(recipe)
    }
    
    // v0.1.0: Use simple assembler for new-style recipes
    return this.assembler.assemble(recipe)
    
    // TODO v0.2.0: Enable sophisticated assembly
    // return this.sophisticatedAssemble(recipe)
  }
  
  /**
   * Legacy assembly for old test format - NOW USES REAL CONTEXTS
   */
  async assembleLegacy(recipe) {
    const assemblyId = this.tracker?.generateId() || 'mock-id'
    
    // Load real contexts for each source
    const contextTexts = []
    for (const source of recipe.sources) {
      try {
        // Try to load real context - support both registry and contextLoader patterns
        let context = null
        if (this.registry.getContext) {
          // New registry pattern
          context = await this.registry.getContext(source.name)
        } else if (this.registry.loadContext) {
          // Old contextLoader pattern - construct path
          const contextPath = `agents/eeps/${source.name}/context.yaml`
          context = await this.registry.loadContext(contextPath)
        }
        
        if (context && context._raw) {
          // Use real context content
          contextTexts.push(`[${source.name}]: ${JSON.stringify(context._raw, null, 2)}`)
        } else {
          // Fallback with clear indication this is fallback
          contextTexts.push(`[${source.name}]: Context not found - check if ${source.name} exists`)
        }
      } catch (error) {
        // Error fallback with clear indication
        contextTexts.push(`[${source.name}]: Failed to load - ${error.message}`)
      }
    }
    
    const assembled = contextTexts.join('\n\n')
    
    return {
      assembled,
      metadata: {
        assemblyId,
        contextsUsed: recipe.sources.length,
        tokensUsed: Math.floor(assembled.length / 4), // Rough estimate: 4 chars per token
        strategy: 'legacy_real_contexts'
      },
      tracking: this.tracker ? this.tracker.exportTracking() : {}
    }
  }
  
  // TODO v0.2.0: Implement sophisticated assembly
  // async sophisticatedAssemble(recipe) {
  //   // Complex assembly logic from assembly-rules.js
  //   // Priority rules, conflict resolution, relevance filtering, etc.
  // }
}