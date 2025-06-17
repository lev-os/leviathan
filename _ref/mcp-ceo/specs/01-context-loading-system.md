# Spec 01: Context Loading System
## BDD Specification for Robust Context Loading and Property Resolution

### Overview
Fix the context loading system to handle real YAML structures and provide consistent property access patterns. This is the foundation that enables FlowMind, dynamic workflows, and all higher-level features.

## Problem Statement
- **49/93 tests failing** due to context property mismatches
- Tests expect `name: "ceo"` but YAML contains `metadata.name: "Chief Executive Officer"`
- Context loaders assume flat structure but YAML is hierarchical
- No consistent property resolution strategy across different context types

## Solution Design
Create a **Context Property Resolver** that provides consistent access to context properties regardless of the underlying YAML structure.

---

## Feature: Context Property Resolution

### Background
```yaml
# Actual YAML structure in contexts/agents/ceo/context.yaml
metadata:
  type: "agent"
  id: "ceo"  
  name: "Chief Executive Officer"
  version: "3.0.0"

agent_config:
  capabilities: [...]
```

```javascript
// Expected test access patterns
expect(context).to.have.property("name", "ceo")           // Should work
expect(context.id).to.equal("ceo")                        // Should work  
expect(context.type).to.equal("agent")                    // Should work
expect(context.capabilities).to.be.an('array')            // Should work
```

### Scenario: Load CEO agent context with property normalization
**Given** a YAML context file at "contexts/agents/ceo/context.yaml"
**And** the file contains hierarchical metadata structure
**When** the context is loaded via ContextAssembler
**Then** the context should provide normalized property access
**And** `context.name` should equal "ceo" (from metadata.id)
**And** `context.displayName` should equal "Chief Executive Officer" (from metadata.name)
**And** `context.type` should equal "agent" (from metadata.type)
**And** `context.capabilities` should be the capabilities array
**And** `context._raw` should contain the original YAML structure

### Scenario: Load workflow context with different property structure  
**Given** a workflow context with different YAML structure
**When** the context is loaded
**Then** properties should be normalized using workflow-specific rules
**And** consistent access patterns should work across all context types

### Scenario: Context loading performance requirements
**Given** multiple context files need to be loaded
**When** loading 100 contexts simultaneously
**Then** all contexts should load in under 100ms total
**And** each individual context should load in under 5ms
**And** caching should prevent redundant file reads

---

## Feature: Context Type Auto-Detection

### Scenario: Auto-detect agent context type
**Given** a context file with `metadata.type: "agent"`
**When** the file is loaded
**Then** it should be classified as an agent context
**And** agent-specific property normalization should be applied

### Scenario: Auto-detect workflow context type  
**Given** a context file with workflow-specific structure
**When** the file is loaded
**Then** it should be classified as a workflow context
**And** workflow-specific property normalization should be applied

---

## Feature: Error Handling and Validation

### Scenario: Handle missing files gracefully
**Given** a context path that doesn't exist
**When** attempting to load the context
**Then** a ContextLoadError should be thrown
**And** the error should include the attempted path
**And** the error should be logged appropriately

### Scenario: Handle malformed YAML
**Given** a context file with invalid YAML syntax
**When** attempting to load the context
**Then** a ContextParseError should be thrown
**And** the error should include line/column information
**And** helpful debugging information should be provided

### Scenario: Validate required properties
**Given** a context file missing required properties
**When** the context is loaded
**Then** a ContextValidationError should be thrown
**And** all missing properties should be listed
**And** suggestions for fixes should be provided

---

## Implementation Requirements

### Core Classes

```javascript
class ContextPropertyResolver {
  // Normalize properties based on context type
  normalize(rawContext, contextType) { /* ... */ }
  
  // Get property with fallback chain
  getProperty(context, propertyPath, fallbacks = []) { /* ... */ }
  
  // Validate context structure
  validate(context, schema) { /* ... */ }
}

class EnhancedContextLoader extends ContextAssembler {
  constructor() {
    super()
    this.resolver = new ContextPropertyResolver()
    this.cache = new Map()
  }
  
  async loadContext(path) {
    // Load, normalize, cache, and return context
  }
}
```

### Property Normalization Rules

```javascript
const NORMALIZATION_RULES = {
  agent: {
    name: 'metadata.id',           // Use ID as canonical name
    displayName: 'metadata.name',  // Full name for display
    type: 'metadata.type',
    version: 'metadata.version',
    capabilities: 'agent_config.capabilities'
  },
  
  workflow: {
    name: 'metadata.id',
    displayName: 'metadata.name',
    type: 'metadata.type',
    steps: 'workflow_config.steps',
    totalSteps: 'workflow_config.total_steps'
  }
}
```

