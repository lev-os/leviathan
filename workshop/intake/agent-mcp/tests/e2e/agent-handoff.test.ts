import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { TestEnvironment, createTestEnvironment } from '../utils/test-harness';
import { MCPMockClient } from '../utils/mcp-mock-client';

describe('Agent Handoff E2E', () => {
  let testEnv: TestEnvironment;
  let mcpMock: MCPMockClient;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    mcpMock = new MCPMockClient();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  test('claude code cli integration workflow', async () => {
    // Setup task with context
    const { id: taskId } = await testEnv.createTask(
      'Build API endpoint',
      'REST API for user management with authentication'
    );

    await testEnv.writeContext(
      `CTX-${taskId.split('-')[1]}-architecture`,
      '# API Architecture\n\nREST endpoints with JWT authentication'
    );

    // Mock MCP server response for Claude Code spawning
    mcpMock.onToolCall('execute_agent_task', async (params: any) => {
      expect(params.taskId).toBe(taskId);
      expect(params.agent).toBe('codecatalyst');
      expect(params.mode).toBe('auto');

      // Simulate Claude Code process being spawned
      const mockPid = Math.floor(Math.random() * 10000);
      
      // Write initial spawning status
      await testEnv.writeHandoffStatus(params.taskId, {
        task: params.taskId,
        agent: params.agent,
        mode: params.mode,
        status: 'running',
        pid: mockPid,
        timestamp: new Date().toISOString(),
        started_at: new Date().toISOString()
      });

      return { 
        success: true, 
        message: `Agent ${params.agent} spawned for task ${params.taskId} (PID: ${mockPid})` 
      };
    });

    // Execute handoff (spawns Claude Code CLI)
    const result = await mcpMock.callTool('execute_agent_task', {
      taskId,
      agent: 'codecatalyst',
      mode: 'auto'
    });

    expect(result.result.content[0].text).toContain('spawned');
    expect(result.result.content[0].text).toContain('PID');

    // Verify initial status was written
    const status = await testEnv.readHandoffStatus(taskId);
    expect(status.status).toBe('running');
    expect(status.agent).toBe('codecatalyst');
    expect(status.mode).toBe('auto');
    expect(status.pid).toBeDefined();
    expect(status.started_at).toBeDefined();

    // Simulate Claude Code process completing work
    await testEnv.writeDecisionLog(taskId, [
      {
        timestamp: new Date().toISOString(),
        decision: 'Using Express router pattern',
        rationale: 'Consistent with existing codebase architecture'
      }
    ]);

    // Simulate process completion
    await testEnv.writeHandoffStatus(taskId, {
      ...status,
      status: 'completed',
      exit_code: 0,
      completed_at: new Date().toISOString()
    });

    // Verify final state
    const finalStatus = await testEnv.readHandoffStatus(taskId);
    expect(finalStatus.status).toBe('completed');
    expect(finalStatus.exit_code).toBe(0);
  });

  test('agent status checking', async () => {
    // Create task and set initial status
    const { id: taskId } = await testEnv.createTask('Status check test');
    
    await testEnv.writeHandoffStatus(taskId, {
      status: 'in-progress',
      progress: 75,
      lastUpdate: new Date().toISOString(),
      agent: 'codecatalyst',
      currentStep: 'Implementing authentication middleware'
    });

    // Mock status check
    mcpMock.onToolCall('check_agent_status', async (params: any) => {
      const status = await testEnv.readHandoffStatus(params.taskId);
      return {
        taskId: params.taskId,
        ...status
      };
    });

    // Check status
    const statusResult = await mcpMock.callTool('check_agent_status', {
      taskId
    });

    const statusData = JSON.parse(statusResult.result.content[0].text);
    expect(statusData.status).toBe('in-progress');
    expect(statusData.progress).toBe(75);
    expect(statusData.agent).toBe('codecatalyst');
    expect(statusData.currentStep).toBe('Implementing authentication middleware');
  });

  test('multi-step agent workflow simulation', async () => {
    const { id: taskId } = await testEnv.createTask(
      'Complete development workflow',
      'Full development cycle from design to deployment'
    );

    // Simulate multi-step agent work
    const workSteps = [
      { progress: 20, decision: 'Analyzed requirements', rationale: 'Clear scope defined', delay: 100 },
      { progress: 40, decision: 'Created database schema', rationale: 'Normalized design for performance', delay: 150 },
      { progress: 60, decision: 'Implemented core APIs', rationale: 'RESTful design with OpenAPI spec', delay: 200 },
      { progress: 80, decision: 'Added authentication', rationale: 'JWT with refresh token strategy', delay: 100 },
      { progress: 100, decision: 'Completed testing', rationale: 'Unit and integration tests passing', delay: 50 }
    ];

    // Mock agent execution with detailed workflow
    mcpMock.onToolCall('execute_agent_task', async (params: any) => {
      // Simulate the work steps
      for (const step of workSteps) {
        await new Promise(resolve => setTimeout(resolve, step.delay || 50));
        
        await testEnv.updateTaskProgress(params.taskId, step.progress);
        
        let currentDecisions = [];
        try {
          const existingLog = await testEnv.readDecisionLog(params.taskId);
          // Parse existing decisions from the log
          if (existingLog) {
            const lines = existingLog.split('\n---\n').filter(line => line.trim());
            for (const line of lines) {
              const match = line.match(/\[(.*?)\] (.*?)\nRationale: (.*)/s);
              if (match) {
                currentDecisions.push({
                  timestamp: match[1],
                  decision: match[2],
                  rationale: match[3]
                });
              }
            }
          }
        } catch {
          // No existing log
        }
        
        currentDecisions.push({
          timestamp: new Date().toISOString(),
          decision: step.decision,
          rationale: step.rationale
        });
        
        await testEnv.writeDecisionLog(params.taskId, currentDecisions);
        
        await testEnv.writeHandoffStatus(params.taskId, {
          status: step.progress === 100 ? 'completed' : 'in-progress',
          progress: step.progress,
          lastUpdate: new Date().toISOString(),
          agent: params.agent,
          currentStep: step.decision
        });
      }

      return { success: true, completed: true };
    });

    // Execute the workflow
    const result = await mcpMock.callTool('execute_agent_task', {
      taskId,
      agent: 'codecatalyst',
      mode: 'auto'
    });

    expect(result.result.content[0].text).toContain('completed');

    // Verify final state
    const finalTasks = await testEnv.readTasks();
    expect(finalTasks.tasks[taskId].progress).toBe(100);

    const finalStatus = await testEnv.readHandoffStatus(taskId);
    expect(finalStatus.status).toBe('completed');
    expect(finalStatus.progress).toBe(100);

    // Verify all decisions were logged
    const decisionLog = await testEnv.readDecisionLog(taskId);
    expect(decisionLog).toContain('Analyzed requirements');
    expect(decisionLog).toContain('Created database schema');
    expect(decisionLog).toContain('Completed testing');
  });

  test('process management tools', async () => {
    const { id: taskId } = await testEnv.createTask('Process management test');

    // Mock kill_agent tool
    mcpMock.onToolCall('kill_agent', async (params: any) => {
      expect(params.taskId).toBe(taskId);
      
      // Simulate killing a running process
      await testEnv.writeHandoffStatus(params.taskId, {
        task: params.taskId,
        status: 'killed',
        killed_at: new Date().toISOString()
      });
      
      return `✅ Killed agent process for task ${params.taskId}`;
    });

    // Mock list_running_agents tool
    mcpMock.onToolCall('list_running_agents', async () => {
      return `Running agents:\n• Task ${taskId}: PID 12345`;
    });

    // Test kill agent
    const killResult = await mcpMock.callTool('kill_agent', { taskId });
    expect(killResult.result.content[0].text).toContain('Killed agent process');

    // Test list running agents
    const listResult = await mcpMock.callTool('list_running_agents', {});
    expect(listResult.result.content[0].text).toContain('Running agents');
    expect(listResult.result.content[0].text).toContain(taskId);
  });
});
