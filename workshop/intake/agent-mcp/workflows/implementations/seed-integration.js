/**
 * Integration example for @kingly/seed system
 * Shows how to add workflow capabilities to the existing orchestrator
 */

import { WorkflowOrchestrator } from './workflow-orchestrator.js';

/**
 * Enhanced Orchestrator with Workflow Support
 * Extends the base @kingly/seed orchestrator with advanced workflow capabilities
 */
export class EnhancedOrchestrator {
  constructor(baseOrchestrator) {
    this.baseOrchestrator = baseOrchestrator;
    this.workflowOrchestrator = new WorkflowOrchestrator();
    this.workflowMode = false; // Toggle between base and workflow modes
    this.workflowThreshold = 0.7; // Complexity threshold for workflow activation
  }

  /**
   * Route request - decides whether to use base orchestrator or workflow system
   */
  async route(request, context = {}) {
    // First, use base orchestrator to understand the request
    const baseRouting = await this.baseOrchestrator.route(request);
    
    // Analyze if this request would benefit from workflow orchestration
    const shouldUseWorkflow = await this.shouldUseWorkflow(request, baseRouting, context);
    
    if (shouldUseWorkflow) {
      console.log('🔄 Activating workflow orchestration for complex task');
      return await this.routeWithWorkflow(request, baseRouting, context);
    } else {
      console.log('⚡ Using standard orchestration');
      return baseRouting;
    }
  }

  /**
   * Determine if a request should use workflow orchestration
   */
  async shouldUseWorkflow(request, baseRouting, context) {
    // Override: User explicitly requests workflow mode
    if (context.forceWorkflow || this.workflowMode) {
      return true;
    }

    // Check complexity indicators
    const complexityScore = this.assessRequestComplexity(request, baseRouting);
    
    // Check if multiple agents would be beneficial
    const multiAgentBenefit = this.assessMultiAgentBenefit(request, baseRouting);
    
    // Check if task has quality/collaboration requirements
    const collaborationNeed = this.assessCollaborationNeed(request);
    
    const workflowScore = (complexityScore + multiAgentBenefit + collaborationNeed) / 3;
    
    console.log(`Workflow assessment: complexity=${complexityScore.toFixed(2)}, multiAgent=${multiAgentBenefit.toFixed(2)}, collaboration=${collaborationNeed.toFixed(2)}, overall=${workflowScore.toFixed(2)}`);
    
    return workflowScore >= this.workflowThreshold;
  }

  assessRequestComplexity(request, baseRouting) {
    let complexity = 0;
    
    // Text length indicator
    if (request.length > 200) complexity += 0.2;
    if (request.length > 500) complexity += 0.3;
    
    // Keyword indicators
    const complexKeywords = [
      'implement', 'architecture', 'system', 'integrate', 'complex',
      'multiple', 'phases', 'requirements', 'stakeholders', 'enterprise'
    ];
    
    const foundKeywords = complexKeywords.filter(keyword => 
      request.toLowerCase().includes(keyword)
    ).length;
    
    complexity += Math.min(0.5, foundKeywords * 0.1);
    
    // Agent confidence (lower confidence = higher complexity)
    if (baseRouting.confidence < 0.8) {
      complexity += (0.8 - baseRouting.confidence) * 0.5;
    }
    
    return Math.min(1.0, complexity);
  }

  assessMultiAgentBenefit(request, baseRouting) {
    let benefit = 0;
    
    // Keywords indicating multi-agent work
    const multiAgentKeywords = [
      'collaborate', 'team', 'review', 'validate', 'test',
      'design and implement', 'plan and execute', 'research and develop'
    ];
    
    const foundKeywords = multiAgentKeywords.filter(keyword => 
      request.toLowerCase().includes(keyword)
    ).length;
    
    benefit += Math.min(0.6, foundKeywords * 0.2);
    
    // Task decomposition indicators
    if (request.includes(' and ') || request.includes(', ')) {
      benefit += 0.2;
    }
    
    // Explicit mentions of multiple roles/skills
    const roleKeywords = ['design', 'implement', 'test', 'review', 'document', 'plan'];
    const roleCount = roleKeywords.filter(role => request.toLowerCase().includes(role)).length;
    
    if (roleCount > 2) {
      benefit += 0.3;
    }
    
    return Math.min(1.0, benefit);
  }

