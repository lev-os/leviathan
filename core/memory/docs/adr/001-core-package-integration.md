# ADR-001: Memory Core Package Integration Strategy

**Status**: Proposal  
**Date**: 2025-06-29  
**Authors**: Claude Code + User  
**Supersedes**: N/A  

## Context

The memory system was initially designed as a plugin but has evolved into a foundational component requiring tight integration with the agent system. This ADR proposes migrating from plugin architecture to core package architecture with defined integration points, namespace isolation, and selective MCP tool exposure.

## Problem Statement

### Current Issues
1. **Plugin Limitations**: Plugin architecture doesn't provide the tight coupling needed for core memory functionality
2. **MCP Tool Explosion**: Risk of exposing 400+ tools to LLMs, causing cognitive overload
3. **Integration Complexity**: Memory system needs direct access to agent internals (sessions, context, etc.)
4. **Namespace Conflicts**: No clear separation between agent-specific and shared memory
5. **Configuration Coupling**: Memory configuration should be tightly integrated with agent lifecycle

### Requirements
- **Tight Coupling**: Memory must be core infrastructure, not optional plugin
- **Selective Tool Exposure**: Limit MCP tools to 5-8 essential operations
- **Namespace Isolation**: Clear separation between agents, sessions, and shared data
- **Auto-Configuration**: Seamless Neo4j detection and service orchestration
- **Elevated Privileges**: Core package status with enhanced system access

## Decision

### Core Package Architecture

Migrate memory from plugin to **core package** with the following characteristics:

#### 1. Package Structure
```
packages/memory/                 # Core package location
├── package.yaml                # Core package manifest (replaces plugin.yaml)
├── src/
│   ├── index.js               # Core package entry point
│   ├── core-integration.js    # Agent system integration hooks
│   ├── mcp-adapter.js        # Selective MCP tool exposure
│   └── (existing files)
└── docs/adr/                  # Architecture decisions
```

#### 2. Integration Points

**Core Initializer Enhancement**:
```javascript
// core-initializer.js
import { MemoryManager } from '@lev-os/memory';

async initializeCore() {
  // Core package initialization (tight coupling)
  const memoryManager = new MemoryManager({
    useConfigSystem: true,
    agentContext: {
      agentId: this.agentId,
      sessionId: this.sessionId
    }
  });
  
  // Register with universal context system
  this.universalContextSystem.attachMemory(memoryManager);
  
  return {
    ...existingDependencies,
    memory: memoryManager  // Available to all core systems
  };
}
```

**MCP Adapter Integration**:
```javascript
// mcp-adapter.js
class MemoryMCPAdapter {
  getMCPTools() {
    return [
      'memory:store',    // Store with auto-namespace
      'memory:retrieve', // Query with context
      'memory:query',    // Semantic search
      'memory:compress', // Episodic → Semantic
      'memory:status'    // Health and config
    ];
  }
}
```

#### 3. Namespace Architecture

**Agent-Level Isolation**:
- **Agent memories**: `agent-{id}:memory:{type}`
- **Session memories**: `session-{id}:memory:working`
- **Shared knowledge**: `shared:memory:semantic`

**Cross-Agent Permissions**:
```yaml
namespace:
  permissions:
    - "read:shared:semantic"      # Can read shared knowledge
    - "write:agent:episodic"      # Can write own experiences
    - "write:session:working"     # Can write session data
    - "read:agent:procedural"     # Can read own procedures
```

#### 4. Selective MCP Tool Strategy

**Problem**: Traditional plugin approach would expose 20+ tools
**Solution**: Consolidate into 5 essential tools with auto-context injection

| Tool | Purpose | Auto-Context |
|------|---------|--------------|
| `memory:store` | Store data | agent_id, session_id, auto-namespace |
| `memory:retrieve` | Query data | agent_id, session_id, namespace_scope |
| `memory:query` | Semantic search | agent_id, permitted_namespaces |
| `memory:compress` | Convert memories | agent_id |
| `memory:status` | System health | deployment_mode, service_status |

### Core Package Privileges

As a core package, memory gains elevated privileges:

```yaml
core_privileges:
  direct_graphiti_access: true        # Direct Neo4j/Graphiti access
  cross_agent_communication: true    # Read cross-agent data with permissions
  global_memory_access: true         # Access to universal context system
  namespace_management: true         # Create/manage namespaces
  file_system_access: unrestricted   # Full file system access
  service_orchestration: true        # Start/stop services
  auto_configuration: true           # Detect and configure backends
```

