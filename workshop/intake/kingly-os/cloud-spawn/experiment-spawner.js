export class ExperimentSpawner {
  constructor() {
    this.runningExperiments = new Map();
    this.completedExperiments = [];
    this.experimentTemplates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      'research-heavy': {
        approach: 'research-heavy',
        description: 'Thorough research and evidence gathering before action',
        contextModifier: 'Focus extensively on research, gather multiple sources, verify information thoroughly before proceeding.',
        estimatedDuration: 'longer',
        strengths: ['accuracy', 'comprehensiveness'],
        weaknesses: ['speed']
      },
      'implementation-focused': {
        approach: 'implementation-focused',
        description: 'Direct action and practical implementation',
        contextModifier: 'Focus on immediate implementation, prioritize working solutions, iterate quickly.',
        estimatedDuration: 'shorter',
        strengths: ['speed', 'practicality'],
        weaknesses: ['thoroughness']
      },
      'test-driven': {
        approach: 'test-driven',
        description: 'Start with defining success criteria and tests',
        contextModifier: 'Begin by defining clear success criteria and test cases, then implement to meet those requirements.',
        estimatedDuration: 'medium',
        strengths: ['reliability', 'clarity'],
        weaknesses: ['initial overhead']
      },
      'creative-first': {
        approach: 'creative-first',
        description: 'Emphasize creativity and innovative solutions',
        contextModifier: 'Prioritize creative and innovative approaches, think outside conventional patterns.',
        estimatedDuration: 'variable',
        strengths: ['innovation', 'uniqueness'],
        weaknesses: ['predictability']
      },
      'data-driven': {
        approach: 'data-driven',
        description: 'Base all decisions on data analysis and metrics',
        contextModifier: 'Make decisions based on data analysis, use metrics to guide approach, validate with numbers.',
        estimatedDuration: 'medium',
        strengths: ['objectivity', 'measurability'],
        weaknesses: ['flexibility']
      },
      'architecture-first': {
        approach: 'architecture-first',
        description: 'Start with high-level design and system architecture',
        contextModifier: 'Begin with high-level architecture and system design, then drill down to implementation details.',
        estimatedDuration: 'longer',
        strengths: ['scalability', 'maintainability'],
        weaknesses: ['time to first result']
      }
    };
  }

  async generateExperiments({ task, user, count = 5, variations = null }) {
    const experiments = [];
    
    // Use provided variations or generate default ones
    const experimentVariations = variations || this.generateDefaultVariations(task, count);
    
    for (let i = 0; i < Math.min(count, experimentVariations.length); i++) {
      const variation = experimentVariations[i];
      const experiment = this.createExperiment({
        task,
        user,
        approach: variation,
        experimentId: this.generateExperimentId()
      });
      
      experiments.push(experiment);
    }
    
    return experiments;
  }

  generateDefaultVariations(task, count) {
    const allApproaches = Object.keys(this.experimentTemplates);
    
    // Select most relevant approaches based on task
    const relevantApproaches = this.selectRelevantApproaches(task);
    
    // Add random approaches to fill count
    const remainingApproaches = allApproaches.filter(a => !relevantApproaches.includes(a));
    const selectedApproaches = [
      ...relevantApproaches.slice(0, Math.max(2, Math.floor(count * 0.6))),
      ...remainingApproaches.slice(0, count - relevantApproaches.length)
    ].slice(0, count);
    
    return selectedApproaches;
  }

  selectRelevantApproaches(task) {
    const taskLower = task.toLowerCase();
    const relevant = [];
    
    // Task-specific approach selection
    if (taskLower.includes('research') || taskLower.includes('analyze')) {
      relevant.push('research-heavy', 'data-driven');
    }
    
    if (taskLower.includes('implement') || taskLower.includes('build')) {
      relevant.push('implementation-focused', 'test-driven');
    }
    
    if (taskLower.includes('design') || taskLower.includes('architecture')) {
      relevant.push('architecture-first', 'creative-first');
    }
    
    if (taskLower.includes('create') || taskLower.includes('new')) {
      relevant.push('creative-first', 'architecture-first');
    }
    
    // Default fallbacks
    if (relevant.length === 0) {
      relevant.push('research-heavy', 'implementation-focused', 'test-driven');
    }
    
    return relevant;
  }

  createExperiment({ task, user, approach, experimentId }) {
    const template = this.experimentTemplates[approach];
    
    if (!template) {
      throw new Error(`Unknown experiment approach: ${approach}`);
    }
    
    return {
      id: experimentId,
      approach: approach,
      task: task,
      user: user,
      description: template.description,
      contextModifier: template.contextModifier,
      estimatedDuration: template.estimatedDuration,
      strengths: [...template.strengths],
      weaknesses: [...template.weaknesses],
      status: 'ready',
      createdAt: Date.now(),
      metadata: {
        priority: this.calculateExperimentPriority(approach, task),
        riskLevel: this.assessRiskLevel(approach),
        expectedOutcome: this.predictOutcome(approach, task)
      }
    };
  }

  calculateExperimentPriority(approach, task) {
    // Higher priority for approaches that match task characteristics
    const taskLower = task.toLowerCase();
    let priority = 0.5; // Base priority
    
    const template = this.experimentTemplates[approach];
    
    // Adjust based on task-approach alignment
    if ((taskLower.includes('quick') || taskLower.includes('fast')) && 
        template.estimatedDuration === 'shorter') {
      priority += 0.3;
    }
    
    if ((taskLower.includes('thorough') || taskLower.includes('comprehensive')) && 
        template.strengths.includes('accuracy')) {
      priority += 0.3;
    }
    
    if (taskLower.includes('creative') && template.strengths.includes('innovation')) {
      priority += 0.2;
    }
    
    return Math.min(1, priority);
  }

  assessRiskLevel(approach) {
    const riskLevels = {
      'research-heavy': 'low',
      'implementation-focused': 'medium',
      'test-driven': 'low',
      'creative-first': 'high',
      'data-driven': 'low',
      'architecture-first': 'medium'
    };
    
    return riskLevels[approach] || 'medium';
  }

  predictOutcome(approach, task) {
    const template = this.experimentTemplates[approach];
    
    return {
      expectedQuality: this.estimateQuality(approach, task),
      expectedSpeed: this.estimateSpeed(template.estimatedDuration),
      mainBenefit: template.strengths[0],
      mainRisk: template.weaknesses[0]
    };
  }

  estimateQuality(approach, task) {
    // Simple quality estimation based on approach characteristics
    const qualityMap = {
      'research-heavy': 0.9,
      'implementation-focused': 0.7,
      'test-driven': 0.85,
      'creative-first': 0.6,
      'data-driven': 0.8,
      'architecture-first': 0.85
    };
    
    let quality = qualityMap[approach] || 0.7;
    
    // Adjust for task complexity
    if (task.toLowerCase().includes('complex')) {
      if (['research-heavy', 'architecture-first'].includes(approach)) {
        quality += 0.1;
      } else {
        quality -= 0.1;
      }
    }
    
    return Math.max(0.1, Math.min(1, quality));
  }

  estimateSpeed(duration) {
    const speedMap = {
      'shorter': 0.9,
      'medium': 0.7,
      'longer': 0.4,
      'variable': 0.6
    };
    
    return speedMap[duration] || 0.6;
  }

  generateExperimentId() {
    return `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Experiment lifecycle management
  async startExperiment(experimentId) {
    const experiment = this.findExperiment(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }
    
    experiment.status = 'running';
    experiment.startedAt = Date.now();
    this.runningExperiments.set(experimentId, experiment);
    
    return experiment;
  }

  async completeExperiment(experimentId, results) {
    const experiment = this.runningExperiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Running experiment ${experimentId} not found`);
    }
    
    experiment.status = 'completed';
    experiment.completedAt = Date.now();
    experiment.duration = experiment.completedAt - experiment.startedAt;
    experiment.results = results;
    
    // Move to completed experiments
    this.runningExperiments.delete(experimentId);
    this.completedExperiments.push(experiment);
    
    return experiment;
  }

  findExperiment(experimentId) {
    // Check running experiments
    if (this.runningExperiments.has(experimentId)) {
      return this.runningExperiments.get(experimentId);
    }
    
    // Check completed experiments
    return this.completedExperiments.find(exp => exp.id === experimentId);
  }

  // Analysis and optimization
  analyzeExperimentResults(experiments) {
    if (!experiments || experiments.length === 0) {
      return {
        summary: 'No experiments to analyze',
        recommendations: []
      };
    }
    
    const analysis = {
      totalExperiments: experiments.length,
      approaches: {},
      overallMetrics: {
        avgQuality: 0,
        avgDuration: 0,
        successRate: 0
      },
      insights: [],
      recommendations: []
    };
    
    // Analyze by approach
    for (const experiment of experiments) {
      if (!analysis.approaches[experiment.approach]) {
        analysis.approaches[experiment.approach] = {
          count: 0,
          avgQuality: 0,
          avgDuration: 0,
          successRate: 0,
          successes: 0
        };
      }
      
      const approachData = analysis.approaches[experiment.approach];
      approachData.count++;
      
      if (experiment.results) {
        if (experiment.results.success) {
          approachData.successes++;
        }
        approachData.avgQuality += experiment.results.quality || 0;
        approachData.avgDuration += experiment.duration || 0;
      }
    }
    
    // Calculate averages
    for (const approach of Object.keys(analysis.approaches)) {
      const data = analysis.approaches[approach];
      data.avgQuality /= data.count;
      data.avgDuration /= data.count;
      data.successRate = data.successes / data.count;
    }
    
    // Find best performing approaches
    const bestApproach = Object.entries(analysis.approaches)
      .reduce((best, [approach, data]) => {
        const score = (data.successRate * 0.5) + (data.avgQuality * 0.3) + ((1 - data.avgDuration / 10000) * 0.2);
        return score > best.score ? { approach, score, data } : best;
      }, { approach: null, score: 0 });
    
    if (bestApproach.approach) {
      analysis.recommendations.push(
        `Best performing approach: ${bestApproach.approach} (success rate: ${(bestApproach.data.successRate * 100).toFixed(1)}%)`
      );
    }
    
    // Generate insights
    analysis.insights = this.generateInsights(analysis.approaches);
    
    return analysis;
  }

  generateInsights(approachData) {
    const insights = [];
    
    // Find patterns in approach performance
    const approaches = Object.entries(approachData);
    
    // Speed vs Quality tradeoffs
    const fastApproaches = approaches.filter(([_, data]) => data.avgDuration < 5000);
    const slowApproaches = approaches.filter(([_, data]) => data.avgDuration > 10000);
    
    if (fastApproaches.length > 0 && slowApproaches.length > 0) {
      const fastAvgQuality = fastApproaches.reduce((sum, [_, data]) => sum + data.avgQuality, 0) / fastApproaches.length;
      const slowAvgQuality = slowApproaches.reduce((sum, [_, data]) => sum + data.avgQuality, 0) / slowApproaches.length;
      
      if (slowAvgQuality > fastAvgQuality + 0.1) {
        insights.push('Slower approaches tend to produce higher quality results');
      } else if (fastAvgQuality > slowAvgQuality + 0.1) {
        insights.push('Faster approaches can maintain quality while improving speed');
      }
    }
    
    // Success rate patterns
    const highSuccessApproaches = approaches.filter(([_, data]) => data.successRate > 0.8);
    if (highSuccessApproaches.length > 0) {
      insights.push(`High success rate approaches: ${highSuccessApproaches.map(([name]) => name).join(', ')}`);
    }
    
    return insights;
  }

  // Experiment optimization
  optimizeExperimentSelection(task, previousResults = []) {
    const relevantApproaches = this.selectRelevantApproaches(task);
    
    // Adjust based on previous results
    if (previousResults.length > 0) {
      const analysis = this.analyzeExperimentResults(previousResults);
      
      // Prioritize successful approaches
      const successfulApproaches = Object.entries(analysis.approaches)
        .filter(([_, data]) => data.successRate > 0.6)
        .map(([approach]) => approach);
      
      // Combine relevant and successful approaches
      const optimizedApproaches = [
        ...successfulApproaches,
        ...relevantApproaches.filter(a => !successfulApproaches.includes(a))
      ];
      
      return optimizedApproaches.slice(0, 5);
    }
    
    return relevantApproaches;
  }

  // Cloud simulation (for future cloud integration)
  simulateCloudSpawn(experiments) {
    return experiments.map(experiment => ({
      ...experiment,
      cloudInstance: {
        instanceId: `cloud-${experiment.id}`,
        region: this.selectOptimalRegion(),
        estimatedCost: this.estimateCost(experiment),
        estimatedCompletionTime: this.estimateCompletionTime(experiment)
      }
    }));
  }

  selectOptimalRegion() {
    // Simple region selection simulation
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    return regions[Math.floor(Math.random() * regions.length)];
  }

  estimateCost(experiment) {
    // Simple cost estimation
    const baseCost = 0.10; // $0.10 base
    const durationMultiplier = {
      'shorter': 1,
      'medium': 1.5,
      'longer': 2.5,
      'variable': 1.8
    };
    
    const template = this.experimentTemplates[experiment.approach];
    return baseCost * (durationMultiplier[template.estimatedDuration] || 1.5);
  }

  estimateCompletionTime(experiment) {
    // Simple time estimation in minutes
    const baseTime = 2; // 2 minutes base
    const timeMultiplier = {
      'shorter': 1,
      'medium': 2,
      'longer': 4,
      'variable': 3
    };
    
    const template = this.experimentTemplates[experiment.approach];
    return baseTime * (timeMultiplier[template.estimatedDuration] || 2);
  }

  // Utilities
  getExperimentStatus(experimentId) {
    const experiment = this.findExperiment(experimentId);
    return experiment ? experiment.status : 'not found';
  }

  getRunningExperiments() {
    return Array.from(this.runningExperiments.values());
  }

  getCompletedExperiments() {
    return [...this.completedExperiments];
  }

  clearCompletedExperiments() {
    this.completedExperiments.length = 0;
  }
}