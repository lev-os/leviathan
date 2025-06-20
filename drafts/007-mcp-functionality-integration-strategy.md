# ADR-007: MCP Functionality Integration Strategy

## Status
**Accepted** - 2024-12-15

## Context
After analyzing the Kingly source code, it's clear we need MCP *functionality* (agent coordination, tool calling, context management) as core features, not necessarily an MCP server. The existing platforms Smithery.ai, ACI.dev, and Arcade.dev provide mature infrastructure for MCP tool integration and agent coordination.

## Problem Statement
- Need MCP capabilities without building/maintaining server infrastructure
- Require 600+ tool integrations for comprehensive agent functionality
- Must handle OAuth, authentication, and secure tool access
- Need to leverage existing MCP ecosystem rather than rebuild from scratch

## Decision
**Integrate with ACI.dev as Primary Platform** with Smithery.ai for tool discovery and Arcade.dev for specialized auth workflows:

### Platform Selection Rationale
```yaml
platform_analysis:
  aci_dev:
    strengths:
      - "600+ tool integrations"
      - "Multi-tenant OAuth handling"
      - "Direct function calling + MCP server access"
      - "VibeOps infrastructure alignment"
      - "Open source platform"
    primary_use: "Core agent-tool integration"
    
  smithery_ai:
    strengths:
      - "MCP server registry and discovery"
      - "Community-driven MCP ecosystem"
      - "Easy server deployment"
    primary_use: "Tool discovery and MCP server management"
    
  arcade_dev:
    strengths:
      - "Enterprise-grade authentication"
      - "LangChain Open Agent Platform integration"
      - "Secure action execution"
      - "$12M funding, mature platform"
    primary_use: "Specialized auth workflows and enterprise integrations"
```

## Architecture Integration

### Core MCP Functionality Extraction
```typescript
// Extract MCP functionality from Kingly source without server overhead
interface KinglyMCPCore {
  // Agent coordination (from _REF/kingly/src/index.js)
  agentCoordinator: AgentCoordinator;
  
  // WASM-embedded context lookup
  contextLookup: WASMContextLookup;
  
  // Remote semantic processing
  semanticAPI: SemanticAPIClient;
  
  // Workflow management
  workflowLoader: WorkflowLoader;
  
  // Context system
  contextSystem: UniversalContextSystem;
  
  // Tool integration via ACI.dev
  toolOrchestrator: ACIToolOrchestrator;
}

class BrowserKinglyCore {
  constructor() {
    // Port core Kingly logic without MCP server layer
    this.contextLookup = new WASMContextLookup();        // Embedded WASM contexts
    this.semanticAPI = new SemanticAPIClient();          // Remote semantic processing
    this.workflowLoader = new WorkflowLoader();
    this.contextSystem = new UniversalContextSystem();
    
    // Integrate with external platforms
    this.aciIntegration = new ACIDevIntegration();
    this.smitheryRegistry = new SmitheryRegistry();
  }
}
```

### ACI.dev Integration Architecture
```typescript
interface ACIDevIntegration {
  // 600+ tool access
  toolCatalog: ACIToolCatalog;
  
  // OAuth and authentication
  authManager: ACIAuthManager;
  
  // Direct function calling
  functionCaller: ACIFunctionCaller;
  
  // Multi-tenant support
  tenantManager: ACITenantManager;
}

class ACIToolOrchestrator {
  async executeToolAction(
    toolId: string,
    action: string,
    parameters: Record<string, any>,
    userAuth: AuthToken
  ): Promise<ToolResult> {
    
    // Route through ACI.dev for secure execution
    return this.aciClient.callTool({
      tool: toolId,
      action,
      parameters,
      auth: userAuth,
      tenant: this.getCurrentTenant()
    });
  }
  
  async discoverTools(capability: string): Promise<ToolInfo[]> {
    // Search ACI.dev's 600+ tool catalog
    return this.aciClient.searchTools({
      capability,
      compatibility: 'mcp',
      authSupport: true
    });
  }
}
```