  assessCollaborationNeed(request) {
    let need = 0;
    
    // Quality-focused keywords
    const qualityKeywords = ['quality', 'review', 'validate', 'test', 'secure', 'robust'];
    const qualityCount = qualityKeywords.filter(keyword => 
      request.toLowerCase().includes(keyword)
    ).length;
    
    need += Math.min(0.4, qualityCount * 0.15);
    
    // Collaboration keywords
    const collaborationKeywords = ['collaborate', 'team', 'together', 'coordinate', 'align'];
    const collaborationCount = collaborationKeywords.filter(keyword => 
      request.toLowerCase().includes(keyword)
    ).length;
    
    need += Math.min(0.4, collaborationCount * 0.2);
    
    // Competition/challenge keywords (for adversarial workflows)
    const competitionKeywords = ['compete', 'challenge', 'improve', 'optimize', 'best'];
    const competitionCount = competitionKeywords.filter(keyword => 
      request.toLowerCase().includes(keyword)
    ).length;
    
    need += Math.min(0.3, competitionCount * 0.15);
    
    return Math.min(1.0, need);
  }

  /**
   * Route using workflow orchestration
   */
  async routeWithWorkflow(request, baseRouting, context) {
    // Convert request to task format
    const task = this.convertRequestToTask(request, baseRouting, context);
    
    // Get available agents (simulate - in real implementation, this would come from agent registry)
    const availableAgents = await this.getAvailableAgents(baseRouting);
    
    // Get workflow recommendations
    const recommendations = await this.workflowOrchestrator.getWorkflowRecommendations(
      task, availableAgents, context
    );
    
    // Return enhanced routing with workflow information
    return {
      ...baseRouting,
      workflowMode: true,
      task: task,
      availableAgents: availableAgents,
      workflowRecommendations: recommendations,
      selectedWorkflow: recommendations[0], // Best recommendation
      executeWithWorkflow: async () => {
        return await this.workflowOrchestrator.executeTask(task, availableAgents, context);
      }
    };
  }

  convertRequestToTask(request, baseRouting, context) {
    // Extract task information from request
    const task = {
      id: `task-${Date.now()}`,
      title: this.extractTaskTitle(request),
      description: request,
      requirements: this.extractRequirements(request),
      complexity: this.assessTaskComplexity(request),
      estimatedAgents: this.estimateRequiredAgents(request),
      qualityLevel: this.extractQualityLevel(request, context),
      urgent: this.extractUrgency(request, context),
      deadline: context.deadline || null,
      riskTolerance: context.riskTolerance || 'medium',
      stakeholders: context.stakeholders || [],
      technologies: this.extractTechnologies(request),
      dependencies: context.dependencies || []
    };
    
    return task;
  }

  extractTaskTitle(request) {
    // Simple title extraction - first sentence or first 50 chars
    const firstSentence = request.split('.')[0];
    return firstSentence.length <= 80 ? firstSentence : request.substring(0, 50) + '...';
  }

  extractRequirements(request) {
    // Extract numbered or bulleted requirements
    const requirements = [];
    
    // Look for numbered lists
    const numberedMatches = request.match(/\d+\.\s+([^\n]+)/g);
    if (numberedMatches) {
      requirements.push(...numberedMatches.map(match => match.replace(/\d+\.\s+/, '')));
    }
    
    // Look for bulleted lists
    const bulletMatches = request.match(/[-*]\s+([^\n]+)/g);
    if (bulletMatches) {
      requirements.push(...bulletMatches.map(match => match.replace(/[-*]\s+/, '')));
    }
    
    // If no explicit requirements, extract key phrases
    if (requirements.length === 0) {
      const keyPhrases = this.extractKeyPhrases(request);
      requirements.push(...keyPhrases.slice(0, 5)); // Max 5 inferred requirements
    }
    
    return requirements;
  }

