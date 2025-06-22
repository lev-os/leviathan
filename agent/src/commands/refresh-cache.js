/**
 * Refresh Cache Command
 * Cache management and embedding rebuilding
 */

export async function refreshCache(args, dependencies) {
  const { workflowLoader, semanticLookup } = dependencies || {};
  const { rebuild_embeddings = false } = args;
  
  const result = await workflowLoader.refreshCache();
  
  if (rebuild_embeddings) {
    await semanticLookup.rebuildEmbeddings();
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `✅ Cache refreshed successfully\n\n${result.summary}`,
      },
    ],
  };
}

// Add function metadata
refreshCache.description = 'Refresh workflow cache and optionally rebuild embeddings';
refreshCache.inputSchema = {
  type: 'object',
  properties: {
    rebuild_embeddings: {
      type: 'boolean',
      default: false,
      description: 'Whether to rebuild semantic embeddings',
    },
  },
};

// MCP Tool Export
export const refreshCacheTool = {
  name: 'refresh_cache',
  description: refreshCache.description,
  inputSchema: refreshCache.inputSchema,
  handler: refreshCache
};