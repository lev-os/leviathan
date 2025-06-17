/**
 * Get Workflow Command - Semantic workflow lookup with quick codes
 * Extracted from index.js god object for isolated testing and direct function calls
 */

export async function getWorkflow(args, { workflowLoader, semanticLookup }) {
  const { intent, mode = 'quick' } = args;
  
  try {
    // Try quick code lookup first (e.g., "1a", "3f")
    const quickResult = await workflowLoader.getByCode(intent);
    if (quickResult) {
      return formatWorkflowResponse(quickResult, mode);
    }
    
    // Semantic lookup for natural language
    const semanticResult = await semanticLookup.findWorkflow(intent);
    if (semanticResult) {
      return formatWorkflowResponse(semanticResult, mode);
    }
    
    // No match found - provide suggestions
    const suggestions = await semanticLookup.getSuggestions(intent, 3);
    return {
      success: false,
      error: `No workflow found for: ${intent}`,
      suggestions: suggestions.map(s => ({
        code: s.code,
        name: s.name,
        similarity: s.similarity?.toFixed(3) || 'unknown'
      })),
      hint: 'Try using a quick code (1a-3z) or different search terms'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Workflow lookup failed: ${error.message}`,
      intent: intent
    };
  }
}

function formatWorkflowResponse(workflow, mode) {
  const base = {
    success: true,
    workflow: {
      name: workflow.name,
      code: workflow.code || 'N/A',
      type: workflow.type || 'workflow'
    }
  };
  
  switch (mode) {
    case 'quick':
      return {
        ...base,
        workflow: {
          ...base.workflow,
          quick_start: workflow.quick_start || workflow.description?.substring(0, 100) + '...'
        }
      };
      
    case 'full':
      return {
        ...base,
        workflow: {
          ...base.workflow,
          description: workflow.description,
          steps: workflow.steps || [],
          context: workflow.context || {},
          usage_examples: workflow.usage_examples || []
        }
      };
      
    case 'menu':
      return {
        ...base,
        workflow: {
          ...base.workflow,
          description: workflow.description,
          quick_start: workflow.quick_start
        },
        options: [
          { action: 'execute', description: 'Execute this workflow' },
          { action: 'customize', description: 'Customize before execution' },
          { action: 'explain', description: 'Get detailed explanation' }
        ]
      };
      
    default:
      return base;
  }
}

// Export metadata for auto-discovery and MCP integration
getWorkflow.description = "Get workflow by semantic intent or quick code";
getWorkflow.inputSchema = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      description: 'Semantic intent (e.g., "parliament debate", "strategic analysis") or quick code (e.g., "3a", "2f")',
    },
    mode: {
      type: 'string',
      enum: ['quick', 'full', 'menu'],
      default: 'quick',
      description: 'Response format: quick (just workflow), full (with description), menu (show options)',
    },
  },
  required: ['intent'],
};

// MCP tool definition for automatic registration
export const getWorkflowTool = {
  name: 'get_workflow',
  description: getWorkflow.description,
  inputSchema: getWorkflow.inputSchema,
  handler: getWorkflow
};