  extractKeyPhrases(request) {
    // Simple key phrase extraction
    const phrases = [];
    const words = request.toLowerCase().split(/\s+/);
    
    // Look for imperative verbs followed by objects
    const imperativeVerbs = ['create', 'build', 'implement', 'design', 'develop', 'test', 'deploy'];
    
    for (let i = 0; i < words.length - 1; i++) {
      if (imperativeVerbs.includes(words[i])) {
        // Extract phrase from verb to next sentence/clause boundary
        const phraseEnd = Math.min(i + 5, words.length);
        const phrase = words.slice(i, phraseEnd).join(' ');
        phrases.push(phrase);
      }
    }
    
    return phrases;
  }

  assessTaskComplexity(request) {
    // Same as assessRequestComplexity but returns categorical value
    const score = this.assessRequestComplexity(request, { confidence: 0.8 });
    
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  estimateRequiredAgents(request) {
    const complexity = this.assessTaskComplexity(request);
    const baseAgents = { low: 2, medium: 3, high: 5 };
    
    // Adjust based on explicit indicators
    let agents = baseAgents[complexity];
    
    if (request.includes('team') || request.includes('collaborate')) agents += 1;
    if (request.includes('review') || request.includes('validate')) agents += 1;
    if (request.includes('large') || request.includes('enterprise')) agents += 2;
    
    return Math.min(10, agents); // Cap at 10 agents
  }

  extractQualityLevel(request, context) {
    if (context.qualityLevel) return context.qualityLevel;
    
    const qualityKeywords = {
      high: ['critical', 'production', 'enterprise', 'secure', 'robust'],
      medium: ['quality', 'reliable', 'stable', 'professional'],
      low: ['quick', 'prototype', 'draft', 'simple']
    };
    
    for (const [level, keywords] of Object.entries(qualityKeywords)) {
      if (keywords.some(keyword => request.toLowerCase().includes(keyword))) {
        return level;
      }
    }
    
    return 'medium'; // Default
  }

  extractUrgency(request, context) {
    if (context.urgent !== undefined) return context.urgent;
    
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'quick', 'fast', 'rush'];
    return urgentKeywords.some(keyword => request.toLowerCase().includes(keyword));
  }

  extractTechnologies(request) {
    const techKeywords = [
      'react', 'vue', 'angular', 'node', 'python', 'java', 'javascript',
      'typescript', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'mysql', 'postgresql', 'mongodb', 'redis', 'api', 'rest', 'graphql'
    ];
    
    return techKeywords.filter(tech => request.toLowerCase().includes(tech));
  }

  async getAvailableAgents(baseRouting) {
    // In real implementation, this would query the agent registry
    // For now, simulate based on the base routing
    
    const mockAgents = [
      { id: 'ceo', capabilities: ['planning', 'strategy', 'coordination'] },
      { id: 'dev', capabilities: ['implementation', 'coding', 'testing'] },
      { id: 'design', capabilities: ['design', 'ui', 'ux'] },
      { id: 'analyst', capabilities: ['analysis', 'research', 'documentation'] },
      { id: 'qa', capabilities: ['testing', 'quality', 'validation'] }
    ];
    
    // Add more agents based on complexity
    if (baseRouting.confidence < 0.6) {
      mockAgents.push(
        { id: 'specialist1', capabilities: ['security', 'optimization'] },
        { id: 'specialist2', capabilities: ['architecture', 'scaling'] }
      );
    }
    
    return mockAgents;
  }

  /**
   * Execute request - handles both standard and workflow modes
   */
  async execute(request, context = {}) {
    const routing = await this.route(request, context);
    
    if (routing.workflowMode) {
      console.log(`🚀 Executing with workflow: ${routing.selectedWorkflow.name}`);
      return await routing.executeWithWorkflow();
    } else {
      console.log('⚡ Executing with standard orchestration');
      return await this.baseOrchestrator.execute(request);
    }
  }

