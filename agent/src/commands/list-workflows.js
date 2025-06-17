/**
 * List Workflows Command - Browse available workflows by category
 * Extracted from index.js god object for isolated testing and direct function calls
 */

export async function listWorkflows(args, { workflowLoader }) {
  const { category = 'all', format = 'quick' } = args;
  
  try {
    const workflows = await workflowLoader.listByCategory(category);
    
    let text;
    if (format === 'detailed') {
      text = formatDetailedList(workflows);
    } else {
      text = formatQuickList(workflows);
    }
    
    return {
      success: true,
      content: [
        {
          type: 'text',
          text,
        },
      ],
      count: workflows.length,
      category: category
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to list workflows: ${error.message}`,
      category: category
    };
  }
}

function formatQuickList(workflows) {
  if (workflows.length === 0) {
    return "No workflows found in this category.";
  }
  
  return workflows.map(w => 
    `${w.code}: ${w.name} (${w.type})`
  ).join('\n');
}

function formatDetailedList(workflows) {
  if (workflows.length === 0) {
    return "No workflows found in this category.";
  }
  
  return workflows.map(w => {
    let detail = `**${w.code}: ${w.name}**\n`;
    detail += `Type: ${w.type}\n`;
    if (w.description) {
      detail += `Description: ${w.description.substring(0, 150)}...\n`;
    }
    if (w.quick_start) {
      detail += `Quick Start: ${w.quick_start}\n`;
    }
    detail += '---\n';
    return detail;
  }).join('\n');
}

// Export metadata for auto-discovery and MCP integration
listWorkflows.description = "List all available workflows and patterns by category";
listWorkflows.inputSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      description: 'Filter by category: all, agents, workflows, patterns, tools',
      default: 'all'
    },
    format: {
      type: 'string',
      enum: ['quick', 'detailed'],
      default: 'quick',
      description: 'Output format: quick (codes and names) or detailed (with descriptions)'
    }
  }
};

// MCP tool definition for automatic registration
export const listWorkflowsTool = {
  name: 'list_workflows',
  description: listWorkflows.description,
  inputSchema: listWorkflows.inputSchema,
  handler: listWorkflows
};