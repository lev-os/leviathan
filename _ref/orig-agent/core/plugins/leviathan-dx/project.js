/**
 * Project Plugin - Kingly-DX
 * Goal-oriented work container with team coordination
 */

export class ProjectPlugin {
  constructor() {
    this.name = 'kingly-dx-project';
    this.contextTypes = ['project'];
  }

  async createContext(type, config) {
    const project = {
      type: 'project',
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: config.name,
      workspace: config.workspace,
      description: config.description || '',
      path: config.path || '',
      
      // Project capabilities from context.yaml
      capabilities: [
        'task_management',
        'team_coordination',
        'progress_tracking',
        'workflow_orchestration',
        'pattern_application',
        'resource_sharing'
      ],
      
      // Pattern integration
      patternIntegration: {
        decisionPatterns: [
          'contexts/patterns/swot-analysis',
          'contexts/patterns/rice-scoring',
          'contexts/patterns/10-10-10-framework'
        ]
      },
      
      // Workflow integration
      workflowIntegration: {
        projectWorkflows: [
          'contexts/workflows/document-synthesis',
          'contexts/workflows/cross-context-learning',
          'contexts/workflows/insight-bubbling'
        ]
      },
      
      // Agent assignment
      agentAssignment: {
        planning: 'contexts/agents/ceo',
        implementation: 'contexts/agents/dev',
        negotiation: 'contexts/agents/ceo'
      },
      
      // Progress tracking
      progress: {
        tasksCompleted: 0,
        totalTasks: 0,
        completionRate: 0,
        teamVelocity: 0,
        riskScore: 0
      },
      
      // Memory configuration
      memoryConfig: {
        sharesWidth: ['parent_workspace', 'team_members'],
        retention: 'project_lifetime + 90_days',
        captureInsights: true
      },
      
      // Tracking
      tasks: new Map(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      
      // Plugin metadata
      plugin: this.name,
      version: '1.0.0'
    };

    // TODO: Persist to memory adapter based on project memory config
    
    return project;
  }

  // Project-specific operations
  async addTask(project, task) {
    project.tasks.set(task.id, {
      id: task.id,
      title: task.title,
      status: task.status || 'pending',
      created: task.created
    });
    project.progress.totalTasks = project.tasks.size;
    project.updated = new Date().toISOString();
    return project;
  }

  async completeTask(project, taskId) {
    const task = project.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.completed = new Date().toISOString();
      project.progress.tasksCompleted = Array.from(project.tasks.values())
        .filter(t => t.status === 'completed').length;
      project.progress.completionRate = project.progress.tasksCompleted / project.progress.totalTasks;
      project.updated = new Date().toISOString();
    }
    return project;
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