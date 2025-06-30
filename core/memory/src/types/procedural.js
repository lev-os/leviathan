/**
 * Procedural Memory Implementation
 * "How to do things" - agent patterns, workflows, muscle memory for coding tasks
 * Storage: File system primary, Graphiti indexed for searchability
 */

class ProceduralMemory {
  constructor(memoryManager) {
    this.manager = memoryManager;
    this.fileSystem = memoryManager.fileSystem;
    this.graphiti = memoryManager.graphiti;
    this.cache = new Map(); // LRU cache for frequently used patterns
  }

  async isOperational() {
    try {
      return await this.fileSystem.isAccessible();
    } catch {
      return false;
    }
  }

  // Store a new procedural pattern
  async storePattern(pattern) {
    try {
      // Store in file system (source of truth)
      const filePath = `patterns/${pattern.id}.yaml`;
      await this.fileSystem.writeYaml(filePath, pattern);
      
      // Index in Graphiti for searchability
      if (this.graphiti) {
        await this.indexPatternInGraphiti(pattern);
      }
      
      // Update cache
      this.cache.set(pattern.id, pattern);
      
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Failed to store procedural pattern:', error);
      return { success: false, error: error.message };
    }
  }

  // Retrieve a specific pattern by ID
  async getPattern(patternId) {
    try {
      // Check cache first
      if (this.cache.has(patternId)) {
        return this.cache.get(patternId);
      }
      
      // Load from file system
      const filePath = `patterns/${patternId}.yaml`;
      const pattern = await this.fileSystem.readYaml(filePath);
      
      // Cache for future use
      this.cache.set(patternId, pattern);
      
      return pattern;
    } catch (error) {
      console.error(`Failed to get pattern ${patternId}:`, error);
      return null;
    }
  }

  // Search for patterns matching criteria
  async searchPatterns(query) {
    try {
      if (this.graphiti && !this.manager.options.fallbackMode) {
        return await this.searchWithGraphiti(query);
      } else {
        return await this.searchFilesOnly(query);
      }
    } catch (error) {
      console.warn('Graphiti search failed, falling back to file search:', error);
      return await this.searchFilesOnly(query);
    }
  }

  // Graphiti-enhanced pattern search
  async searchWithGraphiti(query) {
    const graphitiResults = await this.graphiti.hybrid_search({
      query: query,
      type: 'procedural_pattern',
      include_relationships: true,
      include_temporal: true
    });

    // Enhance with file system data
    const enhancedResults = [];
    for (const result of graphitiResults.items || []) {
      const pattern = await this.getPattern(result.pattern_id);
      if (pattern) {
        enhancedResults.push({
          ...pattern,
          relevance_score: result.score,
          relationships: result.relationships,
          usage_history: result.temporal_data
        });
      }
    }

    return {
      source: 'graphiti_enhanced',
      patterns: enhancedResults,
      total: enhancedResults.length
    };
  }

  // File-only pattern search (fallback)
  async searchFilesOnly(query) {
    const patterns = await this.getAllPatterns();
    const matches = patterns.filter(pattern => 
      this.matchesQuery(pattern, query)
    );

    return {
      source: 'file_only',
      patterns: matches,
      total: matches.length
    };
  }

  // Get all available patterns
  async getAllPatterns() {
    try {
      const patternFiles = await this.fileSystem.glob('patterns/*.yaml');
      const patterns = [];
      
      for (const file of patternFiles) {
        const pattern = await this.fileSystem.readYaml(file);
        if (pattern) {
          patterns.push(pattern);
        }
      }
      
      return patterns;
    } catch (error) {
      console.error('Failed to get all patterns:', error);
      return [];
    }
  }

