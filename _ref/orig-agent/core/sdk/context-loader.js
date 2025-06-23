/**
 * Universal Context Loader
 * Structure-agnostic YAML context system with cascading inheritance
 * Supports hierarchical, flat, mixed, and emergent organization patterns
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export class ContextLoader {
  constructor(contextRoot = './contexts', workspaceRoot = '.kingly') {
    this.contextRoot = contextRoot;      // OS-level templates (contexts/)
    this.workspaceRoot = workspaceRoot;  // User instances (.kingly/)
  }

  /**
   * Load context template for a given type
   * @param {string} contextType - Type of context (workspace, project, task)
   * @returns {Object} Parsed context template with structure config
   */
  async loadContextTemplate(contextType) {
    const templatePath = path.join(this.contextRoot, 'types', contextType, 'context.yaml');
    
    try {
      const yamlContent = await fs.readFile(templatePath, 'utf8');
      const contextTemplate = yaml.load(yamlContent);
      return contextTemplate;
    } catch (error) {
      throw new Error(`Failed to load context template for type '${contextType}': ${error.message}`);
    }
  }

  /**
   * Calculate storage path based on template structure config
   * @param {string} contextType - Type of context
   * @param {Object} config - Context configuration
   * @param {Object} parentContext - Parent context (for hierarchical)
   * @param {Object} template - Context template with structure config
   * @returns {string} Calculated storage path
   */
  calculateStoragePath(contextType, config, parentContext, template) {
    const structureConfig = template[`${contextType}_config`]?.structure_config || {};
    const storagePattern = structureConfig.storage_pattern || 'hierarchical';
    
    switch (storagePattern) {
      case 'hierarchical':
        return this.calculateHierarchicalPath(contextType, config, parentContext, structureConfig);
      
      case 'flat':
        return this.calculateFlatPath(contextType, config, structureConfig);
      
      case 'mixed':
        return this.calculateMixedPath(contextType, config, parentContext, structureConfig);
      
      case 'emergent':
        return this.calculateEmergentPath(contextType, config, parentContext, structureConfig);
      
      default:
        // Default to hierarchical if unknown pattern
        return this.calculateHierarchicalPath(contextType, config, parentContext, structureConfig);
    }
  }

  /**
   * Calculate hierarchical storage path (our main test case)
   * @param {string} contextType - Type of context
   * @param {Object} config - Context configuration  
   * @param {Object} parentContext - Parent context
   * @param {Object} structureConfig - Structure configuration from template
   * @returns {string} Hierarchical path
   */
  calculateHierarchicalPath(contextType, config, parentContext, structureConfig) {
    const pathTemplate = structureConfig.path_template || this.getDefaultPathTemplate(contextType);
    
    // Replace template variables
    let calculatedPath = pathTemplate
      .replace('{name}', config.name || `${contextType}-${Date.now()}`)
      .replace('{type}', contextType)
      .replace('{id}', config.id || `${contextType}-${Date.now()}`);

    // For hierarchical, build path relative to parent
    if (parentContext && parentContext.storagePath) {
      const parentDir = path.dirname(parentContext.storagePath);
      calculatedPath = path.join(parentDir, calculatedPath);
    } else {
      // Root level context
      calculatedPath = path.join(this.workspaceRoot, calculatedPath);
    }

    return path.join(calculatedPath, 'context.yaml');
  }

  /**
   * Calculate flat storage path
   * @param {string} contextType - Type of context
   * @param {Object} config - Context configuration
   * @param {Object} structureConfig - Structure configuration
   * @returns {string} Flat path
   */
  calculateFlatPath(contextType, config, structureConfig) {
    const pathTemplate = structureConfig.path_template || `${contextType}s/{name}.yaml`;
    
    const calculatedPath = pathTemplate
      .replace('{name}', config.name || `${contextType}-${Date.now()}`)
      .replace('{type}', contextType)
      .replace('{id}', config.id || `${contextType}-${Date.now()}`);

    return path.join(this.workspaceRoot, calculatedPath);
  }

  /**
   * Get default path template for context type
   * @param {string} contextType - Type of context
   * @returns {string} Default path template
   */
  getDefaultPathTemplate(contextType) {
    const defaults = {
      workspace: '{name}',
      project: 'projects/{name}',
      task: 'tasks/{name}',
      folder: 'folders/{name}',
      emergent: 'emergent/{name}'
    };
    
    return defaults[contextType] || `${contextType}s/{name}`;
  }

  /**
   * Apply context inheritance and create instance
   * @param {string} contextType - Type of context
   * @param {Object} config - Context configuration
   * @param {Object} parentContext - Parent context for inheritance
   * @returns {Object} Context instance with inheritance applied
   */
  async applyContextInheritance(contextType, config, parentContext = null) {
    // Load template
    const template = await this.loadContextTemplate(contextType);
    
    // Calculate storage path
    const storagePath = this.calculateStoragePath(contextType, config, parentContext, template);
    
    // Generate unique ID
    const contextId = config.id || `${contextType}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Build inheritance chain
    const inheritanceChain = await this.buildInheritanceChain(parentContext, template);
    
    // Create context instance with inheritance
    const contextInstance = {
      // Core identification
      type: contextType,
      id: contextId,
      
      // Storage information
      storagePath,
      
      // From template metadata
      template: template.metadata?.id || `${contextType}-template`,
      templateVersion: template.metadata?.version || '1.0.0',
      
      // User configuration
      ...config,
      
      // Inherited configuration (deep merge from chain)
      ...this.mergeInheritanceChain(inheritanceChain, template, contextType),
      
      // Parent relationship
      parentContext: parentContext ? {
        type: parentContext.type,
        id: parentContext.id,
        path: parentContext.storagePath
      } : null,
      
      // Timestamps
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      
      // Inheritance metadata
      inheritanceChain: inheritanceChain.map(ctx => ({
        type: ctx.type,
        id: ctx.id,
        template: ctx.template
      }))
    };
    
    return contextInstance;
  }

  /**
   * Build inheritance chain from parent contexts
   * @param {Object} parentContext - Parent context
   * @param {Object} template - Current context template
   * @returns {Array} Array of contexts in inheritance chain
   */
  async buildInheritanceChain(parentContext, template) {
    const chain = [];
    
    // Add template to chain
    chain.push({
      type: 'template',
      id: template.metadata?.id,
      template: template.metadata?.id,
      config: template
    });
    
    // Walk up parent chain
    let currentParent = parentContext;
    while (currentParent) {
      chain.push(currentParent);
      
      // Load parent's parent if it exists
      if (currentParent.parentContext) {
        currentParent = await this.loadContext(currentParent.parentContext.type, currentParent.parentContext.id);
      } else {
        currentParent = null;
      }
    }
    
    return chain.reverse(); // Root first, current template last
  }

  /**
   * Merge inheritance chain into final configuration
   * @param {Array} inheritanceChain - Chain of contexts to inherit from
   * @param {Object} template - Current context template
   * @param {string} contextType - Type of context being created
   * @returns {Object} Merged configuration
   */
  mergeInheritanceChain(inheritanceChain, template, contextType) {
    const merged = {};
    
    // Apply each context in the chain
    for (const context of inheritanceChain) {
      if (context.type === 'template') {
        // Apply template configuration
        const templateConfig = context.config[`${contextType}_config`] || {};
        Object.assign(merged, {
          capabilities: templateConfig.capabilities || [],
          behaviorRules: templateConfig.behavior_rules || [],
          memoryConfig: templateConfig.memory_config || {},
          structureConfig: templateConfig.structure_config || {}
        });
      } else {
        // Apply parent context configuration (selective inheritance)
        if (context.capabilities) {
          merged.capabilities = [...(merged.capabilities || []), ...context.capabilities];
        }
        if (context.memoryConfig) {
          Object.assign(merged.memoryConfig || {}, context.memoryConfig);
        }
      }
    }
    
    return merged;
  }

  /**
   * Save context instance to calculated storage path
   * @param {Object} context - Context instance to save
   * @returns {Object} Save result
   */
  async saveContext(context) {
    try {
      // Ensure directory exists
      const contextDir = path.dirname(context.storagePath);
      await fs.mkdir(contextDir, { recursive: true });
      
      // Convert context to YAML and save
      const yamlContent = yaml.dump(context, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true 
      });
      
      await fs.writeFile(context.storagePath, yamlContent, 'utf8');
      
      return {
        success: true,
        path: context.storagePath,
        context
      };
    } catch (error) {
      throw new Error(`Failed to save context '${context.id}': ${error.message}`);
    }
  }

  /**
   * Load context instance from storage
   * @param {string} contextType - Type of context
   * @param {string} contextId - Context ID
   * @returns {Object} Loaded context instance or null
   */
  async loadContext(contextType, contextId) {
    // For now, implement simple search through workspace
    // In production, this would use index or better search
    try {
      const contexts = await this.listContexts(contextType);
      return contexts.find(ctx => ctx.id === contextId) || null;
    } catch (error) {
      throw new Error(`Failed to load context '${contextId}': ${error.message}`);
    }
  }

  /**
   * Find context by name
   * @param {string} contextType - Type of context
   * @param {string} name - Context name
   * @returns {Object} Found context or null
   */
  async findContextByName(contextType, name) {
    try {
      const contexts = await this.listContexts(contextType);
      return contexts.find(ctx => ctx.name === name) || null;
    } catch (error) {
      throw new Error(`Failed to find context by name '${name}': ${error.message}`);
    }
  }

  /**
   * List all contexts of a given type (recursive search through workspace)
   * @param {string} contextType - Type of contexts to list
   * @returns {Array} Array of context instances
   */
  async listContexts(contextType) {
    try {
      const contexts = [];
      await this.searchContextsRecursive(this.workspaceRoot, contextType, contexts);
      return contexts;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Workspace doesn't exist yet
      }
      throw new Error(`Failed to list contexts of type '${contextType}': ${error.message}`);
    }
  }

  /**
   * Recursively search for contexts in workspace
   * @param {string} searchPath - Directory to search
   * @param {string} contextType - Type of context to find
   * @param {Array} contexts - Array to collect found contexts
   */
  async searchContextsRecursive(searchPath, contextType, contexts) {
    try {
      const entries = await fs.readdir(searchPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(searchPath, entry.name);
        
        if (entry.isFile() && entry.name === 'context.yaml') {
          // Load and check if it's the type we're looking for
          try {
            const yamlContent = await fs.readFile(fullPath, 'utf8');
            const context = yaml.load(yamlContent);
            
            if (context && context.type === contextType) {
              contexts.push(context);
            }
          } catch (loadError) {
            // Skip malformed context files
            console.warn(`Skipping malformed context file: ${fullPath}`);
          }
        } else if (entry.isDirectory()) {
          // Recursively search subdirectories
          await this.searchContextsRecursive(fullPath, contextType, contexts);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  /**
   * Create context with full inheritance and storage
   * @param {string} contextType - Type of context to create
   * @param {Object} config - Configuration for the context
   * @param {Object} parentContext - Parent context for inheritance
   * @param {Object} options - Creation options (force, mode, etc.)
   * @returns {Object} Created and saved context instance
   */
  async createContext(contextType, config, parentContext = null, options = {}) {
    // Check containment rules unless forced or in flexible mode
    if (!options.force && options.mode !== 'emergent') {
      await this.validateContainmentRules(contextType, parentContext);
    }
    
    // Apply inheritance and create instance
    const contextInstance = await this.applyContextInheritance(contextType, config, parentContext);
    
    // Save to storage
    const saveResult = await this.saveContext(contextInstance);
    
    return saveResult.context;
  }

  /**
   * Validate containment rules based on parent's allowed_children
   * @param {string} childType - Type of context being created
   * @param {Object} parentContext - Parent context
   * @throws {Error} If containment rules are violated
   */
  async validateContainmentRules(childType, parentContext) {
    // Root level contexts are always allowed
    if (!parentContext) {
      return;
    }

    // Load parent's template to check allowed_children
    const parentTemplate = await this.loadContextTemplate(parentContext.type);
    const parentConfig = parentTemplate[`${parentContext.type}_config`] || {};
    const allowedChildren = parentConfig.allowed_children || [];

    // Check if wildcard is allowed (for folders, emergent contexts)
    if (allowedChildren.includes('*')) {
      return;
    }

    // Check if child type is explicitly allowed
    if (!allowedChildren.includes(childType)) {
      const suggestion = this.suggestAlternative(childType, parentContext.type);
      throw new Error(
        `Cannot create '${childType}' inside '${parentContext.type}'. ` +
        `Allowed children: ${allowedChildren.join(', ')}. ` +
        `${suggestion} ` +
        `Use {force: true} to override this safety check.`
      );
    }
  }

  /**
   * Suggest alternative based on common patterns
   * @param {string} childType - Type being created
   * @param {string} parentType - Parent type
   * @returns {string} Suggestion message
   */
  suggestAlternative(childType, parentType) {
    const suggestions = {
      'workspace_in_task': 'Consider creating the workspace at root level instead.',
      'portfolio_in_task': 'Portfolios should be root level containers.',
      'workspace_in_epic': 'Workspaces should contain epics, not the other way around.',
      'project_in_task': 'Tasks should be contained within projects.',
      'epic_in_task': 'Tasks should be contained within epics.',
      'task_in_workspace': 'Consider creating a project first, then add tasks to it.'
    };

    const key = `${childType}_in_${parentType}`;
    return suggestions[key] || 'Consider the logical hierarchy of your contexts.';
  }

  // Additional helper methods for mixed, emergent patterns...
  calculateMixedPath(contextType, config, parentContext, structureConfig) {
    // Implementation for mixed storage patterns
    return this.calculateHierarchicalPath(contextType, config, parentContext, structureConfig);
  }

  calculateEmergentPath(contextType, config, parentContext, structureConfig) {
    // Implementation for emergent storage patterns
    return this.calculateHierarchicalPath(contextType, config, parentContext, structureConfig);
  }

  // ========== RELATIONSHIP SYSTEM ==========

  /**
   * Add a relationship between two contexts
   * @param {string} sourceId - Source context ID
   * @param {string} relationshipType - Type of relationship
   * @param {string} targetId - Target context ID
   * @param {Object} properties - Additional relationship properties
   * @returns {Object} Relationship result
   */
  async addRelationship(sourceId, relationshipType, targetId, properties = {}) {
    // Load contexts
    const source = await this.loadContextById(sourceId);
    const target = await this.loadContextById(targetId);
    
    if (!source) throw new Error(`Source context '${sourceId}' not found`);
    if (!target) throw new Error(`Target context '${targetId}' not found`);
    
    // Validate relationship is allowed (unless forced)
    if (!properties.force) {
      await this.validateRelationship(source, relationshipType, target);
    }
    
    // Initialize relationships object if needed
    if (!source.relationships) source.relationships = {};
    if (!source.relationships[relationshipType]) source.relationships[relationshipType] = [];
    
    // Check if relationship already exists
    const existingIndex = source.relationships[relationshipType].findIndex(
      rel => rel.target === targetId
    );
    
    if (existingIndex >= 0) {
      // Update existing relationship
      source.relationships[relationshipType][existingIndex] = {
        target: targetId,
        properties,
        updated: new Date().toISOString()
      };
    } else {
      // Add new relationship
      source.relationships[relationshipType].push({
        target: targetId,
        properties,
        created: new Date().toISOString()
      });
    }
    
    // Handle bidirectional relationships
    const relConfig = await this.getRelationshipConfig(source.type, relationshipType);
    if (relConfig?.bidirectional && relConfig.inverse) {
      await this.addRelationship(targetId, relConfig.inverse, sourceId, {
        ...properties,
        inverse_of: relationshipType,
        force: true // Skip validation for inverse
      });
    }
    
    // Save updated context
    await this.saveContext(source);
    
    return {
      source: { id: source.id, type: source.type },
      target: { id: target.id, type: target.type },
      relationship: relationshipType,
      properties
    };
  }

  /**
   * Remove a relationship between two contexts
   * @param {string} sourceId - Source context ID
   * @param {string} relationshipType - Type of relationship
   * @param {string} targetId - Target context ID
   * @returns {Object} Removal result
   */
  async removeRelationship(sourceId, relationshipType, targetId) {
    const source = await this.loadContextById(sourceId);
    if (!source) throw new Error(`Source context '${sourceId}' not found`);
    
    // Remove from source
    if (source.relationships?.[relationshipType]) {
      source.relationships[relationshipType] = source.relationships[relationshipType].filter(
        rel => rel.target !== targetId
      );
      
      // Clean up empty arrays
      if (source.relationships[relationshipType].length === 0) {
        delete source.relationships[relationshipType];
      }
    }
    
    // Handle bidirectional removal
    const relConfig = await this.getRelationshipConfig(source.type, relationshipType);
    if (relConfig?.bidirectional && relConfig.inverse) {
      await this.removeRelationship(targetId, relConfig.inverse, sourceId);
    }
    
    // Save updated context
    await this.saveContext(source);
    
    return {
      source: sourceId,
      target: targetId,
      relationship: relationshipType,
      removed: true
    };
  }

  /**
   * Get relationships for a context
   * @param {string} contextId - Context ID
   * @param {string} relationshipType - Optional filter by type
   * @param {string} direction - 'outgoing', 'incoming', or 'both'
   * @returns {Object} Relationships organized by type and direction
   */
  async getRelationships(contextId, relationshipType = null, direction = 'both') {
    const context = await this.loadContextById(contextId);
    if (!context) throw new Error(`Context '${contextId}' not found`);
    
    const result = {
      contextId,
      outgoing: {},
      incoming: {}
    };
    
    // Get outgoing relationships
    if (direction === 'outgoing' || direction === 'both') {
      if (relationshipType) {
        if (context.relationships?.[relationshipType]) {
          result.outgoing[relationshipType] = context.relationships[relationshipType];
        }
      } else {
        result.outgoing = context.relationships || {};
      }
    }
    
    // Get incoming relationships (requires scanning other contexts)
    if (direction === 'incoming' || direction === 'both') {
      const allContexts = await this.searchAllContexts();
      
      for (const otherContext of allContexts) {
        if (otherContext.id === contextId) continue;
        
        if (otherContext.relationships) {
          for (const [relType, relationships] of Object.entries(otherContext.relationships)) {
            if (relationshipType && relType !== relationshipType) continue;
            
            for (const rel of relationships) {
              if (rel.target === contextId) {
                if (!result.incoming[relType]) result.incoming[relType] = [];
                result.incoming[relType].push({
                  source: otherContext.id,
                  sourceType: otherContext.type,
                  properties: rel.properties,
                  created: rel.created
                });
              }
            }
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Query the relationship graph
   * @param {Array} startNodes - Starting context IDs
   * @param {Array} relationshipTypes - Types to follow
   * @param {number} depth - How deep to traverse
   * @returns {Object} Graph traversal results
   */
  async queryRelationshipGraph(startNodes, relationshipTypes = [], depth = 2) {
    const visited = new Set();
    const graph = {
      nodes: {},
      edges: []
    };
    
    // Recursive traversal function
    const traverse = async (nodeId, currentDepth) => {
      if (currentDepth > depth || visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const context = await this.loadContextById(nodeId);
      if (!context) return;
      
      // Add node to graph
      graph.nodes[nodeId] = {
        id: context.id,
        type: context.type,
        name: context.name,
        depth: currentDepth
      };
      
      // Follow relationships
      if (context.relationships && currentDepth < depth) {
        for (const [relType, relationships] of Object.entries(context.relationships)) {
          if (relationshipTypes.length > 0 && !relationshipTypes.includes(relType)) continue;
          
          for (const rel of relationships) {
            // Add edge
            graph.edges.push({
              source: nodeId,
              target: rel.target,
              type: relType,
              properties: rel.properties
            });
            
            // Traverse to target
            await traverse(rel.target, currentDepth + 1);
          }
        }
      }
    };
    
    // Start traversal from all starting nodes
    for (const nodeId of startNodes) {
      await traverse(nodeId, 0);
    }
    
    return graph;
  }

  // ========== HELPER METHODS ==========

  /**
   * Load context by ID (searches all contexts)
   * @param {string} contextId - Context ID to find
   * @returns {Object} Context or null
   */
  async loadContextById(contextId) {
    const allContexts = await this.searchAllContexts();
    return allContexts.find(ctx => ctx.id === contextId) || null;
  }

  /**
   * Search all contexts in workspace
   * @returns {Array} All contexts
   */
  async searchAllContexts() {
    const contexts = [];
    
    const searchRecursive = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isFile() && entry.name === 'context.yaml') {
            try {
              const yamlContent = await fs.readFile(fullPath, 'utf8');
              const context = yaml.load(yamlContent);
              if (context) {
                context.storagePath = fullPath; // Keep track of where it's stored
                contexts.push(context);
              }
            } catch (e) {
              // Skip malformed files
            }
          } else if (entry.isDirectory()) {
            await searchRecursive(fullPath);
          }
        }
      } catch (e) {
        // Skip directories we can't read
      }
    };
    
    await searchRecursive(this.workspaceRoot);
    return contexts;
  }

  /**
   * Get relationship configuration from context template
   * @param {string} contextType - Type of context
   * @param {string} relationshipType - Type of relationship
   * @returns {Object} Relationship configuration
   */
  async getRelationshipConfig(contextType, relationshipType) {
    try {
      const template = await this.loadContextTemplate(contextType);
      const config = template[`${contextType}_config`];
      return config?.relationship_types?.[relationshipType] || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate if a relationship is allowed
   * @param {Object} source - Source context
   * @param {string} relationshipType - Type of relationship
   * @param {Object} target - Target context
   * @throws {Error} If relationship is not allowed
   */
  async validateRelationship(source, relationshipType, target) {
    const relConfig = await this.getRelationshipConfig(source.type, relationshipType);
    
    if (!relConfig) {
      // Check if it's a universal relationship
      const baseTemplate = await this.loadContextTemplate('base');
      const universalRels = baseTemplate?.base_config?.universal_relationships || {};
      
      if (!universalRels[relationshipType]) {
        throw new Error(
          `Relationship type '${relationshipType}' is not defined for context type '${source.type}'`
        );
      }
    }
    
    // Validate target type if specified
    if (relConfig?.target_types && relConfig.target_types.length > 0) {
      if (!relConfig.target_types.includes('*') && !relConfig.target_types.includes(target.type)) {
        throw new Error(
          `Relationship '${relationshipType}' from '${source.type}' to '${target.type}' is not allowed. ` +
          `Allowed targets: ${relConfig.target_types.join(', ')}`
        );
      }
    }
  }
}