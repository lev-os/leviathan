import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NanoAgent } from '../nano-agents/base-nano-agent.js';

describe('NanoAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new NanoAgent('test-agent');
  });

  describe('Base Functionality', () => {
    it('should initialize with type only', () => {
      assert.equal(agent.type, 'test-agent');
      assert.equal(agent.builtInBehavior, null);
      assert.deepEqual(agent.capabilities, []);
    });

    it('should execute with injected context', async () => {
      const context = 'You are a helpful assistant. Answer questions directly.';
      const result = await agent.execute('What is 2+2?', context);

      assert.ok(result);
      assert.ok(typeof result === 'string');
      assert.ok(result.length > 0);
    });

    it('should maintain interaction history', async () => {
      await agent.execute('First question', 'Helper context');
      await agent.execute('Second question', 'Helper context');

      const history = agent.getHistory();
      assert.equal(history.length, 2);
      assert.equal(history[0].input, 'First question');
      assert.equal(history[1].input, 'Second question');
    });
  });

  describe('Context Handling', () => {
    it('should require context for execution', async () => {
      try {
        await agent.execute('Test question');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('context'));
      }
    });

    it('should merge multiple context sources', async () => {
      const baseContext = 'You are helpful.';
      const userContext = 'Be concise.';
      const workflowContext = 'Follow checklist.';

      const result = await agent.executeWithMultipleContexts(
        'Test question',
        [baseContext, userContext, workflowContext]
      );

      assert.ok(result);
      // Context should influence behavior
      assert.ok(result.length < 500); // concise
    });

    it('should handle context injection points', async () => {
      const context = {
        system: 'You are an expert.',
        prepend: 'Important: ',
        append: ' Always be accurate.'
      };

      const result = await agent.executeWithStructuredContext(
        'What is AI?',
        context
      );

      assert.ok(result);
      // Should show influence of structured context
    });
  });

  describe('Specialization through Context', () => {
    it('should behave as researcher with research context', async () => {
      const researchContext = `
        You are a thorough researcher. Always cite sources.
        Provide evidence-based answers with references.
        Structure responses as: Overview, Details, Sources.
      `;

      const result = await agent.execute(
        'Tell me about quantum computing',
        researchContext
      );

      assert.ok(result.includes('Sources') || result.includes('references'));
    });

    it('should behave as developer with dev context', async () => {
      const devContext = `
        You are an expert software developer.
        Provide code examples and best practices.
        Focus on practical implementation.
      `;

      const result = await agent.execute(
        'How to implement authentication?',
        devContext
      );

      assert.ok(result.includes('code') || result.includes('implement'));
    });

    it('should behave as writer with creative context', async () => {
      const writerContext = `
        You are a creative writer.
        Use vivid language and storytelling techniques.
        Engage the reader with compelling narratives.
      `;

      const result = await agent.execute(
        'Describe a futuristic city',
        writerContext
      );

      assert.ok(result.length > 200); // Should be detailed/creative
    });
  });

  describe('Performance Tracking', () => {
    it('should track execution metrics', async () => {
      const start = Date.now();
      await agent.execute('Test question', 'Helper context');
      
      const metrics = agent.getMetrics();
      assert.ok(metrics.totalExecutions >= 1);
      assert.ok(metrics.lastExecutionTime > 0);
      assert.ok(metrics.avgResponseTime >= 0);
    });

    it('should calculate success rates', async () => {
      // Simulate successful executions
      await agent.execute('Good question', 'Good context');
      agent.recordSuccess(true);
      
      await agent.execute('Another question', 'Good context');
      agent.recordSuccess(true);
      
      // Simulate failure
      await agent.execute('Bad question', 'Bad context');
      agent.recordSuccess(false);

      const metrics = agent.getMetrics();
      assert.equal(metrics.successRate, 2/3);
    });

    it('should track context effectiveness', async () => {
      const contextA = 'Be helpful and accurate.';
      const contextB = 'Be creative and engaging.';

      await agent.execute('Question 1', contextA);
      agent.recordContextFeedback(contextA, 0.9);

      await agent.execute('Question 2', contextB);
      agent.recordContextFeedback(contextB, 0.7);

      const effectiveness = agent.getContextEffectiveness();
      assert.ok(effectiveness[contextA] > effectiveness[contextB]);
    });
  });

  describe('Learning and Adaptation', () => {
    it('should learn from feedback', async () => {
      await agent.execute('Test', 'Initial context');
      
      agent.provideFeedback({
        quality: 0.3,
        suggestion: 'Be more specific'
      });

      const adaptations = agent.getAdaptations();
      assert.ok(adaptations.length > 0);
      assert.ok(adaptations[0].includes('specific'));
    });

    it('should suggest context improvements', async () => {
      // Multiple executions with poor results
      for (let i = 0; i < 5; i++) {
        await agent.execute('Question', 'Vague context');
        agent.recordSuccess(false);
      }

      const suggestions = agent.suggestContextImprovements();
      assert.ok(suggestions.length > 0);
      assert.ok(suggestions.some(s => s.includes('specific') || s.includes('clear')));
    });

    it('should identify successful patterns', async () => {
      const goodContext = 'Detailed expert context with examples';
      
      // Multiple successful executions with same context pattern
      for (let i = 0; i < 5; i++) {
        await agent.execute(`Question ${i}`, goodContext);
        agent.recordSuccess(true);
      }

      const patterns = agent.identifySuccessfulPatterns();
      assert.ok(patterns.length > 0);
      assert.ok(patterns[0].context.includes('Detailed'));
    });
  });

  describe('Workflow Integration', () => {
    it('should maintain workflow state', async () => {
      agent.setWorkflowState({
        workflowId: 'test-workflow',
        stage: 2,
        previousOutputs: ['Stage 1 result']
      });

      const state = agent.getWorkflowState();
      assert.equal(state.workflowId, 'test-workflow');
      assert.equal(state.stage, 2);
    });

    it('should pass context between workflow stages', async () => {
      const stage1Result = await agent.execute(
        'Stage 1 task',
        'Stage 1 context'
      );

      agent.setWorkflowState({
        workflowId: 'multi-stage',
        stage: 2,
        previousOutputs: [stage1Result]
      });

      const stage2Result = await agent.execute(
        'Stage 2 task, use previous result',
        'Stage 2 context, previous: ' + stage1Result
      );

      assert.ok(stage2Result);
      // Should reference or build upon stage 1
    });

    it('should coordinate with parallel agents', async () => {
      agent.setParallelCoordination({
        parallelAgents: ['agent-2', 'agent-3'],
        sharedState: { key: 'value' }
      });

      const coordination = agent.getParallelCoordination();
      assert.deepEqual(coordination.parallelAgents, ['agent-2', 'agent-3']);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed context gracefully', async () => {
      const result = await agent.execute(
        'Test question',
        null // malformed context
      );

      assert.ok(result);
      assert.ok(result.includes('error') || result.includes('unable'));
    });

    it('should recover from execution failures', async () => {
      // Simulate failure scenario
      const originalExecute = agent.execute;
      agent.execute = () => { throw new Error('Simulated failure'); };

      const result = await agent.safeExecute('Test', 'Context');
      assert.ok(result.error);

      // Restore and verify recovery
      agent.execute = originalExecute;
      const recovered = await agent.execute('Test', 'Context');
      assert.ok(!recovered.error);
    });

    it('should maintain stability under load', async () => {
      const promises = [];
      
      // Simulate concurrent executions
      for (let i = 0; i < 10; i++) {
        promises.push(agent.execute(`Question ${i}`, 'Context'));
      }

      const results = await Promise.all(promises);
      assert.equal(results.length, 10);
      assert.ok(results.every(r => typeof r === 'string'));
    });
  });
});