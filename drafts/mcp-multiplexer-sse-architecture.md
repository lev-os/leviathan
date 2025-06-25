# MCP Multiplexer SSE Architecture

*Generated: 2025-06-24*
*Session: workshop-mcp-analysis*

## Executive Summary

**Problem**: 225+ duplicate MCP server processes across multiple Claude Code sessions consuming excessive system resources (6.75GB+ memory, massive CPU overhead).

**Solution**: Server-Sent Events (SSE) based MCP multiplexer that provides session-aware routing and resource sharing across the entire Leviathan ecosystem.

## Current Problem Analysis

### Process Proliferation Issue
- **225 `npm exec` processes** running simultaneously
- **228 total npx/node processes** 
- Multiple instances across **25+ terminal sessions** (s000, s001, s002, etc.)
- Each session spawns identical MCP server sets:
  - `@modelcontextprotocol/server-slack`
  - `@notionhq/notion-mcp-server` 
  - `@21st-dev/magic@latest`
  - `fetch-mcp`
  - `server-perplexity-ask`
  - `@modelcontextprotocol/server-brave-search`
  - `@wonderwhy-er/desktop-commander@latest`

### Resource Impact
- **Memory**: 225 processes × ~30MB = 6.75GB → Target: ~8 processes × 30MB = 240MB
- **CPU**: Massive context switching overhead
- **Network**: Redundant connections to external services

## SSE-Based MCP Multiplexer Architecture

### Core Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Claude Session 1│    │ Claude Session 2│    │ Claude Session N│
│     (stdio)     │    │     (stdio)     │    │     (stdio)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  MCP Multiplexer Server  │
                    │   (Single Node Process)  │
                    │                          │
                    │ ┌──────────────────────┐ │
                    │ │   Session Router     │ │
                    │ │  (SSE internally)    │ │
                    │ └──────────────────────┘ │
                    └────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
    │Real MCP   │         │Real MCP   │         │Real MCP   │
    │Server 1   │         │Server 2   │         │Server N   │
    └───────────┘         └───────────┘         └───────────┘
