# 🧠 MEMORY SYSTEMS MVP SPECIFICATION

*Hybrid file-based + Ultimate MCP memory system for Kingly OS*

## 📋 **BUSINESS CASE**

**Goal**: Enhanced memory system that provides fast local storage + semantic intelligence without breaking existing functionality
**Value**: Enables task context awareness, pattern learning, and semantic search while maintaining <10ms local operations
**Priority**: High - Foundation for intelligent task routing and confidence assessment

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-MEMORY-001: Hybrid Storage Routing**
```yaml
Given: User stores memory with significance > 0.3
When: memory_intelligent_store MCP tool is called
Then: Content is stored both locally (fast) and in Ultimate MCP (semantic)
And: Local storage always succeeds regardless of MCP status
And: MCP failure gracefully logs warning but doesn't break operation
And: Response time is <50ms for local storage even if MCP is slow
```

### **AC-MEMORY-002: Intelligent Search**
```yaml
Given: User searches for task-related memory
When: memory_hybrid_search MCP tool is called with semantic=true
Then: System tries Ultimate MCP semantic search first
And: Falls back to local file search if MCP unavailable
And: Returns results in <200ms even with fallback chain
And: Results include relevance scoring and memory type classification
```

### **AC-MEMORY-003: Working Memory Integration**
```yaml
Given: Agent is working on a task with multiple steps
When: Task context needs to be maintained across operations
Then: Working memory stores active context with 30-minute TTL
And: Context is automatically loaded for related task operations
And: Memory optimization prevents context bloat beyond 20 items
And: Context whispers occur every 1000 tokens to capture insights
```

### **AC-MEMORY-004: Confidence-Memory Integration**
```yaml
Given: Agent assesses task confidence using similar past experiences
When: assess_task_confidence is called
Then: System searches semantic memory for similar completed tasks
And: Success/failure patterns inform confidence calculation
And: Confidence assessment is stored as procedural memory
And: Memory-informed confidence is ±0.2 more accurate than baseline
```

### **AC-MEMORY-005: Graceful Degradation**
```yaml
Given: Ultimate MCP server is unavailable or slow
When: Any memory operation is attempted
Then: System falls back to local file-based operations
And: No functionality is lost, only semantic features disabled
And: System automatically retries MCP connection every 5 minutes
And: Recovery is transparent when MCP comes back online
```

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Hybrid Memory Architecture**
```yaml
memory_system:
  local_layer:
    type: "file_based"
    location: ".kingly/memory/"
    structure:
      - "quick_cache.json"     # <10ms access
      - "session_state.json"  # Current context
      - "task_history.json"   # Recent completions
    
  advanced_layer:
    type: "ultimate_mcp"
    endpoint: "workshop/ultimate_mcp_server"
    features:
      - semantic_search
      - memory_hierarchy
      - thought_chains
      - relationship_mapping
    
  routing_logic:
    quick_operations: "local_only"
    semantic_operations: "mcp_primary_local_fallback"
    storage_operations: "both_parallel"
```

### **Memory Type Mapping**
```yaml
memory_type_strategy:
  # Kingly → Ultimate MCP mapping
  task_cache: "working"        # 30min TTL, active tasks
  conversation_context: "episodic"  # 7 days, interactions  
  pattern_learning: "semantic"      # 30 days, insights
  skill_development: "procedural"   # 90 days, capabilities
  
  # Local file priorities
  high_frequency: ["task_status", "current_context", "quick_lookups"]
  low_frequency: ["historical_patterns", "deep_insights", "relationship_maps"]
```

## 🛠️ **IMPLEMENTATION SPECIFICATION**

### **New MCP Tool Handlers**

#### **memory_intelligent_store**
```javascript
// src/adapters/primary/mcp-tool-handlers.js
async memory_intelligent_store(args) {
  const { 
    key, 
    content, 
    memory_type = 'semantic',
    significance = 0.5,
    context_id = null 
  } = args;
  
  // Always store locally for speed
  const localResult = await this.storeMemory({ 
    key, 
    content, 
    metadata: { memory_type, significance, context_id, timestamp: Date.now() }
  });
  
  // Store in Ultimate MCP for semantic search if significant
  if (significance > 0.3) {
    try {
      const mcpResult = await this.ultimateMCP.store_memory({
        content: JSON.stringify({ key, content, metadata: args }),
        memory_type: memory_type,
        metadata: {
          confidence: significance,
          significance: significance,
          context_id: context_id,
          source: 'kingly_agent',
          timestamp: Date.now()
        }
      });
      
      // Link local and MCP memories
      localResult.mcp_id = mcpResult.memory_id;
      await this.updateLocalMemory(key, localResult);
      
    } catch (error) {
      console.warn(`Advanced memory storage failed for key ${key}:`, error.message);
      // Graceful degradation - local storage still works
    }
  }
  
  return {
    success: true,
    local_id: localResult.id,
    mcp_id: localResult.mcp_id || null,
    storage_layers: localResult.mcp_id ? ['local', 'ultimate_mcp'] : ['local']
  };
}
```

