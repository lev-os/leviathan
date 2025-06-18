#!/usr/bin/env node
/**
 * Claude Code Adapter E2E Test Suite Runner
 * Orchestrates all Claude-specific command tests
 */

import { DocCommandE2E } from './doc-command.test.js';
import { SitrepCommandE2E } from './sitrep-command.test.js';
import { ValidateCommandE2E } from './validate-command.test.js';
import { WorktreeCommandE2E } from './worktree-command.test.js';

class ClaudeAdapterE2ESuite {
  constructor() {
    this.suiteName = 'Claude Code Adapter E2E Tests';
    this.tests = [
      { name: 'Doc Command', class: DocCommandE2E },
      { name: 'Sitrep Command', class: SitrepCommandE2E },
      { name: 'Validate Command', class: ValidateCommandE2E },
      { name: 'Worktree Command', class: WorktreeCommandE2E }
    ];
    this.results = [];
  }

  async runSingleTest(testName) {
    const test = this.tests.find(t => t.name.toLowerCase().includes(testName.toLowerCase()));
    if (!test) {
      console.log(`❌ Test not found: ${testName}`);
      console.log(`Available tests: ${this.tests.map(t => t.name).join(', ')}`);
      return false;
    }

    console.log(`🎯 Running single test: ${test.name}`);
    const instance = new test.class();
    const result = await instance.runAllTests();
    return result.success;
  }

  async runAllTests() {
    console.log(`🚀 ${this.suiteName}`);
    console.log('=' .repeat(60));
    console.log('Testing Claude Code slash commands integration\n');

    let totalPassed = 0;
    let totalFailed = 0;
    let allSucceeded = true;

    for (const test of this.tests) {
      try {
        const instance = new test.class();
        const result = await instance.runAllTests();
        
        totalPassed += result.passed;
        totalFailed += result.failed;
        
        if (!result.success) {
          allSucceeded = false;
        }
        
        this.results.push({
          testName: test.name,
          ...result
        });
        
      } catch (error) {
        console.log(`💥 ${test.name} failed to run: ${error.message}`);
        totalFailed++;
        allSucceeded = false;
        
        this.results.push({
          testName: test.name,
          passed: 0,
          failed: 1,
          success: false,
          error: error.message
        });
      }
    }

    this.printSummary(totalPassed, totalFailed, allSucceeded);
    return allSucceeded;
  }

  printSummary(totalPassed, totalFailed, allSucceeded) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLAUDE ADAPTER E2E TEST SUMMARY');
    console.log('=' .repeat(60));
    
    // Individual test results
    console.log('\n📋 Test Results:');
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const counts = `(${result.passed} passed, ${result.failed} failed)`;
      console.log(`  ${status} ${result.testName} ${counts}`);
      
      if (result.error) {
        console.log(`    💥 Error: ${result.error}`);
      }
    }
    
    // Overall summary
    console.log(`\n🎯 Overall Results:`);
    console.log(`  ✅ Total Passed: ${totalPassed}`);
    console.log(`  ❌ Total Failed: ${totalFailed}`);
    console.log(`  📈 Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
    
    if (allSucceeded) {
      console.log(`\n🎉 ALL TESTS PASSED! Claude commands ready for production.`);
      console.log(`\n💡 Usage:`);
      console.log(`  /project:doc         - Documentation Shepherd mode`);
      console.log(`  /project:sitrep      - Project situation report`);
      console.log(`  /project:validate    - Anti-hallucination validation`);
    } else {
      console.log(`\n🔧 SOME TESTS FAILED. Review issues above before deployment.`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const suite = new ClaudeAdapterE2ESuite();
  
  if (args.length > 0) {
    // Run single test
    const testName = args[0];
    const success = await suite.runSingleTest(testName);
    process.exit(success ? 0 : 1);
  } else {
    // Run all tests
    const success = await suite.runAllTests();
    process.exit(success ? 0 : 1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`💥 Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

export { ClaudeAdapterE2ESuite };