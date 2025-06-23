# Implementation Ticket: 014 - Nano Agent Base

## 📋 Overview
Create the base nano-agent system that enables specialized agents to be spawned as contexts with specific capabilities.

## 🔗 References
- **Previous**: [013 - Task Entity Enhancement](013-task-entity-enhancement.md)
- **Spec**: Agent-as-Context pattern

## 🎯 Scope
Create nano-agent system that:
- Agents are contexts with capabilities
- Spawn agents dynamically
- Route requests to specialized agents
- Enable agent composition

## ✅ Acceptance Criteria

### AC-014-1: Agent as Context
```yaml
Given: Agent definition
When: Agent is spawned
Then: Agent exists as context
And: Has specialized capabilities
And: Follows context inheritance
```

### AC-014-2: Dynamic Spawning
```yaml
Given: Request requiring specialized agent
When: Agent not available
Then: Agent spawned automatically
And: Configured for request type
And: Ready to handle request
```

### AC-014-3: Capability Routing
```yaml
Given: Request with specific requirements
When: Multiple agents available
Then: Best agent selected
And: Request routed correctly
And: Response handled properly
```

### AC-014-4: Agent Composition
```yaml
Given: Complex request
When: Multiple capabilities needed
Then: Agents work together
And: Results are aggregated
And: Workflow coordinated
```

## 🧪 Test Cases

### Unit Tests
1. **Agent creation** - Agents spawn correctly
2. **Capability matching** - Right agent selected
3. **Context inheritance** - Agent inherits properly
4. **Agent communication** - Agents can collaborate
5. **Resource management** - Agents cleaned up

### Integration Tests
1. **End-to-end** - Full agent workflow
2. **Multi-agent** - Complex collaboration
3. **Error handling** - Failed agents handled

## 💻 Implementation

