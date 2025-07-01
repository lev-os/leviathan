# Documentation Templates

**Standardized templates for the Leviathan fractal documentation architecture**

This directory contains templates used by Turborepo generators and manual documentation creation to ensure consistent structure across all components.

## Available Templates

### Component Documentation Templates
- [`component-docs-readme.hbs`](component-docs-readme.hbs) - Universal docs/README.md hub template
- [`component-readme.hbs`](component-readme.hbs) - Component root README.md template  
- [`package-spec.yaml`](package-spec.yaml) - YAML specification for packages/components

### Generator Extensions
- [`turbo-plugin-generator.ts`](turbo-plugin-generator.ts) - Turborepo generator for plugins
- [`turbo-docs-generator.ts`](turbo-docs-generator.ts) - Turborepo generator for documentation structure

## Usage

### Using Turborepo Generators
```bash
# Generate new package (existing)
turbo gen init

# Generate new plugin (proposed)
turbo gen plugin

# Generate docs structure for existing component (proposed)
turbo gen docs
```

### Manual Template Usage
Templates use Handlebars (`.hbs`) syntax with these variables:
- `{{name}}` - Component name
- `{{description}}` - Component description  
- `{{type}}` - Component type (plugin, package, app, etc.)
- `{{parent}}` - Parent component path
- `{{siblings}}` - Related components

## Integration with Existing System

This extends the existing Turborepo generator system in `/turbo/generators/` with documentation-specific templates and maintains consistency with:

- **YAML Specs**: Based on agent context patterns in `agent/contexts/`
- **Fractal Architecture**: Implements universal structure from `/README.md`
- **Plugin System**: Compatible with `@lev-os/*` namespace and plugin development patterns

## Template Standards

All templates follow these principles:
1. **Quantum Links** - Bi-directional references between components
2. **Source of Truth** - Implementation README.md as authoritative
3. **Universal Structure** - Same docs/ layout everywhere
4. **Context Awareness** - Integration with agent context system

---

*Part of the [Leviathan Fractal Documentation Architecture](../../README.md#documentation-architecture---fractal--quantum-consciousness)*