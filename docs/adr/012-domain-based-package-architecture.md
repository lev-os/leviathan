# ADR-012: Domain-Based Package Architecture

## Status
Accepted

## Context

The Leviathan agent system (`agent/src`) has grown into a sophisticated orchestration engine containing multiple concerns:
- Command routing and registry
- Session management and persistence
- Context loading and inheritance
- Workflow discovery and execution
- Intelligence routing and capability assessment
- Adapter implementations (CLI, MCP)
- Caching and optimization strategies

Through architectural analysis and the wizard experience synthesis session, we discovered that components naturally cluster by **how they work together** in bi-directional flows, not by feature boundaries.

### Key Discoveries

1. **Bi-Directional Pattern Recognition**: Components that participate in the LLM ↔ System feedback loops belong together
2. **Domain Boundaries**: Clear functional domains emerged based on orchestration patterns
3. **Build as a Domain**: Caching, compilation, and request processing share the same optimization concerns
4. **Whisper System Centrality**: The whisper system is integral to bi-directional orchestration, not a separate feature

## Decision

Reorganize the Leviathan architecture into domain-based packages that reflect how components work together:

### Package Structure

```yaml
@lev-os/core: # Orchestration Domain
  purpose: "Enable bi-directional communication and orchestration"
  components:
    - Universal Context System (loading, inheritance, validation)
    - Command Registry (single source of truth, auto-bootstrap)
    - Session Management (multi-tab continuity, checkpoints)
    - CEO Binding & Intent Detection (agent switching, routing)
    - Workflow Execution (discovery, loading, coordination)
    - Semantic Lookup (natural language → workflow)
    - Whisper System (bi-directional context injection)
    - Intelligence Routing (capability assessment)

@lev-os/legos: # Assembly & Generation Domain (formerly @lev-os/build)
  purpose: "Assemble schema-validated pieces to build things"
  semantic_rationale: "Lego metaphor better captures build-time + runtime assembly"
  components:
    - Assembly System (runtime context composition) = Context Compilation
    - Generation System (build-time creation) = Bundle Generation  
    - Template System (documentation generation)
    - Validation Pipeline (schema-driven quality) = Performance Optimization
    - Request Processing Pipeline
    - FACT Caching Integration (sub-50ms responses)
    - Embeddings Builder (semantic search indices)

@lev-os/memory: # Storage Domain (existing)
  purpose: "Store, retrieve, and learn from experience"
  components:
    - 5-type memory system (procedural, semantic, temporal, working, episodic)
    - 3-tier hybrid architecture (RAM → Graphiti → Files)
    - Learning & decay algorithms
    - Session persistence

@lev-os/workshop: # Discovery Domain
  purpose: "Analyze and integrate new capabilities"
  components:
    - Repository intake & analysis
    - Tool evaluation & tier classification
    - Capability gap analysis
    - Integration planning & handoffs

@lev-os/adapters: # Distribution Domain
  purpose: "Distribute capabilities across platforms"
  components:
    - Protocol implementations (MCP, CLI, Direct)
    - Platform adapters (Claude Code, Cursor, VSCode, Cline)
    - Auto-bootstrap from Command Registry
```

### Architectural Principles

1. **Domain Cohesion**: Components that participate in the same bi-directional flows stay together
2. **Clear Boundaries**: Each domain has a single, clear purpose
3. **No Feature Splitting**: Avoid splitting related functionality across packages
4. **Orchestration Centrality**: Core orchestrates all bi-directional communication

## Consequences

### Positive

- **Clearer Mental Model**: Developers understand where functionality lives based on purpose
- **Better Cohesion**: Related components that work together stay together
- **Reduced Coupling**: Clean domain boundaries reduce cross-package dependencies
- **Performance Optimization**: Build domain can optimize holistically
- **Easier Testing**: Domain-focused testing strategies

### Negative

- **Migration Effort**: Moving code from `agent/src` to new packages
- **Breaking Changes**: Existing imports will need updates
- **Documentation Updates**: All references need updating

### Neutral

- **Package Count**: More packages, but with clearer purposes
- **Build Complexity**: More sophisticated build orchestration needed

## Implementation Notes

### Migration Strategy

1. **Phase 1**: Create new package structures without moving code
2. **Phase 2**: Move components package by package, maintaining compatibility
3. **Phase 3**: Update all imports and dependencies
4. **Phase 4**: Remove old code locations

### Key Insights

- **Lego Domain Unity**: Assembly, generation, templates, and validation all concern "building with validated pieces"
- **Semantic Clarity**: "Legos" captures both build-time generation AND runtime assembly better than generic "build"
- **Schema Factory Separation**: @lev-os/schema defines WHAT can exist, @lev-os/legos defines HOW to use what exists
- **Whisper Integration**: Whisper is not a feature but the mechanism for bi-directional flow
- **Workshop as Meta-System**: Workshop contains the wizard and intake pipeline that builds the system itself
- **Adapter Abstraction**: All adapters share the same auto-bootstrap pattern

### Lego Architecture Discovery

During implementation, we discovered the perfect "Factory vs Builder" separation:
- **@lev-os/schema**: The Lego Factory - defines mold shapes and validation rules
- **@lev-os/legos**: The Lego Builder - assembles validated pieces into working systems
- **@lev-os/contexts**: The Context Library - contains actual contexts/schemas that exist
- **workshop/**: The Meta-System - wizard and intake pipeline for building the system

## Related Documents

- [ADR-008: Bidirectional Orchestration Architecture](./008-bidirectional-orchestration-architecture.md)
- [Bi-Directional Communication Specification](../concepts/revolutionary/bidirectional-communication-spec.md)
- [Original Architecture Synthesis](.../../../workshop/_newshit.md)

## Decision Makers

- Architecture synthesis from wizard experience session
- Analysis of actual code structure in `agent/src`
- Recognition of bi-directional patterns as organizing principle

## Date

2024-01-18