# ADR-005: Kingly MCP Orchestration Layer

## Status
**Accepted** - 2024-12-15

## Context
The app builder requires a sophisticated orchestration layer to coordinate multiple AI agents, manage complex workflows, and maintain session continuity. The existing Kingly MCP system provides 80% of required infrastructure but needs browser adaptation and workflow integration.

## Problem Statement
- Need unlimited agent endpoints for specialized development tasks
- Must coordinate complex multi-agent workflows autonomously
- Require session continuity across browser refreshes and long-running processes
- Integration with progressive disclosure UI and BMAD methodology

## Decision
**Adapt Kingly MCP System for Browser Orchestration** with the following architecture:

### Core Orchestration Architecture
```yaml
kingly_orchestration:
  agent_endpoints:
    unlimited: true
    naming_pattern: "domain.specialty"
    examples:
      - "dev.frontend"
      - "kingly.architect" 
      - "ceo.product"
      - "design.ux"
      - "security.analysis"
      - "performance.optimization"
      
  workflow_coordination:
    yaml_driven: true
    context_inheritance: "universal"
    autonomous_execution: true
    session_persistence: true
```

### Browser Adaptation Strategy
```typescript
// Browser-compatible MCP implementation
interface KinglyBrowserMCP {
  // Core MCP functionality (no server - direct tool integration)
  toolCoordinator: UnifiedToolCoordinator;  // ACI.dev + Smithery integration
  
  // Kingly intelligence extensions
  contextLookup: WASMContextLookup;         // Embedded WASM context bundles
  semanticAPI: SemanticAPIClient;           // Remote semantic processing
  workflowLoader: BrowserWorkflowLoader;
  ceoBinding: BrowserCEOBinding;
  contextSystem: UniversalContextSystem;
}

class KinglyBrowserCore {
  constructor() {
    // Extract core functionality from _REF/kingly/src/index.js (1,235 lines)
    // No MCP server - direct JavaScript integration
    this.contextLookup = new WASMContextLookup();
    this.toolCoordinator = new UnifiedToolCoordinator();
    this.workflowLoader = new BrowserWorkflowLoader();
  }
  
  async initialize(): Promise<void> {
    // Load embedded WASM context bundles
    await this.contextLookup.loadCoreBundle();
    
    // Initialize tool integrations
    await this.toolCoordinator.initializeACI();
    await this.toolCoordinator.initializeSmithery();
  }
}
```

## Agent Ecosystem Architecture

### Unlimited Agent Endpoints
```yaml
agent_registry:
  core_agents:
    - name: "kingly.architect"
      role: "System architecture and technical decision making"
      specialization: "LLM-first architecture patterns"
      
    - name: "dev.frontend"
      role: "Frontend development and UI implementation"
      specialization: "React, Next.js, Tailwind, shadcn/ui"
      
    - name: "ceo.product"
      role: "Product strategy and business requirements"
      specialization: "BMAD methodology, PRD generation"
      
  specialized_agents:
    - name: "design.ux"
      role: "User experience and interface design"
      specialization: "Progressive disclosure, conversation design"
      
    - name: "backend.api"
      role: "Backend architecture and API design"
      specialization: "Cloud deployment, database design"
      
    - name: "security.analysis"
      role: "Security assessment and compliance"
      specialization: "OWASP, authentication, data protection"
```

### Dynamic Agent Spawning
```typescript
class AgentOrchestrator {
  async spawnAgent(
    domain: string,
    specialty: string,
    context: ProjectContext
  ): Promise<KinglyAgent> {
    
    const agentEndpoint = `${domain}.${specialty}`;
    
    // Check if agent already exists
    if (this.activeAgents.has(agentEndpoint)) {
      return this.activeAgents.get(agentEndpoint);
    }
    
    // Create new agent with context inheritance
    const agent = new KinglyAgent({
      endpoint: agentEndpoint,
      context: this.contextSystem.inherit(context),
      capabilities: await this.loadCapabilities(domain, specialty),
      workflow: await this.workflowLoader.load(`${domain}-${specialty}`)
    });
    
    this.activeAgents.set(agentEndpoint, agent);
    return agent;
  }
}
```

