/**
 * JSON Storage Adapter
 * Implements PersistencePort using JSON files
 */

import fs from 'fs-extra';
import path from 'path';
import { PersistencePort } from '../../ports/persistence.js';
import { Workspace, Project } from '../../domain/workspace.js';
import { Task } from '../../domain/task.js';

export class JsonStorageAdapter extends PersistencePort {
  constructor(basePath = '.kingly') {
    super();
    this.basePath = basePath;
    this.workspacesPath = path.join(basePath, 'workspaces');
    this.tasksPath = path.join(basePath, 'tasks');
    this.contextPath = path.join(basePath, 'context');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.workspacesPath);
    await fs.ensureDir(this.tasksPath);
    await fs.ensureDir(this.contextPath);
  }

  // Workspace operations
  async saveWorkspace(workspace) {
    const filePath = path.join(this.workspacesPath, `${workspace.name}.json`);
    
    // Convert Map to Object for JSON serialization
    const workspaceData = {
      ...workspace,
      projects: Object.fromEntries(workspace.projects)
    };
    
    await fs.writeFile(filePath, JSON.stringify(workspaceData, null, 2));
  }

  async loadWorkspace(name) {
    const filePath = path.join(this.workspacesPath, `${name}.json`);
    if (!await fs.pathExists(filePath)) return null;
    
    const data = await fs.readFile(filePath, 'utf8');
    const workspaceData = JSON.parse(data);
    
    // Reconstruct Workspace domain object
    const workspace = new Workspace(workspaceData.name, workspaceData.path, workspaceData.description);
    workspace.created = workspaceData.created;
    workspace.updated = workspaceData.updated;
    
    // Reconstruct projects if they exist
    if (workspaceData.projects) {
      const projectsData = workspaceData.projects instanceof Map ? 
        Array.from(workspaceData.projects.entries()) : 
        Object.entries(workspaceData.projects);
        
      for (const [projectName, projectData] of projectsData) {
        const project = new Project(projectData.name, projectData.workspace, projectData.description, projectData.path);
        project.created = projectData.created;
        project.updated = projectData.updated;
        project.status = projectData.status;
        workspace.addProject(project);
      }
    }
    
    return workspace;
  }

  async deleteWorkspace(name) {
    const filePath = path.join(this.workspacesPath, `${name}.json`);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  async listWorkspaces() {
    if (!await fs.pathExists(this.workspacesPath)) return [];
    
    const files = await fs.readdir(this.workspacesPath);
    const workspaces = [];
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const name = path.basename(file, '.json');
      const workspace = await this.loadWorkspace(name);
      if (workspace) workspaces.push(workspace);
    }
    
    return workspaces;
  }

  // Project operations (projects are stored within workspaces)
  async saveProject(project) {
    // Projects are stored as part of workspaces, so this is mainly for consistency
    // The actual saving happens when saveWorkspace is called
    return project;
  }

  // Task operations
  async saveTask(task) {
    const filePath = path.join(this.tasksPath, `${task.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(task, null, 2));
  }

  async loadTask(taskId) {
    const filePath = path.join(this.tasksPath, `${taskId}.json`);
    if (!await fs.pathExists(filePath)) return null;
    
    const data = await fs.readFile(filePath, 'utf8');
    const taskData = JSON.parse(data);
    
    // Reconstruct Task domain object
    const task = new Task(taskData.title, taskData.description, taskData.project);
    task.id = taskData.id;
    task.status = taskData.status;
    task.confidence = taskData.confidence;
    task.context = taskData.context || {};
    task.created = taskData.created;
    task.updated = taskData.updated;
    task.subtasks = taskData.subtasks || [];
    
    // Reconstruct relationships
    if (taskData.relationships) {
      task.relationships = {
        blocked_by: taskData.relationships.blocked_by || [],
        blocks: taskData.relationships.blocks || [],
        relates_to: taskData.relationships.relates_to || []
      };
    }
    
    return task;
  }

  // Context operations
  async saveContext(key, value, category = 'general') {
    const categoryPath = path.join(this.contextPath, category);
    await fs.ensureDir(categoryPath);
    
    const filePath = path.join(categoryPath, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify({ key, value, category, updated: new Date().toISOString() }, null, 2));
  }

  async loadContext(key, category = 'general') {
    const filePath = path.join(this.contextPath, category, `${key}.json`);
    if (!await fs.pathExists(filePath)) return null;
    
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }
}