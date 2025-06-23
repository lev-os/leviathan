# Implementation Ticket: 011 - Memory Context

## 📋 Overview
Implement memory as a context type, enabling persistent knowledge across sessions with pattern recognition and learning.

## 🔗 References
- **Previous**: [010 - Meta Language Parser](010-meta-language-parser.md)
- **Spec**: [Universal Context Architecture](../specs/core/universal-context-architecture.md)

## 🎯 Scope
Create memory context that:
- Stores conversation history
- Recognizes patterns
- Learns from interactions
- Provides relevant recall

## ✅ Acceptance Criteria

### AC-011-1: Memory Storage
```yaml
Given: Conversation or interaction data
When: Memory context updated
Then: Stores structured memory
And: Indexes for retrieval
And: Links related memories
```

### AC-011-2: Pattern Recognition
```yaml
Given: Multiple similar interactions
When: Pattern threshold reached
Then: Pattern is identified
And: Stored as reusable knowledge
And: Suggested in similar contexts
```

### AC-011-3: Contextual Recall
```yaml
Given: Current context and query
When: Memory searched
Then: Returns relevant memories
And: Ranked by relevance
And: Includes learned patterns
```

### AC-011-4: Memory Evolution
```yaml
Given: Feedback on memory relevance
When: Positive or negative signal
Then: Memory importance adjusted
And: Retrieval ranking updated
And: Weak memories pruned
```

## 🧪 Test Cases

### Unit Tests
1. **Store memory** - Basic storage works
2. **Retrieve memory** - Search returns relevant
3. **Pattern detection** - Patterns identified
4. **Memory ranking** - Relevance scoring works
5. **Memory pruning** - Old memories cleaned

### Integration Tests
1. **Cross-session** - Memories persist
2. **Pattern application** - Patterns help
3. **Memory context** - Integrates with system

## 💻 Implementation

### Memory Context Type
```yaml
# contexts/memory/workspace-memory/context.yaml
metadata:
  type: memory
  name: Workspace Memory
  
intent_context:
  business_goal: Capture and apply learned knowledge
  extends: ../../../universal/memory-base
  
polymorphic_config:
  memory_config:
    storage_type: vector_db  # or file_based
    embedding_model: text-embedding-ada-002
    max_memories: 10000
    pattern_threshold: 3  # Occurrences before pattern
    
behavior_rules:
  - trigger: context_accessed
    action: inject_relevant_memories
    
  - trigger: task_completed
    action: extract_learnings
    
  - trigger: pattern_detected
    action: create_reusable_knowledge
```

