# 🚀 LEVIATHAN @lev-os PACKAGE MIGRATION GUIDE

## Overview

This guide provides step-by-step instructions to migrate Leviathan from a confused plugin system to a proper package-based architecture inspired by Mastra's proven patterns.

## 📋 PRE-MIGRATION CHECKLIST

- [ ] Backup current codebase
- [ ] Document all current import patterns
- [ ] List all direct dependencies between components
- [ ] Identify truly optional vs core components
- [ ] Ensure all tests are passing

## 🏗️ PHASE 1: INFRASTRUCTURE SETUP

### Step 1: Create Package Structure

```bash
# Create core package directories
mkdir -p ~/lev/packages/@lev-os/{core,memory,agents,workflow,mcp,testing,workshop,cli}
mkdir -p ~/lev/packages/@internal/config

# Keep plugins for truly optional components
mkdir -p ~/lev/plugins/{@homie,@community,@enterprise}
```

### Step 2: Setup pnpm Workspace

Create `~/lev/pnpm-workspace.yaml`:
```yaml
packages:
  # Core packages
  - "packages/*"
  - "packages/@lev-os/*"
  - "packages/@internal/*"
  
  # Optional plugins
  - "plugins/*"
  - "plugins/@homie/*"
  - "plugins/@community/*"
  
  # Agent configurations and workflows
  - "agent"
  
  # Examples (not published)
  - "examples/*"
  
  # Exclude certain paths
  - "!**/test/**"
  - "!**/.test/**"
```

### Step 3: Configure Turbo

Create `~/lev/turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "!dist/**/*.test.*"],
      "env": ["NODE_ENV"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Step 4: Update Root Package.json

```json
{
  "name": "leviathan-monorepo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "dev": "turbo dev",
    "clean": "turbo clean && rm -rf node_modules",
    "preinstall": "npx only-allow pnpm"
  },
  "devDependencies": {
    "turbo": "^2.5.4",
    "@changesets/cli": "^2.29.4",
    "typescript": "^5.8.3"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9.7.0"
  },
  "packageManager": "pnpm@9.7.0"
}
```

## 📦 PHASE 2: PACKAGE TEMPLATES

### Core Package Template

Create `~/lev/packages/@lev-os/core/package.json`:
```json
{
  "name": "@lev-os/core",
  "version": "0.1.0",
  "description": "LLM-first runtime with bidirectional flow",
  "license": "MIT",
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
    },
    "./bidirectional": {
      "import": {
        "types": "./dist/bidirectional/index.d.ts",
        "default": "./dist/bidirectional/index.js"
      }
    },
    "./constitutional": {
      "import": {
        "types": "./dist/constitutional/index.d.ts",
        "default": "./dist/constitutional/index.js"
      }
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "xstate": "^5.19.4"
  },
  "devDependencies": {
    "@internal/config": "workspace:*",
    "tsup": "^8.5.0",
    "vitest": "^3.2.3"
  },
  "files": [
    "dist",
    "!dist/**/*.test.*"
  ],
  "keywords": [
    "llm-first",
    "bidirectional-flow",
    "constitutional-ai",
    "agent-framework"
  ]
}
```

### Memory Package Template

Create `~/lev/packages/@lev-os/memory/package.json`:
```json
{
  "name": "@lev-os/memory",
  "version": "0.1.0",
  "description": "Hybrid memory system with swappable backends",
  "license": "MIT",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./backends": {
      "import": {
        "types": "./dist/backends/index.d.ts",
        "default": "./dist/backends/index.js"
      }
    },
    "./types": {
      "import": {
        "types": "./dist/types.d.ts",
        "default": "./dist/types.js"
      }
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/backends/index.ts --format esm,cjs --dts --clean",
    "dev": "tsup src/index.ts src/backends/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run",
    "test:integration": "cd integration-tests && pnpm test"
  },
  "peerDependencies": {
    "@lev-os/core": "^0.1.0"
  },
  "devDependencies": {
    "@lev-os/core": "workspace:*",
    "@internal/config": "workspace:*"
  },
  "dependencies": {
    "neo4j-driver": "^5.0.0",
    "@upstash/redis": "^1.35.0"
  }
}
```

### Internal Config Package

Create `~/lev/packages/@internal/config/package.json`:
```json
{
  "name": "@internal/config",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    "./eslint": "./src/eslint.js",
    "./prettier": "./src/prettier.js",
    "./tsconfig": "./tsconfig.base.json"
  },
  "dependencies": {
    "eslint": "^9.29.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.3"
  }
}
```

## 🔄 PHASE 3: MIGRATION STEPS

### Step 1: Move Core Components

```bash
# Memory system
cp -r ~/lev/packages/memory/* ~/lev/packages/@lev-os/memory/
# Update imports in package.json and source files

# Testing framework
cp -r ~/lev/packages/testing/* ~/lev/packages/@lev-os/testing/

# Command execution → CLI
cp -r ~/lev/packages/commands/* ~/lev/packages/@lev-os/cli/

# Workshop intelligence
cp -r ~/lev/packages/workshop/* ~/lev/packages/@lev-os/workshop/
```

### Step 2: Update Import Patterns

Create migration script `~/lev/scripts/migrate-imports.js`:
```javascript
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

const IMPORT_MAPPINGS = {
  '../packages/memory': '@lev-os/memory',
  '../../packages/memory': '@lev-os/memory',
  '../packages/testing': '@lev-os/testing',
  '../packages/commands': '@lev-os/cli',
  '../packages/workshop': '@lev-os/workshop',
};

async function migrateImports() {
  const files = await glob('**/*.{js,ts,jsx,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'plugins/**']
  });

  for (const file of files) {
    let content = await readFile(file, 'utf-8');
    let modified = false;

    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        content = content.replaceAll(oldImport, newImport);
        modified = true;
      }
    }

    if (modified) {
      await writeFile(file, content);
      console.log(`Updated imports in ${file}`);
    }
  }
}

