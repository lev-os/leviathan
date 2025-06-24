import { ContextAssembler } from './assembly-engine/context-assembler.js';
import { NanoAgent } from './nano-agents/base-nano-agent.js';
import { PatternDetector } from './learning-engine/pattern-detector.js';
import { ExperimentSpawner } from './cloud-spawn/experiment-spawner.js';
import { llmClient } from './llm-providers/llm-client.js';

export class KinglyOS {
  constructor() {
    this.contextAssembler = new ContextAssembler();
    this.patternDetector = new PatternDetector();
    this.experimentSpawner = new ExperimentSpawner();
    this.workflows = new Map();
    this.agents = new Map();
    this.userPreferences = new Map();
    this.interactionHistory = [];
    this.learnedPatterns = new Map();
    
    // Make LLM client globally available for nano-agents
    globalThis.llmClient = llmClient;
    
    this.initializeNanoAgents();
  }

  initializeNanoAgents() {
    const agentTypes = ['researcher', 'writer', 'dev', 'ceo', 'qa'];
    agentTypes.forEach(type => {
      this.agents.set(type, new NanoAgent(type));
    });
  }

  async processRequest({ user, message }) {
    // Input validation
    if (!user || !message || typeof message !== 'string') {
      return {
        mode: 'error',
        error: 'Invalid request: user and message are required'
      };
    }

    try {
      // Detect mode (workflow, learning, or default)
      const mode = this.detectMode(message);
      
      switch (mode) {
        case 'workflow':
          return await this.handleWorkflowMode(user, message);
        case 'learning':
          return await this.handleLearningMode(user, message);
        default:
          return await this.handleDefaultMode(user, message);
      }
    } catch (error) {
      return {
        mode: 'error',
        error: error.message
      };
    }
  }

  detectMode(message) {
    // Check for workflow patterns
    for (const [workflowName, workflow] of this.workflows) {
      if (workflow.trigger.test(message)) {
        return 'workflow';
      }
    }

    // Check for learning mode triggers (complex/unknown tasks)
    const complexityScore = this.calculateComplexity(message);
    const knowledgeGap = this.assessKnowledgeGap(message);
    
    if (complexityScore > 0.8 || knowledgeGap > 0.7) {
      return 'learning';
    }

    return 'default';
  }

  calculateComplexity(message) {
    const complexityIndicators = [
      /create.*new.*(?:framework|system|language|platform)/i,
      /design.*(?:distributed|scalable|enterprise)/i,
      /implement.*(?:ai|ml|quantum|blockchain)/i,
      /optimize.*(?:performance|algorithm|architecture)/i,
      /analyze.*complex.*(?:data|system|problem)/i
    ];

    const matches = complexityIndicators.filter(regex => regex.test(message));
    return matches.length / complexityIndicators.length;
  }

  assessKnowledgeGap(message) {
    // Simple heuristic - in real implementation, this would use LLM reasoning
    const unknownTerms = [
      /quantum(?! computing)/i, // quantum but not basic quantum computing
      /cryptocurrency.*(?:defi|yield|staking)/i,
      /neuromorphic/i,
      /photonic.*computing/i
    ];

    const matches = unknownTerms.filter(regex => regex.test(message));
    return matches.length / Math.max(unknownTerms.length, 1);
  }

  async handleWorkflowMode(user, message) {
    const workflow = this.findMatchingWorkflow(message);
    
    if (!workflow) {
      return await this.handleDefaultMode(user, message);
    }

    const result = {
      mode: 'workflow',
      workflow: workflow.name,
      agents: workflow.agents
    };

    if (workflow.sequence === 'sequential') {
      result.currentAgent = workflow.agents[0];
      result.nextAgent = workflow.agents[1] || null;
    } else {
      result.parallel = true;
    }

    // Record interaction
    this.recordInteraction(user, message, result);
    
    return result;
  }

  findMatchingWorkflow(message) {
    for (const [name, workflow] of this.workflows) {
      if (workflow.trigger.test(message)) {
        return { name, ...workflow };
      }
    }
    return null;
  }

