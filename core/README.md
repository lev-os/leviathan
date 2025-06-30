# Core Packages Development Guide

## Overview

Core packages are essential system components that provide foundational infrastructure for the Leviathan ecosystem. Unlike plugins, core packages have elevated status with tight coupling to the agent system and direct integration points.

## Core Package vs Plugin Distinction

### Core Packages
- **Location**: `packages/` (will become `core/` in future)
- **Coupling**: Tight integration with agent system
- **Import Pattern**: Direct imports, workspace dependencies
- **Status**: Elevated privileges, core system access
- **Purpose**: System infrastructure and universal capabilities
- **Examples**: memory, debug, commands, validation

### Plugins
- **Location**: `plugins/@lev-os/`
- **Coupling**: Loose coupling via MCP/event system
- **Import Pattern**: Optional loading, graceful degradation
- **Status**: Sandboxed, permission-based
- **Purpose**: Optional features and community extensions

## Core Package Structure

```
packages/{package-name}/
├── package.yaml                 # Core package manifest (replaces plugin.yaml)
├── package.json                 # NPM package configuration
├── src/
│   ├── index.js                # Main entry point
│   ├── core-integration.js     # Agent system integration hooks
│   └── mcp-adapter.js          # Selective MCP tool exposure
├── docs/
│   ├── README.md               # Package-specific documentation
│   └── adr/                    # Architecture decision records
├── tests/
└── examples/
```

## Package.yaml Schema

Core packages use `package.yaml` (not `plugin.yaml`) with standardized schema:

```yaml
package:
  name: "{package-name}"
  version: "1.0.0"
  type: core_package
  namespace: "{namespace}"
  description: "Brief description"

integration:
  agent_coupling: tight           # tight | loose
  core_initializer: required      # required | optional
  tool_exposure: selective        # selective | full | none
  universal_context: true         # Access to universal context system
  adapters: [mcp, cli]            # Available through multiple adapters

architecture:
  layers: []                     # System architecture layers
  backends: []                   # Supported backends
  capabilities: []               # Core capabilities provided

core_hooks:
  - initialization              # Integration points with agent system
  - mcp_registration
  - context_attachment

namespace:
  prefix: "{namespace}:"         # MCP tool prefix
  isolation: agent              # agent | session | shared
  permissions: []               # Cross-namespace access
```

## Development Standards

### 1. Namespace Architecture
- All MCP tools prefixed with namespace (e.g., `memory:store`)
- Agent-level isolation: `agent-{id}:{namespace}:{action}`
- Session scoping: `session-{id}:{namespace}:working`
- Shared resources: `shared:{namespace}:semantic`

### 2. Integration Patterns
Core packages integrate through defined hooks:

```javascript
// Core Initializer Integration
export class CorePackage {
  static async initialize(coreContext) {
    // Initialize with agent context
    const packageInstance = new CorePackage({
      agentId: coreContext.agentId,
      sessionId: coreContext.sessionId,
      universalContext: coreContext.universalContext
    });
    
    return packageInstance;
  }
  
  // Universal Command Registry Tools (selective exposure)
  getTools() {
    return [
      `${this.namespace}:primary_action`,
      `${this.namespace}:query`,
      `${this.namespace}:status`
    ];
  }
  
  // Available through multiple adapters: MCP, CLI, HTTP, gRPC
  getAdapterConfig() {
    return {
      mcp: { enabled: true, tools: this.getTools() },
      cli: { enabled: true, prefix: this.namespace },
      http: { enabled: false },
      grpc: { enabled: false }
    };
  }
}
```

### 3. Configuration System
Core packages should provide auto-configuration:
- Environment detection
- Graceful fallbacks
- Service orchestration
- Health monitoring

### 4. Documentation Requirements
- **README.md**: Package overview and usage
- **ADR docs**: Architecture decisions and integration strategies
- **Examples**: Working integration examples
- **Tests**: Comprehensive test coverage

## Migration from Plugin

When migrating from plugin to core package:

1. **Rename**: `plugin.yaml` → `package.yaml`
2. **Update schema**: Use core package format
3. **Add integration**: Implement core hooks
4. **Selective MCP**: Reduce tool exposure
5. **Document**: Create/update ADRs

### Migration Checklist
- [ ] Convert plugin.yaml to package.yaml
- [ ] Implement core integration hooks
- [ ] Define namespace and isolation strategy
- [ ] Reduce MCP tool exposure (5-8 essential tools max)
- [ ] Add agent/session context injection
- [ ] Create ADR documenting integration strategy
- [ ] Update tests for core package patterns
- [ ] Add examples showing integration

## Best Practices

### Tool Exposure
- **Minimize tools**: Expose only 5-8 essential operations across all adapters
- **Use namespaces**: Prefix all tools with package namespace
- **Multi-adapter support**: Available through MCP, CLI, HTTP, gRPC as configured
- **Batch operations**: Combine related actions into single tools
- **Auto-context**: Inject agent/session context automatically

### Error Handling
- **Graceful degradation**: Function with reduced capability if dependencies unavailable
- **Clear error messages**: Provide actionable error information
- **Health checks**: Implement status monitoring
- **Fallback modes**: Alternative operation modes for different environments

### Performance
- **Lazy loading**: Initialize only when needed
- **Resource cleanup**: Proper disposal of resources
- **Caching**: Intelligent caching strategies
- **Monitoring**: Performance metrics and optimization

## Core Package Registry

Current core packages:
- **memory**: Hybrid memory system with Neo4j auto-detection
- **debug**: Universal debugging and tracing (planned)
- **commands**: Process management and git integration (planned)
- **validation**: Input validation and sanitization (planned)

## Future Considerations

As the ecosystem evolves:
- `packages/` directory will become `core/`
- Core packages may gain additional privileges
- Integration patterns will be refined
- Standardization will be enforced

For questions or contributions to core package standards, see the ADR documentation in individual packages.