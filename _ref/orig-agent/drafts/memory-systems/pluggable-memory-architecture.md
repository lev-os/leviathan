# Pluggable Memory Architecture for Universal Context System

## 🧠 Memory Type Classifications

### **Memory Types by Use Case**
```yaml
working_memory:
  purpose: "Active task context, temporary state"
  ttl: "30 minutes to 2 hours"
  characteristics: "Fast access, ephemeral, session-bound"
  use_cases: ["active_conversations", "current_task_context", "agent_handoffs"]

episodic_memory:
  purpose: "Event sequences, project history, user interactions"
  ttl: "7 days to 6 months"
  characteristics: "Temporal, searchable, relationship-aware"
  use_cases: ["project_timeline", "user_behavior_patterns", "debugging_trails"]

procedural_memory:
  purpose: "How-to knowledge, workflow patterns, success strategies"
  ttl: "Months to years"
  characteristics: "Pattern-based, reusable, confidence-scored"
  use_cases: ["deployment_procedures", "problem_solving_patterns", "optimization_strategies"]

semantic_memory:
  purpose: "Facts, relationships, domain knowledge"
  ttl: "Persistent with updates"
  characteristics: "Graph-like, searchable, version-aware"
  use_cases: ["business_rules", "technical_specifications", "entity_relationships"]

context_memory:
  purpose: "Environment state, configuration, preferences"
  ttl: "Persistent until changed"
  characteristics: "Hierarchical, inheritable, context-specific"
  use_cases: ["user_preferences", "environment_config", "agent_capabilities"]
```

## 🔌 Memory Adapter Interface

### **Universal Memory Adapter Contract**
```javascript
class MemoryAdapter {
  constructor(config) {
    this.type = config.type; // working|episodic|procedural|semantic|context
    this.environment = config.environment; // embedded|edge|cloud|hybrid
    this.capabilities = config.capabilities; // [read, write, search, graph, vector]
  }

  // Core Operations
  async store(key, value, metadata = {}) {}
  async retrieve(key, context = {}) {}
  async search(query, options = {}) {}
  async delete(key) {}
  
  // Memory-Specific Operations
  async findRelated(key, similarity = 0.7) {}
  async getByTimeRange(start, end) {}
  async consolidate(keys) {} // Merge related memories
  async decay(factor = 0.1) {} // Age-based importance decay
  
  // Health & Metrics
  async health() {}
  async stats() {}
  getCapabilities() { return this.capabilities; }
}
```

### **Adapter Implementations by Environment**

#### **Embedded/Edge Systems**
```javascript
class FileSystemMemoryAdapter extends MemoryAdapter {
  constructor(config) {
    super({
      ...config,
      capabilities: ['read', 'write', 'search']
    });
    this.basePath = config.basePath || './.kingly/memory';
  }

  async store(key, value, metadata) {
    const filePath = this.getFilePath(key, metadata.type);
    const record = {
      key,
      value,
      metadata: {
        ...metadata,
        created: Date.now(),
        environment: 'embedded'
      }
    };
    await fs.writeFile(filePath, JSON.stringify(record));
  }

  async search(query, options) {
    // Use ripgrep for fast file-based search
    const results = await this.ripgrepSearch(query, options);
    return this.parseResults(results);
  }
}

class SQLiteMemoryAdapter extends MemoryAdapter {
  constructor(config) {
    super({
      ...config,
      capabilities: ['read', 'write', 'search', 'graph']
    });
    this.db = new Database(config.dbPath || ':memory:');
    this.setupSchema();
  }

  setupSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        key TEXT PRIMARY KEY,
        value TEXT,
        type TEXT,
        created INTEGER,
        expires INTEGER,
        importance REAL,
        metadata JSON
      );
      CREATE INDEX IF NOT EXISTS idx_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_created ON memories(created);
      CREATE INDEX IF NOT EXISTS idx_importance ON memories(importance);
    `);
  }
}
```

#### **Cloud/Scalable Systems**
```javascript
class RedisMemoryAdapter extends MemoryAdapter {
  constructor(config) {
    super({
      ...config,
      capabilities: ['read', 'write', 'search', 'vector']
    });
    this.redis = new Redis(config.redis);
  }

  async store(key, value, metadata) {
    const record = JSON.stringify({ value, metadata });
    
    // Store with TTL based on memory type
    const ttl = this.getTTL(metadata.type);
    await this.redis.setex(key, ttl, record);
    
    // Add to indices for fast lookup
    await this.updateIndices(key, metadata);
  }

  async findRelated(key, similarity = 0.7) {
    // Use Redis vector similarity if available
    // Or fall back to tag-based similarity
    return this.vectorSearch(key, similarity);
  }
}

class Neo4jMemoryAdapter extends MemoryAdapter {
  constructor(config) {
    super({
      ...config,
      capabilities: ['read', 'write', 'search', 'graph', 'vector']
    });
    this.driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
  }

