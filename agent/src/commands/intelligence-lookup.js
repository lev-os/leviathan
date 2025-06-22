/**
 * Intelligence Lookup Command
 * Intelligence querying and retrieval operations
 */

export async function intelligenceLookup(args, dependencies) {
  const { intelligenceCoordinator, ceoBinding } = dependencies || {};
  const { query, all = false, context = 'current-conversation', scope = 'workspace', format = 'structured' } = args;
  
  // Perform actual intelligence lookup using intelligence coordinator
  const result = await intelligenceCoordinator.performLookup(
    query || 'comprehensive intelligence dump',
    scope,
    format
  );

  let responseText = `🧠 **Intelligence Lookup Complete**\n\n` +
                    `**Query:** ${result.query}\n` +
                    `**Context:** ${context}\n` +
                    `**Scope:** ${result.scope}\n` +
                    `**Format:** ${result.format}\n` +
                    `**Confidence:** ${(result.confidence * 100).toFixed(1)}%\n\n`;

  if (result.intelligence_entries.length > 0) {
    responseText += `**Intelligence Found (${result.intelligence_entries.length} entries):**\n`;
    
    for (const entry of result.intelligence_entries.slice(0, all ? 20 : 5)) {
      responseText += `\n• **${entry.type.toUpperCase()}** (${(entry.confidence * 100).toFixed(0)}%)\n`;
      responseText += `  Source: ${entry.source}\n`;
      responseText += `  Content: ${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}\n`;
      if (entry.timestamp) {
        responseText += `  Created: ${new Date(entry.timestamp).toLocaleDateString()}\n`;
      }
    }
    
    if (result.intelligence_entries.length > 5 && !all) {
      responseText += `\n... and ${result.intelligence_entries.length - 5} more entries (use all=true to see all)\n`;
    }
  } else {
    responseText += `**No Intelligence Found**\n` +
                   `• Try broader search terms\n` +
                   `• Check if scope includes relevant sources\n` +
                   `• Consider using different context`;
  }

  responseText += `\n\n**Timestamp:** ${result.timestamp}\n\n` +
                 `✅ Intelligence lookup completed successfully`;

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
intelligenceLookup.description = 'Lookup and retrieve intelligence entries with filtering and formatting';
intelligenceLookup.inputSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Intelligence query or search terms',
    },
    all: {
      type: 'boolean',
      default: false,
      description: 'Return all results instead of limiting to 5',
    },
    context: {
      type: 'string',
      default: 'current-conversation',
      description: 'Context for intelligence search',
    },
    scope: {
      type: 'string',
      enum: ['workspace', 'cross-workspace', 'global'],
      default: 'workspace',
      description: 'Search scope for intelligence entries',
    },
    format: {
      type: 'string',
      enum: ['structured', 'raw', 'summary'],
      default: 'structured',
      description: 'Output format for results',
    },
  },
};

// MCP Tool Export
export const intelligenceLookupTool = {
  name: 'intelligence_lookup',
  description: intelligenceLookup.description,
  inputSchema: intelligenceLookup.inputSchema,
  handler: intelligenceLookup
};