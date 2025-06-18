# Adapter Testing Guide

## Overview

This guide documents the adapter testing methodology for Leviathan's hexagonal architecture. Adapter tests verify external interfaces (Claude Code, MCP, APIs) separately from core business logic, enabling independent development and deployment of different integration layers.

## Philosophy: Why Adapter-Specific Testing?

### Hexagonal Architecture Alignment
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Adapter │     │   MCP Adapter   │     │   API Adapter   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Core Logic   │
                         │  (Pure Domain) │
                         └────────────────┘
```

**Benefits:**
- **Isolation**: Test adapters independently without coupling to core logic
- **Scalability**: Add new adapters without affecting existing test suites
- **Development Speed**: Teams can work on different adapters in parallel
- **Quality Assurance**: Verify external interfaces work correctly

### Test Categories by Layer
- **Adapter Tests**: External interface behavior and integration
- **Core Tests**: Business logic and domain rules
- **Integration Tests**: End-to-end workflows across all layers

## Case Study: Claude Code Adapter (30/30 Tests Passing)

### Architecture Overview
Our Claude Code adapter implementation serves as the template for all future adapter testing:

```
agent/tests/adapters/cli/e2e/claude/
├── doc-command.test.js        # Documentation Shepherd (6 tests)
├── sitrep-command.test.js     # Project Assessment (6 tests)  
├── validate-command.test.js   # Anti-Hallucination (7 tests)
├── worktree-command.test.js   # Git Workflows (11 tests)
├── run-all.js                 # Test Orchestrator
└── README.md                  # Implementation Documentation
```

### Test Structure Pattern
Each adapter test follows this consistent structure:

```javascript
export class CommandNameE2E {
  constructor() {
    this.testName = 'Command Name E2E';
    this.results = [];
  }

  async runTest(name, testFn) {
    console.log(`  🧪 ${name}`);
    try {
      const result = await testFn();
      console.log(`  ✅ PASS: ${name}`);
      this.results.push({ name, status: 'PASS', result });
      return result;
    } catch (error) {
      console.log(`  ❌ FAIL: ${name} - ${error.message}`);
      this.results.push({ name, status: 'FAIL', error: error.message });
      throw error;
    }
  }

  // Individual test methods
  async testCommandFileExists() { /* ... */ }
  async testFunctionalRequirements() { /* ... */ }
  async testIntegrationPoints() { /* ... */ }

  async runAllTests() {
    console.log(`🎯 ${this.testName}`);
    const tests = [
      () => this.testCommandFileExists(),
      () => this.testFunctionalRequirements(),
      () => this.testIntegrationPoints()
    ];

    let passed = 0, failed = 0;
    for (const test of tests) {
      try {
        await test();
        passed++;
      } catch (error) {
        failed++;
      }
    }

    return { success: failed === 0, passed, failed, total: tests.length };
  }
}
```

### Execution Modes

#### Individual Test Execution
```bash
# Test specific command
npm run test:adapter:cli:single:doc
npm run test:adapter:cli:single:sitrep
npm run test:adapter:cli:single:validate
```

#### Suite Execution
```bash
# Test entire Claude adapter
npm run test:adapter:cli:e2e:claude

# Test all CLI adapters
npm run test:adapter:cli
```

#### Integration with Unified Testing
```bash
# Discover all adapter tests
npm run test:discover

# Run all E2E tests (includes adapter tests)
npm run test:e2e

# Run complete test suite
npm run test:all
```

## Implementation Template for New Adapters

### 1. Directory Structure
```
agent/tests/adapters/{adapter-type}/e2e/{specific-adapter}/
├── {feature1}-test.js
├── {feature2}-test.js
├── {feature3}-test.js
├── run-all.js
└── README.md
```

**Examples:**
- `agent/tests/adapters/mcp/e2e/taskmaster/` - MCP TaskMaster integration
- `agent/tests/adapters/api/e2e/rest/` - REST API endpoints
- `agent/tests/adapters/websocket/e2e/realtime/` - WebSocket connections

### 2. Test Class Template
```javascript
#!/usr/bin/env node
/**
 * E2E Test: {Adapter Feature} 
 * Tests {specific functionality} through {adapter type}
 */

import { promises as fs } from 'fs';
import path from 'path';

export class {AdapterFeature}E2E {
  constructor() {
    this.testName = '{Adapter Feature} E2E';
    this.results = [];
  }

  // Copy runTest method from Claude adapter template
  async runTest(name, testFn) { /* ... */ }

  // Implement adapter-specific test methods
  async testAdapterConnection() {
    return this.runTest('Adapter connection', async () => {
      // Test external system connectivity
    });
  }

  async testCoreIntegration() {
    return this.runTest('Core integration', async () => {
      // Test adapter-to-core communication
    });
  }

  async testErrorHandling() {
    return this.runTest('Error handling', async () => {
      // Test failure scenarios and recovery
    });
  }

