# ADR-008: Embedded Context WASM Architecture

## Status
**Accepted** - 2024-12-15

## Context
The semantic lookup system from Kingly needs to be optimized for browser performance. We can package pre-computed embeddings directly into WASM for instant context lookup, while moving the dynamic semantic reasoning to an API layer for flexibility and performance.

## Problem Statement
- Need instant context lookup without API latency
- Semantic processing (LLM calls) should be separate from context retrieval
- Want controlled, curated context rather than dynamic document ingestion
- Must optimize for browser performance and offline capability

## Decision
**Implement Embedded Context WASM Architecture** with the following separation:

### Core Architecture Split
```yaml
context_architecture:
  wasm_embedded:
    purpose: "Instant context lookup and retrieval"
    contents:
      - pre_computed_embeddings
      - context_definitions
      - workflow_patterns
      - framework_knowledge
    performance: "sub_millisecond_lookup"
    
  api_layer:
    purpose: "Dynamic semantic reasoning and LLM processing"
    contents:
      - embedding_generation
      - semantic_search
      - context_expansion
      - llm_reasoning
    performance: "200ms_typical_response"
```

### WASM Context Bundle Structure
```typescript
interface WASMContextBundle {
  // Pre-computed embeddings as binary data
  embeddings: Float32Array;          // Dense embedding vectors
  embeddingIndex: Uint32Array;       // Fast lookup index
  
  // Context definitions
  contexts: ContextDefinition[];     // YAML context definitions
  patterns: PatternLibrary;          // Workflow patterns
  frameworks: FrameworkKnowledge;    // Framework-specific knowledge
  
  // Lookup tables
  contextHash: Map<string, number>;  // String → embedding index
  similarityIndex: KDTree;           // Fast similarity search
}

class WASMContextLookup {
  constructor(private bundle: WASMContextBundle) {
    // Initialize fast lookup structures in WASM memory
    this.initializeLookupTables();
  }
  
  // Instant context retrieval (sub-millisecond)
  findContext(contextId: string): ContextDefinition | null {
    const index = this.bundle.contextHash.get(contextId);
    return index !== undefined ? this.bundle.contexts[index] : null;
  }
  
  // Fast similarity search without LLM
  findSimilarContexts(
    targetEmbedding: Float32Array, 
    topK: number = 5
  ): ContextMatch[] {
    return this.bundle.similarityIndex.query(targetEmbedding, topK);
  }
}
```

## Pre-Computed Embedding Strategy

### Curated Context Collection
```yaml
embedded_contexts:
  framework_contexts:
    - nextjs_14_patterns
    - react_18_best_practices
    - tailwind_design_system
    - shadcn_component_library
    
  workflow_contexts:
    - bmad_methodology
    - development_workflows
    - deployment_patterns
    - testing_strategies
    
  domain_contexts:
    - ecommerce_patterns
    - saas_dashboard_patterns
    - marketing_site_patterns
    - blog_platform_patterns
    
  tool_contexts:
    - github_integration
    - vercel_deployment
    - stripe_payment
    - auth0_authentication
```

### Embedding Generation Pipeline
```typescript
// Build-time embedding generation
class EmbeddingBundleBuilder {
  async buildContextBundle(): Promise<WASMContextBundle> {
    // 1. Collect all curated contexts
    const contexts = await this.collectCuratedContexts();
    
    // 2. Generate embeddings via API (build-time only)
    const embeddings = await this.generateEmbeddings(contexts);
    
    // 3. Create fast lookup structures
    const lookupIndex = this.buildLookupIndex(contexts, embeddings);
    
    // 4. Package into binary format for WASM
    return this.packageForWASM({
      contexts,
      embeddings,
      lookupIndex
    });
  }
  
  private async generateEmbeddings(
    contexts: ContextDefinition[]
  ): Promise<Float32Array[]> {
    // Use OpenAI embedding API during build
    const embeddings = [];
    
    for (const context of contexts) {
      const text = this.contextToText(context);
      const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      });
      
      embeddings.push(new Float32Array(embedding.data[0].embedding));
    }
    
    return embeddings;
  }
}
```

### WASM Binary Format
```c
// WASM-optimized binary format
typedef struct {
    uint32_t context_count;
    uint32_t embedding_dimension;
    
    // Embedding data (context_count * embedding_dimension floats)
    float* embeddings;
    
    // Context definitions (serialized YAML/JSON)
    uint32_t context_data_size;
    char* context_data;
    
    // Fast lookup hash table
    uint32_t hash_table_size;
    HashEntry* hash_table;
    
    // KD-tree for similarity search
    KDTreeNode* similarity_tree;
} ContextBundle;

// Fast lookup functions compiled to WASM
int find_context_by_id(ContextBundle* bundle, const char* context_id);
int* find_similar_contexts(ContextBundle* bundle, float* query_embedding, int top_k);
float calculate_similarity(float* embedding_a, float* embedding_b, int dimension);
```

