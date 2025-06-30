# Auto-Bootstrap Pattern Documentation

## Overview

The Auto-Bootstrap Pattern enables automatic discovery and exposure of commands across multiple interfaces (CLI and MCP) without manual configuration. When a command is added to `src/commands/`, it automatically becomes available through all adapters.

## Architecture Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Add Command   │────▶│ Core Registry   │────▶│  All Adapters   │
│ src/commands/   │     │   Discovery     │     │   Automatic     │
│   foo.js        │     │                 │     │   Exposure      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Implementation Details

### 1. Command Structure

Commands in `src/commands/` must follow this pattern:

```javascript
// src/commands/example.js

// Main command function (required)
export async function example(args, dependencies) {
  const { workflowLoader, debugLogger } = dependencies || {};
  
  // Business logic here
  return {
    success: true,
    data: { /* command results */ },
    format: 'formatted' // or 'json'
  };
}

// Metadata for auto-discovery (required)
example.description = "Example command description";
example.inputSchema = {
  type: 'object',
  properties: {
    param: {
      type: 'string',
      description: 'Parameter description'
    }
  },
  required: ['param']
};

// MCP tool export for auto-discovery (required)
export const exampleTool = {
  name: 'example',
  description: example.description,
  inputSchema: example.inputSchema,
  handler: example
};
```

### 2. Core Command Registry

**Location**: `src/core/command-registry.js`

**Discovery Process**:
1. Scans `src/commands/*.js` files
2. Imports each module
3. Looks for exported functions matching filename
4. Registers command function and MCP tool
5. Stores in maps for runtime access

**Key Methods**:
- `discoverCommands()` - Auto-scan and load all commands
- `executeCommand(name, args)` - Execute command with dependency injection
- `getMCPTools()` - Get all MCP tools for server registration
- `listCommands()` - Get available command names

### 3. CLI Adapter Integration

**Location**: `src/adapters/cli/cli-adapter.js`

**Auto-Bootstrap Logic**:
```javascript
// Check if command is in core command registry (auto-bootstrap)
const coreCommands = this.coreCommandRegistry.listCommands();
if (coreCommands.includes(command)) {
  const result = await this.coreCommandRegistry.executeCommand(command, commandArgs);
  return this.formatCoreCommandResult(result);
}
```

**Flow**:
1. CLI receives unknown command
2. Checks core command registry
3. If found, executes via registry
4. Formats result using Claude formatter
5. Returns formatted response

### 4. MCP Adapter Integration

**Location**: `src/index.js`

**Auto-Discovery Logic**:
```javascript
// List tools handler - includes auto-discovered tools
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  const autoDiscoveredTools = commandRegistry.getMCPTools();
  
  return {
    tools: [
      // Manual tools...
      ...autoDiscoveredTools  // Auto-discovered tools
    ],
  };
});

// Call tool handler - routes to command registry
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Try auto-discovered commands
  const toolName = request.params.name;
  const commandName = toolName.replace(/Tool$/, '').replace(/_/g, '-');
  
  if (commandRegistry.listCommands().includes(commandName)) {
    return await commandRegistry.executeCommand(commandName, request.params.arguments || {});
  }
  
  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
});
```

## Naming Conventions

### File to Command Mapping
- **File**: `workshop.js` → **Command**: `workshop`
- **File**: `context-search.js` → **Command**: `context_search`
- **File**: `session-ping.js` → **Command**: `session_ping`

### Function Naming
- **Primary**: Exact command name (`workshop`, `contextSearch`)
- **Alternative**: camelCase version of command name
- **Fallback**: `default` export

### MCP Tool Naming
- **Pattern**: `{commandName}Tool`
- **Example**: `workshop` → `workshopTool`
- **Example**: `contextSearch` → `contextSearchTool`

## Dependency Injection

Commands receive dependencies via the second parameter:

```javascript
export async function myCommand(args, dependencies) {
  const { 
    workflowLoader,    // Workflow management
    debugLogger,       // Logging interface  
    semanticLookup,    // Semantic search
    ceoBinding,        // Agent binding
    sessionManager,    // Session management
    intelligenceCoordinator  // Cross-workspace intelligence
  } = dependencies || {};
  
  // Use dependencies as needed
}
```

## Benefits

### 1. Zero Configuration
- Add file → Commands automatically work everywhere
- No manual adapter registration needed
- No MCP tool definition required

### 2. Consistent Interface
- Same command works in CLI and MCP
- Consistent error handling
- Uniform dependency injection

### 3. Extensibility
- Community plugins follow same pattern
- Plugin commands auto-discovered
- Maintains architectural boundaries

### 4. Testing
- Commands testable in isolation
- Dependency injection enables mocking
- Both adapters tested through same commands

## Example: Workshop Commands

The workshop command demonstrates the full auto-bootstrap pattern:

### Command Implementation
```bash
# CLI Usage (auto-routed)
lev workshop status
lev workshop list --tier=1
lev workshop info checkpoint-manager

# MCP Usage (auto-exposed)
# Tools: workshop, workshop_status, workshop_list, etc.
```

### Auto-Discovery Results
1. **File**: `src/commands/workshop.js`
2. **CLI Command**: `lev workshop <subcommand>`
3. **MCP Tools**: `workshop`, `workshopStatus`, `workshopList`, etc.
4. **Routing**: Automatic through both adapters
5. **Formatting**: Claude formatter integration

## Community Plugin Development

### Plugin Structure
```
plugins/@namespace/plugin-name/
├── src/
│   └── commands/
│       └── my-command.js     # Follows auto-bootstrap pattern
├── tests/
│   └── integration.test.js   # Tests CLI + MCP integration
└── package.json
```

### Integration Steps
1. **Follow Command Pattern** - Use standard command structure
2. **Register with CLI** - Plugin registration exposes commands
3. **Test Integration** - Validate CLI and MCP functionality
4. **Community Ready** - Plugin works across entire ecosystem

## Troubleshooting

### Command Not Found
1. Check filename matches expected pattern
2. Verify exported function name
3. Ensure MCP tool export exists
4. Check for syntax errors in command file

### MCP Tool Missing
1. Verify `{commandName}Tool` export
2. Check inputSchema definition
3. Ensure tool name follows naming convention

### CLI Routing Failed
1. Verify command registry initialization
2. Check CLI adapter auto-bootstrap logic
3. Validate dependency injection setup

## Advanced Usage

### Custom Formatters
Commands can specify output format preferences:

```javascript
return {
  success: true,
  data: results,
  format: json ? 'json' : 'formatted'  // CLI respects format preference
};
```

### Multiple Subcommands
Commands can implement router patterns:

```javascript
export async function workshop(args, dependencies) {
  const [subcommand, ...subArgs] = args;
  
  switch (subcommand) {
    case 'status': return await workshopStatus(subArgs, dependencies);
    case 'list': return await workshopList(subArgs, dependencies);
    // etc.
  }
}
```

### Error Handling
Consistent error patterns across adapters:

```javascript
if (!requiredParam) {
  throw new Error('Required parameter missing');  // Auto-formatted by adapters
}

return {
  success: false,
  error: 'Specific error message',
  // CLI will format as "❌ Error: Specific error message"
};
```

---

The Auto-Bootstrap Pattern enables the "Linux of AI" extensibility vision by making command development and distribution seamless across the entire Leviathan ecosystem.