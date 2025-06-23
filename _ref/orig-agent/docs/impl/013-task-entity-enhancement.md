# Implementation Ticket: 013 - Task Entity Enhancement

## 📋 Overview
Enhance the existing task entity to integrate with the universal context system and support advanced capabilities.

## 🔗 References
- **Previous**: [012 - Intent Classification Integration](012-intent-classification-integration.md)
- **Existing**: Current task.js in src/domain/
- **Spec**: Universal Context Architecture

## 🎯 Scope
Enhance task entity to:
- Integrate with context system
- Support intent-driven properties
- Enable workflow attachment
- Provide state management

## ✅ Acceptance Criteria

### AC-013-1: Context Integration
```yaml
Given: Task entity
When: Created or modified
Then: Integrates with context system
And: Inherits from parent contexts
And: Applies context rules
```

### AC-013-2: Intent-Driven Properties
```yaml
Given: Task with intent classification
When: Task properties set
Then: Properties match intent type
And: Success criteria appropriate
And: Complexity reflected in structure
```

### AC-013-3: Workflow Attachment
```yaml
Given: Task requiring execution
When: Workflow attached
Then: Task can execute workflow
And: Progress tracked
And: Results captured
```

### AC-013-4: Advanced State Management
```yaml
Given: Task with multiple states
When: State changes occur
Then: Transitions validated
And: History maintained
And: Notifications sent if configured
```

## 🧪 Test Cases

### Unit Tests
1. **Context integration** - Tasks work with contexts
2. **Intent properties** - Properties set correctly
3. **Workflow execution** - Tasks can run workflows
4. **State transitions** - Valid state changes
5. **History tracking** - Changes logged

### Integration Tests
1. **End-to-end** - Full task lifecycle
2. **Multi-task** - Task dependencies work
3. **Context inheritance** - Parent context rules apply

## 💻 Implementation

