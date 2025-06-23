/**
 * Primary Port: Workspace Management
 * Interface for how external systems (MCP, Web, CLI) drive our application
 */

export class WorkspaceManagementPort {
  async createWorkspace(name, path, description) {
    throw new Error('WorkspaceManagementPort.createWorkspace must be implemented');
  }

  async listWorkspaces() {
    throw new Error('WorkspaceManagementPort.listWorkspaces must be implemented');
  }

  async getWorkspace(name) {
    throw new Error('WorkspaceManagementPort.getWorkspace must be implemented');
  }

  async setActiveWorkspace(name) {
    throw new Error('WorkspaceManagementPort.setActiveWorkspace must be implemented');
  }

  async createProject(workspaceName, projectName, description, path) {
    throw new Error('WorkspaceManagementPort.createProject must be implemented');
  }

  async listProjects(workspaceName) {
    throw new Error('WorkspaceManagementPort.listProjects must be implemented');
  }

  async createTask(projectName, title, description, context) {
    throw new Error('WorkspaceManagementPort.createTask must be implemented');
  }

  async assessTaskConfidence(taskId, confidence, factors, reasoning) {
    throw new Error('WorkspaceManagementPort.assessTaskConfidence must be implemented');
  }

  async splitTask(taskId, subtasks, reason) {
    throw new Error('WorkspaceManagementPort.splitTask must be implemented');
  }

  async executeTask(taskId, agent, approach) {
    throw new Error('WorkspaceManagementPort.executeTask must be implemented');
  }

  async getTask(taskId) {
    throw new Error('WorkspaceManagementPort.getTask must be implemented');
  }

  async listTasks(projectName, status) {
    throw new Error('WorkspaceManagementPort.listTasks must be implemented');
  }

  async getCurrentContext() {
    throw new Error('WorkspaceManagementPort.getCurrentContext must be implemented');
  }
}