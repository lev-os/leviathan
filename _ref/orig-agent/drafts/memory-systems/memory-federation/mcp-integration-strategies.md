# 🔗 MEMORY-MCP INTEGRATION GUIDE

*Practical implementation guide for integrating memory systems with Kingly's MCP architecture and advanced reasoning techniques*

## 📋 **INTEGRATION OVERVIEW**

This guide details how to integrate PathRAG, Neural Graffiti, Zep, and OpenMemory with Kingly's existing:
- **MCP-based tool architecture**
- **8 advanced reasoning techniques** (CoT, ToT, GoT, etc.)
- **Workflow-driven intelligence system**
- **Context assembly engine**

## 🏗️ **UNIFIED MEMORY INTERFACE**

### Core MCP Tools for Memory Operations
```javascript
// src/mcp-memory-tools.js
const memoryTools = [
  {
    name: "memory_store",
    description: "Store a memory in the appropriate system based on type and requirements",
    parameters: {
      memory_type: "working|episodic|semantic|procedural",
      content: "Memory content to store",
      metadata: {
        confidence: "0.0-1.0",
        significance: "0.0-1.0",
        context_id: "Associated context",
        technique_id: "Associated reasoning technique"
      },
      routing_hints: {
        latency_requirement: "realtime|standard|batch",
        accuracy_requirement: "high|medium|low",
        privacy_requirement: "local|cloud_ok"
      }
    }
  },
  
  {
    name: "memory_retrieve",
    description: "Retrieve memories based on query and filters",
    parameters: {
      query: "Semantic search query",
      filters: {
        memory_type: "working|episodic|semantic|procedural",
        time_range: "ISO8601 range",
        context_id: "Specific context",
        confidence_min: "0.0-1.0"
      },
      routing_strategy: "accuracy|speed|balanced"
    }
  },
  
  {
    name: "memory_connect",
    description: "Create relationships between memories (for graph-based systems)",
    parameters: {
      source_memory_id: "Memory ID",
      target_memory_id: "Memory ID",
      relationship_type: "caused_by|leads_to|contradicts|supports|relates_to",
      strength: "0.0-1.0"
    }
  },
  
  {
    name: "memory_evolve",
    description: "Trigger memory evolution/compression",
    parameters: {
      memory_ids: ["Array of memory IDs"],
      evolution_type: "compress|generalize|merge|extract_pattern"
    }
  }
];
```

### Memory Router Implementation
```javascript
// src/adapters/memory-router.js
class MemoryRouter {
  constructor() {
    this.systems = {
      pathrag: new PathRAGAdapter(),
      neural_graffiti: new NeuralGraffitiAdapter(),
      zep: new ZepAdapter(),
      openmemory: new OpenMemoryAdapter()
    };
  }
  
  async route(operation, params) {
    // Determine best system based on requirements
    const system = this.selectSystem(operation, params);
    
    // Execute with fallback
    try {
      return await this.systems[system][operation](params);
    } catch (error) {
      const fallback = this.getFallbackSystem(system, operation);
      return await this.systems[fallback][operation](params);
    }
  }
  
  selectSystem(operation, params) {
    const { routing_hints, memory_type } = params;
    
    // Real-time working memory → Neural Graffiti
    if (memory_type === 'working' && routing_hints?.latency_requirement === 'realtime') {
      return 'neural_graffiti';
    }
    
    // Complex reasoning → PathRAG
    if (params.technique_id && ['graph_of_thoughts', 'tree_of_thoughts'].includes(params.technique_id)) {
      return 'pathrag';
    }
    
    // Temporal/enterprise → Zep
    if (memory_type === 'episodic' && routing_hints?.accuracy_requirement === 'high') {
      return 'zep';
    }
    
    // Privacy-first → OpenMemory
    if (routing_hints?.privacy_requirement === 'local') {
      return 'openmemory';
    }
    
    // Default routing by operation type
    return this.getDefaultSystem(operation, memory_type);
  }
}
```

