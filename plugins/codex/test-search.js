/**
 * Test Codex Search Command
 */

import { codex_search } from './src/index.js';

async function testSearch() {
  console.log('🧪 Testing Codex Search Command...\n');
  
  try {
    const result = await codex_search('react', { limit: '5' });
    
    console.log('📊 Search Results:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSearch();