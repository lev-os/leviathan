/**
 * Spawn Integration - Wires spawn agent into MCP pipeline
 * Connects spawn tools, pipeline plugins, and handoff mechanisms
 */

import { spawnAgent, spawnTools, start_spawn, check_spawns, get_spawn_result, kill_spawn } from './spawn-mcp-tools.js';
import MCPPipeline, { spawnStatusPlugin } from './mcp-pipeline.js';
import BackgroundMonitor, { backgroundMonitorPlugin } from './background-monitor.js';

// Create spawn tool handlers map
export const spawnHandlers = {
  start_spawn,
  check_spawns,
  get_spawn_result,
  kill_spawn
};

// Integrate spawn tools into MCP server
export function integrateSpawnWithMCP(mcpServer) {
  // 1. Create pipeline if not exists
  if (!mcpServer.pipeline) {
    mcpServer.pipeline = new MCPPipeline();
  }
  
  // 2. Create background monitor if not exists
  if (!mcpServer.backgroundMonitor) {
    mcpServer.backgroundMonitor = new BackgroundMonitor();
  }
  
  // 3. Register spawn monitor
  mcpServer.backgroundMonitor.register('spawn', async () => {
    await spawnAgent.checkAllSpawns();
    const completed = [];
    const pending = [];
    const failed = [];
    
    for (const [id, meta] of spawnAgent.spawns) {
      if (meta.status === 'completed') {
        completed.push({ id, ...meta });
      } else if (meta.status === 'running') {
        pending.push({ id });
      } else if (meta.status === 'failed' || meta.status === 'timeout') {
        failed.push({ id, ...meta });
      }
    }
    
    return { completed, pending, failed };
  });
  
  // 4. Register background monitor plugin
  mcpServer.pipeline.addPlugin({
    ...backgroundMonitorPlugin,
    pre: async (context) => {
      context.backgroundMonitor = mcpServer.backgroundMonitor;
      if (backgroundMonitorPlugin.pre) {
        await backgroundMonitorPlugin.pre(context);
      }
    },
    post: async (context) => {
      context.backgroundMonitor = mcpServer.backgroundMonitor;
      if (backgroundMonitorPlugin.post) {
        await backgroundMonitorPlugin.post(context);
      }
    }
  });
  
  // 3. Add spawn tools to available tools
  const originalGetTools = mcpServer.getTools.bind(mcpServer);
  mcpServer.getTools = function() {
    const baseTools = originalGetTools();
    const spawnToolDefs = Object.entries(spawnTools).map(([name, def]) => ({
      name,
      ...def
    }));
    return [...baseTools, ...spawnToolDefs];
  };
  
  // 4. Add spawn handlers to tool routing
  const originalHandleToolCall = mcpServer.handleToolCall.bind(mcpServer);
  mcpServer.handleToolCall = async function(toolName, args) {
    // Check if it's a spawn tool
    if (spawnHandlers[toolName]) {
      // Run through pipeline
      return mcpServer.pipeline.execute(
        toolName,
        args,
        async (args) => spawnHandlers[toolName](args)
      );
    }
    
    // Otherwise use original handler (also through pipeline)
    return mcpServer.pipeline.execute(
      toolName,
      args,
      async (args) => originalHandleToolCall(toolName, args)
    );
  };
  
  // 5. Register spawn agent
  spawnAgent.registerWithPipeline(mcpServer.pipeline);
  
  return {
    message: 'Spawn system integrated with MCP',
    features: [
      'Background task execution',
      'Automatic status checking on every MCP call',
      'Agent handoff on completion',
      'Pipeline plugin architecture'
    ]
  };
}

// Process spawn handoff back to calling agent
async function processSpawnHandoff(mcpServer, spawnData) {
  const { callbackTool, payload } = spawnData;
  
  // Find the appropriate handler
  if (mcpServer.toolHandlers && mcpServer.toolHandlers[callbackTool]) {
    await mcpServer.toolHandlers[callbackTool](payload);
  } else {
    console.warn(`No handler found for spawn callback: ${callbackTool}`);
  }
}

// Example: Task decomposition spawn handler
export function registerTaskDecompositionHandler(mcpServer) {
  if (!mcpServer.toolHandlers) {
    mcpServer.toolHandlers = {};
  }
  
  mcpServer.toolHandlers.process_decomposition = async (payload) => {
    const { results, project, spawnId } = payload;
    
    // Process decomposition results
    console.log(`Processing decomposition results from spawn ${spawnId}`);
    
    // Create subtasks from results
    if (results.subtasks) {
      for (const subtask of results.subtasks) {
        await mcpServer.handleToolCall('create_task', {
          project: project,
          ...subtask
        });
      }
    }
    
    return {
      message: `Processed ${results.subtasks?.length || 0} subtasks from spawn`,
      spawnId: spawnId
    };
  };
}

export default integrateSpawnWithMCP;