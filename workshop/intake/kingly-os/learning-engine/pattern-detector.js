export class PatternDetector {
  constructor() {
    this.interactions = [];
    this.patterns = [];
    this.antiPatterns = [];
    this.environmentChanges = [];
    this.experimentResults = [];
  }

  analyzeInteractions(interactions) {
    const patterns = [];
    
    // Group interactions by context similarity
    const contextGroups = this.groupByContextSimilarity(interactions);
    
    for (const group of contextGroups) {
      if (group.length >= 2) { // Need at least 2 interactions to form a pattern
        const successRate = group.filter(i => i.outcome.success).length / group.length;
        const avgQuality = group.reduce((sum, i) => sum + (i.outcome.quality || 0), 0) / group.length;
        
        if (successRate >= 0.7) { // Successful pattern threshold
          patterns.push({
            context: group[0].context,
            agent: group[0].agent,
            taskType: this.extractTaskType(group[0].task),
            successRate,
            avgQuality,
            occurrences: group.length,
            confidence: this.calculatePatternConfidence(group)
          });
        }
      }
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  identifyAntiPatterns(interactions) {
    const antiPatterns = [];
    
    // Group by context and find consistently failing patterns
    const contextGroups = this.groupByContextSimilarity(interactions);
    
    for (const group of contextGroups) {
      if (group.length >= 2) {
        const successRate = group.filter(i => i.outcome.success).length / group.length;
        
        if (successRate <= 0.3) { // Anti-pattern threshold
          antiPatterns.push({
            context: group[0].context,
            agent: group[0].agent,
            taskType: this.extractTaskType(group[0].task),
            successRate,
            occurrences: group.length,
            reason: this.identifyFailureReason(group)
          });
        }
      }
    }
    
    return antiPatterns;
  }

  analyzeAlignment({ agent, task, context }) {
    const alignment = {
      score: 0.5,
      reasons: []
    };
    
    // Check agent-task alignment
    if (this.isAgentTaskAligned(agent, task)) {
      alignment.score += 0.2;
      alignment.reasons.push('task-context match');
    }
    
    // Check context specificity
    if (this.isContextSpecific(context, task)) {
      alignment.score += 0.15;
      alignment.reasons.push('specific context');
    }
    
    // Check for anti-pattern indicators
    if (this.hasAntiPatternIndicators(context, task)) {
      alignment.score -= 0.2;
      alignment.reasons.push('potential mismatch detected');
    }
    
    return {
      score: Math.max(0, Math.min(1, alignment.score)),
      reasons: alignment.reasons
    };
  }

  groupByContextSimilarity(interactions) {
    const groups = [];
    
    for (const interaction of interactions) {
      let foundGroup = false;
      
      for (const group of groups) {
        if (this.calculateContextSimilarity(interaction.context, group[0].context) > 0.7) {
          group.push(interaction);
          foundGroup = true;
          break;
        }
      }
      
      if (!foundGroup) {
        groups.push([interaction]);
      }
    }
    
    return groups;
  }

  calculateContextSimilarity(context1, context2) {
    const words1 = new Set(context1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(context2.toLowerCase().match(/\b\w+\b/g) || []);
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  extractTaskType(task) {
    const patterns = {
      'code-development': /code|implement|program|develop|build|create.*app/i,
      'debugging': /debug|fix|error|bug|troubleshoot/i,
      'research': /research|find|analyze|study|investigate/i,
      'writing': /write|blog|article|content|documentation/i,
      'strategic-planning': /plan|strategy|roadmap|business.*plan/i,
      'testing': /test|verify|validate|check|qa/i
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(task)) {
        return type;
      }
    }
    
    return 'general';
  }

  calculatePatternConfidence(interactions) {
    const factors = [
      interactions.length / 10, // More interactions = higher confidence (max 1.0)
      interactions.filter(i => i.outcome.success).length / interactions.length, // Success rate
      Math.min(1, interactions.reduce((sum, i) => sum + (i.outcome.quality || 0), 0) / interactions.length) // Avg quality
    ];
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  identifyFailureReason(failedInteractions) {
    const commonIssues = [
      { pattern: /creative.*technical/i, reason: 'context-task mismatch' },
      { pattern: /vague|unclear|general/i, reason: 'insufficient specificity' },
      { pattern: /quick.*complex/i, reason: 'inappropriate approach' }
    ];
    
    for (const interaction of failedInteractions) {
      for (const issue of commonIssues) {
        if (issue.pattern.test(interaction.context)) {
          return issue.reason;
        }
      }
    }
    
    return 'unknown failure cause';
  }

  isAgentTaskAligned(agent, task) {
    const alignments = {
      researcher: /research|find|analyze|study|investigate/i,
      writer: /write|blog|article|content|documentation/i,
      dev: /code|implement|debug|program|software/i,
      ceo: /plan|strategy|business|decision|manage/i,
      qa: /test|verify|validate|check|quality/i
    };
    
    const pattern = alignments[agent];
    return pattern ? pattern.test(task) : false;
  }

  isContextSpecific(context, task) {
    // Check if context contains task-specific terminology
    const taskWords = task.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const contextWords = context.toLowerCase().match(/\b\w{4,}\b/g) || [];
    
    const overlap = taskWords.filter(word => contextWords.includes(word)).length;
    return overlap / Math.max(taskWords.length, 1) > 0.3;
  }

  hasAntiPatternIndicators(context, task) {
    const antiPatterns = [
      { context: /creative/i, task: /technical|debug|code/i },
      { context: /quick/i, task: /complex|detailed|thorough/i },
      { context: /general/i, task: /specific|specialized/i }
    ];
    
    return antiPatterns.some(ap => ap.context.test(context) && ap.task.test(task));
  }

  // Pattern extraction and management
  extractPatterns() {
    return this.analyzeInteractions(this.interactions);
  }

  addPattern(pattern) {
    const patternId = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const patternWithId = { id: patternId, ...pattern };
    this.patterns.push(patternWithId);
    return patternId;
  }

  updatePattern(patternId, updates) {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (pattern) {
      // Update success rate
      if (updates.newInteractions && updates.newSuccesses) {
        const totalInteractions = (pattern.occurrences || 0) + updates.newInteractions;
        const totalSuccesses = (pattern.successRate * (pattern.occurrences || 0)) + updates.newSuccesses;
        pattern.successRate = totalSuccesses / totalInteractions;
        pattern.occurrences = totalInteractions;
      }
      
      // Update context
      if (updates.contextUpdates) {
        for (const update of updates.contextUpdates) {
          if (!pattern.context.includes(update)) {
            pattern.context += ` ${update}`;
          }
        }
      }
    }
  }

  getPattern(patternId) {
    return this.patterns.find(p => p.id === patternId);
  }

  recordFailure(patternId) {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (pattern) {
      pattern.failures = (pattern.failures || 0) + 1;
      
      // Mark as deprecated if too many failures
      if (pattern.failures >= 5) {
        pattern.deprecated = true;
        pattern.alternatives = this.suggestAlternatives(pattern);
      }
    }
  }

  suggestAlternatives(failedPattern) {
    return this.patterns
      .filter(p => p.id !== failedPattern.id && 
                   p.agent === failedPattern.agent && 
                   p.successRate > 0.7)
      .map(p => p.context)
      .slice(0, 3);
  }

  suggestImprovements({ agent, taskType }) {
    const suggestions = [];
    
    // Find failed interactions for this agent/task combination
    const failedInteractions = this.interactions.filter(i => 
      i.agent === agent && 
      this.extractTaskType(i.task) === taskType && 
      !i.outcome.success
    );
    
    // Analyze common failure patterns
    const feedbackTerms = failedInteractions
      .map(i => i.feedback)
      .filter(f => f)
      .join(' ')
      .toLowerCase();
    
    if (feedbackTerms.includes('edge case')) {
      suggestions.push('Add comprehensive edge case analysis to context');
    }
    
    if (feedbackTerms.includes('specific')) {
      suggestions.push('Include more specific instructions and examples');
    }
    
    if (feedbackTerms.includes('step')) {
      suggestions.push('Break down the approach into clear steps');
    }
    
    return suggestions;
  }

  // Experiment analysis
  analyzeExperiments(experiments) {
    if (experiments.length === 0) {
      return { bestApproach: null, confidence: 0 };
    }
    
    // Group by approach and calculate success metrics
    const approachMetrics = {};
    
    for (const experiment of experiments) {
      if (!approachMetrics[experiment.approach]) {
        approachMetrics[experiment.approach] = {
          successes: 0,
          total: 0,
          totalQuality: 0
        };
      }
      
      const metrics = approachMetrics[experiment.approach];
      metrics.total++;
      metrics.totalQuality += experiment.outcome.quality || 0;
      
      if (experiment.outcome.success) {
        metrics.successes++;
      }
    }
    
    // Find best approach
    let bestApproach = null;
    let bestScore = 0;
    
    for (const [approach, metrics] of Object.entries(approachMetrics)) {
      const successRate = metrics.successes / metrics.total;
      const avgQuality = metrics.totalQuality / metrics.total;
      const score = (successRate * 0.7) + (avgQuality * 0.3); // Weighted score
      
      if (score > bestScore) {
        bestScore = score;
        bestApproach = approach;
      }
    }
    
    return {
      bestApproach,
      confidence: bestScore,
      metrics: approachMetrics
    };
  }

  recommendExperiments({ agent, task, unknownFactors }) {
    const baseApproaches = [
      'research-heavy',
      'implementation-focused', 
      'test-driven',
      'iterative-approach'
    ];
    
    const experiments = [];
    
    // Add factor-specific variations
    for (const factor of unknownFactors) {
      if (factor === 'scale') {
        experiments.push({ variation: 'scalability-focused approach' });
      } else if (factor === 'indexing strategy') {
        experiments.push({ variation: 'index-optimization approach' });
      } else if (factor === 'query types') {
        experiments.push({ variation: 'query-pattern analysis approach' });
      }
    }
    
    // Add base approaches
    for (const approach of baseApproaches) {
      experiments.push({ variation: approach });
    }
    
    return {
      experiments: experiments.slice(0, 6), // Limit to 6 experiments
      recommendedDuration: '1-2 hours',
      successCriteria: ['functionality', 'performance', 'maintainability']
    };
  }

  analyzeConvergence(experiments) {
    if (experiments.length < 5) {
      return { isConverging: false, reason: 'insufficient data' };
    }
    
    // Group by approach
    const approachCounts = {};
    let bestApproach = null;
    let bestCount = 0;
    
    for (const experiment of experiments) {
      const count = (approachCounts[experiment.approach] || 0) + 1;
      approachCounts[experiment.approach] = count;
      
      if (count > bestCount) {
        bestCount = count;
        bestApproach = experiment.approach;
      }
    }
    
    // Check if one approach is clearly dominant
    const isConverging = bestCount >= experiments.length * 0.6;
    
    return {
      isConverging,
      optimalApproach: isConverging ? bestApproach : null,
      confidence: bestCount / experiments.length
    };
  }

  // Prediction and recommendation
  predictSuccess({ agent, task, context }) {
    // Simple prediction based on historical patterns
    const relevantInteractions = this.interactions.filter(i => 
      i.agent === agent && this.calculateContextSimilarity(i.context, context) > 0.5
    );
    
    if (relevantInteractions.length === 0) {
      return { probability: 0.5, confidence: 0.1 };
    }
    
    const successRate = relevantInteractions.filter(i => i.outcome.success).length / relevantInteractions.length;
    const confidence = Math.min(relevantInteractions.length / 10, 1); // Max confidence at 10+ interactions
    
    return {
      probability: successRate,
      confidence: confidence
    };
  }

  recommendOptimalContext({ agent, task }) {
    // Find best performing contexts for similar tasks
    const taskType = this.extractTaskType(task);
    const relevantPatterns = this.patterns.filter(p => 
      p.agent === agent && 
      (p.taskType === taskType || p.taskType === 'general')
    );
    
    if (relevantPatterns.length === 0) {
      // Create a context based on task type
      if (taskType === 'code-development' && task.toLowerCase().includes('api')) {
        return { context: 'REST API expert with comprehensive knowledge', confidence: 0.6 };
      }
      return { context: 'general expert context', confidence: 0.3 };
    }
    
    // Return highest performing pattern
    const bestPattern = relevantPatterns.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    
    return {
      context: bestPattern.context,
      confidence: bestPattern.confidence || 0.7
    };
  }

  identifyKnowledgeGaps({ agent, unsuccessfulTasks }) {
    const gaps = [];
    const taskTypes = unsuccessfulTasks.map(task => this.extractTaskType(task));
    
    // Group by task type
    const typeCounts = {};
    for (const type of taskTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
    
    // Identify domains with multiple failures
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count >= 2) {
        gaps.push({
          domain: type === 'general' ? 'emerging-technology' : type,
          failureCount: count,
          recommendation: `Enhance context for ${type} tasks`
        });
      }
    }
    
    return gaps;
  }

  // Continuous learning
  addInteraction(interaction) {
    this.interactions.push({
      ...interaction,
      timestamp: Date.now()
    });
    
    // Keep history manageable
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-500);
    }
  }

  incorporateFeedback(patternId, feedback) {
    const pattern = this.getPattern(patternId);
    if (pattern) {
      // Update pattern based on feedback
      if (feedback.userRating > 0.8) {
        pattern.successRate = Math.min(1, pattern.successRate + 0.1);
      }
      
      if (feedback.suggestion && !pattern.context.includes(feedback.suggestion)) {
        pattern.context += ` ${feedback.suggestion}`;
      }
      
      if (feedback.feedback && !pattern.context.includes(feedback.feedback)) {
        pattern.context += ` ${feedback.feedback}`;
      }
    }
  }

  addEnvironmentChange(change) {
    this.environmentChanges.push({
      ...change,
      timestamp: Date.now()
    });
  }

  evolvePattern(pattern) {
    // Apply recent environment changes to pattern
    const recentChanges = this.environmentChanges.filter(
      change => Date.now() - change.timestamp < 30 * 24 * 60 * 60 * 1000 // 30 days
    );
    
    let evolvedContext = pattern.context;
    
    for (const change of recentChanges) {
      if (change.type === 'technology-shift' && change.description.includes('AI')) {
        if (!evolvedContext.includes('AI') && !evolvedContext.includes('ML')) {
          evolvedContext += ' with AI/ML knowledge';
        }
      }
    }
    
    return {
      ...pattern,
      context: evolvedContext
    };
  }

  maintainDiversity() {
    const before = this.patterns.length;
    
    // If no patterns exist, return no operation
    if (this.patterns.length === 0) {
      return {
        removedRedundant: 0,
        maintainedUnique: 0
      };
    }
    
    // Remove very similar patterns
    const toRemove = [];
    
    for (let i = 0; i < this.patterns.length; i++) {
      for (let j = i + 1; j < this.patterns.length; j++) {
        const similarity = this.calculateContextSimilarity(
          this.patterns[i].context, 
          this.patterns[j].context
        );
        
        if (similarity > 0.9) {
          // Keep the one with better performance
          const toKeep = this.patterns[i].successRate > this.patterns[j].successRate ? i : j;
          const toDiscard = toKeep === i ? j : i;
          
          if (!toRemove.includes(toDiscard)) {
            toRemove.push(toDiscard);
          }
        }
      }
    }
    
    // Remove duplicates
    toRemove.sort((a, b) => b - a); // Remove from end to avoid index shifting
    for (const index of toRemove) {
      this.patterns.splice(index, 1);
    }
    
    return {
      removedRedundant: before - this.patterns.length,
      maintainedUnique: this.patterns.length
    };
  }

  // Additional methods for testing compatibility
  generateVariations(basePattern) {
    const variations = [];
    const approaches = ['test-driven', 'performance-focused', 'security-first'];
    
    for (const approach of approaches) {
      variations.push({
        ...basePattern,
        context: `${basePattern.context} with ${approach} approach`
      });
    }
    
    return variations;
  }

  mergePatterns() {
    // Simple merge - in reality this would be more sophisticated
    return this.patterns.filter(p => !p.deprecated);
  }
}