#!/usr/bin/env node

import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const testQueries = [
  "creative brainstorming",
  "user research methods", 
  "strategic planning",
  "technical documentation",
  "performance optimization"
];

async function benchmarkOpenAI() {
  console.log('🧪 Testing OpenAI API performance:');
  const openaiTimes = [];
  
  for (const query of testQueries) {
    const start = Date.now();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.toLowerCase(),
    });
    const time = Date.now() - start;
    openaiTimes.push(time);
    console.log(`  "${query}": ${time}ms`);
  }
  
  const avgOpenAI = openaiTimes.reduce((a, b) => a + b, 0) / openaiTimes.length;
  console.log(`  📊 Average: ${avgOpenAI.toFixed(1)}ms`);
  
  return { times: openaiTimes, average: avgOpenAI };
}

async function main() {
  console.log('⚡ OpenAI Embedding Baseline Benchmark\n');
  
  try {
    const results = await benchmarkOpenAI();
    
    console.log('\n📈 BASELINE RESULTS:');
    console.log(`  OpenAI API Average: ${results.average.toFixed(1)}ms`);
    console.log(`  Min: ${Math.min(...results.times)}ms`);
    console.log(`  Max: ${Math.max(...results.times)}ms`);
    
    console.log('\n💡 NEXT STEPS:');
    console.log('  - Compare with Go solution when ready');
    console.log('  - Fix transformers.js sharp dependency');
    console.log('  - Target: <100ms per query for local solutions');
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

main();