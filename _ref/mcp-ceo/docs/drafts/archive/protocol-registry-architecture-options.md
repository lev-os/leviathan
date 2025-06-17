# Protocol Registry Architecture Options & Analysis

## Context
During ADR coherence review, we explored multiple approaches for protocol handling in FlowMind context assembler system. This document captures all variations, trade-offs, and the evolution of thinking.

## Current State Analysis
- **FlowMind** ✅ - Single context loading with rich YAML interface (implemented)
- **DynamicContextAssembler** ✅ - Multi-context merging with recipes (implemented, uses mocks)
- **ContextRegistry** ✅ - Context discovery (implemented)
- **Protocol Support** ❌ - Not implemented yet

## Option 1: Central Registry Pattern (Original ADR-003-v2)

### Architecture
```javascript
class ProtocolRegistry {
  constructor() {
    this.protocols = new Map() // protocol_name -> handler
  }
  registerProtocol(name, handler) { this.protocols.set(name, handler) }
  resolve(uri) { return this.protocols.get(parseProtocol(uri)) }
}
```

### Pros/Cons
- ✅ Central control, explicit registration, user override clear
- ❌ Manual registration, single point of failure, not auto-discovering

## Option 2: Convention-Based Discovery

### Architecture
```javascript
// Auto-discovers protocols by file naming convention
// protocols/agent-protocol.js exports AgentProtocol class
class ConventionResolver {
  async resolve(uri) {
    const protocol = parseProtocol(uri)
    const modulePath = `./protocols/${protocol}-protocol.js`
    const { default: Handler } = await import(modulePath)
    return new Handler()
  }
}
```

### Pros/Cons
- ✅ Zero configuration, auto-discovery, follows FlowMind philosophy
- ❌ Filesystem dependent, harder debugging, implicit behavior

## Option 3: Next.js App Router Conventions

### Architecture
```
protocols/
  layout.js                 # Protocol system config
  agent/
    route.js                # export async function resolve(request)
  workflow/
    route.js                 
    [workflow]/
      route.js               # Dynamic workflow handler
  file/
    route.js

~/.kingly/protocols/        # User overrides
  agent/
    route.js                 # User's agent:// handler
  custom/
    route.js                 # User's custom:// handler
```

### Protocol Handler Interface
```javascript
// protocols/agent/route.js
export async function resolve(request) {
  const { path, fragment, query } = request
  return {
    lead: path,
    contexts: [`agents/${path}`],
    focus: fragment,
    ...Object.fromEntries(query)
  }
}
```

### Pros/Cons
- ✅ Familiar conventions, powerful dynamic routing, structured
- ❌ Complex for MVP, file-system coupled, over-engineered

## Option 4: Function Mapping (Lightweight)

### Architecture
```javascript
const protocolHandlers = {
  agent: (path, fragment, query) => translateAgentToRecipe(path, fragment, query),
  file: (path) => loadFileDirectly(path),
  markdown: (path) => loadMarkdownPrompt(path),
  script: (path, query) => executeScript(path, query)
}

const resolve = (uri) => {
  const { protocol, path, fragment, query } = parseURI(uri)
  return protocolHandlers[protocol]?.(path, fragment, query)
}
```

### Pros/Cons
- ✅ Simple, functional, minimal overhead, easy testing
- ❌ Less extensible, no class-based benefits, harder user override

## Option 5: Hybrid Convention + Override

### Architecture
```javascript
class HybridProtocolResolver {
  constructor(config = {}) {
    this.userProtocols = new Map()           // Explicit user overrides
    this.conventionBasePath = config.protocolPath || './protocols'
    this.cache = new Map()                   // Performance cache
  }
  
  // User override (highest priority)
  registerProtocol(name, handler) {
    this.userProtocols.set(name, handler)
  }
  
  async resolve(uri) {
    const protocol = parseProtocol(uri)
    
    // 1. Check user overrides first
    // 2. Check cache
    // 3. Convention-based discovery
    // 4. Error if not found
  }
}
```

### Three-Tier Discovery
1. **EXPLICIT**: registry.registerProtocol('agent', myHandler)
2. **USER CONVENTION**: ~/.kingly/protocols/agent-protocol.js  
3. **CORE CONVENTION**: protocols/agent-protocol.js

### Pros/Cons
- ✅ User sovereignty, zero config, performance, FlowMind philosophy
- ❌ More complexity than pure function approach

## Option 6: Unified Registry (Context + Protocols)

### Architecture
```javascript
class Registry {
  constructor() {
    this.contexts = new Map()           // id -> FlowMind instance  
    this.protocols = new Map()          // protocol -> handler
    this.byType = new Map()             // type -> Set of ids
    
    this.scanPaths = [
      { basePath: 'protocols', type: 'protocol', recursive: false },
      { basePath: '~/.kingly/protocols', type: 'protocol', user: true },
      { basePath: 'contexts', type: 'context', recursive: true },
      { basePath: '~/.kingly/contexts', type: 'context', user: true },
    ]
  }
}
```

