/**
 * Session Ping Command - Create session checkpoints with context tracking
 * Extracted from index.js god object for isolated testing and direct function calls
 */

export async function sessionPing(args, { ceoBinding, sessionManager }) {
  const { context, files, session_type = 'general', auto = false } = args;
  
  try {
    // Create session ping using CEO binding
    const pingData = ceoBinding.createSessionPing(context, auto);
    
    // Create checkpoint using session manager
    const checkpointResult = sessionManager.createCheckpoint(
      ceoBinding.sessionId,
      context,
      files ? files.split(',').map(f => f.trim()) : []
    );

    const result = {
      success: checkpointResult.success,
      session_id: ceoBinding.sessionId,
      checkpoint_path: checkpointResult.checkpoint_path,
      context,
      files: files || 'auto-detected',
      session_type,
      agent: ceoBinding.currentAgent,
      significance: pingData.significance,
      timestamp: pingData.timestamp,
    };

    const responseText = `🎯 **Session Checkpoint Created**\\n\\n` +
      `**Session ID:** ${result.session_id}\\n` +
      `**Context:** ${context}\\n` +
      `**Files:** ${result.files}\\n` +
      `**Agent:** ${result.agent}\\n` +
      `**Significance:** ${result.significance}\\n` +
      `**Checkpoint:** ${result.checkpoint_path}\\n\\n` +
      `This session state is preserved for handoffs and continuity.`;

    return {
      ...result,
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Session ping failed: ${error.message}`,
      context: context
    };
  }
}

// Export metadata for auto-discovery and MCP integration
sessionPing.description = "Create session checkpoint with context and file tracking";
sessionPing.inputSchema = {
  type: 'object',
  properties: {
    context: {
      type: 'string',
      description: 'Current context or progress description for the checkpoint',
    },
    files: {
      type: 'string',
      description: 'Comma-separated list of files involved in current work',
    },
    session_type: {
      type: 'string',
      default: 'general',
      description: 'Type of session: general, development, analysis, etc.',
    },
    auto: {
      type: 'boolean',
      default: false,
      description: 'Whether this is an automatic ping or user-initiated',
    },
  },
  required: ['context'],
};

// MCP tool definition for automatic registration
export const sessionPingTool = {
  name: 'session_ping',
  description: sessionPing.description,
  inputSchema: sessionPing.inputSchema,
  handler: sessionPing
};