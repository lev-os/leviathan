/**
 * Performance benchmarks for FACT caching integration
 * 
 * Validates sub-50ms cache hit performance targets
 */

const { IntelligentCacheManager } = require('./cache-manager');
const { CacheMemoryIntegration } = require('./memory-integration');

// Mock memory with realistic delays
const createMockMemory = () => ({
  procedural: {
    getApplicablePatterns: async ({ query }) => {
      await new Promise(r => setTimeout(r, 180 + Math.random() * 40));
      return Array(5).fill(null).map((_, i) => ({
        id: `pattern-${i}`,
        title: `Pattern ${i} for ${query}`,
        confidence: 0.7 + Math.random() * 0.3
      }));
    },
    store: async (data) => data
  },
  
  semantic: {
    search: async (query) => {
      await new Promise(r => setTimeout(r, 150 + Math.random() * 50));
      return Array(10).fill(null).map((_, i) => ({
        concept: `Concept ${i}`,
        relevance: 0.6 + Math.random() * 0.4
      }));
    },
    store: async (data) => data
  },
  
  working: {
    getCurrentContext: async () => {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 20));
      return { 
        session: 'benchmark-session',
        tasks: ['task1', 'task2'],
        timestamp: Date.now()
      };
    }
  }
});

async function runBenchmarks() {
  console.log('🔬 FACT CACHING INTEGRATION BENCHMARKS\n');
  console.log('='.repeat(60));
  
  const memory = createMockMemory();
  const integration = new CacheMemoryIntegration(memory);
  
  // Test queries
  const queries = [
    { type: 'procedural', query: 'react optimization patterns' },
    { type: 'procedural', query: 'component lifecycle hooks' },
    { type: 'semantic', query: 'javascript best practices' },
    { type: 'semantic', query: 'performance optimization' },
    { type: 'working', query: 'current context' }
  ];
  
  // Warm up cache
  console.log('📊 Warming up cache...');
  for (const { type, query } of queries) {
    await integration.query(type, query);
  }
  
  // Benchmark cache hits
  console.log('\n📈 Cache Hit Performance (100 iterations per query):');
  console.log('-'.repeat(60));
  
  const results = [];
  
  for (const { type, query } of queries) {
    const times = [];
    
    for (let i = 0; i < 100; i++) {
      const start = process.hrtime.bigint();
      const result = await integration.query(type, query);
      const end = process.hrtime.bigint();
      
      const timeMs = Number(end - start) / 1_000_000;
      times.push(timeMs);
      
      if (!result.cacheHit) {
        console.warn('⚠️  Unexpected cache miss during benchmark');
      }
    }
    
    // Calculate statistics
    times.sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const p50 = times[Math.floor(times.length * 0.50)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    
    results.push({ type, query, avg, p50, p95, p99 });
    
    console.log(`\n${type.toUpperCase()} - "${query}"`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  P50: ${p50.toFixed(2)}ms | P95: ${p95.toFixed(2)}ms | P99: ${p99.toFixed(2)}ms`);
  }
  
  // Overall statistics
  console.log('\n📊 Overall Cache Performance:');
  console.log('-'.repeat(60));
  
  const allAvg = results.reduce((sum, r) => sum + r.avg, 0) / results.length;
  const allP95 = results.reduce((sum, r) => sum + r.p95, 0) / results.length;
  
  console.log(`Average Response Time: ${allAvg.toFixed(2)}ms`);
  console.log(`Average P95: ${allP95.toFixed(2)}ms`);
  
  // Cache statistics
  const stats = integration.getStats();
  console.log(`\nCache Hit Rate: ${stats.cache.hitRate}`);
  console.log('Cache Distribution:', stats.cache.tierSizes);
  
  // Performance validation
  console.log('\n✅ Performance Validation:');
  console.log('-'.repeat(60));
  
  const targets = {
    avgTarget: 25,
    p95Target: 50,
    hitRateTarget: 80
  };
  
  const avgPass = allAvg <= targets.avgTarget;
  const p95Pass = allP95 <= targets.p95Target;
  const hitRatePass = parseFloat(stats.cache.hitRate) >= targets.hitRateTarget;
  
  console.log(`Average < ${targets.avgTarget}ms: ${avgPass ? '✅ PASS' : '❌ FAIL'} (${allAvg.toFixed(2)}ms)`);
  console.log(`P95 < ${targets.p95Target}ms: ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${allP95.toFixed(2)}ms)`);
  console.log(`Hit Rate > ${targets.hitRateTarget}%: ${hitRatePass ? '✅ PASS' : '❌ FAIL'} (${stats.cache.hitRate})`);
  
  const allPass = avgPass && p95Pass && hitRatePass;
  console.log(`\n🎯 Overall Result: ${allPass ? '✅ ALL TARGETS MET' : '❌ TARGETS MISSED'}`);
  
  // Cost analysis
  console.log('\n💰 Cost Analysis:');
  console.log('-'.repeat(60));
  
  const totalQueries = stats.cache.hits + stats.cache.misses;
  const cachedQueries = stats.cache.hits;
  const savedQueries = cachedQueries;
  const costPerQuery = 0.02; // Approximate LLM API cost
  const savedCost = savedQueries * costPerQuery;
  const costReduction = (cachedQueries / totalQueries) * 100;
  
  console.log(`Total Queries: ${totalQueries}`);
  console.log(`Cached Queries: ${cachedQueries}`);
  console.log(`Estimated Savings: $${savedCost.toFixed(2)}`);
  console.log(`Cost Reduction: ${costReduction.toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Benchmark Complete\n');
}

// Run benchmarks
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = { runBenchmarks };