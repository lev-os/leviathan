# ADR-003: Context Registry & Boot-time Compilation
## Universal Context Discovery & Pre-compilation System

## Status
**ACCEPTED** - Core system for v0.1.0 (2025-01-08)

## Context
The Context Registry is the foundation of the FlowMind architecture. It handles boot-time discovery, validation, and compilation of all contexts into FlowMind instances for fast runtime access.

### Architectural Role
```
BOOT PHASE: Context Registry scans contexts/ → validates → compiles → indexes
RUNTIME:    O(1) lookup of pre-compiled FlowMind instances
```

## Decision
Implement Context Registry as the core boot-time compilation system that discovers, validates, and pre-compiles all contexts for fast runtime access.

## Architecture

### Boot-time Context Compilation
```javascript
class ContextRegistry {
  constructor(assembler) {
    this.contexts = new Map()      // id → FlowMind instance
    this.byType = new Map()        // type → Set of ids  
    this.byAlias = new Map()       // alias → context id
    this.assembler = assembler     // For context loading
  }

  async scan() {
    // 1. Discover all context.yaml files
    const contextFiles = await this.discoverContexts()
    
    // 2. Load, validate, and compile each context
    for (const file of contextFiles) {
      const flowMind = await this.compileContext(file)
      this.indexContext(flowMind)
    }
    
    // 3. Build semantic indexes for fast lookup
    this.buildSemanticIndexes()
    
    return this.getStats()
  }
  
  async compileContext(filePath) {
    // 1. Load YAML through assembler
    const yamlPath = `yaml:${filePath}`
    const flowMind = await this.assembler.load(yamlPath)
    
    // 2. Schema validation (Zod)
    this.validateContext(flowMind)
    
    // 3. v0.2.0: Parse instruction sets (future)
    // this.parseInstructionSets(flowMind)
    
    return flowMind
  }
}
```

### Context Discovery
```javascript
class ContextDiscovery {
  async discoverContexts() {
    const scanPaths = [
      'contexts/**/**/context.yaml',
      // Future: 'ka/core/agent/contexts/**/**/context.yaml'
    ]
    
    const contexts = []
    for (const pattern of scanPaths) {
      const files = await glob(pattern, { 
        ignore: ['node_modules/**', '.git/**'] 
      })
      contexts.push(...files)
    }
    
    return contexts
  }
}
```

### Schema Validation (Zod Integration)
```javascript
import { z } from 'zod'

const BaseContextSchema = z.object({
  metadata: z.object({
    type: z.enum(['agent', 'workflow', 'pattern', 'validation', 'type']),
    id: z.string(),
    name: z.string().optional(),
    version: z.string().optional(),
    description: z.string().optional()
  }),
  validation: z.object({
    context: z.string().default('validation://universal-fallback'),
    enabled: z.boolean().default(true)
  }).optional()
})

const AgentSchema = BaseContextSchema.extend({
  agent_config: z.object({
    capabilities: z.array(z.string()).default([]),
    endpoints: z.record(z.any()).optional(),
    system_prompt: z.string().optional()
  }).optional()
})

const WorkflowSchema = BaseContextSchema.extend({
  workflow_config: z.object({
    steps: z.array(z.object({
      name: z.string(),
      prompt: z.string(),
      context: z.string().optional(),
      agent: z.string().optional(),
      personalities: z.array(z.string()).default([])
    })),
    total_steps: z.number().optional()
  })
})

class ContextValidator {
  validateContext(flowMind) {
    const schema = this.getSchemaForType(flowMind.type)
    return schema.parse(flowMind.raw)
  }
  
  getSchemaForType(type) {
    switch(type) {
      case 'agent': return AgentSchema
      case 'workflow': return WorkflowSchema
      case 'pattern': return BaseContextSchema
      default: return BaseContextSchema
    }
  }
}
```

