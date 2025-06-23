# Implementation Ticket: 015 - Agent Registry

## 📋 Overview
Create the agent registry that manages the lifecycle, discovery, and coordination of nano-agents across the system.

## 🔗 References
- **Previous**: [014 - Nano Agent Base](014-nano-agent-base.md)
- **Spec**: Agent System Architecture

## 🎯 Scope
Create registry that:
- Manages agent lifecycle
- Enables agent discovery
- Handles load balancing
- Provides health monitoring

## ✅ Acceptance Criteria

### AC-015-1: Agent Lifecycle Management
```yaml
Given: Agent needs to be registered
When: Registry manages agent
Then: Agent creation tracked
And: Agent updates monitored
And: Agent cleanup handled
```

### AC-015-2: Capability Discovery
```yaml
Given: Request for specific capability
When: Registry searches agents
Then: Returns suitable agents
And: Ranked by suitability
And: Includes health status
```

### AC-015-3: Load Balancing
```yaml
Given: Multiple agents with same capability
When: Request needs routing
Then: Load distributed evenly
And: Unhealthy agents avoided
And: Performance monitored
```

### AC-015-4: Health Monitoring
```yaml
Given: Registered agents
When: Registry monitors health
Then: Tracks agent performance
And: Detects failing agents
And: Triggers replacements
```

## 🧪 Test Cases

### Unit Tests
1. **Registration** - Agents register correctly
2. **Discovery** - Capabilities found
3. **Health tracking** - Status monitored
4. **Load balancing** - Requests distributed
5. **Cleanup** - Dead agents removed

### Integration Tests
1. **Full lifecycle** - End-to-end management
2. **Failover** - Failed agents replaced
3. **Scale up/down** - Dynamic capacity

## 💻 Implementation

