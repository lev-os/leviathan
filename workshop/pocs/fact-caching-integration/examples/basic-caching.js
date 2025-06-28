/**
 * Basic example of FACT caching integration with Leviathan
 */

const { CacheMemoryIntegration } = require('../src/memory-integration');

// Simulate Leviathan memory manager
const memoryManager = {
  procedural: {
    getApplicablePatterns: async ({ query }) => {
      console.log(`[Memory] Searching procedural patterns for: ${query}`);
      // Simulate database lookup
      await new Promise(r => setTimeout(r, 200));
      return [
        { 
          id: 'react-opt-1',
          title: 'React.memo for performance',
          confidence: 0.95
        },
        {
          id: 'react-opt-2', 
          title: 'useMemo for expensive calculations',
          confidence: 0.88
        }
      ];
    }
  },
  
  semantic: {
    search: async (query) => {
      console.log(`[Memory] Searching semantic knowledge for: ${query}`);
      await new Promise(r => setTimeout(r, 150));
      return [
        { concept: 'React optimization', relevance: 0.92 },
        { concept: 'Performance patterns', relevance: 0.85 }
      ];
    }
  }
};

async function demonstrateBasicCaching() {
  console.log('=== FACT Caching Integration Demo ===\n');
  
  // Initialize integration
  const cacheIntegration = new CacheMemoryIntegration(memoryManager);
  
  // Example 1: First query (cache miss)
  console.log('1. First query - expecting cache miss:');
  console.time('Query 1');
  const result1 = await cacheIntegration.query(
    'procedural',
    'react optimization patterns'
  );
  console.timeEnd('Query 1');
  console.log(`Cache hit: ${result1.cacheHit}`);
  console.log(`Response time: ${result1.responseTime}ms\n`);
  
  // Example 2: Repeated query (cache hit)
  console.log('2. Repeated query - expecting cache hit:');
  console.time('Query 2');
  const result2 = await cacheIntegration.query(
    'procedural', 
    'react optimization patterns'
  );
  console.timeEnd('Query 2');
  console.log(`Cache hit: ${result2.cacheHit}`);
  console.log(`Cache tier: ${result2.cacheTier}`);
  console.log(`Response time: ${result2.responseTime || '<1'}ms\n`);
  
  // Example 3: Different memory type
  console.log('3. Semantic memory query:');
  console.time('Query 3');
  const result3 = await cacheIntegration.query(
    'semantic',
    'react hooks best practices'
  );
  console.timeEnd('Query 3');
  console.log(`Results: ${result3.length} items found\n`);
  
  // Show cache statistics
  console.log('4. Cache Statistics:');
  const stats = cacheIntegration.getStats();
  console.log(`Hit rate: ${stats.cache.hitRate}`);
  console.log(`Total entries: ${stats.cache.totalEntries}`);
  console.log('Tier sizes:', stats.cache.tierSizes);
  console.log('\n=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  demonstrateBasicCaching().catch(console.error);
}

module.exports = { demonstrateBasicCaching };