/**
 * Batch Operations for Kingly Context System
 * Enables atomic multi-operation execution to avoid multiple round trips
 */

export class BatchOperations {
  constructor(contextLoader) {
    this.loader = contextLoader;
    this.transactionLog = [];
  }

  /**
   * Execute a batch of operations atomically
   * @param {Object} operations - Batch operation specification
   * @returns {Object} Results of all operations
   */
  async execute(operations) {
    const transaction = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      started: new Date().toISOString(),
      operations,
      results: {
        created: [],
        updated: [],
        relationships: [],
        queries: [],
        deleted: []
      },
      rollback: []
    };

    try {
      // Phase 1: Creates (needed for references)
      if (operations.creates) {
        await this.executeCreates(operations.creates, transaction);
      }

      // Phase 2: Updates (may reference created items)
      if (operations.updates) {
        await this.executeUpdates(operations.updates, transaction);
      }

      // Phase 3: Relationships (connects everything)
      if (operations.relationships) {
        await this.executeRelationships(operations.relationships, transaction);
      }

      // Phase 4: Queries (read operations)
      if (operations.queries) {
        await this.executeQueries(operations.queries, transaction);
      }

      // Phase 5: Deletes (cleanup last)
      if (operations.deletes) {
        await this.executeDeletes(operations.deletes, transaction);
      }

      // Success - commit transaction
      transaction.completed = new Date().toISOString();
      transaction.status = 'success';
      this.transactionLog.push(transaction);

      return {
        transactionId: transaction.id,
        results: transaction.results,
        status: 'success'
      };

    } catch (error) {
      // Rollback on failure
      await this.rollback(transaction);
      
      transaction.error = error.message;
      transaction.status = 'failed';
      this.transactionLog.push(transaction);

      throw new Error(`Batch operation failed: ${error.message}`);
    }
  }

  /**
   * Execute create operations
   * @param {Array} creates - Array of create operations
   * @param {Object} transaction - Transaction context
   */
  async executeCreates(creates, transaction) {
    for (let i = 0; i < creates.length; i++) {
      const createOp = creates[i];
      
      // Resolve parent reference if needed
      let parentContext = null;
      if (createOp.parent) {
        parentContext = await this.resolveReference(createOp.parent, transaction);
      }

      // Create context
      const created = await this.loader.createContext(
        createOp.type,
        createOp.config || {},
        parentContext,
        createOp.options || {}
      );

      // Store result for references
      transaction.results.created.push({
        index: i,
        reference: `$creates[${i}]`,
        context: created
      });

      // Add to rollback log
      transaction.rollback.push({
        type: 'delete',
        contextId: created.id
      });
    }
  }

  /**
   * Execute update operations
   * @param {Array} updates - Array of update operations
   * @param {Object} transaction - Transaction context
   */
  async executeUpdates(updates, transaction) {
    for (const updateOp of updates) {
      // Resolve context reference
      const contextId = await this.resolveReference(updateOp.id || updateOp.contextId, transaction);
      const context = await this.loader.loadContextById(contextId);
      
      if (!context) {
        throw new Error(`Context '${contextId}' not found for update`);
      }

      // Store original state for rollback
      transaction.rollback.push({
        type: 'restore',
        contextId: context.id,
        originalState: JSON.parse(JSON.stringify(context))
      });

      // Apply updates
      Object.assign(context, updateOp.updates || updateOp.properties || {});
      context.updated = new Date().toISOString();

      // Save updated context
      await this.loader.saveContext(context);

      transaction.results.updated.push({
        contextId: context.id,
        updates: updateOp.updates || updateOp.properties
      });
    }
  }

  /**
   * Execute relationship operations
   * @param {Array} relationships - Array of relationship operations
   * @param {Object} transaction - Transaction context
   */
  async executeRelationships(relationships, transaction) {
    for (const relOp of relationships) {
      // Resolve source and target references
      const sourceId = await this.resolveReference(relOp.source, transaction);
      const targetId = await this.resolveReference(relOp.target, transaction);

      if (relOp.operation === 'remove') {
        // Remove relationship
        await this.loader.removeRelationship(sourceId, relOp.type, targetId);
        
        transaction.results.relationships.push({
          operation: 'remove',
          source: sourceId,
          type: relOp.type,
          target: targetId
        });

        // Add to rollback
        transaction.rollback.push({
          type: 'add_relationship',
          source: sourceId,
          relationshipType: relOp.type,
          target: targetId,
          properties: relOp.properties
        });
      } else {
        // Add relationship (default)
        const result = await this.loader.addRelationship(
          sourceId,
          relOp.type,
          targetId,
          relOp.properties || {}
        );

        transaction.results.relationships.push(result);

        // Add to rollback
        transaction.rollback.push({
          type: 'remove_relationship',
          source: sourceId,
          relationshipType: relOp.type,
          target: targetId
        });
      }
    }
  }

  /**
   * Execute query operations
   * @param {Array} queries - Array of query operations
   * @param {Object} transaction - Transaction context
   */
  async executeQueries(queries, transaction) {
    for (const queryOp of queries) {
      let result;

      switch (queryOp.type) {
        case 'get_relationships':
          const contextId = await this.resolveReference(queryOp.contextId, transaction);
          result = await this.loader.getRelationships(
            contextId,
            queryOp.relationshipType,
            queryOp.direction || 'both'
          );
          break;

        case 'graph_traversal':
          const startNodes = await this.resolveReferenceArray(queryOp.start || queryOp.startNodes, transaction);
          result = await this.loader.queryRelationshipGraph(
            startNodes,
            queryOp.follow || queryOp.relationshipTypes || [],
            queryOp.depth || 2
          );
          break;

        case 'find_by_type':
          result = await this.loader.listContexts(queryOp.contextType);
          break;

        case 'find_by_name':
          result = await this.loader.findContextByName(queryOp.contextType, queryOp.name);
          break;

        default:
          throw new Error(`Unknown query type: ${queryOp.type}`);
      }

      transaction.results.queries.push({
        type: queryOp.type,
        result
      });
    }
  }

  /**
   * Execute delete operations
   * @param {Array} deletes - Array of delete operations
   * @param {Object} transaction - Transaction context
   */
  async executeDeletes(deletes, transaction) {
    for (const deleteOp of deletes) {
      const contextId = await this.resolveReference(deleteOp.id || deleteOp.contextId, transaction);
      const context = await this.loader.loadContextById(contextId);
      
      if (!context) {
        throw new Error(`Context '${contextId}' not found for deletion`);
      }

      // Store for rollback
      transaction.rollback.push({
        type: 'recreate',
        context: JSON.parse(JSON.stringify(context))
      });

      // Delete file
      const fs = await import('fs/promises');
      await fs.unlink(context.storagePath);

      transaction.results.deleted.push({
        contextId: context.id,
        type: context.type
      });
    }
  }

  /**
   * Resolve a reference to an actual ID
   * @param {string} reference - Reference like "$creates[0]" or actual ID
   * @param {Object} transaction - Transaction context
   * @returns {string} Resolved ID
   */
  async resolveReference(reference, transaction) {
    if (typeof reference !== 'string') return reference;
    
    // Check if it's a reference to created items
    const createMatch = reference.match(/^\$creates?\[(\d+)\](?:\.(\w+))?$/);
    if (createMatch) {
      const index = parseInt(createMatch[1]);
      const property = createMatch[2] || 'id';
      
      if (index < transaction.results.created.length) {
        const created = transaction.results.created[index].context;
        return property === 'id' ? created.id : created[property];
      }
      throw new Error(`Invalid reference: ${reference}`);
    }

    // Check if it's a reference to results
    const resultMatch = reference.match(/^\$results\.(\w+)\[(\d+)\](?:\.(\w+))?$/);
    if (resultMatch) {
      const resultType = resultMatch[1];
      const index = parseInt(resultMatch[2]);
      const property = resultMatch[3] || 'id';
      
      if (transaction.results[resultType]?.[index]) {
        const result = transaction.results[resultType][index];
        return property === 'id' ? (result.contextId || result.id) : result[property];
      }
      throw new Error(`Invalid reference: ${reference}`);
    }

    // Otherwise assume it's an actual ID
    return reference;
  }

  /**
   * Resolve an array of references
   * @param {Array|string} references - Array of references or single reference
   * @param {Object} transaction - Transaction context
   * @returns {Array} Array of resolved IDs
   */
  async resolveReferenceArray(references, transaction) {
    if (!Array.isArray(references)) {
      references = [references];
    }
    
    const resolved = [];
    for (const ref of references) {
      resolved.push(await this.resolveReference(ref, transaction));
    }
    return resolved;
  }

  /**
   * Rollback a failed transaction
   * @param {Object} transaction - Transaction to rollback
   */
  async rollback(transaction) {
    console.log(`Rolling back transaction ${transaction.id}...`);
    
    // Execute rollback operations in reverse order
    for (let i = transaction.rollback.length - 1; i >= 0; i--) {
      const rollbackOp = transaction.rollback[i];
      
      try {
        switch (rollbackOp.type) {
          case 'delete':
            // Delete created context
            const context = await this.loader.loadContextById(rollbackOp.contextId);
            if (context) {
              const fs = await import('fs/promises');
              await fs.unlink(context.storagePath);
            }
            break;

          case 'restore':
            // Restore original state
            await this.loader.saveContext(rollbackOp.originalState);
            break;

          case 'remove_relationship':
            // Remove added relationship
            await this.loader.removeRelationship(
              rollbackOp.source,
              rollbackOp.relationshipType,
              rollbackOp.target
            );
            break;

          case 'add_relationship':
            // Re-add removed relationship
            await this.loader.addRelationship(
              rollbackOp.source,
              rollbackOp.relationshipType,
              rollbackOp.target,
              rollbackOp.properties
            );
            break;

          case 'recreate':
            // Recreate deleted context
            await this.loader.saveContext(rollbackOp.context);
            break;
        }
      } catch (error) {
        console.error(`Rollback operation failed: ${error.message}`);
        // Continue with other rollback operations
      }
    }
  }

  /**
   * Get transaction history
   * @param {number} limit - Number of transactions to return
   * @returns {Array} Recent transactions
   */
  getTransactionHistory(limit = 10) {
    return this.transactionLog.slice(-limit);
  }
}