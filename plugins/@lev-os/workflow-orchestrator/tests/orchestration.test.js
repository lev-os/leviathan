/**
 * Basic tests for workflow orchestration
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { 
  FlowMind, 
  WorkflowOrchestrator,
  ContextSwitcher,
  OutputManager,
  FeedbackLoop
} from '../src/core/index.js';

test('FlowMind should create from YAML', async (t) => {
  const yaml = {
    metadata: {
      type: 'workflow',
      id: 'test-workflow',
      version: '1.0.0'
    },
    workflow_config: {
      steps: [
        { id: 'step1', name: 'First Step' },
        { id: 'step2', name: 'Second Step' }
      ]
    }
  };
  
  const flowmind = new FlowMind(yaml);
  
  assert.equal(flowmind.type, 'workflow');
  assert.equal(flowmind.id, 'test-workflow');
  assert.equal(flowmind.steps.length, 2);
  assert.equal(flowmind.steps[0].id, 'step1');
});

test('WorkflowOrchestrator should execute simple workflow', async (t) => {
  const workflow = {
    metadata: {
      type: 'workflow',
      id: 'simple-test'
    },
    workflow_config: {
      steps: [
        {
          id: 'echo',
          name: 'Echo Step',
          instruction: 'Echo the input'
        }
      ]
    }
  };
  
  // Create orchestrator with mock callback
  const orchestrator = new WorkflowOrchestrator({
    onEvent: (event, data) => {
      if (event === 'llm:inject') {
        // Immediately callback with echo
        setTimeout(() => {
          orchestrator.handleLLMCallback(data.callbackId, {
            output: `Echo: ${JSON.stringify(data.context.input)}`
          });
        }, 10);
      }
    }
  });
  
  const result = await orchestrator.orchestrate(workflow, { message: 'Hello' });
  
  assert.equal(result.success, true);
  assert.equal(result.workflow, 'simple-test');
  assert.ok(result.duration > 0);
  assert.ok(result.orchestrationId);
});

test('ContextSwitcher should load and prepare contexts', async (t) => {
  const switcher = new ContextSwitcher();
  
  const workflow = new FlowMind({
    metadata: { id: 'test' },
    workflow_config: {}
  });
  
  const step = {
    id: 'test-step',
    name: 'Test Step',
    instruction: 'Process this step'
  };
  
  const context = await switcher.prepareContext(workflow, step, { data: 'test' });
  
  assert.equal(context.stepId, 'test-step');
  assert.equal(context.instruction, 'Process this step');
  assert.deepEqual(context.input, { data: 'test' });
  assert.ok(context.timestamp);
});

test('OutputManager should track and analyze outputs', async (t) => {
  const manager = new OutputManager();
  
  const step = { id: 'test', name: 'Test Step' };
  const output = {
    markdown: '# Test Output\n\nThis is a test.',
    files: [
      { name: 'test.js', content: 'console.log("test");' }
    ]
  };
  
  const tracked = await manager.track('orch-1', step, output, 0);
  
  assert.equal(tracked.stepId, 'test');
  assert.equal(tracked.analysis.hasMarkdown, true);
  assert.equal(tracked.analysis.hasFiles, true);
  assert.equal(tracked.files.length, 1);
});

test('FeedbackLoop should handle callbacks', async (t) => {
  const loop = new FeedbackLoop();
  
  // Set up expectation
  const promise = loop.expectCallback('test-callback', { timeout: 1000 });
  
  // Simulate callback
  setTimeout(() => {
    loop.handleCallback('test-callback', {
      output: 'Test response',
      insights: ['insight1', 'insight2']
    });
  }, 50);
  
  const result = await promise;
  
  assert.equal(result.content, 'Test response');
  assert.equal(result.type, 'structured');
  assert.deepEqual(result.insights, ['insight1', 'insight2']);
});

test('Parallel execution should work', async (t) => {
  const workflow = {
    metadata: { type: 'workflow', id: 'parallel-test' },
    workflow_config: {
      steps: [{
        id: 'parallel-step',
        name: 'Parallel Execution',
        parallel: [
          { id: 'p1', name: 'Parallel 1' },
          { id: 'p2', name: 'Parallel 2' },
          { id: 'p3', name: 'Parallel 3' }
        ]
      }]
    }
  };
  
  const responses = new Map();
  
  const orchestrator = new WorkflowOrchestrator({
    enableParallel: true,
    onEvent: (event, data) => {
      if (event === 'llm:inject') {
        const stepId = data.context.step.id;
        setTimeout(() => {
          responses.set(stepId, true);
          orchestrator.handleLLMCallback(data.callbackId, {
            output: `Completed ${stepId}`
          });
        }, Math.random() * 100);
      }
    }
  });
  
  const result = await orchestrator.orchestrate(workflow, {});
  
  assert.equal(result.success, true);
  assert.equal(responses.size, 3);
  assert.ok(responses.get('p1'));
  assert.ok(responses.get('p2'));
  assert.ok(responses.get('p3'));
});

test('Cognitive parliament pattern should work', async (t) => {
  const workflow = {
    metadata: { type: 'pattern', id: 'cognitive-parliament' },
    workflow_config: {
      personality_system: {
        eeps_mapping: {
          tester: {
            core_emotion: 'test',
            anti_group_think_prompt: 'Test independently'
          }
        }
      }
    }
  };
  
  const orchestrator = new WorkflowOrchestrator({
    onEvent: (event, data) => {
      if (event === 'llm:inject') {
        setTimeout(() => {
          orchestrator.handleLLMCallback(data.callbackId, {
            output: 'Test personality response'
          });
        }, 10);
      }
    }
  });
  
  const result = await orchestrator.orchestrate(workflow, { question: 'Test?' });
  
  assert.equal(result.success, true);
  assert.equal(result.workflow, 'cognitive-parliament');
});

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running orchestration tests...');
}