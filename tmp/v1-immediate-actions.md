# V1.0 Immediate Action Plan

_Session: v1.0-consolidation-extract-experimental_

## 🚀 Immediate Actions (Next 2-4 Hours)

### 1. Create Plugin Structure for Extracted Features

```bash
# Create plugin directories
mkdir -p plugins/@lev-os/constitutional-ai/{src,tests,docs}
mkdir -p plugins/@lev-os/eeps-personality/{src,tests,docs}
mkdir -p plugins/@lev-os/bidirectional-flow/{src,tests,docs}
```

### 2. Extract Constitutional Framework (PRIORITY 1)

**Why First**: It's deeply embedded in universal-context-system.js

**Steps**:

1. Copy `agent/src/core/constitutional-framework.js` → `plugins/@lev-os/constitutional-ai/src/`
2. Create plugin interface in core for optional constitutional validation
3. Update `universal-context-system.js` to use plugin interface
4. Move `constitutional-validate` command to plugin
5. Update tests to work with/without plugin

### 3. Clean EEPS References (PRIORITY 2)

**Files to Update**:

- `agent/src/core/agents/agent-manager.js` - Remove EEPS type filtering
- `agent/src/adapters/cli/cli-adapter.js` - Remove EEPS examples
- `agent/src/adapters/cli/routers/agent-router.js` - Remove EEPS type option

### 4. Update \_core.md Architecture (PRIORITY 3)

**Remove from proposed structure**:

- `core/agents/personality-system.js`
- `core/agents/context-switcher.js`
- `core/constitutional/` (entire directory)
- `core/mcp/bidirectional.js`

## 📝 Command Sequence

```bash
# 1. Start extraction branch
git checkout -b feat/v1-extract-experimental

# 2. Run tests to establish baseline
cd agent && npm test

# 3. Create plugin structures
# [Commands from section 1]

# 4. Start with constitutional extraction
# Move files, update imports, create interfaces

# 5. Run tests after each major change
npm test

# 6. Commit each extraction separately
git add -A && git commit -m "extract: Move constitutional framework to plugin"
```

## 🎯 Success Checkpoints

After each extraction:

- [ ] Core tests still pass
- [ ] No direct imports of experimental features in core
- [ ] Plugin can be disabled without breaking core
- [ ] Clear plugin interface documented

## ⚠️ Watch Out For

1. **Hidden Dependencies**: Search for indirect usage of experimental features
2. **Test Coverage**: Some tests may depend on experimental features
3. **Command Dependencies**: Some commands may assume constitutional validation
4. **Import Paths**: Update all relative imports when moving files

## 🔄 Next Session Should:

1. Review extraction progress
2. Test core without plugins
3. Document plugin interfaces
4. Update consolidation tracker with progress
5. Plan memory interface definition (P1T06)