```

### Key Innovation: stdio-Compatible SSE

**No Claude Code Modification Required**: The multiplexer appears as a standard MCP server using stdio protocol, while internally managing session routing via SSE.

```json
// ~/.claude/config.json
{
  "mcpServers": {
    "mcp-multiplexer": {
      "type": "stdio", 
      "command": "node",
      "args": ["/path/to/mcp-multiplexer/index.js"]
    }
  }
}
```

## Implementation Phases

### Phase 1: MCP Multiplexer Core

**mcp-multiplexer/index.js** (stdio-compatible):
```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class MCPMultiplexer {
  constructor() {
    this.realServers = new Map();
    this.sessionStore = new Map();
    this.server = new Server(
      { name: "mcp-multiplexer", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );
    
    this.setupHandlers();
    this.initializeRealServers();
  }

  async setupHandlers() {
    // Proxy all tool calls to real servers
    this.server.setRequestHandler('tools/list', async () => {
      const allTools = [];
      for (const [name, server] of this.realServers) {
        try {
          const tools = await server.listTools();
          allTools.push(...tools.map(tool => ({
            ...tool,
            name: `${name}/${tool.name}` // Namespace tools
          })));
        } catch (error) {
          console.error(`Error listing tools from ${name}:`, error);
        }
      }
      return { tools: allTools };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      const [serverName, toolName] = name.split('/', 2);
      
      const realServer = this.realServers.get(serverName);
      if (!realServer) {
        throw new Error(`Unknown server: ${serverName}`);
      }

      return await realServer.callTool(toolName, args);
    });
  }

  async initializeRealServers() {
    // Start the actual MCP servers as child processes
    const serverConfigs = [
      { name: 'desktop-commander', command: 'npx', args: ['-y', '@wonderwhy-er/desktop-commander@latest'] },
      { name: 'notion', command: 'npx', args: ['-y', '@notionhq/notion-mcp-server'] },
      { name: 'fetch', command: 'npx', args: ['-y', 'fetch-mcp'] },
      { name: 'brave', command: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'] },
      { name: 'perplexity', command: 'npx', args: ['-y', 'server-perplexity-ask'] },
      { name: 'slack', command: 'npx', args: ['-y', '@modelcontextprotocol/server-slack'] }
    ];

    for (const config of serverConfigs) {
      try {
        const realServer = await this.createRealServer(config);
        this.realServers.set(config.name, realServer);
        console.error(`✅ Started ${config.name} server`);
      } catch (error) {
        console.error(`❌ Failed to start ${config.name}:`, error);
      }
    }
  }

  async createRealServer(config) {
    // Create child process for real MCP server
    const { spawn } = await import('child_process');
    const childProcess = spawn(config.command, config.args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { ...process.env }
    });

    // Create MCP client to communicate with real server
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
    
    const client = new Client(
      { name: "mcp-multiplexer-client", version: "1.0.0" },
      { capabilities: {} }
    );
    
    const transport = new StdioClientTransport({
      spawn: () => ({ stdout: childProcess.stdout, stdin: childProcess.stdin })
    });
    
    await client.connect(transport);
    return client;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the multiplexer
const multiplexer = new MCPMultiplexer();
multiplexer.start().catch(console.error);
```

### Phase 2: Session-Aware Routing

```javascript
// Enhanced multiplexer with session awareness
this.server.setRequestHandler('tools/call', async (request) => {
  const sessionId = this.extractSessionId(request); // From stdio metadata
  const sessionState = this.getOrCreateSession(sessionId);
  
  // Route to real server with session context
  return await this.routeWithSession(sessionState, request);
});
```

### Phase 3: Leviathan Integration

**Broader Ecosystem Applications**:

1. **Agent System Integration**: Route MCP calls across the entire Leviathan agent ecosystem
2. **Session Continuity**: Maintain session state across Claude Code tabs and Leviathan components
3. **Hot-Reload Development**: Update MCP servers without disrupting active sessions
4. **Resource Optimization**: Shared MCP infrastructure for all Leviathan services

## Leviathan Architecture Alignment

### Core Technical Principles

**LLM-First Architecture**: MCP multiplexer acts as intelligent routing layer for AI-native tool access
**Maximum Extensibility**: Plugin architecture where MCP servers are hot-pluggable modules
**Bi-Directional Communication**: SSE enables real-time LLM ↔ System feedback loops
**Bootstrap Sovereignty**: Minimal dependencies with maximum autonomy
**Emergent Intelligence**: Behavior emerges from intelligent tool routing and session management

### Integration Points

**Context-First Architecture**: Session-aware context sharing across multiplexer
**Universal Context System**: MCP tools become part of the universal context pattern
**FlowMind Integration**: Natural language instructions route through MCP infrastructure
**Session Management**: Cross-tab context continuity via session-aware multiplexer

## Benefits Analysis

### Resource Management
- **Memory Reduction**: 6.75GB → 240MB (96% reduction)
- **CPU Efficiency**: Eliminate context switching overhead between 225 processes
- **Network Optimization**: Connection pooling instead of per-session connections

### Development Experience
- **Centralized Debugging**: Single point to monitor all MCP interactions
- **Hot Swapping**: Update MCP servers without disconnecting sessions
- **Performance Metrics**: Analytics for MCP usage patterns across Leviathan

### Architectural Advantages
- **Fault Isolation**: One MCP server crash doesn't affect other sessions
- **Session Continuity**: Natural session management across Claude Code tabs
- **Plugin Ecosystem**: Foundation for Leviathan's @lev-os/* plugin architecture

## Implementation Strategy

### Immediate (Week 1)
1. **Prototype MCP Multiplexer** - Basic stdio server with MCP routing
2. **Session Management** - Claude Code session ID extraction and routing
3. **MCP Server Pool** - Lifecycle management of real MCP servers

### Short-term (Week 2-3)
4. **Claude Code Integration** - Replace current MCP config with multiplexer
5. **Testing Framework** - Validate session isolation and resource optimization
6. **Fallback Strategy** - Graceful degradation if multiplexer fails

### Medium-term (Month 1-2)
7. **Leviathan Agent Integration** - Extend multiplexer to entire agent ecosystem
8. **Advanced Session Features** - Cross-service session continuity
9. **Plugin Architecture** - Hot-pluggable MCP server modules

### Long-term (Month 2+)
10. **Performance Optimization** - Advanced caching and routing strategies
11. **Ecosystem Contribution** - Contribute multiplexer pattern back to MCP community
12. **Universal Tool Router** - Foundation for Leviathan's tool ecosystem

## Revolutionary Impact

This MCP multiplexer represents a **foundational infrastructure improvement** that:

1. **Solves immediate resource problems** (225 → 8 processes)
2. **Enables advanced session management** across Leviathan ecosystem
3. **Provides plugin architecture foundation** for @lev-os/* packages
4. **Creates reusable pattern** for the broader MCP community

The SSE-based approach combined with stdio compatibility makes this a **universal solution** applicable beyond just Claude Code to any MCP-enabled system.

## Next Steps

1. **Architecture Review**: Validate design against Leviathan's core principles
2. **Prototype Development**: Build minimal viable multiplexer
3. **Integration Planning**: Map integration points with existing Leviathan components
4. **Performance Testing**: Validate resource optimization claims
5. **Community Contribution**: Prepare for broader MCP ecosystem adoption

---

*This architecture represents a significant advancement in MCP infrastructure and aligns perfectly with Leviathan's vision of AI-native, maximally extensible systems.*