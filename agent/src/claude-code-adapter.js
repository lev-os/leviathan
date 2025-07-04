/**
 * Claude Code Direct Adapter for Semantic Context Lookup
 * Bypasses MCP protocol overhead for direct method calls
 * Provides fast semantic search and context access
 */

import { SemanticLookup } from './semantic-lookup.js';
import { ContextLoader } from './context-loader.js';
import fs from 'fs-extra';
import path from 'path';

export class ClaudeCodeAdapter {
  constructor() {
    this.semanticLookup = new SemanticLookup();
    this.contextLoader = new ContextLoader();
    this.initialized = false;
    this.relationships = new Map();
    this.powerCombos = new Map();
    this.combosCache = null;
    this.comboCachePath = './cache/combos-cache.json';
  }

  async initialize() {
    if (this.initialized) return;
    
    // Ensure both components are loaded
    await this.contextLoader.loadAll();
    await this.semanticLookup.ensureLoaded();
    await this.loadOrBuildCombos();
    
    this.initialized = true;
    console.error('🚀 ClaudeCodeAdapter initialized with combo intelligence');
  }

  // Direct semantic context lookup
  async findWorkflow(intent, mode = 'full', typeFilter = null) {
    await this.initialize();
    
    // Quick code lookup first (fastest) - only if no type filter
    if (!typeFilter) {
      const quickResult = await this.contextLoader.getByCode(intent);
      if (quickResult) {
        return this.formatWorkflow(quickResult, mode);
      }
    }
    
    // Semantic search with optional type filter
    const semanticResult = await this.semanticLookup.findWorkflow(intent, typeFilter);
    if (semanticResult && semanticResult.found) {
      return semanticResult; // Already formatted by semantic lookup
    }
    
    // Return suggestions if no exact match
    const suggestions = await this.semanticLookup.getSuggestions(intent, 5, typeFilter);
    return {
      found: false,
      query: intent,
      type_filter: typeFilter,
      suggestions: suggestions
    };
  }

  // List contexts by category
  async listWorkflows(category = null, mode = 'menu') {
    await this.initialize();
    
    const contexts = await this.contextLoader.loadAll();
    const filtered = category ? 
      contexts.filter(w => w.category === category) : 
      contexts;
    
    return this.formatWorkflowList(filtered, mode);
  }

  // Get available categories
  async getCategories() {
    await this.initialize();
    
    const contexts = await this.contextLoader.loadAll();
    const categories = [...new Set(contexts.map(w => w.category))].sort();
    
    return {
      categories,
      counts: categories.map(cat => ({
        category: cat,
        count: contexts.filter(w => w.category === cat).length
      }))
    };
  }

