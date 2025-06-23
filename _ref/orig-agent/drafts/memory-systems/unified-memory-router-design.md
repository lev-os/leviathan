# 🧠 Unified Memory Router Design for Kingly

*LLM-first memory routing where the LLM determines memory types and context drives adapter selection*

## 🎯 **Core LLM-First Principles**

1. **LLM Determines Memory Type** - During handoff, the LLM specifies what type of memory (working, episodic, procedural, semantic)
2. **Context Drives Configuration** - Each context.yaml specifies which adapters to use for each memory type
3. **Workflow-Aware Inference** - When LLM doesn't specify, infer from workflow phase
4. **No Algorithmic Routing** - No regex, no pattern matching, just LLM intent and context config

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Kingly Memory Router                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Context    │  │    Query    │  │Performance  │        │
│  │  Analyzer    │  │ Classifier  │  │  Monitor    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │   Router     │                          │
│                    │   Engine     │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
├───────────────────────────┴─────────────────────────────────┤
│                     Memory Adapters                          │
├─────────────┬──────────────┬──────────────┬────────────────┤
│   Local     │  MCP-Memory  │ Memento MCP  │     Mem0       │
│  (SQLite)   │  (Pattern)   │   (Graph)    │  (Accuracy)    │
└─────────────┴──────────────┴──────────────┴────────────────┘
```

## 🔄 **LLM-First Router Implementation**

### **Core Router Class**
```javascript
// src/domain/memory/unified-memory-router.js
export class UnifiedMemoryRouter {
  constructor(config) {
    this.adapters = new Map();
    this.contextConfig = config.contextConfig;
    this.workspaceConfig = config.workspaceConfig;
    
    // Initialize adapters based on context configuration
    this.initializeAdapters();
  }
  
  async initializeAdapters() {
    // Always have local for fallback
    this.adapters.set('local', new SQLiteMemoryAdapter({
      dbPath: '.kingly/memory/local.db'
    }));
    
    // Initialize adapters based on workspace config
    const memoryConfig = this.workspaceConfig.memory_systems || {};
    
    for (const [memoryType, adapterConfig] of Object.entries(memoryConfig)) {
      if (adapterConfig.enabled) {
        const adapter = await this.createAdapter(adapterConfig);
        this.adapters.set(adapterConfig.provider, adapter);
      }
    }
  }
  
  async route(operation, params) {
    // LLM-FIRST: The LLM has already told us the memory type during handoff
    const memoryIntent = params.memoryIntent || this.inferMemoryIntent(params);
    
    // Get adapter configuration for this memory type from context
    const adapterConfig = this.getAdapterForMemoryType(
      memoryIntent.type,
      memoryIntent.context
    );
    
    // Execute with appropriate adapter
    return await this.executeWithAdapter(operation, params, adapterConfig);
  }
  
  inferMemoryIntent(params) {
    // If LLM didn't provide explicit intent, infer from workflow context
    const workflowPhase = params.context?.workflowPhase || 'general';
    const taskType = params.context?.taskType || 'unknown';
    
    // Context-aware inference based on workflow
    if (workflowPhase === 'planning') {
      return { 
        type: 'semantic',
        confidence: 0.8,
        reason: 'Planning phase typically needs semantic memory'
      };
    }
    
    if (workflowPhase === 'active_task') {
      return {
        type: 'working',
        confidence: 0.9,
        reason: 'Active tasks use working memory'
      };
    }
    
    if (taskType === 'pattern_learning') {
      return {
        type: 'procedural',
        confidence: 0.85,
        reason: 'Pattern learning stores to procedural memory'
      };
    }
    
    // Default to episodic for general interactions
    return {
      type: 'episodic',
      confidence: 0.6,
      reason: 'Default for general interactions'
    };
  }
  
  getAdapterForMemoryType(memoryType, context) {
    // Check context-specific configuration first
    const contextMemoryConfig = this.contextConfig.memory_routing?.[memoryType];
    
    if (contextMemoryConfig) {
      return {
        primary: contextMemoryConfig.primary_adapter,
        fallback: contextMemoryConfig.fallback_adapter || 'local',
        options: contextMemoryConfig.options || {}
      };
    }
    
    // Fall back to workspace defaults
    const workspaceDefaults = this.workspaceConfig.memory_defaults?.[memoryType];
    
    if (workspaceDefaults) {
      return {
        primary: workspaceDefaults.adapter,
        fallback: 'local',
        options: workspaceDefaults.options || {}
      };
    }
    
    // Ultimate fallback
    return {
      primary: 'local',
      fallback: 'local',
      options: {}
    };
  }
  