## 🧠 **TECHNIQUE-MEMORY INTEGRATION**

### Chain of Thought + Memory
```javascript
// Integration with CoT reasoning
const chainOfThoughtWithMemory = {
  name: "execute_chain_of_thought_with_memory",
  handler: async (params) => {
    const { problem, context_id } = params;
    
    // 1. Retrieve relevant semantic memories
    const memories = await memoryRouter.route('retrieve', {
      query: problem,
      filters: { memory_type: 'semantic', context_id },
      routing_strategy: 'accuracy'
    });
    
    // 2. Execute CoT with memory context
    const steps = [];
    for (let i = 0; i < params.max_steps; i++) {
      const step = await llm.complete({
        prompt: `${problem}\nRelevant knowledge: ${memories}\nStep ${i+1}:`,
        technique: 'chain_of_thought'
      });
      
      steps.push(step);
      
      // 3. Store significant reasoning steps
      if (step.confidence > 0.8) {
        await memoryRouter.route('store', {
          memory_type: 'procedural',
          content: { step, problem, solution_partial: steps },
          metadata: { technique_id: 'chain_of_thought', confidence: step.confidence }
        });
      }
    }
    
    return { steps, memories_used: memories.length };
  }
};
```

### Tree of Thoughts + Memory
```javascript
// Integration with ToT reasoning  
const treeOfThoughtsWithMemory = {
  name: "execute_tree_of_thoughts_with_memory",
  handler: async (params) => {
    const { problem, branches = 5, depth = 3 } = params;
    
    // 1. Check for similar problems in memory
    const similar = await memoryRouter.route('retrieve', {
      query: `problems similar to: ${problem}`,
      filters: { memory_type: 'procedural', technique_id: 'tree_of_thoughts' },
      routing_strategy: 'balanced'
    });
    
    // 2. Use PathRAG for tree structure storage
    const tree = { root: problem, branches: [] };
    
    // Build tree with memory-informed pruning
    for (let b = 0; b < branches; b++) {
      const branch = await exploreBranch(problem, similar);
      
      // Store promising branches in graph structure
      if (branch.promise > 0.7) {
        const branchId = await memoryRouter.route('store', {
          memory_type: 'semantic',
          content: branch,
          routing_hints: { system_preference: 'pathrag' }
        });
        
        // Create graph relationships
        await memoryRouter.route('connect', {
          source_memory_id: tree.root_id,
          target_memory_id: branchId,
          relationship_type: 'leads_to',
          strength: branch.promise
        });
      }
    }
    
    return tree;
  }
};
```

### Graph of Thoughts + Memory
```javascript
// Natural fit with PathRAG's graph structure
const graphOfThoughtsWithMemory = {
  name: "execute_graph_of_thoughts_with_memory",
  handler: async (params) => {
    const { problem, max_nodes = 50 } = params;
    
    // 1. GraphRAG is native to PathRAG - use directly
    const graphSystem = memoryRouter.systems.pathrag;
    
    // 2. Build thought graph with automatic persistence
    const graph = await graphSystem.buildThoughtGraph({
      seed: problem,
      expansion_strategy: 'semantic_similarity',
      max_nodes,
      auto_persist: true
    });
    
    // 3. Run graph algorithms for insight extraction
    const insights = await graphSystem.extractInsights({
      graph_id: graph.id,
      algorithms: ['pagerank', 'community_detection', 'path_analysis']
    });
    
    // 4. Store high-value insights
    for (const insight of insights.filter(i => i.significance > 0.8)) {
      await memoryRouter.route('store', {
        memory_type: 'semantic',
        content: insight,
        metadata: { 
          technique_id: 'graph_of_thoughts',
          graph_id: graph.id,
          algorithm: insight.algorithm
        }
      });
    }
    
    return { graph, insights };
  }
};
```

