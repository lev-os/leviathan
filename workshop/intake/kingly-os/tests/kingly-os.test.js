import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { KinglyOS } from '../kingly-os.js';

describe('KinglyOS', () => {
  let os;

  beforeEach(() => {
    os = new KinglyOS();
  });

  describe('Task Routing', () => {
    it('should route to workflow mode when pattern is recognized', async () => {
      // Add workflow pattern
      os.addWorkflow('code-review', {
        trigger: /review.*code|code.*review/i,
        agents: ['dev', 'qa']
      });

      const result = await os.processRequest({
        user: 'testUser',
        message: 'Please review this code for me'
      });

      assert.equal(result.mode, 'workflow');
      assert.equal(result.workflow, 'code-review');
      assert.deepEqual(result.agents, ['dev', 'qa']);
    });

    it('should route to learning mode for unknown complex tasks', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'Create a quantum computing simulation with error correction'
      });

      assert.equal(result.mode, 'learning');
      assert.ok(result.experiments);
      assert.ok(result.experiments.length > 0);
    });

    it('should route to default mode for simple tasks', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'What is 2 + 2?'
      });

      assert.equal(result.mode, 'default');
      assert.ok(result.agent);
      assert.ok(result.context);
    });
  });

  describe('Agent Selection', () => {
    it('should select appropriate nano-agent based on task', async () => {
      const testCases = [
        { message: 'Write a blog post', expectedAgent: 'writer' },
        { message: 'Debug this code', expectedAgent: 'dev' },
        { message: 'Research market trends', expectedAgent: 'researcher' },
        { message: 'Plan the quarterly roadmap', expectedAgent: 'ceo' }
      ];

      for (const { message, expectedAgent } of testCases) {
        const result = await os.processRequest({
          user: 'testUser',
          message
        });
        assert.equal(result.agent.type, expectedAgent);
      }
    });

    it('should track agent performance metrics', async () => {
      await os.processRequest({
        user: 'testUser',
        message: 'Write a story'
      });

      // Simulate completion
      os.completeInteraction('testUser', { success: true, quality: 0.9 });

      const metrics = os.getAgentMetrics('writer');
      assert.ok(metrics.successRate > 0);
      assert.ok(metrics.avgQuality > 0);
    });
  });

  describe('User Preferences', () => {
    it('should remember and apply user preferences', async () => {
      // Set user preference
      os.setUserPreference('testUser', 'responseFormat', 'numbered');

      const result = await os.processRequest({
        user: 'testUser',
        message: 'Give me some options'
      });

      assert.ok(result.context.includes('numbered format'));
    });

    it('should apply user-specific context rules', async () => {
      os.setUserPreference('jean-patrick', 'style', 'concise');

      const result = await os.processRequest({
        user: 'jean-patrick',
        message: 'Explain quantum computing'
      });

      assert.ok(result.context.includes('concise'));
    });
  });

  describe('Learning Mode', () => {
    it('should spawn multiple experiments for complex tasks', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'Design a distributed AI training system'
      });

      assert.equal(result.mode, 'learning');
      assert.ok(result.experiments.length >= 5);
      
      // Check experiment variations
      const variations = result.experiments.map(e => e.approach);
      assert.ok(variations.includes('research-heavy'));
      assert.ok(variations.includes('implementation-focused'));
      assert.ok(variations.includes('architecture-first'));
    });

    it('should track learning outcomes', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'Create a new programming language'
      });

      // Simulate experiment results
      os.recordExperimentResult(result.experimentId, {
        approach: 'parser-first',
        success: true,
        quality: 0.95
      });

      const pattern = os.getLearnedPattern('programming-language-creation');
      assert.ok(pattern);
      assert.equal(pattern.bestApproach, 'parser-first');
    });
  });

  describe('Workflow Management', () => {
    it('should execute multi-agent workflows', async () => {
      os.addWorkflow('feature-development', {
        trigger: /new feature|add feature/i,
        agents: ['researcher', 'dev', 'qa'],
        sequence: 'sequential'
      });

      const result = await os.processRequest({
        user: 'testUser',
        message: 'Add new feature for user authentication'
      });

      assert.equal(result.mode, 'workflow');
      assert.equal(result.workflow, 'feature-development');
      assert.equal(result.currentAgent, 'researcher');
      assert.equal(result.nextAgent, 'dev');
    });

    it('should support parallel workflows', async () => {
      os.addWorkflow('analysis', {
        trigger: /analyze/i,
        agents: ['researcher', 'dev'],
        sequence: 'parallel'
      });

      const result = await os.processRequest({
        user: 'testUser',
        message: 'Analyze the codebase performance'
      });

      assert.equal(result.mode, 'workflow');
      assert.equal(result.agents.length, 2);
      assert.ok(result.parallel);
    });
  });

  describe('Context Assembly', () => {
    it('should calculate confidence scores', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'Write unit tests'
      });

      assert.ok(result.confidence);
      assert.ok(result.confidence >= 0);
      assert.ok(result.confidence <= 1);
    });

    it('should estimate token usage', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: 'Explain machine learning'
      });

      assert.ok(result.estimatedTokens);
      assert.ok(result.estimatedTokens > 0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests gracefully', async () => {
      const result = await os.processRequest({
        user: null,
        message: ''
      });

      assert.ok(result.error);
      assert.equal(result.mode, 'error');
    });

    it('should fallback when no suitable agent found', async () => {
      const result = await os.processRequest({
        user: 'testUser',
        message: '���� ����' // gibberish
      });

      assert.equal(result.mode, 'default');
      assert.ok(result.agent);
    });
  });
});