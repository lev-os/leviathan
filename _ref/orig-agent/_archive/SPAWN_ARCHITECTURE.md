# Spawn Architecture

## Overview

The spawn architecture enables parallel execution of long-running tasks without blocking the main conversation thread. This allows us to maintain responsive interaction while heavy computational tasks run in the background.

## Key Components

### 1. SpawnAgent (`src/spawn-agent.js`)
- Manages spawn lifecycle (start, monitor, complete, fail)
- Persistent registry for tracking spawns across sessions
- Handoff mechanism to return results to calling agents
- Container management interface (Docker implementation pending)

### 2. MCP Pipeline (`src/mcp-pipeline.js`)
- Plugin architecture for MCP request processing
- Runs middleware on every MCP call
- Supports pre/post/always hooks
- Automatic spawn status checking

### 3. Spawn MCP Tools (`src/spawn-mcp-tools.js`)
- `start_spawn`: Launch background tasks
- `check_spawns`: Get status of all spawns
- `get_spawn_result`: Retrieve completed results
- `kill_spawn`: Terminate running spawns

### 4. Integration Module (`src/spawn-integration.js`)
- Wires spawn system into MCP server
- Registers pipeline plugins
- Handles agent handoffs

## Usage Example

```javascript
// Start a heavy decomposition task
const result = await start_spawn({
  taskType: 'decomposition',
  taskData: {
    title: 'Build e-commerce platform',
    targetConfidence: 0.95
  },
  callingAgent: 'task-agent',
  callbackTool: 'process_decomposition',
  project: 'ecommerce-v1'
});

// Continue with other work while it runs
// The pipeline automatically checks status on every MCP call

// When complete, the spawn agent calls:
// task-agent.process_decomposition(results)
```

## Benefits

1. **Non-blocking Operations**: Main thread stays responsive
2. **Parallel Execution**: Run multiple spawns simultaneously  
3. **Persistent Tracking**: Spawns survive session restarts
4. **Automatic Monitoring**: Status checked on every MCP call
5. **Agent Handoff**: Results delivered to appropriate agent

## Architecture Principles

Following Core Principle #8: "Everything is an Agent"
- SpawnAgent manages execution lifecycle
- Pipeline acts as orchestration agent
- Each spawn can be its own containerized agent
- Uniform communication patterns via MCP

## Next Steps

1. Implement Docker container management
2. Add spawn templates for common tasks
3. Create monitoring dashboard
4. Add resource limits and quotas
5. Implement spawn chaining for workflows