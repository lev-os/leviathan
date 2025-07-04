/**
 * Codex Search Command - Hexagonal Architecture
 * Port: Command interface for framework knowledge search
 */

import { createSearchAdapter } from '../adapters/search-adapter.js';

export async function codex_search(query, options = {}) {
  const searchAdapter = createSearchAdapter(options);
  return await searchAdapter.search(query, options);
}