### Agent Registry
```javascript
// src/application/agent-registry.js
export class AgentRegistry {
  constructor(dependencies = {}) {
    this.agents = new Map(); // id -> agent
    this.capabilityIndex = new Map(); // capability -> Set(agentIds)
    this.typeIndex = new Map(); // type -> Set(agentIds)
    this.healthMonitor = new HealthMonitor(this);
    this.loadBalancer = new LoadBalancer(this);
    this.storage = dependencies.storage;
    this.eventEmitter = dependencies.eventEmitter || new EventEmitter();
    
    // Configuration
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      maxAgentsPerCapability: 10,
      minHealthThreshold: 0.3,
      autoCleanup: true
    };
    
    // Start health monitoring
    this.startHealthMonitoring();
  }
  
  async register(agent) {
    // Add to main registry
    this.agents.set(agent.id, agent);
    
    // Index by capabilities
    for (const capability of agent.capabilities) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, new Set());
      }
      this.capabilityIndex.get(capability).add(agent.id);
    }
    
    // Index by type
    if (!this.typeIndex.has(agent.type)) {
      this.typeIndex.set(agent.type, new Set());
    }
    this.typeIndex.get(agent.type).add(agent.id);
    
    // Persist to storage
    if (this.storage) {
      await this.storage.save(`agents/${agent.id}`, agent.toContext());
    }
    
    // Emit registration event
    this.eventEmitter.emit('agent:registered', { agent: agent.getStatus() });
    
    console.log(`Agent ${agent.id} (${agent.type}) registered with capabilities: ${agent.capabilities.join(', ')}`);
    
    return agent.id;
  }
  
  async unregister(agentId, reason = 'manual') {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    // Remove from indices
    for (const capability of agent.capabilities) {
      const capabilitySet = this.capabilityIndex.get(capability);
      if (capabilitySet) {
        capabilitySet.delete(agentId);
        if (capabilitySet.size === 0) {
          this.capabilityIndex.delete(capability);
        }
      }
    }
    
    const typeSet = this.typeIndex.get(agent.type);
    if (typeSet) {
      typeSet.delete(agentId);
      if (typeSet.size === 0) {
        this.typeIndex.delete(agent.type);
      }
    }
    
    // Remove from main registry
    this.agents.delete(agentId);
    
    // Remove from storage
    if (this.storage) {
      await this.storage.delete(`agents/${agentId}`);
    }
    
    // Emit unregistration event
    this.eventEmitter.emit('agent:unregistered', { 
      agentId, 
      type: agent.type, 
      reason 
    });
    
    console.log(`Agent ${agentId} unregistered (${reason})`);
    
    return true;
  }
  
  async findByCapability(capability) {
    const agentIds = this.capabilityIndex.get(capability);
    if (!agentIds || agentIds.size === 0) return [];
    
    const agents = Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(agent => agent && agent.calculateHealth() > this.config.minHealthThreshold);
    
    // Sort by health and load
    return agents.sort((a, b) => {
      const scoreA = this.calculateAgentScore(a);
      const scoreB = this.calculateAgentScore(b);
      return scoreB - scoreA;
    });
  }
  
  async findByType(type) {
    const agentIds = this.typeIndex.get(type);
    if (!agentIds || agentIds.size === 0) return [];
    
    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(agent => agent);
  }
  
  async findBestAgent(capability, context = {}) {
    const candidates = await this.findByCapability(capability);
    if (candidates.length === 0) return null;
    
    return this.loadBalancer.selectAgent(candidates, context);
  }
  
  calculateAgentScore(agent) {
    const health = agent.calculateHealth();
    const load = agent.state.requestCount / agent.config.maxRequests;
    const loadScore = 1 - load;
    
    return health * 0.7 + loadScore * 0.3;
  }
  
  async getCapabilities() {
    const capabilities = {};
    
    for (const [capability, agentIds] of this.capabilityIndex) {
      const healthyAgents = Array.from(agentIds)
        .map(id => this.agents.get(id))
        .filter(agent => agent && agent.calculateHealth() > this.config.minHealthThreshold);
      
      capabilities[capability] = {
        agentCount: healthyAgents.length,
        totalCapacity: healthyAgents.reduce(
          (sum, agent) => sum + (agent.config.maxRequests - agent.state.requestCount),
          0
        ),
        averageHealth: healthyAgents.length > 0 
          ? healthyAgents.reduce((sum, agent) => sum + agent.calculateHealth(), 0) / healthyAgents.length
          : 0
      };
    }
    
    return capabilities;
  }
  
  async getRegistryStats() {
    const agents = Array.from(this.agents.values());
    
    return {
      totalAgents: agents.length,
      agentsByType: this.getAgentsByType(),
      healthyAgents: agents.filter(a => a.calculateHealth() > this.config.minHealthThreshold).length,
      totalCapabilities: this.capabilityIndex.size,
      totalRequests: agents.reduce((sum, agent) => sum + agent.state.requestCount, 0),
      averageHealth: agents.length > 0 
        ? agents.reduce((sum, agent) => sum + agent.calculateHealth(), 0) / agents.length
        : 0
    };
  }
  
  getAgentsByType() {
    const byType = {};
    for (const [type, agentIds] of this.typeIndex) {
      byType[type] = agentIds.size;
    }
    return byType;
  }
  
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }
  
  async performHealthCheck() {
    const unhealthyAgents = [];
    
    for (const [agentId, agent] of this.agents) {
      const health = agent.calculateHealth();
      
      if (health < this.config.minHealthThreshold || agent.shouldDestroy()) {
        unhealthyAgents.push(agentId);
      }
    }
    
    // Clean up unhealthy agents
    if (this.config.autoCleanup) {
      for (const agentId of unhealthyAgents) {
        await this.unregister(agentId, 'health_check');
      }
    }
    
    // Emit health status
    if (unhealthyAgents.length > 0) {
      this.eventEmitter.emit('registry:health_check', {
        removedAgents: unhealthyAgents.length,
        totalAgents: this.agents.size
      });
    }
  }
  
  async ensureCapacity(capability, minAgents = 1) {
    const agents = await this.findByCapability(capability);
    
    if (agents.length < minAgents) {
      const needed = minAgents - agents.length;
      
      this.eventEmitter.emit('registry:capacity_needed', {
        capability,
        needed,
        current: agents.length
      });
      
      return {
        sufficient: false,
        needed,
        current: agents.length
      };
    }
    
    return {
      sufficient: true,
      current: agents.length
    };
  }
}

// Health Monitor
export class HealthMonitor {
  constructor(registry) {
    this.registry = registry;
    this.metrics = new Map(); // agentId -> metrics history
  }
  
  recordMetric(agentId, metric, value) {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, {
        responseTime: [],
        errorRate: [],
        requestCount: [],
        health: []
      });
    }
    
    const agentMetrics = this.metrics.get(agentId);
    agentMetrics[metric].push({
      value,
      timestamp: Date.now()
    });
    
    // Keep last 100 entries
    if (agentMetrics[metric].length > 100) {
      agentMetrics[metric] = agentMetrics[metric].slice(-100);
    }
  }
  
  getAgentTrend(agentId, metric, windowMinutes = 10) {
    const agentMetrics = this.metrics.get(agentId);
    if (!agentMetrics || !agentMetrics[metric]) return null;
    
    const cutoff = Date.now() - (windowMinutes * 60 * 1000);
    const recent = agentMetrics[metric].filter(m => m.timestamp > cutoff);
    
    if (recent.length === 0) return null;
    
    const values = recent.map(m => m.value);
    const average = values.reduce((a, b) => a + b) / values.length;
    
    return {
      average,
      trend: recent.length > 1 ? values[values.length - 1] - values[0] : 0,
      count: recent.length
    };
  }
}

// Load Balancer
export class LoadBalancer {
  constructor(registry) {
    this.registry = registry;
    this.strategy = 'round_robin';
    this.roundRobinIndex = new Map(); // capability -> index
  }
  
  selectAgent(agents, context = {}) {
    if (agents.length === 0) return null;
    if (agents.length === 1) return agents[0];
    
    switch (this.strategy) {
      case 'round_robin':
        return this.roundRobinSelect(agents, context);
      case 'least_loaded':
        return this.leastLoadedSelect(agents);
      case 'healthiest':
        return this.healthiestSelect(agents);
      default:
        return agents[0];
    }
  }
  
  roundRobinSelect(agents, context) {
    const capability = context.capability || 'default';
    
    if (!this.roundRobinIndex.has(capability)) {
      this.roundRobinIndex.set(capability, 0);
    }
    
    const index = this.roundRobinIndex.get(capability);
    const selectedAgent = agents[index % agents.length];
    
    this.roundRobinIndex.set(capability, index + 1);
    
    return selectedAgent;
  }
  
  leastLoadedSelect(agents) {
    return agents.reduce((least, current) => {
      const leastLoad = least.state.requestCount / least.config.maxRequests;
      const currentLoad = current.state.requestCount / current.config.maxRequests;
      
      return currentLoad < leastLoad ? current : least;
    });
  }
  
  healthiestSelect(agents) {
    return agents.reduce((healthiest, current) => {
      return current.calculateHealth() > healthiest.calculateHealth() 
        ? current 
        : healthiest;
    });
  }
  
  setStrategy(strategy) {
    const validStrategies = ['round_robin', 'least_loaded', 'healthiest'];
    if (validStrategies.includes(strategy)) {
      this.strategy = strategy;
    }
  }
}

// Agent Registry Manager (MCP Tool Integration)
export const agentRegistryManagerTool = {
  name: 'manage_agent_registry',
  description: 'Manage and query the agent registry',
  inputSchema: {
    type: 'object',
    properties: {
      action: { 
        type: 'string',
        enum: ['list', 'stats', 'capabilities', 'spawn', 'remove', 'health']
      },
      capability: { type: 'string' },
      agentType: { type: 'string' },
      agentId: { type: 'string' }
    },
    required: ['action']
  },
  handler: async (params) => {
    const registry = getAgentRegistry();
    
    switch (params.action) {
      case 'list':
        return {
          success: true,
          agents: Array.from(registry.agents.values()).map(a => a.getStatus())
        };
        
      case 'stats':
        return {
          success: true,
          stats: await registry.getRegistryStats()
        };
        
      case 'capabilities':
        return {
          success: true,
          capabilities: await registry.getCapabilities()
        };
        
      case 'spawn':
        if (!params.agentType) {
          return { success: false, error: 'agentType required for spawn' };
        }
        
        const spawner = new AgentSpawner({ agentRegistry: registry });
        const agent = await spawner.spawnAgent(params.agentType);
        
        return {
          success: true,
          agent: agent.getStatus(),
          message: `Spawned ${params.agentType} agent: ${agent.id}`
        };
        
      case 'remove':
        if (!params.agentId) {
          return { success: false, error: 'agentId required for remove' };
        }
        
        const removed = await registry.unregister(params.agentId, 'manual');
        
        return {
          success: removed,
          message: removed ? `Removed agent ${params.agentId}` : 'Agent not found'
        };
        
      case 'health':
        const healthData = {};
        
        for (const [id, agent] of registry.agents) {
          healthData[id] = {
            health: agent.calculateHealth(),
            status: agent.getStatus(),
            shouldDestroy: agent.shouldDestroy()
          };
        }
        
        return {
          success: true,
          health: healthData
        };
        
      default:
        return { success: false, error: `Unknown action: ${params.action}` };
    }
  }
};
```

