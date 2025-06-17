/**
 * FlowMind Principle: ARCHITECTURAL INTEGRITY
 * This test validates that deprecated monolithic code is properly archived
 * while preserving clean architecture for MCP rebuild
 */
import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'

describe('Server Archive', () => {
  it('should archive deprecated server.js to archive/', () => {
    // Verify deprecated server is archived
    expect(existsSync('archive/server-deprecated.js')).toBe(true)
    
    // Verify original server.js is removed
    expect(existsSync('server.js')).toBe(false)
  })

  it('should preserve other archive files', () => {
    // Existing archive files should remain
    expect(existsSync('archive')).toBe(true)
  })
})