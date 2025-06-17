#!/usr/bin/env node

import 'dotenv/config';
import { ContextLoader } from './context-loader.js';
import { SemanticLookup } from './semantic-lookup.js';
import fs from 'fs-extra';
import path from 'path';

async function buildEmbeddings() {
  console.log('🔄 Building embeddings cache...\n');
  
  try {
    // Load all contexts
    console.log('1. Loading contexts...');
    const loader = new ContextLoader();
    const contexts = await loader.loadAll();
    console.log(`✅ Loaded ${contexts.length} contexts\n`);
    
    // Initialize semantic lookup
    console.log('2. Initializing semantic lookup...');
    const lookup = new SemanticLookup();
    
    // Build embeddings for all contexts
    console.log('3. Building embeddings...');
    
    // Call the buildEmbeddings method with all workflows
    await lookup.buildEmbeddings(contexts);
    
    const processed = contexts.length;
    
    console.log(`\n✅ Successfully built embeddings for ${processed}/${contexts.length} contexts`);
    
    // Save cache info
    const cacheDir = './cache';
    await fs.ensureDir(cacheDir);
    
    const cacheInfo = {
      built: new Date().toISOString(),
      contexts: processed,
      total: contexts.length,
      version: '1.0.0'
    };
    
    await fs.writeJson(path.join(cacheDir, 'cache-info.json'), cacheInfo, { spaces: 2 });
    
    console.log(`\n📁 Cache info saved to ${cacheDir}/cache-info.json`);
    console.log('🎉 Embeddings build complete!');
    
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

buildEmbeddings();