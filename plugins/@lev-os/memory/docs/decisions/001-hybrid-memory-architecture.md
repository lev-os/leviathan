# ADR-001: Hybrid Memory Architecture

**Date:** 2025-06-19  
**Status:** Approved  
**Context:** Memory system foundation architecture for Leviathan ecosystem

## Decision

Adopt **hybrid tiered memory architecture** combining file system reliability with Graphiti intelligence capabilities, replacing single-database approaches.

## Problem Statement

Memory systems need to balance:
- **Reliability**: Source of truth that survives system failures
- **Intelligence**: Semantic search, relationship discovery, learning
- **Performance**: Fast access for common operations
- **Compatibility**: Integration with existing YAML-first workflows

## Architecture Decision

### **Three-Layer Hybrid System**

```
Fast Access Layer (RAM/Cache)
├─ Working Memory: Active session state
└─ Context Buffers: Current conversation

Medium Access Layer (Graphiti on Neo4j)  
├─ Semantic Memory: Vector embeddings
├─ Temporal Memory: Session evolution
├─ Episodic Memory: Agent learning
└─ Graph Relationships: Dependencies

Persistent Layer (File System - Source of Truth)
├─ Procedural Memory: YAML workflows
├─ Session Checkpoints: ~/.kingly/sessions/
├─ Context Definitions: contexts/*.yaml
└─ Constitutional Framework: Validation rules
```

### **Sync Strategy: Files → Graphiti (One-Way Enhancement)**
- Files remain source of truth
- Graphiti indexes file contents for searchability
- Graph relationships track usage patterns
- No data loss if Graphiti fails

## Benefits

### **Operational Advantages**
- ✅ **Reliability**: File system proven reliability with existing workflows
- ✅ **Intelligence**: Graphiti semantic search and relationship discovery
- ✅ **Performance**: Tiered access optimizes for common vs advanced operations
- ✅ **Fallback**: Graceful degradation to file-only mode

### **Technical Superiority**
- ✅ **Best of Both**: File reliability + graph intelligence
- ✅ **No Lock-in**: Can operate without Graphiti if needed
- ✅ **Gradual Migration**: Existing workflows preserved
- ✅ **Enhanced Discovery**: Relationships and patterns emerge

## Implementation Strategy

### **Phase 1: Foundation**
1. File system operations continue as-is
2. Graphiti installation on local Neo4j
3. Basic indexing pipeline: files → Graphiti

### **Phase 2: Enhanced Queries**
1. Hybrid query interface (files + graph)
2. Relationship discovery
3. Usage pattern tracking

### **Phase 3: Intelligent Features**
1. Semantic search across all content
2. Temporal memory evolution
3. Agent learning integration

## Success Criteria

- ✅ All existing file-based operations preserved
- ✅ Graphiti enhances without replacing
- ✅ Performance targets met for all layers
- ✅ Fallback mode functional and tested

---

**This ADR establishes the foundational architecture that combines proven file system reliability with modern graph database intelligence.**