  async handleLearningMode(user, message) {
    const experiments = await this.experimentSpawner.generateExperiments({
      task: message,
      user: user,
      count: 5
    });

    const result = {
      mode: 'learning',
      experiments: experiments,
      experimentId: this.generateExperimentId()
    };

    // Record learning attempt
    this.recordInteraction(user, message, result);
    
    return result;
  }

  async handleDefaultMode(user, message) {
    const agent = this.selectAgent(message);
    const context = this.contextAssembler.assemble({
      agent: agent,
      task: message,
      user: user,
      userPreferences: this.userPreferences.get(user)
    });

    const confidence = this.contextAssembler.calculateConfidence({
      agent: agent,
      task: message,
      context: context
    });

    const estimatedTokens = this.contextAssembler.estimateTokens(context);

    const result = {
      mode: 'default',
      agent: agent,
      context: context,
      confidence: confidence,
      estimatedTokens: estimatedTokens
    };

    // Record interaction
    this.recordInteraction(user, message, result);
    
    return result;
  }

  selectAgent(message) {
    // Simple keyword-based agent selection
    const patterns = {
      writer: /write|blog|article|story|content|documentation/i,
      dev: /code|debug|implement|program|software|api|bug|fix/i,
      researcher: /research|find|analyze|study|investigate|data/i,
      ceo: /plan|strategy|roadmap|business|decision|manage/i,
      qa: /test|quality|verify|validate|check/i
    };

    for (const [agentType, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return this.agents.get(agentType);
      }
    }

    // Default fallback
    return this.agents.get('researcher');
  }

  // Workflow management
  addWorkflow(name, config) {
    this.workflows.set(name, config);
  }

  // User preferences
  setUserPreference(user, key, value) {
    if (!this.userPreferences.has(user)) {
      this.userPreferences.set(user, {});
    }
    this.userPreferences.get(user)[key] = value;
    
    // Also set in context assembler
    this.contextAssembler.setUserPreference(user, key, value);
  }

  // Agent metrics
  getAgentMetrics(agentType) {
    const agent = this.agents.get(agentType);
    return agent ? agent.getMetrics() : null;
  }

  completeInteraction(user, feedback) {
    // Find the most recent interaction for this user
    const recentInteraction = [...this.interactionHistory]
      .reverse()
      .find(interaction => interaction.user === user);

    if (recentInteraction) {
      recentInteraction.feedback = feedback;
      
      // Update patterns based on feedback
      this.patternDetector.addInteraction({
        agent: recentInteraction.result.agent?.type,
        task: recentInteraction.message,
        context: recentInteraction.result.context,
        outcome: feedback
      });
    }
  }

  // Learning mode support
  recordExperimentResult(experimentId, result) {
    // Store experiment result
    if (!this.experimentResults) {
      this.experimentResults = new Map();
    }
    
    this.experimentResults.set(experimentId, result);
    
    // Update learned patterns
    if (result.success && result.quality > 0.8) {
      const patternKey = this.extractPatternKey(result);
      this.learnedPatterns.set(patternKey, result);
    }
  }

  getLearnedPattern(patternKey) {
    return this.learnedPatterns.get(patternKey);
  }

  extractPatternKey(result) {
    // Simple pattern key extraction
    return result.task?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'unknown-pattern';
  }

  generateExperimentId() {
    return `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  recordInteraction(user, message, result) {
    this.interactionHistory.push({
      timestamp: Date.now(),
      user: user,
      message: message,
      result: result
    });

    // Keep history limited
    if (this.interactionHistory.length > 1000) {
      this.interactionHistory = this.interactionHistory.slice(-500);
    }
  }

  // Error handling and fallbacks
  async safeProcessRequest(request) {
    try {
      return await this.processRequest(request);
    } catch (error) {
      return {
        mode: 'error',
        error: error.message,
        fallback: await this.handleDefaultMode(
          request.user || 'unknown',
          request.message || 'Help me with a task'
        )
      };
    }
  }

  // System health and metrics
  getSystemMetrics() {
    return {
      totalInteractions: this.interactionHistory.length,
      workflowCount: this.workflows.size,
      learnedPatterns: this.learnedPatterns.size,
      activeAgents: this.agents.size,
      userCount: this.userPreferences.size
    };
  }
}