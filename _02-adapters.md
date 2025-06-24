# Adapter Auto-Bootstrap Architecture

## Core Concept: Universal Command Registry

The Leviathan system uses a **universal command registry** as the single source of truth for all commands across all adapters. Instead of manually defining commands for each adapter, all adapters auto-bootstrap from the command registry.

## Architecture Pattern

### Command Registry as Central Hub

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Core Commands │     │ Plugin Commands │     │ Future Commands │
│   (checkpoint)  │     │  (workshop:*)   │     │    (api:*)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │ Command Registry│
                         │ (Single Source) │
                         └───────┬────────┘
                                 │
         ┌───────────────────────┼─────────────────────────┐
         │                       │                         │
    ┌────▼─────┐         ┌───────▼────────┐        ┌──────▼──────┐
    │CLI Adapter│         │ MCP Adapter    │        │Future Adapters│
    │(bin/lev) │         │(Auto-Bootstrap)│        │ (API, Web)  │
    └──────────┘         └────────────────┘        └─────────────┘
```

### Auto-Bootstrap Implementation

**Command Registry (Core)**

```javascript
// src/adapters/cli/command-registry.js
export class CommandRegistry {
  constructor() {
    this.commands = new Map()
  }

  register(name, handler, options = {}) {
    this.commands.set(name, {
      name,
      handler,
      description: options.description,
      args: options.args,
      namespace: options.namespace,
      plugin: options.plugin,
    })
  }

  async getAllCommands() {
    return Array.from(this.commands.values())
  }

  async execute(name, args) {
    const command = this.commands.get(name)
    if (!command) throw new Error(`Command not found: ${name}`)
    return await command.handler(args)
  }
}
```

**MCP Auto-Bootstrap Adapter**

```javascript
// src/adapters/mcp/mcp-adapter.js
import { CommandRegistry } from '../cli/command-registry.js'

export class MCPAdapter {
  constructor() {
    this.commandRegistry = new CommandRegistry()
    this.mcpTools = []
  }

  async initialize() {
    // Auto-discover all registered commands (core + plugins)
    const commands = await this.commandRegistry.getAllCommands()

    // Auto-generate MCP tools from CLI commands
    this.mcpTools = commands.map((cmd) => ({
      name: this.formatMCPToolName(cmd.name),
      description: cmd.description,
      inputSchema: this.generateMCPSchema(cmd.args),
    }))

    console.log(`Auto-bootstrapped ${this.mcpTools.length} MCP tools from command registry`)
  }

  formatMCPToolName(commandName) {
    // workshop:discover -> workshop_discover
    // checkpoint -> checkpoint
    return commandName.replace(':', '_')
  }

  async handleToolCall(toolName, args) {
    // Route MCP tool calls back through command registry
    const commandName = toolName.replace('_', ':')
    return await this.commandRegistry.execute(commandName, args)
  }

  generateMCPSchema(commandArgs) {
    // Auto-generate JSON schema from command argument definitions
    return {
      type: 'object',
      properties:
        commandArgs?.reduce((props, arg) => {
          props[arg.name] = {
            type: arg.type || 'string',
            description: arg.description,
          }
          return props
        }, {}) || {},
    }
  }
}
```

## Plugin Auto-Discovery

### Plugin Registration Pattern

```javascript
// plugins/@lev-os/workshop/src/index.js
export class WorkshopPlugin {
  async register(commandRegistry) {
    // Register all workshop commands
    commandRegistry.register('workshop:discover', this.discover.bind(this), {
      description: 'Auto-discover workshop structure and processes',
      namespace: 'workshop',
      plugin: '@lev-os/workshop',
      args: [{ name: 'system', type: 'string', description: 'System to discover' }],
    })

    commandRegistry.register('workshop:intake', this.intake.bind(this), {
      description: 'Run complete assessment pipeline',
      namespace: 'workshop',
      plugin: '@lev-os/workshop',
      args: [{ name: 'repo', type: 'string', description: 'Repository URL' }],
    })
  }

