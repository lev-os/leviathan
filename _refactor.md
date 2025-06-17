# Leviathan Hexagonal Architecture Refactor Plan

## Design Principles
- **Extensibility First:** Core provides JS SDK, CLI, MCP, API out of the box
- **Plugin Integration:** Plugins extend core adapters, don't create new ones
- **Clean Separation:** Business logic independent of presentation layers
- **Well-Structured Core:** Clear module boundaries and responsibilities

## Target Architecture

### Core SDK Structure
```
src/
├── core/                  # Pure business logic (JS SDK)
│   ├── agents/
│   │   ├── agent-manager.js      # loadAgent(), switchAgent(), listAgents()
│   │   ├── context-loader.js     # loadContext(), parseYAML(), cacheContext()
│   │   └── endpoint-router.js    # routeToEndpoint(), parseNotation()
│   ├── sessions/
│   │   ├── session-manager.js    # createSession(), loadSession()
│   │   ├── checkpoint-core.js    # createCheckpoint(), resumeSession()
│   │   └── memory-manager.js     # storeMemory(), retrieveContext()
│   ├── discovery/
│   │   ├── context-search.js     # findContexts(), scoreMatch()
│   │   ├── semantic-matcher.js   # semanticScore(), fuzzyMatch()
│   │   └── type-router.js        # filterByType(), routeContext()
│   └── plugins/
│       ├── plugin-loader.js      # loadPlugin(), registerCapabilities()
│       ├── plugin-registry.js    # discoverPlugins(), validatePlugin()
│       └── extension-manager.js  # extendAdapter(), registerCommands()
├── adapters/             # Presentation layers (extensible by plugins)
│   ├── cli/
│   │   ├── cli-adapter.js        # Main CLI entry point
│   │   ├── routers/
│   │   │   ├── find-router.js    # Handle find commands
│   │   │   ├── checkpoint-router.js  # Handle checkpoint commands (fix --session)
│   │   │   └── agent-router.js   # Handle agent commands
│   │   ├── formatters/
│   │   │   ├── claude-formatter.js   # LLM whisper mode
│   │   │   ├── json-formatter.js     # Structured output
│   │   │   └── full-formatter.js     # Detailed output
│   │   └── command-registry.js   # Extensible command registration
│   ├── mcp/
│   │   ├── mcp-adapter.js        # MCP server implementation
│   │   ├── tool-mapper.js        # Map core functions to MCP tools
│   │   └── tool-registry.js      # Extensible tool registration
│   ├── api/              # Future REST/GraphQL API
│   │   ├── api-adapter.js        # HTTP server implementation
│   │   ├── routes/               # API route handlers
│   │   └── middleware/           # Auth, validation, etc.
│   └── shared/
│       ├── adapter-base.js       # Common adapter functionality
│       └── extension-points.js   # Plugin extension interfaces
└── shared/               # Common utilities
    ├── config/
    ├── utils/
    └── types/
```

## Core Functions (Direct Function Calls)

### Agent Management
```javascript
// src/core/agents/agent-manager.js
export async function loadAgent(name, endpoint = 'default') {
  // Pure business logic for agent loading
}

export async function listAgents(type = null) {
  // Agent discovery without CLI concerns
}

export async function switchAgent(currentAgent, targetAgent, endpoint) {
  // Agent switching logic
}
```

### Context Discovery
```javascript
// src/core/discovery/context-search.js
export async function findContexts(query, options = {}) {
  // Universal context search logic
}

export async function scoreContext(context, query) {
  // Semantic matching and confidence scoring
}
```

### Session Management (Fix God Object)
```javascript
// src/core/sessions/session-manager.js - Split from 3,542 lines
export async function createSession(context, workspace) {
  // Session creation logic
}

// src/core/sessions/checkpoint-core.js
export async function createCheckpoint(context, files, mode, sessionId = null) {
  // Checkpoint creation with --session support
}

export async function resumeSession(sessionId) {
  // Session restoration logic
}
```

## Adapter Integration (Plugin Extension Points)

### CLI Adapter Extension
```javascript
// src/adapters/cli/command-registry.js
export class CommandRegistry {
  registerCommand(name, handler, plugin = null) {
    // Plugins can register new CLI commands
  }
  
  extendRouter(routerName, extensions) {
    // Plugins can extend existing routers
  }
}
```

