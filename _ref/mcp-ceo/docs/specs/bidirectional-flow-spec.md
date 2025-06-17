# Bidirectional Flow Specification
## LLM-MCP Callback Architecture

### Overview
This specification defines a callback-based architecture for multi-step workflows between LLMs and MCP servers. The MCP server acts as a "workflow controller" that programs the LLM's behavior through structured responses.

### Core Concepts

#### 1. **Callback Architecture**
```javascript
// Similar to JavaScript callbacks
llm.call(mcp, request, (response) => {
  // MCP response includes:
  // - Context for this step
  // - What to do next
  // - How to call back
});
```

#### 2. **Bidirectional Flow**
- **Forward**: LLM → MCP (request with current state)
- **Backward**: MCP → LLM (context + callback instructions)
- **Loop**: LLM executes callback → new request → repeat

### Protocol Structure

#### Step Request (LLM → MCP)
```json
{
  "challenge": "User's question or 'Continue analysis'",
  "workflow_request": {
    "type": "workflow_name",
    "step": 1,
    "session_id": "uuid",
    "previous_results": {
      "insights": ["from last step"],
      "decisions": ["made so far"]
    }
  }
}
```

#### Step Response (MCP → LLM)
```json
{
  "content": [{
    "type": "text",
    "text": "Formatted step instructions"
  }],
  "workflow": {
    "session_id": "uuid",
    "current_step": 1,
    "total_steps": 8,
    "callback_prompt": "EXACT command to continue",
    "context_injection": {
      "active_personalities": ["cortisol_guardian", "systems_illuminator"],
      "focus": "What to analyze in this step",
      "constraints": "Boundaries for this step"
    }
  }
}
```

### Callback Prompt Format
The callback_prompt should be EXACT and COMPLETE:
```
Continue with: architect_of_abundance with workflow_request: {type: "deep_analysis", step: 2, session_id: "uuid-here", previous_results: {insights: ["your insights here"], decisions: ["your decisions here"]}}
```

### Context Injection
Each step response includes:
1. **Personality Context**: Which lenses to use
2. **Step Focus**: Specific prompt for this step
3. **Previous Context**: What was learned before
4. **Next Action**: Exact callback command

### Example Flow

#### Step 1: LLM Initiates
```
LLM: "What is the meaning of life?"
     workflow_request: {type: "deep_analysis", step: 1}
```

#### MCP Responds with Context + Callback
```
MCP: "Step 1: Define Scope
     
     Active Personalities: cortisol_guardian, systems_illuminator
     
     Analyze through these lenses:
     - What are we really asking?
     - Why does this matter?
     
     To continue, use:
     architect_of_abundance with workflow_request: {type: "deep_analysis", step: 2, session_id: "abc123", previous_results: {insights: [...]}}"
```

#### Step 2: LLM Calls Back
```
LLM: "Continue analysis"
     workflow_request: {
       type: "deep_analysis", 
       step: 2,
       session_id: "abc123",
       previous_results: {
         insights: ["Life seeks meaning through conscious experience"]
       }
     }
```

### Benefits

1. **Stateless LLM**: LLM doesn't need to track workflow state
2. **Dynamic Context**: Each step gets exactly what it needs
3. **Clear Handoffs**: No ambiguity about next steps
4. **Composable**: Workflows can be mixed and matched
5. **Debuggable**: Clear trace of execution flow

### Implementation Guidelines

1. **MCP Server**:
   - Store session state
   - Generate dynamic context per step
   - Provide exact callback syntax
   - Handle state transitions

2. **LLM Client**:
   - Execute provided callbacks exactly
   - Pass previous results forward
   - Trust MCP for workflow logic

3. **Error Handling**:
   - MCP validates step numbers
   - Graceful fallback for unknown sessions
   - Clear error messages with recovery callbacks

This architecture treats the MCP server as a "workflow compiler" that programs LLM behavior through structured callbacks, similar to how JavaScript event handlers work.