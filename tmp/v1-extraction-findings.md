# V1.0 Extraction Findings Report

_Generated: ${new Date().toISOString()}_

## 🚨 Critical Finding: Experimental Features in Core

The following experimental features are currently mixed into the core system and must be extracted into plugins for v1.0:

### 1. Constitutional Framework (CRITICAL)

**Location**: `agent/src/core/constitutional-framework.js`
**Problem**: This is an experimental AI ethics/neurochemical optimization feature
**Dependencies**:

- Imported by `universal-context-system.js` (core system)
- Used by `constitutional-validate` command
- Contains neurochemical profiles (HIGH_ENERGY_ACTION, DEEP_FOCUS_ANALYTICAL, etc.)
  **Action**: Extract to `plugins/@lev-os/constitutional-ai/`

### 2. EEPS References (HIGH)

**Locations**:

- CLI adapters reference "eeps" agent types
- Agent manager has EEPS filtering
  **Problem**: EEPS (8-personality system) is a v2.0 experimental feature
  **Action**: Remove EEPS references from core, create `plugins/@lev-os/eeps-personality/`

### 3. Bidirectional Flow (MEDIUM)

**Locations**:

- `hybrid-router.js` - has bidirectional sync methods
- `semantic_search.js` - createBidirectionalLink
  **Problem**: Bidirectional flow is a v2.0 research feature
  **Action**: Extract to `plugins/@lev-os/bidirectional-flow/`

### 4. Core/Plugin Architecture Confusion

**Finding**: The `_core.md` document itself shows experimental features in proposed core structure:

```
├── core/
│   ├── agents/
│   │   ├── personality-system.js   # ❌ Should be plugin
│   │   ├── context-switcher.js     # ❌ v2.0 feature
│   ├── constitutional/             # ❌ Entire directory should be plugin
│   └── mcp/
│       └── bidirectional.js        # ❌ v2.0 feature
```

## 📋 Extraction Tasks

### Phase 1: Remove Constitutional AI from Core

1. Create `plugins/@lev-os/constitutional-ai/` structure
2. Move `constitutional-framework.js` to plugin
3. Update `universal-context-system.js` to work without constitutional validation
4. Move `constitutional-validate` command to plugin
5. Update all imports and references

### Phase 2: Extract EEPS References

1. Create `plugins/@lev-os/eeps-personality/` structure
2. Remove EEPS filtering from agent-manager
3. Update CLI adapters to not reference EEPS
4. Move any personality-related code to plugin

### Phase 3: Extract Bidirectional Flow

1. Create `plugins/@lev-os/bidirectional-flow/` structure
2. Extract bidirectional methods from hybrid-router
3. Move bidirectional link creation from semantic_search
4. Update any workflow references

### Phase 4: Update Architecture Documentation

1. Update `_core.md` to reflect true v1.0 structure
2. Remove all experimental features from core proposals
3. Document plugin interfaces for future features

## 🎯 V1.0 Core Should Only Include:

### Technical Plumbing

- MCP server implementation
- CLI adapter (hexagonal pattern)
- Command registry and routing
- Basic session management
- Memory interface (not implementation)
- Test framework
- Plugin discovery system

### NOT in V1.0 Core:

- ❌ Constitutional AI
- ❌ EEPS personality system
- ❌ Bidirectional flow
- ❌ FlowMind
- ❌ JEPA learning
- ❌ Neurochemical optimization
- ❌ Any "AI alignment" features

## 🔍 Code References

### Files That Need Major Updates:

1. `agent/src/core/universal-context-system.js` - Remove constitutional dependency
2. `agent/src/core/agents/agent-manager.js` - Remove EEPS references
3. `agent/src/hybrid-router.js` - Extract bidirectional features
4. `agent/src/adapters/cli/*` - Clean EEPS references

### Commands to Move to Plugins:

- `constitutional-validate` → `@lev-os/constitutional-ai`
- Any EEPS-related commands → `@lev-os/eeps-personality`
- Bidirectional sync commands → `@lev-os/bidirectional-flow`

## 📊 Impact Analysis

### Breaking Changes:

- `universal-context-system` will no longer validate against constitutional principles by default
- EEPS agent types will not be available without plugin
- Bidirectional flow features will require plugin installation

### Migration Path:

1. Create plugin stubs that maintain current functionality
2. Update core to use plugin interfaces
3. Gradually move code to plugins
4. Update tests to work with/without plugins

## ✅ Success Criteria

V1.0 is successful when:

1. Core contains ONLY technical plumbing
2. All experimental features are in optional plugins
3. System works without any plugins installed
4. Plugin interfaces are well-defined
5. 100% test coverage on core components
