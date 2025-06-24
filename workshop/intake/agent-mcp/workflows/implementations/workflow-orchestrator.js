/**
 * Workflow Orchestrator
 * Manages and selects appropriate workflows for different tasks
 */

import { HierarchicalBiddingCascade } from './hierarchical-bidding-cascade.js';
import { ReputationWeightedCoalition } from './reputation-weighted-coalition.js';
import { AdversarialQualityAssurance } from './adversarial-quality-assurance.js';

export class WorkflowOrchestrator {
  constructor() {
    this.workflows = new Map();
    this.workflowHistory = [];
    this.performanceMetrics = new Map();
    this.taskPatterns = new Map();
    
    this.initializeWorkflows();
  }

  initializeWorkflows() {
    // Register available workflows
    this.registerWorkflow(new HierarchicalBiddingCascade());
    this.registerWorkflow(new ReputationWeightedCoalition());
    this.registerWorkflow(new AdversarialQualityAssurance());
    
    // TODO: Add remaining workflows as they're implemented
    // this.registerWorkflow(new DynamicSkillMarketExchange());
    // this.registerWorkflow(new EvolutionaryStrategyTournament());
    // this.registerWorkflow(new TrustBasedProgressiveDisclosure());
    // this.registerWorkflow(new SwarmIntelligenceConsensus());
    // this.registerWorkflow(new ResourceScarcityCompetition());
    // this.registerWorkflow(new DiplomaticAllianceNetworks());
    // this.registerWorkflow(new AdaptiveMetamorphosisWorkflows());
    
    console.log(`Workflow orchestrator initialized with ${this.workflows.size} workflows`);
  }

  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, workflow);
    this.performanceMetrics.set(workflow.id, {
      totalExecutions: 0,
      successRate: 0,
      averageQuality: 0,
      averageDuration: 0,
      lastUsed: null,
      preferredTaskTypes: []
    });
    
    console.log(`Registered workflow: ${workflow.name}`);
  }

  /**
   * Select the best workflow for a given task
   */
  async selectWorkflow(task, agents, context = {}) {
    console.log(`Selecting workflow for task: ${task.title}`);
    
    const taskSignature = this.generateTaskSignature(task);
    const candidates = await this.evaluateWorkflowCandidates(task, agents, context);
    
    // Select based on composite scoring
    const selectedWorkflow = this.selectBestCandidate(candidates, task, context);
    
    // Update task patterns for future learning
    this.updateTaskPatterns(taskSignature, selectedWorkflow.id);
    
    console.log(`Selected workflow: ${selectedWorkflow.name} (score: ${selectedWorkflow.score.toFixed(3)})`);
    return selectedWorkflow;
  }

  generateTaskSignature(task) {
    // Create a signature for pattern matching
    const features = {
      complexity: this.assessTaskComplexity(task),
      agentCount: task.estimatedAgents || 3,
      timeConstraint: task.deadline ? 'urgent' : 'normal',
      qualityRequirement: task.qualityLevel || 'medium',
      riskTolerance: task.riskTolerance || 'medium',
      collaborationType: this.inferCollaborationType(task)
    };
    
    return JSON.stringify(features);
  }

  assessTaskComplexity(task) {
    const indicators = [
      task.description?.length > 500,
      task.requirements?.length > 5,
      task.dependencies?.length > 3,
      task.stakeholders?.length > 2,
      task.technologies?.length > 3
    ];
    
    const complexityScore = indicators.filter(Boolean).length;
    return complexityScore > 3 ? 'high' : complexityScore > 1 ? 'medium' : 'low';
  }

  inferCollaborationType(task) {
    const description = task.description?.toLowerCase() || '';
    
    if (description.includes('compete') || description.includes('challenge')) return 'competitive';
    if (description.includes('quality') || description.includes('review')) return 'adversarial';
    if (description.includes('research') || description.includes('explore')) return 'collaborative';
    if (description.includes('urgent') || description.includes('fast')) return 'hierarchical';
    
    return 'balanced';
  }

  async evaluateWorkflowCandidates(task, agents, context) {
    const candidates = [];
    
    for (const [workflowId, workflow] of this.workflows) {
      const score = await this.calculateWorkflowScore(workflow, task, agents, context);
      const suitability = this.calculateSuitability(workflow, task);
      const performance = this.getHistoricalPerformance(workflowId);
      
      candidates.push({
        ...workflow,
        score: score,
        suitability: suitability,
        performance: performance,
        compositeScore: this.calculateCompositeScore(score, suitability, performance)
      });
    }
    
    return candidates.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  async calculateWorkflowScore(workflow, task, agents, context) {
    // Score based on workflow characteristics and task requirements
    let score = 0.5; // Base score
    
    // Agent count compatibility
    const requiredAgents = this.estimateRequiredAgents(task);
    const agentCountScore = this.scoreAgentCountCompatibility(workflow, requiredAgents, agents.length);
    score += agentCountScore * 0.2;
    
    // Task complexity compatibility
    const complexityScore = this.scoreComplexityCompatibility(workflow, task);
    score += complexityScore * 0.2;
    
    // Collaboration type fit
    const collaborationScore = this.scoreCollaborationFit(workflow, task);
    score += collaborationScore * 0.3;
    
    // Resource requirements
    const resourceScore = this.scoreResourceCompatibility(workflow, task, context);
    score += resourceScore * 0.1;
    
    // Quality vs speed tradeoff
    const tradeoffScore = this.scoreQualitySpeedTradeoff(workflow, task);
    score += tradeoffScore * 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  estimateRequiredAgents(task) {
    const complexity = this.assessTaskComplexity(task);
    const baseAgents = { low: 2, medium: 3, high: 5 };
    return baseAgents[complexity];
  }

  scoreAgentCountCompatibility(workflow, requiredAgents, availableAgents) {
    const workflowPreferences = {
      'hierarchical-bidding-cascade': { min: 3, optimal: 5, max: 10 },
      'reputation-weighted-coalition': { min: 3, optimal: 4, max: 8 },
      'adversarial-quality-assurance': { min: 6, optimal: 9, max: 15 }
    };
    
    const prefs = workflowPreferences[workflow.id] || { min: 2, optimal: 3, max: 10 };
    
    if (availableAgents < prefs.min) return 0; // Not enough agents
    if (availableAgents <= prefs.optimal) return availableAgents / prefs.optimal;
    if (availableAgents <= prefs.max) return 1 - (availableAgents - prefs.optimal) / (prefs.max - prefs.optimal) * 0.3;
    return 0.7; // Too many agents, but still workable
  }

  scoreComplexityCompatibility(workflow, task) {
    const complexity = this.assessTaskComplexity(task);
    
    const complexityPreferences = {
      'hierarchical-bidding-cascade': { low: 0.6, medium: 0.9, high: 1.0 },
      'reputation-weighted-coalition': { low: 0.8, medium: 1.0, high: 0.8 },
      'adversarial-quality-assurance': { low: 0.4, medium: 0.8, high: 1.0 }
    };
    
    const prefs = complexityPreferences[workflow.id] || { low: 0.7, medium: 0.8, high: 0.7 };
    return prefs[complexity];
  }

  scoreCollaborationFit(workflow, task) {
    const collaborationType = this.inferCollaborationType(task);
    
    const collaborationFit = {
      'hierarchical-bidding-cascade': { competitive: 0.8, hierarchical: 1.0, collaborative: 0.7, adversarial: 0.3, balanced: 0.8 },
      'reputation-weighted-coalition': { competitive: 0.6, hierarchical: 0.5, collaborative: 1.0, adversarial: 0.4, balanced: 0.9 },
      'adversarial-quality-assurance': { competitive: 1.0, hierarchical: 0.6, collaborative: 0.4, adversarial: 1.0, balanced: 0.7 }
    };
    
    const fit = collaborationFit[workflow.id] || { competitive: 0.5, hierarchical: 0.5, collaborative: 0.5, adversarial: 0.5, balanced: 0.7 };
    return fit[collaborationType] || 0.5;
  }

  scoreResourceCompatibility(workflow, task, context) {
    const availableResources = context.resources || { time: 'normal', compute: 'normal', budget: 'normal' };
    
    const resourceRequirements = {
      'hierarchical-bidding-cascade': { time: 'high', compute: 'medium', budget: 'medium' },
      'reputation-weighted-coalition': { time: 'medium', compute: 'medium', budget: 'low' },
      'adversarial-quality-assurance': { time: 'high', compute: 'high', budget: 'medium' }
    };
    
    const requirements = resourceRequirements[workflow.id] || { time: 'medium', compute: 'medium', budget: 'medium' };
    
    const resourceLevels = { low: 1, medium: 2, normal: 2, high: 3 };
    let compatibilityScore = 0;
    
    for (const [resource, required] of Object.entries(requirements)) {
      const available = resourceLevels[availableResources[resource]] || 2;
      const needed = resourceLevels[required];
      
      if (available >= needed) {
        compatibilityScore += 1;
      } else {
        compatibilityScore += available / needed;
      }
    }
    
    return compatibilityScore / Object.keys(requirements).length;
  }

  scoreQualitySpeedTradeoff(workflow, task) {
    const qualityFocus = task.qualityLevel === 'high' || task.criticalQuality;
    const speedFocus = task.urgent || task.deadline;
    
    const workflowCharacteristics = {
      'hierarchical-bidding-cascade': { quality: 0.8, speed: 0.7 },
      'reputation-weighted-coalition': { quality: 0.9, speed: 0.6 },
      'adversarial-quality-assurance': { quality: 1.0, speed: 0.4 }
    };
    
    const characteristics = workflowCharacteristics[workflow.id] || { quality: 0.7, speed: 0.7 };
    
    if (qualityFocus && speedFocus) {
      // Both required - balance score
      return (characteristics.quality + characteristics.speed) / 2;
    } else if (qualityFocus) {
      return characteristics.quality;
    } else if (speedFocus) {
      return characteristics.speed;
    } else {
      // Balanced requirement
      return (characteristics.quality + characteristics.speed) / 2;
    }
  }

  calculateSuitability(workflow, task) {
    // Additional suitability factors
    const taskKeywords = (task.description || '').toLowerCase();
    
    const workflowKeywords = {
      'hierarchical-bidding-cascade': ['complex', 'large', 'structured', 'enterprise', 'coordination'],
      'reputation-weighted-coalition': ['collaborative', 'team', 'trust', 'relationship', 'partnership'],
      'adversarial-quality-assurance': ['quality', 'testing', 'security', 'critical', 'validation', 'review']
    };
    
    const keywords = workflowKeywords[workflow.id] || [];
    const keywordMatches = keywords.filter(keyword => taskKeywords.includes(keyword)).length;
    
    return Math.min(1.0, keywordMatches / Math.max(1, keywords.length) + 0.3);
  }

  getHistoricalPerformance(workflowId) {
    const metrics = this.performanceMetrics.get(workflowId);
    if (!metrics || metrics.totalExecutions === 0) {
      return { score: 0.5, confidence: 0.1 }; // No history
    }
    
    // Calculate performance score
    const performanceScore = (
      metrics.successRate * 0.4 +
      metrics.averageQuality * 0.3 +
      (1 - Math.min(1, metrics.averageDuration / 10000)) * 0.2 + // Prefer faster workflows
      (metrics.totalExecutions > 5 ? 0.1 : metrics.totalExecutions / 50) // Experience bonus
    );
    
    const confidence = Math.min(1.0, metrics.totalExecutions / 10);
    
    return { score: performanceScore, confidence: confidence };
  }

  calculateCompositeScore(workflowScore, suitability, performance) {
    const baseScore = workflowScore * 0.4 + suitability * 0.3;
    const performanceContribution = performance.score * performance.confidence * 0.3;
    
    return baseScore + performanceContribution;
  }

  selectBestCandidate(candidates, task, context) {
    if (candidates.length === 0) {
      throw new Error('No suitable workflows found for task');
    }
    
    // Add some randomness to prevent always selecting the same workflow
    const randomnessFactor = context.explorationRate || 0.1;
    
    if (Math.random() < randomnessFactor && candidates.length > 1) {
      // Exploration: select second best occasionally
      return candidates[1];
    }
    
    return candidates[0];
  }

  updateTaskPatterns(taskSignature, selectedWorkflowId) {
    if (!this.taskPatterns.has(taskSignature)) {
      this.taskPatterns.set(taskSignature, new Map());
    }
    
    const patterns = this.taskPatterns.get(taskSignature);
    const currentCount = patterns.get(selectedWorkflowId) || 0;
    patterns.set(selectedWorkflowId, currentCount + 1);
  }

  /**
   * Execute a task using the selected workflow
   */
  async executeTask(task, agents, context = {}) {
    console.log(`Executing task: ${task.title}`);
    
    const startTime = Date.now();
    
    try {
      // Select appropriate workflow
      const selectedWorkflow = await this.selectWorkflow(task, agents, context);
      
      // Initialize workflow
      await selectedWorkflow.initialize(agents, context);
      
      // Execute task
      const results = await selectedWorkflow.execute(task);
      
      // Cleanup
      await selectedWorkflow.cleanup();
      
      // Update performance metrics
      const executionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(selectedWorkflow.id, results, executionTime);
      
      // Add execution metadata
      results.workflow = {
        id: selectedWorkflow.id,
        name: selectedWorkflow.name,
        type: selectedWorkflow.type,
        executionTime: executionTime
      };
      
      console.log(`Task completed using ${selectedWorkflow.name} in ${executionTime}ms`);
      return results;
      
    } catch (error) {
      console.error(`Task execution failed: ${error.message}`);
      
      // Update failure metrics if we have a selected workflow
      const executionTime = Date.now() - startTime;
      // Note: we don't have selectedWorkflow here if selection failed
      
      throw error;
    }
  }

  updatePerformanceMetrics(workflowId, results, executionTime) {
    const metrics = this.performanceMetrics.get(workflowId);
    if (!metrics) return;
    
    metrics.totalExecutions++;
    
    // Update success rate
    const isSuccess = results.successRate ? results.successRate > 0.7 : true;
    metrics.successRate = (metrics.successRate * (metrics.totalExecutions - 1) + (isSuccess ? 1 : 0)) / metrics.totalExecutions;
    
    // Update average quality
    const quality = results.qualityScores ? 
      results.qualityScores.reduce((sum, q) => sum + q, 0) / results.qualityScores.length : 0.7;
    metrics.averageQuality = (metrics.averageQuality * (metrics.totalExecutions - 1) + quality) / metrics.totalExecutions;
    
    // Update average duration
    metrics.averageDuration = (metrics.averageDuration * (metrics.totalExecutions - 1) + executionTime) / metrics.totalExecutions;
    
    metrics.lastUsed = Date.now();
    
    console.log(`Updated metrics for ${workflowId}: ${metrics.totalExecutions} executions, ${(metrics.successRate * 100).toFixed(1)}% success rate`);
  }

  /**
   * Get workflow recommendations for a task
   */
  async getWorkflowRecommendations(task, agents, context = {}) {
    const candidates = await this.evaluateWorkflowCandidates(task, agents, context);
    
    return candidates.slice(0, 3).map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      type: candidate.type,
      description: candidate.description,
      score: candidate.compositeScore,
      suitability: candidate.suitability,
      performance: candidate.performance,
      recommendationReason: this.generateRecommendationReason(candidate, task)
    }));
  }

  generateRecommendationReason(workflow, task) {
    const reasons = [];
    
    if (workflow.suitability > 0.8) {
      reasons.push('High task suitability based on requirements');
    }
    
    if (workflow.performance.confidence > 0.7 && workflow.performance.score > 0.7) {
      reasons.push('Strong historical performance');
    }
    
    const complexity = this.assessTaskComplexity(task);
    if (complexity === 'high' && workflow.id === 'hierarchical-bidding-cascade') {
      reasons.push('Excellent for complex, multi-phase projects');
    }
    
    if (workflow.id === 'adversarial-quality-assurance' && (task.qualityLevel === 'high' || task.criticalQuality)) {
      reasons.push('Best choice for quality-critical tasks');
    }
    
    if (workflow.id === 'reputation-weighted-coalition' && this.inferCollaborationType(task) === 'collaborative') {
      reasons.push('Optimal for collaborative team dynamics');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Good general-purpose workflow for this task type';
  }

  /**
   * Get orchestrator statistics
   */
  getStatistics() {
    const stats = {
      totalWorkflows: this.workflows.size,
      totalExecutions: 0,
      workflowPerformance: {},
      taskPatterns: this.taskPatterns.size,
      lastActivity: null
    };
    
    for (const [workflowId, metrics] of this.performanceMetrics) {
      stats.totalExecutions += metrics.totalExecutions;
      stats.workflowPerformance[workflowId] = {
        executions: metrics.totalExecutions,
        successRate: metrics.successRate,
        averageQuality: metrics.averageQuality,
        averageDuration: metrics.averageDuration,
        lastUsed: metrics.lastUsed
      };
      
      if (!stats.lastActivity || (metrics.lastUsed && metrics.lastUsed > stats.lastActivity)) {
        stats.lastActivity = metrics.lastUsed;
      }
    }
    
    return stats;
  }

  /**
   * Reset orchestrator state (useful for testing)
   */
  reset() {
    this.workflowHistory = [];
    this.taskPatterns.clear();
    
    // Reset performance metrics but keep workflows
    for (const [workflowId] of this.performanceMetrics) {
      this.performanceMetrics.set(workflowId, {
        totalExecutions: 0,
        successRate: 0,
        averageQuality: 0,
        averageDuration: 0,
        lastUsed: null,
        preferredTaskTypes: []
      });
    }
    
    console.log('Workflow orchestrator reset');
  }
}