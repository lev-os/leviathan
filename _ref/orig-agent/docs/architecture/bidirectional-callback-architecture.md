# Bi-directional Callback Architecture

## The Problem
The LLM needs to know when and how to call back to Kingly for additional reasoning steps.

## The Solution: Callback Instruction Pattern

### 1. System Prompt Reinforcement
```yaml
# In every MCP response, we include callback instructions
response:
  content: "I'll analyze this step by step"
  system_hint: |
    IMPORTANT: For complex reasoning, use callbacks:
    - After each reasoning step, call 'continueReasoning'
    - When you need more context, call 'requestContext'
    - For validation, call 'validateStep'
```

### 2. MCP Tool Definitions
```javascript
// These tools enable the callback pattern
const tools = {
  continueReasoning: {
    description: "Continue multi-step reasoning with full model capacity",
    parameters: {
      step_result: "Result from previous step",
      next_step: "What to reason about next"
    }
  },
  
  requestContext: {
    description: "Request additional context for current task",
    parameters: {
      context_type: "Type of context needed",
      reason: "Why this context is needed"
    }
  }
}
```

### 3. Bootup Script Pattern
```javascript
// Initial MCP handshake includes callback protocol
async function initializeSession() {
  return {
    system_message: `You have access to Kingly's bi-directional reasoning system.
    
    CRITICAL: For best results, break complex tasks into steps:
    1. Call 'decomposeTask' first
    2. For each step, call 'continueReasoning'
    3. Each call gets FULL MODEL CAPACITY
    
    Example flow:
    User: "Build an auth system"
    You: Call decomposeTask("Build an auth system")
    Kingly: Returns ["Design schema", "Implement JWT", "Add routes", "Test"]
    You: Call continueReasoning("Design schema", "Create auth database schema")
    ... continue for each step`,
    
    tools: toolDefinitions
  };
}
```

### 4. Without Kingly OS (Pure MCP)
```javascript
// Stateless callback pattern for standard MCP
class BiDirectionalMCP {
  async handleToolCall(tool, params) {
    switch(tool) {
      case 'continueReasoning':
        // Store state in params to maintain context
        const state = params.state || {};
        const result = await this.llm.reason(params.step_result);
        
        // Return with hint to continue
        return {
          result,
          hint: "Call continueReasoning again for next step",
          state: {...state, [params.step]: result}
        };
    }
  }
}
```

### 5. With Kingly OS (Stateful)
```javascript
// OS maintains conversation state
class KinglyOSBiDirectional {
  conversations = new Map();
  
  async handleCallback(sessionId, tool, params) {
    const conversation = this.conversations.get(sessionId);
    
    // OS can inject context based on conversation history
    const enrichedParams = await this.enrichWithContext(params, conversation);
    
    // Process with full context
    const result = await this.processStep(enrichedParams);
    
    // Update conversation state
    conversation.steps.push({tool, params, result});
    
    // Whisper next instruction
    return {
      result,
      whisper: this.determineNextStep(conversation)
    };
  }
}
```

## Key Insights

1. **Not a "response" but a "callback request"** - The LLM explicitly calls back
2. **System prompt reinforcement** - Every interaction reminds about callbacks
3. **Stateless for MCP** - State passed in params
4. **Stateful for OS** - OS maintains conversation context
5. **Whisper pattern** - OS can guide next steps dynamically