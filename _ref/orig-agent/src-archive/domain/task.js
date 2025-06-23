/**
 * Task Domain Entity  
 * Pure business logic with confidence rules and intent classification
 */

import { IntentClassifier } from './services/intent-classifier.js';

export class Task {
  constructor(data) {
    // Support both old constructor signature and new object-based
    if (typeof data === 'string') {
      // Legacy: constructor(title, description, projectName)
      data = {
        title: arguments[0],
        description: arguments[1],
        workspace_id: arguments[2]
      };
    }
    
    this.id = data.id || this.generateId();
    this.title = data.title;
    this.description = data.description || '';
    this.workspace_id = data.workspace_id || data.project || null;
    
    // Add intent classification
    const intent = IntentClassifier.classifyTaskIntent(
      data.title, 
      data.description
    );
    
    this.intent_type = data.intent_type || intent.type;
    this.intent_context = data.intent_context || intent.context;
    this.intent_candidates = data.intent_candidates || intent.candidates;
    
    // Confidence now comes from intent classification by default
    this.confidence = data.confidence || intent.confidence || 0;
    this.status = data.status || 'pending';
    this.subtasks = data.subtasks || [];
    
    // Enhanced context with workspace and intent metadata
    this.context = this.buildContext(data);
    
    // Track parent task for inheritance
    this.parent_task_id = data.parent_task_id || null;
    
    this.relationships = data.relationships || {
      blocked_by: [], // Tasks that must complete before this one
      blocks: [],     // Tasks that this one blocks
      relates_to: []  // Related tasks (no dependency)
    };
    
    // Handle dependencies array for cross-workspace support
    if (data.dependencies && Array.isArray(data.dependencies)) {
      this.relationships.blocked_by = data.dependencies;
    }
    
    this.created = data.created || new Date().toISOString();
    this.updated = data.updated || this.created;
  }
  
  buildContext(data) {
    const context = data.context || {};
    
    // Add workspace context if available
    if (this.workspace_id) {
      context.workspace = {
        id: this.workspace_id,
        type: 'project',
        metadata: {}
      };
    }
    
    // Add parent task context if this is a subtask
    if (data.parent_task_id) {
      context.inherited_from = data.parent_task_id;
      context.intent_type = this.intent_type;
      context.domain = this.intent_context.domain;
    }
    
    return context;
  }

  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Business rule: confidence threshold
  static CONFIDENCE_THRESHOLD = 0.8;

  isReadyForExecution() {
    return this.confidence >= Task.CONFIDENCE_THRESHOLD;
  }

  // Business rule: when to split
  needsSplitting() {
    return this.confidence < Task.CONFIDENCE_THRESHOLD && this.subtasks.length === 0;
  }

  // Business rule: task splitting
  split(subtasks, reason = '') {
    if (this.isReadyForExecution()) {
      throw new Error('Task already has sufficient confidence for execution');
    }
    
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      throw new Error('Must provide at least one subtask');
    }

    this.subtasks = subtasks.map(subtask => ({
      ...subtask,
      id: this.generateId(),
      parent: this.id,
      created: new Date().toISOString()
    }));
    
    this.splitReason = reason;
    this.updated = new Date().toISOString();
  }

  // Business rule: confidence assessment
  assessConfidence(confidence, factors = [], reasoning = '') {
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    
    this.confidence = confidence;
    this.confidenceFactors = factors;
    this.confidenceReasoning = reasoning;
    this.updated = new Date().toISOString();
  }

  // Business rule: task execution
  execute(agent, approach = '') {
    if (!this.isReadyForExecution()) {
      throw new Error(`Task confidence (${this.confidence}) below threshold (${Task.CONFIDENCE_THRESHOLD})`);
    }
    
    this.status = 'in_progress';
    this.assignedAgent = agent;
    this.approach = approach;
    this.executionStarted = new Date().toISOString();
    this.updated = this.executionStarted;
  }

  complete(result = null) {
    this.status = 'completed';
    this.result = result;
    this.completedAt = new Date().toISOString();
    this.updated = this.completedAt;
  }

  fail(error = null) {
    this.status = 'failed';
    this.error = error;
    this.failedAt = new Date().toISOString();
    this.updated = this.failedAt;
  }

  // Business rule: task relationships
  addBlockedBy(taskId, reason = '') {
    if (!this.relationships.blocked_by.includes(taskId)) {
      this.relationships.blocked_by.push(taskId);
      this.updated = new Date().toISOString();
    }
  }

  removeBlockedBy(taskId) {
    const index = this.relationships.blocked_by.indexOf(taskId);
    if (index > -1) {
      this.relationships.blocked_by.splice(index, 1);
      this.updated = new Date().toISOString();
    }
  }

  addBlocks(taskId) {
    if (!this.relationships.blocks.includes(taskId)) {
      this.relationships.blocks.push(taskId);
      this.updated = new Date().toISOString();
    }
  }

  removeBlocks(taskId) {
    const index = this.relationships.blocks.indexOf(taskId);
    if (index > -1) {
      this.relationships.blocks.splice(index, 1);
      this.updated = new Date().toISOString();
    }
  }

  addRelatesTo(taskId, relationship_type = 'related') {
    const existing = this.relationships.relates_to.find(r => r.taskId === taskId);
    if (!existing) {
      this.relationships.relates_to.push({
        taskId,
        relationship_type,
        created: new Date().toISOString()
      });
      this.updated = new Date().toISOString();
    }
  }

  removeRelatesTo(taskId) {
    this.relationships.relates_to = this.relationships.relates_to.filter(r => r.taskId !== taskId);
    this.updated = new Date().toISOString();
  }

  // Business rule: check if task is blocked
  isBlocked(completedTasks = []) {
    return this.relationships.blocked_by.some(taskId => !completedTasks.includes(taskId));
  }

  // Business rule: check if ready considering dependencies  
  isReadyForExecutionWithDeps(completedTasks = []) {
    return this.isReadyForExecution() && !this.isBlocked(completedTasks);
  }

  addContext(key, value) {
    this.context[key] = value;
    this.updated = new Date().toISOString();
  }

  getStats() {
    return {
      id: this.id,
      title: this.title,
      confidence: this.confidence,
      status: this.status,
      subtaskCount: this.subtasks.length,
      isReady: this.isReadyForExecution(),
      needsSplit: this.needsSplitting(),
      created: this.created,
      updated: this.updated
    };
  }
}