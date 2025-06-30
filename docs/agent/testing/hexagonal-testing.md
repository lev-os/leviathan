# Hexagonal Architecture Testing Guide

## Overview

Leviathan follows hexagonal architecture (Ports and Adapters pattern) with clear separation between core business logic and external interfaces. This guide defines testing strategies for each architectural layer.

## Hexagonal Architecture Layers

```
        ┌─────────────────┐
        │   Claude Code   │ ← External Interface
        │   Integration   │
        └─────────┬───────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│  CLI  │    │   MCP   │   │ Future  │ ← Adapters (Ports)
│Adapter│    │ Adapter │   │Adapters │
└───┬───┘    └────┬────┘   └────┬────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
        ┌─────────▼───────┐
        │   Core SDK      │ ← Business Logic
        │(Business Logic) │
        └─────────────────┘
```

## Layer-Specific Testing Strategies

### 1. Core SDK Testing (`tests/core/`)

**Purpose:** Test pure business logic with no external dependencies.

#### What to Test
- **Session Management** - Session creation, persistence, lifecycle
- **Context Search** - Semantic search and workflow discovery  
- **Agent Loading** - Agent management and configuration
- **Business Rules** - Core domain logic and validations

#### Testing Approach

```javascript
// Example: Core session management test
import { SessionManager } from '../../src/core/sessions/session-manager.js';

describe('SessionManager Core Logic', () => {
  test('should create unique session IDs', () => {
    const sessionManager = new SessionManager();
    const session1 = sessionManager.createSession('context1');
    const session2 = sessionManager.createSession('context2');
    
    expect(session1.id).not.toBe(session2.id);
    expect(session1.id).toMatch(/^2025-\d{2}-\d{2}-session-\w{6}$/);
  });

  test('should maintain session state', () => {
    const sessionManager = new SessionManager();
    const session = sessionManager.createSession('test context');
    
    sessionManager.updateSession(session.id, { status: 'active' });
    const retrieved = sessionManager.getSession(session.id);
    
    expect(retrieved.status).toBe('active');
  });
});
```

#### Core Testing Characteristics
- **Fast execution** (< 100ms per test)
- **No external dependencies** (no file system, network, processes)
- **Pure functions** with predictable inputs/outputs
- **Business logic validation** independent of presentation layer

### 2. Adapter Testing (`tests/adapters/`)

**Purpose:** Test external interface layers that translate between Core SDK and external systems.

#### CLI Adapter Testing (`tests/adapters/cli/`)

**Focus:** Command routing, argument parsing, output formatting, user workflows.

```javascript
// Example: CLI adapter integration test
import { describe, test, expect, runLevCommand } from '@lev-os/testing/simple';

describe('CLI Adapter Integration', () => {
  test('should route commands to core SDK correctly', async () => {
    // Given: User wants to create checkpoint
    // When: Running CLI command
    const result = await runLevCommand(['checkpoint', '--new', 'test session']);
    
    // Then: Should call core SDK and format response
    expect(result.success).toBe(true);
    expect(result.output).toContain('🚀 CHECKPOINT New');
    expect(result.output).toContain('Session Initialized:');
  });

  test('should format core SDK responses for CLI users', async () => {
    // Given: Core SDK returns structured data
    // When: CLI adapter processes response
    const result = await runLevCommand(['status']);
    
    // Then: Should format as human-readable output
    expect(result.success).toBe(true);
    expect(result.output).toContain('STATUS');
    expect(result.output).not.toContain('{'); // No raw JSON
  });
});
```

#### MCP Adapter Testing (`tests/adapters/mcp/`)

**Focus:** Protocol compliance, tool registration, data serialization.

```javascript
// Example: MCP adapter protocol test
describe('MCP Adapter Protocol', () => {
  test('should register core SDK functions as MCP tools', async () => {
    const mcpAdapter = new MCPAdapter();
    await mcpAdapter.initialize();
    
    const tools = mcpAdapter.getAvailableTools();
    
    expect(tools).toContainEqual(
      expect.objectContaining({
        name: 'checkpoint_create',
        description: expect.stringContaining('checkpoint')
      })
    );
  });

  test('should translate CLI commands to MCP tools', async () => {
    // Given: CLI command "lev checkpoint --new 'context'"
    // When: MCP adapter processes equivalent request
    const mcpRequest = {
      method: 'tools/call',
      params: {
        name: 'checkpoint_create',
        arguments: { mode: 'new', context: 'context' }
      }
    };
    
    const result = await mcpAdapter.handleToolCall(mcpRequest);
    
    // Then: Should call same core SDK function as CLI
    expect(result.success).toBe(true);
    expect(result.data).toContain('checkpoint created');
  });
});
```

