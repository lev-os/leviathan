# ADR-003: Unified Job System Integration

**Date**: 2025-01-30  
**Status**: Proposed  
**Context**: Integrate background processing with P2P mesh network for comprehensive job management

## Decision

Create a unified job system that combines local background processing with P2P agent mesh networking, enabling both efficient local task management and distributed agent collaboration.

## Unified Architecture

### System Overview

```
┌─── Unified Job System ──────────────────────────────────────┐
│                                                              │
│  Local Jobs                    Network Jobs                  │
│  ┌─────────────┐              ┌──────────────┐             │
│  │ Downloads   │              │ Agent Tasks  │             │
│  │ Scraping    │◄────────────►│ Research     │             │
│  │ Processing  │              │ Computation  │             │
│  └─────────────┘              └──────────────┘             │
│         ▲                             ▲                      │
│         │                             │                      │
│         └──────────┬──────────────────┘                     │
│                    │                                         │
│            Unified Job Engine                                │
│            ┌───────────────┐                                │
│            │ Scheduler     │                                │
│            │ Router        │                                │
│            │ Executor      │                                │
│            └───────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

### Job Classification

```typescript
enum JobScope {
  LOCAL = 'local',           // Local machine only
  NETWORK = 'network',       // P2P network distribution
  HYBRID = 'hybrid'          // Can be either
}

enum JobType {
  // Local Jobs
  DOWNLOAD = 'download',
  SCRAPE = 'scrape',
  FILE_PROCESS = 'file-process',
  
  // Network Jobs
  AGENT_TASK = 'agent-task',
  RESEARCH = 'research',
  COMPUTATION = 'computation',
  
  // Hybrid Jobs
  DATA_ANALYSIS = 'data-analysis',
  CODE_REVIEW = 'code-review',
  TESTING = 'testing'
}
```

## Integrated Job Model

### Unified Job Structure

```typescript
interface UnifiedJob {
  // Core Identity
  id: string;
  type: JobType;
  scope: JobScope;
  
  // Execution Details
  priority: number;
  status: JobStatus;
  created: Date;
  deadline?: Date;
  
  // Payload
  data: any;
  requirements: {
    capabilities?: string[];
    resources?: ResourceRequirements;
    security?: SecurityLevel;
  };
  
  // Network Properties (if distributed)
  network?: {
    issuer: AgentIdentity;
    signature: string;
    ttl: number;
    maxHops: number;
    reward?: Reward;
  };
  
  // Execution State
  execution: {
    assignedTo?: string;      // Worker ID or Agent ID
    startTime?: Date;
    progress: number;
    logs: LogEntry[];
    result?: any;
  };
}
```

### Job Router

```typescript
class UnifiedJobRouter {
  async routeJob(job: UnifiedJob): Promise<void> {
    // Determine optimal execution path
    const routingDecision = await this.analyzeJob(job);
    
    switch (routingDecision.target) {
      case 'local':
        await this.routeToLocalWorker(job);
        break;
        
      case 'network':
        await this.routeToNetwork(job);
        break;
        
      case 'hybrid':
        await this.routeHybrid(job);
        break;
    }
  }
  
  private async analyzeJob(job: UnifiedJob): Promise<RoutingDecision> {
    // Consider factors:
    // - Local resource availability
    // - Network agent capabilities
    // - Job urgency and deadline
    // - Cost/reward optimization
    // - Security requirements
    
    return {
      target: 'local',
      reasoning: 'Sufficient local resources',
      alternativeRoutes: ['network']
    };
  }
}
```

## Implementation Architecture

### 1. Unified Storage Layer

```
~/.leviathan/unified-jobs/
├── local/
│   ├── pending/
│   ├── active/
│   └── completed/
├── network/
│   ├── published/
│   ├── accepted/
│   └── completed/
├── hybrid/
│   ├── queue/
│   └── routing/
└── metadata/
    ├── capabilities.json
    ├── reputation.json
    └── statistics.json
```

### 2. Service Architecture

```typescript
class UnifiedJobService extends LeviathanService {
  private localQueue: LocalJobQueue;
  private networkQueue: P2PJobNetwork;
  private router: UnifiedJobRouter;
  private executor: JobExecutor;
  
  async start(): Promise<void> {
    // Initialize local processing
    await this.localQueue.initialize();
    
    // Connect to P2P network
    await this.networkQueue.connect();
    
    // Start unified processing
    this.startProcessingLoop();
  }
  
  private async processNextJob(): Promise<void> {
    // Get highest priority job from any source
    const job = await this.getNextJob();
    
    // Route to appropriate executor
    await this.router.routeJob(job);
  }
}
```

### 3. Capability Management

```typescript
interface CapabilityRegistry {
  local: {
    hardware: HardwareCapabilities;
    software: SoftwareCapabilities;
    tools: AvailableTools;
  };
  
  network: {
    agents: Map<AgentId, AgentCapabilities>;
    aggregated: AggregatedCapabilities;
    routing: CapabilityRoutingTable;
  };
}

class CapabilityManager {
  async canExecuteLocally(job: UnifiedJob): Promise<boolean> {
    return this.matchCapabilities(
      job.requirements.capabilities,
      this.registry.local
    );
  }
  
