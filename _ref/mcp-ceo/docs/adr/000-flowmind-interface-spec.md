# ADR-000: FlowMind Interface Specification
## Context Interface Standard for LLM-First Architecture

## Status
**ACCEPTED** - v0.1.0 (2025-01-07)

## Context
FlowMind instances are the universal context interface created by the Context Registry at boot-time. They provide standardized access to validated YAML contexts and will contain compiled instruction sets in v0.2.0.

### Core Understanding
- **FlowMind Instances** = Validated context interface (v0.1.0) + Instruction sets (v0.2.0)
- **Context Registry** = Boot-time compilation system that creates FlowMind instances
- **Context Assembler** = Runtime recipe engine that uses FlowMind instances
- **LLM** = The runtime that executes through MCP bidirectional flow

## Decision
Implement FlowMind instances as validated context wrappers created at boot-time by the Context Registry, with forward compatibility for instruction set compilation in v0.2.0.

## Architecture

### Core Principle: Universal Context Wrapper
```yaml
# Any YAML becomes a FlowMind instance
metadata:
  type: "agent"
  id: "ceo"
  name: "Chief Executive Officer"
  
validation:  # First-class citizen
  context: "validation://skeptical-reviewer"
  
agent_config:
  capabilities: ["strategic_planning", "negotiation"]
```

### FlowMind Boot-time Creation
```javascript
// Context Registry creates FlowMind instances at boot
class ContextRegistry {
  async compileContext(yamlPath) {
    // 1. Load and validate YAML
    const validatedYaml = await this.loadAndValidate(yamlPath)
    
    // 2. Create FlowMind instance  
    const flowMind = new FlowMind(validatedYaml, yamlPath)
    
    // 3. v0.2.0: Compile instruction sets
    // flowMind._instructionSets = this.compileInstructionSets(validatedYaml)
    
    return flowMind
  }
}

// FlowMind instances provide clean interface to validated contexts
class FlowMind {
  constructor(validatedYaml, contextPath) {
    this._raw = validatedYaml          // Schema-validated YAML
    this._path = contextPath
    this._metadata = validatedYaml.metadata || {}
    this._config = this._detectConfigSection(validatedYaml)
    // v0.2.0: this._instructionSets = compiledInstructions
  }
  
  // === METADATA ACCESS (1:1 YAML) ===
  get id() { return this._metadata.id }
  get name() { return this._metadata.name || this._metadata.id }
  get type() { return this._metadata.type || 'unknown' }
  get version() { return this._metadata.version }
  get description() { return this._metadata.description }
  
  // === CONFIG ACCESS ===
  get config() { return this._config }
  get capabilities() { return this._config?.capabilities || [] }
  
  // === VALIDATION (First-class) ===
  get validation() {
    return this._raw.validation || { 
      context: "validation://universal-fallback" 
    }
  }
  
  get validationEnabled() {
    return this.validation.enabled !== false
  }
  
  get validationContext() {
    return this.validation.context
  }
  
  // === WORKFLOW SUPPORT ===
  get steps() {
    return this._config?.steps || this._config?.workflow_steps || []
  }
  
  // === TYPE CHECKING ===
  isAgent() { return this.type === 'agent' }
  isWorkflow() { return this.type === 'workflow' }
  isPattern() { return this.type === 'pattern' }
  
  // === RAW ACCESS ===
  get raw() { return this._raw }
  toJSON() { return this._raw }
}
```

### Architecture: Boot vs Runtime

```
BOOT PHASE (Context Registry):
1. Scan contexts/ directory for all context.yaml files
2. Validate each with Zod schemas  
3. Create FlowMind instances with validated data
4. Index by ID, type, and aliases for fast lookup

RUNTIME PHASE (Context Assembler):
1. Registry.getContext(uri) - O(1) lookup of FlowMind instances
2. Assembler.assemble(recipe) - Merge multiple contexts
3. Return assembled context for LLM reasoning
```

### What FlowMind Does NOT Do (v0.1.0)
```javascript
// ❌ REMOVED - These are v0.2.0 FlowSense features
// Semantic condition evaluation
// Control flow execution
// Instruction set processing
// Real-time context compilation
```

## Implementation for v0.1.0

### Phase 1: Core Interface
- [x] FlowMind class with 1:1 YAML mapping
- [x] Support for all context types
- [ ] Validation as first-class citizen
- [ ] Remove mock evaluation methods

### Phase 2: Protocol Support
- [ ] Evolve from prefix to protocol URIs
- [ ] Enable semantic addressing (agent://ceo)
- [ ] Maintain backward compatibility

### Phase 3: Integration
- [ ] Connect to working MCP bidirectional flow
- [ ] Support context assembly recipes
- [ ] Enable validation through context switching

## Version Roadmap

### v0.1.0 - Context Interface (Current)
- FlowMind as universal context wrapper
- Protocol-based addressing
- Validation support
- Bidirectional flow through MCP

### v0.2.0 - FlowSense Language (Future)
- Semantic condition parsing
- Control flow in YAML
- Confidence-based evaluation
- Natural language conditions

## Key Principles

1. **FlowMind is data, not logic** - Pure interface to contexts
2. **Never mock evaluation** - LLM does real evaluation through MCP
3. **Validation is built-in** - First-class citizen in every context
4. **Evolution over revolution** - Build on what works

## Testing Requirements

```javascript
describe('FlowMind v0.1.0', () => {
  it('provides 1:1 YAML access')
  it('supports validation configuration')
  it('works with all context types')
  it('has no mock evaluation')
  it('integrates with MCP tools')
})
```

## Success Criteria

- All contexts load as FlowMind instances
- Protocol URIs work (agent://ceo)
- Validation contexts are accessible
- No semantic evaluation in code
- Clean integration with MCP

---

**This ADR establishes FlowMind as a context interface standard, not a programming language. Control flow comes in v0.2.0 with FlowSense.**