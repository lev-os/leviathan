// External Toolchain Router for Kingly
// Routes capabilities to ~/i and ~/r tooling while maintaining YAML-first architecture

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

export class ExternalToolchainRouter {
  constructor() {
    this.infrastructurePath = path.join(os.homedir(), 'i');
    this.researchPath = path.join(os.homedir(), 'r');
    this.activeSessions = new Map();
  }

  async routeCapability(capability, context, sessionId) {
    const routing = this.getRoutingForCapability(capability);
    
    if (!routing) {
      throw new Error(`No routing found for capability: ${capability}`);
    }

    return await this.executeWithSession(routing, context, sessionId);
  }

  getRoutingForCapability(capability) {
    const routingMap = {
      // Web automation → ~/r/mcp-browser-use
      'web_automation': {
        type: 'mcp_server',
        path: path.join(this.researchPath, 'mcp-browser-use'),
        command: 'uv run mcp-browser-use'
      },
      
      // Memory operations → ~/r tools
      'memory_operations': {
        type: 'tool_collection',
        path: this.researchPath,
        tools: ['store_memory', 'query_memories', 'get_linked_memories']
      },
      
      // AI generation → ~/r tools  
      'ai_generation': {
        type: 'tool_collection',
        path: this.researchPath,
        tools: ['generate_completion', 'stream_completion', 'chat_completion']
      },
      
      // Task orchestration → ~/i/agent-zero
      'task_orchestration': {
        type: 'agent_system',
        path: path.join(this.infrastructurePath, 'agent-zero'),
        command: 'python run.py'
      },
      
      // Web crawling → ~/i/mcp-crawl4ai-rag
      'crawling_rag': {
        type: 'mcp_server', 
        path: path.join(this.infrastructurePath, 'mcp-crawl4ai-rag'),
        port: 8051,
        protocol: 'sse'
      },

      // File operations → ~/r tools
      'file_operations': {
        type: 'tool_collection',
        path: this.researchPath,
        tools: ['read_file', 'write_file', 'search_files', 'directory_tree']
      }
    };

    return routingMap[capability];
  }

  async executeWithSession(routing, context, sessionId) {
    try {
      switch (routing.type) {
        case 'mcp_server':
          return await this.executeMcpServer(routing, context, sessionId);
          
        case 'agent_system':
          return await this.executeAgentSystem(routing, context, sessionId);
          
        case 'tool_collection':
          return await this.executeToolCollection(routing, context, sessionId);
          
        default:
          throw new Error(`Unknown routing type: ${routing.type}`);
      }
    } catch (error) {
      console.error(`External toolchain execution failed:`, error);
      return { success: false, error: error.message };
    }
  }

