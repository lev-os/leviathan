# ADR-002: Context Assembler Core Architecture

## Status
Approved

## Context
We need a pluggable context assembly system that supports multiple loader types, extensible protocols, and clean interfaces for the larger Kingly ecosystem.

## Decision
Implement a multi-layer context assembler with protocol-based loading and clean separation of concerns.

## Architecture

### Core Interface
```javascript
// Primary API - simple and clean
import { ContextAssembler } from '@kingly/core'

const assembler = new ContextAssembler({
  contextRoot: './contexts',
  mappings: './personality-mappings.yaml',
  loaders: ['yaml', 'markdown', 'script'] // extensible
})

const result = await assembler.assemble({
  personality: 'cortisol_guardian',
  step: 1,
  previousResults: {...}
})
```

### Layer Architecture
```
┌─────────────────────────────────────┐
│          API INTERFACE              │ ← External facing, stable
├─────────────────────────────────────┤
│       CONTEXT ASSEMBLER             │ ← Orchestrates all components
├─────────────────────────────────────┤
│  LOADER REGISTRY | PROMPT ENGINE    │ ← Core processing engines
├─────────────────────────────────────┤
│   YAML | MD | SCRIPT | CUSTOM       │ ← Pluggable loaders
├─────────────────────────────────────┤
│      PROTOCOL HANDLERS              │ ← file://, agent://, etc.
├─────────────────────────────────────┤
│         CONTEXT SOURCES             │ ← Files, APIs, databases
└─────────────────────────────────────┘
```

### Protocol System Design
Support extensible protocol handlers:
- `file://contexts/agents/ceo/context.yaml`
- `agent://cortisol_guardian` (with mapping resolution)
- `script://dynamic/personality-generator.js`
- `api://external-context-service/personality/123`
- Custom protocols via plugin system

### Core Classes

#### ContextAssembler
- Main orchestrator
- Manages loader registry
- Handles protocol resolution
- Coordinates prompt assembly

#### LoaderRegistry
- Pluggable loader system
- Protocol-to-loader mapping
- Dynamic loader discovery
- Extensible for future types

#### PromptAssembler
- Converts context data to prompts
- Template system for different formats
- Context synthesis logic
- Previous results integration

## Benefits
1. **Pluggable**: Easy to extend with new loaders
2. **Protocol-based**: Flexible context source addressing
3. **Clean interfaces**: Simple external API
4. **Future-proof**: Designed for unknown future needs
5. **Testable**: Clear separation of concerns

## Implementation Order
1. Core interfaces and base classes
2. YAML loader implementation
3. Protocol system foundation
4. Markdown loader
5. Script loader framework
6. Integration with existing MCP server

## Consequences
- Replaces hardcoded context loading
- Enables dynamic context switching
- Supports future extensibility requirements
- Maintains backward compatibility during transition