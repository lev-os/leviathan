# 📦 MASTRA PACKAGE PATTERNS FOR LEVIATHAN ARCHITECTURE

## Executive Summary

Mastra's package architecture provides excellent patterns for Leviathan's transition from plugins to packages. Their use of proper ESM/CJS dual builds, comprehensive exports maps, and workspace management offers a blueprint for professional package development.

## 🏗️ Key Patterns to Adopt

### 1. **Dual Module Format Support**

```json
{
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
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
    }
  }
}
```

**Why This Matters for Leviathan:**
- Supports both modern ESM and legacy CJS consumers
- Enables gradual migration paths
- Maximizes compatibility with existing tools

### 2. **Granular Export Control**

```json
{
  "exports": {
    "./workflows/legacy": {
      "import": "./dist/workflows/legacy/index.js"
    },
    "./utils": {
      "import": "./dist/utils.js"
    },
    "./package.json": "./package.json"
  }
}
```

**Benefits:**
- Precise API surface control
- Tree-shaking optimization
- Clear module boundaries
- Prevents internal API leakage

### 3. **Build System Excellence**

```json
{
  "scripts": {
    "check": "tsc --noEmit",
    "pre-build": "tsup --silent --config tsup.config.ts --format esm,cjs",
    "build": "node ./tools/commonjs-tsc-fixer.js",
    "size": "size-limit"
  }
}
```

**Key Tools:**
- **tsup**: Fast, zero-config bundler
- **size-limit**: Bundle size monitoring
- **Custom CJS fixer**: Handles module format edge cases

### 4. **Dependency Management**

```json
{
  "dependencies": {
    "@mastra/schema-compat": "workspace:*",
    "ai": "^4.3.16",
    "xstate": "^5.19.4"
  },
  "peerDependencies": {
    "zod": "^3.0.0"
  }
}
```

**Patterns:**
- Workspace protocol for internal packages
- Peer dependencies for shared libraries
- Minimal direct dependencies

## 🔄 Applying to Leviathan Packages

### @lev-os/core Package Structure

```json
{
  "name": "@lev-os/core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./bidirectional": {
      "import": "./dist/bidirectional/index.js",
      "types": "./dist/bidirectional/index.d.ts"
    },
    "./constitutional": {
      "import": "./dist/constitutional/index.js",
      "types": "./dist/constitutional/index.d.ts"
    },
    "./flowmind": {
      "import": "./dist/flowmind/index.js",
      "types": "./dist/flowmind/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "size": "size-limit --why"
  }
}
```

### @lev-os/memory Package

```json
{
  "name": "@lev-os/memory",
  "exports": {
    ".": "./dist/index.js",
    "./backends": "./dist/backends/index.js",
    "./hybrid": "./dist/hybrid/index.js",
    "./types": "./dist/types/index.js"
  },
  "peerDependencies": {
    "@lev-os/core": "workspace:*"
  }
}
```

## 📊 Package Architecture Comparison

| Aspect | Mastra Pattern | Leviathan Adaptation |
|--------|---------------|---------------------|
| **Module System** | ESM + CJS dual | Same, but ESM-first |
| **Bundler** | tsup | tsup (proven choice) |
| **Exports** | Granular paths | Even more granular for LLM contexts |
| **Workspace** | pnpm + workspace:* | Same pattern |
| **Types** | Separate .d.ts | Inline + separate for flexibility |

## 🚀 Implementation Blueprint

### Phase 1: Core Package Migration

```bash
# 1. Create package structure
packages/
├── @lev-os/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── bidirectional/
│   │   │   ├── constitutional/
│   │   │   └── flowmind/
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── memory/
│   ├── agents/
│   └── workflow/

# 2. Configure tsup for each package
export default {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
}
```

### Phase 2: Export Map Design

```json
{
  "exports": {
    // Main entry
    ".": {
      "llm-first": "./dist/llm-first/index.js",  // New pattern!
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    // LLM-specific exports
    "./contexts/*": {
      "llm": "./contexts/*.md",  // Direct markdown access
      "import": "./dist/contexts/*.js"
    },
    // Bidirectional flow patterns
    "./flows": {
      "import": "./dist/flows/index.js",
      "llm": "./flows/*.yaml"  // YAML definitions
    }
  }
}
```

### Phase 3: Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/@lev-os/*"
  - "packages/@internal/*"
  - "plugins/@homie/*"
  - "plugins/@community/*"
  - "examples/*"
  - "!**/test/**"
```

## 🎯 Unique Leviathan Enhancements

### 1. **LLM-First Export Conditions**

```json
{
  "exports": {
    ".": {
      "llm-first": "./dist/llm-runtime.js",
      "javascript": "./dist/compat.js",
      "default": "./dist/index.js"
    }
  }
}
```

### 2. **Context-Aware Packaging**

```typescript
// @lev-os/core/src/packaging.ts
export function packageForLLM(config: PackageConfig) {
  return {
    contexts: loadContexts(config.contextsDir),
    flows: loadFlows(config.flowsDir),
    constitutional: loadConstitution(config.constitutionPath),
  };
}
```

### 3. **Bidirectional Module Loading**

```typescript
// Support loading modules in both directions
export const bidirectionalExports = {
  // JavaScript can import LLM contexts
  fromJS: () => import('./contexts/executive.md'),
  // LLM contexts can reference JavaScript
  forLLM: () => ({ 
    module: '@lev-os/core',
    context: 'executive'
  })
};
```

## 📈 Migration Benefits

1. **Professional Structure**: Match industry standards
2. **Better DX**: Improved IntelliSense and type safety
3. **Cleaner Imports**: `import { Agent } from '@lev-os/agents'`
4. **Version Management**: Independent package versioning
5. **Tree Shaking**: Only import what you need
6. **LLM Optimization**: Contexts packaged for LLM consumption

## 🔧 Tooling Recommendations

### Essential Tools from Mastra

1. **tsup** - Fast, zero-config bundler
2. **size-limit** - Monitor bundle sizes
3. **pnpm** - Efficient package management
4. **turbo** - Monorepo task orchestration

### Leviathan-Specific Tools

1. **Context Bundler** - Package .md files for LLM consumption
2. **Flow Validator** - Validate bidirectional flows
3. **Constitutional Linter** - Ensure value alignment
4. **LLM Export Generator** - Create LLM-optimized exports

## Conclusion

Mastra's package architecture provides an excellent foundation for Leviathan's evolution. By adopting their patterns while adding LLM-first enhancements, Leviathan can achieve both professional package management and revolutionary LLM-native capabilities.

The key is to take Mastra's solid engineering practices and extend them with Kingly's unique bidirectional flow and constitutional AI concepts, creating a package ecosystem that serves both traditional developers and the emerging LLM-first paradigm.