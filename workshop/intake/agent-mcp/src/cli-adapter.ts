#!/usr/bin/env node

/**
 * CLI Adapter for MCP Tools
 * 
 * Enables direct testing of MCP tools without going through the full protocol.
 * Usage: node cli-adapter.js <tool_name> <args_json>
 * 
 * Examples:
 * node cli-adapter.js create_task '{"title": "Test task", "description": "Test description"}'
 * node cli-adapter.js execute_agent_task '{"taskId": "TASK-123", "agent": "codecatalyst", "mode": "auto"}'
 */

import { ToolHandlers } from './tool-handlers.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPCLIAdapter {
  private toolHandlers = new ToolHandlers();

  private toolMethods = {
    'create_task': this.toolHandlers.handleCreateTask.bind(this.toolHandlers),
    'execute_agent_task': this.toolHandlers.handleExecuteAgentTask.bind(this.toolHandlers),
    'check_agent_status': this.toolHandlers.handleCheckAgentStatus.bind(this.toolHandlers),
    'kill_agent': this.toolHandlers.handleKillAgent.bind(this.toolHandlers),
    'list_running_agents': this.toolHandlers.handleListRunningAgents.bind(this.toolHandlers),
    'remember_context': this.toolHandlers.handleRememberContext.bind(this.toolHandlers),
    'recall_context': this.toolHandlers.handleRecallContext.bind(this.toolHandlers),
    'list_memories': this.toolHandlers.handleListMemories.bind(this.toolHandlers),
    'spawn_claude_instance': this.toolHandlers.handleSpawnClaudeInstance.bind(this.toolHandlers),
    'list_claude_instances': this.toolHandlers.handleListClaudeInstances.bind(this.toolHandlers),
    'stop_claude_instance': this.toolHandlers.handleStopClaudeInstance.bind(this.toolHandlers),
    'claude_instance_logs': this.toolHandlers.handleClaudeInstanceLogs.bind(this.toolHandlers)
  };

  async callTool(toolName: string, args: Record<string, any>): Promise<string> {
    const method = this.toolMethods[toolName as keyof typeof this.toolMethods];
    
    if (!method) {
      throw new Error(`Unknown tool: ${toolName}. Available tools: ${Object.keys(this.toolMethods).join(', ')}`);
    }

    try {
      const result = await method(args);
      return result;
    } catch (error) {
      throw new Error(`Tool ${toolName} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  listTools(): string[] {
    return Object.keys(this.toolMethods);
  }

  async runInteractive(): Promise<void> {
    console.log('🔧 MCP CLI Adapter - Interactive Mode');
    console.log('Available tools:', this.listTools().join(', '));
    console.log('Usage: <tool_name> <args_json>');
    console.log('Example: create_task {"title": "Test task"}');
    console.log('Type "exit" to quit\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'mcp> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const trimmed = line.trim();
      
      if (trimmed === 'exit') {
        rl.close();
        return;
      }

      if (trimmed === 'help') {
        console.log('Available tools:', this.listTools().join(', '));
        rl.prompt();
        return;
      }

      try {
        const parts = trimmed.split(' ');
        const toolName = parts[0];
        const argsJson = parts.slice(1).join(' ') || '{}';
        
        if (!toolName) {
          console.log('Please provide a tool name');
          rl.prompt();
          return;
        }

        const args = JSON.parse(argsJson);
        const result = await this.callTool(toolName, args);
        
        console.log('✅ Result:');
        console.log(result);
        console.log('');
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }
}

// CLI Entry point
async function main() {
  const adapter = new MCPCLIAdapter();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Interactive mode
    await adapter.runInteractive();
    return;
  }

  if (args[0] === '--list') {
    console.log('Available tools:');
    adapter.listTools().forEach(tool => console.log(`  ${tool}`));
    return;
  }

  if (args[0] === '--help') {
    console.log('MCP CLI Adapter');
    console.log('');
    console.log('Usage:');
    console.log('  node cli-adapter.js                    # Interactive mode');
    console.log('  node cli-adapter.js --list             # List available tools');
    console.log('  node cli-adapter.js <tool> <args>      # Execute tool directly');
    console.log('');
    console.log('Examples:');
    console.log('  node cli-adapter.js create_task \'{"title": "Test task"}\'');
    console.log('  node cli-adapter.js list_running_agents \'{}\'');
    return;
  }

  // Direct tool execution
  try {
    const toolName = args[0];
    const argsJson = args[1] || '{}';
    const toolArgs = JSON.parse(argsJson);
    
    const result = await adapter.callTool(toolName, toolArgs);
    console.log(result);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Export for testing
export { MCPCLIAdapter };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}