  // Find patterns applicable to a specific context
  async getApplicablePatterns(context) {
    const query = `applicable to ${context.task} in ${context.language} with ${context.framework}`;
    const results = await this.searchPatterns(query);
    
    // Sort by relevance and filter by success rate
    return results.patterns
      .filter(pattern => pattern.success_rate > 0.7)
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, 10); // Top 10 most relevant
  }

  // Track pattern execution results for learning
  async trackExecution(patternId, context, result) {
    try {
      const execution = {
        pattern_id: patternId,
        timestamp: new Date().toISOString(),
        context: context,
        result: result,
        success: result.success,
        duration: result.duration,
        confidence: result.confidence
      };

      // Store execution history in Graphiti if available
      if (this.graphiti) {
        await this.graphiti.create_memory({
          type: 'pattern_execution',
          content: execution,
          relationships: [
            { type: 'executed_pattern', target: patternId },
            { type: 'in_context', target: context.id }
          ],
          temporal: true
        });
      }

      // Update pattern success rate
      await this.updatePatternSuccessRate(patternId, result.success);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track pattern execution:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper: Index pattern in Graphiti
  async indexPatternInGraphiti(pattern) {
    if (!this.graphiti) return;

    const embeddings = await this.generatePatternEmbeddings(pattern);
    const relationships = this.extractPatternRelationships(pattern);

    await this.graphiti.create_memory({
      pattern_id: pattern.id,
      type: 'procedural_pattern',
      content: {
        title: pattern.title,
        description: pattern.description,
        steps: pattern.steps,
        context: pattern.context
      },
      embeddings: embeddings,
      relationships: relationships,
      metadata: {
        language: pattern.language,
        framework: pattern.framework,
        difficulty: pattern.difficulty,
        success_rate: pattern.success_rate || 0
      }
    });
  }

  // Helper: Simple query matching for file-only mode
  matchesQuery(pattern, query) {
    const searchText = `
      ${pattern.title} 
      ${pattern.description} 
      ${pattern.context?.join(' ')} 
      ${pattern.tags?.join(' ')}
    `.toLowerCase();
    
    const queryTerms = query.toLowerCase().split(' ');
    return queryTerms.some(term => searchText.includes(term));
  }

  // Helper: Generate embeddings for pattern
  async generatePatternEmbeddings(pattern) {
    // Combine pattern text for embedding
    const text = `
      ${pattern.title}
      ${pattern.description}
      ${pattern.steps?.join(' ')}
      ${pattern.context?.join(' ')}
    `;
    
    // Use Graphiti's embedding service or fallback
    if (this.graphiti && this.graphiti.generateEmbeddings) {
      return await this.graphiti.generateEmbeddings(text);
    }
    
    // Simple fallback (would use proper embedding service in production)
    return null;
  }

  // Helper: Extract pattern relationships
  extractPatternRelationships(pattern) {
    const relationships = [];
    
    // Language relationships
    if (pattern.language) {
      relationships.push({ type: 'uses_language', target: pattern.language });
    }
    
    // Framework relationships
    if (pattern.framework) {
      relationships.push({ type: 'uses_framework', target: pattern.framework });
    }
    
    // Related patterns
    if (pattern.related_patterns) {
      pattern.related_patterns.forEach(relatedId => {
        relationships.push({ type: 'related_to', target: relatedId });
      });
    }
    
    // Dependencies
    if (pattern.dependencies) {
      pattern.dependencies.forEach(dep => {
        relationships.push({ type: 'depends_on', target: dep });
      });
    }
    
    return relationships;
  }

  // Helper: Update pattern success rate
  async updatePatternSuccessRate(patternId, success) {
    try {
      const pattern = await this.getPattern(patternId);
      if (!pattern) return;

      // Simple success rate calculation (could be more sophisticated)
      const currentRate = pattern.success_rate || 0.5;
      const currentCount = pattern.execution_count || 0;
      
      const newCount = currentCount + 1;
      const newRate = (currentRate * currentCount + (success ? 1 : 0)) / newCount;
      
      pattern.success_rate = newRate;
      pattern.execution_count = newCount;
      pattern.last_executed = new Date().toISOString();
      
      // Update file
      await this.storePattern(pattern);
      
    } catch (error) {
      console.error('Failed to update pattern success rate:', error);
    }
  }

  // Cleanup
  async close() {
    this.cache.clear();
  }
}

module.exports = { ProceduralMemory };