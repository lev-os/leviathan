# Leviathan Core Packages

## 🎯 Architecture Overview

lev-os core is organized as a monorepo of focused packages with clear separation of concerns. Each package handles a specific domain while maintaining universal patterns.

## 📦 Core Package Structure

### @lev-os/debug - Universal Debugging

**Purpose**: Logging, tracing, and monitoring for all core packages and plugins
**Used by**: Every other package and plugin
**Key exports**: `logger`, `tracer`, `monitor`

### @lev-os/cmd - Command & Process Management

**Purpose**: Process execution, git worktree management, job integration
**Dependencies**: @lev-os/debug
**Key exports**: `processManager`, `jobIntegration`, `worktreeManager`

### @lev-os/memory - Memory Backends

**Purpose**: File, embeddings, vector, and graph memory backends
**Dependencies**: @lev-os/debug
**Key exports**: `memoryBackend`, `semanticSearch`, `graphMemory`

### @lev-os/universal-validation - Universal Validation Framework

**Purpose**: Comprehensive validation across domains with mathematical consciousness validation, expert consensus, systematic opposition, cognitive parliament, 3D visualization, and breakthrough pattern propagation
**Dependencies**: @lev-os/debug
**Key exports**: `UniversalValidationSystem`, `MathematicalValidator`, `ExpertConsensusValidator`, `OppositionValidator`, `ParliamentValidator`, `VisualizationValidator`, `BreakthroughBubbler`

## 🔄 Package Dependencies

```
@lev-os/debug (foundation)
    ↑
    ├── @lev-os/cmd
    ├── @lev-os/memory
    ├── @lev-os/universal-validation
    └── [future packages]
```

**Dependency Rules**:

- All packages import @lev-os/debug for universal observability
- Core packages can directly import each other (coupling is fine)
- Community plugins use event bus boundaries

## 🧬 Universal Patterns

### Standard Package Structure

```
packages/[package-name]/
├── package.json          # Dependencies and metadata
├── src/
│   ├── index.js         # Main exports
│   └── [domain-logic].js # Implementation files
└── config/plugin.yaml   # YAML-first configuration
```

### Standard Import Pattern

```javascript
// Every package imports debug
import { logger, tracer, monitor } from '@lev-os/debug'

// Core packages import each other directly
import { processManager } from '@lev-os/cmd'
import { memoryBackend } from '@lev-os/memory'
```

### Standard YAML Configuration

```yaml
plugin:
  name: package-name
  version: 1.0.0
  type: core_plugin
  description: 'Package purpose'

capabilities:
  - domain_capability_1
  - domain_capability_2

commands:
  package_command:
    syntax: 'lev-os package command <args>'
    description: 'Command description'
    whisper:
      strategies: ['LLM-first approach']
      llm_guidance: 'How LLM should handle this'
```

## 🔧 Development Workflow

### Adding New Core Package

1. **Create package directory** `packages/new-package/`
2. **Follow standard structure** with src/, config/, package.json
3. **Import @lev-os/debug** for universal observability
4. **Define YAML configuration** with commands and capabilities
5. **Update this README** with package description
6. **Add to monorepo dependencies** as needed

### Package Integration

- **Direct imports** between core packages (fast, simple)
- **YAML configuration** for all behavior definitions
- **Universal debugging** with consistent patterns
- **Command registration** via existing registry system

## 🚫 Anti-Patterns

### Avoid These Mistakes

- ❌ Creating packages without @lev-os/debug integration
- ❌ Hardcoding behavior instead of YAML configuration
- ❌ Complex inter-package communication (use direct imports)
- ❌ Skipping YAML manifest for core packages
- ❌ Building frameworks instead of using LLM reasoning

## ✅ Success Criteria

### Well-Designed Package Checklist

- [ ] Imports @lev-os/debug for observability
- [ ] Has YAML configuration defining behavior
- [ ] Follows standard directory structure
- [ ] Exports clear, focused functionality
- [ ] Integrates with command registry
- [ ] Uses LLM-first reasoning patterns
- [ ] Documents dependencies clearly

---

_Monorepo structure for lev-os core packages with clear separation of concerns_
