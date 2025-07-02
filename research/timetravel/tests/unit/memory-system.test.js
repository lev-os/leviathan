// Memory System Test Specifications
// Testing the research memory storage and retrieval system

describe('TimeTravel Memory System', () => {
  
  describe('Memory Storage', () => {
    test('should create memory entry with required fields', () => {
      const memoryEntry = {
        topic: 'subquadratic attention',
        content: 'LoLCATs achieves O(n^1.5) complexity',
        relevance: 0.9,
        tags: ['algorithm', 'breakthrough']
      };
      
      const saved = saveMemory(memoryEntry);
      
      expect(saved).toHaveProperty('id');
      expect(saved).toHaveProperty('timestamp');
      expect(saved).toHaveProperty('metadata');
      expect(saved.metadata.topic).toBe('subquadratic attention');
      expect(saved.metadata.relevance).toBe(0.9);
    });
    
    test('should generate unique memory IDs', () => {
      const entries = [
        { topic: 'test 1', content: 'content 1' },
        { topic: 'test 1', content: 'content 2' },
        { topic: 'test 2', content: 'content 3' }
      ];
      
      const ids = entries.map(e => generateMemoryId(e.topic));
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
      ids.forEach(id => {
        expect(id).toMatch(/^[a-zA-Z0-9_]+_\d{8}_\d{6}$/);
      });
    });
    
    test('should sanitize topic for ID generation', () => {
      const topics = [
        'AI/ML research',
        'attention@scale',
        'multi-modal learning',
        'cost: $0.001/token'
      ];
      
      topics.forEach(topic => {
        const id = generateMemoryId(topic);
        expect(id).not.toMatch(/[^a-zA-Z0-9_]/);
      });
    });
    
    test('should update memory index on save', () => {
      const memory = {
        topic: 'test entry',
        content: 'test content',
        relevance: 0.8
      };
      
      const beforeCount = getMemoryCount();
      saveMemory(memory);
      const afterCount = getMemoryCount();
      
      expect(afterCount).toBe(beforeCount + 1);
      
      const index = loadMemoryIndex();
      const lastEntry = index.entries[index.entries.length - 1];
      expect(lastEntry.topic).toBe('test entry');
    });
  });
  
  describe('Memory Retrieval', () => {
    beforeEach(() => {
      // Seed test memories
      const testMemories = [
        { topic: 'attention mechanisms', content: 'transformer basics', relevance: 0.6, tags: ['basics'] },
        { topic: 'subquadratic attention', content: 'LoLCATs algorithm', relevance: 0.9, tags: ['algorithm', 'breakthrough'] },
        { topic: 'flash attention', content: 'memory efficient', relevance: 0.8, tags: ['optimization'] },
        { topic: 'linear attention', content: 'O(n) complexity', relevance: 0.7, tags: ['algorithm'] }
      ];
      
      testMemories.forEach(m => saveMemory(m));
    });
    
    test('should search by keyword in content', () => {
      const results = searchMemory('algorithm');
      
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some(r => r.topic === 'subquadratic attention')).toBe(true);
      expect(results.some(r => r.topic === 'linear attention')).toBe(true);
    });
    
    test('should search by tag', () => {
      const results = searchMemory('tag:breakthrough');
      
      expect(results.length).toBe(1);
      expect(results[0].topic).toBe('subquadratic attention');
    });
    
    test('should retrieve recent memories', () => {
      const results = searchMemory('recent', { limit: 3 });
      
      expect(results.length).toBeLessThanOrEqual(3);
      // Results should be sorted by timestamp descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].timestamp).toBeGreaterThan(results[i].timestamp);
      }
    });
    
    test('should retrieve by relevance', () => {
      const results = searchMemory('relevant', { limit: 3 });
      
      expect(results.length).toBeLessThanOrEqual(3);
      // Results should be sorted by relevance descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].relevance).toBeGreaterThanOrEqual(results[i].relevance);
      }
      expect(results[0].topic).toBe('subquadratic attention');
    });
    
    test('should limit search results', () => {
      const results = searchMemory('attention', { limit: 2 });
      
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('Memory Connections', () => {
    test('should identify related memories', () => {
      const newFinding = {
        topic: 'Flash Attention v3',
        content: 'Improves on Flash Attention v2',
        keywords: ['attention', 'optimization', 'memory']
      };
      
      const connections = findRelatedMemories(newFinding);
      
      expect(connections).toHaveProperty('related_topics');
      expect(connections).toHaveProperty('builds_on');
      expect(connections.related_topics).toContain('flash attention');
    });
    
    test('should detect contradictions', () => {
      const memory1 = {
        topic: 'attention complexity',
        content: 'Standard attention is O(n^2)',
        claim: 'quadratic_complexity'
      };
      
      const memory2 = {
        topic: 'linear attention claim',
        content: 'All attention can be O(n)',
        claim: 'linear_complexity'
      };
      
      saveMemory(memory1);
      const contradictions = findContradictions(memory2);
      
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0].topic).toBe('attention complexity');
    });
    
    test('should track validation chains', () => {
      const hypothesis = {
        topic: 'subquadratic hypothesis',
        content: 'Attention can be less than O(n^2)',
        status: 'hypothesis'
      };
      
      const validation = {
        topic: 'LoLCATs proof',
        content: 'Demonstrates O(n^1.5) is possible',
        validates: 'subquadratic hypothesis'
      };
      
      saveMemory(hypothesis);
      saveMemory(validation);
      
      const chain = getValidationChain('subquadratic hypothesis');
      
      expect(chain).toHaveLength(2);
      expect(chain[1].topic).toBe('LoLCATs proof');
    });
  });
  
  describe('Memory Analytics', () => {
    test('should calculate memory statistics', () => {
      const stats = getMemoryStatistics();
      
      expect(stats).toHaveProperty('total_entries');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('avg_relevance');
      expect(stats).toHaveProperty('top_tags');
      expect(stats.total_entries).toBeGreaterThan(0);
    });
    
    test('should identify knowledge gaps', () => {
      const researchAreas = [
        'attention mechanisms',
        'memory efficiency',
        'training dynamics',
        'inference optimization'
      ];
      
      const gaps = identifyKnowledgeGaps(researchAreas);
      
      expect(gaps).toContain('training dynamics');
      expect(gaps.length).toBeGreaterThan(0);
    });
    
    test('should generate memory summary', () => {
      const summary = generateMemorySummary({
        timeframe: 'last_week',
        minRelevance: 0.7
      });
      
      expect(summary).toHaveProperty('key_discoveries');
      expect(summary).toHaveProperty('emerging_patterns');
      expect(summary).toHaveProperty('high_relevance_topics');
      expect(summary.high_relevance_topics.every(t => t.relevance >= 0.7)).toBe(true);
    });
  });
  
  describe('Memory Persistence', () => {
    test('should persist memories to disk', () => {
      const memory = {
        topic: 'persistence test',
        content: 'test content',
        relevance: 0.5
      };
      
      const saved = saveMemory(memory);
      const filePath = getMemoryFilePath(saved.id);
      
      expect(existsSync(filePath)).toBe(true);
      
      const loaded = loadMemoryFromDisk(saved.id);
      expect(loaded.metadata.topic).toBe('persistence test');
    });
    
    test('should handle concurrent memory saves', async () => {
      const memories = Array.from({ length: 10 }, (_, i) => ({
        topic: `concurrent test ${i}`,
        content: `content ${i}`,
        relevance: Math.random()
      }));
      
      const savePromises = memories.map(m => saveMemoryAsync(m));
      const results = await Promise.all(savePromises);
      
      expect(results.every(r => r.success)).toBe(true);
      expect(new Set(results.map(r => r.id)).size).toBe(10);
    });
  });
});