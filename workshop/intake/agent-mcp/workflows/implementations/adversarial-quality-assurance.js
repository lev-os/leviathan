import { WorkflowBase } from './workflow-base.js';

/**
 * Adversarial Quality Assurance Workflow
 * Red team agents actively challenge and improve solutions from blue team agents
 */
export class AdversarialQualityAssurance extends WorkflowBase {
  constructor() {
    super({
      id: 'adversarial-quality-assurance',
      name: 'Adversarial Quality Assurance',
      type: 'competitive',
      description: 'Red team agents actively challenge and improve solutions from blue team agents'
    });
    
    this.blueTeam = new Map();
    this.redTeam = new Map();
    this.judges = new Map();
    this.attackVectors = [
      'security', 'performance', 'usability', 'scalability', 
      'maintainability', 'edge-cases', 'error-handling'
    ];
  }

  async initialize(agents, context) {
    this.context = context;
    
    // Divide agents into teams
    const shuffledAgents = this.shuffleArray([...agents]);
    const teamSize = Math.floor(agents.length / 3);
    
    // Blue team (builders)
    for (let i = 0; i < teamSize; i++) {
      const agent = shuffledAgents[i];
      this.blueTeam.set(agent.id, agent);
      this.registerAgent(agent.id, agent);
    }
    
    // Red team (challengers)
    for (let i = teamSize; i < teamSize * 2; i++) {
      const agent = shuffledAgents[i];
      this.redTeam.set(agent.id, agent);
      this.registerAgent(agent.id, agent);
    }
    
    // Judges (arbitrators)
    for (let i = teamSize * 2; i < shuffledAgents.length; i++) {
      const agent = shuffledAgents[i];
      this.judges.set(agent.id, agent);
      this.registerAgent(agent.id, agent);
    }
    
    this.log(`Teams formed - Blue: ${this.blueTeam.size}, Red: ${this.redTeam.size}, Judges: ${this.judges.size}`);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async execute(task) {
    this.log(`Starting adversarial QA for task: ${task.title}`);
    
    try {
      // Phase 1: Primary Solution Development
      const initialSolution = await this.blueTeamDevelopment(task);
      
      // Phase 2: Adversarial Challenge Phase
      const challenges = await this.redTeamChallenges(task, initialSolution);
      
      // Phase 3: Defense and Improvement
      const improvedSolution = await this.defenseAndImprovement(task, initialSolution, challenges);
      
      // Phase 4: Judge Arbitration
      const finalEvaluation = await this.judgeArbitration(task, initialSolution, improvedSolution, challenges);
      
      const results = {
        taskId: task.id,
        initialSolution: initialSolution,
        challenges: challenges,
        improvedSolution: improvedSolution,
        evaluation: finalEvaluation,
        qualityImprovement: this.calculateQualityImprovement(initialSolution, improvedSolution),
        teamPerformance: this.calculateTeamPerformance(challenges, improvedSolution)
      };
      
      this.updateMetrics(results);
      return results;
      
    } catch (error) {
      this.log(`Adversarial QA workflow execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async blueTeamDevelopment(task) {
    this.log('Blue team developing initial solution');
    
    const blueAgents = Array.from(this.blueTeam.values());
    const solution = {
      id: `solution-${Date.now()}`,
      taskId: task.id,
      contributors: blueAgents.map(a => a.id),
      startTime: Date.now(),
      components: [],
      documentation: '',
      testCoverage: Math.random() * 0.4 + 0.5, // 50-90% initial coverage
      performance: Math.random() * 0.3 + 0.6, // 60-90% initial performance
      security: Math.random() * 0.3 + 0.5, // 50-80% initial security
      usability: Math.random() * 0.4 + 0.6 // 60-100% initial usability
    };
    
    // Simulate collaborative development
    for (const agent of blueAgents) {
      const component = await this.generateComponent(agent, task);
      solution.components.push(component);
    }
    
    solution.endTime = Date.now();
    solution.developmentTime = solution.endTime - solution.startTime;
    solution.overallQuality = this.calculateOverallQuality(solution);
    
    this.log(`Blue team completed initial solution with quality score: ${solution.overallQuality.toFixed(3)}`);
    return solution;
  }

  async generateComponent(agent, task) {
    // Simulate agent contributing a component
    const capabilities = agent.capabilities || [];
    const primaryCapability = capabilities[0] || 'implementation';
    
    return {
      id: `component-${agent.id}-${Date.now()}`,
      agentId: agent.id,
      type: primaryCapability,
      quality: Math.random() * 0.4 + 0.6,
      complexity: Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low',
      testability: Math.random() * 0.5 + 0.5,
      documentation: Math.random() > 0.3 // 70% chance of documentation
    };
  }

  calculateOverallQuality(solution) {
    return (
      solution.testCoverage * 0.25 +
      solution.performance * 0.25 +
      solution.security * 0.25 +
      solution.usability * 0.25
    );
  }

  async redTeamChallenges(task, initialSolution) {
    this.log('Red team generating challenges and attacks');
    
    const redAgents = Array.from(this.redTeam.values());
    const challenges = [];
    
    // Each red team agent bids on different attack vectors
    for (const attackVector of this.attackVectors) {
      const bids = [];
      
      for (const agent of redAgents) {
        const bid = await this.generateAttackBid(agent, attackVector, initialSolution);
        if (bid.confidence > 0.3) { // Only consider confident attacks
          bids.push({ agent, ...bid });
        }
      }
      
      if (bids.length > 0) {
        // Select best attacker for this vector
        const bestAttacker = bids.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        const challenge = await this.executeAttack(bestAttacker, attackVector, initialSolution);
        challenges.push(challenge);
      }
    }
    
    this.log(`Red team generated ${challenges.length} challenges`);
    return challenges;
  }

  async generateAttackBid(agent, attackVector, solution) {
    // Simulate agent bidding on attack vectors based on their expertise
    const capabilities = agent.capabilities || [];
    
    let expertise = 0.3; // Base expertise
    
    // Boost expertise based on relevant capabilities
    if (attackVector === 'security' && capabilities.includes('security')) expertise += 0.4;
    if (attackVector === 'performance' && capabilities.includes('optimization')) expertise += 0.4;
    if (attackVector === 'usability' && capabilities.includes('design')) expertise += 0.4;
    if (attackVector === 'testing' && capabilities.includes('testing')) expertise += 0.4;
    
    const confidence = Math.min(expertise + Math.random() * 0.3, 1.0);
    const estimatedImpact = this.estimateAttackImpact(attackVector, solution);
    
    return {
      attackVector: attackVector,
      confidence: confidence,
      estimatedImpact: estimatedImpact,
      timeEstimate: Math.random() * 3000 + 1000, // 1-4 seconds
      approach: this.generateAttackApproach(attackVector)
    };
  }

  estimateAttackImpact(attackVector, solution) {
    const vectorMapping = {
      'security': 1 - solution.security,
      'performance': 1 - solution.performance,
      'usability': 1 - solution.usability,
      'scalability': Math.random() * 0.5 + 0.2,
      'maintainability': Math.random() * 0.4 + 0.1,
      'edge-cases': 1 - solution.testCoverage,
      'error-handling': Math.random() * 0.6 + 0.2
    };
    
    return vectorMapping[attackVector] || 0.3;
  }

  generateAttackApproach(attackVector) {
    const approaches = {
      'security': ['penetration-testing', 'vulnerability-scanning', 'code-review'],
      'performance': ['load-testing', 'profiling', 'stress-testing'],
      'usability': ['user-journey-testing', 'accessibility-audit', 'cognitive-load-analysis'],
      'scalability': ['capacity-planning', 'bottleneck-analysis', 'architecture-review'],
      'maintainability': ['code-complexity-analysis', 'dependency-audit', 'documentation-review'],
      'edge-cases': ['boundary-testing', 'negative-testing', 'chaos-engineering'],
      'error-handling': ['fault-injection', 'exception-testing', 'recovery-testing']
    };
    
    const vectorApproaches = approaches[attackVector] || ['general-testing'];
    return vectorApproaches[Math.floor(Math.random() * vectorApproaches.length)];
  }

  async executeAttack(bestAttacker, attackVector, solution) {
    this.log(`Executing ${attackVector} attack by agent ${bestAttacker.agent.id}`);
    
    const attack = {
      id: `attack-${Date.now()}`,
      vector: attackVector,
      attackerId: bestAttacker.agent.id,
      approach: bestAttacker.approach,
      startTime: Date.now(),
      findings: [],
      severity: 'medium',
      confidence: bestAttacker.confidence
    };
    
    // Simulate attack execution
    await new Promise(resolve => setTimeout(resolve, bestAttacker.timeEstimate));
    
    // Generate findings based on attack success
    const successRate = bestAttacker.confidence * bestAttacker.estimatedImpact;
    const findingCount = Math.floor(successRate * 5) + 1; // 1-5 findings
    
    for (let i = 0; i < findingCount; i++) {
      attack.findings.push(this.generateFinding(attackVector, i));
    }
    
    attack.endTime = Date.now();
    attack.duration = attack.endTime - attack.startTime;
    attack.severity = this.calculateAttackSeverity(attack.findings);
    attack.impact = bestAttacker.estimatedImpact;
    
    this.log(`Attack completed: ${attack.findings.length} findings with ${attack.severity} severity`);
    return attack;
  }

  generateFinding(attackVector, index) {
    const findings = {
      'security': [
        'Input validation bypass detected',
        'Authentication weakness found',
        'Data exposure vulnerability',
        'Injection attack possible',
        'Privilege escalation risk'
      ],
      'performance': [
        'Memory leak detected',
        'Inefficient algorithm usage',
        'Database query optimization needed',
        'Network bottleneck identified',
        'Resource contention found'
      ],
      'usability': [
        'Confusing user interface element',
        'Accessibility barrier detected',
        'User workflow inefficiency',
        'Error message unclear',
        'Navigation inconsistency'
      ],
      'scalability': [
        'Single point of failure',
        'Non-scalable architecture pattern',
        'Resource scaling limitation',
        'State management issue',
        'Load distribution problem'
      ],
      'maintainability': [
        'Code duplication detected',
        'High cyclomatic complexity',
        'Insufficient documentation',
        'Tight coupling identified',
        'Missing test coverage'
      ],
      'edge-cases': [
        'Boundary condition not handled',
        'Null pointer vulnerability',
        'Integer overflow possibility',
        'Concurrent access issue',
        'Resource exhaustion scenario'
      ],
      'error-handling': [
        'Unhandled exception path',
        'Error propagation issue',
        'Recovery mechanism missing',
        'Logging insufficient',
        'Graceful degradation absent'
      ]
    };
    
    const vectorFindings = findings[attackVector] || ['Generic issue found'];
    const findingText = vectorFindings[index % vectorFindings.length];
    
    return {
      id: `finding-${Date.now()}-${index}`,
      description: findingText,
      severity: Math.random() < 0.2 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low',
      reproducible: Math.random() > 0.2, // 80% reproducible
      component: `component-${Math.floor(Math.random() * 3)}` // Random component
    };
  }

  calculateAttackSeverity(findings) {
    const severityCounts = findings.reduce((counts, finding) => {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
      return counts;
    }, {});
    
    if (severityCounts.high > 0) return 'high';
    if (severityCounts.medium > 2) return 'high';
    if (severityCounts.medium > 0) return 'medium';
    return 'low';
  }

  async defenseAndImprovement(task, initialSolution, challenges) {
    this.log('Blue team defending and improving solution');
    
    const blueAgents = Array.from(this.blueTeam.values());
    const improvedSolution = JSON.parse(JSON.stringify(initialSolution)); // Deep copy
    improvedSolution.id = `improved-${improvedSolution.id}`;
    improvedSolution.improvements = [];
    improvedSolution.addressedFindings = [];
    
    // Iterative improvement cycles
    for (let cycle = 0; cycle < 3; cycle++) {
      this.log(`Improvement cycle ${cycle + 1}`);
      
      // Prioritize challenges by severity and impact
      const prioritizedChallenges = challenges
        .sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));
      
      // Address top challenges
      for (const challenge of prioritizedChallenges.slice(0, 2)) { // Address top 2 each cycle
        const improvement = await this.addressChallenge(challenge, improvedSolution, blueAgents);
        if (improvement) {
          improvedSolution.improvements.push(improvement);
          improvedSolution.addressedFindings.push(...challenge.findings.map(f => f.id));
          
          // Update solution metrics
          this.applySolutionImprovements(improvedSolution, improvement);
        }
      }
    }
    
    improvedSolution.finalQuality = this.calculateOverallQuality(improvedSolution);
    this.log(`Solution improved from ${initialSolution.overallQuality.toFixed(3)} to ${improvedSolution.finalQuality.toFixed(3)}`);
    
    return improvedSolution;
  }

  getPriorityScore(challenge) {
    const severityWeight = { high: 3, medium: 2, low: 1 };
    const avgSeverity = challenge.findings.reduce((sum, finding) => 
      sum + severityWeight[finding.severity], 0) / challenge.findings.length;
    
    return avgSeverity * challenge.impact * challenge.confidence;
  }

  async addressChallenge(challenge, solution, blueAgents) {
    this.log(`Addressing ${challenge.vector} challenge`);
    
    // Select best defender for this challenge
    const defender = this.selectBestDefender(challenge, blueAgents);
    if (!defender) return null;
    
    const improvement = {
      id: `improvement-${Date.now()}`,
      challengeId: challenge.id,
      defenderId: defender.id,
      vector: challenge.vector,
      approach: this.generateDefenseApproach(challenge.vector),
      startTime: Date.now(),
      addressedFindings: []
    };
    
    // Simulate defense implementation
    const implementationTime = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, implementationTime));
    
    // Success rate based on defender expertise and challenge difficulty
    const successRate = this.calculateDefenseSuccessRate(defender, challenge);
    const addressedCount = Math.floor(challenge.findings.length * successRate);
    
    improvement.addressedFindings = challenge.findings.slice(0, addressedCount);
    improvement.endTime = Date.now();
    improvement.duration = improvement.endTime - improvement.startTime;
    improvement.effectiveness = successRate;
    
    this.log(`Defense completed: ${addressedCount}/${challenge.findings.length} findings addressed`);
    return improvement;
  }

  selectBestDefender(challenge, blueAgents) {
    // Find agent with best capability match for the challenge vector
    const vectorCapabilityMap = {
      'security': ['security', 'testing'],
      'performance': ['optimization', 'analysis'],
      'usability': ['design', 'testing'],
      'scalability': ['architecture', 'planning'],
      'maintainability': ['implementation', 'architecture'],
      'edge-cases': ['testing', 'analysis'],
      'error-handling': ['implementation', 'testing']
    };
    
    const relevantCapabilities = vectorCapabilityMap[challenge.vector] || ['implementation'];
    
    const candidateDefenders = blueAgents.filter(agent => {
      const capabilities = agent.capabilities || [];
      return relevantCapabilities.some(cap => capabilities.includes(cap));
    });
    
    if (candidateDefenders.length === 0) {
      return blueAgents[0]; // Fallback to first available
    }
    
    // Select based on capability match strength
    return candidateDefenders.reduce((best, current) => {
      const bestMatch = this.calculateCapabilityMatch(best, relevantCapabilities);
      const currentMatch = this.calculateCapabilityMatch(current, relevantCapabilities);
      return currentMatch > bestMatch ? current : best;
    });
  }

  calculateCapabilityMatch(agent, requiredCapabilities) {
    const agentCapabilities = agent.capabilities || [];
    const matchCount = requiredCapabilities.filter(req => 
      agentCapabilities.some(cap => cap.includes(req) || req.includes(cap))
    ).length;
    
    return matchCount / requiredCapabilities.length;
  }

  generateDefenseApproach(vector) {
    const approaches = {
      'security': 'security-hardening',
      'performance': 'optimization',
      'usability': 'ux-improvement',
      'scalability': 'architecture-refactor',
      'maintainability': 'code-refactoring',
      'edge-cases': 'comprehensive-testing',
      'error-handling': 'robust-error-handling'
    };
    
    return approaches[vector] || 'general-improvement';
  }

  calculateDefenseSuccessRate(defender, challenge) {
    const defenderExpertise = this.calculateCapabilityMatch(defender, [challenge.vector]);
    const challengeDifficulty = challenge.impact * challenge.confidence;
    
    // Base success rate modified by expertise vs difficulty
    const baseSuccess = 0.6;
    const expertiseBonus = defenderExpertise * 0.3;
    const difficultyPenalty = challengeDifficulty * 0.2;
    
    return Math.max(0.1, Math.min(0.95, baseSuccess + expertiseBonus - difficultyPenalty));
  }

  applySolutionImprovements(solution, improvement) {
    const improvementFactor = improvement.effectiveness * 0.2; // Up to 20% improvement
    
    switch (improvement.vector) {
      case 'security':
        solution.security = Math.min(1.0, solution.security + improvementFactor);
        break;
      case 'performance':
        solution.performance = Math.min(1.0, solution.performance + improvementFactor);
        break;
      case 'usability':
        solution.usability = Math.min(1.0, solution.usability + improvementFactor);
        break;
      case 'edge-cases':
        solution.testCoverage = Math.min(1.0, solution.testCoverage + improvementFactor);
        break;
      default:
        // Generic improvement to overall quality
        solution.testCoverage = Math.min(1.0, solution.testCoverage + improvementFactor * 0.5);
        break;
    }
  }

  async judgeArbitration(task, initialSolution, improvedSolution, challenges) {
    this.log('Judges evaluating solutions and determining winners');
    
    const judges = Array.from(this.judges.values());
    const evaluations = [];
    
    for (const judge of judges) {
      const evaluation = await this.judgeEvaluation(judge, task, initialSolution, improvedSolution, challenges);
      evaluations.push(evaluation);
    }
    
    // Aggregate judge evaluations
    const finalEvaluation = this.aggregateJudgeEvaluations(evaluations);
    finalEvaluation.rewardDistribution = this.calculateRewardDistribution(finalEvaluation, challenges, improvedSolution);
    
    this.log(`Final evaluation: Quality improvement ${(finalEvaluation.qualityImprovement * 100).toFixed(1)}%`);
    return finalEvaluation;
  }

  async judgeEvaluation(judge, task, initialSolution, improvedSolution, challenges) {
    // Simulate judge evaluation process
    const evaluationTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    await new Promise(resolve => setTimeout(resolve, evaluationTime));
    
    const qualityImprovement = improvedSolution.finalQuality - initialSolution.overallQuality;
    const challengeQuality = this.evaluateChallengeQuality(challenges);
    const defenseEffectiveness = this.evaluateDefenseEffectiveness(improvedSolution);
    
    return {
      judgeId: judge.id,
      qualityImprovement: qualityImprovement,
      challengeQuality: challengeQuality,
      defenseEffectiveness: defenseEffectiveness,
      overallScore: (qualityImprovement + challengeQuality + defenseEffectiveness) / 3,
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };
  }

  evaluateChallengeQuality(challenges) {
    if (challenges.length === 0) return 0;
    
    const avgImpact = challenges.reduce((sum, c) => sum + c.impact, 0) / challenges.length;
    const avgConfidence = challenges.reduce((sum, c) => sum + c.confidence, 0) / challenges.length;
    const coverageScore = Math.min(challenges.length / this.attackVectors.length, 1.0);
    
    return (avgImpact * 0.4 + avgConfidence * 0.3 + coverageScore * 0.3);
  }

  evaluateDefenseEffectiveness(improvedSolution) {
    if (!improvedSolution.improvements || improvedSolution.improvements.length === 0) return 0;
    
    const avgEffectiveness = improvedSolution.improvements.reduce((sum, imp) => 
      sum + imp.effectiveness, 0) / improvedSolution.improvements.length;
    
    const addressedRatio = improvedSolution.addressedFindings.length / 
      Math.max(1, improvedSolution.improvements.reduce((sum, imp) => 
        sum + imp.addressedFindings.length, 0));
    
    return (avgEffectiveness * 0.7 + addressedRatio * 0.3);
  }

  aggregateJudgeEvaluations(evaluations) {
    const weights = evaluations.map(e => e.confidence);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const weightedAverage = (values) => {
      const weightedSum = values.reduce((sum, val, index) => sum + val * weights[index], 0);
      return weightedSum / totalWeight;
    };
    
    return {
      qualityImprovement: weightedAverage(evaluations.map(e => e.qualityImprovement)),
      challengeQuality: weightedAverage(evaluations.map(e => e.challengeQuality)),
      defenseEffectiveness: weightedAverage(evaluations.map(e => e.defenseEffectiveness)),
      overallScore: weightedAverage(evaluations.map(e => e.overallScore)),
      judgeConsensus: this.calculateConsensus(evaluations)
    };
  }

  calculateConsensus(evaluations) {
    const overallScores = evaluations.map(e => e.overallScore);
    const mean = overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length;
    const variance = overallScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / overallScores.length;
    
    return Math.max(0, 1 - Math.sqrt(variance)); // Higher consensus = lower variance
  }

  calculateRewardDistribution(evaluation, challenges, improvedSolution) {
    const totalReward = 100; // Base reward points
    
    // Distribute rewards based on contribution
    const blueTeamReward = evaluation.defenseEffectiveness * 0.6 * totalReward;
    const redTeamReward = evaluation.challengeQuality * 0.3 * totalReward;
    const judgeReward = evaluation.judgeConsensus * 0.1 * totalReward;
    
    return {
      blueTeam: blueTeamReward,
      redTeam: redTeamReward,
      judges: judgeReward,
      total: blueTeamReward + redTeamReward + judgeReward
    };
  }

  calculateQualityImprovement(initialSolution, improvedSolution) {
    return {
      overall: improvedSolution.finalQuality - initialSolution.overallQuality,
      security: improvedSolution.security - initialSolution.security,
      performance: improvedSolution.performance - initialSolution.performance,
      usability: improvedSolution.usability - initialSolution.usability,
      testCoverage: improvedSolution.testCoverage - initialSolution.testCoverage
    };
  }

  calculateTeamPerformance(challenges, improvedSolution) {
    return {
      redTeamEffectiveness: challenges.length > 0 ? 
        challenges.reduce((sum, c) => sum + c.impact * c.confidence, 0) / challenges.length : 0,
      blueTeamResilience: improvedSolution.improvements ? 
        improvedSolution.improvements.reduce((sum, imp) => sum + imp.effectiveness, 0) / 
        Math.max(1, improvedSolution.improvements.length) : 0,
      challengeCoverage: challenges.length / this.attackVectors.length
    };
  }

  async cleanup() {
    this.log('Cleaning up adversarial quality assurance workflow');
    this.blueTeam.clear();
    this.redTeam.clear();
    this.judges.clear();
  }
}