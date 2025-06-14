const express = require('express');
const router = express.Router();

function createTestRoutes(platform) {
  const { sandboxManager, metadataDB, testHarnessGenerator } = platform;

  // Get test harness by ID
  router.get('/harness/:harnessId', async (req, res) => {
    try {
      const { harnessId } = req.params;
      
      const harness = await metadataDB.getTestHarness(harnessId);
      
      if (!harness) {
        return res.status(404).json({ error: 'Test harness not found' });
      }

      res.json(harness);

    } catch (error) {
      console.error('❌ Failed to get test harness:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve test harness',
        details: error.message
      });
    }
  });

  // Create a sandbox for testing
  router.post('/sandbox', async (req, res) => {
    try {
      const { projectId, executionConfig = {} } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🏗️  Creating sandbox for ${project.name}`);
      
      // Create sandbox
      const sandbox = await sandboxManager.createSandbox(project, executionConfig);
      
      // Track usage
      await metadataDB.trackUsage(projectId, executionConfig.interfaceType, 'sandbox_created', {
        sandboxId: sandbox.id
      });

      res.json({
        success: true,
        sandbox: {
          id: sandbox.id,
          status: sandbox.status,
          projectId: sandbox.projectId,
          projectName: sandbox.projectName,
          createdAt: sandbox.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Sandbox creation failed:', error.message);
      res.status(500).json({
        error: 'Failed to create sandbox',
        details: error.message
      });
    }
  });

  // Execute command in sandbox
  router.post('/sandbox/:sandboxId/execute', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      const { command, options = {} } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      console.log(`⚡ Executing in sandbox ${sandboxId}: ${command}`);
      
      const startTime = Date.now();
      const result = await sandboxManager.executeInSandbox(sandboxId, command, options);
      const executionTime = Date.now() - startTime;
      
      // Log execution
      const sandbox = sandboxManager.activeSandboxes.get(sandboxId);
      if (sandbox) {
        await metadataDB.logExecution({
          sandboxId,
          projectId: sandbox.projectId,
          command,
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          executionTime,
          startedAt: new Date(startTime).toISOString(),
          completedAt: new Date().toISOString()
        });

        // Track usage
        await metadataDB.trackUsage(sandbox.projectId, null, 'command_executed', {
          sandboxId,
          command,
          success: result.success,
          executionTime
        });
      }

      res.json({
        success: true,
        result,
        executionTime
      });

    } catch (error) {
      console.error('❌ Command execution failed:', error.message);
      res.status(500).json({
        error: 'Failed to execute command',
        details: error.message
      });
    }
  });

  // Stream command execution in sandbox (WebSocket would be better, but HTTP SSE works)
  router.post('/sandbox/:sandboxId/stream', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      const { command, options = {} } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      console.log(`📡 Streaming execution in sandbox ${sandboxId}: ${command}`);
      
      const startTime = Date.now();
      
      try {
        const { stream, process } = await sandboxManager.streamExecution(sandboxId, command, options);
        
        let stdout = '';
        let stderr = '';
        
        process(
          // onStdout
          (data) => {
            stdout += data;
            res.write(`event: stdout\n`);
            res.write(`data: ${JSON.stringify({ data })}\n\n`);
          },
          // onStderr  
          (data) => {
            stderr += data;
            res.write(`event: stderr\n`);
            res.write(`data: ${JSON.stringify({ data })}\n\n`);
          },
          // onEnd
          async (result) => {
            const executionTime = Date.now() - startTime;
            
            res.write(`event: end\n`);
            res.write(`data: ${JSON.stringify({ ...result, executionTime })}\n\n`);
            res.end();
            
            // Log execution
            const sandbox = sandboxManager.activeSandboxes.get(sandboxId);
            if (sandbox) {
              await metadataDB.logExecution({
                sandboxId,
                projectId: sandbox.projectId,
                command,
                exitCode: result.exitCode,
                stdout,
                stderr,
                executionTime,
                startedAt: new Date(startTime).toISOString(),
                completedAt: new Date().toISOString()
              });
            }
          }
        );
        
      } catch (error) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }

    } catch (error) {
      console.error('❌ Stream execution failed:', error.message);
      res.status(500).json({
        error: 'Failed to stream execution',
        details: error.message
      });
    }
  });

  // Get sandbox status
  router.get('/sandbox/:sandboxId', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      
      const status = await sandboxManager.getSandboxStatus(sandboxId);
      
      if (!status) {
        return res.status(404).json({ error: 'Sandbox not found' });
      }

      res.json(status);

    } catch (error) {
      console.error('❌ Failed to get sandbox status:', error.message);
      res.status(500).json({
        error: 'Failed to get sandbox status',
        details: error.message
      });
    }
  });

  // Get sandbox logs
  router.get('/sandbox/:sandboxId/logs', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      const { limit = 100, since, type } = req.query;
      
      const logs = await sandboxManager.getSandboxLogs(sandboxId, {
        limit: parseInt(limit),
        since,
        type
      });

      res.json({
        sandboxId,
        logs,
        total: logs.length
      });

    } catch (error) {
      console.error('❌ Failed to get sandbox logs:', error.message);
      res.status(500).json({
        error: 'Failed to get sandbox logs',
        details: error.message
      });
    }
  });

  // Destroy sandbox
  router.delete('/sandbox/:sandboxId', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      const { force = false } = req.query;
      
      const destroyed = await sandboxManager.destroySandbox(sandboxId, force === 'true');
      
      if (!destroyed) {
        return res.status(404).json({ error: 'Sandbox not found' });
      }

      res.json({
        success: true,
        message: 'Sandbox destroyed'
      });

    } catch (error) {
      console.error('❌ Failed to destroy sandbox:', error.message);
      res.status(500).json({
        error: 'Failed to destroy sandbox',
        details: error.message
      });
    }
  });

  // List active sandboxes
  router.get('/sandbox', async (req, res) => {
    try {
      const sandboxes = await sandboxManager.listActiveSandboxes();
      
      res.json({
        sandboxes,
        total: sandboxes.length
      });

    } catch (error) {
      console.error('❌ Failed to list sandboxes:', error.message);
      res.status(500).json({
        error: 'Failed to list sandboxes',
        details: error.message
      });
    }
  });

  // Run predefined test for project interface
  router.post('/run/:projectId/:interfaceType', async (req, res) => {
    try {
      const { projectId, interfaceType } = req.params;
      const { testName, parameters = {} } = req.body;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🧪 Running ${interfaceType} test for ${project.name}`);
      
      // Generate harness if not exists
      let harness;
      try {
        harness = await testHarnessGenerator.generateTestHarness(project, interfaceType);
      } catch (error) {
        return res.status(400).json({
          error: 'Failed to generate test harness',
          details: error.message
        });
      }

      // Create sandbox with appropriate configuration
      const executionConfig = harness.harness.execution;
      const sandbox = await sandboxManager.createSandbox(project, executionConfig);

      // Run the test based on interface type
      let result;
      
      if (interfaceType === 'cli') {
        const command = parameters.command || 'npm start';
        result = await sandboxManager.executeInSandbox(sandbox.id, command, {
          timeout: 30000
        });
      } else if (interfaceType === 'api') {
        // Start the API and test endpoints
        await sandboxManager.executeInSandbox(sandbox.id, 'npm start &', {
          timeout: 5000
        });
        
        // Wait for startup
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test health endpoint
        result = await sandboxManager.executeInSandbox(sandbox.id, 
          'curl -s http://localhost:3000/health', {
          timeout: 10000
        });
      } else if (interfaceType === 'mcp') {
        // Test MCP server
        const command = harness.harness.execution.command || 'node index.js';
        result = await sandboxManager.executeInSandbox(sandbox.id, command, {
          timeout: 10000
        });
      }

      // Clean up sandbox
      setTimeout(async () => {
        await sandboxManager.destroySandbox(sandbox.id, true);
      }, 60000); // Clean up after 1 minute

      // Track usage
      await metadataDB.trackUsage(projectId, interfaceType, 'test_executed', {
        testName,
        success: result?.success,
        sandboxId: sandbox.id
      });

      res.json({
        success: true,
        result,
        sandbox: {
          id: sandbox.id,
          status: sandbox.status
        },
        harness: {
          id: harness.id,
          type: harness.interfaceType
        }
      });

    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      res.status(500).json({
        error: 'Failed to execute test',
        details: error.message
      });
    }
  });

  // Get test execution history for project
  router.get('/history/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // TODO: Implement execution history query
      // This would query the execution_logs table
      
      res.json({
        projectId,
        executions: [],
        message: 'Execution history not yet implemented'
      });

    } catch (error) {
      console.error('❌ Failed to get execution history:', error.message);
      res.status(500).json({
        error: 'Failed to get execution history',
        details: error.message
      });
    }
  });

  // Health check for test infrastructure
  router.get('/health', async (req, res) => {
    try {
      const sandboxHealth = await sandboxManager.healthCheck();
      
      res.json({
        status: 'healthy',
        sandbox: sandboxHealth,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}

module.exports = createTestRoutes;