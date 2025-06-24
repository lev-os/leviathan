/**
 * Session Initializer - Core session management logic
 * Extracted from index.js per _02-refactor.md Phase 1 specification
 */

import { SessionManager } from '../../session-manager.js';
import { CEOBinding } from '../../ceo-binding.js';

export class SessionInitializer {
  constructor() {
    this.sessionManager = new SessionManager();
    this.ceoBinding = new CEOBinding();
  }

  /**
   * Initialize session with CEO binding and registration
   */
  async initializeSession() {
    // Register this session with CEO binding context
    this.sessionManager.registerSession(this.ceoBinding.sessionId, {
      agent: this.ceoBinding.currentAgent,
      workspace: this.ceoBinding.workspaceContext?.workspace || 'unknown',
      network_intelligence: this.ceoBinding.networkIntelligence
    });

    return {
      sessionManager: this.sessionManager,
      ceoBinding: this.ceoBinding,
      sessionId: this.ceoBinding.sessionId
    };
  }

  /**
   * Get session dependencies for command execution
   */
  getSessionDependencies() {
    return {
      sessionManager: this.sessionManager,
      ceoBinding: this.ceoBinding
    };
  }
}