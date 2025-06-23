# Implementation Ticket: 004 - First Working Tool

## 📋 Overview
Implement the complete chain-of-thought workflow tool that demonstrates bi-directional MCP communication.

## 🔗 References
- **Previous**: [003 - Workflow Engine Core](003-workflow-engine-core.md)
- **Uses**: [001 - MCP Server](001-mcp-server-setup.md), [002 - State Manager](002-state-manager.md)

## 🎯 Scope
Create working tools that:
- Start chain-of-thought workflow
- Handle thought submissions
- Complete the full reasoning cycle
- Demonstrate bi-directional pattern

## ✅ Acceptance Criteria

### AC-004-1: Start Workflow Tool
```yaml
Given: User wants to reason through a problem
When: startChainOfThought tool is called
Then: Workflow begins with decomposition step
And: Returns state_id for continuity
And: Provides clear next_action guidance
```

### AC-004-2: Submit Thought Tool
```yaml
Given: Active workflow waiting for thought
When: submitThought tool is called with state_id
Then: Thought is saved to state
And: Workflow advances to next step
And: Returns next instruction or completion
```

### AC-004-3: Complete Workflow
```yaml
Given: Workflow reaches final step
When: Final thought is submitted
Then: Workflow completes successfully
And: Returns summary of reasoning process
And: State is marked as complete
```

### AC-004-4: Error Handling
```yaml
Given: Invalid state_id or malformed input
When: Tool is called
Then: Returns helpful error message
And: Suggests corrective action
And: Doesn't corrupt state
```

## 🧪 Test Cases

### Integration Tests
1. **Full workflow execution** - Start to completion
2. **State continuity** - Resume after interruption
3. **Multiple concurrent workflows** - Isolation
4. **Invalid state handling** - Graceful errors

### E2E Test Scenario
```yaml
1. Call startChainOfThought("Build auth system")
2. Receive decomposition instruction
3. Call submitThought with decomposition
4. Receive analysis instruction
5. Call submitThought with analysis
6. Receive synthesis instruction
7. Call submitThought with synthesis
8. Receive completion summary
```

## 💻 Implementation

### Tool Definitions
```javascript
// src/tools/workflow-tools.js
export function createWorkflowTools(workflowEngine, stateManager) {
  return {
    startChainOfThought: {
      name: 'startChainOfThought',
      description: 'Start a chain of thought reasoning process',
      inputSchema: {
        type: 'object',
        properties: {
          problem: {
            type: 'string',
            description: 'The problem to reason through'
          }
        },
        required: ['problem']
      },
      handler: async ({ problem }) => {
        try {
          // Start the workflow
          const { workflow, state, next } = await workflowEngine.startWorkflow(
            'chain_of_thought',
            { problem }
          );
          
          // Create state
          const { id: state_id } = stateManager.create(workflow.name, state);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                state_id,
                workflow: workflow.name,
                step: next.step_id,
                step_number: next.step_number,
                total_steps: next.total_steps
              })
            }],
            _meta: {
              agentInstructions: `${next.instruction}

Please use the 'submitThought' tool with:
- state_id: "${state_id}"
- thought: [your ${next.next_action.expecting}]`
            }
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: error.message })
            }],
            isError: true
          };
        }
      }
    },
    
    submitThought: {
      name: 'submitThought',
      description: 'Submit a thought for the current workflow step',
      inputSchema: {
        type: 'object',
        properties: {
          state_id: {
            type: 'string',
            description: 'The workflow state ID'
          },
          thought: {
            type: 'string',
            description: 'Your reasoning for this step'
          }
        },
        required: ['state_id', 'thought']
      },
      handler: async ({ state_id, thought }) => {
        try {
          // Get current state
          const currentState = stateManager.get(state_id);
          if (!currentState) {
            throw new Error('Invalid or expired state_id. Start a new workflow.');
          }
          
          // Load workflow
          const workflow = await workflowEngine.loadWorkflow(
            currentState.workflow_type
          );
          
          // Continue workflow
          const result = await workflowEngine.continueWorkflow(
            workflow,
            currentState.data,
            thought
          );
          
          // Update state
          stateManager.update(state_id, currentState.data);
          
          if (result.complete) {
            // Workflow complete
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  complete: true,
                  summary: result.summary,
                  reasoning_chain: currentState.data.saved
                })
              }],
              _meta: {
                agentInstructions: `Chain of thought complete! 

