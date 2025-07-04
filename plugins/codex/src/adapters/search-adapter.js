/**
 * Search Adapter - Hexagonal Architecture
 * Adapter: Implements search port using knowledge repository
 */

import { createKnowledgeRepository } from '../infrastructure/knowledge-repository.js';
import { createSearchEngine } from '../domain/search-engine.js';

export function createSearchAdapter(options = {}) {
  const repository = createKnowledgeRepository();
  const searchEngine = createSearchEngine();
  
  return {
    async search(query, searchOptions = {}) {
      const knowledge = await repository.loadKnowledge();
      return await searchEngine.search(query, knowledge, searchOptions);
    }
  };
}