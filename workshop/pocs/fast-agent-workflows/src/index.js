/**
 * Fast-Agent Workflow Integration POC
 * 
 * This POC demonstrates how to integrate fast-agent's sophisticated
 * workflow patterns into Leviathan's existing architecture.
 */

import { ChainWorkflow } from './workflows/chain.js';
import { OrchestratorWorkflow } from './workflows/orchestrator.js';
import { EvaluatorOptimizer } from './workflows/evaluator.js';
import { MCPBridge } from './integration/mcp-bridge.js';
import { SessionBridge } from './integration/session-bridge.js';

export class WorkflowEngine {
  constructor(leviathanAgent) {
    this.agent = leviathanAgent;
    this.workflows = new Map();
    this.mcpBridge = new MCPBridge();
    this.sessionBridge = new SessionBridge();
    
    // Register workflow types
    this.registerWorkflow('chain', ChainWorkflow);
    this.registerWorkflow('orchestrator', OrchestratorWorkflow);
    this.registerWorkflow('evaluator', EvaluatorOptimizer);
  }
  
  /**
   * Register a workflow type
   */
  registerWorkflow(name, WorkflowClass) {
    this.workflows.set(name, WorkflowClass);
  }
  
  /**
   * Execute a workflow
   */
  async execute(workflowType, config) {
    const WorkflowClass = this.workflows.get(workflowType);
    if (!WorkflowClass) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }
    
    // Create workflow instance
    const workflow = new WorkflowClass(this.agent, config);
    
    // Set up session tracking
    const sessionId = await this.sessionBridge.createWorkflowSession(workflowType);
    
    try {
      // Execute workflow
      const result = await workflow.execute();
      
      // Save checkpoint
      await this.sessionBridge.checkpoint(sessionId, {
        workflowType,
        result,
        status: 'completed'
      });
      
      return result;
    } catch (error) {
      // Save error checkpoint
      await this.sessionBridge.checkpoint(sessionId, {
        workflowType,
        error: error.message,
        status: 'failed'
      });
      
      throw error;
    }
  }
  
  /**
   * Expose workflows as MCP tools
   */
  getMCPTools() {
    return this.mcpBridge.createWorkflowTools(this.workflows);
  }
}