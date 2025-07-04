/**
 * Analysis Adapter - Hexagonal Architecture
 * Adapter: Implements analysis port using pattern analysis engine
 */

import { createKnowledgeRepository } from '../infrastructure/knowledge-repository.js';
import { createPatternAnalyzer } from '../domain/pattern-analyzer.js';

export function createAnalysisAdapter(options = {}) {
  const repository = createKnowledgeRepository();
  const analyzer = createPatternAnalyzer();
  
  return {
    async analyze(pattern, analysisOptions = {}) {
      const knowledge = await repository.loadKnowledge();
      return await analyzer.analyze(pattern, knowledge, analysisOptions);
    }
  };
}