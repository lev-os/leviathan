# Implementation Ticket: 003 - Workflow Engine Core

## 📋 Overview
Build the workflow engine that loads YAML workflow definitions and orchestrates multi-step reasoning through MCP callbacks.

## 🔗 References
- **Previous**: [002 - State Manager](002-state-manager.md)
- **Spec**: [Agent Workflows](../agent/workflows.md)
- **Architecture**: [Bi-directional MCP Clarified](../architecture/bidirectional-mcp-clarified.md)

## 🎯 Scope
Create workflow engine that:
- Loads workflow definitions from YAML
- Tracks current step in workflow
- Returns instructions for each step
- Manages workflow state transitions

## ✅ Acceptance Criteria

### AC-003-1: Workflow Loading
```yaml
Given: YAML workflow definition file
When: Workflow is loaded
Then: Parses YAML structure correctly
And: Validates required fields
And: Caches loaded workflows
```

### AC-003-2: Step Execution
```yaml
Given: Active workflow state
When: Next step is requested
Then: Returns current step instruction
And: Provides next_action guidance
And: Updates state to track progress
```

### AC-003-3: Workflow Completion
```yaml
Given: Workflow at final step
When: Final step executes
Then: Marks workflow as complete
And: Returns completion summary
And: Cleans up workflow state
```

### AC-003-4: Error Handling
```yaml
Given: Invalid workflow or step failure
When: Error occurs
Then: Returns helpful error message
And: Workflow state remains consistent
And: Can retry or abort gracefully
```

## 🧪 Test Cases

### Unit Tests
1. **Load valid workflow** - Parses YAML correctly
2. **Reject invalid workflow** - Missing required fields
3. **Get next step** - Returns correct instruction
4. **Complete workflow** - Handles final step
5. **Handle errors** - Graceful degradation

### Integration Tests
1. **Full workflow execution** - All steps complete
2. **State persistence** - Workflow continues after interruption
3. **Multiple workflows** - Can run concurrently

## 💻 Implementation

### Workflow Definition Structure
```yaml
# workflows/chain-of-thought.yaml
name: "chain_of_thought"
version: "1.0"
description: "Multi-step reasoning with full model capacity"

steps:
  - id: "decompose"
    instruction: |
      Break down the problem: {problem}
      Consider all aspects and dependencies.
      List the sub-tasks needed.
    next_action: "submitDecomposition"
    save_as: "decomposition"
    
  - id: "analyze_first"  
    instruction: |
      Now analyze the first sub-task: {decomposition[0]}
      Provide detailed approach and considerations.
    next_action: "submitAnalysis"
    save_as: "analysis_1"
    
  - id: "synthesize"
    instruction: |
      Review your analysis:
      {foreach step in analyses}
      - {step}
      {/foreach}
      Provide integrated solution.
    next_action: "submitSynthesis"
    complete: true
```