### Self-Reflection + Memory
```javascript
// Integration with Neural Graffiti for adaptation
const selfReflectionWithMemory = {
  name: "execute_self_reflection_with_memory",
  handler: async (params) => {
    const { output, criteria, max_iterations = 3 } = params;
    
    // 1. Use Neural Graffiti for real-time adaptation
    const adaptiveSystem = memoryRouter.systems.neural_graffiti;
    
    let current = output;
    const iterations = [];
    
    for (let i = 0; i < max_iterations; i++) {
      // 2. Critique with personality drift
      const critique = await adaptiveSystem.critiqueWithDrift({
        content: current,
        criteria,
        iteration: i
      });
      
      // 3. Store critique in working memory
      await adaptiveSystem.updateWorkingMemory({
        critique,
        confidence: critique.confidence,
        drift_vector: critique.personality_drift
      });
      
      // 4. Revise based on critique + drift
      current = await llm.revise({
        original: current,
        critique: critique.feedback,
        memory_context: await adaptiveSystem.getWorkingMemory()
      });
      
      iterations.push({ critique, revised: current });
      
      if (critique.satisfaction > 0.9) break;
    }
    
    // 5. Extract learned patterns
    const pattern = await adaptiveSystem.extractAdaptationPattern(iterations);
    if (pattern.significance > 0.7) {
      await memoryRouter.route('store', {
        memory_type: 'procedural',
        content: pattern,
        metadata: { technique_id: 'self_reflection' }
      });
    }
    
    return { final: current, iterations, pattern };
  }
};
```

## 🔄 **WORKFLOW INTEGRATION**

### Memory-Aware Workflow Execution
```yaml
# workflows/memory-enhanced-execution.yaml
name: memory_enhanced_workflow
description: Execute any workflow with memory integration

stages:
  - name: memory_context_loading
    steps:
      - tool: memory_retrieve
        params:
          query: "{{workflow.description}}"
          filters:
            memory_type: ["semantic", "procedural"]
            context_id: "{{workflow.context}}"
        output: relevant_memories
        
  - name: execution_with_memory
    steps:
      - tool: "{{workflow.primary_tool}}"
        params:
          original_params: "{{workflow.params}}"
          memory_context: "{{relevant_memories}}"
        output: result
        
  - name: memory_capture
    steps:
      - tool: memory_store
        when: "{{result.significance}} > 0.7"
        params:
          memory_type: "episodic"
          content:
            workflow: "{{workflow.name}}"
            result: "{{result}}"
            timestamp: "{{now}}"
          metadata:
            significance: "{{result.significance}}"
            
  - name: pattern_extraction
    steps:
      - tool: memory_evolve
        when: "{{similar_workflows_count}} > 3"
        params:
          memory_ids: "{{similar_workflow_memories}}"
          evolution_type: "extract_pattern"
```

### Cross-Context Memory Bubbling
```javascript
// src/workflows/memory-bubbling.js
const memoryBubblingWorkflow = {
  name: "bubble_insights_across_contexts",
  
  async execute(insight, source_context) {
    // 1. Evaluate insight significance
    const significance = await evaluateInsightSignificance(insight);
    
    if (significance < 0.7) return;
    
    // 2. Find related contexts via memory graph
    const relatedContexts = await memoryRouter.route('retrieve', {
      query: `contexts related to: ${insight.domain}`,
      filters: { memory_type: 'semantic' },
      routing_hints: { system_preference: 'pathrag' } // Use graph connections
    });
    
    // 3. Adapt insight for each context
    for (const context of relatedContexts) {
      const adapted = await llm.adapt({
        insight,
        source_context,
        target_context: context,
        adaptation_guidance: await getContextAdaptationRules(context)
      });
      
      // 4. Store adapted insight with reference
      await memoryRouter.route('store', {
        memory_type: 'shared',
        content: {
          original_insight: insight.id,
          adapted_content: adapted,
          source_context,
          target_context: context.id
        },
        metadata: {
          adaptation_confidence: adapted.confidence,
          cross_context_link: true
        }
      });
      
      // 5. Notify target context
      await notifyContext(context, {
        type: 'insight_bubbled',
        source: source_context,
        insight: adapted
      });
    }
  }
};
```

