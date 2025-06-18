# Leviathan Hexagonal Architecture Coding Guide

## 🎯 Core Principle: Domain-Separated Functions

**"Adapters Route, Core Computes"** - Extend hexagonal architecture with domain-based function separation to prevent god objects and enable easy testing.

## 🏗️ Architecture Pattern

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLI Adapter   │     │   MCP Adapter   │     │  Future Adapters│  
│   (Routing)     │     │   (Protocol)    │     │   (API, Web)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │ Command Registry│ ← Single Source of Truth
                         │ (Auto-Discovery)│
                         └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │  Core Commands │ ← Pure Business Logic
                         │  (By Domain)   │
                         └────────────────┘
```

## 📁 File Organization

```
src/
├── commands/                    # Domain business logic (pure functions)
│   ├── workshop.js             # Workshop domain commands  
│   ├── checkpoint.js           # Session management commands
│   ├── discovery.js            # Context search commands
│   └── agent.js                # Agent loading commands
├── core/                       # Shared services and utilities
│   ├── command-registry.js     # Auto-discovery and routing
│   ├── sessions/               # Session management services
│   └── discovery/              # Context search services  
├── adapters/                   # Protocol interfaces (routing only)
│   ├── cli/                    # CLI argument parsing and formatting
│   └── mcp/                    # MCP protocol translation
```

## 🔧 Core Command Pattern

### Pure Function Design
```javascript
// src/commands/workshop.js
export async function workshopStatus(args, dependencies) {
  const { workflowLoader, debugLogger } = dependencies;
  
  // 1. Validate inputs
  if (!workflowLoader) throw new Error('WorkflowLoader required');
  
  // 2. Execute business logic using injected dependencies
  const data = await workflowLoader.getWorkshopData();
  debugLogger.log('workshop_status', { tools: data.tools.length });
  
  // 3. Return structured result
  return { success: true, data };
}

// Metadata for auto-discovery
workshopStatus.description = "Show workshop status overview";
workshopStatus.inputSchema = {
  type: 'object',
  properties: {
    tier: { type: 'number', minimum: 1, maximum: 3 }
  }
};

// MCP tool auto-generation
export const workshopStatusTool = {
  name: 'workshop_status',
  description: workshopStatus.description,
  inputSchema: workshopStatus.inputSchema,
  handler: workshopStatus
};
```

### What NOT to Include in Core Commands
❌ **I/O Operations** (file reads, API calls)  
❌ **Formatting Logic** (CLI vs JSON output)  
❌ **Protocol Details** (MCP schemas, CLI parsing)  
❌ **Side Effects** (logging, state mutations)

## 🔌 Adapter Implementation

### CLI Adapter (Routing Only)
```javascript
// src/adapters/cli/cli-adapter.js
export class CLIAdapter {
  async handleCommand(args) {
    const [command, ...commandArgs] = args;
    
    // Route through registry - NO business logic here
    if (this.commandRegistry.hasCommand(command)) {
      const result = await this.commandRegistry.execute(command, commandArgs);
      return this.formatter.format(result, 'cli');
    }
    
    throw new Error(`Unknown command: ${command}`);
  }
}
```

### MCP Adapter (Protocol Translation Only)  
```javascript
// src/adapters/mcp/mcp-adapter.js
export class MCPAdapter {
  async initialize() {
    // Auto-bootstrap tools from command registry
    const commands = await this.commandRegistry.getAllCommands();
    this.mcpTools = commands.map(cmd => this.generateMCPTool(cmd));
  }
  
  async handleToolCall(toolName, args) {
    // Route back through command registry
    const commandName = this.toolNameToCommand(toolName);
    return await this.commandRegistry.execute(commandName, args);
  }
}
```## 🧪 Testing Strategy by Layer

### Core Commands (Unit Tests)
```javascript
// tests/core/commands/workshop.test.js
import { workshopStatus } from '../../../src/commands/workshop.js';

test('workshopStatus returns structured data', async () => {
  const mockDeps = { 
    workflowLoader: { getWorkshopData: () => ({ tools: [1,2,3] }) },
    debugLogger: { log: jest.fn() }
  };
  
  const result = await workshopStatus({}, mockDeps);
  
  expect(result.success).toBe(true);
  expect(result.data.tools).toHaveLength(3);
});
```

### Adapter Integration Tests
```javascript 
// tests/adapters/cli/workshop-commands.test.js
import { runLevCommand } from '../../test-framework.js';

