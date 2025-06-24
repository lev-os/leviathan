# 📦 MASTRA PACKAGE ARCHITECTURE ANALYSIS FOR LEVIATHAN @lev-os DESIGN

## Executive Summary

After analyzing Mastra's monorepo structure, I've identified key patterns that can transform Leviathan's confused plugin system into a proper package-based architecture. Mastra uses a **pnpm workspace** with **Turbo** for orchestration, maintaining clear boundaries between core packages, optional components, and examples.

## 🏗️ MASTRA'S PACKAGE ARCHITECTURE

### Monorepo Structure
```
mastra/
├── packages/           # Core packages published to npm
├── stores/            # Storage backend implementations
├── deployers/         # Deployment-specific packages
├── integrations/      # Third-party integrations
├── auth/              # Authentication providers
├── client-sdks/       # Client libraries
├── voice/             # Voice-related packages
├── examples/          # Example applications (not published)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### Package Organization Patterns

#### 1. **Core Packages (`packages/`)**
```
packages/
├── @mastra/core       # Main framework entry point
├── @mastra/rag        # RAG functionality
├── @mastra/memory     # Memory management
├── @mastra/evals      # Evaluation framework
├── @mastra/mcp        # MCP protocol implementation
├── @mastra/server     # HTTP server wrapper
├── @mastra/cli        # CLI tools
├── @mastra/auth       # Auth abstractions
└── _config/           # Internal shared configs (@internal/lint)
```

#### 2. **Dependency Management**
```json
// @mastra/rag dependencies
{
  "peerDependencies": {
    "@mastra/core": "^0.10.0-alpha.0",
    "ai": "^4.0.0"
  },
  "devDependencies": {
    "@mastra/core": "workspace:*"  // Uses workspace protocol
  }
}
```

#### 3. **Export Patterns**
```json
// Sophisticated export configuration
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./processors": {
      // Subpath exports for specific features
    }
  }
}
```

## 🔍 KEY ARCHITECTURAL INSIGHTS

### 1. **Package vs Plugin Distinction**

**Mastra's Core Packages:**
- Published to npm registry
- Have peer dependencies on @mastra/core
- Use workspace protocol for development
- Provide essential framework functionality

**Mastra's Optional Components:**
- Integrations are separate packages
- Stores are pluggable backends
- Examples are never published
- Clear boundaries via package.json

### 2. **Workspace Configuration**

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "deployers/*"
  - "stores/*"
  - "integrations/*"
  - "auth/*"
  - "!packages/cli/admin"  # Exclusions
```

### 3. **Build System Integration**

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    }
  }
}
```

### 4. **Internal Shared Packages**

```
packages/_config/  # @internal/lint - private, shared configs
├── eslint.js
├── prettier.js
└── package.json (marked as "private": true)
```

## 🎯 RECOMMENDATIONS FOR LEVIATHAN @lev-os

### 1. **Proposed Package Structure**

```
lev/
├── packages/          # Core @lev-os packages
│   ├── @lev-os/core
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── llm-runtime/    # LLM-first runtime
│   │   │   ├── bidirectional/  # Bidirectional flow
│   │   │   └── constitutional/ # Constitutional AI
│   │   └── tsconfig.json
│   ├── @lev-os/memory
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── interface.ts    # Memory interface
│   │   │   └── backends/       # Swappable backends
│   │   └── tsconfig.json
│   ├── @lev-os/agents
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── personality-system.ts
│   │   │   └── ceo-binding.ts
│   │   └── tsconfig.json
│   ├── @lev-os/workflow
│   ├── @lev-os/mcp
│   ├── @lev-os/testing
│   ├── @lev-os/workshop
│   └── @internal/config      # Private shared configs
├── plugins/           # True optional plugins
│   ├── @homie/media-forge
│   └── @community/*
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 2. **Package Dependencies Pattern**

```json
// @lev-os/memory/package.json
{
  "name": "@lev-os/memory",
  "version": "0.1.0",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./backends": {
      "import": "./dist/backends/index.js",
      "types": "./dist/backends/index.d.ts"
    }
  },
  "peerDependencies": {
    "@lev-os/core": "^0.1.0"
  },
  "devDependencies": {
    "@lev-os/core": "workspace:*",
    "@internal/config": "workspace:*"
  }
}
```

### 3. **Workspace Configuration**

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "plugins/*"
  - "os/*"          # Experimental (will move to separate repo)
  - "examples/*"    # Not published
```

### 4. **Build Configuration**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

## 📋 MIGRATION PLAN

### Phase 1: Setup Package Infrastructure (Week 1)

1. **Create packages directory structure**
   ```bash
   mkdir -p packages/{core,memory,agents,workflow,mcp,testing,workshop}
   mkdir -p packages/@internal/config
   ```

2. **Configure pnpm workspace**
   ```bash
   # Create pnpm-workspace.yaml
   # Setup turbo.json
   # Update root package.json
   ```

3. **Create package templates**
   - Standard package.json structure
   - TypeScript configurations
   - Build scripts

### Phase 2: Migrate Core Components (Week 2)

```bash
# Current → Target
plugins/@lev-os/memory → packages/@lev-os/memory
plugins/@lev-os/testing → packages/@lev-os/testing
plugins/@lev-os/cmd → packages/@lev-os/cli
plugins/@lev/workshop → packages/@lev-os/workshop
```

### Phase 3: Update Import Patterns (Week 3)

```javascript
// Before
import { MemoryManager } from '../plugins/@lev-os/memory';

// After
import { MemoryManager } from '@lev-os/memory';
import { MemoryBackend } from '@lev-os/memory/backends';
```

### Phase 4: Plugin System Refinement (Week 4)

- Keep only truly optional components in plugins/
- Implement plugin discovery for optional features
- Document plugin vs package decision criteria

## 🎯 KEY DIFFERENCES FROM MASTRA

### Leviathan-Specific Patterns

1. **LLM-First Core**
   - @lev-os/core contains bidirectional flow engine
   - Constitutional AI built into core
   - 8-personality system as core feature

2. **Memory Architecture**
   - Interface-based design for backend switching
   - Supports Graphiti, Mastra, file-system backends
   - Memory type assembly (Procedural, Semantic, etc.)

3. **Workshop Intelligence**
   - Core component for tool evaluation
   - 8-tier classification system
   - Not optional like Mastra's integrations

## 📊 SUCCESS METRICS

1. **Clear Boundaries**: Core packages vs optional plugins
2. **Performance**: Direct imports, no plugin discovery overhead
3. **Developer Experience**: Standard npm package patterns
4. **Type Safety**: Full TypeScript support with proper exports
5. **Build Speed**: Turbo caching and parallel builds

## 🚀 NEXT STEPS

1. Create package infrastructure with pnpm workspace
2. Set up Turbo for build orchestration
3. Migrate false plugins to packages directory
4. Update all import statements
5. Configure package exports and dependencies
6. Set up CI/CD for package publishing

This architecture transformation will position Leviathan as a mature, package-based framework ready for both internal development and potential open-source release.