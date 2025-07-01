/**
 * Memory Query Command - Semantic search across memory types
 * Part of Memory Core Package integration with Universal Command Registry
 */

export async function memoryQuery(args, dependencies) {
  const { memoryManager } = dependencies || {};
  const { 
    query, 
    type = 'all',
    namespace = 'auto',
    agent_id = 'auto',
    limit = 10,
    include_relationships = false,
    time_range = null,
    similarity_threshold = 0.7
  } = args;

  if (!memoryManager) {
    return {
      success: false,
      error: 'Memory system not initialized',
      content: [{
        type: 'text',
        text: '❌ **Memory Query Failed**\n\nMemory system not available. Check system status.'
      }]
    };
  }

  try {
    // Build query request with context
    const queryRequest = {
      query,
      type: type === 'all' ? undefined : type,
      namespace: namespace === 'auto' ? `agent-${agent_id}` : namespace,
      limit: Math.min(limit, 50), // Cap at 50 results
      context: {
        agent_id,
        similarity_threshold,
        include_relationships
      }
    };

    // Add time range if specified
    if (time_range) {
      queryRequest.timeRange = time_range;
    }

    // Execute hybrid query through memory manager
    const results = await memoryManager.query(queryRequest);

    if (!results || !results.merged) {
      return {
        success: false,
        error: 'No results found',
        content: [{
          type: 'text',
          text: `🔍 **No Memories Found**\n\n**Query:** "${query}"\n**Type:** ${type}\n**Namespace:** ${queryRequest.namespace}\n\nTry a different search term or check if memories exist in this context.`
        }]
      };
    }

    // Format results for display
    const items = results.merged.items || [];
    const relationships = results.merged.relationships || [];
    const source = results.source || 'unknown';

    let responseText = `🔍 **Memory Search Results**\n\n` +
      `**Query:** "${query}"\n` +
      `**Type Filter:** ${type}\n` +
      `**Namespace:** ${queryRequest.namespace}\n` +
      `**Source:** ${source}\n` +
      `**Results:** ${items.length}/${limit}\n` +
      `**Threshold:** ${similarity_threshold}\n\n`;

    if (items.length === 0) {
      responseText += `No matching memories found.`;
    } else {
      responseText += `**Matches:**\n`;
      
      items.slice(0, limit).forEach((item, index) => {
        const score = item.score || item.similarity || 'N/A';
        const type = item.type || 'unknown';
        const id = item.memory_id || item.id || `result-${index}`;
        const preview = item.content ? 
          (item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content) :
          'No content preview';

        responseText += `\n${index + 1}. **${type.toUpperCase()}** (Score: ${score})\n`;
        responseText += `   ID: \`${id}\`\n`;
        responseText += `   Preview: "${preview}"\n`;
        
        if (item.metadata && item.metadata.timestamp) {
          responseText += `   Created: ${item.metadata.timestamp}\n`;
        }
      });
    }

    // Add relationship information if available and requested
    if (include_relationships && relationships.length > 0) {
      responseText += `\n\n**Relationships Found:** ${relationships.length}`;
      relationships.slice(0, 5).forEach((rel, index) => {
        responseText += `\n${index + 1}. ${rel.source} → ${rel.target} (${rel.type})`;
      });
    }

    // Add temporal context if available
    if (results.merged.temporal_context) {
      responseText += `\n\n**Temporal Context:** ${results.merged.temporal_context}`;
    }

    return {
      success: true,
      query,
      results_count: items.length,
      source: source,
      items: items,
      relationships: include_relationships ? relationships : null,
      content: [{
        type: 'text',
        text: responseText
      }]
    };

  } catch (error) {
    return {
      success: false,
      error: `Memory query failed: ${error.message}`,
      content: [{
        type: 'text',
        text: `❌ **Memory Query Failed**\n\n**Error:** ${error.message}\n**Query:** "${query}"\n**Type:** ${type}\n**Namespace:** ${namespace}`
      }]
    };
  }
}

// Export metadata for Universal Command Registry auto-discovery
memoryQuery.description = "Semantic search across memory types with relationship and temporal context";
memoryQuery.inputSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Search query text for semantic matching'
    },
    type: {
      type: 'string',
      enum: ['all', 'procedural', 'semantic', 'temporal', 'working', 'episodic'],
      default: 'all',
      description: 'Memory type filter (searches all types if not specified)'
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
    limit: {
      type: 'integer',
      default: 10,
      minimum: 1,
      maximum: 50,
      description: 'Maximum number of results to return'
    },
    include_relationships: {
      type: 'boolean',
      default: false,
      description: 'Whether to include relationship information in results'
    },
    time_range: {
      type: 'string',
      description: 'Time range filter (e.g., "last 24 hours", "this week")'
    },
    similarity_threshold: {
      type: 'number',
      default: 0.7,
      minimum: 0.0,
      maximum: 1.0,
      description: 'Minimum similarity score for results (0.0 to 1.0)'
    }
  },
  required: ['query']
};

// Tool export for Universal Command Registry
export const memoryQueryTool = {
  name: 'memory_query',
  description: memoryQuery.description,
  inputSchema: memoryQuery.inputSchema,
  handler: memoryQuery
};