/**
 * Memory Initializer - Core package integration for Memory System
 * Provides tight coupling between agent system and memory infrastructure
 * Part of Memory Core Package integration per PACKAGE_SCHEMA.md specification
 */

import { HybridMemoryManager } from '../../../../core/memory/src/memory-manager.js';

export class MemoryInitializer {
  constructor() {
    this.memoryManager = null;
    this.initialized = false;
  }

  /**
   * Initialize memory system with auto-configuration and service orchestration
   */
  async initializeMemory() {
    try {
      console.log('🧠 Initializing Memory Core Package...');

      // Create memory manager with auto-configuration enabled
      this.memoryManager = new HybridMemoryManager({
        useConfigSystem: true,
        enableGraphiti: true,
        fallbackMode: false
      });

      // Initialize memory system (auto-detects Neo4j, configures services)
      await this.memoryManager.initialize();

      // Verify memory system operational status
      const systemStatus = await this.memoryManager.getSystemStatus();
      
      console.log(`✅ Memory system initialized in ${systemStatus.fallback_mode ? 'fallback' : 'hybrid'} mode`);
      
      // Log component status quietly
      Object.entries(systemStatus.components).forEach(([component, status]) => {
        const statusIcon = this.getComponentStatusIcon(component, status);
        console.log(`   ${statusIcon} ${component}: ${this.getComponentStatusText(status)}`);
      });

      this.initialized = true;

      return {
        memoryManager: this.memoryManager,
        memoryInitialized: true,
        memoryStatus: systemStatus
      };

    } catch (error) {
      // Use quieter warning that doesn't alarm or confuse
      console.log(`ℹ️  Memory system using fallback mode (optional services unavailable)`);
      
      // Return null memory manager but don't fail agent initialization
      return {
        memoryManager: null,
        memoryInitialized: false,
        memoryError: error.message
      };
    }
  }

  /**
   * Get memory dependencies for command execution
   */
  getMemoryDependencies() {
    return {
      memoryManager: this.memoryManager,
      memoryInitialized: this.initialized
    };
  }

  /**
   * Create agent-scoped memory interface
   * Provides namespace isolation per agent instance
   */
  createAgentMemory(agentId, sessionId = null) {
    if (!this.memoryManager) {
      return new MockMemoryInterface(agentId);
    }

    return new AgentMemoryInterface(this.memoryManager, agentId, sessionId);
  }

  /**
   * Get system health and status
   */
  async getSystemHealth() {
    if (!this.memoryManager) {
      return {
        healthy: false,
        error: 'Memory system not initialized'
      };
    }

    try {
      const status = await this.memoryManager.getSystemStatus();
      return {
        healthy: !status.fallback_mode,
        status: status,
        mode: status.fallback_mode ? 'fallback' : 'hybrid'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup memory resources
   */
  async cleanup() {
    if (this.memoryManager) {
      await this.memoryManager.close();
      this.memoryManager = null;
      this.initialized = false;
    }
  }

  // Helper methods for status display
  getComponentStatusIcon(component, status) {
    switch (component) {
      case 'graphiti':
        return status.connected ? '🧠' : '💤';
      case 'file_system':
        return status.accessible ? '📁' : '❌';
      default:
        return '🔧';
    }
  }

  getComponentStatusText(status) {
    if (status.connected !== undefined) {
      return status.connected ? 'connected' : 'disconnected';
    }
    if (status.accessible !== undefined) {
      return status.accessible ? 'accessible' : 'inaccessible';
    }
    return 'unknown';
  }
}

/**
 * Agent-scoped memory interface providing namespace isolation
 * Automatically handles agent_id and session_id context injection
 */
class AgentMemoryInterface {
  constructor(memoryManager, agentId, sessionId = null) {
    this.memoryManager = memoryManager;
    this.agentId = agentId;
    this.sessionId = sessionId;
    this.namespace = `agent-${agentId}`;
  }

  // Convenience methods that auto-inject agent context
  async store(content, type = 'auto', metadata = {}) {
    const enhancedMetadata = {
      ...metadata,
      agent_id: this.agentId,
      session_id: this.sessionId,
      namespace: this.namespace
    };

    return await this.memoryManager.createMemory(content, type, enhancedMetadata);
  }

  async query(queryText, options = {}) {
    const queryRequest = {
      query: queryText,
      namespace: this.namespace,
      context: {
        agent_id: this.agentId,
        session_id: this.sessionId
      },
      ...options
    };

    return await this.memoryManager.query(queryRequest);
  }

  async retrieve(memoryId) {
    // Implementation would include namespace checking
    return await this.memoryManager.getMemoryById(memoryId, this.namespace);
  }

  // Memory type accessors with agent context
  get procedural() {
    return this.createTypeInterface('procedural');
  }

  get semantic() {
    return this.createTypeInterface('semantic');
  }

  get temporal() {
    return this.createTypeInterface('temporal');
  }

  get working() {
    return this.createTypeInterface('working');
  }

  get episodic() {
    return this.createTypeInterface('episodic');
  }

  createTypeInterface(type) {
    return {
      store: (content, metadata = {}) => this.store(content, type, metadata),
      query: (query, options = {}) => this.query(query, { ...options, type })
    };
  }
}

/**
 * Mock memory interface for when memory system is unavailable
 * Provides graceful degradation without breaking agent functionality
 */
class MockMemoryInterface {
  constructor(agentId) {
    this.agentId = agentId;
    this.mockStore = new Map();
  }

  async store(content, type = 'auto', metadata = {}) {
    const id = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.mockStore.set(id, { content, type, metadata, agentId: this.agentId });
    console.warn('📝 Memory stored in mock interface (memory system unavailable)');
    return { memory_id: id };
  }

  async query(queryText, options = {}) {
    console.warn('🔍 Memory query using mock interface (memory system unavailable)');
    return { 
      source: 'mock',
      merged: { items: [] },
      warning: 'Memory system unavailable'
    };
  }

  async retrieve(memoryId) {
    const item = this.mockStore.get(memoryId);
    if (item) {
      console.warn('📖 Memory retrieved from mock interface');
      return item;
    }
    throw new Error('Memory not found in mock store');
  }

  // Mock type interfaces
  get procedural() { return this.createMockTypeInterface('procedural'); }
  get semantic() { return this.createMockTypeInterface('semantic'); }
  get temporal() { return this.createMockTypeInterface('temporal'); }
  get working() { return this.createMockTypeInterface('working'); }
  get episodic() { return this.createMockTypeInterface('episodic'); }

  createMockTypeInterface(type) {
    return {
      store: (content, metadata = {}) => this.store(content, type, metadata),
      query: (query, options = {}) => this.query(query, { ...options, type })
    };
  }
}