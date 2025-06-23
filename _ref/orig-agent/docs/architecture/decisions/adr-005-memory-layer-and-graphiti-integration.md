# ADR-005: Memory Layer and Graphiti Integration

## Status
Accepted

## Context
As we implement the relationship system and plugin architecture, we need a memory layer that:
1. Maintains filesystem as source of truth
2. Enables semantic search and graph queries
3. Supports temporal awareness and history
4. Optimizes for speed on common operations
5. Allows plugins/users to define memory requirements

Graphiti provides temporal graph capabilities that align with our advanced memory concepts while maintaining the speed required for common MCP operations.

## Decision

### 1. Dual-Mode Memory Architecture

Implement a two-tier memory system:
- **Fast Path**: Direct filesystem + in-memory cache for common operations
- **Graph Path**: Graphiti for semantic search, relationships, and temporal queries

```javascript
// Fast path for common operations
const task = await loader.fastGet('task-123');  // Direct filesystem

// Graph path for complex queries  
const results = await graphiti.search('tasks blocking OAuth implementation');
```

### 2. Filesystem Remains Source of Truth

- All contexts stored as YAML in `.kingly/`
- Graphiti acts as intelligent index, not primary storage
- Sync process watches filesystem and updates graph
- Can rebuild graph from filesystem at any time

### 3. Plugin-Defined Memory Configuration

Plugins declare their memory requirements in context.yaml:

```yaml
task_config:
  memory_config:
    sync_to_graph: true
    graph_properties: [name, status, relationships]
    indexes: [status, assigned_to]
    retention: "90_days"
  performance:
    cache_hot: true
    preload_relationships: [blocks, blocked_by]
```

### 4. Speed Optimizations

**Common MCP operations bypass graph sync:**
- Create/update/delete write to filesystem immediately
- Graph sync happens asynchronously (non-blocking)
- Hot cache keeps frequently accessed contexts in memory
- Batch sync operations for efficiency

**Pre-defined fast paths:**
```javascript
fastOps = new Map([
  ['task.create', directFileWrite],
  ['task.update', directFileUpdate],
  ['workspace.list', cachedList]
]);
```

### 5. User-Configurable Graph Behavior

```javascript
const kingly = new KinglySDK({
  memory: {
    syncContextTypes: ['workspace', 'project', 'epic'],
    syncStrategy: 'debounced',  // immediate | debounced | manual
    syncInterval: 5000,
    graphIndexes: {
      task: ['status', 'assigned_to'],
      project: ['status', 'owner']
    },
    retention: {
      task: '90_days',
      workspace: 'forever'
    }
  }
});
```

## Consequences

### Positive
- **Speed**: Common operations remain fast (filesystem + cache)
- **Intelligence**: Semantic search and graph queries when needed
- **Flexibility**: Plugins/users control what gets indexed
- **Temporal**: Full history and time-travel queries
- **Memory**: Advanced features like velocity tracking, pattern learning
- **Scalability**: Can start local, scale to cloud Neo4j

### Negative
- **Complexity**: Two systems to maintain (filesystem + graph)
- **Dependency**: Requires Neo4j (but can run locally)
- **Sync lag**: Graph may be slightly behind filesystem
- **Storage**: Duplicated data (filesystem + graph)

### Neutral
- **Setup**: Requires initial Neo4j configuration
- **Learning curve**: Developers need to understand when to use which path

## Implementation Details

### Memory Layer Components

1. **Hot Cache** - In-memory Map for frequent access
2. **Filesystem** - YAML files as source of truth  
3. **Sync Queue** - Batched updates to graph
4. **Graphiti Client** - Handles graph operations
5. **Performance Monitor** - Tracks which paths to optimize

### Sync Process

```javascript
// Watch filesystem for changes
watcher.on('change', async (path) => {
  const context = await loadYAML(path);
  
  // Immediate cache update
  hotCache.set(context.id, context);
  
  // Queue for graph sync
  syncQueue.push({
    operation: 'update',
    context,
    timestamp: Date.now()
  });
});

// Batch sync every N seconds
setInterval(processSyncQueue, config.syncInterval);
```

### Advanced Memory Features

Graphiti enables sophisticated memory patterns:
- **Velocity Tracking**: Sprint performance over time
- **Pattern Recognition**: Team behavior analysis
- **Predictive Suggestions**: Based on historical data
- **Conflict Resolution**: When multiple sources update same context
- **Audit Trail**: Complete history of all changes

## Migration Path

1. **Phase 1**: Filesystem operations only (current state)
2. **Phase 2**: Add Graphiti sync for core types
3. **Phase 3**: Enable semantic search
4. **Phase 4**: Advanced memory features
5. **Phase 5**: Plugin-specific memory patterns

## References
- Graphiti documentation: https://github.com/getzep/graphiti
- Neo4j temporal patterns: https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/
- Previous ADRs: ADR-004 (Relationship System)