# ADR-003: Loader Registry System

## Status
Approved

## Context
Need extensible system for loading different context types with protocol support and dynamic handler discovery.

## Decision
Implement a registry-based loader system with protocol handlers and extensible architecture.

## Design

### LoaderRegistry Class
```javascript
class LoaderRegistry {
  constructor() {
    this.loaders = new Map()
    this.protocolHandlers = new Map()
    this.registerDefaults()
  }
  
  register(type, loader) {
    this.loaders.set(type, loader)
  }
  
  registerProtocol(protocol, handler) {
    this.protocolHandlers.set(protocol, handler)
  }
  
  async load(uri) {
    const { protocol, path, type } = this.parseURI(uri)
    const handler = this.protocolHandlers.get(protocol)
    const loader = this.loaders.get(type)
    
    const rawData = await handler.fetch(path)
    return await loader.parse(rawData)
  }
}
```

### Protocol System
```javascript
// Protocol format: {protocol}://{path}#{type}
// Examples:
// file://contexts/agents/ceo/context.yaml
// agent://cortisol_guardian  (uses mapping)
// script://generators/dynamic-personality.js
// api://service/personality/123#yaml
```

### Loader Interface
```javascript
class BaseLoader {
  async parse(rawData) {
    throw new Error('Must implement parse()')
  }
  
  getType() {
    throw new Error('Must implement getType()')
  }
  
  validate(data) {
    // Optional validation
    return true
  }
}
```

### Built-in Loaders
1. **YAMLLoader** - Parse YAML context files
2. **MarkdownLoader** - Parse .md system prompts  
3. **ScriptLoader** - Execute JS context generators
4. **JSONLoader** - Parse JSON context data

### Protocol Handlers
1. **FileProtocol** - Load from filesystem
2. **AgentProtocol** - Resolve via personality mappings
3. **ScriptProtocol** - Execute dynamic loaders
4. **APIProtocol** - Fetch from external services

## Benefits
- Extensible without core changes
- Protocol-based addressing
- Dynamic loader discovery
- Clean separation of concerns
- Future-proof architecture

## Implementation
Start with FileProtocol + YAMLLoader, then add others incrementally.