#### **memory_hybrid_search**
```javascript
async memory_hybrid_search(args) {
  const { 
    query, 
    prefer_speed = false,
    include_semantic = true,
    memory_types = null,
    limit = 10 
  } = args;
  
  let results = [];
  
  // Fast local search if preferred or as fallback
  if (prefer_speed) {
    results = await this.searchLocalMemory(query, { limit });
    if (results.length > 0) {
      return this.formatSearchResults(results, 'local');
    }
  }
  
  // Semantic search via Ultimate MCP
  if (include_semantic) {
    try {
      const semanticResults = await this.ultimateMCP.search_semantic_memories({
        query: query,
        limit: limit,
        memory_types: memory_types
      });
      
      // Combine with local results if any
      results = results.concat(this.parseSemanticResults(semanticResults));
      
      // Sort by relevance score
      results.sort((a, b) => b.relevance - a.relevance);
      
      return this.formatSearchResults(results.slice(0, limit), 'hybrid');
      
    } catch (error) {
      console.warn('Semantic search failed, falling back to local:', error.message);
    }
  }
  
  // Fallback to local search
  const localResults = await this.searchLocalMemory(query, { limit });
  return this.formatSearchResults(localResults, 'local_fallback');
}
```

#### **memory_get_working_context**
```javascript
async memory_get_working_context(args) {
  const { context_id = 'current', include_related = true } = args;
  
  try {
    // Get working memory from Ultimate MCP
    const workingMemory = await this.ultimateMCP.get_working_memory({
      context_filter: context_id
    });
    
    // Enhance with local session state
    const localContext = await this.getLocalContext(context_id);
    
    const combinedContext = {
      working_memory: workingMemory,
      local_state: localContext,
      context_id: context_id,
      last_updated: Date.now(),
      memory_count: workingMemory.length + localContext.length
    };
    
    if (include_related) {
      // Get linked memories
      const linkedMemories = await this.ultimateMCP.get_linked_memories({
        memory_ids: workingMemory.map(m => m.id)
      });
      combinedContext.related_memories = linkedMemories;
    }
    
    return combinedContext;
    
  } catch (error) {
    console.warn('Working memory retrieval failed, using local only:', error.message);
    
    // Fallback to local context only
    return {
      working_memory: [],
      local_state: await this.getLocalContext(context_id),
      context_id: context_id,
      source: 'local_fallback',
      last_updated: Date.now()
    };
  }
}
```

### **Enhanced Task Confidence Integration**
```javascript
// Enhanced confidence assessment with memory
async assess_task_confidence(args) {
  const { taskDescription, context_id = null } = args;
  
  // Search for similar tasks in memory
  const similarTasks = await this.memory_hybrid_search({
    query: `task similar to: ${taskDescription}`,
    memory_types: ['procedural', 'episodic'],
    include_semantic: true,
    limit: 5
  });
  
  // Base confidence calculation
  let confidence = 0.5;
  let confidenceFactors = {
    base: 0.5,
    memory_informed: 0,
    pattern_bonus: 0,
    complexity_penalty: 0
  };
  
  // Memory-informed confidence adjustment
  if (similarTasks.results.length > 0) {
    const successfulTasks = similarTasks.results.filter(
      task => task.metadata && task.metadata.status === 'completed'
    );
    
    const successRate = successfulTasks.length / similarTasks.results.length;
    const memoryConfidence = successRate * 0.3; // Up to 30% boost
    
    confidence += memoryConfidence;
    confidenceFactors.memory_informed = memoryConfidence;
    
    // Pattern recognition bonus
    if (successfulTasks.length >= 3) {
      confidenceFactors.pattern_bonus = 0.1;
      confidence += 0.1;
    }
  }
  
  // Store the assessment for future learning
  await this.memory_intelligent_store({
    key: `confidence_assessment_${Date.now()}`,
    content: JSON.stringify({
      task: taskDescription,
      confidence: confidence,
      factors: confidenceFactors,
      similar_tasks_found: similarTasks.results.length,
      context_id: context_id
    }),
    memory_type: 'procedural',
    significance: 0.4,
    context_id: context_id
  });
  
  return {
    confidence: Math.min(confidence, 1.0), // Cap at 1.0
    confidence_factors: confidenceFactors,
    similar_tasks_count: similarTasks.results.length,
    memory_informed: similarTasks.results.length > 0
  };
}
```

