# Codex Plugin Migration Plan & Community Dogfooding Workflow

## Overview

This document outlines the migration plan for the `@lev-os/codex` plugin from the infinite-genesis-canvas project to the main Leviathan repository, and establishes a community dogfooding workflow for local plugin development.

## Current State

### Plugin Location
- **Source**: `/Users/jean-patricksmith/digital/kingly/apps/incubator/infinite-genesis-canvas/packages/codex/`
- **Status**: Complete hexagonal architecture plugin with working search functionality
- **Package**: `@lev-os/codex` with proper Leviathan integration patterns

### Plugin Architecture
```
packages/codex/
├── config/plugin.yaml           # Hexagonal plugin manifest
├── src/
│   ├── index.js                 # Main plugin exports
│   ├── commands/                # Command layer (ports)
│   │   ├── search.js
│   │   ├── analyze.js
│   │   ├── discover.js
│   │   └── crystallize.js
│   ├── adapters/                # Adapter layer
│   │   ├── search-adapter.js
│   │   ├── analysis-adapter.js
│   │   ├── discovery-adapter.js
│   │   └── crystallization-adapter.js
│   ├── domain/                  # Business logic
│   │   ├── search-engine.js
│   │   ├── pattern-analyzer.js
│   │   ├── discovery-engine.js
│   │   └── crystallization-engine.js
│   └── infrastructure/          # External concerns
│       └── knowledge-repository.js
├── knowledge/                   # Framework knowledge base
│   ├── paradigms/
│   ├── languages/
│   └── frameworks/
└── package.json                 # @lev-os/codex configuration
```

## Migration Strategy

### Phase 1: Community Dogfooding (Current)

**Goal**: Test the plugin as a community user would, using local linking without publishing.

#### Option A: pnpm Link (Recommended for Development)
```bash
# Step 1: Link plugin globally from source
cd /Users/jean-patricksmith/digital/kingly/apps/incubator/infinite-genesis-canvas/packages/codex
pnpm link --global

# Step 2: Link to Leviathan agent
cd /Users/jean-patricksmith/lev/agent  
pnpm link --global @lev-os/codex

# Step 3: Test integration
node src/index.js
# Should discover and register codex commands
```

#### Option B: Workspace Development (Recommended for Final Testing)
```bash
# Step 1: Copy plugin to Leviathan workspace
cp -r /Users/jean-patricksmith/digital/kingly/apps/incubator/infinite-genesis-canvas/packages/codex \
      /Users/jean-patricksmith/lev/plugins/@lev-os/

# Step 2: Install dependencies
cd /Users/jean-patricksmith/lev
pnpm install

# Step 3: Test plugin ecosystem
pnpm test:plugins
```

### Phase 2: Migration to Leviathan Repository

**Goal**: Move the plugin to its permanent home in the Leviathan ecosystem.

#### Pre-Migration Checklist
- [ ] Plugin works via pnpm link with agent
- [ ] All commands properly registered
- [ ] Plugin manifest validates against Leviathan patterns
- [ ] Knowledge base loads correctly
- [ ] Hexagonal architecture maintained

#### Migration Steps
1. **Copy Plugin Structure**:
   ```bash
   mkdir -p /Users/jean-patricksmith/lev/plugins/@lev-os/codex
   cp -r packages/codex/* /Users/jean-patricksmith/lev/plugins/@lev-os/codex/
   ```

2. **Update Dependencies**:
   - Ensure `@lev-os/debug`, `@lev-os/core`, `@lev-os/testing` are available
   - Update package.json peerDependencies to use workspace versions

3. **Integration Testing**:
   ```bash
   cd /Users/jean-patricksmith/lev
   pnpm install
   pnpm test:plugins
   pnpm test:e2e
   ```

4. **Validation**:
   - Plugin discoverable by agent
   - Commands accessible via CLI
   - Cross-plugin coordination working
   - Performance metrics acceptable

