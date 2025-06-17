# ADR-007: FlowSense Semantic Control Language
## Natural Language Control Flow for FlowMind (v0.2.0)

## Status
**ACCEPTED** - Target v0.2.0 (Not implemented in v0.1.0)

## Context
FlowSense is the control flow language that will enable natural language conditions in YAML workflows. This is separate from FlowMind, which is just the context interface (v0.1.0).

### Important Distinction
- **FlowMind** (v0.1.0) = Context interface standard
- **FlowSense** (v0.2.0) = Control flow language that uses FlowMind contexts

## Decision
Build FlowSense as a YAML-based control flow language that enables semantic conditions evaluated by the LLM through bidirectional MCP flow.

## Architecture (v0.2.0)

### Core Innovation
```yaml
# FlowSense enables natural language control flow
flowsense:
  version: "1.0"
  
  flow:
    # Traditional logic
    - if: "context.tier == 'premium'"
      then:
        include: "agent://premium-support"
        
    # Semantic reasoning (NEW in v0.2.0)
    - when_semantic: "user is angry OR very frustrated"
      confidence_threshold: 0.8
      then:
        include: "agent://de-escalation"
        escalate: true
        
    # Mixed conditions
    - if: "context.issue_count > 3"
      and_semantic: "user seems ready to churn"
      then:
        workflow: "workflow://retention-specialist"
```

### How It Works with FlowMind
```javascript
// v0.2.0 - FlowSense parser
class FlowSenseParser {
  async parse(yamlFlow) {
    const steps = []
    
    for (const step of yamlFlow.flow) {
      if (step.when_semantic) {
        // Convert to context for LLM evaluation
        steps.push({
          type: 'semantic_condition',
          condition: step.when_semantic,
          threshold: step.confidence_threshold || 0.7,
          context_to_load: step.then
        })
      }
    }
    
    return steps
  }
}

// MCP server evaluates through bidirectional flow
async executeFlowSense(flow, context) {
  const parsed = await parser.parse(flow)
  
  for (const step of parsed) {
    if (step.type === 'semantic_condition') {
      // Ask LLM to evaluate condition
      const evaluation = await mcp.evaluate(
        `Given context: ${context}, evaluate: "${step.condition}"`
      )
      
      if (evaluation.confidence >= step.threshold) {
        // Load and execute the specified context
        const flowMind = await assembler.load(step.context_to_load)
        await mcp.switchContext(flowMind)
      }
    }
  }
}
```

## What This Means for v0.1.0

### NOT in v0.1.0
- ❌ FlowSense parser
- ❌ Semantic condition evaluation in code
- ❌ when_semantic, if_semantic syntax
- ❌ Complex control flow in YAML

### YES in v0.1.0
- ✅ FlowMind context loading
- ✅ Simple workflow steps (already in workflow contexts)
- ✅ Bidirectional flow through MCP
- ✅ Context switching for intelligence

## Migration Path

### v0.1.0 Workflows (Current)
```yaml
# Simple step-based workflows
workflow_config:
  steps:
    - name: "analyze"
      agent: "agent://analyst"
      prompt: "Analyze the situation"
    - name: "recommend"
      agent: "agent://strategist"
      prompt: "Provide recommendations"
```

### v0.2.0 Workflows (Future)
```yaml
# FlowSense-enabled workflows
workflow_config:
  flowsense:
    - when_semantic: "analysis shows high risk"
      then:
        escalate_to: "agent://risk-manager"
        
    - while_semantic: "user has more questions"
      max_iterations: 5
      do:
        continue_with: "agent://support"
```

## Key Principles

1. **LLM Evaluates Conditions** - Not code-based evaluation
2. **FlowMind Provides Contexts** - FlowSense orchestrates them
3. **Bidirectional Flow** - MCP manages the conversation
4. **Progressive Enhancement** - v0.1.0 workflows still work in v0.2.0

## Success Criteria for v0.2.0

- FlowSense parser handles basic semantic conditions
- LLM successfully evaluates natural language conditions
- Confidence thresholds work properly
- Backward compatible with v0.1.0 workflows

---

**This ADR is for v0.2.0 functionality. In v0.1.0, we use simple step-based workflows with FlowMind contexts.**