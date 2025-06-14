# @kingly/debug - Universal Debugging Architecture

## Core Concept
@kingly/debug as a universal debugging service available to ALL Kingly commands and plugins. Since these are core packages in the monorepo, tight coupling is acceptable and beneficial.

## Architecture Benefits

### Universal Debug Interface
```javascript
// Any Kingly command/plugin can import
import { logger, tracer, monitor, inspector } from '@kingly/debug'

// Consistent API across ecosystem
logger.info('Process started', { plugin: 'cmd', pid: 1234 })
tracer.event('job:created', { id: 'job-123', data: {...} })
monitor.registerProcess(process.pid, 'npm dev', { workspace: '~/mvp' })
inspector.captureState('pre-execution', { context: {...} })
```

### Universal Debug Commands
```bash
# Works with any plugin
kingly debug events              # All events across ecosystem
kingly debug processes           # All tracked processes
kingly debug logs --plugin=cmd   # Plugin-specific logs
kingly debug trace --job=123     # Job execution trace
kingly debug state --snapshot    # Current system state

# Plugin-specific debugging
kingly cmd debug                 # @kingly/cmd specific debug
kingly parallel debug            # @kingly/parallel specific debug
kingly dev debug                 # ~/mvp specific debug
```

## Package Structure

### @kingly/debug Core Services

```javascript
// packages/debug/src/index.js
export { logger } from './logger.js'
export { tracer } from './tracer.js' 
export { monitor } from './monitor.js'
export { inspector } from './inspector.js'
export { aggregator } from './aggregator.js'
```

### Logger Service
```javascript
// Structured logging with plugin context
class UniversalLogger {
  info(message, context = {}) {
    this.log('info', message, { 
      timestamp: Date.now(),
      plugin: context.plugin || 'unknown',
      ...context 
    })
  }
  
  error(message, error, context = {}) {
    this.log('error', message, {
      timestamp: Date.now(),
      error: error.stack,
      plugin: context.plugin || 'unknown',
      ...context
    })
  }
}
```

### Event Tracer
```javascript
// Cross-plugin event tracing
class EventTracer {
  event(name, data = {}) {
    const trace = {
      id: this.generateId(),
      name,
      timestamp: Date.now(),
      plugin: data.plugin || this.inferPlugin(),
      data,
      stack: this.captureStack()
    }
    
    this.emit('trace:event', trace)
    this.store(trace)
  }
  
  startSpan(name, data = {}) {
    return new Span(name, data)
  }
}
```

### Process Monitor
```javascript
// Universal process tracking
class ProcessMonitor {
  registerProcess(pid, command, meta = {}) {
    const process = {
      pid,
      command,
      startTime: Date.now(),
      plugin: meta.plugin || this.inferPlugin(),
      workspace: meta.workspace,
      status: 'running'
    }
    
    this.processes.set(pid, process)
    this.tracer.event('process:registered', process)
  }
  
  async getAllProcesses() {
    // Returns all tracked processes across plugins
    return Array.from(this.processes.values())
  }
}
```

### State Inspector
```javascript
// System state capture and inspection
class StateInspector {
  captureState(label, data = {}) {
    const state = {
      label,
      timestamp: Date.now(),
      plugin: data.plugin || this.inferPlugin(),
      processes: this.monitor.getProcessSummary(),
      events: this.tracer.getRecentEvents(50),
      memory: process.memoryUsage(),
      custom: data
    }
    
    this.snapshots.set(label, state)
    return state
  }
  
  compareStates(before, after) {
    // Diff analysis between states
    return this.differ.compare(
      this.snapshots.get(before),
      this.snapshots.get(after)
    )
  }
}
```

## Integration with Core Packages

