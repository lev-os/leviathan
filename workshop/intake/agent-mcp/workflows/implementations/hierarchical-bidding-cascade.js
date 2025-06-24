import { WorkflowBase } from './workflow-base.js';

/**
 * Hierarchical Bidding Cascade Workflow
 * Agents bid for task ownership in tiers, with higher-tier agents coordinating lower-tier specialists
 */
export class HierarchicalBiddingCascade extends WorkflowBase {
  constructor() {
    super({
      id: 'hierarchical-bidding-cascade',
      name: 'Hierarchical Bidding Cascade',
      type: 'competitive-cooperative',
      description: 'Agents bid for task ownership in tiers, with higher-tier agents coordinating lower-tier specialists'
    });
    
    this.tiers = new Map();
    this.activeAllocations = new Map();
  }

  async initialize(agents, context) {
    this.context = context;
    
    // Organize agents into tiers based on their capabilities
    for (const agent of agents) {
      await this.registerAgent(agent.id, agent);
      const tier = this.determineTier(agent);
      
      if (!this.tiers.has(tier)) {
        this.tiers.set(tier, []);
      }
      this.tiers.get(tier).push(agent);
    }
    
    this.log(`Initialized with ${agents.length} agents across ${this.tiers.size} tiers`);
  }

  determineTier(agent) {
    const capabilities = agent.capabilities || [];
    const strategicCapabilities = ['planning', 'architecture', 'strategy', 'coordination'];
    const specialistCapabilities = ['implementation', 'analysis', 'design', 'testing'];
    
    if (capabilities.some(cap => strategicCapabilities.includes(cap))) {
      return 1; // Strategic tier
    } else if (capabilities.some(cap => specialistCapabilities.includes(cap))) {
      return 2; // Specialist tier
    } else {
      return 3; // Execution tier
    }
  }

