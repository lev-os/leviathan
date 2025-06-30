/**
 * Session Manager for Workflow Orchestrator
 * 
 * Manages persistent sessions with REST-like API
 * Each session has unique ID and semantic file structure
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import crypto from 'crypto';

export class SessionManager {
  constructor(options = {}) {
    this.baseDir = options.baseDir || './sessions';
    this.sessions = new Map();
  }

  /**
   * Create a new session
   */
  async createSession(workflow, input) {
    // Generate semantic slug from workflow and topic
    const timestamp = new Date().toISOString().split('T')[0];
    const topicSlug = this.slugify(input.topic || input.input || 'workflow');
    const randomId = crypto.randomBytes(3).toString('hex');
    const sessionId = `${topicSlug}-${timestamp}-${randomId}`;
    
    // Create session directory structure
    const sessionPath = path.join(this.baseDir, sessionId);
    await fs.mkdir(sessionPath, { recursive: true });
    
    // Session metadata
    const session = {
      id: sessionId,
      workflowId: workflow.metadata?.id || 'unknown',
      created: new Date().toISOString(),
      status: 'active',
      currentStep: null,
      currentStepNumber: 0,
      completedSteps: [],
      pendingCallbacks: new Map(),
      outputs: {},
      input: input,
      path: sessionPath
    };
    
    // Save session metadata
    await this.saveSession(session);
    
    // Save workflow copy
    await fs.writeFile(
      path.join(sessionPath, 'workflow.yaml'),
      yaml.dump(workflow),
      'utf-8'
    );
    
    // Store in memory
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Load existing session
   */
  async loadSession(sessionId) {
    // Check memory first
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }
    
    // Load from disk
    const sessionPath = path.join(this.baseDir, sessionId);
    const metadataPath = path.join(sessionPath, 'session.yaml');
    
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      const session = yaml.load(content);
      
      // Restore Map structures
      session.pendingCallbacks = new Map(session.pendingCallbacks || []);
      session.path = sessionPath;
      
      this.sessions.set(sessionId, session);
      return session;
      
    } catch (error) {
      throw new Error(`Session not found: ${sessionId}`);
    }
  }

  /**
   * Save session state to disk
   */
  async saveSession(session) {
    const sessionData = {
      ...session,
      // Convert Map to array for YAML serialization
      pendingCallbacks: Array.from(session.pendingCallbacks.entries())
    };
    
    await fs.writeFile(
      path.join(session.path, 'session.yaml'),
      yaml.dump(sessionData),
      'utf-8'
    );
  }

  /**
   * Get step directory path
   */
  getStepPath(session, stepNumber) {
    return path.join(session.path, `step${stepNumber}`);
  }

  /**
   * Get semantic filename for output
   */
  getOutputFilename(index, semantic) {
    const paddedIndex = String(index).padStart(2, '0');
    const slug = this.slugify(semantic);
    return `${paddedIndex}-${slug}.md`;
  }

  /**
   * Record step output
   */
  async recordOutput(sessionId, stepId, outputFile, metadata = {}) {
    const session = await this.loadSession(sessionId);
    
    if (!session.outputs[stepId]) {
      session.outputs[stepId] = [];
    }
    
    session.outputs[stepId].push({
      file: outputFile,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    
    await this.saveSession(session);
  }

  /**
   * Add pending callback
   */
  async addPendingCallback(sessionId, callbackId, context) {
    const session = await this.loadSession(sessionId);
    session.pendingCallbacks.set(callbackId, {
      context,
      timestamp: new Date().toISOString()
    });
    await this.saveSession(session);
  }

  /**
   * Remove pending callback and mark step complete
   */
  async completePendingCallback(sessionId, callbackId, outputFile) {
    const session = await this.loadSession(sessionId);
    
    if (session.pendingCallbacks.has(callbackId)) {
      const callback = session.pendingCallbacks.get(callbackId);
      session.pendingCallbacks.delete(callbackId);
      
      // Record the output
      await this.recordOutput(sessionId, callback.context.stepId, outputFile);
      
      // Check if step is complete (no more pending callbacks for this step)
      const stepCallbacks = Array.from(session.pendingCallbacks.values())
        .filter(cb => cb.context.stepId === callback.context.stepId);
      
      if (stepCallbacks.length === 0) {
        session.completedSteps.push(callback.context.stepId);
      }
      
      await this.saveSession(session);
      return callback.context;
    }
    
    throw new Error(`Callback not found: ${callbackId}`);
  }

  /**
   * Ensure step directory exists
   */
  async ensureStepDirectory(session, stepNumber) {
    const stepPath = this.getStepPath(session, stepNumber);
    await fs.mkdir(stepPath, { recursive: true });
    return stepPath;
  }

  /**
   * Get all outputs for a step
   */
  async getStepOutputs(sessionId, stepId) {
    const session = await this.loadSession(sessionId);
    const outputs = session.outputs[stepId] || [];
    
    // Read actual file contents
    const outputsWithContent = [];
    for (const output of outputs) {
      try {
        const content = await fs.readFile(output.file, 'utf-8');
        outputsWithContent.push({
          ...output,
          content
        });
      } catch (err) {
        outputsWithContent.push({
          ...output,
          content: null,
          error: err.message
        });
      }
    }
    
    return outputsWithContent;
  }

  /**
   * List all sessions
   */
  async listSessions() {
    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      const sessions = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const session = await this.loadSession(entry.name);
            sessions.push({
              id: session.id,
              workflow: session.workflowId,
              created: session.created,
              status: session.status,
              steps: session.completedSteps.length,
              pending: session.pendingCallbacks.size
            });
          } catch (err) {
            // Skip invalid sessions
          }
        }
      }
      
      return sessions;
    } catch (err) {
      return [];
    }
  }

  /**
   * Generate semantic slug from text
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Clean up old sessions
   */
  async cleanupSessions(maxAgeDays = 30) {
    const sessions = await this.listSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    for (const session of sessions) {
      const sessionDate = new Date(session.created);
      if (sessionDate < cutoffDate && session.status !== 'active') {
        await fs.rm(path.join(this.baseDir, session.id), { recursive: true });
      }
    }
  }
}