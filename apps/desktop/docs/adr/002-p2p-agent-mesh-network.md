# ADR-002: P2P Agent Mesh Network Architecture

**Date**: 2025-01-30  
**Status**: Proposed  
**Context**: Enable agent-to-agent (A2A) communication through distributed job tickets

## Decision

Implement a P2P mesh network that allows agents across different projects and Claude Code tabs to submit jobs to the network and accept jobs from other agents, creating a decentralized task marketplace.

## Background Research

### Industry Context (2025)

1. **MESH Platform**: Solana-native autonomous agent marketplace enabling agent registration, identity management, and P2P communication
2. **Olas Marketplace**: Decentralized AI marketplace where AI agents can hire each other
3. **libp2p Adoption**: $300B+ secured at networking layer by major Web3 projects

### Technical Foundation

**P2P vs Mesh Networking**:
- P2P: Bandwidth-efficient content distribution
- Mesh: Direct connections with multiple pathways, self-organizing and self-configuring
- Hybrid: Combines both for resilience and efficiency

## Architecture

### 1. Network Topology

```
┌─── Leviathan Agent Mesh Network ────────────────────────┐
│                                                          │
│  Project A Agent ←→ Project B Agent                     │
│       ↕                    ↕                            │
│  Tab 1 Agent    ←→ Tab 3 Agent                         │
│       ↕                    ↕                            │
│  Local Job Pool ←→ Network Job Pool                    │
│                                                          │
│  Features:                                               │
│  - mDNS local discovery                                  │
│  - DHT global discovery                                  │
│  - NAT traversal                                         │
│  - Direct agent channels                                 │
└──────────────────────────────────────────────────────────┘
```

### 2. Job Ticket System

**Cryptographically Signed Work Requests**:
```json
{
  "ticket": {
    "id": "job_2025-01-30_uuid",
    "version": "1.0",
    "type": "computation|data-processing|research|communication",
    "issuer": {
      "agentId": "project-a-tab-1-agent",
      "publicKey": "ed25519:...",
      "capabilities": ["llm", "web-search", "file-access", "mcp-tools"],
      "reputation": 0.95
    },
    "requirements": {
      "capabilities": ["web-search", "data-analysis"],
      "minimumReputation": 0.8,
      "estimatedTime": "5-10 minutes",
      "reward": {
        "type": "reputation|reciprocal|token",
        "amount": 10
      }
    },
    "payload": {
      "task": "Research latest AI developments in mesh networking",
      "context": "Building P2P agent communication system",
      "inputData": {},
      "outputFormat": "markdown-report",
      "deadline": "2025-01-30T11:00:00Z"
    },
    "routing": {
      "maxHops": 3,
      "preferLocal": true,
      "excludeAgents": []
    },
    "signature": "cryptographic-signature",
    "timestamp": "2025-01-30T10:00:00Z",
    "ttl": 3600
  }
}
```

### 3. Communication Protocol Stack

**Based on libp2p**:
```typescript
class P2PAgentNetwork {
  private node: Libp2p;
  private identity: PeerId;
  private jobMarket: PubSub;
  private directChannels: Map<string, Stream>;
  
  constructor() {
    this.node = await createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0', '/ip4/0.0.0.0/tcp/0/ws']
      },
      transports: [tcp(), webSockets()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      peerDiscovery: [
        mdns(),           // Local network discovery
        bootstrap(),      // Known peers
        dht()            // Global discovery
      ],
      services: {
        pubsub: gossipsub(),
        dht: kadDHT()
      }
    });
  }
  
  // Broadcast job to network
  async publishJob(ticket: JobTicket): Promise<void> {
    const message = await this.signMessage(ticket);
    await this.jobMarket.publish('leviathan-jobs', message);
  }
  
  // Accept job and establish direct channel
  async acceptJob(ticketId: string): Promise<DirectChannel> {
    const ticket = this.jobPool.get(ticketId);
    const stream = await this.node.dialProtocol(
      ticket.issuer.peerId,
      '/leviathan/job/1.0.0'
    );
    return new DirectChannel(stream, ticket);
  }
}
```

### 4. Agent Identity & Capabilities

**Self-Describing Agents**:
```typescript
interface AgentIdentity {
  id: string;                    // Unique identifier
  peerId: PeerId;               // libp2p peer ID
  publicKey: string;            // Ed25519 public key
  capabilities: Capability[];    // What the agent can do
  reputation: ReputationScore;   // Historical performance
  availability: Availability;    // Current load/status
  metadata: {
    project: string;
    version: string;
    description: string;
  };
}

interface Capability {
  type: 'llm' | 'tool' | 'service';
  name: string;
  version: string;
  parameters?: any;
}
```

## Implementation Phases

### Phase 1: Local File-Based MVP (Week 1)

**Simple Start with File Watching**:
```
~/.leviathan/p2p/
├── announcements/    # Job broadcasts
├── capabilities/     # Agent capabilities
├── direct-msgs/      # Agent-to-agent messages
└── reputation/       # Reputation tracking
```

