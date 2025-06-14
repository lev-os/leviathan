# PLUGIN HANDOFF - CORE IMPLEMENTATION READY

## 🎯 MISSION
Implement **@kingly/cmd** and **@kingly/debug** as core packages in the ~/k/core monorepo. All architecture is designed, ready for implementation.

## 📦 WHAT TO BUILD

### 1. @kingly/cmd - Universal Command Runner
```
packages/cmd/
├── package.json          # Ultra-lightweight deps: execa, ps-tree, tree-kill
├── src/
│   ├── index.js         # Main exports
│   ├── process-manager.js
│   ├── job-integration.js
│   └── worktree-manager.js
└── config/plugin.yaml   # YAML-first configuration
```

### 2. @kingly/debug - Universal Debugging  
```
packages/debug/
├── package.json          # Minimal deps for logging/tracing
├── src/
│   ├── index.js         # Main exports: logger, tracer, monitor
│   ├── logger.js
│   ├── tracer.js
│   └── monitor.js
└── config/plugin.yaml
```

## 🔧 KEY IMPLEMENTATION DETAILS

### Ultra-Lightweight Stack
- **NO PM2** - Use execa + ps-tree + tree-kill
- **Direct imports** between core packages (coupling is fine)
- **YAML-first** configuration for all behavior

### Core Integration Pattern
```javascript
// Any plugin imports debug
import { logger, tracer, monitor } from '@kingly/debug'

// @kingly/cmd imports what it needs
import { processManager, jobIntegration } from '@kingly/cmd'
```

### Universal Debug Commands
```bash
kingly debug events              # All plugins
kingly debug processes           # All tracked processes
kingly cmd debug                # Plugin-specific debug
```

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Packages
- [ ] Create packages/cmd directory structure
- [ ] Create packages/debug directory structure  
- [ ] Implement basic package.json files
- [ ] Create YAML configurations

### Phase 2: Core Functionality
- [ ] @kingly/cmd process management (execa-based)
- [ ] @kingly/debug universal logging/tracing
- [ ] Cross-package imports working
- [ ] Basic CLI commands

### Phase 3: Integration
- [ ] Job integration with ~/mvp
- [ ] Git worktree capabilities in @kingly/cmd
- [ ] Universal debug commands
- [ ] Plugin generator testing

## 📚 REFERENCE DOCUMENTS

1. **kinglycmd.md** - Complete @kingly/cmd specification
2. **kingly-debug-architecture.md** - Universal debugging design
3. **kingly-plugin-spec.md** - Plugin standards and patterns
4. **plugin-communication-plan.md** - Communication architecture
5. **tools/create-plugin.js** - Plugin generator (ready to use)

## 🚫 ANTI-PATTERNS TO AVOID

- ❌ PM2 or heavy process managers
- ❌ Complex framework building
- ❌ Hardcoded workspace assumptions
- ❌ Pattern matching over LLM reasoning

## ✅ SUCCESS CRITERIA

- @kingly/cmd spawns processes with ultra-lightweight stack
- @kingly/debug provides universal debugging to ALL commands
- Plugin generator creates working plugins
- ~/mvp job system integration functional
- All packages follow YAML-first configuration

## 🎪 CURRENT STATE

**Architecture**: ✅ Complete  
**Specifications**: ✅ Complete  
**Generator**: ✅ Ready  
**Implementation**: 🔄 Ready to start

**Next Step**: Create packages/ directory structure and implement core functionality.

---
*Ready for core agent implementation - all design work complete*