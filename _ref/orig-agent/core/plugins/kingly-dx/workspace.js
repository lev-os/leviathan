/**
 * Workspace Plugin - Kingly-DX
 * Billing/isolation boundary for projects
 */

export class WorkspacePlugin {
  constructor() {
    this.name = 'kingly-dx-workspace';
    this.contextTypes = ['workspace'];
  }

  async createContext(type, config) {
    const workspace = {
      type: 'workspace',
      id: `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: config.name,
      path: config.path,
      description: config.description || '',
      
      // Workspace capabilities from context.yaml
      capabilities: [
        'project_management',
        'resource_isolation', 
        'billing_boundary',
        'git_integration',
        'agent_assignment',
        'workflow_access'
      ],
      
      // Agent integration
      agentIntegration: {
        defaultAgent: 'contexts/agents/ceo',
        availableAgents: ['contexts/agents/ceo', 'contexts/agents/dev']
      },
      
      // Memory configuration
      memoryConfig: {
        isolation: 'strict',
        retention: 'project_lifetime',
        sharesWidth: []
      },
      
      // Tracking
      projects: new Map(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      
      // Plugin metadata
      plugin: this.name,
      version: '1.0.0'
    };

    // TODO: Persist to memory adapter based on workspace memory config
    
    return workspace;
  }

  // Workspace-specific operations
  async addProject(workspace, project) {
    workspace.projects.set(project.name, project.id);
    workspace.updated = new Date().toISOString();
    return workspace;
  }

  async removeProject(workspace, projectName) {
    workspace.projects.delete(projectName);
    workspace.updated = new Date().toISOString();
    return workspace;
  }

  // Validation
  static isValidName(name) {
    return name && 
           typeof name === 'string' && 
           name.length > 0 && 
           name.length <= 100 &&
           /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name);
  }
}