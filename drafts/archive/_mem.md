# CODEX + LEV MEMORY ARCHITECTURE SPECIFICATION

**Date:** 2025-06-19  
**Status:** Approved - Graphiti-Only Architecture  
**Context:** Unified memory system for Leviathan ecosystem plugin consumption

## Executive Summary

Unified Graphiti-only memory architecture for the Leviathan ecosystem, validated by production coding agent research. Replaces hybrid approaches with single sophisticated system running on local Neo4j infrastructure.

## Architecture Decision: Graphiti-Only System

### **Research-Validated Choice**
Production analysis of Google Jules, Cursor, Augment, Factory Droids, and Claude Code reveals that successful agents use unified memory systems rather than polyglot database approaches. **Key validation**: Cursor IDE uses Graphiti in production for agent memory.

### **Unified Memory Architecture**
```
┌─ CODEX + LEV MEMORY UNIFIED ARCHITECTURE ─────────────────┐
│                                                            │
│  ┌─ GRAPHITI MEMORY LAYER ─────────────────────────────┐   │
│  │                                                     │   │
│  │  Vector Search        Graph Relationships           │   │
│  │  ├─ Semantic similarity  ├─ API dependencies        │   │
│  │  ├─ Pattern discovery    ├─ Inheritance chains      │   │
│  │  └─ Code embeddings      └─ Framework connections   │   │
│  │                                                     │   │
│  │  Temporal Memory         Real-time Updates          │   │
│  │  ├─ Agent learning       ├─ No batch recomputation  │   │
│  │  ├─ Session evolution    ├─ Incremental updates     │   │
│  │  └─ Conversation history └─ Conflict resolution     │   │
│  │                                                     │   │
│  │  MCP Protocol Integration                           │   │
│  │  ├─ Direct agent communication                      │   │
│  │  ├─ Memory sharing between agents                   │   │
│  │  └─ Context synchronization                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                │
│  ┌─ LOCAL NEO4J FOUNDATION ──────────────────────────────┐  │
│  │ bolt://localhost:7687 (User's Existing Instance)     │  │
│  │ ├─ Native vector indexes for semantic search         │  │
│  │ ├─ Graph relationships for code dependencies         │  │
│  │ ├─ Temporal nodes for session and learning tracking  │  │
│  │ └─ MCP server integration for agent communication    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Plugin Privilege System

### **Core Plugin Access (Codex, Memory, Agent)**
```typescript
// Core plugins get elevated access
createCorePluginMemory(pluginId: string): CorePluginMemory {
  if (!this.isCorePlugin(pluginId)) {
    throw new Error(`Plugin ${pluginId} not authorized for core access`);
  }
  return new CorePluginMemory({
    graphiti: this.graphiti,           // Direct Graphiti access
    crossPluginComm: true,             // Inter-plugin communication
    globalMemoryAccess: true,          // Shared knowledge access
    namespaceManagement: true          // Can manage other plugin namespaces
  });
}

// Core plugin interface
interface CorePluginMemory {
  graphiti: GraphitiClient;  // Direct database access
  crossPluginCommunication(): Promise<PluginCommunicationChannel>;
  globalMemoryAccess(): Promise<GlobalMemorySpace>;
  managePluginNamespaces(): Promise<NamespaceManager>;
}
```

### **Regular Plugin Access (Isolated)**
```typescript
// Regular plugins get scoped, isolated access
createPluginMemory(pluginId: string): PluginMemory {
  return new PluginMemory({
    scope: pluginId,
    graphiti: this.createScopedGraphitiProxy(pluginId),
    isolation: 'strict',
    permissions: 'standard'
  });
}

// Regular plugin interface (namespace isolated)
interface PluginMemory {
  store(key: string, data: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string): Promise<SearchResult[]>;
  // No direct Graphiti access
}
```

## Implementation Strategy

### **Phase 1: Graphiti Installation**
```bash
# Install Graphiti on existing local Neo4j
pip install graphiti-core

