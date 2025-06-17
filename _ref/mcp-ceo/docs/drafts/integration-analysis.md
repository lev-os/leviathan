# Context Assembler Integration Analysis

## Current Architecture Layers

### Layer 1: ContextAssembler (Base)
```javascript
// src/context-assembler.js
class ContextAssembler {
  async load(contextPath) {
    // "yaml:contexts/agents/ceo/context.yaml" → FlowMind instance
    const loaderType = contextPath.substring(0, colonIndex)  // "yaml"
    const filePath = contextPath.substring(colonIndex + 1)   // "contexts/..."
    
    const loader = this.loaders[loaderType]
    return loader.load(filePath)  // Returns FlowMind instance
  }
}
```

**Responsibility**: Load single contexts from files → FlowMind instances

### Layer 2: DynamicContextAssembler (Recipe Processing)
```javascript
// src/assembly-rules.js  
class DynamicContextAssembler {
  async assemble(recipe) {
    // Recipe: { sources: [...], stageConfig: {...}, tokenLimit: 2000 }
    let contexts = await this.loadContexts(recipe.sources)  // CURRENTLY MOCKED
    
    // Apply: relevance filtering → priority rules → conflict resolution → token optimization
    return { assembled: "...", metadata: {...}, callback: "..." }
  }
  
  async loadContexts(sources) {
    // PROBLEM: Mock implementation
    return sources.map(source => ({ /* mock data */ }))
  }
}
```

**Responsibility**: Process recipes → assembled multi-context results

### Layer 3: ContextRegistry (Discovery)
```javascript
// src/context-registry.js
class ContextRegistry {
  async scan() {
    // Discovers all context.yaml files
    // Maps contexts by type and ID
  }
}
```

**Responsibility**: Discover and catalog available contexts

## Integration Problems

### Missing Connection
```javascript
// CURRENT: DynamicContextAssembler.loadContexts() is disconnected
async loadContexts(sources) {
  return sources.map(source => ({
    text: `Mock context content for testing`  // NOT REAL DATA
  }))
}

// NEEDED: Connect to real ContextAssembler
async loadContexts(sources) {
  return Promise.all(sources.map(async source => {
    const contextPath = `yaml:contexts/${source.type}s/${source.name}/context.yaml`
    const flowMind = await this.contextAssembler.load(contextPath)
    
    return {
      id: flowMind.id,
      source: source.name,
      type: source.type,
      text: flowMind.instruction || flowMind.philosophy,
      flowMind: flowMind  // Keep full FlowMind for metadata
    }
  }))
}
```

## Protocol Integration Strategy

### Minimal Protocol Bridge
```javascript
class ProtocolBridge {
  constructor() {
    this.handlers = new Map()
    this.handlers.set('agent', this.agentHandler.bind(this))
    this.handlers.set('workflow', this.workflowHandler.bind(this))
  }
  
  async resolveToRecipe(uri) {
    const url = new URL(uri, 'protocol://base')
    const protocol = url.protocol.slice(0, -1)
    const handler = this.handlers.get(protocol)
    
    return await handler(url.pathname, url.hash?.slice(1), url.searchParams)
  }
  
  agentHandler(path, fragment, query) {
    return {
      sources: [{ name: `agent-${path}`, type: 'agent' }],
      stageConfig: { lead: path },
      focus: fragment,
      tokenLimit: parseInt(query.get('tokenLimit')) || 4000
    }
  }
}
```

### Enhanced Registry Integration
```javascript
class Registry extends ContextRegistry {
  constructor(config) {
    super(config)
    this.contextAssembler = new ContextAssembler(config.assembler)
    this.dynamicAssembler = new DynamicContextAssembler({
      ...config.dynamic,
      contextLoader: this.contextAssembler  // INJECT REAL LOADER
    })
    this.protocolBridge = new ProtocolBridge()
  }
  
  async load(uri) {
    if (uri.includes('://')) {
      // Protocol flow: URI → Recipe → Assembly
      const recipe = await this.protocolBridge.resolveToRecipe(uri)
      return await this.dynamicAssembler.assemble(recipe)
    } else {
      // Direct flow: Path → FlowMind
      return await this.contextAssembler.load(uri)
    }
  }
  
  // User extensibility
  addProtocol(name, handlerFn) {
    this.protocolBridge.registerHandler(name, handlerFn)
  }
}
```

## Complete Integration Flow

### URI to Result Flow
```
1. User: registry.load('agent://technical-writer#validation?tokenLimit=2000')

2. Registry: Detects protocol, delegates to ProtocolBridge

3. ProtocolBridge: 
   - Parses URI: protocol=agent, path=technical-writer, fragment=validation
   - Calls agentHandler(path, fragment, query)
   - Returns recipe: {
       sources: [{ name: 'agent-technical-writer', type: 'agent' }],
       stageConfig: { lead: 'technical-writer' },
       focus: 'validation',
       tokenLimit: 2000
     }

4. Registry: Passes recipe to DynamicContextAssembler.assemble(recipe)

5. DynamicContextAssembler:
   - Calls loadContexts(recipe.sources)
   - loadContexts calls ContextAssembler.load('yaml:contexts/agents/technical-writer/context.yaml')
   - Gets FlowMind instance with real YAML data
   - Applies assembly rules: relevance → priorities → conflicts → tokens
   - Returns assembled context

6. Registry: Returns final assembled result to user
```

### Direct Context Flow  
```
1. User: registry.load('yaml:contexts/agents/ceo/context.yaml')

2. Registry: Detects no protocol, delegates to ContextAssembler

3. ContextAssembler: Loads single FlowMind instance from YAML

4. Registry: Returns FlowMind instance to user
```

## Benefits of Integration

### Preserves Existing Logic
- ✅ All DynamicContextAssembler rules preserved
- ✅ All ContextAssembler loaders work
- ✅ All ContextRegistry discovery intact

### Connects Mock to Reality
- ✅ Real YAML contexts instead of mock data
- ✅ Full FlowMind instances with rich interface
- ✅ Proper metadata and tracking

### Adds Protocol Support
- ✅ Clean URI interface: `agent://name`
- ✅ Simple user extensibility: `addProtocol()`
- ✅ Standard URL parsing
- ✅ Backward compatibility

## Implementation Checklist

### Phase 1: Connect Layers
- [ ] Modify DynamicContextAssembler constructor to accept contextLoader
- [ ] Replace loadContexts() mock with real ContextAssembler integration
- [ ] Test with existing contexts to verify data flow

### Phase 2: Protocol Bridge
- [ ] Build ProtocolBridge with core handlers (agent, workflow)
- [ ] Add protocol detection to Registry.load()
- [ ] Test protocol → recipe → assembly flow

### Phase 3: User Extensibility  
- [ ] Add Registry.addProtocol() method
- [ ] Test custom protocol registration
- [ ] Document extension patterns

### Phase 4: Integration Testing
- [ ] Verify existing tests still pass
- [ ] Add protocol integration tests
- [ ] Performance testing with real contexts

## Error Handling Strategy

### Protocol Resolution Errors
- Unknown protocol → Fatal error (no LLM inference at this stage)
- Malformed URI → Parse error with details
- Handler errors → Propagate with context

### Context Loading Errors
- Missing context file → ContextLoadError
- Invalid YAML → ContextParseError  
- Assembly conflicts → Conflict resolution or error

### User Override Validation
- Invalid handler function → Type error
- Protocol collision → Warning + override
- Configuration errors → Clear error messages