## YAML Workflow Integration

### Workflow Definition System
```yaml
# Example: Frontend development workflow
workflow:
  name: "frontend_development"
  trigger: "user_requirements_complete"
  
  agents:
    primary: "dev.frontend"
    supporting:
      - "design.ux"
      - "kingly.architect"
      
  phases:
    - name: "component_architecture"
      agent: "kingly.architect"
      confidence_threshold: 90
      validation: "technical_feasibility"
      
    - name: "ui_implementation"
      agent: "dev.frontend"
      confidence_threshold: 95
      validation: "framework_compliance"
      
    - name: "ux_optimization"
      agent: "design.ux"
      confidence_threshold: 85
      validation: "usability_standards"
```

### Context Inheritance System
```typescript
interface UniversalContextSystem {
  // Everything inherits from universal context
  baseContext: UniversalContext;
  
  // Context composition and inheritance
  inherit(parentContext: Context): Context;
  compose(contexts: Context[]): Context;
  
  // Dynamic context evolution
  evolve(context: Context, newInformation: Information): Context;
  
  // Context-aware agent behavior
  adaptBehavior(agent: KinglyAgent, context: Context): AgentBehavior;
}

class UniversalContext {
  // Core principles that all contexts inherit
  principles: ConstitutionalFramework;
  capabilities: AgentCapabilities;
  knowledge: SemanticKnowledgeBase;
  patterns: WorkflowPatterns;
  
  // Project-specific context
  project: ProjectContext;
  session: SessionContext;
  user: UserContext;
}
```

## Session Continuity Architecture

### Browser Session Management
```typescript
interface SessionManager {
  // Persistent session storage
  storage: BrowserSessionStorage;
  
  // Session state management
  currentSession: SessionState;
  sessionHistory: SessionHistory[];
  
  // Cross-tab coordination
  broadcastChannel: BroadcastChannel;
  
  // Session recovery
  recoverSession(sessionId: string): Promise<SessionState>;
  persistSession(session: SessionState): Promise<void>;
}

class BrowserSessionStorage {
  // IndexedDB for large session data
  private indexedDB: IDBDatabase;
  
  // LocalStorage for quick access
  private localStorage: Storage;
  
  // Session state compression
  private compression: CompressionEngine;
  
  async persistContext(context: UniversalContext): Promise<void> {
    const compressed = await this.compression.compress(context);
    await this.indexedDB.put('contexts', compressed);
  }
}
```

### Long-Running Process Management
```yaml
process_management:
  background_workflows:
    - agent_coordination
    - continuous_validation
    - progress_monitoring
    - error_recovery
    
  state_synchronization:
    - cross_tab_coordination
    - session_state_updates
    - progress_broadcasting
    - error_propagation
```

## Browser vs Cloud Coordination

### Hybrid Architecture Strategy
```typescript
interface HybridOrchestration {
  // Browser-based coordination
  browserOrchestrator: BrowserOrchestrator;
  
  // Cloud-based execution
  cloudExecutor: CloudExecutor;
  
  // Bidirectional communication
  communicationBridge: BidirectionalBridge;
}

class BidirectionalBridge {
  async executeInCloud(
    workflow: WorkflowDefinition,
    context: UniversalContext
  ): Promise<ExecutionResult> {
    
    // Send workflow to cloud
    const cloudTask = await this.cloudExecutor.submit({
      workflow,
      context: this.sanitizeForCloud(context)
    });
    
    // Monitor progress in browser
    return this.monitorExecution(cloudTask.id);
  }
  
  async receiveCloudUpdates(taskId: string): Promise<ProgressUpdate[]> {
    // WebSocket or Server-Sent Events for real-time updates
    return this.progressStream.subscribe(taskId);
  }
}
```

