# 🤖 Kingly Agent Instructions

This document provides everything an agent needs to implement Kingly successfully.

## 🎯 Your Mission

Build an LLM-first AI agent system where:
- Everything is a context (tasks, agents, workflows, memory)
- Each reasoning step gets FULL MODEL CAPACITY
- No traditional algorithms - only LLM reasoning
- Bi-directional MCP enables 20-100x better reasoning

## 🔄 Implementation Workflow

### 1. Start of Session
```bash
# Refresh memory (see CLAUDE.md refresh protocol)
# Check tracker.md for next ticket
# Load implementation context
```

### 2. Per Ticket Process
```yaml
step_1_understand:
  - Read impl ticket completely
  - Load referenced spec(s)
  - Check dependencies
  - Run Reality Check Protocol

step_2_bdd_first:
  - Write BDD test from spec
  - See it fail (expected!)
  - This validates understanding

step_3_implement:
  - Use LLM-first approach
  - Context inheritance always
  - Bi-directional callbacks
  - Direct adapter for speed

step_4_validate:
  - Tests pass
  - No traditional algorithms
  - Follows core principles
  - Ready to commit

step_5_complete:
  - Update tracker.md
  - Commit with message
  - Note any insights
  - Move to next ticket
```

### 3. Escalation Protocol
If stuck for >30 minutes:
1. Document the blocker clearly
2. Try alternative approach
3. Move to next ticket if possible
4. Mark ticket as blocked in tracker

## 🧠 Core Principles Summary

### LLM-First Everything
```javascript
// ❌ NEVER DO THIS
if (text.includes('implement')) return 'implementation';

// ✅ ALWAYS DO THIS
const intent = await llm.classify(text, context);
```

### Universal Context
```javascript
// ❌ NEVER DO THIS
new Task(title, description);

// ✅ ALWAYS DO THIS
new Task({ 
  title, 
  description, 
  inherits_from: parentContext 
});
```

### Bi-directional Callbacks
```javascript
// LLM calls us, we respond with workflow
{
  instruction: "Think about X",
  next_action: { tool: "submitThought", with: "your_analysis" }
}
```

## 📋 BDD/TDD Template

```javascript
// tests/bdd/feature-name.test.js
describe('Feature: ${feature}', () => {
  it('should ${acceptance_criteria}', async () => {
    // Given - setup context
    const context = new UniversalContext({ ... });
    
    // When - perform action
    const result = await system.process(context);
    
    // Then - verify outcome
    expect(result).toMatchLLMFirstPattern();
    expect(result.context).toInheritFrom(parentContext);
  });
});
```

## 🚀 Quick Wins

### Direct Adapter Pattern
```javascript
// Skip MCP protocol during development
class ClaudeCodeAdapter {
  async reason(params) {
    // Direct LLM call - 10x faster
    return await this.llm.complete(params);
  }
}
```

### State Management
```javascript
// Simple state for workflows
class StateManager {
  states = new Map();
  
  create(workflow, params) {
    const id = generateId();
    this.states.set(id, { workflow, params, steps: [] });
    return { id };
  }
  
  update(id, data) {
    const state = this.states.get(id);
    Object.assign(state, data);
    return state;
  }
}
```

## 🔍 Reality Checks

Before any implementation:
1. **LLM-First?** - Where's the reasoning call?
2. **Context?** - What does this inherit from?
3. **Bi-directional?** - Multiple focused calls?
4. **No algorithms?** - Just facts and LLM decisions?

## 📊 Success Metrics

Your implementation succeeds when:
- ✅ All BDD tests pass
- ✅ No regex/if-else logic for decisions
- ✅ Context inheritance throughout
- ✅ Each reasoning step is a callback
- ✅ Can be committed to main

## 💡 Common Patterns

### Workflow Implementation
```javascript
// Load workflow definition
const workflow = await loadYaml(`workflows/${name}.yaml`);

// Parse meta language
const instruction = parseTemplate(workflow.steps[0].instruction);

// Return with callback
return {
  instruction,
  next_action: { tool: workflow.steps[0].next_tool }
};
```

### Context Assembly
```javascript
// Inherit from parent
const parentContext = await loadContext(params.parent_id);

// Apply adaptations
const context = {
  ...parentContext,
  ...params.adaptations
};

// Preserve intent
context.intent = parentContext.intent;
```

## 🚨 Anti-Pattern Alerts

Watch for these drift indicators:
- Writing regex patterns
- If/else decision trees
- Switch statements for routing
- Hardcoded classifications
- Isolated entities without context

When you see these, STOP and ask: "How would the LLM decide this?"

## 🎯 Remember

You're building the future of AI coordination where:
- Agents are minimal (10-50 lines)
- OS provides all intelligence
- Every decision uses LLM reasoning
- Context inheritance preserves intent
- The system learns continuously

The revolution is in making EVERY reasoning step use FULL MODEL CAPACITY!

---
*When in doubt, re-read core-principles.md*