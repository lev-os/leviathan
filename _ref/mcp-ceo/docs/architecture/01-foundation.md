# Foundation Architecture: Component Extraction & Protocol Systems

*Synthesized from ADR-001, ADR-002, and ADR-003*

## Overview

The foundation layer establishes dynamic context orchestration through component extraction and protocol-based addressing, eliminating static configuration and enabling self-organizing context discovery.

## Core Architectural Decisions

### ADR-001: Component Extraction Strategy

**Problem**: Embedded prompts in YAML configuration create maintenance burden and prevent reusability.

**Solution**: Hierarchical prompt component library with structured organization.

#### New Directory Structure
```
ref/
├── personalities/           # Individual personality prompts
│   ├── cortisol_guardian.md
│   ├── abundance_amplifier.md
│   ├── sovereignty_architect.md
│   ├── harmony_weaver.md
│   ├── systems_illuminator.md
│   ├── resilience_guardian.md
│   ├── flow_creator.md
│   └── action_catalyst.md
├── phases/                 # Reusable workflow phases
│   ├── research_phase.md
│   ├── validation_phase.md
│   ├── synthesis_phase.md
│   └── feedback_phase.md
├── experts/                # Domain expert templates
│   ├── legal_expert.md
│   ├── technical_architect.md
│   ├── business_strategist.md
│   ├── psychology_profiler.md
│   └── devils_advocate.md
├── patterns/               # Common prompt patterns
│   ├── recursive_analysis.md
│   ├── multi_agent_debate.md
│   ├── decision_tree.md
│   └── chain_of_thought.md
└── outputs/                # Output format templates
    ├── executive_summary.md
    ├── technical_analysis.md
    ├── action_plan.md
    └── structured_response.md
```

**Benefits**:
- **Modularity**: Reusable components across different workflows
- **Maintainability**: Single source of truth for each component
- **Testability**: Individual components can be tested and validated
- **Version Control**: Track changes to individual components

### ADR-002: Protocol-Based Context Assembly

**Problem**: Personality mappings create configuration burden and limit flexibility.

**Solution**: Protocol-based context assembly with auto-discovery capabilities.

#### Core Interface
```javascript
import { ContextAssembler } from '@kingly/core'

const assembler = new ContextAssembler({
  contextRoot: './contexts',
  // NO mappings parameter - auto-discovery instead
  userLoaderPath: './loaders' // optional custom protocols
})

const result = await assembler.load('agent://cortisol_guardian')
// OR: await assembler.load('file://custom/my-agent.yaml')
// OR: await assembler.load('markdown://prompts/base.md')
```

#### Protocol Format
```
{protocol}://{path}#{fragment}?{query}

Examples:
- agent://cortisol_guardian
- agent://eeps/nfj-visionary#decision_making
- file://contexts/custom/my-agent.yaml
- markdown://prompts/system-base.md
- script://generators/dynamic-personality.js?version=1.2
```

#### Layer Architecture
```
┌─────────────────────────────────────┐
│          API INTERFACE              │ ← protocol.load(uri)
├─────────────────────────────────────┤
│       PROTOCOL SYSTEM               │ ← URI parsing & resolution
├─────────────────────────────────────┤
│  USER PROTOCOLS | CORE PROTOCOLS    │ ← Extensible, user overrides
├─────────────────────────────────────┤
│   AGENT | FILE | MARKDOWN | SCRIPT  │ ← Built-in protocol handlers
├─────────────────────────────────────┤
│      AUTO-DISCOVERY ENGINE          │ ← Scans contexts for metadata
└─────────────────────────────────────┘
```

### ADR-003: Unified Protocol Registry

**Problem**: Need unified system for protocol management with user override capabilities.

**Solution**: ProtocolRegistry with auto-discovery and user precedence.

#### ProtocolRegistry Implementation
```javascript
class ProtocolRegistry {
  constructor() {
    this.coreProtocols = new Map()
    this.userProtocols = new Map() // Takes precedence
    this.cache = new Map()
    this.registerCoreProtocols()
  }
  
  registerProtocol(name, handler) {
    this.userProtocols.set(name, handler) // User protocols override
  }
  
  async resolve(uri) {
    const { protocol, path, fragment, query } = this.parseURI(uri)
    const handler = this.userProtocols.get(protocol) || this.coreProtocols.get(protocol)
    
    if (!handler) throw new ProtocolError(`Unknown protocol: ${protocol}`)
    return await handler.resolve(path, fragment, query)
  }
}
```

