# Implementation Ticket: 001 - MCP Server Setup

## 📋 Overview
Set up the basic MCP server infrastructure that will host all our tools and enable bi-directional communication with Claude.

## 🔗 References
- **Spec**: [MCP Nexus Specification](../specs/core/mcp-nexus.md)
- **Architecture**: [Bi-directional MCP Clarified](../architecture/bidirectional-mcp-clarified.md)

## 🎯 Scope
Create a minimal MCP server that:
- Initializes with proper configuration
- Registers basic tools with Claude
- Handles tool calls and responses
- Provides agentInstructions in responses

## ✅ Acceptance Criteria

### AC-001-1: Server Initialization
```yaml
Given: MCP server configuration
When: Server starts
Then: Successfully connects to MCP protocol
And: Registers available tools
And: Ready to handle tool calls
```

### AC-001-2: Tool Registration
```yaml
Given: Tool definitions with proper schemas
When: Server initializes
Then: All tools are registered with MCP
And: Tool schemas are validated
And: Tools appear in Claude's available tools
```

### AC-001-3: Basic Tool Response
```yaml
Given: Incoming tool call from Claude
When: Server processes the call
Then: Returns proper MCP response format
And: Includes agentInstructions field
And: Response time < 100ms
```

## 🧪 Test Cases

### Unit Tests
1. **Server initialization** - Can create and start server
2. **Tool registration** - Tools properly registered with schemas
3. **Response format** - Returns correct MCP structure
4. **Agent instructions** - Always includes agentInstructions

### Integration Tests
1. **MCP protocol compliance** - Follows MCP spec
2. **Tool discovery** - Claude can see registered tools
3. **Round trip** - Can receive call and send response

## 💻 Implementation

### File Structure
```
src/
├── mcp-server.js          # Main server class
├── infrastructure/
│   └── server.js          # Server setup and config
└── adapters/
    └── primary/
        └── mcp-adapter.js # MCP protocol adapter
```

### Core Implementation
```javascript
// src/mcp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export class KinglyMCPServer {
  constructor() {
    this.server = new Server({
      name: 'kingly-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupTools();
  }
  
  setupTools() {
    // Register our first tool
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [{
        name: 'echo',
        description: 'Test tool that echoes input',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          },
          required: ['message']
        }
      }]
    }));
    
    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      // Add agentInstructions to every response
      const result = await this.handleToolCall(name, args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }],
        _meta: {
          agentInstructions: this.generateInstructions(name, result)
        }
      };
    });
  }
  
  async handleToolCall(toolName, args) {
    switch (toolName) {
      case 'echo':
        return { message: args.message, timestamp: Date.now() };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
  
  generateInstructions(toolName, result) {
    return `Tool '${toolName}' executed successfully. You can now proceed with the task.`;
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

### Startup Script
```javascript
// start-mcp.js
import { KinglyMCPServer } from './src/mcp-server.js';

const server = new KinglyMCPServer();
server.start().catch(console.error);
```

## 🔧 Dependencies
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- No other dependencies for this ticket

## 📊 Effort Estimate
- Implementation: 2 hours
- Testing: 1 hour
- Total: 3 hours

## 🚀 Next Steps
After this ticket:
- 002: Add State Manager for tracking conversations
- 003: Implement Workflow Engine to load workflow definitions

## 📝 Notes
- Keep it minimal - just enough to have a working MCP server
- The echo tool is temporary for testing
- Focus on getting the agentInstructions pattern working
- This forms the foundation for all bi-directional communication