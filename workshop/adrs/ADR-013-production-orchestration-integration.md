# ADR-013: Production Orchestration Integration - MetaGPT + AutoGen

## Status
Proposed

## Context

Leviathan has achieved revolutionary bi-directional LLM-first architecture but lacks production-ready orchestration capabilities. Through comprehensive analysis of 100+ agent systems (batch analysis 2025-06-29), we identified 4 critical technology gaps:

1. **Production Orchestration**: No fault tolerance, crash recovery, or enterprise scalability
2. **JEPA 2 Integration**: Missing temporal reasoning and predictive intelligence
3. **Advanced Multi-Agent**: Limited to 3-tab coordination, no true agent swarms
4. **Memory Federation**: Single-system memory with no distributed federation

### Analysis Findings

From our batch agent analysis:
- **MetaGPT**: Provides role-based orchestration, team serialization, and AFlow workflow generation
- **AutoGen**: Offers Orleans distributed runtime, enterprise fault tolerance, and multi-agent coordination
- **Auto-GPT**: Contributes production patterns with Redis/RabbitMQ resilience
- **AgentGPT**: Adds polished web interface for agent management
- **BabyAGI**: Research-only, not production-ready

### Key Discovery

These systems can enhance Leviathan WITHOUT disrupting its core bi-directional innovation. The whisper system, FlowMind meta-programming, and LLM-first architecture remain the heart of the system.

## Decision

Integrate MetaGPT and AutoGen through a phased, feature-flagged approach that preserves Leviathan's constitutional principles while adding production capabilities.

### Integration Architecture

```yaml
production_layer:
  metagpt_roles:
    purpose: "Enhance multi-persona system with role-based orchestration"
    integration_points:
      - ceo-binding.js: Wrap personas as MetaGPT roles
      - workflow-loader.js: Add AFlow generation
      - session-manager.js: Team serialization
      
  autogen_orleans:
    purpose: "Replace file-based persistence with distributed runtime"
    integration_points:
      - session-manager.js: Orleans grain backend
      - command-registry.js: Distributed command routing
      - whisper-system.js: Cross-grain whisper propagation
      
  feature_flags:
    ENABLE_METAGPT_ROLES: "Gradual role enhancement"
    ENABLE_ORLEANS: "Distributed session backend"
    ENABLE_DISTRIBUTED_WHISPERS: "Multi-system whispers"
    ENABLE_MONITORING: "Production observability"
```

### Implementation Phases

**Phase 1: Foundation (Weeks 1-2)**
- Feature flag infrastructure in `agent/src/core/feature-flags.js`
- Plugin structure for `@lev-os/metagpt-roles` and `@lev-os/orleans-adapter`
- Backward compatibility preservation

**Phase 2: MetaGPT Integration (Weeks 2-3)**
- Role wrapper for CEO binding personas
- AFlow workflow generation integration
- Team coordination patterns
- State persistence through role serialization

**Phase 3: AutoGen Orleans (Weeks 3-4)**
- Orleans session backend implementation
- Distributed grain persistence
- Fault tolerance patterns
- Circuit breaker integration

**Phase 4: Production Monitoring (Week 4)**
- OpenTelemetry integration
- Distributed tracing for whispers
- Health check systems
- Observability dashboard

**Phase 5: Validation (Week 5)**
- Integration testing across feature combinations
- Performance benchmarking
- Gradual rollout strategy
- Documentation updates

## Consequences

### Positive

- **Production Readiness**: 99.9% uptime with automatic crash recovery
- **Enterprise Scale**: Distributed runtime supports massive agent swarms
- **Preserved Innovation**: Bi-directional whisper system remains untouched
- **Gradual Adoption**: Feature flags enable safe, incremental rollout
- **Best of Both**: Combines Leviathan's innovation with battle-tested infrastructure

### Negative

- **Complexity Increase**: Additional layers require deeper understanding
- **Dependency Growth**: Orleans and MetaGPT add external dependencies
- **Migration Effort**: Existing sessions need migration path
- **Testing Burden**: Multiple feature flag combinations to test

### Risks & Mitigations

1. **Risk**: Integration disrupts bi-directional flows
   - **Mitigation**: All changes behind feature flags, extensive testing

2. **Risk**: Performance degradation from added layers
   - **Mitigation**: Benchmark at each phase, optimize critical paths

3. **Risk**: Orleans complexity overwhelms team
   - **Mitigation**: Abstract behind clean interfaces, document patterns

## Alternatives Considered

1. **Build from Scratch**: Rejected - reinventing proven solutions wastes time
2. **Single System Adoption**: Rejected - no single system addresses all gaps
3. **Fork and Modify**: Rejected - maintenance burden too high
4. **Wait for JEPA 2**: Rejected - production needs are immediate

## Implementation Notes

### Critical Success Factors
- Preserve bi-directional whisper system integrity
- Maintain LLM-first architecture principles
- Enable gradual rollout without disruption
- Document integration patterns thoroughly

### Measurement Criteria
- Crash recovery time < 30 seconds
- Multi-agent coordination 10x improvement
- Zero regression in existing capabilities
- Developer experience remains excellent

## References

- Workshop Analysis: `workshop/analysis/batch-agent-analysis-2025-06-29.md`
- Capability Matrix: `workshop/cache/leviathan-capability-matrix.yaml`
- Bi-directional Spec: `docs/concepts/revolutionary/bidirectional-communication-spec.md`
- Plugin Guide: `plugins/@lev-os/PLUGIN_DEVELOPMENT_GUIDE.md`