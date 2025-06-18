# Leviathan Coding Guide

## 🏗️ Hexagonal Architecture Extension

### Core Principle: Domain-Based Function Separation
Extend hexagonal architecture with domain-separated functions to prevent god objects and enable easy testing.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLI Adapter   │     │   MCP Adapter   │     │  Future Adapters│
│   (Routing)     │     │   (Protocol)    │     │   (API, Web)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │ Command Registry│
                         │ (Auto-Discovery)│
                         └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │  Core Commands │
                         │ (Business Logic)│
                         └────────────────┘
```

### Domain Separation Strategy

#### 1. Core Commands (`src/commands/`)
**Pure business logic functions by domain:**
```javascript
// src/commands/workshop.js
export async function workshopStatus(args, { workflowLoader, debugLogger }) {
  // Pure business logic - no I/O, no formatting
  const data = await workflowLoader.getWorkshopData();
  debugLogger.log('workshop_status', { tools: data.tools.length });
  return { success: true, data };
}

// Auto-discovery metadata
workshopStatus.description = "Show workshop status overview";
workshopStatus.inputSchema = { /* JSON schema */ };
```

#### 2. Adapter Layer (Protocol/Format Only)
```javascript
// src/adapters/cli/cli-adapter.js  
async handleCommand(args) {
  const [command, ...commandArgs] = args;
  
  // Route through registry - NO business logic
  if (this.commandRegistry.hasCommand(command)) {
    const result = await this.commandRegistry.execute(command, commandArgs);
    return this.formatter.format(result, 'cli');
  }
}
```

#### 3. Command Registry (Auto-Discovery Hub)
```javascript
// src/core/command-registry.js
export class CommandRegistry {
  async discoverCommands() {
    // Auto-discover all files in src/commands/
    // Register functions with metadata
    // Generate MCP tools automatically
  }
}
```

## 🧪 Testing Strategy by Layer

### Core Commands (Unit Tests)
```javascript
// tests/core/commands/workshop.test.js
test('workshopStatus returns structured data', async () => {
  const mockDeps = { workflowLoader: mockLoader };
  const result = await workshopStatus({}, mockDeps);
  expect(result.success).toBe(true);
  expect(result.data.tools).toBeDefined();
});
```

### Adapter Integration (CLI/MCP Tests)
```javascript
// tests/adapters/cli/workshop-commands.test.js
test('workshop status command works via CLI', async () => {
  const result = await runLevCommand(['workshop', 'status']);
  expect(result.success).toBe(true);
  expect(result.output).toContain('WORKSHOP STATUS');
});
```

### Auto-Bootstrap Validation
```javascript
// tests/adapters/mcp/auto-bootstrap.test.js  
test('workshop commands appear in MCP tools automatically', async () => {
  const mcpAdapter = new MCPAdapter();
  await mcpAdapter.initialize();
  const tools = mcpAdapter.getTools();
  expect(tools.find(t => t.name === 'workshop_status')).toBeTruthy();
});
```

## 📋 Development Guidelines

### 1. God Object Prevention
- **Single Responsibility**: Each command file handles one domain
- **Dependency Injection**: Pass services as function parameters
- **Pure Functions**: Business logic with no side effects
- **Clear Boundaries**: Adapters route, core computes

### 2. File Organization
```
src/
├── commands/           # Domain business logic (testable functions)
│   ├── workshop.js     # Workshop domain commands
│   ├── checkpoint.js   # Session management commands  
│   └── discovery.js    # Context search commands
├── core/              # Shared services and utilities
│   ├── command-registry.js
│   └── sessions/
├── adapters/          # Protocol interfaces (routing only)
│   ├── cli/
│   └── mcp/
```

### 3. Function Design Pattern
```javascript
export async function commandName(args, dependencies) {
  // 1. Validate inputs
  // 2. Execute business logic using dependencies
  // 3. Return structured result
  // NO: I/O operations, formatting, protocol details
}

// Metadata for auto-discovery
commandName.description = "Clear description";
commandName.inputSchema = { /* JSON schema */ };
```

## 🤖 Session Continuity & Prime Command

### Prime Command Requirements
You need a **"prime"** command to maintain context between sessions:

1. **Project State Restoration**
   - Load architectural patterns and constraints
   - Restore domain understanding and command registry knowledge
   - Load current testing philosophy and patterns

2. **Architecture Context Loading**
   - Hexagonal architecture principles
   - Command registry auto-bootstrap pattern  
   - Domain separation guidelines
   - Anti-patterns to avoid (god objects, adapter business logic)

### Suggested Prime Implementation
```bash
# Add to agent/src/commands/prime.js
lev prime --context="hexagonal-architecture" --load-constraints
```

Should load:
- `_adapters.md` - Auto-bootstrap architecture
- `_workshop.md` - Plugin patterns
- `agent/docs/coding-guide.md` - This guide
- Current testing philosophy and command patterns

## 🎯 What You Need to Help Me

### 1. Architecture Reinforcement
- **Remind me**: "Adapters route, core computes" when I add logic to adapters
- **Question violations**: "Is this business logic in an adapter?" 
- **Reference patterns**: Point to `_adapters.md` auto-bootstrap pattern

### 2. Domain Boundary Enforcement  
- **Single domain per file**: Each command file should handle one domain
- **Pure function validation**: Core commands should be testable without I/O
- **Dependency injection**: Services passed as parameters, not imported

### 3. Testing Pattern Consistency
- **Layer-appropriate tests**: Unit for core, integration for adapters  
- **Real CLI validation**: Plugin tests use actual `./bin/lev` execution
- **Auto-bootstrap verification**: MCP tools appear automatically

### 4. Session Context Preservation
- **Prime command usage**: Load architectural context between sessions
- **Pattern consistency**: Reference established patterns when extending
- **Anti-pattern alerts**: Flag violations of hexagonal architecture

## 🔧 Implementation Checklist

- [ ] Create `agent/docs/architecture/` with this guide
- [ ] Implement `lev prime` command for session context loading
- [ ] Fix workshop plugin using proper command registry pattern
- [ ] Validate auto-bootstrap MCP tool generation
- [ ] Update all command files to follow domain separation pattern
- [ ] Create architecture decision records (ADRs) for key patterns

This guide establishes the foundation for maintainable, testable, and extensible code following hexagonal architecture principles.