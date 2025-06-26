# Leviathan OS Kernel Documentation

## Quick Navigation

### 🏗️ Architecture Documentation
Start here for understanding the system design:

- **[00-overview.md](architecture/00-overview.md)** - High-level architecture and principles
- **[01-hybrid-design-fundamentals.md](architecture/01-hybrid-design-fundamentals.md)** - C/Go hybrid foundation
- **[02-memory-management-design.md](architecture/02-memory-management-design.md)** - Memory safety strategies
- **[03-ai-extensibility-framework.md](architecture/03-ai-extensibility-framework.md)** - AI-driven extensibility
- **[04-discovery-engine-architecture.md](architecture/04-discovery-engine-architecture.md)** - ⭐ **TELO cycle & discovery engines**
- **[05-memory-integration-architecture.md](architecture/05-memory-integration-architecture.md)** - ⭐ **Graph + vector memory**

### 📋 Current Status & Planning
- **[../_2do.md](../_2do.md)** - ⭐ **Current status and next steps**
- **[../pm/tracker.csv](../pm/tracker.csv)** - Detailed task tracking
- **[../pm/agent.md](../pm/agent.md)** - Development process guidelines

### 🧪 Specifications & Testing
- **[specs/](specs/)** - BDD specifications and behavioral requirements
- **[experiments/](experiments/)** - Discovery engine experiments and results

### 📚 Research & Implementation
- **[research/](research/)** - Research materials and investigations
- **[implementation/](implementation/)** - Implementation phases and strategy
- **[validation/](validation/)** - Adversarial analysis and risk assessment
- **[roadmap/](roadmap/)** - Project timeline and milestones

## Key Concepts

### Discovery Engine Architecture
The revolutionary **TELO Cycle** (Trial-Error-Learn-Optimize) with hot-swappable engines:
- **SEAL Engine**: Self-evolving through synthetic data (MIT)
- **JEPA Engine**: World model predictions (Meta)
- **Hot-Swapping**: Runtime engine switching
- **Details**: [04-discovery-engine-architecture.md](architecture/04-discovery-engine-architecture.md)

### Temporal Memory Integration
**Neo4j + Graphiti** for persistent learning:
- High-quality embeddings (Voyage-3-large)
- Workspace isolation per engine
- Temporal graph relationships
- **Details**: [05-memory-integration-architecture.md](architecture/05-memory-integration-architecture.md)

### Real Pattern Detection
Mathematical derivatives-based detection (not fake confidence):
- CPU spike detection: >20% rate change
- Memory leak detection: consistent growth
- Evidence-based confidence scores
- **Implementation**: `../src/pattern_detector.go`

## Development Guidelines

### BDD-First Development
1. Define behavior in natural language
2. Write Given/When/Then test scenarios
3. Implement minimal code to pass
4. Refactor while keeping tests green

### Go Semantic Search
Use 23,541+ indexed Go docs for development:
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your Go pattern", "limit": 5}'
```

### TELO Cycle Implementation
```go
// Trial → Error → Learn → Optimize
attempt := engine.Attempt(problem)
outcome := engine.LogOutcome(attempt)
learning := engine.Learn(history)
strategy := engine.Optimize(learning)
```

## File Organization

```
docs/
├── README.md                     # This file
├── architecture/                 # Core design decisions
│   ├── 00-overview.md            # ⭐ Start here
│   ├── 04-discovery-engine-architecture.md  # ⭐ TELO cycle
│   └── 05-memory-integration-architecture.md # ⭐ Memory system
├── specs/                        # BDD specifications
├── experiments/                  # Discovery engine tests
├── research/                     # Research findings
├── implementation/               # Development phases
├── validation/                   # Risk assessment
└── roadmap/                      # Project timeline
```

## Quick Start

1. **Understand the vision**: Read [architecture/00-overview.md](architecture/00-overview.md)
2. **Check current status**: Read [../_2do.md](../_2do.md)
3. **Learn the process**: Read [../pm/agent.md](../pm/agent.md)
4. **See the architecture**: Read discovery engine and memory docs
5. **Start developing**: Follow BDD process with semantic search

## External References

- **Main Project**: `../CLAUDE.md` - Master configuration
- **Implementation**: `../src/` - Current working code
- **Tests**: `../tests/` - BDD test specifications
- **Management**: `../pm/` - Process and tracking

---

*Navigate to specific documents using the links above. Start with the overview for context, then dive into specific architectural decisions.*