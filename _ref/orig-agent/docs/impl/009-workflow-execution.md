# Implementation Ticket: 009 - Workflow Execution

## 📋 Overview
Enhance the workflow engine to support full execution with callbacks, conditionals, and parallel steps.

## 🔗 References
- **Previous**: [008 - Callback Tools](008-callback-tools.md)
- **Core Engine**: [003 - Workflow Engine Core](003-workflow-engine-core.md)

## 🎯 Scope
Extend workflow engine to:
- Execute steps with proper sequencing
- Handle conditionals and branching
- Support parallel execution
- Integrate with callback patterns

## ✅ Acceptance Criteria

### AC-009-1: Sequential Execution
```yaml
Given: Workflow with sequential steps
When: Workflow executes
Then: Steps run in order
And: Each step result feeds next
And: Failures halt execution
```

### AC-009-2: Conditional Branching
```yaml
Given: Workflow with if/then conditions
When: Condition is evaluated
Then: LLM evaluates semantically
And: Correct branch is taken
And: Skipped steps are logged
```

### AC-009-3: Parallel Execution
```yaml
Given: Workflow with parallel steps
When: Parallel block encountered
Then: All steps start simultaneously
And: Waits for all to complete
And: Aggregates results
```

### AC-009-4: Callback Integration
```yaml
Given: Workflow step returning callback
When: Callback instructions received
Then: Workflow pauses for LLM action
And: Resumes when action completes
And: State is maintained
```

## 🧪 Test Cases

### Unit Tests
1. **Sequential flow** - Steps execute in order
2. **Conditional logic** - Branches work correctly
3. **Parallel execution** - Concurrent steps work
4. **Error propagation** - Failures bubble up
5. **State persistence** - Workflow can resume

### Integration Tests
1. **Complex workflow** - All features together
2. **Callback workflow** - Multi-step with pauses
3. **Error recovery** - Graceful degradation

## 💻 Implementation