---

## Unit Tests Required

### Test Suite: ContextPropertyResolver
```javascript
describe('ContextPropertyResolver', () => {
  it('should normalize agent context properties')
  it('should normalize workflow context properties') 
  it('should handle missing optional properties gracefully')
  it('should validate required properties')
  it('should provide helpful error messages for validation failures')
  it('should support property fallback chains')
})
```

### Test Suite: EnhancedContextLoader  
```javascript
describe('EnhancedContextLoader', () => {
  it('should load and normalize CEO context correctly')
  it('should cache loaded contexts for performance')
  it('should auto-detect context types')
  it('should handle file not found errors gracefully')
  it('should handle YAML parse errors with helpful messages')
  it('should meet performance requirements (< 5ms per context)')
})
```

### Test Suite: Integration with Existing System
```javascript
describe('Context Loading Integration', () => {
  it('should work with existing ContextAssembler interface')
  it('should maintain backward compatibility')
  it('should integrate with DynamicContextAssembler')
  it('should work with MCP tool workflows')
})
```

---

## Integration Tests Required

### Real File Loading Tests
```javascript
describe('Real Context File Loading', () => {
  it('should load contexts/agents/ceo/context.yaml successfully')
  it('should load all agent contexts in contexts/agents/*/')
  it('should load all workflow contexts in contexts/workflows/*/')
  it('should handle mixed context types in batch loading')
})
```

### Performance Integration Tests
```javascript
describe('Context Loading Performance', () => {
  it('should load 100 contexts in under 100ms')
  it('should cache effectively (second load < 1ms)')
  it('should handle concurrent loading without race conditions')
})
```

### MCP Integration Tests
```javascript
describe('MCP Tool Integration', () => {
  it('should work with architect_of_abundance tool')
  it('should work with bootstrap_assessment tool')
  it('should work with execute_workflow tool')
  it('should provide consistent context access in all tools')
})
```

---

## LLM Direct Testing Instructions

### For Development (Human LLM)
```bash
# Fix failing tests first
npm test -- --reporter=verbose | grep "Context.*should load real CEO context"

# Test specific context loading
node -e "
  import('./src/context-assembler.js').then(async (module) => {
    const assembler = new module.ContextAssembler()
    const context = await assembler.loadContext('contexts/agents/ceo/context.yaml')
    console.log('Context name:', context.name)
    console.log('Context type:', context.type)
    console.log('Expected name: ceo, Actual:', context.name)
  })
"

# Performance testing
node -e "
  import('./src/context-assembler.js').then(async (module) => {
    const assembler = new module.ContextAssembler()
    const start = Date.now()
    const contexts = await Promise.all([
      assembler.loadContext('contexts/agents/ceo/context.yaml'),
      assembler.loadContext('contexts/agents/dev/context.yaml'),
      // ... load multiple contexts
    ])
    console.log('Load time:', Date.now() - start, 'ms')
  })
"
```

### For Production (External LLM via MCP)
```javascript
// Test via MCP architect_of_abundance tool
{
  "challenge": "Load and normalize CEO context properties",
  "context": {
    "test_mode": true,
    "expected_properties": {
      "name": "ceo",
      "type": "agent", 
      "capabilities": "array"
    }
  }
}
```

---

## Success Criteria

### Immediate Success (Week 1)
- [ ] All context loading tests pass (0 failing)
- [ ] CEO context loads with `name: "ceo"` and `displayName: "Chief Executive Officer"`
- [ ] Property normalization works for all context types
- [ ] Performance requirements met (< 5ms per context)

### Integration Success (Week 2)  
- [ ] All 93 tests pass
- [ ] MCP tools work with normalized contexts
- [ ] Batch context loading works efficiently
- [ ] Error handling provides helpful debugging info

### Foundation Success (Week 3)
- [ ] Context system ready for FlowMind integration
- [ ] Dynamic workflow loading works
- [ ] Property resolution supports semantic conditions
- [ ] System handles production-level context volumes

---

## Risk Mitigation

### Risk: Breaking existing functionality
**Mitigation**: Maintain backward compatibility through interface preservation

### Risk: Performance degradation  
**Mitigation**: Implement efficient caching and benchmark all changes

### Risk: Property normalization edge cases
**Mitigation**: Comprehensive test coverage and fallback strategies

---

This spec focuses on ONE critical foundation piece that unblocks everything else. Once context loading is rock-solid, we can build FlowMind, dynamic workflows, and semantic conditions on top of it.