# ADR-005: Interface Specification (UPDATED)

## Status
**UPDATED** - 2025-01-07 - Aligned with actual implementation (see ADR-011)

## Context
Define clean, stable interfaces for the context assembler system that integrate with FlowMind architecture.

## Decision
Establish the **actual implemented interface** that is proven through comprehensive testing.

## Public API (ACTUAL IMPLEMENTATION)

### Main Interface
```javascript
import { ContextAssembler } from './src/context-assembler.js'

// Actual instantiation
const assembler = new ContextAssembler({
  yaml: { basePath: './contexts' },
  markdown: { basePath: './docs' }
})

// Primary method (ACTUAL)
const result = await assembler.assemble({
  contexts: ['agents/technical-writer', 'patterns/validation'],
  lead: 'technical-writer',
  stage: 'draft_review',
  tokenLimit: 2000,
  context: { document: 'chapter-01.md' }
})
```### Result Format (ACTUAL)
```javascript
{
  assembled: 'Complete assembled context...',
  metadata: { 
    sources: ['yaml:contexts/agents/technical-writer/context.yaml'],
    tokensUsed: 1247,
    conflictsResolved: 2,
    lead: 'technical-writer'
  },
  callback: 'Instructions for handling response...',
  raw: FlowMindInstance
}
```

### Configuration (ACTUAL)
```javascript
// Minimal config
{ yaml: { basePath: './contexts' } }

// Full config (IMPLEMENTED)
{
  yaml: { basePath: './contexts' },
  markdown: { basePath: './docs' },
  tokenLimit: 4000,
  conflictStrategy: 'weighted_merge',
  cache: true
}
```

## Internal Interfaces (IMPLEMENTED)

### Loader Interface
```javascript
class BaseLoader {
  async load(relativePath, options) { /* return FlowMind instance */ }
  getBasePath() { /* return configured base path */ }
  canLoad(path) { /* return boolean */ }
}
```

## Benefits
- **Proven implementation** - Tested and working
- **FlowMind alignment** - Returns FlowMind instances
- **Recipe flexibility** - Composable context assembly
- **Performance optimized** - Token limits and conflict resolution

## Future Protocol Support
Protocol-based interface (`assembler.load(uri)`) deferred to future implementation while maintaining recipe-based approach.