  async execute(task) {
    this.log(`Starting hierarchical bidding for task: ${task.title}`);
    
    try {
      // Phase 1: Task Analysis
      const analysis = await this.analyzeTask(task);
      
      // Phase 2: Tier-1 Bidding
      const tier1Winner = await this.conductTier1Bidding(task, analysis);
      if (!tier1Winner) {
        throw new Error('No tier-1 agents available for task');
      }
      
      // Phase 3: Tier-2 Specialist Auction
      const specialistAllocations = await this.conductSpecialistAuctions(task, tier1Winner, analysis);
      
      // Phase 4: Execute with Dynamic Reallocation
      const results = await this.executeWithMonitoring(task, tier1Winner, specialistAllocations);
      
      this.updateMetrics(results);
      return results;
      
    } catch (error) {
      this.log(`Workflow execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async analyzeTask(task) {
    this.log('Analyzing task complexity and requirements');
    
    return {
      complexity: this.assessComplexity(task),
      requiredCapabilities: this.identifyRequiredCapabilities(task),
      estimatedDuration: this.estimateDuration(task),
      resourceRequirements: this.estimateResources(task)
    };
  }

  assessComplexity(task) {
    const indicators = [
      task.description?.length > 500,
      task.requirements?.length > 5,
      task.dependencies?.length > 3,
      task.stakeholders?.length > 2
    ];
    
    const complexity = indicators.filter(Boolean).length;
    return complexity > 2 ? 'high' : complexity > 1 ? 'medium' : 'low';
  }

  identifyRequiredCapabilities(task) {
    const keywords = task.description?.toLowerCase() || '';
    const capabilities = [];
    
    if (keywords.includes('plan') || keywords.includes('strategy')) capabilities.push('planning');
    if (keywords.includes('design') || keywords.includes('ui')) capabilities.push('design');
    if (keywords.includes('implement') || keywords.includes('code')) capabilities.push('implementation');
    if (keywords.includes('test') || keywords.includes('quality')) capabilities.push('testing');
    if (keywords.includes('analyze') || keywords.includes('research')) capabilities.push('analysis');
    
    return capabilities.length > 0 ? capabilities : ['implementation']; // Default capability
  }

  estimateDuration(task) {
    const complexity = this.assessComplexity(task);
    const baseHours = { low: 4, medium: 16, high: 40 };
    return baseHours[complexity];
  }

  estimateResources(task) {
    const requiredCapabilities = this.identifyRequiredCapabilities(task);
    return {
      agents: Math.min(requiredCapabilities.length + 1, 5),
      computeUnits: this.estimateDuration(task) * 2,
      priority: task.priority || 'medium'
    };
  }

  async conductTier1Bidding(task, analysis) {
    const tier1Agents = this.tiers.get(1) || [];
    if (tier1Agents.length === 0) {
      this.log('No tier-1 agents available, falling back to tier-2', 'warn');
      return this.tiers.get(2)?.[0] || null;
    }

    this.log(`Conducting tier-1 bidding with ${tier1Agents.length} strategic agents`);
    
    const bids = [];
    for (const agent of tier1Agents) {
      try {
        const bid = await this.generateTier1Bid(agent, task, analysis);
        bids.push({ agent, ...bid });
      } catch (error) {
        this.log(`Agent ${agent.id} failed to generate tier-1 bid: ${error.message}`, 'warn');
      }
    }

    if (bids.length === 0) return null;
    
    // Select winner based on combined score of cost, capability match, and confidence
    const winner = bids.reduce((best, current) => {
      const bestScore = this.calculateBidScore(best, analysis);
      const currentScore = this.calculateBidScore(current, analysis);
      return currentScore > bestScore ? current : best;
    });

    this.log(`Tier-1 winner: ${winner.agent.id} with score ${this.calculateBidScore(winner, analysis)}`);
    return winner;
  }

  async generateTier1Bid(agent, task, analysis) {
    // Simulate agent bidding logic
    const capabilityMatch = this.calculateCapabilityMatch(agent, analysis.requiredCapabilities);
    const estimatedCost = analysis.resourceRequirements.computeUnits * (1 + Math.random() * 0.5);
    const confidence = Math.min(capabilityMatch * 0.8 + Math.random() * 0.4, 1.0);
    
    return {
      cost: estimatedCost,
      confidence: confidence,
      capabilityMatch: capabilityMatch,
      coordinationPlan: this.generateCoordinationPlan(analysis),
      estimatedCompletion: Date.now() + (analysis.estimatedDuration * 3600000) // hours to ms
    };
  }

  calculateCapabilityMatch(agent, requiredCapabilities) {
    const agentCapabilities = agent.capabilities || [];
    const matchCount = requiredCapabilities.filter(req => 
      agentCapabilities.some(cap => cap.includes(req) || req.includes(cap))
    ).length;
    
    return requiredCapabilities.length > 0 ? matchCount / requiredCapabilities.length : 0.5;
  }

  calculateBidScore(bid, analysis) {
    const costScore = 1 - (bid.cost / (analysis.resourceRequirements.computeUnits * 2)); // Normalize cost
    const capabilityScore = bid.capabilityMatch;
    const confidenceScore = bid.confidence;
    
    return (costScore * 0.3 + capabilityScore * 0.4 + confidenceScore * 0.3);
  }

  generateCoordinationPlan(analysis) {
    return {
      phases: analysis.requiredCapabilities.map(cap => ({ capability: cap, parallel: false })),
      checkpoints: Math.ceil(analysis.estimatedDuration / 8), // Every 8 hours
      fallbackOptions: ['emergency-reallocation', 'task-simplification']
    };
  }

  async conductSpecialistAuctions(task, tier1Winner, analysis) {
    this.log('Conducting specialist auctions for subtasks');
    
    const subtasks = this.decompose IntoSubtasks(task, analysis);
    const allocations = new Map();
    
    for (const subtask of subtasks) {
      const requiredCapability = subtask.capability;
      const eligibleAgents = this.findEligibleSpecialists(requiredCapability);
      
      if (eligibleAgents.length > 0) {
        const winner = await this.conductAuction(subtask, eligibleAgents, 'first-price');
        if (winner) {
          allocations.set(subtask.id, winner);
          this.log(`Allocated subtask ${subtask.id} to agent ${winner.bidder.id}`);
        }
      }
    }
    
    return allocations;
  }

  decomposeIntoSubtasks(task, analysis) {
    return analysis.requiredCapabilities.map((capability, index) => ({
      id: `${task.id}-subtask-${index}`,
      capability: capability,
      description: `${capability} work for ${task.title}`,
      priority: task.priority || 'medium',
      dependency: index > 0 ? `${task.id}-subtask-${index - 1}` : null
    }));
  }

  findEligibleSpecialists(capability) {
    const specialists = [];
    
    // Check tier 2 and 3 agents
    for (const tier of [2, 3]) {
      const tierAgents = this.tiers.get(tier) || [];
      for (const agent of tierAgents) {
        if (this.agentHasCapability(agent, capability)) {
          specialists.push(agent);
        }
      }
    }
    
    return specialists;
  }

  agentHasCapability(agent, capability) {
    const capabilities = agent.capabilities || [];
    return capabilities.some(cap => 
      cap.includes(capability) || 
      capability.includes(cap) ||
      cap.toLowerCase() === capability.toLowerCase()
    );
  }

  async executeWithMonitoring(task, tier1Winner, specialistAllocations) {
    this.log('Executing task with monitoring and dynamic reallocation');
    
    const startTime = Date.now();
    const results = {
      taskId: task.id,
      coordinator: tier1Winner.agent.id,
      specialists: Array.from(specialistAllocations.values()).map(a => a.bidder.id),
      startTime: startTime,
      phases: []
    };
    
    // Simulate execution phases
    for (const [subtaskId, allocation] of specialistAllocations) {
      const phaseStart = Date.now();
      
      try {
        // Simulate subtask execution
        await this.executeSubtask(subtaskId, allocation);
        
        results.phases.push({
          subtaskId: subtaskId,
          agentId: allocation.bidder.id,
          status: 'completed',
          duration: Date.now() - phaseStart,
          quality: Math.random() * 0.4 + 0.6 // Simulate quality between 0.6-1.0
        });
        
      } catch (error) {
        this.log(`Subtask ${subtaskId} failed, attempting reallocation`, 'warn');
        
        // Attempt emergency reallocation
        const newAllocation = await this.emergencyReallocation(subtaskId, allocation);
        if (newAllocation) {
          results.phases.push({
            subtaskId: subtaskId,
            agentId: newAllocation.bidder.id,
            status: 'reallocated-completed',
            duration: Date.now() - phaseStart,
            quality: Math.random() * 0.3 + 0.5 // Lower quality for emergency reallocation
          });
        } else {
          results.phases.push({
            subtaskId: subtaskId,
            agentId: allocation.bidder.id,
            status: 'failed',
            duration: Date.now() - phaseStart,
            error: error.message
          });
        }
      }
    }
    
    results.endTime = Date.now();
    results.totalDuration = results.endTime - results.startTime;
    results.successRate = results.phases.filter(p => p.status.includes('completed')).length / results.phases.length;
    results.qualityScores = results.phases.filter(p => p.quality).map(p => p.quality);
    results.resourcesUsed = tier1Winner.cost + Array.from(specialistAllocations.values()).reduce((sum, a) => sum + (a.bid || 0), 0);
    results.outputValue = results.successRate * 100; // Simple output value metric
    
    return results;
  }

  async executeSubtask(subtaskId, allocation) {
    // Simulate subtask execution with potential failure
    const executionTime = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // 10% chance of failure
    if (Math.random() < 0.1) {
      throw new Error(`Subtask execution failed for ${subtaskId}`);
    }
    
    return { success: true, output: `Completed ${subtaskId}` };
  }

  async emergencyReallocation(subtaskId, failedAllocation) {
    this.log(`Attempting emergency reallocation for ${subtaskId}`);
    
    // Find alternative agents excluding the failed one
    const alternativeAgents = this.getAllAgents().filter(agent => 
      agent.id !== failedAllocation.bidder.id
    );
    
    if (alternativeAgents.length === 0) return null;
    
    // Quick reallocation auction with higher urgency pricing
    const urgentSubtask = {
      id: subtaskId,
      urgent: true,
      reservePrice: failedAllocation.bid * 1.5
    };
    
    return await this.conductAuction(urgentSubtask, alternativeAgents, 'first-price');
  }

  async cleanup() {
    this.log('Cleaning up hierarchical bidding cascade workflow');
    this.activeAllocations.clear();
    this.tiers.clear();
  }
}