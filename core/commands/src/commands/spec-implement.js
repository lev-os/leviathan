// Specification Implementation Command
// Routes to phase-specific workflow contexts for specification-driven development

export async function specImplement(args, dependencies) {
  const { logger } = dependencies;

  // Determine starting phase based on input
  const phase = determineStartingPhase(args);
  const entryPoint = args.spec || args.idea || args.research;
  
  if (!entryPoint) {
    throw new Error('Entry point required: --spec=<file>, --idea="<description>", or --research="<topic>"');
  }

  const worktreeName = args.name || generateWorktreeName(entryPoint);

  logger?.info(`Starting specification implementation at phase: ${phase}`);
  logger?.info(`Entry point: ${entryPoint}`);

  // Pure routing - return phase-specific workflow context
  return {
    workflow: 'spec-to-implementation',
    workflow_context: `./contexts/workflows/spec-to-implementation/phases/${phase}.yaml`,
    context: {
      entry_point: entryPoint,
      spec_file: args.spec,
      idea: args.idea,
      research_topic: args.research,
      current_phase: phase,
      worktree_name: worktreeName,
      project_root: process.cwd(),
      wizard_mode: args.wizard !== false,
      namespace: '@lev-os'
    }
  };
}

function determineStartingPhase(args) {
  // If specific phase requested, use it
  if (args.phase) {
    return formatPhaseId(args.phase);
  }

  // If existing spec file, start with research-requirements to validate
  if (args.spec) {
    return '01-research-requirements';
  }

  // If basic idea or research topic, start with research-requirements
  if (args.idea || args.research) {
    return '01-research-requirements';
  }

  // Default to research phase
  return '01-research-requirements';
}

function formatPhaseId(phaseName) {
  const phaseMap = {
    'research': '01-research-requirements',
    'requirements': '01-research-requirements',
    'adr': '02-adr-wizard',
    'adr-wizard': '02-adr-wizard',
    'splitting': '03-splitting',
    'split': '03-splitting',
    'bdd': '04-bdd-tdd',
    'tdd': '04-bdd-tdd',
    'bdd-tdd': '04-bdd-tdd',
    'testing': '04-bdd-tdd',
    'environment': '05-environment',
    'env': '05-environment',
    'setup': '05-environment'
  };

  return phaseMap[phaseName.toLowerCase()] || '01-research-requirements';
}

function generateWorktreeName(entryPoint) {
  if (entryPoint.endsWith('.md')) {
    // Extract from filename: "_01-prime.md" -> "prime"
    const baseName = entryPoint.replace(/^.*[_-]\d+-/, '').replace('.md', '');
    return `${baseName}-implementation`;
  }
  
  // Generate from idea/research topic
  return entryPoint
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-') + '-implementation';
}

// Command metadata for auto-discovery
specImplement.description = 'Transform specifications into validated, testable development environments';
specImplement.inputSchema = {
  type: 'object',
  properties: {
    spec: {
      type: 'string',
      description: 'Path to existing specification file'
    },
    idea: {
      type: 'string', 
      description: 'Basic idea or feature description'
    },
    research: {
      type: 'string',
      description: 'Research topic to investigate and specify'
    },
    phase: {
      type: 'string',
      description: 'Specific phase to start at (research, adr, splitting, bdd, environment)'
    },
    name: {
      type: 'string',
      description: 'Custom worktree/project name'
    },
    wizard: {
      type: 'boolean',
      description: 'Enable wizard mode (default: true)'
    }
  }
};