# Protocol-Based Context Loading System Design

*Synthesized from 8-step deep analysis*

## 🎯 EXECUTIVE SUMMARY

Replace hardcoded personality mappings with a universal protocol-based addressing system where any context becomes reachable via intuitive URIs. Enable user loaders to override core behavior, eliminate configuration files, and create self-organizing context discovery.

## 🏗️ CORE ARCHITECTURE

### Protocol System Foundation
```javascript
class ProtocolSystem {
  constructor(config = {}) {
    this.protocols = new Map()
    this.userProtocols = new Map() // Takes precedence
    this.cache = new Map()
    this.registerCoreProtocols()
    this.discoverUserProtocols(config.userLoaderPath)
  }
  
  async resolve(uri) {
    if (this.cache.has(uri)) return this.cache.get(uri)
    
    const { protocol, path, fragment } = this.parseURI(uri)
    const handler = this.userProtocols.get(protocol) || this.protocols.get(protocol)
    
    if (!handler) {
      throw new ProtocolError(`Unknown protocol: ${protocol}`)
    }
    
    const result = await handler.resolve(path, fragment)
    this.cache.set(uri, result)
    return result
  }
}
```

### Universal URI Format
```
{protocol}://{path}#{fragment}?{query}

Examples:
agent://cortisol_guardian
agent://eeps/nfj-visionary#decision_making
file://contexts/custom/my-agent.yaml
markdown://prompts/system-base.md
script://generators/dynamic-personality.js?version=1.2
```

## 📡 CORE PROTOCOLS

### 1. Agent Protocol - `agent://`
**Auto-discovery from contexts/ structure:**
```javascript
class AgentProtocol {
  async resolve(path, fragment) {
    // agent://cortisol_guardian → scan contexts/agents/**/*/context.yaml
    // Look for metadata.aliases containing "cortisol_guardian"
    // Return assembled context data
    
    const candidates = await this.scanContexts(path)
    const best = this.findBestMatch(candidates, path)
    return this.loadContext(best, fragment)
  }
  
  async scanContexts(query) {
    // Recursive scan of contexts/agents/
    // Check metadata.aliases, metadata.id
    // Return matching context files
  }
}
```

### 2. File Protocol - `file://`
**Direct filesystem access:**
```javascript
class FileProtocol {
  async resolve(path, fragment) {
    const fullPath = this.resolvePath(path)
    const ext = path.extname(fullPath)
    const loader = this.getLoader(ext) // .yaml, .md, .json
    const data = await loader.load(fullPath)
    return fragment ? this.extractFragment(data, fragment) : data
  }
}
```

### 3. Markdown Protocol - `markdown://`
**System prompt loading:**
```javascript
class MarkdownProtocol {
  async resolve(path, fragment) {
    const mdPath = path.endsWith('.md') ? path : `${path}.md`
    const content = await fs.readFile(mdPath, 'utf8')
    return {
      type: 'markdown',
      content: content,
      metadata: this.parseMarkdownMetadata(content)
    }
  }
}
```

### 4. Script Protocol - `script://`
**Dynamic context generation:**
```javascript
class ScriptProtocol {
  async resolve(path, fragment) {
    const module = await import(this.resolvePath(path))
    const generator = module.default || module.generateContext
    return await generator({ fragment, query: this.query })
  }
}
```

## 🔧 USER OVERRIDE SYSTEM

### Precedence Rules
1. **User Protocols** (`./loaders/my-protocol.js`) - Highest precedence
2. **Local Contexts** (`./contexts/`) - Project-specific  
3. **Core Protocols** (`@kingly/core`) - Framework defaults
4. **Fallback** - Error handling

### Custom Protocol Registration
```javascript
// ./loaders/api-protocol.js
export class APIProtocol {
  async resolve(path, fragment) {
    const response = await fetch(`https://api.myservice.com/contexts/${path}`)
    return await response.json()
  }
}

// Auto-discovered and registered
assembler.registerProtocol('api', new APIProtocol())
```

## 🎯 IMPLEMENTATION STRATEGY

### Phase 1: Core Foundation
1. Protocol parsing and registry system
2. User override discovery mechanism
3. Basic caching layer
4. Error handling and validation

### Phase 2: Core Protocols  
1. Agent protocol with auto-discovery
2. File protocol for direct access
3. Markdown protocol for prompts
4. Script protocol for dynamic generation

### Phase 3: Advanced Features
1. Fragment support for partial context loading
2. Query parameter handling
3. Performance optimization
4. Development tooling

### Phase 4: Integration
1. Replace assembleDynamicContext() in server.js
2. Migrate existing contexts to protocol addressing
3. Documentation and examples
4. Community protocol sharing

## 🚀 KILLER FEATURES

### 1. Zero Configuration
**No mapping files needed** - contexts declare their own addressing via metadata.

### 2. Self-Discovery
**Agent protocol scans and indexes** contexts automatically based on metadata.

### 3. User Sovereignty  
**User loaders always win** - complete override capability without touching core.

### 4. Universal Composition
**Mix and match protocols** to build complex contexts from simple building blocks.

### 5. Future-Proof Extensibility
**New protocols can be added** without modifying core system.

## 🎪 EXAMPLES

### Basic Usage
```javascript
const assembler = new ContextAssembler()

// Auto-discovers from contexts/agents/**/context.yaml
const context1 = await assembler.load('agent://cortisol_guardian')

// Direct file loading
const context2 = await assembler.load('file://my-contexts/custom.yaml')

// Markdown system prompt
const prompt = await assembler.load('markdown://base-prompts/personality')

// Dynamic generation
const dynamic = await assembler.load('script://generators/stress-response')
```

### Advanced Composition
```yaml
# contexts/agents/ultimate/context.yaml
metadata:
  type: agent
  composition:
    - agent://base/personality-framework
    - markdown://prompts/decision-making.md
    - script://dynamic/stress-calibration.js
    - agent://eeps/nfj-visionary#core_values
```

## 🏆 SUCCESS METRICS

1. **Zero hardcoded mappings** in core system
2. **<10ms resolution time** for cached contexts  
3. **User protocols work** without core modifications
4. **Backwards compatibility** maintained during transition
5. **Developer joy** - intuitive addressing that "just works"

---

*This protocol system transforms context loading from brittle configuration management into an elegant, extensible addressing system that grows with the ecosystem.*