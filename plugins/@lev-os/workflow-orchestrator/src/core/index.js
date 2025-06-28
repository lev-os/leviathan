/**
 * Core Module - Exports all core components
 * 
 * This is the foundation of the bi-directional orchestration system
 */

export { FlowMind, createFlowMind } from './flowmind-base.js';
export { WorkflowOrchestrator } from './workflow-orchestrator.js';
export { ContextSwitcher } from './context-switcher.js';
export { OutputManager } from './output-manager.js';
export { FeedbackLoop } from './feedback-loop.js';

// Export convenience factory
export function createOrchestrator(options = {}) {
  return new WorkflowOrchestrator(options);
}