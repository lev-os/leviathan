# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Philosophy: LLM-First Architecture

**"Can an LLM do this?"** - If yes, we don't write JavaScript for it.

This is an LLM-native system where JavaScript provides infrastructure, not intelligence. The LLM drives all complex decisions through MCP tools.

## Essential Commands

### Development Server
```bash
npm install                    # Install dependencies
npm run dev                   # Start MCP server for Claude integration
npm run dev:hot               # Start with hot reload
npm run dev:restart           # Restart the MCP server
npm run mcp:status           # Check MCP server status
npm run mcp:stop             # Stop MCP server
```

### Testing
```bash
# Core functionality tests
node tests/test-confidence-splitting.js    # Test confidence-based task splitting
node tests/test-llm-routing.js            # Test agent routing system
node tests/test-spawn-system.js           # Test background task execution
node tests/test-workspace.js              # Test workspace management
node tests/test-comprehensive-mcp.js      # Full MCP integration test

# Run a specific test with output
node tests/test-production.js             # Test production readiness
```

## Architecture: Bidirectional MCP Flow

```
LLM → MCP → Kingly → MCP → LLM → MCP → Kingly → ...
```

The LLM continuously interacts with Kingly through MCP tools until task completion. Kingly provides:
- Fast filesystem-based persistence
- Task hierarchy management
- Agent routing infrastructure
- Background task spawning

## Key System Components

### MCP Tools (src/mcp-tool-handlers.js)
- `get_route_table()` - Get agent capabilities and routing guidance
- `create_task()` - Create new tasks with title and description
- `assess_task_confidence()` - LLM rates confidence 0-1
- `split_task()` - Split tasks when confidence < 80%
- `execute_task()` - Execute high-confidence tasks
- `spawn_background_task()` - Run long tasks in background

### Confidence System
- **80% threshold** - Tasks must reach 80% confidence before execution
- LLM assesses based on: scope, complexity, clarity, dependencies
- Recursive splitting until all subtasks are executable
- All logic handled by LLM, not hardcoded

### Agent System
- Agents defined in `agents/*.yaml` files (not JavaScript classes)
- No conversation memory - each MCP response is self-contained
- Background spawning via Docker for isolated execution
- Agent routing based on capability matching

### Filesystem Truth
```
.kingly/
├── workspace.yaml       # Workspace metadata
├── agents/             # Agent context storage
├── projects/           # Project organization
│   └── {project}/
│       └── tasks/      # Task YAML + MD files
└── audit/              # Decision trail
```

## Development Patterns

### Adding New MCP Tools
1. Add handler in `src/mcp-tool-handlers.js`
2. Register in `src/mcp-server.js` tools array
3. Test with `tests/test-comprehensive-mcp.js`

### Testing Task Flows
1. Create task with low confidence
2. Verify splitting occurs
3. Check subtasks reach 80% threshold
4. Ensure execution proceeds correctly

### Hot Reload Development
The system supports hot reload of agent definitions and tool handlers:
```bash
npm run dev:hot  # Auto-reloads on file changes
```

## Current State & Known Issues

- System is ~85% complete (per _2do.md)
- Working: MCP integration, task splitting, background spawning
- Needs: Systematic testing cleanup, audit trail completion
- Test files may have accumulated artifacts - use cleanup scripts

## Future Vision

Building toward the "Holy Grail Demo": Say "Build me a fitness app" and get a deployed product in 30 minutes. Planned additions include web GUI dashboard and automatic project discovery.

## Important Notes

- Never create test files outside `tests/` directory
- Always clean up test artifacts after sessions
- Respect the LLM-first philosophy - don't add complex JS logic
- Trust the filesystem as the source of truth
- Use existing infrastructure before creating new components