#### Adapter Testing Characteristics
- **Integration focus** - Test adapter ↔ core SDK communication
- **Protocol validation** - Ensure external interface compliance  
- **Data transformation** - Verify input/output translation
- **Error propagation** - Test error handling across boundaries

### 3. Plugin Testing (`tests/plugins/`)

**Purpose:** Test plugin integration with adapters and core SDK.

#### Plugin Architecture Testing

```javascript
// Example: Plugin integration with hexagonal architecture
describe('Workshop Plugin Hexagonal Integration', () => {
  test('should register with CLI adapter correctly', async () => {
    // Given: Plugin implements registration interface
    // When: CLI adapter loads plugin
    const result = await runLevCommand(['workshop', 'status']);
    
    // Then: Should work through adapter → core SDK flow
    expect(result.success).toBe(true);
    expect(result.output).toContain('WORKSHOP STATUS');
  });

  test('should access core SDK functions correctly', async () => {
    // Given: Plugin needs core functionality  
    // When: Plugin calls core SDK via adapter
    const result = await runLevCommand(['workshop', 'list']);
    
    // Then: Should get core SDK data formatted by adapter
    expect(result.success).toBe(true);
    expect(result.output).toContain('WORKSHOP ITEMS');
  });
});
```

#### Plugin Testing Characteristics
- **Adapter integration** - Test plugin ↔ adapter communication
- **Core SDK access** - Verify plugin can use business logic
- **Namespace isolation** - Ensure plugins don't interfere
- **Cross-plugin compatibility** - Test plugin ecosystem health

### 4. E2E Integration Testing (`tests/e2e/`)

**Purpose:** Test complete system flow across all architectural layers.

#### Full Stack Integration

```javascript
// Example: End-to-end hexagonal flow test
describe('Hexagonal Architecture E2E Flow', () => {
  test('should handle complete user workflow', async () => {
    // Given: User workflow spanning multiple layers
    
    // Step 1: CLI Adapter → Core SDK (create session)
    const newSession = await runLevCommand(['checkpoint', '--new', 'e2e test']);
    expect(newSession.success).toBe(true);
    
    // Step 2: Extract session ID from Core SDK response
    const sessionMatch = newSession.output.match(/Session Initialized: ([\w-]+)/);
    expect(sessionMatch).toBeTruthy();
    const sessionId = sessionMatch[1];
    
    // Step 3: Plugin → CLI Adapter → Core SDK (use session context)
    const workshop = await runLevCommand(['workshop', 'status']);
    expect(workshop.success).toBe(true);
    
    // Step 4: CLI Adapter → Core SDK (resume session)
    const resume = await runLevCommand(['checkpoint', '--resume']);
    expect(resume.success).toBe(true);
    expect(resume.output).toContain('Session Loaded:');
  });
});
```

#### E2E Testing Characteristics
- **Cross-layer validation** - Test complete architectural flow
- **Real user workflows** - Test actual usage patterns
- **System integration** - Verify all components work together
- **Performance validation** - Test system response times

## Testing Strategy by Architectural Layer

### Core SDK Strategy: Fast Unit Testing

```javascript
// Fast, isolated, no dependencies
describe('Core Business Logic', () => {
  test('session ID generation algorithm', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^2025-\d{2}-\d{2}-session-\w{6}$/);
  });
});
```

**Benefits:**
- ⚡ **Extremely fast** (milliseconds)
- 🔒 **Reliable** (no external dependencies)
- 🎯 **Focused** (business logic only)

### Adapter Strategy: Integration Testing

```javascript
// Real interface testing, external dependencies
describe('CLI Adapter', () => {
  test('command execution flow', async () => {
    const result = await runLevCommand(['status']);
    expect(result.success).toBe(true);
  });
});
```

**Benefits:**
- 🔌 **Interface validation** (adapter ↔ core communication)
- 📊 **Format verification** (output transformation)
- 🛡️ **Error handling** (boundary error management)

