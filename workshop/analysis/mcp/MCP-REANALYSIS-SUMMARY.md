# 🔄 MCP Re-Analysis: Transport, Self-Learning & Decay Management

_Analysis Date: 2025-06-25_
_Focus: WebSocket/transport modes, agentic memory, self-learning, decay management_

## 🚀 Current Leviathan Memory Architecture

### What You ALREADY Have:

1. **Hybrid Memory System** (packages/memory)

   - 5 memory types: Procedural, Semantic, Temporal, Working, Episodic
   - File system + Graphiti (Neo4j) backend
   - Fallback mode when Graphiti is down
   - Plugin privilege system (core vs regular)

2. **gRPC Service Being Built** (packages/memory/graphiti-service)

   - Full proto definitions for memory operations
   - Episodic memory focus (Graphiti's strength)
   - Temporal reasoning capabilities
   - Multi-agent workspace management
   - Pattern finding and confidence scoring

3. **Advanced Concepts** (\_ref/orig-agent)

   - **Bubble-up intelligence**: Cross-context insight propagation
   - **Trickle-down patterns**: Parent → child context strategies
   - **Aha moments**: Significant insight detection
   - **Homework pattern**: Bi-directional human-AI collaboration

4. **JEPA 2 Self-Learning Research** (\_03-jepa.md)
   - 1.2B parameter video-native world model
   - 4D spatio-temporal reasoning
   - Zero-shot learning from minimal training
   - Predictive computing and autonomous optimization

## 🎯 MCP Analysis: What They ACTUALLY Add

### 1. **mcp-memory** → Limited Value (Don't Adopt) ❌

**Why Not**: Your packages/memory is MORE sophisticated!

- You have: Hybrid architecture, 5 memory types, gRPC service
- They have: Basic 23 tools, pattern learning, health dashboard
- **Missing**: WebSocket transport (only REST/stdio)
- **Verdict**: Extract pattern learning concepts only

### 2. **memento-mcp** → NO DECAY IMPLEMENTATION ⚠️

**IMPORTANT FINDING**: Has decay API but NO actual implementation!

```yaml
promised_but_missing:
  - getDecayedGraph(): "Just throws 'not supported' error"
  - getEntityHistory(): 'Interface only, no implementation'
  - getGraphAtTime(): 'Interface only, no implementation'
  - NO confidence decay logic found
actual_features:
  - Neo4j backend (like your gRPC)
  - Vector embeddings with Qdrant
  - Basic CRUD operations
transport_modes:
  - stdio (standard)
  - NO websocket, NO gRPC
```

**Verdict**: Skip - you'd implement decay from scratch anyway

### 3. **mcp-agent** → CRITICAL for Self-Learning Patterns ⭐⭐⭐⭐⭐

**Why**: Implements autonomous agent patterns you need

```yaml
self_learning_patterns:
  - orchestrator: 'Manages multi-agent learning'
  - swarm: 'Collective intelligence patterns'
  - evaluator_optimizer: 'Self-improvement loops'
  - router: 'Intelligent task distribution'
transport: 'stdio only'
```

**Matches**: Your bubble-up/trickle-down concepts perfectly!

### 4. **mcp-graphiti** → Already Implemented ✅

- You're already using Graphiti in packages/memory
- Your gRPC service has MORE features than their MCP wrapper
- **Skip**: No additional value

### 5. **mcp-use** → Extract Transport Patterns Only 🔄

**Value**: Multi-server coordination patterns

- Dynamic MCP server selection
- LangChain integration patterns
- Still no WebSocket transport

## 🔌 Transport Mode Analysis

### Current MCP Limitations:

- **ALL servers**: stdio (standard) or HTTP
- **NONE**: WebSocket, gRPC, or streaming
- **Your advantage**: Already building gRPC service!

### Recommended Transport Architecture:

```yaml
leviathan_transport_layers:
  1_grpc:
    what: 'Your graphiti-service'
    why: 'High-performance, typed, streaming'
    use_for: 'Core memory operations'

  2_websocket:
    what: 'Build for real-time updates'
    why: 'Live memory updates, decay notifications'
    use_for: 'Agent coordination, live learning'

  3_mcp_stdio:
    what: 'Compatibility layer'
    why: 'Claude/Cursor integration'
    use_for: 'Tool exposure to LLMs'
```

## 🧠 Self-Learning Architecture Integration

### Combining Concepts:

```javascript
// Bubble-up + JEPA 2 + Decay Management
class SelfLearningMemory {
  constructor() {
    this.jepaEngine = new JEPA2Engine()
    this.decayManager = new ConfidenceDecayManager()
    this.bubbleUpEngine = new CrossContextInsights()
  }

  async learn(observation) {
    // JEPA 2 predictive learning
    const prediction = await this.jepaEngine.predict(observation)

    // Decay old memories
    await this.decayManager.updateConfidence(observation.context)

    // Bubble up insights
    if (prediction.confidence > 0.8) {
      await this.bubbleUpEngine.propagate(prediction)
    }

    // Aha moment detection
    if (this.isAhaMoment(prediction)) {
      await this.captureSignificantInsight(prediction)
    }
  }
}
```

### Implementation Priority:

1. **Week 1-2**: Port memento-mcp decay algorithms

   - Add to gRPC service
   - Implement confidence scoring
   - Version history tracking

2. **Week 3-4**: Extract mcp-agent patterns

   - Orchestrator pattern for multi-agent
   - Swarm intelligence for collective learning
   - Self-evaluation loops

3. **Week 5-6**: WebSocket layer

   - Real-time memory updates
   - Decay notifications
   - Live learning events

4. **Week 7-8**: JEPA 2 integration
   - Predictive memory patterns
   - Autonomous optimization
   - Zero-shot adaptation

## 📊 Decision Matrix Updated

| Component        | Source             | Decision         | Why                            |
| ---------------- | ------------------ | ---------------- | ------------------------------ |
| Decay Management | Build from scratch | DESIGN & BUILD   | No implementation exists       |
| Self-Learning    | mcp-agent patterns | EXTRACT PATTERNS | Matches bubble-up/trickle-down |
| Transport        | Build custom       | BUILD WEBSOCKET  | None have what you need        |
| JEPA 2           | Your research      | IMPLEMENT        | Revolutionary potential        |
| Memory Core      | Keep yours         | ENHANCE          | Already superior               |

## 💡 ACTUAL DECAY IMPLEMENTATION FOUND!

**Location**: `_ref/mcp-ceo/src/tracking/ContextTracker.js`

```javascript
// Temporal decay implementation
applyTemporalDecay(confidence, ageInMs) {
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
  const decayFactor = Math.pow(0.95, ageInDays) // 5% decay per day
  return Math.max(this.minConfidence, confidence * decayFactor)
}

// Transformation-based decay
applyDecay(confidence, transformationCount, complexity = 1.0) {
  const decay = this.decayRate * transformationCount * complexity
  return Math.max(this.minConfidence, confidence - decay)
}
```

## 🎯 Immediate Actions

1. **Extract decay algorithms** from mcp-ceo (NOT memento-mcp):

   ```bash
   cp _ref/mcp-ceo/src/tracking/ContextTracker.js packages/memory/src/decay-manager.js
   ```

2. **Study agent patterns** from mcp-agent:

   ```bash
   find workshop/intake-mcp/mcp-agent -name "*.py" | xargs grep -l "orchestrat\|swarm\|evaluat"
   ```

3. **Design WebSocket protocol** for your gRPC service:
   - Real-time memory updates
   - Decay notifications
   - Learning event streams

## 🔮 The Big Picture

Your memory system + decay management + self-learning patterns + JEPA 2 = **Autonomous AI OS Memory**

This creates:

- Memories that naturally fade unless reinforced
- Cross-project learning that bubbles up insights
- Predictive intelligence that anticipates needs
- Self-improving system that gets smarter over time

**Next Step**: Start with decay algorithm extraction - it's the missing piece that enables everything else!