### Enhanced Task Entity
```javascript
// src/domain/enhanced-task.js
import { generateId } from '../utils/id-generator.js';

export class Task {
  constructor(data = {}) {
    this.id = data.id || generateId('task');
    this.metadata = {
      type: 'task',
      name: data.name || 'Unnamed Task',
      created: data.created || Date.now(),
      updated: data.updated || Date.now(),
      ...data.metadata
    };
    
    // Intent and context integration
    this.intent_context = {
      intent_type: data.intent_type,
      business_goal: data.business_goal,
      extends: data.extends,
      context_adaptations: data.context_adaptations,
      ...data.intent_context
    };
    
    // Task-specific configuration
    this.polymorphic_config = {
      task_config: {
        assignee: data.assignee,
        due_date: data.due_date,
        priority: data.priority || 'medium',
        estimated_hours: data.estimated_hours,
        actual_hours: data.actual_hours,
        complexity: data.complexity || 'medium',
        dependencies: data.dependencies || [],
        tags: data.tags || [],
        ...data.task_config
      }
    };
    
    // Relationships with other contexts
    this.relationships = {
      depends_on: data.depends_on || [],
      blocks: data.blocks || [],
      children: data.children || [],
      shares_with: data.shares_with || [],
      parent_project: data.parent_project,
      ...data.relationships
    };
    
    // Behavior rules
    this.behavior_rules = [
      {
        trigger: 'task_created',
        action: 'notify_assignee',
        condition: 'assignee is set'
      },
      {
        trigger: 'task_completed',
        action: 'update_project_progress',
        condition: 'part of project'
      },
      {
        trigger: 'task_overdue',
        action: 'escalate_to_manager',
        condition: 'high priority task'
      },
      ...(data.behavior_rules || [])
    ];
    
    // Enhanced status
    this.status = {
      current: data.status || 'created',
      progress: data.progress || 0,
      confidence: data.confidence || 0.5,
      blocked_by: data.blocked_by,
      last_updated: Date.now(),
      history: data.history || [],
      ...data.statusData
    };
    
    // Workflow integration
    this.workflow = {
      attached_workflow: data.workflow_path,
      execution_state: data.execution_state,
      last_execution: data.last_execution,
      execution_history: data.execution_history || []
    };
    
    // Results and learnings
    this.results = {
      outcome: data.outcome,
      lessons_learned: data.lessons_learned || [],
      artifacts: data.artifacts || [],
      metrics: data.metrics || {}
    };
  }
  
  // Intent-driven initialization
  static async createFromIntent(intentClassification, context = {}) {
    const taskData = {
      name: TaskNamer.generateName(intentClassification),
      intent_type: intentClassification.intentType,
      business_goal: intentClassification.businessGoal,
      complexity: intentClassification.complexity.overall_complexity,
      estimated_hours: intentClassification.routing.estimatedEffort.hours,
      priority: TaskPriority.fromComplexity(intentClassification.complexity),
      tags: TaskTagger.extractTags(intentClassification),
      workflow_path: intentClassification.routing.suggestedWorkflow
    };
    
    // Add context-specific properties
    if (context.project) {
      taskData.parent_project = context.project;
      taskData.extends = `${context.project}/base-task`;
    }
    
    return new Task(taskData);
  }
  
  // State management
  async updateStatus(newStatus, context = {}) {
    const validTransitions = this.getValidTransitions();
    
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid transition from ${this.status.current} to ${newStatus}`);
    }
    
    // Record history
    this.status.history.push({
      from: this.status.current,
      to: newStatus,
      timestamp: Date.now(),
      context: context,
      reason: context.reason
    });
    
    this.status.current = newStatus;
    this.status.last_updated = Date.now();
    this.metadata.updated = Date.now();
    
    // Trigger behavior rules
    await this.triggerRules('status_changed', { 
      newStatus, 
      oldStatus: this.status.history[this.status.history.length - 1]?.from 
    });
  }
  
  getValidTransitions() {
    const transitions = {
      created: ['planned', 'in_progress', 'cancelled'],
      planned: ['in_progress', 'on_hold', 'cancelled'],
      in_progress: ['completed', 'blocked', 'on_hold', 'cancelled'],
      blocked: ['in_progress', 'cancelled'],
      on_hold: ['planned', 'in_progress', 'cancelled'],
      completed: ['in_progress'], // Allow reopening
      cancelled: ['planned'] // Allow reactivation
    };
    
    return transitions[this.status.current] || [];
  }
  
  // Workflow integration
  async attachWorkflow(workflowPath) {
    this.workflow.attached_workflow = workflowPath;
    
    // Load workflow to validate
    try {
      const workflow = await loadWorkflow(workflowPath);
      this.workflow.steps_count = workflow.steps.length;
      this.workflow.estimated_duration = workflow.estimated_duration;
      
      await this.triggerRules('workflow_attached', { workflowPath });
      
    } catch (error) {
      throw new Error(`Failed to attach workflow: ${error.message}`);
    }
  }
  
  async executeWorkflow(params = {}) {
    if (!this.workflow.attached_workflow) {
      throw new Error('No workflow attached to this task');
    }
    
    // Update status
    await this.updateStatus('in_progress', { reason: 'workflow_execution_started' });
    
    try {
      const executor = new WorkflowExecutor();
      const result = await executor.executeWorkflow(
        this.workflow.attached_workflow,
        {
          ...params,
          taskId: this.id,
          taskContext: this.toContext()
        }
      );
      
      // Record execution
      this.workflow.execution_history.push({
        started: Date.now(),
        completed: Date.now(),
        success: result.success,
        result: result.data,
        duration: result._meta?.duration
      });
      
      // Update task based on result
      if (result.success) {
        this.results.outcome = result.data;
        await this.updateStatus('completed', { reason: 'workflow_completed' });
      } else {
        await this.updateStatus('blocked', { 
          reason: 'workflow_failed',
          error: result.error 
        });
      }
      
      return result;
      
    } catch (error) {
      this.workflow.execution_history.push({
        started: Date.now(),
        failed: Date.now(),
        success: false,
        error: error.message
      });
      
      await this.updateStatus('blocked', { 
        reason: 'workflow_execution_error',
        error: error.message 
      });
      
      throw error;
    }
  }
  
  // Progress tracking
  updateProgress(progress, metrics = {}) {
    this.status.progress = Math.max(0, Math.min(1, progress));
    this.status.last_updated = Date.now();
    
    // Update metrics
    Object.assign(this.results.metrics, metrics);
    
    // Auto-complete if 100%
    if (this.status.progress >= 1.0 && this.status.current !== 'completed') {
      this.updateStatus('completed', { reason: 'progress_reached_100' });
    }
  }
  
  // Dependency management
  async addDependency(taskId, type = 'depends_on') {
    if (!this.relationships[type]) {
      this.relationships[type] = [];
    }
    
    if (!this.relationships[type].includes(taskId)) {
      this.relationships[type].push(taskId);
      
      // Check for circular dependencies
      if (await this.hasCircularDependency()) {
        this.relationships[type] = this.relationships[type].filter(id => id !== taskId);
        throw new Error('Adding dependency would create circular reference');
      }
      
      await this.triggerRules('dependency_added', { taskId, type });
    }
  }
  
  async hasCircularDependency(visited = new Set()) {
    if (visited.has(this.id)) return true;
    
    visited.add(this.id);
    
    for (const depId of this.relationships.depends_on || []) {
      const depTask = await Task.load(depId);
      if (await depTask.hasCircularDependency(visited)) {
        return true;
      }
    }
    
    visited.delete(this.id);
    return false;
  }
  
  // Context integration
  toContext() {
    return {
      metadata: this.metadata,
      intent_context: this.intent_context,
      relationships: this.relationships,
      polymorphic_config: this.polymorphic_config,
      behavior_rules: this.behavior_rules,
      status: this.status,
      _meta: {
        path: `tasks/${this.id}`,
        context_type: 'task',
        created_at: this.metadata.created,
        updated_at: this.metadata.updated
      }
    };
  }
  
  static fromContext(contextData) {
    return new Task({
      id: contextData.metadata.id,
      ...contextData.metadata,
      ...contextData.intent_context,
      ...contextData.polymorphic_config.task_config,
      relationships: contextData.relationships,
      behavior_rules: contextData.behavior_rules,
      statusData: contextData.status
    });
  }
  
  // Behavior rules execution
  async triggerRules(trigger, eventData = {}) {
    const applicableRules = this.behavior_rules.filter(r => r.trigger === trigger);
    
    for (const rule of applicableRules) {
      // Check condition if present
      if (rule.condition) {
        const conditionMet = await this.evaluateCondition(rule.condition, eventData);
        if (!conditionMet) continue;
      }
      
      // Execute action
      await this.executeAction(rule.action, eventData);
    }
  }
  
  async evaluateCondition(condition, context) {
    // Simple condition evaluation
    if (typeof condition === 'string') {
      // Use LLM for semantic evaluation if available
      const llm = getLLMAdapter();
      if (llm) {
        const evaluation = await llm.evaluate({
          prompt: `Given task: ${JSON.stringify(this.toContext(), null, 2)}
                   And event: ${JSON.stringify(context, null, 2)}
                   
                   Does this condition apply: "${condition}"?
                   Answer only 'true' or 'false'.`,
          temperature: 0.1
        });
        
        return evaluation.toLowerCase().includes('true');
      }
    }
    
    return true; // Default to true if can't evaluate
  }
  
  async executeAction(action, context) {
    // Action registry for common actions
    const actions = {
      notify_assignee: () => this.notifyAssignee(context),
      update_project_progress: () => this.updateProjectProgress(),
      escalate_to_manager: () => this.escalateToManager(),
      create_subtask: () => this.createSubtask(context),
      log_milestone: () => this.logMilestone(context)
    };
    
    if (actions[action]) {
      await actions[action]();
    } else {
      console.warn(`Unknown action: ${action}`);
    }
  }
  
  // Persistence
  async save() {
    const storage = getStorage();
    await storage.save(`tasks/${this.id}`, this.toContext());
    return this;
  }
  
  static async load(id) {
    const storage = getStorage();
    const contextData = await storage.load(`tasks/${id}`);
    return Task.fromContext(contextData);
  }
  
  static async findByProject(projectId) {
    const storage = getStorage();
    const tasks = await storage.query({
      'relationships.parent_project': projectId
    });
    return tasks.map(Task.fromContext);
  }
}

