import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool 
} from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from './tool-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

console.error('SQLite Task MCP Server starting...');

const server = new Server({
  name: 'agent-mcp',
  version: '1.0.0',
}, {
  capabilities: { tools: {} }
});

const toolHandlers = new ToolHandlers();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: 'remember_context',
      description: 'Store context for future conversations',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Memory key' },
          value: { type: 'string', description: 'Value to remember' },
          category: { type: 'string', description: 'Category (task, project, preference)' }
        },
        required: ['key', 'value']
      }
    },
    {
      name: 'recall_context',
      description: 'Retrieve stored context',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Memory key to retrieve' },
          category: { type: 'string', description: 'Category to search in' }
        }
      }
    },
    {
      name: 'list_memories',
      description: 'List all stored memories by category',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category to filter by' }
        }
      }
    },
    {
      name: 'create_task',
      description: 'Create a new task',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description' },
          project: { type: 'string', description: 'Project name' }
        },
        required: ['title']
      }
    },
    {
      name: 'execute_agent_task',
      description: 'Hand off a task to an AI agent for autonomous execution',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { 
            type: 'string', 
            description: 'Task ID from tasks.yaml (e.g., TASK-001)' 
          },
          agent: { 
            type: 'string', 
            description: 'Target agent (codecatalyst, designer, etc)',
            enum: ['codecatalyst', 'designer', 'analyst']
          },
          mode: { 
            type: 'string', 
            description: 'Execution mode',
            enum: ['auto', 'desktop'],
            default: 'auto'
          }
        },
        required: ['taskId', 'agent']
      }
    },
    {
      name: 'check_agent_status',
      description: 'Check the status of an agent task execution',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { 
            type: 'string', 
            description: 'Task ID to check status for' 
          }
        },
        required: ['taskId']
      }
    },
    {
      name: 'kill_agent',
      description: 'Terminate a running agent process',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { 
            type: 'string', 
            description: 'Task ID of the agent to kill' 
          }
        },
        required: ['taskId']
      }
    },
    {
      name: 'list_running_agents',
      description: 'List all currently running agent processes',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'spawn_claude_instance',
      description: 'Spawn a new Claude Code instance in a Docker container',
      inputSchema: {
        type: 'object',
        properties: {
          name: { 
            type: 'string', 
            description: 'Unique name for the Claude instance' 
          },
          port: { 
            type: 'number', 
            description: 'Port to expose (auto-assigned if not provided)' 
          },
          workspace: { 
            type: 'string', 
            description: 'Workspace directory path',
            default: './workspaces/default'
          },
          project: { 
            type: 'string', 
            description: 'Project name for the instance',
            default: 'default'
          }
        },
        required: ['name']
      }
    },
    {
      name: 'list_claude_instances',
      description: 'List all running Claude Code Docker instances',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'stop_claude_instance',
      description: 'Stop a Claude Code Docker instance',
      inputSchema: {
        type: 'object',
        properties: {
          name: { 
            type: 'string', 
            description: 'Name of the Claude instance to stop' 
          },
          force: { 
            type: 'boolean', 
            description: 'Force kill the instance (docker kill vs docker stop)',
            default: false
          }
        },
        required: ['name']
      }
    },
    {
      name: 'claude_instance_logs',
      description: 'Get logs from a Claude Code Docker instance',
      inputSchema: {
        type: 'object',
        properties: {
          name: { 
            type: 'string', 
            description: 'Name of the Claude instance' 
          },
          lines: { 
            type: 'number', 
            description: 'Number of log lines to retrieve',
            default: 50
          },
          follow: { 
            type: 'boolean', 
            description: 'Follow logs in real-time',
            default: false
          }
        },
        required: ['name']
      }
    }
  ];

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const typedArgs = args as Record<string, any>;

  try {
    let result: string;

    switch (name) {
      case 'remember_context':
        result = await toolHandlers.handleRememberContext(typedArgs);
        break;
      case 'recall_context':
        result = await toolHandlers.handleRecallContext(typedArgs);
        break;
      case 'list_memories':
        result = await toolHandlers.handleListMemories(typedArgs);
        break;
      case 'create_task':
        result = await toolHandlers.handleCreateTask(typedArgs);
        break;
      case 'execute_agent_task':
        result = await toolHandlers.handleExecuteAgentTask(typedArgs);
        break;
      case 'check_agent_status':
        result = await toolHandlers.handleCheckAgentStatus(typedArgs);
        break;
      case 'kill_agent':
        result = await toolHandlers.handleKillAgent(typedArgs);
        break;
      case 'list_running_agents':
        result = await toolHandlers.handleListRunningAgents(typedArgs);
        break;
      case 'spawn_claude_instance':
        result = await toolHandlers.handleSpawnClaudeInstance(typedArgs);
        break;
      case 'list_claude_instances':
        result = await toolHandlers.handleListClaudeInstances(typedArgs);
        break;
      case 'stop_claude_instance':
        result = await toolHandlers.handleStopClaudeInstance(typedArgs);
        break;
      case 'claude_instance_logs':
        result = await toolHandlers.handleClaudeInstanceLogs(typedArgs);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return { content: [{ type: 'text', text: result }] };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Agent MCP Server started');
}

main().catch(console.error);
