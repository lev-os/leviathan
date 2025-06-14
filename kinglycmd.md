# @kingly/cmd: Universal Process Management Package

## Architecture Overview

**Foundation: PM2 + Existing ~/mvp Job System**
- Build on PM2 for robust process management (don't reinvent the wheel)
- Integrate with existing ~/mvp job system (NOT overkill - exactly what we need)
- Plugin architecture: @kingly/cmd as core utility, plugins import and use it

## Core Requirements

### Universal Process Tracking
- **Every command gets monitoring by default**
- PID tracking, status monitoring, resource usage
- Background process persistence and lifecycle management
- Real-time status queries ("what's going on?")

### Developer Workflow Integration
- **Dev server management**: Direct stdout/stderr access (no copy/paste)
- **Long-running CLI tasks**: Background execution with status tracking
- **Job completion reporting**: Automatic updates when processes finish
- **Log streaming**: Real-time access to all process output

### Advanced Capabilities
- **Git Worktree Integration**: Isolated parallel development environments
- **Claude Code Spawning**: AI instance coordination for batch processes
- **Background Task Management**: Persistent processes that survive terminal closure
- **Status Dashboard**: Real-time view of all active processes

## Technical Architecture

### Framework Integration
```javascript
// Ultra-lightweight core stack
execa (process spawning) + 
ps-tree (process monitoring) + 
tree-kill (cleanup) + 
~/mvp Job System (coordination) + 
Git Worktree (isolation) + 
Claude Code (AI spawning)
```

### Component Structure
```
@kingly/cmd/
├── src/
│   ├── process-manager.js       # execa wrapper with lifecycle management
│   ├── process-registry.js      # PID tracking and status monitoring
│   ├── job-integration.js       # Connect with ~/mvp job system
│   ├── worktree-manager.js      # Git worktree coordination
│   ├── claude-spawner.js        # AI instance management
│   ├── log-aggregator.js        # Real-time stdout/stderr streaming
│   └── cleanup-manager.js       # ps-tree + tree-kill process cleanup
├── package.json
└── README.md
```

## Reference Systems (Do NOT Extract)

### ~/mvp Job System
- **Keep existing implementation** - it's exactly what we need
- Job lifecycle management, session coordination, status tracking
- Extend with @kingly/cmd process management capabilities

### ~/k/hub/ceo Parallel Work
- Reference `para.md` and `plugins/kingly-parallel/` patterns
- Git worktree + Claude Code coordination workflows
- Constitutional AI integration (optional)

### ~/ka Spawn Patterns
- Reference existing spawn implementations
- Process monitoring and control patterns

### ~/c Context System
- Use centralized contexts for workflow coordination
- No extraction needed - reference in place

## Plugin Architecture

### Reverse Dependency Pattern
```javascript
// Correct: Plugins import @kingly/cmd
import { processManager, jobIntegration } from '@kingly/cmd'

// NOT: @kingly/cmd importing plugin code
```

### Integration with ~/mvp
```javascript
// ~/mvp central command center uses @kingly/cmd
import { spawnProcess, trackJob, streamLogs } from '@kingly/cmd'

// @kingly/cmd reports back to ~/mvp job system
processManager.onComplete((result) => {
  jobSystem.updateStatus(result)
})
```

## Usage Patterns

### Basic Process Management
```bash
# Universal process tracking
kingly run "npm dev" --monitor          # Auto-background with tracking
kingly run "npm test" --parallel        # Parallel execution
kingly run "build" --git-worktree       # Isolated environment

# Status and monitoring
kingly status                           # "What's going on?"
kingly logs npm-dev                     # Stream dev server logs
kingly jobs                             # All background processes
```

### Advanced Workflows
```bash
# Git worktree + Claude Code coordination
kingly parallel init constitutional-discord --streams=2
kingly parallel status constitutional-discord
kingly parallel sync constitutional-discord

# Dev server management
kingly dev start --monitor              # Start with tracking
kingly dev logs --follow                # Real-time log streaming
kingly dev status                       # Current server status
```

## Implementation Roadmap

### Phase 1: Core Foundation
1. **PM2 Integration**: Wrap PM2 with enhanced features
2. **Job System Connection**: Integrate with existing ~/mvp job system
3. **Basic Process Tracking**: Universal PID tracking and status monitoring

### Phase 2: Developer Workflow
1. **Log Aggregation**: Real-time stdout/stderr streaming
2. **Status Dashboard**: Background process monitoring
3. **Dev Server Management**: Direct log access and control

### Phase 3: Advanced Features
1. **Git Worktree Integration**: Isolated development environments
2. **Claude Code Spawning**: AI instance coordination
3. **Parallel Development**: Multi-stream workflows

### Phase 4: Plugin Integration
1. **~/mvp Integration**: Central command center coordination
2. **Plugin Architecture**: Reverse dependency pattern
3. **Context System**: Integration with ~/c centralized contexts

## Performance Considerations

- **Lightweight Foundation**: Minimal dependencies with execa + ps-tree
- **Process Isolation**: Git worktree prevents conflicts
- **Resource Management**: CPU/memory monitoring and limits
- **Background Persistence**: Processes survive terminal closure

## Integration Points

### ~/mvp Central Command Center
- Job system coordination and status reporting
- Session management and intelligence routing
- Natural language command processing

### ~/c Context System
- Workflow definitions and coordination patterns
- Agent configurations and templates
- Centralized context management

### ~/k/hub/ceo Parallel Work
- Reference parallel development patterns
- Git worktree coordination workflows
- Constitutional AI integration (optional)

## Benefits

- **Ultra-Lightweight**: Build on minimal execa + ps-tree stack
- **Leverage Existing**: Use ~/mvp job system as-is
- **Universal Tracking**: Every command gets monitoring
- **Developer-Friendly**: Direct log access, status queries
- **Integration-Ready**: Works with existing kingly ecosystem

## Next Steps

1. **Create package structure** in ~/k/core/packages/cmd/
2. **Implement execa wrapper** with enhanced process tracking
3. **Connect to ~/mvp job system** for coordination
4. **Add git worktree management** for parallel development
5. **Integrate Claude Code spawning** for AI coordination
6. **Build status dashboard** for real-time monitoring