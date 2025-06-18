#!/usr/bin/env node

/**
 * Simple Integration Test for Workshop Commands
 * Tests that workshop CLI integration is working properly
 */

import { spawn } from 'child_process';

const agentDir = '/Users/jean-patricksmith/digital/leviathan/agent';

async function runCommand(args) {
  return new Promise((resolve) => {
    const command = `${agentDir}/bin/lev ${args.join(' ')}`;
    const child = spawn('bash', ['-c', command], { 
      stdio: 'pipe',
      timeout: 10000
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        code: code,
        output: (stdout + stderr).trim()
      });
    });
    
    setTimeout(() => {
      child.kill();
      resolve({ success: false, code: -1, output: 'Timeout' });
    }, 10000);
  });
}

async function testWorkshopIntegration() {
  console.log('🧪 Testing Workshop CLI Integration\n');
  
  const tests = [
    {
      name: 'workshop status',
      args: ['workshop', 'status'],
      expectSuccess: true,
      expectInOutput: 'WORKSHOP STATUS'
    },
    {
      name: 'workshop list',
      args: ['workshop', 'list'],
      expectSuccess: true,
      expectInOutput: 'WORKSHOP ITEMS'
    },
    {
      name: 'workshop list --tier=1',
      args: ['workshop', 'list', '--tier=1'],
      expectSuccess: true,
      expectInOutput: 'Tier 1'
    },
    {
      name: 'workshop info checkpoint-manager',
      args: ['workshop', 'info', 'checkpoint-manager'],
      expectSuccess: true,
      expectInOutput: 'TOOL: checkpoint-manager'
    },
    {
      name: 'workshop discover',
      args: ['workshop', 'discover'],
      expectSuccess: true,
      expectInOutput: 'WORKSHOP DISCOVERY'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`🧪 ${test.name}... `);
    
    const result = await runCommand(test.args);
    
    let success = true;
    let reason = '';
    
    if (test.expectSuccess && !result.success) {
      success = false;
      reason = `Expected success but got code ${result.code}`;
    } else if (!test.expectSuccess && result.success) {
      success = false;
      reason = `Expected failure but command succeeded`;
    }
    
    if (test.expectInOutput && !result.output.includes(test.expectInOutput)) {
      success = false;
      reason = `Expected output to contain "${test.expectInOutput}"`;
    }
    
    if (success) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log(`❌ FAIL - ${reason}`);
      console.log(`   Output: ${result.output.substring(0, 100)}...`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All workshop integration tests passed!');
    console.log('✅ Workshop commands working through CLI adapter auto-bootstrap');
    return true;
  } else {
    console.log('⚠️  Some workshop integration tests failed');
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWorkshopIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
}