### Local vs Cloud Decision Matrix
```yaml
execution_strategy:
  browser_execution:
    suitable_for:
      - ui_generation
      - frontend_validation
      - user_interaction
      - progress_visualization
    constraints:
      - limited_compute
      - no_backend_access
      - security_restrictions
      
  cloud_execution:
    suitable_for:
      - backend_generation
      - deployment_operations
      - heavy_computation
      - external_api_access
    benefits:
      - unlimited_compute
      - full_system_access
      - production_deployment
```

## Integration with Progressive Disclosure

### UI Orchestration Coordination
```typescript
interface UIOrchestrationBridge {
  // Progressive disclosure coordination
  progressiveDisclosure: ProgressiveDisclosureEngine;
  
  // Agent activity visualization
  activityVisualizer: AgentActivityVisualizer;
  
  // User intervention handling
  interventionHandler: UserInterventionHandler;
}

class AgentActivityVisualizer {
  async visualizeAgentWork(
    agents: KinglyAgent[],
    workflows: WorkflowExecution[]
  ): Promise<VisualizationUpdate> {
    
    return {
      activeAgents: agents.map(agent => ({
        endpoint: agent.endpoint,
        currentTask: agent.currentTask,
        progress: agent.progress,
        status: agent.status
      })),
      
      workflowProgress: workflows.map(workflow => ({
        name: workflow.name,
        phase: workflow.currentPhase,
        completion: workflow.completionPercentage,
        nextSteps: workflow.nextSteps
      }))
    };
  }
}
```

## Implementation Strategy

### Phase 1: Browser MCP Adaptation (Week 1)
```typescript
// Port core Kingly MCP functionality
// Implement WebSocket/REST transport
// Basic agent spawning and coordination
```

### Phase 2: Workflow Integration (Week 2)
```typescript
// YAML workflow system integration
// Context inheritance implementation
// Session management and persistence
```

### Phase 3: Cloud Coordination (Week 3)
```typescript
// Bidirectional bridge implementation
// Hybrid execution strategy
// Progress monitoring and visualization
```

### Phase 4: Full Orchestration (Week 4)
```typescript
// Complete agent ecosystem
// Advanced workflow patterns
// Production deployment coordination
```

## Success Criteria

### Orchestration Performance
- **Agent Spawning**: <1 second for new agent creation
- **Workflow Coordination**: <2 seconds for multi-agent task delegation
- **Session Recovery**: <3 seconds for full session restoration

### System Reliability
- **Session Persistence**: 99.9% session recovery success rate
- **Agent Coordination**: Zero lost tasks in multi-agent workflows
- **Error Recovery**: Automatic recovery from 90% of orchestration failures

### Developer Experience
- **Workflow Creation**: New workflows definable in <30 minutes
- **Agent Extension**: New agent types addable in <2 hours
- **Debug Visibility**: Complete visibility into agent activities and decisions

## Alternatives Considered

### 1. Custom Orchestration from Scratch
- **Pros**: Perfect fit for requirements, full control
- **Cons**: 6+ months development time, high complexity
- **Rejected**: Existing Kingly infrastructure provides 80% solution

### 2. Third-Party Orchestration Platform
- **Pros**: Mature, supported, quick integration
- **Cons**: Limited customization, vendor lock-in, cost
- **Rejected**: Insufficient LLM-first architecture support

### 3. Simple Agent Pool without Orchestration
- **Pros**: Simple, fast to implement, low complexity
- **Cons**: No workflow coordination, limited scalability
- **Rejected**: Cannot support complex autonomous workflows

## Notes
- Leverages existing Kingly MCP infrastructure for rapid development
- Browser adaptation maintains full MCP protocol compatibility
- Session continuity critical for long-running autonomous workflows
- Cloud coordination enables true production deployment capability

## References
- [Kingly MCP Source Analysis](../analysis/kingly-mcp-analysis.md)
- [Universal Context System](../architecture/universal-context-system.md)
- [YAML Workflow Patterns](../patterns/yaml-workflow-patterns.md)