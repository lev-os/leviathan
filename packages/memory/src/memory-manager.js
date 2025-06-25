/**
 * Hybrid Memory Manager
 * Core implementation of tiered memory architecture combining file system + Graphiti
 */

class HybridMemoryManager {
  constructor(options = {}) {
    this.options = {
      neo4jUri: options.neo4jUri || "bolt://localhost:7687",
      neo4jUsername: options.neo4jUsername || "neo4j",
      neo4jPassword: options.neo4jPassword || "lev-mem123",
      sessionsPath: options.sessionsPath || "~/.kingly/sessions/",
      contextsPath: options.contextsPath || "./contexts/",
      enableGraphiti: options.enableGraphiti !== false,
      fallbackMode: false,
      ...options
    };
    
    this.graphiti = null;
    this.fileSystem = null;
    this.memoryTypes = {};
    
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize Graphiti connection
      if (this.options.enableGraphiti) {
        const { GraphitiClient } = await import('graphiti-core');
        this.graphiti = new GraphitiClient({
          neo4j_uri: this.options.neo4jUri,
          neo4j_username: this.options.neo4jUsername,
          neo4j_password: this.options.neo4jPassword,
          enable_mcp: true,
          enable_temporal: true
        });
        await this.graphiti.connect();
      }
      
      // Initialize file system manager
      this.fileSystem = new FileSystemManager(this.options);
      
      // Initialize memory types
      this.memoryTypes = {
        procedural: new ProceduralMemory(this),
        semantic: new SemanticMemory(this),
        temporal: new TemporalMemory(this),
        working: new WorkingMemory(this),
        episodic: new EpisodicMemory(this)
      };
      
    } catch (error) {
      console.warn('Graphiti initialization failed, enabling fallback mode:', error.message);
      this.options.fallbackMode = true;
      this.graphiti = null;
    }
  }

  // Unified memory query interface
  async query(request) {
    try {
      if (this.graphiti && !this.options.fallbackMode) {
        return await this.hybridQuery(request);
      } else {
        return await this.fileOnlyQuery(request);
      }
    } catch (error) {
      console.warn('Hybrid query failed, falling back to file-only:', error.message);
      return await this.fileOnlyQuery(request);
    }
  }

  // Hybrid query combining Graphiti + files
  async hybridQuery(request) {
    const results = {
      source: 'hybrid',
      graphiti: null,
      files: null,
      merged: null
    };

    // Parallel execution for performance
    const [graphitiResults, fileResults] = await Promise.all([
      this.queryGraphiti(request).catch(err => {
        console.warn('Graphiti query failed:', err.message);
        return null;
      }),
      this.queryFiles(request)
    ]);

    results.graphiti = graphitiResults;
    results.files = fileResults;
    results.merged = this.mergeResults(graphitiResults, fileResults, request);

    return results;
  }

  // File-only query for fallback mode
  async fileOnlyQuery(request) {
    const fileResults = await this.queryFiles(request);
    return {
      source: 'file_only',
      graphiti: null,
      files: fileResults,
      merged: fileResults
    };
  }

  // Query Graphiti with error handling
  async queryGraphiti(request) {
    if (!this.graphiti) return null;

    const graphitiQuery = {
      semantic: request.vectorQuery || request.query,
      graph: request.relationshipQuery,
      temporal: request.timeRange,
      context: request.context,
      namespace: request.namespace
    };

    return await this.graphiti.hybrid_query(graphitiQuery);
  }

  // Query file system
  async queryFiles(request) {
    return await this.fileSystem.search(request);
  }

  // Merge Graphiti and file results intelligently
  mergeResults(graphitiResults, fileResults, request) {
    if (!graphitiResults) return fileResults;
    if (!fileResults) return graphitiResults;

    // Combine results with Graphiti relationships enhancing file data
    const merged = {
      items: [...(fileResults.items || [])],
      relationships: graphitiResults.relationships || [],
      temporal_context: graphitiResults.temporal || null,
      semantic_scores: graphitiResults.scores || []
    };

    // Enhance file items with Graphiti metadata
    if (graphitiResults.items) {
      merged.items = this.enhanceWithGraphitiMetadata(
        merged.items, 
        graphitiResults.items
      );
    }

    return merged;
  }

  // Plugin access control
  createPluginMemory(pluginId) {
    if (this.isCorePlugin(pluginId)) {
      return new CorePluginMemory(this, pluginId);
    } else {
      return new RegularPluginMemory(this, pluginId);
    }
  }

  isCorePlugin(pluginId) {
    return ['memory', 'agent', 'codex'].includes(pluginId);
  }

  // Memory type access
  get procedural() { return this.memoryTypes.procedural; }
  get semantic() { return this.memoryTypes.semantic; }
  get temporal() { return this.memoryTypes.temporal; }
  get working() { return this.memoryTypes.working; }
  get episodic() { return this.memoryTypes.episodic; }

  // Sync operations
  async syncFilesToGraphiti(options = {}) {
    if (!this.graphiti) {
      console.warn('Cannot sync to Graphiti: not connected');
      return false;
    }

    try {
      const files = await this.fileSystem.getAllFiles(options.path);
      
      for (const file of files) {
        await this.indexFileInGraphiti(file);
      }
      
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  async indexFileInGraphiti(file) {
    if (!this.graphiti) return;

    const embeddings = await this.generateEmbeddings(file.content);
    const relationships = this.extractFileRelationships(file);

    await this.graphiti.create_memory({
      file_id: file.path,
      type: file.type || 'file',
      content: file.content,
      embeddings: embeddings,
      relationships: relationships,
      metadata: {
        size: file.size,
        modified: file.modified,
        path: file.path
      }
    });
  }

  // Health monitoring
  async getSystemStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      fallback_mode: this.options.fallbackMode,
      components: {
        graphiti: {
          connected: !!this.graphiti,
          uri: this.options.neo4jUri
        },
        file_system: {
          accessible: await this.fileSystem.isAccessible(),
          sessions_path: this.options.sessionsPath,
          contexts_path: this.options.contextsPath
        }
      },
      memory_types: {}
    };

    // Check each memory type
    for (const [type, instance] of Object.entries(this.memoryTypes)) {
      status.memory_types[type] = {
        initialized: !!instance,
        operational: await instance.isOperational()
      };
    }

    return status;
  }

  // Cleanup
  async close() {
    if (this.graphiti) {
      await this.graphiti.close();
    }
    
    for (const memoryType of Object.values(this.memoryTypes)) {
      if (memoryType.close) {
        await memoryType.close();
      }
    }
  }
}

module.exports = { HybridMemoryManager };