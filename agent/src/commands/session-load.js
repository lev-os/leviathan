/**
 * Session Load Command
 * Session restoration and context loading
 */

export async function sessionLoad(args, dependencies) {
  const { ceoBinding, sessionManager } = dependencies || {};
  const { rollup_path, restore_level = 'full', validate = true } = args;
  
  // Load session using session manager
  const result = sessionManager.loadSession(
    rollup_path || 'latest',
    restore_level
  );

  if (result.success && result.session_data) {
    // Update CEO binding with restored context if available
    if (result.session_data.agent) {
      ceoBinding.currentAgent = result.session_data.agent;
    }
    
    // Register as active session if needed
    sessionManager.updateSessionActivity(
      ceoBinding.sessionId,
      `Loaded session from: ${result.rollup_path}`
    );
  }

  const responseText = result.success 
    ? `🔄 **Session Context Restored**\n\n` +
      `**Source:** ${result.rollup_path}\n` +
      `**Restore Level:** ${result.restore_level}\n` +
      `**Files:** ${result.files_validated}\n` +
      `**Validation:** ${validate ? 'Enabled' : 'Disabled'}\n` +
      `**Context Restored:** ${result.context_restored ? 'Yes' : 'No'}\n` +
      `**Agent Restored:** ${result.session_data?.agent || 'None'}\n` +
      `**Timestamp:** ${result.timestamp}\n\n` +
      `✅ Session context loaded successfully`
    : `❌ **Session Load Failed**\n\n` +
      `**Error:** ${result.error}\n` +
      `**Rollup Path:** ${rollup_path || 'latest'}\n` +
      `**Timestamp:** ${new Date().toISOString()}`;

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
sessionLoad.description = 'Load session context from rollup package';
sessionLoad.inputSchema = {
  type: 'object',
  properties: {
    rollup_path: {
      type: 'string',
      description: 'Path to rollup package or "latest" for most recent',
    },
    restore_level: {
      type: 'string',
      enum: ['full', 'partial', 'minimal'],
      default: 'full',
      description: 'Level of context restoration',
    },
    validate: {
      type: 'boolean',
      default: true,
      description: 'Validate restored context',
    },
  },
};

// MCP Tool Export
export const sessionLoadTool = {
  name: 'session_load',
  description: sessionLoad.description,
  inputSchema: sessionLoad.inputSchema,
  handler: sessionLoad
};