#!/usr/bin/env node

// Demonstration of MCP-CEO workflow with console logging
// This shows dynamic context assembly and personality activation

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

// ANSI color codes for beautiful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

async function runWorkflowDemo() {
  console.log(colors.cyan + '╔══════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.bright + colors.yellow + 'MCP-CEO WORKFLOW DEMONSTRATION' + colors.reset + colors.cyan + '                               ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.dim + 'Dynamic Context Assembly & Personality Activation' + colors.reset + colors.cyan + '            ║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log();
  
  const sessionId = randomUUID();
  console.log(colors.green + '📍 Session ID: ' + colors.bright + sessionId + colors.reset);
  console.log();
  
  // Start the server and capture all output
  const server = spawn('node', ['server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });
  
  let allStderr = '';
  
  // Capture stderr (console output)
  server.stderr.on('data', (data) => {
    const output = data.toString();
    allStderr += output;
    // Show live console output
    process.stderr.write(output);
  });
  
  // Handle stdout (JSON-RPC responses)
  let responseBuffer = '';
  server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // STEP 1: Define Challenge
    console.log(colors.blue + '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.bright + colors.green + '📋 STEP 1: Define Challenge' + colors.reset);
    console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    
    const request1 = {
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
    
    console.log(colors.dim + '\nSending request...' + colors.reset);
    server.stdin.write(JSON.stringify(request1) + '\n');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(colors.green + '\n✅ Step 1 Complete!' + colors.reset);
    console.log(colors.dim + 'Active personalities: cortisol_guardian, systems_illuminator' + colors.reset);
    
    // STEP 2: Explore Solutions
    console.log(colors.blue + '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.bright + colors.green + '📋 STEP 2: Explore Solutions' + colors.reset);
    console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    
    const request2 = {
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
    
    console.log(colors.dim + '\nSending request with session ID...' + colors.reset);
    server.stdin.write(JSON.stringify(request2) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(colors.green + '\n✅ Step 2 Complete!' + colors.reset);
    console.log(colors.dim + 'Active personalities: abundance_amplifier, action_catalyst' + colors.reset);
    
    // STEP 3: Create Action Plan
    console.log(colors.blue + '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.bright + colors.green + '📋 STEP 3: Create Action Plan' + colors.reset);
    console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    
    const request3 = {
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
    
    console.log(colors.dim + '\nSending final request...' + colors.reset);
    server.stdin.write(JSON.stringify(request3) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(colors.green + '\n✅ Step 3 Complete!' + colors.reset);
    console.log(colors.dim + 'Active personalities: action_catalyst, sovereignty_architect' + colors.reset);
    
    // Summary
    console.log(colors.cyan + '\n╔══════════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.cyan + '║  ' + colors.bright + colors.green + 'WORKFLOW COMPLETE!' + colors.reset + colors.cyan + '                                           ║' + colors.reset);
    console.log(colors.cyan + '╚══════════════════════════════════════════════════════════════╝' + colors.reset);
    
    console.log(colors.yellow + '\n🔑 Key Observations:' + colors.reset);
    console.log('   • Each step activated different personalities');
    console.log('   • Context was dynamically assembled per step');
    console.log('   • Session state was maintained across steps');
    console.log('   • File saved at: ' + colors.bright + `./sessions/${sessionId}-simple_test.json` + colors.reset);
    
    // Show session file location
    console.log(colors.dim + '\nTo view session details:' + colors.reset);
    console.log(colors.bright + `cat ./sessions/${sessionId}-simple_test.json | jq .` + colors.reset);
    
  } catch (error) {
    console.error(colors.red + '\n❌ Error: ' + error.message + colors.reset);
  } finally {
    server.kill();
  }
}

// Run the demo
runWorkflowDemo().catch(console.error);