/**
 * CEO Status Command
 * CEO binding status reporting
 */

export async function ceoStatus(args, dependencies) {
  const { ceoBinding, sessionManager } = dependencies || {};
  const { include_sessions = false } = args;
  
  const headers = ceoBinding.generateResponseHeaders();
  const workspaceContext = ceoBinding.workspaceContext;
  
  let statusText = `📊 **CEO Binding Status**\n\n` +
                  `**Session ID:** ${ceoBinding.sessionId}\n` +
                  `**Current Agent:** ${ceoBinding.currentAgent.toUpperCase()}\n` +
                  `**Turn Count:** ${ceoBinding.turnCounter}\n` +
                  `**Network Intelligence:** ${ceoBinding.networkIntelligence ? 'Enabled' : 'Disabled'}\n` +
                  `**Memory Auto-Save:** ${ceoBinding.memoryAutoSave ? 'Enabled' : 'Disabled'}\n` +
                  `**Workspace:** ${workspaceContext?.workspace || 'Unknown'}\n\n`;

  // Add workspace context info
  if (workspaceContext) {
    statusText += `📁 **Workspace Context**\n` +
                 `**Project CLAUDE.md:** ${workspaceContext.project ? 'Loaded' : 'Not found'}\n` +
                 `**Kingly CLAUDE.md:** ${workspaceContext.kingly ? 'Loaded' : 'Not found'}\n\n`;
  }

  // Add active sessions if requested
  if (include_sessions) {
    const activeSessions = sessionManager.getActiveSessions();
    statusText += `🔗 **Active Sessions (${activeSessions.length})**\n`;
    
    for (const session of activeSessions.slice(0, 5)) { // Limit to 5 sessions
      statusText += `• ${session.session_id}: ${session.agent || 'Unknown'} (${session.status})\n`;
    }
    
    if (activeSessions.length > 5) {
      statusText += `• ... and ${activeSessions.length - 5} more\n`;
    }
    statusText += '\n';
  }

  statusText += `**Last Ping:** ${new Date(ceoBinding.lastPing).toLocaleTimeString()}\n` +
               `**Headers:**\n${headers}`;

  return {
    content: [
      {
        type: 'text',
        text: statusText,
      },
    ],
  };
}

// Add function metadata
ceoStatus.description = 'Get CEO binding status and session information';
ceoStatus.inputSchema = {
  type: 'object',
  properties: {
    include_sessions: {
      type: 'boolean',
      default: false,
      description: 'Include active sessions information',
    },
  },
};

// MCP Tool Export
export const ceoStatusTool = {
  name: 'ceo_status',
  description: ceoStatus.description,
  inputSchema: ceoStatus.inputSchema,
  handler: ceoStatus
};