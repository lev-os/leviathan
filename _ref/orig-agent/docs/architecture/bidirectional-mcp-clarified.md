# Bi-directional MCP Architecture - Clarified

## The Real Pattern: LLM Calls Us, We Guide

You're absolutely right - we don't call the LLM. The LLM calls our MCP tools, and we respond with workflow instructions.

## How It Actually Works

### 1. LLM Initiates with Tool Call
```javascript
// LLM calls our MCP tool
{
  "method": "tools/call",
  "params": {
    "name": "startChainOfThought",
    "arguments": {
      "problem": "Build authentication system"
    }
  }
}
```

### 2. We Respond with Workflow Steps
```javascript
// Our MCP response guides the LLM
{
  "result": {
    "workflow": "chain_of_thought",
    "current_step": 1,
    "instruction": "First, decompose the problem into sub-tasks. Think about: database schema, JWT implementation, API routes, testing strategy.",
    "next_action": {
      "tool": "submitThought",
      "with": "your_decomposition"
    },
    "state_id": "cot_12345"  // We maintain state
  }
}
```

### 3. LLM Follows Instructions
```javascript
// LLM calls back with results
{
  "method": "tools/call",
  "params": {
    "name": "submitThought",
    "arguments": {
      "state_id": "cot_12345",
      "thought": "Breaking down auth system:\n1. User model with password hashing\n2. JWT token generation and validation\n3. Protected route middleware\n4. Login/logout endpoints"
    }
  }
}
```

### 4. We Guide Next Step
```javascript
// We respond with next instruction
{
  "result": {
    "saved": true,
    "current_step": 2,
    "previous_thought": "decomposition",
    "instruction": "Good decomposition. Now focus on step 1: Design the user model. Consider: email validation, password requirements, account status fields.",
    "next_action": {
      "tool": "submitThought",
      "with": "user_model_design"
    }
  }
}
```

## The Meta Language for Workflows

### Workflow Definition in Meta Language
```yaml
# workflows/chain-of-thought.yaml
workflow:
  name: "chain_of_thought"
  description: "Multi-step reasoning with full model capacity per step"
  
  steps:
    - id: "decompose"
      instruction: |
        Break down the problem into logical sub-tasks.
        Consider all aspects and dependencies.
      save: "decomposition"
      next: "analyze_first"
      
    - id: "analyze_first"
      instruction: |
        Focus on: ${decomposition[0]}
        Provide detailed analysis and approach.
      save: "analysis_1"
      next: "analyze_second"
      
    - id: "synthesize"
      instruction: |
        Review all previous analyses:
        ${foreach step in saved_analyses}
        - ${step.summary}
        ${/foreach}
        Provide integrated solution.
      save: "synthesis"
      complete: true
```

### The Assembler Pattern
```javascript
class WorkflowAssembler {
  async assembleNextStep(workflowId, currentState) {
    const workflow = await this.loadWorkflow(workflowId);
    const step = workflow.steps[currentState.step_index];
    
    // Parse meta language
    const instruction = this.parseTemplate(step.instruction, currentState);
    
    // Build response that guides LLM
    return {
      current_step: currentState.step_index + 1,
      instruction: instruction,
      next_action: {
        tool: step.save ? "submitThought" : "continueWorkflow",
        with: step.save || "acknowledgment"
      },
      state_id: currentState.id
    };
  }
  
  parseTemplate(template, state) {
    // Replace ${variables} with state values
    return template.replace(/\${([^}]+)}/g, (match, expr) => {
      return this.evaluateExpression(expr, state);
    });
  }
}
```

## MCP Tool Definitions

```javascript
const biDirectionalTools = {
  startChainOfThought: {
    description: "Start a chain of thought reasoning process",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string" }
      }
    }
  },
  
  submitThought: {
    description: "Submit reasoning for current step",
    inputSchema: {
      type: "object", 
      properties: {
        state_id: { type: "string" },
        thought: { type: "string" }
      }
    }
  },
  
  continueWorkflow: {
    description: "Continue to next workflow step",
    inputSchema: {
      type: "object",
      properties: {
        state_id: { type: "string" },
        acknowledgment: { type: "string" }
      }
    }
  }
};
```

## System Prompt Integration

```javascript
const BIDIRECTIONAL_SYSTEM_PROMPT = `
You have access to Kingly's workflow system for enhanced reasoning.

IMPORTANT: For complex tasks, use workflow tools:
1. Start with appropriate workflow (startChainOfThought, startResearch, etc.)
2. Follow the instructions provided in each response
3. Always call the suggested next_action tool
4. Each step gets your FULL ATTENTION - take your time

The workflow system will:
- Guide you through optimal reasoning steps
- Save intermediate results
- Provide context from previous steps
- Ensure thorough analysis

Example:
User: "Design a secure API"
You: Use tool 'startChainOfThought' with the problem
System: Provides instruction for decomposition
You: Use tool 'submitThought' with your decomposition
System: Guides to next step
... continue until workflow completes
`;
```

## Current Implementation Status

For the Node.js MCP server, we need:

1. **State Management** - Track workflow states
2. **Workflow Engine** - Load and execute workflow definitions
3. **Meta Language Parser** - Interpret workflow templates
4. **Tool Handlers** - Implement the MCP tool callbacks

This is achievable with the current MCP SDK and provides the bi-directional pattern without needing the LLM to "know" anything special - it just follows our instructions!