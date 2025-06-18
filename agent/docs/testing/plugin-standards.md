# Plugin Testing Standards

## Overview

This document defines testing standards for Leviathan plugins, ensuring consistent quality and integration across the plugin ecosystem. All plugins should follow these standards for community compatibility and ecosystem health.

## Plugin Testing Requirements

### ✅ Mandatory Tests

All plugins MUST include these test types:

1. **Real CLI Integration** - Plugin commands work via `lev plugin command`
2. **MCP Adapter Compatibility** - Plugin commands available as MCP tools
3. **Cross-plugin Integration** - Plugin works with @lev-os infrastructure
4. **Error Handling** - Graceful failure and helpful error messages

### 📋 Plugin Test Structure

**Simplified single-file approach:**
```
plugins/@namespace/plugin/tests/
└── plugin.test.js         # Single file testing everything
```

**Not recommended (over-engineered):**
```
plugins/@namespace/plugin/tests/
├── unit/              # Too granular
├── integration/       # Unnecessary complexity  
└── e2e/               # Redundant with CLI tests
```

## Testing Framework Usage

### Import @lev-os/testing Framework

```javascript
import { describe, test, expect, runLevCommand, printSummary } from '@lev-os/testing/simple';
```

**Note:** Use relative import if workspace not configured:
```javascript
import { describe, test, expect, runLevCommand, printSummary } from '../../../@lev-os/testing/src/simple-framework.js';
```

### Template Structure

```javascript
#!/usr/bin/env node

/**
 * [Plugin Name] Integration Tests
 * 
 * Tests plugin through real CLI integration, following Leviathan testing philosophy:
 * - Fast iteration → lock down when working
 * - E2E/integration tests over unit coverage
 * - Real workflow validation using actual ./bin/lev
 * - No mocking - test actual CLI adapter integration
 */

import { describe, test, expect, runLevCommand, printSummary } from '@lev-os/testing/simple';

describe('[Plugin] CLI Integration', () => {
  
  test('should execute primary command', async () => {
    // Given: User wants plugin functionality
    // When: Running plugin command
    const result = await runLevCommand(['plugin', 'primary-command']);
    
    // Then: Should work correctly
    expect(result.success).toBe(true);
    expect(result.output).toContain('EXPECTED_OUTPUT');
  });

  test('should support JSON output for LLM consumption', async () => {
    // Given: LLM needs structured data
    // When: Running command with JSON flag
    const result = await runLevCommand(['plugin', 'command', '--json']);
    
    // Then: Should return valid JSON
    expect(result.success).toBe(true);
    
    let jsonData;
    try {
      jsonData = JSON.parse(result.output);
    } catch (error) {
      throw new Error(`Invalid JSON output: ${error.message}`);
    }
    
    expect(jsonData.success).toBe(true);
    expect(jsonData.data).toBeTruthy();
  });
});

describe('[Plugin] Error Handling', () => {
  
  test('should handle invalid commands gracefully', async () => {
    // Given: User types invalid plugin command
    // When: Running plugin with unknown command
    const result = await runLevCommand(['plugin', 'invalid-command']);
    
    // Then: Should show helpful error with available commands
    expect(result.success).toBe(false);
    expect(result.output).toContain('Unknown');
    expect(result.output).toContain('Available:');
  });

  test('should validate command arguments', async () => {
    // Given: User provides invalid arguments
    // When: Running command with bad arguments
    const result = await runLevCommand(['plugin', 'command', '--invalid-flag']);
    
    // Then: Should handle gracefully
    expect(result.success).toBe(false); // Or true if flag ignored
    expect(result.output).toContain('Usage:'); // Help guidance
  });
});

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 [Plugin] Integration Tests');
  console.log('Testing real CLI integration and workflows\n');
  
  // Set working directory to agent for proper ./bin/lev access
  process.chdir('../../../agent');
  
  // Test runner implementation
  const testRunner = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Let tests complete
      
      const summary = printSummary();
      
      if (summary.failed === 0) {
        console.log('\n🎉 [Plugin] CLI integration validated!');
        process.exit(0);
      } else {
        console.log('\n⚠️  [Plugin] integration issues found');
        process.exit(1);
      }
    } catch (error) {
      console.error('Test runner error:', error);
      process.exit(1);
    }
  };
  
  testRunner();
}
```

