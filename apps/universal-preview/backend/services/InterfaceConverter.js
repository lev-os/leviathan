const fs = require('fs').promises;
const path = require('path');

class InterfaceConverter {
  constructor() {
    this.converters = {
      'cli-to-api': this.convertCliToApi.bind(this),
      'cli-to-mcp': this.convertCliToMcp.bind(this),
      'api-to-cli': this.convertApiToCli.bind(this),
      'api-to-mcp': this.convertApiToMcp.bind(this),
      'mcp-to-api': this.convertMcpToApi.bind(this),
      'mcp-to-cli': this.convertMcpToCli.bind(this)
    };
  }

  async convertInterface(project, fromType, toType) {
    console.log(`🔄 Converting ${fromType} → ${toType} for ${project.name}`);
    
    const converterKey = `${fromType}-to-${toType}`;
    const converter = this.converters[converterKey];
    
    if (!converter) {
      throw new Error(`Conversion from ${fromType} to ${toType} not supported`);
    }

    const result = await converter(project);
    
    return {
      id: this.generateConversionId(project.id, fromType, toType),
      projectId: project.id,
      fromType,
      toType,
      conversion: result,
      convertedAt: new Date().toISOString()
    };
  }

  // CLI to API conversion
  async convertCliToApi(project) {
    const cliInterface = project.interfaces?.cli;
    
    return {
      type: 'api-wrapper',
      framework: 'express',
      port: 3001,
      wrapper: {
        code: this.generateApiWrapper(project),
        dockerfile: this.generateApiDockerfile(project),
        packageJson: this.generateApiPackageJson(project)
      },
      endpoints: this.generateApiEndpoints(project, 'cli'),
      middleware: ['cors', 'helmet', 'express.json()'],
      documentation: {
        openapi: '3.0.0',
        info: {
          title: `${project.name} API Wrapper`,
          description: `REST API wrapper for ${project.name} CLI`,
          version: '1.0.0'
        },
        paths: this.generateOpenApiPaths(project, 'cli')
      }
    };
  }

  // CLI to MCP conversion
  async convertCliToMcp(project) {
    return {
      type: 'mcp-wrapper',
      protocol: 'stdio',
      wrapper: {
        code: this.generateMcpWrapper(project),
        schema: this.generateMcpSchema(project)
      },
      tools: this.generateMcpTools(project, 'cli'),
      resources: [],
      prompts: []
    };
  }

  // API to CLI conversion
  async convertApiToCli(project) {
    const apiInterface = project.interfaces?.api;
    
    return {
      type: 'cli-wrapper',
      wrapper: {
        code: this.generateCliWrapper(project),
        binary: `${project.name}-cli`
      },
      commands: this.generateCliCommands(project, 'api'),
      configuration: {
        configFile: '.config',
        envVars: ['API_BASE_URL', 'API_KEY']
      }
    };
  }

  // API to MCP conversion
  async convertApiToMcp(project) {
    return {
      type: 'mcp-api-bridge',
      protocol: 'stdio',
      wrapper: {
        code: this.generateMcpApiBridge(project),
        schema: this.generateMcpSchema(project)
      },
      tools: this.generateMcpTools(project, 'api'),
      authentication: {
        type: 'bearer',
        header: 'Authorization'
      }
    };
  }

  // MCP to API conversion
  async convertMcpToApi(project) {
    return {
      type: 'api-mcp-bridge',
      framework: 'express',
      port: 3002,
      wrapper: {
        code: this.generateMcpToApiWrapper(project),
        dockerfile: this.generateApiDockerfile(project)
      },
      endpoints: this.generateApiEndpoints(project, 'mcp'),
      mcpConnection: {
        protocol: 'stdio',
        command: this.getMcpCommand(project)
      }
    };
  }

  // MCP to CLI conversion
  async convertMcpToCli(project) {
    return {
      type: 'cli-mcp-bridge',
      wrapper: {
        code: this.generateMcpToCliWrapper(project),
        binary: `${project.name}-cli`
      },
      commands: this.generateCliCommands(project, 'mcp'),
      mcpConnection: {
        protocol: 'stdio',
        command: this.getMcpCommand(project)
      }
    };
  }

