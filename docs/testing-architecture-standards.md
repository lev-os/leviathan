# Leviathan Testing Architecture Standards

## 🎯 Mission

Establish comprehensive testing standards across all Leviathan core packages and plugins, following the agent's proven testing structure as the gold standard.

## 📊 Current State Assessment

### ✅ Agent Testing (Exemplary Model)

- **Status**: 5/5 smoke tests passing + comprehensive structure
- **Structure**: unit/integration/e2e/performance/architectural layers
- **Coverage**: Adapters (CLI, MCP), core business logic, cross-component integration

### ❌ Core Packages (Critical Gaps)

- **core/testing**: ✅ 1 test file (framework-self.test.js)
- **core/workshop**: ✅ 1 test file (workshop.test.js)
- **core/debug**: ❌ No tests (foundational dependency)
- **core/memory**: ❌ No tests (critical system component)
- **core/commands**: ❌ No tests (process management)
- **core/validation**: ❌ No tests (input validation)

### ❌ Plugins (Minimal Coverage)

- **workflow-orchestrator**: ✅ 1 test file (orchestration.test.js)
- **jared-intelligence**: ✅ 1 test file (MCPAdapter.test.js)
- **constitutional-ai**: ❌ Empty tests directory
- **constitutional-framework**: ❌ No tests
- **eeps-system**: ❌ No tests
- **gemini-executor**: ❌ No tests

## 🏗️ Standardized Testing Architecture

### Core Package Testing Structure

```
core/{package}/tests/
├── unit/                    # Package-specific functionality (20-25 tests)
│   ├── core-logic.test.js   # Main business logic
│   ├── utilities.test.js    # Helper functions
│   ├── validators.test.js   # Input validation
│   └── exports.test.js      # Public API surface
├── integration/             # Cross-package integration (15-20 tests)
│   ├── agent-integration.test.js    # Agent system integration
│   ├── mcp-adapter.test.js          # MCP protocol integration
│   └── dependency-chain.test.js     # Package dependency testing
├── e2e/                     # End-to-end workflows (5-10 tests)
│   ├── cli-commands.test.js         # CLI interface testing
│   └── full-workflow.test.js        # Complete user workflows
└── performance/             # Performance benchmarks (3-5 tests)
    ├── load-testing.test.js         # Load and stress testing
    └── memory-usage.test.js         # Memory profiling
```

### Plugin Testing Structure

```
plugins/{plugin}/tests/
├── unit/                    # Plugin core logic (15-20 tests)
│   ├── commands.test.js     # Command implementations
│   ├── business-logic.test.js       # Core plugin functionality
│   └── configuration.test.js       # Plugin configuration
├── integration/             # System integration (10-15 tests)
│   ├── agent-integration.test.js   # Agent system integration
│   ├── mcp-tools.test.js           # MCP tool registration
│   └── cross-plugin.test.js        # Inter-plugin communication
└── e2e/                     # CLI/MCP interface (5-10 tests)
    ├── cli-commands.test.js        # CLI command testing
    └── mcp-workflow.test.js        # MCP protocol workflows
```

## 🔧 Testing Framework Standards (Toolkit Approach)

### 🎯 Toolkit Philosophy

**@lev-os/testing is designed as a flexible toolkit, not a prescriptive framework:**

- **Bring Your Own Test Runner**: Use Jest, Vitest, Node test, or any runner you prefer
- **Modular Utilities**: Import only what you need (PluginValidator, UniversalTestPatterns, etc.)
- **Framework Agnostic**: Works with any agent system (LangChain, OpenAI Evals, CrewAI, custom)
- **Optional Convenience**: Simple framework available for quick starts, but never required

### Test File Naming Convention

- **Unit Tests**: `{component}.test.js`
- **Integration Tests**: `{integration-type}.test.js`
- **E2E Tests**: `{workflow-name}.test.js`
- **Performance Tests**: `{benchmark-type}.test.js`

### Framework Flexibility Options

#### Option 1: Use @lev-os/testing/simple (Lightweight)

```javascript
// Minimal toolkit - bring your own test runner
import { describe, it, expect } from '@lev-os/testing/simple'
import { logger } from '@lev-os/debug'

describe('{Component/Feature} Tests', () => {
  it('should handle basic functionality', () => {
    // Test implementation using simple framework
  })
})
```

#### Option 2: Use Your Preferred Test Runner

```javascript
// Use Jest, Vitest, Node test, or any runner you prefer
import { describe, it, expect } from 'vitest' // or 'jest' or '@jest/globals'
import { UniversalTestPatterns, PluginValidator } from '@lev-os/testing'
import { logger } from '@lev-os/debug'

describe('{Component/Feature} Tests', () => {
  const patterns = new UniversalTestPatterns()

  it('should handle basic functionality', () => {
    // Use @lev-os/testing utilities with your preferred runner
  })
})
```

#### Option 3: Pure Node.js (No Framework)

```javascript
// Use Node.js built-in test runner or custom approach
import { test } from 'node:test'
import { PluginValidator, UniversalTestPatterns } from '@lev-os/testing'

test('{Component/Feature} Tests', async () => {
  // Use @lev-os/testing utilities without any framework dependency
})
```

## 📋 Multi-Agent Coordination Strategy

### Task Decomposition Pattern

1. **Master Agent**: Architecture definition, task export creation
2. **Package Agents**: Focused implementation (20-30 tests per package)
3. **Coordination**: Augment task management for handoffs

### Package Priority Matrix

```
Priority 1 (Foundational):
- core/testing (framework enhancement)
- core/debug (universal dependency)

Priority 2 (Critical):
- core/memory (system component)
- core/commands (process management)

Priority 3 (Important):
- core/validation (input validation)
- core/workshop (development tools)

Priority 4 (Plugins - Parallelizable):
- constitutional-ai
- workflow-orchestrator
- constitutional-framework
- eeps-system
- gemini-executor
```

### Agent Handoff Protocol

1. **Task Export**: Master creates package-specific markdown specifications
2. **Task Import**: Package agent imports focused task list
3. **Implementation**: Package agent implements tests following standards
4. **Validation**: Tests pass and integrate with existing framework
5. **Handoff**: Update task status, export results for next agent

## 🎯 Success Metrics

### Immediate Goals

- [ ] All core packages have standardized test structure
- [ ] Minimum 30 tests per core package
- [ ] All tests use @lev-os/testing framework

### Short-term Goals

- [ ] All plugins follow standardized testing structure
- [ ] CI/CD integration for automated testing
- [ ] Performance benchmarks established

### Long-term Goals

- [ ] AI/LLM testing patterns integrated
- [ ] Community plugin testing guidelines
- [ ] Cross-package integration test coverage

## 🚀 Implementation Phases

### Phase 1: Foundation (Current)

- Define architecture standards ✅
- Create testing templates
- Establish coordination protocols

### Phase 2: Core Package Implementation

- Implement tests for foundational packages (testing, debug)
- Add tests for critical packages (memory, commands)
- Validate integration with agent system

### Phase 3: Plugin Standardization

- Standardize plugin testing structure
- Implement tests for all plugins
- Establish cross-plugin integration tests

### Phase 4: Infrastructure Enhancement

- AI/LLM testing pattern integration
- Parallel test execution optimization
- CI/CD pipeline integration

This architecture ensures scalable, maintainable testing across the entire Leviathan ecosystem while leveraging Augment's task management for efficient multi-agent coordination.