  // Implement runAllTests following Claude adapter pattern
  async runAllTests() { /* ... */ }
}

// Enable individual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new {AdapterFeature}E2E();
  const result = await test.runAllTests();
  process.exit(result.success ? 0 : 1);
}
```

### 3. Orchestrator Template
```javascript
#!/usr/bin/env node
/**
 * {Adapter Type} E2E Test Suite Runner
 * Orchestrates all {adapter type} tests
 */

import { {Feature1}E2E } from './{feature1}-test.js';
import { {Feature2}E2E } from './{feature2}-test.js';

class {AdapterType}E2ESuite {
  constructor() {
    this.suiteName = '{Adapter Type} E2E Tests';
    this.tests = [
      { name: '{Feature1}', class: {Feature1}E2E },
      { name: '{Feature2}', class: {Feature2}E2E }
    ];
  }

  // Copy methods from Claude adapter orchestrator
  async runSingleTest(testName) { /* ... */ }
  async runAllTests() { /* ... */ }
}

// Implementation following Claude adapter pattern
```

### 4. Package.json Integration
```json
{
  "scripts": {
    "test:adapter:{type}:e2e:{name}": "node tests/adapters/{type}/e2e/{name}/run-all.js",
    "test:adapter:{type}:single:{feature}": "node tests/adapters/{type}/e2e/{name}/{feature}-test.js"
  }
}
```

## Integration with Unified Testing System

### Test Discovery Integration
The unified testing system automatically discovers adapter tests through:

1. **File Pattern Recognition**: `tests/adapters/**/*.test.js`
2. **Export Pattern**: Tests export class with `E2E` suffix
3. **Method Pattern**: Tests implement `runAllTests()` method
4. **Metadata**: Tests provide name, type, and dependency information

### Execution Priority
```
1. Smoke Tests      - Quick validation
2. Core Tests       - Business logic
3. Adapter Tests    - External interfaces  
4. Integration Tests - End-to-end workflows
5. Dogfooding Tests - Real-world scenarios
```

### CI/CD Pipeline Integration
```yaml
# Example GitHub Actions integration
test-adapters:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      adapter: [cli, mcp, api, websocket]
  steps:
    - run: npm run test:adapter:${{ matrix.adapter }}
```

## Best Practices

### 1. Test Independence
- Each adapter test should run independently
- No shared state between adapter types
- Mock external dependencies when needed

### 2. Error Handling
- Test both success and failure scenarios
- Verify error messages and recovery behavior
- Include timeout and retry logic tests

### 3. Performance Considerations
- Use timeouts for external system calls
- Implement test data cleanup
- Consider parallel execution for large test suites

### 4. Documentation
- Include README.md in each adapter test directory
- Document test scenarios and expected outcomes
- Provide setup instructions for external dependencies

### 5. Maintenance
- Regular review of test coverage
- Update tests when adapter interfaces change
- Archive tests for deprecated adapters

## Scaling to New Adapters

### MCP Adapter Testing (Planned)
```
agent/tests/adapters/mcp/e2e/
├── taskmaster/        # TaskMaster MCP server
├── filesystem/        # File operations MCP
├── database/          # Database MCP tools
└── semantic-search/   # Vector search MCP
```

### API Adapter Testing (Planned)
```
agent/tests/adapters/api/e2e/
├── rest/              # REST API endpoints
├── graphql/           # GraphQL operations  
├── webhook/           # Webhook integrations
└── auth/              # Authentication flows
```

### WebSocket Adapter Testing (Future)
```
agent/tests/adapters/websocket/e2e/
├── realtime/          # Real-time communications
├── streaming/         # Data streaming
└── notifications/     # Push notifications
```

## Success Metrics

### Quality Gates
- **Test Coverage**: >90% of adapter interface methods
- **Pass Rate**: 100% for production deployment
- **Execution Time**: <30 seconds per adapter suite
- **Reliability**: <1% flaky test rate

### Performance Benchmarks
- Individual test: <5 seconds
- Adapter suite: <30 seconds  
- All adapter tests: <5 minutes
- Full test pipeline: <15 minutes

### Monitoring and Alerting
- Failed test notifications
- Performance regression detection
- Test execution metrics dashboard
- Coverage trend analysis

## Conclusion

Adapter testing provides the foundation for scalable, maintainable testing in Leviathan's hexagonal architecture. The Claude Code adapter implementation demonstrates the pattern's effectiveness with 30/30 tests passing and provides a proven template for all future adapter development.

By following this guide, teams can:
- Develop adapters independently with confidence
- Maintain high quality standards across all integration points
- Scale testing infrastructure as the system grows
- Ensure reliable operation of external interfaces

The adapter testing methodology is essential for Leviathan's vision as the "Linux of AI" - a foundational platform that anyone can extend and modify while maintaining system reliability and quality.