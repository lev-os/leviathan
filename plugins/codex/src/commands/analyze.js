/**
 * Codex Analyze Command - Hexagonal Architecture  
 * Port: Command interface for pattern analysis
 */

import { createAnalysisAdapter } from '../adapters/analysis-adapter.js';

export async function codex_analyze(pattern, options = {}) {
  const analysisAdapter = createAnalysisAdapter(options);
  return await analysisAdapter.analyze(pattern, options);
}