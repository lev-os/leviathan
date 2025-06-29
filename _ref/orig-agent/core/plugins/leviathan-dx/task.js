/**
 * Task Plugin - Kingly-DX  
 * Executable work unit with confidence tracking and auto-splitting
 */

export class TaskPlugin {
  constructor() {
    this.name = 'kingly-dx-task';
    this.contextTypes = ['task', 'subtask'];
  }

  async createContext(type, config) {
    const task = {
      type,
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: config.title,
      description: config.description || '',
      project: config.project,
      
      // Task capabilities from context.yaml
      capabilities: [
        'execution_tracking',
        'confidence_assessment', 
        'auto_splitting',
        'agent_assignment',
        'pattern_invocation',
        'workflow_execution'
      ],
      
      // Confidence configuration
      confidence: {
        score: null,
        threshold: 0.8,
        factors: [],
        reasoning: '',
        lastAssessed: null
      },
      
      // Execution state
      status: 'pending', // pending, in_progress, blocked, completed, cancelled
      assignedAgent: null,
      approach: '',
      
      // Relationships
      relationships: {
        blockedBy: [],
        blocks: [],
        relatesTo: [],
        subtasks: []
      },
      
      // Context capture
      context: config.context || {},
      
      // Agent execution mapping
      agentExecution: {
        technical_task: 'contexts/agents/dev',
        business_task: 'contexts/agents/ceo', 
        creative_task: 'contexts/agents/dev'
      },
      
      // Available patterns
      availablePatterns: [
        'contexts/patterns/echo-intelligence-patterns',
        'contexts/patterns/vibe-coding',
        'contexts/patterns/extreme-examples'
      ],
      
      // Memory configuration
      memoryConfig: {
        sharesWidth: ['parent_project', 'assigned_agent'],
        retention: '30_days',
        capturePatterns: true
      },
      
      // Tracking
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      
      // Plugin metadata
      plugin: this.name,
      version: '1.0.0'
    };

    // TODO: Persist to memory adapter based on task memory config
    
    return task;
  }

  // Task-specific operations
  async assessConfidence(task, confidence, factors = [], reasoning = '') {
    task.confidence = {
      score: confidence,
      threshold: 0.8,
      factors,
      reasoning,
      lastAssessed: new Date().toISOString()
    };
    task.updated = new Date().toISOString();
    
    return {
      task,
      shouldSplit: confidence < task.confidence.threshold,
      readyForExecution: confidence >= task.confidence.threshold
    };
  }

  async splitTask(task, subtasks, reason = '') {
    const splitResult = {
      parentTask: task,
      subtasks: [],
      reason,
      splitAt: new Date().toISOString()
    };

    // Create subtasks
    for (const subtaskConfig of subtasks) {
      const subtask = await this.createContext('subtask', {
        title: subtaskConfig.title,
        description: subtaskConfig.description,
        project: task.project,
        context: { parentTask: task.id, ...subtaskConfig.context }
      });
      
      splitResult.subtasks.push(subtask);
      task.relationships.subtasks.push(subtask.id);
    }

    task.status = 'split';
    task.updated = new Date().toISOString();
    
    return splitResult;
  }

  async executeTask(task, agent, approach = '') {
    if (task.confidence.score < task.confidence.threshold) {
      throw new Error(`Task confidence too low: ${task.confidence.score} < ${task.confidence.threshold}`);
    }

    task.status = 'in_progress';
    task.assignedAgent = agent;
    task.approach = approach;
    task.executionStarted = new Date().toISOString();
    task.updated = new Date().toISOString();
    
    return task;
  }

  // Validation
  static CONFIDENCE_THRESHOLD = 0.8;
}