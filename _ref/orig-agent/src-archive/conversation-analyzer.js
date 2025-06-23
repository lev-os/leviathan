/**
 * Conversation Analyzer - Detects task opportunities in user messages
 */

export class ConversationAnalyzer {
  constructor() {
    this.taskIndicators = [
      // Direct requests
      /\b(build|create|implement|develop|make|add|setup|integrate)\b/i,
      /\b(fix|debug|solve|repair|resolve|update|refactor)\b/i,
      /\b(analyze|research|investigate|explore|evaluate)\b/i,
      
      // Need expressions
      /\b(need|want|would like|looking for|trying to)\b/i,
      /\b(can you|could you|please|help me)\b/i,
      
      // Problem statements
      /\b(issue|problem|error|bug|broken|failing)\b/i,
      /\b(doesn't work|not working|can't|unable to)\b/i
    ];
    
    this.nonTaskIndicators = [
      // Questions
      /^(what|when|where|who|why|how|is|are|do|does|can|could|should|would)\b/i,
      
      // Explanations
      /\b(explain|describe|tell me about|clarify)\b/i,
      
      // Confirmations
      /\b(yes|no|okay|sure|thanks|got it)\b/i,
      /^[0-9]+$/ // Just a number (menu selection)
    ];
  }

  /**
   * Analyze message for task potential
   */
  analyzeMessage(message) {
    // Quick exit for short messages
    if (message.length < 10) {
      return { hasTaskPotential: false, confidence: 0 };
    }
    
    // Check for non-task indicators first
    for (const pattern of this.nonTaskIndicators) {
      if (pattern.test(message)) {
        return { hasTaskPotential: false, confidence: 0, reason: 'question_or_confirmation' };
      }
    }
    
    // Check for task indicators
    let matches = 0;
    let matchedPatterns = [];
    
    for (const pattern of this.taskIndicators) {
      if (pattern.test(message)) {
        matches++;
        matchedPatterns.push(pattern.source);
      }
    }
    
    // Calculate confidence
    const confidence = Math.min(matches * 0.3, 0.9);
    
    // Extract potential tasks
    const potentialTasks = this.extractPotentialTasks(message);
    
    return {
      hasTaskPotential: confidence > 0.3,
      confidence: confidence,
      matchedPatterns: matchedPatterns,
      potentialTasks: potentialTasks,
      reason: matches > 0 ? 'task_indicators_found' : 'no_clear_task'
    };
  }

  /**
   * Extract potential task descriptions
   */
  extractPotentialTasks(message) {
    const tasks = [];
    
    // Pattern 1: "I need to X"
    const needPattern = /(?:i need to|i want to|need to|want to)\s+([^.!?]+)/gi;
    let match;
    while ((match = needPattern.exec(message)) !== null) {
      tasks.push({
        title: this.cleanTaskTitle(match[1]),
        confidence: 0.8,
        source: 'need_expression'
      });
    }
    
    // Pattern 2: "Build/Create X"
    const actionPattern = /\b(build|create|implement|develop|fix|add|setup)\s+(?:a\s+|an\s+|the\s+)?([^.!?,]+)/gi;
    while ((match = actionPattern.exec(message)) !== null) {
      tasks.push({
        title: `${match[1]} ${match[2]}`.trim(),
        confidence: 0.9,
        source: 'action_verb'
      });
    }
    
    // Pattern 3: Problem statements
    const problemPattern = /\b(?:the\s+)?([^.!?]+)\s+(?:is|isn't|doesn't|won't|can't)\s+([^.!?]+)/gi;
    while ((match = problemPattern.exec(message)) !== null) {
      tasks.push({
        title: `Fix: ${match[1]} ${match[2]}`.trim(),
        confidence: 0.7,
        source: 'problem_statement'
      });
    }
    
    // Deduplicate and clean
    const uniqueTasks = this.deduplicateTasks(tasks);
    
    return uniqueTasks.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Generate task recommendations with options
   */
  generateTaskRecommendations(analysis, originalMessage) {
    if (!analysis.hasTaskPotential) {
      return null;
    }
    
    const recommendations = {
      message: `I detected potential tasks in your message.`,
      confidence: analysis.confidence,
      options: []
    };
    
    // Add detected tasks as options
    analysis.potentialTasks.forEach((task, idx) => {
      recommendations.options.push({
        number: idx + 1,
        action: `Create task: "${task.title}"`,
        confidence: task.confidence,
        command: `create_task("${task.title}", "${originalMessage}", "current-project")`
      });
    });
    
    // Add option to create custom task
    recommendations.options.push({
      number: analysis.potentialTasks.length + 1,
      action: 'Create different task',
      description: 'Specify your own task description'
    });
    
    // Add option to continue conversation
    recommendations.options.push({
      number: analysis.potentialTasks.length + 2,
      action: 'Continue conversation',
      description: 'No tasks needed right now'
    });
    
    return recommendations;
  }

  /**
   * Helper methods
   */
  cleanTaskTitle(title) {
    return title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.!?]+$/, '')
      .substring(0, 100); // Max length
  }

  deduplicateTasks(tasks) {
    const seen = new Set();
    return tasks.filter(task => {
      const key = task.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export default ConversationAnalyzer;