  async executeWithAdapters(operation, params, adapters) {
    const results = {
      primary: null,
      parallel: [],
      metadata: {
        adaptersUsed: [],
        latency: {},
        fallbackUsed: false
      }
    };
    
    // Execute primary adapter
    try {
      const start = Date.now();
      const primaryAdapter = this.adapters.get(adapters.primary);
      
      results.primary = await primaryAdapter[operation](params);
      results.metadata.adaptersUsed.push(adapters.primary);
      results.metadata.latency[adapters.primary] = Date.now() - start;
      
    } catch (error) {
      console.warn(`Primary adapter ${adapters.primary} failed:`, error);
      
      // Fallback execution
      const fallbackAdapter = this.adapters.get(adapters.fallback);
      results.primary = await fallbackAdapter[operation](params);
      results.metadata.fallbackUsed = true;
      results.metadata.adaptersUsed.push(adapters.fallback);
    }
    
    // Parallel execution for enhanced results
    if (adapters.parallel.length > 0) {
      const parallelPromises = adapters.parallel.map(async (adapterName) => {
        try {
          const adapter = this.adapters.get(adapterName);
          const start = Date.now();
          const result = await adapter[operation](params);
          
          return {
            adapter: adapterName,
            result,
            latency: Date.now() - start
          };
        } catch (error) {
          console.warn(`Parallel adapter ${adapterName} failed:`, error);
          return null;
        }
      });
      
      const parallelResults = await Promise.all(parallelPromises);
      results.parallel = parallelResults.filter(r => r !== null);
    }
    
    // Merge results if multiple adapters used
    if (results.parallel.length > 0) {
      return this.mergeResults(results);
    }
    
    return results.primary;
  }
  
  mergeResults(results) {
    // LLM-first result merging
    const merged = {
      ...results.primary,
      enrichments: {},
      confidence: results.primary.confidence || 0.5
    };
    
    // Enhance with parallel results
    for (const parallel of results.parallel) {
      if (parallel.adapter === 'memento' && parallel.result.relationships) {
        merged.enrichments.relationships = parallel.result.relationships;
      }
      
      if (parallel.adapter === 'mem0' && parallel.result.confidence) {
        // Boost confidence if mem0 agrees
        merged.confidence = Math.min(1.0, merged.confidence + 0.2);
      }
      
      if (parallel.adapter === 'mcp-memory' && parallel.result.patterns) {
        merged.enrichments.patterns = parallel.result.patterns;
      }
    }
    
    merged.metadata = results.metadata;
    return merged;
  }
}

```

## 🧠 **LLM-First Memory Handoff**

### **LLM Provides Memory Intent During Handoff**
```javascript
// Example LLM handoff with memory intent
{
  userResponse: "I'll store that authentication pattern for future use",
  
  handoff: {
    action: "store_memory",
    
    // LLM DETERMINES THE MEMORY TYPE
    memoryIntent: {
      type: "procedural",  // LLM knows this is a how-to pattern
      confidence: 0.9,
      reasoning: "Authentication pattern is reusable knowledge",
      characteristics: {
        reusability: "high",
        temporal: "long_term",
        domain: "security"
      }
    },
    
    content: {
      pattern: "JWT authentication flow",
      steps: ["validate", "decode", "verify"],
      context: "backend_api"
    },
    
    // Additional routing hints from LLM
    routingHints: {
      needsRelationships: true,  // Should link to other auth patterns
      crossProject: false,       // Project-specific
      performance: "balanced"    // Not time-critical
    }
  }
}
```

### **Context Configuration for Memory Types**
```yaml
# contexts/agents/dev/context.yaml
memory_routing:
  working:
    primary_adapter: "local"  # Fast for active tasks
    fallback_adapter: "local"
    options:
      ttl: 1800  # 30 minutes
      max_items: 50
      
  episodic:
    primary_adapter: "mcp-memory"  # Good for interactions
    fallback_adapter: "local"
    options:
      retention_days: 7
      importance_threshold: 0.3
      
  procedural:
    primary_adapter: "memento"  # Graph for relationships
    fallback_adapter: "mcp-memory"
    options:
      enable_patterns: true
      min_confidence: 0.7
      
  semantic:
    primary_adapter: "mem0"  # Highest accuracy
    fallback_adapter: "memento"
    options:
      embedding_model: "text-embedding-3-large"
      similarity_threshold: 0.8