### Nano Agent Base Class
```javascript
// src/domain/nano-agent.js
export class NanoAgent {
  constructor(config) {
    this.id = config.id || generateId('agent');
    this.type = config.type || 'generic';
    this.capabilities = config.capabilities || [];
    this.context = config.context;
    this.state = {
      status: 'initialized',
      created: Date.now(),
      lastActive: Date.now(),
      requestCount: 0
    };
    
    // Agent configuration
    this.config = {
      maxRequests: config.maxRequests || 100,
      timeoutMs: config.timeoutMs || 30000,
      autoDestroy: config.autoDestroy !== false,
      memorySize: config.memorySize || 1000
    };
    
    // Initialize capability handlers
    this.handlers = new Map();
    this.initializeHandlers();
  }
  
  initializeHandlers() {
    // Base handlers that all agents have
    this.handlers.set('ping', () => ({ alive: true, agent: this.id }));
    this.handlers.set('status', () => this.getStatus());
    this.handlers.set('capabilities', () => this.capabilities);
    
    // Initialize type-specific handlers
    this.initializeTypeHandlers();
  }
  
  // Override in subclasses
  initializeTypeHandlers() {
    // Base implementation - no additional handlers
  }
  
  async handleRequest(request) {
    this.state.lastActive = Date.now();
    this.state.requestCount++;
    
    try {
      // Check if we can handle this capability
      if (!this.canHandle(request.capability)) {
        return {
          success: false,
          error: `Agent ${this.id} cannot handle ${request.capability}`,
          capabilities: this.capabilities
        };
      }
      
      // Get handler
      const handler = this.handlers.get(request.capability);
      if (!handler) {
        return {
          success: false,
          error: `No handler for ${request.capability}`
        };
      }
      
      // Execute with timeout
      const result = await this.withTimeout(
        handler(request.params, request.context),
        this.config.timeoutMs
      );
      
      return {
        success: true,
        data: result,
        agent: this.id,
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        agent: this.id,
        timestamp: Date.now()
      };
    }
  }
  
  canHandle(capability) {
    return this.capabilities.includes(capability) || 
           this.handlers.has(capability);
  }
  
  async withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Agent timeout')), timeoutMs)
      )
    ]);
  }
  
  getStatus() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      capabilities: this.capabilities,
      health: this.calculateHealth()
    };
  }
  
  calculateHealth() {
    const age = Date.now() - this.state.created;
    const ageHours = age / (1000 * 60 * 60);
    
    // Health decreases over time and with high request count
    let health = Math.max(0, 1 - ageHours / 24); // Decay over 24 hours
    health *= Math.max(0.1, 1 - this.state.requestCount / this.config.maxRequests);
    
    return health;
  }
  
  shouldDestroy() {
    if (!this.config.autoDestroy) return false;
    
    const health = this.calculateHealth();
    const idle = Date.now() - this.state.lastActive;
    const idleHours = idle / (1000 * 60 * 60);
    
    return health < 0.1 || idleHours > 2;
  }
  
  // Convert to context format
  toContext() {
    return {
      metadata: {
        id: this.id,
        type: 'agent',
        name: `${this.type} Agent`,
        created: this.state.created,
        updated: this.state.lastActive
      },
      intent_context: {
        intent_type: 'agent_capability',
        business_goal: `Provide ${this.capabilities.join(', ')} capabilities`
      },
      polymorphic_config: {
        agent_config: {
          agent_type: this.type,
          capabilities: this.capabilities,
          state: this.state,
          config: this.config
        }
      },
      behavior_rules: [
        {
          trigger: 'request_received',
          action: 'handle_with_capability'
        },
        {
          trigger: 'health_low',
          condition: 'health < 0.2',
          action: 'request_replacement'
        }
      ],
      status: {
        current: this.state.status,
        progress: this.calculateHealth(),
        confidence: this.calculateHealth()
      }
    };
  }
}

// Specialized Agent Types
export class CodeAgent extends NanoAgent {
  constructor(config) {
    super({
      ...config,
      type: 'code',
      capabilities: [
        'generate_code',
        'analyze_code', 
        'refactor_code',
        'write_tests',
        'code_review',
        ...config.capabilities || []
      ]
    });
  }
  
  initializeTypeHandlers() {
    this.handlers.set('generate_code', (params) => this.generateCode(params));
    this.handlers.set('analyze_code', (params) => this.analyzeCode(params));
    this.handlers.set('refactor_code', (params) => this.refactorCode(params));
    this.handlers.set('write_tests', (params) => this.writeTests(params));
    this.handlers.set('code_review', (params) => this.reviewCode(params));
  }
  
  async generateCode(params) {
    // Implement code generation
    const { requirements, language, framework } = params;
    
    return {
      code: `// Generated ${language} code for: ${requirements}`,
      language,
      framework,
      files: ['main.js', 'utils.js']
    };
  }
  
  async analyzeCode(params) {
    const { code, metrics } = params;
    
    return {
      complexity: 'medium',
      issues: [],
      suggestions: ['Add error handling'],
      metrics: {
        lines: code.split('\n').length,
        functions: 3
      }
    };
  }
}

export class DataAgent extends NanoAgent {
  constructor(config) {
    super({
      ...config,
      type: 'data',
      capabilities: [
        'query_data',
        'transform_data',
        'analyze_data',
        'visualize_data',
        'export_data',
        ...config.capabilities || []
      ]
    });
  }
  
  initializeTypeHandlers() {
    this.handlers.set('query_data', (params) => this.queryData(params));
    this.handlers.set('transform_data', (params) => this.transformData(params));
    this.handlers.set('analyze_data', (params) => this.analyzeData(params));
  }
  
  async queryData(params) {
    const { source, query, filters } = params;
    
    return {
      results: [],
      count: 0,
      source,
      executedQuery: query
    };
  }
}

export class UIAgent extends NanoAgent {
  constructor(config) {
    super({
      ...config,
      type: 'ui',
      capabilities: [
        'generate_component',
        'style_component',
        'create_layout',
        'optimize_ux',
        'accessibility_check',
        ...config.capabilities || []
      ]
    });
  }
  
  initializeTypeHandlers() {
    this.handlers.set('generate_component', (params) => this.generateComponent(params));
    this.handlers.set('style_component', (params) => this.styleComponent(params));
    this.handlers.set('create_layout', (params) => this.createLayout(params));
  }
  
  async generateComponent(params) {
    const { type, props, framework } = params;
    
    return {
      component: `<${type} />`,
      props,
      framework,
      styles: 'component.css'
    };
  }
}

