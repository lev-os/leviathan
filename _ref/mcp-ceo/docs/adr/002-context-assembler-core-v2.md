# ADR-002: Context Assembler Core v2
## Workflow Execution with Runtime Recipe Assembly

## Status
**ACCEPTED** - Updated for workflow execution context (2025-01-08)

## Context
The Context Assembler is the "context chef" that creates coherent perspectives for each workflow step. It operates within the bidirectional flow pattern to enable emergent intelligence through systematic context switching.

### Workflow Execution Flow
```
1. User: "Execute deep-analysis workflow on challenge X"
2. MCP: Loads workflow → needs agent://analyst, agent://innovator, agent://guardian  
3. ContextAssembler: Takes agents + challenge + workflow config → assembles coherent prompt
4. MCP → LLM: "You are [assembled context]. Here's the challenge."
5. LLM: Reasons as this assembled multi-agent perspective
6. LLM → MCP: Results + request for next step
7. ContextAssembler: Assembles NEXT step contexts (different agents + previous results)
8. Repeat until workflow complete = EMERGENT INTELLIGENCE
```

### Architectural Separation
```
BOOT-TIME: Context Registry → Loads & compiles all contexts
RUNTIME:   Context Assembler → Assembles recipes for each workflow step
```

## Decision
Position Context Assembler as the core component that enables workflow execution by assembling multi-context perspectives for each step in the bidirectional flow.

## Architecture

### Runtime Recipe Assembly
```javascript
// Context Assembler operates on pre-compiled contexts
class ContextAssembler {
  constructor(registry) {
    this.registry = registry  // Source of pre-compiled FlowMind instances
  }
  
  async assemble(recipe) {
    // 1. Look up pre-compiled contexts from registry
    const baseContext = this.registry.getContext(recipe.base)
    const mixContexts = recipe.mix.map(uri => this.registry.getContext(uri))
    
    // 2. Apply assembly rules and merge
    return this.mergeContexts(baseContext, mixContexts)
  }
}
```

### Recipe Structure
```yaml
recipe:
  base: agent://ceo
  mix:
    - pattern://10-10-10-framework  
    - memory://session/current/insights
  assembly_rules:
    conflict_resolution: "base_wins"
    merge_strategy: "deep_merge"
```

### Core Components

#### Recipe Engine (v0.1.0)
```javascript
class RecipeEngine {
  constructor(registry) {
    this.registry = registry
  }
  
  async assemble(recipe) {
    // v0.1.0: Simple context merging
    const base = this.registry.getContext(recipe.base)
    const mixContexts = recipe.mix?.map(uri => this.registry.getContext(uri)) || []
    
    return this.simpleMerge(base, mixContexts)
  }
  
  simpleMerge(base, mixContexts) {
    // Basic merging: base wins conflicts
    let result = { ...base.raw }
    
    for (const context of mixContexts) {
      result = this.deepMerge(result, context.raw)
    }
    
    return result
  }
}
```

#### Advanced Assembly Rules (v0.2.0)
```javascript
// assembly-rules.js contains sophisticated merging logic
// Currently commented out as v0.2.0 feature
class AssemblyRules {
  // Complex conflict resolution
  // Semantic relevance scoring  
  // Priority-based merging
  // Token limit management
}
```

### Workflow Execution Integration

```javascript
// MCP Server startup
const registry = createContextRegistry()
await registry.scan()  // Boot-time: compile all contexts

const assembler = new ContextAssembler(registry)

// MCP Tool: execute_workflow
async function executeWorkflow(workflowId, challenge, step = 1, previousResults = {}) {
  // Get workflow context
  const workflow = registry.getContext(`workflow://${workflowId}`)
  const stepConfig = workflow.steps[step - 1]
  
  // Create recipe for this step
  const recipe = {
    base: `workflow://${workflowId}`,
    mix: [
      stepConfig.agent,  // e.g., 'agent://analyst'
      ...(step > 1 ? [`memory://session/${sessionId}/step-${step-1}`] : [])
    ],
    challenge,
    step_context: stepConfig,
    previous_results: previousResults
  }
  
  // Assemble context for this workflow step
  const assembledContext = await assembler.assemble(recipe)
  
  // Return to LLM for reasoning
  return {
    context: assembledContext,
    instructions: `You are ${stepConfig.agent}. ${stepConfig.prompt}`,
    challenge,
    next_step: step + 1
  }
}

// MCP Tool: list_workflows  
async function listWorkflows() {
  return registry.getContextsByType('workflow').map(w => ({
    id: w.getId(),
    name: w.getName(),
    description: w.getDescription(),
    steps: w.getSteps().length
  }))
}
```

## Implementation

### v0.1.0 Scope (Current)
- **Workflow execution through context assembly**
- **Two MCP tools: list_workflows + execute_workflow**
- **Recipe assembly from pre-compiled contexts**
- **Simple context merging for workflow steps**
- **Bidirectional flow with context switching**
- **Session state management across steps**

### v0.2.0 Evolution  
- **Complex assembly rules (assembly-rules.js)**
- **Semantic merging logic**
- **Priority-based conflict resolution**
- **Token limit management**
- **Instruction set assembly**

### Removed from Assembler
- ❌ Context loading (moved to Registry)
- ❌ Protocol URI resolution (moved to Registry)
- ❌ YAML parsing (moved to Registry)
- ❌ FlowMind instance creation (moved to Registry)
- ❌ Validation (moved to Registry)

## Recipe Examples

### Simple Recipe
```javascript
// Basic context lookup
const recipe = 'agent://ceo'
const context = await assembler.assemble(recipe)
```

### Complex Recipe  
```javascript
// Multi-context assembly
const recipe = {
  base: 'agent://ceo#negotiator',
  mix: [
    'pattern://10-10-10-framework',
    'memory://session/123/insights'
  ],
  assembly_rules: {
    conflict_resolution: 'base_wins',
    merge_strategy: 'deep_merge'
  }
}

const assembledContext = await assembler.assemble(recipe)
```

### Workflow Step Recipe
```javascript
// Dynamic workflow context
const recipe = {
  base: 'workflow://deep-analysis',
  mix: [
    'agent://systems-illuminator',
    'memory://session/456/step-2'
  ],
  step: 3,
  previous_results: sessionResults
}
```

## Key Principles

1. **Registry Dependency** - All contexts pre-compiled by Registry
2. **Runtime Performance** - Fast recipe assembly, no loading delays
3. **Simple v0.1.0** - Basic merging, complex rules deferred to v0.2.0
4. **Clean Separation** - No context loading, only assembly
5. **Forward Compatibility** - Recipe structure supports v0.2.0 features

## Success Criteria

- **Workflow Execution**: Complete workflows execute through bidirectional flow
- **Context Assembly**: < 20ms recipe assembly for workflow steps  
- **MCP Integration**: Two tools (list_workflows, execute_workflow) work end-to-end
- **Context Switching**: Each step creates different LLM perspective
- **Emergent Intelligence**: Multi-step workflows produce insights beyond individual agents
- **Session Management**: State persists across workflow steps

## Changes from Original ADR

1. **Loading Removed** - Context Registry handles all loading
2. **Protocol Resolution Removed** - Registry provides getContext(uri)
3. **Focus on Assembly** - Pure recipe engine for runtime use
4. **Performance Focus** - No I/O, only in-memory operations
5. **v0.2.0 Ready** - Structure supports instruction set assembly

---

**This ADR documents the Context Assembler as a lightweight runtime recipe engine, with all loading concerns moved to the Context Registry.**