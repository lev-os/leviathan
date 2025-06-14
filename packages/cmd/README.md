# @kingly/cmd - Universal Command Runner

## 🎯 Mission
Ultra-lightweight process management for Kingly core system. Handles command execution, job integration, and git worktree management with LLM-first approach.

## 📦 Package Structure
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

## 🔧 Core Functionality

### Process Management
- **NO PM2** - Use execa + ps-tree + tree-kill for lightweight process control
- **Job Integration** - Connect with ~/mvp job system for workflow orchestration
- **Process Tracking** - Monitor spawned processes with cleanup guarantees

### Git Worktree Management  
- **Parallel Development** - Create isolated git worktrees for concurrent work
- **Context Integration** - Each worktree gets specialized context configurations
- **Constitutional AI** - Validation before worktree operations

### Universal Debug Commands
```bash
kingly cmd debug                # Plugin-specific debug info
kingly cmd processes           # Show all tracked processes  
kingly cmd worktrees          # Show active worktrees
```

## 🧠 LLM-First Implementation

### Core Integration Pattern
```javascript
// Direct imports between core packages (coupling is fine)
import { logger, tracer, monitor } from '@kingly/debug'
import { processManager, jobIntegration } from '@kingly/cmd'
```

### YAML Configuration
```yaml
# config/plugin.yaml
plugin:
  name: cmd
  version: 1.0.0
  type: core_plugin
  description: Universal command runner and process management

capabilities:
  - process_management
  - git_worktree_operations  
  - job_system_integration
  - constitutional_validation

commands:
  cmd_exec:
    syntax: "kingly cmd exec <command> [options]"
    description: "Execute command with tracking and cleanup"
    
  cmd_worktree:
    syntax: "kingly cmd worktree <action> [args]"
    description: "Manage git worktrees for parallel development"
    
  cmd_jobs:
    syntax: "kingly cmd jobs [status|kill|list]"
    description: "Integrate with job system for workflow management"
```

## 🔄 Dependencies

### Ultra-Lightweight Stack
- **execa** - Process execution
- **ps-tree** - Process tree management
- **tree-kill** - Clean process termination
- **@kingly/debug** - Universal debugging integration

### Core Module Integration
- Uses existing session management
- Integrates with workflow loader
- Leverages command registry
- Applies constitutional validators

## 🎯 Implementation Priorities

1. **Basic process execution** with execa + monitoring
2. **Debug integration** with @kingly/debug universal tools
3. **Job system connection** with ~/mvp workflow integration
4. **Git worktree management** for parallel development
5. **Constitutional validation** before sensitive operations

## 🚫 Anti-Patterns to Avoid
- ❌ PM2 or heavy process managers
- ❌ Complex framework building  
- ❌ Hardcoded workspace assumptions
- ❌ Pattern matching over LLM reasoning

## ✅ Success Criteria
- Spawns processes with ultra-lightweight stack
- Integrates seamlessly with @kingly/debug
- Enables parallel development via worktrees
- Connects with ~/mvp job system
- All behavior configurable via YAML

---
*Ready for implementation - architecture complete, dependencies minimal*