# Leviathan Component Schema System

**Schema hierarchy and validation for standardized component specifications**

## 🏗️ Schema Architecture

### Base + Extension Pattern
```
base.yaml                    # Universal metadata and structure
├── types/plugin.yaml        # Plugin-specific extensions
├── types/core.yaml          # Core package extensions  
├── types/package.yaml       # General package extensions
└── types/app.yaml           # Application extensions
```

### JSON Schema Validation
```
validation/
├── base.json                # JSON Schema for base.yaml
└── types/
    ├── plugin.json          # JSON Schema for plugin type
    ├── core.json            # JSON Schema for core type
    ├── package.json         # JSON Schema for package type
    └── app.json             # JSON Schema for app type
```

## 🎯 Schema Inheritance

### 1. Base Schema (`base.yaml`)
**Universal fields for all components:**
- `metadata` - Core identification (id, type, name, version, description)
- `architecture` - Architecture pattern and dependencies
- `structure` - File/directory structure requirements
- `documentation` - Documentation configuration
- `relationships` - Parent, sibling, child relationships
- `navigation` - Quick start and reference links
- `fractal` - Fractal documentation structure
- `extensions` - Type-specific extension point

### 2. Type-Specific Extensions
Each component type extends the base with specialized fields:

#### Plugin (`types/plugin.yaml`)
- **Fixed values**: `type: "plugin"`, `namespace: "@lev-os"`
- **Plugin config**: Commands, MCP tools, workflows
- **Integration**: Agent, context, memory awareness
- **Package config**: Plugin-specific package.json structure

#### Core (`types/core.yaml`)  
- **Fixed values**: `type: "core"`, `namespace: "core"`
- **Hexagonal architecture**: Adapters, ports, domain layers
- **SDK functions**: Core business logic exposure
- **Adapter integration**: CLI, MCP, web adapters

#### Package (`types/package.yaml`)
- **Fixed values**: `type: "package"`, `namespace: "packages"`
- **Library focus**: Reusable components and utilities
- **Framework compatibility**: React, Node.js, browser support
- **Publishing**: NPM publication configuration

#### App (`types/app.yaml`)
- **Fixed values**: `type: "app"`, `namespace: "apps"`
- **Application features**: Pages, APIs, deployment
- **Framework integration**: Next.js, Expo, Electron
- **Deployment config**: Platforms and environments

## 🔧 Usage

### Schema Validation
```bash
# Validate component against schema
node docs/schemas/validation/validate.js core/memory

# Validate all components
node docs/schemas/validation/validate-all.js
```

### Template Generation
```bash
# Generate component with schema-driven templates
turbo gen docs --type=plugin --component=core/memory
turbo gen plugin-with-docs --name=example-plugin
```

### Schema Compliance Check
```bash
# Check existing component compliance
node scripts/check-schema-compliance.js plugins/constitutional-ai
```

## 🧠 Design Principles

### 1. **Inheritance Over Duplication**
- Base schema defines universal structure
- Type schemas only add/override specific fields
- No duplication of common metadata

### 2. **Validation-First**
- Every schema has corresponding JSON Schema
- Components validate against their type schema
- Automatic validation in CI/CD pipeline

### 3. **Template-Driven**
- Schemas drive template generation
- Type-specific templates use schema data
- Consistent output based on schema structure

### 4. **Agent Context Alignment**
- Schema patterns align with `agent/contexts/` YAML
- Compatible with existing agent system
- Extensible for AI-powered generation

## 📋 Schema Fields Reference

### Metadata Fields (Universal)
```yaml
metadata:
  id: "component-name"          # kebab-case identifier
  type: "plugin|core|package|app" # component type
  name: "Display Name"          # human-readable name
  version: "1.0.0"              # semantic version
  description: "Brief description" # 10-200 characters
  namespace: "@lev-os|core|packages|apps" # component namespace
  category: "infrastructure|ai-tools|workflow" # classification
  tags: ["tag1", "tag2"]        # search tags
```

### Architecture Fields (Universal)
```yaml
architecture:
  type: "hexagonal|plugin|library|application" # architecture pattern
  summary: "Architecture description"           # brief overview
  dependencies:                                 # dependency structure
    core: ["@lev-os/debug"]                    # core dependencies
    external: ["react", "lodash"]              # external dependencies
```

### Documentation Fields (Universal)
```yaml
documentation:
  architecture_summary: "Summary for docs"     # docs architecture section
  features: []                                 # feature list
  integrations: []                             # system integrations
```

## 🚀 Benefits

### ✅ **Standardization**
- Every component follows identical schema structure
- Type-specific customization within universal framework
- Consistent validation across entire ecosystem

### ✅ **Validation**
- JSON Schema validation catches errors early
- Required fields enforced for all components
- Type-specific requirements validated automatically

### ✅ **Template Generation**
- Schema-driven template customization
- Type-aware content generation
- Consistent output with component-specific details

### ✅ **Tool Integration**
- Turborepo generators use schemas for smart defaults
- CI/CD validation ensures compliance
- Agent system integration for AI-powered enhancement

---

*Part of the [Leviathan Fractal Documentation Architecture](../../README.md#documentation-architecture---fractal--quantum-consciousness)*