## 🚀 **IMPLEMENTATION CHECKLIST**

### Week 1: Foundation
- [ ] Implement MemoryRouter class
- [ ] Create adapter interfaces for all 4 systems
- [ ] Build MCP tool handlers for memory operations
- [ ] Set up Docker containers for each system

### Week 2: Basic Integration
- [ ] Connect memory_store and memory_retrieve tools
- [ ] Implement routing logic based on requirements
- [ ] Add fallback mechanisms
- [ ] Create test harness for memory operations

### Week 3: Technique Integration
- [ ] Integrate with Chain of Thought
- [ ] Integrate with Tree of Thoughts  
- [ ] Integrate with Graph of Thoughts
- [ ] Test technique-memory combinations

### Week 4: Advanced Features
- [ ] Implement memory evolution/compression
- [ ] Add cross-context bubbling
- [ ] Enable memory-aware workflows
- [ ] Set up monitoring and analytics

## 🔧 **CONFIGURATION**

### System Configuration
```yaml
# config/memory-systems.yaml
memory_systems:
  pathrag:
    enabled: true
    deployment: docker
    config:
      graph_db: "neo4j"
      embedding_model: "sentence-transformers/all-MiniLM-L6-v2"
      max_graph_size: 1000000
      
  neural_graffiti:
    enabled: true
    deployment: native
    config:
      spray_layer_size: 512
      drift_rate: 0.01
      memory_window: 1000
      
  zep:
    enabled: true
    deployment: cloud  # or self-hosted
    config:
      api_key: "${ZEP_API_KEY}"
      collection: "kingly_memories"
      
  openmemory:
    enabled: true
    deployment: docker
    config:
      postgres_url: "postgresql://localhost:5432/memories"
      qdrant_url: "http://localhost:6333"
```

### Routing Rules
```yaml
# config/memory-routing.yaml
routing_rules:
  - name: "Graph reasoning preference"
    condition:
      technique: ["graph_of_thoughts", "tree_of_thoughts"]
    route_to: "pathrag"
    
  - name: "Real-time adaptation"
    condition:
      latency_requirement: "< 100ms"
      memory_type: "working"
    route_to: "neural_graffiti"
    
  - name: "Enterprise compliance"
    condition:
      compliance_required: true
    route_to: "zep"
    
  - name: "Privacy first"
    condition:
      privacy_requirement: "local_only"
    route_to: "openmemory"
```

## 📊 **MONITORING & OPTIMIZATION**

### Key Metrics to Track
```javascript
// src/monitoring/memory-metrics.js
const memoryMetrics = {
  // Performance metrics
  query_latency: histogram({
    name: 'memory_query_latency_ms',
    help: 'Memory query latency in milliseconds',
    labels: ['system', 'operation', 'memory_type']
  }),
  
  // Accuracy metrics  
  retrieval_relevance: gauge({
    name: 'memory_retrieval_relevance_score',
    help: 'Relevance score of retrieved memories',
    labels: ['system', 'query_type']
  }),
  
  // Usage metrics
  memory_operations: counter({
    name: 'memory_operations_total',
    help: 'Total memory operations',
    labels: ['system', 'operation', 'status']
  }),
  
  // Cost metrics
  system_cost: gauge({
    name: 'memory_system_cost_usd',
    help: 'Cost per memory system in USD',
    labels: ['system', 'resource_type']
  })
};
```

### Optimization Strategies
```yaml
optimization_strategies:
  caching:
    - Cache frequently accessed memories
    - Implement predictive pre-loading
    - Use Redis for hot memory cache
    
  routing:
    - A/B test routing strategies
    - Machine learning for route prediction
    - Dynamic threshold adjustment
    
  compression:
    - Automatic episodic → semantic compression
    - Deduplicate similar memories
    - Archive old memories to cold storage
```

---

*"The integration of memory systems with MCP tools and advanced reasoning techniques creates a multiplicative effect - each component enhances the others, leading to emergent intelligence that exceeds the sum of its parts."*