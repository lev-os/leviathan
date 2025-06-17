# Go Migration Plan with Hexagonal Architecture

## Updated Go Migration Plan with Hexagonal Architecture

**CURRENT JS SYSTEM (10K LOC)** - Following hex arch refactor plan:
- **Core Domain**: Agent management, context discovery, session handling
- **Ports**: Interface definitions between core and external world  
- **Adapters**: CLI, MCP, future API/Web UI implementations

**GO MIGRATION STRATEGY** - Mirror the hex architecture in Go:

### Phase 1: Go Core Domain (Performance-Critical)
Migrate the **Core SDK** to Go for speed:
```
/os/agent/go-agent/
├── core/                  # Pure business logic (Go SDK)
│   ├── agents/           # Agent discovery, loading, switching  
│   ├── sessions/         # Session lifecycle, checkpoints
│   ├── discovery/        # Context search, semantic matching
│   └── validation/       # Context/workflow validation
├── ports/                # Go interface definitions
│   ├── agent_port.go
│   ├── session_port.go  
│   └── discovery_port.go
└── shared/               # Common utilities
    ├── config/
    ├── utils/
    └── types/
```

### Phase 2: Go CLI Adapter (Speed Target)
Fast replacement for `lev` command:
```
├── adapters/
│   ├── cli/              # Go CLI implementation
│   │   ├── cmd/lev/      # Main CLI entry
│   │   ├── formatters/   # Claude/JSON/Full formatters
│   │   ├── routers/      # Find/Agent/Checkpoint routers
│   │   └── parsers/      # Arg parsing, A2A notation
```

### Phase 3: Keep JS MCP Adapter (For Now)
- Core business logic moves to Go
- JS MCP adapter calls Go core via CGO or subprocess
- Maintains Claude Code compatibility during transition

### Phase 4: Optional Go MCP Adapter
```
├── adapters/
│   └── mcp/              # Future Go MCP server
│       ├── mcp_adapter.go
│       ├── tool_mapper.go
│       └── schema_generator.go
```

**DROP-IN REPLACEMENT STRATEGY:**
1. **Shadow Binary Approach**: Go binary with JS fallback for unimplemented features
2. **Hybrid Execution Model**: Same CLI interface, chooses optimal implementation per command
3. **Incremental Migration**: Replace one command type at a time (find → agents → sessions)
4. **MCP Bridge**: JS MCP server calls Go core via subprocess, maintains Claude Code compatibility
5. **Binary Wrapper**: Smart wrapper chooses Go/JS implementation transparently to users

**FOLDER REORGANIZATION:**
```
/os/agent/
├── semantic-search/      # Keep existing (Python, working)
├── go-agent/            # New Go implementation following hex arch
│   ├── core/            # Go business logic
│   ├── ports/           # Go interfaces  
│   ├── adapters/        # Go CLI (+ future MCP)
│   └── cmd/lev/         # Fast Go CLI binary
├── js-mcp-bridge/       # Temporary JS→Go bridge
└── docs/                # Migration & architecture docs
```

**SUCCESS METRICS:**
- <100ms CLI response (vs current ~500ms JS)
- 10x faster embedding operations
- Maintain all hex arch principles
- Drop-in replacement for `lev` command

## Context from Hexagonal Architecture Refactor Plan

This migration follows the hexagonal architecture refactor plan found in `/digital/leviathan/agent/docs/plans/hexagonal-architecture-refactor.md`.

### Key Principles Applied:
1. **Core Domain**: Pure business logic, no external dependencies
2. **Ports**: Define contracts between core and external world
3. **Adapters**: Transform external requests to core operations

### Migration Benefits:
- **Speed**: Go's performance for embedding operations and CLI responsiveness
- **Architecture**: Clean separation of concerns maintained across languages
- **Compatibility**: Gradual migration path preserving existing functionality
- **Future-Proof**: Easy to add new adapters (API, Web UI) to Go core

### Implementation Priority:
1. Core domain migration (agents, discovery, sessions)
2. CLI adapter for fast `lev` command
3. Bridge for JS MCP compatibility
4. Optional full Go MCP adapter

## Detailed Drop-In Replacement Strategy

### Phase 1: Shadow Binary with Fallback
Create Go binary that shadows JS implementation:
```go
// cmd/lev/main.go - Smart hybrid execution
func main() {
    command := parseArgs(os.Args)
    
    switch command.Type {
    case "find":
        if canHandleInGo(command) {
            // Fast Go implementation (10x speed)
            result := goCore.FindContexts(command.Query)
            fmt.Print(formatOutput(result))
        } else {
            // Fallback to proven JS implementation
            fallbackToJS(os.Args)
        }
    default:
        // Not migrated yet, use JS
        fallbackToJS(os.Args)
    }
}
```

### Incremental Migration Timeline
**Week 1: Fast Operations (Immediate Speed Wins)**
- ✅ `lev find "query"` → Go (10x faster context search)
- ✅ `lev find 1a` → Go (instant cache lookup)
- ✅ `lev find doc-shepherd` → Go (fast agent lookup)

**Week 2: Agent Operations**
- ✅ `lev find agent.endpoint` → Go (fast agent switching)
- ✅ `lev combos "intent"` → Go (workflow combinations)

**Week 3: Session Management**
- ✅ `lev ping --context="..."` → Go (checkpoint creation)
- ✅ `lev load --session="id"` → Go (session resumption)

**Week 4+: Complex Operations (JS Fallback)**
- 🔄 `lev handoff --complex...` → JS (complex session handoffs)
- 🔄 Advanced MCP operations → JS (MCP protocol complexity)

### MCP Bridge Strategy
```javascript
// js-mcp-bridge/mcp-bridge.js
export class GoCoreBridge {
  async findContexts(query, options = {}) {
    try {
      // Try Go binary first (faster)
      const result = await this.callGoBinary('find', [
        '--query', query, '--format', 'json'
      ]);
      return JSON.parse(result);
    } catch (error) {
      // Fallback to JS implementation
      return await this.jsFallback.find(query);
    }
  }
}
```

### Binary Replacement Strategy
```bash
# Smart wrapper replaces original lev binary
~/digital/leviathan/agent/bin/lev → Smart wrapper script
├── Tries Go binary first: ~/bin/lev-go
├── Falls back to JS: ~/bin/lev-js (original)
└── Users see no difference in interface
```

**Benefits:**
- ✅ **Perfect Backward Compatibility**: Users never see broken functionality
- ✅ **Immediate Performance Gains**: 10x faster operations from week 1
- ✅ **Risk Mitigation**: Fallback to proven JS implementation
- ✅ **Transparent Migration**: Same CLI interface throughout

Date: 2025-01-17
Status: Updated with drop-in replacement strategy