### MCP Adapter Extension
```javascript
// src/adapters/mcp/tool-registry.js
export class ToolRegistry {
  registerTool(name, schema, handler, plugin = null) {
    // Plugins can register new MCP tools
  }
  
  extendToolMapping(coreFunction, mcpWrapper) {
    // Plugins can wrap core functions for MCP
  }
}
```

## Plugin Architecture (Simplified)

### Workshop Plugin Structure
```
plugins/@lev/workshop/
├── src/
│   ├── core/                    # Workshop business logic
│   │   ├── tool-discovery.js    # findWorkshopTools(), classifyTool()
│   │   ├── intake-processor.js  # processRepo(), generateAssessment()
│   │   └── automation.js        # automate current manual processes
│   ├── commands/               # CLI command extensions
│   │   ├── workshop-discover.js # lev workshop:discover
│   │   ├── workshop-intake.js   # lev workshop:intake <repo>
│   │   └── workshop-classify.js # lev workshop:classify <tool>
│   ├── tools/                  # MCP tool extensions
│   │   ├── workshop-scan.js     # MCP tool for workshop scanning
│   │   └── tool-assessment.js   # MCP tool for assessment
│   └── contexts/               # Fractal context structure
│       ├── workflows/
│       ├── agents/
│       └── patterns/
├── config/
│   └── plugin.yaml
└── package.json
```

### Plugin Registration Pattern
```javascript
// plugins/@lev/workshop/src/index.js
export function registerPlugin(coreAPI) {
  // Register CLI commands
  coreAPI.cli.registerCommand('workshop:discover', workshopDiscoverHandler);
  coreAPI.cli.registerCommand('workshop:intake', workshopIntakeHandler);
  
  // Register MCP tools  
  coreAPI.mcp.registerTool('workshop_scan', workshopScanSchema, workshopScanHandler);
  
  // Extend core discovery with workshop-specific logic
  coreAPI.discovery.extendSearch('workshop-tools', workshopToolMatcher);
}
```

## Migration Strategy

### Phase 1: Core Extraction (2 days)
1. **Extract Core Functions:**
   - Split session-manager.js god object (3,542 lines) into focused modules
   - Extract agent-manager.js from hybrid-router.js
   - Extract context-search.js from claude-code-adapter.js
   - Create checkpoint-core.js with --session parsing fix

2. **Create Plugin System:**
   - Build plugin-loader.js for auto-discovery
   - Create extension-manager.js for adapter extension points
   - Update existing @lev-os plugins to use new system

### Phase 2: Adapter Refactor (2 days)
1. **CLI Adapter:**
   - Extract CLI logic from hybrid-router.js into clean CLI adapter
   - Create extensible command registry for plugin commands
   - Implement sub-routers with extension points
   - Fix checkpoint --session functionality in CLI layer

2. **MCP Adapter:**
   - Extract MCP server from src/index.js (1,238 lines) into focused adapter
   - Create extensible tool registry for plugin tools
   - Map core functions to MCP tools without business logic duplication

### Phase 3: Workshop Plugin (1 day)
1. **Core Workshop Logic:**
   - Auto-discovery of workshop directories (170+ tools)
   - Automation of intake/assessment process from ~/c/workflows/external-tools-research
   - 8-tier semantic classification system

2. **CLI/MCP Extensions:**
   - Register workshop commands in CLI adapter
   - Register workshop tools in MCP adapter
   - Demonstrate clean plugin extension pattern

## Critical Fixes Integration
- **Checkpoint --session:** Fixed in checkpoint-core.js with proper session ID parsing
- **God Object Split:** session-manager.js split into session-manager, checkpoint-core, memory-manager
- **Personal Paths:** Make configurable via environment variables
- **Test Compatibility:** Ensure all existing tests pass with new structure

## Benefits
- **Out-of-Box Value:** JS SDK + CLI + MCP + API exposure included
- **Plugin Extensibility:** Clean extension points for community plugins  
- **Maintainable:** Clear separation of concerns, smaller focused modules
- **Testable:** Pure core functions easily unit tested
- **Workshop Automation:** Eliminates manual guidance for workshop discovery

## Backward Compatibility
- All existing commands work: `lev find`, `lev checkpoint`, etc.
- Existing @lev-os plugins continue working with adapter
- MCP tools maintain same interface for external consumers
- Plugin migration path provided for enhanced capabilities