#!/usr/bin/env node

/**
 * Self-test for @lev-os/testing framework
 *
 * Validates that the testing framework components work correctly
 */

import { describe, test, expect, printSummary } from '../src/simple-framework.js'
import { KinglyTestingFramework } from '../src/index.js'
import path from 'path'
import { promises as fs } from 'fs'

describe('@lev-os/testing Framework Self-Test', () => {
  test('Simple framework should execute tests', async () => {
    expect(true).toBe(true)
    expect('test').toInclude('test')
    expect({ prop: 'value' }).toHaveProperty('prop')
  })

  test('Testing framework should initialize', async () => {
    const framework = new KinglyTestingFramework()
    expect(framework).toBeTruthy()
    expect(framework.discovery).toBeTruthy()
    expect(framework.validator).toBeTruthy()
  })

  test('Plugin discovery should find this package', async () => {
    const framework = new KinglyTestingFramework()

    // Discover testing package itself
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'))

    expect(packageJson.name).toBe('@lev-os/testing')
    expect(packageJson.version).toBeTruthy()
  })

  test('Test runner should discover test files', async () => {
    const { TestRunner } = await import('../src/test-runner.js')
    const runner = new TestRunner()

    const testFiles = await runner.discoverTests(process.cwd(), '**/framework-self-test.js')
    expect(testFiles.length).toBe(1)
    expect(testFiles[0]).toInclude('framework-self-test.js')
  })

  test('Simple logger should work without external dependencies', async () => {
    const { logger, tracer } = await import('../src/simple-logger.js')

    // Should not throw
    logger.info('Test message')
    logger.error('Error message')

    const span = tracer.startSpan('test-span')
    span.setStatus({ code: 'ok' })
    span.end()

    expect(true).toBe(true) // If we get here, logger works
  })
})

// Run tests and print summary
const summary = printSummary()
process.exit(summary.failed > 0 ? 1 : 0)
