/**
 * Project Hierarchy System - Workspace > Project > Task structure
 * Implements enhanced task management with embedded context per i-pm.md
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProjectHierarchy {
  constructor(config = {}) {
    this.config = {
      workspacePath: config.workspacePath || './.kingly',
      projectsPath: config.projectsPath || './.kingly/projects',
      ...config
    };
  }

  // Workspace Management
  async initializeWorkspace(workspacePath = this.config.workspacePath) {
    await fs.ensureDir(workspacePath);
    await fs.ensureDir(path.join(workspacePath, 'projects'));
    
    const workspaceConfig = {
      metadata: {
        id: path.basename(workspacePath),
        created: new Date().toISOString(),
        version: '1.0.0'
      },
      structure: {
        projects_directory: './projects',
        active_projects: [],
        archived_projects: []
      },
      defaults: {
        task_owner: 'ceo',
        task_executors: ['dev']
      }
    };
    
    const configPath = path.join(workspacePath, 'workspace.yaml');
    await fs.writeFile(configPath, yaml.dump(workspaceConfig), 'utf8');
    
    return workspaceConfig;
  }  // Project Management  
  async createProject(projectId, title, workingDirectory = null) {
    const projectPath = path.join(this.config.projectsPath, projectId);
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'tasks'));
    
    const projectConfig = {
      metadata: {
        id: projectId,
        title: title,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      structure: {
        working_directory: workingDirectory || process.cwd(),
        tasks_directory: `./projects/${projectId}/tasks`
      },
      relationships: {
        linked_projects: [],
        child_projects: [],
        parent_project: null
      },
      ownership: {
        primary_owner: 'ceo',
        stakeholders: ['development_team']
      },
      status: {
        current: 'active',
        phase: 'planning',
        progress: 0
      },
      active_tasks: [],
      completed_tasks: [],
      blocked_tasks: []
    };
    
    const configPath = path.join(projectPath, 'project.yaml');
    await fs.writeFile(configPath, yaml.dump(projectConfig), 'utf8');
    
    return projectConfig;
  }  // Enhanced Task Management with Embedded Context
  async createEnhancedTask(projectId, taskData) {
    const {
      id,
      title,
      description,
      type = 'feature',
      business_context = {},
      technical_context = {},
      executors = ['dev'],
      dependencies = {}
    } = taskData;
    
    const taskId = id || `${type}-${Date.now().toString().slice(-6)}`;
    const projectPath = path.join(this.config.projectsPath, projectId);
    const taskPath = path.join(projectPath, 'tasks', `${taskId}.yaml`);
    
    const enhancedTask = {
      metadata: {
        id: taskId,
        title: title,
        type: type,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      ownership: {
        owner: 'ceo',
        executors: executors,
        created_by: 'ceo'
      },
      business_context: {
        goal: business_context.goal || '',
        business_value: business_context.business_value || '',
        acceptance_criteria: business_context.acceptance_criteria || [],
        success_metrics: business_context.success_metrics || []
      },
      technical_context: {
        architecture_notes: technical_context.architecture_notes || '',
        implementation_notes: technical_context.implementation_notes || ''
      },
      workflow: {
        current_step: 'planning',
        steps_completed: ['business_analysis'],
        next_steps: ['technical_planning', 'development', 'testing']
      },
      status: {
        current: 'pending',
        progress: 0,
        blocked_by: null,
        blocked_since: null
      },
      dependencies: {
        depends_on: dependencies.depends_on || [],
        blocks: dependencies.blocks || [],
        related: dependencies.related || []
      },
      checklist: {
        business_requirements: [
          { item: 'User stories defined', completed: false },
          { item: 'Acceptance criteria documented', completed: false },
          { item: 'Success metrics identified', completed: false },
          { item: 'Stakeholder approval received', completed: false }
        ],
        technical_planning: [
          { item: 'Architecture approach defined', completed: false },
          { item: 'Integration points identified', completed: false },
          { item: 'Technical spike completed', completed: false }
        ],
        implementation: [
          { item: 'Development environment setup', completed: false },
          { item: 'Core functionality implemented', completed: false },
          { item: 'Error handling implemented', completed: false }
        ],
        testing: [
          { item: 'Unit tests written', completed: false },
          { item: 'Integration tests written', completed: false },
          { item: 'Manual testing completed', completed: false }
        ]
      },
      pivot_history: [],
      decision_log: [
        {
          timestamp: new Date().toISOString(),
          role: 'ceo',
          decision: `Created task: ${title}`,
          rationale: description,
          impact: 'New task created for project development'
        }
      ]
    };
    
    await fs.writeFile(taskPath, yaml.dump(enhancedTask), 'utf8');
    
    // Update project with new task
    await this.addTaskToProject(projectId, taskId, 'active');
    
    return enhancedTask;
  }  // Project-Task Relationship Management
  async addTaskToProject(projectId, taskId, status = 'active') {
    const projectPath = path.join(this.config.projectsPath, projectId, 'project.yaml');
    
    if (await fs.pathExists(projectPath)) {
      const projectConfig = yaml.load(await fs.readFile(projectPath, 'utf8'));
      
      // Remove from other status arrays
      projectConfig.active_tasks = projectConfig.active_tasks.filter(id => id !== taskId);
      projectConfig.completed_tasks = projectConfig.completed_tasks.filter(id => id !== taskId);
      projectConfig.blocked_tasks = projectConfig.blocked_tasks.filter(id => id !== taskId);
      
      // Add to appropriate array
      if (status === 'active') {
        projectConfig.active_tasks.push(taskId);
      } else if (status === 'completed') {
        projectConfig.completed_tasks.push(taskId);
      } else if (status === 'blocked') {
        projectConfig.blocked_tasks.push(taskId);
      }
      
      projectConfig.metadata.updated = new Date().toISOString();
      
      await fs.writeFile(projectPath, yaml.dump(projectConfig), 'utf8');
    }
  }

  // Task Operations
  async getEnhancedTask(projectId, taskId) {
    const taskPath = path.join(this.config.projectsPath, projectId, 'tasks', `${taskId}.yaml`);
    
    if (await fs.pathExists(taskPath)) {
      const taskData = yaml.load(await fs.readFile(taskPath, 'utf8'));
      return taskData;
    }
    
    throw new Error(`Task ${taskId} not found in project ${projectId}`);
  }

  async updateTaskStatus(projectId, taskId, status, updates = {}) {
    const taskPath = path.join(this.config.projectsPath, projectId, 'tasks', `${taskId}.yaml`);
    
    if (await fs.pathExists(taskPath)) {
      const taskData = yaml.load(await fs.readFile(taskPath, 'utf8'));
      
      taskData.status.current = status;
      taskData.metadata.updated = new Date().toISOString();
      
      // Apply additional updates
      Object.keys(updates).forEach(key => {
        if (key.includes('.')) {
          // Handle nested updates like 'workflow.current_step'
          const [parent, child] = key.split('.');
          if (!taskData[parent]) taskData[parent] = {};
          taskData[parent][child] = updates[key];
        } else {
          taskData[key] = updates[key];
        }
      });
      
      await fs.writeFile(taskPath, yaml.dump(taskData), 'utf8');
      
      // Update project task lists
      await this.addTaskToProject(projectId, taskId, status);
      
      return taskData;
    }
    
    throw new Error(`Task ${taskId} not found in project ${projectId}`);
  }  // Project Queries
  async listProjects() {
    const projectsPath = this.config.projectsPath;
    
    if (!await fs.pathExists(projectsPath)) {
      return [];
    }
    
    const projectDirs = await fs.readdir(projectsPath);
    const projects = [];
    
    for (const dir of projectDirs) {
      const projectConfigPath = path.join(projectsPath, dir, 'project.yaml');
      if (await fs.pathExists(projectConfigPath)) {
        const config = yaml.load(await fs.readFile(projectConfigPath, 'utf8'));
        projects.push(config);
      }
    }
    
    return projects;
  }

  async getProjectTasks(projectId, status = null) {
    const projectPath = path.join(this.config.projectsPath, projectId, 'project.yaml');
    
    if (await fs.pathExists(projectPath)) {
      const projectConfig = yaml.load(await fs.readFile(projectPath, 'utf8'));
      
      let taskList = [];
      if (status === 'active') {
        taskList = projectConfig.active_tasks;
      } else if (status === 'completed') {
        taskList = projectConfig.completed_tasks;
      } else if (status === 'blocked') {
        taskList = projectConfig.blocked_tasks;
      } else {
        taskList = [
          ...projectConfig.active_tasks,
          ...projectConfig.completed_tasks,
          ...projectConfig.blocked_tasks
        ];
      }
      
      // Load full task details
      const tasks = [];
      for (const taskId of taskList) {
        try {
          const task = await this.getEnhancedTask(projectId, taskId);
          tasks.push(task);
        } catch (error) {
          console.warn(`Could not load task ${taskId}: ${error.message}`);
        }
      }
      
      return tasks;
    }
    
    throw new Error(`Project ${projectId} not found`);
  }  // Migration from existing simple tasks
  async migrateExistingTask(simpleTask, projectId = 'default') {
    // Ensure project exists
    try {
      await this.getProject(projectId);
    } catch (error) {
      await this.createProject(projectId, 'Default Project');
    }
    
    // Convert simple task to enhanced task
    const enhancedTaskData = {
      id: simpleTask.id,
      title: simpleTask.title,
      description: simpleTask.description,
      type: 'feature',
      business_context: {
        goal: simpleTask.description,
        business_value: 'Migrate existing functionality',
        acceptance_criteria: ['Task completed successfully'],
        success_metrics: ['Task marked as completed']
      },
      technical_context: {
        architecture_notes: simpleTask.context ? JSON.stringify(simpleTask.context) : '',
        implementation_notes: `Migrated from simple task. Original confidence: ${simpleTask.confidence}`
      },
      executors: [simpleTask.agent || 'dev'],
      dependencies: {
        depends_on: [],
        blocks: [],
        related: []
      }
    };
    
    return await this.createEnhancedTask(projectId, enhancedTaskData);
  }

  async getProject(projectId) {
    const projectPath = path.join(this.config.projectsPath, projectId, 'project.yaml');
    
    if (await fs.pathExists(projectPath)) {
      return yaml.load(await fs.readFile(projectPath, 'utf8'));
    }
    
    throw new Error(`Project ${projectId} not found`);
  }
}