// Helper classes
class TaskNamer {
  static generateName(intentClassification) {
    const { intentType, userExpression } = intentClassification.analysis;
    
    // Extract key words
    const words = userExpression.split(' ')
      .filter(w => w.length > 3)
      .slice(0, 4);
    
    const prefix = {
      personal_experience: 'Personal:',
      business_growth: 'Business:',
      organizational_coordination: 'Org:',
      civilizational_impact: 'Global:'
    }[intentType] || '';
    
    return `${prefix} ${words.join(' ')}`.trim();
  }
}

class TaskPriority {
  static fromComplexity(complexity) {
    const priorityMap = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      extreme: 'critical'
    };
    
    return priorityMap[complexity.overall_complexity] || 'medium';
  }
}

class TaskTagger {
  static extractTags(intentClassification) {
    const tags = [intentClassification.intentType];
    
    // Add complexity tag
    tags.push(`complexity:${intentClassification.complexity.overall_complexity}`);
    
    // Add routing tag
    tags.push(`routing:${intentClassification.routing.type}`);
    
    // Extract domain tags from keywords
    const keywords = intentClassification.analysis.userExpression
      .toLowerCase()
      .match(/\b(auth|security|ui|api|database|test|deploy|design)\b/g);
    
    if (keywords) {
      tags.push(...keywords.map(k => `domain:${k}`));
    }
    
    return tags;
  }
}
```

### Task Manager Integration
```javascript
// src/application/enhanced-task-manager.js
export class EnhancedTaskManager {
  constructor(dependencies) {
    this.contextAssembler = dependencies.contextAssembler;
    this.intentClassifier = dependencies.intentClassifier;
    this.workflowExecutor = dependencies.workflowExecutor;
    this.storage = dependencies.storage;
  }
  
