#!/usr/bin/env node

// Direct test of MCP-CEO server using simple_test workflow
// This bypasses the MCP protocol to test the core functionality

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the CEO class directly
async function testWorkflow() {
  console.log('🚀 Direct MCP-CEO Workflow Test');
  console.log('================================\n');
  
  // Import the CEO class
  const { ArchitectOfAbundanceCEO } = await import('./server.js');
  
  // Initialize CEO
  const ceo = new ArchitectOfAbundanceCEO();
  await ceo.initialize();
  
  const sessionId = randomUUID();
  console.log(`📍 Session ID: ${sessionId}\n`);
  
  try {
    // Step 1
    console.log('📋 Step 1: Define Challenge');
    console.log('----------------------------');
    const step1 = await ceo.executeWorkflowStep('simple_test', 1, sessionId, null);
    console.log('Response:', JSON.stringify(step1, null, 2));
    console.log('\n');
    
    // Step 2
    console.log('📋 Step 2: Explore Solutions');
    console.log('----------------------------');
    const step2 = await ceo.executeWorkflowStep('simple_test', 2, sessionId, step1.workflow);
    console.log('Response:', JSON.stringify(step2, null, 2));
    console.log('\n');
    
    // Step 3
    console.log('📋 Step 3: Create Action Plan');
    console.log('----------------------------');
    const step3 = await ceo.executeWorkflowStep('simple_test', 3, sessionId, step2.workflow);
    console.log('Response:', JSON.stringify(step3, null, 2));
    console.log('\n');
    
    console.log('✅ Workflow Complete!');
    console.log(`📁 Check session file at: ./sessions/${sessionId}-simple_test.json`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testWorkflow().catch(console.error);