## Workshop Plugin Example

The **@lev/workshop plugin** serves as the reference implementation for plugin testing standards.

### Key Features Demonstrated

```javascript
// 1. Real CLI Integration Testing
test('should show workshop status overview', async () => {
  const result = await runLevCommand(['workshop', 'status']);
  expect(result.success).toBe(true);
  expect(result.output).toContain('WORKSHOP STATUS');
});

// 2. JSON Output for LLM Consumption
test('should support JSON output for LLM consumption', async () => {
  const result = await runLevCommand(['workshop', 'status', '--json']);
  expect(result.success).toBe(true);
  
  const jsonData = JSON.parse(result.output);
  expect(jsonData.success).toBe(true);
  expect(jsonData.data.overview).toBeTruthy();
});

// 3. Argument Validation
test('should require tool name for info command', async () => {
  const result = await runLevCommand(['workshop', 'info']);
  expect(result.success).toBe(false);
  expect(result.output).toContain('Tool name is required');
});

// 4. Error Handling
test('should handle unknown tool gracefully', async () => {
  const result = await runLevCommand(['workshop', 'info', 'nonexistent-tool']);
  expect(result.success).toBe(false);
  expect(result.output).toContain('Tool not found');
});
```

## Plugin Package.json Requirements

### Test Script Configuration

```json
{
  "scripts": {
    "test": "node tests/plugin.test.js"
  },
  "dependencies": {
    "@lev-os/debug": "^0.1.0",
    "@lev-os/testing": "^0.1.0"
  }
}
```

### Plugin Registration

Plugins must implement proper CLI adapter registration:

```javascript
export class YourPlugin {
  constructor() {
    this.namespace = 'your-plugin';
    this.commands = new Map();
    this.initializeCommands();
  }

  async register(commandRegistry) {
    for (const [commandName, commandHandler] of this.commands) {
      const fullCommandName = `${this.namespace} ${commandName}`;
      
      await commandRegistry.register(fullCommandName, 
        commandHandler.execute.bind(commandHandler), 
        {
          description: commandHandler.description,
          namespace: this.namespace,
          plugin: '@namespace/your-plugin'
        }
      );
    }
  }
}
```

## Testing Categories

### 1. Core Functionality Tests

**Test all primary plugin commands:**

```javascript
describe('Core Plugin Commands', () => {
  test('primary command works', async () => {
    const result = await runLevCommand(['plugin', 'primary']);
    expect(result.success).toBe(true);
  });

  test('secondary command works', async () => {
    const result = await runLevCommand(['plugin', 'secondary']);
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests

**Test CLI adapter integration:**

```javascript
describe('CLI Adapter Integration', () => {
  test('plugin registers with CLI adapter', async () => {
    // Test that plugin commands are available
    const result = await runLevCommand(['help']);
    expect(result.output).toContain('plugin');
  });

  test('namespace isolation works', async () => {
    // Test that plugin commands don't conflict
    const result = await runLevCommand(['plugin', 'status']);
    expect(result.success).toBe(true);
  });
});
```

### 3. Cross-Plugin Compatibility

**Test @lev-os infrastructure integration:**

```javascript
describe('Cross-Plugin Compatibility', () => {
  test('uses @lev-os/debug correctly', async () => {
    // Plugin should not crash with logging
    const result = await runLevCommand(['plugin', 'command']);
    expect(result.success).toBe(true);
  });

  test('works with other plugins', async () => {
    // Test that plugin coexists with workshop plugin
    const workshop = await runLevCommand(['workshop', 'status']);
    const plugin = await runLevCommand(['plugin', 'status']);
    expect(workshop.success && plugin.success).toBe(true);
  });
});
```

### 4. Error Handling Tests

**Test graceful failure scenarios:**

```javascript
describe('Error Handling', () => {
  test('invalid command shows help', async () => {
    const result = await runLevCommand(['plugin', 'invalid']);
    expect(result.success).toBe(false);
    expect(result.output).toContain('Available:');
  });

  test('missing arguments show usage', async () => {
    const result = await runLevCommand(['plugin', 'requires-args']);
    expect(result.success).toBe(false);
    expect(result.output).toContain('Usage:');
  });
});
```

## Performance Standards

### Response Time Requirements

- **Simple commands** (status, help): < 500ms
- **Data processing** (list, search): < 2000ms
- **Complex operations** (create, integrate): < 5000ms

### Test Performance Monitoring

```javascript
test('command executes within performance budget', async () => {
  const startTime = Date.now();
  const result = await runLevCommand(['plugin', 'command']);
  const duration = Date.now() - startTime;
  
  expect(result.success).toBe(true);
  expect(duration).toBeLessThan(2000); // 2 second budget
});
```

## Community Plugin Validation

### Automated Testing

All community plugins are automatically tested via:

```bash
# From monorepo root
npm run test:plugins

