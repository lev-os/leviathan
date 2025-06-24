import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PatternDetector } from '../learning-engine/pattern-detector.js';

describe('PatternDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  describe('Interaction Analysis', () => {
    it('should analyze successful interaction patterns', () => {
      const interactions = [
        {
          agent: 'dev',
          task: 'fix bug in authentication',
          context: 'debug expert with step-by-step approach',
          outcome: { success: true, quality: 0.9 }
        },
        {
          agent: 'dev',
          task: 'fix bug in payment system',
          context: 'debug expert with step-by-step approach',
          outcome: { success: true, quality: 0.85 }
        },
        {
          agent: 'dev',
          task: 'fix bug in user management',
          context: 'quick fix approach',
          outcome: { success: false, quality: 0.3 }
        }
      ];

      const patterns = detector.analyzeInteractions(interactions);
      
      assert.ok(patterns.length > 0);
      const debugPattern = patterns.find(p => 
        p.context.includes('step-by-step')
      );
      assert.ok(debugPattern);
      assert.ok(debugPattern.successRate > 0.8);
    });

    it('should identify failing patterns', () => {
      const interactions = [
        {
          agent: 'writer',
          task: 'write technical docs',
          context: 'creative writing style',
          outcome: { success: false, quality: 0.4 }
        },
        {
          agent: 'writer',
          task: 'write user manual',
          context: 'creative writing style',
          outcome: { success: false, quality: 0.3 }
        }
      ];

      const antiPatterns = detector.identifyAntiPatterns(interactions);
      
      assert.ok(antiPatterns.length > 0);
      assert.ok(antiPatterns[0].context.includes('creative'));
      assert.ok(antiPatterns[0].reason.includes('mismatch'));
    });

    it('should detect context-task alignment', () => {
      const alignment = detector.analyzeAlignment({
        agent: 'researcher',
        task: 'find academic papers on AI',
        context: 'thorough researcher with citation requirements'
      });

      assert.ok(alignment.score > 0.8);
      assert.ok(alignment.reasons.includes('task-context match'));
    });
  });

  describe('Pattern Extraction', () => {
    it('should extract reusable patterns from successful outcomes', () => {
      detector.addInteraction({
        agent: 'ceo',
        task: 'create quarterly strategy',
        context: 'strategic thinker with data-driven approach',
        outcome: { success: true, quality: 0.95, userSatisfaction: 0.9 }
      });

      detector.addInteraction({
        agent: 'ceo',
        task: 'plan product roadmap',
        context: 'strategic thinker with data-driven approach',
        outcome: { success: true, quality: 0.9, userSatisfaction: 0.85 }
      });

      const patterns = detector.extractPatterns();
      const strategyPattern = patterns.find(p => 
        p.domain === 'strategic-planning'
      );

      assert.ok(strategyPattern);
      assert.ok(strategyPattern.template.includes('data-driven'));
      assert.ok(strategyPattern.confidence > 0.8);
    });

    it('should create contextual variations', () => {
      const basePattern = {
        agent: 'dev',
        taskType: 'debugging',
        context: 'systematic debugger'
      };

      const variations = detector.generateVariations(basePattern);
      
      assert.ok(variations.length >= 3);
      assert.ok(variations.some(v => v.context.includes('test-driven')));
      assert.ok(variations.some(v => v.context.includes('performance')));
    });

    it('should merge similar patterns', () => {
      detector.addPattern({
        id: 'pattern1',
        agent: 'writer',
        context: 'technical documentation expert',
        successRate: 0.8
      });

      detector.addPattern({
        id: 'pattern2',
        agent: 'writer',
        context: 'documentation specialist with technical focus',
        successRate: 0.85
      });

      const merged = detector.mergePatterns();
      const docPattern = merged.find(p => 
        p.context.includes('technical') && p.context.includes('documentation')
      );

      assert.ok(docPattern);
      assert.ok(docPattern.confidence > 0.8);
    });
  });

  describe('Learning Engine', () => {
    it('should improve patterns over time', () => {
      const patternId = detector.addPattern({
        agent: 'researcher',
        context: 'basic researcher',
        successRate: 0.6
      });

      // Simulate learning from new interactions
      detector.updatePattern(patternId, {
        newInteractions: 5,
        newSuccesses: 4,
        contextUpdates: ['add citation focus', 'add source verification']
      });

      const updatedPattern = detector.getPattern(patternId);
      assert.ok(updatedPattern.successRate > 0.6);
      assert.ok(updatedPattern.context.includes('citation'));
    });

    it('should deprecate unsuccessful patterns', () => {
      const patternId = detector.addPattern({
        agent: 'dev',
        context: 'quick and dirty coder',
        successRate: 0.2
      });

      // Add more failures
      for (let i = 0; i < 10; i++) {
        detector.recordFailure(patternId);
      }

      const pattern = detector.getPattern(patternId);
      assert.ok(pattern.deprecated);
      assert.ok(pattern.alternatives.length > 0);
    });

    it('should suggest pattern improvements', () => {
      detector.addInteraction({
        agent: 'qa',
        task: 'test mobile app',
        context: 'basic tester',
        outcome: { success: false, quality: 0.4 },
        feedback: 'missed edge cases'
      });

      const suggestions = detector.suggestImprovements({
        agent: 'qa',
        taskType: 'mobile-testing'
      });

      assert.ok(suggestions.length > 0);
      assert.ok(suggestions.some(s => s.includes('edge case')));
    });
  });

  describe('Experiment Analysis', () => {
    it('should analyze experiment results', () => {
      const experiments = [
        {
          approach: 'research-heavy',
          agent: 'researcher',
          task: 'analyze market trends',
          outcome: { success: true, quality: 0.9 }
        },
        {
          approach: 'quick-analysis',
          agent: 'researcher',
          task: 'analyze market trends',
          outcome: { success: false, quality: 0.5 }
        },
        {
          approach: 'data-driven',
          agent: 'researcher',
          task: 'analyze market trends',
          outcome: { success: true, quality: 0.85 }
        }
      ];

      const analysis = detector.analyzeExperiments(experiments);
      
      assert.equal(analysis.bestApproach, 'research-heavy');
      assert.ok(analysis.confidence > 0.8);
    });

    it('should recommend experiment designs', () => {
      const recommendation = detector.recommendExperiments({
        agent: 'dev',
        task: 'optimize database queries',
        unknownFactors: ['scale', 'query types', 'indexing strategy']
      });

      assert.ok(recommendation.experiments.length >= 3);
      assert.ok(recommendation.experiments.some(e => 
        e.variation.includes('index')
      ));
    });

    it('should track experiment convergence', () => {
      const experiments = [];
      
      // Add converging experiments
      for (let i = 0; i < 10; i++) {
        experiments.push({
          approach: 'test-driven-dev',
          outcome: { success: true, quality: 0.8 + (i * 0.01) }
        });
      }

      const convergence = detector.analyzeConvergence(experiments);
      assert.ok(convergence.isConverging);
      assert.equal(convergence.optimalApproach, 'test-driven-dev');
    });
  });

  describe('Pattern Prediction', () => {
    it('should predict success probability', () => {
      // Train with historical data
      detector.addInteraction({
        agent: 'writer',
        task: 'blog post about technology',
        context: 'technical writer with industry knowledge',
        outcome: { success: true, quality: 0.9 }
      });

      const prediction = detector.predictSuccess({
        agent: 'writer',
        task: 'article about AI trends',
        context: 'technical writer with industry knowledge'
      });

      assert.ok(prediction.probability > 0.7);
      assert.ok(prediction.confidence > 0.5);
    });

    it('should recommend optimal context', () => {
      // Train with various contexts
      const trainingData = [
        {
          agent: 'dev',
          task: 'API development',
          context: 'REST API expert',
          outcome: { success: true, quality: 0.95 }
        },
        {
          agent: 'dev',
          task: 'API development',
          context: 'general programmer',
          outcome: { success: true, quality: 0.7 }
        }
      ];

      trainingData.forEach(d => detector.addInteraction(d));

      const recommendation = detector.recommendOptimalContext({
        agent: 'dev',
        task: 'build GraphQL API'
      });

      assert.ok(recommendation.context.includes('API'));
      assert.ok(recommendation.confidence > 0.6);
    });

    it('should identify knowledge gaps', () => {
      const gaps = detector.identifyKnowledgeGaps({
        agent: 'researcher',
        unsuccessfulTasks: [
          'quantum computing research',
          'blockchain analysis',
          'cryptocurrency trends'
        ]
      });

      assert.ok(gaps.length > 0);
      assert.ok(gaps.some(g => g.domain === 'emerging-technology'));
    });
  });

  describe('Continuous Learning', () => {
    it('should adapt to user feedback', () => {
      const patternId = detector.addPattern({
        agent: 'ceo',
        context: 'business strategist',
        successRate: 0.7
      });

      detector.incorporateFeedback(patternId, {
        userRating: 0.9,
        feedback: 'excellent strategic thinking, add more market analysis',
        suggestion: 'include competitive analysis'
      });

      const updated = detector.getPattern(patternId);
      assert.ok(updated.context.includes('market analysis'));
      assert.ok(updated.successRate > 0.7);
    });

    it('should evolve patterns based on environment changes', () => {
      detector.addEnvironmentChange({
        type: 'technology-shift',
        description: 'increased focus on AI/ML',
        impact: 'development tasks now require AI knowledge'
      });

      const evolvedPattern = detector.evolvePattern({
        agent: 'dev',
        context: 'full-stack developer'
      });

      assert.ok(evolvedPattern.context.includes('AI') || 
                evolvedPattern.context.includes('ML'));
    });

    it('should maintain pattern diversity', () => {
      // Add many similar patterns
      for (let i = 0; i < 20; i++) {
        detector.addPattern({
          agent: 'writer',
          context: `technical writer variant ${i}`,
          successRate: 0.8
        });
      }

      const diversity = detector.maintainDiversity();
      assert.ok(diversity.removedRedundant > 0);
      assert.ok(diversity.maintainedUnique > 5);
    });
  });
});