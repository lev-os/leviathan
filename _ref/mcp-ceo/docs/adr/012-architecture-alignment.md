# ADR-012: Architecture Alignment
## Resolution of All Gaps and Clear Path to v0.1.0

## Status
**UPDATED** - Simplified scope based on findings (2025-01-08)

## Context
After comprehensive analysis, we identified that assembly-rules.js contains sophisticated functionality that we don't need yet. The code is good but premature for current scope.

## Decision
**REVISED SCOPE**: Focus on basic `execute_workflow` MCP tool first. Comment out assembly-rules complexity until we build auto-discovery and complex workflows.

**Core Finding**: Assembly-rules.js is only used in tests, not connected to any production code. We can safely disable advanced features.

## Architecture Summary

### Core Components

#### 1. FlowMind (Context Interface)
- Universal wrapper for any context type
- 1:1 YAML mapping with clean accessors
- Validation as first-class citizen
- NO semantic evaluation in v0.1.0

#### 2. Context Assembler (Protocol Evolution)
- Evolved from prefix to protocol URIs
- Backward compatible design
- Recipe system for complex assembly
- Integrated with registry for discovery

#### 3. Protocol Handlers (Semantic Resolution)
- One handler supports multiple protocols
- Semantic resolution with aliases
- Filesystem fallback for reliability
- Sub-10ms resolution target

#### 4. Assembly Rules (COMMENTED OUT FOR v0.1.0)
- ⚠️ **DISABLED**: Complex assembly rules premature for current scope
- Code preserved but commented out until needed
- Only basic DynamicContextAssembler stub remains
- TODO: Enable when building auto-discovery features

#### 5. MCP Server (Bidirectional Flow)
- Proven pattern from server.js
- Context switching for intelligence
- Session management included
- LLM as runtime, not text generator

### What We're Building (v0.1.0)

```
User Request
    ↓
MCP Tool (execute_workflow)
    ↓
Protocol URI (workflow://deep-analysis)
    ↓
Context Assembler + Registry
    ↓
FlowMind Instance(s)
    ↓
Recipe Assembly (if needed)
    ↓
MCP sends context to LLM
    ↓
LLM reasons AS context
    ↓
Context switch for next step
    ↓
Emergent Intelligence
```

### What We're NOT Building (v0.1.0)

- ❌ FlowSense language parser
- ❌ Semantic condition evaluation in code
- ❌ Confidence-based handoffs
- ❌ Complex control flow in YAML
- ❌ Mock evaluation functions

## Implementation Checklist

### Week 1: Foundation
- [ ] Remove mock semantic evaluation from FlowMind
- [ ] Add validation accessors to FlowMind
- [ ] Evolve ContextAssembler to protocol URIs
- [ ] Create protocol handlers with semantic resolution
- [ ] Update AssemblyRules for FlowMind instances

### Week 2: Integration
- [ ] Build MCP server using FlowMind contexts
- [ ] Port bidirectional flow pattern from server.js
- [ ] Implement recipe-based assembly
- [ ] Add session management
- [ ] Create validation contexts

### Week 3: Polish
- [ ] Update all tests for new architecture
- [ ] Verify protocol resolution performance
- [ ] Test bidirectional flow end-to-end
- [ ] Documentation and examples
- [ ] Migration guide

## Key Architectural Decisions

### 1. FlowMind is Data, Not Logic
FlowMind provides a clean interface to contexts but doesn't execute anything. All intelligence comes from the LLM through MCP.

### 2. Protocol URIs are Semantic
Moving from `yaml:path/to/file` to `agent://ceo` represents semantic intent, not just syntactic sugar.

### 3. Validation Through Context Switching
Validation happens by switching to validator contexts, not through coded rules or separate engines.

### 4. Evolution Over Revolution
Every change builds on what works. Prefix system evolves to protocols. Hardcoded workflows evolve to FlowMind contexts.

### 5. Clear Version Boundaries
- v0.1.0: Context interface and orchestration
- v0.2.0: FlowSense language and semantic evaluation

## Success Metrics

### Technical Metrics
- All contexts load via protocol URIs
- Bidirectional flow executes workflows
- Recipe assembly works correctly
- Validation contexts accessible
- < 10ms URI resolution
- < 50ms context assembly

### Architecture Metrics
- No mock functions in code
- Clear separation of concerns
- LLM-first principles followed
- All ADRs aligned with implementation

### User Metrics
- Can run research workflows
- Context switching provides value
- Validation improves quality
- System is understandable

## Risks and Mitigations

### Risk: Complexity
**Mitigation**: Start simple, add features incrementally

### Risk: Performance
**Mitigation**: Profile early, optimize hot paths

### Risk: Breaking Changes
**Mitigation**: Backward compatibility layer

### Risk: Scope Creep
**Mitigation**: Strict v0.1.0 vs v0.2.0 boundary

## Conclusion

This alignment provides a clear, achievable path to FlowMind v0.1.0 that:
- Builds on proven patterns
- Evolves existing systems
- Maintains architectural integrity
- Enables future growth

The key insight: FlowMind is a context orchestration standard, not a programming language. The LLM provides intelligence through systematic context switching orchestrated by MCP.

---

**This ADR establishes the aligned architecture and clear implementation path for FlowMind v0.1.0.**