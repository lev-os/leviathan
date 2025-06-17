# ADR-011: Protocol URI Design
## Semantic Addressing for FlowMind Contexts

## Status
**ACCEPTED** - Core feature for v0.1.0

## Context
The prefix experiment (yaml:, markdown:, memory:) proved successful but limited. Protocol URIs provide semantic addressing that matches user intent rather than file locations.

## Decision
Implement full protocol URI support as the natural evolution of the prefix system, maintaining backward compatibility.

## Protocol URI Specification

### URI Structure
```
protocol://path#fragment?query

Components:
- protocol: Semantic intent (agent, workflow, pattern, etc.)
- path: Identifier or path within protocol space
- fragment: Sub-component (e.g., #negotiator for endpoint)
- query: Additional parameters (e.g., ?step=3)
```

### Core Protocols

#### Content Type Protocols
```
agent://ceo                    # Load agent context
agent://ceo#negotiator         # Load with specific endpoint
workflow://deep-analysis       # Load workflow context
workflow://deep-analysis?step=3 # With step hint
pattern://scamper             # Load thinking pattern
validation://financial-audit   # Load validation context
```

#### File Type Protocols (Evolution of Prefixes)
```
yaml://path/to/file.yaml      # Direct YAML loading
markdown://docs/prompt.md     # Markdown file loading
memory://session/123/step-2   # Session memory loading
```

### Semantic Resolution

#### Alias-Based Discovery
```yaml
# In contexts/agents/eeps/nfj-visionary/context.yaml
metadata:
  id: "nfj-visionary"
  aliases: 
    - "visionary"
    - "big-picture-thinker"
    - "strategic-dreamer"
```

#### Resolution Order
1. Check registry for exact match
2. Check aliases in metadata
3. Fuzzy match with confirmation
4. Filesystem fallback
5. Error with suggestions

### Examples

#### Simple Loading
```javascript
// Old prefix style (still works)
await assembler.load('yaml:contexts/agents/ceo/context.yaml')

// New protocol style
await assembler.load('agent://ceo')
```

#### Complex URIs
```javascript
// Load specific endpoint
await assembler.load('agent://ceo#negotiator')

// Load workflow step
await assembler.load('workflow://deep-analysis?step=3')

// Load with parameters
await assembler.load('pattern://temporal-analysis?timeframe=10years')
```

#### Recipe Integration
```javascript
await assembler.assemble({
  base: 'agent://ceo#negotiator',
  mix: [
    'workflow://negotiation/step-current',
    'pattern://price-anchoring'
  ],
  system_prompt: 'markdown://prompts/negotiation',
  validation: 'validation://deal-checker'
})
```

## Implementation Details

### Protocol Handler Registration
```javascript
class ProtocolRegistry {
  constructor() {
    this.handlers = new Map()
  }
  
  register(handler) {
    for (const protocol of handler.protocols) {
      this.handlers.set(protocol, handler)
    }
  }
  
  async resolve(uri) {
    const parsed = this.parseURI(uri)
    const handler = this.handlers.get(parsed.protocol)
    
    if (!handler) {
      throw new Error(`Unknown protocol: ${parsed.protocol}`)
    }
    
    return handler.resolve(parsed)
  }
}
```

### Backward Compatibility
```javascript
parseURI(uri) {
  // New protocol style
  if (uri.includes('://')) {
    return parseProtocolURI(uri)
  }
  
  // Legacy prefix style
  if (uri.includes(':')) {
    const [prefix, path] = uri.split(':', 2)
    return {
      protocol: prefix,
      path: path,
      fragment: '',
      query: {}
    }
  }
  
  // Assume file path
  return {
    protocol: 'file',
    path: uri,
    fragment: '',
    query: {}
  }
}
```

## Benefits

1. **Semantic Intent** - Users express what they want, not where it is
2. **Flexibility** - Multiple ways to address same context
3. **Discovery** - Aliases and fuzzy matching improve UX
4. **Evolution** - Natural progression from prefix experiment
5. **Compatibility** - Old code continues to work

## Migration Strategy

### Phase 1: Core Protocols
- agent://, workflow://, pattern://, validation://
- Basic resolution without aliases

### Phase 2: Enhanced Discovery
- Alias support from metadata
- Fuzzy matching with suggestions
- Registry integration

### Phase 3: Advanced Features
- Query parameter processing
- Fragment handling for sub-components
- Cross-protocol references

## Success Criteria

- All prefix-style URIs continue to work
- Protocol URIs resolve correctly
- Aliases work for common contexts
- Performance < 10ms for resolution
- Clear error messages with suggestions

---

**This ADR establishes protocol URIs as the semantic addressing system for FlowMind contexts.**