### File Structure
```
# Core
protocols/
  agent-protocol.js        # Auto-discovered as "agent" protocol
  file-protocol.js         # Auto-discovered as "file" protocol  

contexts/
  agents/                  # Existing context structure

# User
~/.kingly/
  protocols/
    custom-protocol.js     # User's custom protocol
    agent-protocol.js      # User override of core agent protocol
  contexts/
    agents/                # User's custom agents
```

### Pros/Cons
- ✅ One discovery location, user sovereignty, convention-based, focused
- ❌ More complex than needed for MVP, couples concerns

## Option 7: Minimal Protocol Bridge (SELECTED FOR MVP)

### Architecture
```javascript
// Simple protocol-to-recipe translation (no complex routing)
class ProtocolBridge {
  constructor(registry) {
    this.registry = registry
    this.handlers = new Map()
    
    // Core handlers (simple functions, not files)
    this.handlers.set('agent', this.agentHandler.bind(this))
    this.handlers.set('workflow', this.workflowHandler.bind(this)) 
  }
  
  // User can patch in easily
  registerHandler(protocol, handlerFn) {
    this.handlers.set(protocol, handlerFn)
  }
  
  async resolveToRecipe(uri) {
    const url = new URL(uri, 'protocol://base')
    const protocol = url.protocol.slice(0, -1)
    
    const handler = this.handlers.get(protocol)
    if (!handler) throw new Error(`No handler for ${protocol}://`)
    
    return await handler(url.pathname, url.hash?.slice(1), url.searchParams)
  }
  
  // Simple core handlers
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

### Integration
```javascript
class Registry extends ContextRegistry {  // Build on existing
  constructor(config) {
    super(config)
    this.protocolBridge = new ProtocolBridge(this)
    this.dynamicAssembler = new DynamicContextAssembler(config)
  }
  
  // NEW: Protocol interface
  async load(uri) {
    if (uri.includes('://')) {
      const recipe = await this.protocolBridge.resolveToRecipe(uri)
      return await this.dynamicAssembler.assemble(recipe)
    } else {
      return await super.load(uri)  
    }
  }
}
```

### Why Selected
- ✅ **Builds on what works** - DynamicContextAssembler + recipes unchanged
- ✅ **Simple extensibility** - Users just add handler functions  
- ✅ **No complex routing** - Just function-based handlers
- ✅ **Clean protocol interface** - `registry.load('agent://name')`
- ✅ **Backward compatible** - Existing code unchanged
- ✅ **MVP appropriate** - Not over-engineered

## Architecture Confusion Points

### Layer Separation Clarification
- **FlowMind Layer** (YAML Contexts): The actual semantic content
- **Core Infrastructure Layer** (JavaScript): Protocol handlers, registries, assemblers
- **Registry**: Core infrastructure that manages discovery and loading
- **Protocol Handlers**: Core infrastructure that knows HOW to resolve protocols

### Integration with Current Implementation
**Current Layers:**
1. ContextAssembler → .load("yaml:path") → FlowMind instance
2. DynamicContextAssembler → .assemble(recipe) → assembled context  
3. ContextRegistry → .scan() → discovers contexts

**Integration Strategy:**
- ProtocolBridge generates recipes for DynamicContextAssembler
- DynamicContextAssembler.loadContexts() connects to real ContextAssembler (currently mocked)
- Registry orchestrates the flow: Protocol → Recipe → Assembly → Result

## Key Insights from Analysis

1. **FlowMind ≠ Multi-Context Assembly**: FlowMind loads single contexts, DynamicContextAssembler merges multiple
2. **Recipes are the bridge**: Protocol handlers generate recipes, assembler processes them
3. **Current implementation works**: Don't rebuild, extend minimally
4. **User extensibility critical**: Must be easy to add custom protocols
5. **File-based routing overkill for MVP**: Simple function registry sufficient

## ADR Alignment Summary

**✅ ALIGNED:**
- ADR-002-v2: Protocol-to-recipe bridge approach
- ADR-005: Recipe-based assembly with FlowMind returns
- ADR-000: FlowMind as single context loading interface

**🔄 PARTIALLY ALIGNED:**
- ADR-003-v2: User override capability ✅, auto-discovery simplified for MVP

**❌ CONFLICTS RESOLVED:**
- Removed assumption that protocol handlers should be FlowMind contexts
- Clarified that JS infrastructure supports FlowMind but isn't FlowMind
- Preserved existing working recipe system instead of rebuilding

## Future Considerations

### Possible Evolution Path
1. **MVP**: Simple function-based protocol bridge
2. **V2**: Add convention-based discovery for power users
3. **V3**: Consider Next.js-style routing if demand exists
4. **V4**: Unified registry approach for complex ecosystems

### Open Questions for Future
- Should protocol handlers eventually become FlowMind contexts themselves?
- How to handle dynamic protocol discovery in distributed systems?
- What's the right balance between simplicity and extensibility?
- When does file-based routing become worth the complexity?

## Implementation Priority

**Immediate (MVP)**:
1. Connect DynamicContextAssembler.loadContexts() to real ContextAssembler
2. Build minimal ProtocolBridge with core handlers
3. Test protocol flow with existing contexts
4. Add simple user extensibility (addProtocol function)

**Future**:
1. Convention-based discovery
2. Enhanced error handling and validation  
3. Performance optimization and caching
4. Advanced routing features if needed