### Smithery.ai MCP Server Registry
```typescript
interface SmitheryIntegration {
  // MCP server discovery
  serverRegistry: SmitheryRegistry;
  
  // Community MCP servers
  communityServers: CommunityMCPServers;
  
  // Custom server deployment
  serverDeployer: SmitheryDeployer;
}

class SmitheryRegistry {
  async findMCPServers(requirements: ServerRequirements): Promise<MCPServer[]> {
    // Search Smithery registry for relevant MCP servers
    const servers = await this.smitheryClient.search({
      category: requirements.category,
      capabilities: requirements.capabilities,
      rating: { min: 4.0 },
      maintenance: 'active'
    });
    
    return servers.map(server => new MCPServerProxy(server));
  }
  
  async deployCustomServer(serverSpec: MCPServerSpec): Promise<DeployedServer> {
    // Deploy custom MCP server via Smithery
    return this.smitheryClient.deploy(serverSpec);
  }
}
```

## Tool Integration Strategy

### Unified Tool Access Layer
```yaml
tool_integration:
  primary_sources:
    aci_dev:
      tools: 600+
      categories:
        - development
        - productivity
        - communication
        - data_analysis
        - marketing
        - sales
      auth_handling: "automatic_oauth"
      
    smithery_registry:
      mcp_servers: "community_contributed"
      categories:
        - specialized_domains
        - custom_integrations
        - experimental_tools
      deployment: "on_demand"
      
  tool_resolution:
    strategy: "best_fit_selection"
    fallback_chain:
      - aci_dev_direct
      - smithery_mcp_server
      - custom_implementation
```

### Agent Tool Coordination
```typescript
class UnifiedToolCoordinator {
  async resolveToolCapability(
    capability: string,
    context: AgentContext
  ): Promise<ToolResolution> {
    
    // Try ACI.dev first (600+ tools with OAuth)
    const aciTools = await this.aciRegistry.findTools(capability);
    if (aciTools.length > 0) {
      return {
        source: 'aci.dev',
        tool: aciTools[0],
        executor: this.aciExecutor
      };
    }
    
    // Fallback to Smithery MCP servers
    const mcpServers = await this.smitheryRegistry.findMCPServers({
      capability,
      context: context.domain
    });
    
    if (mcpServers.length > 0) {
      return {
        source: 'smithery.ai',
        tool: mcpServers[0],
        executor: this.mcpExecutor
      };
    }
    
    // Final fallback: custom implementation
    return this.createCustomTool(capability, context);
  }
}
```

## Authentication and Security

### Multi-Platform Auth Strategy
```typescript
interface UnifiedAuthManager {
  // ACI.dev OAuth handling
  aciAuth: ACIAuthManager;
  
  // Arcade.dev enterprise auth
  arcadeAuth: ArcadeAuthManager;
  
  // User token management
  tokenManager: TokenManager;
  
  // Permission management
  permissionManager: PermissionManager;
}

class SecureToolExecution {
  async executeWithAuth(
    toolCall: ToolCall,
    userContext: UserContext
  ): Promise<ToolResult> {
    
    // Determine auth requirements
    const authRequirements = await this.analyzeAuthNeeds(toolCall);
    
    // Route to appropriate auth platform
    if (authRequirements.enterprise) {
      return this.executeViaArcade(toolCall, userContext);
    } else {
      return this.executeViaACI(toolCall, userContext);
    }
  }
  
  private async executeViaACI(
    toolCall: ToolCall,
    userContext: UserContext
  ): Promise<ToolResult> {
    // Handle OAuth through ACI.dev
    const authToken = await this.aciAuth.getToken(
      toolCall.tool.id,
      userContext.userId
    );
    
    return this.aciExecutor.execute(toolCall, authToken);
  }
}
```

## Framework-Specific Tool Integration

### Rich YAML Tool Enhancement
```yaml
# Enhanced framework contexts with tool integration
framework_context:
  type: "framework"
  id: "nextjs_14_tailwind_shadcn"
  
  # Tool requirements for this framework
  required_tools:
    development:
      - "vercel.deployment"
      - "github.repository"
      - "npm.package_management"
    
    monitoring:
      - "vercel.analytics"
      - "sentry.error_tracking"
      
    design:
      - "figma.design_import"
      - "shadcn.component_generation"
  
  # Tool resolution through unified coordinator
  tool_resolution:
    strategy: "framework_optimized"
    preference_order:
      - "aci_dev_verified"
      - "smithery_community"
      - "custom_implementation"
```

