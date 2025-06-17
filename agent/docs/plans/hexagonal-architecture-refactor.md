# Hexagonal Architecture Refactor Plan

## Overview

Refactor Leviathan from "MCP Server" to "Operating System/Super Agent Framework" using hexagonal architecture principles. Extract Core SDK from CLI implementation and create clean adapter pattern for multiple interfaces.

## Current State Analysis

### Existing Architecture Issues
- **Monolithic CLI**: Business logic mixed with CLI adapter code
- **MCP-Centric Language**: System described as "MCP Server" rather than core framework
- **Large Files**: command-registry.js becoming unwieldy 
- **Tight Coupling**: Core functionality tied to specific interfaces

### File Structure Analysis
```
src/
├── cli-router.js          # CLI entry point + business logic
├── hybrid-router.js       # Core routing + CLI concerns
├── command-registry.js    # Commands + whisper system
├── session-manager.js     # Session logic + CLI formatting
└── claude-code-adapter.js # Workflow discovery + CLI output
```

**Problem**: Core business logic scattered across CLI-specific files.

## Target Hexagonal Architecture

### Architectural Principles

**Core Domain (Center)**:
- Pure business logic, no external dependencies
- Agent management, context discovery, session handling
- Framework-agnostic, reusable across adapters

**Ports (Interfaces)**:
- Define contracts between core and external world
- Abstract away implementation details
- Enable testing and adapter swapping

**Adapters (External)**:
- CLI, MCP, API, Web UI implementations
- Transform external requests to core operations
- Handle presentation and protocol specifics

### Target Structure

```
src/
├── core/                  # Pure business logic (SDK)
│   ├── agents/
│   │   ├── agent-manager.js      # Agent discovery, loading, switching
│   │   ├── context-loader.js     # YAML context parsing and caching
│   │   └── endpoint-router.js    # Sub-agent routing (. and # notation)
│   ├── sessions/
│   │   ├── session-manager.js    # Session lifecycle, checkpoints
│   │   ├── checkpoint-core.js    # Checkpoint creation and management
│   │   └── memory-manager.js     # Session memory and continuity
│   ├── discovery/
│   │   ├── context-search.js     # Universal context search
│   │   ├── semantic-matcher.js   # Fuzzy matching and scoring
│   │   └── type-router.js        # --type filtering logic
│   └── validation/
│       ├── context-validator.js  # YAML schema validation
│       └── workflow-validator.js # Workflow integrity checks
├── ports/                 # Interface definitions
│   ├── agent-port.js             # IAgentManager interface
│   ├── session-port.js           # ISessionManager interface  
│   ├── discovery-port.js         # IContextDiscovery interface
│   └── output-port.js            # IOutputFormatter interface
├── adapters/             # External interfaces
│   ├── cli/              # Command-line interface
│   │   ├── cli-adapter.js        # Main CLI entry point
│   │   ├── formatters/
│   │   │   ├── claude-formatter.js    # Smart whisper mode
│   │   │   ├── full-formatter.js      # Detailed output mode
│   │   │   └── json-formatter.js      # Structured output
│   │   ├── routers/
│   │   │   ├── find-router.js         # Handle find commands
│   │   │   ├── checkpoint-router.js   # Handle checkpoint commands
│   │   │   └── agent-router.js        # Handle agent commands
│   │   └── parsers/
│   │       ├── arg-parser.js          # CLI argument parsing
│   │       └── notation-parser.js     # A2A notation parsing
│   ├── mcp/              # MCP protocol interface
│   │   ├── mcp-adapter.js        # MCP server implementation
│   │   ├── tool-mapper.js        # Map core functions to MCP tools
│   │   └── schema-generator.js   # Generate MCP tool schemas
│   └── api/              # Future REST/GraphQL API
│       ├── api-adapter.js        # HTTP server implementation
│       ├── routes/               # API route handlers
│       └── middleware/           # Auth, validation, etc.
└── shared/               # Common utilities
    ├── config/
    │   ├── environment.js        # Environment configuration
    │   └── constants.js          # System constants
    ├── utils/
    │   ├── file-utils.js         # File system operations
    │   ├── yaml-utils.js         # YAML parsing utilities
    │   └── logger.js             # Logging utilities
    └── types/
        ├── agent-types.js        # TypeScript definitions
        └── session-types.js      # Session type definitions
```

## Language and Terminology Updates

### Current → Target Terminology

| Current | Target | Rationale |
|---------|--------|-----------|
| "MCP Server" | "Operating System" / "Super Agent Framework" | Reflects true architectural purpose |
| "MCP Tools" | "Framework APIs" / "Core Capabilities" | MCP is just one adapter |
| "Tool Registration" | "Capability Registration" | More generic, adapter-agnostic |
| "MCP Session" | "Framework Session" | Sessions exist independent of MCP |

### File Naming Updates
- `start-mcp-hot.js` → `start-dev-server.js`
- `test-simple-mcp.js` → `test-core-framework.js`
- MCP-specific references in documentation

