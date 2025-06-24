# ADR-003: Five Memory Types Classification

**Date:** 2025-06-19  
**Status:** Approved  
**Context:** Memory type system based on cognitive science principles

## Decision

Implement **five distinct memory types** (procedural, semantic, temporal, working, episodic) based on cognitive science research and optimized for AI agent intelligence.

## Problem Statement

AI agents need different types of memory for different cognitive tasks:
- **Skills and Procedures**: How to perform tasks
- **Knowledge and Facts**: What things are and mean
- **Time and Sequence**: When things happened and in what order
- **Active Processing**: What's currently being worked on
- **Personal Experience**: What was learned from previous interactions

## Memory Type Architecture

### **1. Procedural Memory** - "How to do things"

**Purpose**: Store patterns, workflows, and "muscle memory" for coding tasks

**Storage Strategy**: File system primary, Graphiti indexed
- **Files**: YAML workflows, agent behaviors, step-by-step patterns
- **Graphiti**: Searchability, success rate tracking, pattern relationships

**Examples**:
```yaml
# File: contexts/patterns/react-component-creation.yaml
pattern_id: "react_component_creation"
steps:
  - "Create component file with .tsx extension"
  - "Import React and define interface for props"
  - "Export default functional component"
  - "Add component to parent component imports"
```

**Why This Storage**: 
- Files provide fast, reliable access to established procedures
- Graphiti tracks which patterns work in which contexts
- Version control for procedure evolution

### **2. Semantic Memory** - "Facts and knowledge"

**Purpose**: Store factual knowledge, API documentation, framework information

**Storage Strategy**: Graphiti primary, files backup
- **Graphiti**: Vector embeddings for semantic similarity search
- **Files**: Source documentation, important reference materials

**Examples**:
```typescript
// Stored in Graphiti with vector embeddings
{
  concept: "React useEffect hook",
  definition: "Hook for side effects in functional components",
  relationships: ["useState", "useCallback", "component lifecycle"],
  embeddings: [0.1, 0.4, 0.8, ...], // Vector representation
  source_file: "./docs/react-hooks.md"
}
```

**Why This Storage**:
- Vector search finds semantically similar concepts
- Graph relationships connect related knowledge
- Fast retrieval of relevant facts during coding

### **3. Temporal Memory** - "Timeline of events"

**Purpose**: Track conversation history, session evolution, decision timeline

**Storage Strategy**: Graphiti primary, checkpoints in files
- **Graphiti**: Time-aware queries, conversation flow, decision evolution
- **Files**: Session checkpoints, important milestone summaries

**Examples**:
```typescript
// Graphiti temporal nodes
{
  timestamp: "2025-06-19T14:30:00Z",
  type: "conversation_turn",
  content: "User asked about React optimization",
  session_id: "session_123",
  relationships: {
    follows: "previous_conversation_turn",
    leads_to: "performance_optimization_discussion"
  }
}
```

**Why This Storage**:
- Graphiti's temporal capabilities track conversation evolution
- Time-aware queries: "What did we discuss about React yesterday?"
- Relationship tracking shows decision progression

### **4. Working Memory** - "Active thinking space"

**Purpose**: Hold current context, active variables, temporary processing state

**Storage Strategy**: Memory cache, session-based persistence
- **Cache**: Fast access for currently active information
- **Session**: Survives disconnections, cleared between major context switches

**Examples**:
```typescript
// In-memory working context
{
  currently_editing: [
    "./src/components/UserProfile.tsx",
    "./src/hooks/useUserData.ts"
  ],
  active_debugging: {
    issue: "useEffect infinite loop",
    hypothesis: "Missing dependency array",
    test_results: ["dependency added", "loop stopped"]
  },
  conversation_context: {
    current_topic: "React performance optimization",
    user_goals: ["fix infinite loop", "improve component performance"]
  }
}
```

**Why This Storage**:
- Speed critical for active operations
- Temporary by nature - doesn't need long-term persistence
- Session-based to survive brief disconnections

### **5. Episodic Memory** - "Personal experiences"

**Purpose**: Store learning experiences, successes/failures, "what I learned"

**Storage Strategy**: Graphiti primary, analysis summaries in files
- **Graphiti**: Experience relationships, learning evolution, pattern outcomes
- **Files**: Important learning summaries, post-mortems, insights

**Examples**:
```typescript
// Graphiti episodic memory
{
  episode_id: "react_optimization_attempt_1",
  timestamp: "2025-06-19T15:00:00Z",
  type: "learning_experience",
  content: {
    approach: "Added React.memo to UserProfile component",
    outcome: "Performance improved by 40ms render time",
    context: "Large user list (1000+ items)",
    confidence: 0.85
  },
  relationships: {
    similar_experiences: ["react_memo_success_2", "component_optimization_3"],
    related_patterns: ["react_performance_patterns", "memoization_strategies"]
  }
}
```

**Why This Storage**:
- Graph relationships connect similar learning experiences
- Temporal tracking shows learning evolution
- Future pattern selection informed by past success/failure

## Integration Strategy

### **Memory Type Coordination**
```typescript
class HybridMemoryManager {
  async handleUserQuery(query: string): Promise<Response> {
    // 1. Check working memory for current context
    const workingContext = await this.working.getCurrentContext();
    
    // 2. Search semantic memory for relevant knowledge
    const knowledge = await this.semantic.search(query);
    
    // 3. Check temporal memory for conversation history
    const history = await this.temporal.getRecentHistory();
    
    // 4. Look up procedural patterns for task execution
    const patterns = await this.procedural.findApplicablePatterns(query);
    
    // 5. Learn from episodic memory about what worked before
    const experiences = await this.episodic.findSimilarExperiences(query);
    
    return this.synthesizeResponse({
      context: workingContext,
      knowledge,
      history,
      patterns,
      experiences
    });
  }
}
```

### **Cross-Memory Learning**
- **Procedural → Episodic**: Track which procedures succeed/fail
- **Semantic → Temporal**: Knowledge discovery over time
- **Working → Temporal**: Active sessions become conversation history
- **Episodic → Procedural**: Successful experiences become new patterns

## Benefits

### **Cognitive Accuracy**
- ✅ Mirrors human memory architecture for natural interaction
- ✅ Different storage strategies optimized for each memory type
- ✅ Cross-memory learning enables intelligence evolution

### **Performance Optimization**
- ✅ Fast file access for frequently used procedures
- ✅ Vector search for knowledge discovery
- ✅ Temporal queries for conversation context
- ✅ Cache speed for active working memory

### **Intelligence Growth**
- ✅ Episodic memory enables learning from experience
- ✅ Pattern success tracking improves future decisions
- ✅ Semantic relationships discover new knowledge connections

## Success Criteria

- ✅ Each memory type has clear, distinct purpose
- ✅ Storage strategies optimized for access patterns
- ✅ Cross-memory learning and coordination functional
- ✅ Performance targets met for each memory type
- ✅ Intelligence capabilities measurably improved

---

**This ADR establishes a scientifically-grounded memory architecture that enables sophisticated AI agent intelligence while maintaining performance and reliability.**