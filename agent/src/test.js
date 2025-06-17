#!/usr/bin/env node

import 'dotenv/config';
import { SemanticLookup } from './semantic-lookup.js';
import { ContextLoader } from './context-loader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testMCPTool() {
  console.log('🧪 Testing Kingly Agent MCP Tool...\n');
  
  try {
    // Test context loading
    console.log('1. Testing context loading...');
    const loader = new ContextLoader();
    const contexts = await loader.loadAll();
    console.log(`✅ Loaded ${contexts.length} contexts\n`);
    
    // Test semantic lookup
    console.log('2. Testing semantic lookup...');
    const lookup = new SemanticLookup();
    
    // Test queries
    const testQueries = [
      'help me with strategic decisions',
      'need creative brainstorming',
      'analyze complex documents',
      '3a',
      'ceo'
    ];
    
    // Test workflow loader quick codes
    console.log('\n3. Testing quick code lookup...');
    for (const code of ['1a', '2f', '3a']) {
      const workflow = await loader.getByCode(code);
      if (workflow) {
        console.log(`✅ Code ${code}: ${workflow.name}`);
      } else {
        console.log(`❌ Code ${code}: Not found`);
      }
    }
    
    console.log('\n4. Testing semantic search...');
    for (const query of testQueries) {
      console.log(`\n🔍 Query: "${query}"`);
      try {
        const result = await lookup.findWorkflow(query);
        if (result) {
          console.log(`✅ Found: ${result.name} (similarity: ${result.similarity?.toFixed(3)})`);
          console.log(`   Description: ${result.description?.substring(0, 100)}...`);
        } else {
          console.log('❌ No workflow found (checking threshold...)');
          // Get suggestions to see similarities
          const suggestions = await lookup.getSuggestions(query, 3);
          if (suggestions.length > 0) {
            console.log('   Top suggestions:');
            suggestions.forEach((s, i) => console.log(`   ${i+1}. ${s.name}`));
          }
        }
      } catch (error) {
        console.log(`⚠️  Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

testMCPTool();