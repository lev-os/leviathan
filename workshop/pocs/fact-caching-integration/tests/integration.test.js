/**
 * Integration tests for FACT caching with Leviathan memory
 */

const { IntelligentCacheManager } = require('../src/cache-manager');
const { CacheMemoryIntegration } = require('../src/memory-integration');

// Mock memory manager for testing
class MockMemoryManager {
  constructor() {
    this.procedural = {
      getApplicablePatterns: async ({ query }) => {
        // Simulate memory lookup delay
        await new Promise(resolve => setTimeout(resolve, 200));
        return [
          { id: 'pattern-1', title: 'React Pattern', relevance: 0.9 },
          { id: 'pattern-2', title: 'Component Pattern', relevance: 0.8 }
        ];
      },
      store: async (data) => data
    };
    
    this.semantic = {
      search: async (query) => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return [
          { concept: 'React Hooks', score: 0.95 },
          { concept: 'useEffect', score: 0.85 }
        ];
      },
      store: async (data) => data
    };
    
    this.working = {
      getCurrentContext: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { currentTask: 'optimization', files: ['App.tsx'] };
      }
    };
  }
}

describe('FACT Cache Integration', () => {
  let integration;
  let mockMemory;
  
  beforeEach(() => {
    mockMemory = new MockMemoryManager();
    integration = new CacheMemoryIntegration(mockMemory);
  });
  
  afterEach(() => {
    integration.cache.clear();
  });

  test('cache hit performance', async () => {
    // First query - cache miss
    const start1 = Date.now();
    const result1 = await integration.query('procedural', 'react patterns');
    const time1 = Date.now() - start1;
    
    expect(result1.cacheHit).toBe(false);
    expect(time1).toBeGreaterThan(150); // Memory lookup time
    
    // Second query - cache hit
    const start2 = Date.now();
    const result2 = await integration.query('procedural', 'react patterns');
    const time2 = Date.now() - start2;
    
    expect(result2.cacheHit).toBe(true);
    expect(time2).toBeLessThan(50); // Cache lookup should be fast
    expect(result2.cacheTier).toBeDefined();
  });

  test('tier assignment based on memory type', async () => {
    // System context should go to cold tier
    const systemResult = await integration.query('semantic', 'system prompt', {
      type: 'system'
    });
    await integration.query('semantic', 'system prompt', { type: 'system' });
    
    const stats = integration.getStats();
    expect(stats.cache.tierSizes.cold).toBeGreaterThan(0);
    
    // Working memory should go to hot tier  
    await integration.query('working', 'current context', {
      sessionId: 'test-session'
    });
    
    expect(integration.cache.caches.hot.size).toBeGreaterThan(0);
  });

  test('cache invalidation on memory update', async () => {
    // Cache a procedural query
    await integration.query('procedural', 'test pattern');
    const stats1 = integration.getStats();
    expect(stats1.cache.totalEntries).toBe(1);
    
    // Update procedural memory
    await mockMemory.procedural.store({ 
      id: 'new-pattern',
      title: 'New Pattern' 
    });
    
    // Cache should be invalidated
    const stats2 = integration.getStats();
    expect(stats2.cache.totalEntries).toBe(0);
  });

  test('selective caching based on memory type', async () => {
    integration.cache.config.memoryIntegration.temporal = false;
    
    // Temporal queries should not be cached
    mockMemory.temporal = {
      getHistory: async () => [{ timestamp: Date.now(), event: 'test' }]
    };
    
    await integration.query('temporal', 'recent history');
    
    const stats = integration.getStats();
    expect(stats.cache.totalEntries).toBe(0);
  });

  test('cache statistics tracking', async () => {
    // Generate some cache activity
    await integration.query('procedural', 'pattern 1');
    await integration.query('procedural', 'pattern 1'); // hit
    await integration.query('procedural', 'pattern 2');
    await integration.query('procedural', 'pattern 1'); // hit
    
    const stats = integration.getStats();
    expect(stats.cache.hits).toBe(2);
    expect(stats.cache.misses).toBe(2);
    expect(stats.cache.hitRate).toBe('50.0%');
  });

  test('MCP tool creation and execution', async () => {
    const tool = integration.createMcpTool();
    
    expect(tool.name).toBe('cache_query');
    expect(tool.inputSchema.properties.memoryType.enum).toContain('procedural');
    
    // Execute tool
    const result = await tool.handler({
      memoryType: 'semantic',
      query: 'test query'
    });
    
    expect(result).toBeDefined();
    expect(result.cacheHit).toBe(false);
  });

  test('performance benchmarks meet targets', async () => {
    const iterations = 100;
    const queries = ['query1', 'query2', 'query3', 'query4', 'query5'];
    
    // Warm up cache
    for (const query of queries) {
      await integration.query('procedural', query);
    }
    
    // Measure cache hit performance
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      const start = Date.now();
      await integration.query('procedural', query);
      times.push(Date.now() - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
    
    expect(avgTime).toBeLessThan(25); // Target: <25ms average
    expect(p95Time).toBeLessThan(50); // Target: <50ms p95
  });
});

// Run tests
if (require.main === module) {
  console.log('Running FACT integration tests...');
  require('jest').run();
}