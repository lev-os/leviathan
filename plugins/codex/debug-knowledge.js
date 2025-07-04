/**
 * Debug Knowledge Loading
 */

import { createKnowledgeRepository } from './src/infrastructure/knowledge-repository.js';

async function debugKnowledge() {
  console.log('🔍 Debugging Knowledge Loading...\n');
  
  try {
    const repository = createKnowledgeRepository();
    const knowledge = await repository.loadKnowledge();
    
    console.log('📋 Knowledge Structure:');
    for (const [category, entries] of Object.entries(knowledge)) {
      console.log(`\n${category}: ${entries.length} entries`);
      
      entries.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.metadata?.name || 'Unknown'} (${entry.metadata?.id || 'no-id'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  }
}

debugKnowledge();