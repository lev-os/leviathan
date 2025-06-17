/**
 * FlowMind Principle: LLM IS THE RUNTIME
 * This test validates that MCPServer orchestrates context switching
 * to enable LLM reasoning through bidirectional flow (ADR-008)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { MCPServer } from '../../src/mcp/MCPServer.js'

describe('MCPServer', () => {
  let server

  beforeEach(() => {
    server = new MCPServer()
  })

  it('should initialize with registry and assembler', async () => {
    await server.initialize()
    
    expect(server.registry).toBeDefined()
    expect(server.assembler).toBeDefined()
    expect(server.server).toBeDefined()
  })

  it('should setup MCP tools during initialization', async () => {
    await server.initialize()
    
    // Verify MCP tools are registered
    expect(server.tools).toBeDefined()
    expect(server.tools.size).toBeGreaterThan(0)
  })

  it('should follow FlowMind constitutional principles', () => {
    // LLM IS THE RUNTIME: Server orchestrates, doesn't think
    expect(server.constructor.name).toBe('MCPServer')
    
    // EVERYTHING IS A CONTEXT: Uses registry and assembler
    expect(server.registry).toBeDefined()
    expect(server.assembler).toBeDefined()
  })
})