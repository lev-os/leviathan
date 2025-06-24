import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { TestEnvironment, createTestEnvironment } from '../utils/test-harness';

describe('Task Lifecycle E2E', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  test('complete task creation workflow', async () => {
    // Create task
    const { id: taskId, task } = await testEnv.createTask(
      'Implement auth system',
      'Build secure authentication with JWT tokens'
    );
    
    expect(taskId).toMatch(/^TASK-\d{6}-TEST$/);
    expect(task.title).toBe('Implement auth system');
    expect(task.status).toBe('created');
    expect(task.progress).toBe(0);

    // Verify task in YAML
    const tasks = await testEnv.readTasks();
    const savedTask = tasks.tasks[taskId];
    expect(savedTask).toBeDefined();
    expect(savedTask.title).toBe('Implement auth system');
    expect(savedTask.goal).toBe('Build secure authentication with JWT tokens');
    expect(tasks._active).toBe(taskId);
  });

  test('context file management', async () => {
    // Create task
    const { id: taskId } = await testEnv.createTask('Test context management');
    
    // Save context
    const contextId = `CTX-${taskId.split('-')[1]}-architecture`;
    const contextContent = `# Architecture Context\n\nThis is test context for ${taskId}`;
    await testEnv.writeContext(contextId, contextContent);
    
    // Verify context file created
    const contextFiles = await testEnv.listContextFiles();
    expect(contextFiles).toContain(`${contextId}.md`);
    
    // Verify context content
    const savedContext = await testEnv.readContext(contextId);
    expect(savedContext).toContain('Architecture Context');
    expect(savedContext).toContain(taskId);
  });

  test('task progress updates', async () => {
    // Create task
    const { id: taskId } = await testEnv.createTask('Progress tracking test');
    
    // Update progress
    await testEnv.updateTaskProgress(taskId, 50);
    
    // Verify progress updated
    const tasks = await testEnv.readTasks();
    expect(tasks.tasks[taskId].progress).toBe(50);
    
    // Complete task
    await testEnv.completeTask(taskId);
    
    // Verify completion
    const completedTasks = await testEnv.readTasks();
    expect(completedTasks.tasks[taskId].status).toBe('completed');
    expect(completedTasks.tasks[taskId].progress).toBe(100);
  });

  test('multiple context types per task', async () => {
    // Create task
    const { id: taskId } = await testEnv.createTask('Complex feature');
    const taskNum = taskId.split('-')[1];
    
    // Save different context types
    await testEnv.writeContext(`CTX-${taskNum}-architecture`, 'System design...');
    await testEnv.writeContext(`CTX-${taskNum}-implementation`, 'Code details...');
    await testEnv.writeContext(`CTX-${taskNum}-testing`, 'Test strategy...');
    
    // Verify all contexts created
    const contextFiles = await testEnv.listContextFiles();
    expect(contextFiles).toContain(`CTX-${taskNum}-architecture.md`);
    expect(contextFiles).toContain(`CTX-${taskNum}-implementation.md`);
    expect(contextFiles).toContain(`CTX-${taskNum}-testing.md`);
    
    // Verify context content
    const archContext = await testEnv.readContext(`CTX-${taskNum}-architecture`);
    expect(archContext).toContain('System design...');
  });

  test('decision logging workflow', async () => {
    // Create task
    const { id: taskId } = await testEnv.createTask('Decision logging test');
    
    // Simulate decision logging
    const decisions = [
      {
        timestamp: new Date().toISOString(),
        decision: 'Use React for frontend',
        rationale: 'Team expertise and component reusability'
      },
      {
        timestamp: new Date().toISOString(),
        decision: 'PostgreSQL for database',
        rationale: 'ACID compliance and mature ecosystem'
      }
    ];
    
    await testEnv.writeDecisionLog(taskId, decisions);
    
    // Verify decision log created
    const logContent = await testEnv.readDecisionLog(taskId);
    expect(logContent).toContain('Use React for frontend');
    expect(logContent).toContain('PostgreSQL for database');
    expect(logContent).toContain('Team expertise and component reusability');
    expect(logContent).toContain('ACID compliance and mature ecosystem');
  });
});
