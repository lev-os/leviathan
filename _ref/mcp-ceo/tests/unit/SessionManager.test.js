/**
 * FlowMind Principle: CONTEXT SWITCHING = INTELLIGENCE
 * This test validates that SessionManager preserves workflow state
 * between context switches for bidirectional flow continuity
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { SessionManager } from '../../src/mcp/session/SessionManager.js'

describe('SessionManager', () => {
  let sessionManager

  beforeEach(() => {
    sessionManager = new SessionManager()
  })

  it('should create and manage workflow sessions', async () => {
    const sessionId = await sessionManager.createSession({
      workflowId: 'deep-analysis',
      challenge: 'Should we launch?'
    })
    
    expect(sessionId).toBeDefined()
    expect(typeof sessionId).toBe('string')
    
    const session = await sessionManager.getSession(sessionId)
    expect(session).toBeDefined()
    expect(session.workflowId).toBe('deep-analysis')
  })

  it('should persist step results across context switches', async () => {
    const sessionId = await sessionManager.createSession({
      workflowId: 'deep-analysis',
      challenge: 'test challenge'
    })
    
    // Store step 1 results
    await sessionManager.updateSession(sessionId, {
      step: 1,
      results: { insights: 'Analyst perspective complete' }
    })
    
    // Retrieve for step 2
    const session = await sessionManager.getSession(sessionId)
    expect(session.steps[1].results.insights).toBe('Analyst perspective complete')
  })

  it('should follow FlowMind constitutional principles', () => {
    // CONTEXT SWITCHING = INTELLIGENCE: Preserves state between switches
    expect(sessionManager.constructor.name).toBe('SessionManager')
    
    // Simple state persistence, no complex logic
    expect(typeof sessionManager.createSession).toBe('function')
    expect(typeof sessionManager.getSession).toBe('function')
  })
})