// Agent Spawner
export class AgentSpawner {
  constructor(dependencies) {
    this.contextAssembler = dependencies.contextAssembler;
    this.registry = dependencies.agentRegistry;
    this.agentTypes = new Map([
      ['code', CodeAgent],
      ['data', DataAgent], 
      ['ui', UIAgent]
    ]);
  }
  
  async spawnAgent(type, config = {}) {
    const AgentClass = this.agentTypes.get(type);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${type}`);
    }
    
    // Create agent
    const agent = new AgentClass({
      ...config,
      context: await this.assembleAgentContext(type, config)
    });
    
    // Register agent
    await this.registry.register(agent);
    
    return agent;
  }
  
  async spawnAgentForCapability(capability, context = {}) {
    // Determine best agent type for capability
    const agentType = this.inferAgentType(capability);
    
    // Check if suitable agent already exists
    const existingAgent = await this.registry.findByCapability(capability);
    if (existingAgent && existingAgent.calculateHealth() > 0.5) {
      return existingAgent;
    }
    
    // Spawn new agent
    return await this.spawnAgent(agentType, {
      ...context,
      primary_capability: capability
    });
  }
  
  inferAgentType(capability) {
    const capabilityMap = {
      generate_code: 'code',
      analyze_code: 'code',
      refactor_code: 'code',
      write_tests: 'code',
      code_review: 'code',
      
      query_data: 'data',
      transform_data: 'data',
      analyze_data: 'data',
      
      generate_component: 'ui',
      style_component: 'ui',
      create_layout: 'ui'
    };
    
    return capabilityMap[capability] || 'generic';
  }
  
  async assembleAgentContext(type, config) {
    return await this.contextAssembler.assembleContext({
      currentContext: `agents/${type}-base`,
      situation: {
        agent_type: type,
        spawn_reason: config.reason || 'capability_needed'
      }
    });
  }
}

// Agent Communication
export class AgentCoordinator {
  constructor(registry) {
    this.registry = registry;
  }
  
  async delegateRequest(request) {
    // Find agent capable of handling request
    const agent = await this.findBestAgent(request);
    
    if (!agent) {
      // Spawn new agent if needed
      const spawner = new AgentSpawner({
        agentRegistry: this.registry,
        contextAssembler: getContextAssembler()
      });
      
      const newAgent = await spawner.spawnAgentForCapability(
        request.capability,
        request.context
      );
      
      return await newAgent.handleRequest(request);
    }
    
    return await agent.handleRequest(request);
  }
  
  async findBestAgent(request) {
    const candidates = await this.registry.findByCapability(request.capability);
    
    if (candidates.length === 0) return null;
    
    // Score agents by health and specialization
    const scored = candidates.map(agent => ({
      agent,
      score: this.scoreAgent(agent, request)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].agent;
  }
  
  scoreAgent(agent, request) {
    let score = agent.calculateHealth(); // Base health score
    
    // Boost if primary capability matches
    if (agent.config.primary_capability === request.capability) {
      score *= 1.5;
    }
    
    // Boost if context matches
    if (agent.context && request.context) {
      const contextMatch = this.calculateContextSimilarity(
        agent.context,
        request.context
      );
      score *= (1 + contextMatch);
    }
    
    // Penalize overloaded agents
    const loadFactor = agent.state.requestCount / agent.config.maxRequests;
    score *= (1 - loadFactor * 0.5);
    
    return score;
  }
  
  calculateContextSimilarity(agentContext, requestContext) {
    // Simple similarity calculation
    const agentKeys = new Set(Object.keys(agentContext));
    const requestKeys = new Set(Object.keys(requestContext));
    
    const intersection = new Set([...agentKeys].filter(x => requestKeys.has(x)));
    const union = new Set([...agentKeys, ...requestKeys]);
    
    return intersection.size / union.size;
  }
  
  async orchestrateMultiAgent(requests) {
    const results = await Promise.all(
      requests.map(request => this.delegateRequest(request))
    );
    
    return {
      success: results.every(r => r.success),
      results: results,
      aggregated: this.aggregateResults(results)
    };
  }
  
  aggregateResults(results) {
    // Combine results based on their types
    const combined = {
      code: [],
      data: [],
      ui: [],
      other: []
    };
    
    for (const result of results) {
      if (result.success) {
        const category = this.categorizeResult(result);
        combined[category].push(result.data);
      }
    }
    
    return combined;
  }
}
```

### Agent Context Templates
```yaml
# contexts/agents/code-base/context.yaml
metadata:
  type: agent
  name: Code Agent Base
  
intent_context:
  intent_type: agent_capability
  business_goal: Provide code generation and analysis capabilities
  
polymorphic_config:
  agent_config:
    specialization: code_generation
    languages: [javascript, python, java, typescript]
    frameworks: [react, express, spring, django]
    
behavior_rules:
  - trigger: code_request
    action: analyze_requirements_first
    
  - trigger: error_detected
    action: provide_debug_assistance
    
  - trigger: health_degraded
    condition: health < 0.3
    action: spawn_replacement_agent
```

## 🧪 Test Implementation
```javascript
// tests/unit/nano-agent.test.js
describe('NanoAgent', () => {
  let codeAgent;
  
  beforeEach(() => {
    codeAgent = new CodeAgent({
      id: 'test-code-agent'
    });
  });
  
  it('should handle capability requests', async () => {
    const request = {
      capability: 'generate_code',
      params: {
        requirements: 'Create a login function',
        language: 'javascript'
      }
    };
    
    const result = await codeAgent.handleRequest(request);
    
    expect(result.success).toBe(true);
    expect(result.data.code).toContain('login');
    expect(result.data.language).toBe('javascript');
  });
  
  it('should reject unsupported capabilities', async () => {
    const request = {
      capability: 'cook_dinner',
      params: {}
    };
    
    const result = await codeAgent.handleRequest(request);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('cannot handle');
  });
  
  it('should convert to context format', () => {
    const context = codeAgent.toContext();
    
    expect(context.metadata.type).toBe('agent');
    expect(context.polymorphic_config.agent_config.agent_type).toBe('code');
    expect(context.polymorphic_config.agent_config.capabilities).toContain('generate_code');
  });
  
  it('should calculate health correctly', () => {
    // New agent should have high health
    expect(codeAgent.calculateHealth()).toBeGreaterThan(0.9);
    
    // Simulate many requests
    codeAgent.state.requestCount = 90;
    expect(codeAgent.calculateHealth()).toBeLessThan(0.2);
  });
});

describe('AgentSpawner', () => {
  let spawner;
  let mockRegistry;
  
  beforeEach(() => {
    mockRegistry = {
      register: jest.fn(),
      findByCapability: jest.fn()
    };
    
    spawner = new AgentSpawner({
      agentRegistry: mockRegistry,
      contextAssembler: { assembleContext: jest.fn() }
    });
  });
  
  it('should spawn appropriate agent for capability', async () => {
    mockRegistry.findByCapability.mockResolvedValue(null);
    
    const agent = await spawner.spawnAgentForCapability('generate_code');
    
    expect(agent).toBeInstanceOf(CodeAgent);
    expect(agent.capabilities).toContain('generate_code');
    expect(mockRegistry.register).toHaveBeenCalledWith(agent);
  });
  
  it('should reuse healthy existing agents', async () => {
    const existingAgent = new CodeAgent({ id: 'existing' });
    mockRegistry.findByCapability.mockResolvedValue(existingAgent);
    
    const agent = await spawner.spawnAgentForCapability('generate_code');
    
    expect(agent.id).toBe('existing');
    expect(mockRegistry.register).not.toHaveBeenCalled();
  });
});
```

## 🔧 Dependencies
- Uses Context system
- Integrates with Agent Registry (next ticket)
- Uses Context Assembler

## 📊 Effort Estimate
- Implementation: 4 hours
- Testing: 2 hours
- Total: 6 hours

## 🚀 Next Steps
After this ticket:
- 015: Agent Registry
- 016: Agent Context Assembly

## 📝 Notes
- Agents are contexts with capabilities
- Dynamic spawning based on needs
- Health-based lifecycle management
- Capability-based routing system