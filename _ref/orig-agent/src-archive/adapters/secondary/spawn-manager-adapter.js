/**
 * Spawn Manager Adapter
 * Implements BackgroundExecutionPort using existing spawn system
 */

import { BackgroundExecutionPort } from '../../ports/background-execution.js';
import SpawnAgent from './spawn-agent.js';
import ProcessAdapter from './process-adapter.js';

export class SpawnManagerAdapter extends BackgroundExecutionPort {
  constructor(config = {}) {
    super();
    this.spawnAgent = new SpawnAgent(config);
    this.processAdapter = new ProcessAdapter();
  }

  // Spawn operations
  async startSpawn(taskData, options = {}) {
    return await this.spawnAgent.spawn(taskData, options);
  }

  async checkSpawnStatus(spawnId) {
    return await this.spawnAgent.getStatus(spawnId);
  }

  async getSpawnResult(spawnId) {
    return await this.spawnAgent.getResult(spawnId);
  }

  async killSpawn(spawnId) {
    return await this.spawnAgent.kill(spawnId);
  }

  async listSpawns() {
    return await this.spawnAgent.list();
  }

  // Process operations
  async startProcess(command, options = {}) {
    return await this.processAdapter.startProcess(command, options);
  }

  async listProcesses() {
    return await this.processAdapter.listProcesses();
  }

  async getProcessStatus(processId) {
    return await this.processAdapter.getProcessStatus(processId);
  }

  async killProcess(processId) {
    return await this.processAdapter.killProcess(processId);
  }
}