  async createTaskFromIntent(userExpression, context = {}) {
    // Classify intent
    const intentClassification = await this.intentClassifier.classifyIntent(
      userExpression,
      context
    );
    
    // Create task
    const task = await Task.createFromIntent(intentClassification, context);
    
    // Save task
    await task.save();
    
    // Attach workflow if suggested
    if (intentClassification.routing.suggestedWorkflow) {
      await task.attachWorkflow(intentClassification.routing.suggestedWorkflow);
      await task.save();
    }
    
    return {
      task: task,
      classification: intentClassification,
      nextSteps: this.generateNextSteps(task, intentClassification)
    };
  }
  
  generateNextSteps(task, classification) {
    const steps = [];
    
    if (task.workflow.attached_workflow) {
      steps.push(`Execute workflow: ${task.workflow.attached_workflow}`);
    } else {
      steps.push('Define execution plan');
    }
    
    if (task.polymorphic_config.task_config.assignee) {
      steps.push(`Notify assignee: ${task.polymorphic_config.task_config.assignee}`);
    } else {
      steps.push('Assign task to team member');
    }
    
    return steps;
  }
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/enhanced-task.test.js
describe('Enhanced Task', () => {
  it('should create task from intent classification', async () => {
    const intentClassification = {
      intentType: 'business_growth',
      complexity: { overall_complexity: 'medium' },
      routing: { 
        estimatedEffort: { hours: 16 },
        suggestedWorkflow: 'workflows/business/feature-implementation.yaml'
      },
      analysis: {
        userExpression: 'Add user authentication to the app'
      }
    };
    
    const task = await Task.createFromIntent(intentClassification);
    
    expect(task.intent_context.intent_type).toBe('business_growth');
    expect(task.polymorphic_config.task_config.complexity).toBe('medium');
    expect(task.polymorphic_config.task_config.estimated_hours).toBe(16);
    expect(task.workflow.attached_workflow).toBe('workflows/business/feature-implementation.yaml');
  });
  
  it('should track status transitions', async () => {
    const task = new Task({ name: 'Test Task' });
    
    await task.updateStatus('planned');
    expect(task.status.current).toBe('planned');
    expect(task.status.history).toHaveLength(1);
    
    await task.updateStatus('in_progress');
    expect(task.status.current).toBe('in_progress');
    expect(task.status.history).toHaveLength(2);
  });
  
  it('should prevent circular dependencies', async () => {
    const task1 = new Task({ id: 'task1' });
    const task2 = new Task({ id: 'task2' });
    
    await task1.addDependency('task2');
    
    // This should throw
    await expect(task2.addDependency('task1'))
      .rejects.toThrow('circular reference');
  });
});
```

## 🔧 Dependencies
- Builds on existing task.js
- Uses Context system
- Integrates with Workflow Executor
- Uses Intent Classifier

## 📊 Effort Estimate
- Implementation: 3 hours
- Testing: 2 hours
- Total: 5 hours

## 🚀 Next Steps
After this ticket:
- 014: Nano Agent Base
- 015: Agent Registry

## 📝 Notes
- Backward compatible with existing task.js
- Intent-driven properties and behavior
- Full workflow integration
- Advanced state management with history