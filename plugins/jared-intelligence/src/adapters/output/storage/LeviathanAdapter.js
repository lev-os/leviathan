/**
 * LeviathanMemoryAdapter - Domain to Leviathan Memory System Adapter
 * Implements IMemoryPort interface for Leviathan integration
 */

import { IMemoryPort } from '../../../core/ports/IMemoryPort.js';

export class LeviathanMemoryAdapter extends IMemoryPort {
  constructor(levPlugin) {
    super();
    this.plugin = levPlugin;
  }

  /**
   * Store data in Leviathan memory system
   */
  async store(namespace, data) {
    // Transform domain data to Lev memory format
    const levData = {
      namespace: `jared.${namespace}`,
      type: this.inferMemoryType(data),
      content: data,
      timestamp: new Date(),
      metadata: {
        source: 'jared-intelligence',
        version: '1.0.0'
      }
    };
    
    // Store in Leviathan memory
    return await this.plugin.memory.store(levData);
  }  /**
   * Retrieve data from Leviathan memory system
   */
  async retrieve(namespace, query) {
    const levQuery = this.transformToLevQuery(namespace, query);
    const results = await this.plugin.memory.query(levQuery);
    return this.transformFromLevResults(results);
  }

  /**
   * Update existing memory entry
   */
  async update(namespace, id, updates) {
    const levId = this.transformToLevId(namespace, id);
    const levUpdates = {
      ...updates,
      lastModified: new Date(),
      modifiedBy: 'jared-intelligence'
    };
    
    return await this.plugin.memory.update(levId, levUpdates);
  }

  /**
   * Infer memory type from data structure
   */
  inferMemoryType(data) {
    if (data.conversationId) return 'conversation';
    if (data.projectId) return 'project';
    if (data.intelligenceType) return 'intelligence';
    if (data.workflow) return 'workflow';
    return 'general';
  }

  /**
   * Transform to Leviathan query format
   */
  transformToLevQuery(namespace, query) {
    return {
      namespace: `jared.${namespace}`,
      filters: query.filters || {},
      sort: query.sort || { timestamp: -1 },
      limit: query.limit || 100,
      offset: query.offset || 0
    };
  }

  /**
   * Transform Leviathan results to domain format
   */
  transformFromLevResults(results) {
    return results.map(item => ({
      id: item.id,
      namespace: item.namespace.replace('jared.', ''),
      type: item.type,
      content: item.content,
      timestamp: item.timestamp,
      metadata: item.metadata
    }));
  }

  /**
   * Transform to Leviathan ID format
   */
  transformToLevId(namespace, id) {
    return `jared.${namespace}.${id}`;
  }

  /**
   * Fractal composition - this adapter can contain other adapters
   */
  async storeWithReplication(namespace, data, replicationAdapters = []) {
    // Store in primary Leviathan memory
    const primaryId = await this.store(namespace, data);
    
    // Replicate to other adapters (fractal pattern)
    const replicationResults = await Promise.allSettled(
      replicationAdapters.map(adapter => adapter.store(namespace, data))
    );
    
    return {
      primary: primaryId,
      replications: replicationResults.map((result, index) => ({
        adapter: replicationAdapters[index].constructor.name,
        success: result.status === 'fulfilled',
        id: result.value || null,
        error: result.reason || null
      }))
    };
  }
}