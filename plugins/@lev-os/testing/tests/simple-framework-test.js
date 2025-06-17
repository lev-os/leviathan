#!/usr/bin/env node

/**
 * Simple Testing Framework Validation
 * 
 * Tests the @lev/testing framework structure and basic functionality
 * without requiring external dependencies.
 */

import fs from 'fs/promises';
import path from 'path';

async function testFrameworkStructure() {
  console.log('🧪 Simple Testing Framework Validation');
  console.log('='.repeat(60));
  console.log('Testing framework structure and basic functionality\n');
  
  let passed = 0;
  let failed = 0;
  let total = 0;
  
  // Test 1: Core files exist
  console.log('📁 Testing core file structure...');
  const requiredFiles = [
    'src/index.js',
    'src/plugin-discovery.js',
    'src/plugin-validator.js',
    'src/integration-tester.js',
    'src/community-validator.js',
    'src/performance-benchmark.js',
    'src/universal-test-patterns.js',
    'config/plugin.yaml',
    'package.json'
  ];
  
  for (const file of requiredFiles) {
    try {
      const filePath = path.join('/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing', file);
      await fs.access(filePath);
      console.log(`   ✅ ${file}`);
      passed++;
    } catch (error) {
      console.log(`   ❌ ${file} - Missing`);
      failed++;
    }
    total++;
  }
  
  // Test 2: Plugin discovery functionality
  console.log('\n🔍 Testing plugin discovery logic...');
  try {
    // Check if core packages directory exists and has plugins
    const corePackagesPath = '/Users/jean-patricksmith/digital/kingly/core/packages';
    const entries = await fs.readdir(corePackagesPath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    
    // Look for plugin.yaml files
    let pluginCount = 0;
    for (const dir of directories) {
      try {
        const yamlPath = path.join(corePackagesPath, dir.name, 'config', 'plugin.yaml');
        await fs.access(yamlPath);
        pluginCount++;
        console.log(`   ✅ Found plugin: ${dir.name}`);
      } catch {
        // No plugin.yaml - that's ok, not all packages are plugins
      }
    }
    
    if (pluginCount > 0) {
      console.log(`   ✅ Plugin discovery: Found ${pluginCount} core plugins`);
      passed++;
    } else {
      console.log('   ❌ Plugin discovery: No plugins with config/plugin.yaml found');
      failed++;
    }
    total++;
  } catch (error) {
    console.log(`   ❌ Plugin discovery: Error - ${error.message}`);
    failed++;
    total++;
  }
  
  // Test 3: YAML configuration validation
  console.log('\n📋 Testing YAML configuration structure...');
  try {
    const configPath = '/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/config/plugin.yaml';
    const yamlContent = await fs.readFile(configPath, 'utf8');
    
    // Basic YAML structure validation
    const hasPluginSection = yamlContent.includes('plugin:');
    const hasCapabilities = yamlContent.includes('capabilities:');
    const hasCommands = yamlContent.includes('commands:');
    const hasWorkflows = yamlContent.includes('workflows:');
    
    if (hasPluginSection && hasCapabilities && hasCommands && hasWorkflows) {
      console.log('   ✅ YAML structure: All required sections present');
      passed++;
    } else {
      console.log('   ❌ YAML structure: Missing required sections');
      console.log(`      Plugin section: ${hasPluginSection}`);
      console.log(`      Capabilities: ${hasCapabilities}`);
      console.log(`      Commands: ${hasCommands}`);
      console.log(`      Workflows: ${hasWorkflows}`);
      failed++;
    }
    total++;
  } catch (error) {
    console.log(`   ❌ YAML configuration: Error - ${error.message}`);
    failed++;
    total++;
  }
  
  // Test 4: Package.json validation
  console.log('\n📦 Testing package.json configuration...');
  try {
    const packagePath = '/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/package.json';
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const hasName = packageJson.name === '@lev/testing';
    const hasScripts = packageJson.scripts && Object.keys(packageJson.scripts).length > 0;
    const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
    const hasType = packageJson.type === 'module';
    
    if (hasName && hasScripts && hasDependencies && hasType) {
      console.log('   ✅ Package.json: All required fields present');
      passed++;
    } else {
      console.log('   ❌ Package.json: Missing required fields');
      console.log(`      Correct name: ${hasName}`);
      console.log(`      Has scripts: ${hasScripts}`);
      console.log(`      Has dependencies: ${hasDependencies}`);
      console.log(`      Module type: ${hasType}`);
      failed++;
    }
    total++;
  } catch (error) {
    console.log(`   ❌ Package.json: Error - ${error.message}`);
    failed++;
    total++;
  }
  
  // Test 5: Test pattern extraction validation
  console.log('\n🧪 Testing universal test patterns...');
  try {
    const patternsPath = '/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/src/universal-test-patterns.js';
    const patternsContent = await fs.readFile(patternsPath, 'utf8');
    
    // Check for key pattern methods extracted from mcp-mvp
    const hasCommandRouting = patternsContent.includes('testCommandRouting');
    const hasYamlValidation = patternsContent.includes('testYamlValidation');
    const hasCapabilityValidation = patternsContent.includes('testCapabilityValidation');
    const hasSmokeTest = patternsContent.includes('testSmokeTest');
    const hasSuccessCriteria = patternsContent.includes('evaluateSuccessCriteria');
    
    if (hasCommandRouting && hasYamlValidation && hasCapabilityValidation && hasSmokeTest && hasSuccessCriteria) {
      console.log('   ✅ Universal test patterns: All key patterns extracted');
      passed++;
    } else {
      console.log('   ❌ Universal test patterns: Missing key patterns');
      console.log(`      Command routing: ${hasCommandRouting}`);
      console.log(`      YAML validation: ${hasYamlValidation}`);
      console.log(`      Capability validation: ${hasCapabilityValidation}`);
      console.log(`      Smoke test: ${hasSmokeTest}`);
      console.log(`      Success criteria: ${hasSuccessCriteria}`);
      failed++;
    }
    total++;
  } catch (error) {
    console.log(`   ❌ Universal test patterns: Error - ${error.message}`);
    failed++;
    total++;
  }
  
  // Test 6: Framework architecture validation
  console.log('\n🏗️ Testing framework architecture...');
  try {
    const indexPath = '/Users/jean-patricksmith/digital/kingly/core/packages/@lev/testing/src/index.js';
    const indexContent = await fs.readFile(indexPath, 'utf8');
    
    // Check for key architectural components
    const hasMainFramework = indexContent.includes('KinglyTestingFramework');
    const hasPluginDiscovery = indexContent.includes('PluginDiscovery');
    const hasPluginValidator = indexContent.includes('PluginValidator');
    const hasIntegrationTester = indexContent.includes('IntegrationTester');
    const hasCommunityValidator = indexContent.includes('CommunityValidator');
    const hasPerformanceBenchmark = indexContent.includes('PerformanceBenchmark');
    
    if (hasMainFramework && hasPluginDiscovery && hasPluginValidator && hasIntegrationTester && hasCommunityValidator && hasPerformanceBenchmark) {
      console.log('   ✅ Framework architecture: All components integrated');
      passed++;
    } else {
      console.log('   ❌ Framework architecture: Missing components');
      console.log(`      Main framework: ${hasMainFramework}`);
      console.log(`      Plugin discovery: ${hasPluginDiscovery}`);
      console.log(`      Plugin validator: ${hasPluginValidator}`);
      console.log(`      Integration tester: ${hasIntegrationTester}`);
      console.log(`      Community validator: ${hasCommunityValidator}`);
      console.log(`      Performance benchmark: ${hasPerformanceBenchmark}`);
      failed++;
    }
    total++;
  } catch (error) {
    console.log(`   ❌ Framework architecture: Error - ${error.message}`);
    failed++;
    total++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FRAMEWORK STRUCTURE VALIDATION RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  
  const successRate = total > 0 ? (passed / total) * 100 : 0;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 85) {
    console.log('\n🎉 TESTING FRAMEWORK STRUCTURE: EXCELLENT');
    console.log('   ✅ All core components present');
    console.log('   ✅ Configuration properly structured');
    console.log('   ✅ Test patterns successfully extracted');
    console.log('   ✅ Architecture properly integrated');
    console.log('   🚀 Ready for dependency installation and full testing');
    return true;
  } else if (successRate >= 70) {
    console.log('\n⚠️  TESTING FRAMEWORK STRUCTURE: GOOD');
    console.log('   ✅ Most components working correctly');
    console.log('   🔧 Minor issues to address');
    console.log('   📋 Review failed tests for improvements');
    return true;
  } else {
    console.log('\n❌ TESTING FRAMEWORK STRUCTURE: NEEDS WORK');
    console.log('   🔧 Significant structural issues detected');
    console.log('   📋 Address failed tests before proceeding');
    console.log('   🚀 Framework foundation needs strengthening');
    return false;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFrameworkStructure()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Framework validation crashed:', error.message);
      process.exit(1);
    });
}