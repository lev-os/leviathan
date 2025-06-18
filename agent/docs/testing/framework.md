# Leviathan Testing Framework

## Testing Philosophy: Fast Iteration → Lock Down When Working

**Core Principle:** Optimize for speed during development, comprehensive validation before release.

### Key Testing Principles

- **E2E/Integration tests over unit test coverage** - Test real workflows, not implementation details
- **Use actual binaries** - `./bin/lev` execution, not mocked functions
- **All adapters in E2E** - CLI subprocess + MCP protocol + Claude Code integration
- **Fast feedback loops** - Parallel plugin testing, optimized for iteration speed
- **Code quality validation** - Verify file size, domain boundaries, and architectural compliance

## Simplified Test Architecture

```
tests/
├── core/                  # Business logic (fast, isolated)
├── adapters/cli/          # CLI adapter + Claude Code integration  
├── adapters/mcp/          # MCP protocol validation
├── plugins/               # Plugin ecosystem tests
└── e2e/                   # All integrations together
```

## Test Commands

### Development Workflow
```bash
npm run test:all          # Complete system validation
npm run test:agent        # Core + adapters only (fast)
npm run test:plugins      # All plugins in parallel  
npm run test:e2e         # All integrations (CLI + MCP + Claude)
```

### Specialized Commands
```bash
npm run test:smoke        # Quick health check
npm run test:core         # Core business logic only
npm run test:adapters     # CLI + MCP adapter validation
npm run test:dogfooding   # Real workflow BDD tests
npm run test:quality      # Code quality and architectural compliance
```

## Code Quality Validation

### File Size and Organization Testing
```javascript
// tests/quality/file-organization.test.js
describe('Code Quality Standards', () => {
  test('command files should be within size limits', async () => {
    const commandFiles = await glob('src/commands/*.js');
    
    for (const file of commandFiles) {
      const content = await fs.readFile(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      // 150-200 lines is sweet spot, 250+ is problematic
      expect(lineCount).toBeLessThan(250);
      if (lineCount > 200) {
        console.warn(`File ${file} has ${lineCount} lines - consider helper extraction`);
      }
    }
  });

  test('should maintain domain separation', async () => {
    const commandFiles = await glob('src/commands/*.js');
    
    for (const file of commandFiles) {
      const content = await fs.readFile(file, 'utf8');
      
      // Commands shouldn't import from other command files
      const crossDomainImports = content.match(/from ['"].\/[^h][^e][^l][^p]/g);
      expect(crossDomainImports).toBeNull();
    }
  });

  test('should follow helper extraction patterns', async () => {
    const helperFiles = await glob('src/commands/helpers/*.js');
    const commandFiles = await glob('src/commands/*.js');
    
    // If helpers exist, main commands should be reasonably sized
    if (helperFiles.length > 0) {
      for (const file of commandFiles) {
        const content = await fs.readFile(file, 'utf8');
        const lineCount = content.split('\n').length;
        
        // With helpers available, main files should be manageable
        expect(lineCount).toBeLessThan(300);
      }
    }
  });
});
```

## Testing Framework Components

### 1. Simple Framework (@lev-os/testing)

**Lightweight testing framework** optimized for real workflow validation:

```javascript
import { describe, test, expect, runLevCommand } from '@lev-os/testing/simple';

describe('Real CLI Integration', () => {
  test('should execute actual command', async () => {
    // Given: User wants system status
    // When: Running actual CLI command
    const result = await runLevCommand(['status']);
    
    // Then: Should get real response
    expect(result.success).toBe(true);
    expect(result.output).toContain('STATUS');
  });
});
```

### 2. Real Command Execution

**No mocking** - all tests use actual binaries:

```javascript
// ✅ Good - Real CLI execution
const result = await runLevCommand(['workshop', 'status']);

// ❌ Avoid - Mocked function calls
const result = mockWorkshopPlugin.execute('status');
```

### 3. Parallel Test Execution

**Optimized for speed** with automatic parallelization:

```bash
# Runs all plugin tests in parallel
npm run test:plugins

# Discovers and runs tests automatically
npm run test:discover
```

## Layer-Specific Testing

### Core SDK Tests (`tests/core/`)
- **Pure business logic** validation
- **Fast unit tests** with no external dependencies
- **Session management, context search, agent loading**

```javascript
// Example: Core session management test
test('should create unique session IDs', () => {
  const session1 = sessionManager.createSession('context1');
  const session2 = sessionManager.createSession('context2');
  expect(session1.id).not.toBe(session2.id);
});
```

### Adapter Tests (`tests/adapters/`)

#### CLI Adapter (`tests/adapters/cli/`)
- **Command routing** and formatting
- **Real CLI execution** via subprocess
- **User workflow validation**

