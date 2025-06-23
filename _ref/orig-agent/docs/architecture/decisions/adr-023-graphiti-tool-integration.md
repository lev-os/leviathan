# ADR-023: Graphiti LLM-Driven Memory Integration  

**Status**: Implementing  
**Date**: 2025-01-27  
**Deciders**: Kingly Architecture Team

## Context

Graphiti provides LLM-driven temporal knowledge graph capabilities for emergent pattern discovery from agent conversations. This enhances ADR-005's dual-mode memory architecture by adding intelligent pattern discovery while maintaining filesystem as source of truth.

**Key Insight**: Graphiti ≠ Neo4j. Graphiti is an LLM-powered framework that uses Neo4j for storage, specifically designed for episodic conversation analysis and emergent relationship discovery.

## Decision

Implement Graphiti as a **tool context** for LLM-driven pattern discovery, complementing ADR-005's filesystem-first architecture.

### Tool Context Integration

```yaml
# Following established contexts/tools/ pattern
metadata:
  type: "tool"
  id: "graphiti"
  
tool_config:
  storage_backends: # Graceful degradation
    sqlite: priority 1    # Zero-config fallback
    chroma: priority 2    # Semantic capabilities  
    neo4j: priority 3     # Full graph features
```

### Fallback Strategy

**Tier 1: SQLite (Always Available)**
- ✅ Zero configuration required
- ✅ File-based storage in `.kingly/memory/`
- ✅ Basic relational capabilities
- ✅ Workspace isolation via group_id

**Tier 2: ChromaDB (Semantic Enhancement)**
- ✅ Vector search and embeddings
- ✅ Semantic memory queries
- ✅ Lightweight deployment
- ✅ Enhanced context retrieval

**Tier 3: Neo4j (Full Graph Power)**
- ✅ Complete temporal graph capabilities
- ✅ Complex relationship queries
- ✅ Advanced graph analytics
- ✅ Production-scale performance

## Consequences

### Positive
- **Graceful degradation** - Always functional regardless of infrastructure
- **Established patterns** - Follows proven tool context architecture
- **Progressive enhancement** - Add capabilities as infrastructure grows
- **Workspace isolation** - Proper boundary management via group_id
- **Development velocity** - Start simple, scale complexity as needed

### Negative
- **Implementation complexity** - Multiple backend support required
- **Feature variations** - Different capabilities per backend
- **Testing overhead** - Must test all fallback scenarios

### Mitigation
- **Common interface** - Abstract backend differences behind tool context
- **Feature detection** - Graceful feature availability checking
- **Automated fallback** - Transparent backend switching
- **Progressive setup** - Guide users through capability upgrades

## Implementation Plan

### Phase 1: SQLite Foundation (Week 1)
1. **Basic tool context** - Implement core MCP tools with SQLite
2. **Workspace isolation** - Group-based memory separation
3. **Essential operations** - Add episodes, basic search, context retrieval
4. **Integration testing** - Validate with CEO/dev agent memory

### Phase 2: ChromaDB Enhancement (Week 2)
1. **Vector capabilities** - Add semantic search and embeddings
2. **Enhanced retrieval** - Context-aware memory queries
3. **Cross-workspace search** - Semantic discovery across groups
4. **Performance optimization** - Efficient vector operations

### Phase 3: Neo4j Full Power (Week 3)
1. **Graph capabilities** - Temporal relationships and complex queries
2. **Advanced analytics** - Pattern recognition and insight extraction
3. **Production deployment** - Docker configuration and monitoring
4. **Full feature set** - Complete Graphiti capabilities

### Phase 4: Integration & Optimization (Week 4)
1. **Dynamic assembly** - Automatic memory inclusion in contexts
2. **Whisper integration** - Seamless memory capture
3. **Cross-context learning** - Knowledge bubbling between workspaces
4. **Performance tuning** - Optimize for Kingly usage patterns

## Architecture Benefits

### Tool Context Pattern Validation
- **Reuses established patterns** - No new architectural concepts
- **MCP integration** - Standard tool interface
- **Dynamic assembly** - Automatic context enhancement
- **Privacy controls** - Workspace boundary respect

### Progressive Capability Model
```python
# Automatic capability detection
if neo4j_available:
    features = ["temporal_graphs", "complex_queries", "analytics"]
elif chroma_available:
    features = ["semantic_search", "vector_operations"]
else:  # sqlite_always_available
    features = ["basic_storage", "workspace_isolation"]
```

## Success Criteria

### Technical Milestones
- ✅ All three backends functional with common interface
- ✅ Automatic fallback working seamlessly
- ✅ Workspace isolation preventing cross-contamination
- ✅ MCP tools providing consistent experience

### Integration Success
- ✅ CEO/dev agents have persistent memory across sessions
- ✅ Context assembly enhanced with relevant memories
- ✅ Cross-workspace learning without boundary violations
- ✅ Workshop research building knowledge graph automatically

### Performance Targets
- **SQLite**: <50ms for basic operations
- **ChromaDB**: <200ms for semantic search
- **Neo4j**: <500ms for complex graph queries
- **Fallback**: <5s for backend switching

## Risk Mitigation

### Backend Availability
- **Health checks** - Continuous backend monitoring
- **Graceful fallback** - Transparent capability reduction
- **User notification** - Clear feature availability communication

### Data Consistency
- **Migration paths** - Upgrade data between backends
- **Backup strategy** - Regular exports regardless of backend
- **Validation** - Integrity checks across storage types

## Notes

This decision establishes the pattern for sophisticated tool integration in Kingly. The fallback strategy ensures functionality regardless of deployment complexity while providing clear upgrade paths for enhanced capabilities.

**Dogfooding**: This is our first major tool integration using the established tool context pattern, validating the architecture for future integrations.