# Namespace Migration Plan

## 📋 **REFERENCES TO UPDATE AFTER WORKTREE MERGE**

After the refactor worktrees merge back to main, we need to update these references:

### **@lev/ References Found**:

#### **Files to Update**:
```
./plugins/@lev/workshop/package.json:  "name": "@lev/workshop",
./plugins/@lev/workshop/src/index.js: * @lev/workshop - Tool Integration and Plugin Creation System
./plugins/@lev/workshop/src/index.js:          plugin: '@lev/workshop',
./plugins/@lev/workshop/src/index.js:      name: '@lev/workshop',
./plugins/@lev/workshop/src/commands/docs.js:🔧 @lev/workshop (Tier 2 - Development)
./plugins/@lev/workshop/src/commands/docs.js:   • plugins/@lev/workshop/src/commands/
./plugins/@lev/workshop/src/commands/docs.js:        example_plugins: ['@lev-os/debug', '@lev-os/testing', '@lev-os/cmd', '@lev/workshop'],
./plugins/@lev/workshop/src/commands/list.js:        { name: '@lev/workshop', tier: '2', status: 'development', type: 'plugin', description: 'Workshop automation plugin' }
./plugins/@lev/workshop/src/commands/examples.js:   • @lev/workshop    - Tool integration and plugin creation
./plugins/@lev/workshop/src/commands/examples.js:   • plugins/@lev/workshop/src/
./plugins/@lev/workshop/src/commands/examples.js:   • plugins/@lev/workshop/src/commands/status.js
./plugins/@lev/workshop/src/commands/examples.js:   • plugins/@lev/workshop/src/commands/list.js
./plugins/@lev/workshop/src/commands/examples.js:   • plugins/@lev/workshop/src/commands/info.js`,
./plugins/@lev/workshop/src/commands/examples.js:   // @lev/workshop integrates with @lev-os plugins
./plugins/@lev/workshop/src/commands/examples.js:   • plugins/@lev/workshop/src/    - Integration patterns`,
./plugins/@lev/workshop/src/commands/examples.js:        study_directories: ['@lev-os/debug/src/', '@lev-os/testing/src/', '@lev/workshop/src/']
```

#### **Cross-References in @lev-os**:
```
./plugins/@lev-os/cmd/contexts/workflows/spec-to-implementation/templates/wizard.md:- `@lev/*` → `@lev-os/*`
./plugins/@lev-os/cmd/src/index.js:// @lev/cmd - Universal command runner and process management
./plugins/@lev-os/cmd/src/index.js:  const { logger } = await import('@lev/debug');
./plugins/@lev-os/cmd/src/job-integration.js:import { logger, tracer, monitor } from '@lev/debug';
```

## 🎯 **MIGRATION TASKS**

### **Phase 1: Move Directory**
```bash
# After worktrees merge
mv plugins/@lev/workshop plugins/@lev-os/workshop
rmdir plugins/@lev
```

### **Phase 2: Update Package.json**
```json
{
  "name": "@lev-os/workshop",
  // ... rest of package.json
}
```

### **Phase 3: Update All References**
- Replace all `@lev/workshop` → `@lev-os/workshop`
- Update imports and path references
- Fix documentation strings and comments

### **Phase 4: Update Cross-Plugin References**
- Fix `@lev-os/cmd` references to debug plugin
- Update any other plugins referencing @lev namespace

### **Phase 5: Clean Up**
- Remove empty `@lev/` directory
- Remove empty `@leviathan/` directory

## ⚠️ **TIMING**

**DO NOT EXECUTE** until all refactor worktrees have merged back to main:
- mcp-extraction
- auto-discovery  
- test-coverage

This prevents merge conflicts with active parallel work.

## ✅ **VERIFICATION CHECKLIST**

After migration:
- [ ] All plugins use `@lev-os/` namespace
- [ ] No references to `@lev/` or `@leviathan/` remain
- [ ] All imports work correctly
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Plugin development guide is accurate