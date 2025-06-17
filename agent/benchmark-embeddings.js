#!/usr/bin/env node

import 'dotenv/config';
import { pipeline } from '@xenova/transformers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test queries
const testQueries = [
  "creative brainstorming",
  "user research methods", 
  "strategic planning",
  "technical documentation",
  "performance optimization"
];

async function benchmarkTransformers() {
  console.log('🔄 Loading transformers.js model...');
  const startLoad = Date.now();
  
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  const loadTime = Date.now() - startLoad;
  console.log(`✅ Model loaded in ${loadTime}ms\n`);
  
  console.log('🧪 Testing transformers.js performance:');
  const transformerTimes = [];
  
  for (const query of testQueries) {
    const start = Date.now();
    const embedding = await embedder(query, { pooling: 'mean', normalize: true });
    const time = Date.now() - start;
    transformerTimes.push(time);
    console.log(`  "${query}": ${time}ms`);
  }
  
  const avgTransformer = transformerTimes.reduce((a, b) => a + b, 0) / transformerTimes.length;
  console.log(`  📊 Average: ${avgTransformer.toFixed(1)}ms\n`);
  
  return { times: transformerTimes, average: avgTransformer, loadTime };
}

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
  console.log(`  📊 Average: ${avgOpenAI.toFixed(1)}ms\n`);
  
  return { times: openaiTimes, average: avgOpenAI };
}

async function main() {
  console.log('⚡ Embedding Performance Benchmark\n');
  
  try {
    const transformerResults = await benchmarkTransformers();
    const openaiResults = await benchmarkOpenAI();
    
    console.log('📈 RESULTS COMPARISON:');
    console.log(`  Transformers.js: ${transformerResults.average.toFixed(1)}ms avg (+ ${transformerResults.loadTime}ms initial load)`);
    console.log(`  OpenAI API:      ${openaiResults.average.toFixed(1)}ms avg`);
    
    const speedup = (openaiResults.average / transformerResults.average).toFixed(1);
    console.log(`  🚀 Speedup:      ${speedup}x faster with transformers.js`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (transformerResults.average < openaiResults.average) {
      console.log('  ✅ Use transformers.js for better performance');
      console.log('  ✅ Eliminate API costs and network dependency');
      console.log('  ⚠️  One-time model download and startup cost');
    } else {
      console.log('  ⚠️  OpenAI API faster (unusual - check network)');
    }
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

main();