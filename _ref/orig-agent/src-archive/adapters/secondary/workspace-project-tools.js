/**
 * Workspace & Project Management - Core MCP Tools
 * The foundation for human-like delegation and context management
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export class WorkspaceProjectManager {
  constructor(config = {}) {
    this.kinglyPath = config.kinglyPath || path.join(os.homedir(), '.kingly');
    this.currentContext = { workspace: null, project: null };
  }

  async initialize() {
    // Ensure base structure exists
    await fs.ensureDir(this.kinglyPath);
    await fs.ensureDir(path.join(this.kinglyPath, 'workspaces'));
    await fs.ensureDir(path.join(this.kinglyPath, 'global-memory'));
    
    // Initialize registry if it doesn't exist
    const registryPath = path.join(this.kinglyPath, 'registry.json');
    if (!await fs.pathExists(registryPath)) {
      await fs.writeJson(registryPath, {
        workspaces: {},
        projects: {},
        created: new Date().toISOString()
      }, { spaces: 2 });
    }
    
    // Load current context if saved
    const contextPath = path.join(this.kinglyPath, 'current-context.json');
    if (await fs.pathExists(contextPath)) {
      this.currentContext = await fs.readJson(contextPath);
    }
  }

  // Workspace Management
  async createWorkspace({ name, description, path: workspacePath }) {
    await this.initialize();
    
    const workspaceDir = path.join(this.kinglyPath, 'workspaces', name);
    await fs.ensureDir(workspaceDir);
    
    const workspaceData = {
      name,
      description: description || `${name} workspace`,
      path: workspacePath || path.join(os.homedir(), 'digital', name),
      created: new Date().toISOString(),
      projects: []
    };
    
    // Save workspace metadata
    await fs.writeJson(
      path.join(workspaceDir, 'workspace.json'), 
      workspaceData, 
      { spaces: 2 }
    );
    
    // Update registry
    const registry = await this.getRegistry();
    registry.workspaces[name] = {
      path: workspaceDir,
      created: workspaceData.created,
      description: workspaceData.description
    };
    await this.saveRegistry(registry);
    
    return {
      message: `✅ Workspace '${name}' created`,
      workspace: workspaceData,
      agentInstructions: `Workspace '${name}' is now available. You can:
- create_project({ workspace: "${name}", name: "project-name" })
- set_workspace("${name}") to switch context
- discover_projects({ workspace: "${name}" }) to see existing projects`
    };
  }

  async discoverWorkspaces({ scanPath }) {
    await this.initialize();
    
    const registry = await this.getRegistry();
    const workspaces = [];
    
    for (const [name, data] of Object.entries(registry.workspaces)) {
      const workspaceData = await fs.readJson(
        path.join(data.path, 'workspace.json')
      );
      workspaces.push({
        name,
        description: workspaceData.description,
        projectCount: workspaceData.projects.length,
        path: workspaceData.path
      });
    }
    
    return {
      message: `Found ${workspaces.length} workspaces`,
      workspaces,
      agentInstructions: workspaces.length > 0 ? 
        `Available workspaces: ${workspaces.map(w => w.name).join(', ')}
Use set_workspace("name") to switch context or create_project() to add projects.` :
        'No workspaces found. Create one with create_workspace({ name: "workspace-name" })'
    };
  }

  async setWorkspace(name) {
    const registry = await this.getRegistry();
    
    if (!registry.workspaces[name]) {
      return {
        message: `❌ Workspace '${name}' not found`,
        error: 'Workspace does not exist'
      };
    }
    
    this.currentContext.workspace = name;
    this.currentContext.project = null; // Clear project when switching workspace
    await this.saveCurrentContext();
    
    // Get workspace info
    const workspaceData = await fs.readJson(
      path.join(registry.workspaces[name].path, 'workspace.json')
    );
    
    return {
      message: `🎯 Switched to workspace: ${name}`,
      workspace: workspaceData,
      agentInstructions: `Now working in '${name}' workspace.
Projects available: ${workspaceData.projects.length > 0 ? workspaceData.projects.join(', ') : 'none'}

You can:
- create_project({ name: "project-name" }) to add a project
- set_project("project-name") to switch to existing project
- discover_projects() to see all projects in this workspace`
    };
  }

  // Project Management
  async createProject({ workspace, name, description, techStack }) {
    await this.initialize();
    
    // Use current workspace if not specified
    const workspaceName = workspace || this.currentContext.workspace;
    if (!workspaceName) {
      return {
        message: '❌ No workspace specified and no current workspace set',
        error: 'Must specify workspace or set current workspace first'
      };
    }
    
    const registry = await this.getRegistry();
    if (!registry.workspaces[workspaceName]) {
      return {
        message: `❌ Workspace '${workspaceName}' not found`,
        error: 'Workspace does not exist'
      };
    }
    
    // Create project directory
    const workspaceDir = registry.workspaces[workspaceName].path;
    const projectDir = path.join(workspaceDir, name);
    await fs.ensureDir(projectDir);
    await fs.ensureDir(path.join(projectDir, 'tasks'));
    await fs.ensureDir(path.join(projectDir, 'memory'));
    
    const projectData = {
      name,
      description: description || `${name} project`,
      workspace: workspaceName,
      techStack: techStack || [],
      created: new Date().toISOString(),
      taskCount: 0,
      status: 'active'
    };
    
    // Save project metadata
    await fs.writeJson(
      path.join(projectDir, 'project.json'),
      projectData,
      { spaces: 2 }
    );
    
    // Update workspace
    const workspaceData = await fs.readJson(
      path.join(workspaceDir, 'workspace.json')
    );
    workspaceData.projects.push(name);
    await fs.writeJson(
      path.join(workspaceDir, 'workspace.json'),
      workspaceData,
      { spaces: 2 }
    );
    
    return {
      message: `✅ Project '${name}' created in workspace '${workspaceName}'`,
      project: projectData,
      agentInstructions: `Project '${name}' is ready for tasks!

You can now:
- set_project("${name}") to switch to this project
- create_task({ title: "task title", description: "details" }) to add tasks
- The project will store tasks in: ${projectDir}/tasks/

Tech stack: ${techStack?.join(', ') || 'none specified'}`
    };
  }

  async discoverProjects({ workspace }) {
    const workspaceName = workspace || this.currentContext.workspace;
    if (!workspaceName) {
      return {
        message: '❌ No workspace specified',
        error: 'Must specify workspace or set current workspace'
      };
    }
    
    const registry = await this.getRegistry();
    const workspaceDir = registry.workspaces[workspaceName]?.path;
    if (!workspaceDir) {
      return {
        message: `❌ Workspace '${workspaceName}' not found`,
        error: 'Workspace does not exist'
      };
    }
    
    const workspaceData = await fs.readJson(
      path.join(workspaceDir, 'workspace.json')
    );
    
    const projects = [];
    for (const projectName of workspaceData.projects) {
      const projectPath = path.join(workspaceDir, projectName, 'project.json');
      if (await fs.pathExists(projectPath)) {
        const projectData = await fs.readJson(projectPath);
        
        // Count tasks
        const tasksDir = path.join(workspaceDir, projectName, 'tasks');
        const taskFiles = await fs.readdir(tasksDir).catch(() => []);
        const taskCount = taskFiles.filter(f => f.endsWith('.json')).length;
        
        projects.push({
          ...projectData,
          taskCount
        });
      }
    }
    
    return {
      message: `Found ${projects.length} projects in workspace '${workspaceName}'`,
      projects,
      agentInstructions: projects.length > 0 ?
        `Projects in '${workspaceName}': ${projects.map(p => `${p.name} (${p.taskCount} tasks)`).join(', ')}

Use set_project("name") to switch to a project and start creating tasks.` :
        `No projects found in '${workspaceName}'. Create one with create_project({ name: "project-name" })`
    };
  }

  async setProject({ workspace, project }) {
    const workspaceName = workspace || this.currentContext.workspace;
    const projectName = project;
    
    if (!workspaceName || !projectName) {
      return {
        message: '❌ Must specify both workspace and project',
        error: 'Missing required parameters'
      };
    }
    
    // Verify project exists
    const registry = await this.getRegistry();
    const workspaceDir = registry.workspaces[workspaceName]?.path;
    const projectPath = path.join(workspaceDir, projectName, 'project.json');
    
    if (!await fs.pathExists(projectPath)) {
      return {
        message: `❌ Project '${projectName}' not found in workspace '${workspaceName}'`,
        error: 'Project does not exist'
      };
    }
    
    // Update context
    this.currentContext.workspace = workspaceName;
    this.currentContext.project = projectName;
    await this.saveCurrentContext();
    
    const projectData = await fs.readJson(projectPath);
    
    return {
      message: `🎯 Switched to project: ${workspaceName}/${projectName}`,
      context: this.currentContext,
      project: projectData,
      agentInstructions: `Now working in project '${projectName}' (workspace: ${workspaceName}).

Project context:
- Description: ${projectData.description}
- Tech stack: ${projectData.techStack?.join(', ') || 'none'}
- Status: ${projectData.status}

You can now create tasks, manage project memory, and organize work within this project context.`
    };
  }

  async getCurrentContext() {
    return {
      message: this.currentContext.workspace ? 
        `Current context: ${this.currentContext.workspace}/${this.currentContext.project || 'no project'}` :
        'No workspace context set',
      context: this.currentContext,
      agentInstructions: this.currentContext.workspace ?
        `Working in workspace '${this.currentContext.workspace}'${this.currentContext.project ? `, project '${this.currentContext.project}'` : ''}.

Available actions depend on your current context level.` :
        'No workspace context set. Use set_workspace("name") or create_workspace() to get started.'
    };
  }

  // Utility methods
  async getRegistry() {
    const registryPath = path.join(this.kinglyPath, 'registry.json');
    return await fs.readJson(registryPath);
  }

  async saveRegistry(registry) {
    const registryPath = path.join(this.kinglyPath, 'registry.json');
    await fs.writeJson(registryPath, registry, { spaces: 2 });
  }

  async saveCurrentContext() {
    const contextPath = path.join(this.kinglyPath, 'current-context.json');
    await fs.writeJson(contextPath, this.currentContext, { spaces: 2 });
  }
}

// MCP Tool Definitions
export const workspaceProjectTools = {
  create_workspace: {
    name: 'create_workspace',
    description: 'Create a new workspace for organizing projects',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Workspace name (e.g., "backend", "client-work")'
        },
        description: {
          type: 'string',
          description: 'Optional description of the workspace purpose'
        },
        path: {
          type: 'string',
          description: 'Optional physical path for workspace projects'
        }
      },
      required: ['name']
    }
  },

  discover_workspaces: {
    name: 'discover_workspaces',
    description: 'List all available workspaces',
    inputSchema: {
      type: 'object',
      properties: {
        scanPath: {
          type: 'string',
          description: 'Optional path to scan for workspace candidates'
        }
      }
    }
  },

  set_workspace: {
    name: 'set_workspace',
    description: 'Switch to a specific workspace context',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Workspace name to switch to'
        }
      },
      required: ['name']
    }
  },

  create_project: {
    name: 'create_project',
    description: 'Create a new project within a workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: {
          type: 'string',
          description: 'Workspace name (uses current if not specified)'
        },
        name: {
          type: 'string',
          description: 'Project name'
        },
        description: {
          type: 'string',
          description: 'Project description'
        },
        techStack: {
          type: 'array',
          items: { type: 'string' },
          description: 'Technologies used in this project'
        }
      },
      required: ['name']
    }
  },

  discover_projects: {
    name: 'discover_projects',
    description: 'List projects in a workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: {
          type: 'string',
          description: 'Workspace name (uses current if not specified)'
        }
      }
    }
  },

  set_project: {
    name: 'set_project',
    description: 'Switch to a specific project context',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: {
          type: 'string',
          description: 'Workspace name (uses current if not specified)'
        },
        project: {
          type: 'string',
          description: 'Project name to switch to'
        }
      },
      required: ['project']
    }
  },

  get_current_context: {
    name: 'get_current_context',
    description: 'Get current workspace and project context',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
};

export default WorkspaceProjectManager;