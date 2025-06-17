#!/usr/bin/env node
/**
 * Simple MCP test to verify server responses
 */

import MCPClient from './mcp-client.js';

async function test() {
  const client = new MCPClient();
  
  console.log('🧪 SIMPLE MCP-CEO TEST\n');
  
  try {
    // Connect
    await client.connect();
    
    // Test 1: Simple query
    console.log('\n─────────────────────────────────────────');
    console.log('📋 TEST 1: Simple Query');
    console.log('─────────────────────────────────────────\n');
    
    const simple = await client.callTool('architect_of_abundance', {
      challenge: 'How do I scale my startup while maintaining sovereignty?'
    });
    
    console.log('Response:', JSON.stringify(simple, null, 2));
    
    // Test 2: Workflow Step 1
    console.log('\n─────────────────────────────────────────');
    console.log('📋 TEST 2: Workflow Step 1');
    console.log('─────────────────────────────────────────\n');
    
    const workflow1 = await client.callTool('architect_of_abundance', {
      challenge: 'Design a system for million-agent orchestration with LLM-first architecture',
      workflow_request: {
        type: 'multi_expert_validation',
        step: 1
      }
    });
    
    console.log('Response:', JSON.stringify(workflow1, null, 2));
    
    // Test 3: Workflow Step 2
    if (workflow1.callback_prompt) {
      console.log('\n─────────────────────────────────────────');
      console.log('📋 TEST 3: Workflow Step 2');
      console.log('─────────────────────────────────────────\n');
      
      const workflow2 = await client.callTool('architect_of_abundance', {
        challenge: 'Continue analysis',
        workflow_request: {
          type: 'multi_expert_validation',
          step: 2,
          session_id: workflow1.session_id || 'test-session',
          previous_results: {
            step: 1,
            insights: workflow1.insights || workflow1.response
          }
        }
      });
      
      console.log('Response:', JSON.stringify(workflow2, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await client.disconnect();
  }
}

test().catch(console.error);