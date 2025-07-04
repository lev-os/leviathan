/**
 * Crystallization Adapter - Hexagonal Architecture
 * Adapter: Implements crystallization port using knowledge crystallization engine
 */

import { createKnowledgeRepository } from '../infrastructure/knowledge-repository.js';
import { createCrystallizationEngine } from '../domain/crystallization-engine.js';

export function createCrystallizationAdapter(options = {}) {
  const repository = createKnowledgeRepository();
  const crystallizationEngine = createCrystallizationEngine();
  
  return {
    async crystallize(technology, crystallizationOptions = {}) {
      const knowledge = await repository.loadKnowledge();
      return await crystallizationEngine.crystallize(technology, knowledge, crystallizationOptions);
    }
  };
}