1. File-based job exchange between tabs
2. Job ticket creation and validation
3. Capability advertisement via files
4. Basic reputation tracking
5. Simple job matching algorithm

### Phase 2: P2P Infrastructure (Week 2)

1. **libp2p Integration**:
   - Peer discovery (mDNS + DHT)
   - PubSub for job market
   - Stream multiplexing
   - NAT traversal

2. **Protocol Implementation**:
   ```
   /leviathan/job/1.0.0      - Job negotiation
   /leviathan/agent/1.0.0    - Agent metadata exchange
   /leviathan/result/1.0.0   - Result delivery
   ```

### Phase 3: Job Marketplace (Week 3)

1. **Market Mechanics**:
   - Job bidding system
   - Capability-based routing
   - Reputation algorithms
   - Result verification

2. **UI Components**:
   - Network topology visualization
   - Job market browser
   - Agent directory
   - Reputation dashboard

### Phase 4: Advanced Features (Week 4)

1. **Complex Workflows**:
   - Multi-agent job chains
   - Conditional job routing
   - Parallel job execution
   - Result aggregation

2. **Network Services**:
   - Job template registry
   - Capability certification
   - Dispute resolution
   - Network statistics

## Communication Patterns

### 1. Job Discovery Pattern
```
Agent A → Network: PublishJob("I need web scraping help")
Network → Capable Agents: Broadcast(JobTicket)
Agent B → Agent A: SendBid("I can help, 95% success rate")
Agent A → Agent B: AcceptBid()
Agent A ←→ Agent B: EstablishDirectChannel()
```

### 2. Capability Negotiation
```
Agent A: "I need these specific tools"
Agent B: "I have 80% of what you need"
Agent A: "Can you acquire the missing 20%?"
Agent B: "Yes, through agent C"
Agent A: "Proceed with sub-contracting"
```

### 3. Multi-Agent Coordination
```
Coordinator → Network: "Complex job needing specialist agents"
Specialist Agents → Coordinator: "We can handle parts X, Y, Z"
Coordinator: Creates job DAG (Directed Acyclic Graph)
All Agents: Execute in parallel with dependencies
Coordinator: Aggregates and validates results
```

## Security & Trust

### 1. Cryptographic Identity
- Ed25519 key pairs for each agent
- Message signing for all communications
- Encrypted direct channels

### 2. Reputation System
```typescript
interface ReputationScore {
  overall: number;           // 0.0 - 1.0
  jobsCompleted: number;
  jobsFailed: number;
  averageRating: number;
  specializations: {
    [capability: string]: number;
  };
  lastUpdated: Date;
}
```

### 3. Job Sandboxing
- Isolated execution environments
- Resource limits per job
- Capability-based access control

## Integration Points

### Existing Job System
```javascript
// Extend Kingly job system
const p2pJob = await jobSystem.createJob({
  type: 'p2p-distributed',
  broadcast: true,
  requirements: ['code-analysis', 'testing'],
  workflow: {
    publishToNetwork: true,
    waitForAcceptance: true,
    coordinateWithAgent: true,
    verifyCompletion: true
  }
});
```

### MCP Protocol Extension
```typescript
// New MCP tools for P2P network
const p2pTools = {
  'publish-job': publishJobToNetwork,
  'accept-job': acceptNetworkJob,
  'list-network-jobs': listAvailableJobs,
  'get-agent-info': getAgentInformation,
  'send-direct-message': sendAgentMessage
};
```

### Session Management
- Jobs tracked across sessions
- Persistent agent relationships
- Resume interrupted jobs

## UI/UX Design

### 1. Network Visualization
- **Force-directed graph** of agent connections
- **Heat map** of job flow intensity
- **Real-time** connection status
- **Filtering** by capability/project

### 2. Job Market Interface
- **Card-based** job listings
- **Filtering** by requirements/rewards
- **Sorting** by relevance/deadline
- **Quick actions** for bid/accept

### 3. Agent Profile
- **Capability badges**
- **Reputation score**
- **Job history**
- **Direct message**

## Future Capabilities

### Autonomous Agent Networks
1. **Self-organizing clusters** by capability
2. **Automatic job decomposition**
3. **Cross-network bridges** to other systems
4. **Economic models** for resource allocation

### Enterprise Features
1. **Private networks** with access control
2. **Compliance logging** for regulations
3. **SLA enforcement** for critical jobs
4. **Hierarchical agent structures**

## Success Metrics

- < 100ms local job propagation
- < 1s network-wide job discovery
- 95%+ job completion rate
- Support 100+ concurrent agents
- Maintain connectivity with 50% node failure

## Consequences

### Positive
- True decentralized agent collaboration
- No central point of failure
- Scales with network size
- Natural load balancing
- Cross-project knowledge sharing

### Negative
- Network complexity overhead
- Potential for job spam
- Reputation bootstrapping problem
- NAT traversal challenges
- Bandwidth usage for large networks

## References

- libp2p Documentation
- IPFS Architecture Guides
- MESH Agent Network Platform
- Olas Decentralized AI Marketplace
- Distributed Systems Research (2025)