# ADR: Plugin Architecture - Simple Separation of Concerns

## Status
**ACCEPTED** - Core package separation with event bus boundaries

## Context
Kingly needs a plugin architecture that balances:
- **Core development speed** - Direct imports and minimal overhead
- **Community extensibility** - Safe, debuggable plugin development
- **LLM-first principles** - YAML configuration over hardcoded behavior
- **Simple separation** - Clear boundaries without over-engineering

Three plugin approaches were analyzed:
1. **Event Bus System** (community focus)
2. **YAML Command Registry** (core development) 
3. **Package-Based Core** (system infrastructure)

## Decision

### Hybrid Architecture: Three Coexisting Layers

#### Layer 1: Core Packages (System Foundation)
- **Packages**: @kingly/cmd, @kingly/debug, @kingly/memory
- **Communication**: Direct imports between core packages
- **Purpose**: System infrastructure and universal capabilities
- **Location**: `core/packages/`

#### Layer 2: YAML-First Plugin System (Core Development)
- **Pattern**: YAML manifests defining commands, workflows, reasoning
- **Communication**: Command registry integration
- **Purpose**: Core plugin behaviors and LLM-first orchestration
- **Location**: `contexts/plugins/` (existing system)

#### Layer 3: Event Bus Boundaries (Community Extension)
- **Pattern**: Event-driven with permission manifests
- **Communication**: Pub/sub event bus with sandboxing
- **Purpose**: Safe community plugin development  
- **Location**: User-defined with marketplace distribution

## Rationale

### Why Hybrid Over Single Approach

**Core Packages** solve infrastructure needs:
- Universal debugging (@kingly/debug imported by everything)
- Process management (@kingly/cmd for git worktree, job integration)
- Memory backends (@kingly/memory for storage abstraction)

**YAML Command System** enables LLM-first development:
- Behavior defined in configuration, not code
- Whisper guidance for LLM reasoning
- Workflow orchestration via YAML definitions

**Event Bus** provides community safety:
- Sandboxed permissions via manifests
- Event tracing for debugging
- Hot reload for development experience

### Comparison to Single-Approach Alternatives

| Approach | Core Dev Speed | Community Safety | LLM-First | Complexity |
|----------|----------------|------------------|-----------|------------|
| **Event-Only** | ❌ Slow | ✅ Safe | ✅ Good | ❌ High |
| **YAML-Only** | ✅ Fast | ❌ Limited | ✅ Excellent | ✅ Low |  
| **Package-Only** | ✅ Fast | ❌ Unsafe | ❌ Poor | ✅ Low |
| **Hybrid** | ✅ Fast | ✅ Safe | ✅ Excellent | ✅ Moderate |

## Implementation

### Core Package Architecture
```
core/packages/
├── debug/          # Universal logging, tracing, monitoring
├── cmd/            # Process management, git worktree  
└── memory/         # Storage backends, semantic search
```

### Plugin Type Boundaries

**Core Plugins** (full access):
- Can import all core packages directly
- YAML configuration required
- Examples: parallel.yaml, constitutional-ai.yaml

**Community Plugins** (sandboxed):  
- Event bus communication only
- Manifest permissions required
- Examples: search enhancers, workflow extensions

### Event Bus Integration
- **Location**: Lightweight utility in existing context system
- **Usage**: Community plugin boundaries and debugging
- **Not**: Heavy infrastructure or core development

## Consequences

### Positive
- ✅ **Fast core development** via direct package imports
- ✅ **Safe community extension** via event boundaries  
- ✅ **LLM-first everywhere** via YAML configuration
- ✅ **Universal debugging** via @kingly/debug
- ✅ **Simple separation** - clear package vs plugin vs community boundaries

### Negative
- ❌ **Three communication patterns** to understand (imports, commands, events)
- ❌ **Documentation complexity** for different plugin types
- ❌ **Migration coordination** between layers as system evolves

### Neutral
- 🔄 **Gradual implementation** - core packages first, event bus later
- 🔄 **Architecture evolution** - can adjust boundaries as needs clarify
- 🔄 **Community adoption** - depends on marketplace and tooling quality

## Alternatives Considered

### Pure Event-Driven Architecture
**Rejected**: Too slow for core development, event overhead for simple operations

### Pure YAML Command System  
**Rejected**: No safe community extension path, security concerns

### Pure Package Architecture
**Rejected**: No LLM-first configuration, unsafe for community plugins

### Framework-Heavy Solutions
**Rejected**: Violates LLM-first principles, adds unnecessary complexity

---
*Architecture decision for Kingly plugin system balancing speed, safety, and LLM-first principles*