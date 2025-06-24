/**
 * Workflow Initializer - Core workflow management logic
 * Extracted from index.js per _02-refactor.md Phase 1 specification
 */

import { WorkflowLoader } from '../../workflow-loader.js';
import { SemanticLookup } from '../../semantic-lookup.js';

export class WorkflowInitializer {
  constructor() {
    this.workflowLoader = new WorkflowLoader();
    this.semanticLookup = new SemanticLookup();
  }

  /**
   * Initialize workflow systems and semantic lookup
   */
  async initializeWorkflows() {
    // Future: Add workflow system initialization logic here
    // For now, just instantiate the services
    
    return {
      workflowLoader: this.workflowLoader,
      semanticLookup: this.semanticLookup
    };
  }

  /**
   * Get workflow dependencies for command execution
   */
  getWorkflowDependencies() {
    return {
      workflowLoader: this.workflowLoader,
      semanticLookup: this.semanticLookup
    };
  }
}