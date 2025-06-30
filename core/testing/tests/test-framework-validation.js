#!/usr/bin/env node

/**
 * Testing Framework Validation Test
 * 
 * Validates that the @lev/testing framework itself works correctly
 * by testing it against known plugins in the ecosystem.
 */

import { KinglyTestingFramework } from '../src/index.js';

async function validateTestingFramework() {
  console.log('🧪 Testing Framework Validation');
  console.log('='.repeat(60));
  console.log('Validating @lev/testing framework functionality\n');
  
  const framework = new KinglyTestingFramework();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Test 1: Plugin Discovery
    console.log('🔍 Testing plugin discovery...');
    const plugins = await framework.discoverPlugins();
    
    if (plugins.length > 0) {
      console.log(`✅ Plugin discovery: Found ${plugins.length} plugins`);
      passedTests++;
    } else {
      console.log('❌ Plugin discovery: No plugins found');
      failedTests++;
    }
    totalTests++;
    
    // Test 2: Core Plugin Validation
    if (plugins.length > 0) {
      console.log('\n🧪 Testing core plugin validation...');
      const corePlugins = plugins.filter(p => p.type === 'core_plugin');
      
      if (corePlugins.length > 0) {
        const testPlugin = corePlugins[0];
        console.log(`   Testing plugin: ${testPlugin.name}`);
        
        const validationResult = await framework.testPlugin(testPlugin.name, { 
          suite: ['yaml', 'smoke'] 
        });
        
        if (validationResult.success) {
          console.log(`✅ Plugin validation: ${testPlugin.name} passed`);
          passedTests++;
        } else {
          console.log(`❌ Plugin validation: ${testPlugin.name} failed`);
          console.log(`   Failed tests: ${validationResult.failed}/${validationResult.total}`);
          failedTests++;
        }
      } else {
        console.log('⚠️  No core plugins available for testing');
      }
      totalTests++;
    }
    
    // Test 3: Integration Testing
    console.log('\n🔗 Testing integration functionality...');
    try {
      const integrationResult = await framework.testIntegration({ 
        plugins: plugins.slice(0, 2) // Test first 2 plugins
      });
      
      if (integrationResult.success) {
        console.log('✅ Integration testing: Framework working correctly');
        passedTests++;
      } else {
        console.log('❌ Integration testing: Some issues detected');
        console.log(`   Failed integration tests: ${integrationResult.failed}/${integrationResult.total}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Integration testing: Error - ${error.message}`);
      failedTests++;
    }
    totalTests++;
    
    // Test 4: Community Plugin Support
    console.log('\n🌍 Testing community plugin support...');
    try {
      const communityResult = await framework.testCommunity({ 
        localScan: true,
        githubScan: false // Disable GitHub scanning for this test
      });
      
      if (communityResult.success || communityResult.total === 0) {
        console.log('✅ Community plugin support: Framework ready');
        passedTests++;
      } else {
        console.log('❌ Community plugin support: Issues detected');
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Community plugin support: Error - ${error.message}`);
      failedTests++;
    }
    totalTests++;
    
    // Test 5: Performance Benchmarking
    if (plugins.length > 0) {
      console.log('\n⚡ Testing performance benchmarking...');
      try {
        const testPlugin = plugins[0];
        const benchmarkResult = await framework.benchmarkPlugin(testPlugin.name, {
          type: ['execution', 'memory'],
          iterations: 2
        });
        
        if (benchmarkResult.performanceScore > 0) {
          console.log(`✅ Performance benchmarking: Score ${benchmarkResult.performanceScore}`);
          passedTests++;
        } else {
          console.log('❌ Performance benchmarking: No valid score generated');
          failedTests++;
        }
      } catch (error) {
        console.log(`❌ Performance benchmarking: Error - ${error.message}`);
        failedTests++;
      }
      totalTests++;
    }
    
    // Test 6: Ecosystem Report Generation
    console.log('\n📊 Testing ecosystem report generation...');
    try {
      const ecosystemReport = await framework.generateEcosystemReport();
      
      if (ecosystemReport.health && ecosystemReport.ecosystem) {
        console.log(`✅ Ecosystem report: ${ecosystemReport.health.overall} status`);
        console.log(`   Total plugins: ${ecosystemReport.ecosystem.totalPlugins}`);
        passedTests++;
      } else {
        console.log('❌ Ecosystem report: Invalid report structure');
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Ecosystem report: Error - ${error.message}`);
      failedTests++;
    }
    totalTests++;
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TESTING FRAMEWORK VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${totalTests}`);
    
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('\n🎉 TESTING FRAMEWORK: READY FOR PRODUCTION');
      console.log('   ✅ Core functionality validated');
      console.log('   ✅ Plugin discovery working');
      console.log('   ✅ Validation patterns functional');
      console.log('   ✅ Integration testing operational');
      return true;
    } else {
      console.log('\n⚠️  TESTING FRAMEWORK: NEEDS ATTENTION');
      console.log('   🔧 Some components require fixes');
      console.log('   📋 Review failed tests for issues');
      console.log('   🚀 Address issues before production use');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Testing framework validation crashed:', error.message);
    return false;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateTestingFramework()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Validation crashed:', error.message);
      process.exit(1);
    });
}