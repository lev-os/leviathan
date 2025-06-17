# DEV.MD - Google-Style Coding Constitutional Framework

## 🎯 MISSION
Enforce Google-style coding standards for OS-level code quality while maintaining FlowMind LLM-first architectural principles.

## 📏 CORE STANDARDS

### Single Responsibility Principle (SRP)
- **Max 50-100 lines per file**
- **One class per file**
- **One responsibility per class**
- **Clear, descriptive file names**

### File Organization
```
src/
├── core/
│   ├── FlowMind.js              # Universal context interface
│   ├── FlowMind.test.js         # Colocated test
│   └── index.js                 # Clean exports
├── registry/
│   ├── ContextRegistry.js       # File loading & discovery
│   ├── ContextRegistry.test.js  # Colocated test
│   ├── ContextLoader.js         # File system operations
│   ├── ContextLoader.test.js    # Colocated test
│   └── index.js                 # Registry exports
├── assembly/
│   ├── ContextAssembler.js      # Recipe assembly
│   ├── ContextAssembler.test.js # Colocated test
│   ├── RecipeEngine.js          # Recipe parsing
│   ├── RecipeEngine.test.js     # Colocated test
│   └── index.js                 # Assembly exports
```

### Test Colocation
- **Every .js file has a .test.js file next to it**
- **No separate /tests/ directory for unit tests**
- **Integration tests in tests/integration/**
- **Clear test-to-source mapping**

## 🏗️ ARCHITECTURAL CONSTRAINTS

### FlowMind Constitutional Integration
```javascript
/**
 * CONSTITUTIONAL HEADER - Required in every file
 * 
 * FlowMind Principle: [STATE WHICH PRINCIPLE THIS FILE SERVES]
 * - LLM IS THE RUNTIME: This file [enables/orchestrates] LLM reasoning
 * - EVERYTHING IS A CONTEXT: This file [operates on/creates] FlowMind contexts
 * - BIDIRECTIONAL FLOW: This file [enables/participates in] context switching
 * - YAML IS TRUTH: This file [preserves/respects] 1:1 YAML mapping
 * - NEVER MOCK: This file [leaves TODOs/enables real LLM evaluation]
 */
```

### LLM-First Enforcement
- **No mock semantic evaluation** - Use TODOs for future LLM integration
- **No hardcoded intelligence** - Context switching creates intelligence
- **No complex business logic** - LLM reasons, code orchestrates
- **1:1 YAML mapping** - Preserve structure, don't normalize

### Module Boundaries
- **No circular dependencies**
- **Clear import paths** 
- **Explicit exports in index.js**
- **Dependency injection over globals**

## 🔍 CODE REVIEW CHECKLIST

### File Structure ✅
- [ ] File is 50-100 lines max
- [ ] Has single, clear responsibility
- [ ] Constitutional header present
- [ ] Colocated test file exists
- [ ] Clean imports/exports

### FlowMind Compliance ✅
- [ ] No mock functions for LLM evaluation
- [ ] YAML structure preserved (no flattening)
- [ ] Context switching enabled, not intelligence created
- [ ] LLM-first principle maintained
- [ ] TODOs for semantic features

### Code Quality ✅
- [ ] Clear, descriptive names
- [ ] No complex nested logic
- [ ] Error handling appropriate
- [ ] Documentation for public methods
- [ ] No dead code

### Testing ✅
- [ ] Test file next to source
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests cover public interface
- [ ] Integration tests for MCP tools
- [ ] No test isolation violations

## 📦 REFACTORING GUIDELINES

### Breaking Apart Large Files
```javascript
// BEFORE: monolithic-class.js (300+ lines)
class MonolithicClass {
  // Multiple responsibilities mixed together
}

