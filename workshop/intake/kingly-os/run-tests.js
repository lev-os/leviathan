#!/usr/bin/env node

/**
 * Simple test runner for Kingly OS
 */

import { runBasicAssemblyTest, testContextAssemblyDetails } from './tests/basic-assembly.test.js';
import { runTranslationServiceTest } from './tests/translation-service.test.js';

async function runAllTests() {
  console.log('🚀 KINGLY OS TEST SUITE');
  console.log('='.repeat(60));
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('');
  
  const testResults = [];
  
  try {
    // Test 1: Basic Assembly
    console.log('1️⃣ Running Basic Assembly Test...');
    const basicTest = await runBasicAssemblyTest();
    testResults.push(basicTest);
    
    // Test 2: Context Assembly Details  
    console.log('\n2️⃣ Running Context Assembly Details...');
    const detailsTest = await testContextAssemblyDetails();
    testResults.push(detailsTest);
    
    // Test 3: Translation Service
    console.log('\n3️⃣ Running Translation Service Test...');
    const translationTest = await runTranslationServiceTest();
    testResults.push(translationTest);
    
  } catch (error) {
    console.error(`❌ Test suite failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🏁 FINAL TEST SUMMARY');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  
  testResults.forEach(result => {
    if (result.totalTests !== undefined) {
      totalTests += result.totalTests;
      totalSuccessful += result.successful;
      totalFailed += result.failed;
      console.log(`✅ ${result.testName}: ${result.successful}/${result.totalTests} passed`);
    } else {
      console.log(`✅ ${result.testName}: completed`);
    }
  });
  
  if (totalTests > 0) {
    console.log(`\n📊 Overall: ${totalSuccessful}/${totalTests} tests passed (${((totalSuccessful/totalTests)*100).toFixed(1)}%)`);
  }
  
  console.log(`🏁 Test suite completed at: ${new Date().toISOString()}`);
  
  if (totalFailed > 0) {
    console.log(`⚠️  ${totalFailed} tests failed - please review above`);
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});