## Core SDK Extraction

### Phase 1: Core Domain Extraction

**Agent Management Core**:
```javascript
// src/core/agents/agent-manager.js
export class AgentManager {
  async loadAgent(name, endpoint = 'default') {
    // Pure business logic for agent loading
  }
  
  async listAgents(type = null) {
    // Agent discovery without CLI concerns
  }
  
  async switchAgent(currentAgent, targetAgent, endpoint) {
    // Agent switching logic
  }
}
```

**Context Discovery Core**:
```javascript
// src/core/discovery/context-search.js
export class ContextSearch {
  async findContexts(query, options = {}) {
    // Universal context search logic
  }
  
  async scoreContext(context, query) {
    // Semantic matching and confidence scoring
  }
}
```

**Session Management Core**:
```javascript
// src/core/sessions/session-manager.js
export class SessionManager {
  async createCheckpoint(context, files, mode) {
    // Session checkpoint creation
  }
  
  async resumeSession(sessionId) {
    // Session restoration logic
  }
}
```

### Phase 2: Port Definitions

**Agent Port Interface**:
```javascript
// src/ports/agent-port.js
export interface IAgentManager {
  loadAgent(name: string, endpoint?: string): Promise<AgentContext>;
  listAgents(type?: string): Promise<AgentSummary[]>;
  switchAgent(current: string, target: string, endpoint?: string): Promise<SwitchResult>;
}
```

**Output Port Interface**:
```javascript
// src/ports/output-port.js
export interface IOutputFormatter {
  formatAgentSwitch(agent: AgentContext, mode: WhisperMode): string;
  formatContextList(contexts: ContextSummary[]): string;
  formatCheckpoint(checkpoint: CheckpointData): string;
}
```

### Phase 3: CLI Adapter Implementation

**CLI Adapter Entry Point**:
```javascript
// src/adapters/cli/cli-adapter.js
import { AgentManager } from '../../core/agents/agent-manager.js';
import { SessionManager } from '../../core/sessions/session-manager.js';
import { ClaudeFormatter } from './formatters/claude-formatter.js';

export class CLIAdapter {
  constructor() {
    this.agentManager = new AgentManager();
    this.sessionManager = new SessionManager();
    this.formatter = new ClaudeFormatter();
  }
  
  async handleCommand(args) {
    // Parse CLI args and delegate to core
  }
}
```

**Whisper Mode Formatters**:
```javascript
// src/adapters/cli/formatters/claude-formatter.js
export class ClaudeFormatter {
  formatAgentSwitch(agent, endpoint) {
    return `🤖 AGENT: ${agent.name} (${agent.personality})
📋 MODE: ${endpoint} (${agent.endpoints[endpoint].description})

${agent.endpoints[endpoint].prompt}

AVAILABLE MODES: ${Object.keys(agent.endpoints).join(', ')}
TO SWITCH: Natural language or lev find ${agent.id}.{mode}`;
  }
}
```

## Sub-Router Implementation

### Current Router Consolidation

**Problem**: Single command-registry.js file handling all commands
**Solution**: Specialized routers for command families

### Find Router
```javascript
// src/adapters/cli/routers/find-router.js
export class FindRouter {
  constructor(contextSearch, agentManager, outputFormatter) {
    this.contextSearch = contextSearch;
    this.agentManager = agentManager;
    this.formatter = outputFormatter;
  }
  
  async route(args) {
    const { query, type, whisperMode } = this.parseArgs(args);
    
    // Handle agent.endpoint notation
    if (this.isAgentEndpoint(query)) {
      return this.handleAgentEndpoint(query, whisperMode);
    }
    
    // Handle type filtering
    if (type) {
      return this.handleTypedSearch(query, type, whisperMode);
    }
    
    // Handle universal search
    return this.handleUniversalSearch(query, whisperMode);
  }
  
  parseAgentEndpoint(input) {
    // Support both . and # notation
    if (input.includes('.')) {
      const [agent, endpoint] = input.split('.');
      return { agent, endpoint, notation: 'dot' };
    }
    if (input.includes('#')) {
      const [agent, endpoint] = input.split('#');
      return { agent, endpoint, notation: 'hash' };
    }
    return null;
  }
}
```

### Agent Router
```javascript
// src/adapters/cli/routers/agent-router.js
export class AgentRouter {
  async loadAgent(name, endpoint, whisperMode) {
    const agent = await this.agentManager.loadAgent(name, endpoint);
    return this.formatter.formatAgentSwitch(agent, whisperMode);
  }
  
  async listAgents(type, whisperMode) {
    const agents = await this.agentManager.listAgents(type);
    return this.formatter.formatAgentList(agents, whisperMode);
  }
}
```

