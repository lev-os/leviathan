# Complete Plan: Test Solidification + Hexagonal Architecture Refactor

## Overview

Integrate the completed Claude Commands work with our hexagonal architecture refactor, fix all test issues, update documentation, and complete the full hex refactor. This combines two parallel workstreams into a cohesive final architecture.

## Current State Analysis

### What's Working ✅
- **Hexagonal Architecture Phase 1-2**: Core SDK extracted, CLI adapter implemented
- **Claude Commands**: 3 production commands with 19/19 passing E2E tests
- **Basic CLI functionality**: Help, status, checkpoint commands working
- **--session argument fix**: Implemented and functional

### What Needs Integration 🔄
- **Test Structure**: Merge two different test approaches into unified hex architecture
- **CheckpointRouter**: Complete function call integration fixes
- **Documentation**: Update CLAUDE.md for hex architecture + proper testing methodology
- **Package.json**: Align scripts with new test structure

### What Needs Completion 🚧
- **Phase 3**: MCP Adapter extraction from monolithic src/index.js
- **Phase 4**: Plugin system demonstration with @lev/workshop plugin

## Part 1: Test Solidification & Integration

### 1.1 Create Proper Test Architecture Structure

**New Test Organization:**
```
tests/
├── core/                          # Core SDK unit tests
│   ├── agents/                    # Agent management tests
│   ├── sessions/                  # Session management tests
│   └── discovery/                 # Context search tests
├── adapters/                      # Adapter-specific tests
│   ├── cli/                       # CLI adapter tests
│   │   ├── unit/                  # CLI adapter unit tests
│   │   ├── integration/           # CLI integration tests
│   │   └── e2e/                   # End-to-end tests
│   │       └── claude/            # Claude Code E2E tests (from other workstream)
│   └── mcp/                       # MCP adapter tests (future)
├── smoke/                         # Quick validation tests
└── dogfooding/                    # Real workflow BDD tests
```

### 1.2 Integrate Claude Commands E2E Tests

**Move and Adapt Existing Tests:**
- Move `tests/e2e/claude/` → `tests/adapters/cli/e2e/claude/`
- Preserve all 19 tests and their 100% pass rate
- Update import paths to use new core/adapter structure
- Keep individual test execution capability

**Update Package.json Scripts:**
```json
{
  "scripts": {
    "test": "npm run test:smoke && npm run test:core && npm run test:adapters",
    "test:smoke": "node tests/smoke/command-routing-simple.test.js",
    "test:core": "node tests/run-core-tests.js",
    "test:adapters": "npm run test:adapter:cli",
    "test:adapter:cli": "node tests/adapters/cli/run-all.js",
    "test:adapter:cli:e2e:claude": "node tests/adapters/cli/e2e/claude/run-all.js",
    "test:adapter:cli:single:doc": "node tests/adapters/cli/e2e/claude/doc-command.test.js",
    "test:adapter:cli:single:sitrep": "node tests/adapters/cli/e2e/claude/sitrep-command.test.js",
    "test:adapter:cli:single:validate": "node tests/adapters/cli/e2e/claude/validate-command.test.js",
    "test:dogfooding": "node tests/dogfooding/checkpoint-workflows.test.js",
    "test:workflows": "npm run test:dogfooding"
  }
}
```

### 1.3 Fix Current Test Integration Issues

**Complete CheckpointRouter Function Call Fixes:**
- Fix remaining function call pattern: `(this.method || this.checkpointCore.method)()`
- Ensure all router methods work with individual core functions
- Verify 6/6 workflow tests pass

**Update Test Expectations:**
- Update dogfooding tests to expect new CLI adapter output formats
- Fix backward compatibility formatter to maintain test compatibility
- Ensure session initialization output matches test expectations

### 1.4 Create Core SDK Test Suite

**Core Unit Tests (New):**
```
tests/core/
├── agents/agent-manager.test.js      # Test pure agent logic
├── sessions/session-manager.test.js  # Test session lifecycle
├── sessions/checkpoint-core.test.js  # Test checkpoint creation
└── discovery/context-search.test.js  # Test context search
```

**Benefits:**
- Fast unit tests with no external dependencies
- Test business logic independent of adapters
- Enable TDD for core functionality

## Part 2: Documentation Updates

### 2.1 Update agent/CLAUDE.md

**Add Hexagonal Architecture Section:**
```markdown
## Hexagonal Architecture

**Core SDK (Business Logic):**
- `src/core/agents/` - Agent management and loading
- `src/core/sessions/` - Session lifecycle and checkpoints  
- `src/core/discovery/` - Context search and workflow discovery

**CLI Adapter (First Interface):**
- `src/adapters/cli/` - Command-line interface
- Extensible command registry for plugin commands
- Specialized routers (find, checkpoint, agent)
- Multiple formatters (Claude whisper mode, full output, JSON)

**MCP Adapter (Second Interface):**
- `src/adapters/mcp/` - Model Context Protocol server
- Maps core functions to MCP tools
- Protocol-specific request/response handling

**Plugin Extension Pattern:**
- Plugins register commands with CLI adapter
- Plugins use core SDK functions directly
- Clean separation between core logic and presentation
```

