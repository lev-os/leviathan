import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * CEO Binding System
 * Handles Claude Code integration as CEO agent with multi-tab session management
 */
export class CEOBinding {
  constructor() {
    this.sessionId = `ceo-${Date.now()}`;
    this.currentAgent = 'ceo';
    this.workspaceContext = null;
    this.networkIntelligence = true;
    this.memoryAutoSave = true;
    this.turnCounter = 0;
    this.lastPing = Date.now();
    
    this.loadWorkspaceContext();
  }

  /**
   * Load workspace context from CLAUDE.md files
   */
  loadWorkspaceContext() {
    try {
      const homeDir = os.homedir();
      const projectClaudemd = path.join(process.cwd(), 'CLAUDE.md');
      const kinglyClaudemd = path.join(homeDir, '.kingly', '.claude', 'CLAUDE.md');
      
      this.workspaceContext = {
        project: this.loadClaudeFile(projectClaudemd),
        kingly: this.loadClaudeFile(kinglyClaudemd),
        workspace: process.cwd(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading workspace context:', error);
      this.workspaceContext = { workspace: process.cwd() };
    }
  }

  loadClaudeFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
    return null;
  }

  /**
   * Generate response headers for CEO agent
   */
  generateResponseHeaders() {
    const session = `${this.currentAgent}-session-${this.sessionId.slice(-6)}`;
    const network = this.networkIntelligence ? 'enabled' : 'disabled';
    const memory = this.memoryAutoSave ? 'auto-save enabled' : 'manual save';
    
    return [
      `[CEO] Current session: ${session}`,
      `[Network] Cross-workspace intelligence: ${network}`,
      `[Memory] Procedural memory: ${memory}`,
      `[Agent] Primary: ${this.currentAgent.toUpperCase()} | Turn: ${this.turnCounter}`
    ].join('\\n');
  }

  /**
   * Detect natural language intent and route to appropriate agent
   */
  detectIntent(input) {
    const intent = input.toLowerCase();
    
    // ~/t technique parsing
    if (intent.startsWith('~/t ')) {
      const agentRequest = intent.substring(4).trim();
      return this.switchAgent(agentRequest);
    }
    
    // Natural language intent detection
    if (intent.includes('research') || intent.includes('investigate') || intent.includes('study')) {
      return { agent: 'research', confidence: 0.8, reasoning: 'Research intent detected' };
    }
    
    if (intent.includes('implement') || intent.includes('code') || intent.includes('develop')) {
      return { agent: 'development', confidence: 0.8, reasoning: 'Development intent detected' };
    }
    
    if (intent.includes('strategy') || intent.includes('analyze') || intent.includes('plan')) {
      return { agent: 'strategic', confidence: 0.8, reasoning: 'Strategic intent detected' };
    }
    
    if (intent.includes('memory') || intent.includes('intelligence') || intent.includes('lookup')) {
      return { agent: 'memory', confidence: 0.8, reasoning: 'Intelligence lookup intent detected' };
    }
    
    // Default to CEO coordination
    return { agent: 'ceo', confidence: 0.6, reasoning: 'General coordination task' };
  }

  /**
   * Handle ~/t agent switching
   */
  switchAgent(agentRequest) {
    const agentMap = {
      'research': { agent: 'research', description: 'Research and investigation mode' },
      'dev': { agent: 'development', description: 'Development and implementation mode' },
      'development': { agent: 'development', description: 'Development and implementation mode' },
      'strategic': { agent: 'strategic', description: 'Strategic analysis mode' },
      'strategy': { agent: 'strategic', description: 'Strategic analysis mode' },
      'memory': { agent: 'memory', description: 'Intelligence lookup mode' },
      'intelligence': { agent: 'memory', description: 'Intelligence lookup mode' },
      'ceo': { agent: 'ceo', description: 'CEO coordination mode' }
    };
    
    const mapping = agentMap[agentRequest];
    if (mapping) {
      this.currentAgent = mapping.agent;
      return {
        agent: mapping.agent,
        confidence: 1.0,
        reasoning: `Direct agent switch: ${mapping.description}`,
        switched: true
      };
    }
    
    return {
      agent: 'ceo',
      confidence: 0.3,
      reasoning: `Unknown agent "${agentRequest}", staying in CEO mode`,
      error: `Available agents: ${Object.keys(agentMap).join(', ')}`
    };
  }

  /**
   * Check if self-ping is needed (every 15 turns or breakthrough insights)
   */
  shouldSelfPing(context = '') {
    this.turnCounter++;
    const turnThreshold = this.turnCounter % 15 === 0;
    const timeThreshold = Date.now() - this.lastPing > 600000; // 10 minutes
    const breakthroughKeywords = ['breakthrough', 'insight', 'discovery', 'solution', 'pattern'];
    const hasBreakthrough = breakthroughKeywords.some(keyword => 
      context.toLowerCase().includes(keyword)
    );
    
    return turnThreshold || timeThreshold || hasBreakthrough;
  }

  /**
   * Create session ping with context
   */
  createSessionPing(context, auto = false) {
    this.lastPing = Date.now();
    
    return {
      session_id: this.sessionId,
      context,
      agent: this.currentAgent,
      workspace: this.workspaceContext?.workspace || 'unknown',
      turn_count: this.turnCounter,
      network_intelligence: this.networkIntelligence,
      auto_generated: auto,
      timestamp: new Date().toISOString(),
      significance: this.assessSignificance(context)
    };
  }

  /**
   * Assess significance of context for memory promotion
   */
  assessSignificance(context) {
    const lowValue = ['debug', 'test', 'minor', 'small'];
    const mediumValue = ['feature', 'enhancement', 'optimization'];
    const highValue = ['breakthrough', 'solution', 'pattern', 'discovery'];
    const criticalValue = ['architecture', 'paradigm', 'innovation'];
    
    const lowerContext = context.toLowerCase();
    
    if (criticalValue.some(keyword => lowerContext.includes(keyword))) {
      return { level: 'critical', confidence: 0.9 };
    }
    if (highValue.some(keyword => lowerContext.includes(keyword))) {
      return { level: 'high', confidence: 0.8 };
    }
    if (mediumValue.some(keyword => lowerContext.includes(keyword))) {
      return { level: 'medium', confidence: 0.7 };
    }
    if (lowValue.some(keyword => lowerContext.includes(keyword))) {
      return { level: 'low', confidence: 0.5 };
    }
    
    return { level: 'medium', confidence: 0.6 };
  }

  /**
   * Generate session rollup package
   */
  generateRollup(files = [], decisions = [], blockers = [], nextActions = []) {
    return {
      session_id: this.sessionId,
      agent: this.currentAgent,
      workspace: this.workspaceContext?.workspace || 'unknown',
      turn_count: this.turnCounter,
      files: files.length > 0 ? files : 'auto-detected',
      decisions: decisions.length > 0 ? decisions : 'auto-extracted',
      blockers: blockers.length > 0 ? blockers : 'none identified',
      next_actions: nextActions.length > 0 ? nextActions : 'continue current workflow',
      intelligence_captured: this.extractIntelligence(),
      timestamp: new Date().toISOString(),
      rollup_path: `~/.kingly/sessions/rollups/${this.sessionId}-complete.md`
    };
  }

  /**
   * Extract intelligence from current session
   */
  extractIntelligence() {
    return {
      agent_patterns: [`${this.currentAgent} agent coordination patterns`],
      workspace_insights: ['Workspace-specific patterns identified'],
      memory_candidates: ['Significant insights for procedural memory'],
      cross_workspace_potential: this.networkIntelligence ? 'patterns identified' : 'disabled'
    };
  }

  /**
   * Format response with CEO headers
   */
  formatResponse(content, includeHeaders = true) {
    if (!includeHeaders) return content;
    
    const headers = this.generateResponseHeaders();
    return `${headers}\\n\\n${content}`;
  }
}