## Implementation Plan

### Phase 1: Foundation (This PR)
- [x] Create core package schema and documentation
- [x] Convert `plugin.yaml` → `package.yaml`
- [x] Document integration strategy in this ADR

### Phase 2: Core Integration (Future)
- [ ] Implement core initializer integration hooks
- [ ] Create MCP adapter with selective tool exposure
- [ ] Add agent context injection to all operations
- [ ] Implement namespace isolation logic

### Phase 3: Agent System Integration (Future)
- [ ] Integrate with `CoreInitializer.initializeCore()`
- [ ] Register MCP tools through Universal Command Registry
- [ ] Add memory attachment to universal context system
- [ ] Implement session lifecycle hooks

### Phase 4: Advanced Features (Future)
- [ ] Cross-agent memory sharing with permissions
- [ ] Advanced namespace management
- [ ] Memory analytics and optimization
- [ ] Plugin → Core package migration tooling

## Consequences

### Positive
- **Tight Integration**: Memory becomes true core infrastructure
- **Reduced Complexity**: 5 tools instead of 20+ for LLMs
- **Better Performance**: Direct access, no plugin overhead
- **Namespace Safety**: Clear isolation prevents data leaks
- **Auto-Configuration**: Seamless setup experience
- **Elevated Capabilities**: Core package privileges enable advanced features

### Negative
- **Increased Coupling**: Memory becomes hard dependency
- **Migration Complexity**: Existing integrations need updates
- **Testing Complexity**: Core package requires more comprehensive testing
- **Breaking Changes**: Plugin-based integrations will break

### Risks
- **Tight Coupling Risk**: Memory failures could crash agent system
  - *Mitigation*: Comprehensive fallback modes and error handling
- **Namespace Conflicts**: Poorly designed namespaces could cause issues
  - *Mitigation*: Strict namespace validation and collision detection
- **Tool Consolidation Risk**: 5 tools might not cover all use cases
  - *Mitigation*: Extensible tool design with batching capabilities

## Alternatives Considered

### Alternative 1: Enhanced Plugin Architecture
**Approach**: Keep plugin architecture but add elevated privileges
**Rejected Because**: Doesn't solve fundamental coupling issues, still has MCP tool explosion

### Alternative 2: Service-Based Architecture
**Approach**: Memory as separate microservice
**Rejected Because**: Too much complexity for single-node agent system, latency issues

### Alternative 3: Event-Driven Integration
**Approach**: Memory communicates via events only
**Rejected Because**: Too loose coupling for core infrastructure, debugging complexity

## Implementation Details

### Configuration Integration
Memory package will use existing auto-detection system:
```yaml
backend:
  auto_detection:
    enabled: true
    deployment_modes: ["desktop", "docker", "external", "native"]
    config_hierarchy: ["env_vars", "local_config", "project_config", "auto_detect", "fallback"]
```

### Service Orchestration
Core package will manage its own services:
- **Desktop Mode**: Connect to existing Neo4j Desktop
- **Docker Mode**: Orchestrate Graphiti + Neo4j containers
- **External Mode**: Connect to remote instances
- **Fallback Mode**: File-system only operation

### Testing Strategy
Core package requires comprehensive testing:
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Agent system integration
- **End-to-End Tests**: Complete workflows with real backends
- **Fallback Tests**: Graceful degradation scenarios

## Future Considerations

### Core Package Ecosystem
This ADR establishes patterns for other core packages:
- `@lev-os/debug` - Universal debugging system
- `@lev-os/commands` - Process management
- `@lev-os/validation` - Input validation

### Plugin Migration Path
Future plugins may need similar migration:
1. Assess coupling requirements
2. Evaluate MCP tool explosion risk
3. Consider core package conversion
4. Maintain clear plugin vs core package distinction

## Conclusion

Migrating memory to core package architecture provides the tight integration needed for foundational infrastructure while maintaining clean namespace isolation and avoiding MCP tool explosion. This establishes patterns for future core packages and creates a solid foundation for the Leviathan ecosystem.

The benefits of tight coupling, selective tool exposure, and elevated privileges outweigh the costs of increased complexity and breaking changes. The comprehensive fallback strategies and testing approach mitigate the primary risks.

---

**Next Steps**:
1. Review and approve this ADR
2. Begin Phase 2 implementation
3. Update agent system integration points
4. Establish core package development standards