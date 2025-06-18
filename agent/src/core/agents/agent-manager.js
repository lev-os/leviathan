/**
 * Agent Manager - Core agent discovery and lifecycle management
 * Pure business logic for agent loading, switching, and discovery
 * Part of Leviathan Core SDK
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Load an agent context with specified endpoint
 * @param {string} name - Agent name or slug
 * @param {string} endpoint - Agent endpoint (default: 'default')
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} Agent context with endpoint details
 */
export async function loadAgent(name, endpoint = 'default', options = {}) {
  const { contextsPath = process.env.CONTEXTS_PATH || './contexts' } = options;
  
  try {
    // Find agent context file
    const agentPath = await findAgentContext(name, contextsPath);
    if (!agentPath) {
      throw new Error(`Agent not found: ${name}`);
    }
    
    // Load and parse agent YAML
    const agentData = await loadAgentContext(agentPath);
    
    // Validate endpoint exists
    if (!agentData.endpoints || !agentData.endpoints[endpoint]) {
      throw new Error(`Endpoint '${endpoint}' not found for agent '${name}'. Available: ${Object.keys(agentData.endpoints || {}).join(', ')}`);
    }
    
    // Build agent context
    const agentContext = {
      id: name,
      name: agentData.name || name,
      description: agentData.description || 'No description available',
      personality: agentData.personality || agentData.role || 'General',
      currentEndpoint: endpoint,
      endpoints: agentData.endpoints,
      metadata: agentData.metadata || {},
      capabilities: agentData.capabilities || [],
      context: agentData.context || '',
      path: agentPath,
      loadedAt: Date.now()
    };
    
    return agentContext;
    
  } catch (error) {
    throw new Error(`Failed to load agent '${name}': ${error.message}`);
  }
}

/**
 * List available agents with optional type filtering
 * @param {string|null} type - Agent type filter (e.g., 'agents', 'eeps')
 * @param {Object} options - Listing options
 * @returns {Promise<Array>} Array of agent summaries
 */
export async function listAgents(type = null, options = {}) {
  const { contextsPath = process.env.CONTEXTS_PATH || './contexts' } = options;
  
  try {
    const agentsDir = path.join(contextsPath, 'agents');
    
    if (!await fs.pathExists(agentsDir)) {
      return [];
    }
    
    const agentSummaries = [];
    const agentFolders = await fs.readdir(agentsDir);
    
    for (const folder of agentFolders) {
      const folderPath = path.join(agentsDir, folder);
      const stat = await fs.stat(folderPath);
      
      if (!stat.isDirectory()) continue;
      
      // Apply type filter
      if (type && folder !== type) continue;
      
      // Scan for agent contexts in this folder
      const contexts = await scanAgentContexts(folderPath);
      agentSummaries.push(...contexts);
    }
    
    return agentSummaries.sort((a, b) => a.name.localeCompare(b.name));
    
  } catch (error) {
    throw new Error(`Failed to list agents: ${error.message}`);
  }
}

/**
 * Switch from current agent to target agent with endpoint
 * @param {string} currentAgent - Current agent name
 * @param {string} targetAgent - Target agent name  
 * @param {string} endpoint - Target endpoint
 * @param {Object} options - Switch options
 * @returns {Promise<Object>} Switch result with context
 */
export async function switchAgent(currentAgent, targetAgent, endpoint = 'default', options = {}) {
  try {
    // Load target agent
    const targetContext = await loadAgent(targetAgent, endpoint, options);
    
    // Build switch result
    const switchResult = {
      success: true,
      previousAgent: currentAgent,
      currentAgent: targetAgent,
      endpoint: endpoint,
      context: targetContext,
      switchedAt: Date.now(),
      message: `Switched from ${currentAgent} to ${targetAgent}.${endpoint}`
    };
    
    return switchResult;
    
  } catch (error) {
    throw new Error(`Failed to switch agents: ${error.message}`);
  }
}

/**
 * Get agent endpoints and their descriptions
 * @param {string} name - Agent name
 * @param {Object} options - Options
 * @returns {Promise<Object>} Endpoint information
 */
export async function getAgentEndpoints(name, options = {}) {
  try {
    const agent = await loadAgent(name, 'default', options);
    
    return {
      agent: name,
      endpoints: agent.endpoints,
      defaultEndpoint: 'default',
      endpointCount: Object.keys(agent.endpoints).length
    };
    
  } catch (error) {
    throw new Error(`Failed to get endpoints for agent '${name}': ${error.message}`);
  }
}

// Helper Functions

/**
 * Find agent context file by name or slug
 */
async function findAgentContext(name, contextsPath) {
  const agentsDir = path.join(contextsPath, 'agents');
  
  if (!await fs.pathExists(agentsDir)) {
    return null;
  }
  
  // Try direct folder match first
  const directPath = path.join(agentsDir, name, 'context.yaml');
  if (await fs.pathExists(directPath)) {
    return directPath;
  }
  
  // Search through all agent folders
  const folders = await fs.readdir(agentsDir);
  
  for (const folder of folders) {
    const contextPath = path.join(agentsDir, folder, 'context.yaml');
    
    if (await fs.pathExists(contextPath)) {
      const context = await loadAgentContext(contextPath);
      
      // Check if name matches agent name, slug, or folder name
      if (context.name === name || 
          context.slug === name || 
          folder === name) {
        return contextPath;
      }
    }
  }
  
  return null;
}

/**
 * Load and parse agent context YAML
 */
async function loadAgentContext(contextPath) {
  try {
    const content = await fs.readFile(contextPath, 'utf-8');
    const context = yaml.load(content);
    
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid agent context format');
    }
    
    return context;
    
  } catch (error) {
    throw new Error(`Failed to parse agent context: ${error.message}`);
  }
}

/**
 * Scan folder for agent contexts and create summaries
 */
async function scanAgentContexts(folderPath) {
  const contexts = [];
  const items = await fs.readdir(folderPath);
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory()) {
      const contextPath = path.join(itemPath, 'context.yaml');
      
      if (await fs.pathExists(contextPath)) {
        try {
          const context = await loadAgentContext(contextPath);
          
          contexts.push({
            id: item,
            name: context.name || item,
            slug: context.slug || item,
            description: context.description || 'No description available',
            personality: context.personality || context.role || 'General',
            endpointCount: Object.keys(context.endpoints || {}).length,
            capabilities: context.capabilities || [],
            path: contextPath
          });
          
        } catch (error) {
          // Skip invalid contexts
          console.warn(`Skipping invalid agent context: ${contextPath} - ${error.message}`);
        }
      }
    }
  }
  
  return contexts;
}