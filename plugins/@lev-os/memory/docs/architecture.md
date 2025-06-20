# Memory System Architecture Specification

**Date:** 2025-06-19  
**Status:** Approved - Hybrid File + Graphiti Architecture  
**Context:** Unified memory system for Leviathan ecosystem plugin consumption

## Executive Summary

Hybrid tiered memory architecture combining file system reliability with Graphiti intelligence capabilities. Provides 5-type memory system (procedural, semantic, temporal, working, episodic) with plugin privilege system and graceful fallback strategies.

## Architecture Decision: Hybrid Tiered System

### **Research-Validated Choice**
Production analysis of Google Jules, Cursor, Augment, Factory Droids, and Claude Code reveals that successful agents use unified memory systems. **Key validation**: Cursor IDE uses Graphiti in production for agent memory, while maintaining file-based reliability.

### **Tiered Memory Architecture**
```
┌─ HYBRID MEMORY SYSTEM ─────────────────────────────────────┐
│                                                             │
│  Fast Access Layer (RAM/Cache)                             │
│  ├─ Working Memory: Active session state                   │
│  └─ Context Buffers: Current conversation context          │
│                                                             │
│  Medium Access Layer (Graphiti on Neo4j)                   │
│  ├─ Semantic Memory: Vector embeddings for search          │
│  ├─ Temporal Memory: Session/conversation evolution        │
│  ├─ Episodic Memory: Agent learning and experience         │
│  └─ Graph Relationships: Code dependencies, patterns       │
│                                                             │
│  Persistent Layer (File System - Source of Truth)          │
│  ├─ Procedural Memory: YAML workflows and patterns         │
│  ├─ Session Checkpoints: ~/.kingly/sessions/               │
│  ├─ Context Definitions: contexts/*.yaml configurations    │
│  └─ Constitutional Framework: Validation rules             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Memory Type Classifications**

#### **Procedural Memory** - "How to do things"
- **Storage**: File system primary, Graphiti indexed
- **Examples**: React component patterns, Git workflows, agent behaviors
- **Why Files**: Fast access, reliable, version controlled
- **Why Graphiti**: Searchability, relationship discovery

#### **Semantic Memory** - "Facts and knowledge"
- **Storage**: Graphiti primary, files backup
- **Examples**: API documentation, code patterns, framework knowledge
- **Why Graphiti**: Vector search, semantic similarity
- **Why Files**: Fallback, source documentation

#### **Temporal Memory** - "Timeline of events"
- **Storage**: Graphiti primary, checkpoints in files
- **Examples**: Conversation history, session evolution, decision timeline
- **Why Graphiti**: Time-aware queries, relationship tracking
- **Why Files**: Checkpoint reliability, session persistence

#### **Working Memory** - "Active thinking space"
- **Storage**: Memory cache, session-based persistence
- **Examples**: Currently edited files, active debugging context
- **Why Cache**: Speed, temporary nature
- **Why Session**: Survives disconnections

#### **Episodic Memory** - "Personal experiences"
- **Storage**: Graphiti primary, analysis in files
- **Examples**: "Approach X failed because Y", learning patterns
- **Why Graphiti**: Experience relationships, learning evolution
- **Why Files**: Important learning summaries

## Plugin Privilege System

### **Core Plugin Access** (memory, agent, codex)
```typescript
interface CorePluginMemory {
  // Direct Graphiti access for advanced operations
  graphiti: GraphitiClient;
  
  // Enhanced capabilities
  crossPluginCommunication(): Promise<PluginCommunicationChannel>;
  globalMemoryAccess(): Promise<GlobalMemorySpace>;
  managePluginNamespaces(): Promise<NamespaceManager>;
  fileSystemAccess: "unrestricted";
}
```

### **Regular Plugin Access** (isolated and scoped)
```typescript
interface RegularPluginMemory {
  // Standard memory operations with namespace isolation
  store(key: string, data: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string): Promise<SearchResult[]>;
  
