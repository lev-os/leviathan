/**
 * Audit Logger for Kingly Agent
 * Tracks all decisions, actions, and reasoning
 */

import fs from 'fs-extra';
import path from 'path';

export class AuditLogger {
  constructor(auditPath = './.kingly/audit') {
    this.auditPath = auditPath;
    this.currentSession = `session-${Date.now()}`;
  }

  async initialize() {
    await fs.ensureDir(this.auditPath);
    await fs.ensureDir(path.join(this.auditPath, this.currentSession));
  }

  async logDecision(decision) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'decision',
      decision: decision.action,
      reasoning: decision.reasoning,
      context: decision.context,
      outcome: decision.outcome || 'pending'
    };

    await this.appendToLog(entry);
    return entry;
  }

  async logAction(action) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'action',
      action: action.type,
      target: action.target,
      params: action.params,
      result: action.result
    };

    await this.appendToLog(entry);
    return entry;
  }

  async logTaskSplit(parentTask, subtasks, reasoning) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'task_split',
      parentTask: parentTask.id,
      parentTitle: parentTask.title,
      confidence: parentTask.confidence,
      reasoning: reasoning,
      subtasks: subtasks.map(st => ({
        id: st.id,
        title: st.title,
        confidence: st.confidence
      }))
    };

    await this.appendToLog(entry);
    return entry;
  }

  async appendToLog(entry) {
    const logFile = path.join(this.auditPath, this.currentSession, 'audit.jsonl');
    await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
    
    // Also maintain a daily summary
    const dailyFile = path.join(this.auditPath, `daily-${new Date().toISOString().split('T')[0]}.jsonl`);
    await fs.appendFile(dailyFile, JSON.stringify(entry) + '\n');
  }

  async getSessionSummary() {
    const logFile = path.join(this.auditPath, this.currentSession, 'audit.jsonl');
    if (!await fs.pathExists(logFile)) return { decisions: 0, actions: 0, splits: 0 };

    const content = await fs.readFile(logFile, 'utf-8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));

    return {
      decisions: entries.filter(e => e.type === 'decision').length,
      actions: entries.filter(e => e.type === 'action').length,
      splits: entries.filter(e => e.type === 'task_split').length,
      entries: entries
    };
  }
}

export default AuditLogger;