### Plugin Strategy: Ecosystem Testing

```javascript
// Plugin integration and compatibility
describe('Plugin Ecosystem', () => {
  test('multiple plugins coexist', async () => {
    const workshop = await runLevCommand(['workshop', 'status']);
    const debug = await runLevCommand(['debug', 'info']);
    
    expect(workshop.success && debug.success).toBe(true);
  });
});
```

**Benefits:**
- 🔗 **Ecosystem health** (plugin compatibility)
- 🏗️ **Architecture validation** (extensibility proof)
- 🌐 **Community support** (third-party integration)

### E2E Strategy: Workflow Testing

```javascript
// Complete user journey validation
describe('User Workflows', () => {
  test('checkpoint creation and resume cycle', async () => {
    // Multi-step workflow across all layers
  });
});
```

**Benefits:**
- 👤 **User validation** (real workflow testing)
- 🔄 **System integration** (all layers working together)
- 🚀 **Release confidence** (production readiness)

## Hexagonal Testing Principles

### 1. Layer Isolation

**Test each layer independently:**
- Core SDK: No adapter dependencies
- Adapters: Mock core SDK if needed for unit tests
- Plugins: Test via adapter interfaces
- E2E: Test complete system flow

### 2. Interface Testing

**Test architectural boundaries:**
- Core SDK ↔ Adapter communication
- Adapter ↔ Plugin integration  
- External Interface ↔ Adapter protocol

### 3. Dependency Direction

**Respect architectural dependency flow:**
```
External → Adapter → Core SDK
       ↑         ↑
     Test      Test
   Protocol  Interface
```

### 4. Test Speed Hierarchy

**Optimize test execution:**
1. **Core SDK** (fastest - milliseconds)
2. **Adapters** (fast - seconds) 
3. **Plugins** (medium - tens of seconds)
4. **E2E** (comprehensive - minutes)

## Common Anti-Patterns

### ❌ Testing Implementation Details

```javascript
// Don't test internal methods
expect(internalParseFunction).toHaveBeenCalledWith(args);

// Do test behavior through public interface
const result = await runLevCommand(['command']);
expect(result.success).toBe(true);
```

### ❌ Cross-Layer Dependencies in Unit Tests

```javascript
// Don't import adapters in core tests
import { CLIAdapter } from '../adapters/cli/cli-adapter.js'; // ❌

// Do test core independently
import { SessionManager } from '../core/sessions/session-manager.js'; // ✅
```

### ❌ Mocking Everything

```javascript
// Don't over-mock in integration tests
const mockCore = { createSession: jest.fn() }; // ❌

// Do test real integration
const result = await runLevCommand(['checkpoint', '--new', 'test']); // ✅
```

## Performance Targets by Layer

### Core SDK Tests
- **Target**: < 100ms per test
- **Total Suite**: < 5 seconds
- **Characteristics**: Pure functions, no I/O

### Adapter Tests  
- **Target**: < 1000ms per test
- **Total Suite**: < 30 seconds
- **Characteristics**: Real interfaces, controlled I/O

### Plugin Tests
- **Target**: < 2000ms per test
- **Total Suite**: < 60 seconds (parallel)
- **Characteristics**: CLI integration, file system access

### E2E Tests
- **Target**: < 5000ms per test
- **Total Suite**: < 2 minutes
- **Characteristics**: Complete workflows, all systems

## CI/CD Integration

### Test Pipeline Structure

```yaml
# Hexagonal architecture test pipeline
test-pipeline:
  parallel:
    core-tests:
      run: npm run test:core
      timeout: 30s
      
    adapter-tests:
      run: npm run test:adapters  
      timeout: 60s
      
    plugin-tests:
      run: npm run test:plugins
      timeout: 90s
      
  sequential:
    e2e-tests:
      run: npm run test:e2e
      timeout: 3m
      depends-on: [core-tests, adapter-tests, plugin-tests]
```

### Quality Gates

- **Core SDK**: 100% pass rate (business logic critical)
- **Adapters**: 95% pass rate (interface stability)
- **Plugins**: 90% pass rate (ecosystem compatibility)
- **E2E**: 100% pass rate (user workflow validation)

This hexagonal testing approach ensures that each architectural layer is validated appropriately while maintaining fast feedback loops and comprehensive system coverage.