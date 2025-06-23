# MCP-CLI Integration Implementation Guide

## Quick Start Implementation

### Step 1: Create the MCP-CLI Tool Provider

```javascript
// src/adapters/tools/mcp-cli-tool-provider.js
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export class MCPCLIToolProvider {
  constructor(processAdapter, memoryAdapter) {
    this.processAdapter = processAdapter;
    this.memoryAdapter = memoryAdapter;
    this.sessions = new Map();
  }

  getTools() {
    return [
      {
        name: 'mcp_cli_chat',
        description: 'Start or continue a chat session with MCP servers via terminal',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: { 
              type: 'string', 
              description: 'Session ID to continue (optional)' 
            },
            server: { 
              type: 'string', 
              description: 'MCP server to connect to' 
            },
            prompt: { 
              type: 'string', 
              description: 'Initial prompt to send' 
            },
            provider: { 
              type: 'string', 
              description: 'LLM provider (openai, anthropic, ollama)',
              default: 'openai'
            },
            model: { 
              type: 'string', 
              description: 'Model to use' 
            }
          },
          required: ['server', 'prompt']
        }
      },
      {
        name: 'mcp_cli_command',
        description: 'Execute a direct MCP-CLI command',
        inputSchema: {
          type: 'object',
          properties: {
            command: { 
              type: 'string', 
              description: 'Command to execute' 
            },
            args: { 
              type: 'object', 
              description: 'Command arguments' 
            }
          },
          required: ['command']
        }
      },
      {
        name: 'mcp_cli_list_tools',
        description: 'List available tools from MCP servers',
        inputSchema: {
          type: 'object',
          properties: {
            server: { 
              type: 'string', 
              description: 'Server to query' 
            },
            detailed: { 
              type: 'boolean', 
              description: 'Show detailed tool info',
              default: false
            }
          },
          required: ['server']
        }
      }
    ];
  }

  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'mcp_cli_chat':
        return await this.handleChatSession(args);
      case 'mcp_cli_command':
        return await this.executeCommand(args);
      case 'mcp_cli_list_tools':
        return await this.listTools(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async handleChatSession(args) {
    const sessionId = args.sessionId || uuidv4();
    
    // Check for existing session
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // Start new session
      const command = [
        'mcp-cli', 'cmd',
        '--server', args.server,
        '--provider', args.provider || 'openai',
        args.model ? `--model ${args.model}` : '',
        '--prompt', args.prompt,
        '--raw'
      ].filter(Boolean).join(' ');

      const result = await this.processAdapter.startProcess(command, {
        type: 'mcp-cli-chat',
        taskId: sessionId
      });

      session = {
        id: sessionId,
        processId: result.processId,
        server: args.server,
        history: []
      };
      
      this.sessions.set(sessionId, session);
    }

    // Send prompt to existing session
    const response = await this.sendToSession(sessionId, args.prompt);
    
    // Store in memory
    await this.memoryAdapter.remember(
      `mcp-cli-session-${sessionId}`,
      {
        prompt: args.prompt,
        response: response,
        timestamp: new Date().toISOString()
      },
      'terminal-sessions'
    );

    return {
      sessionId,
      response,
      message: `MCP-CLI session ${sessionId} active`,
      agentInstructions: `
Terminal session ${sessionId} is active with ${args.server}.
Recent exchange:
- User: ${args.prompt}
- Response: ${response.substring(0, 200)}...

To continue this session, use mcp_cli_chat with sessionId: "${sessionId}"
      `
    };
  }

  async executeCommand(args) {
    const command = `mcp-cli ${args.command} ${JSON.stringify(args.args || {})}`;
    
    const result = await this.processAdapter.executeCommand(command);
    
    return {
      output: result.output,
      exitCode: result.exitCode,
      message: `Executed: ${command}`,
      agentInstructions: `
MCP-CLI command executed: ${command}
Exit code: ${result.exitCode}
Output preview: ${result.output.substring(0, 200)}...
      `
    };
  }

  async listTools(args) {
    const command = `mcp-cli tools list {} --server ${args.server} ${args.detailed ? '--all' : ''}`;
    
    const result = await this.processAdapter.executeCommand(command);
    const tools = JSON.parse(result.output);
    
    return {
      tools,
      count: tools.length,
      message: `Found ${tools.length} tools on ${args.server}`,
      agentInstructions: `
