# 📋 Leviathan Specifications System

**Schema-Driven Fractal Specs - Where all design thinking and feature specifications live**

> 🎯 **Core Insight**: specs/ folder solves the "save .md files everywhere" problem - now we know where everything lives and it naturally propagates through the fractal structure.

## 🏗️ ARCHITECTURE: Component-Local with Global Registry

### The Pattern
Every component owns its specifications locally, but they're discoverable globally through schema-driven registry system.

```
# Fractal Pattern
core/legos/specs/          # Lego assembly and generation features
core/schema/specs/         # Schema validation and constitutional framework  
agent/specs/               # Agent orchestration and intelligence features
apps/nextjs/specs/         # Next.js app-specific features
packages/ui/specs/         # UI component specifications

# Global Discovery
specs/
├── README.md              # This file - overall architecture
├── registry.yaml          # Auto-maintained component index
├── templates/             # Spec templates for new components
└── tooling/              # Spec validation and generation tools
```

## 🧱 SCHEMA-DRIVEN ENFORCEMENT

### Base Schema Extension
All components MUST define their specification requirements in their base schemas:

```yaml
# In core/schema/src/base.schema.yaml
specifications:
  has_specs: { type: 'boolean' }
  spec_types: { type: 'array', items: { enum: ['feature', 'integration', 'performance', 'bdd'] } }
  spec_location: { type: 'string', default: './specs/' }
  coverage_requirements: { type: 'number', minimum: 0, maximum: 1, default: 0.8 }
  registry_entry: { type: 'string' }
```

### Automatic Registry Discovery
Components register themselves in the global discovery index:

```yaml
# specs/registry.yaml
components:
  "@lev-os/schema": 
    path: "./core/schema/specs/"
    coverage: 0.85
    last_updated: "2025-01-14"
  "@lev-os/legos":
    path: "./core/legos/specs/"  
    coverage: 0.90
    last_updated: "2025-01-14"
```

## 📚 SPECIFICATION TYPES

### 1. Feature Specifications (.feature files)
BDD-style feature definitions using Gherkin syntax:

```gherkin
Feature: Lego Context Assembly
  As a developer using the Leviathan ecosystem
  I want to assemble multiple contexts into cohesive structures
  So that I can build complex workflows from validated components

  Scenario: Assemble Agent with Workflow
    Given I have a valid agent context "strategic-analyst"
    And I have a valid workflow context "market-research"
    When I assemble them with validation enabled
    Then the assembly should succeed
    And the result should contain dependency mapping
    And the execution graph should be generated
```

### 2. Integration Specifications
How components interact with the broader ecosystem:

```yaml
# integration.yaml
integrations:
  memory_system:
    type: "tight_coupling"
    validates: "context storage and retrieval"
    dependencies: ["@lev-os/memory"]
  
  universal_context:
    type: "loose_coupling" 
    validates: "context loading and inheritance"
    dependencies: ["@lev-os/contexts"]
```

### 3. Performance Specifications
Behavioral performance requirements:

```yaml
# performance.yaml
performance_requirements:
  assembly_time:
    max_duration: "50ms"
    test_scenario: "10 contexts with validation"
  
  memory_usage:
    max_heap: "256MB"
    test_scenario: "1000 cached contexts"
```

## 🔧 TOOLING & AUTOMATION

### Spec Discovery Tool
```bash
# Auto-discover all component specs
lev specs discover

# Validate spec coverage across ecosystem
lev specs validate --coverage

# Generate missing spec templates
lev specs generate --component @lev-os/memory
```

### Documentation Generation
BDD specs automatically become living documentation:

```bash
# Generate docs from all .feature files
lev specs docs generate

# Update component READMEs from specs
lev specs docs sync
```

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Foundation ✅ PLANNED
1. **Create specs/ global directory** - This file and registry structure
2. **Extend base.schema.yaml** - Add specifications section to constitutional framework
3. **Create component-local specs/** - For core/schema and core/legos

### Phase 2: BDD Feature Capture 🔄 NEXT
1. **Define lego assembly features** - What does context composition actually DO?
2. **Define schema validation features** - How does the constitutional framework work?
3. **Define memory config features** - How does ~/.leviathan solve config chaos?

### Phase 3: Living Documentation 📋 FUTURE
1. **Auto-generate docs** - BDD specs become user documentation
2. **Validation pipeline** - CI/CD ensures spec coverage
3. **Template system** - New components get spec scaffolding

## 💡 KEY INSIGHTS

### The "Save .md Everywhere" Solution
**Before**: Design docs scattered across random locations  
**After**: specs/ fractal provides natural home for all specifications

### Schema-Driven Discovery
**Pattern**: Base schema defines spec requirements → Components implement → Registry auto-discovers → Tooling validates

### Living Documentation
**Flow**: BDD .feature files → Auto-generated docs → User documentation → Continuous validation

## 📋 CURRENT STATUS

### What We Just Built (Architectural Boundaries)
- ✅ `core/schema/` - The Lego Factory with 9 sophisticated block types
- ✅ `core/legos/` - The Assembly System with validation/generation/composition
- ❌ **Feature specifications** - What do these actually DO behaviorally?

### Next: Feature Specification Session
1. **core/schema/specs/README.md** - Constitutional framework behaviors
2. **core/legos/specs/README.md** - Assembly, generation, validation features  
3. **~/.leviathan spec** - Configuration management capabilities

---

**Architecture Insight**: specs/ fractal solves the fundamental "where do design docs live?" problem by making every component responsible for its own specifications while maintaining global discoverability.

**Next Session**: Define actual behavioral features of the lego system we just built.