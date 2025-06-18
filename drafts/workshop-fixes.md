# Workshop Plugin Fix Plan

## 🚨 Architectural Violations Discovered

### What Went Wrong
1. **Added Business Logic to MCP Adapter** - Created 200+ lines of workshop logic in MCP server (violates hex architecture)
2. **Manual MCP Tool Registration** - Added workshop tool manually instead of using auto-bootstrap pattern
3. **Ignored Command Registry Architecture** - System has `src/core/command-registry.js` for auto-discovery that we bypassed
4. **Mixed Plugin Loading Patterns** - Created YAML when should use command registry

### Core Architecture Pattern (From _adapters.md)
```
Command Registry (Single Source) → Auto-Bootstrap All Adapters
- CLI Adapter: Routes through registry
- MCP Adapter: Auto-generates tools from registry  
- Future Adapters: Same pattern
```

## ✅ Correct Implementation Plan

### Phase 1: Remove Violations
1. Delete manual workshop MCP tool from `src/index.js`
2. Delete workshop.yaml plugin file
3. Restore clean MCP adapter (routing only, no business logic)

### Phase 2: Implement Proper Pattern
1. Create `src/commands/workshop.js` with clean business logic:
```javascript
export async function workshopStatus(args, dependencies) {
  // Pure business logic here
  return { success: true, data: workshopData };
}

export const workshopStatusTool = {
  name: 'workshop_status', 
  description: 'Show workshop status overview',
  inputSchema: { /* schema */ },
  handler: workshopStatus
};
```

2. Command registry auto-discovers and registers
3. MCP adapter auto-generates tools from registry
4. CLI adapter routes through registry

### Phase 3: Test Auto-Bootstrap
1. Verify `lev workshop status` works
2. Verify workshop commands appear in MCP tools automatically
3. Update workshop plugin tests to use proper CLI routing

## God Object Prevention Strategy

### Domain-Based Function Separation
- **Core Commands**: `src/commands/` (business logic only)
- **CLI Routing**: `src/adapters/cli/` (argument parsing, formatting)
- **MCP Protocol**: `src/adapters/mcp/` (protocol translation only)
- **Session Management**: `src/core/sessions/` 
- **Context Discovery**: `src/core/discovery/`

### Testing Benefits
- **Unit Tests**: Pure functions in `src/commands/`
- **Adapter Tests**: Protocol/routing validation
- **Integration Tests**: End-to-end command execution
- **Plugin Tests**: Real CLI command validation

## Current Status
- ✅ Testing Architecture: Simplified framework complete
- ✅ Claude Commands E2E: 30/30 tests passing
- ❌ Workshop Integration: Needs proper command registry pattern
- ❌ Architecture Compliance: Must remove MCP business logic

## Next Actions
1. Implement corrective plan phases 1-3
2. Validate auto-bootstrap pattern working
3. Ensure all tests pass through proper architecture
4. Document patterns for future plugin development