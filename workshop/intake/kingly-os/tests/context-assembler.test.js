import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ContextAssembler } from '../assembly-engine/context-assembler.js';

describe('ContextAssembler', () => {
  let assembler;

  beforeEach(() => {
    assembler = new ContextAssembler();
  });

  describe('Basic Assembly', () => {
    it('should assemble context for a nano-agent', () => {
      const context = assembler.assemble({
        agent: { type: 'researcher' },
        task: 'Find information about quantum computing',
        user: 'testUser'
      });

      assert.ok(context.includes('researcher'));
      assert.ok(context.includes('quantum computing'));
      assert.ok(context.length > 0);
    });

    it('should include user preferences in context', () => {
      assembler.setUserPreference('testUser', 'style', 'academic');
      
      const context = assembler.assemble({
        agent: { type: 'writer' },
        task: 'Write an article',
        user: 'testUser'
      });

      assert.ok(context.includes('academic style'));
    });

    it('should apply injection rules', () => {
      assembler.addRule({
        condition: { agentType: 'dev' },
        inject: {
          prepend: 'You are a expert developer.',
          append: 'Follow best practices.'
        }
      });

      const context = assembler.assemble({
        agent: { type: 'dev' },
        task: 'Fix the bug',
        user: 'testUser'
      });

      assert.ok(context.startsWith('You are a expert developer.'));
      assert.ok(context.endsWith('Follow best practices.'));
    });
  });

  describe('Workflow Context', () => {
    it('should include workflow context when specified', () => {
      const context = assembler.assemble({
        agent: { type: 'dev' },
        task: 'Review code',
        user: 'testUser',
        workflow: 'code-review',
        workflowStage: 2,
        previousAgents: ['researcher']
      });

      assert.ok(context.includes('code-review workflow'));
      assert.ok(context.includes('stage 2'));
      assert.ok(context.includes('researcher'));
    });

    it('should handle parallel workflow context', () => {
      const context = assembler.assemble({
        agent: { type: 'dev' },
        task: 'Analyze performance',
        user: 'testUser',
        workflow: 'analysis',
        parallel: true,
        parallelAgents: ['researcher', 'qa']
      });

      assert.ok(context.includes('parallel'));
      assert.ok(context.includes('coordinate with'));
    });
  });

  describe('Learning Mode Context', () => {
    it('should generate experimental variations', () => {
      const variations = assembler.generateExperimentalContexts({
        agent: { type: 'dev' },
        task: 'Create a new framework',
        user: 'testUser'
      });

      assert.ok(variations.length >= 5);
      
      const approaches = variations.map(v => v.approach);
      assert.ok(approaches.includes('research-heavy'));
      assert.ok(approaches.includes('implementation-focused'));
      assert.ok(approaches.includes('test-driven'));
    });

    it('should incorporate learned patterns', () => {
      assembler.addLearnedPattern('framework-creation', {
        bestApproach: 'architecture-first',
        context: 'Start with high-level design'
      });

      const context = assembler.assemble({
        agent: { type: 'dev' },
        task: 'Create a new framework',
        user: 'testUser'
      });

      assert.ok(context.includes('Start with high-level design'));
    });
  });

  describe('Token Estimation', () => {
    it('should estimate token count accurately', () => {
      const context = assembler.assemble({
        agent: { type: 'writer' },
        task: 'Write a short story',
        user: 'testUser'
      });

      const tokens = assembler.estimateTokens(context);
      assert.ok(tokens > 0);
      assert.ok(tokens < 10000); // reasonable upper bound
    });

    it('should warn when approaching token limits', () => {
      // Add many rules to create large context
      for (let i = 0; i < 100; i++) {
        assembler.addRule({
          condition: { always: true },
          inject: { append: 'Lorem ipsum dolor sit amet '.repeat(100) }
        });
      }

      const result = assembler.assembleWithMetadata({
        agent: { type: 'writer' },
        task: 'Write',
        user: 'testUser'
      });

      assert.ok(result.warnings);
      assert.ok(result.warnings.some(w => w.includes('token')));
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence based on rule matches', () => {
      assembler.addRule({
        condition: { agentType: 'dev', taskContains: 'bug' },
        inject: { prepend: 'Debug expert.' },
        confidence: 0.9
      });

      const result = assembler.assembleWithMetadata({
        agent: { type: 'dev' },
        task: 'Fix the bug in authentication',
        user: 'testUser'
      });

      assert.ok(result.confidence >= 0.9);
    });

    it('should reduce confidence for ambiguous tasks', () => {
      const result = assembler.assembleWithMetadata({
        agent: { type: 'researcher' },
        task: 'Do something with the data',
        user: 'testUser'
      });

      assert.ok(result.confidence < 0.7);
    });
  });

  describe('Rule Management', () => {
    it('should prioritize rules by specificity', () => {
      assembler.addRule({
        condition: { agentType: 'dev' },
        inject: { prepend: 'General dev.' },
        priority: 1
      });

      assembler.addRule({
        condition: { agentType: 'dev', taskContains: 'python' },
        inject: { prepend: 'Python expert.' },
        priority: 10
      });

      const context = assembler.assemble({
        agent: { type: 'dev' },
        task: 'Write python script',
        user: 'testUser'
      });

      assert.ok(context.startsWith('Python expert.'));
    });

    it('should support conditional rule application', () => {
      assembler.addRule({
        condition: { 
          agentType: 'writer',
          userPreference: { style: 'technical' }
        },
        inject: { 
          append: 'Use technical terminology and precise language.'
        }
      });

      assembler.setUserPreference('techUser', 'style', 'technical');

      const context = assembler.assemble({
        agent: { type: 'writer' },
        task: 'Explain the algorithm',
        user: 'techUser'
      });

      assert.ok(context.includes('technical terminology'));
    });
  });

  describe('Dynamic Updates', () => {
    it('should update rules based on feedback', () => {
      const ruleId = assembler.addRule({
        condition: { agentType: 'researcher' },
        inject: { prepend: 'Research approach A.' }
      });

      assembler.updateRuleFromFeedback(ruleId, {
        success: false,
        alternative: 'Research approach B.'
      });

      const context = assembler.assemble({
        agent: { type: 'researcher' },
        task: 'Find papers',
        user: 'testUser'
      });

      assert.ok(context.includes('Research approach B.'));
    });

    it('should merge similar patterns', () => {
      assembler.addLearnedPattern('code-optimization', {
        approach: 'profile-first'
      });

      assembler.addLearnedPattern('performance-tuning', {
        approach: 'profile-first'
      });

      const patterns = assembler.getPatterns();
      assert.ok(patterns.some(p => p.merged));
    });
  });
});