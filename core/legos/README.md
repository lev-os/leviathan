# 🧱 @lev-os/legos - The Lego Builder

**Assembles schema-validated pieces to build things in the Leviathan ecosystem**

> 🎯 **Core Principle**: Uses schema-validated lego pieces to snap contexts together and build sophisticated assemblies

## 🏗️ What This Package Does

The **Lego Builder** provides the assembly and generation tools for the Leviathan ecosystem. It takes schema-validated lego pieces from `@lev-os/schema` and:

- **Runtime Assembly**: Snaps contexts together into cohesive structures
- **Build-time Generation**: Creates new components using intelligent templates
- **Documentation Generation**: Produces READMEs, docs, and artifacts from assemblies
- **Validation Pipeline**: Ensures structural integrity during composition
- **Complex Composition**: Handles sophisticated multi-piece assemblies

## 📦 Package Architecture

```
@lev-os/legos/
├── assembly/          # Runtime: snap contexts together
├── generation/        # Build-time: create new components  
├── templates/         # Documentation generation
├── validation/        # Use schemas to validate pieces
└── composition/       # Complex multi-piece assemblies
```

## 🚀 Quick Start

### Installation
```bash
pnpm add @lev-os/legos @lev-os/schema
```

### Basic Assembly
```typescript
import { assembleContexts } from '@lev-os/legos/assembly';

const contexts = [
  { id: 'strategic-analyst', type: 'agent', /* ... */ },
  { id: 'market-research', type: 'workflow', /* ... */ }
];

const result = await assembleContexts(contexts, {
  validate: true,
  strict: true
});

if (result.success) {
  console.log('✅ Assembly complete:', result.result);
} else {
  console.error('❌ Assembly failed:', result.errors);
}
```

### Generate New Context
```typescript
import { generateContext } from '@lev-os/legos/generation';

const newAgent = await generateContext('agent', {
  id: 'data-scientist',
  description: 'Specialized in machine learning and statistical analysis',
  persona: {
    archetype: 'The Analyst',
    voice: 'Data-driven and precise'
  },
  toolkit: {
    thinking_patterns: ['analytical-thinking', 'statistical-reasoning']
  }
});

console.log(newAgent.output); // Generated YAML context
```

### Complex Composition
```typescript
import { composeContexts } from '@lev-os/legos/composition';

const composition = await composeContexts('research-pipeline', [
  researchAgent,
  analysisWorkflow,
  validationPattern
]);

if (composition.success) {
  console.log('🔄 Execution graph:', composition.composition.execution_graph);
}
```

## 🛠️ Core Features

### 1. Runtime Assembly (`/assembly`)

Snaps contexts together at runtime with full validation:

```typescript
import { assembleContexts } from '@lev-os/legos/assembly';

const assembled = await assembleContexts(contexts, {
  validate: true,        // Validate against schemas
  strict: true,          // Fail on any validation error
  allowPartial: false    // Require all contexts to be valid
});

// Returns grouped contexts, dependencies, and composition rules
console.log(assembled.result.contexts);      // Grouped by type
console.log(assembled.result.dependencies);  // Dependency graph
console.log(assembled.result.composition_rules); // Assembly rules
```

### 2. Build-time Generation (`/generation`)

Creates new components using schema-aware templates:

```typescript
import { generateContext } from '@lev-os/legos/generation';

const workflow = await generateContext('workflow', {
  id: 'user-onboarding',
  goal: 'Guide new users through platform setup',
  recommendations: {
    participants: [
      { agent_id: 'onboarding-specialist', role: 'guide', requirement: 'required' }
    ]
  }
}, {
  outputFormat: 'yaml',
  includeComments: true
});
```

### 3. Documentation Generation (`/templates`)

Produces documentation from assembled contexts:

```typescript
import { generateDocumentation } from '@lev-os/legos/templates';

const readme = await generateDocumentation('agent-readme', [agentContext], {
  format: 'markdown',
  includeMetadata: true
});

console.log(readme.output); // Generated README.md content
```

### 4. Schema Validation (`/validation`)

Validates lego pieces before assembly:

```typescript
import { validateContext } from '@lev-os/legos/validation';

const result = await validateContext({
  id: 'test-agent',
  type: 'agent',
  description: 'Test agent for validation',
  version: '1.0.0',
  persona: { archetype: 'The Tester', voice: 'Methodical and thorough' },
  toolkit: { thinking_patterns: ['systematic-testing'] }
});

console.log(result.valid);       // true/false
console.log(result.errors);     // Validation errors
console.log(result.warnings);   // Non-fatal issues
```

### 5. Complex Composition (`/composition`)

Handles sophisticated multi-piece assemblies:

```typescript
import { composeContexts } from '@lev-os/legos/composition';

// Built-in composition patterns
const patterns = [
  'agent-workflow',      // Agent + workflow execution
  'research-pipeline',   // Multi-agent research flow
  'validation-chain'     // Sequential validation pipeline
];

const composed = await composeContexts('agent-workflow', [
  { type: 'agent', /* ... */ },
  { type: 'workflow', /* ... */ }
]);

// Returns execution graph and coordination metadata
console.log(composed.composition.execution_graph);
```

## 🎭 Integration with Schema Factory

This package depends on `@lev-os/schema` for lego mold definitions:

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

- **Schema Factory**: Defines what lego shapes CAN exist
- **Lego Builder**: Uses those shapes to build what DOES exist

## 📋 Available Templates

### Agent Templates
- `agent-readme` - Agent documentation
- `agent-config` - Agent configuration files

### Workflow Templates  
- `workflow-documentation` - Workflow execution guides
- `workflow-test` - Test suites for workflows

### Composition Templates
- `composition-overview` - Multi-context assembly docs
- `execution-graph` - Visual execution flow diagrams

## 🧪 Testing & Validation

```bash
# Run all tests
pnpm test

# Test specific modules
pnpm test:assembly
pnpm test:generation

# Validate example assemblies
pnpm validate:examples
```

## 🔗 Related Packages

- **`@lev-os/schema`** - The Lego Factory (mold definitions)
- **`@lev-os/contexts`** - Universal context library 
- **`core/memory`** - Memory system integration
- **`core/agents`** - Agent orchestration system

---

**Architecture**: Part of the Leviathan "Lego Factory vs Lego Builder" separation  
**Status**: Phase 1 Complete - Core assembly and generation systems operational  
**Next**: Integration with universal context library and workflow orchestration