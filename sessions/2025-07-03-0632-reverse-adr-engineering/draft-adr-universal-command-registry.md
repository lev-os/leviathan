# ADR-XXX: Universal Command Registry Pattern

## Status
DRAFT - Reverse Engineered from existing implementation

## Context
The Leviathan agent system needed a way to expose the same commands across multiple interfaces (CLI, MCP protocol, future adapters) without duplicating code. The traditional approach would require implementing each command multiple times for each interface, leading to maintenance burden and inconsistency.

## Decision
Implement a Universal Command Registry that serves as the single source of truth for all commands. Commands are registered once and automatically exposed through all adapters via an auto-bootstrap pattern.

## Architecture

### Core Pattern
```javascript
// Single command definition
registry.register('get_workflow', handler, {
  description: 'Semantic workflow lookup',
  args: ['query', 'options']
});

// Auto-exposed via all adapters:
// CLI: lev get-workflow "query"
// MCP: mcp__leviathan__get_workflow tool
// Future: Any new adapter automatically gets this command
```

### Key Components

1. **CommandRegistry** (`agent/src/core/command-registry.js`)
   - Central registration point for all commands
   - Maintains command metadata (description, args, namespace)
   - Provides execution interface

2. **Adapter Pattern**
   - Each adapter (CLI, MCP) translates its protocol to registry calls
   - Adapters don't contain command logic, only protocol translation
   - New adapters automatically get all registered commands
## Consequences

### Positive
- **DRY Principle**: Command logic written once, used everywhere
- **Consistency**: Same command behavior across all interfaces
- **Extensibility**: New adapters get all commands for free
- **Maintainability**: Single place to update command logic
- **Discovery**: Commands self-document through registry metadata

### Negative
- **Abstraction Layer**: Additional indirection between interface and implementation
- **Protocol Limitations**: Some adapters may have constraints (e.g., MCP tool naming)
- **Testing Complexity**: Need to test both registry and adapter layers

## Implementation Details

### Auto-Bootstrap Flow
1. Commands register themselves with the registry on startup
2. Adapters query the registry for available commands
3. Adapters transform commands to their protocol format
4. Runtime execution routes through registry.execute()

### Example: MCP Adapter
```javascript
// MCP adapter auto-converts registry commands to MCP tools
const commands = await registry.getAllCommands();
commands.forEach(cmd => {
  // Transform to MCP tool format
  const tool = {
    name: `mcp__leviathan__${cmd.name}`,
    description: cmd.description,
    inputSchema: buildSchemaFromArgs(cmd.args)
  };
  server.addTool(tool);
});
```

## Related Patterns
- Plugin Architecture (commands can be added by plugins)
- Adapter Pattern (protocol translation layer)
- Service Registry Pattern (central service discovery)