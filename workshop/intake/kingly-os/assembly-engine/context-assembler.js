export class ContextAssembler {
  constructor() {
    this.rules = [];
    this.userPreferences = new Map();
    this.learnedPatterns = new Map();
    this.baseTemplates = {
      researcher: 'You are a thorough researcher who provides evidence-based insights.',
      writer: 'You are a skilled writer who creates engaging and clear content.',
      dev: 'You are an expert software developer who follows best practices.',
      ceo: 'You are a strategic business leader who makes data-driven decisions.',
      qa: 'You are a quality assurance expert who ensures thorough testing.'
    };
  }

  assemble({ agent, task, user, workflow, workflowStage, previousAgents, parallel, parallelAgents, userPreferences }) {
    let context = '';
    
    // Start with base template
    if (agent && agent.type && this.baseTemplates[agent.type]) {
      context += this.baseTemplates[agent.type] + '\n\n';
    }

    // Apply injection rules in priority order
    const applicableRules = this.getApplicableRules({
      agent,
      task,
      user,
      workflow,
      userPreferences: userPreferences || this.userPreferences.get(user)
    });

    // Apply prepends first
    const prepends = applicableRules
      .filter(rule => rule.inject.prepend)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    for (const rule of prepends) {
      context = rule.inject.prepend + '\n' + context;
    }

    // Add task context
    if (task) {
      context += `Task: ${task}\n\n`;
    }

    // Add workflow context
    if (workflow) {
      context += this.buildWorkflowContext({
        workflow,
        workflowStage,
        previousAgents,
        parallel,
        parallelAgents
      });
    }

    // Add user-specific context
    const userContext = this.buildUserContext(user, userPreferences);
    if (userContext) {
      context += userContext;
    }

    // Add learned patterns
    const patternContext = this.buildPatternContext(agent, task);
    if (patternContext) {
      context += patternContext;
    }

    // Apply appends last
    const appends = applicableRules
      .filter(rule => rule.inject.append)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    for (const rule of appends) {
      context += '\n' + rule.inject.append;
    }

    return context.trim();
  }

  assembleWithMetadata({ agent, task, user, workflow, workflowStage, previousAgents, parallel, parallelAgents, userPreferences }) {
    const context = this.assemble({
      agent,
      task,
      user,
      workflow,
      workflowStage,
      previousAgents,
      parallel,
      parallelAgents,
      userPreferences
    });

    const confidence = this.calculateConfidence({ agent, task, context });
    const tokens = this.estimateTokens(context);
    const warnings = this.generateWarnings(tokens, confidence);

    return {
      context,
      confidence,
      estimatedTokens: tokens,
      warnings
    };
  }

  getApplicableRules({ agent, task, user, workflow, userPreferences }) {
    return this.rules.filter(rule => {
      return this.evaluateCondition(rule.condition, {
        agent,
        task,
        user,
        workflow,
        userPreferences
      });
    });
  }

  evaluateCondition(condition, context) {
    if (condition.always) return true;
    
    if (condition.agentType && context.agent?.type !== condition.agentType) {
      return false;
    }
    
    if (condition.taskContains) {
      const regex = new RegExp(condition.taskContains, 'i');
      if (!regex.test(context.task || '')) {
        return false;
      }
    }
    
    if (condition.userPreference) {
      const prefs = context.userPreferences || {};
      for (const [key, value] of Object.entries(condition.userPreference)) {
        if (prefs[key] !== value) {
          return false;
        }
      }
    }
    
    if (condition.workflow && context.workflow !== condition.workflow) {
      return false;
    }
    
    return true;
  }

  buildWorkflowContext({ workflow, workflowStage, previousAgents, parallel, parallelAgents }) {
    let workflowContext = `${workflow} workflow\n`;
    
    if (parallel) {
      workflowContext += `parallel execution mode\n`;
      if (parallelAgents?.length > 0) {
        workflowContext += `coordinate with ${parallelAgents.join(', ')}\n`;
      }
    } else if (workflowStage) {
      workflowContext += `stage ${workflowStage}\n`;
      if (previousAgents?.length > 0) {
        workflowContext += `previous agents: ${previousAgents.join(', ')}\n`;
      }
    }
    
    return workflowContext + '\n';
  }

  buildUserContext(user, userPreferences) {
    const prefs = userPreferences || this.userPreferences.get(user);
    if (!prefs || Object.keys(prefs).length === 0) {
      return '';
    }

    let userContext = 'User preferences:\n';
    
    if (prefs.responseFormat === 'numbered') {
      userContext += '- Provide responses in numbered format\n';
    }
    
    if (prefs.style === 'concise') {
      userContext += '- Keep responses concise and to the point\n';
    }
    
    if (prefs.style === 'academic') {
      userContext += '- Use academic style with proper citations\n';
    }
    
    if (prefs.style === 'technical') {
      userContext += '- Use technical terminology and precise language\n';
    }
    
    return userContext + '\n';
  }

  buildPatternContext(agent, task) {
    if (!agent || !task) return '';
    
    // Look for relevant learned patterns
    const taskKeywords = task.toLowerCase().split(/\s+/);
    let bestPattern = null;
    let bestScore = 0;
    
    for (const [key, pattern] of this.learnedPatterns) {
      const score = this.calculatePatternRelevance(taskKeywords, key, pattern);
      if (score > bestScore) {
        bestScore = score;
        bestPattern = pattern;
      }
    }
    
    if (bestPattern && bestScore > 0.5) {
      const patternText = bestPattern.context || bestPattern.bestApproach || 'Start with high-level design';
      return `Learned approach: ${patternText}\n\n`;
    }
    
    return '';
  }

  calculatePatternRelevance(taskKeywords, patternKey, pattern) {
    const patternWords = patternKey.split('-');
    let matches = 0;
    
    for (const keyword of taskKeywords) {
      if (patternWords.includes(keyword)) {
        matches++;
      }
    }
    
    // Special case for framework creation
    if (patternKey === 'framework-creation' && 
        taskKeywords.some(word => word.includes('framework'))) {
      return 0.8; // High relevance
    }
    
    return matches / Math.max(taskKeywords.length, patternWords.length);
  }

  calculateConfidence({ agent, task, context }) {
    let confidence = 0.5; // base confidence
    
    // Agent-task alignment
    if (agent && task) {
      const alignment = this.calculateAgentTaskAlignment(agent.type, task);
      confidence += alignment * 0.3;
    }
    
    // Rule matches increase confidence
    const applicableRules = this.getApplicableRules({ agent, task });
    const avgRuleConfidence = applicableRules.reduce(
      (sum, rule) => sum + (rule.confidence || 0.5),
      0
    ) / Math.max(applicableRules.length, 1);
    
    confidence += (avgRuleConfidence - 0.5) * 0.2;
    
    // Task clarity
    if (task && task.length > 10 && !/\b(do something|help|unclear)\b/i.test(task)) {
      confidence += 0.1;
    } else {
      confidence -= 0.2;
    }
    
    // Context richness
    if (context && context.length > 200) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  calculateAgentTaskAlignment(agentType, task) {
    const alignments = {
      writer: /write|blog|article|content|documentation|story/i,
      dev: /code|program|implement|debug|software|api|bug|fix/i,
      researcher: /research|find|analyze|study|investigate|data/i,
      ceo: /plan|strategy|roadmap|business|decision|manage/i,
      qa: /test|quality|verify|validate|check/i
    };
    
    const pattern = alignments[agentType];
    return pattern && pattern.test(task) ? 0.8 : 0.2;
  }

  estimateTokens(context) {
    // Simple token estimation (approximately 4 characters per token)
    return Math.ceil((context || '').length / 4);
  }

  generateWarnings(tokens, confidence) {
    const warnings = [];
    
    if (tokens > 8000) {
      warnings.push('High token count may exceed model limits');
    }
    
    if (confidence < 0.3) {
      warnings.push('Low confidence - context may not be optimal');
    }
    
    return warnings;
  }

  // Rule management
  addRule(rule) {
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ruleWithId = { id: ruleId, ...rule };
    this.rules.push(ruleWithId);
    return ruleId;
  }

  updateRuleFromFeedback(ruleId, feedback) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule && !feedback.success) {
      if (feedback.alternative) {
        rule.inject = {
          ...rule.inject,
          prepend: feedback.alternative
        };
      }
    }
  }

  // User preferences
  setUserPreference(user, key, value) {
    if (!this.userPreferences.has(user)) {
      this.userPreferences.set(user, {});
    }
    this.userPreferences.get(user)[key] = value;
  }

  // Learned patterns
  addLearnedPattern(key, pattern) {
    this.learnedPatterns.set(key, pattern);
  }

  getPatterns() {
    return Array.from(this.learnedPatterns.entries()).map(([key, pattern]) => ({
      key,
      ...pattern
    }));
  }

  // Experimental contexts for learning mode
  generateExperimentalContexts({ agent, task, user }) {
    const baseContext = this.assemble({ agent, task, user });
    const variations = [];
    
    const approaches = [
      'research-heavy',
      'implementation-focused',
      'test-driven',
      'creative-first',
      'data-driven',
      'user-centered',
      'architecture-first'
    ];
    
    for (const approach of approaches) {
      const variation = this.createVariation(baseContext, approach, agent, task);
      variations.push({
        approach,
        context: variation,
        confidence: this.calculateConfidence({ agent, task, context: variation })
      });
    }
    
    return variations;
  }

  createVariation(baseContext, approach, agent, task) {
    const variations = {
      'research-heavy': 'Focus on thorough research and evidence gathering before proceeding.',
      'implementation-focused': 'Prioritize practical implementation and working solutions.',
      'test-driven': 'Start with defining tests and success criteria before implementation.',
      'creative-first': 'Begin with creative brainstorming and innovative approaches.',
      'data-driven': 'Base all decisions on data analysis and metrics.',
      'user-centered': 'Focus primarily on user needs and experience.',
      'architecture-first': 'Start with high-level design and system architecture.'
    };
    
    const modifier = variations[approach] || '';
    return `${modifier}\n\n${baseContext}`;
  }
}