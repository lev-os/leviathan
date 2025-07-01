/**
 * Memory Store Command - Store data with automatic namespace and type detection
 * Part of Memory Core Package integration with Universal Command Registry
 */

export async function memoryStore(args, dependencies) {
  const { memoryManager } = dependencies || {};
  const { 
    content, 
    type = 'auto', 
    metadata = {}, 
    namespace = 'auto',
    agent_id = 'auto',
    session_id = 'auto'
  } = args;

  if (!memoryManager) {
    return {
      success: false,
      error: 'Memory system not initialized',
      content: [{
        type: 'text',
        text: '❌ **Memory Store Failed**\n\nMemory system not available. Check system status.'
      }]
    };
  }

  try {
    // Auto-detect memory type if needed
    const detectedType = type === 'auto' ? detectMemoryType(content) : type;
    
    // Auto-generate namespace with agent context
    const effectiveNamespace = namespace === 'auto' 
      ? `agent-${agent_id}:memory:${detectedType}`
      : namespace;

    // Enhance metadata with context
    const enhancedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      agent_id: agent_id,
      session_id: session_id,
      namespace: effectiveNamespace,
      store_method: 'command_registry'
    };

    // Store using memory manager
    const result = await memoryManager.createMemory(content, detectedType, enhancedMetadata);

    const responseText = `💾 **Memory Stored Successfully**\n\n` +
      `**Type:** ${detectedType}\n` +
      `**Namespace:** ${effectiveNamespace}\n` +
      `**Content Length:** ${content.length} characters\n` +
      `**Memory ID:** ${result.memory_id || 'generated'}\n` +
      `**Agent Context:** ${agent_id}\n` +
      `**Session:** ${session_id}\n` +
      `**Timestamp:** ${enhancedMetadata.timestamp}\n\n` +
      `✅ Memory indexed and available for retrieval`;

    return {
      success: true,
      memory_id: result.memory_id,
      type: detectedType,
      namespace: effectiveNamespace,
      content: [{
        type: 'text',
        text: responseText
      }]
    };

  } catch (error) {
    return {
      success: false,
      error: `Memory store failed: ${error.message}`,
      content: [{
        type: 'text',
        text: `❌ **Memory Store Failed**\n\n**Error:** ${error.message}\n**Type:** ${type}\n**Namespace:** ${namespace}`
      }]
    };
  }
}

// Helper function to detect memory type from content
function detectMemoryType(content) {
  // Procedural: contains step-by-step instructions or workflows
  if (/step|phase|process|workflow|procedure|method|how to/i.test(content)) {
    return 'procedural';
  }
  
  // Semantic: contains facts, definitions, or knowledge
  if (/definition|fact|knowledge|concept|api|documentation/i.test(content)) {
    return 'semantic';
  }
  
  // Temporal: contains timestamps, history, or timeline data
  if (/timestamp|history|timeline|session|conversation/i.test(content)) {
    return 'temporal';
  }
  
  // Working: contains current context or active variables
  if (/current|active|working|context|variable|state/i.test(content)) {
    return 'working';
  }
  
  // Episodic: contains experiences, learning, or personal insights
  if (/learned|experience|insight|success|failure|pattern/i.test(content)) {
    return 'episodic';
  }
  
  // Default to semantic for general content
  return 'semantic';
}

// Export metadata for Universal Command Registry auto-discovery
memoryStore.description = "Store data with automatic namespace and type detection";
memoryStore.inputSchema = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      description: 'Content to store in memory system'
    },
    type: {
      type: 'string',
      enum: ['auto', 'procedural', 'semantic', 'temporal', 'working', 'episodic'],
      default: 'auto',
      description: 'Memory type (auto-detected if not specified)'
    },
    metadata: {
      type: 'object',
      description: 'Additional metadata to store with content',
      default: {}
    },
    namespace: {
      type: 'string',
      default: 'auto',
      description: 'Memory namespace (auto-generated with agent context if not specified)'
    },
    agent_id: {
      type: 'string',
      default: 'auto',
      description: 'Agent identifier for namespace isolation'
    },
    session_id: {
      type: 'string',
      default: 'auto',
      description: 'Session identifier for context tracking'
    }
  },
  required: ['content']
};

// Tool export for Universal Command Registry
export const memoryStoreTool = {
  name: 'memory_store',
  description: memoryStore.description,
  inputSchema: memoryStore.inputSchema,
  handler: memoryStore
};