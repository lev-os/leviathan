/**
 * Feedback Loop - Bi-directional communication manager
 * 
 * Implements the core of ADR-008 bi-directional orchestration:
 * 1. Manages callbacks from LLM
 * 2. Adapts workflow based on feedback
 * 3. Enables dynamic context evolution
 * 4. Implements learning and optimization
 */

export class FeedbackLoop {
  constructor(options = {}) {
    // Track pending callbacks
    this.pendingCallbacks = new Map();
    
    // Track feedback history
    this.feedbackHistory = new Map();
    
    // Learning system
    this.learningData = {
      patternSuccess: new Map(),
      contextEffectiveness: new Map(),
      timingMetrics: new Map()
    };
    
    // Configuration
    this.options = {
      defaultTimeout: options.defaultTimeout || 300000, // 5 minutes
      maxRetries: options.maxRetries || 3,
      adaptiveTimeout: options.adaptiveTimeout !== false,
      learningEnabled: options.learningEnabled !== false,
      ...options
    };
  }

  /**
   * Register expectation of a callback
   */
  expectCallback(callbackId, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || this.options.defaultTimeout;
      const retries = options.retries || this.options.maxRetries;
      
      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        const pending = this.pendingCallbacks.get(callbackId);
        if (pending) {
          this.pendingCallbacks.delete(callbackId);
          
          if (pending.retries > 0) {
            // Retry with exponential backoff
            const retryTimeout = timeout * Math.pow(1.5, retries - pending.retries);
            this.expectCallback(callbackId, {
              ...options,
              timeout: retryTimeout,
              retries: pending.retries - 1
            }).then(resolve).catch(reject);
            
          } else {
            reject(new Error(`Callback timeout for ${callbackId}`));
          }
        }
      }, timeout);
      
      // Register callback handler
      this.pendingCallbacks.set(callbackId, {
        resolve,
        reject,
        timeoutHandle,
        startTime: Date.now(),
        retries,
        options
      });
    });
  }

  /**
   * Handle incoming callback from LLM
   */
  async handleCallback(callbackId, response) {
    const pending = this.pendingCallbacks.get(callbackId);
    
    if (!pending) {
      // Unexpected callback - might be late or duplicate
      console.warn(`Unexpected callback for ${callbackId}`);
      return null;
    }
    
    // Clear timeout
    clearTimeout(pending.timeoutHandle);
    
    // Calculate timing
    const duration = Date.now() - pending.startTime;
    
    // Record feedback
    this.recordFeedback(callbackId, response, duration);
    
    // Remove from pending
    this.pendingCallbacks.delete(callbackId);
    
    // Process response
    const processed = await this.processResponse(response, pending.options);
    
    // Resolve promise
    pending.resolve(processed);
    
    // Learn from interaction
    if (this.options.learningEnabled) {
      await this.learn(callbackId, response, duration, processed);
    }
    
    return processed;
  }

  /**
   * Process LLM response
   */
  async processResponse(response, options) {
    // Extract different types of content from response
    const processed = {
      raw: response,
      timestamp: Date.now()
    };
    
    // Handle different response formats
    if (typeof response === 'string') {
      processed.type = 'text';
      processed.content = response;
      
      // Extract structured elements
      processed.markdown = this.extractMarkdown(response);
      processed.code = this.extractCode(response);
      processed.files = this.extractFileReferences(response);
      processed.actionItems = this.extractActionItems(response);
      
    } else if (response && typeof response === 'object') {
      processed.type = 'structured';
      
      // Standard fields
      if (response.output) processed.content = response.output;
      if (response.files) processed.files = response.files;
      if (response.markdown) processed.markdown = response.markdown;
      if (response.code) processed.code = response.code;
      if (response.insights) processed.insights = response.insights;
      if (response.recommendations) processed.recommendations = response.recommendations;
      if (response.nextSteps) processed.nextSteps = response.nextSteps;
      
      // Semantic evaluation results
      if (response.semanticEvaluation) {
        processed.semanticResults = response.semanticEvaluation;
      }
      
      // Callback requests (for further orchestration)
      if (response.callbackRequest) {
        processed.callbackRequest = response.callbackRequest;
      }
    }
    
    // Apply any transformations
    if (options.transform) {
      processed.transformed = await options.transform(processed);
    }
    
    return processed;
  }

  /**
   * Extract markdown sections
   */
  extractMarkdown(text) {
    const sections = [];
    const sectionRegex = /^#{1,6}\s+(.+)$/gm;
    let lastIndex = 0;
    
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        sections.push({
          type: 'content',
          text: text.slice(lastIndex, match.index).trim()
        });
      }
      
      sections.push({
        type: 'heading',
        level: match[0].match(/^#+/)[0].length,
        text: match[1]
      });
      
      lastIndex = sectionRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      sections.push({
        type: 'content',
        text: text.slice(lastIndex).trim()
      });
    }
    
    return sections;
  }

  /**
   * Extract code blocks
   */
  extractCode(text) {
    const blocks = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    let match;
    while ((match = codeRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return blocks;
  }

  /**
   * Extract file references
   */
  extractFileReferences(text) {
    const references = [];
    const fileRegex = /(?:created?|saved?|wrote|updated?|generated?)\s+(?:file\s+)?[`"]?([\w\-\/\.]+\.\w+)[`"]?/gi;
    
    let match;
    while ((match = fileRegex.exec(text)) !== null) {
      references.push({
        filename: match[1],
        context: match[0]
      });
    }
    
    return references;
  }

  /**
   * Extract action items
   */
  extractActionItems(text) {
    const items = [];
    const patterns = [
      /^[-*]\s+\[[ x]\]\s+(.+)$/gm,  // Checkboxes
      /^(?:TODO|FIXME|ACTION):\s+(.+)$/gm,  // Keywords
      /^\d+\.\s+(.+)$/gm  // Numbered lists
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        items.push(match[1].trim());
      }
    }
    
    return items;
  }

  /**
   * Record feedback for analysis
   */
  recordFeedback(callbackId, response, duration) {
    if (!this.feedbackHistory.has(callbackId)) {
      this.feedbackHistory.set(callbackId, []);
    }
    
    this.feedbackHistory.get(callbackId).push({
      timestamp: Date.now(),
      duration,
      responseSize: JSON.stringify(response).length,
      responseType: typeof response
    });
  }

  /**
   * Learn from interaction
   */
  async learn(callbackId, response, duration, processed) {
    // Extract pattern from callback ID
    const pattern = callbackId.split('-')[1] || 'unknown';
    
    // Update timing metrics
    if (!this.learningData.timingMetrics.has(pattern)) {
      this.learningData.timingMetrics.set(pattern, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0
      });
    }
    
    const metrics = this.learningData.timingMetrics.get(pattern);
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    
    // Analyze response quality
    const quality = this.assessResponseQuality(processed);
    
    // Update pattern success
    if (!this.learningData.patternSuccess.has(pattern)) {
      this.learningData.patternSuccess.set(pattern, {
        successes: 0,
        failures: 0,
        averageQuality: 0
      });
    }
    
    const success = this.learningData.patternSuccess.get(pattern);
    if (quality > 0.7) {
      success.successes++;
    } else if (quality < 0.3) {
      success.failures++;
    }
    
    // Update average quality
    success.averageQuality = (
      (success.averageQuality * (success.successes + success.failures - 1) + quality) /
      (success.successes + success.failures)
    );
    
    // Adaptive timeout adjustment
    if (this.options.adaptiveTimeout) {
      this.adjustTimeouts(pattern, metrics);
    }
  }

  /**
   * Assess response quality
   */
  assessResponseQuality(processed) {
    let score = 0;
    let factors = 0;
    
    // Check for content
    if (processed.content && processed.content.length > 50) {
      score += 0.3;
      factors++;
    }
    
    // Check for structure
    if (processed.markdown && processed.markdown.length > 0) {
      score += 0.2;
      factors++;
    }
    
    // Check for actionable elements
    if (processed.actionItems && processed.actionItems.length > 0) {
      score += 0.2;
      factors++;
    }
    
    // Check for code/files
    if ((processed.code && processed.code.length > 0) || 
        (processed.files && processed.files.length > 0)) {
      score += 0.2;
      factors++;
    }
    
    // Check for insights
    if (processed.insights || processed.recommendations) {
      score += 0.1;
      factors++;
    }
    
    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Adjust timeouts based on learning
   */
  adjustTimeouts(pattern, metrics) {
    if (metrics.count < 5) return; // Need more data
    
    const avgDuration = metrics.totalDuration / metrics.count;
    const buffer = 1.5; // 50% buffer
    
    // Suggest new timeout
    const suggestedTimeout = Math.ceil(avgDuration * buffer);
    
    // Store suggestion (adapter can use this)
    if (!this.learningData.timeoutSuggestions) {
      this.learningData.timeoutSuggestions = new Map();
    }
    
    this.learningData.timeoutSuggestions.set(pattern, {
      current: this.options.defaultTimeout,
      suggested: suggestedTimeout,
      confidence: Math.min(metrics.count / 20, 1) // Full confidence at 20 samples
    });
  }

  /**
   * Get learning insights
   */
  getLearningInsights() {
    const insights = {
      patterns: {},
      timing: {},
      suggestions: []
    };
    
    // Pattern insights
    for (const [pattern, data] of this.learningData.patternSuccess) {
      insights.patterns[pattern] = {
        successRate: data.successes / (data.successes + data.failures),
        averageQuality: data.averageQuality,
        totalInteractions: data.successes + data.failures
      };
    }
    
    // Timing insights
    for (const [pattern, metrics] of this.learningData.timingMetrics) {
      insights.timing[pattern] = {
        averageDuration: metrics.totalDuration / metrics.count,
        minDuration: metrics.minDuration,
        maxDuration: metrics.maxDuration,
        sampleSize: metrics.count
      };
    }
    
    // Timeout suggestions
    if (this.learningData.timeoutSuggestions) {
      for (const [pattern, suggestion] of this.learningData.timeoutSuggestions) {
        if (suggestion.confidence > 0.7) {
          insights.suggestions.push({
            pattern,
            currentTimeout: suggestion.current,
            suggestedTimeout: suggestion.suggested,
            confidence: suggestion.confidence,
            reason: 'Based on observed response times'
          });
        }
      }
    }
    
    return insights;
  }

  /**
   * Handle adaptive workflow modification
   */
  async adaptWorkflow(orchestrationId, feedback) {
    // @llm-note: This is where we would implement dynamic workflow adaptation
    // based on feedback from the LLM
    
    const adaptations = {
      skipSteps: [],
      addSteps: [],
      modifyParameters: {},
      switchStrategy: null
    };
    
    // Analyze feedback for adaptation signals
    if (feedback.semanticResults?.confidence < 0.3) {
      // Low confidence - might need additional validation step
      adaptations.addSteps.push({
        type: 'validation',
        reason: 'Low confidence in previous step'
      });
    }
    
    if (feedback.semanticResults?.suggestAlternative) {
      // LLM suggests different approach
      adaptations.switchStrategy = feedback.semanticResults.suggestAlternative;
    }
    
    if (feedback.callbackRequest?.skipNext) {
      // LLM indicates next step unnecessary
      adaptations.skipSteps.push(feedback.callbackRequest.skipNext);
    }
    
    return adaptations;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      pendingCallbacks: this.pendingCallbacks.size,
      feedbackHistorySize: this.feedbackHistory.size,
      learningInsights: this.getLearningInsights()
    };
  }

  /**
   * Clear pending callbacks
   */
  clearPending() {
    for (const [id, pending] of this.pendingCallbacks) {
      clearTimeout(pending.timeoutHandle);
      pending.reject(new Error('Feedback loop cleared'));
    }
    this.pendingCallbacks.clear();
  }
}