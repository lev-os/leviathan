/**
 * Codex Discover Command - Hexagonal Architecture
 * Port: Command interface for framework discovery
 */

import { createDiscoveryAdapter } from '../adapters/discovery-adapter.js';

export async function codex_discover(framework, options = {}) {
  const discoveryAdapter = createDiscoveryAdapter(options);
  return await discoveryAdapter.discover(framework, options);
}