### Memory Storage Implementation
```javascript
// src/domain/memory-context.js
export class MemoryContext {
  constructor(config) {
    this.storage = this.initStorage(config.storage_type);
    this.embedder = new Embedder(config.embedding_model);
    this.patternDetector = new PatternDetector(config.pattern_threshold);
    this.maxMemories = config.max_memories;
  }
  
  async addMemory(memory) {
    // Structure the memory
    const structured = {
      id: generateId(),
      timestamp: Date.now(),
      type: memory.type || 'interaction',
      content: memory.content,
      context: memory.context,
      metadata: {
        ...memory.metadata,
        access_count: 0,
        relevance_score: 1.0,
        last_accessed: null
      }
    };
    
    // Generate embedding for semantic search
    structured.embedding = await this.embedder.embed(
      this.serializeForEmbedding(structured)
    );
    
    // Store in vector DB or file system
    await this.storage.store(structured);
    
    // Check for patterns
    await this.checkPatterns(structured);
    
    // Prune if needed
    await this.pruneIfNeeded();
    
    return structured.id;
  }
  
  async recall(query, context = {}, limit = 10) {
    // Generate query embedding
    const queryEmbedding = await this.embedder.embed(
      this.serializeQuery(query, context)
    );
    
    // Semantic search
    const candidates = await this.storage.search(
      queryEmbedding,
      limit * 3 // Get more for filtering
    );
    
    // Re-rank based on context
    const ranked = await this.rankByRelevance(
      candidates,
      query,
      context
    );
    
    // Update access stats
    for (const memory of ranked.slice(0, limit)) {
      await this.updateAccessStats(memory.id);
    }
    
    return ranked.slice(0, limit);
  }
  
  async checkPatterns(newMemory) {
    // Find similar memories
    const similar = await this.storage.search(
      newMemory.embedding,
      10,
      0.8 // High similarity threshold
    );
    
    if (similar.length >= this.patternDetector.threshold) {
      const pattern = await this.patternDetector.detectPattern(
        [newMemory, ...similar]
      );
      
      if (pattern) {
        await this.storePattern(pattern);
      }
    }
  }
  
  async storePattern(pattern) {
    const patternMemory = {
      type: 'pattern',
      content: pattern.template,
      context: {
        examples: pattern.examples,
        occurrences: pattern.occurrences,
        confidence: pattern.confidence
      },
      metadata: {
        pattern_type: pattern.type,
        first_seen: pattern.firstSeen,
        last_seen: Date.now()
      }
    };
    
    await this.addMemory(patternMemory);
  }
  
  async rankByRelevance(candidates, query, context) {
    const scored = [];
    
    for (const candidate of candidates) {
      let score = candidate.similarity; // Base semantic similarity
      
      // Boost recent memories
      const age = Date.now() - candidate.timestamp;
      const ageHours = age / (1000 * 60 * 60);
      score *= Math.max(0.5, 1 - ageHours / 168); // Decay over week
      
      // Boost frequently accessed
      score *= Math.log(candidate.metadata.access_count + 1) / 10;
      
      // Boost if context matches
      if (this.contextMatches(candidate.context, context)) {
        score *= 1.5;
      }
      
      // Boost patterns
      if (candidate.type === 'pattern') {
        score *= 1.3;
      }
      
      scored.push({ ...candidate, relevance: score });
    }
    
    return scored.sort((a, b) => b.relevance - a.relevance);
  }
  
  contextMatches(memoryContext, queryContext) {
    if (!memoryContext || !queryContext) return false;
    
    // Check for matching fields
    const matches = Object.keys(queryContext).filter(key => 
      memoryContext[key] === queryContext[key]
    );
    
    return matches.length > 0;
  }
  
  async updateAccessStats(memoryId) {
    const memory = await this.storage.get(memoryId);
    
    memory.metadata.access_count++;
    memory.metadata.last_accessed = Date.now();
    
    // Boost relevance score based on access
    memory.metadata.relevance_score = Math.min(
      2.0,
      memory.metadata.relevance_score * 1.05
    );
    
    await this.storage.update(memory);
  }
  
  async pruneIfNeeded() {
    const count = await this.storage.count();
    
    if (count > this.maxMemories) {
      // Get memories sorted by importance
      const allMemories = await this.storage.getAll();
      
      const scored = allMemories.map(m => ({
        id: m.id,
        importance: this.calculateImportance(m)
      }));
      
      scored.sort((a, b) => a.importance - b.importance);
      
      // Remove least important
      const toRemove = count - this.maxMemories;
      for (let i = 0; i < toRemove; i++) {
        await this.storage.delete(scored[i].id);
      }
    }
  }
  
  calculateImportance(memory) {
    let importance = memory.metadata.relevance_score;
    
    // Factor in access patterns
    importance *= Math.log(memory.metadata.access_count + 1);
    
    // Factor in age (newer is better)
    const agedays = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
    importance *= Math.max(0.1, 1 - agedays / 365);
    
    // Patterns are always important
    if (memory.type === 'pattern') {
      importance *= 2;
    }
    
    return importance;
  }
  
  serializeForEmbedding(memory) {
    return `${memory.type}: ${memory.content}
Context: ${JSON.stringify(memory.context)}
Metadata: ${JSON.stringify(memory.metadata)}`;
  }
  
  serializeQuery(query, context) {
    return `Query: ${query}
