/**
 * Kingly Agent System - Ports & Adapters Architecture
 * Clean separation of concerns with dependency injection
 */

import { KinglyAgent } from './infrastructure/server.js';

// Re-export from new architecture
export { KinglyAgent, startKinglyAgent } from './infrastructure/server.js';
export default KinglyAgent;