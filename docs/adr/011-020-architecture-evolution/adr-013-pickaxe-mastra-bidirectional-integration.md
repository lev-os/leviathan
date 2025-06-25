# ADR-013: Pickaxe-Mastra-BiDirectional Integration Strategy

> **⚠️ STATUS: DRAFT - PENDING WIZARD WORKFLOW**
> 
> This ADR is in draft status pending systematic refinement through the 
> [Wizard Workflow Process](../../workflows/wizard-experience/README.md).
> 
> **Next Step**: Use wizard workflow to validate decisions and finalize architectural approach.

## Status

**DRAFT** - Awaiting wizard workflow refinement

## Context

Leviathan requires a production-ready workflow orchestration system that combines:
- **Fault tolerance** for multi-step AI workflows
- **Intelligent adaptation** based on real-time performance  
- **Bi-directional execution** where system can initiate LLM conversations
- **Clean architecture** that avoids vendor coupling

Three systems provide complementary capabilities:
- **Pickaxe**: Durable execution and fault tolerance for AI agents
- **Mastra**: Package architecture patterns and YAML-first configuration
- **Leviathan**: Bi-directional intelligence with FlowMind and whisper systems

## Decision (Preliminary)

We will integrate capabilities from Pickaxe and Mastra into **domain-based packages** rather than vendor-specific plugins:

```
packages/workflow/        # Durable execution (Pickaxe patterns)
packages/intelligence/    # Bi-directional systems (Whisper + FlowMind)
packages/orchestration/   # Configuration patterns (Mastra patterns)  
packages/commands/        # Enhanced process management
```

### Key Architectural Decisions

1. **Bi-directional + Workflow Coupling**: Accept that bi-directional intelligence and workflow execution are heavily coupled - this enables revolutionary "taking control" patterns

2. **Domain-Based Integration**: Organize by problem domain (workflow, intelligence, orchestration) rather than vendor (pickaxe, mastra)

3. **Replace Job System**: Migrate from `agent/src/hybrid-router.js` to integrated durable + bi-directional approach

4. **Safety First**: Implement circuit breakers, time boxing, and emergency stops for infinite callback prevention

## Rationale (Preliminary)

### Why Domain-Based vs Vendor Plugins
- **Cleaner architecture**: Organize by what problems we solve, not which tools we use
- **Reduced coupling**: Avoid tight coupling to external vendor patterns
- **Better abstraction**: Domain packages can evolve independently of vendor implementations

### Why Coupled Bi-Directional + Workflow  
- **Revolutionary capability**: System can initiate conversations and spawn workflows automatically
- **Natural architecture**: Bi-directional intelligence IS the workflow execution engine
- **Production value**: Enables self-improving, adaptive workflow systems

### Why Replace Current Job System
- **Fault tolerance**: Current system lacks crash recovery and persistence
- **Limited intelligence**: No adaptive optimization or context switching
- **Static execution**: Cannot spawn follow-up workflows based on results

## Consequences (Preliminary)

### Positive
- **Production reliability**: Fault-tolerant execution with automatic recovery
- **Adaptive intelligence**: System learns and optimizes workflows over time
- **Revolutionary capability**: First AI system that can "take control" safely
- **Clean architecture**: Domain-based organization scales better than vendor coupling

### Negative  
- **Implementation complexity**: Significant engineering effort to integrate three systems
- **Safety risks**: Infinite callback chains require careful circuit breaker design
- **Migration effort**: Must carefully transition from existing job system

### Neutral
- **Learning curve**: Team must understand new patterns and safety mechanisms
- **Testing complexity**: Requires comprehensive fault injection and safety testing

## Questions Requiring Wizard Workflow

> **🧙‍♂️ Critical Decisions Pending**: These complex architectural choices require systematic refinement:

1. **Package Boundaries**: Exact interfaces and dependencies between domain packages
2. **Integration Sequencing**: Which Pickaxe patterns to adopt first vs later  
3. **Safety Thresholds**: Specific circuit breaker values and emergency stop behaviors
4. **Migration Strategy**: Timeline and backwards compatibility requirements
5. **Performance Targets**: Acceptable overhead for durability and intelligence features

## Implementation Approach (Preliminary)

### Phase 1: Foundation Setup
- Create domain package structure with proper interfaces
- Integrate core Pickaxe durable execution patterns
- Setup Mastra-style monorepo architecture

### Phase 2: System Integration  
- Replace current job system with integrated approach
- Implement bi-directional workflow spawning capabilities
- Add comprehensive safety mechanisms

### Phase 3: Production Validation
- Performance testing and optimization
- Fault injection testing for reliability validation  
- Documentation and team training

## Compliance

This ADR aligns with Leviathan's core principles:
- **LLM-First Architecture**: Maintains AI reasoning as primary execution engine
- **Maximum Extensibility**: Domain packages enable community contribution
- **Bootstrap Sovereignty**: Minimal external dependencies through integration vs adoption
- **Bi-Directional Communication**: Enables revolutionary system-initiated workflows

---

**Related Documents**:
- [Strategic Analysis](../../concepts/revolutionary/pickaxe-mastra-bidirectional-integration.md)
- [Wizard Workflow Process](../../workflows/wizard-experience/README.md)
- [Consolidation Tracker](../../consolidation-tracker.csv) - Task P05T06

**Status**: Draft pending wizard workflow refinement  
**Created**: 2025-06-24  
**Last Updated**: 2025-06-24