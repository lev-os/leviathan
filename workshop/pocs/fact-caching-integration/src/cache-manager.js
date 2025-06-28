/**
 * FACT-Inspired Intelligent Cache Manager for Leviathan
 * 
 * Implements intelligent prompt caching strategies from FACT system
 * with integration points for Leviathan's 5-type memory architecture
 */

const crypto = require('crypto');

class IntelligentCacheManager {
  constructor(config = {}) {
    this.config = {
      // Cache tiers with TTL strategies
      tiers: {
        hot: { ttl: 300, maxSize: 100 },      // 5 min - active queries
        warm: { ttl: 3600, maxSize: 500 },    // 1 hour - recent patterns  
        cold: { ttl: 86400, maxSize: 2000 }   // 24 hours - stable knowledge
      },
      // Integration with Leviathan memory types
      memoryIntegration: {
        procedural: true,  // Cache validated workflows
        semantic: true,    // Cache knowledge queries
        temporal: false,   // Don't cache time-sensitive
        working: true,     // Cache active context
        episodic: false    // Don't cache personal experiences
      },
      ...config
    };
    
    this.caches = {
      hot: new Map(),
      warm: new Map(),
      cold: new Map()
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  /**
   * FACT-style intelligent caching decision
   */
  async get(query, context = {}) {
    const key = this.generateKey(query, context);
    const tier = this.determineTier(query, context);
    
    // Check cache tiers in order
    for (const [tierName, cache] of Object.entries(this.caches)) {
      if (cache.has(key)) {
        const entry = cache.get(key);
        if (this.isValid(entry, tierName)) {
          this.stats.hits++;
          this.promoteIfNeeded(key, entry, tierName);
          return {
            data: entry.data,
            cached: true,
            tier: tierName,
            age: Date.now() - entry.timestamp
          };
        } else {
          // Expired - remove
          cache.delete(key);
          this.stats.evictions++;
        }
      }
    }
    
    this.stats.misses++;
    return { cached: false };
  }

  /**
   * Store with intelligent tier assignment
   */
  async set(query, data, context = {}) {
    const key = this.generateKey(query, context);
    const tier = this.determineTier(query, context);
    const cache = this.caches[tier];
    
    // Enforce size limits
    if (cache.size >= this.config.tiers[tier].maxSize) {
      this.evictOldest(tier);
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      context
    });
    
    return { tier, key };
  }

  /**
   * FACT-inspired tier determination based on query characteristics
   */
  determineTier(query, context) {
    // System prompts and schemas → cold (stable)
    if (context.type === 'system' || context.type === 'schema') {
      return 'cold';
    }
    
    // Active workflow or current session → hot
    if (context.sessionId && context.type === 'working') {
      return 'hot';
    }
    
    // Knowledge queries → warm
    if (context.type === 'semantic' || context.type === 'procedural') {
      return 'warm';
    }
    
    // Default to hot for unknown
    return 'hot';
  }

  /**
   * Generate cache key with context awareness
   */
  generateKey(query, context) {
    const contextStr = JSON.stringify({
      type: context.type,
      sessionId: context.sessionId,
      userId: context.userId
    });
    
    return crypto
      .createHash('sha256')
      .update(query + contextStr)
      .digest('hex');
  }

  /**
   * Check if cache entry is still valid
   */
  isValid(entry, tierName) {
    const ttl = this.config.tiers[tierName].ttl * 1000;
    return (Date.now() - entry.timestamp) < ttl;
  }

  /**
   * Promote frequently accessed items to hotter tiers
   */
  promoteIfNeeded(key, entry, currentTier) {
    entry.accessCount++;
    
    // Promote if accessed frequently
    if (entry.accessCount > 5 && currentTier !== 'hot') {
      const cache = this.caches[currentTier];
      cache.delete(key);
      
      const newTier = currentTier === 'cold' ? 'warm' : 'hot';
      this.caches[newTier].set(key, entry);
    }
  }

  /**
   * Evict oldest entry from tier
   */
  evictOldest(tier) {
    const cache = this.caches[tier];
    const oldest = [...cache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    
    if (oldest) {
      cache.delete(oldest[0]);
      this.stats.evictions++;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    return {
      ...this.stats,
      hitRate: (hitRate * 100).toFixed(1) + '%',
      totalEntries: Object.values(this.caches)
        .reduce((sum, cache) => sum + cache.size, 0),
      tierSizes: Object.entries(this.caches)
        .reduce((acc, [tier, cache]) => {
          acc[tier] = cache.size;
          return acc;
        }, {})
    };
  }

  /**
   * Clear all caches
   */
  clear() {
    Object.values(this.caches).forEach(cache => cache.clear());
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
}

module.exports = { IntelligentCacheManager };