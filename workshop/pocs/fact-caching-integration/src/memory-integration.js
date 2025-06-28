/**
 * Integration layer between FACT caching and Leviathan memory system
 * 
 * Coordinates cache operations with 5-type memory architecture
 */

const { IntelligentCacheManager } = require('./cache-manager');

class CacheMemoryIntegration {
  constructor(memoryManager, config = {}) {
    this.memory = memoryManager;
    this.cache = new IntelligentCacheManager(config);
    
    // Track memory updates for cache invalidation
    this.setupMemoryHooks();
  }

  /**
   * Enhanced memory query with cache layer
   */
  async query(type, query, context = {}) {
    // Add memory type to context
    const enrichedContext = { ...context, type };
    
    // Check cache first
    const cacheResult = await this.cache.get(query, enrichedContext);
    if (cacheResult.cached) {
      return {
        ...cacheResult.data,
        responseTime: cacheResult.age,
        cacheHit: true,
        cacheTier: cacheResult.tier
      };
    }
    
    // Cache miss - query memory system
    const startTime = Date.now();
    const memoryResult = await this.executeMemoryQuery(type, query, context);
    const responseTime = Date.now() - startTime;
    
    // Cache the result based on memory type
    if (this.shouldCache(type, memoryResult)) {
      await this.cache.set(query, memoryResult, enrichedContext);
    }
    
    return {
      ...memoryResult,
      responseTime,
      cacheHit: false
    };
  }

  /**
   * Execute query against appropriate memory type
   */
  async executeMemoryQuery(type, query, context) {
    switch (type) {
      case 'procedural':
        return await this.memory.procedural.getApplicablePatterns({
          query,
          ...context
        });
        
      case 'semantic':
        return await this.memory.semantic.search(query);
        
      case 'temporal':
        return await this.memory.temporal.getHistory({
          query,
          ...context
        });
        
      case 'working':
        return await this.memory.working.getCurrentContext();
        
      case 'episodic':
        return await this.memory.episodic.findSimilarExperiences({
          query,
          ...context
        });
        
      default:
        throw new Error(`Unknown memory type: ${type}`);
    }
  }

  /**
   * Determine if result should be cached based on type
   */
  shouldCache(type, result) {
    // Don't cache empty results
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return false;
    }
    
    // Follow configuration for memory type caching
    return this.cache.config.memoryIntegration[type] !== false;
  }

  /**
   * Setup hooks to invalidate cache on memory updates
   */
  setupMemoryHooks() {
    // Hook into memory update events
    if (this.memory.on) {
      this.memory.on('update', (event) => {
        this.handleMemoryUpdate(event);
      });
    }
    
    // Wrap memory store methods to track updates
    this.wrapMemoryMethods();
  }

  /**
   * Wrap memory methods to track updates
   */
  wrapMemoryMethods() {
    const memoryTypes = ['procedural', 'semantic', 'temporal', 'working', 'episodic'];
    
    memoryTypes.forEach(type => {
      if (this.memory[type] && this.memory[type].store) {
        const originalStore = this.memory[type].store.bind(this.memory[type]);
        
        this.memory[type].store = async (...args) => {
          const result = await originalStore(...args);
          
          // Invalidate related cache entries
          this.invalidateTypeCache(type);
          
          return result;
        };
      }
    });
  }

  /**
   * Handle memory update events
   */
  handleMemoryUpdate(event) {
    const { type, operation } = event;
    
    if (operation === 'store' || operation === 'update') {
      this.invalidateTypeCache(type);
    }
  }

  /**
   * Invalidate cache entries for a memory type
   */
  invalidateTypeCache(type) {
    // Simple implementation: clear all entries for this type
    // More sophisticated: selective invalidation based on update
    const entriesToRemove = [];
    
    Object.values(this.cache.caches).forEach(cache => {
      cache.forEach((value, key) => {
        if (value.context && value.context.type === type) {
          entriesToRemove.push({ cache, key });
        }
      });
    });
    
    entriesToRemove.forEach(({ cache, key }) => {
      cache.delete(key);
    });
  }

  /**
   * Get combined statistics
   */
  getStats() {
    return {
      cache: this.cache.getStats(),
      integration: {
        memoryTypesIntegrated: Object.keys(this.cache.config.memoryIntegration)
          .filter(type => this.cache.config.memoryIntegration[type]).length,
        cacheEnabled: true
      }
    };
  }

  /**
   * Create MCP tool for cache operations
   */
  createMcpTool() {
    return {
      name: 'cache_query',
      description: 'Query memory with intelligent caching',
      inputSchema: {
        type: 'object',
        properties: {
          memoryType: {
            type: 'string',
            enum: ['procedural', 'semantic', 'temporal', 'working', 'episodic']
          },
          query: { type: 'string' },
          context: { type: 'object' }
        },
        required: ['memoryType', 'query']
      },
      handler: async (args) => {
        return await this.query(args.memoryType, args.query, args.context || {});
      }
    };
  }
}

module.exports = { CacheMemoryIntegration };