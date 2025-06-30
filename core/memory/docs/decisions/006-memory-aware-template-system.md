# ADR-006: Memory-Aware Template System

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Enhanced template merge engine with memory system integration

## Decision

Implement **memory-aware template system** that dynamically generates IDE context by querying Leviathan's 5-type memory system, replacing static placeholder substitution with intelligent memory queries.

## Problem Statement

Current template limitations:
- **Static Placeholders**: Simple text replacement lacks intelligence
- **No Memory Integration**: Templates can't access rich memory context
- **Limited Adaptability**: Can't adjust to project evolution
- **Cross-IDE Inconsistency**: Each IDE needs manual template maintenance

## Architecture Decision

### **Memory-Aware Placeholder System**

```typescript
interface MemoryAwarePlaceholder {
  pattern: string;                    // e.g., "{{MEMORY_SEMANTIC_RESEARCH}}"
  memoryQuery: MemoryQuery;          // Structured query to memory system
  transformer?: ContentTransformer;   // Optional post-processing
  fallback?: string;                 // Default if query fails
}

interface MemoryQuery {
  memoryType: MemoryType;            // procedural|semantic|temporal|working|episodic
  operation: QueryOperation;         // get|search|aggregate|summarize
  parameters: QueryParameters;
  options?: QueryOptions;
}

// Example placeholder definitions
const placeholders: MemoryAwarePlaceholder[] = [
  {
    pattern: "{{MEMORY_WORKING_ACTIVE_DRAFTS}}",
    memoryQuery: {
      memoryType: "working",
      operation: "get",
      parameters: { 
        category: "drafts",
        status: "active",
        limit: 5 
      }
    }
  },
  {
    pattern: "{{MEMORY_SEMANTIC_RESEARCH_SUMMARY}}",
    memoryQuery: {
      memoryType: "semantic",
      operation: "summarize",
      parameters: { 
        category: "research",
        useAI: true,
        maxTokens: 500 
      }
    }
  },
  {
    pattern: "{{MEMORY_PROCEDURAL_PROVEN_WORKFLOWS}}",
    memoryQuery: {
      memoryType: "procedural",
      operation: "search",
      parameters: {
        successRate: ">0.8",
        projectRelevant: true
      }
    }
  }
];
```

### **Template Inheritance Hierarchy**

```
Global Master Template (~/lev/memory/templates/master.md)
    ↓ inherits
IDE-Specific Template (~/lev/memory/templates/claude-code.md)
    ↓ inherits
Project Override Template (./lev/memory/templates/custom.md)
    ↓ generates
Final IDE Rules File (.cursorrules, CLAUDE.md, etc.)
```

### **Dynamic Template Generation**

```typescript
class MemoryAwareTemplateEngine {
  async generateFromTemplate(
    template: string,
    context: ProjectContext
  ): Promise<string> {
    // Parse placeholders
    const placeholders = this.extractPlaceholders(template);
    
    // Execute memory queries in parallel
    const results = await Promise.all(
      placeholders.map(p => this.executeMemoryQuery(p.memoryQuery))
    );
    
    // Apply transformations
    const transformed = results.map((result, i) => 
      placeholders[i].transformer 
        ? placeholders[i].transformer(result)
        : result
    );
    
    // Replace placeholders with results
    return this.replacePlaceholders(template, placeholders, transformed);
  }
  
  private async executeMemoryQuery(query: MemoryQuery): Promise<any> {
    const memory = this.memoryManager.getMemoryType(query.memoryType);
    
    switch (query.operation) {
      case "get":
        return memory.get(query.parameters);
      case "search":
        return memory.search(query.parameters);
      case "aggregate":
        return memory.aggregate(query.parameters);
      case "summarize":
        return this.aiSummarizer.summarize(
          await memory.get(query.parameters),
          query.parameters.maxTokens
        );
    }
  }
}
```

### **Intelligent Placeholders**

```markdown
<!-- Master Template with Memory Integration -->

# AI Assistant Context for {{PROJECT_NAME}}

## 🧠 Current Mental Model
{{MEMORY_AI_PROJECT_UNDERSTANDING}}
<!-- Queries all memory types and generates AI summary of project state -->

## 📊 Active Work Context
{{MEMORY_WORKING_CURRENT_FOCUS}}
<!-- Queries working memory for immediate context -->

## 🎯 Established Patterns
{{MEMORY_PROCEDURAL_SUCCESS_PATTERNS}}
<!-- Queries procedural memory for high-success workflows -->

## 📚 Knowledge Base
{{MEMORY_SEMANTIC_RELEVANT_DOCS}}
<!-- Queries semantic memory with project context filter -->

## ⏰ Recent Decisions
{{MEMORY_TEMPORAL_LAST_N_DECISIONS}}
<!-- Queries temporal memory for recent ADRs -->

## 💡 Learning Insights
{{MEMORY_EPISODIC_PROJECT_LEARNINGS}}
<!-- Queries episodic memory for project-specific insights -->

## 🔄 Session Continuity
{{SESSION_QUANTUM_CONTEXT}}
<!-- Special placeholder for cross-tab context -->
```

## Implementation Strategy

### **Phase 1: Basic Memory Queries**
- [ ] Implement placeholder parser
- [ ] Create memory query interface
- [ ] Build basic get/search operations
- [ ] Test with simple placeholders

### **Phase 2: Advanced Intelligence**
- [ ] AI-powered summarization
- [ ] Cross-memory aggregation
- [ ] Context-aware filtering
- [ ] Performance optimization

## Consequences

### **Positive**
- **Dynamic Context**: Templates adapt to project evolution
- **Rich Integration**: Full access to 5-type memory system
- **Consistent Intelligence**: Same queries work across all IDEs
- **Future-Proof**: Easy to add new placeholder types

### **Negative**
- **Query Performance**: Memory queries add latency
- **Complexity**: More moving parts than static templates
- **Debugging Difficulty**: Dynamic generation harder to troubleshoot

### **Risk Mitigation**
- **Caching Layer**: Cache frequent queries
- **Fallback Values**: Graceful degradation if queries fail
- **Query Optimization**: Indexed memory for fast retrieval

## Success Metrics

- **Template Generation Speed**: < 500ms for full context
- **Query Success Rate**: > 99% successful memory queries
- **Context Relevance**: 90%+ relevant information in generated context
- **Cache Hit Rate**: > 80% for common queries

## References

- Template Patterns: `~/lev/_ref/erasmus/erasmus/.erasmus/templates/`
- Memory System: `~/lev/packages/memory/src/memory-manager.js`
- AI Summarization: LLM integration patterns

---

**Decision Status**: Proposed  
**Review Date**: 2025-07-04