### Fast Runtime Access
```javascript
class ContextRegistry {
  // O(1) lookup by ID
  getContext(id) {
    return this.contexts.get(id)
  }
  
  // O(1) lookup by protocol URI
  getContextByURI(uri) {
    const id = this.resolveURIToId(uri)
    return this.contexts.get(id)
  }
  
  // Fast type filtering
  getContextsByType(type) {
    const ids = this.byType.get(type) || new Set()
    return Array.from(ids).map(id => this.contexts.get(id))
  }
  
  // Alias resolution
  getContextByAlias(alias) {
    const id = this.byAlias.get(alias)
    return id ? this.contexts.get(id) : null
  }
}
```

## Protocol URI Resolution

### URI to Context ID Mapping
```javascript
class ProtocolResolver {
  resolveURIToId(uri) {
    // agent://ceo → 'ceo'
    // workflow://deep-analysis → 'deep-analysis'  
    // pattern://scamper → 'scamper'
    
    if (uri.includes('://')) {
      const [protocol, path] = uri.split('://')
      return path.split('#')[0].split('?')[0]
    }
    
    // Legacy prefix support: yaml:contexts/agents/ceo/context.yaml
    return this.extractIdFromPath(uri)
  }
}
```

## Implementation

### v0.1.0 Scope (Current)
- **Context discovery** (scan contexts/ directory)
- **Schema validation** (Zod schemas for all types)
- **FlowMind compilation** (validated instances)
- **Fast indexing** (by ID, type, alias)
- **Protocol URI resolution** (agent://, workflow://, etc.)
- **Memory integration** (session contexts)

### v0.2.0 Evolution
- **Instruction set parsing** (FlowMind language compilation)
- **Semantic indexing** (embeddings for discovery)
- **Hot reloading** (watch file changes)
- **Distributed contexts** (remote context loading)
- **Cache optimization** (disk persistence)

### Boot-time Performance Targets
- Context discovery: < 100ms
- Schema validation: < 10ms per context
- Total boot time: < 500ms for 100 contexts
- Runtime lookup: < 1ms

## Integration with MCP Server

### Server Startup
```javascript
// src/index.js
import { createContextRegistry } from './context-registry.js'

async function startMCPServer() {
  // 1. Boot-time compilation
  const registry = createContextRegistry()
  await registry.scan()
  
  console.log(`Compiled ${registry.getStats().total} contexts`)
  
  // 2. Create assembler with registry
  const assembler = new ContextAssembler(registry)
  
  // 3. Start MCP tools with fast context access
  const mcpServer = new FlowMindMCPServer(registry, assembler)
  await mcpServer.start()
}
```

### Runtime Context Access
```javascript
// MCP tool handlers
async function execute_workflow({ workflow_id, step, session_id }) {
  // O(1) lookup - no loading delay
  const workflow = registry.getContext(workflow_id)
  
  // Fast recipe assembly
  const recipe = {
    base: workflow,
    mix: [
      registry.getContext(`memory://session/${session_id}/step-${step-1}`)
    ]
  }
  
  return await assembler.assemble(recipe)
}
```

## Key Principles

1. **Boot-time Compilation** - All contexts pre-compiled for performance
2. **Universal Discovery** - Everything is a context, no exceptions
3. **Schema Validation** - Strong typing with Zod schemas
4. **Fast Runtime Access** - O(1) lookup, no I/O delays
5. **Protocol Native** - URI-based addressing throughout
6. **Forward Compatible** - Structure supports v0.2.0 instruction sets

## Success Criteria

- Boot time < 500ms for 100 contexts
- Runtime lookup < 1ms
- All contexts strongly typed and validated
- Protocol URIs resolve correctly
- Zero loading delays at runtime
- Clean separation from assembly concerns

## Changes from Previous ADR

1. **Status: DEFERRED → ACCEPTED** - Registry is core, not optional
2. **Focus: Loading → Compilation** - Boot-time pre-compilation model
3. **Performance: Added targets** - Sub-second boot, sub-millisecond lookup
4. **Integration: Added MCP server** - Clear startup and runtime patterns
5. **Validation: Added Zod schemas** - Strong typing for all contexts

---

**This ADR establishes the Context Registry as the foundation of FlowMind architecture, handling all boot-time compilation for fast runtime access.**