#!/usr/bin/env node

import { SemanticLookup } from '../mcp-mvp/src/semantic-lookup.js';
import { WorkflowLoader } from '../mcp-mvp/src/workflow-loader.js';
import fs from 'fs';

// Load environment variables manually
const envContent = fs.readFileSync('../mcp-mvp/.env', 'utf-8');
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...value] = line.split('=');
    if (key && value.length) {
      process.env[key.trim()] = value.join('=').trim();
    }
  }
});

// Set up environment
process.env.CONTEXTS_PATH = '/Users/jean-patricksmith/digital/kingly/core/agent/contexts';

async function searchBrainstorming() {
  console.log('🔍 Searching for brainstorming workflows...\n');
  
  const lookup = new SemanticLookup();
  const loader = new WorkflowLoader();
  
  // Ensure everything is loaded
  await lookup.ensureLoaded();
  await loader.ensureLoaded();
  
  // Search for brainstorming
  console.log('1. Semantic search for "brainstorming":');
  try {
    const result = await lookup.findWorkflow('brainstorming');
    if (result) {
      console.log(`✅ Found: ${result.name}`);
      console.log(`   Code: ${result.code}`);
      console.log(`   Description: ${result.description}`);
    } else {
      console.log('❌ No exact match (threshold too high)');
    }
    
    // Get suggestions
    console.log('\n2. Top suggestions for "brainstorming":');
    const suggestions = await lookup.getSuggestions('brainstorming', 5);
    suggestions.forEach((s, i) => {
      console.log(`   ${i+1}. [${s.code}] ${s.name}`);
      if (s.description) {
        console.log(`      ${s.description.substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Also search for specific brainstorming patterns
  console.log('\n3. Testing specific brainstorming-related codes:');
  const brainstormingCodes = ['2f', '2g', '2h', '2i'];
  for (const code of brainstormingCodes) {
    const workflow = await loader.getByCode(code);
    if (workflow) {
      console.log(`   ${code}: ${workflow.name}`);
    }
  }
}

searchBrainstorming().catch(console.error);