### Core Implementation
```javascript
// src/application/workflow-engine.js
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { join } from 'path';

export class WorkflowEngine {
  constructor(options = {}) {
    this.workflowsDir = options.workflowsDir || 'workflows';
    this.workflows = new Map();
  }
  
  async loadWorkflow(name) {
    // Check cache first
    if (this.workflows.has(name)) {
      return this.workflows.get(name);
    }
    
    try {
      const path = join(this.workflowsDir, `${name}.yaml`);
      const content = await readFile(path, 'utf-8');
      const workflow = yaml.load(content);
      
      // Validate workflow structure
      this.validateWorkflow(workflow);
      
      // Cache it
      this.workflows.set(name, workflow);
      
      return workflow;
    } catch (error) {
      throw new Error(`Failed to load workflow '${name}': ${error.message}`);
    }
  }
  
  validateWorkflow(workflow) {
    if (!workflow.name) throw new Error('Workflow missing name');
    if (!workflow.steps || !Array.isArray(workflow.steps)) {
      throw new Error('Workflow missing steps array');
    }
    
    for (const step of workflow.steps) {
      if (!step.id) throw new Error(`Step missing id`);
      if (!step.instruction) throw new Error(`Step ${step.id} missing instruction`);
      if (!step.next_action && !step.complete) {
        throw new Error(`Step ${step.id} missing next_action or complete flag`);
      }
    }
  }
  
  async startWorkflow(workflowName, initialData = {}) {
    const workflow = await this.loadWorkflow(workflowName);
    
    const state = {
      workflow: workflow.name,
      current_step: 0,
      data: initialData,
      saved: {},
      started_at: Date.now()
    };
    
    return {
      workflow,
      state,
      next: this.getStepInstruction(workflow, state)
    };
  }
  
  async continueWorkflow(workflow, state, stepResult) {
    const currentStep = workflow.steps[state.current_step];
    
    // Save result if step requests it
    if (currentStep.save_as && stepResult) {
      state.saved[currentStep.save_as] = stepResult;
    }
    
    // Move to next step
    state.current_step++;
    
    // Check if complete
    if (state.current_step >= workflow.steps.length || 
        currentStep.complete) {
      return {
        complete: true,
        summary: this.generateSummary(workflow, state)
      };
    }
    
    return {
      complete: false,
      next: this.getStepInstruction(workflow, state)
    };
  }
  
  getStepInstruction(workflow, state) {
    const step = workflow.steps[state.current_step];
    
    // Parse instruction template
    const instruction = this.parseTemplate(step.instruction, state);
    
    return {
      step_id: step.id,
      step_number: state.current_step + 1,
      total_steps: workflow.steps.length,
      instruction: instruction,
      next_action: {
        tool: step.next_action,
        expecting: step.save_as || 'response'
      }
    };
  }
  
  parseTemplate(template, state) {
    // Simple template parsing - replace {variables}
    let parsed = template;
    
    // Replace simple variables
    parsed = parsed.replace(/\{(\w+)\}/g, (match, key) => {
      return state.data[key] || state.saved[key] || match;
    });
    
    // Replace array access like {decomposition[0]}
    parsed = parsed.replace(/\{(\w+)\[(\d+)\]\}/g, (match, key, index) => {
      const array = state.data[key] || state.saved[key];
      if (Array.isArray(array)) {
        return array[parseInt(index)] || match;
      }
      return match;
    });
    
    // Handle foreach loops (simplified)
    parsed = parsed.replace(
      /\{foreach (\w+) in (\w+)\}([\s\S]*?)\{\/foreach\}/g,
      (match, item, collection, template) => {
        const items = state.data[collection] || state.saved[collection] || [];
        if (!Array.isArray(items)) return '';
        
        return items.map(itemValue => 
          template.replace(new RegExp(`\\{${item}\\}`, 'g'), itemValue)
        ).join('');
      }
    );
    
    return parsed.trim();
  }
  
  generateSummary(workflow, state) {
    return {
      workflow: workflow.name,
      completed_at: Date.now(),
      duration_ms: Date.now() - state.started_at,
      steps_completed: state.current_step,
      results: state.saved
    };
  }
}
```

### Integration with MCP Tools
```javascript
// src/adapters/primary/workflow-tools.js
export function createWorkflowTools(workflowEngine, stateManager) {
  return {
    startChainOfThought: {
      description: 'Start a chain of thought reasoning process',
      inputSchema: {
        type: 'object',
        properties: {
          problem: { type: 'string' }
        },
        required: ['problem']
      },
      handler: async ({ problem }) => {
        const { workflow, state, next } = await workflowEngine.startWorkflow(
          'chain_of_thought',
          { problem }
        );
        
        const { id } = stateManager.create('chain_of_thought', state);
        
        return {
          state_id: id,
          ...next,
          _meta: {
            agentInstructions: `${next.instruction}\n\nUse the '${next.next_action.tool}' tool with your ${next.next_action.expecting}.`
          }
        };
      }
    }
  };
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/workflow-engine.test.js
describe('WorkflowEngine', () => {
  let engine;
  
  beforeEach(() => {
    engine = new WorkflowEngine({ workflowsDir: 'test-workflows' });
  });
  
  it('should load and validate workflow', async () => {
    const workflow = await engine.loadWorkflow('test_workflow');
    expect(workflow.name).toBe('test_workflow');
    expect(workflow.steps).toHaveLength(3);
  });
  
  it('should start workflow with initial data', async () => {
    const { state, next } = await engine.startWorkflow('test_workflow', {
      problem: 'Test problem'
    });
    
    expect(state.current_step).toBe(0);
    expect(next.instruction).toContain('Test problem');
  });
  
  it('should progress through workflow steps', async () => {
    const workflow = await engine.loadWorkflow('test_workflow');
    const { state } = await engine.startWorkflow('test_workflow');
    
    const result = await engine.continueWorkflow(
      workflow, 
      state, 
      'Step 1 result'
    );
    
    expect(result.complete).toBe(false);
    expect(state.current_step).toBe(1);
  });
});
```

## 🔧 Dependencies
- `js-yaml` - For parsing workflow definitions

## 📊 Effort Estimate
- Implementation: 2 hours
- Testing: 1.5 hours
- Total: 3.5 hours

## 🚀 Next Steps
After this ticket:
- 004: Implement first working tool using workflow engine
- 010: Meta language parser for advanced templates

## 📝 Notes
- Simple template parsing for MVP (can enhance later)
- Workflows are cached after first load
- State transitions are explicit and trackable
- Error messages guide users to fix issues