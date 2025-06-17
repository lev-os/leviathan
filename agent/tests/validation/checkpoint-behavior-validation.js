#!/usr/bin/env node

/**
 * Checkpoint Behavior Validation Test
 * 
 * Validates that checkpoint command behavior matches design expectations.
 * Tests the specific issue: kingly checkpoint "context" should route correctly
 * and produce appropriate responses for each mode.
 */

import { spawn } from 'child_process';

async function validateCheckpointBehavior() {
  console.log('🧪 Checkpoint Behavior Validation');
  console.log('='.repeat(60));
  console.log('Testing checkpoint command routing and response patterns\n');
  
  const tests = [
    {
      name: 'Default Progress Mode',
      command: ['checkpoint', 'default progress context'],
      expectedMode: 'progress',
      expectedMarker: '⚡ CHECKPOINT Progress',
      validation: (output) => {
        return output.includes('⚡ CHECKPOINT Progress') &&
               output.includes('Current State:') &&
               output.includes('Session ID:') &&
               output.includes('default progress context');
      }
    },
    {
      name: 'Explicit New Mode',
      command: ['checkpoint', '--new', 'explicit new session'],
      expectedMode: 'new',
      expectedMarker: '🚀 CHECKPOINT New',
      validation: (output) => {
        return output.includes('🚀 CHECKPOINT New') &&
               output.includes('Fresh Start:') &&
               output.includes('Session Initialized:') &&
               output.includes('explicit new session');
      }
    },
    {
      name: 'Resume Mode',
      command: ['checkpoint', '--resume'],
      expectedMode: 'resume',
      expectedMarker: '🔄 CHECKPOINT Resume',
      validation: (output) => {
        return output.includes('🔄 CHECKPOINT Resume') &&
               output.includes('Session Loaded:') &&
               (output.includes('Cross-Session Timeline') || output.includes('previous sessions'));
      }
    },
    {
      name: 'Final Mode',
      command: ['checkpoint', '--final', 'session completion'],
      expectedMode: 'final',
      expectedMarker: '✅ CHECKPOINT Final',
      validation: (output) => {
        return output.includes('✅ CHECKPOINT Final') &&
               output.includes('Session Summary:');
      }
    },
    {
      name: 'Context Flag Mode',
      command: ['checkpoint', '--context', 'explicit context flag'],
      expectedMode: 'progress',
      expectedMarker: '⚡ CHECKPOINT Progress',
      validation: (output) => {
        return output.includes('⚡ CHECKPOINT Progress') &&
               output.includes('Current State:');
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`   Command: kingly ${test.command.join(' ')}`);
    console.log(`   Expected: ${test.expectedMarker}`);
    
    try {
      const result = await runKinglyCommand(test.command);
      const success = test.validation(result.output);
      
      if (success) {
        console.log(`   ✅ PASSED - ${test.expectedMode} mode working correctly`);
        passed++;
        results.push({ test: test.name, status: 'passed', mode: test.expectedMode });
      } else {
        console.log(`   ❌ FAILED - Expected ${test.expectedMarker}`);
        console.log(`   Output preview: ${result.output.substring(0, 100)}...`);
        failed++;
        results.push({ test: test.name, status: 'failed', mode: test.expectedMode, output: result.output.substring(0, 200) });
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
      failed++;
      results.push({ test: test.name, status: 'error', mode: test.expectedMode, error: error.message });
    }
  }
  
  // Success Criteria Analysis
  console.log('\n' + '='.repeat(60));
  console.log('📊 CHECKPOINT BEHAVIOR ANALYSIS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  // Mode-specific analysis
  const modeResults = {
    progress: results.filter(r => r.mode === 'progress'),
    new: results.filter(r => r.mode === 'new'),
    resume: results.filter(r => r.mode === 'resume'),
    final: results.filter(r => r.mode === 'final')
  };
  
  console.log('\n📋 Mode-Specific Results:');
  Object.entries(modeResults).forEach(([mode, modeTests]) => {
    const modePassed = modeTests.filter(t => t.status === 'passed').length;
    const modeTotal = modeTests.length;
    console.log(`   ${mode.padEnd(8)}: ${modePassed}/${modeTotal} passed`);
  });
  
  // Command Routing Analysis
  console.log('\n🔍 Command Routing Analysis:');
  const defaultBehavior = results.find(r => r.test === 'Default Progress Mode');
  if (defaultBehavior?.status === 'passed') {
    console.log('   ✅ Default mode (no flags) → Progress checkpoint working');
  } else {
    console.log('   ❌ Default mode routing issue detected');
  }
  
  const explicitModes = results.filter(r => ['Explicit New Mode', 'Resume Mode', 'Final Mode'].includes(r.test));
  const explicitPassed = explicitModes.filter(r => r.status === 'passed').length;
  console.log(`   ✅ Explicit modes: ${explicitPassed}/${explicitModes.length} working`);
  
  // Success Criteria Evaluation
  console.log('\n🎯 SUCCESS CRITERIA EVALUATION:');
  
  const criticalCriteria = [
    { name: 'All modes route correctly', met: passed === tests.length },
    { name: 'Default mode works (most common usage)', met: defaultBehavior?.status === 'passed' },
    { name: 'Response formatting consistent', met: passed >= tests.length * 0.8 },
    { name: 'No command crashes', met: !results.some(r => r.status === 'error') }
  ];
  
  criticalCriteria.forEach(criteria => {
    console.log(`   ${criteria.met ? '✅' : '❌'} ${criteria.name}`);
  });
  
  const overallSuccess = criticalCriteria.every(c => c.met);
  
  console.log(`\n🎉 OVERALL: ${overallSuccess ? 'SUCCESS' : 'NEEDS ATTENTION'}`);
  
  if (overallSuccess) {
    console.log('   ✅ Checkpoint command behavior validates design expectations');
    console.log('   ✅ All modes working correctly');
    console.log('   ✅ Ready for production dogfooding');
  } else {
    console.log('   ⚠️  Some checkpoint modes need attention');
    console.log('   🔧 Review failed tests for debugging');
    console.log('   📋 Consider user workflow impact');
  }
  
  return {
    success: overallSuccess,
    passed,
    failed,
    total: tests.length,
    modeResults,
    criticalCriteria
  };
}

async function runKinglyCommand(args) {
  return new Promise((resolve) => {
    const command = `CONTEXTS_PATH="./contexts" ./bin/kingly ${args.join(' ')}`;
    const child = spawn('bash', ['-c', command], { 
      stdio: 'pipe',
      timeout: 20000 
    });
    
    let output = '';
    
    child.stdout.on('data', (data) => output += data.toString());
    child.stderr.on('data', (data) => output += data.toString());
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        exitCode: code
      });
    });
    
    child.on('error', (error) => {
      resolve({
        success: false,
        output: `Command error: ${error.message}`,
        error: error
      });
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateCheckpointBehavior()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Validation crashed:', error.message);
      process.exit(1);
    });
}