## API Layer Semantic Processing

### Dynamic Semantic API
```typescript
interface SemanticAPI {
  // Dynamic context expansion
  expandContext(
    baseContext: ContextDefinition,
    userInput: string
  ): Promise<ExpandedContext>;
  
  // Semantic reasoning over contexts
  reasonAboutContext(
    availableContexts: ContextDefinition[],
    problemDescription: string
  ): Promise<ContextRecommendation>;
  
  // Generate new embeddings for user content
  generateEmbedding(content: string): Promise<Float32Array>;
  
  // Complex semantic search
  semanticSearch(
    query: string,
    contextDomain: string
  ): Promise<SemanticSearchResult>;
}

class SemanticAPIClient {
  async expandContext(
    baseContext: ContextDefinition,
    userInput: string
  ): Promise<ExpandedContext> {
    
    // Call API for LLM-powered expansion
    const response = await this.apiClient.post('/semantic/expand', {
      context: baseContext,
      userInput,
      expansionType: 'requirements_driven'
    });
    
    return {
      baseContext,
      expandedRequirements: response.requirements,
      suggestedPatterns: response.patterns,
      additionalContexts: response.relatedContexts
    };
  }
}
```

### Hybrid Lookup Strategy
```typescript
class HybridContextSystem {
  constructor(
    private wasmLookup: WASMContextLookup,
    private semanticAPI: SemanticAPIClient
  ) {}
  
  async findRelevantContexts(
    userInput: string,
    domain?: string
  ): Promise<ContextResult> {
    
    // Step 1: Fast WASM lookup for exact matches
    const exactMatches = this.wasmLookup.findContextsByDomain(domain);
    
    if (exactMatches.length > 0) {
      return {
        source: 'wasm_exact',
        contexts: exactMatches,
        confidence: 1.0,
        latency: '<1ms'
      };
    }
    
    // Step 2: Generate embedding for semantic search
    const queryEmbedding = await this.semanticAPI.generateEmbedding(userInput);
    
    // Step 3: Fast WASM similarity search
    const similarContexts = this.wasmLookup.findSimilarContexts(queryEmbedding, 10);
    
    if (similarContexts.length > 0) {
      return {
        source: 'wasm_similarity',
        contexts: similarContexts,
        confidence: 0.8,
        latency: '<50ms'
      };
    }
    
    // Step 4: Fallback to API semantic reasoning
    return this.semanticAPI.semanticSearch(userInput, domain);
  }
}
```

## Framework-Specific Context Bundles

### Modular WASM Bundles
```yaml
wasm_bundle_strategy:
  core_bundle:
    size: "2MB"
    contents:
      - universal_patterns
      - bmad_methodology
      - common_workflows
    load_priority: "immediate"
    
  framework_bundles:
    nextjs_bundle:
      size: "1MB"
      contents:
        - nextjs_patterns
        - react_patterns
        - vercel_integration
      load_strategy: "on_demand"
      
    ecommerce_bundle:
      size: "800KB"
      contents:
        - ecommerce_patterns
        - payment_integration
        - inventory_management
      load_strategy: "conditional"
```

### Dynamic Bundle Loading
```typescript
class ContextBundleManager {
  private loadedBundles = new Map<string, WASMContextBundle>();
  private coreBundle: WASMContextBundle;
  
  async loadCoreBundle(): Promise<void> {
    const wasmModule = await WebAssembly.instantiateStreaming(
      fetch('./bundles/core-contexts.wasm')
    );
    
    this.coreBundle = new WASMContextBundle(wasmModule);
  }
  
  async loadFrameworkBundle(framework: string): Promise<WASMContextBundle> {
    if (this.loadedBundles.has(framework)) {
      return this.loadedBundles.get(framework)!;
    }
    
    const wasmModule = await WebAssembly.instantiateStreaming(
      fetch(`./bundles/${framework}-contexts.wasm`)
    );
    
    const bundle = new WASMContextBundle(wasmModule);
    this.loadedBundles.set(framework, bundle);
    
    return bundle;
  }
  
  async findContext(
    contextId: string,
    framework?: string
  ): Promise<ContextDefinition | null> {
    
    // Check core bundle first
    let context = this.coreBundle.findContext(contextId);
    if (context) return context;
    
    // Check framework-specific bundle
    if (framework) {
      const frameworkBundle = await this.loadFrameworkBundle(framework);
      context = frameworkBundle.findContext(contextId);
      if (context) return context;
    }
    
    return null;
  }
}
```