  async discover(args) {
    // Workshop discovery implementation
  }

  async intake(args) {
    // Workshop intake implementation
  }
}
```

### Automatic Plugin Loading

```javascript
// src/adapters/cli/cli-adapter.js
export class CLIAdapter {
  async initializePlugins() {
    const plugins = await this.discoverPlugins()

    for (const plugin of plugins) {
      // Each plugin registers its commands with the registry
      await plugin.register(this.commandRegistry)
    }

    console.log(`Loaded ${plugins.length} plugins with commands`)
  }
}
```

## Adapter Patterns in Hexagonal Architecture

### Composite Adapter Pattern

When IDEs or agentic platforms use other adapters to communicate:

```
Claude Code → MCP Client → MCP Protocol → MCP Server → Agent Core
    ↑             ↑            ↑             ↑            ↑
Composite    Delegated    Transport    Protocol      Business
Adapter      Adapter      Layer       Adapter        Logic
```

**Examples of Composite Adapters:**

- Claude Code using MCP to communicate with agent
- VSCode extension using CLI commands internally
- Future web UI using REST API that internally calls MCP

### Multi-Adapter Benefits

### DRY Principle

- **Single Definition**: Commands defined once in registry, exposed via all adapters
- **No Duplication**: CLI args, MCP schemas, API specs all generated from same source
- **Plugin Simplicity**: Plugin authors write commands once, get all protocols

### Dynamic Discovery

- **Real-Time Updates**: MCP tools list updates when plugins are installed
- **No Restart Required**: New plugin commands available immediately
- **Auto-Documentation**: Help, schemas, and docs generated automatically

### Unified Command Surface

```bash
# Same command, multiple interfaces:
lev workshop:discover --system automation          # CLI
workshop_discover {"system": "automation"}         # MCP
POST /commands/workshop:discover {"system": "..."}  # Future API
```

## Implementation Benefits

### For Core System

- **Maintainability**: Single source of truth for all commands
- **Extensibility**: Easy to add new adapters (REST API, GraphQL, gRPC)
- **Consistency**: All adapters behave identically for same commands

### For Plugin Developers

- **Simple Registration**: Register with CLI, get MCP + future adapters free
- **Protocol Agnostic**: Don't need to understand MCP, API specs, etc.
- **Instant Compatibility**: Commands immediately work with Claude Code

### For Users

- **Consistent Experience**: Same commands work via CLI and Claude Code
- **Plugin Discovery**: All plugin commands automatically available
- **No Mental Model Switches**: Same syntax across all interfaces

## Technical Implementation

### Phase 1: Extract Command Registry

- Move command registration logic into dedicated registry
- Update CLI adapter to use registry instead of direct handlers
- Ensure all core commands (checkpoint, find, agent) register properly

### Phase 2: MCP Auto-Bootstrap

- Create MCP adapter that imports command registry
- Auto-generate MCP tools from registered commands
- Route MCP calls back through registry.execute()
- Replace manual MCP tool definitions

### Phase 3: Plugin Integration

- Create plugin loading and registration system
- Workshop plugin registers its commands with registry
- Validate plugin commands appear in both CLI and MCP automatically
- Test end-to-end plugin command execution

### Phase 4: Future Adapter Framework

- Create base adapter class for common auto-bootstrap patterns
- Document adapter creation process for community
- Plan REST API, GraphQL, and other protocol adapters

## Success Metrics

1. **Zero Duplication**: No commands defined in multiple places
2. **Automatic Plugin Support**: Plugin commands work via MCP without extra code
3. **Dynamic Discovery**: MCP tools list reflects current command registry
4. **Unified Behavior**: Same command produces consistent results across adapters
5. **Community Ready**: Clear patterns for third-party adapter development

This architecture transforms Leviathan from a monolithic system into a truly extensible framework where the command registry serves as the universal command surface for all interfaces.
