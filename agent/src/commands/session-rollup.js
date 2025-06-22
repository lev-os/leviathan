/**
 * Session Rollup Command
 * Session package creation and handoff preparation
 */

export async function sessionRollup(args, dependencies) {
  const { ceoBinding, sessionManager } = dependencies || {};
  const { session_id, files, decisions, blockers, format = 'package' } = args;
  
  // Generate rollup data using CEO binding
  const rollupData = ceoBinding.generateRollup(
    files ? files.split(',').map(f => f.trim()) : [],
    decisions ? decisions.split(',').map(d => d.trim()) : [],
    blockers ? blockers.split(',').map(b => b.trim()) : [],
    [] // next_actions will be auto-generated
  );
  
  // Create rollup using session manager
  const result = sessionManager.createRollup(
    session_id || ceoBinding.sessionId,
    {
      ...rollupData,
      format,
      context: `Session rollup for ${ceoBinding.currentAgent} agent`,
      agent: ceoBinding.currentAgent,
      workspace: ceoBinding.workspaceContext?.workspace,
      turn_count: ceoBinding.turnCounter
    }
  );

  const responseText = `📦 **Session Rollup Prepared**\n\n` +
                      `**Rollup ID:** ${result.rollup_id}\n` +
                      `**Files:** ${rollupData.files}\n` +
                      `**Decisions:** ${rollupData.decisions}\n` +
                      `**Blockers:** ${rollupData.blockers}\n` +
                      `**Agent:** ${rollupData.agent.toUpperCase()}\n` +
                      `**Turn Count:** ${rollupData.turn_count}\n` +
                      `**Format:** ${result.format}\n` +
                      `**Package:** ${result.rollup_path}\n` +
                      `**Timestamp:** ${result.created}\n\n` +
                      `✅ Rollup package created successfully`;

  return {
    content: [
      {
        type: 'text',
        text: ceoBinding.formatResponse(responseText, true),
      },
    ],
  };
}

// Add function metadata
sessionRollup.description = 'Create session rollup package for handoffs';
sessionRollup.inputSchema = {
  type: 'object',
  properties: {
    session_id: {
      type: 'string',
      description: 'Session ID to rollup (defaults to current)',
    },
    files: {
      type: 'string',
      description: 'Comma-separated list of files to include',
    },
    decisions: {
      type: 'string',
      description: 'Comma-separated list of decisions made',
    },
    blockers: {
      type: 'string',
      description: 'Comma-separated list of blockers encountered',
    },
    format: {
      type: 'string',
      enum: ['package', 'summary', 'detailed'],
      default: 'package',
      description: 'Rollup format type',
    },
  },
};

// MCP Tool Export
export const sessionRollupTool = {
  name: 'session_rollup',
  description: sessionRollup.description,
  inputSchema: sessionRollup.inputSchema,
  handler: sessionRollup
};