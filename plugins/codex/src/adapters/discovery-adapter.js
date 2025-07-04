/**
 * Discovery Adapter - Hexagonal Architecture
 * Adapter: Implements discovery port using framework discovery engine
 */

import { createKnowledgeRepository } from '../infrastructure/knowledge-repository.js';
import { createDiscoveryEngine } from '../domain/discovery-engine.js';

export function createDiscoveryAdapter(options = {}) {
  const repository = createKnowledgeRepository();
  const discoveryEngine = createDiscoveryEngine();
  
  return {
    async discover(framework, discoveryOptions = {}) {
      const knowledge = await repository.loadKnowledge();
      return await discoveryEngine.discover(framework, knowledge, discoveryOptions);
    }
  };
}