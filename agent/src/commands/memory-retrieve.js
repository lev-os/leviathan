/**
 * Memory Retrieve Command - Context-aware retrieval with agent/session scope
 * Part of Memory Core Package integration with Universal Command Registry
 */

export async function memoryRetrieve(args, dependencies) {
  const { memoryManager } = dependencies || {};
  const { 
    memory_id, 
    namespace = 'auto',
    agent_id = 'auto',
    session_id = 'auto',
    include_metadata = true,
    format = 'full'
  } = args;

  if (!memoryManager) {
    return {
      success: false,
      error: 'Memory system not initialized',
      content: [{
        type: 'text',
        text: '❌ **Memory Retrieve Failed**\n\nMemory system not available. Check system status.'
      }]
    };
  }

  try {
    // Build namespace scope for retrieval
    const namespaceScope = namespace === 'auto' 
      ? `agent-${agent_id}:memory:`
      : namespace;

    // Attempt retrieval with context awareness
    let result;
    
    if (memory_id) {
      // Direct memory ID retrieval
      result = await memoryManager.getMemoryById(memory_id, namespaceScope);
    } else {
      return {
        success: false,
        error: 'Memory ID required for retrieval',
        content: [{
          type: 'text',
          text: '❌ **Memory Retrieve Failed**\n\nMemory ID is required. Use memory:query for searching.'
        }]
      };
    }

    if (!result || !result.content) {
      return {
        success: false,
        error: 'Memory not found or access denied',
        content: [{
          type: 'text',
          text: `❌ **Memory Not Found**\n\n**ID:** ${memory_id}\n**Namespace:** ${namespaceScope}\n\nMemory may not exist or you may not have access to it.`
        }]
      };
    }

    // Format response based on requested format
    let responseText;
    
    if (format === 'content_only') {
      responseText = result.content;
    } else {
      responseText = `🧠 **Memory Retrieved**\n\n` +
        `**ID:** ${memory_id}\n` +
        `**Type:** ${result.type || 'unknown'}\n` +
        `**Namespace:** ${result.namespace || namespaceScope}\n` +
        `**Agent:** ${result.agent_id || agent_id}\n` +
        `**Session:** ${result.session_id || 'N/A'}\n` +
        `**Created:** ${result.created_at || 'unknown'}\n` +
        `**Size:** ${result.content.length} characters\n\n` +
        `**Content:**\n\`\`\`\n${result.content}\n\`\`\``;

      if (include_metadata && result.metadata) {
        responseText += `\n\n**Metadata:**\n\`\`\`json\n${JSON.stringify(result.metadata, null, 2)}\n\`\`\``;
      }
    }

    return {
      success: true,
      memory_id: memory_id,
      content: result.content,
      type: result.type,
      namespace: result.namespace,
      metadata: include_metadata ? result.metadata : null,
      content: [{
        type: 'text',
        text: responseText
      }]
    };

  } catch (error) {
    return {
      success: false,
      error: `Memory retrieval failed: ${error.message}`,
      content: [{
        type: 'text',
        text: `❌ **Memory Retrieve Failed**\n\n**Error:** ${error.message}\n**ID:** ${memory_id}\n**Namespace:** ${namespace}`
      }]
    };
  }
}

// Export metadata for Universal Command Registry auto-discovery
memoryRetrieve.description = "Retrieve memory by ID with context awareness and namespace scope";
memoryRetrieve.inputSchema = {
  type: 'object',
  properties: {
    memory_id: {
      type: 'string',
      description: 'Unique identifier of the memory to retrieve'
    },
    namespace: {
      type: 'string',
      default: 'auto',
      description: 'Memory namespace scope (auto-generated with agent context if not specified)'
    },
    agent_id: {
      type: 'string',
      default: 'auto',
      description: 'Agent identifier for namespace scoping'
    },
    session_id: {
      type: 'string',
      default: 'auto',
      description: 'Session identifier for context'
    },
    include_metadata: {
      type: 'boolean',
      default: true,
      description: 'Whether to include metadata in response'
    },
    format: {
      type: 'string',
      enum: ['full', 'content_only'],
      default: 'full',
      description: 'Response format - full details or content only'
    }
  },
  required: ['memory_id']
};

// Tool export for Universal Command Registry
export const memoryRetrieveTool = {
  name: 'memory_retrieve',
  description: memoryRetrieve.description,
  inputSchema: memoryRetrieve.inputSchema,
  handler: memoryRetrieve
};