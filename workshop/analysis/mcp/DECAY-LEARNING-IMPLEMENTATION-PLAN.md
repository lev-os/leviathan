# 🧠 Decay & Self-Learning Implementation Plan

_Created: 2025-06-25_
_Based on: MCP re-analysis + existing Leviathan architecture_

## 🎯 Executive Summary

After deep analysis, we found:

1. **Decay Management**: Found in `_ref/mcp-ceo`, NOT in memento-mcp
2. **Self-Learning Patterns**: mcp-agent has valuable patterns
3. **Transport**: No WebSocket in any MCP server - build it yourself
4. **JEPA 2**: Your research is ready for implementation

## 📊 Implementation Architecture

```javascript
// Unified Self-Learning Memory System
class LeviathanMemoryCore {
  constructor() {
    // Your existing components
    this.hybridMemory = new HybridMemoryManager()
    this.graphitiService = new GraphitiGRPCService()

    // New components to build
    this.decayManager = new MemoryDecayManager()
    this.bubbleUpEngine = new BubbleUpIntelligence()
    this.jepaPredictor = new JEPA2Predictor()
    this.webSocketTransport = new MemoryWebSocketServer()
  }
}
```

## 🔄 Memory Decay Implementation

### From mcp-ceo/ContextTracker.js:

```javascript
class MemoryDecayManager {
  constructor(options = {}) {
    this.temporalDecayRate = options.temporalDecayRate || 0.95 // 5% per day
    this.transformDecayRate = options.transformDecayRate || 0.05
    this.minConfidence = options.minConfidence || 0.1
  }

  // Time-based decay
  applyTemporalDecay(memory) {
    const ageInMs = Date.now() - memory.createdAt
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
    const decayFactor = Math.pow(this.temporalDecayRate, ageInDays)

    return {
      ...memory,
      confidence: Math.max(this.minConfidence, memory.confidence * decayFactor),
      lastDecayedAt: Date.now(),
    }
  }

  // Usage-based reinforcement
  reinforceMemory(memory, usageStrength = 1.0) {
    return {
      ...memory,
      confidence: Math.min(1.0, memory.confidence + 0.1 * usageStrength),
      lastAccessedAt: Date.now(),
      accessCount: (memory.accessCount || 0) + 1,
    }
  }
}
```

## 🚀 Bubble-Up Intelligence Pattern

### From your existing concepts:

```javascript
class BubbleUpIntelligence {
  async detectAhaMoment(observation) {
    // Pattern recognition across contexts
    const patterns = await this.findCrossContextPatterns(observation)

    if (patterns.significance > 0.8) {
      return {
        type: 'aha_moment',
        insight: patterns.insight,
        contexts: patterns.affectedContexts,
        bubbleUpTo: patterns.parentContexts,
      }
    }
  }

  async propagateInsight(ahaMoment) {
    // Bubble up through context hierarchy
    for (const parentContext of ahaMoment.bubbleUpTo) {
      await this.notifyContext(parentContext, ahaMoment)

      // Trickle down to sibling contexts
      const siblings = await this.getSiblingContexts(parentContext)
      for (const sibling of siblings) {
        await this.trickleDown(sibling, ahaMoment)
      }
    }
  }
}
```

## 🔌 WebSocket Transport Layer

```javascript
class MemoryWebSocketServer {
  constructor(grpcService) {
    this.grpc = grpcService
    this.clients = new Map()
  }

  async start(port = 8765) {
    this.wss = new WebSocketServer({ port })

    this.wss.on('connection', (ws, req) => {
      const clientId = this.registerClient(ws)

      // Real-time memory updates
      ws.on('message', async (data) => {
        const msg = JSON.parse(data)

        switch (msg.type) {
          case 'subscribe_decay':
            this.subscribeToDecayEvents(clientId, msg.filter)
            break

          case 'subscribe_learning':
            this.subscribeToLearningEvents(clientId, msg.filter)
            break

          case 'memory_access':
            await this.handleMemoryAccess(msg.memoryId, clientId)
            break
        }
      })
    })
  }

  broadcastDecayEvent(memory) {
    const event = {
      type: 'memory_decayed',
      memoryId: memory.id,
      oldConfidence: memory.oldConfidence,
      newConfidence: memory.confidence,
      timestamp: Date.now(),
    }

    this.broadcast(event, 'decay')
  }
}
```

## 📅 Implementation Timeline

### Week 1-2: Core Decay System

- [ ] Port ContextTracker decay algorithms
- [ ] Integrate with gRPC memory service
- [ ] Add decay fields to proto definitions
- [ ] Create decay scheduler (runs every hour)

### Week 3-4: Self-Learning Patterns

- [ ] Implement BubbleUpIntelligence engine
- [ ] Extract mcp-agent orchestrator patterns
- [ ] Create aha moment detection
- [ ] Build cross-context pattern recognition

### Week 5-6: Transport & Real-time

- [ ] Build WebSocket server
- [ ] Create event subscription system
- [ ] Implement real-time decay notifications
- [ ] Add learning event streams

### Week 7-8: JEPA 2 Integration

- [ ] Implement JEPA2Predictor class
- [ ] Create predictive memory patterns
- [ ] Build zero-shot adaptation
- [ ] Integrate with decay/reinforcement

## 🧪 Testing Strategy

```javascript
describe('Self-Learning Memory System', () => {
  test('memories decay over time', async () => {
    const memory = await createMemory({ confidence: 1.0 })

    // Simulate 7 days passing
    jest.advanceTimersByTime(7 * 24 * 60 * 60 * 1000)

    const decayed = await getMemory(memory.id)
    expect(decayed.confidence).toBeCloseTo(0.698, 2) // 0.95^7
  })

  test('aha moments bubble up', async () => {
    const insight = await detectAhaMoment(observation)

    expect(insight.bubbleUpTo).toContain('parent-context')
    expect(notifyContext).toHaveBeenCalledWith('parent-context', insight)
  })
})
```

## 🎯 Success Metrics

1. **Decay Accuracy**: Memories fade naturally unless reinforced
2. **Learning Rate**: System identifies patterns 40% faster over time
3. **Prediction Hit Rate**: JEPA 2 correctly predicts next action 70%+
4. **Cross-Context Insights**: 10+ aha moments per week

## 🚀 Next Steps

1. Create `packages/memory/src/decay/` directory structure
2. Copy decay algorithms from mcp-ceo
3. Design proto extensions for confidence/decay fields
4. Start WebSocket server implementation
5. Begin JEPA 2 adapter development

**The path is clear - let's build an AI memory that learns and forgets like a human mind!**
