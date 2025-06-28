/**
 * @lev-os/workflow-orchestrator
 * 
 * Bi-directional workflow orchestration engine for Leviathan
 * Enables LLMs to orchestrate themselves through complex workflows
 * 
 * Core Philosophy:
 * - The LLM is the runtime, not code
 * - CLI orchestrates the orchestrator agent
 * - Track ALL outputs (files, markdown, PDFs, scripts)
 * - Intelligent output feeding between steps
 * - Maximum LLM intelligence through context switching
 */

// Export core components
export * from './core/index.js';

// Export adapters
export * from './adapters/cli/index.js';
export * from './adapters/mcp/workflow-mcp.js';
export * from './adapters/http/workflow-http.js';
export * from './llm/index.js';

import { WorkflowOrchestrator } from './core/workflow-orchestrator.js';
import { FlowMind } from './core/flowmind-base.js';

/**
 * Main plugin export for Leviathan integration
 */
export const plugin = {
  name: '@lev-os/workflow-orchestrator',
  version: '0.1.0',
  
  /**
   * Initialize the plugin with Leviathan core systems
   */
  async initialize(coreSystems) {
    console.log('🔄 Initializing Workflow Orchestrator plugin...');
    
    // Create default orchestrator instance
    const orchestrator = new WorkflowOrchestrator({
      contextPaths: [
        coreSystems.universalContextSystem?.contextPath,
        process.env.HOME + '/c'
      ],
      onEvent: (event, data) => {
        // Hook into Leviathan's event system
        if (coreSystems.eventBus) {
          coreSystems.eventBus.emit(event, data);
        }
      }
    });
    
    // Register with universal context system if available
    if (coreSystems.universalContextSystem) {
      coreSystems.universalContextSystem.registerHandler('workflow', {
        canHandle: (context) => context.type === 'workflow',
        execute: async (context, input) => {
          const workflow = new FlowMind(context);
          return await orchestrator.orchestrate(workflow.raw, input);
        }
      });
    }
    
    return { orchestrator };
  },
  
  /**
   * Register CLI commands
   */
  registerCommands(commandRegistry) {
    // Register workflow execution command
    commandRegistry.register('workflow', 'execute', {
      description: 'Execute a workflow with bi-directional orchestration',
      handler: async (args, dependencies) => {
        const { workflow, input = {} } = args;
        const orchestrator = dependencies.orchestrator || new WorkflowOrchestrator();
        
        // Load workflow
        const workflowContext = await dependencies.universalContextSystem?.loadContext(workflow);
        if (!workflowContext) {
          throw new Error(`Workflow not found: ${workflow}`);
        }
        
        // Execute with orchestration
        const result = await orchestrator.orchestrate(workflowContext, input);
        
        return {
          content: [{
            type: 'text',
            text: formatOrchestrationResult(result)
          }]
        };
      }
    });
    
    // Register orchestration status command
    commandRegistry.register('workflow', 'status', {
      description: 'Get status of active orchestrations',
      handler: async (args, dependencies) => {
        const { orchestrationId } = args;
        const orchestrator = dependencies.orchestrator || new WorkflowOrchestrator();
        
        if (orchestrationId) {
          const status = orchestrator.getOrchestrationStatus(orchestrationId);
          return {
            content: [{
              type: 'text',
              text: status ? formatStatus(status) : 'Orchestration not found'
            }]
          };
        }
        
        // List all active orchestrations
        const activeIds = Array.from(orchestrator.activeOrchestrations.keys());
        return {
          content: [{
            type: 'text',
            text: `Active orchestrations: ${activeIds.length}\n${activeIds.join('\n')}`
          }]
        };
      }
    });
  },
  
  /**
   * Register MCP tools
   */
  registerTools(toolRegistry) {
    // Workflow execution tool
    toolRegistry.register({
      name: 'workflow_orchestrate',
      description: 'Execute a workflow with bi-directional orchestration',
      inputSchema: {
        type: 'object',
        properties: {
          workflow: {
            type: 'string',
            description: 'Workflow ID or path to YAML'
          },
          input: {
            type: 'object',
            description: 'Input data for the workflow'
          },
          orchestrationId: {
            type: 'string',
            description: 'Optional orchestration ID for tracking'
          }
        },
        required: ['workflow']
      },
      handler: async (args, dependencies) => {
        const orchestrator = dependencies.orchestrator || new WorkflowOrchestrator();
        const workflowContext = await loadWorkflowContext(args.workflow, dependencies);
        return await orchestrator.orchestrate(workflowContext, args.input, args.orchestrationId);
      }
    });
    
    // LLM callback tool
    toolRegistry.register({
      name: 'workflow_callback',
      description: 'Handle callback from LLM during workflow execution',
      inputSchema: {
        type: 'object',
        properties: {
          callbackId: {
            type: 'string',
            description: 'Callback ID from context injection'
          },
          response: {
            type: 'object',
            description: 'LLM response data'
          }
        },
        required: ['callbackId', 'response']
      },
      handler: async (args, dependencies) => {
        const orchestrator = dependencies.orchestrator || new WorkflowOrchestrator();
        return await orchestrator.handleLLMCallback(args.callbackId, args.response);
      }
    });
  }
};

/**
 * Helper to load workflow context
 */
async function loadWorkflowContext(workflow, dependencies) {
  // Try universal context system first
  if (dependencies.universalContextSystem) {
    const context = await dependencies.universalContextSystem.loadContext(workflow);
    if (context) return context;
  }
  
  // Try loading as file path
  if (workflow.endsWith('.yaml') || workflow.endsWith('.yml')) {
    const fs = await import('fs/promises');
    const yaml = await import('js-yaml');
    const content = await fs.readFile(workflow, 'utf-8');
    return yaml.load(content);
  }
  
  throw new Error(`Cannot load workflow: ${workflow}`);
}

/**
 * Format orchestration result for display
 */
function formatOrchestrationResult(result) {
  const lines = [];
  
  lines.push('🔄 Workflow Orchestration Complete\n');
  lines.push(`✅ Success: ${result.success}`);
  lines.push(`🆔 Orchestration ID: ${result.orchestrationId}`);
  lines.push(`📋 Workflow: ${result.workflow}`);
  lines.push(`⏱️  Duration: ${result.duration}ms`);
  
  if (result.outputs) {
    lines.push(`\n📁 Outputs:`);
    lines.push(`  - Files: ${result.outputs.fileCount || 0}`);
    lines.push(`  - Steps: ${result.outputs.steps?.length || 0}`);
  }
  
  if (result.error) {
    lines.push(`\n❌ Error: ${result.error}`);
  }
  
  if (result.result?.summary) {
    lines.push(`\n📝 Summary:\n${result.result.summary}`);
  }
  
  return lines.join('\n');
}

/**
 * Format orchestration status
 */
function formatStatus(status) {
  const lines = [];
  
  lines.push(`📊 Orchestration Status`);
  lines.push(`🆔 ID: ${status.id}`);
  lines.push(`📋 Workflow: ${status.workflow}`);
  lines.push(`🔄 Status: ${status.status}`);
  lines.push(`📍 Current Step: ${status.currentStep}/${status.totalSteps}`);
  lines.push(`⏱️  Duration: ${status.duration}ms`);
  
  if (status.outputs) {
    lines.push(`\n📊 Output Summary:`);
    lines.push(`  - Step Count: ${status.outputs.stepCount}`);
    lines.push(`  - File Count: ${status.outputs.fileCount}`);
    lines.push(`  - Output Types: ${status.outputs.outputTypes?.join(', ')}`);
  }
  
  return lines.join('\n');
}

// Default export for direct usage
export default plugin;