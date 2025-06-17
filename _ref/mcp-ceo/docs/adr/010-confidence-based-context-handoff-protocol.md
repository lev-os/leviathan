# ADR-010: Confidence-Based Context Handoff Protocol
## Advanced Feature for v0.2.0+

## Status
**PROPOSED** - Target v0.2.0+ (Not in v0.1.0)

## Context
This ADR describes an advanced feature for FlowSense (v0.2.0) where the LLM can signal low confidence and request additional context. This requires the semantic evaluation capabilities of FlowSense.

### Dependencies
- Requires FlowSense language (ADR-007)
- Requires semantic evaluation
- Builds on bidirectional flow (ADR-008)

## Why Not in v0.1.0

In v0.1.0:
- Workflows are simple step sequences
- Context switching is deterministic
- No confidence signaling needed
- Focus on core bidirectional flow

## Future Vision (v0.2.0+)

### Structured LLM Response Format
```yaml
# When FlowSense is implemented
response_protocol:
  confidence: 0.0-1.0
  response: "actual response content"
  context_needs: ["what additional context needed"]
  reasoning: "why confidence is at this level"
  final: boolean
```

### How It Would Work
```yaml
# v0.2.0 FlowSense workflow
flowsense:
  - execute: "agent://analyst"
  
  - if_confidence: "< 0.8"
    then:
      load_additional: "context://detailed-docs"
      retry_with_expanded_context: true
      
  - while_confidence: "< threshold"
    and: "iterations < 3"
    do:
      expand_context_and_retry
```

## What We Have in v0.1.0 Instead

Simple, deterministic workflows:
```yaml
workflow_config:
  steps:
    - agent: "agent://analyst"
      prompt: "Analyze this"
    - agent: "agent://reviewer"  
      prompt: "Review the analysis"
```

No confidence checking, no dynamic context expansion. Just reliable step execution.

## Migration Path

### v0.1.0 → v0.2.0
1. Add FlowSense parser
2. Enable confidence in LLM responses
3. Implement context expansion logic
4. Maintain backward compatibility

## Key Principle

Don't over-engineer v0.1.0. Get bidirectional flow working with simple workflows first. Add intelligence incrementally.

---

**This ADR is intentionally deferred to v0.2.0. For v0.1.0, focus on simple, working bidirectional flow with FlowMind contexts.**