/**
 * Process Integration - Add process management to MCP
 */

import { 
  processTools, 
  start_dev_server, 
  list_processes, 
  get_process_status, 
  kill_process 
} from './process-mcp-tools.js';

// Process handlers map
export const processHandlers = {
  start_dev_server,
  list_processes,
  get_process_status,
  kill_process
};

// Integrate process tools into MCP server
export function integrateProcessTools(mcpServer) {
  // Add process tools to available tools
  const originalGetTools = mcpServer.getTools.bind(mcpServer);
  mcpServer.getTools = function() {
    const baseTools = originalGetTools();
    const processToolDefs = Object.entries(processTools).map(([name, def]) => ({
      name,
      ...def
    }));
    return [...baseTools, ...processToolDefs];
  };
  
  // Add process handlers to tool routing
  const originalHandleToolCall = mcpServer.handleToolCall.bind(mcpServer);
  mcpServer.handleToolCall = async function(toolName, args) {
    // Check if it's a process tool
    if (processHandlers[toolName]) {
      // Run through pipeline if available
      if (mcpServer.pipeline) {
        return mcpServer.pipeline.execute(
          toolName,
          args,
          async (args) => processHandlers[toolName](args)
        );
      } else {
        return processHandlers[toolName](args);
      }
    }
    
    // Otherwise use original handler
    return originalHandleToolCall(toolName, args);
  };
  
  // Also register process monitor with background monitor
  if (mcpServer.backgroundMonitor) {
    mcpServer.backgroundMonitor.register('process', async () => {
      const processes = await list_processes({ status: 'running' });
      
      // Format for monitor
      return {
        completed: [],
        pending: processes.processes
          ?.filter(p => p.status === 'running')
          .map(p => ({ id: p.id, type: p.type })) || [],
        failed: []
      };
    });
  }
  
  return {
    message: 'Process management tools integrated',
    tools: Object.keys(processTools)
  };
}

export default integrateProcessTools;