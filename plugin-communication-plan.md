# Kingly Plugin Communication Architecture Plan

## Core Pattern: Direct Imports + EventEmitter

### Architecture Overview

**Direct Imports** (for core functionality):
- Plugins import @kingly/cmd modules directly for performance
- Type-safe API access with full IDE support  
- Standard ES modules pattern, no abstraction overhead

**EventEmitter** (for communication):
- Event bus for loose coupling between plugins
- Process lifecycle events (started, completed, failed)
- Job status updates and coordination events
- Plugin-to-plugin communication via events only

## Communication Patterns

### 1. Plugin → Core (Direct Import)
```javascript
import { processManager, jobIntegration } from '@kingly/cmd'

// Direct API calls for core functionality
const process = await processManager.spawn('npm dev')
await jobIntegration.reportStatus(process.pid, 'running')
```

### 2. Core → Plugin (Events)
```javascript
// Core emits lifecycle events
eventBus.emit('process:started', { pid: 1234, command: 'npm dev' })
eventBus.emit('job:completed', { id: 'job-123', status: 'success' })

// Plugin listens
eventBus.on('core:shutdown', () => plugin.cleanup())
```

### 3. Plugin → Plugin (Events Only)
```javascript
// Plugin A emits
eventBus.emit('parallel:stream-ready', { stream: 'constitutional-ai' })

// Plugin B listens  
eventBus.on('parallel:stream-ready', (data) => {
  console.log(`Stream ${data.stream} is ready`)
})
```

## Integration with ~/mvp

### Simple Bridge Pattern
```javascript
// @kingly/cmd/src/job-integration.js
import { sessionManager } from '~/mvp/src/session-manager.js'
import { eventBus } from './event-bus.js'

export async function createJob(config) {
  const job = await sessionManager.createJob(config)
  eventBus.emit('job:created', job)
  return job
}

export async function reportCompletion(jobId, result) {
  await sessionManager.updateJob(jobId, result) 
  eventBus.emit('job:completed', { jobId, result })
}
```

## Debugging & Logging Strategy

### Event Debugging
```javascript
// Debug all events in development
if (process.env.NODE_ENV === 'development') {
  eventBus.on('*', (eventName, ...args) => {
    console.log(`[EVENT] ${eventName}:`, args)
  })
}

// Event tracing with timestamps
eventBus.emit('debug:trace', { 
  event: 'process:started',
  timestamp: Date.now(),
  plugin: 'my-plugin',
  data: { pid: 1234 }
})
```

### Process Logging
```javascript
// Structured logging for all processes
import { logger } from '@kingly/cmd/logger'

logger.info('Process started', {
  pid: process.pid,
  command: 'npm dev',
  plugin: 'dev-server',
  timestamp: new Date().toISOString()
})

// Log aggregation for "what's going on?" queries
logger.status('dev-server', 'running', { uptime: '2m 30s' })
```

### Plugin State Debugging
```javascript
// Plugin registry with state tracking
const pluginRegistry = new Map()

eventBus.on('plugin:register', ({ name, state }) => {
  pluginRegistry.set(name, {
    name,
    state,
    lastUpdate: Date.now(),
    events: []
  })
})

// Debug command: "kingly debug plugins"
export function getPluginStates() {
  return Array.from(pluginRegistry.entries()).map(([name, info]) => ({
    name,
    state: info.state,
    lastSeen: new Date(info.lastUpdate).toISOString(),
    eventCount: info.events.length
  }))
}
```

### Error Tracking
```javascript
// Centralized error handling
eventBus.on('error', (error, context) => {
  logger.error('Plugin error', {
    error: error.message,
    stack: error.stack,
    plugin: context.plugin,
    operation: context.operation,
    timestamp: Date.now()
  })
  
  // Report to ~/mvp job system
  jobIntegration.reportError(context.jobId, error)
})

// Plugin error boundaries
try {
  await plugin.execute()
} catch (error) {
  eventBus.emit('error', error, { 
    plugin: 'my-plugin',
    operation: 'execute',
    jobId: currentJob.id 
  })
}
```

## Implementation Steps

### 1. Event Bus System
- Central EventEmitter in @kingly/cmd
- Standard event patterns for process/job lifecycle
- Plugin registration and discovery via events
- Debug event tracing and logging

### 2. MVP Integration Bridge  
- Simple bridge functions in @kingly/cmd/job-integration.js
- Direct imports from ~/mvp/session-manager.js
- Event emissions for job status updates
- Error reporting back to job system

### 3. Logging Infrastructure
- Structured logging with context (plugin, job, process)
- Event tracing for debugging plugin interactions
- Process state aggregation for status queries
- Error tracking and reporting

### 4. Debug Commands
- `kingly debug events` - Show recent event activity
- `kingly debug plugins` - Show plugin states and health
- `kingly debug processes` - Show all tracked processes
- `kingly logs [plugin]` - Stream logs for specific plugin

## Benefits

- **Performance**: Direct API access, no overhead
- **Loose Coupling**: Events for inter-plugin communication  
- **Type Safety**: Full TypeScript support
- **Debugging**: Comprehensive logging and tracing
- **Proven Pattern**: Used by VSCode, Strapi, Webpack
- **Observable**: Easy to debug plugin interactions and state

## Debugging Features

### Real-time Event Monitoring
```bash
# Watch all events in real-time
kingly debug events --follow

# Filter by plugin or event type
kingly debug events --plugin=dev-server
kingly debug events --type=process:*
```

### Process State Inspection
```bash
# What's currently running?
kingly status

# Detailed process information
kingly debug processes --verbose

# Plugin health check
kingly debug plugins --health
```

### Log Aggregation
```bash
# Stream logs from all plugins
kingly logs --all

# Plugin-specific logs
kingly logs dev-server --follow

# Error logs only
kingly logs --level=error --last=1h
```

This architecture provides robust debugging capabilities while maintaining performance and modularity through the direct imports + events pattern.