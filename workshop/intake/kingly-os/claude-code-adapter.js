import { KinglyOS } from './kingly-os.js';
import { llmClient } from './llm-providers/llm-client.js';

/**
 * Claude Code Adapter for Kingly OS
 * 
 * This adapter exposes Kingly OS functionality to Claude Code without using tokens
 * but provides the full AI agent orchestration capabilities.
 */
export class ClaudeCodeAdapter {
  constructor() {
    this.kinglyOS = new KinglyOS();
    this.sessionUser = 'claude-code-user';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Set up Claude Code specific preferences
    this.kinglyOS.setUserPreference(this.sessionUser, 'style', 'technical');
    this.kinglyOS.setUserPreference(this.sessionUser, 'responseFormat', 'structured');

    // Add Claude Code specific workflows
    this.addClaudeCodeWorkflows();

    this.initialized = true;
    console.log('🤖 Kingly OS Claude Code Adapter initialized');
  }

  addClaudeCodeWorkflows() {
    // Code analysis workflow
    this.kinglyOS.addWorkflow('code-analysis', {
      trigger: /analyze.*code|code.*analysis|review.*codebase/i,
      agents: ['dev', 'qa', 'researcher'],
      sequence: 'sequential'
    });

    // Bug fixing workflow
    this.kinglyOS.addWorkflow('bug-fix', {
      trigger: /fix.*bug|debug|troubleshoot.*error/i,
      agents: ['dev', 'qa'],
      sequence: 'sequential'
    });

    // Feature development workflow
    this.kinglyOS.addWorkflow('feature-dev', {
      trigger: /new.*feature|add.*feature|implement.*feature/i,
      agents: ['researcher', 'dev', 'qa'],
      sequence: 'sequential'
    });

    // Documentation workflow
    this.kinglyOS.addWorkflow('documentation', {
      trigger: /write.*docs|document.*code|create.*readme/i,
      agents: ['researcher', 'writer'],
      sequence: 'sequential'
    });
  }

  /**
   * Main entry point for Claude Code interactions
   * Returns structured context and routing information without using LLM tokens
   */
  async processTask(task, options = {}) {
    await this.initialize();

    try {
      const result = await this.kinglyOS.processRequest({
        user: this.sessionUser,
        message: task,
        ...options
      });

      // Enhance result with Claude Code specific information
      const enhanced = await this.enhanceForClaudeCode(result, task);
      
      // Record interaction for learning
      if (!options.skipLearning) {
        this.recordInteraction(task, enhanced);
      }

      return enhanced;
    } catch (error) {
      console.error('Kingly OS processing error:', error);
      return {
        mode: 'error',
        error: error.message,
        fallback: this.createFallbackResponse(task)
      };
    }
  }

  async enhanceForClaudeCode(result, task) {
    const enhanced = {
      ...result,
      claudeCode: {
        timestamp: new Date().toISOString(),
        taskType: this.classifyTask(task),
        suggestedApproach: this.suggestApproach(result),
        nextSteps: this.generateNextSteps(result, task),
        toolRecommendations: this.recommendTools(result, task)
      }
    };

    // Add file operation suggestions if relevant
    if (this.isFileOperation(task)) {
      enhanced.claudeCode.fileOperations = this.suggestFileOperations(task);
    }

    // Add learning insights
    if (result.mode === 'learning') {
      enhanced.claudeCode.learningInsights = this.generateLearningInsights(result);
    }

    return enhanced;
  }

  classifyTask(task) {
    const taskLower = task.toLowerCase();
    
    if (/create|build|implement|develop/.test(taskLower)) {
      return 'creation';
    } else if (/fix|debug|resolve|troubleshoot/.test(taskLower)) {
      return 'debugging';
    } else if (/analyze|review|understand|explain/.test(taskLower)) {
      return 'analysis';
    } else if (/optimize|improve|enhance|refactor/.test(taskLower)) {
      return 'optimization';
    } else if (/test|validate|verify/.test(taskLower)) {
      return 'testing';
    } else if (/document|write.*docs|readme/.test(taskLower)) {
      return 'documentation';
    }
    
    return 'general';
  }

  suggestApproach(result) {
    switch (result.mode) {
      case 'workflow':
        return `Follow ${result.workflow} workflow with ${result.agents.join(' → ')} sequence`;
      
      case 'learning':
        return `Experimental approach with ${result.experiments.length} parallel investigations`;
      
      case 'default':
        return `Direct ${result.agent.type} agent approach with ${(result.confidence * 100).toFixed(0)}% confidence`;
      
      default:
        return 'Standard processing approach';
    }
  }