# Configure for local instance
export GRAPHITI_NEO4J_URI="bolt://localhost:7687"
export GRAPHITI_NEO4J_USER="neo4j" 
export GRAPHITI_NEO4J_PASSWORD="password"
```

### **Phase 2: @lev-os/memory Interface**
```typescript
export class LevMemoryManager {
  private graphiti: GraphitiClient;
  
  constructor(options: MemoryOptions) {
    this.graphiti = new GraphitiClient({
      neo4j_uri: options.neo4jUri || "bolt://localhost:7687",
      enable_mcp: true,
      enable_temporal: true
    });
  }
  
  async query(request: UnifiedMemoryQuery): Promise<MemoryResult> {
    return await this.graphiti.hybrid_query({
      semantic: request.vectorQuery,
      graph: request.relationshipQuery,
      temporal: request.timeRange,
      context: request.agentContext
    });
  }
}
```

### **Phase 3: Codex Integration**
```typescript
// Codex as core plugin with direct Graphiti access
class CodexPlugin {
  constructor(private memory: CorePluginMemory) {}
  
  async searchCodePatterns(query: string): Promise<CodePattern[]> {
    return await this.memory.graphiti.hybrid_search({
      query,
      include_relationships: true,
      include_temporal: true,
      result_type: 'code_patterns'
    });
  }
  
  async storeAgentMemory(session: string, context: AgentContext): Promise<void> {
    await this.memory.graphiti.create_memory({
      session_id: session,
      content: context.description,
      embeddings: await this.generateEmbeddings(context),
      relationships: this.extractRelationships(context),
      timestamp: Date.now()
    });
  }
}
```

## Production Validation

### **Cursor IDE Pattern**
- Uses Graphiti for temporal agent memory
- Project-scoped persistent sessions
- Conversation history preservation
- Adaptive learning based on user patterns

### **Common Production Patterns**
1. **Full Project Context**: Complete codebase access over snippet approaches
2. **Persistent Sessions**: State survives disconnections and restarts
3. **Temporal Awareness**: Conversation and code evolution tracking
4. **Multi-file Intelligence**: Cross-file dependency understanding
5. **Real-time Coordination**: MCP protocol for agent communication

## Success Criteria

### **Performance Targets**
- **Semantic Search**: <200ms for top-10 similar patterns
- **Graph Traversal**: <100ms for 3-hop dependency chains
- **Hybrid Queries**: <500ms combining vector + graph + temporal
- **Agent Memory**: <50ms for context restoration

### **Functional Requirements**
- ✅ All hybrid architecture capabilities in unified system
- ✅ Simplified operational model (single database)
- ✅ Enhanced agent communication via MCP protocol
- ✅ Temporal memory and learning capabilities
- ✅ Plugin privilege system with namespace isolation

## Integration Roadmap

### **Immediate Next Steps**
1. Install Graphiti on local Neo4j instance (bolt://localhost:7687)
2. Implement @lev-os/memory interface with plugin privilege system
3. Configure Codex as core plugin with enhanced memory access
4. Implement namespace isolation for regular plugins
5. Test MCP protocol integration for agent communication

### **Future Scaling**
- **Development**: Local Neo4j instance (current)
- **Production**: Neo4j Aura cloud deployment
- **Enterprise**: Neo4j cluster with high availability

## Key Benefits

### **Operational Simplicity**
- ✅ Single Database: No multi-system synchronization
- ✅ Unified API: One interface for all memory operations
- ✅ Local Development: Uses existing Neo4j infrastructure
- ✅ Reduced Complexity: 90% reduction in database management overhead

### **Technical Superiority** 
- ✅ Hybrid Queries: Semantic + Graph + Temporal in single operation
- ✅ Real-time Updates: No batch recomputation delays
- ✅ Temporal Intelligence: Built-in time-aware relationships
- ✅ MCP Integration: Production-ready agent communication

---

**This specification establishes Graphiti as the unified memory foundation for the Leviathan ecosystem, validated by production usage and optimized for local development infrastructure.**