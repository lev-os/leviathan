const express = require('express');
const router = express.Router();

function createExecutionRoutes(platform) {
  const { sandboxManager, metadataDB, apiKeyVault } = platform;

  // Execute project with API key injection
  router.post('/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { 
        interfaceType, 
        command, 
        parameters = {}, 
        apiKeys = [], 
        environment = {},
        timeout = 30000 
      } = req.body;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🚀 Executing ${project.name} with ${interfaceType} interface`);
      
      // Prepare execution environment
      const executionEnv = { ...environment };
      
      // Inject API keys from vault
      for (const keyRef of apiKeys) {
        try {
          const keyData = await apiKeyVault.getKey(keyRef.service, keyRef.keyName);
          if (keyData) {
            const envName = keyRef.envVariable || keyRef.keyName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            executionEnv[envName] = keyData.value;
          }
        } catch (error) {
          console.warn(`⚠️  Failed to retrieve API key ${keyRef.service}:${keyRef.keyName}:`, error.message);
        }
      }

      // Create sandbox with appropriate configuration
      const executionConfig = {
        image: this.getImageForProject(project),
        environment: Object.entries(executionEnv).map(([key, value]) => `${key}=${value}`),
        timeout,
        interfaceType,
        resourceLimits: {
          memory: parameters.memory || '512m',
          cpu: parameters.cpu || '0.5'
        }
      };

      const sandbox = await sandboxManager.createSandbox(project, executionConfig);
      
      // Execute based on interface type
      let result;
      const startTime = Date.now();
      
      if (interfaceType === 'cli') {
        result = await this.executeCLI(sandbox, command, parameters);
      } else if (interfaceType === 'api') {
        result = await this.executeAPI(sandbox, parameters);
      } else if (interfaceType === 'mcp') {
        result = await this.executeMCP(sandbox, parameters);
      } else {
        throw new Error(`Unsupported interface type: ${interfaceType}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Log execution
      await metadataDB.logExecution({
        sandboxId: sandbox.id,
        projectId,
        command: command || interfaceType,
        exitCode: result.exitCode || 0,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        executionTime,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString()
      });

      // Track usage
      await metadataDB.trackUsage(projectId, interfaceType, 'execution_completed', {
        sandboxId: sandbox.id,
        success: result.success,
        executionTime,
        apiKeysUsed: apiKeys.length
      });

      // Schedule sandbox cleanup
      setTimeout(async () => {
        try {
          await sandboxManager.destroySandbox(sandbox.id, true);
        } catch (error) {
          console.warn(`⚠️  Failed to cleanup sandbox ${sandbox.id}:`, error.message);
        }
      }, 300000); // Clean up after 5 minutes

      res.json({
        success: true,
        result,
        executionTime,
        sandbox: {
          id: sandbox.id,
          status: sandbox.status
        }
      });

    } catch (error) {
      console.error('❌ Execution failed:', error.message);
      res.status(500).json({
        error: 'Failed to execute project',
        details: error.message
      });
    }
  });

  // Stream execution with real-time output
  router.post('/:projectId/stream', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { interfaceType, command, parameters = {}, apiKeys = [] } = req.body;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      console.log(`📡 Streaming execution of ${project.name}`);
      
      try {
        // Prepare environment with API keys
        const executionEnv = {};
        for (const keyRef of apiKeys) {
          try {
            const keyData = await apiKeyVault.getKey(keyRef.service, keyRef.keyName);
            if (keyData) {
              const envName = keyRef.envVariable || keyRef.keyName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
              executionEnv[envName] = keyData.value;
            }
          } catch (error) {
            res.write(`event: warning\n`);
            res.write(`data: ${JSON.stringify({ message: `Failed to load API key: ${keyRef.service}:${keyRef.keyName}` })}\n\n`);
          }
        }

        // Create sandbox
        const executionConfig = {
          image: this.getImageForProject(project),
          environment: Object.entries(executionEnv).map(([key, value]) => `${key}=${value}`),
          interfaceType
        };

        res.write(`event: status\n`);
        res.write(`data: ${JSON.stringify({ message: 'Creating sandbox...' })}\n\n`);
        
        const sandbox = await sandboxManager.createSandbox(project, executionConfig);
        
        res.write(`event: status\n`);
        res.write(`data: ${JSON.stringify({ message: 'Sandbox created, starting execution...' })}\n\n`);

        // Stream execution
        const { stream, process } = await sandboxManager.streamExecution(
          sandbox.id, 
          command || this.getDefaultCommand(project, interfaceType), 
          { env: Object.entries(executionEnv).map(([k, v]) => `${k}=${v}`) }
        );
        
        let stdout = '';
        let stderr = '';
        const startTime = Date.now();
        
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
            await metadataDB.logExecution({
              sandboxId: sandbox.id,
              projectId,
              command: command || interfaceType,
              exitCode: result.exitCode,
              stdout,
              stderr,
              executionTime,
              startedAt: new Date(startTime).toISOString(),
              completedAt: new Date().toISOString()
            });

            // Track usage
            await metadataDB.trackUsage(projectId, interfaceType, 'stream_execution_completed', {
              sandboxId: sandbox.id,
              success: result.success,
              executionTime
            });
            
            // Clean up sandbox
            setTimeout(async () => {
              await sandboxManager.destroySandbox(sandbox.id, true);
            }, 60000);
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

  // Execute with file upload
  router.post('/:projectId/with-files', async (req, res) => {
    try {
      const { projectId } = req.params;
      // Handle multipart file uploads
      const multer = require('multer');
      const upload = multer({ dest: '/tmp/uploads/' });
      
      upload.array('files')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: 'File upload failed' });
        }

        const { interfaceType, command, parameters = {} } = req.body;
        const uploadedFiles = req.files || [];
        
        const project = await metadataDB.getProject(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        console.log(`📁 Executing ${project.name} with ${uploadedFiles.length} uploaded files`);
        
        // Create sandbox
        const executionConfig = {
          image: this.getImageForProject(project),
          interfaceType
        };

        const sandbox = await sandboxManager.createSandbox(project, executionConfig);
        
        // Copy uploaded files to sandbox
        for (const file of uploadedFiles) {
          await this.copyFileToSandbox(sandbox, file);
        }
        
        // Execute with file references
        const result = await sandboxManager.executeInSandbox(
          sandbox.id,
          command,
          { timeout: 60000 }
        );
        
        // Clean up uploaded files
        for (const file of uploadedFiles) {
          try {
            require('fs').unlinkSync(file.path);
          } catch (cleanupError) {
            console.warn('⚠️  Failed to clean up uploaded file:', cleanupError.message);
          }
        }
        
        // Track usage
        await metadataDB.trackUsage(projectId, interfaceType, 'execution_with_files', {
          sandboxId: sandbox.id,
          fileCount: uploadedFiles.length,
          success: result.success
        });

        res.json({
          success: true,
          result,
          filesProcessed: uploadedFiles.length,
          sandbox: { id: sandbox.id }
        });
      });

    } catch (error) {
      console.error('❌ File execution failed:', error.message);
      res.status(500).json({
        error: 'Failed to execute with files',
        details: error.message
      });
    }
  });

  // Get execution templates/examples
  router.get('/:projectId/templates', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const templates = this.generateExecutionTemplates(project);
      
      res.json({
        projectId,
        projectName: project.name,
        templates
      });

    } catch (error) {
      console.error('❌ Failed to get execution templates:', error.message);
      res.status(500).json({
        error: 'Failed to get execution templates',
        details: error.message
      });
    }
  });

  // Helper methods
  
  async executeCLI(sandbox, command, parameters) {
    const cmd = command || parameters.defaultCommand || 'npm start';
    return await sandboxManager.executeInSandbox(sandbox.id, cmd, {
      timeout: parameters.timeout || 30000,
      env: parameters.environment || []
    });
  }

  async executeAPI(sandbox, parameters) {
    // Start the API server
    const startCommand = parameters.startCommand || 'npm start';
    await sandboxManager.executeInSandbox(sandbox.id, `${startCommand} &`, {
      timeout: 5000
    });
    
    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test the specified endpoint or health check
    const endpoint = parameters.endpoint || '/health';
    const method = parameters.method || 'GET';
    const port = parameters.port || 3000;
    
    let curlCommand = `curl -s -X ${method} http://localhost:${port}${endpoint}`;
    
    if (method !== 'GET' && parameters.data) {
      curlCommand += ` -H "Content-Type: application/json" -d '${JSON.stringify(parameters.data)}'`;
    }
    
    return await sandboxManager.executeInSandbox(sandbox.id, curlCommand, {
      timeout: 15000
    });
  }

  async executeMCP(sandbox, parameters) {
    const mcpCommand = parameters.mcpCommand || 'node index.js';
    
    // For MCP, we need to send a JSON-RPC request
    const request = parameters.mcpRequest || {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };
    
    const command = `echo '${JSON.stringify(request)}' | ${mcpCommand}`;
    
    return await sandboxManager.executeInSandbox(sandbox.id, command, {
      timeout: 15000
    });
  }

  getImageForProject(project) {
    const language = project.analysis?.language;
    const images = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-slim',
      'rust': 'rust:1.70-slim',
      'go': 'golang:1.21-alpine'
    };
    return images[language] || 'node:18-alpine';
  }

  getDefaultCommand(project, interfaceType) {
    if (interfaceType === 'cli') {
      return project.metadata?.scripts?.start || 'node index.js';
    } else if (interfaceType === 'api') {
      return project.metadata?.scripts?.start || 'npm start';
    } else if (interfaceType === 'mcp') {
      return 'node index.js';
    }
    return 'npm start';
  }

  async copyFileToSandbox(sandbox, file) {
    // This would copy the uploaded file into the sandbox container
    // Implementation depends on Docker API and file handling
    console.log(`📋 Copying file ${file.originalname} to sandbox ${sandbox.id}`);
    
    // TODO: Implement actual file copying to container
    // For now, just log the action
  }

  generateExecutionTemplates(project) {
    const templates = [];
    
    if (project.interfaces?.cli) {
      templates.push({
        name: 'Basic CLI Execution',
        interfaceType: 'cli',
        command: project.metadata?.scripts?.start || 'node index.js',
        description: 'Run the main CLI command',
        parameters: {}
      });
      
      if (project.metadata?.scripts) {
        Object.entries(project.metadata.scripts).forEach(([scriptName, scriptCommand]) => {
          templates.push({
            name: `NPM Script: ${scriptName}`,
            interfaceType: 'cli',
            command: `npm run ${scriptName}`,
            description: `Run the ${scriptName} script`,
            parameters: {}
          });
        });
      }
    }
    
    if (project.interfaces?.api) {
      templates.push({
        name: 'Health Check',
        interfaceType: 'api',
        description: 'Test API health endpoint',
        parameters: {
          endpoint: '/health',
          method: 'GET',
          port: 3000
        }
      });
      
      templates.push({
        name: 'Custom API Call',
        interfaceType: 'api',
        description: 'Make a custom API request',
        parameters: {
          endpoint: '/api/endpoint',
          method: 'POST',
          port: 3000,
          data: { example: 'data' }
        }
      });
    }
    
    if (project.interfaces?.mcp) {
      templates.push({
        name: 'List MCP Tools',
        interfaceType: 'mcp',
        description: 'List available MCP tools',
        parameters: {
          mcpRequest: {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list'
          }
        }
      });
      
      templates.push({
        name: 'Call MCP Tool',
        interfaceType: 'mcp',
        description: 'Execute an MCP tool',
        parameters: {
          mcpRequest: {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'example_tool',
              arguments: {}
            }
          }
        }
      });
    }
    
    return templates;
  }

  return router;
}

module.exports = createExecutionRoutes;