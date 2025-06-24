# Hexagonal Architecture & IDE Integration Patterns

## Overview

In the Leviathan agent system, IDEs and agentic platforms like Claude Code, Cursor, and VSCode are **driver adapters** that interact with our hexagonal core through various protocols.

## Architecture Terminology

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     DRIVER ADAPTERS                         │
│  (IDEs & Agentic Platforms - They DRIVE the system)        │
├─────────────────────────────────────────────────────────────┤
│  Claude Code │ Cursor │ VSCode │ Cline │ Roo │ Augment    │
│     ↓            ↓        ↓        ↓      ↓       ↓        │
│  [Composite]  [Direct]  [Direct] [MCP]  [MCP]   [MCP]      │
│     ↓            ↓        ↓        ↓      ↓       ↓        │
├─────────────────────────────────────────────────────────────┤
│                    DRIVER PORTS (APIs)                      │
│              CLI Port    |    MCP Port                      │
└──────────────────┬──────────────┬──────────────────────────┘
                   │              │
          ┌────────▼──────────────▼────────┐
          │      HEXAGON (Core Logic)      │
          │   agent/src/commands/*.js      │
          │  Pure Business Logic Only      │
          └────────┬──────────────┬────────┘
                   │              │
┌──────────────────▼──────────────▼──────────────────────────┐
│                 DRIVEN PORTS (SPIs)                         │
│          FileSystem    |    Database                        │
├─────────────────────────────────────────────────────────────┤
│                  DRIVEN ADAPTERS                            │
│  (The system DRIVES these external resources)              │
├─────────────────────────────────────────────────────────────┤
│   Qdrant  │  Neo4j  │  FileSystem  │  APIs  │  Services   │
└─────────────────────────────────────────────────────────────┘
```

### Adapter Types

#### Primary/Driver Adapters (Inbound)

These **drive** the application by initiating interactions:

- **Direct Adapters**: Cursor, VSCode extensions that directly call our commands
- **Protocol Adapters**: MCP servers that translate protocol calls to our commands
- **Composite/Meta-Adapters**: Claude Code using MCP to communicate (adapter using adapter)

#### Secondary/Driven Adapters (Outbound)

The application **drives** these to perform operations:

- Database adapters (Qdrant, Neo4j)
- File system adapters
- External API adapters

### Composite Adapter Pattern

When Claude Code uses MCP to interact with our agent:

```
Claude Code → MCP Client → MCP Protocol → MCP Server → Agent Core
    ↑             ↑            ↑             ↑            ↑
Composite    Delegated    Transport    Protocol      Business
Adapter      Adapter      Layer       Adapter        Logic
```

This creates an **adapter chain** where:

- **Composite Adapter**: Orchestrates multiple adapters
- **Meta-Adapter**: Higher-level adapter using lower-level ones
- **Adapter Facade**: Simplifies complex adapter interactions

## Integration Patterns

### 1. Direct Integration (Cursor, VSCode)

```javascript
// Direct adapter calls command registry
export class CursorAdapter {
  async executeCommand(commandName, args) {
    // Direct invocation of core logic
    return await this.commandRegistry.execute(commandName, args)
  }
}
```

### 2. Protocol Integration (MCP)

```javascript
// MCP adapter translates protocol to commands
export class MCPAdapter {
  async handleToolCall(toolName, params) {
    // Protocol translation layer
    const commandName = this.toolNameToCommand(toolName)
    const args = this.paramsToArgs(params)

    // Delegate to core
    return await this.commandRegistry.execute(commandName, args)
  }
}
```

### 3. Composite Integration (Claude Code via MCP)

```javascript
// Claude Code acts as composite adapter
class ClaudeCodeIntegration {
  constructor() {
    this.mcpClient = new MCPClient() // Delegated adapter
  }

  async runCommand(userIntent) {
    // High-level orchestration
    const tool = this.selectTool(userIntent)
    const params = this.prepareParams(userIntent)

    // Delegate to MCP
    return await this.mcpClient.callTool(tool, params)
  }
}
```

## IDE-Specific Integration Strategies

### Cursor Integration

Cursor can integrate through:

1. **Cursor Rules** - Provide command awareness and workflow patterns
2. **Direct CLI** - Execute `lev` commands directly
3. **MCP Extension** - If Cursor adds MCP support

### VSCode Integration

Options for VSCode:

1. **Extension with MCP** - Full bidirectional communication
2. **Extension with CLI** - Command palette integration
3. **Tasks/Launch configs** - Quick command execution

### Universal MCP Support

For any IDE with MCP support:

```javascript
// Auto-discovered MCP tools from command registry
{
  "tools": [
    {
      "name": "context_search",
      "description": "Search contexts semantically",
      "inputSchema": { /* auto-generated */ }
    },
    {
      "name": "workflow_run",
      "description": "Execute a workflow",
      "inputSchema": { /* auto-generated */ }
    }
    // ... all commands auto-exposed
  ]
}
```

## Workflow Patterns for IDEs

### Save & Synthesize Pattern

```javascript
// MCP tools for IDE workflow support
export const saveWorkflowTurnTool = {
  name: 'save_workflow_turn',
  description: 'Save analysis/code for later synthesis',
  inputSchema: {
    type: 'object',
    properties: {
      turnNumber: { type: 'number' },
      content: { type: 'string' },
      sessionId: { type: 'string' },
    },
  },
}

export const synthesizeTurnsTool = {
  name: 'synthesize_turns',
  description: 'Synthesize saved turns into insights',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
    },
  },
}
```

### Context Discovery Pattern

```javascript
// Help IDEs discover thinking patterns
export const contextSearchTool = {
  name: 'context_search',
  description: 'Find thinking patterns and workflows',
  examples: ['context_search("decision making")', 'context_search("synthesis")', 'context_search("complex analysis")'],
}
```

## Best Practices

### 1. Maintain Adapter Boundaries

- Adapters should ONLY translate between protocols
- Never put business logic in adapters
- Keep core hexagon independent of adapter details

### 2. Support Multiple Integration Paths

- CLI for simple commands
- MCP for rich bidirectional flows
- Direct API for future web UIs

### 3. Auto-Discovery Over Configuration

- Commands auto-register with all adapters
- Plugins automatically available everywhere
- Zero configuration for new commands

### 4. Consistent Command Surface

```bash
# Same command, multiple access methods
lev context search "synthesis"           # CLI
context_search({"query": "synthesis"})   # MCP
/api/context/search?q=synthesis          # Future API
```

## Implementation Checklist

- [ ] Commands follow hexagonal pattern (pure logic)
- [ ] MCP tools auto-generated from commands
- [ ] CLI and MCP produce identical results
- [ ] Workflow patterns documented for IDEs
- [ ] Session management works across adapters
- [ ] Context discovery is semantic and fast

## See Also

- [Auto-Bootstrap Pattern](./auto-bootstrap-pattern.md) - How adapters auto-discover commands
- [Hybrid Command Architecture](./hybrid-command-architecture.md) - Command routing patterns
- [Core System](./core-system.md) - Core hexagonal implementation details