Summary:
- Workflow: ${workflow.name}
- Steps completed: ${result.summary.steps_completed}
- Duration: ${result.summary.duration_ms}ms

The complete reasoning chain has been saved. You can now provide the final answer based on this analysis.`
              }
            };
          } else {
            // Next step
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  state_id,
                  step: result.next.step_id,
                  step_number: result.next.step_number,
                  total_steps: result.next.total_steps
                })
              }],
              _meta: {
                agentInstructions: `${result.next.instruction}

Continue with 'submitThought':
- state_id: "${state_id}"
- thought: [your ${result.next.next_action.expecting}]`
              }
            };
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: error.message })
            }],
            isError: true,
            _meta: {
              agentInstructions: `Error: ${error.message}

To start a new workflow, use 'startChainOfThought' with your problem.`
            }
          };
        }
      }
    }
  };
}
```

### Workflow Definition
```yaml
# workflows/chain_of_thought.yaml
name: "chain_of_thought"
version: "1.0"
description: "Multi-step reasoning with full model capacity per step"

steps:
  - id: "decompose"
    instruction: |
      Break down this problem into smaller, manageable sub-tasks:
      "{problem}"
      
      Consider:
      - What are the main components?
      - What needs to be solved first?
      - What are the dependencies?
      
      List each sub-task clearly.
    next_action: "submitThought"
    save_as: "decomposition"
    
  - id: "analyze"
    instruction: |
      Now analyze the first sub-task from your decomposition:
      {decomposition}
      
      Provide:
      - Detailed approach
      - Potential challenges
      - Success criteria
    next_action: "submitThought"
    save_as: "analysis"
    
  - id: "synthesize"
    instruction: |
      Synthesize your analysis into a complete solution:
      
      Problem: {problem}
      Decomposition: {decomposition}
      Analysis: {analysis}
      
      Provide an integrated solution that addresses all aspects.
    next_action: "submitThought"
    save_as: "synthesis"
    complete: true
```

### Server Integration
```javascript
// Update src/mcp-server.js
import { createWorkflowTools } from './tools/workflow-tools.js';

export class KinglyMCPServer {
  setupTools() {
    const workflowTools = createWorkflowTools(
      this.workflowEngine,
      this.stateManager
    );
    
    // Register workflow tools
    this.registerTool(workflowTools.startChainOfThought);
    this.registerTool(workflowTools.submitThought);
  }
  
  registerTool(toolDef) {
    this.tools.set(toolDef.name, toolDef);
  }
}
```

## 🧪 Test Implementation
```javascript
// tests/integration/chain-of-thought.test.js
describe('Chain of Thought Workflow', () => {
  let server;
  
  beforeEach(() => {
    server = new KinglyMCPServer();
  });
  
  it('should complete full reasoning workflow', async () => {
    // Start workflow
    const startResult = await server.handleToolCall('startChainOfThought', {
      problem: 'How to implement JWT authentication?'
    });
    
    expect(startResult._meta.agentInstructions).toContain('Break down');
    const { state_id } = JSON.parse(startResult.content[0].text);
    
    // Submit decomposition
    const decompResult = await server.handleToolCall('submitThought', {
      state_id,
      thought: '1. User model, 2. JWT generation, 3. Middleware'
    });
    
    expect(decompResult._meta.agentInstructions).toContain('analyze');
    
    // Submit analysis
    const analysisResult = await server.handleToolCall('submitThought', {
      state_id,
      thought: 'User model needs email and hashed password...'
    });
    
    expect(analysisResult._meta.agentInstructions).toContain('Synthesize');
    
    // Submit synthesis
    const finalResult = await server.handleToolCall('submitThought', {
      state_id,
      thought: 'Complete JWT implementation plan...'
    });
    
    expect(finalResult.content[0].text).toContain('"complete":true');
  });
});
```

## 🔧 Dependencies
- Uses existing infrastructure from tickets 001-003

## 📊 Effort Estimate
- Implementation: 2 hours
- Testing: 1.5 hours
- Total: 3.5 hours

## 🚀 Next Steps
After this ticket:
- Test the complete bi-directional flow
- Move to Phase 2: Context System

## 📝 Notes
- This demonstrates the full bi-directional pattern
- Each step gets full model capacity
- State persists across tool calls
- Clear instructions guide the LLM