  async executeMcpServer(routing, context, sessionId) {
    // For MCP servers, establish connection and send requests
    if (routing.protocol === 'sse') {
      return await this.executeSseServer(routing, context, sessionId);
    } else {
      return await this.executeStdioServer(routing, context, sessionId);
    }
  }  async executeSseServer(routing, context, sessionId) {
    // Connect to SSE endpoint (e.g., crawl4ai on localhost:8051)
    const response = await fetch(`http://localhost:${routing.port}/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        context: context,
        action: 'execute'
      })
    });

    return await response.json();
  }

  async executeStdioServer(routing, context, sessionId) {
    // Launch STDIO MCP server process
    return new Promise((resolve, reject) => {
      const process = spawn(routing.command.split(' ')[0], routing.command.split(' ').slice(1), {
        cwd: routing.path,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      // Send context as JSON-RPC
      process.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        id: sessionId,
        method: 'execute_context',
        params: { context }
      }));
      process.stdin.end();
    });
  }

  async executeAgentSystem(routing, context, sessionId) {
    // Execute Agent Zero with Kingly context as prompt injection
    const agentConfig = {
      session_id: sessionId,
      kingly_context: context,
      prompt_injection: this.buildPromptInjection(context)
    };

    return new Promise((resolve, reject) => {
      const process = spawn('python', ['run.py', '--config', JSON.stringify(agentConfig)], {
        cwd: routing.path,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ 
            success: true, 
            output,
            session_id: sessionId,
            agent_results: this.parseAgentOutput(output)
          });
        } else {
          reject(new Error(`Agent Zero exited with code ${code}`));
        }
      });
    });
  }

  async executeToolCollection(routing, context, sessionId) {
    // Execute specific tools from ~/r collection
    const results = {};
    
    for (const tool of routing.tools) {
      try {
        const toolResult = await this.executeSpecificTool(tool, routing.path, context, sessionId);
        results[tool] = toolResult;
      } catch (error) {
        results[tool] = { success: false, error: error.message };
      }
    }

    return { success: true, results };
  }

  async executeSpecificTool(toolName, basePath, context, sessionId) {
    // Route to specific tool based on tools_list.json mapping
    const toolsListPath = path.join(basePath, 'tools_list.json');
    
    if (await fs.pathExists(toolsListPath)) {
      const toolsList = await fs.readJson(toolsListPath);
      
      if (toolsList.includes(toolName)) {
        // Tool exists, execute it
        return await this.invokeRTool(toolName, context, sessionId);
      }
    }
    
    throw new Error(`Tool ${toolName} not found in ${basePath}`);
  }

  async invokeRTool(toolName, context, sessionId) {
    // Invoke tool from ~/r environment
    // This would typically involve calling the specific tool's API/interface
    return new Promise((resolve, reject) => {
      const process = spawn('python', ['-c', `
import sys
sys.path.append('${this.researchPath}')
# Import and execute specific tool
result = execute_tool('${toolName}', '${JSON.stringify(context)}', '${sessionId}')
print(result)
      `], {
        cwd: this.researchPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: output.trim() });
        } else {
          reject(new Error(`Tool ${toolName} failed with code ${code}`));
        }
      });
    });
  }

  buildPromptInjection(context) {
    // Build prompt injection for Agent Zero from Kingly context
    return `
# Kingly Context Integration

You are receiving this task from the Kingly AI system. The following context should guide your execution:

**Context Type**: ${context.type || 'unknown'}
**Context Name**: ${context.name || 'untitled'}

**Kingly Instructions**:
${context.prompts?.system || 'Execute the task with full capability.'}

**Expected Outcome**:
${context.templates?.completion || 'Complete the task and return results to Kingly.'}

Please maintain session continuity and return results in a format that Kingly can integrate.
`;
  }

  parseAgentOutput(output) {
    // Parse Agent Zero output to extract structured results
    try {
      // Look for JSON blocks in output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      // Fall back to plain text parsing
    }
    
    return { raw_output: output };
  }

  async checkToolAvailability() {
    // Check if external toolchains are available
    const checks = {
      infrastructure_available: await fs.pathExists(this.infrastructurePath),
      research_available: await fs.pathExists(this.researchPath),
      agent_zero: await fs.pathExists(path.join(this.infrastructurePath, 'agent-zero')),
      mcp_proxy: await fs.pathExists(path.join(this.infrastructurePath, 'mcp-proxy')),
      browser_use: await fs.pathExists(path.join(this.researchPath, 'mcp-browser-use'))
    };

    return checks;
  }

  async getCapabilitySuggestions(contextType, contextDescription) {
    // Suggest which external capabilities might be useful for given context
    const suggestions = [];

    if (contextDescription?.includes('web') || contextDescription?.includes('browser')) {
      suggestions.push('web_automation');
    }

    if (contextDescription?.includes('memory') || contextDescription?.includes('remember')) {
      suggestions.push('memory_operations');
    }

    if (contextDescription?.includes('generate') || contextDescription?.includes('ai')) {
      suggestions.push('ai_generation');
    }

    if (contextDescription?.includes('complex') || contextDescription?.includes('orchestrat')) {
      suggestions.push('task_orchestration');
    }

    if (contextDescription?.includes('crawl') || contextDescription?.includes('extract')) {
      suggestions.push('crawling_rag');
    }

    return suggestions;
  }
}