# ADR-003: Hybrid Memory System Architecture

**Date:** 2025-06-15  
**Status:** ~~Approved~~ **SUPERSEDED by ADR-005**  
**Context:** Agent Memory System for Multi-Project Development  

> **⚠️ SUPERSEDED NOTICE (2025-06-19)**: This ADR has been superseded by **ADR-005: Graphiti-Only Memory Architecture**. The hybrid Qdrant + Graphiti approach defined here was replaced with a unified Graphiti-only system based on production coding agent research. This ADR is preserved for historical context.

## Decision

Implement hybrid Vector + Graph + File System architecture using existing Leviathan open source infrastructure for agent memory and learning.

## Research Summary

Perplexity analysis confirmed **Qdrant alone insufficient** for sophisticated relationship mapping and project-specific memory. Hybrid approach is 2025 best practice for multi-agent systems.

## Architecture

### Three-Layer Memory System
```
┌─ AGENT MEMORY SYSTEM ─────────────────────────────────────┐
│  ┌─ QDRANT (Vector) ──────┐  ┌─ GRAPHITI (Graph) ────────┐ │
│  │ • Semantic search       │  │ • Project relationships    │ │
│  │ • Pattern discovery     │  │ • Agent feedback loops     │ │
│  │ • Global knowledge      │  │ • Learning trajectories    │ │
│  └─────────────────────────┘  └────────────────────────────┘ │
│                    ↕                         ↕               │
│  ┌─ @leviathan/memory (Core Integration) ──────────────────────┐ │
│  │ • Session management    • Project-specific contexts      │ │
│  │ • Agent memory types    • Cross-plugin communication     │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Implementation Plans

### **Plan A: Semantic Search Integration**
- Qdrant collections for paradigms/languages/frameworks
- YAML content ingestion with embeddings  
- CLI semantic search replacing text search
- Example validation and LLM consumption testing

### **Plan B: Hybrid Agent Memory**
- Vector (Qdrant) + Graph (Graphiti) + File System
- Project-specific memory isolation with agent feedback loops
- Intelligent retrieval combining semantic + relationship traversal
- Collaborative learning across agent network

## Leviathan Integration Strategy

### Memory Types Extension
```typescript
// @leviathan/memory extensions
interface CodexMemory extends LeviathanMemory {
  paradigms: ParadigmMemory[];
  languages: LanguageMemory[];
  frameworks: FrameworkMemory[];
  projectLearnings: ProjectMemory[];
}

interface AgentLearningLoop {
  pattern: string;
  outcome: 'success' | 'failure' | 'partial';
  context: ProjectContext;
  confidence: number;
}
```

### Plugin Memory Patterns
- **Global Knowledge**: Accessible to all agents (paradigms, frameworks)
- **Project Memory**: Scoped to project agents  
- **Agent-Specific**: Private learning and preferences
- **Shared Learnings**: Publishable insights across projects

## Success Criteria

### Immediate
- ✅ Existing Qdrant infrastructure extended for Codex
- ✅ @leviathan/memory supports plugin memory patterns
- ✅ Project-specific memory isolation working
- ✅ Agent feedback loops functional

### Advanced  
- ✅ Predictive pattern selection using graph traversal
- ✅ Cross-project learning without knowledge pollution
- ✅ Automated knowledge curation through agent feedback
- ✅ Real-world validation through infinite-genesis-canvas

## Integration with Open Source Contribution

This memory architecture will be implemented through:
1. **@leviathan/memory** core consumption and enhancement
2. **@leviathan/plugin-codex** memory pattern integration
3. **@leviathan/adapter-wasm** for browser memory access
4. **infinite-genesis-canvas** as real-world validation showcase
5. **Contributing improvements** back to Leviathan open source

## Next Session Focus
- Plugin architecture design for memory integration
- @leviathan/memory consumption specifications  
- Cross-plugin memory communication patterns via Leviathan protocols
- Boundary validation and performance testing
- Study existing memory patterns at `~/lev/packages/memory/`