### @kingly/cmd Integration
```javascript
// packages/cmd/src/process-manager.js
import { logger, tracer, monitor } from '@kingly/debug'

export class ProcessManager {
  async spawn(command, args, options = {}) {
    const context = { plugin: 'cmd', command, args }
    
    logger.info('Spawning process', context)
    tracer.event('process:spawn:start', context)
    
    const process = await execa(command, args, options)
    
    monitor.registerProcess(process.pid, command, {
      plugin: 'cmd',
      workspace: options.cwd,
      background: options.background
    })
    
    tracer.event('process:spawn:success', { 
      ...context, 
      pid: process.pid 
    })
    
    return process
  }
}
```

### @kingly/parallel Integration
```javascript
// packages/parallel/src/worktree-manager.js
import { logger, tracer } from '@kingly/debug'

export class WorktreeManager {
  async createWorktree(branch, path) {
    const context = { plugin: 'parallel', branch, path }
    
    logger.info('Creating worktree', context)
    tracer.startSpan('worktree:create', context)
    
    // Implementation...
    
    tracer.event('worktree:created', { ...context, success: true })
  }
}
```

### ~/mvp Integration
```javascript
// ~/mvp/lib/job-system.js
import { logger, tracer, monitor } from '@kingly/debug'

export class JobSystem {
  async createJob(jobData) {
    const context = { plugin: 'mvp', jobId: jobData.id }
    
    logger.info('Creating job', context)
    tracer.event('job:created', { ...context, ...jobData })
    
    if (jobData.process) {
      monitor.registerProcess(jobData.process.pid, jobData.command, {
        plugin: 'mvp',
        jobId: jobData.id
      })
    }
    
    return job
  }
}
```

## Debug Commands Implementation

### Universal Debug CLI
```javascript
// packages/debug/src/cli.js
export const debugCommands = {
  async events(options = {}) {
    const events = await tracer.getEvents({
      plugin: options.plugin,
      since: options.since,
      limit: options.limit || 100
    })
    
    console.table(events.map(e => ({
      time: new Date(e.timestamp).toISOString(),
      plugin: e.plugin,
      event: e.name,
      data: JSON.stringify(e.data, null, 2)
    })))
  },
  
  async processes(options = {}) {
    const processes = await monitor.getAllProcesses()
    
    console.table(processes.map(p => ({
      pid: p.pid,
      plugin: p.plugin,
      command: p.command,
      status: p.status,
      uptime: Date.now() - p.startTime
    })))
  },
  
  async trace(options = {}) {
    if (options.job) {
      const trace = await tracer.getJobTrace(options.job)
      this.renderTrace(trace)
    } else {
      const trace = await tracer.getSystemTrace()
      this.renderTrace(trace)
    }
  }
}
```

## Package Dependencies

### @kingly/debug package.json
```json
{
  "name": "@kingly/debug",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "dependencies": {
    "ps-tree": "^1.2.0",
    "tree-kill": "^1.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Other Packages Import Debug
```json
// packages/cmd/package.json
{
  "dependencies": {
    "@kingly/debug": "workspace:*",
    "execa": "^8.0.0"
  }
}

// packages/parallel/package.json  
{
  "dependencies": {
    "@kingly/debug": "workspace:*",
    "simple-git": "^3.0.0"
  }
}
```

## Benefits of This Architecture

### 1. Universal Debugging
- Consistent debug experience across ALL Kingly commands
- Central aggregation of logs, events, and process monitoring
- Cross-plugin trace correlation

### 2. Separation of Concerns
- @kingly/cmd focuses on command execution
- @kingly/debug focuses on observability
- Clean, single-responsibility packages

### 3. Core Plugin Coupling
- Direct imports between core packages (acceptable in monorepo)
- Tight integration for better performance
- Shared debug infrastructure

### 4. Developer Experience
```bash
# Debug any plugin the same way
kingly debug events
kingly debug processes
kingly debug logs --plugin=cmd
kingly cmd debug  # Plugin-specific debug
```

### 5. Centralized Coordination
- All debug data flows through @kingly/debug
- Central event bus for cross-plugin communication
- Unified state inspection and monitoring

This architecture makes debugging a first-class citizen across the entire Kingly ecosystem while maintaining clean separation of concerns.