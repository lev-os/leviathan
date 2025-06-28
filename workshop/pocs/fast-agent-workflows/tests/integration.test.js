/**
 * Integration Tests
 * 
 * Tests the integration between fast-agent workflows and Leviathan.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { EnhancedChainWorkflow } from '../src/workflows/chain-enhanced.js';
import { LeviathanAdapter } from '../src/integration/lev-adapter.js';

test('LeviathanAdapter should connect to agent system', async (t) => {
  const adapter = new LeviathanAdapter();
  
  // Test that paths are configured correctly
  assert.ok(adapter.levPath.includes('leviathan'));
  assert.ok(adapter.agentPath.includes('agent'));
});

test('Chain workflow should execute simple sequence', async (t) => {
  const config = {
    sequence: ['agent1', 'agent2'],
    agents: {
      agent1: { instruction: 'Process input' },
      agent2: { instruction: 'Transform output' }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  const result = await workflow.execute('test input');
  
  assert.equal(result.success, true);
  assert.equal(result.executionLog.length, 2);
  assert.ok(result.totalDuration > 0);
});

test('Chain workflow should handle errors gracefully', async (t) => {
  const config = {
    sequence: ['agent1', 'missing-agent'],
    agents: {
      agent1: { instruction: 'Process input' }
      // missing-agent is intentionally not defined
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  
  await assert.rejects(
    async () => await workflow.execute('test input'),
    /Agent configuration not found/
  );
});

test('Chain workflow should create checkpoints', async (t) => {
  const config = {
    sequence: ['agent1'],
    agents: {
      agent1: { instruction: 'Test checkpoint creation' }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  const checkpointSpy = [];
  
  // Override checkpoint method to spy on calls
  workflow.createCheckpoint = async (context, metadata) => {
    checkpointSpy.push({ context, metadata });
    return { success: true };
  };
  
  await workflow.execute('test');
  
  // Should create checkpoints: start, step 1, complete
  assert.equal(checkpointSpy.length, 3);
  assert.ok(checkpointSpy.some(cp => cp.context.includes('chain_start')));
  assert.ok(checkpointSpy.some(cp => cp.context.includes('chain_step_1')));
  assert.ok(checkpointSpy.some(cp => cp.context.includes('chain_complete')));
});

test('Output extraction should handle different formats', async (t) => {
  const workflow = new EnhancedChainWorkflow({ sequence: [], agents: {} });
  
  // Test string output
  const stringResult = workflow.extractOutput({ output: 'simple string' });
  assert.equal(stringResult, 'simple string');
  
  // Test semantic lookup output
  const semanticResult = workflow.extractOutput({
    output: { matches: ['match1', 'match2'] }
  });
  assert.equal(semanticResult, 'match1\nmatch2');
  
  // Test nested output
  const nestedResult = workflow.extractOutput({
    output: { output: 'nested value' }
  });
  assert.equal(nestedResult, 'nested value');
  
  // Test object output
  const objectResult = workflow.extractOutput({
    output: { key: 'value' }
  });
  assert.equal(objectResult, '{"key":"value"}');
});

// Performance test
test('Chain workflow performance should be acceptable', async (t) => {
  const config = {
    sequence: ['fast1', 'fast2', 'fast3'],
    agents: {
      fast1: { instruction: 'Quick process' },
      fast2: { instruction: 'Quick transform' },
      fast3: { instruction: 'Quick output' }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  const startTime = Date.now();
  
  await workflow.execute('performance test');
  
  const duration = Date.now() - startTime;
  
  // Should complete 3-step chain in under 2 seconds
  assert.ok(duration < 2000, `Chain took ${duration}ms, expected < 2000ms`);
});

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running integration tests...');
}