  // Code generation methods
  generateApiWrapper(project) {
    return `const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: '${project.name}-api-wrapper' });
});

// Execute CLI command
app.post('/execute', async (req, res) => {
  try {
    const { command, args = [], env = {} } = req.body;
    
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      cwd: '/app'
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      res.json({
        exitCode: code,
        stdout,
        stderr,
        success: code === 0
      });
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill('SIGTERM');
      res.status(408).json({ error: 'Command timeout' });
    }, 30000);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`${project.name} API wrapper listening on port \${PORT}\`);
});
`;
  }

  generateMcpWrapper(project) {
    return `#!/usr/bin/env node

const { spawn } = require('child_process');

class McpWrapper {
  constructor() {
    this.tools = ${JSON.stringify(this.generateMcpTools(project, 'cli'), null, 2)};
  }

  async handleRequest(request) {
    switch (request.method) {
      case 'tools/list':
        return this.listTools();
      case 'tools/call':
        return this.callTool(request.params);
      default:
        throw new Error(\`Unknown method: \${request.method}\`);
    }
  }

  listTools() {
    return {
      tools: this.tools
    };
  }

  async callTool({ name, arguments: args }) {
    const tool = this.tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(\`Tool not found: \${name}\`);
    }

    return new Promise((resolve, reject) => {
      const command = this.buildCommand(name, args);
      const child = spawn(command.cmd, command.args, {
        cwd: '/app',
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          content: [
            {
              type: 'text',
              text: code === 0 ? stdout : stderr
            }
          ],
          isError: code !== 0
        });
      });

      child.on('error', reject);
    });
  }

  buildCommand(toolName, args) {
    // Convert MCP tool call to CLI command
    return {
      cmd: '${this.getEntrypoint(project)}',
      args: Object.entries(args).flat()
    };
  }
}

// MCP stdio protocol handler
const wrapper = new McpWrapper();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await wrapper.handleRequest(request);
    
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      result: response
    }));
  } catch (error) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -1,
        message: error.message
      }
    }));
  }
});
`;
  }

  generateMcpApiBridge(project) {
    return `#!/usr/bin/env node

const axios = require('axios');

class McpApiBridge {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.apiKey = process.env.API_KEY;
    this.tools = ${JSON.stringify(this.generateMcpTools(project, 'api'), null, 2)};
  }

  async handleRequest(request) {
    switch (request.method) {
      case 'tools/list':
        return this.listTools();
      case 'tools/call':
        return this.callTool(request.params);
      default:
        throw new Error(\`Unknown method: \${request.method}\`);
    }
  }

  listTools() {
    return { tools: this.tools };
  }

  async callTool({ name, arguments: args }) {
    try {
      const endpoint = this.getEndpointForTool(name);
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.apiKey) {
        headers['Authorization'] = \`Bearer \${this.apiKey}\`;
      }

      const response = await axios({
        method: endpoint.method,
        url: \`\${this.baseUrl}\${endpoint.path}\`,
        headers,
        data: args
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: \`Error: \${error.message}\`
          }
        ],
        isError: true
      };
    }
  }

  getEndpointForTool(toolName) {
    // Map tool names to API endpoints
    const mappings = {
      'execute': { method: 'POST', path: '/execute' },
      'status': { method: 'GET', path: '/status' }
    };
    
    return mappings[toolName] || { method: 'POST', path: \`/\${toolName}\` };
  }
}

// MCP stdio protocol handler
const bridge = new McpApiBridge();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await bridge.handleRequest(request);
    
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      result: response
    }));
  } catch (error) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -1,
        message: error.message
      }
    }));
  }
});
`;
  }

  generateApiDockerfile(project) {
    return `FROM ${this.getDockerImage(project)}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN ${this.getInstallCommand(project)}

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the API wrapper
CMD ["node", "api-wrapper.js"]
`;
  }

