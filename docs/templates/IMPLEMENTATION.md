# Fractal Documentation Template System

**Standardized documentation generation using Turborepo generators and YAML specifications**

## 🎯 What We Built

Instead of manually creating individual README.md files, we've created a **template-driven system** that uses the existing Turborepo generator infrastructure to standardize documentation across all components.

## 🏗️ Architecture

```
docs/templates/
├── README.md                      # This overview
├── component-docs-readme.hbs      # Handlebars template for docs/README.md hubs
├── component-spec.yaml            # YAML specification template
├── turbo-docs-generator.ts        # Draft Turborepo extension (not integrated yet)
└── IMPLEMENTATION.md              # This file

turbo/generators/
├── config.ts                      # Existing package generator
├── docs-config.ts                 # NEW: Documentation generators
└── templates/                     # Existing Handlebars templates
```

## 🚀 Available Commands

### Current (Existing)
```bash
# Generate new package (existing functionality)
turbo gen init
```

### Proposed (Ready to Integrate)
```bash
# Generate fractal documentation for existing component
turbo gen docs

# Generate new plugin with complete documentation
turbo gen plugin-with-docs
```

## 📋 Template System Features

### 1. **Universal Component Specification (YAML)**
Based on agent context patterns from `agent/contexts/`, provides standardized metadata for any component:

```yaml
metadata:
  id: "component-name"
  type: "plugin" | "package" | "core" | "app"
  description: "Component description"
  
architecture:
  type: "hexagonal" | "plugin" | "library"
  summary: "Architecture description"
  
documentation:
  features: [...]
  integrations: [...]
  
relationships:
  parent: {...}
  siblings: [...]
```

### 2. **Fractal Documentation Hub Template**
Handlebars template that generates standardized `docs/README.md` files with:
- **Quantum Links** - Bi-directional navigation between components
- **Universal Structure** - Same layout everywhere (architecture/, features/, adrs/, specs/, guides/)
- **Context Awareness** - Integration with agent context system
- **Dynamic Content** - Adapts based on component type and capabilities

### 3. **Turborepo Generator Extensions**
Two new generators that extend the existing system:
- **`docs`** - Add fractal documentation to existing components
- **`plugin-with-docs`** - Create new plugins with complete documentation structure

## 🧠 Intelligence Integration

### Based on Agent Context Patterns
The templates are designed around the YAML patterns found in `agent/contexts/`:
- **Workflow specifications** from `agent/contexts/workflows/`
- **Component types** from `agent/contexts/types/`
- **Agent patterns** from `agent/contexts/agents/`

### Fractal Architecture Compliance
Implements the universal structure defined in `/README.md`:
```
{component}/docs/
├── README.md               # Documentation hub (generated from template)
├── architecture/           # Component architecture decisions
├── features/               # Component feature specifications  
├── adrs/                   # Architecture Decision Records
├── specs/                  # Technical specifications
├── guides/                 # Usage and development guides
└── examples/               # Working examples
```

## 🔧 Integration Steps

To activate this system:

### 1. **Integrate Documentation Generators**
```bash
# Copy docs-config.ts into main generator config
cp turbo/generators/docs-config.ts turbo/generators/config.ts

# Or merge the functions into existing config.ts
```

### 2. **Test Documentation Generation**
```bash
# Try generating docs for existing component
turbo gen docs
# When prompted: core/memory

# Try creating new plugin
turbo gen plugin-with-docs  
# When prompted: example-plugin
```

### 3. **Validate Template Output**
Check generated files match fractal architecture:
- Universal docs/ structure created
- docs/README.md hub with quantum links
- Integration with existing component

## 🎯 Benefits Over Manual Creation

### ✅ **Standardization**
- Every component follows identical documentation patterns
- Consistent navigation and structure
- Template-driven content ensures nothing is missed

### ✅ **Automation** 
- Leverages existing Turborepo generator infrastructure
- Automatic discovery of component characteristics
- Generates quantum links based on component relationships

### ✅ **Intelligence Integration**
- Based on proven agent context YAML patterns
- Integrates with Leviathan's LLM-first architecture
- Templates can be enhanced by AI for smarter generation

### ✅ **Scalability**
- Works with existing 40+ components in the monorepo
- New components automatically get complete documentation
- Templates evolve centrally, all components benefit

## 🔄 Template Evolution

Templates can be enhanced with:
- **Agent-powered content generation** - Use Leviathan agents to write better descriptions
- **Cross-component analysis** - Automatically discover relationships and integrations
- **YAML-driven customization** - Component specs drive template behavior
- **Validation integration** - Ensure generated docs match architectural standards

## 🧪 Next Steps

1. **Integrate generators** into main Turborepo config
2. **Test with existing components** (core/memory, plugins/constitutional-ai)
3. **Refine templates** based on real output
4. **Add agent integration** for smarter content generation
5. **Create validation** to ensure fractal compliance

---

**Result:** Transform from manual README.md creation to intelligent, template-driven documentation generation that scales across the entire Leviathan ecosystem.

*Part of the [Leviathan Fractal Documentation Architecture](../../README.md#documentation-architecture---fractal--quantum-consciousness)*