  async store(key, value, metadata) {
    const session = this.driver.session();
    try {
      await session.run(`
        MERGE (m:Memory {key: $key})
        SET m.value = $value,
            m.type = $type,
            m.created = timestamp(),
            m.metadata = $metadata
      `, { key, value, type: metadata.type, metadata });
    } finally {
      await session.close();
    }
  }

  async findRelated(key, similarity = 0.7) {
    // Powerful graph traversal queries
    const session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (m:Memory {key: $key})-[r:RELATES_TO]-(related:Memory)
        WHERE r.strength >= $similarity
        RETURN related
        ORDER BY r.strength DESC
      `, { key, similarity });
      return result.records.map(r => r.get('related'));
    } finally {
      await session.close();
    }
  }
}
```

## 🎯 Context-Driven Memory Routing

### **Memory Router Configuration**
```yaml
# contexts/memory/routing.yaml
memory_routing:
  default_strategy: "performance_first"
  
  rules:
    # Environment-based routing
    embedded_systems:
      working_memory: "filesystem"
      episodic_memory: "sqlite"
      procedural_memory: "filesystem"
      semantic_memory: "sqlite"
      context_memory: "filesystem"
      
    edge_computing:
      working_memory: "redis_local"
      episodic_memory: "sqlite"
      procedural_memory: "sqlite"
      semantic_memory: "neo4j_embedded"
      context_memory: "filesystem"
      
    cloud_native:
      working_memory: "redis_cluster"
      episodic_memory: "postgresql"
      procedural_memory: "neo4j"
      semantic_memory: "vector_db"
      context_memory: "redis_cluster"
      
    hybrid_cloud:
      working_memory: "redis_local"
      episodic_memory: "sync_to_cloud"
      procedural_memory: "replicated"
      semantic_memory: "federated"
      context_memory: "filesystem_sync"

  # Use case specific routing
  context_overrides:
    high_security:
      all_memory_types: "local_only"
      encryption: "required"
      
    research_mode:
      semantic_memory: "vector_db"
      episodic_memory: "graph_db"
      search_priority: "semantic_first"
      
    rapid_prototyping:
      all_memory_types: "in_memory"
      persistence: "optional"
      
    production_deployment:
      working_memory: "redis_ha"
      persistence: "required"
      backup: "automated"
```

### **Smart Memory Router**
```javascript
class MemoryRouter {
  constructor(config) {
    this.adapters = new Map();
    this.routing = config.routing;
    this.environment = config.environment;
    this.loadAdapters();
  }

  async getAdapter(memoryType, context = {}) {
    // Context-driven adapter selection
    const strategy = this.selectStrategy(context);
    const adapterType = strategy[memoryType] || this.routing.default_strategy[memoryType];
    
    return this.adapters.get(adapterType);
  }

  selectStrategy(context) {
    // Check for context overrides
    if (context.security_level === 'high') {
      return this.routing.context_overrides.high_security;
    }
    
    if (context.mode === 'research') {
      return this.routing.context_overrides.research_mode;
    }
    
    // Default to environment-based routing
    return this.routing.rules[this.environment];
  }

  async store(memoryType, key, value, context = {}) {
    const adapter = await this.getAdapter(memoryType, context);
    return adapter.store(key, value, { type: memoryType, ...context });
  }

  async retrieve(memoryType, key, context = {}) {
    const adapter = await this.getAdapter(memoryType, context);
    return adapter.retrieve(key, context);
  }

  // Intelligent fallback and replication
  async storeWithFallback(memoryType, key, value, context = {}) {
    const primaryAdapter = await this.getAdapter(memoryType, context);
    
    try {
      await primaryAdapter.store(key, value, context);
    } catch (error) {
      // Fall back to filesystem for reliability
      const fallbackAdapter = this.adapters.get('filesystem');
      await fallbackAdapter.store(key, value, { ...context, fallback: true });
      throw new Error(`Primary storage failed, saved to fallback: ${error.message}`);
    }
  }
}
```

## 📦 Plugin System Architecture

### **Memory Provider Plugin Interface**
```javascript
class MemoryProviderPlugin {
  constructor() {
    this.name = '';
    this.version = '';
    this.capabilities = [];
    this.supportedEnvironments = [];
  }

  // Plugin lifecycle
  async initialize(config) {}
  async cleanup() {}
  
  // Factory method
  createAdapter(config) {
    return new this.AdapterClass(config);
  }
  
  // Plugin metadata
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      capabilities: this.capabilities,
      environments: this.supportedEnvironments
    };
  }
}

// Example custom plugin
class CustomVectorDBPlugin extends MemoryProviderPlugin {
  constructor() {
    super();
    this.name = 'custom-vector-db';
    this.version = '1.0.0';
    this.capabilities = ['read', 'write', 'vector', 'search'];
    this.supportedEnvironments = ['cloud', 'hybrid'];
  }

  createAdapter(config) {
    return new CustomVectorDBAdapter(config);
  }
}
```

### **Plugin Registry & Loading**
```javascript
class MemoryPluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.loadBuiltinPlugins();
  }

  loadBuiltinPlugins() {
    // Core adapters always available
    this.register(new FileSystemPlugin());
    this.register(new SQLitePlugin());
    this.register(new RedisPlugin());
    this.register(new Neo4jPlugin());
  }

  register(plugin) {
    this.plugins.set(plugin.name, plugin);
  }

  async loadFromDirectory(pluginDir) {
    const pluginFiles = await fs.readdir(pluginDir);
    
    for (const file of pluginFiles) {
      if (file.endsWith('.js') || file.endsWith('.mjs')) {
        const pluginModule = await import(path.join(pluginDir, file));
        const plugin = new pluginModule.default();
        this.register(plugin);
      }
    }
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins(environment = null) {
    const plugins = Array.from(this.plugins.values());
    
    if (environment) {
      return plugins.filter(p => p.supportedEnvironments.includes(environment));
    }
    
    return plugins;
  }
}
```

## 🌍 Environment-Specific Configurations

### **Configuration Templates**
```yaml
# Embedded IoT Device
embedded_iot:
  environment: "embedded"
  constraints:
    memory_limit: "64MB"
    storage_limit: "512MB" 
    cpu_cores: 1
  
  memory_config:
    working_memory:
      adapter: "in_memory"
      max_size: "8MB"
      ttl: 1800
    
    episodic_memory:
      adapter: "sqlite"
      db_path: "./memory.db"
      max_size: "32MB"
    
    procedural_memory:
      adapter: "filesystem"
      path: "./procedures"
      compression: true
    
    semantic_memory:
      adapter: "sqlite"
      fts_enabled: true
      
    context_memory:
      adapter: "filesystem"
      path: "./contexts"

# Edge Computing Node  
edge_computing:
  environment: "edge"
  constraints:
    memory_limit: "2GB"
    storage_limit: "100GB"
    network: "intermittent"
  
  memory_config:
    working_memory:
      adapter: "redis_local"
      persistence: false
    
    episodic_memory:
      adapter: "postgresql"
      local_cache: true
      sync_strategy: "eventual"
    
    procedural_memory:
      adapter: "neo4j_embedded"
      
    semantic_memory:
      adapter: "vector_db_local"
      
    context_memory:
      adapter: "redis_local"
      backup_to_disk: true

# Cloud Native
cloud_native:
  environment: "cloud"
  constraints:
    memory_limit: "unlimited"
    storage_limit: "unlimited"
    network: "high_bandwidth"
  
  memory_config:
    working_memory:
      adapter: "redis_cluster"
      nodes: 3
      replication: true
    
    episodic_memory:
      adapter: "postgresql_cluster"
      sharding: true
      
    procedural_memory:
      adapter: "neo4j_cluster"
      
    semantic_memory:
      adapter: "vector_db_managed"
      provider: "pinecone" # or weaviate, qdrant
      
    context_memory:
      adapter: "redis_cluster"
      persistence: true
```

## 🎯 Integration with Universal Context System

### **Context-Aware Memory Selection**
```yaml
# contexts/agents/ceo/context.yaml
agent_context:
  type: "agent"
  role: "ceo"
  
  memory_requirements:
    working_memory:
      size: "large" # More context for strategic decisions
      ttl: "4_hours" # Longer sessions
      
    semantic_memory:
      priority: "high" # Need business relationship understanding
      capabilities: ["graph", "vector"]
      
    procedural_memory:
      focus: ["strategic_planning", "delegation_patterns"]
      
  memory_routing:
    override_strategy: "intelligence_first"
    fallback_strategy: "reliability_first"
```

### **Dynamic Memory Scaling**
```javascript
class MemoryScaler {
  async scaleForContext(context, currentLoad) {
    if (context.type === 'agent' && context.role === 'ceo') {
      // CEO needs more semantic memory for strategic decisions
      return this.scaleSemanticMemory(currentLoad * 2);
    }
    
    if (context.urgency === 'high') {
      // High urgency needs faster working memory
      return this.optimizeForSpeed();
    }
    
    if (context.mode === 'research') {
      // Research mode needs more search capabilities
      return this.enableAdvancedSearch();
    }
  }
}
```

This pluggable architecture enables Kingly to:
- Run on IoT devices with 64MB RAM using filesystem adapters
- Scale to cloud deployments with distributed Neo4j clusters  
- Let developers create custom memory providers for specialized use cases
- Automatically adapt memory strategies based on context and environment
- Maintain consistent API regardless of underlying storage

The context system decides what memory to use, when, and how - making memory truly adaptive to the universal context architecture.