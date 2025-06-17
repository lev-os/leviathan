/**
 * FlowMind Principle: CONTEXT SWITCHING = INTELLIGENCE
 * This file preserves workflow state between context switches,
 * enabling emergent intelligence through bidirectional flow continuity.
 */
import { randomUUID } from 'crypto'
import { createFriendlySessionId } from '../../utils/session-utils.js'

export class SessionManager {
  constructor() {
    this.sessions = new Map()
  }

  /**
   * Create a new workflow session with friendly ID
   * @param {Object} config - Session configuration
   * @param {string} config.workflowId - Workflow identifier
   * @param {string} config.challenge - Initial challenge
   * @param {string} config.type - Session type (production, research, e2e)
   * @returns {string} Session ID
   */
  async createSession(config) {
    const sessionId = createFriendlySessionId({
      workflowId: config.workflowId,
      challenge: config.challenge,
      type: config.type || 'production'
    })
    const session = {
      id: sessionId,
      workflowId: config.workflowId,
      challenge: config.challenge,
      created: new Date().toISOString(),
      currentStep: 1,
      steps: {},
      status: 'active'
    }
    
    this.sessions.set(sessionId, session)
    return sessionId
  }

  /**
   * Retrieve session state
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session state
   */
  async getSession(sessionId) {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Update session with step results
   * @param {string} sessionId - Session identifier
   * @param {Object} update - Step update
   * @param {number} update.step - Step number
   * @param {Object} update.results - Step results
   */
  async updateSession(sessionId, update) {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Store step results for context continuity
    session.steps[update.step] = {
      step: update.step,
      results: update.results,
      timestamp: new Date().toISOString()
    }

    session.currentStep = Math.max(session.currentStep, update.step)
    session.updated = new Date().toISOString()
  }

  /**
   * Clean up expired sessions
   * @param {number} maxAgeMs - Maximum session age in milliseconds
   */
  async cleanup(maxAgeMs = 24 * 60 * 60 * 1000) { // Default: 24 hours
    const now = Date.now()
    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.created).getTime()
      if (sessionAge > maxAgeMs) {
        this.sessions.delete(sessionId)
      }
    }
  }
}