/**
 * Simple Testing Framework for Leviathan
 * 
 * Lightweight testing framework focused on real-world usage validation.
 * Combines dogfooding test patterns with CLI command execution utilities.
 * Optimized for fast iteration and real workflow testing.
 */

import { spawn } from 'child_process';

let currentSuite = null;
let testResults = [];

/**
 * Test suite grouping
 */
export function describe(suiteName, testFunction) {
  currentSuite = suiteName;
  console.log(`\n📋 ${suiteName}`);
  console.log('='.repeat(50));
  
  testFunction();
  
  currentSuite = null;
}

/**
 * Individual test execution with timing
 */
export function test(testName, testFunction) {
  return new Promise(async (resolve) => {
    const startTime = Date.now();
    
    try {
      console.log(`\n🧪 ${testName}...`);
      
      await testFunction();
      
      const duration = Date.now() - startTime;
      console.log(`✅ PASSED (${duration}ms)`);
      
      testResults.push({
        suite: currentSuite,
        name: testName,
        status: 'passed',
        duration
      });
      
      resolve();
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ FAILED (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Test: ${testName}`);
      
      testResults.push({
        suite: currentSuite,
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      });
      
      resolve();
    }
  });
}

/**
 * Assertion utilities
 */
export const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, got ${actual}`);
    }
  },
  
  toInclude: (substring) => {
    if (typeof actual !== 'string' || !actual.includes(substring)) {
      throw new Error(`Expected "${actual}" to include "${substring}"`);
    }
  },
  
  toContain: (substring) => {
    if (typeof actual !== 'string' || !actual.includes(substring)) {
      throw new Error(`Expected "${actual}" to contain "${substring}"`);
    }
  },
  
  toMatch: (pattern) => {
    if (!pattern.test(actual)) {
      throw new Error(`Expected "${actual}" to match pattern ${pattern}`);
    }
  },

  toHaveProperty: (prop) => {
    if (!actual || typeof actual !== 'object' || !(prop in actual)) {
      throw new Error(`Expected object to have property "${prop}"`);
    }
  }
});

/**
 * Execute Leviathan CLI commands for real workflow testing
 */
export async function runLevCommand(args, options = {}) {
  return new Promise((resolve) => {
    const timeout = options.timeout || 30000;
    const contextsPath = options.contextsPath || './contexts';
    const command = `CONTEXTS_PATH="${contextsPath}" ./bin/lev ${args.join(' ')}`;
    
    const child = spawn('bash', ['-c', command], { 
      stdio: 'pipe',
      timeout: timeout
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());
    
    child.on('close', (code) => {
      const output = (stdout + stderr).trim();
      
      // Debug for failing tests
      if (code !== 0 && options.debug) {
        console.log(`[DEBUG] Command failed: ${command}`);
        console.log(`[DEBUG] Exit code: ${code}`);
        console.log(`[DEBUG] Stdout: ${stdout}`);
        console.log(`[DEBUG] Stderr: ${stderr}`);
      }
      
      resolve({
        success: code === 0,
        output: output,
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
    
    child.on('error', (error) => {
      if (options.debug) {
        console.log(`[DEBUG] Process error: ${error.message}`);
      }
      resolve({
        success: false,
        output: `Command error: ${error.message}`,
        error: error
      });
    });
  });
}

/**
 * Alias for backward compatibility
 */
export const runKinglyCommand = runLevCommand;

/**
 * Get test results
 */
export function getTestResults() {
  return testResults;
}

/**
 * Print test summary
 */
export function printSummary() {
  const passed = testResults.filter(t => t.status === 'passed').length;
  const failed = testResults.filter(t => t.status === 'failed').length;
  const total = testResults.length;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`   - ${t.suite}: ${t.name}`));
  }
  
  const totalTime = testResults.reduce((sum, t) => sum + t.duration, 0);
  console.log(`\n⏱️  Total time: ${totalTime}ms`);
  
  return { passed, failed, total };
}

/**
 * Clear test results (useful for multiple test runs)
 */
export function clearResults() {
  testResults = [];
  currentSuite = null;
}

/**
 * Run multiple test suites in parallel
 */
export async function runTestSuites(suites, options = {}) {
  const startTime = Date.now();
  
  console.log(`🚀 Running ${suites.length} test suites...`);
  
  if (options.parallel) {
    await Promise.all(suites.map(suite => suite()));
  } else {
    for (const suite of suites) {
      await suite();
    }
  }
  
  const duration = Date.now() - startTime;
  const summary = printSummary();
  
  console.log(`\n🏁 Total execution time: ${duration}ms`);
  
  return {
    ...summary,
    totalDuration: duration,
    success: summary.failed === 0
  };
}