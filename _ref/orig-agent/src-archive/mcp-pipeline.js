/**
 * MCP Pipeline - Plugin architecture for MCP request processing
 * Allows agents to register middleware that runs on every MCP call
 */

export class MCPPipeline {
  constructor() {
    this.plugins = [];
    this.preHandlers = [];
    this.postHandlers = [];
  }

  // Register a plugin that runs on every MCP call
  addPlugin(plugin) {
    const {
      name,
      priority = 50,
      pre,      // Runs before MCP tool execution
      post,     // Runs after MCP tool execution
      always    // Runs both pre and post
    } = plugin;

    if (always) {
      this.plugins.push({
        name,
        priority,
        execute: always
      });
    }

    if (pre) {
      this.preHandlers.push({
        name,
        priority,
        execute: pre
      });
    }

    if (post) {
      this.postHandlers.push({
        name,
        priority,
        execute: post
      });
    }

    // Sort by priority (higher runs first)
    this.plugins.sort((a, b) => b.priority - a.priority);
    this.preHandlers.sort((a, b) => b.priority - a.priority);
    this.postHandlers.sort((a, b) => b.priority - a.priority);

    return {
      message: `Plugin ${name} registered`,
      hooks: {
        always: !!always,
        pre: !!pre,
        post: !!post
      }
    };
  }

  // Execute pipeline for MCP request
  async execute(toolName, args, handler) {
    const context = {
      toolName,
      args,
      startTime: Date.now(),
      metadata: {}
    };

    // Run always plugins
    for (const plugin of this.plugins) {
      try {
        await plugin.execute(context);
      } catch (error) {
        console.error(`Plugin ${plugin.name} error:`, error);
      }
    }

    // Run pre-handlers
    for (const handler of this.preHandlers) {
      try {
        await handler.execute(context);
      } catch (error) {
        console.error(`Pre-handler ${handler.name} error:`, error);
      }
    }

    // Execute actual MCP tool
    let result;
    try {
      result = await handler(args);
      context.result = result;
      context.success = true;
    } catch (error) {
      context.error = error;
      context.success = false;
      throw error;
    }

    // Run post-handlers
    for (const handler of this.postHandlers) {
      try {
        await handler.execute(context);
      } catch (error) {
        console.error(`Post-handler ${handler.name} error:`, error);
      }
    }

    // Add pipeline metadata to result
    if (result && typeof result === 'object') {
      result.pipelineMetadata = {
        duration: Date.now() - context.startTime,
        pluginsExecuted: [
          ...this.plugins.map(p => p.name),
          ...this.preHandlers.map(p => p.name),
          ...this.postHandlers.map(p => p.name)
        ]
      };
    }

    return result;
  }

  // Remove a plugin
  removePlugin(name) {
    this.plugins = this.plugins.filter(p => p.name !== name);
    this.preHandlers = this.preHandlers.filter(p => p.name !== name);
    this.postHandlers = this.postHandlers.filter(p => p.name !== name);
  }

  // List all plugins
  listPlugins() {
    return {
      always: this.plugins.map(p => ({ name: p.name, priority: p.priority })),
      pre: this.preHandlers.map(p => ({ name: p.name, priority: p.priority })),
      post: this.postHandlers.map(p => ({ name: p.name, priority: p.priority }))
    };
  }
}

// Example spawn agent plugin
export const spawnStatusPlugin = {
  name: 'spawn-status-checker',
  priority: 100,
  always: async (context) => {
    // This runs on EVERY MCP call
    const spawnAgent = context.spawnAgent;
    if (spawnAgent) {
      const statusUpdate = await spawnAgent.checkAllSpawns();
      
      // Inject spawn status into context if we have completed spawns
      if (statusUpdate && statusUpdate.completed && statusUpdate.completed.length > 0) {
        context.metadata.completedSpawns = statusUpdate.completed;
        
        // Add to agent instructions if there are completions
        if (context.result && context.result.agentInstructions) {
          context.result.agentInstructions += `\n\n⚡ SPAWN UPDATES:\n`;
          statusUpdate.completed.forEach(s => {
            context.result.agentInstructions += `- Spawn ${s.id} completed! Process with ${s.callbackTool}\n`;
          });
        }
      }
    }
  }
};

// Example usage in MCP server
export function enhanceMCPWithPipeline(mcpServer, pipeline) {
  const originalHandleToolCall = mcpServer.handleToolCall.bind(mcpServer);
  
  mcpServer.handleToolCall = async function(toolName, args) {
    return pipeline.execute(
      toolName,
      args,
      async (args) => originalHandleToolCall(toolName, args)
    );
  };
  
  return mcpServer;
}

export default MCPPipeline;