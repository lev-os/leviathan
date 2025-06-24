// Worktree Wizard Command - Hexagonal Architecture Compliant
// Routes to workflow, no business logic (follows "adapters route, core computes")

/**
 * Enhanced worktree creation with specification validation workflow
 * @param {Object} args - Command arguments
 * @param {Object} dependencies - Injected dependencies for hexagonal architecture
 * @returns {Object} Workflow routing response
 */
export async function worktreeWizard(args, dependencies) {
  const { workflowLoader, logger } = dependencies;
  
  // Validate required arguments
  if (!args.spec) {
    throw new Error('Specification file required: --spec=<file>');
  }
  
  if (!args.name && !args.spec.includes('_')) {
    throw new Error('Worktree name required: provide --name or use spec filename pattern');
  }
  
  // Extract worktree name from spec filename if not provided
  const worktreeName = args.name || extractWorktreeNameFromSpec(args.spec);
  
  // Pure routing - no business logic
  return {
    workflow: 'spec-to-implementation',
    workflow_context: './contexts/workflows/spec-to-implementation/context.yaml',
    context: {
      spec_file: args.spec,
      worktree_name: worktreeName,
      project_root: process.cwd(),
      wizard_mode: args.wizard !== false, // Default to wizard mode
      force_new: args.force || false,
      namespace: '@lev-os'
    },
    next_action: 'load_workflow_and_execute',
    routing_metadata: {
      command: 'worktree-wizard',
      source: '@lev-os/cmd',
      timestamp: new Date().toISOString(),
      session_type: 'spec_implementation'
    }
  };
}

/**
 * Extract worktree name from specification filename
 * @param {string} specFile - Path to specification file
 * @returns {string} Extracted worktree name
 */
function extractWorktreeNameFromSpec(specFile) {
  // Extract from patterns like "_01-prime.md" -> "prime-context"
  // or "_jepa.md" -> "jepa-learning"
  const basename = specFile.replace(/^.*\//, '').replace(/\.md$/, '');
  
  if (basename.startsWith('_')) {
    const name = basename.substring(1).replace(/^\d+-/, '');
    
    // Add contextual suffix based on spec type
    const contextSuffixes = {
      'prime': '-context',
      'whisper': '-system', 
      'mediaforge': '-integration',
      'jepa': '-learning',
      'workshop': '-plugin',
      'refactor': '-architecture',
      'adapters': '-bootstrap'
    };
    
    return name + (contextSuffixes[name] || '-plugin');
  }
  
  return basename.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

// Command metadata for auto-discovery
worktreeWizard.description = "Enhanced worktree creation with specification validation workflow";
worktreeWizard.inputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name for the worktree (auto-generated from spec if not provided)'
    },
    spec: {
      type: 'string',
      description: 'Path to specification file (required)',
      required: true
    },
    wizard: {
      type: 'boolean',
      default: true,
      description: 'Enable interactive wizard mode'
    },
    force: {
      type: 'boolean',
      default: false,
      description: 'Force creation even if worktree exists'
    }
  },
  required: ['spec']
};

// Export for command registry auto-discovery
export const worktreeWizardTool = {
  name: 'worktree_wizard',
  description: worktreeWizard.description,
  inputSchema: worktreeWizard.inputSchema,
  handler: worktreeWizard,
  workflow_context: './contexts/workflows/spec-to-implementation/context.yaml'
};