**Add E2E Testing Methodology:**
```markdown
## Testing Philosophy

**Test Architecture Matching System Architecture:**
- `tests/core/` - Unit tests for business logic (fast, isolated)
- `tests/adapters/cli/` - CLI adapter tests (integration + E2E)  
- `tests/adapters/mcp/` - MCP adapter tests (protocol validation)
- `tests/smoke/` - Quick system health checks

**E2E Testing via Claude Code Subprocesses:**
- Tests use `claude --print --dangerously-skip-permissions`
- Validate real user workflows, not implementation details
- Preserve session continuity and cross-session timeline testing
- Test actual command output formats users see

**Dogfooding Tests:**
- Validate daily usage patterns (checkpoint workflows)
- BDD-style tests focusing on user stories
- Real command execution via ./bin/lev binary
```

**Remove Dead Code References:**
- Replace all `lev ping` references with `lev checkpoint`
- Update natural language detection patterns
- Update session management examples

### 2.2 Update Development Workflow Documentation

**Add Hex Architecture Development Patterns:**
- How to add new core functions
- How to extend CLI adapter commands  
- How to create new adapters (API, Web UI)
- Plugin development guidelines

## Part 3: Complete Hexagonal Architecture Refactor

### 3.1 Phase 3: MCP Adapter Extraction

**Extract MCP Server from src/index.js (1,238 lines):**
```
src/adapters/mcp/
├── mcp-adapter.js           # Main MCP server entry point
├── tool-mappers/           # Map core functions to MCP tools
│   ├── agent-tools.js      # Agent-related MCP tools
│   ├── session-tools.js    # Session/checkpoint MCP tools
│   └── discovery-tools.js  # Context search MCP tools
├── schema-generators/      # Generate MCP tool schemas
└── formatters/            # MCP-specific response formatting
```

**MCP Adapter Implementation:**
- Import core SDK functions
- Map each core function to corresponding MCP tool
- Handle MCP protocol specifics (request/response format)
- Remove MCP concerns from core business logic

### 3.2 Phase 4: Plugin System Demonstration

**Create @lev/workshop Plugin:**
- Demonstrate new extensible architecture
- Show how plugins extend CLI adapter
- Validate plugin extension patterns
- Serve as template for community plugins

### 3.3 Update Existing Plugins

**Update @lev-os Plugins:**
- Ensure compatibility with new Core SDK
- Update to use new CLI adapter extension points
- Test plugin functionality with new architecture

## Part 4: Integration Testing & Validation

### 4.1 Test Suite Execution Order

**Development Testing Workflow:**
```bash
# 1. Quick smoke test (seconds)
npm run test:smoke

# 2. Core logic validation (fast)
npm run test:core

# 3. CLI adapter integration (comprehensive)
npm run test:adapter:cli

# 4. Claude Code E2E validation (real usage)
npm run test:adapter:cli:e2e:claude

# 5. Dogfooding workflow tests (BDD)
npm run test:dogfooding

# 6. Full suite (CI/CD)
npm test
```

### 4.2 Integration Validation

**Architecture Validation:**
- ✅ Core SDK functions work independently
- ✅ CLI adapter correctly uses core functions
- ✅ MCP adapter correctly maps core functions
- ✅ Plugins can extend CLI adapter
- ✅ All adapters produce consistent behavior

**Test Results Targets:**
- Core tests: 15+ tests passing (new unit tests)
- CLI adapter tests: 25+ tests passing (integration + E2E)
- Claude E2E tests: 19/19 tests passing (preserve existing)
- Dogfooding tests: 6/6 tests passing (fix current issues)
- Smoke tests: 5/5 tests passing (already working)

## Part 5: Final Documentation & Cleanup

### 5.1 Update All Documentation

**Update package.json:**
- Fix test script organization
- Update keywords and description
- Align with hexagonal architecture terminology

**Update README and docs:**
- Remove MCP-centric language
- Position as "Operating System/Super Agent Framework"
- Document adapter pattern and extensibility

### 5.2 Performance Validation

**Ensure No Regressions:**
- CLI startup time equivalent or faster
- Memory usage within acceptable bounds
- Response times maintained or improved

### 5.3 Plugin Template Creation

**Create Plugin Development Template:**
- Starter template for community plugins
- Documentation for plugin developers
- Example of proper core SDK usage

## Success Criteria

### Technical Success ✅
- **All tests passing**: Core (15+), CLI (25+), Claude E2E (19), Dogfooding (6), Smoke (5)
- **Clean architecture**: Clear separation between core, adapters, plugins
- **No breaking changes**: Existing functionality preserved
- **Performance maintained**: No regressions in speed or memory

### Documentation Success ✅
- **CLAUDE.md updated**: Reflects actual architecture and testing philosophy
- **Testing methodology documented**: Clear guidance for each test type
- **Development workflow updated**: How to work with hex architecture
- **Plugin development guide**: Template and examples provided

### Architecture Success ✅
- **Extensible design**: Easy to add new adapters and plugins
- **Maintainable code**: Clear module boundaries and responsibilities  
- **Testable structure**: Each layer can be tested independently
- **Production ready**: All adapters working with real user workflows

## Implementation Timeline

**Session 1 (Current):** Test integration + CheckpointRouter fixes + CLAUDE.md updates
**Session 2:** MCP adapter extraction + Plugin system
**Session 3:** Final testing + Documentation + Performance validation

This plan integrates two parallel workstreams, completes the hexagonal architecture refactor, and establishes a robust testing methodology that scales with the new architecture.