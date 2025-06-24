#!/usr/bin/env node

/**
 * Simple Test Runner for Leviathan Monorepo
 * 
 * Provides test discovery and parallel execution for fast iteration.
 * Optimized for speed and simplicity over complex features.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export class TestRunner {
  constructor(options = {}) {
    this.parallel = options.parallel !== false; // Default to parallel
    this.timeout = options.timeout || 30000;
    this.verbose = options.verbose || false;
    this.results = [];
  }

  /**
   * Discover test files in a directory
   */
  async discoverTests(directory, pattern = '**/*.test.js') {
    try {
      const testFiles = await glob(pattern, { 
        cwd: directory,
        absolute: true,
        ignore: ['**/node_modules/**']
      });
      
      if (this.verbose) {
        console.log(`📁 Discovered ${testFiles.length} test files in ${directory}`);
      }
      
      return testFiles;
    } catch (error) {
      console.error(`❌ Test discovery failed in ${directory}:`, error.message);
      return [];
    }
  }

  /**
   * Run a single test file
   */
  async runTestFile(testFile, workingDir = null) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const fileName = path.basename(testFile);
      
      if (this.verbose) {
        console.log(`🧪 Running ${fileName}...`);
      }
      
      const options = {
        stdio: 'pipe',
        timeout: this.timeout
      };
      
      if (workingDir) {
        options.cwd = workingDir;
      }
      
      const child = spawn('node', [testFile], options);
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => stdout += data.toString());
      child.stderr.on('data', (data) => stderr += data.toString());
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        const result = {
          file: testFile,
          fileName: fileName,
          success: success,
          duration: duration,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        };
        
        if (this.verbose || !success) {
          console.log(`${success ? '✅' : '❌'} ${fileName} (${duration}ms)`);
          if (!success && stderr) {
            console.log(`   Error: ${stderr.substring(0, 200)}...`);
          }
        }
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          file: testFile,
          fileName: fileName,
          success: false,
          duration: duration,
          error: error.message
        });
      });
    });
  }

  /**
   * Run multiple test files with optional parallelization
   */
  async runTests(testFiles, workingDir = null) {
    console.log(`🚀 Running ${testFiles.length} test files${this.parallel ? ' in parallel' : ' sequentially'}...`);
    
    const startTime = Date.now();
    
    if (this.parallel) {
      this.results = await Promise.all(
        testFiles.map(file => this.runTestFile(file, workingDir))
      );
    } else {
      this.results = [];
      for (const file of testFiles) {
        const result = await this.runTestFile(file, workingDir);
        this.results.push(result);
      }
    }
    
    const totalDuration = Date.now() - startTime;
    
    return this.generateSummary(totalDuration);
  }

  /**
   * Generate test run summary
   */
  generateSummary(totalDuration) {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RUNNER SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏱️  Total time: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.fileName} (${r.duration}ms)`);
          if (r.stderr) {
            console.log(`     Error: ${r.stderr.substring(0, 100)}...`);
          }
        });
    }
    
    // Performance insights
    if (this.results.length > 1) {
      const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
      const slowTests = this.results.filter(r => r.duration > avgDuration * 1.5);
      
      if (slowTests.length > 0) {
        console.log('\n🐌 Slow Tests (consider optimization):');
        slowTests
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 3)
          .forEach(r => console.log(`   - ${r.fileName} (${r.duration}ms)`));
      }
    }
    
    return {
      passed,
      failed,
      total,
      totalDuration,
      success: failed === 0,
      results: this.results
    };
  }

  /**
   * Run all plugins tests
   */
  async runPluginTests(pluginsDir = '/Users/jean-patricksmith/digital/leviathan/plugins') {
    console.log('🔌 Running all plugin tests...');
    
    const pluginResults = [];
    
    try {
      // Discover plugin directories
      const pluginNamespaces = await fs.readdir(pluginsDir);
      
      for (const namespace of pluginNamespaces) {
        if (!namespace.startsWith('@')) continue;
        
        const namespacePath = path.join(pluginsDir, namespace);
        const plugins = await fs.readdir(namespacePath);
        
        for (const plugin of plugins) {
          const pluginPath = path.join(namespacePath, plugin);
          const testsPath = path.join(pluginPath, 'tests');
          
          try {
            await fs.access(testsPath);
            const testFiles = await this.discoverTests(testsPath);
            
            if (testFiles.length > 0) {
              console.log(`\n📦 Testing ${namespace}/${plugin}...`);
              const result = await this.runTests(testFiles, pluginPath);
              
              pluginResults.push({
                plugin: `${namespace}/${plugin}`,
                ...result
              });
            }
          } catch (error) {
            // No tests directory or access error - skip silently
          }
        }
      }
    } catch (error) {
      console.error('❌ Plugin test discovery failed:', error.message);
    }
    
    // Summary of all plugin tests
    const totalPassed = pluginResults.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = pluginResults.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = pluginResults.reduce((sum, r) => sum + r.total, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔌 ALL PLUGINS SUMMARY');
    console.log('='.repeat(60));
    console.log(`📦 Plugins tested: ${pluginResults.length}`);
    console.log(`✅ Total passed: ${totalPassed}/${totalTests}`);
    console.log(`❌ Total failed: ${totalFailed}/${totalTests}`);
    
    return {
      pluginResults,
      totalPassed,
      totalFailed,
      totalTests,
      success: totalFailed === 0
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner({ verbose: true });
  
  const command = process.argv[2];
  
  switch (command) {
    case 'plugins':
      runner.runPluginTests().then(result => {
        process.exit(result.success ? 0 : 1);
      });
      break;
      
    case 'discover':
      const dir = process.argv[3] || '.';
      runner.discoverTests(dir).then(files => {
        console.log('📁 Discovered test files:');
        files.forEach(file => console.log(`   - ${file}`));
      });
      break;
      
    default:
      console.log('🧪 Leviathan Test Runner');
      console.log('Usage:');
      console.log('  node test-runner.js plugins    # Run all plugin tests');
      console.log('  node test-runner.js discover [dir]  # Discover test files');
  }
}