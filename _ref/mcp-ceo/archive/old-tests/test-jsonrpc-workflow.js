#!/usr/bin/env node

// Test MCP-CEO server using JSON-RPC protocol
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

async function sendRequest(proc, request) {
  return new Promise((resolve, reject) => {
    let response = '';
    let errorOutput = '';
    
    // Capture stdout (JSON-RPC response)
    proc.stdout.on('data', (data) => {
      response += data.toString();
    });
    
    // Capture stderr (console logs)
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Send request
    proc.stdin.write(JSON.stringify(request) + '\n');
    
    // Wait for response
    setTimeout(() => {
      if (errorOutput) {
        console.log('Console Output:', errorOutput);
      }
      
      try {
        const parsed = JSON.parse(response);
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse response: ${response}`));
      }
    }, 2000);
  });
}

async function testWorkflow() {
  console.log('🚀 Testing MCP-CEO Simple Workflow via JSON-RPC');
  console.log('==============================================\n');
  
  const sessionId = randomUUID();
  console.log(`📍 Session ID: ${sessionId}\n`);
  
  // Start the server
  const server = spawn('node', ['server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Step 1
    console.log('📋 Step 1: Define Challenge');
    console.log('----------------------------');
    const req1 = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "architect_of_abundance",
        arguments: {
          challenge: "What is the meaning of life?",
          workflow_request: {
            type: "simple_test",
            step: 1
          }
        }
      },
      id: 1
    };
    const res1 = await sendRequest(server, req1);
    console.log('Step 1 Complete\n');
    
    // Step 2
    console.log('📋 Step 2: Explore Solutions');
    console.log('----------------------------');
    const req2 = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "architect_of_abundance",
        arguments: {
          challenge: "Continue analysis",
          workflow_request: {
            type: "simple_test",
            step: 2,
            session_id: sessionId
          }
        }
      },
      id: 2
    };
    const res2 = await sendRequest(server, req2);
    console.log('Step 2 Complete\n');
    
    // Step 3
    console.log('📋 Step 3: Create Action Plan');
    console.log('----------------------------');
    const req3 = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "architect_of_abundance",
        arguments: {
          challenge: "Continue analysis",
          workflow_request: {
            type: "simple_test",
            step: 3,
            session_id: sessionId
          }
        }
      },
      id: 3
    };
    const res3 = await sendRequest(server, req3);
    console.log('Step 3 Complete\n');
    
    console.log('✅ Workflow Complete!');
    console.log(`📁 Check session file at: ./sessions/${sessionId}-simple_test.json`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    server.kill();
  }
}

testWorkflow().catch(console.error);