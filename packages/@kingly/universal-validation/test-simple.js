#!/usr/bin/env node

/**
 * Simple Core Package Structure Test
 * Tests the package structure and configuration without dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function testPackageStructure() {
  console.log('🧪 Testing @kingly/universal-validation core package structure...\n');

  const tests = [
    {
      name: 'Package.json exists and has correct format',
      test: () => {
        const packagePath = path.join(__dirname, 'package.json');
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check core package requirements
        const requiredFields = ['name', 'version', 'type', 'main', 'exports', 'dependencies'];
        for (const field of requiredFields) {
          if (!packageData[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        // Check for @kingly/debug dependency
        if (!packageData.dependencies['@kingly/debug']) {
          throw new Error('Missing @kingly/debug dependency');
        }
        
        // Check exports structure
        const expectedExports = ['.', './mathematical', './expert-consensus', './opposition', './parliament', './visualization', './breakthrough'];
        for (const exportPath of expectedExports) {
          if (!packageData.exports[exportPath]) {
            throw new Error(`Missing export: ${exportPath}`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'Core plugin YAML configuration exists',
      test: () => {
        const yamlPath = path.join(__dirname, 'config', 'plugin.yaml');
        if (!fs.existsSync(yamlPath)) {
          throw new Error('plugin.yaml not found in config directory');
        }
        
        const yamlContent = fs.readFileSync(yamlPath, 'utf8');
        
        // Check for required YAML sections
        const requiredSections = ['plugin:', 'capabilities:', 'commands:', 'workflows:', 'reasoning_patterns:'];
        for (const section of requiredSections) {
          if (!yamlContent.includes(section)) {
            throw new Error(`Missing YAML section: ${section}`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'All validator source files exist',
      test: () => {
        const srcPath = path.join(__dirname, 'src');
        const requiredFiles = [
          'index.js',
          'mathematical-validator.js',
          'expert-consensus-validator.js',
          'opposition-validator.js',
          'parliament-validator.js',
          'visualization-validator.js',
          'breakthrough-bubbler.js'
        ];
        
        for (const file of requiredFiles) {
          const filePath = path.join(srcPath, file);
          if (!fs.existsSync(filePath)) {
            throw new Error(`Missing source file: ${file}`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'Source files contain @kingly/debug imports',
      test: () => {
        const srcPath = path.join(__dirname, 'src');
        const sourceFiles = fs.readdirSync(srcPath).filter(file => file.endsWith('.js'));
        
        for (const file of sourceFiles) {
          const filePath = path.join(srcPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          if (!content.includes("from '@kingly/debug'")) {
            throw new Error(`File ${file} missing @kingly/debug import`);
          }
          
          // Check for debug usage
          const hasLogger = content.includes('logger.');
          const hasTracer = content.includes('tracer.');
          const hasMonitor = content.includes('monitor.');
          
          if (!hasLogger && !hasTracer && !hasMonitor) {
            throw new Error(`File ${file} imports @kingly/debug but doesn't use it`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'Directory structure follows core package standards',
      test: () => {
        const requiredDirs = ['src', 'config', 'contexts', 'workflows', 'docs'];
        for (const dir of requiredDirs) {
          const dirPath = path.join(__dirname, dir);
          if (!fs.existsSync(dirPath)) {
            throw new Error(`Missing required directory: ${dir}`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'README.md contains core package documentation',
      test: () => {
        const readmePath = path.join(__dirname, 'README.md');
        if (!fs.existsSync(readmePath)) {
          throw new Error('README.md not found');
        }
        
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Check for essential sections
        const requiredSections = [
          '# @kingly/universal-validation',
          '## 🚀 Quick Start',
          '## 📦 Core Validation Frameworks',
          '## 🔧 Integration with @kingly/debug'
        ];
        
        for (const section of requiredSections) {
          if (!readmeContent.includes(section)) {
            throw new Error(`README missing section: ${section}`);
          }
        }
        
        return true;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test.test();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n🎉 All core package structure tests passed!');
    console.log('📦 Package is properly structured as a Kingly core package');
    console.log('🔧 @kingly/debug integration is properly implemented');
    console.log('📋 YAML configuration follows core plugin standards');
    console.log('🚀 Ready for integration with Kingly core ecosystem');
    return true;
  } else {
    console.log('\n💥 Some tests failed. Please fix the issues above.');
    return false;
  }
}

// Run the test
try {
  const success = testPackageStructure();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
}