  generateApiPackageJson(project) {
    return {
      name: `${project.name}-api-wrapper`,
      version: '1.0.0',
      description: `REST API wrapper for ${project.name}`,
      main: 'api-wrapper.js',
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.0.0'
      },
      scripts: {
        start: 'node api-wrapper.js',
        dev: 'nodemon api-wrapper.js'
      }
    };
  }

  generateApiEndpoints(project, sourceType) {
    const endpoints = [
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    ];

    if (sourceType === 'cli') {
      endpoints.push({
        path: '/execute',
        method: 'POST',
        description: 'Execute CLI command',
        parameters: {
          command: { type: 'string', required: true },
          args: { type: 'array', required: false },
          env: { type: 'object', required: false }
        }
      });
    }

    if (sourceType === 'mcp') {
      endpoints.push({
        path: '/tools',
        method: 'GET',
        description: 'List available MCP tools'
      }, {
        path: '/tools/:name',
        method: 'POST',
        description: 'Execute MCP tool',
        parameters: {
          arguments: { type: 'object', required: true }
        }
      });
    }

    return endpoints;
  }

  generateMcpTools(project, sourceType) {
    const tools = [];

    if (sourceType === 'cli') {
      tools.push({
        name: 'execute',
        description: `Execute ${project.name} CLI command`,
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command to execute'
            },
            args: {
              type: 'array',
              items: { type: 'string' },
              description: 'Command arguments'
            }
          },
          required: ['command']
        }
      });
    }

    if (sourceType === 'api') {
      tools.push({
        name: 'api_call',
        description: `Make API call to ${project.name}`,
        inputSchema: {
          type: 'object',
          properties: {
            endpoint: {
              type: 'string',
              description: 'API endpoint path'
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE'],
              description: 'HTTP method'
            },
            data: {
              type: 'object',
              description: 'Request body data'
            }
          },
          required: ['endpoint', 'method']
        }
      });
    }

    return tools;
  }

  generateMcpSchema(project) {
    return {
      name: project.name,
      version: '1.0.0',
      description: project.metadata?.description || '',
      tools: this.generateMcpTools(project, 'cli')
    };
  }

  generateCliCommands(project, sourceType) {
    const commands = [];

    if (sourceType === 'api') {
      commands.push({
        name: 'call',
        description: 'Make API call',
        options: [
          { name: '--endpoint', description: 'API endpoint', required: true },
          { name: '--method', description: 'HTTP method', default: 'GET' },
          { name: '--data', description: 'Request data (JSON)' }
        ]
      });
    }

    if (sourceType === 'mcp') {
      commands.push({
        name: 'tools',
        description: 'List available tools'
      }, {
        name: 'call',
        description: 'Call MCP tool',
        options: [
          { name: '--tool', description: 'Tool name', required: true },
          { name: '--args', description: 'Tool arguments (JSON)' }
        ]
      });
    }

    return commands;
  }

  generateOpenApiPaths(project, sourceType) {
    const paths = {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      service: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    if (sourceType === 'cli') {
      paths['/execute'] = {
        post: {
          summary: 'Execute CLI command',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    command: { type: 'string' },
                    args: { type: 'array', items: { type: 'string' } },
                    env: { type: 'object' }
                  },
                  required: ['command']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Command executed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      exitCode: { type: 'number' },
                      stdout: { type: 'string' },
                      stderr: { type: 'string' },
                      success: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        }
      };
    }

    return paths;
  }

  // Helper methods
  getDockerImage(project) {
    const language = project.analysis?.language;
    const images = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-slim',
      'rust': 'rust:1.70',
      'go': 'golang:1.21-alpine'
    };
    return images[language] || 'node:18-alpine';
  }

  getInstallCommand(project) {
    const packageManager = project.analysis?.packageManager || 'npm';
    return `${packageManager} install`;
  }

  getEntrypoint(project) {
    return project.metadata?.entryPoint || 'index.js';
  }

  getMcpCommand(project) {
    if (project.analysis?.language === 'node') {
      return `node ${this.getEntrypoint(project)}`;
    }
    return './main';
  }

  generateConversionId(projectId, fromType, toType) {
    return `${projectId}-${fromType}-${toType}-${Date.now()}`;
  }
}

module.exports = InterfaceConverter;