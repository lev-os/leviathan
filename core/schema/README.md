# 🏭 @lev-os/schema - The Lego Factory

**Defines what lego shapes can exist in the Leviathan ecosystem**

> 🎯 **Core Principle**: When you play with legos, you're not defining the mold of the lego at the same time

## 🧱 What This Package Does

The **Schema Factory** creates the constitutional framework for all Leviathan contexts and components. It defines:

- **9 Lego Block Types**: Base constitutional framework + 8 specialized context types
- **Validation Rules**: JSON Schema validation for runtime compliance  
- **Extension Patterns**: How contexts can extend and compose with each other
- **Quality Assurance**: Structural integrity for the entire ecosystem

## 📋 Available Lego Molds

### Constitutional Framework
- **`base.schema.yaml`** - Foundation for all contexts (required inheritance)

### Specialized Context Types
- **`agent.schema.yaml`** - Agent personas, toolkits, and thinking patterns
- **`workflow.schema.yaml`** - Orchestration, steps, and validation pipelines
- **`pattern.schema.yaml`** - Reusable thinking frameworks and mental models
- **`tool.schema.yaml`** - External capabilities and integration schemas
- **`template.schema.yaml`** - Parameterized content blocks and formats
- **`validator.schema.yaml`** - Quality assurance and validation criteria
- **`context.schema.yaml`** - Domain knowledge and situational information
- **`project.schema.yaml`** - Management coordination and tracking structures

## 🏗️ How to Use This Package

### 1. Install the Package
```bash
pnpm add @lev-os/schema
```

### 2. Import Schema Definitions
```typescript
import { loadSchema, validateContext } from '@lev-os/schema';

// Load a specific schema
const agentSchema = await loadSchema('agent');

// Validate a context against its schema
const isValid = await validateContext(contextData, 'agent');
```

### 3. Access Raw Schema Files
```typescript
// Direct access to YAML schema files
import agentSchemaPath from '@lev-os/schema/schemas/agent.schema.yaml';
```

## 🔧 Development Usage

### Creating New Context Types

1. **Extend Base Schema**: All contexts MUST extend `base.schema.yaml`
2. **Define Specific Properties**: Add type-specific fields and validation
3. **Update Exports**: Add new schema to package exports
4. **Test Validation**: Ensure proper inheritance and validation

### Schema Validation Pipeline

```typescript
// Runtime validation example
import { validateContext } from '@lev-os/schema';

const contextData = {
  id: 'strategic-analyst',
  type: 'agent',
  description: 'Long-term strategic thinking and analysis',
  version: '1.0.0',
  persona: {
    archetype: 'The Strategist',
    voice: 'Analytical and forward-thinking'
  },
  toolkit: {
    thinking_patterns: ['systems-thinking', 'scenario-planning']
  }
};

const result = await validateContext(contextData, 'agent');
// Returns: { valid: true, errors: [], schema: 'agent' }
```

## 🎭 Integration with Lego Builder

This package works with `@lev-os/legos` (The Lego Builder):

```
┌─────────────────┐    ┌─────────────────┐
│   Schema        │    │   Lego Builder  │
│   Factory 🏭    │────→│   Assembly 🧱   │
│                 │    │                 │
│ • Defines molds │    │ • Uses molds    │
│ • Validation    │    │ • Composition   │
│ • Constitutional│    │ • Generation    │
└─────────────────┘    └─────────────────┘
```

- **Schema Factory** (this package): Defines what CAN exist
- **Lego Builder** (`@lev-os/legos`): Assembles what DOES exist

## 📚 Schema Inheritance Pattern

All schemas follow a strict inheritance hierarchy:

```yaml
# Every context extends base
allOf:
  - $ref: 'base.schema.yaml'

# Constitutional requirements
required: ['id', 'type', 'description', 'version']

# Type-specific extensions
properties:
  # ... specialized fields for this context type
```

## 🚀 Build & Development

```bash
# Build the package
pnpm build

# Run validation tests
pnpm validate

# Type checking
pnpm typecheck

# Lint schemas
pnpm lint
```

## 🔗 Related Packages

- **`@lev-os/legos`** - The Lego Builder (assembly and generation tools)
- **`@lev-os/contexts`** - Universal context library (what actually exists)
- **`core/memory`** - Memory system integration
- **`core/agents`** - Agent orchestration system

---

**Architecture**: Part of the Leviathan "Lego Factory vs Lego Builder" separation  
**Status**: Phase 1 Complete - Constitutional framework established  
**Next**: Integration with `@lev-os/legos` assembly system