/**
 * Secondary Port: Background Execution  
 * Interface for spawn system and background processes
 */

export class BackgroundExecutionPort {
  async startSpawn(taskData, options) {
    throw new Error('BackgroundExecutionPort.startSpawn must be implemented');
  }

  async checkSpawnStatus(spawnId) {
    throw new Error('BackgroundExecutionPort.checkSpawnStatus must be implemented');
  }

  async getSpawnResult(spawnId) {
    throw new Error('BackgroundExecutionPort.getSpawnResult must be implemented');
  }

  async killSpawn(spawnId) {
    throw new Error('BackgroundExecutionPort.killSpawn must be implemented');
  }

  async listSpawns() {
    throw new Error('BackgroundExecutionPort.listSpawns must be implemented');
  }

  async startProcess(command, options) {
    throw new Error('BackgroundExecutionPort.startProcess must be implemented');
  }

  async listProcesses() {
    throw new Error('BackgroundExecutionPort.listProcesses must be implemented');
  }

  async getProcessStatus(processId) {
    throw new Error('BackgroundExecutionPort.getProcessStatus must be implemented');
  }

  async killProcess(processId) {
    throw new Error('BackgroundExecutionPort.killProcess must be implemented');
  }
}