# Workspace configuration
# .kingly/workspace.yaml
memory_defaults:
  working:
    adapter: "local"
    ttl: 3600
    
  episodic:
    adapter: "mcp-memory"
    retention: "7d"
    
  procedural:
    adapter: "memento"
    confidence_decay: 0.95
    
  semantic:
    adapter: "mem0"
    accuracy_mode: "high"

```

## 🔌 **Adapter Interfaces**

### **Base Memory Adapter**
```javascript
// src/domain/memory/adapters/base-adapter.js
export class BaseMemoryAdapter {
  constructor(config) {
    this.name = config.name;
    this.capabilities = new Set(config.capabilities || []);
    this.config = config;
  }
  
  // Core operations - must be implemented
  async store(key, value, metadata = {}) {
    throw new Error('Not implemented');
  }
  
  async retrieve(key, options = {}) {
    throw new Error('Not implemented');
  }
  
  async search(query, options = {}) {
    throw new Error('Not implemented');
  }
  
  async delete(key) {
    throw new Error('Not implemented');
  }
  
  // Extended operations - optional
  async findRelated(key, threshold = 0.7) {
    return [];
  }
  
  async getPatterns(options = {}) {
    return [];
  }
  
  async getRelationships(key, depth = 1) {
    return [];
  }
  
  // Health and metrics
  async health() {
    return { status: 'unknown' };
  }
  
  hasCapability(capability) {
    return this.capabilities.has(capability);
  }
}
```

### **MCP-Memory Adapter**
```javascript
// src/domain/memory/adapters/mcp-memory-adapter.js
export class MCPMemoryAdapter extends BaseMemoryAdapter {
  constructor(config) {
    super({
      name: 'mcp-memory',
      capabilities: ['patterns', 'cross_project', 'mcp_native', 'proactive'],
      ...config
    });
    
    this.mcpClient = new MCPClient(config.endpoint);
  }
  
  async store(key, value, metadata = {}) {
    // Use MCP-Memory's memory_add tool
    const result = await this.mcpClient.call('memory_add', {
      content: JSON.stringify({ key, value, metadata }),
      metadata: {
        project: metadata.project || 'kingly',
        type: metadata.type || 'general',
        timestamp: Date.now()
      }
    });
    
    return result.memory_id;
  }
  
  async search(query, options = {}) {
    // Use MCP-Memory's memory_search tool
    const results = await this.mcpClient.call('memory_search', {
      query,
      limit: options.limit || 10,
      threshold: options.threshold || 0.7,
      filter: options.filter
    });
    
    // Transform to unified format
    return results.memories.map(m => ({
      key: m.metadata.key,
      value: JSON.parse(m.content).value,
      score: m.score,
      metadata: m.metadata
    }));
  }
  
  async getPatterns(options = {}) {
    // Use MCP-Memory's pattern learning
    const patterns = await this.mcpClient.call('memory_get_patterns', {
      project: options.project || 'kingly',
      min_occurrences: options.minOccurrences || 3
    });
    
    return patterns;
  }
}
```

## 🎯 **LLM-First Usage Examples**

### **LLM-Driven Memory Storage**
```javascript
// Initialize router with context and workspace config
const router = new UnifiedMemoryRouter({
  contextConfig: await loadContext('contexts/agents/dev/context.yaml'),
  workspaceConfig: await loadWorkspace('.kingly/workspace.yaml')
});

// LLM has already determined this is procedural memory
await router.route('store', {
  key: 'auth_pattern_jwt',
  value: authenticationPattern,
  
  // LLM provides memory intent
  memoryIntent: {
    type: 'procedural',
    confidence: 0.9,
    reasoning: 'Reusable authentication pattern',
    characteristics: {
      reusability: 'high',
      domain: 'security'
    }
  },
  
  // LLM routing hints
  routingHints: {
    needsRelationships: true,
    performance: 'balanced'
  }
});

// Search with LLM-provided intent
const results = await router.route('search', {
  query: 'How do we handle JWT refresh tokens?',
  
  memoryIntent: {
    type: 'procedural',  // LLM knows we need how-to knowledge
    confidence: 0.85
  },
  
  context: {
    workflowPhase: 'implementation',
    taskType: 'security_implementation'
  }
});
```

### **Workflow-Aware Memory Operations**
```javascript
// During planning phase - semantic memory preferred
await router.route('store', {
  key: 'project_requirements',
  value: requirementsDoc,
  
  context: {
    workflowPhase: 'planning',  // Router infers semantic memory
    project: 'auth_system'
  }
  // No explicit memoryIntent - router infers from workflow
});

