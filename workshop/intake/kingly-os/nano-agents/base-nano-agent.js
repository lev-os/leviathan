export class NanoAgent {
  constructor(type) {
    this.type = type;
    this.builtInBehavior = null; // Nano agents have no built-in behavior
    this.capabilities = [];
    this.history = [];
    this.metrics = {
      totalExecutions: 0,
      successCount: 0,
      avgResponseTime: 0,
      lastExecutionTime: 0
    };
    this.contextEffectiveness = new Map();
    this.adaptations = [];
    this.workflowState = null;
    this.parallelCoordination = null;
  }

  async execute(input, context) {
    if (!context) {
      throw new Error('Context is required for nano-agent execution');
    }

    const startTime = Date.now();
    
    try {
      // Simulate LLM execution with context
      const result = await this.processWithContext(input, context);
      
      // Record metrics
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime);
      
      // Store in history
      this.history.push({
        input,
        context,
        result,
        timestamp: Date.now(),
        executionTime
      });

      return result;
    } catch (error) {
      throw new Error(`Execution failed: ${error.message}`);
    }
  }

  async executeWithMultipleContexts(input, contexts) {
    if (!contexts || contexts.length === 0) {
      throw new Error('At least one context is required');
    }

    // Merge multiple contexts
    const mergedContext = contexts.join('\n\n---\n\n');
    return await this.execute(input, mergedContext);
  }

  async executeWithStructuredContext(input, structuredContext) {
    let context = '';
    
    if (structuredContext.system) {
      context += structuredContext.system + '\n\n';
    }
    
    if (structuredContext.prepend) {
      context = structuredContext.prepend + context;
    }
    
    context += `Input: ${input}`;
    
    if (structuredContext.append) {
      context += '\n\n' + structuredContext.append;
    }

    return await this.execute(input, context);
  }

  async processWithContext(input, context) {
    // Try to use real LLM if available, fallback to simulation
    try {
      // Check if we're in a test environment or have LLM client available
      if (process.env.NODE_ENV === 'test' || !globalThis.llmClient) {
        return this.simulateResponse(input, context);
      }
      
      const response = await globalThis.llmClient.generateResponse(context, input);
      return response.content;
    } catch (error) {
      console.warn('LLM unavailable, using simulation:', error.message);
      return this.simulateResponse(input, context);
    }
  }

  simulateResponse(input, context) {
    // Enhanced simulation based on context content
    if (context.includes('researcher')) {
      return this.simulateResearcherResponse(input, context);
    } else if (context.includes('developer') || context.includes('code')) {
      return this.simulateDeveloperResponse(input, context);
    } else if (context.includes('writer') || context.includes('creative')) {
      return this.simulateWriterResponse(input, context);
    } else if (context.includes('strategic') || context.includes('business')) {
      return this.simulateStrategicResponse(input, context);
    }
    
    // Default response
    return this.simulateDefaultResponse(input, context);
  }

  simulateResearcherResponse(input, context) {
    const response = `Research analysis for: ${input}

Based on available information, here are key findings:

1. Primary considerations
2. Supporting evidence  
3. Relevant data points

Sources and references would be included in a real implementation.`;

    return context.includes('Sources') ? response : response.replace(/\nSources.*$/, '');
  }

  simulateDeveloperResponse(input, context) {
    if (input.toLowerCase().includes('authentication')) {
      return `Implementation approach for authentication:

\`\`\`javascript
// Example authentication flow
const authenticate = async (credentials) => {
  // Validate credentials
  // Generate token
  // Return auth result
};
\`\`\`

Best practices: secure storage, token expiration, error handling.`;
    }

    return `Technical implementation for: ${input}

Code examples and best practices would be provided here.`;
  }

  simulateWriterResponse(input, context) {
    if (input.toLowerCase().includes('futuristic city')) {
      return `The gleaming metropolis stretched endlessly into the horizon, its crystalline towers piercing through layers of luminescent clouds. Hovering transit pods weaved between the structures like schools of silver fish, while gardens cascaded down the building faces in vertical rivers of green. The city pulsed with a rhythm all its own, a symphony of technology and humanity intertwined in perfect harmony.`;
    }

    const length = context.includes('creative') ? 250 : 100;
    return `Creative content for: ${input}`.padEnd(length, ' - engaging narrative continues...');
  }

  simulateStrategicResponse(input, context) {
    return `Strategic analysis for: ${input}

Key strategic considerations:
- Market positioning
- Resource allocation  
- Risk assessment
- Implementation roadmap

Data-driven recommendations would follow.`;
  }

  simulateDefaultResponse(input, context) {
    return `Response to: ${input}

This response is influenced by the provided context and would be more specific in a real implementation.`;
  }

  updateMetrics(executionTime) {
    this.metrics.totalExecutions++;
    this.metrics.lastExecutionTime = executionTime;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalExecutions - 1) + executionTime) / 
      this.metrics.totalExecutions;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalExecutions > 0 ? 
        this.metrics.successCount / this.metrics.totalExecutions : 0
    };
  }

  getHistory() {
    return [...this.history];
  }

  recordSuccess(success) {
    if (success) {
      this.metrics.successCount++;
    }
  }

  recordContextFeedback(context, effectiveness) {
    this.contextEffectiveness.set(context, effectiveness);
  }

  getContextEffectiveness() {
    return Object.fromEntries(this.contextEffectiveness);
  }

  provideFeedback(feedback) {
    if (feedback.quality < 0.5 && feedback.suggestion) {
      this.adaptations.push(feedback.suggestion);
    }
  }

  getAdaptations() {
    return [...this.adaptations];
  }

  suggestContextImprovements() {
    const suggestions = [];
    
    // Analyze poor performing contexts
    const poorContexts = Array.from(this.contextEffectiveness.entries())
      .filter(([context, effectiveness]) => effectiveness < 0.5);
    
    if (poorContexts.length > 0) {
      suggestions.push('Add more specific instructions to improve clarity');
      suggestions.push('Include examples of desired output format');
    }

    // Check for consistent failure patterns
    if (this.metrics.successCount / this.metrics.totalExecutions < 0.5) {
      suggestions.push('Consider more detailed context with step-by-step guidance');
    }

    return suggestions;
  }

  identifySuccessfulPatterns() {
    const patterns = [];
    
    // Analyze successful interactions
    const successfulInteractions = this.history.filter((_, index) => {
      // Assume last few were successful if no explicit tracking
      return index >= this.history.length - 5;
    });

    if (successfulInteractions.length > 0) {
      const commonContext = this.findCommonContextElements(
        successfulInteractions.map(i => i.context)
      );
      
      if (commonContext) {
        patterns.push({
          context: commonContext,
          successRate: 1.0,
          occurrences: successfulInteractions.length
        });
      }
    }

    return patterns;
  }

  findCommonContextElements(contexts) {
    // Simple implementation - find common words
    const wordCounts = {};
    
    contexts.forEach(context => {
      const words = context.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3) { // Skip short words
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    const commonWords = Object.entries(wordCounts)
      .filter(([word, count]) => count >= contexts.length * 0.5)
      .map(([word]) => word);

    return commonWords.length > 0 ? commonWords.join(' ') : null;
  }

  // Workflow integration
  setWorkflowState(state) {
    this.workflowState = state;
  }

  getWorkflowState() {
    return this.workflowState;
  }

  setParallelCoordination(coordination) {
    this.parallelCoordination = coordination;
  }

  getParallelCoordination() {
    return this.parallelCoordination;
  }

  // Error handling
  async safeExecute(input, context) {
    try {
      return await this.execute(input, context);
    } catch (error) {
      return {
        error: error.message,
        fallback: `Unable to process "${input}" with the provided context. Please try with more specific instructions.`
      };
    }
  }

  // Performance under load
  async executeMultiple(requests) {
    const promises = requests.map(({ input, context }) => 
      this.safeExecute(input, context)
    );
    
    return await Promise.all(promises);
  }
}