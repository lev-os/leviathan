/**
 * Spawn Agent - Manages parallel execution lifecycle
 * Registers with MCP pipeline for automatic status checks
 */

import fs from 'fs-extra';
import path from 'path';
import DockerSpawnAdapter from './docker-spawn-adapter.js';
import ProcessAdapter from './process-adapter.js';

export class SpawnAgent {
  constructor(config) {
    this.config = config;
    this.spawns = new Map();
    this.handlers = new Map(); // Who to call when spawn completes
    
    // Persistent spawn registry
    this.registryPath = config.paths?.registry || './.kingly/spawns/registry.json';
    this.loadRegistry();
    
    // Initialize adapters
    this.dockerAdapter = new DockerSpawnAdapter(config);
    this.processAdapter = new ProcessAdapter({
      logsPath: './.kingly/processes/logs',
      registryPath: './.kingly/processes/registry.json'
    });
  }

  // Register with MCP pipeline
  registerWithPipeline(pipeline) {
    pipeline.addPlugin({
      name: 'spawn-status-checker',
      priority: 100, // Run early in pipeline
      always: async (context) => {
        // Check spawns on EVERY MCP call
        await this.checkAllSpawns();
      }
    });
  }

  // Start a spawn and register handler
  async spawn(request) {
    const { 
      taskType, 
      taskData, 
      callingAgent, // Who requested this spawn
      callbackTool, // What MCP tool to call when done
      project 
    } = request;
    
    const spawnId = `spawn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Save spawn metadata
    const spawnMeta = {
      id: spawnId,
      type: taskType,
      status: 'starting',
      callingAgent: callingAgent,
      callbackTool: callbackTool,
      project: project,
      startTime: new Date().toISOString(),
      container: null
    };
    
    this.spawns.set(spawnId, spawnMeta);
    this.handlers.set(spawnId, {
      agent: callingAgent,
      tool: callbackTool
    });
    
    // Persist to registry
    await this.saveRegistry();
    
    // Actually start the container
    const container = await this.startContainer(spawnId, taskType, taskData);
    spawnMeta.container = container.id;
    spawnMeta.status = 'running';
    
    await this.saveRegistry();
    
    return {
      spawnId,
      message: `Spawn ${spawnId} started`,
      handoffInstructions: `When complete, will call ${callingAgent}.${callbackTool}()`
    };
  }

  // Check all spawns (called on every MCP request)
  async checkAllSpawns() {
    const completed = [];
    const failed = [];
    
    for (const [spawnId, meta] of this.spawns) {
      if (meta.status === 'running') {
        const status = await this.checkContainer(meta.container);
        
        if (status === 'exited') {
          meta.status = 'completed';
          completed.push({
            id: spawnId,
            callbackTool: this.handlers.get(spawnId)?.tool,
            ...meta
          });
        } else if (status === 'failed') {
          meta.status = 'failed';
          failed.push({
            id: spawnId,
            ...meta
          });
        } else if (this.isTimedOut(meta)) {
          meta.status = 'timeout';
          failed.push({
            id: spawnId,
            ...meta
          });
        }
      }
    }
    
    // Process completions
    for (const spawn of completed) {
      await this.processCompletion(spawn.id);
    }
    
    // Process failures
    for (const spawn of failed) {
      await this.processFailure(spawn.id);
    }
    
    if (completed.length > 0 || failed.length > 0) {
      await this.saveRegistry();
    }
    
    return {
      completed,
      failed,
      running: Array.from(this.spawns.values()).filter(s => s.status === 'running').length
    };
  }

  // Process completed spawn
  async processCompletion(spawnId) {
    const meta = this.spawns.get(spawnId);
    const handler = this.handlers.get(spawnId);
    
    // Get results from container
    const results = await this.retrieveResults(meta.container);
    
    // Prepare handoff payload
    const handoff = {
      spawnId: spawnId,
      type: meta.type,
      status: 'completed',
      results: results,
      duration: Date.now() - new Date(meta.startTime).getTime(),
      project: meta.project
    };
    
    // Call the original agent's callback
    if (handler) {
      await this.handoffToAgent(handler.agent, handler.tool, handoff);
    }
    
    // Clean up
    await this.cleanup(spawnId);
  }

  // Process failed spawn
  async processFailure(spawnId) {
    const meta = this.spawns.get(spawnId);
    const handler = this.handlers.get(spawnId);
    
    // Prepare failure handoff
    const handoff = {
      spawnId: spawnId,
      type: meta.type,
      status: meta.status,
      error: meta.error || 'Spawn failed or timed out',
      duration: Date.now() - new Date(meta.startTime).getTime(),
      project: meta.project
    };
    
    // Call the original agent's error handler if available
    if (handler && handler.errorTool) {
      await this.handoffToAgent(handler.agent, handler.errorTool, handoff);
    }
    
    // Clean up
    await this.cleanup(spawnId);
  }

  // Handoff results back to calling agent
  async handoffToAgent(agentName, toolName, payload) {
    // This is where we call back to the original agent
    // Could be via MCP tool, event, or direct call
    
    return {
      message: `Handoff to ${agentName}.${toolName}`,
      payload: payload,
      agentInstructions: `SPAWN COMPLETION HANDOFF

Agent ${agentName} spawned task ${payload.spawnId}.
It has completed with status: ${payload.status}

HANDOFF PROTOCOL:
1. The ${agentName} agent should process these results
2. Use tool: ${toolName}(${JSON.stringify(payload)})
3. Original context has been preserved
4. Continue where that agent left off

Results summary:
- Type: ${payload.type}
- Duration: ${payload.duration}ms
- Status: ${payload.status}`
    };
  }

  // Persistence methods
  async loadRegistry() {
    try {
      const data = await fs.readJson(this.registryPath);
      this.spawns = new Map(data.spawns);
      this.handlers = new Map(data.handlers);
    } catch (error) {
      // Fresh start
      this.spawns = new Map();
      this.handlers = new Map();
    }
  }

  async saveRegistry() {
    await fs.ensureDir(path.dirname(this.registryPath));
    await fs.writeJson(this.registryPath, {
      spawns: Array.from(this.spawns.entries()),
      handlers: Array.from(this.handlers.entries()),
      updated: new Date().toISOString()
    });
  }

  // Container/Process management
  async startContainer(spawnId, taskType, taskData) {
    // Determine if this should be Docker or lightweight process
    const dockerTasks = ['test', 'code_generation', 'complex_analysis', 'security_scan'];
    const processTasks = ['dev_server', 'build', 'watch', 'lint'];
    
    if (dockerTasks.includes(taskType)) {
      // Use Docker for isolation
      return await this.dockerAdapter.startContainer(spawnId, taskType, taskData);
    } else if (processTasks.includes(taskType)) {
      // Use lightweight process
      const command = this.getProcessCommand(taskType, taskData);
      const result = await this.processAdapter.startProcess(command, {
        cwd: taskData.projectPath || process.cwd(),
        type: taskType,
        taskId: taskData.taskId
      });
      
      return {
        id: result.processId,
        type: 'process'
      };
    } else {
      // Default to Docker for unknown types
      return await this.dockerAdapter.startContainer(spawnId, taskType, taskData);
    }
  }

  async checkContainer(containerId) {
    // Check if it's a process or container
    if (containerId.startsWith('proc-')) {
      const status = await this.processAdapter.getProcessStatus(containerId);
      if (status.error) return 'not_found';
      return status.status === 'running' ? 'running' : 'exited';
    } else {
      return await this.dockerAdapter.checkContainer(containerId);
    }
  }

  async retrieveResults(containerId) {
    if (containerId.startsWith('proc-')) {
      // Get process results
      const status = await this.processAdapter.getProcessStatus(containerId);
      return {
        type: 'process',
        status: status.status,
        logs: status.recentLogs,
        exitCode: status.exitCode
      };
    } else {
      // Get Docker results
      return await this.dockerAdapter.retrieveResults(containerId);
    }
  }
  
  getProcessCommand(taskType, taskData) {
    switch (taskType) {
      case 'dev_server':
        return 'pnpm run dev';
      case 'build':
        return 'pnpm run build';
      case 'test':
        return taskData.testCommand || 'pnpm test';
      case 'lint':
        return 'pnpm run lint';
      default:
        return taskData.command || 'echo "No command specified"';
    }
  }

  async cleanup(spawnId) {
    this.spawns.delete(spawnId);
    this.handlers.delete(spawnId);
  }

  isTimedOut(meta) {
    const elapsed = Date.now() - new Date(meta.startTime).getTime();
    return elapsed > (this.config.execution.timeout_seconds * 1000);
  }
}

export default SpawnAgent;