  async findNetworkExecutor(job: UnifiedJob): Promise<AgentId[]> {
    return this.searchAgents(
      job.requirements.capabilities,
      job.requirements.reputation
    );
  }
}
```

## Integration Patterns

### 1. Local-to-Network Escalation

```typescript
// Job starts locally but escalates to network if needed
async function escalateToNetwork(job: UnifiedJob): Promise<void> {
  // Local execution failed or insufficient resources
  if (job.execution.failureReason === 'INSUFFICIENT_RESOURCES') {
    // Convert to network job
    const networkJob = {
      ...job,
      scope: JobScope.NETWORK,
      network: {
        issuer: this.agentIdentity,
        reward: calculateReward(job),
        ttl: 3600
      }
    };
    
    // Publish to network
    await this.networkQueue.publishJob(networkJob);
  }
}
```

### 2. Network-to-Local Delegation

```typescript
// Network job delegated to local execution
async function acceptNetworkJob(ticket: JobTicket): Promise<void> {
  // Verify we can execute
  if (await this.canExecute(ticket)) {
    // Accept and convert to local job
    const localJob = {
      ...ticket,
      scope: JobScope.LOCAL,
      execution: {
        assignedTo: 'local-worker-pool',
        acceptedFrom: ticket.issuer
      }
    };
    
    // Execute locally
    await this.localQueue.enqueue(localJob);
  }
}
```

### 3. Hybrid Job Splitting

```typescript
// Complex job split between local and network
async function splitHybridJob(job: UnifiedJob): Promise<void> {
  const subtasks = await this.decomposeJob(job);
  
  for (const subtask of subtasks) {
    if (await this.canExecuteLocally(subtask)) {
      await this.localQueue.enqueue(subtask);
    } else {
      await this.networkQueue.publishJob(subtask);
    }
  }
  
  // Coordinate results
  await this.createAggregationJob(job.id, subtasks);
}
```

## UI Integration

### Unified Dashboard

```typescript
interface UnifiedDashboard {
  sections: {
    overview: {
      totalJobs: number;
      localActive: number;
      networkActive: number;
      completionRate: number;
    };
    
    queues: {
      local: QueueVisualization;
      network: NetworkVisualization;
      routing: RoutingFlowDiagram;
    };
    
    performance: {
      throughput: TimeSeriesChart;
      latency: HistogramChart;
      resources: ResourceUtilization;
    };
  };
}
```

### Job Creation Interface

```typescript
interface JobCreationWizard {
  steps: [
    {
      name: 'Job Type',
      options: JobType[];
    },
    {
      name: 'Execution Preference',
      options: ['Local Only', 'Network Only', 'Best Available'];
    },
    {
      name: 'Requirements',
      fields: ['capabilities', 'deadline', 'budget'];
    },
    {
      name: 'Advanced',
      fields: ['security', 'routing', 'fallback'];
    }
  ];
}
```

## Monitoring & Analytics

### Unified Metrics

```typescript
interface UnifiedMetrics {
  // Job metrics
  jobs: {
    total: number;
    byType: Record<JobType, number>;
    byScope: Record<JobScope, number>;
    averageCompletionTime: number;
    failureRate: number;
  };
  
  // Network metrics
  network: {
    connectedAgents: number;
    jobsPublished: number;
    jobsAccepted: number;
    reputationScore: number;
  };
  
  // Resource metrics
  resources: {
    cpuUtilization: number;
    memoryUsage: number;
    diskIO: number;
    networkBandwidth: number;
  };
}
```

## Migration Strategy

### Phase 1: Unified Storage
1. Implement unified job storage structure
2. Create migration tools for existing jobs
3. Update job models with unified schema

### Phase 2: Service Integration
1. Extend existing services with unified interface
2. Implement job router with basic logic
3. Create capability registry

### Phase 3: Network Integration
1. Add P2P job publishing from local queue
2. Enable network job acceptance
3. Implement hybrid job routing

### Phase 4: Advanced Features
1. Smart routing algorithms
2. Reputation-based selection
3. Economic incentive models
4. Cross-network bridges

## Benefits

### Operational
- Single interface for all job types
- Automatic failover between local/network
- Optimal resource utilization
- Unified monitoring and debugging

### Strategic
- Gradual transition from local to distributed
- Leverage both local power and network scale
- Future-proof architecture
- Community ecosystem participation

## Challenges

### Technical
- Complexity of hybrid routing decisions
- Maintaining consistency across systems
- Performance overhead of unified layer
- Security boundaries between local/network

### Organizational
- Learning curve for unified model
- Migration of existing workflows
- Debugging distributed jobs
- Cost/benefit analysis for network jobs

## Success Metrics

- Seamless job execution regardless of scope
- < 1% job loss during routing
- 90%+ optimal routing decisions
- Support 10,000+ jobs/day across all types
- Maintain sub-second routing decisions

## References

- ADR-001: Background Processing Architecture
- ADR-002: P2P Agent Mesh Network
- Kingly Job System Documentation
- Activepieces Integration Analysis
- libp2p Best Practices Guide