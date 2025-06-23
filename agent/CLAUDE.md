# Leviathan Agent Intelligence

You have access to distributed workspace intelligence via the Leviathan agent system.

## Project Context
- **Type**: Node.js/JavaScript (Leviathan Agent)
- **Languages**: JavaScript
- **Architecture**: Hexagonal Architecture (Core SDK + Adapters)
- **Sponsorship**: Open source project sponsored by Kingly Agency

## Hexagonal Architecture

Leviathan follows hexagonal architecture principles with clear separation between core business logic and external interfaces.

### Core SDK (Business Logic)
Pure business logic with no external dependencies:
- `src/core/agents/` - Agent management and loading
- `src/core/sessions/` - Session lifecycle and checkpoints  
- `src/core/discovery/` - Context search and workflow discovery

**Core Functions:**
- `loadAgent(name, endpoint)` - Load agent with specific endpoint
- `findContexts(query, options)` - Universal context search
- `createCheckpoint(context, files, mode, sessionId)` - Create session checkpoints
- `resumeSession(sessionId)` - Resume previous session with timeline

### CLI Adapter (First Interface)
Command-line interface built on Core SDK:
- `src/adapters/cli/` - CLI adapter implementation
- Extensible command registry for plugin commands
- Specialized routers (find, checkpoint, agent)
- Multiple formatters (Claude whisper mode, full output, JSON)

**Key Commands:**
- `lev checkpoint --new "context"` - Start new session
- `lev checkpoint --resume --session="id"` - Resume session
- `lev checkpoint --final --session="id"` - Complete session
- `lev find "query"` - Universal context search
- `lev status` - System status and health

### MCP Adapter (Second Interface)
Model Context Protocol server that maps core functions to MCP tools:
- `src/adapters/mcp/` - MCP protocol implementation
- Maps core functions to MCP tools
- Protocol-specific request/response handling

### Plugin Extension Pattern

**Plugin Namespace Architecture:**
- **Core commands**: `lev checkpoint`, `lev find` (no namespace)
- **Plugin commands**: `lev <plugin> <command>` (automatic namespace isolation)
- **Community plugins**: Follow same pattern with automatic MCP bootstrap

**Existing Plugin Infrastructure:**
- **@lev-os/debug**: Universal logging, event tracing, performance monitoring
- **@lev-os/testing**: Plugin validation, compatibility testing, performance benchmarking  
- **@lev-os/cmd**: Process management, git worktree operations, job integration
- **@lev-os/workshop**: Tool/plugin creation system (in development)

**Extension Benefits:**
- Plugins register commands with CLI adapter using namespace pattern
- Plugins use core SDK functions directly
- No adapter lock-in - core logic reusable across interfaces
- Automatic MCP tool generation via command registry bootstrap

## Session Management

**First Command:** Always start with checkpoint to initialize session:
```bash
lev checkpoint --new "session context"
```

**Session Continuity:** When compacting or continuing work, always remember your session ID:
```bash  
lev checkpoint --resume --session "your-session-id"
```

**Session Commands:**
- `lev checkpoint --new "context"` - Start fresh session
- `lev checkpoint "progress update"` - Create progress checkpoint
- `lev checkpoint --resume --session="id"` - Resume previous work
- `lev checkpoint --final --session="id" "completion note"` - Finalize session

## Natural Language Detection

When you detect workflow, session, or intelligence needs, route through the lev binary:

- **Workflow discovery** → `lev find "intent"`
- **Session checkpoints** → `lev checkpoint --context "current work"`  
- **Session resumption** → `lev checkpoint --resume --session "id"`
- **Agent switching** → `lev find "agent-name.endpoint"`

## Testing Philosophy

### Fast Iteration → Lock Down When Working

**Core Principle:** Optimize for speed during development, comprehensive validation before release.

**Test Architecture (Simplified):**
```
tests/
├── core/                  # Business logic (fast, isolated)
├── adapters/cli/          # CLI adapter + Claude Code integration  
├── adapters/mcp/          # MCP protocol validation
├── plugins/               # Plugin ecosystem tests
└── e2e/                   # All integrations together
```

### Key Testing Principles

- **E2E/Integration tests over unit test coverage** - Test real workflows, not implementation details
- **Use actual binaries** - `./bin/lev` execution, not mocked functions
- **All adapters in E2E** - CLI subprocess + MCP protocol + Claude Code integration
- **Fast feedback loops** - Parallel plugin testing, optimized for iteration speed

### Simplified Test Commands

**Development Workflow:**
```bash
npm run test:agent         # Core + adapters only (fast)
npm run test:plugins       # All plugins in parallel  
npm run test:e2e          # All integrations (CLI + MCP + Claude)
npm run test:all          # Complete system validation
```

### Real Workflow Validation

**Dogfooding Tests (BDD Style):**
```javascript
test('should create new checkpoint for starting work session', async () => {
  // Given: Starting a new development session
  const context = 'working on authentication system';
  
  // When: Creating a new checkpoint via real CLI
  const result = await runLevCommand(['checkpoint', '--new', `"${context}"`]);
  
  // Then: Should get proper new checkpoint response
  expect(result.success).toBe(true);
  expect(result.output).toInclude('🚀 CHECKPOINT New');
});
```

### Plugin Testing Standards

**All plugins should test:**
- **Real CLI integration** - `./bin/lev plugin command` execution
- **MCP adapter compatibility** - Plugin commands available as MCP tools
- **Cross-plugin integration** - Work with @lev-os infrastructure

**Example plugin test structure:**
```
plugins/@namespace/plugin/tests/
└── plugin.test.js         # Single file testing everything
```

## Development Workflow

### Hexagonal Architecture Development Patterns

**Adding New Core Functions:**
1. Create pure business logic in `src/core/`
2. Add unit tests in `tests/core/`
3. Expose via CLI adapter routers
4. Map to MCP tools if needed

**Extending CLI Adapter:**
1. Register new commands in command registry
2. Create specialized router if needed
3. Add CLI adapter tests
4. Update help and documentation

**Creating New Adapters:**
1. Import core SDK functions
2. Implement adapter-specific protocol
3. Create adapter test suite
4. Follow existing adapter patterns

**Plugin Development:**
1. Use core SDK functions directly
2. Register commands with CLI adapter
3. Follow plugin extension patterns
4. Test with existing adapter tests

### Project-Specific Intelligence

**Node.js Development:**
- Checkpoint before major dependency changes
- Checkpoint after significant refactoring
- Use session handoffs for deployment cycles
- Test core logic separately from adapters

## Leviathan Agent Activation

For any complex request, the lev binary provides agent responses with:
- Agent identification and workspace context
- Session ID for continuity across tabs
- Intelligence routing and next actions
- Multi-tab coordination guidance

## Multi-Tab Support

Each Claude Code tab gets a unique session ID. Use session IDs to maintain continuity when switching between tabs or continuing work sessions.

### Cross-Session Timeline

Resume operations automatically discover previous sessions and reconstruct timeline:
```bash
lev checkpoint --resume
# Shows: "34 previous sessions discovered across 3 days"
# Shows: "Pattern detected: development → testing cycle"
```

## Architecture Benefits

### Extensibility
- Easy to add new adapters (API, Web UI, Mobile)
- Plugin system for community extensions
- Core SDK reusable across multiple products

### Maintainability  
- Clear module boundaries and responsibilities
- Each layer can be tested independently
- Business logic separated from presentation

### Performance
- Core SDK optimized for speed
- Adapter-specific optimizations possible
- Clean separation enables caching strategies

---
*Generated by Leviathan Intelligence System (sponsored by Kingly Agency)*