### Checkpoint Router
```javascript
// src/adapters/cli/routers/checkpoint-router.js
export class CheckpointRouter {
  async handleCheckpoint(args) {
    const { mode, context, files } = this.parseCheckpointArgs(args);
    
    switch (mode) {
      case 'resume':
        return this.handleResume(context);
      case 'new':
        return this.handleNew(context, files);
      case 'final':
        return this.handleFinal(context, files);
      default:
        return this.handleProgress(context, files);
    }
  }
}
```

## MCP Adapter Transformation

### Current MCP Implementation Issues
- Core logic mixed with MCP protocol details
- MCP-specific naming throughout codebase
- Tight coupling to MCP tool schemas

### Target MCP Adapter
```javascript
// src/adapters/mcp/mcp-adapter.js
import { AgentManager } from '../../core/agents/agent-manager.js';
import { ContextSearch } from '../../core/discovery/context-search.js';

export class MCPAdapter {
  constructor() {
    this.agentManager = new AgentManager();
    this.contextSearch = new ContextSearch();
  }
  
  // Map core capabilities to MCP tools
  async handleExecuteWorkflow(params) {
    const result = await this.contextSearch.findContexts(params.query);
    return this.formatMCPResponse(result);
  }
  
  async handleLoadAgent(params) {
    const agent = await this.agentManager.loadAgent(params.name, params.endpoint);
    return this.formatMCPResponse(agent);
  }
}
```

## Migration Strategy

### Phase 1: Core Extraction (Week 1)
1. Create core directory structure
2. Extract AgentManager from existing code
3. Extract ContextSearch from hybrid-router.js
4. Extract SessionManager from session-manager.js
5. Create basic port interfaces

### Phase 2: CLI Adapter (Week 2)
1. Create CLI adapter structure
2. Implement sub-routers (find, agent, checkpoint)
3. Create whisper mode formatters
4. Migrate existing CLI functionality

### Phase 3: MCP Adapter Refactor (Week 3)
1. Extract MCP-specific code to adapter
2. Update tool mappings to use core functions
3. Remove MCP references from core
4. Update terminology throughout

### Phase 4: Testing & Documentation (Week 4)
1. Update all tests to use new structure
2. Create adapter-specific test suites
3. Update documentation and terminology
4. Performance testing and optimization

## Testing Strategy

### Core SDK Testing
```javascript
// Pure unit tests, no external dependencies
describe('AgentManager', () => {
  it('should load agent with specified endpoint', async () => {
    const manager = new AgentManager();
    const result = await manager.loadAgent('doc-shepherd', 'analyze');
    expect(result.name).toBe('Documentation Shepherd');
    expect(result.currentEndpoint).toBe('analyze');
  });
});
```

### Adapter Testing
```javascript
// Integration tests with mocked core
describe('CLIAdapter', () => {
  it('should format agent switch for Claude mode', async () => {
    const adapter = new CLIAdapter();
    const result = await adapter.handleCommand(['find', 'doc-shepherd.analyze']);
    expect(result).toContain('🤖 AGENT: Documentation Shepherd');
  });
});
```

### E2E Testing
```javascript
// Test actual CLI usage
describe('E2E CLI', () => {
  it('should execute full agent switching workflow', async () => {
    const output = await exec('lev find doc-shepherd.analyze --whisper=claude');
    expect(output).toContain('Documentation Shepherd');
    expect(output).toContain('analyze mode');
  });
});
```

## Success Metrics

### Architecture Quality
- **Separation of Concerns**: Core logic independent of adapters
- **Testability**: Easy to test core without external dependencies
- **Maintainability**: Clear module boundaries and responsibilities
- **Extensibility**: Easy to add new adapters (API, Web UI)

### Performance
- **Startup Time**: No regression in CLI startup time
- **Memory Usage**: Efficient core SDK memory footprint
- **Response Time**: Fast context search and agent loading

### Developer Experience
- **Code Organization**: Clear file structure and naming
- **Documentation**: Updated architecture documentation
- **Testing**: Comprehensive test coverage across layers
- **Debugging**: Clear error messages and debugging paths

## Risk Mitigation

### Technical Risks
- **Breaking Changes**: Maintain backward compatibility during migration
- **Performance Regression**: Benchmark before/after refactor
- **Test Coverage**: Ensure no functionality is lost during extraction

### Migration Risks
- **Large Refactor**: Break into small, incremental changes
- **Multiple Contributors**: Clear migration guidelines and coordination
- **Documentation Drift**: Update docs alongside code changes

## Future Benefits

### Adapter Ecosystem
- **API Adapter**: REST/GraphQL server for web integration
- **Web UI Adapter**: Browser-based agent management
- **Integration Adapters**: Slack, Discord, Teams bots
- **Mobile Adapters**: Native mobile app integration

### Core SDK Reusability
- **Multiple Products**: Reuse core across different products
- **Third-Party Integration**: Allow others to build on Leviathan core
- **Language Bindings**: Potential for Python, Go, Rust adapters
- **Cloud Deployment**: Easy containerization and scaling