### Enhanced Workflow Executor
```javascript
// src/application/workflow-executor.js
import { CallbackTool } from './callback-tools.js';

export class WorkflowExecutor {
  constructor(options = {}) {
    this.stateManager = options.stateManager;
    this.contextAssembler = options.contextAssembler;
    this.toolRegistry = options.toolRegistry;
    this.llmAdapter = options.llmAdapter;
  }
  
  async executeWorkflow(workflowPath, initialParams = {}) {
    // Load workflow definition
    const workflow = await this.loadWorkflow(workflowPath);
    
    // Create workflow state
    const state = await this.stateManager.create('workflow', {
      workflowPath,
      currentStep: 0,
      params: initialParams,
      results: {},
      status: 'running'
    });
    
    try {
      // Execute workflow
      const result = await this.executeSteps(
        workflow.steps,
        state,
        workflow
      );
      
      // Update final state
      await this.stateManager.update(state.id, {
        status: 'completed',
        result: result,
        completed_at: Date.now()
      });
      
      return {
        success: true,
        data: result,
        _meta: {
          workflowId: state.id,
          duration: Date.now() - state.created_at
        }
      };
      
    } catch (error) {
      // Update error state
      await this.stateManager.update(state.id, {
        status: 'failed',
        error: error.message,
        failed_at: Date.now()
      });
      
      throw error;
    }
  }
  
  async executeSteps(steps, state, workflow) {
    const results = {};
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      state.currentStep = i;
      
      // Check if step should be skipped
      if (step.condition) {
        const shouldExecute = await this.evaluateCondition(
          step.condition,
          results,
          state
        );
        
        if (!shouldExecute) {
          results[step.name] = { skipped: true };
          continue;
        }
      }
      
      // Execute based on step type
      let stepResult;
      
      switch (step.type) {
        case 'tool':
          stepResult = await this.executeToolStep(step, results, state);
          break;
          
        case 'parallel':
          stepResult = await this.executeParallelSteps(step, results, state);
          break;
          
        case 'conditional':
          stepResult = await this.executeConditionalStep(step, results, state);
          break;
          
        case 'loop':
          stepResult = await this.executeLoopStep(step, results, state);
          break;
          
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      // Store result
      results[step.name] = stepResult;
      
      // Update state
      await this.stateManager.update(state.id, {
        results: results,
        lastStep: step.name
      });
      
      // Handle callbacks
      if (stepResult._llm_instructions) {
        return {
          paused: true,
          reason: 'callback',
          instructions: stepResult._llm_instructions,
          resumeToken: state.id,
          results: results
        };
      }
    }
    
    return results;
  }
  
  async executeToolStep(step, previousResults, state) {
    // Resolve parameters with template interpolation
    const params = await this.resolveParameters(
      step.params,
      previousResults,
      state
    );
    
    // Get tool from registry
    const tool = this.toolRegistry.getTool(step.tool);
    if (!tool) {
      throw new Error(`Tool not found: ${step.tool}`);
    }
    
    // Assemble context for this step
    const context = await this.contextAssembler.assembleContext({
      currentContext: state.context || workflow.context,
      situation: {
        workflow: state.workflowPath,
        step: step.name,
        tool: step.tool
      }
    });
    
    // Execute tool with context
    const enrichedParams = {
      ...params,
      _context: context,
      _workflowId: state.id
    };
    
    return await tool.handler(enrichedParams);
  }
  
  async executeParallelSteps(step, previousResults, state) {
    const promises = step.parallel.map(async (subStep) => {
      try {
        const result = await this.executeSteps(
          [subStep],
          { ...state, isParallel: true },
          {}
        );
        return {
          step: subStep.name,
          success: true,
          data: result[subStep.name]
        };
      } catch (error) {
        return {
          step: subStep.name,
          success: false,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Check if any failed
    const failures = results.filter(r => !r.success);
    if (failures.length > 0 && step.failFast) {
      throw new Error(
        `Parallel execution failed: ${failures.map(f => f.step).join(', ')}`
      );
    }
    
    // Return aggregated results
    return {
      parallel: true,
      results: results,
      succeeded: results.filter(r => r.success).length,
      failed: failures.length
    };
  }
  
  async executeConditionalStep(step, previousResults, state) {
    // Evaluate main condition
    const conditionMet = await this.evaluateCondition(
      step.if,
      previousResults,
      state
    );
    
    if (conditionMet && step.then) {
      return await this.executeSteps(
        Array.isArray(step.then) ? step.then : [step.then],
        state,
        {}
      );
    } else if (!conditionMet && step.else) {
      return await this.executeSteps(
        Array.isArray(step.else) ? step.else : [step.else],
        state,
        {}
      );
    }
    
    return { conditionMet, executed: conditionMet ? 'then' : 'else' };
  }
  
  async executeLoopStep(step, previousResults, state) {
    const results = [];
    let iteration = 0;
    
    // Resolve items to iterate over
    const items = await this.resolveParameters(
      step.items,
      previousResults,
      state
    );
    
    for (const item of items) {
      // Check loop condition
      if (step.while) {
        const continueLoop = await this.evaluateCondition(
          step.while,
          { ...previousResults, loopItem: item, loopIndex: iteration },
          state
        );
        
        if (!continueLoop) break;
      }
      
      // Execute loop body
      const loopState = {
        ...state,
        loopItem: item,
        loopIndex: iteration
      };
      
      const iterationResult = await this.executeSteps(
        step.do,
        loopState,
        {}
      );
      
      results.push(iterationResult);
      iteration++;
      
      // Check max iterations
      if (step.maxIterations && iteration >= step.maxIterations) {
        break;
      }
    }
    
    return {
      loop: true,
      iterations: iteration,
      results: results
    };
  }
  
  async evaluateCondition(condition, results, state) {
    // Simple conditions
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'string') {
      // Use LLM for semantic evaluation
      const context = {
        results: results,
        state: state
      };
      
      const evaluation = await this.llmAdapter.evaluate({
        prompt: `Given this context: ${JSON.stringify(context, null, 2)}
                 
                 Evaluate this condition: "${condition}"
                 
                 Answer only 'true' or 'false'.`,
        temperature: 0.1
      });
      
      return evaluation.toLowerCase().includes('true');
    }
    
    // Complex conditions with operators
    if (condition.operator) {
      return this.evaluateOperator(condition, results, state);
    }
    
    return false;
  }
  
  evaluateOperator(condition, results, state) {
    const { operator, left, right } = condition;
    
    const leftValue = this.resolveValue(left, results, state);
    const rightValue = this.resolveValue(right, results, state);
    
    switch (operator) {
      case 'equals':
        return leftValue === rightValue;
      case 'not_equals':
        return leftValue !== rightValue;
      case 'greater_than':
        return leftValue > rightValue;
      case 'less_than':
        return leftValue < rightValue;
      case 'contains':
        return String(leftValue).includes(String(rightValue));
      case 'exists':
        return leftValue !== undefined && leftValue !== null;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }
  
  resolveValue(value, results, state) {
    if (typeof value !== 'string') return value;
    
    // Template resolution: ${step.result}
    return value.replace(/\${([^}]+)}/g, (match, path) => {
      const parts = path.split('.');
      let current = { ...results, ...state };
      
      for (const part of parts) {
        current = current?.[part];
      }
      
      return current ?? match;
    });
  }
  
  async resolveParameters(params, results, state) {
    if (!params) return {};
    
    const resolved = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        resolved[key] = this.resolveValue(value, results, state);
      } else if (Array.isArray(value)) {
        resolved[key] = value.map(v => 
          typeof v === 'string' ? this.resolveValue(v, results, state) : v
        );
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = await this.resolveParameters(value, results, state);
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }
}

// Workflow Resume Handler
export class WorkflowResumeHandler extends CallbackTool {
  constructor(options) {
    super('workflow_resume', {
      ...options,
      executor: options.workflowExecutor
    });
  }
  
  async performAction(params, state, context) {
    const { resumeToken, actionResult } = params;
    
    // Get workflow state
    const workflowState = await this.stateManager.get(resumeToken);
    if (!workflowState) {
      throw new Error(`Invalid resume token: ${resumeToken}`);
    }
    
    // Update results with callback result
    const updatedResults = {
      ...workflowState.results,
      [workflowState.lastStep]: actionResult
    };
    
    // Continue execution from next step
    const workflow = await this.executor.loadWorkflow(workflowState.workflowPath);
    const remainingSteps = workflow.steps.slice(workflowState.currentStep + 1);
    
    // Execute remaining steps
    const finalResults = await this.executor.executeSteps(
      remainingSteps,
      {
        ...workflowState,
        results: updatedResults
      },
      workflow
    );
    
    return {
      action: 'workflowResumed',
      data: finalResults
    };
  }
}
```

