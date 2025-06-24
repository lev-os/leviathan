import { WorkflowBase } from './workflow-base.js';

/**
 * Reputation-Weighted Coalition Formation Workflow
 * Agents form temporary coalitions based on past performance and complementary capabilities
 */
export class ReputationWeightedCoalition extends WorkflowBase {
  constructor() {
    super({
      id: 'reputation-weighted-coalition',
      name: 'Reputation-Weighted Coalition Formation',
      type: 'cooperative-competitive',
      description: 'Agents form temporary coalitions based on past performance and complementary capabilities'
    });
    
    this.reputationStore = new Map();
    this.coalitionHistory = new Map();
    this.activeCoalitions = new Map();
  }

  async initialize(agents, context) {
    this.context = context;
    
    for (const agent of agents) {
      await this.registerAgent(agent.id, agent);
      this.initializeReputation(agent);
    }
    
    this.log(`Initialized reputation system for ${agents.length} agents`);
  }

  initializeReputation(agent) {
    if (!this.reputationStore.has(agent.id)) {
      this.reputationStore.set(agent.id, {
        overall: 0.7, // Start with neutral reputation
        taskSuccess: 0.7,
        collaboration: 0.7,
        reliability: 0.7,
        innovation: 0.7,
        history: [],
        coalitionCount: 0,
        successfulCoalitions: 0
      });
    }
  }

