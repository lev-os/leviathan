/**
 * gRPC Client for Leviathan Memory System
 * Connects Node.js to Python Graphiti service
 */

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GraphitiGRPCClient extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      serverAddress: options.serverAddress || 'localhost:50051',
      neo4jUri: options.neo4jUri || 'bolt://localhost:7687',
      neo4jUsername: options.neo4jUsername || 'neo4j',
      neo4jPassword: options.neo4jPassword || 'lev-mem123',
      ...options
    };
    
    this.client = null;
    this.connected = false;
    this.sessionId = null;
    this.currentWorkspace = 'default';
  }

  async initialize() {
    try {
      // Load proto file
      const protoPath = join(__dirname, '../graphiti-service/proto/memory.proto');
      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });

      const proto = grpc.loadPackageDefinition(packageDefinition);
      
      // Create gRPC client
      this.client = new proto.leviathan.memory.MemoryService(
        this.options.serverAddress,
        grpc.credentials.createInsecure()
      );

      console.log(`🔌 Initialized gRPC client for ${this.options.serverAddress}`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize gRPC client:', error.message);
      throw error;
    }
  }

  async connect() {
    if (!this.client) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const request = {
        neo4j_uri: this.options.neo4jUri,
        username: this.options.neo4jUsername,
        password: this.options.neo4jPassword,
        options: {}
      };

      this.client.Connect(request, (error, response) => {
        if (error) {
          console.error('❌ gRPC Connect failed:', error.message);
          reject(error);
          return;
        }

        if (response.success) {
          this.connected = true;
          this.sessionId = response.session_id;
          console.log(`✅ Connected to Graphiti via gRPC - Session: ${this.sessionId}`);
          this.emit('connected', { sessionId: this.sessionId });
          resolve(response);
        } else {
          console.error('❌ Graphiti connection failed:', response.message);
          reject(new Error(response.message));
        }
      });
    });
  }

  async disconnect() {
    if (!this.connected || !this.sessionId) {
      return { success: true, message: 'Already disconnected' };
    }

    return new Promise((resolve, reject) => {
      this.client.Disconnect({ session_id: this.sessionId }, (error, response) => {
        if (error) {
          console.error('❌ gRPC Disconnect failed:', error.message);
          reject(error);
          return;
        }

        this.connected = false;
        this.sessionId = null;
        console.log('🔌 Disconnected from Graphiti');
        this.emit('disconnected');
        resolve(response);
      });
    });
  }

  async healthCheck() {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    return new Promise((resolve, reject) => {
      this.client.HealthCheck({}, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  async createMemory(content, type = 'general', metadata = {}, workspaceId = null) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        content,
        type,
        metadata,
        workspace_id: workspaceId || this.currentWorkspace
      };

      this.client.CreateMemory(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`📝 Created memory: ${response.memory.id}`);
          resolve(response.memory);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async searchMemory(query, limit = 10, types = [], workspaceId = null) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        query,
        limit,
        types,
        workspace_id: workspaceId || this.currentWorkspace,
        filters: {}
      };

      this.client.SearchMemory(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`🔍 Found ${response.memories.length} memories for: "${query}"`);
          resolve(response.memories);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async addEpisode(name, content, referenceTime = null, workspaceId = null, metadata = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        name,
        content,
        reference_time: referenceTime || Date.now(),
        workspace_id: workspaceId || this.currentWorkspace,
        metadata
      };

      this.client.AddEpisode(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`🎬 Added episode: ${name} -> ${response.episode.id}`);
          resolve(response.episode);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async hybridSearch(query, options = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        query,
        workspace_id: options.workspaceId || this.currentWorkspace,
        include_relationships: options.includeRelationships || false,
        include_temporal: options.includeTemporal || false,
        limit: options.limit || 10,
        options: options.advanced || {}
      };

      this.client.HybridSearch(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`🔬 Hybrid search found ${response.memories.length} memories, ${response.episodes.length} episodes`);
          resolve({
            memories: response.memories,
            episodes: response.episodes,
            relationships: response.relationships
          });
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async createWorkspace(workspaceId, description = '', config = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        workspace_id: workspaceId,
        description,
        config
      };

      this.client.CreateWorkspace(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`🏢 Created workspace: ${workspaceId}`);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async switchWorkspace(workspaceId) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        workspace_id: workspaceId
      };

      this.client.SwitchWorkspace(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          this.currentWorkspace = workspaceId;
          console.log(`🔄 Switched workspace: ${response.previous_workspace} -> ${workspaceId}`);
          this.emit('workspace:changed', { 
            previous: response.previous_workspace, 
            current: workspaceId 
          });
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async listWorkspaces() {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      this.client.ListWorkspaces({}, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`📋 Found ${response.workspace_ids.length} workspaces`);
          resolve({
            workspaces: response.workspace_ids,
            descriptions: response.descriptions
          });
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Convenience methods that match the existing memory manager API
  async store(key, value, type = 'general') {
    const content = typeof value === 'string' ? value : JSON.stringify(value);
    return await this.createMemory(content, type, { key });
  }

  async retrieve(key) {
    const results = await this.searchMemory(key, 1);
    return results.length > 0 ? results[0] : null;
  }

  async search(query, limit = 10) {
    return await this.searchMemory(query, limit);
  }

  // Temporal memory methods
  async getTemporalContext(situation, includeRelated = true, limit = 10) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        situation,
        workspace_id: this.currentWorkspace,
        include_related: includeRelated,
        limit
      };

      this.client.GetTemporalContext(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          resolve({
            episodes: response.episodes,
            relationships: response.relationships
          });
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async findPatterns(contextType, minFrequency = 2, minConfidence = 0.5) {
    if (!this.connected) {
      throw new Error('Not connected to Graphiti service');
    }

    return new Promise((resolve, reject) => {
      const request = {
        context_type: contextType,
        workspace_id: this.currentWorkspace,
        min_frequency: minFrequency,
        min_confidence: minConfidence
      };

      this.client.FindPatterns(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.success) {
          console.log(`🔍 Found ${response.patterns.length} patterns`);
          resolve(response.patterns);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }
}