### Complex Workflow Example
```yaml
# workflows/complex-feature.yaml
name: implement_complex_feature
description: Multi-step feature implementation with decisions

context: project/current

steps:
  - name: analyze_requirements
    type: tool
    tool: requirement_analyzer
    params:
      feature: "${params.featureName}"
      
  - name: complexity_check
    type: conditional
    if: "requirements indicate high complexity"
    then:
      - name: create_design_doc
        type: tool
        tool: design_doc_generator
        params:
          requirements: "${analyze_requirements.data}"
    else:
      - name: simple_note
        type: tool
        tool: add_note
        params:
          note: "Simple feature - proceeding directly"
          
  - name: parallel_setup
    type: parallel
    parallel:
      - name: setup_backend
        type: tool
        tool: scaffold_backend
        params:
          design: "${create_design_doc.data}"
          
      - name: setup_frontend
        type: tool  
        tool: scaffold_frontend
        params:
          design: "${create_design_doc.data}"
          
      - name: setup_tests
        type: tool
        tool: create_test_structure
        params:
          feature: "${params.featureName}"
          
  - name: implementation_loop
    type: loop
    items: "${parallel_setup.results}"
    maxIterations: 10
    do:
      - name: implement_component
        type: tool
        tool: code_generator
        params:
          component: "${loopItem.data.component}"
          
      - name: test_component
        type: tool
        tool: test_runner
        params:
          component: "${implement_component.data.path}"
```

## 🧪 Test Implementation
```javascript
// tests/integration/workflow-executor.test.js
describe('WorkflowExecutor', () => {
  let executor;
  let mockRegistry;
  
  beforeEach(() => {
    mockRegistry = {
      getTool: jest.fn()
    };
    
    executor = new WorkflowExecutor({
      toolRegistry: mockRegistry,
      stateManager: new StateManager(),
      contextAssembler: new ContextAssembler(),
      llmAdapter: new MockLLMAdapter()
    });
  });
  
  it('should execute sequential workflow', async () => {
    const workflow = {
      steps: [
        { name: 'step1', type: 'tool', tool: 'tool1' },
        { name: 'step2', type: 'tool', tool: 'tool2' }
      ]
    };
    
    mockRegistry.getTool
      .mockReturnValueOnce({ 
        handler: async () => ({ data: 'result1' }) 
      })
      .mockReturnValueOnce({ 
        handler: async () => ({ data: 'result2' }) 
      });
    
    const result = await executor.executeSteps(
      workflow.steps,
      { id: 'test' },
      workflow
    );
    
    expect(result.step1.data).toBe('result1');
    expect(result.step2.data).toBe('result2');
  });
  
  it('should handle conditional branching', async () => {
    const workflow = {
      steps: [{
        name: 'conditional',
        type: 'conditional',
        if: 'result is positive',
        then: { name: 'success', type: 'tool', tool: 'celebrate' },
        else: { name: 'retry', type: 'tool', tool: 'try_again' }
      }]
    };
    
    // Mock LLM to return true
    executor.llmAdapter.evaluate = jest.fn()
      .mockResolvedValue('true');
    
    mockRegistry.getTool.mockReturnValue({
      handler: async () => ({ celebrated: true })
    });
    
    const result = await executor.executeSteps(
      workflow.steps,
      { id: 'test' },
      workflow
    );
    
    expect(result.conditional.success).toHaveProperty('celebrated', true);
  });
});
```

## 🔧 Dependencies
- Uses StateManager from ticket 002
- Uses WorkflowEngine from ticket 003
- Uses ContextAssembler from ticket 007
- Uses CallbackTool from ticket 008

## 📊 Effort Estimate
- Implementation: 4 hours
- Testing: 2 hours
- Total: 6 hours

## 🚀 Next Steps
After this ticket:
- 010: Meta Language Parser
- Integration with full system

## 📝 Notes
- Workflows can pause for callbacks
- LLM evaluates conditions semantically
- Parallel execution increases efficiency
- State enables complex multi-step flows