# Tests all plugins in parallel:
# @lev-os/debug, @lev-os/testing, @lev-os/cmd
# @lev/workshop, @namespace/community-plugin
```

### Plugin Discovery

The test runner automatically discovers plugins:

```bash
# Discovers all plugin test files
npm run test:discover

# Output:
📁 Discovered test files:
   - plugins/@lev-os/debug/tests/debug.test.js
   - plugins/@lev-os/testing/tests/testing.test.js
   - plugins/@lev/workshop/tests/workshop.test.js
```

## Troubleshooting Guide

### Common Issues

#### Import Errors
```bash
Error: Cannot find package '@lev-os/testing'
```
**Solution:** Use relative import path until workspace configured:
```javascript
import { ... } from '../../../@lev-os/testing/src/simple-framework.js';
```

#### CLI Access Errors
```bash
Error: ./bin/lev not found
```
**Solution:** Ensure working directory is set to agent:
```javascript
process.chdir('../../../agent');
```

#### Permission Errors
```bash
Error: EACCES permission denied
```
**Solution:** Run tests from plugin directory with proper working directory:
```bash
cd plugins/@namespace/plugin && npm test
```

### Debug Mode

Enable verbose test output:

```javascript
// Add debug option to runLevCommand
const result = await runLevCommand(['plugin', 'command'], { debug: true });
```

## Integration with Monorepo Testing

### Root Level Commands

Plugin tests integrate with monorepo test orchestration:

```bash
# From repository root
npm run test:plugins    # Runs all plugin tests in parallel
npm run test:all       # Includes plugin tests in full validation
npm run test:e2e       # Includes plugin integration in E2E tests
```

### CI/CD Integration

Plugin tests are part of the standard CI pipeline:

```yaml
# Example CI configuration
- name: Test Plugin Ecosystem
  run: npm run test:plugins

- name: Full System Validation  
  run: npm run test:all
```

## Plugin Testing Checklist

### ✅ Before Publishing

- [ ] **CLI Integration**: All commands work via `lev plugin command`
- [ ] **JSON Output**: LLM-friendly structured responses available
- [ ] **Error Handling**: Graceful failures with helpful messages
- [ ] **Performance**: Commands meet response time requirements
- [ ] **Documentation**: Clear command descriptions and usage
- [ ] **Cross-Plugin**: Works with existing @lev-os infrastructure
- [ ] **Test Coverage**: All primary commands tested via real CLI

### ✅ Publishing Standards

- [ ] **Package.json**: Proper scripts and dependencies
- [ ] **Plugin Registration**: Implements CLI adapter interface
- [ ] **Namespace**: Unique namespace without conflicts
- [ ] **Test Suite**: Passes all integration tests
- [ ] **Documentation**: README with usage examples

This standard ensures that all Leviathan plugins maintain consistent quality and integration patterns, enabling a robust and extensible plugin ecosystem.