// During active task - working memory used
await router.route('store', {
  key: 'current_task_state',
  value: taskProgress,
  
  context: {
    workflowPhase: 'active_task',  // Router uses working memory
    taskId: 'auth_impl_001'
  }
});

// Pattern learning - procedural memory
await router.route('store', {
  key: 'error_resolution_pattern',
  value: solutionPattern,
  
  context: {
    taskType: 'pattern_learning',  // Router selects procedural
    confidence: 0.9
  }
});
```

### **Context-Driven Adapter Selection**
```javascript
// CEO context prefers different adapters
const ceoRouter = new UnifiedMemoryRouter({
  contextConfig: await loadContext('contexts/agents/ceo/context.yaml'),
  workspaceConfig: workspaceConfig
});

// CEO's semantic memory might use a different provider
// configured in their context.yaml
await ceoRouter.route('search', {
  query: 'Strategic decisions about authentication',
  
  memoryIntent: {
    type: 'semantic',
    confidence: 0.9
  }
  // Uses CEO context's configured semantic adapter
});

// Developer context optimizes for speed
const devRouter = new UnifiedMemoryRouter({
  contextConfig: await loadContext('contexts/agents/dev/context.yaml'),
  workspaceConfig: workspaceConfig  
});

// Dev context might prefer local for working memory
await devRouter.route('store', {
  key: 'debug_trace',
  value: debugInfo,
  
  memoryIntent: {
    type: 'working',
    confidence: 0.95
  }
  // Uses dev context's fast local adapter
});
```

## 🔄 **Integration with Kingly**

### **Memory-Enhanced Confidence Assessment**
```javascript
// In workspace-service.js
async assessTaskConfidence(taskDescription) {
  // Search for similar tasks across all memory systems
  const similarTasks = await this.memoryRouter.route('search', {
    query: `tasks similar to: ${taskDescription}`,
    semantic: true,
    includePatterns: true,
    context: { 
      mode: 'pattern_search',
      accuracy: 0.8 
    }
  });
  
  // Base confidence from task analysis
  let confidence = 0.5;
  
  // Boost from successful similar tasks
  if (similarTasks.length > 0) {
    const successRate = similarTasks.filter(t => 
      t.metadata?.status === 'completed'
    ).length / similarTasks.length;
    
    confidence += successRate * 0.3;
  }
  
  // Boost from recognized patterns
  if (similarTasks.enrichments?.patterns) {
    confidence += 0.1;
  }
  
  // Store assessment for future learning
  await this.memoryRouter.route('store', {
    key: `confidence_${Date.now()}`,
    value: { task: taskDescription, confidence, factors: {...} },
    metadata: { type: 'confidence_assessment' }
  });
  
  return confidence;
}
```

### **Working Memory Context**
```javascript
// Maintain working memory across operations
class WorkingMemoryContext {
  constructor(memoryRouter) {
    this.router = memoryRouter;
    this.contextId = generateId();
  }
  
  async addToContext(item) {
    await this.router.route('store', {
      key: `working_${this.contextId}_${Date.now()}`,
      value: item,
      metadata: {
        type: 'working_memory',
        context: this.contextId,
        ttl: 30 * 60 * 1000 // 30 minutes
      },
      context: { mode: 'fast' } // Use local for speed
    });
  }
  
  async getContext() {
    return await this.router.route('search', {
      query: `context:${this.contextId}`,
      filter: { type: 'working_memory' },
      context: { mode: 'fast' }
    });
  }
}
```

## 📊 **Performance Optimization**

### **Caching Layer**
```javascript
export class CachedMemoryRouter extends UnifiedMemoryRouter {
  constructor(config) {
    super(config);
    this.cache = new LRUCache({
      max: 1000,
      ttl: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  async route(operation, params) {
    if (operation === 'retrieve' || operation === 'search') {
      const cacheKey = this.getCacheKey(operation, params);
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }
    
    const result = await super.route(operation, params);
    
    // Cache successful results
    if (result && (operation === 'retrieve' || operation === 'search')) {
      const cacheKey = this.getCacheKey(operation, params);
      this.cache.set(cacheKey, result);
    }
    
    return result;
  }
}
```

## 🚀 **Benefits of Unified Router**

1. **Seamless Integration** - Single interface for all memory systems
2. **Intelligent Routing** - Automatically selects best system for each query
3. **Graceful Degradation** - Falls back to local when remote systems fail
4. **Performance Optimization** - Routes based on latency requirements
5. **Context Awareness** - Adapts to environment and use case
6. **Future Proof** - Easy to add new memory systems

This unified router enables Kingly to leverage the best features of each memory system while maintaining a consistent, LLM-first interface.