### Agent Tool Specialization
```typescript
class FrameworkAwareAgent {
  constructor(
    frameworkContext: FrameworkContext,
    toolCoordinator: UnifiedToolCoordinator
  ) {
    this.framework = frameworkContext;
    this.tools = toolCoordinator;
    
    // Load framework-specific tool mappings
    this.toolMappings = this.loadToolMappings(frameworkContext.id);
  }
  
  async generateComponent(spec: ComponentSpec): Promise<ComponentGeneration> {
    // Use framework-appropriate tools
    const designTool = await this.tools.resolve('design.component_generation', {
      framework: this.framework.id,
      style_system: this.framework.styling
    });
    
    const codeTool = await this.tools.resolve('code.generation', {
      framework: this.framework.id,
      typescript: true
    });
    
    // Coordinate multi-tool component generation
    return this.coordinateGeneration(designTool, codeTool, spec);
  }
}
```

## Implementation Strategy

### Phase 1: ACI.dev Core Integration (Week 1)
```bash
# Install ACI.dev SDK
npm install @aci-dev/client

# Setup OAuth and tool discovery
# Integrate with existing Kingly agent coordination
```

### Phase 2: Smithery MCP Registry (Week 2)
```bash
# Smithery registry integration
# MCP server discovery and proxy setup
# Tool fallback chain implementation
```

### Phase 3: Unified Tool Coordinator (Week 3)
```bash
# Multi-platform tool resolution
# Framework-aware tool selection
# Authentication flow integration
```

### Phase 4: Advanced Workflows (Week 4)
```bash
# Complex multi-tool workflows
# Enterprise auth via Arcade.dev
# Production tool orchestration
```

## Cost and Scaling Considerations

### Platform Costs
```yaml
cost_analysis:
  aci_dev:
    model: "usage_based"
    free_tier: "development_usage"
    cost_factor: "tool_executions"
    
  smithery_ai:
    model: "freemium"
    free_tier: "community_servers"
    cost_factor: "custom_deployments"
    
  arcade_dev:
    model: "enterprise"
    pricing: "contact_sales"
    cost_factor: "auth_volume"
```

### Scaling Strategy
- Start with ACI.dev free tier for development
- Use Smithery community servers for specialized needs
- Add Arcade.dev for enterprise customers requiring advanced auth
- Monitor usage and optimize tool selection for cost efficiency

## Success Criteria

### Integration Metrics
- **Tool Availability**: Access to 600+ tools via ACI.dev
- **Auth Success**: >99% OAuth flow completion rate
- **Tool Discovery**: <2 seconds to find relevant tools
- **Execution Reliability**: >95% successful tool executions

### Developer Experience
- **Setup Time**: <30 minutes to integrate new tools
- **Documentation**: Complete tool catalog with examples
- **Error Handling**: Clear error messages and recovery suggestions

## Alternatives Considered

### 1. Build Custom MCP Server Infrastructure
- **Pros**: Full control, optimized for our needs
- **Cons**: 6+ months development, maintenance overhead
- **Rejected**: Existing platforms provide superior capabilities

### 2. Direct Tool Integrations
- **Pros**: Simple, no platform dependencies
- **Cons**: Limited tool count, auth complexity, maintenance burden
- **Rejected**: Cannot scale to 600+ tools

### 3. LangChain/LlamaIndex Tool Ecosystems
- **Pros**: Mature, well-documented
- **Cons**: Not MCP-native, limited OAuth support
- **Rejected**: MCP compatibility requirement

## Notes
- ACI.dev's VibeOps alignment matches our "vibe coding" target audience
- Smithery.ai provides access to cutting-edge MCP community developments
- Arcade.dev enables enterprise adoption through secure auth workflows
- This approach leverages $12M+ in platform development investment

## References
- [ACI.dev Platform Documentation](https://platform.aci.dev/)
- [Smithery.ai MCP Registry](https://smithery.ai/docs)
- [Arcade.dev Authentication Platform](https://www.arcade.dev/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)