# ADR-013: Package Boundaries

## Status
Accepted

## Context

During the "Schema Architecture Revolution" session, we discovered two separate schema systems and designed the perfect "Lego Factory vs Lego Builder" separation of concerns. This led to clarity on package boundaries for the @lev-os ecosystem.

### Key Discoveries

1. **Found missing schemas** in broken path `/digital/kingly/~/lev/` (agent created literal `~/` directory)
2. **Two schema systems discovered**:
   - Simple component generation schemas (`docs/schemas/`)
   - Sophisticated lego block definitions with 9 block types
3. **Template confusion**: Templates are another type of mold, not separate concern
4. **BMAD inspiration**: Templates can be intelligent .md files with embedded YAML + [[LLM:]] instructions

### The Lego Metaphor Revolution

**Schema Factory** = Defines what lego shapes exist
- Creates the molds for lego blocks
- Defines validation rules for each type
- Establishes constitutional framework (base.schema.yaml)
- NOT concerned with assembly or usage

**Lego Builder** = Snaps pieces together to build things  
- Uses schema-validated pieces
- Assembly logic for runtime composition
- Generation tools for build-time creation
- Template systems for documentation

## Decision

Organize Leviathan packages into clear domain boundaries:

### Package Structure

```yaml
@lev-os/schema: # The Lego Factory
  purpose: "Defines what lego shapes can exist in the Leviathan ecosystem"
  contains:
    - Pure YAML schemas (structural molds)
    - Intelligent .md templates (content molds with [[LLM:]] instructions)
    - Validation logic for both types
    - Constitutional framework (base.schema.yaml)

@lev-os/legos: # The Lego Builder  
  purpose: "Assembles schema-validated pieces to build things"
  contains:
    - Assembly system (runtime context composition)
    - Generation system (build-time creation)
    - Template processing (documentation generation)
    - Validation pipeline (schema-driven quality)
    - Task orchestration

@lev-os/context: # The Context Library (singular)
  purpose: "Contains actual contexts that exist (filled, validated molds)"
  contains:
    - Actual agent contexts
    - Workflow definitions
    - Pattern libraries
    - BDD specs for context behaviors
    - User-facing context library

@lev-os/workshop: # The Meta-System
  purpose: "Meta-development system for building the system that builds systems"
  contains:
    - Wizard experience with five-fold path
    - Intake pipeline for external sources
    - ADR generation through wizard
    - Concept lifecycle management
    - BMAD-inspired templates with embedded intelligence
```

### Boundary Rules

**@lev-os/schema OWNS:**
- ✅ Structural schemas (YAML field definitions) 
- ✅ Content templates (.md with [[LLM:]] instructions)
- ✅ Validation logic for both types
- ✅ Constitutional framework

**@lev-os/legos OWNS:**
- ✅ Assembly logic (runtime composition)
- ✅ Generation logic (build-time creation)  
- ✅ Documentation generation from templates
- ✅ Task orchestration and complex workflows
- ❌ NO mold definitions (uses schemas)

**@lev-os/context OWNS:**
- ✅ Actual contexts (filled, validated molds)
- ✅ BDD specs for context behaviors
- ✅ User-facing context library
- ❌ NO mold definitions (uses schemas)

**@lev-os/workshop OWNS:**
- ✅ Meta-development processes
- ✅ Wizard experience and five-fold path
- ✅ Concept lifecycle management
- ✅ Intake and ADR generation
- ❌ NO business logic (orchestrates other packages)

## Consequences

### Positive

- **Clear Mental Model**: Developers understand where functionality lives
- **Semantic Clarity**: "Legos" captures both build-time + runtime assembly
- **Template Intelligence**: BMAD-inspired templates with embedded guidance
- **Separation of Concerns**: Schema Factory vs Builder vs Library vs Meta-System
- **Extensibility**: Clean boundaries enable community contributions

### Negative

- **Migration Effort**: Moving existing code to new package structure
- **Breaking Changes**: Import paths will need updates across ecosystem
- **Template Complexity**: .md templates with [[LLM:]] instructions need tooling

### Neutral

- **Package Count**: Four focused packages vs scattered functionality
- **BMAD Integration**: Adds template intelligence but requires new patterns

## Implementation Notes

### Clean Separation of Concerns
```
@lev-os/schema defines what CAN exist
@lev-os/legos defines how to USE what exists  
@lev-os/context contains what DOES exist
@lev-os/workshop defines how to BUILD what exists
```

### Template Architecture
- Keep structural schemas in pure YAML (parseable by tools)
- Add intelligent templates as enhanced .md with [[LLM:]] guidance
- Best of both worlds: machine-readable + human-guided

### Future Splitting
When @lev-os/legos becomes unwieldy, natural split points:
- `@lev-os/legos` - Pure assembly and generation
- `@lev-os/assembler` - Bidirectional orchestration (like _ref/mcp-ceo)

## Related Documents

- [ADR-012: Domain-Based Package Architecture](./012-domain-based-package-architecture.md)
- [_lego.md - Session Synthesis](../../_lego.md)
- [BMAD-Core Analysis](../../../kingly/apps/production/rvstack/.bmad-core/)

## Decision Makers

- Architecture synthesis from Schema Architecture Revolution session
- Analysis of BMAD-inspired intelligent template patterns
- Recognition of lego metaphor as superior to generic "build"
- Template confusion resolution: templates ARE molds

## Date

2025-07-02

---

**Architecture Insight**: The lego metaphor provides perfect semantic clarity - factories make molds, builders use molds, libraries store results, workshops orchestrate the process.