  // Batch context lookup for multiple intents
  async batchFindWorkflows(intents, mode = 'quick') {
    await this.initialize();
    
    const results = [];
    for (const intent of intents) {
      try {
        const result = await this.findWorkflow(intent, mode);
        results.push({ intent, success: true, result });
      } catch (error) {
        results.push({ intent, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Refresh cache and rebuild embeddings
  async rebuildCache(rebuildEmbeddings = false, rebuildCombos = true) {
    this.initialized = false;
    
    // Clear context loader cache
    this.contextLoader = new ContextLoader();
    
    if (rebuildEmbeddings) {
      // Clear semantic lookup and force rebuild
      this.semanticLookup = new SemanticLookup();
      const contexts = await this.contextLoader.loadAll();
      await this.semanticLookup.buildEmbeddings(contexts);
    } else {
      // Just reload existing embeddings
      this.semanticLookup = new SemanticLookup();
    }
    
    if (rebuildCombos) {
      // Clear combo cache to force rebuild
      this.combosCache = null;
      this.relationships.clear();
      this.powerCombos.clear();
    }
    
    await this.initialize();
    
    return {
      success: true,
      rebuiltEmbeddings: rebuildEmbeddings,
      rebuiltCombos: rebuildCombos,
      timestamp: new Date().toISOString()
    };
  }
  
  async clearCache() {
    console.error('🗑️ Clearing all caches...');
    
    // Clear context loader cache
    this.contextLoader.cache.clear();
    this.contextLoader.quickCodes.clear();
    this.contextLoader.loaded = false;
    
    // Clear semantic lookup cache
    await this.semanticLookup.rebuildEmbeddings();
    
    console.error('✅ All caches cleared');
  }

  // Format context based on mode
  formatWorkflow(context, mode) {
    const base = {
      found: true,
      id: context.id,
      code: context.code,
      name: context.name,
      category: context.category,
      similarity: context.similarity
    };

    switch (mode) {
      case 'quick':
        return base;
        
      case 'full':
        return {
          ...base,
          description: context.description,
          instructions: context.instructions,
          triggers: context.triggers,
          filePath: context.filePath
        };
        
      case 'menu':
        return {
          code: context.code,
          name: context.name,
          category: context.category
        };
        
      default:
        return base;
    }
  }

  // Format context list based on mode
  formatWorkflowList(contexts, mode) {
    switch (mode) {
      case 'quick':
        return contexts.map(w => `${w.code} - ${w.name}`).join('\n');
        
      case 'menu':
        const byCategory = contexts.reduce((acc, w) => {
          if (!acc[w.category]) acc[w.category] = [];
          acc[w.category].push(`${w.code} - ${w.name}`);
          return acc;
        }, {});
        
        return Object.entries(byCategory)
          .map(([cat, items]) => `**${cat}**\n${items.join('\n')}`)
          .join('\n\n');
        
      case 'full':
        return contexts.map(w => ({
          code: w.code,
          name: w.name,
          description: w.description,
          category: w.category
        }));
        
      default:
        return contexts.map(w => this.formatWorkflow(w, 'quick'));
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      adapter: 'ClaudeCodeAdapter',
      type: 'direct',
      overhead: 'minimal',
      estimatedResponseTime: '10-50ms',
      features: [
        'Quick code lookup (~10ms)',
        'Semantic search (~200ms)', 
        'Batch operations',
        'Category filtering',
        'Cache management'
      ]
    };
  }

  // Get available operations
  getAvailableOperations() {
    return {
      core: [
        'findWorkflow(intent, mode)',
        'listWorkflows(category, mode)', 
        'getCategories()',
        'rebuildCache(rebuildEmbeddings)'
      ],
      batch: [
        'batchFindWorkflows(intents, mode)'
      ],
      utility: [
        'getPerformanceMetrics()',
        'getAvailableOperations()'
      ],
      combos: [
        'findCombos(intent, depth)',
        'getPowerCombos(scenario)',
        'buildWorkflowChain(startCode, goal)',
        'suggestNext(currentCode)'
      ]
    };
  }

  // Load or build combo intelligence cache
  async loadOrBuildCombos() {
    try {
      if (await fs.pathExists(this.comboCachePath)) {
        const cache = await fs.readJson(this.comboCachePath);
        this.combosCache = cache;
        this.buildRelationshipMaps(cache);
        console.error('📚 Loaded combo cache');
      } else {
        await this.buildComboIntelligence();
        console.error('🔄 Built combo intelligence cache');
      }
    } catch (error) {
      console.error('⚠️ Combo cache error, building fresh:', error.message);
      await this.buildComboIntelligence();
    }
  }

  // Build combo intelligence from scratch
  async buildComboIntelligence() {
    const contexts = await this.contextLoader.loadAll();
    
    // Filter out pure organizational patterns
    const nonOrgContexts = contexts.filter(w => 
      !['agile-scrum', 'lean-startup', 'business-model-canvas'].includes(w.id)
    );

    // Build semantic relationships
    const relationships = await this.analyzeWorkflowRelationships(nonOrgContexts);
    
    // Define power combinations
    const powerCombos = this.definePowerCombos(nonOrgContexts);
    
    // Build workflow chains
    const chains = this.buildWorkflowChains(nonOrgContexts, relationships);

    const cache = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      relationships,
      powerCombos,
      chains,
      workflowCount: nonOrgContexts.length
    };

    // Save cache
    await fs.ensureDir(path.dirname(this.comboCachePath));
    await fs.writeJson(this.comboCachePath, cache, { spaces: 2 });
    
    this.combosCache = cache;
    this.buildRelationshipMaps(cache);
  }

  // Analyze semantic relationships between contexts
  async analyzeWorkflowRelationships(contexts) {
    const relationships = {};
    
    for (const context of contexts) {
      const related = [];
      
      // Find semantically similar contexts
      if (context.description) {
        const similarities = await this.semanticLookup.getSuggestions(context.description, 10);
        
        for (const similar of similarities) {
          if (similar.id !== context.id && similar.similarity > 0.4) {
            related.push({
              id: similar.id,
              code: similar.code,
              type: 'semantic',
              strength: similar.similarity,
              reason: 'semantic similarity'
            });
          }
        }
      }
      
      // Add category relationships
      const categoryMatches = contexts.filter(w => 
        w.category === context.category && w.id !== context.id
      );
      
      categoryMatches.forEach(match => {
        related.push({
          id: match.id,
          code: match.code,
          type: 'category',
          strength: 0.6,
          reason: `same category: ${context.category}`
        });
      });

      relationships[context.id] = related.slice(0, 8); // Top 8 relationships
    }
    
    return relationships;
  }

  // Define power combinations for common scenarios
  definePowerCombos(contexts) {
    const combos = {
      'creative-problem-solving': {
        name: 'Creative Problem Solving',
        description: 'Systematic approach to creative problem solving',
        core: ['2f', '2k', '1i'], // Systematic Creativity + Radical Scenarios + The Innovator
        support: ['first-principles-thinking', 'reverse-brainstorming', 'extreme-examples'],
        sequence: ['2f', '2k', '1i'],
        effectiveness: 0.92
      },
      'strategic-decision': {
        name: 'Strategic Decision Making',
        description: 'Comprehensive framework for strategic decisions',
        core: ['3b', '2i', 'porter-five-forces'],
        support: ['decision-matrix', 'reversibility-check', 'swot-analysis'],
        sequence: ['2i', 'porter-five-forces', '3b'],
        effectiveness: 0.88
      },
      'innovation-pipeline': {
        name: 'Innovation Pipeline',
        description: 'End-to-end innovation development',
        core: ['1i', 'design-thinking', 'jobs-to-be-done'],
        support: ['blue-ocean-strategy', 'value-proposition-canvas', 'first-principles-thinking'],
        sequence: ['jobs-to-be-done', 'design-thinking', '1i'],
        effectiveness: 0.85
      },
      'user-research': {
        name: 'Deep User Research',
        description: 'Comprehensive user understanding framework',
        core: ['2i', 'jobs-to-be-done', '1k'],
        support: ['design-thinking', 'empathy-mapping', 'user-journey'],
        sequence: ['2i', 'jobs-to-be-done', '1k'],
        effectiveness: 0.90
      },
      'system-optimization': {
        name: 'System Optimization',
        description: 'Holistic system analysis and optimization',
        core: ['systems-thinking', '1f', 'first-principles-thinking'],
        support: ['value-stream-mapping', 'constraint-theory', 'optimization'],
        sequence: ['systems-thinking', 'first-principles-thinking', '1f'],
        effectiveness: 0.87
      }
    };

    return combos;
  }

  // Build workflow chains for common progressions
  buildWorkflowChains(contexts, relationships) {
    return {
      'research-to-action': ['2i', 'jobs-to-be-done', 'design-thinking', '1a'],
      'problem-to-solution': ['2k', 'first-principles-thinking', '2f', '1i'],
      'strategy-to-execution': ['porter-five-forces', '3b', 'decision-matrix', '1a'],
      'ideation-to-validation': ['2f', '2k', 'design-thinking', 'lean-startup'],
      'analysis-to-insight': ['systems-thinking', 'first-principles-thinking', '1k', '3b']
    };
  }

  // Build internal maps from cache
  buildRelationshipMaps(cache) {
    // Build relationships map
    for (const [workflowId, relations] of Object.entries(cache.relationships)) {
      this.relationships.set(workflowId, relations);
    }
    
    // Build power combos map
    for (const [scenario, combo] of Object.entries(cache.powerCombos)) {
      this.powerCombos.set(scenario, combo);
    }
  }

  // Find context combinations for an intent
  async findCombos(intent, depth = 3) {
    await this.initialize();
    
    // First find the primary context
    const primary = await this.findWorkflow(intent, 'full');
    if (!primary.found) {
      return { found: false, message: 'No primary context found for intent' };
    }

    // Get related contexts
    const relationships = this.relationships.get(primary.id) || [];
    const combos = relationships
      .filter(r => r.strength > 0.5)
      .slice(0, depth)
      .map(r => ({
        code: r.code,
        type: r.type,
        strength: r.strength,
        reason: r.reason
      }));

    return {
      found: true,
      primary: {
        name: primary.name,
        description: primary.description,
        category: primary.category
      },
      combos: combos.map(c => ({
        name: c.name,
        type: c.type,
        strength: c.strength,
        reason: c.reason
      })),
      suggestion: `Start with: ${primary.name}, then consider: ${combos.slice(0, 2).map(c => c.name).join(', ')}`
    };
  }

  // Get power combination for scenario
  async getPowerCombos(scenario) {
    await this.initialize();
    
    // Direct scenario match
    if (this.powerCombos.has(scenario)) {
      return {
        found: true,
        scenario,
        combo: this.powerCombos.get(scenario)
      };
    }

    // Semantic search for scenario
    const allCombos = Array.from(this.powerCombos.entries());
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, combo] of allCombos) {
      const searchText = `${combo.name} ${combo.description}`;
      const similarity = await this.calculateSemanticSimilarity(scenario, searchText);
      
      if (similarity > bestScore && similarity > 0.4) {
        bestScore = similarity;
        bestMatch = { key, combo, similarity };
      }
    }

    if (bestMatch) {
      return {
        found: true,
        scenario: bestMatch.key,
        combo: bestMatch.combo,
        similarity: bestMatch.similarity
      };
    }

    return {
      found: false,
      scenario,
      available: Array.from(this.powerCombos.keys())
    };
  }

  // Build context chain from start to goal
  async buildWorkflowChain(startCode, goal) {
    await this.initialize();
    
    // Get starting context
    const startWorkflow = await this.contextLoader.getByCode(startCode);
    if (!startWorkflow) {
      return { found: false, message: 'Starting context not found' };
    }

    // Check if we have a pre-built chain
    const chains = this.combosCache?.chains || {};
    for (const [chainName, chain] of Object.entries(chains)) {
      if (chain[0] === startCode && chainName.includes(goal.toLowerCase())) {
        return {
          found: true,
          chain: chain,
          name: chainName,
          description: `Pre-built chain from ${startCode} to ${goal}`
        };
      }
    }

    // Build dynamic chain using relationships
    const chain = [startCode];
    let current = startWorkflow.id;
    const visited = new Set([current]);
    
    for (let i = 0; i < 4; i++) { // Max 5 contexts in chain
      const relationships = this.relationships.get(current) || [];
      const nextStep = relationships.find(r => 
        !visited.has(r.id) && 
        r.strength > 0.5 &&
        (r.reason.includes(goal) || r.type === 'semantic')
      );
      
      if (nextStep) {
        chain.push(nextStep.code);
        visited.add(nextStep.id);
        current = nextStep.id;
      } else {
        break;
      }
    }

    // Convert codes to semantic descriptions
    const semanticChain = [];
    for (const code of chain) {
      const context = await this.contextLoader.getByCode(code);
      if (context) {
        semanticChain.push({
          name: context.name,
          description: context.description,
          purpose: `Step toward ${goal}`
        });
      }
    }
    
    return {
      found: true,
      chain: semanticChain,
      dynamic: true,
      description: `Process flow from "${startWorkflow.name}" toward ${goal}`
    };
  }

  // Suggest next context after current
  async suggestNext(currentCode) {
    await this.initialize();
    
    const currentContext = await this.contextLoader.getByCode(currentCode);
    if (!currentContext) {
      return { found: false, message: 'Current context not found' };
    }

    const relationships = this.relationships.get(currentContext.id) || [];
    const suggestions = relationships
      .filter(r => r.strength > 0.6)
      .slice(0, 3)
      .map(r => ({
        code: r.code,
        reason: r.reason,
        strength: r.strength
      }));

    return {
      found: suggestions.length > 0,
      current: {
        name: currentContext.name,
        description: currentContext.description
      },
      suggestions: relationships
        .filter(r => r.strength > 0.6)
        .slice(0, 3)
        .map(r => {
          const context = this.contextLoader.getByCode(r.code);
          return {
            name: context?.name || r.code,
            reason: r.reason,
            strength: r.strength
          };
        })
    };
  }

  // Helper: Calculate semantic similarity
  async calculateSemanticSimilarity(text1, text2) {
    // Simplified similarity - in production would use actual embeddings
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(w => words2.includes(w));
    return intersection.length / Math.max(words1.length, words2.length);
  }
}
