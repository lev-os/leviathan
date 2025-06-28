/**
 * HTTP/gRPC Adapter for Workflow Orchestrator
 * 
 * Provides REST API and gRPC endpoints for workflow orchestration
 * Leverages Leviathan's existing infrastructure
 */

import { WorkflowOrchestrator } from '../../core/workflow-orchestrator.js';
import { WorkflowMCP } from '../mcp/workflow-mcp.js';

export class WorkflowHTTPAdapter {
  constructor(options = {}) {
    this.mcp = new WorkflowMCP(options);
    this.port = options.port || 3000;
    this.basePath = options.basePath || '/api/workflow';
  }

  /**
   * Get Express router configuration
   */
  getRouter() {
    const router = express.Router();
    
    // Execute workflow
    router.post(`${this.basePath}/execute`, async (req, res) => {
      try {
        const result = await this.mcp.executeWorkflow(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // List workflows
    router.get(`${this.basePath}/list`, async (req, res) => {
      try {
        const result = await this.mcp.listWorkflows(req.query);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Get workflow info
    router.get(`${this.basePath}/info/:workflow`, async (req, res) => {
      try {
        const result = await this.mcp.getWorkflowInfo({
          workflow: req.params.workflow
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Handle callback
    router.post(`${this.basePath}/callback`, async (req, res) => {
      try {
        const result = await this.mcp.handleCallback(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Get status
    router.get(`${this.basePath}/status/:orchestrationId?`, async (req, res) => {
      try {
        const result = await this.mcp.getStatus({
          orchestrationId: req.params.orchestrationId
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // WebSocket for real-time updates
    router.ws(`${this.basePath}/stream/:orchestrationId`, (ws, req) => {
      const orchestrationId = req.params.orchestrationId;
      
      // Send status updates
      const interval = setInterval(async () => {
        const status = await this.mcp.getStatus({ orchestrationId });
        ws.send(JSON.stringify(status));
        
        if (status.status !== 'running') {
          clearInterval(interval);
          ws.close();
        }
      }, 1000);
      
      ws.on('close', () => clearInterval(interval));
    });
    
    return router;
  }

  /**
   * Get gRPC service definition
   */
  getGRPCService() {
    return {
      service: 'WorkflowOrchestrator',
      methods: {
        ExecuteWorkflow: {
          handler: async (call, callback) => {
            try {
              const result = await this.mcp.executeWorkflow(call.request);
              callback(null, result);
            } catch (error) {
              callback(error);
            }
          }
        },
        ListWorkflows: {
          handler: async (call, callback) => {
            try {
              const result = await this.mcp.listWorkflows(call.request);
              callback(null, result);
            } catch (error) {
              callback(error);
            }
          }
        },
        GetWorkflowInfo: {
          handler: async (call, callback) => {
            try {
              const result = await this.mcp.getWorkflowInfo(call.request);
              callback(null, result);
            } catch (error) {
              callback(error);
            }
          }
        },
        HandleCallback: {
          handler: async (call, callback) => {
            try {
              const result = await this.mcp.handleCallback(call.request);
              callback(null, result);
            } catch (error) {
              callback(error);
            }
          }
        },
        GetStatus: {
          handler: async (call, callback) => {
            try {
              const result = await this.mcp.getStatus(call.request);
              callback(null, result);
            } catch (error) {
              callback(error);
            }
          }
        },
        StreamStatus: {
          handler: async (call) => {
            const orchestrationId = call.request.orchestrationId;
            
            const interval = setInterval(async () => {
              const status = await this.mcp.getStatus({ orchestrationId });
              call.write(status);
              
              if (status.status !== 'running') {
                clearInterval(interval);
                call.end();
              }
            }, 1000);
            
            call.on('cancelled', () => clearInterval(interval));
          }
        }
      }
    };
  }

  /**
   * Create standalone Express app
   */
  createApp() {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    app.use(this.getRouter());
    
    return app;
  }

  /**
   * Start standalone server
   */
  async start() {
    const app = this.createApp();
    
    return new Promise((resolve) => {
      const server = app.listen(this.port, () => {
        console.log(`Workflow Orchestrator HTTP API running on port ${this.port}`);
        resolve(server);
      });
    });
  }
}

/**
 * Create HTTP/gRPC adapter configuration for Leviathan
 */
export function createHTTPAdapter(options = {}) {
  const adapter = new WorkflowHTTPAdapter(options);
  
  return {
    name: 'workflow-orchestrator-http',
    version: '1.0.0',
    router: adapter.getRouter(),
    grpc: adapter.getGRPCService()
  };
}