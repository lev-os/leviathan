#!/usr/bin/env node

/**
 * Comprehensive Testing Framework Validation
 * 
 * Complete end-to-end validation of the @lev/testing framework
 * demonstrating all capabilities against real core plugins.
 */

async function runComprehensiveValidation() {
  console.log('🚀 COMPREHENSIVE TESTING FRAMEWORK VALIDATION');
  console.log('='.repeat(80));
  console.log('End-to-end validation of @lev/testing framework\n');
  
  const testResults = {
    framework_structure: null,
    plugin_discovery: null,
    command_routing: null,
    overall_success: false
  };
  
  try {
    // Test 1: Framework Structure Validation
    console.log('📋 PHASE 1: Framework Structure Validation');
    console.log('-'.repeat(50));
    
    const { spawn } = await import('child_process');
    
    const structureResult = await runTest('/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/tests/simple-framework-test.js');
    testResults.framework_structure = structureResult;
    
    if (structureResult.success) {
      console.log('✅ Framework structure validation: PASSED\n');
    } else {
      console.log('❌ Framework structure validation: FAILED\n');
    }
    
    // Test 2: Plugin Discovery Validation
    console.log('📋 PHASE 2: Plugin Discovery Validation');
    console.log('-'.repeat(50));
    
    const discoveryResult = await runTest('/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/tests/plugin-discovery-test.js');
    testResults.plugin_discovery = discoveryResult;
    
    if (discoveryResult.success) {
      console.log('✅ Plugin discovery validation: PASSED\n');
    } else {
      console.log('❌ Plugin discovery validation: FAILED\n');
    }
    
    // Test 3: Command Routing Validation
    console.log('📋 PHASE 3: Command Routing Validation');
    console.log('-'.repeat(50));
    
    const routingResult = await runTest('/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/tests/command-routing-test.js');
    testResults.command_routing = routingResult;
    
    if (routingResult.success) {
      console.log('✅ Command routing validation: PASSED\n');
    } else {
      console.log('❌ Command routing validation: FAILED\n');
    }
    
    // Overall Assessment
    console.log('='.repeat(80));
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('='.repeat(80));
    
    const allPassed = testResults.framework_structure.success && 
                     testResults.plugin_discovery.success && 
                     testResults.command_routing.success;
    
    console.log(`\n🏗️  Framework Structure: ${testResults.framework_structure.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔍 Plugin Discovery: ${testResults.plugin_discovery.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔧 Command Routing: ${testResults.command_routing.success ? '✅ PASSED' : '❌ FAILED'}`);
    
    testResults.overall_success = allPassed;
    
    if (allPassed) {
      console.log('\n🎉 COMPREHENSIVE VALIDATION: SUCCESS');
      console.log('   ✅ All testing framework components validated');
      console.log('   ✅ Plugin discovery and analysis working');
      console.log('   ✅ Command routing integration functional');
      console.log('   ✅ Universal test patterns successfully applied');
      console.log('   ✅ Framework ready for production use');
      
      console.log('\n🚀 TESTING FRAMEWORK CAPABILITIES DEMONSTRATED:');
      console.log('   📦 Plugin Discovery - Finds and analyzes core plugins');
      console.log('   🧪 YAML Validation - Validates plugin configurations');
      console.log('   🔧 Command Testing - Tests plugin command routing');
      console.log('   🔍 Structure Analysis - Validates plugin architecture');
      console.log('   ⚡ Performance Ready - Framework for benchmarking');
      console.log('   🌍 Community Ready - Support for community plugins');
      
      console.log('\n📋 NEXT STEPS FOR PRODUCTION:');
      console.log('   1. Install @lev/debug dependencies for full logging');
      console.log('   2. Add framework to core monorepo package.json');
      console.log('   3. Create CI/CD integration scripts');
      console.log('   4. Add performance benchmarking baselines');
      console.log('   5. Enable community plugin validation');
      
    } else {
      console.log('\n⚠️  COMPREHENSIVE VALIDATION: NEEDS ATTENTION');
      console.log('   🔧 Some framework components need fixes');
      console.log('   📋 Address failed validations before production');
      console.log('   🚀 Review individual test results for details');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('💥 Comprehensive validation crashed:', error.message);
    testResults.overall_success = false;
    return testResults;
  }
}

// Helper function to run individual tests
async function runTest(testPath) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      timeout: 30000
    });
    
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

// Run comprehensive validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveValidation()
    .then((results) => {
      process.exit(results.overall_success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Comprehensive validation crashed:', error.message);
      process.exit(1);
    });
}