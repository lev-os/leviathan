# Hexagonal Architecture Compliance Report & Refactor Plan

## 🏗️ Current Architecture Status: **MAJOR VIOLATIONS DETECTED**

### ELI5 Summary
The system **claims** to follow hexagonal architecture ("adapters route, core computes") but the reality is **completely different**. The MCP adapter has become a **1,272-line monolith** stuffed with business logic, violating every principle we established.

## 🚨 Critical Architectural Violations

### 1. **MASSIVE MCP Adapter Bloat** (src/index.js - 1,272 lines)
```
❌ VIOLATION: Adapter contains business logic
❌ VIOLATION: 20+ switch cases with embedded logic  
❌ VIOLATION: Direct data manipulation in protocol layer
❌ VIOLATION: No separation between routing and computation
```

**Evidence:**
- 20+ `case` statements with business logic
- Direct workflow manipulation
- Session management in protocol adapter
- Template processing in MCP layer

**What Should Be:** 50-100 lines of pure protocol translation

### 2. **CLI Adapter Architecture** (src/adapters/cli/cli-adapter.js - 407 lines)
```
✅ GOOD: Proper separation with routers
✅ GOOD: Core command registry integration
⚠️  CONCERN: Still some business logic leakage in natural language processing
```

### 3. **Command Registry Auto-Bootstrap** (src/core/command-registry.js - 130 lines)
```
✅ EXCELLENT: Clean discovery pattern
✅ EXCELLENT: Pure routing without business logic
✅ EXCELLENT: Proper dependency injection
```

### 4. **Router Pattern Implementation**
```
✅ EXCELLENT: CheckpointRouter (306 lines) - proper domain separation
✅ EXCELLENT: FindRouter - delegates to core functions
✅ EXCELLENT: AgentRouter - clean routing only
```

## 📊 Test Coverage Analysis

### ✅ **Well-Tested Components**
- **Core Functions**: 7 test files covering business logic
- **CLI Adapter**: Integration tests with real CLI execution
- **Routers**: checkpoint-router.test.js shows proper mocking patterns

### ❌ **Test Coverage Gaps**
- **MCP Adapter**: No tests for 1,272-line monolith
- **Command Registry**: No tests for auto-discovery system
- **Plugin Integration**: No end-to-end plugin validation
- **Cross-Adapter**: No tests ensuring adapter consistency

## 🔌 Plugin Architecture Compliance

### ✅ **Good Plugin Structure** (@lev-os/*)
```
@lev-os/
├── cmd/           ✅ Proper structure with yaml config
├── debug/         ✅ Clean separation, proper exports  
├── testing/       ✅ Comprehensive test infrastructure
└── validation/    ✅ Multi-validator pattern
```

### ⚠️ **Plugin Integration Issues**
- Plugin commands not auto-discovered by command registry
- No standardized plugin → core → adapter flow
- Plugin tests don't validate MCP adapter integration

## 📏 Code Guidelines Compliance

### Enhanced Coding Standards Status
- **100-150 line threshold**: ❌ MCP adapter violates (1,272 lines)
- **Human + agent optimization**: ⚠️ Partial compliance
- **Domain separation**: ❌ Major violations in MCP adapter

### File Size Analysis
```
✅ GOOD: CLI routers (150-300 lines each)
✅ GOOD: Core commands (100-400 lines each)  
✅ GOOD: Command registry (130 lines)
❌ BAD: MCP adapter (1,272 lines)
```

## 🎯 **REFACTOR PLAN: EMERGENCY SURGERY**

### Phase 1: **MCP Adapter Extraction** (HIGH PRIORITY)
```
GOAL: Reduce src/index.js from 1,272 → ~100 lines

EXTRACT:
1. Business logic → src/commands/ (new command files)
2. Workflow logic → src/core/workflows/
3. Session logic → src/core/sessions/  
4. Template logic → src/core/templates/
5. Intelligence logic → src/core/intelligence/

RESULT: Pure MCP protocol translation only
```

### Phase 2: **Command Registry Integration** (HIGH PRIORITY)  
```
GOAL: All MCP tools auto-discovered from src/commands/

IMPLEMENT:
1. Extract 20+ MCP tools to command files
2. Auto-discovery integration in MCP adapter
3. Remove manual tool registration
4. Standardize MCP tool export pattern

RESULT: Zero-configuration MCP tool exposure
```

### Phase 3: **Test Coverage Completion** (MEDIUM PRIORITY)
```
GOAL: Comprehensive test coverage for architectural compliance

ADD:
1. MCP adapter integration tests
2. Command registry auto-discovery tests  
3. Plugin → adapter integration tests
4. Cross-adapter consistency tests

RESULT: Architectural violations impossible
```

### Phase 4: **Plugin Integration Standardization** (MEDIUM PRIORITY)
```
GOAL: Seamless plugin → core → adapter flow

STANDARDIZE:
1. Plugin command discovery by command registry
2. Plugin MCP tool auto-generation
3. Plugin CLI integration testing
4. Plugin cross-adapter validation

RESULT: Community plugin ecosystem ready
```

## 🚀 **Parallel Execution Strategy**

### **CAN DO IN PARALLEL:**
1. **MCP Extraction** + **Command Creation** (different developers)
2. **Test Writing** + **Plugin Standardization** (independent)
3. **CLI Improvements** + **MCP Refactor** (different adapters)

### **MUST DO SEQUENTIALLY:**
1. MCP extraction BEFORE command registry integration
2. Core extraction BEFORE test writing  
3. Command standardization BEFORE plugin integration

## 📋 **Success Metrics**

### **File Size Targets**
- `src/index.js`: 1,272 → 100 lines (92% reduction)
- `src/commands/`: 7 → 20+ command files
- Test coverage: 40% → 85%

### **Architectural Compliance**
- ✅ Adapters only route (no business logic)
- ✅ Core functions only compute (no protocol handling)
- ✅ Commands auto-discovered and exposed consistently
- ✅ Plugins integrate seamlessly across all adapters

### **Developer Experience**
- ✅ Add command file → works in CLI + MCP automatically
- ✅ Plugin development follows standard patterns
- ✅ Test failures prevent architectural violations
- ✅ Documentation matches implementation reality

---

## ⚡ **IMMEDIATE NEXT ACTIONS**

1. **EXTRACT MCP BUSINESS LOGIC** - Create 20+ command files from MCP adapter
2. **IMPLEMENT MCP AUTO-DISCOVERY** - Use command registry pattern  
3. **ADD ARCHITECTURAL TESTS** - Prevent future violations
4. **VALIDATE PLUGIN FLOW** - End-to-end plugin integration

**TIME ESTIMATE:** 4-6 hours of focused refactoring to restore architectural integrity

**RISK LEVEL:** High - Current architecture violations will compound as system scales

**PRIORITY:** Emergency - Fix before any new feature development