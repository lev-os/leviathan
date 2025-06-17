# ADR-008: LLM-First Bidirectional Control
## How MCP Orchestrates Context Switching

## Status
**ACCEPTED** - Proven in server.js, formalized for v0.1.0

## Context
The bidirectional flow pattern has been proven to work in server.js with hardcoded personalities. This ADR formalizes how it works with FlowMind contexts.

### Key Insight
The LLM (Claude/GPT) IS the runtime. MCP orchestrates context switches to give the LLM different capabilities.

## Architecture

### The Bidirectional Cycle
```
1. LLM → MCP: "Execute workflow step 1"
2. MCP loads FlowMind context
3. MCP → LLM: "You are {context}. {instructions}"
4. LLM reasons with full power AS that context
5. LLM → MCP: Returns insights
6. MCP loads NEXT context
7. Repeat for emergent intelligence
```

### Real Working Example (from sessions/)
```javascript
// Step 1: LLM calls tool
{
  tool: "architect_of_abundance",
  args: {
    challenge: "What should I focus on today?",
    workflow_request: {
      type: "simple_test",
      step: 1
    }
  }
}

// Step 2: MCP responds with context
{
  content: "You are Cortisol Guardian. Analyze stress factors...",
  next_step: 2,
  session_id: "628d13fd-..."
}

// Step 3: LLM provides deep reasoning
"Core Question Redefinition: 'What should I focus on today?' 
is actually 'What focus approach will minimize stress while 
maximizing sustainable progress?'..."

// Step 4: Continue to next personality
{
  tool: "architect_of_abundance",
  args: {
    workflow_request: {
      type: "simple_test",
      step: 2,
      session_id: "628d13fd-...",
      previous_results: {...}
    }
  }
}
```

### FlowMind Integration (v0.1.0)
```javascript
class MCPWorkflowExecutor {
  async executeWorkflowStep(workflowId, step, sessionId, previousResults) {
    // Load workflow context
    const workflow = await assembler.load(`workflow://${workflowId}`)
    
    // Get step configuration
    const stepConfig = workflow.steps[step - 1]
    
    // Load the context for this step
    const stepContext = await assembler.load(stepConfig.agent)
    
    // Build the prompt for the LLM
    const prompt = this.buildStepPrompt(stepContext, stepConfig, previousResults)
    
    // Return for LLM to execute
    return {
      content: prompt,
      session_id: sessionId,
      next_step: step + 1,
      total_steps: workflow.steps.length
    }
  }
  
  buildStepPrompt(context, stepConfig, previousResults) {
    return `You are ${context.name}. ${context.description}

Your role: ${stepConfig.focus}
Instructions: ${stepConfig.prompt}

Previous insights: ${JSON.stringify(previousResults)}

Provide deep analysis from this perspective.`
  }
}
```

## What Makes This LLM-First

1. **No Code Logic** - The LLM does all reasoning
2. **Context as Configuration** - FlowMind contexts configure LLM behavior
3. **Intelligence Through Switching** - Each context switch adds perspective
4. **MCP as Conductor** - Only orchestrates, doesn't think

## Implementation for v0.1.0

### Required Components
- [ ] MCP server that loads FlowMind contexts
- [ ] Workflow executor using context assembler
- [ ] Session management for state
- [ ] Tool definitions for bidirectional flow

### NOT Required for v0.1.0
- ❌ Complex control flow logic
- ❌ Semantic evaluation in code
- ❌ Workflow DSL or parser
- ❌ State machines

## Success Criteria

- Workflows execute with context switching
- Each step loads appropriate FlowMind context
- LLM receives full context for reasoning
- Session state persists between steps
- No logic in code - only orchestration

## Example Workflow Context
```yaml
metadata:
  type: "workflow"
  id: "deep-analysis"
  name: "Deep Analysis Workflow"

workflow_config:
  steps:
    - name: "problem_analysis"
      agent: "agent://analyst"
      prompt: "Analyze the core problem"
      focus: "Understanding root causes"
      
    - name: "solution_design"
      agent: "agent://innovator"
      prompt: "Design creative solutions"
      focus: "Innovative approaches"
      
    - name: "risk_assessment"
      agent: "agent://guardian"
      prompt: "Assess risks and concerns"
      focus: "Protection and safety"
```

## The Power of Bidirectional Flow

- **Emergent Intelligence**: Multiple perspectives create insights
- **No Code Complexity**: All intelligence in the LLM
- **Flexible Orchestration**: Easy to modify workflows
- **Context Isolation**: Each step has focused context

---

**This ADR documents the proven bidirectional flow pattern, now formalized with FlowMind contexts instead of hardcoded personalities.**