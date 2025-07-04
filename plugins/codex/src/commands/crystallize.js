/**
 * Codex Crystallize Command - Hexagonal Architecture
 * Port: Command interface for knowledge crystallization  
 */

import { createCrystallizationAdapter } from '../adapters/crystallization-adapter.js';

export async function codex_crystallize(technology, options = {}) {
  const crystallizationAdapter = createCrystallizationAdapter(options);
  return await crystallizationAdapter.crystallize(technology, options);
}