  // Limited access through proxy
  graphitiProxy: ScopedGraphitiProxy;
  fileSystemAccess: "restricted";
}
```

## Implementation Strategy

### **Phase 1: Graphiti + File System Foundation**
```bash
# Install Graphiti on existing local Neo4j
pip install graphiti-core

# Configure for local instance
export GRAPHITI_NEO4J_URI="bolt://localhost:7687"
export GRAPHITI_NEO4J_USER="neo4j"
export GRAPHITI_NEO4J_PASSWORD="password"
```

### **Phase 2: Memory Manager Implementation**
```typescript
export class HybridMemoryManager {
  private graphiti: GraphitiClient;
  private fileSystem: FileSystemManager;
  
  constructor(options: MemoryOptions) {
    this.graphiti = new GraphitiClient({
      neo4j_uri: options.neo4jUri || "bolt://localhost:7687",
      enable_mcp: true,
      enable_temporal: true
    });
    this.fileSystem = new FileSystemManager({
      sessions_path: "~/.kingly/sessions/",
      contexts_path: "./contexts/",
      source_of_truth: true
    });
  }
  
  async query(request: HybridMemoryQuery): Promise<MemoryResult> {
    // Try Graphiti for smart search
    try {
      const graphitiResult = await this.graphiti.hybrid_query({
        semantic: request.vectorQuery,
        graph: request.relationshipQuery,
        temporal: request.timeRange
      });
      
      // Enhance with file system data
      const fileData = await this.fileSystem.getRelevantFiles(request);
      
      return this.mergeResults(graphitiResult, fileData);
    } catch (error) {
      // Fallback to file-only mode
      return await this.fileSystem.search(request);
    }
  }
}
```

### **Phase 3: Component Integration**
```typescript
// Wrap existing agent components
class SessionMemory extends HybridMemoryManager {
  constructor(private sessionManager: SessionManager) {
    super();
  }
  
  async createSession(sessionId: string): Promise<Session> {
    // Use existing file-based session creation
    const session = await this.sessionManager.create(sessionId);
    
    // Enhance with Graphiti relationship tracking
    await this.graphiti.create_memory({
      session_id: sessionId,
      type: "session_created",
      relationships: this.extractSessionContext(session)
    });
    
    return session;
  }
}
```

## Benefits

### **Operational Advantages**
- ✅ **Reliability**: File system as source of truth with proven workflows
- ✅ **Intelligence**: Graphiti provides search, relationships, learning
- ✅ **Performance**: Multi-tier access patterns optimize for speed
- ✅ **Fallback**: Graceful degradation when Graphiti unavailable

### **Technical Superiority**
- ✅ **Hybrid Queries**: Combine file reliability with graph intelligence
- ✅ **Real-time Learning**: Graphiti tracks patterns without breaking files
- ✅ **Plugin Security**: Privilege system prevents namespace violations
- ✅ **MCP Integration**: Standard protocol for agent communication

### **Production Validation**
- ✅ **Cursor Pattern**: Graphiti + persistence validated in production
- ✅ **File Reliability**: Proven YAML-first architecture preserved
- ✅ **Gradual Migration**: No disruption to existing workflows

## Success Criteria

### **Performance Targets**
- **Procedural Memory**: <10ms file access for common patterns
- **Semantic Search**: <200ms Graphiti queries for discovery
- **Hybrid Queries**: <500ms combining file + graph intelligence
- **Fallback Mode**: <50ms degradation to file-only operation

### **Functional Requirements**
- ✅ All 5 memory types implemented with clear interfaces
- ✅ Plugin privilege system enforced with security boundaries
- ✅ Existing agent components preserved and enhanced
- ✅ Graceful fallback when Graphiti unavailable
- ✅ MCP protocol integration for agent communication

---

**This architecture establishes a hybrid memory foundation that combines the reliability of file systems with the intelligence of graph databases, validated by production usage patterns and optimized for the Leviathan ecosystem.**