  generateNextSteps(result, task) {
    const steps = [];
    
    if (result.mode === 'workflow') {
      steps.push(`Start with ${result.currentAgent} agent analysis`);
      if (result.nextAgent) {
        steps.push(`Proceed to ${result.nextAgent} agent for validation`);
      }
    } else if (result.mode === 'learning') {
      steps.push('Review experimental approaches');
      steps.push('Select most promising direction');
      steps.push('Implement chosen approach');
    } else {
      steps.push('Execute with assembled context');
      steps.push('Validate results');
      steps.push('Provide feedback for learning');
    }

    return steps;
  }

  recommendTools(result, task) {
    const tools = [];
    
    // File operation tools
    if (this.isFileOperation(task)) {
      tools.push('Read', 'Write', 'Edit');
    }
    
    // Search tools
    if (/find|search|locate/.test(task.toLowerCase())) {
      tools.push('Grep', 'Glob');
    }
    
    // Development tools
    if (result.agent?.type === 'dev') {
      tools.push('Bash', 'Task');
    }
    
    // Analysis tools
    if (this.classifyTask(task) === 'analysis') {
      tools.push('Task', 'Grep', 'Read');
    }

    return tools;
  }

  isFileOperation(task) {
    return /file|directory|folder|path|read|write|edit|create.*file/.test(task.toLowerCase());
  }

  suggestFileOperations(task) {
    const operations = [];
    
    if (/read|view|show|display/.test(task.toLowerCase())) {
      operations.push({ tool: 'Read', purpose: 'Read file contents' });
    }
    
    if (/write|create|new/.test(task.toLowerCase())) {
      operations.push({ tool: 'Write', purpose: 'Create new file' });
    }
    
    if (/edit|modify|update|change/.test(task.toLowerCase())) {
      operations.push({ tool: 'Edit', purpose: 'Modify existing file' });
    }
    
    if (/search|find/.test(task.toLowerCase())) {
      operations.push({ tool: 'Grep', purpose: 'Search file contents' });
    }

    return operations;
  }

  generateLearningInsights(result) {
    return {
      experimentCount: result.experiments.length,
      approaches: result.experiments.map(e => e.approach),
      recommendation: 'Monitor experiment outcomes to identify optimal approach',
      nextActions: [
        'Execute most promising experiment',
        'Gather performance metrics',
        'Update learned patterns'
      ]
    };
  }

  createFallbackResponse(task) {
    return {
      mode: 'fallback',
      agent: { type: 'general' },
      context: `Task: ${task}\n\nApproach this systematically:\n1. Understand the requirements\n2. Break down into steps\n3. Execute methodically\n4. Validate results`,
      confidence: 0.5,
      estimatedTokens: 100
    };
  }

  recordInteraction(task, result) {
    // Simulate positive feedback for learning
    setTimeout(() => {
      this.kinglyOS.completeInteraction(this.sessionUser, {
        success: true,
        quality: 0.8,
        feedback: 'Claude Code interaction'
      });
    }, 100);
  }

  // Utility methods for Claude Code integration
  async getSystemStatus() {
    const metrics = this.kinglyOS.getSystemMetrics();
    const llmStats = llmClient.getStats();
    
    return {
      status: 'operational',
      metrics,
      llmProviders: llmStats,
      capabilities: {
        workflows: Array.from(this.kinglyOS.workflows.keys()),
        agents: Array.from(this.kinglyOS.agents.keys()),
        learningEnabled: true,
        mcpIntegration: true
      }
    };
  }

  async addCustomWorkflow(name, config) {
    this.kinglyOS.addWorkflow(name, {
      trigger: new RegExp(config.trigger, 'i'),
      agents: config.agents,
      sequence: config.sequence || 'sequential'
    });
    
    return { success: true, workflow: name };
  }

  async setPreference(key, value) {
    this.kinglyOS.setUserPreference(this.sessionUser, key, value);
    return { success: true, preference: { key, value } };
  }

  // Export context for direct Claude Code usage
  async getContextOnly(task) {
    const result = await this.processTask(task, { skipLearning: true });
    return {
      context: result.context,
      confidence: result.confidence,
      mode: result.mode,
      agent: result.agent?.type
    };
  }
}

// Singleton instance for Claude Code
export const claudeCodeAdapter = new ClaudeCodeAdapter();