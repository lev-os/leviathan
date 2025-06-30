#!/usr/bin/env node

/**
 * Workshop Plugin Integration Tests
 *
 * Tests workshop plugin through real CLI integration, following Leviathan testing philosophy:
 * - Fast iteration → lock down when working
 * - E2E/integration tests over unit coverage
 * - Real workflow validation using actual ./bin/lev
 * - No mocking - test actual CLI adapter integration
 */

import { describe, test, expect, printSummary } from '../../testing/src/simple-framework.js'
import { spawn } from 'child_process'

// Custom runLevCommand for workshop plugin tests
async function runLevCommand(args, options = {}) {
  return new Promise((resolve) => {
    const timeout = options.timeout || 30000
    const agentDir = '/Users/jean-patricksmith/digital/leviathan/agent'
    const contextsPath = options.contextsPath || `${agentDir}/contexts`
    const command = `CONTEXTS_PATH="${contextsPath}" ${agentDir}/bin/lev ${args.join(' ')}`

    const child = spawn('bash', ['-c', command], {
      stdio: 'pipe',
      timeout: timeout,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => (stdout += data.toString()))
    child.stderr.on('data', (data) => (stderr += data.toString()))

    child.on('close', (code) => {
      const output = (stdout + stderr).trim()

      resolve({
        success: code === 0,
        code: code,
        output: output,
        stdout: stdout,
        stderr: stderr,
      })
    })

    setTimeout(() => {
      child.kill()
      resolve({
        success: false,
        code: -1,
        output: 'Command timed out',
        stdout: '',
        stderr: 'Command timed out',
      })
    }, timeout)
  })
}

describe('Workshop Plugin CLI Integration', () => {
  test('should show workshop status overview', async () => {
    // Given: User wants system overview
    // When: Running workshop status
    const result = await runLevCommand(['workshop', 'status'])

    // Then: Should get comprehensive status
    expect(result.success).toBe(true)
    expect(result.output).toContain('WORKSHOP STATUS')
    expect(result.output).toContain('OVERVIEW')
    expect(result.output).toContain('Total Tools:')
    expect(result.output).toContain('Total Plugins:')
  })

  test('should support JSON output for LLM consumption', async () => {
    // Given: LLM needs structured data
    // When: Running workshop status with JSON flag
    const result = await runLevCommand(['workshop', 'status', '--json'])

    // Then: Should return valid JSON
    expect(result.success).toBe(true)

    // Parse and validate JSON structure
    let jsonData
    try {
      jsonData = JSON.parse(result.output)
    } catch (error) {
      throw new Error(`Invalid JSON output: ${error.message}`)
    }

    expect(jsonData.success).toBe(true)
    expect(jsonData.data).toBeTruthy()
    expect(jsonData.data.overview).toBeTruthy()
    expect(jsonData.data.overview.total_tools).toBeTruthy()
  })

  test('should list tools with tier information', async () => {
    // Given: User wants to see available tools
    // When: Running workshop list
    const result = await runLevCommand(['workshop', 'list'])

    // Then: Should show organized tool list
    expect(result.success).toBe(true)
    expect(result.output).toContain('WORKSHOP ITEMS')
    expect(result.output).toContain('TIER')
  })

  test('should filter tools by tier', async () => {
    // Given: User wants specific tier tools
    // When: Running workshop list with tier filter
    const result = await runLevCommand(['workshop', 'list', '--tier=1'])

    // Then: Should show only tier 1 tools
    expect(result.success).toBe(true)
    expect(result.output).toContain('Tier 1')
  })

  test('should require tool name for info command', async () => {
    // Given: User runs info without tool name
    // When: Running workshop info without arguments
    const result = await runLevCommand(['workshop', 'info'])

    // Then: Should show helpful error
    expect(result.success).toBe(false)
    expect(result.output).toContain('Tool name is required')
    expect(result.output).toContain('Usage: lev workshop info')
  })

  test('should handle unknown tool gracefully', async () => {
    // Given: User asks for non-existent tool
    // When: Running workshop info with invalid tool
    const result = await runLevCommand(['workshop', 'info', 'nonexistent-tool'])

    // Then: Should show helpful error message
    expect(result.success).toBe(false)
    expect(result.output).toContain('Tool not found: nonexistent-tool')
    expect(result.output).toContain("Use 'lev workshop list'")
  })
})

describe('Workshop Plugin Community Onboarding', () => {
  test('should provide onboarding guide', async () => {
    // Given: New developer wants to get started
    // When: Running workshop onboard
    const result = await runLevCommand(['workshop', 'onboard'])

    // Then: Should show comprehensive guide
    expect(result.success).toBe(true)
    expect(result.output).toContain('WELCOME TO LEVIATHAN')
    expect(result.output).toContain('LEARNING PATH')
    expect(result.output).toContain('QUICK START')
  })

  test('should show documentation links', async () => {
    // Given: Developer needs architecture info
    // When: Running workshop docs
    const result = await runLevCommand(['workshop', 'docs'])

    // Then: Should provide documentation guidance
    expect(result.success).toBe(true)
    expect(result.output).toContain('DOCUMENTATION')
  })

  test('should provide examples', async () => {
    // Given: Developer wants working examples
    // When: Running workshop examples
    const result = await runLevCommand(['workshop', 'examples'])

    // Then: Should show example plugins and usage
    expect(result.success).toBe(true)
    expect(result.output).toContain('EXAMPLES')
  })
})

describe('Workshop Plugin Error Handling', () => {
  test('should handle invalid commands gracefully', async () => {
    // Given: User types invalid workshop command
    // When: Running workshop with unknown command
    const result = await runLevCommand(['workshop', 'invalid-command'])

    // Then: Should show helpful error with available commands
    expect(result.success).toBe(false)
    expect(result.output).toContain('Unknown workshop command')
    expect(result.output).toContain('Available:')
  })

  test('should validate command arguments', async () => {
    // Given: User provides invalid arguments
    // When: Running commands with bad arguments
    const result = await runLevCommand(['workshop', 'list', '--tier=99'])

    // Then: Should handle gracefully (may show no results or warning)
    // Note: This tests the plugin's robustness with edge cases
    expect(result.success).toBe(true) // Should not crash
  })
})

describe('Workshop Plugin Phase 2 Placeholders', () => {
  test('should show Phase 3 placeholder for intake command', async () => {
    // Given: User tries intake command
    // When: Running workshop intake
    const result = await runLevCommand(['workshop', 'intake', 'https://github.com/example/repo'])

    // Then: Should show Phase 3 implementation notice
    expect(result.success).toBe(true)
    expect(result.output).toContain('Phase 3 Implementation Required')
    expect(result.output).toContain('INTAKE ANALYSIS')
  })

  test('should show placeholder for classify command', async () => {
    // Given: User tries classify command
    // When: Running workshop classify
    const result = await runLevCommand(['workshop', 'classify'])

    // Then: Should show Phase 3 placeholder
    expect(result.success).toBe(true)
    expect(result.output).toContain('Phase 3')
  })

  test('should show placeholder for create command', async () => {
    // Given: User tries create command
    // When: Running workshop create
    const result = await runLevCommand(['workshop', 'create'])

    // Then: Should show Phase 2 placeholder
    expect(result.success).toBe(true)
    expect(result.output).toContain('Phase 2')
  })
})

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Workshop Plugin Integration Tests')
  console.log('Testing real CLI integration and workflows\n')

  // Note: Using absolute paths in custom runLevCommand, no need to change directory

  // Run all test suites
  const testRunner = async () => {
    try {
      // Tests will run automatically due to the describe/test calls above
      await new Promise((resolve) => setTimeout(resolve, 100)) // Let tests complete

      const summary = printSummary()

      if (summary.failed === 0) {
        console.log('\n🎉 Workshop plugin CLI integration validated!')
        console.log('✅ Plugin ready for Phase 2 implementation')
        process.exit(0)
      } else {
        console.log('\n⚠️  Workshop plugin integration issues found')
        console.log('💡 Fix CLI integration before proceeding')
        process.exit(1)
      }
    } catch (error) {
      console.error('Test runner error:', error)
      process.exit(1)
    }
  }

  testRunner()
}
