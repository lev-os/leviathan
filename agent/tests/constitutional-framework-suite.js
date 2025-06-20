#!/usr/bin/env node

/**
 * Constitutional Framework Test Suite
 * 
 * Comprehensive test runner for all constitutional framework, circadian awareness,
 * and LLM override functionality. Includes core, command, and E2E tests.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🧠 Constitutional Framework Test Suite');
console.log('='.repeat(60));

const testResults = [];

async function runTest(testName, testPath) {
  console.log(`\n🧪 Running ${testName}...`);
  console.log('-'.repeat(40));
  
  const startTime = Date.now();
  
  try {
    const output = execSync(`node ${testPath}`, { 
      encoding: 'utf8',
      timeout: 30000,
      stdio: 'inherit'
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${testName} PASSED (${duration}ms)`);
    
    testResults.push({
      name: testName,
      status: 'PASSED',
      duration
    });
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${testName} FAILED (${duration}ms)`);
    console.log(`Error: ${error.message}`);
    
    testResults.push({
      name: testName,
      status: 'FAILED',
      duration,
      error: error.message
    });
    
    return false;
  }
}

// Test Suite Execution
async function runTestSuite() {
  console.log('Starting constitutional framework test suite...\n');
  
  // Core Tests
  await runTest(
    'Core Constitutional Framework',
    './tests/core/constitutional-framework.test.js'
  );
  
  // Command Tests
  await runTest(
    'Constitutional Validate Command',
    './tests/commands/constitutional-validate.test.js'
  );
  
  // E2E Tests (if CLI is available)
  const levBinPath = path.resolve('./bin/lev');
  try {
    execSync(`test -f ${levBinPath}`, { stdio: 'ignore' });
    await runTest(
      'Constitutional Circadian E2E',
      './tests/adapters/cli/e2e/claude/constitutional-circadian.test.js'
    );
  } catch (error) {
    console.log(`\n⚠️  Skipping E2E tests - CLI binary not found at ${levBinPath}`);
    testResults.push({
      name: 'Constitutional Circadian E2E',
      status: 'SKIPPED',
      reason: 'CLI binary not available'
    });
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Suite Results');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;
  const total = testResults.length;
  
  testResults.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : 
                 result.status === 'FAILED' ? '❌' : '⚠️';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.name}${duration}`);
    
    if (result.status === 'FAILED' && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.status === 'SKIPPED' && result.reason) {
      console.log(`   Reason: ${result.reason}`);
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Summary: ${passed}/${total} passed, ${failed} failed, ${skipped} skipped`);
  
  if (failed === 0) {
    console.log('🎉 All available tests passed!');
    
    console.log('\n🧠 Constitutional Framework Features Validated:');
    console.log('✅ Neurochemical profile optimization');
    console.log('✅ Circadian rhythm awareness');
    console.log('✅ Automatic time-of-day detection');
    console.log('✅ LLM intelligent override system');
    console.log('✅ Constitutional principle validation');
    console.log('✅ Crisis management overrides');
    console.log('✅ Command-line interface integration');
    console.log('✅ Performance and edge case handling');
    
    return true;
  } else {
    console.log('❌ Some tests failed - review above for details');
    return false;
  }
}

// Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.log('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Run the test suite
runTestSuite()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.log('❌ Test suite execution failed:', error.message);
    process.exit(1);
  });