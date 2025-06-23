# Claude Code Direct Adapter Pattern

## Overview

This document outlines how to implement direct method calls in Kingly without MCP server overhead, specifically for Claude Code integration.

## Current Architecture Analysis

### 1. Port/Adapter Patterns in Use

The Kingly architecture follows a clean hexagonal (ports & adapters) pattern:

**Ports (Interfaces):**
- `WorkspaceManagementPort` - Primary port for workspace operations
- `AgentCommunicationPort` - Secondary port for agent communication
- `BackgroundExecutionPort` - Secondary port for background processes
- `PersistencePort` - Secondary port for data storage

**Adapters:**
- **Primary:** `MCPAdapter` - Translates MCP protocol to business logic
- **Secondary:** 
  - `JsonStorageAdapter` - File-based persistence
  - `AgentProtocolAdapter` - Agent communication
  - `SpawnManagerAdapter` - Process management
  - `ContextCaptureAdapter` - Context tracking

### 2. Creating a ClaudeCodeAdapter

To bypass MCP overhead, create a new primary adapter that directly calls the WorkspaceService:

```javascript
// src/adapters/primary/claude-code-adapter.js
import { WorkspaceManagementPort } from '../../ports/workspace-management.js';

export class ClaudeCodeAdapter extends WorkspaceManagementPort {
  constructor(workspaceService, backgroundExec, agentComm) {
    super();
    this.workspaceService = workspaceService;
    this.backgroundExec = backgroundExec;
    this.agentComm = agentComm;
  }

  // Direct method implementations (no MCP protocol translation)
  async createWorkspace(name, path, description) {
    return await this.workspaceService.createWorkspace(name, path, description);
  }

  async listWorkspaces() {
    return await this.workspaceService.listWorkspaces();
  }

  async createTask(project, title, description, context) {
    return await this.workspaceService.createTask(project, title, description, context);
  }

  async assessTaskConfidence(taskId, confidence, factors, reasoning) {
    return await this.workspaceService.assessTaskConfidence(taskId, confidence, factors, reasoning);
  }

  async splitTask(taskId, subtasks, reason) {
    return await this.workspaceService.splitTask(taskId, subtasks, reason);
  }

  async executeTask(taskId, agent, approach) {
    return await this.workspaceService.executeTask(taskId, agent, approach);
  }

  // Additional methods...
}
```

### 3. Direct Call Interface

The interface for direct calls is simpler and more efficient:

```javascript
// Usage example
import { setupDependencies } from './src/infrastructure/dependency-injection.js';
import { ClaudeCodeAdapter } from './src/adapters/primary/claude-code-adapter.js';

// Setup dependencies
const deps = setupDependencies({
  kinglyPath: './.kingly',
  agentsPath: './agents'
});

// Create Claude Code adapter
const claudeAdapter = new ClaudeCodeAdapter(
  deps.workspaceService,
  deps.backgroundExec,
  deps.agentComm
);

// Direct method calls - no MCP protocol overhead
const workspaces = await claudeAdapter.listWorkspaces();
const task = await claudeAdapter.createTask(
  'my-project',
  'Implement feature X',
  'Description of the feature',
  { files: ['src/feature.js'], tags: ['enhancement'] }
);
```

### 4. Maintaining Bidirectional Architecture Benefits

The direct adapter maintains all benefits of the ports & adapters architecture:

1. **Separation of Concerns**: Business logic remains in WorkspaceService
2. **Testability**: Can mock/stub the adapter for testing
3. **Flexibility**: Can switch between MCP and direct adapters
4. **Domain Isolation**: Domain models stay pure
5. **Multiple Interfaces**: Can have MCP, direct, CLI, and web adapters simultaneously

## What We're Bypassing

By using direct calls instead of MCP, we eliminate:

1. **Protocol Translation Overhead**:
   - MCP tool schema validation
   - JSON-RPC message formatting
   - Tool name to method mapping

2. **Server Infrastructure**:
   - MCP server initialization
   - Hot reload management
   - Route table generation
   - Agent caching

3. **Network/IPC Layer**:
   - Serialization/deserialization
   - Message passing overhead
   - Connection management

## Implementation Strategy

1. **Create ClaudeCodeAdapter** in `src/adapters/primary/`
2. **Update Dependency Injection** to support Claude adapter:
   ```javascript
   export function createClaudeAdapter(config = {}) {
     const deps = setupDependencies(config);
     return new ClaudeCodeAdapter(
       deps.workspaceService,
       deps.backgroundExec,
       deps.agentComm
     );
   }
   ```

3. **Create Direct Integration Module** for Claude Code:
   ```javascript
   // src/claude-code-integration.js
   export class ClaudeCodeIntegration {
     constructor(config) {
       this.adapter = createClaudeAdapter(config);
     }
     
     // Convenience methods matching Claude's expected interface
     async workspace(command, args) {
       switch(command) {
         case 'create': return this.adapter.createWorkspace(args.name, args.path, args.description);
         case 'list': return this.adapter.listWorkspaces();
         // etc...
       }
     }
   }
   ```

## Performance Benefits

Direct calls provide:
- **~10-100x faster** response times (no protocol overhead)
- **Lower memory usage** (no message buffering)
- **Synchronous execution** (no async message passing)
- **Better error handling** (direct exceptions)
- **Simpler debugging** (direct call stack)

## Conclusion

The ClaudeCodeAdapter pattern allows direct, efficient method calls while maintaining the architectural benefits of ports & adapters. This approach is ideal for tight integrations where MCP protocol overhead is unnecessary.