# Core Package Schema Specification

## package.yaml Standard Format

This document defines the standardized schema for core package manifests.

## Schema Structure

### Root Properties

```yaml
package:
  name: string                    # Package name (kebab-case)
  version: string                 # Semantic version (x.y.z)
  type: core_package             # Always 'core_package'
  namespace: string              # Namespace for MCP tools and isolation
  description: string            # Brief package description
  
integration:
  agent_coupling: enum           # tight | loose
  core_initializer: enum         # required | optional  
  mcp_tools: enum               # selective | full | none
  universal_context: boolean    # Access to universal context system
  
architecture:
  layers: array[string]          # System architecture layers
  backends: array[string]        # Supported backends/services
  capabilities: array[string]    # Core capabilities provided
  
core_hooks:
  - string                       # Integration point names
  
namespace:
  prefix: string                 # MCP tool prefix (e.g., "memory:")
  isolation: enum               # agent | session | shared
  permissions: array[string]    # Cross-namespace access permissions
```

## Field Definitions

### package.name
- **Type**: string
- **Required**: Yes
- **Format**: kebab-case
- **Description**: Unique identifier for the core package
- **Example**: `"memory"`, `"debug"`, `"commands"`

### package.version
- **Type**: string  
- **Required**: Yes
- **Format**: Semantic versioning (x.y.z)
- **Description**: Package version following semver
- **Example**: `"1.0.0"`, `"2.1.3"`

### package.type
- **Type**: enum
- **Required**: Yes
- **Values**: `core_package`
- **Description**: Identifies this as a core package (not plugin)

### package.namespace
- **Type**: string
- **Required**: Yes
- **Format**: lowercase, alphanumeric
- **Description**: Namespace for MCP tools and data isolation
- **Example**: `"memory"`, `"debug"`, `"cmd"`

### integration.agent_coupling
- **Type**: enum
- **Required**: Yes
- **Values**: `tight` | `loose`
- **Description**: Level of coupling with agent system
  - `tight`: Direct imports, core system access
  - `loose`: MCP/event-based communication

### integration.core_initializer
- **Type**: enum
- **Required**: Yes
- **Values**: `required` | `optional`
- **Description**: Whether package requires core initializer integration
  - `required`: Must be loaded during core initialization
  - `optional`: Can be loaded on-demand

### integration.mcp_tools
- **Type**: enum
- **Required**: Yes
- **Values**: `selective` | `full` | `none`
- **Description**: MCP tool exposure strategy
  - `selective`: Limited set of essential tools (5-8 max)
  - `full`: All package capabilities as MCP tools
  - `none`: No MCP tool exposure

### integration.universal_context
- **Type**: boolean
- **Required**: Yes
- **Description**: Whether package needs universal context system access
- **Default**: `true` for core packages

### architecture.layers
- **Type**: array[string]
- **Required**: No
- **Description**: System architecture layers the package operates on
- **Examples**: `["fast_access", "persistent_storage"]`

### architecture.backends
- **Type**: array[string]
- **Required**: No
- **Description**: External services or backends the package supports
- **Examples**: `["neo4j", "redis", "file_system"]`

### architecture.capabilities
- **Type**: array[string]
- **Required**: No
- **Description**: Core capabilities provided by the package
- **Examples**: `["memory_storage", "query_retrieval", "auto_detection"]`

### core_hooks
- **Type**: array[string]
- **Required**: Yes
- **Description**: Integration points with the agent system
- **Standard values**:
  - `initialization`: Package initialization hook
  - `mcp_registration`: MCP tool registration
  - `context_attachment`: Universal context integration
  - `session_management`: Session lifecycle hooks

### namespace.prefix
- **Type**: string
- **Required**: Yes
- **Format**: namespace + ":"
- **Description**: Prefix for MCP tools
- **Example**: `"memory:"`, `"debug:"`, `"cmd:"`

### namespace.isolation
- **Type**: enum
- **Required**: Yes
- **Values**: `agent` | `session` | `shared`
- **Description**: Data isolation strategy
  - `agent`: Isolated per agent instance
  - `session`: Isolated per session
  - `shared`: Shared across agents/sessions

### namespace.permissions
- **Type**: array[string]
- **Required**: No
- **Description**: Cross-namespace access permissions
- **Examples**: `["read:shared:semantic", "write:agent:procedural"]`

## Complete Example

```yaml
package:
  name: memory
  version: 1.0.0
  type: core_package
  namespace: memory
  description: "Hybrid memory system with Neo4j auto-detection and configurable backends"

integration:
  agent_coupling: tight
  core_initializer: required
  mcp_tools: selective
  universal_context: true

architecture:
  layers:
    - fast_access
    - medium_access  
    - persistent_storage
  backends:
    - neo4j
    - graphiti
    - file_system
    - redis
  capabilities:
    - memory_storage
    - semantic_retrieval
    - temporal_queries
    - auto_configuration
    - service_orchestration

core_hooks:
  - initialization
  - mcp_registration
  - context_attachment
  - session_management

namespace:
  prefix: "memory:"
  isolation: agent
  permissions:
    - "read:shared:semantic"
    - "write:agent:episodic"
    - "write:session:working"
```

## Validation Rules

1. **Required Fields**: All required fields must be present
2. **Namespace Uniqueness**: Namespace must be unique across all core packages
3. **Version Format**: Must follow semantic versioning
4. **MCP Tool Limits**: If `mcp_tools: selective`, should expose ≤8 tools
5. **Hook Compatibility**: Core hooks must be supported by agent system
6. **Permission Format**: Permissions must follow `action:scope:type` format

## Migration from plugin.yaml

When migrating from plugin.yaml:

1. **Change filename**: `plugin.yaml` → `package.yaml`
2. **Update root key**: `plugin:` → `package:`
3. **Add integration section**: Required for core packages
4. **Update type**: `plugin` → `core_package`
5. **Add core_hooks**: Define integration points
6. **Add namespace section**: Define isolation strategy

## Schema Evolution

This schema will evolve as the core package system matures. Changes will be:
- **Backward compatible** when possible
- **Documented** with migration guides
- **Versioned** with clear upgrade paths

For schema questions or proposals, create an ADR in the relevant package.