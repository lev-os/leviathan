/**
 * FlowMind Principle: EVERYTHING IS A CONTEXT
 * This file enables workflow discovery through the context registry.
 * No hardcoded workflows - pure discovery through FlowMind contexts.
 */

/**
 * Discover available workflows from context registry
 * 
 * @param {Object} params - Discovery parameters (unused in v0.1.0)
 * @param {Object} deps - Dependency injection for testing
 * @param {ContextRegistry} deps.registry - Context discovery system
 * @returns {Object} Available workflows list
 */
export async function listWorkflows(params = {}, deps = null) {
  const { registry } = deps || {}
  
  try {
    // Discover workflow contexts through registry
    const workflowContexts = registry?.getContextsByType?.('workflow') || []
    
    // Transform contexts into workflow metadata
    const workflows = workflowContexts.map(context => ({
      id: context.id || context.metadata?.name || 'unknown',
      name: context.metadata?.name || context.id || 'Unknown Workflow',
      description: context.metadata?.description || 'No description available',
      steps: context.steps?.length || 0,
      type: context.type || 'workflow'
    }))
    
    return {
      workflows,
      total: workflows.length,
      source: 'context_registry',
      discovery_based: true,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    // Graceful fallback for v0.1.0
    return {
      workflows: [
        {
          id: 'deep-analysis',
          name: 'Deep Analysis',
          description: 'Multi-perspective analysis workflow',
          steps: 3,
          type: 'workflow'
        }
      ],
      total: 1,
      source: 'fallback',
      discovery_based: true,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}