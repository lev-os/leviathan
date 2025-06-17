# RESOLUTION: FlowMind Architecture Alignment & Implementation Plan

## Executive Summary

This document resolves all architectural gaps, aligns ADRs, and provides a clear path to FlowMind 0.1.0 MVP with bidirectional flow, context assembly recipes, and protocol support. The key insight: FlowMind is a **context interface standard**, not a control flow language (that's 0.2.0).

## 1. Core Architecture Insights

### 1.1 What FlowMind Actually Is (0.1.0)
- **Universal context wrapper** - standardizes any YAML/MD/memory into consistent interface
- **Not a language** - that's FlowMind Control Language for 0.2.0
- **Not an execution engine** - the LLM is the runtime through MCP

### 1.2 Protocol Evolution
**Current (prefix experiment):**
```
yaml:contexts/agents/ceo/context.yaml
markdown:docs/pattern.md
memory:session/123
```

**Evolved (protocol intent):**
```
agent://ceo#negotiator
workflow://deep-analysis?step=3
pattern://scamper
markdown://system-prompts/base
validation://universal-fallback
```

Prefixes were the prototype - protocols are the natural evolution.

### 1.3 Bidirectional Flow (Already Working!)
From server.js sessions, we have PROVEN bidirectional flow:
1. LLM calls MCP tool with workflow request
2. MCP loads personality context
3. LLM reasons AS that personality
4. MCP switches to next personality
5. Cycle continues through workflow

**Gap**: Currently uses hardcoded personalities, needs FlowMind contexts.

## 2. What Needs to Change (End-to-End)

### 2.1 FlowMind Class (`src/flowmind.js`)
**Remove:**
- `shouldTriggerWorkflow()` method - future 0.2.0 functionality
- `_mockSemanticEvaluation()` - violates "never mock" principle
- All "Future: will call LLM" comments

**Add:**
- Validation accessors as first-class citizen:
```javascript
get validation() {
  return this._raw.validation || { 
    context: "validation://universal-fallback" 
  }
}

get validationEnabled() {
  return this.validation.enabled !== false
}

get validationContext() {
  return this.validation.context
}
```

**Keep:**
- Everything else - the interface is solid
- 1:1 YAML mapping
- Type-aware accessors
- Execution methods (they return context for MCP)

### 2.2 ContextAssembler (`src/context-assembler.js`)
**Change:**
- Evolve prefix parsing to full URI parsing
- Rename "loaders" to "handlers" (conceptual shift)
- Add protocol registration system

**Implementation:**
```javascript
// FROM:
const colonIndex = contextPath.indexOf(':')
const loaderType = contextPath.substring(0, colonIndex)
const filePath = contextPath.substring(colonIndex + 1)

// TO:
const uri = parseURI(contextPath) // {protocol, path, fragment, query}
const handler = this.handlers.get(uri.protocol)
const flowMind = await handler.resolve(uri)
```

**Add:**
- Recipe support for complex assembly
- Protocol handler registration
- URI parsing with fragment/query support

### 2.3 Protocol Handlers (Evolution of Loaders)
**Create new structure:**
```javascript
class YamlProtocolHandler {
  protocols = ['agent', 'workflow', 'pattern', 'validation']
  
  async resolve(uri) {
    // Semantic resolution
    switch(uri.protocol) {
      case 'agent':
        return this.resolveAgent(uri.path, uri.fragment)
      case 'workflow':
        return this.resolveWorkflow(uri.path, uri.query)
      // etc...
    }
  }
}
```

**Key insight**: One handler can support multiple protocols that resolve to same file type.

### 2.4 AssemblyRules (`src/assembly-rules.js`)
**Change:**
- Accept FlowMind instances instead of generic objects
- Use FlowMind type property for intelligent assembly
- Add type-specific strategies

**Remove:**
- Generic context assumptions
- Mock semantic relevance scoring

### 2.5 ContextRegistry (`src/context-registry.js`)
**Add:**
- Alias indexing from metadata
- Protocol-based lookups
- Semantic search preparation (future)

**Change:**
- Build reverse index: alias → context ID
- Support discovery for protocol resolution

### 2.6 New MCP Server (Reference server.js)
**Take from server.js:**
- Bidirectional flow pattern
- Session management approach
- Workflow execution logic

**Change to FlowMind:**
- Load workflows from FlowMind contexts
- Load agents from FlowMind contexts
- Use context assembler for recipes

**Architecture:**
```javascript
// MCP tool receives request
async execute_workflow({ workflow, step, session_id, previous_results }) {
  // Load workflow context
  const workflowContext = await assembler.load(`workflow://${workflow}`)
  
  // Get step configuration
  const stepConfig = workflowContext.steps[step - 1]
  
  // Assemble recipe for this step
  const recipe = {
    base: stepConfig.agent || stepConfig.context,
    mix: stepConfig.additional_contexts,
    memory: `memory://session/${session_id}/step-${step-1}`
  }
  
  // Return assembled context for LLM
  return assembler.assemble(recipe)
}
```

## 3. ADR Alignment Strategy

### 3.1 ADRs to Update

**ADR-000: FlowMind Interface Specification**
- Remove semantic evaluation from 0.1.0 scope
- Clarify FlowMind as context interface, not language
- Add validation as first-class citizen

**ADR-002: Context Assembler Core**
- Update to reflect protocol evolution from prefixes
- Document recipe system clearly
- Remove "future" protocol mentions - it's now

**ADR-007: FlowMind Semantic Control Language**
- Clearly mark as 0.2.0 functionality
- Separate from FlowMind context interface
- No implementation in 0.1.0

**ADR-008: LLM-First Bidirectional Control**
- Reference working implementation from server.js
- Document how MCP orchestrates context switches
- Clarify LLM is the runtime

**ADR-009: Universal Validation Framework**
- Integrate with FlowMind as first-class citizen
- Document validation through bidirectional flow
- No separate validation engine needed

**ADR-010: Confidence-Based Handoff**
- Mark as 0.2.0+ functionality
- Requires FlowSense language first
- Not needed for basic bidirectional flow

### 3.2 Drafts to ADRs or Archive

**To New ADRs:**
- `protocol.md` → ADR-011: Protocol URI Design
- `RESOLUTION.md` (this doc) → ADR-012: Architecture Alignment

**To Archive:**
- `flowsense-complete-lexicon.md` - Implementation detail for 0.2.0
- `flowsense-hexagonal-architecture.md` - Overengineered for current needs
- `protocol-registry-architecture-options.md` - Superseded by this resolution

**Keep as Drafts:**
- Language design docs - needed for 0.2.0 planning

## 4. Clear Vision: 0.1.0 vs 0.2.0

### 4.1 Version 0.1.0 (MVP - Context Interface)
**Goal**: Use MCP-CEO for research with proper context management

**Features:**
- ✅ FlowMind universal context interface
- ✅ Protocol-based addressing (agent://, workflow://, etc.)
- ✅ Bidirectional flow through MCP
- ✅ Context assembly recipes
- ✅ Validation as first-class citizen
- ✅ Session management
- ✅ Working with Kingly contexts

**NOT in 0.1.0:**
- ❌ FlowSense language parsing
- ❌ Semantic condition evaluation in code
- ❌ Confidence-based handoffs
- ❌ Complex control flow in YAML

### 4.2 Version 0.2.0 (FlowSense Language)
**Goal**: Natural language control flow in YAML

**New Features:**
- FlowSense parser for semantic conditions
- when_semantic evaluation through LLM
- Confidence thresholds
- Complex workflow control

**Key**: No breaking changes to 0.1.0 architecture!

## 5. Implementation Checklist

### 5.1 Immediate Actions (Remove/Fix)
- [ ] Remove mock semantic evaluation from FlowMind
- [ ] Remove shouldTriggerWorkflow method
- [ ] Delete workflows.yaml references
- [ ] Update assembly rules to use FlowMind instances

### 5.2 Phase 1: Core Changes (Week 1)
- [ ] Add validation accessors to FlowMind
- [ ] Evolve ContextAssembler to protocol URIs
- [ ] Create YamlProtocolHandler with semantic resolution
- [ ] Update ContextRegistry with alias indexing

### 5.3 Phase 2: Integration (Week 2)
- [ ] Build new MCP server using FlowMind contexts
- [ ] Port bidirectional flow from server.js
- [ ] Implement recipe-based assembly
- [ ] Add session management

### 5.4 Phase 3: Testing & Polish (Week 3)
- [ ] Update all tests for FlowMind interfaces
- [ ] Verify protocol resolution works
- [ ] Test bidirectional flow with real workflows
- [ ] Documentation and examples

## 6. Success Criteria for 0.1.0

1. **Can load any context via protocol**: `agent://ceo` works
2. **Bidirectional flow executes**: Workflows run with context switches
3. **Recipes assemble correctly**: Multiple contexts merge properly
4. **Validation works**: Contexts can specify validators
5. **No mocking**: Real data, real execution, real LLM reasoning
6. **Clean ADRs**: All documents aligned with implementation

## 7. Key Principles Moving Forward

1. **FlowMind is data, not logic** - Just a context interface
2. **LLM is the runtime** - Through MCP bidirectional flow
3. **Never mock evaluation** - Real or nothing
4. **Evolution over revolution** - Build on what works
5. **Context switching creates intelligence** - Not code

## Conclusion

This resolution provides a clear, achievable path to FlowMind 0.1.0 that:
- Builds on proven bidirectional flow
- Evolves prefix system to protocols naturally
- Keeps FlowMind as pure context interface
- Defers language parsing to 0.2.0
- Maintains architectural integrity

The key insight: FlowMind isn't trying to be a programming language yet. It's a context orchestration standard that enables the LLM to be the intelligence through systematic context switching.