#!/usr/bin/env node

/**
 * Dogfooding Test Runner
 * 
 * Runs the test suites that validate daily usage workflows.
 * Prioritizes speed and practical validation over comprehensive coverage.
 */

import { spawn } from 'child_process';
import { printSummary } from './dogfooding/test-framework.js';

async function runDogfoodingTests() {
  console.log('🐕 Kingly Dogfooding Test Suite');
  console.log('========================================');
  console.log('Testing functionality you use daily\n');
  
  const testSuites = [
    {
      name: 'Smoke Tests',
      file: 'tests/smoke/command-routing.test.js',
      priority: 'critical',
      description: 'Basic command functionality'
    },
    {
      name: 'Component Tests', 
      file: 'tests/components/session-manager.test.js',
      priority: 'high',
      description: 'Core infrastructure stability'
    },
    {
      name: 'Checkpoint Workflows',
      file: 'tests/dogfooding/checkpoint-workflows.test.js', 
      priority: 'critical',
      description: 'Daily checkpoint usage patterns'
    }
  ];
  
  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const suite of testSuites) {
    console.log(`\n🎯 Running: ${suite.name} (${suite.priority})`);
    console.log(`📋 ${suite.description}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await runTestFile(suite.file);
      results.push({ ...suite, ...result });
      
      if (result.success) {
        console.log(`✅ ${suite.name} - COMPLETED`);
        totalPassed += result.passed || 1;
      } else {
        console.log(`❌ ${suite.name} - FAILED`);
        totalFailed += result.failed || 1;
      }
    } catch (error) {
      console.log(`💥 ${suite.name} - ERROR: ${error.message}`);
      results.push({ ...suite, success: false, error: error.message });
      totalFailed += 1;
    }
  }
  
  // Overall summary
  console.log('\n' + '='.repeat(60));
  console.log('🐕 DOGFOODING TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📊 Total: ${totalPassed + totalFailed}`);
  
  // Results by priority
  const critical = results.filter(r => r.priority === 'critical');
  const criticalPassed = critical.filter(r => r.success).length;
  
  console.log(`\n🚨 Critical Tests: ${criticalPassed}/${critical.length} passed`);
  
  if (criticalPassed < critical.length) {
    console.log('⚠️  CRITICAL FUNCTIONALITY BROKEN - Daily work may be impacted');
    
    critical.filter(r => !r.success).forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.error || 'Tests failed'}`);
    });
  } else {
    console.log('🎉 All critical functionality working - Safe for daily use');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (totalFailed === 0) {
    console.log('   ✅ System is stable for dogfooding');
    console.log('   🚀 Safe to continue development');
  } else if (criticalPassed === critical.length) {
    console.log('   ⚠️  Some non-critical tests failed');
    console.log('   ✅ Daily workflows should still work');
    console.log('   🔧 Fix failing tests when convenient');
  } else {
    console.log('   🚨 Critical functionality broken');
    console.log('   ⛔ Fix critical issues before using for real work');
    console.log('   🔧 Run individual test suites to debug');
  }
  
  // Quick commands for debugging
  console.log('\n🛠️  Debug Commands:');
  console.log('   npm run test:smoke     # Test basic command functionality');
  console.log('   npm run test:components # Test core infrastructure');
  console.log('   npm run test:checkpoint # Test checkpoint workflows');
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    criticalPassed: criticalPassed === critical.length
  };
}

async function runTestFile(filename) {
  return new Promise((resolve) => {
    console.log(`   Running: ${filename}`);
    
    const child = spawn('node', [filename], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      resolve({ 
        success: code === 0,
        exitCode: code
      });
    });
    
    child.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDogfoodingTests()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error.message);
      process.exit(1);
    });
}