```javascript
// Example: CLI adapter test
test('should route workshop commands correctly', async () => {
  const result = await runLevCommand(['workshop', 'list', '--tier=1']);
  expect(result.success).toBe(true);
  expect(result.output).toContain('Tier 1');
});
```

#### MCP Adapter (`tests/adapters/mcp/`)
- **Protocol compliance** validation
- **Tool registration** verification
- **Auto-bootstrap** functionality

#### Claude Code Integration (`tests/adapters/cli/e2e/claude/`)
- **Subprocess spawning** validation
- **Permission handling** verification
- **Output formatting** consistency

### Plugin Tests (`tests/plugins/`)
- **Real CLI integration** testing
- **Cross-plugin compatibility** validation
- **Namespace isolation** verification

```javascript
// Example: Plugin integration test
test('should integrate with CLI adapter', async () => {
  const result = await runLevCommand(['workshop', 'status']);
  expect(result.success).toBe(true);
  expect(result.output).toContain('WORKSHOP STATUS');
});
```

## Dogfooding Tests (BDD Style)

**Real workflow validation** using behavior-driven patterns:

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

## E2E Testing Strategy

### All Integrations Together
- **CLI subprocess execution** (primary user interface)
- **MCP protocol validation** (programmatic interface)
- **Claude Code integration** (development interface)
- **Plugin ecosystem compatibility** (extensibility validation)

### Real User Workflows
```bash
# Example E2E test workflow
npm run test:e2e
# → Tests CLI commands
# → Tests MCP protocol
# → Tests Claude Code integration
# → Tests plugin commands
# → Tests cross-session continuity
```

## Test Execution Strategy

### Development Flow
1. **`npm run test:agent`** - Quick core system validation (< 30 seconds)
2. **`npm run test:plugins`** - Plugin validation in parallel (< 1 minute)
3. **`npm run test:e2e`** - Full integration validation (< 2 minutes)
4. **`npm run test:all`** - Complete CI validation (< 3 minutes)

### Performance Optimizations

#### Parallel Execution
```javascript
// Plugin tests run in parallel automatically
const results = await Promise.all(
  plugins.map(plugin => testPlugin(plugin))
);
```

#### Test Discovery
```bash
# Automatic test file discovery
node test-runner.js discover
```

#### Performance Monitoring
```bash
# Shows slow tests that need optimization
🐌 Slow Tests (consider optimization):
   - complex-integration.test.js (2500ms)
   - heavy-workflow.test.js (1800ms)
```

## Success Criteria

### ✅ Core Integration
- All basic commands execute successfully via CLI
- Response formatting is consistent
- Error handling provides helpful messages

### ✅ Plugin Ecosystem
- All plugins register correctly with CLI adapter
- Plugin commands execute via `lev plugin command`
- Cross-plugin compatibility maintained

### ✅ Real Workflow Validation
- Dogfooding tests validate daily usage patterns
- E2E tests cover complete user workflows
- Performance meets iteration speed requirements

### ✅ System Stability
- Concurrent operations handled gracefully
- Rapid sequential operations maintain performance
- System recovers properly after errors

## Testing Anti-Patterns to Avoid

### ❌ Over-Mocking
```javascript
// Avoid excessive mocking
const mockLogger = { info: jest.fn() };
const mockFileSystem = { readFile: jest.fn() };
```

### ❌ Implementation Testing
```javascript
// Avoid testing implementation details
expect(internalMethod).toHaveBeenCalledWith(specificArgs);
```

### ❌ Slow Feedback Loops
```javascript
// Avoid tests that require manual setup
beforeEach(() => {
  setupComplexTestEnvironment(); // Slow!
});
```

## Quick Start Guide

### 1. Run Basic Tests
```bash
# Quick smoke test
npm run test:smoke

# Core system validation
npm run test:agent
```

### 2. Test Plugin Development
```bash
# Test specific plugin
cd plugins/@lev/workshop && npm test

# Test all plugins
npm run test:plugins
```

### 3. Full System Validation
```bash
# Complete test suite
npm run test:all
```

### 4. Performance Analysis
```bash
# Discover slow tests
npm run test:discover
```

This testing framework successfully balances speed of iteration with comprehensive validation, ensuring robust development cycles while maintaining fast feedback loops for daily development work.

## Migration from Previous Framework

### What Changed
- **Simplified** from 6 complex test suites to 4 simple commands
- **Removed** ping-related tests (dead code)
- **Added** plugin testing infrastructure
- **Enhanced** real workflow validation
- **Optimized** for parallel execution and speed

### Migration Steps
1. **Replace complex test files** with simple framework usage
2. **Update package.json scripts** to use new commands
3. **Convert unit tests** to integration tests where appropriate
4. **Add plugin tests** using workshop template

The new framework maintains all the validation benefits while significantly improving development velocity and reducing maintenance overhead.