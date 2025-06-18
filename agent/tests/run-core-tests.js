#!/usr/bin/env node

/**
 * Core SDK Test Runner
 * 
 * Runs all core SDK unit tests in sequence.
 * These tests validate pure business logic with no external dependencies.
 */

import { runTests as runAgentTests } from './core/agents/agent-manager.test.js';
import { runTests as runCheckpointTests } from './core/sessions/checkpoint-core.test.js';
import { runTests as runContextSearchTests } from './core/discovery/context-search.test.js';

async function runAllCoreTests() {
  console.log('🧪 Leviathan Core SDK Test Suite');
  console.log('='.repeat(60));
  console.log('Testing pure business logic with no external dependencies\\n');
  
  const results = [];
  
  // Run agent manager tests
  console.log('📋 Agent Management Tests');
  console.log('-'.repeat(30));
  const agentResults = await runAgentTests();
  results.push({ suite: 'Agent Manager', success: agentResults });
  console.log('');
  
  // Run checkpoint tests
  console.log('📋 Checkpoint Core Tests');
  console.log('-'.repeat(30));
  const checkpointResults = await runCheckpointTests();
  results.push({ suite: 'Checkpoint Core', success: checkpointResults });
  console.log('');
  
  // Run context search tests
  console.log('📋 Context Search Tests');
  console.log('-'.repeat(30));
  const contextResults = await runContextSearchTests();
  results.push({ suite: 'Context Search', success: contextResults });
  console.log('');
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 CORE SDK TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passedSuites = results.filter(r => r.success).length;
  const totalSuites = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.suite}`);
  });
  
  console.log('');
  console.log(`🎯 Overall: ${passedSuites}/${totalSuites} test suites passed`);
  
  if (passedSuites === totalSuites) {
    console.log('🎉 All core SDK tests passed!');
    console.log('💡 Core business logic is working correctly');
  } else {
    console.log('⚠️  Some core SDK tests failed');
    console.log('💡 Fix core business logic before testing adapters');
  }
  
  return passedSuites === totalSuites;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllCoreTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Core test runner error:', error);
    process.exit(1);
  });
}