Context: ${JSON.stringify(context)}`;
  }
}

// Pattern Detection
export class PatternDetector {
  constructor(threshold = 3) {
    this.threshold = threshold;
  }
  
  async detectPattern(memories) {
    // Group by similarity
    const groups = this.groupBySimilarity(memories);
    
    for (const group of groups) {
      if (group.length >= this.threshold) {
        const pattern = await this.extractPattern(group);
        if (pattern) return pattern;
      }
    }
    
    return null;
  }
  
  groupBySimilarity(memories) {
    const groups = [];
    const used = new Set();
    
    for (const memory of memories) {
      if (used.has(memory.id)) continue;
      
      const group = [memory];
      used.add(memory.id);
      
      for (const other of memories) {
        if (used.has(other.id)) continue;
        
        if (this.areSimilar(memory, other)) {
          group.push(other);
          used.add(other.id);
        }
      }
      
      if (group.length > 1) {
        groups.push(group);
      }
    }
    
    return groups;
  }
  
  areSimilar(m1, m2) {
    // Check structural similarity
    if (m1.type !== m2.type) return false;
    
    // Check content similarity (simple approach)
    const words1 = new Set(m1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(m2.content.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const jaccard = intersection.size / union.size;
    return jaccard > 0.6;
  }
  
  async extractPattern(group) {
    // Find common elements
    const commonWords = this.findCommonWords(group);
    const commonContext = this.findCommonContext(group);
    
    if (commonWords.length < 3) return null;
    
    return {
      type: group[0].type,
      template: this.createTemplate(commonWords, group),
      examples: group.slice(0, 3).map(m => m.content),
      occurrences: group.length,
      confidence: this.calculateConfidence(group),
      firstSeen: Math.min(...group.map(m => m.timestamp)),
      commonContext: commonContext
    };
  }
  
  findCommonWords(memories) {
    const wordCounts = new Map();
    
    for (const memory of memories) {
      const words = memory.content.toLowerCase().split(/\s+/);
      const unique = new Set(words);
      
      for (const word of unique) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    // Words that appear in most memories
    const threshold = memories.length * 0.7;
    return Array.from(wordCounts.entries())
      .filter(([word, count]) => count >= threshold)
      .map(([word]) => word);
  }
  
  createTemplate(commonWords, memories) {
    // Simple template creation
    const template = memories[0].content;
    const words = template.split(/\s+/);
    
    return words.map(word => 
      commonWords.includes(word.toLowerCase()) ? word : '{variable}'
    ).join(' ');
  }
}

// Memory Storage Adapters
export class VectorDBStorage {
  constructor(config) {
    this.client = new VectorDBClient(config);
  }
  
  async store(memory) {
    await this.client.upsert({
      id: memory.id,
      values: memory.embedding,
      metadata: memory
    });
  }
  
  async search(embedding, limit, threshold = 0.7) {
    const results = await this.client.query({
      vector: embedding,
      topK: limit,
      includeMetadata: true
    });
    
    return results.matches
      .filter(m => m.score >= threshold)
      .map(m => ({
        ...m.metadata,
        similarity: m.score
      }));
  }
}

// Integration with Context Assembly
export class MemoryInjector {
  constructor(memoryContext) {
    this.memory = memoryContext;
  }
  
  async injectMemories(context, situation) {
    // Generate query from situation
    const query = `${situation.tool} ${situation.params?.intent || ''}`;
    
    // Recall relevant memories
    const memories = await this.memory.recall(query, situation, 5);
    
    if (memories.length === 0) return context;
    
    // Add memories to context
    return {
      ...context,
      relevant_memories: memories.map(m => ({
        type: m.type,
        content: m.content,
        relevance: m.relevance,
        context: m.context
      }))
    };
  }
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/memory-context.test.js
describe('MemoryContext', () => {
  let memory;
  let mockStorage;
  
  beforeEach(() => {
    mockStorage = {
      store: jest.fn(),
      search: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      get: jest.fn(),
      update: jest.fn()
    };
    
    memory = new MemoryContext({
      storage_type: 'mock',
      embedding_model: 'mock',
      max_memories: 100,
      pattern_threshold: 3
    });
    
    memory.storage = mockStorage;
    memory.embedder = { embed: jest.fn().mockResolvedValue([0.1, 0.2]) };
  });
  
  it('should store memories with embeddings', async () => {
    const testMemory = {
      type: 'interaction',
      content: 'User asked about authentication',
      context: { project: 'test-app' }
    };
    
    await memory.addMemory(testMemory);
    
    expect(mockStorage.store).toHaveBeenCalledWith(
      expect.objectContaining({
        content: testMemory.content,
        embedding: [0.1, 0.2]
      })
    );
  });
  
  it('should recall relevant memories', async () => {
    const stored = [
      {
        id: '1',
        content: 'Setup authentication',
        similarity: 0.9,
        timestamp: Date.now(),
        metadata: { access_count: 5 }
      },
      {
        id: '2', 
        content: 'Configure database',
        similarity: 0.3,
        timestamp: Date.now(),
        metadata: { access_count: 1 }
      }
    ];
    
    mockStorage.search.mockResolvedValue(stored);
    
    const results = await memory.recall('auth setup');
    
    expect(results[0].content).toContain('authentication');
    expect(results).toHaveLength(2);
  });
  
  it('should detect patterns', async () => {
    const similar = [
      { id: '1', content: 'create user login', embedding: [0.1, 0.2] },
      { id: '2', content: 'create admin login', embedding: [0.1, 0.21] },
      { id: '3', content: 'create guest login', embedding: [0.11, 0.2] }
    ];
    
    mockStorage.search.mockResolvedValue(similar);
    
    const newMemory = {
      content: 'create superuser login',
      embedding: [0.1, 0.2]
    };
    
    await memory.checkPatterns(newMemory);
    
    // Should detect "create X login" pattern
    expect(mockStorage.store).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'pattern'
      })
    );
  });
});
```

## 🔧 Dependencies
- Vector database for semantic search
- Embedding model for similarity
- Pattern detection algorithms

## 📊 Effort Estimate
- Implementation: 4 hours
- Testing: 2 hours
- Total: 6 hours

## 🚀 Next Steps
After this ticket:
- 012: Intent Classification Integration
- 013: Task Entity Enhancement

## 📝 Notes
- Memory enables learning over time
- Patterns emerge from repetition
- Relevance scoring improves recall
- Pruning keeps memory efficient