migrateImports();
```

### Step 3: Update MCP Tool Registrations

Update `~/lev/agent/mcp-server.js`:
```javascript
// Before
import { MemoryTools } from '../packages/memory/tools.js';

// After
import { MemoryTools } from '@lev-os/memory';
import { MemoryBackends } from '@lev-os/memory/backends';
```

## 🧪 PHASE 4: TESTING & VALIDATION

### Step 1: Create Package Tests

For each package, create test structure:
```
packages/@lev-os/[package]/
├── src/
│   ├── __tests__/
│   │   ├── unit/
│   │   └── integration/
│   └── index.test.ts
└── vitest.config.ts
```

### Step 2: Verify Package Boundaries

Create `~/lev/scripts/verify-dependencies.js`:
```javascript
// Script to ensure no circular dependencies
// and validate package boundaries
```

### Step 3: Integration Testing

```bash
# Test all packages build correctly
pnpm build

# Run all tests
pnpm test

# Type checking
pnpm typecheck
```

## 📝 PHASE 5: DOCUMENTATION

### Package README Template

For each package, create comprehensive documentation:
```markdown
# @lev-os/[package-name]

## Overview
[Package description]

## Installation
\`\`\`bash
pnpm add @lev-os/[package-name]
\`\`\`

## Usage
\`\`\`javascript
import { Component } from '@lev-os/[package-name]';
\`\`\`

## API Reference
[Detailed API documentation]

## Examples
[Code examples]
```

### Update Root Documentation

Update main README with new package structure and installation instructions.

## 🚀 PHASE 6: RELEASE PREPARATION

### Step 1: Setup Changesets

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

### Step 2: Configure Package Publishing

Update package.json files with:
- Proper npm scope (@lev-os)
- License information
- Repository URLs
- Keywords for discoverability

### Step 3: CI/CD Pipeline

Create GitHub Actions workflow for:
- Automated testing
- Package building
- Version management
- npm publishing

## ✅ POST-MIGRATION CHECKLIST

- [ ] All imports updated to new package names
- [ ] No remaining references to plugin paths
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Documentation updated
- [ ] Package dependencies validated
- [ ] Build system optimized with Turbo
- [ ] Developer experience improved

## 🎯 SUCCESS INDICATORS

1. **Clean Architecture**: Clear separation between packages and plugins
2. **Fast Builds**: Turbo caching reduces build times by 50%+
3. **Type Safety**: Full TypeScript support with proper exports
4. **Developer Experience**: Standard npm package patterns
5. **Maintainability**: Easy to add new packages or plugins

This migration transforms Leviathan into a professional, package-based architecture ready for growth and potential open-source release.