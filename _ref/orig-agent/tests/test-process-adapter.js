#!/usr/bin/env node
/**
 * Test Process Adapter - Real-world test of the MCP process tools
 * This uses the actual ProcessAdapter we built
 */

import ProcessAdapter from '../src/process-adapter.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testProcessAdapter() {
  console.log('🧪 PROCESS ADAPTER TEST');
  console.log('=' .repeat(40));
  
  const adapter = new ProcessAdapter();
  
  // Test 1: Start a simple echo process
  console.log('\n📝 Test 1: Starting echo process...');
  const echoProcess = await adapter.startProcess(
    'echo "Hello from background process" && sleep 2 && echo "Process complete!"',
    {
      cwd: __dirname,
      type: 'test',
      taskId: 'test-echo'
    }
  );
  
  console.log('✅ Process started:', echoProcess.processId);
  console.log('📋 Log file:', echoProcess.logs);
  
  // Test 2: Check status immediately
  console.log('\n📊 Test 2: Checking status...');
  const status1 = await adapter.getProcessStatus(echoProcess.processId);
  console.log('Status:', status1.status);
  console.log('Duration:', status1.duration, 'ms');
  
  // Test 3: Get logs with tail
  console.log('\n📜 Test 3: Getting logs with tail...');
  const statusWithLogs = await adapter.getProcessStatus(echoProcess.processId, { tail: true });
  if (statusWithLogs.logs && statusWithLogs.logs.snippet) {
    console.log('Log snippet:');
    console.log('─'.repeat(40));
    console.log(statusWithLogs.logs.snippet);
    console.log('─'.repeat(40));
  }
  
  // Test 4: List all processes
  console.log('\n📋 Test 4: Listing all processes...');
  const allProcesses = await adapter.listProcesses();
  console.log(`Found ${allProcesses.length} processes:`);
  allProcesses.forEach(p => {
    console.log(`  - ${p.id}: ${p.command} (${p.status})`);
  });
  
  // Test 5: Start a dev server simulation
  console.log('\n🚀 Test 5: Starting simulated dev server...');
  const devServer = await adapter.startDevServer(__dirname, 'test-dev-server');
  console.log('Dev server started:', devServer.processId);
  console.log('Command:', devServer.command);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 6: Check final status
  console.log('\n📊 Test 6: Final status check...');
  const finalStatus = await adapter.getProcessStatus(echoProcess.processId, { tail: 10 });
  console.log('Echo process status:', finalStatus.status);
  if (finalStatus.exitCode !== undefined) {
    console.log('Exit code:', finalStatus.exitCode);
  }
  
  // Test 7: Kill the dev server
  console.log('\n🛑 Test 7: Killing dev server...');
  const killResult = await adapter.killProcess(devServer.processId);
  console.log(killResult.message);
  
  // Test 8: Verify persistence
  console.log('\n💾 Test 8: Testing persistence...');
  const newAdapter = new ProcessAdapter();
  const persistedProcesses = await newAdapter.listProcesses();
  console.log(`Persisted ${persistedProcesses.length} processes across restart`);
  
  console.log('\n✅ All tests complete!');
}

// Run the tests
testProcessAdapter().catch(console.error);