## Community Developer Experience

### Local Plugin Development Workflow

This workflow demonstrates how external developers can develop and test Leviathan plugins:

#### 1. Plugin Creation
```bash
# Developer creates plugin (anywhere)
mkdir my-awesome-plugin
cd my-awesome-plugin
npm init -y
npm install yaml  # Add dependencies
```

#### 2. Leviathan Plugin Structure
```javascript
// package.json
{
  "name": "@lev-os/my-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.js",
  "peerDependencies": {
    "@lev-os/debug": "workspace:*",
    "@lev-os/core": "workspace:*"
  }
}

// config/plugin.yaml
plugin:
  name: my-plugin
  capabilities: [...]
  commands: [...]

// src/index.js
export { my_command } from './commands/my-command.js';
```

#### 3. Local Testing with Leviathan
```bash
# Link plugin for testing
cd my-awesome-plugin
pnpm link --global

# Test with Leviathan agent
cd /path/to/leviathan/agent
pnpm link --global @lev-os/my-plugin
node src/index.js  # Plugin should be discovered
```

#### 4. Publishing (Optional)
```bash
# When ready to publish
npm publish  # Makes plugin available to community
```

## Codex Plugin Specifics

### Capabilities
- **framework_knowledge_search**: Search programming knowledge with confidence scoring
- **pattern_recognition**: Identify and analyze code patterns
- **anti_pattern_detection**: Detect problematic patterns and suggest alternatives
- **cross_reference_analysis**: Find relationships between frameworks and patterns
- **intelligent_recommendations**: Provide contextual suggestions
- **knowledge_crystallization**: Extract essential patterns from comprehensive documentation

### Commands
- **`lev codex search <query>`**: Search framework knowledge with intelligent ranking
- **`lev codex analyze <pattern>`**: Analyze code patterns and suggest improvements
- **`lev codex discover <framework>`**: Discover framework capabilities and learning paths
- **`lev codex crystallize <technology>`**: Apply knowledge crystallization methodology

### Knowledge Base
- **Paradigms**: Knowledge crystallization methodology
- **Languages**: TypeScript patterns and best practices
- **Frameworks**: React, Next.js, Tailwind, shadcn/ui comprehensive patterns

### Integration Points
- **Agent System**: `@lev-os/core` for command registration and routing
- **Debug System**: `@lev-os/debug` for structured logging and monitoring
- **Testing Framework**: `@lev-os/testing` for plugin validation
- **Cross-Plugin**: Compatible with other @lev-os plugins

## Success Criteria

### Technical Validation
- [ ] Plugin loads without errors
- [ ] All commands respond correctly
- [ ] Knowledge base accessible
- [ ] Performance within acceptable limits (<100ms search)
- [ ] Memory usage reasonable (<50MB)

### Community Experience
- [ ] Clear documentation for plugin development
- [ ] Easy local testing workflow
- [ ] Minimal setup required
- [ ] Good error messages and debugging
- [ ] Discoverable through agent system

### Integration Quality
- [ ] Follows Leviathan hexagonal architecture
- [ ] Compatible with other plugins
- [ ] Proper dependency management
- [ ] Clean separation of concerns
- [ ] LLM-first reasoning patterns

## Next Steps

1. **Immediate**: Test community dogfooding workflow with pnpm link
2. **Short-term**: Validate plugin performance and integration
3. **Medium-term**: Complete migration to Leviathan repository
4. **Long-term**: Document patterns for other community plugins

## Notes

- This plugin serves as a reference implementation for Leviathan hexagonal architecture
- The community dogfooding approach validates both plugin development and agent integration
- Knowledge crystallization methodology could be extracted as a separate pattern
- Framework knowledge base provides value for LLM-first development workflows

---

**Status**: Ready for community dogfooding phase
**Last Updated**: 2025-01-18
**Contact**: Leviathan Team (sponsored by Kingly Agency)