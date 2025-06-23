/**
 * Secondary Port: Persistence
 * Interface for what our application needs for storage
 */

export class PersistencePort {
  async saveWorkspace(workspace) {
    throw new Error('PersistencePort.saveWorkspace must be implemented');
  }

  async loadWorkspace(name) {
    throw new Error('PersistencePort.loadWorkspace must be implemented');
  }

  async deleteWorkspace(name) {
    throw new Error('PersistencePort.deleteWorkspace must be implemented');
  }

  async listWorkspaces() {
    throw new Error('PersistencePort.listWorkspaces must be implemented');
  }

  async saveProject(project) {
    throw new Error('PersistencePort.saveProject must be implemented');
  }

  async loadProject(workspaceName, projectName) {
    throw new Error('PersistencePort.loadProject must be implemented');
  }

  async saveTask(task) {
    throw new Error('PersistencePort.saveTask must be implemented');
  }

  async loadTask(taskId) {
    throw new Error('PersistencePort.loadTask must be implemented');
  }

  async findTasks(criteria) {
    throw new Error('PersistencePort.findTasks must be implemented');
  }

  async saveContext(key, value, category) {
    throw new Error('PersistencePort.saveContext must be implemented');
  }

  async loadContext(key, category) {
    throw new Error('PersistencePort.loadContext must be implemented');
  }
}