// AFTER: Single responsibility files
// core-functionality.js (80 lines)
// validation-logic.js (60 lines)  
// error-handling.js (40 lines)
// Each with colocated tests
```

### Class-Per-Folder Pattern
```
src/context-assembler/
├── ContextAssembler.js      # Main class (80 lines)
├── ContextAssembler.test.js # Colocated test
├── RecipeEngine.js          # Helper class (60 lines)
├── RecipeEngine.test.js     # Colocated test
├── AssemblyRules.js         # Helper class (70 lines)
├── AssemblyRules.test.js    # Colocated test
└── index.js                 # Clean exports
```

### Moving Responsibilities
1. **Identify mixed responsibilities** in large files
2. **Extract to focused classes** with single purpose
3. **Create colocated tests** for each new file
4. **Update imports** to use new structure
5. **Validate all tests pass** after refactoring

## 🚨 ANTI-PATTERNS TO AVOID

### Code Smells ❌
- **God Objects** - Classes doing too many things
- **Long Parameter Lists** - Use configuration objects
- **Deep Nesting** - Extract methods for clarity
- **Unclear Naming** - Be explicit about purpose
- **Hidden Dependencies** - Make imports explicit

### FlowMind Violations ❌
- **Mock Semantic Evaluation** - `Math.random()` for decisions
- **Hardcoded Intelligence** - Complex business logic in code
- **YAML Normalization** - Flattening hierarchical structure
- **Class Inheritance** - Use type property instead
- **Code-Based Intelligence** - LLM should reason, not code

### Architecture Violations ❌
- **Circular Dependencies** - A imports B imports A
- **Mixed Concerns** - Loading + assembly in same file
- **Global State** - Use dependency injection
- **Tight Coupling** - Components know too much about each other

## 🛠️ DEVELOPMENT WORKFLOW

### File Creation Process
1. **Constitutional Header** - State FlowMind principle served
2. **Single Responsibility** - Clear, focused purpose
3. **Test File** - Create `.test.js` immediately
4. **Clean Interface** - Minimal, clear public methods
5. **Documentation** - JSDoc for public methods

### Refactoring Process
1. **Analyze Responsibilities** - What does this file do?
2. **Identify Boundaries** - Where to split?
3. **Extract Classes** - One responsibility per file
4. **Create Tests** - Colocated with new files
5. **Update Imports** - Fix all references
6. **Validate** - All tests pass, functionality preserved

### Code Review Process
1. **Checklist Review** - Use checklist above
2. **Constitutional Review** - FlowMind principles maintained?
3. **Architecture Review** - Clean boundaries?
4. **Test Review** - Adequate coverage?
5. **Performance Review** - No obvious bottlenecks?

## 📊 METRICS & MONITORING

### File Metrics
- **Average file size**: Target 50-80 lines
- **Max file size**: Hard limit 100 lines
- **Test coverage**: 100% of public methods
- **Import depth**: Max 3 levels

### Quality Metrics
- **Cyclomatic complexity**: Max 5 per method
- **Method length**: Max 20 lines
- **Parameter count**: Max 4 parameters
- **Dependency count**: Max 5 imports per file

### FlowMind Metrics
- **Mock functions**: 0 (use TODOs instead)
- **YAML preservation**: 100% (no normalization)
- **Context switching**: Enabled in all workflows
- **LLM-first**: All intelligence via LLM

## 🎯 ENFORCEMENT

### Pre-Commit Hooks
```bash
# File size check
find src -name "*.js" -exec wc -l {} \; | awk '$1 > 100 { print "File too large: " $2 }'

# Test colocation check  
find src -name "*.js" ! -name "*.test.js" ! -name "index.js" | while read file; do
  test_file="${file%.js}.test.js"
  if [ ! -f "$test_file" ]; then
    echo "Missing test file: $test_file"
  fi
done

# Constitutional header check
grep -L "FlowMind Principle:" src/**/*.js
```

### Review Requirements
- **Every file change** requires checklist review
- **Architectural changes** require ADR update
- **New patterns** require documentation update
- **Performance impact** requires measurement

## 🏆 SUCCESS CRITERIA

### File Organization Success
- ✅ All files under 100 lines
- ✅ Every .js has colocated .test.js
- ✅ Clear single responsibility per file
- ✅ No circular dependencies

### FlowMind Constitutional Success
- ✅ No mock semantic evaluation
- ✅ YAML structure preserved
- ✅ Context switching enabled
- ✅ LLM-first principles maintained

### Code Quality Success
- ✅ Clear, readable code
- ✅ Comprehensive test coverage
- ✅ Clean module boundaries
- ✅ OS-level review quality

---

**This framework ensures every line of code meets OS-level quality standards while preserving FlowMind's revolutionary LLM-first architecture.**