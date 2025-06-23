/**
 * Task Decomposition Agent - Recursive, parallel task decomposer
 * Implements span architecture for long-running decomposition
 */

export class TaskDecompositionAgent {
  constructor(mcp, llm, config = {}) {
    this.mcp = mcp;
    this.llm = llm;
    this.config = {
      confidenceThreshold: config.confidenceThreshold || 0.95, // 95% default
      maxDepth: config.maxDepth || 5,
      parallelLimit: config.parallelLimit || 10,
      ...config
    };
    
    this.activeSpans = new Map(); // Track running decompositions
  }

  /**
   * Start async decomposition - returns immediately with span ID
   */
  async startDecomposition(taskData) {
    const spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store span metadata
    this.activeSpans.set(spanId, {
      id: spanId,
      status: 'running',
      startTime: new Date(),
      taskData: taskData,
      progress: { total: 1, completed: 0, tasks: [] }
    });
    
    // Start async decomposition (non-blocking)
    this.decomposeAsync(spanId, taskData).catch(error => {
      this.activeSpans.get(spanId).status = 'failed';
      this.activeSpans.get(spanId).error = error.message;
    });
    
    return {
      spanId: spanId,
      message: `Started decomposition for "${taskData.title}"`,
      instruction: `Task decomposition running in background. Check status with get_decomposition_status("${spanId}")`,
      estimatedTime: this.estimateDecompositionTime(taskData)
    };
  }

  /**
   * Async recursive decomposition
   */
  async decomposeAsync(spanId, taskData, depth = 0) {
    const span = this.activeSpans.get(spanId);
    
    // Create task
    const task = await this.mcp.createTask(
      taskData.title,
      taskData.description,
      taskData.project || 'decomposition'
    );
    
    // Assess confidence
    const assessment = await this.assessTaskConfidence(task.id, taskData);
    
    if (assessment.confidence >= this.config.confidenceThreshold || depth >= this.config.maxDepth) {
      // Task is ready or max depth reached
      span.progress.completed++;
      span.progress.tasks.push({
        id: task.id,
        title: taskData.title,
        confidence: assessment.confidence,
        depth: depth,
        ready: true
      });
      return;
    }
    
    // Need to split - determine subtasks
    const subtasks = await this.generateSubtasks(taskData, assessment);
    span.progress.total += subtasks.length;
    
    // Split the task
    const splitResult = await this.mcp.splitTask(
      task.id,
      `Confidence ${Math.round(assessment.confidence * 100)}% < ${Math.round(this.config.confidenceThreshold * 100)}%`,
      subtasks
    );
    
    // Parallel recursive decomposition
    const promises = splitResult.subtasks.map(subtask => 
      this.decomposeAsync(spanId, {
        id: subtask.id,
        title: subtask.title,
        description: subtask.description,
        project: taskData.project
      }, depth + 1)
    );
    
    // Limit parallelism
    await this.runWithLimit(promises, this.config.parallelLimit);
    
    // Check if complete
    if (span.progress.completed === span.progress.total) {
      span.status = 'completed';
      span.endTime = new Date();
      span.duration = span.endTime - span.startTime;
    }
  }

  /**
   * Get decomposition status
   */
  getStatus(spanId) {
    const span = this.activeSpans.get(spanId);
    if (!span) return { error: 'Span not found' };
    
    return {
      spanId: spanId,
      status: span.status,
      progress: `${span.progress.completed}/${span.progress.total} tasks`,
      percentComplete: Math.round((span.progress.completed / span.progress.total) * 100),
      duration: span.endTime ? span.duration : (new Date() - span.startTime),
      readyTasks: span.progress.tasks.filter(t => t.ready),
      tree: this.buildTaskTree(span.progress.tasks)
    };
  }

  /**
   * Helper methods
   */
  async assessTaskConfidence(taskId, taskData) {
    // Use LLM to assess confidence
    const prompt = `Assess implementation confidence for: ${taskData.title}
Description: ${taskData.description}
Consider complexity, dependencies, unknowns.
Return confidence score 0-1.`;
    
    const confidence = await this.llm.assess(prompt);
    
    return await this.mcp.assessTaskConfidence(
      taskId,
      confidence,
      { auto: 'true' },
      'Auto-assessed by decomposition agent'
    );
  }

  async generateSubtasks(taskData, assessment) {
    // Use LLM to generate subtasks
    const prompt = `Break down this task into subtasks:
Task: ${taskData.title}
Current confidence: ${assessment.confidence}
Target confidence: ${this.config.confidenceThreshold}
Generate 3-5 subtasks that are more atomic.`;
    
    return await this.llm.generateSubtasks(prompt);
  }

  async runWithLimit(promises, limit) {
    const results = [];
    const executing = [];
    
    for (const promise of promises) {
      const p = Promise.resolve().then(() => promise);
      results.push(p);
      
      if (promises.length >= limit) {
        executing.push(p);
        if (executing.length >= limit) {
          await Promise.race(executing);
          executing.splice(executing.findIndex(p => p), 1);
        }
      }
    }
    
    await Promise.all(results);
  }

  estimateDecompositionTime(taskData) {
    // Simple heuristic
    const complexity = taskData.description.length / 100;
    return Math.round(complexity * 5) + ' seconds';
  }

  buildTaskTree(tasks) {
    // Build hierarchical view
    return tasks; // Simplified for now
  }
}

export default TaskDecompositionAgent;