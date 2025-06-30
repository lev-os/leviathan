#!/usr/bin/env node

/**
 * @lev-os/testing - Test Entry Point
 *
 * Runs self-tests for the testing framework
 */

import { TestRunner } from './test-runner.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runTests() {
  console.log('🧪 Running @lev-os/testing self-tests...\n')

  const runner = new TestRunner({
    verbose: true,
    parallel: true,
  })

  // Run tests in the tests directory
  const testsDir = path.join(__dirname, '..', 'tests')
  const testFiles = await runner.discoverTests(testsDir)

  if (testFiles.length === 0) {
    console.log('⚠️  No test files found in tests directory')
    return
  }

  const results = await runner.runTests(testFiles)

  // Exit with appropriate code
  process.exit(results.success ? 0 : 1)
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test runner crashed:', error)
  process.exit(1)
})