### **Ultimate MCP Integration Adapter**
```javascript
// src/adapters/secondary/ultimate-mcp-memory-adapter.js
export class UltimateMCPMemoryAdapter {
  constructor(config = {}) {
    this.endpoint = config.endpoint || 'http://localhost:8000';
    this.timeout = config.timeout || 5000;
    this.retryAttempts = config.retryAttempts || 3;
    this.connected = false;
    
    this.initializeConnection();
  }
  
  async initializeConnection() {
    try {
      // Initialize Ultimate MCP memory system
      await this.call('initialize_memory_system', {});
      this.connected = true;
      console.log('✅ Ultimate MCP memory system connected');
    } catch (error) {
      console.warn('⚠️ Ultimate MCP connection failed, running in local mode:', error.message);
      this.connected = false;
    }
  }
  
  async call(method, params = {}) {
    if (!this.connected && method !== 'initialize_memory_system') {
      throw new Error('Ultimate MCP not connected');
    }
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.endpoint}/mcp/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, params }),
          timeout: this.timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
        
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  // Wrapper methods for Ultimate MCP memory functions
  async store_memory(args) {
    return await this.call('store_memory', args);
  }
  
  async search_semantic_memories(args) {
    return await this.call('search_semantic_memories', args);
  }
  
  async get_working_memory(args = {}) {
    return await this.call('get_working_memory', args);
  }
  
  async get_linked_memories(args) {
    return await this.call('get_linked_memories', args);
  }
  
  async record_thought(args) {
    return await this.call('record_thought', args);
  }
}
```

## 🗂️ **FILE STRUCTURE CHANGES**

### **New Files to Create**
```
src/adapters/secondary/
├── ultimate-mcp-memory-adapter.js     # MCP client adapter
└── memory-router.js                   # Hybrid routing logic

src/adapters/primary/
└── mcp-tool-handlers.js               # Enhanced with memory tools

.kingly/memory/
├── quick_cache.json                   # Fast local storage
├── session_state.json                 # Current context
└── task_history.json                  # Recent completions
```

### **Enhanced Existing Files**
```yaml
files_to_modify:
  src/adapters/primary/mcp-tool-handlers.js:
    add_tools:
      - memory_intelligent_store
      - memory_hybrid_search  
      - memory_get_working_context
      
  src/adapters/primary/mcp-server.js:
    register_tools:
      - Add new memory tools to tools array
      
  src/application/workspace-service.js:
    integrate_memory:
      - Initialize Ultimate MCP adapter
      - Add memory to task routing decisions
```

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```yaml
test_memory_routing:
  test: "Local storage always works even if MCP fails"
  scenario: "MCP server down, store operation succeeds locally"
  
test_semantic_search:
  test: "Semantic search falls back to local gracefully"
  scenario: "MCP timeout, returns local results within 200ms"
  
test_confidence_enhancement:
  test: "Memory-informed confidence is more accurate"
  scenario: "Task with 3+ similar examples gets confidence boost"
```

### **Integration Tests**
```yaml
test_hybrid_workflow:
  scenario: "Complete task with memory integration"
  steps:
    1. Store task context in working memory
    2. Search for similar patterns during execution
    3. Record completion for future learning
    4. Verify memory persistence across sessions
    
test_fallback_chain:
  scenario: "Graceful degradation under various failure modes"
  test_cases:
    - MCP server unavailable
    - MCP server slow (>5s)
    - MCP server returns errors
    - Network connectivity issues
```

### **Performance Tests**
```yaml
performance_benchmarks:
  local_storage: "<10ms for quick operations"
  hybrid_search: "<200ms including MCP semantic search"
  fallback_speed: "<50ms when MCP unavailable"
  memory_optimization: "Working memory stays <20 items"
```

## 🚀 **IMPLEMENTATION ROADMAP**

### **Week 1: Foundation**
- [ ] Create Ultimate MCP adapter
- [ ] Implement hybrid storage routing
- [ ] Add basic memory MCP tools
- [ ] Test fallback mechanisms

### **Week 2: Intelligence Integration**
- [ ] Connect memory to confidence system
- [ ] Implement working memory management
- [ ] Add thought chain recording
- [ ] Create memory-informed task routing

### **Week 3: Production Polish**
- [ ] Performance optimization
- [ ] Comprehensive error handling
- [ ] Memory cleanup and TTL management
- [ ] Documentation and examples

## 💡 **FUTURE VISION INTEGRATION**

This MVP creates the foundation for advanced memory systems documented in `docs/vision/memory-federation/`:
- Multi-provider memory federation
- Cross-workspace memory sharing
- AI-driven memory optimization
- Advanced vector/graph operations

**The MVP provides immediate value while enabling seamless evolution to the full vision.** 🧠✨

## 🎯 **SUCCESS METRICS**

### **Immediate Value (Week 1)**
- [ ] 100% backward compatibility (no breaking changes)
- [ ] <10ms local operations maintained
- [ ] Semantic search available when MCP online

### **Intelligence Gains (Week 2)**
- [ ] Memory-informed confidence assessment
- [ ] Task pattern recognition working
- [ ] Context awareness across sessions

### **Production Ready (Week 3)**  
- [ ] <200ms response times under all conditions
- [ ] Graceful degradation tested and verified
- [ ] Memory system supports 1000+ task operations

**This specification transforms Kingly from stateless task execution to intelligent, memory-aware coordination!** 🚀