Available tools on ${args.server}:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

You can execute these tools using mcp_cli_command.
      `
    };
  }
}
```

### Step 2: Register with Kingly's Tool System

```javascript
// src/infrastructure/dependency-injection.js
// Add to existing DI setup

import { MCPCLIToolProvider } from '../adapters/tools/mcp-cli-tool-provider.js';

// In the setupDependencies function
const mcpCliToolProvider = new MCPCLIToolProvider(
  processAdapter,
  memoryAdapter
);

// Register tools
toolRegistry.registerProvider('mcp-cli', mcpCliToolProvider);
```

### Step 3: Add Context Capture

```javascript
// src/adapters/context/mcp-cli-context-strategy.js
export class MCPCLIContextStrategy {
  constructor(mcpCliProvider) {
    this.mcpCliProvider = mcpCliProvider;
  }

  async capture() {
    const activeSessions = Array.from(this.mcpCliProvider.sessions.values());
    
    return {
      type: 'mcp-cli-sessions',
      sessions: activeSessions.map(session => ({
        id: session.id,
        server: session.server,
        historyLength: session.history.length,
        lastActivity: session.lastActivity
      })),
      timestamp: new Date().toISOString()
    };
  }

  async restore(context) {
    // Restore session information
    return {
      restored: context.sessions.length,
      message: `MCP-CLI context restored: ${context.sessions.length} sessions`
    };
  }
}
```

### Step 4: Pipeline Integration

```javascript
// src/mcp-pipeline.js
// Add MCP-CLI awareness to pipeline

class MCPPipeline {
  constructor(config) {
    // ... existing code ...
    
    // Add MCP-CLI plugin
    this.registerPlugin({
      name: 'mcp-cli-status',
      priority: 95,
      always: async (context) => {
        const cliSessions = await this.mcpCliProvider.getActiveSessions();
        
        if (cliSessions.length > 0) {
          context.result.agentInstructions += `

📟 MCP-CLI Sessions:
${cliSessions.map(s => `- ${s.id}: ${s.server} (${s.status})`).join('\n')}
          `;
        }
      }
    });
  }
}
```

## Usage Examples

### Example 1: Database Exploration

```javascript
// LLM can now use MCP-CLI for database exploration
await agent.run(`
  I need to explore the SQLite database structure. 
  Use MCP-CLI to connect and list all tables, then show me the schema.
`);

// This would trigger:
// 1. mcp_cli_list_tools with server='sqlite'
// 2. mcp_cli_command to list tables
// 3. mcp_cli_chat for interactive exploration
```

### Example 2: Multi-Server Coordination

```javascript
// Coordinate between multiple MCP servers
await agent.run(`
  Compare the file structure from filesystem server 
  with the database schema from sqlite server.
  Use MCP-CLI to query both.
`);
```

### Example 3: Session Persistence

```javascript
// Continue previous session
const context = await workspaceService.recallContext('last-mcp-cli-session');
await agent.run(`
  Continue the MCP-CLI session ${context.sessionId} 
  and complete the analysis we started.
`);
```

## Testing Strategy

```javascript
// tests/test-mcp-cli-integration.js
import { MCPCLIToolProvider } from '../src/adapters/tools/mcp-cli-tool-provider.js';

describe('MCP-CLI Integration', () => {
  test('should list tools from server', async () => {
    const provider = new MCPCLIToolProvider(mockProcessAdapter, mockMemory);
    const result = await provider.listTools({ server: 'sqlite' });
    
    expect(result.tools).toBeArray();
    expect(result.message).toContain('Found');
  });
  
  test('should maintain chat sessions', async () => {
    const provider = new MCPCLIToolProvider(mockProcessAdapter, mockMemory);
    
    const session1 = await provider.handleChatSession({
      server: 'sqlite',
      prompt: 'List tables'
    });
    
    const session2 = await provider.handleChatSession({
      sessionId: session1.sessionId,
      server: 'sqlite',
      prompt: 'Show schema for users table'
    });
    
    expect(session2.sessionId).toBe(session1.sessionId);
  });
});
```

## Next Steps

1. **Implement streaming support** for real-time terminal output
2. **Add session management UI** in web interface
3. **Create terminal replay** functionality
4. **Build command templates** for common operations
5. **Integrate with workflow system** for automated terminal sequences