# ADR-013: Registry/Assembler Separation
## Clean Responsibility Boundaries for FlowMind Architecture

## Status
**ACCEPTED** - Core principle for v0.1.0 (2025-01-08)

## Context
Previous architecture had overlapping responsibilities between Context Registry and Context Assembler, leading to confusion about which component handles what. This ADR establishes clear boundaries.

### Previous Confusion
- Assembler handled both loading AND assembly
- Registry was marked as "deferred" when it's actually core
- Unclear which component owns validation, caching, protocol resolution

### Clear Separation Needed
```
BOOT-TIME:  Context Registry → Discovery, validation, compilation
RUNTIME:    Context Assembler → Recipe assembly from pre-compiled contexts
```

## Decision
Establish clean separation of concerns between Context Registry (boot-time compilation) and Context Assembler (runtime recipe assembly), with no overlapping responsibilities.

## Architecture

### Context Registry Responsibilities
```javascript
class ContextRegistry {
  // === BOOT-TIME ONLY ===
  
  // 1. Context Discovery
  async scan() {
    // Discover all context.yaml files
    // Scan contexts/ directory recursively  
    // Support multiple scan paths (future: kingly integration)
  }
  
  // 2. Schema Validation  
  validateContext(yaml) {
    // Zod schema validation for all context types
    // Strong typing enforcement
    // Validation error reporting
  }
  
  // 3. FlowMind Compilation
  compileContext(validatedYaml) {
    // Create FlowMind instances from validated YAML
    // v0.2.0: Compile instruction sets
    // Cache compiled instances
  }
  
  // 4. Indexing & Fast Lookup
  indexContext(flowMind) {
    // Index by ID: contexts.set(id, flowMind)
    // Index by type: byType.set(type, Set<id>)
    // Index by alias: byAlias.set(alias, id)
    // Protocol URI resolution: uri → id mapping
  }
  
  // === RUNTIME ACCESS ===
  
  // O(1) Lookups (no loading, just map access)
  getContext(id) { return this.contexts.get(id) }
  getContextByURI(uri) { /* resolve uri to id, then lookup */ }
  getContextsByType(type) { /* type index lookup */ }
}
```

### Context Assembler Responsibilities  
```javascript
class ContextAssembler {
  // === RUNTIME ONLY ===
  
  constructor(registry) {
    this.registry = registry  // Dependency injection - no overlap
  }
  
  // 1. Recipe Assembly
  async assemble(recipe) {
    // Look up pre-compiled contexts from registry
    // Apply assembly rules (simple in v0.1.0)
    // Merge contexts according to recipe
    // Return assembled result
  }
  
  // 2. Context Merging
  mergeContexts(base, mixContexts) {
    // Deep merge with conflict resolution
    // Base context wins conflicts (v0.1.0)
    // v0.2.0: Complex assembly rules
  }
  
  // 3. Recipe Processing
  processRecipe(recipe) {
    // Parse recipe structure
    // Validate recipe syntax
    // Build execution plan
  }
}
```

## Responsibility Matrix

| Responsibility | Registry | Assembler | Notes |
|---|---|---|---|
| **Context Discovery** | ✅ | ❌ | Boot-time only |
| **YAML Loading** | ✅ | ❌ | Through assembler dependency |
| **Schema Validation** | ✅ | ❌ | Zod schemas |
| **FlowMind Creation** | ✅ | ❌ | Boot-time compilation |
| **Indexing** | ✅ | ❌ | Fast lookup structures |
| **Protocol Resolution** | ✅ | ❌ | URI → ID mapping |
| **Context Lookup** | ✅ | ❌ | Runtime O(1) access |
| **Recipe Assembly** | ❌ | ✅ | Runtime only |
| **Context Merging** | ❌ | ✅ | Assembly logic |
| **Conflict Resolution** | ❌ | ✅ | Assembly rules |
| **Session Management** | ❌ | ❌ | MCP Server responsibility |

## Integration Patterns