  async execute(task) {
    this.log(`Starting coalition formation for task: ${task.title}`);
    
    try {
      // Phase 1: Reputation Assessment
      const reputationSummary = await this.assessReputations();
      
      // Phase 2: Coalition Proposals
      const proposedCoalitions = await this.generateCoalitionProposals(task, reputationSummary);
      
      // Phase 3: Coalition Competition
      const winningCoalition = await this.selectWinningCoalition(task, proposedCoalitions);
      
      // Phase 4: Internal Negotiation and Execution
      const results = await this.executeWithCoalition(task, winningCoalition);
      
      // Update reputations based on results
      await this.updateReputations(winningCoalition, results);
      
      this.updateMetrics(results);
      return results;
      
    } catch (error) {
      this.log(`Coalition workflow execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async assessReputations() {
    this.log('Assessing agent reputations');
    
    const summary = new Map();
    
    for (const [agentId, reputation] of this.reputationStore) {
      // Calculate weighted reputation score
      const overallScore = this.calculateOverallReputation(reputation);
      const trendScore = this.calculateReputationTrend(reputation);
      const reliabilityScore = this.calculateReliabilityScore(reputation);
      
      summary.set(agentId, {
        overall: overallScore,
        trend: trendScore,
        reliability: reliabilityScore,
        coalitionSuccess: reputation.coalitionCount > 0 ? 
          reputation.successfulCoalitions / reputation.coalitionCount : 0.5,
        lastActive: this.getLastActiveTime(agentId)
      });
    }
    
    return summary;
  }

  calculateOverallReputation(reputation) {
    return (
      reputation.taskSuccess * 0.3 +
      reputation.collaboration * 0.25 +
      reputation.reliability * 0.25 +
      reputation.innovation * 0.2
    );
  }

  calculateReputationTrend(reputation) {
    const recentHistory = reputation.history.slice(-5); // Last 5 interactions
    if (recentHistory.length < 2) return 0;
    
    const trend = recentHistory.reduce((acc, curr, index) => {
      if (index === 0) return 0;
      return acc + (curr.score - recentHistory[index - 1].score);
    }, 0) / (recentHistory.length - 1);
    
    return Math.max(-1, Math.min(1, trend)); // Normalize to [-1, 1]
  }

  calculateReliabilityScore(reputation) {
    const completionRate = reputation.history.length > 0 ? 
      reputation.history.filter(h => h.completed).length / reputation.history.length : 0.5;
    
    const onTimeRate = reputation.history.length > 0 ?
      reputation.history.filter(h => h.onTime).length / reputation.history.length : 0.5;
    
    return (completionRate * 0.6 + onTimeRate * 0.4);
  }

  getLastActiveTime(agentId) {
    const reputation = this.reputationStore.get(agentId);
    if (!reputation || reputation.history.length === 0) {
      return Date.now() - (7 * 24 * 60 * 60 * 1000); // Default to 1 week ago
    }
    
    return Math.max(...reputation.history.map(h => h.timestamp));
  }

  async generateCoalitionProposals(task, reputationSummary) {
    this.log('Generating coalition proposals');
    
    const requiredCapabilities = this.identifyRequiredCapabilities(task);
    const availableAgents = Array.from(this.agents.values());
    const proposals = [];
    
    // Generate multiple coalition proposals using different strategies
    proposals.push(...await this.generateHighReputationCoalitions(task, reputationSummary, requiredCapabilities));
    proposals.push(...await this.generateComplementaryCoalitions(task, reputationSummary, requiredCapabilities));
    proposals.push(...await this.generateInnovativeCoalitions(task, reputationSummary, requiredCapabilities));
    proposals.push(...await this.generateBalancedCoalitions(task, reputationSummary, requiredCapabilities));
    
    return proposals.filter(p => p.members.length >= 2); // Minimum coalition size
  }

  async generateHighReputationCoalitions(task, reputationSummary, requiredCapabilities) {
    // Strategy: Select highest reputation agents that cover required capabilities
    const rankedAgents = this.rankAgentsByReputation(reputationSummary);
    const coalitions = [];
    
    const coalition = {
      id: `high-rep-${Date.now()}`,
      strategy: 'high-reputation',
      members: [],
      leader: null,
      estimatedSuccess: 0,
      estimatedCost: 0,
      capabilityCoverage: new Set()
    };
    
    // Select leader (highest reputation)
    coalition.leader = rankedAgents[0];
    coalition.members.push(coalition.leader);
    
    // Add members to cover all required capabilities
    for (const capability of requiredCapabilities) {
      if (!this.coalitionHasCapability(coalition, capability)) {
        const bestAgent = this.findBestAgentForCapability(rankedAgents, capability, coalition.members);
        if (bestAgent && !coalition.members.includes(bestAgent)) {
          coalition.members.push(bestAgent);
          coalition.capabilityCoverage.add(capability);
        }
      }
    }
    
    coalition.estimatedSuccess = this.calculateCoalitionSuccess(coalition, reputationSummary);
    coalition.estimatedCost = this.calculateCoalitionCost(coalition, task);
    
    coalitions.push(coalition);
    return coalitions;
  }

  async generateComplementaryCoalitions(task, reputationSummary, requiredCapabilities) {
    // Strategy: Find agents with complementary skills regardless of individual reputation
    const coalitions = [];
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const coalition = {
        id: `complementary-${Date.now()}-${attempt}`,
        strategy: 'complementary',
        members: [],
        leader: null,
        estimatedSuccess: 0,
        estimatedCost: 0,
        capabilityCoverage: new Set()
      };
      
      // Start with a random capable agent as seed
      const seedAgent = this.selectRandomCapableAgent(requiredCapabilities);
      if (!seedAgent) continue;
      
      coalition.members.push(seedAgent);
      coalition.leader = seedAgent;
      
      // Add agents that complement existing capabilities
      for (const capability of requiredCapabilities) {
        if (!this.coalitionHasCapability(coalition, capability)) {
          const complementaryAgent = this.findComplementaryAgent(coalition, capability);
          if (complementaryAgent && !coalition.members.includes(complementaryAgent)) {
            coalition.members.push(complementaryAgent);
            coalition.capabilityCoverage.add(capability);
          }
        }
      }
      
      if (coalition.members.length >= 2) {
        coalition.estimatedSuccess = this.calculateCoalitionSuccess(coalition, reputationSummary);
        coalition.estimatedCost = this.calculateCoalitionCost(coalition, task);
        coalitions.push(coalition);
      }
    }
    
    return coalitions;
  }

  async generateInnovativeCoalitions(task, reputationSummary, requiredCapabilities) {
    // Strategy: Favor agents with high innovation scores
    const innovativeAgents = Array.from(this.agents.values())
      .filter(agent => {
        const rep = this.reputationStore.get(agent.id);
        return rep && rep.innovation > 0.6;
      })
      .sort((a, b) => {
        const repA = this.reputationStore.get(a.id);
        const repB = this.reputationStore.get(b.id);
        return repB.innovation - repA.innovation;
      });
    
    if (innovativeAgents.length < 2) return [];
    
    const coalition = {
      id: `innovative-${Date.now()}`,
      strategy: 'innovative',
      members: innovativeAgents.slice(0, Math.min(4, innovativeAgents.length)),
      leader: innovativeAgents[0],
      estimatedSuccess: 0,
      estimatedCost: 0,
      capabilityCoverage: new Set()
    };
    
    coalition.estimatedSuccess = this.calculateCoalitionSuccess(coalition, reputationSummary);
    coalition.estimatedCost = this.calculateCoalitionCost(coalition, task) * 1.2; // Innovation premium
    
    return [coalition];
  }

  async generateBalancedCoalitions(task, reputationSummary, requiredCapabilities) {
    // Strategy: Balance reputation, capability coverage, and cost
    const coalitions = [];
    
    const coalition = {
      id: `balanced-${Date.now()}`,
      strategy: 'balanced',
      members: [],
      leader: null,
      estimatedSuccess: 0,
      estimatedCost: 0,
      capabilityCoverage: new Set()
    };
    
    // Select diverse agents using weighted random selection
    const availableAgents = Array.from(this.agents.values());
    const weights = availableAgents.map(agent => {
      const rep = reputationSummary.get(agent.id);
      return rep ? rep.overall : 0.5;
    });
    
    // Select leader using weighted random
    coalition.leader = this.weightedRandomSelect(availableAgents, weights);
    coalition.members.push(coalition.leader);
    
    // Add balanced members
    for (let i = 0; i < Math.min(3, requiredCapabilities.length); i++) {
      const remainingAgents = availableAgents.filter(a => !coalition.members.includes(a));
      if (remainingAgents.length === 0) break;
      
      const remainingWeights = remainingAgents.map(agent => {
        const rep = reputationSummary.get(agent.id);
        const baseWeight = rep ? rep.overall : 0.5;
        // Bonus for uncovered capabilities
        const capabilityBonus = requiredCapabilities.some(cap => 
          this.agentHasCapability(agent, cap) && !this.coalitionHasCapability(coalition, cap)
        ) ? 0.3 : 0;
        return baseWeight + capabilityBonus;
      });
      
      const selectedAgent = this.weightedRandomSelect(remainingAgents, remainingWeights);
      coalition.members.push(selectedAgent);
    }
    
    coalition.estimatedSuccess = this.calculateCoalitionSuccess(coalition, reputationSummary);
    coalition.estimatedCost = this.calculateCoalitionCost(coalition, task);
    
    coalitions.push(coalition);
    return coalitions;
  }

  rankAgentsByReputation(reputationSummary) {
    return Array.from(this.agents.values()).sort((a, b) => {
      const repA = reputationSummary.get(a.id);
      const repB = reputationSummary.get(b.id);
      return (repB?.overall || 0) - (repA?.overall || 0);
    });
  }

  coalitionHasCapability(coalition, capability) {
    return coalition.members.some(member => this.agentHasCapability(member, capability));
  }

  findBestAgentForCapability(rankedAgents, capability, excludeMembers) {
    return rankedAgents.find(agent => 
      !excludeMembers.includes(agent) && this.agentHasCapability(agent, capability)
    );
  }

  findComplementaryAgent(coalition, capability) {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => !coalition.members.includes(agent));
    
    return availableAgents.find(agent => this.agentHasCapability(agent, capability));
  }

  selectRandomCapableAgent(requiredCapabilities) {
    const capableAgents = Array.from(this.agents.values())
      .filter(agent => requiredCapabilities.some(cap => this.agentHasCapability(agent, cap)));
    
    return capableAgents[Math.floor(Math.random() * capableAgents.length)];
  }

  weightedRandomSelect(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1]; // Fallback
  }

  agentHasCapability(agent, capability) {
    const capabilities = agent.capabilities || [];
    return capabilities.some(cap => 
      cap.includes(capability) || 
      capability.includes(cap) ||
      cap.toLowerCase() === capability.toLowerCase()
    );
  }

  identifyRequiredCapabilities(task) {
    const keywords = task.description?.toLowerCase() || '';
    const capabilities = [];
    
    if (keywords.includes('plan') || keywords.includes('strategy')) capabilities.push('planning');
    if (keywords.includes('design') || keywords.includes('ui')) capabilities.push('design');
    if (keywords.includes('implement') || keywords.includes('code')) capabilities.push('implementation');
    if (keywords.includes('test') || keywords.includes('quality')) capabilities.push('testing');
    if (keywords.includes('analyze') || keywords.includes('research')) capabilities.push('analysis');
    
    return capabilities.length > 0 ? capabilities : ['implementation'];
  }

  calculateCoalitionSuccess(coalition, reputationSummary) {
    const memberReputations = coalition.members.map(member => {
      const rep = reputationSummary.get(member.id);
      return rep ? rep.overall : 0.5;
    });
    
    const avgReputation = memberReputations.reduce((sum, rep) => sum + rep, 0) / memberReputations.length;
    
    // Collaboration bonus based on past coalition successes
    const collaborationBonus = coalition.members.reduce((bonus, member) => {
      const rep = reputationSummary.get(member.id);
      return bonus + (rep ? rep.coalitionSuccess * 0.1 : 0);
    }, 0) / coalition.members.length;
    
    // Synergy bonus for diverse capabilities
    const diversityBonus = coalition.capabilityCoverage.size * 0.05;
    
    return Math.min(1.0, avgReputation + collaborationBonus + diversityBonus);
  }

  calculateCoalitionCost(coalition, task) {
    const baseCost = coalition.members.length * 10; // Base cost per member
    const complexityMultiplier = task.complexity === 'high' ? 2 : task.complexity === 'medium' ? 1.5 : 1;
    const reputationPremium = coalition.members.reduce((premium, member) => {
      const rep = this.reputationStore.get(member.id);
      return premium + (rep ? rep.overall * 5 : 2.5);
    }, 0);
    
    return baseCost * complexityMultiplier + reputationPremium;
  }

  async selectWinningCoalition(task, proposedCoalitions) {
    this.log(`Selecting winning coalition from ${proposedCoalitions.length} proposals`);
    
    if (proposedCoalitions.length === 0) {
      throw new Error('No viable coalitions proposed');
    }
    
    // Score coalitions based on success probability, cost, and capability coverage
    const scoredCoalitions = proposedCoalitions.map(coalition => ({
      ...coalition,
      score: this.scoreCoalition(coalition, task)
    }));
    
    // Select highest scoring coalition
    const winner = scoredCoalitions.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    this.log(`Selected coalition: ${winner.id} (${winner.strategy}) with score ${winner.score.toFixed(3)}`);
    return winner;
  }

  scoreCoalition(coalition, task) {
    const successWeight = 0.4;
    const costWeight = 0.3;
    const coverageWeight = 0.2;
    const strategyWeight = 0.1;
    
    const successScore = coalition.estimatedSuccess;
    const costScore = 1 - Math.min(1, coalition.estimatedCost / 100); // Normalize cost
    const coverageScore = coalition.capabilityCoverage.size / this.identifyRequiredCapabilities(task).length;
    const strategyScore = this.getStrategyBonus(coalition.strategy);
    
    return (
      successScore * successWeight +
      costScore * costWeight +
      coverageScore * coverageWeight +
      strategyScore * strategyWeight
    );
  }

  getStrategyBonus(strategy) {
    const bonuses = {
      'high-reputation': 0.8,
      'complementary': 0.7,
      'innovative': 0.9,
      'balanced': 0.75
    };
    return bonuses[strategy] || 0.5;
  }

  async executeWithCoalition(task, coalition) {
    this.log(`Executing task with coalition: ${coalition.id}`);
    
    const results = {
      taskId: task.id,
      coalitionId: coalition.id,
      strategy: coalition.strategy,
      members: coalition.members.map(m => m.id),
      leader: coalition.leader.id,
      startTime: Date.now(),
      phases: []
    };
    
    // Phase 4: Internal Negotiation
    const internalNegotiation = await this.conductInternalNegotiation(coalition, task);
    results.negotiationResults = internalNegotiation;
    
    // Execute task phases
    const taskPhases = this.decomposeIntoPhases(task);
    
    for (const phase of taskPhases) {
      const phaseStart = Date.now();
      const assignedMember = this.assignPhaseToMember(phase, coalition, internalNegotiation);
      
      try {
        await this.executePhase(phase, assignedMember);
        
        results.phases.push({
          phaseId: phase.id,
          assignedTo: assignedMember.id,
          status: 'completed',
          duration: Date.now() - phaseStart,
          quality: Math.random() * 0.4 + 0.6
        });
        
      } catch (error) {
        results.phases.push({
          phaseId: phase.id,
          assignedTo: assignedMember.id,
          status: 'failed',
          duration: Date.now() - phaseStart,
          error: error.message
        });
      }
    }
    
    results.endTime = Date.now();
    results.totalDuration = results.endTime - results.startTime;
    results.successRate = results.phases.filter(p => p.status === 'completed').length / results.phases.length;
    results.qualityScores = results.phases.filter(p => p.quality).map(p => p.quality);
    results.resourcesUsed = coalition.estimatedCost;
    results.outputValue = results.successRate * 100;
    results.collaborationMetrics = coalition.members.map(() => Math.random() * 0.4 + 0.6);
    
    return results;
  }

  async conductInternalNegotiation(coalition, task) {
    this.log('Conducting internal coalition negotiation');
    
    const negotiations = {
      resourceAllocation: {},
      roleAssignments: {},
      successMetrics: {},
      failureProtocols: {}
    };
    
    // Simulate internal negotiation
    for (const member of coalition.members) {
      negotiations.resourceAllocation[member.id] = Math.random() * 30 + 10; // 10-40% resource allocation
      negotiations.roleAssignments[member.id] = this.assignRole(member, coalition);
      negotiations.successMetrics[member.id] = Math.random() * 0.3 + 0.7; // Target 70-100% success
    }
    
    return negotiations;
  }

  assignRole(member, coalition) {
    if (member.id === coalition.leader.id) return 'leader';
    
    const capabilities = member.capabilities || [];
    if (capabilities.includes('implementation')) return 'implementer';
    if (capabilities.includes('design')) return 'designer';
    if (capabilities.includes('analysis')) return 'analyst';
    return 'contributor';
  }

  decomposeIntoPhases(task) {
    const requiredCapabilities = this.identifyRequiredCapabilities(task);
    return requiredCapabilities.map((capability, index) => ({
      id: `phase-${index}`,
      capability: capability,
      description: `${capability} phase for ${task.title}`,
      priority: index === 0 ? 'high' : 'medium'
    }));
  }

  assignPhaseToMember(phase, coalition, negotiation) {
    // Find member with best capability match for this phase
    const candidateMembers = coalition.members.filter(member => 
      this.agentHasCapability(member, phase.capability)
    );
    
    if (candidateMembers.length === 0) {
      return coalition.leader; // Fallback to leader
    }
    
    // Select based on capability match and reputation
    return candidateMembers.reduce((best, current) => {
      const bestRep = this.reputationStore.get(best.id);
      const currentRep = this.reputationStore.get(current.id);
      return (currentRep?.overall || 0) > (bestRep?.overall || 0) ? current : best;
    });
  }

  async executePhase(phase, assignedMember) {
    // Simulate phase execution
    const executionTime = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // 15% chance of failure
    if (Math.random() < 0.15) {
      throw new Error(`Phase execution failed: ${phase.description}`);
    }
    
    return { success: true, output: `Completed ${phase.description}` };
  }

  async updateReputations(coalition, results) {
    this.log('Updating agent reputations based on coalition performance');
    
    const overallSuccess = results.successRate;
    const coalitionSuccess = overallSuccess > 0.7;
    
    for (const member of coalition.members) {
      const reputation = this.reputationStore.get(member.id);
      if (!reputation) continue;
      
      // Update coalition statistics
      reputation.coalitionCount++;
      if (coalitionSuccess) {
        reputation.successfulCoalitions++;
      }
      
      // Find member's individual performance
      const memberPhases = results.phases.filter(p => p.assignedTo === member.id);
      const memberSuccess = memberPhases.length > 0 ? 
        memberPhases.filter(p => p.status === 'completed').length / memberPhases.length : 0.5;
      
      // Update reputation scores with decay
      const decayFactor = 0.9;
      const updateFactor = 0.1;
      
      reputation.taskSuccess = reputation.taskSuccess * decayFactor + memberSuccess * updateFactor;
      reputation.collaboration = reputation.collaboration * decayFactor + overallSuccess * updateFactor;
      reputation.reliability = reputation.reliability * decayFactor + (memberSuccess > 0.8 ? 1 : 0) * updateFactor;
      
      // Recalculate overall reputation
      reputation.overall = this.calculateOverallReputation(reputation);
      
      // Add to history
      reputation.history.push({
        timestamp: Date.now(),
        taskId: results.taskId,
        coalitionId: results.coalitionId,
        score: memberSuccess,
        completed: memberSuccess > 0.5,
        onTime: true, // Simplified - assume on time for now
        role: member.id === coalition.leader.id ? 'leader' : 'member'
      });
      
      // Trim history to last 20 entries
      if (reputation.history.length > 20) {
        reputation.history = reputation.history.slice(-20);
      }
    }
  }

  async cleanup() {
    this.log('Cleaning up reputation-weighted coalition workflow');
    this.activeCoalitions.clear();
  }
}