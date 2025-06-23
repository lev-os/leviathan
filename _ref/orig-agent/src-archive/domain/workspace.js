/**
 * Workspace Domain Entity
 * Pure business logic - no external dependencies
 */

export class Workspace {
  constructor(name, path, description = '') {
    this.name = name;
    this.path = path;
    this.description = description;
    this.projects = new Map();
    this.created = new Date().toISOString();
    this.updated = this.created;
  }

  // Business rule: workspace name validation
  static isValidName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 3) return false;
    if (name.includes('/') || name.includes('\\')) return false;
    return true;
  }

  // Business rule: onboarding sequence
  getOnboardingSteps() {
    return ['ceo-analysis', 'project-discovery', 'context-extraction'];
  }

  // Business rule: project management
  addProject(project) {
    if (!project || !project.name) {
      throw new Error('Project must have a name');
    }
    if (this.projects.has(project.name)) {
      throw new Error(`Project '${project.name}' already exists`);
    }
    this.projects.set(project.name, project);
    this.updated = new Date().toISOString();
  }

  removeProject(projectName) {
    if (!this.projects.has(projectName)) {
      throw new Error(`Project '${projectName}' not found`);
    }
    this.projects.delete(projectName);
    this.updated = new Date().toISOString();
  }

  getProject(projectName) {
    return this.projects.get(projectName);
  }

  listProjects() {
    return Array.from(this.projects.values());
  }

  // Business rule: workspace state
  isEmpty() {
    return this.projects.size === 0;
  }

  getStats() {
    return {
      name: this.name,
      projectCount: this.projects.size,
      created: this.created,
      updated: this.updated
    };
  }
}

export class Project {
  constructor(name, workspace, description = '', path = '') {
    this.name = name;
    this.workspace = workspace;
    this.description = description;
    this.path = path;
    this.tasks = new Map();
    this.created = new Date().toISOString();
    this.updated = this.created;
    this.status = 'active';
  }

  // Business rule: project name validation
  static isValidName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 3) return false;
    return true;
  }

  // Business rule: task management
  addTask(task) {
    if (!task || !task.id) {
      throw new Error('Task must have an id');
    }
    this.tasks.set(task.id, task);
    this.updated = new Date().toISOString();
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  listTasks() {
    return Array.from(this.tasks.values());
  }

  getStats() {
    const tasks = this.listTasks();
    return {
      name: this.name,
      taskCount: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      created: this.created,
      updated: this.updated,
      status: this.status
    };
  }
}