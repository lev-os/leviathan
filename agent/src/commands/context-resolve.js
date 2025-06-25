/**
 * Context Resolve Command - Resolve contexts with inheritance
 * Provides access to the Universal Context System for context management
 */

import { universalContextSystem } from '../core/universal-context-system.js'

export async function contextResolve(args) {
  const { context_name, action = 'resolve', context_data = null, category = 'custom', list_category = null } = args

  try {
    // Initialize the system if not already done
    if (universalContextSystem.contexts.size === 0) {
      await universalContextSystem.initialize('./contexts')
    }

    switch (action) {
      case 'resolve':
        if (!context_name) {
          return {
            success: false,
            error: 'context_name is required for resolve action',
          }
        }

        const resolvedContext = await universalContextSystem.getResolvedContext(context_name)
        return {
          success: true,
          action: 'resolve',
          context_name,
          resolved_context: resolvedContext,
          inheritance_tree: universalContextSystem.getInheritanceTree(context_name),
        }

      case 'list':
        const contexts = universalContextSystem.listContexts(list_category)
        return {
          success: true,
          action: 'list',
          category: list_category || 'all',
          contexts: contexts,
          total_count: contexts.length,
        }

      case 'create':
        if (!context_name || !context_data) {
          return {
            success: false,
            error: 'context_name and context_data are required for create action',
          }
        }

        const createResult = await universalContextSystem.createContext(context_name, context_data, category)
        return {
          success: true,
          action: 'create',
          ...createResult,
        }

      case 'save':
        if (!context_name) {
          return {
            success: false,
            error: 'context_name is required for save action',
          }
        }

        const filePath = await universalContextSystem.saveContext(context_name)
        return {
          success: true,
          action: 'save',
          context_name,
          file_path: filePath,
        }

      case 'validate':
        if (context_name) {
          // Validate specific context
          const context = universalContextSystem.contexts.get(context_name)
          if (!context) {
            return {
              success: false,
              error: `Context not found: ${context_name}`,
            }
          }

          let validation = null
          if (universalContextSystem.constitutionalFramework && universalContextSystem.constitutionalFramework.validateContext) {
            validation = await universalContextSystem.constitutionalFramework.validateContext(context)
          }
          return {
            success: true,
            action: 'validate',
            context_name,
            constitutional_compliance: validation.constitutional_compliance,
            score: validation.score,
            violations: validation.violations,
          }
        } else {
          // Validate all contexts
          const allValidations = await universalContextSystem.validateAllContexts()
          return {
            success: true,
            action: 'validate_all',
            validations: allValidations,
            summary: {
              total: Object.keys(allValidations).length,
              valid: Object.values(allValidations).filter((v) => v.valid).length,
              invalid: Object.values(allValidations).filter((v) => !v.valid).length,
            },
          }
        }

      case 'inheritance':
        if (!context_name) {
          return {
            success: false,
            error: 'context_name is required for inheritance action',
          }
        }

        const inheritanceTree = universalContextSystem.getInheritanceTree(context_name)
        const chain = universalContextSystem.inheritanceChain.get(context_name) || [context_name]

        return {
          success: true,
          action: 'inheritance',
          context_name,
          inheritance_chain: chain,
          inheritance_tree: inheritanceTree,
        }

      default:
        return {
          success: false,
          error: `Unknown action: ${action}. Available actions: resolve, list, create, save, validate, inheritance`,
        }
    }
  } catch (error) {
    return {
      success: false,
      error: `Context operation failed: ${error.message}`,
      action,
      context_name,
    }
  }
}

// Export metadata for auto-discovery and MCP integration
contextResolve.description =
  'Resolve contexts with YAML inheritance, create new contexts, and manage the Universal Context System'
contextResolve.inputSchema = {
  type: 'object',
  properties: {
    context_name: {
      type: 'string',
      description: 'Name of the context to operate on',
    },
    action: {
      type: 'string',
      enum: ['resolve', 'list', 'create', 'save', 'validate', 'inheritance'],
      default: 'resolve',
      description:
        'Action to perform: resolve (get full context), list (show available), create (new context), save (to file), validate (constitutional), inheritance (show chain)',
    },
    context_data: {
      type: 'object',
      description: 'Context data when creating a new context (JSON object with context definition)',
    },
    category: {
      type: 'string',
      default: 'custom',
      description: 'Category for new contexts (agents, workflows, patterns, personalities, custom)',
    },
    list_category: {
      type: 'string',
      description: 'Filter contexts by category when listing',
    },
  },
  required: [],
}

// MCP tool definition for automatic registration
export const contextResolveTool = {
  name: 'context_resolve',
  description: contextResolve.description,
  inputSchema: contextResolve.inputSchema,
  handler: contextResolve,
}