### Clean Dependency Injection
```javascript
// MCP Server startup - clear dependency flow
async function startServer() {
  // 1. Registry handles all boot-time work
  const registry = createContextRegistry()
  await registry.scan()
  
  // 2. Assembler depends on registry (injection)
  const assembler = new ContextAssembler(registry)
  
  // 3. MCP server uses both with clear boundaries
  const mcpServer = new FlowMindMCPServer(registry, assembler)
}
```

### Runtime Request Flow
```javascript
// MCP tool handler - clean separation
async function handleWorkflowRequest({ workflow_id, step }) {
  // 1. Registry: Fast context lookup
  const workflow = registry.getContext(workflow_id)
  const agent = registry.getContext(workflow.steps[step].agent)
  
  // 2. Assembler: Runtime recipe assembly  
  const recipe = {
    base: workflow,
    mix: [agent, memoryContext]
  }
  const assembled = await assembler.assemble(recipe)
  
  // 3. Return assembled context for LLM
  return assembled
}
```

### No Circular Dependencies
```
Registry → (creates) → FlowMind instances
   ↓
Assembler → (depends on) → Registry
   ↓
MCP Server → (depends on) → Registry + Assembler
```

## What NOT to Do

### ❌ Registry Should NOT
- Assemble contexts at runtime
- Handle recipes or merging
- Manage MCP sessions
- Process workflow steps
- Cache assembled results

### ❌ Assembler Should NOT  
- Load YAML files
- Validate schemas
- Create FlowMind instances
- Index contexts
- Resolve protocol URIs
- Scan directories

### ❌ Both Should NOT
- Overlap responsibilities
- Duplicate caching logic
- Share internal state
- Mix boot-time and runtime concerns

## Testing Strategy

### Registry Tests (Boot-time)
```javascript
describe('ContextRegistry', () => {
  it('scans and compiles all contexts')
  it('validates with Zod schemas')  
  it('indexes by id, type, alias')
  it('resolves protocol URIs to IDs')
  it('provides O(1) runtime lookup')
})
```

### Assembler Tests (Runtime)
```javascript
describe('ContextAssembler', () => {
  it('assembles recipes from pre-compiled contexts')
  it('merges contexts with conflict resolution')
  it('handles complex recipe structures')
  it('integrates with registry for lookups')
})
```

### Integration Tests
```javascript
describe('Registry + Assembler Integration', () => {
  it('complete boot → runtime → assembly flow')
  it('workflow execution with context switching')
  it('performance: boot < 500ms, assembly < 20ms')
})
```

## Performance Targets

### Registry (Boot-time)
- Context discovery: < 100ms
- Schema validation: < 10ms per context  
- Total compilation: < 500ms for 100 contexts
- Runtime lookup: < 1ms

### Assembler (Runtime)
- Simple recipes: < 5ms
- Complex recipes: < 20ms
- Memory usage: < 10MB for 100 contexts
- No I/O operations

## Evolution to v0.2.0

### Registry Additions
```javascript
// v0.2.0: Instruction set compilation
class ContextRegistry {
  compileInstructionSets(flowMind) {
    // Parse FlowSense language from YAML
    // Compile to instruction sets
    // Cache compiled instructions
  }
}
```

### Assembler Additions  
```javascript
// v0.2.0: Instruction set assembly
class ContextAssembler {
  assembleInstructions(recipe) {
    // Look up compiled instruction sets
    // Assemble dynamic instruction flows
    // Enable semantic condition evaluation
  }
}
```

## Key Principles

1. **Single Responsibility** - Each component has one clear purpose
2. **Clean Dependencies** - Assembler depends on Registry, not vice versa
3. **Boot vs Runtime** - Clear temporal separation of concerns
4. **Performance Focus** - Boot-time compilation enables fast runtime
5. **Forward Compatible** - Structure supports v0.2.0 instruction sets

## Success Criteria

- Zero overlap in responsibilities
- Clear dependency injection patterns
- Performance targets met
- Tests cover separation boundaries
- v0.2.0 evolution path clear

---

**This ADR establishes the clean separation that makes FlowMind architecture scalable and maintainable.**