# Decision Record 1: Bi-Directional MCP Router Architecture

**Date**: 2025-01-25  
**Decision**: Design intelligent MCP router with bi-directional communication and adaptive learning

## Problem Statement

How do we handle unknown agent requests gracefully while building intelligence into the system? The orchestrator needs a way to discover, test, and integrate new capabilities dynamically.

## Key Insight: Bi-Directional Communication

Instead of fallback patterns, use **conversational discovery**:

```
LLM Request → MCP Router → "Can't find exact match, here are 3 close ones"
          ↓
Orchestrator → Try option 1 → Fails
          ↓  
Orchestrator → Search/Research → Find solution → Send instructions back
          ↓
MCP Router → Adds new MCP to system → Now available as agent
```

## Architecture Design

### **MCP Router Intelligence**
```javascript
class IntelligentMCPRouter {
  constructor() {
    this.mcpRegistry = new MCPRegistry();
    this.searchEngine = new SearchEngine(); // Perplexity integration
    this.learningDb = new LearningDatabase(); // Tracks success/failure
  }
  
  async findAgent(request) {
    // 1. Exact match
    const exact = await this.mcpRegistry.findExact(request);
    if (exact) return { type: 'exact', agent: exact };
    
    // 2. Close matches
    const closeMatches = await this.mcpRegistry.findSimilar(request, 3);
    if (closeMatches.length > 0) {
      return { 
        type: 'suggestions', 
        matches: closeMatches,
        confidence: 'medium'
      };
    }
    
    // 3. Request search assistance
    return { 
      type: 'search_needed', 
      query: request,
      suggestion: "Need to research this capability"
    };
  }
  
  async addFromResearch(instructions) {
    // Parse: URL, NPX package, env keys, etc.
    const mcpConfig = this.parseInstructions(instructions);
    
    // Install/configure MCP
    await this.mcpRegistry.install(mcpConfig);
    
    // Wrap as agent
    const agent = new MCPWrapper(mcpConfig);
    this.mcpRegistry.register(agent);
    
    // Learn from this interaction
    this.learningDb.recordSuccess(instructions, agent.id);
    
    return agent;
  }
}
```

### **Orchestrator Conversation Flow**
```yaml
conversation_pattern:
  1_request: "I need a PDF generator agent"
  
  2_router_response:
    type: "suggestions"
    matches: 
      - "html-to-pdf-mcp"
      - "document-generator-mcp" 
      - "print-service-mcp"
      
  3_orchestrator_tries: "html-to-pdf-mcp"
  
  4_result: "Failed - wrong input format"
  
  5_orchestrator_research:
    action: "search"
    query: "best PDF generation MCP for text input"
    
  6_research_result:
    solution: "npx @anthropic/pdf-mcp"
    instructions: "Env: PDF_API_KEY, Input: markdown text"
    
  7_router_learns:
    installs: "@anthropic/pdf-mcp"
    creates_agent: "pdf-generator"
    records_success: true
```

## Provider Architecture

### **MCP Provider**
```javascript
// Takes agent YAML and exposes via MCP protocol
class MCPProvider {
  constructor(agents) {
    this.agents = agents;
    this.mcpServer = new MCPServer();
  }
  
  expose(agent) {
    // Convert agent capabilities to MCP tools
    agent.capabilities.forEach(capability => {
      this.mcpServer.addTool({
        name: `${agent.id}_${capability}`,
        description: agent.description,
        inputSchema: capability.inputSchema,
        handler: (params) => agent.execute(capability, params)
      });
    });
  }
}

// Example: Dev agent becomes MCP
const devAgent = loadAgent('dev.yaml');
mcpProvider.expose(devAgent);
// Now available as: mcp__dev-agent__analyze_complexity
```

### **API Provider** (Future)
```javascript
// Takes agent YAML and exposes via REST
class APIProvider {
  exposeAgent(agent) {
    this.app.post(`/api/agents/${agent.id}/execute`, async (req, res) => {
      const result = await agent.execute(req.body.capability, req.body.params);
      res.json(result);
    });
  }
}
```

## Meta Framework Concept

This is designed to be **AI stack agnostic**:

### **Claude Desktop Mode**
```yaml
orchestrator:
  type: "system_prompt"
  location: "claude_desktop"
  tools: ["desktop_commander_mcp", "aiforge_mcp"]
  instructions: |
    You are the AIForge orchestrator. Use desktop_commander 
    for file operations and aiforge_mcp for agent routing.
```

### **Claude Code Mode** 
```javascript
// You (Claude Code) simulate orchestrator
const orchestrator = new Orchestrator();
const result = await orchestrator.route("build a fitness app");
// Uses desktop_commander directly
```

### **Cursor/VSCode Mode**
```yaml
orchestrator:
  type: "roo_code_mode"
  instructions: "Built-in system prompt with file structure rules"
  simulation_mode: true  # No real MCP calls
```

## Adaptive Learning Pattern

The system **measures and adapts**:

```javascript
class AdaptiveMeta {
  async findOptimalRoute(request, context) {
    const routes = [
      { method: 'direct_mcp', speed: 50, accuracy: 95 },
      { method: 'llm_simulation', speed: 200, accuracy: 80 },
      { method: 'api_call', speed: 1000, accuracy: 99 }
    ];
    
    // Try fastest first, fallback if needed
    for (const route of routes.sort(by => by.speed)) {
      try {
        const result = await this.execute(route, request);
        this.recordSuccess(route, result.time, result.quality);
        return result;
      } catch (error) {
        this.recordFailure(route, error);
        continue;
      }
    }
  }
  
  // Over time, learns which routes work best for which requests
  getOptimalStack(userProfile, requestType) {
    return this.learningDb.getBestPerformingStack(userProfile, requestType);
  }
}
```

## Decision Record Format

Going forward, each `impl-{n}.md` captures:
- **Problem**: What we're solving
- **Decision**: What we chose
- **Architecture**: How it works  
- **Rationale**: Why this approach
- **Implications**: What this enables/constrains

This bi-directional communication pattern enables the system to **grow its own intelligence** by learning from research and successful integrations.

## Next Discussions Needed

1. **Global Memory Architecture**: How agents share learned patterns
2. **Decision Record System**: Automated capture of architectural decisions
3. **Performance Measurement**: How to benchmark different routes
4. **Security Model**: Permissions for dynamic MCP installation
5. **Conflict Resolution**: When multiple agents can handle the same request