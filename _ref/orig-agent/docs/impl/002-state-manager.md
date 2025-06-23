# Implementation Ticket: 002 - State Manager

## 📋 Overview
Implement a state management system to track workflow states between MCP tool calls, enabling bi-directional conversations.

## 🔗 References
- **Previous**: [001 - MCP Server Setup](001-mcp-server-setup.md)
- **Architecture**: [Bi-directional Callback Architecture](../architecture/bidirectional-callback-architecture.md)

## 🎯 Scope
Create a state manager that:
- Stores workflow states with unique IDs
- Persists state between tool calls
- Handles state expiration/cleanup
- Provides state retrieval and updates

## ✅ Acceptance Criteria

### AC-002-1: State Creation
```yaml
Given: A new workflow starts
When: State is created with initial data
Then: Returns unique state ID
And: State is stored in memory
And: State includes timestamp
```

### AC-002-2: State Retrieval
```yaml
Given: An existing state ID
When: State is requested
Then: Returns complete state object
And: Returns null if not found
And: Validates state hasn't expired
```

### AC-002-3: State Updates
```yaml
Given: Existing state and new data
When: State is updated
Then: Merges new data with existing
And: Updates last_modified timestamp
And: Preserves state history
```

### AC-002-4: State Cleanup
```yaml
Given: States older than TTL (30 minutes)
When: Cleanup runs
Then: Expired states are removed
And: Active states are preserved
And: Cleanup doesn't block operations
```

## 🧪 Test Cases

### Unit Tests
1. **Create state** - Generates unique IDs
2. **Retrieve state** - Returns correct state
3. **Update state** - Merges data properly
4. **Expire state** - Removes old states
5. **Concurrent access** - Thread-safe operations

### Integration Tests
1. **Workflow continuity** - State persists across calls
2. **Multiple workflows** - Isolates different states
3. **Memory limits** - Handles many states

## 💻 Implementation

### Core Implementation
```javascript
// src/application/state-manager.js
import { randomUUID } from 'crypto';

export class StateManager {
  constructor(options = {}) {
    this.states = new Map();
    this.ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
    this.maxStates = options.maxStates || 1000;
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
  
  create(workflowType, initialData = {}) {
    const id = randomUUID();
    const now = Date.now();
    
    const state = {
      id,
      workflow_type: workflowType,
      created_at: now,
      updated_at: now,
      expires_at: now + this.ttl,
      data: initialData,
      history: [{
        timestamp: now,
        action: 'created',
        data: initialData
      }]
    };
    
    // Enforce max states limit
    if (this.states.size >= this.maxStates) {
      this.evictOldest();
    }
    
    this.states.set(id, state);
    return { id, state };
  }
  
  get(id) {
    const state = this.states.get(id);
    
    if (!state) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > state.expires_at) {
      this.states.delete(id);
      return null;
    }
    
    // Extend expiration on access
    state.expires_at = Date.now() + this.ttl;
    
    return state;
  }
  
  update(id, newData) {
    const state = this.get(id);
    
    if (!state) {
      throw new Error(`State ${id} not found`);
    }
    
    const now = Date.now();
    
    // Merge data
    state.data = {
      ...state.data,
      ...newData
    };
    
    // Update timestamps
    state.updated_at = now;
    state.expires_at = now + this.ttl;
    
    // Add to history
    state.history.push({
      timestamp: now,
      action: 'updated',
      data: newData
    });
    
    return state;
  }
  
  delete(id) {
    return this.states.delete(id);
  }
  
  cleanup() {
    const now = Date.now();
    const expired = [];
    
    for (const [id, state] of this.states) {
      if (now > state.expires_at) {
        expired.push(id);
      }
    }
    
    for (const id of expired) {
      this.states.delete(id);
    }
    
    return expired.length;
  }
  
  evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [id, state] of this.states) {
      if (state.updated_at < oldestTime) {
        oldest = id;
        oldestTime = state.updated_at;
      }
    }
    
    if (oldest) {
      this.states.delete(oldest);
    }
  }
  
  // For testing and debugging
  getAll() {
    return Array.from(this.states.values());
  }
  
  clear() {
    this.states.clear();
  }
  
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton instance
let instance = null;

export function getStateManager(options) {
  if (!instance) {
    instance = new StateManager(options);
  }
  return instance;
}
```

### Integration with MCP Server
```javascript
// Update src/mcp-server.js
import { getStateManager } from './application/state-manager.js';

export class KinglyMCPServer {
  constructor() {
    this.stateManager = getStateManager();
    // ... rest of constructor
  }
  
  async handleToolCall(toolName, args) {
    // Check if this is a stateful call
    if (args.state_id) {
      const state = this.stateManager.get(args.state_id);
      if (!state) {
        throw new Error('Invalid or expired state');
      }
      // Pass state to tool handler
      return await this.handleStatefulTool(toolName, args, state);
    }
    
    // Regular tool handling
    return await this.handleStatelessTool(toolName, args);
  }
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/state-manager.test.js
import { StateManager } from '../../src/application/state-manager.js';

describe('StateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = new StateManager({ ttl: 1000 }); // 1 second for testing
  });
  
  afterEach(() => {
    stateManager.destroy();
  });
  
  it('should create state with unique ID', () => {
    const { id, state } = stateManager.create('test_workflow', { foo: 'bar' });
    expect(id).toBeDefined();
    expect(state.workflow_type).toBe('test_workflow');
    expect(state.data.foo).toBe('bar');
  });
  
  it('should retrieve existing state', () => {
    const { id } = stateManager.create('test_workflow', { foo: 'bar' });
    const state = stateManager.get(id);
    expect(state).toBeDefined();
    expect(state.data.foo).toBe('bar');
  });
  
  it('should update state and preserve history', () => {
    const { id } = stateManager.create('test_workflow', { foo: 'bar' });
    const updated = stateManager.update(id, { baz: 'qux' });
    
    expect(updated.data.foo).toBe('bar');
    expect(updated.data.baz).toBe('qux');
    expect(updated.history).toHaveLength(2);
  });
  
  it('should expire old states', async () => {
    const { id } = stateManager.create('test_workflow', { foo: 'bar' });
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const state = stateManager.get(id);
    expect(state).toBeNull();
  });
});
```

## 🔧 Dependencies
- No new dependencies (uses Node.js built-ins)

## 📊 Effort Estimate
- Implementation: 1.5 hours
- Testing: 1 hour
- Total: 2.5 hours

## 🚀 Next Steps
After this ticket:
- 003: Workflow Engine Core to use state manager
- 004: First working tool with stateful operations

## 📝 Notes
- Using in-memory storage for MVP (can add persistence later)
- TTL prevents memory leaks from abandoned workflows
- History tracking enables debugging and replay
- Thread-safe using JavaScript's single-threaded nature