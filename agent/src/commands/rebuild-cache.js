/**
 * Rebuild Cache Command
 * Cache management and embedding rebuilding
 */
import { ContextLoader } from '../context-loader.js';

export async function rebuildCache(args, dependencies) {
  const { contextLoader, semanticLookup } = dependencies || {};
  const { rebuild_embeddings = true } = args; // Default to true
  
  const result = await contextLoader.rebuildCache();
  
  if (rebuild_embeddings) {
    const contexts = await contextLoader.loadAll();
    await semanticLookup.buildEmbeddings(contexts);
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `✅ Cache rebuilt successfully\n\n${result.summary}`,
      },
    ],
  };
}

// Add function metadata
rebuildCache.description = 'Rebuild context cache and semantic embeddings';
rebuildCache.inputSchema = {
  type: 'object',
  properties: {
    rebuild_embeddings: {
      type: 'boolean',
      default: true,
      description: 'Whether to rebuild semantic embeddings',
    },
  },
};

// MCP Tool Export
export const rebuildCacheTool = {
  name: 'rebuild_cache',
  description: rebuildCache.description,
  inputSchema: rebuildCache.inputSchema,
  handler: rebuildCache
};