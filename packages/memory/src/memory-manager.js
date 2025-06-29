/**
 * Hybrid Memory Manager
 * Core implementation of tiered memory architecture combining file system + Graphiti via gRPC
 */

import { GraphitiGRPCClient } from './grpc-client.js';
import { ConfigManager } from './config/config-manager.js';
import { ServiceOrchestrator } from './config/service-orchestrator.js';

export class HybridMemoryManager {
  constructor(options = {}) {
    // Use new configuration system if no explicit options provided
    this.configManager = new ConfigManager();
    this.orchestrator = null;
    this.config = null;
    
    // Legacy support for direct options
    this.options = {
      neo4jUri: options.neo4jUri || "bolt://localhost:7687",
      neo4jUsername: options.neo4jUsername || "neo4j",
      neo4jPassword: options.neo4jPassword || "lev-mem123",
      grpcAddress: options.grpcAddress || "localhost:50051",
      sessionsPath: options.sessionsPath || "~/.kingly/sessions/",
      contextsPath: options.contextsPath || "./contexts/",
      enableGraphiti: options.enableGraphiti !== false,
      fallbackMode: false,
      useConfigSystem: options.useConfigSystem !== false,
      ...options
    };
    
    this.graphiti = null;
    this.fileSystem = null;
    this.memoryTypes = {};
  }

  async initialize() {
    try {
      // Load configuration using new system if enabled
      if (this.options.useConfigSystem) {
        console.log('🔧 Loading configuration...');
        this.config = await this.configManager.loadConfig();
        
        // Update options with config values
        this.options = {
          ...this.options,
          neo4jUri: this.config.neo4j.uri,
          neo4jUsername: this.config.neo4j.username,
          neo4jPassword: this.config.neo4j.password,
          grpcAddress: this.config.graphiti.grpcAddress,
          enableGraphiti: this.config.features.enableGraphiti,
          fallbackMode: this.config.features.fallbackMode
        };
        
        // Initialize service orchestrator
        this.orchestrator = new ServiceOrchestrator(this.config);
        
        console.log(`📋 Using ${this.config.deploymentMode} deployment mode`);
      }
      
      // Initialize Graphiti gRPC connection
      if (this.options.enableGraphiti) {
        this.graphiti = new GraphitiGRPCClient({
          serverAddress: this.options.grpcAddress,
          neo4jUri: this.options.neo4jUri,
          neo4jUsername: this.options.neo4jUsername,
          neo4jPassword: this.options.neo4jPassword
        });
        
        await this.graphiti.initialize();
        await this.graphiti.connect();
        
        console.log('✅ Graphiti gRPC client connected successfully');
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
    if (!this.graphiti || !this.graphiti.connected) return null;

    // Use gRPC client's hybrid search
    const options = {
      workspaceId: request.namespace,
      includeRelationships: !!request.relationshipQuery,
      includeTemporal: !!request.timeRange,
      limit: request.limit || 10,
      advanced: {
        context: request.context,
        temporal: request.timeRange
      }
    };

    return await this.graphiti.hybridSearch(request.query, options);
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
    if (!this.graphiti || !this.graphiti.connected) return;

    const metadata = {
      file_id: file.path,
      size: file.size,
      modified: file.modified,
      path: file.path
    };

    await this.graphiti.createMemory(
      file.content,
      file.type || 'file',
      metadata
    );
  }

  // Health monitoring
  async getSystemStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      fallback_mode: this.options.fallbackMode,
      components: {
        graphiti: {
          connected: this.graphiti && this.graphiti.connected,
          uri: this.options.neo4jUri,
          grpc_address: this.options.grpcAddress,
          session_id: this.graphiti ? this.graphiti.sessionId : null
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
      await this.graphiti.disconnect();
    }
    
    for (const memoryType of Object.values(this.memoryTypes)) {
      if (memoryType.close) {
        await memoryType.close();
      }
    }
  }

  // Expose gRPC client methods for direct access
  async createMemory(content, type = 'general', metadata = {}) {
    if (this.graphiti && this.graphiti.connected) {
      return await this.graphiti.createMemory(content, type, metadata);
    }
    throw new Error('Graphiti not connected');
  }

  async searchMemory(query, limit = 10) {
    if (this.graphiti && this.graphiti.connected) {
      return await this.graphiti.searchMemory(query, limit);
    }
    throw new Error('Graphiti not connected');
  }

  async addEpisode(name, content, referenceTime = null, metadata = {}) {
    if (this.graphiti && this.graphiti.connected) {
      return await this.graphiti.addEpisode(name, content, referenceTime, null, metadata);
    }
    throw new Error('Graphiti not connected');
  }

  async createWorkspace(workspaceId, description = '') {
    if (this.graphiti && this.graphiti.connected) {
      return await this.graphiti.createWorkspace(workspaceId, description);
    }
    throw new Error('Graphiti not connected');
  }

  async switchWorkspace(workspaceId) {
    if (this.graphiti && this.graphiti.connected) {
      return await this.graphiti.switchWorkspace(workspaceId);
    }
    throw new Error('Graphiti not connected');
  }
}