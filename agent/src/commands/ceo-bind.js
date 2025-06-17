/**
 * CEO Bind Command - Bind to CEO agent context with intent detection
 * Extracted from index.js god object for isolated testing and direct function calls
 */

export async function ceoBind(args, { ceoBinding, sessionManager }) {
  const { intent, include_headers = true, auto_ping = true } = args;
  
  try {
    // Detect intent and potentially switch agents
    const intentResult = ceoBinding.detectIntent(intent);
    
    // Check if we should auto-ping
    if (auto_ping && ceoBinding.shouldSelfPing(intent)) {
      const pingData = ceoBinding.createSessionPing(
        `Auto-ping: ${intent}`,
        true
      );
      
      // Create checkpoint
      sessionManager.createCheckpoint(
        ceoBinding.sessionId,
        pingData.context,
        ['auto-detected files']
      );
    }

    // Generate CEO context header
    const contextHeader = ceoBinding.generateContextHeader(
      include_headers,
      intentResult
    );

    return {
      success: true,
      agent: ceoBinding.currentAgent,
      session_id: ceoBinding.sessionId,
      intent_analysis: intentResult,
      context_header: contextHeader,
      auto_ping_triggered: auto_ping && ceoBinding.shouldSelfPing(intent),
      workspace: ceoBinding.workspaceContext?.workspace || 'unknown'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `CEO binding failed: ${error.message}`,
      intent: intent
    };
  }
}

// Export metadata for auto-discovery and MCP integration
ceoBind.description = "Bind to CEO agent context with intelligent routing and headers";
ceoBind.inputSchema = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      description: 'Intent description for context detection and agent routing',
    },
    include_headers: {
      type: 'boolean',
      default: true,
      description: 'Include CEO context headers in response',
    },
    auto_ping: {
      type: 'boolean', 
      default: true,
      description: 'Automatically create session ping if needed',
    },
  },
  required: ['intent'],
};

// MCP tool definition for automatic registration
export const ceoBindTool = {
  name: 'ceo_bind',
  description: ceoBind.description,
  inputSchema: ceoBind.inputSchema,
  handler: ceoBind
};