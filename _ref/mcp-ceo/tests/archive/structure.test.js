/**
 * FlowMind Principle: GOOGLE CODING STANDARDS
 * This test validates clean MCP directory structure following
 * Google-style organization with clear separation of concerns
 */
import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'

describe('MCP Architecture Structure', () => {
  it('should have clean MCP directory structure', () => {
    expect(existsSync('src/mcp')).toBe(true)
    expect(existsSync('src/mcp/tools')).toBe(true)
    expect(existsSync('src/mcp/session')).toBe(true)
  })

  it('should maintain existing FlowMind components', () => {
    expect(existsSync('src/flowmind.js')).toBe(true)
    expect(existsSync('src/context-assembler.js')).toBe(true)
    expect(existsSync('src/context-registry.js')).toBe(true)
  })
})