#### Protocol Handler Interface
```javascript
class BaseProtocol {
  async resolve(path, fragment = null, query = null) {
    // Each protocol handles its own loading + parsing
    throw new Error('Must implement resolve()')
  }
  
  parseURI(uri) {
    // Standard URI parsing
    return { protocol, path, fragment, query }
  }
}
```

## Core Protocols

### 1. AgentProtocol - Auto-Discovery
```javascript
class AgentProtocol {
  constructor() {
    this.index = new Map() // Query → context path
    this.aliases = new Map() // Alias → canonical path
    this.buildIndex()
  }
  
  async buildIndex() {
    const contexts = await this.scanContexts('./contexts/agents')
    for (const context of contexts) {
      const metadata = context.metadata
      for (const protocol of metadata.protocols || []) {
        this.index.set(protocol, context.path)
      }
      for (const alias of metadata.aliases || []) {
        this.aliases.set(alias, context.path)
      }
    }
  }
  
  async resolve(path, fragment) {
    const contextPath = this.index.get(`agent://${path}`) || 
                        this.aliases.get(path) ||
                        await this.fuzzyMatch(path)
    
    if (!contextPath) throw new Error(`Agent not found: ${path}`)
    return this.loadContext(contextPath, fragment)
  }
}
```

### 2. FileProtocol - Direct Access
```javascript
class FileProtocol extends BaseProtocol {
  async resolve(path, fragment, query) {
    const fullPath = this.resolvePath(path)
    const content = await this.loadFile(fullPath)
    
    if (fragment) {
      return this.extractSection(content, fragment)
    }
    
    return content
  }
}
```

### 3. MarkdownProtocol - System Prompts
```javascript
class MarkdownProtocol extends BaseProtocol {
  async resolve(path, fragment, query) {
    const content = await this.loadMarkdown(path)
    const parsed = this.parseMarkdown(content)
    
    if (fragment) {
      return parsed.sections[fragment]
    }
    
    return parsed.fullContent
  }
}
```

### 4. ScriptProtocol - Dynamic Generation
```javascript
class ScriptProtocol extends BaseProtocol {
  async resolve(path, fragment, query) {
    const scriptPath = this.resolvePath(path)
    const generator = await import(scriptPath)
    
    const params = this.parseQuery(query)
    return await generator.default(params)
  }
}
```

## Context Self-Description

### Metadata Format
```yaml
# contexts/agents/eeps/sfj-caregiver/context.yaml
metadata:
  type: "agent"
  id: "sfj-caregiver"
  protocols:
    - "agent://cortisol_guardian"
    - "agent://stress_reduction"
    - "agent://eeps/sfj-caregiver"
  aliases: ["cortisol_guardian", "stress_guardian"]
  description: "Stress reduction specialist optimizing for calm decisions"
  
agent_config:
  name: "🧘 Cortisol Guardian"
  role: "Stress reduction specialist"
  # ... rest of configuration
```

## Discovery Benefits

1. **Zero Configuration** - No mapping files needed
2. **Multiple Addresses** - One context, many ways to reach it  
3. **Fuzzy Matching** - `cortisol` matches `cortisol_guardian`
4. **Self-Organizing** - System discovers structure automatically
5. **User Sovereignty** - Custom protocols always override core

## Foundation Architecture Impact

This foundation layer enables:

1. **Dynamic Context Loading** - Contexts loaded by URI instead of hardcoded paths
2. **Self-Organizing Discovery** - System builds its own index from metadata
3. **Extensible Protocol System** - Easy to add new addressing schemes
4. **Component Reusability** - Prompt components shared across workflows
5. **Version Control Friendly** - Everything is files, not embedded config

The foundation establishes the infrastructure needed for advanced features like FlowMind semantic reasoning and dynamic prompt synthesis, while maintaining clean separation between addressing (protocols) and content (components).

---

*Next: [02-core-engine.md](./02-core-engine.md) - Assembly & Discovery Engine*