## Performance Optimization

### WASM Memory Layout
```c
// Optimized memory layout for cache efficiency
typedef struct {
    // Hot data: frequently accessed contexts
    ContextDefinition* hot_contexts;
    uint32_t hot_count;
    
    // Cold data: rarely accessed contexts  
    ContextDefinition* cold_contexts;
    uint32_t cold_count;
    
    // Embedding data aligned for SIMD operations
    __attribute__((aligned(32))) float* embeddings;
    
    // Hash table with linear probing
    HashEntry* hash_table;
    uint32_t hash_mask;  // Power of 2 minus 1 for fast modulo
} OptimizedContextBundle;

// SIMD-optimized similarity calculation
float simd_dot_product(const float* a, const float* b, int dimension) {
    // Use WebAssembly SIMD instructions for 4x speedup
    // Implementation would use WASM SIMD intrinsics
}
```

### Caching Strategy
```typescript
class ContextCache {
  private lruCache = new Map<string, ContextDefinition>();
  private maxSize = 1000;
  
  async getContext(contextId: string): Promise<ContextDefinition | null> {
    // Check L1 cache (JavaScript Map)
    if (this.lruCache.has(contextId)) {
      return this.lruCache.get(contextId)!;
    }
    
    // Check L2 cache (WASM bundle)
    const context = await this.wasmBundle.findContext(contextId);
    
    if (context) {
      // Add to L1 cache with LRU eviction
      this.addToCache(contextId, context);
      return context;
    }
    
    return null;
  }
}
```

## Build Pipeline

### Context Bundle Generation
```bash
#!/bin/bash
# build-context-bundles.sh

# Step 1: Collect and curate contexts
node scripts/collect-contexts.js

# Step 2: Generate embeddings via API
OPENAI_API_KEY=$OPENAI_API_KEY node scripts/generate-embeddings.js

# Step 3: Compile to WASM
emcc -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS='["_find_context", "_find_similar", "_calculate_similarity"]' \
  -s SIMD=1 \
  -o public/bundles/core-contexts.wasm \
  src/wasm/context-bundle.c

# Step 4: Generate TypeScript bindings
node scripts/generate-wasm-bindings.js

echo "Context bundles built successfully!"
```

## Implementation Roadmap

### Phase 1: Core WASM Bundle (Week 1)
```bash
# Create core context collection
# Implement embedding generation pipeline
# Build basic WASM lookup functions
```

### Phase 2: Hybrid System (Week 2)
```bash
# Implement API layer for semantic processing
# Create hybrid lookup strategy
# Add framework-specific bundles
```

### Phase 3: Optimization (Week 3)
```bash
# SIMD optimization for similarity search
# Dynamic bundle loading
# Caching and performance tuning
```

### Phase 4: Integration (Week 4)
```bash
# Integrate with agent coordination system
# Connect to ACI.dev tool resolution
# Production performance optimization
```

## Success Criteria

### Performance Metrics
- **Context Lookup**: <1ms for exact matches
- **Similarity Search**: <10ms for top-10 similar contexts
- **Bundle Size**: <5MB total for all framework bundles
- **Cold Start**: <100ms to initialize core bundle

### Quality Metrics
- **Context Coverage**: >95% of common development patterns
- **Relevance**: >90% context recommendations rated as helpful
- **Offline Capability**: 100% context lookup works offline

## Alternatives Considered

### 1. Full Runtime Embedding Generation
- **Pros**: Dynamic, flexible, always current
- **Cons**: Slow, requires constant API access, expensive
- **Rejected**: Performance and cost concerns

### 2. IndexedDB Context Storage
- **Pros**: Flexible, easy to update, no WASM complexity
- **Cons**: Slower lookup, no SIMD optimization, larger memory footprint
- **Rejected**: Performance requirements

### 3. Server-Side Context API
- **Pros**: Unlimited storage, powerful processing
- **Cons**: Latency, requires internet, scaling costs
- **Rejected**: Local-first requirement

## Notes
- WASM bundles enable sub-millisecond context lookup
- API layer provides flexibility for complex semantic reasoning
- Modular bundle loading optimizes initial load time
- SIMD optimization crucial for similarity search performance

## References
- [WebAssembly SIMD Proposal](https://github.com/WebAssembly/simd)
- [Efficient Embedding Storage Formats](https://arxiv.org/abs/2103.06391)
- [WASM Memory Layout Optimization](https://hacks.mozilla.org/category/webassembly/)