test('workshop status works via CLI adapter', async () => {
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

## 🚨 Anti-Patterns to Avoid

### ❌ God Object Pattern
```javascript
// DON'T: Monolithic class with all functionality
class WorkshopManager {
  parseCliArgs() { }
  formatMCPResponse() { }
  loadWorkflowData() { }
  generateReport() { }
  saveToFile() { }
}
```

### ❌ Business Logic in Adapters
```javascript
// DON'T: Business logic in MCP adapter
async handleWorkshop(args) {
  const data = await this.loadWorkshopData(); // ❌ Business logic
  return this.formatResponse(data);           // ❌ Should be in core
}
```

### ❌ Mixed Concerns in Commands
```javascript
// DON'T: I/O and formatting in core commands
export async function workshopStatus(args) {
  const data = await fs.readFile('workshop.json'); // ❌ I/O
  console.log('Workshop status loaded');           // ❌ Side effect
  return data.toString();                          // ❌ Formatting
}
```

## ✅ Correct Patterns

### ✅ Domain-Separated Functions
```javascript
// src/commands/workshop.js - Pure business logic
export async function workshopStatus(args, { workflowLoader }) {
  return await workflowLoader.getWorkshopData();
}

// src/adapters/cli/formatters/workshop-formatter.js - Presentation
export function formatWorkshopStatus(data) {
  return `🛠️ WORKSHOP STATUS\nTools: ${data.tools.length}`;
}
```

### ✅ Dependency Injection
```javascript
// Dependencies passed as parameters, not imported
export async function createCheckpoint(args, { sessionManager, fileSystem }) {
  const session = await sessionManager.create(args.context);
  await fileSystem.saveSession(session);
  return { success: true, sessionId: session.id };
}
```

### ✅ Command Registry Auto-Discovery
```javascript
// src/core/command-registry.js
export class CommandRegistry {
  async discoverCommands() {
    const commandFiles = await this.scanCommandDirectory();
    for (const file of commandFiles) {
      const module = await import(file);
      this.registerCommand(module);
    }
  }
}
```

## 🤖 Prime Command for Session Continuity

### Implementation Pattern
```javascript
// src/commands/prime.js
export async function primeAgent(args, { fileLoader, contextManager }) {
  const { context = 'hexagonal-architecture' } = args;
  
  // Load architectural context
  const architectureGuide = await fileLoader.load('agent/docs/architecture/coding-guide.md');
  const adapterPatterns = await fileLoader.load('_adapters.md');
  const workshopPatterns = await fileLoader.load('_workshop.md');
  
  // Set context for session
  await contextManager.setContext({
    architecture: 'hexagonal',
    patterns: { architectureGuide, adapterPatterns, workshopPatterns },
    constraints: [
      'adapters_route_core_computes',
      'domain_separated_functions', 
      'auto_bootstrap_pattern'
    ]
  });
  
  return { 
    success: true, 
    loaded: ['coding-guide', 'adapter-patterns', 'workshop-patterns'],
    context: context
  };
}
```

### Usage
```bash
lev prime --context="hexagonal-architecture" --load-constraints
```

## 📋 Development Checklist

### Before Writing Code
- [ ] Identify the domain (workshop, checkpoint, discovery, etc.)
- [ ] Design pure function with dependency injection
- [ ] Define clear input/output contracts
- [ ] Plan unit tests for business logic

### Core Command Implementation  
- [ ] Function accepts (args, dependencies)
- [ ] No I/O operations or side effects
- [ ] Returns structured data
- [ ] Includes metadata for auto-discovery

### Adapter Implementation
- [ ] Routes through command registry only
- [ ] No business logic in adapters
- [ ] Protocol-specific formatting only
- [ ] Integration tests via real CLI commands

### Testing Strategy
- [ ] Unit tests for core commands with mocked dependencies
- [ ] Integration tests for adapter routing
- [ ] Auto-bootstrap validation for MCP tools
- [ ] E2E tests via actual CLI execution

**Remember**: "Adapters Route, Core Computes" - This principle prevents god objects and enables the testing strategy that makes the architecture maintainable and extensible.