  /**
   * Configuration methods
   */
  enableWorkflowMode() {
    this.workflowMode = true;
    console.log('✅ Workflow mode enabled - all requests will use workflow orchestration');
  }

  disableWorkflowMode() {
    this.workflowMode = false;
    console.log('❌ Workflow mode disabled - using standard orchestration');
  }

  setWorkflowThreshold(threshold) {
    this.workflowThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`📊 Workflow threshold set to ${this.workflowThreshold}`);
  }

  /**
   * Analytics and monitoring
   */
  getStatistics() {
    const baseStats = this.baseOrchestrator.getStatistics?.() || {};
    const workflowStats = this.workflowOrchestrator.getStatistics();
    
    return {
      ...baseStats,
      workflows: workflowStats,
      configuration: {
        workflowMode: this.workflowMode,
        workflowThreshold: this.workflowThreshold
      }
    };
  }

  /**
   * Get workflow recommendations without executing
   */
  async analyzeRequest(request, context = {}) {
    const routing = await this.route(request, context);
    
    return {
      useWorkflow: routing.workflowMode,
      baseAgent: routing.agent,
      confidence: routing.confidence,
      workflowRecommendations: routing.workflowRecommendations || [],
      task: routing.task,
      reasoning: this.generateAnalysisReasoning(routing, request)
    };
  }

  generateAnalysisReasoning(routing, request) {
    const reasoning = [];
    
    if (routing.workflowMode) {
      reasoning.push('Workflow orchestration recommended due to:');
      
      if (routing.task.complexity === 'high') {
        reasoning.push('- High task complexity detected');
      }
      
      if (routing.availableAgents.length > 3) {
        reasoning.push('- Multiple specialized agents would benefit collaboration');
      }
      
      if (routing.task.qualityLevel === 'high') {
        reasoning.push('- High quality requirements suggest adversarial review processes');
      }
      
      if (routing.workflowRecommendations.length > 0) {
        reasoning.push(`- Best workflow: ${routing.workflowRecommendations[0].name}`);
        reasoning.push(`  Reason: ${routing.workflowRecommendations[0].recommendationReason}`);
      }
    } else {
      reasoning.push('Standard orchestration sufficient:');
      reasoning.push(`- Routing to ${routing.agent} agent with ${(routing.confidence * 100).toFixed(1)}% confidence`);
      reasoning.push('- Task complexity and collaboration needs are manageable with single agent');
    }
    
    return reasoning.join('\n');
  }
}

/**
 * Factory function to create enhanced orchestrator
 */
export function createEnhancedOrchestrator(baseOrchestrator) {
  return new EnhancedOrchestrator(baseOrchestrator);
}

/**
 * Example usage:
 */
export function exampleUsage() {
  return `
// Integration with @kingly/seed system

import { createEnhancedOrchestrator } from './seed-integration.js';
import { MinimalOrchestrator } from '@kingly/seed';

// Create enhanced orchestrator
const baseOrchestrator = new MinimalOrchestrator();
const orchestrator = createEnhancedOrchestrator(baseOrchestrator);

// Configure
orchestrator.setWorkflowThreshold(0.6); // Lower threshold = more workflow usage

// Example requests
const simpleRequest = "implement a login function";
const complexRequest = "design and implement a scalable e-commerce platform with user authentication, payment processing, inventory management, and admin dashboard";

// Analyze without executing
const simpleAnalysis = await orchestrator.analyzeRequest(simpleRequest);
// Result: useWorkflow: false, baseAgent: 'dev'

const complexAnalysis = await orchestrator.analyzeRequest(complexRequest);
// Result: useWorkflow: true, workflowRecommendations: [HierarchicalBiddingCascade, ...]

// Execute with automatic workflow selection
const simpleResult = await orchestrator.execute(simpleRequest);
const complexResult = await orchestrator.execute(complexRequest);

// Force workflow mode for experimentation
orchestrator.enableWorkflowMode();
const forcedWorkflowResult = await orchestrator.execute(simpleRequest);

// Get statistics
const stats = orchestrator.getStatistics();
console.log('Execution statistics:', stats);
`;
}
`;
}