### Registry Persistence
```javascript
// src/infrastructure/agent-registry-persistence.js
export class AgentRegistryPersistence {
  constructor(storage) {
    this.storage = storage;
  }
  
  async saveRegistryState(registry) {
    const state = {
      timestamp: Date.now(),
      agents: Array.from(registry.agents.values()).map(a => a.toContext()),
      capabilities: Object.fromEntries(registry.capabilityIndex),
      types: Object.fromEntries(registry.typeIndex),
      stats: await registry.getRegistryStats()
    };
    
    await this.storage.save('registry/state', state);
  }
  
  async loadRegistryState() {
    try {
      return await this.storage.load('registry/state');
    } catch (error) {
      return null;
    }
  }
  
  async restoreRegistry(registry, spawner) {
    const state = await this.loadRegistryState();
    if (!state) return;
    
    console.log(`Restoring registry with ${state.agents.length} agents`);
    
    for (const agentContext of state.agents) {
      try {
        // Recreate agent from context
        const agent = await this.recreateAgent(agentContext, spawner);
        await registry.register(agent);
      } catch (error) {
        console.warn(`Failed to restore agent ${agentContext.metadata.id}:`, error);
      }
    }
  }
  
  async recreateAgent(context, spawner) {
    const agentConfig = context.polymorphic_config.agent_config;
    
    return await spawner.spawnAgent(agentConfig.agent_type, {
      id: context.metadata.id,
      state: agentConfig.state,
      config: agentConfig.config
    });
  }
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/agent-registry.test.js
describe('AgentRegistry', () => {
  let registry;
  let mockAgent;
  
  beforeEach(() => {
    registry = new AgentRegistry();
    mockAgent = {
      id: 'test-agent',
      type: 'code',
      capabilities: ['generate_code', 'analyze_code'],
      calculateHealth: jest.fn().mockReturnValue(0.8),
      shouldDestroy: jest.fn().mockReturnValue(false),
      getStatus: jest.fn().mockReturnValue({ id: 'test-agent' }),
      toContext: jest.fn().mockReturnValue({}),
      state: { requestCount: 5 },
      config: { maxRequests: 100 }
    };
  });
  
  it('should register agents correctly', async () => {
    await registry.register(mockAgent);
    
    expect(registry.agents.has('test-agent')).toBe(true);
    expect(registry.capabilityIndex.get('generate_code')).toContain('test-agent');
    expect(registry.typeIndex.get('code')).toContain('test-agent');
  });
  
  it('should find agents by capability', async () => {
    await registry.register(mockAgent);
    
    const agents = await registry.findByCapability('generate_code');
    
    expect(agents).toHaveLength(1);
    expect(agents[0].id).toBe('test-agent');
  });
  
  it('should filter unhealthy agents', async () => {
    mockAgent.calculateHealth.mockReturnValue(0.1); // Unhealthy
    await registry.register(mockAgent);
    
    const agents = await registry.findByCapability('generate_code');
    
    expect(agents).toHaveLength(0);
  });
  
  it('should unregister agents', async () => {
    await registry.register(mockAgent);
    await registry.unregister('test-agent');
    
    expect(registry.agents.has('test-agent')).toBe(false);
    expect(registry.capabilityIndex.get('generate_code')).toBeFalsy();
  });
  
  it('should calculate agent scores', () => {
    const score = registry.calculateAgentScore(mockAgent);
    
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('LoadBalancer', () => {
  let balancer;
  let registry;
  
  beforeEach(() => {
    registry = new AgentRegistry();
    balancer = new LoadBalancer(registry);
  });
  
  it('should select least loaded agent', () => {
    const agents = [
      { state: { requestCount: 10 }, config: { maxRequests: 100 } },
      { state: { requestCount: 5 }, config: { maxRequests: 100 } },
      { state: { requestCount: 15 }, config: { maxRequests: 100 } }
    ];
    
    balancer.setStrategy('least_loaded');
    const selected = balancer.selectAgent(agents);
    
    expect(selected.state.requestCount).toBe(5);
  });
  
  it('should use round robin selection', () => {
    const agents = [
      { id: 'agent1' },
      { id: 'agent2' },
      { id: 'agent3' }
    ];
    
    balancer.setStrategy('round_robin');
    
    const selected1 = balancer.selectAgent(agents, { capability: 'test' });
    const selected2 = balancer.selectAgent(agents, { capability: 'test' });
    const selected3 = balancer.selectAgent(agents, { capability: 'test' });
    const selected4 = balancer.selectAgent(agents, { capability: 'test' });
    
    expect(selected1.id).toBe('agent1');
    expect(selected2.id).toBe('agent2');
    expect(selected3.id).toBe('agent3');
    expect(selected4.id).toBe('agent1'); // Wraps around
  });
});
```

## 🔧 Dependencies
- Uses Nano Agent Base from ticket 014
- Integrates with storage system
- Event system for monitoring

## 📊 Effort Estimate
- Implementation: 3.5 hours
- Testing: 1.5 hours
- Total: 5 hours

## 🚀 Next Steps
After this ticket:
- 016: Agent Context Assembly (final ticket)
- System integration and testing

## 📝 Notes
- Central registry for all agent management
- Health monitoring and auto-cleanup
- Load balancing for optimal performance
- Persistence for system restarts