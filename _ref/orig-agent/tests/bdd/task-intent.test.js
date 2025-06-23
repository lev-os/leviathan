/**
 * BDD Tests for Intent-Driven Task Structure
 * Acceptance Criteria: AC-TASK-001 to AC-TASK-004
 */

import { fixtures } from '../setup.js';

describe('Intent-Driven Task Structure', () => {
  let adapter;
  
  beforeEach(() => {
    adapter = global.createTestAdapter();
  });

  describe('AC-TASK-001: Task Intent Classification', () => {
    it('should classify implementation tasks correctly', async () => {
      // Given: task creation request for implementation work
      const taskRequest = fixtures.task.implementation;
      
      // When: task is created via direct adapter
      const task = await adapter.createTask(taskRequest);
      
      // Then: intent is classified as implementation
      expect(task).toHaveIntent('implementation');
      expect(task.intent_context).toMatchObject({
        domain: 'security',
        complexity: 'medium',
        keywords: expect.arrayContaining(['authentication', 'JWT'])
      });
    });

    it('should classify research tasks correctly', async () => {
      // Given: task creation request for research
      const taskRequest = fixtures.task.research;
      
      // When: task is created
      const task = await adapter.createTask(taskRequest);
      
      // Then: intent is classified as research
      expect(task).toHaveIntent('research');
      expect(task.intent_context).toMatchObject({
        domain: 'infrastructure',
        research_type: 'comparison',
        options: expect.arrayContaining(['Neo4j', 'DGraph'])
      });
    });

    it('should classify planning tasks correctly', async () => {
      // Given: task creation request for planning
      const taskRequest = fixtures.task.planning;
      
      // When: task is created
      const task = await adapter.createTask(taskRequest);
      
      // Then: intent is classified as planning
      expect(task).toHaveIntent('planning');
      expect(task.intent_context).toMatchObject({
        scope: 'product',
        timeframe: 'Q2',
        deliverable: 'roadmap'
      });
    });

    it('should handle ambiguous intents with confidence scores', async () => {
      // Given: ambiguous task description
      const taskRequest = {
        title: "Database migration",
        description: "Move from PostgreSQL to MongoDB"
      };
      
      // When: task is created
      const task = await adapter.createTask(taskRequest);
      
      // Then: multiple intents with confidence scores
      expect(task.intent_candidates).toEqual(
        expect.arrayContaining([
          { type: 'implementation', confidence: 0.6 },
          { type: 'planning', confidence: 0.3 },
          { type: 'research', confidence: 0.1 }
        ])
      );
      expect(task).toHaveIntent('implementation'); // highest confidence
    });
  });

  describe('AC-TASK-002: Context Metadata Attachment', () => {
    it('should attach workspace context to tasks', async () => {
      // Given: task in a specific workspace
      const taskRequest = {
        ...fixtures.task.implementation,
        workspace_id: 'workspace-123'
      };
      
      // When: task is created
      const task = await adapter.createTask(taskRequest);
      
      // Then: workspace context is attached
      expect(task.context).toMatchObject({
        workspace: {
          id: 'workspace-123',
          type: 'project',
          metadata: expect.any(Object)
        }
      });
    });

    it('should inherit context from parent task', async () => {
      // Given: subtask of existing task
      const parentTask = await adapter.createTask(fixtures.task.implementation);
      const subtaskRequest = {
        title: "Set up JWT library",
        parent_task_id: parentTask.id
      };
      
      // When: subtask is created
      const subtask = await adapter.createTask(subtaskRequest);
      
      // Then: context inherits from parent
      expect(subtask.context).toMatchObject({
        inherited_from: parentTask.id,
        intent_type: 'implementation',
        domain: 'security'
      });
    });
  });

  describe('AC-TASK-003: YAML/Markdown Dual Format', () => {
    it('should create YAML metadata file alongside markdown', async () => {
      // Given: task creation
      const task = await adapter.createTask(fixtures.task.implementation);
      
      // When: checking file system
      const files = await adapter.getTaskFiles(task.id);
      
      // Then: both files exist
      expect(files).toEqual({
        yaml: expect.stringContaining(`tasks/${task.id}/metadata.yaml`),
        markdown: expect.stringContaining(`tasks/${task.id}/implementation.md`)
      });
    });

    it('should structure YAML with proper schema', async () => {
      // Given: task creation
      const task = await adapter.createTask(fixtures.task.implementation);
      
      // When: reading YAML content
      const yaml = await adapter.getTaskMetadata(task.id);
      
      // Then: YAML follows schema
      expect(yaml).toMatchObject({
        version: '1.0',
        id: task.id,
        intent: {
          type: 'implementation',
          context: expect.any(Object)
        },
        metadata: {
          created: expect.any(String),
          status: 'pending',
          confidence: expect.any(Number)
        },
        relationships: {
          workspace: 'workspace-123',
          dependencies: expect.any(Array)
        }
      });
    });

    it('should structure markdown with intent-specific template', async () => {
      // Given: implementation task
      const task = await adapter.createTask(fixtures.task.implementation);
      
      // When: reading markdown content
      const markdown = await adapter.getTaskContent(task.id);
      
      // Then: markdown uses implementation template
      expect(markdown).toContain('## Implementation Plan');
      expect(markdown).toContain('## Technical Approach');
      expect(markdown).toContain('## Testing Strategy');
      expect(markdown).toContain('## Acceptance Criteria');
    });
  });

  describe('AC-TASK-004: Context-Aware Task Handling', () => {
    it('should route tasks to appropriate handlers based on intent', async () => {
      // Given: tasks with different intents
      const implTask = await adapter.createTask(fixtures.task.implementation);
      const researchTask = await adapter.createTask(fixtures.task.research);
      
      // When: processing tasks
      const implHandler = await adapter.getTaskHandler(implTask.id);
      const researchHandler = await adapter.getTaskHandler(researchTask.id);
      
      // Then: different handlers assigned
      expect(implHandler.type).toBe('implementation-handler');
      expect(researchHandler.type).toBe('research-handler');
    });

    it('should adapt task workflow based on context', async () => {
      // Given: high-priority security task
      const task = await adapter.createTask({
        ...fixtures.task.implementation,
        priority: 'critical',
        tags: ['security', 'urgent']
      });
      
      // When: checking workflow
      const workflow = await adapter.getTaskWorkflow(task.id);
      
      // Then: workflow includes security review
      expect(workflow.steps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'security-review' }),
          expect.objectContaining({ type: 'expedited-approval' })
        ])
      );
    });

    it('should enable cross-workspace task dependencies', async () => {
      // Given: task depending on task in another workspace
      const task1 = await adapter.createTask({
        ...fixtures.task.research,
        workspace_id: 'workspace-A'
      });
      
      const task2 = await adapter.createTask({
        title: "Implement chosen database",
        workspace_id: 'workspace-B',
        dependencies: [task1.id]
      });
      
      // When: checking dependencies
      const deps = await adapter.getTaskDependencies(task2.id);
      
      // Then: cross-workspace dependency tracked
      expect(deps).toContainEqual({
        task_id: task1.id,
        workspace_id: 'workspace-A',
        type: 'blocks',
        status: 'pending'
      });
    });
  });
});