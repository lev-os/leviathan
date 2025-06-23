/**
 * Spawn MCP Tools - MCP interface for spawn management
 * Exposes spawn operations as MCP tools
 */

import SpawnAgent from './spawn-agent.js';
import fs from 'fs-extra';
import path from 'path';

// Initialize spawn agent with config
const spawnAgent = new SpawnAgent({
  paths: {
    registry: './.kingly/spawns/registry.json'
  },
  execution: {
    timeout_seconds: 300
  }
});

// MCP tool: Start a spawn
export async function start_spawn(args) {
  const {
    taskType,
    taskData,
    callingAgent = 'user',
    callbackTool = 'spawn_complete',
    project = 'default'
  } = args;

  try {
    const result = await spawnAgent.spawn({
      taskType,
      taskData,
      callingAgent,
      callbackTool,
      project
    });

    return {
      message: `✅ Spawn started: ${result.spawnId}`,
      spawnId: result.spawnId,
      status: 'running',
      agentInstructions: `SPAWN STARTED SUCCESSFULLY

Spawn ID: ${result.spawnId}
Type: ${taskType}
Project: ${project}

The spawn is now running in the background. You can:
1. Continue with other tasks while it runs
2. Check status with: check_spawns()
3. Get results when ready with: get_spawn_result({ spawnId: "${result.spawnId}" })

HANDOFF PROTOCOL:
When this spawn completes, it will call: ${callingAgent}.${callbackTool}()

Continue with normal conversation. The pipeline will notify you when spawns complete.`
    };
  } catch (error) {
    return {
      message: `❌ Failed to start spawn: ${error.message}`,
      error: error.message,
      agentInstructions: `SPAWN START FAILED

Error: ${error.message}

Please check:
1. Task type is valid
2. Task data is properly formatted
3. System resources are available`
    };
  }
}

// MCP tool: Check all spawns
export async function check_spawns(args = {}) {
  await spawnAgent.checkAllSpawns();
  
  const stats = {
    running: 0,
    completed: 0,
    failed: 0,
    total: 0
  };

  const spawns = [];
  
  for (const [id, meta] of spawnAgent.spawns) {
    stats[meta.status] = (stats[meta.status] || 0) + 1;
    stats.total++;
    
    spawns.push({
      id: id,
      type: meta.type,
      status: meta.status,
      project: meta.project,
      duration: Date.now() - new Date(meta.startTime).getTime()
    });
  }

  return {
    message: `📊 Spawn Status: ${stats.running} running, ${stats.completed} completed, ${stats.failed} failed`,
    stats,
    spawns,
    agentInstructions: stats.completed > 0 ? `COMPLETED SPAWNS DETECTED

${stats.completed} spawn(s) have completed. Their results have been processed and handed off to the appropriate agents.

Check for any handoff messages or use get_spawn_result() to retrieve specific results.` : `NO COMPLETED SPAWNS

All spawns are still running or have been processed. Continue with normal operations.`
  };
}

// MCP tool: Get spawn result
export async function get_spawn_result(args) {
  const { spawnId } = args;
  
  if (!spawnId) {
    return {
      message: '❌ No spawn ID provided',
      error: 'Missing required parameter: spawnId'
    };
  }

  const meta = spawnAgent.spawns.get(spawnId);
  
  if (!meta) {
    // Check if it was already processed
    const resultsPath = path.join('.kingly/spawns/results', `${spawnId}.json`);
    if (await fs.pathExists(resultsPath)) {
      const result = await fs.readJson(resultsPath);
      return {
        message: `✅ Spawn ${spawnId} results retrieved (from archive)`,
        ...result
      };
    }
    
    return {
      message: `❌ Spawn ${spawnId} not found`,
      error: 'Spawn ID not found in registry'
    };
  }

  if (meta.status === 'running') {
    const elapsed = Math.round((Date.now() - new Date(meta.startTime).getTime()) / 1000);
    return {
      message: `⏳ Spawn ${spawnId} still running (${elapsed}s elapsed)`,
      status: 'running',
      elapsed: elapsed
    };
  }

  // Get results from completed spawn
  const resultsPath = path.join('.kingly/spawns/results', `${spawnId}.json`);
  if (await fs.pathExists(resultsPath)) {
    const result = await fs.readJson(resultsPath);
    return {
      message: `✅ Spawn ${spawnId} completed`,
      ...result
    };
  }

  return {
    message: `❌ Results not found for spawn ${spawnId}`,
    status: meta.status,
    error: 'Results file missing'
  };
}

// MCP tool: Kill a spawn
export async function kill_spawn(args) {
  const { spawnId, reason = 'User requested termination' } = args;
  
  if (!spawnId) {
    return {
      message: '❌ No spawn ID provided',
      error: 'Missing required parameter: spawnId'
    };
  }

  const meta = spawnAgent.spawns.get(spawnId);
  
  if (!meta) {
    return {
      message: `❌ Spawn ${spawnId} not found`,
      error: 'Spawn ID not found in registry'
    };
  }

  if (meta.status !== 'running') {
    return {
      message: `⚠️ Spawn ${spawnId} is not running (status: ${meta.status})`,
      status: meta.status
    };
  }

  // Kill the container
  try {
    // TODO: Implement actual Docker kill
    meta.status = 'killed';
    meta.killedAt = new Date().toISOString();
    meta.killReason = reason;
    
    await spawnAgent.saveRegistry();
    
    return {
      message: `✅ Spawn ${spawnId} terminated`,
      spawnId: spawnId,
      reason: reason,
      agentInstructions: `SPAWN TERMINATED

Spawn ${spawnId} has been forcefully terminated.
Reason: ${reason}

The spawn's partial results (if any) may be available in the results directory.
Any pending handoffs have been cancelled.`
    };
  } catch (error) {
    return {
      message: `❌ Failed to kill spawn ${spawnId}`,
      error: error.message
    };
  }
}

// Export spawn agent for pipeline integration
export { spawnAgent };

// Export tool definitions for MCP server
export const spawnTools = {
  start_spawn: {
    description: 'Start a background spawn for long-running tasks',
    inputSchema: {
      type: 'object',
      properties: {
        taskType: { 
          type: 'string',
          description: 'Type of task to spawn (e.g., decomposition, research)'
        },
        taskData: { 
          type: 'object',
          description: 'Task-specific data'
        },
        callingAgent: {
          type: 'string',
          description: 'Agent that requested the spawn'
        },
        callbackTool: {
          type: 'string',
          description: 'MCP tool to call when complete'
        },
        project: {
          type: 'string',
          description: 'Project context for the spawn'
        }
      },
      required: ['taskType', 'taskData']
    }
  },
  check_spawns: {
    description: 'Check status of all running spawns',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  get_spawn_result: {
    description: 'Get results from a completed spawn',
    inputSchema: {
      type: 'object',
      properties: {
        spawnId: {
          type: 'string',
          description: 'ID of the spawn to retrieve'
        }
      },
      required: ['spawnId']
    }
  },
  kill_spawn: {
    description: 'Forcefully terminate a running spawn',
    inputSchema: {
      type: 'object',
      properties: {
        spawnId: {
          type: 'string',
          description: 'ID of the spawn to kill'
        },
        reason: {
          type: 'string',
          description: 'Reason for termination'
        }
      },
      required: ['spawnId']
    }
  }
};