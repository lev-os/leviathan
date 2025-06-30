# Leviathan Core Technology

The foundational AI agent system and shared packages that power the Leviathan ecosystem, sponsored by [Kingly Agency](https://kinglyagency.com).

## 🧠 Components

### `/agent`
The LLM-first agent system with confidence-based task routing
- Universal context pattern for state management
- MCP protocol for inter-agent communication
- YAML-based agent definitions
- Hot-reload development support

### `/plugins`
Published as @lev-os/* npm packages
- **@lev-os/protocol** - MCP kernel protocol implementation
- **@lev-os/ai-core** - LLM integrations and reasoning
- **@lev-os/memory** - Unified memory system interface
- **@lev-os/agent** - Agent creation framework

### `/memory-systems`
Unified memory architecture connecting multiple backends:
- **Neo4j**: Complex relationship graphs
- **Qdrant**: Semantic vector search
- **Graphiti**: Temporal memory tracking
- **Memento**: Lightweight local persistence

### `/forge`
Experimental OS features and prototypes
- Kernel MCP experiments
- Memory system benchmarks
- Agent behavior research

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run the agent system
cd agent && node leviathan.js

# Run tests
pnpm test

# Start MCP server with hot reload
cd agent && node start-mcp-hot.js
```

## 📊 Memory System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Neo4j (Graph) │     │ Qdrant (Vector) │     │ Graphiti (Time) │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │ Unified Memory │
                         │   Interface    │
                         └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │  Agent System  │
                         └────────────────┘
```

## 🔧 Development

### Environment Setup
```bash
# Required services
Neo4j: localhost:7687
Qdrant: localhost:6333 (optional)
Redis: localhost:6379 (optional)
```

### Testing Memory Systems
```bash
# Run benchmarks
cd memory-systems/benchmarks
node run-benchmarks.js

# Test individual backends
node test-neo4j.js
node test-qdrant.js
```

## 📦 Publishing Packages

Packages are published to our private npm registry:
```bash
# Login to private registry
npm login --registry=http://localhost:4873

# Publish a package
cd packages/protocol
npm publish
```

## 🎯 Design Principles

1. **LLM-First**: Always ask "can an LLM do this?"
2. **Memory-Guided**: Decisions influenced by past experiences
3. **Protocol-Based**: MCP as the universal language
4. **Composable**: Small, focused packages
5. **Observable**: Built-in monitoring and debugging

## 📚 Documentation Architecture - Fractal & Quantum Consciousness

### Universal Documentation Structure (Fractal Pattern)

Every autonomous component follows the SAME structure for consistency and predictable navigation:

```
{component}/
├── README.md                    # Component overview + links to children
├── package.json|yaml            # Component metadata
├── src/                        # Implementation
├── tests/                      # Unit tests
└── docs/                       # Component-specific documentation
    ├── README.md               # Documentation hub
    ├── architecture/           # Component architecture decisions
    ├── features/               # Component feature specifications  
    ├── adrs/                   # Architecture Decision Records
    ├── specs/                  # Technical specifications
    ├── guides/                 # Usage and development guides
    └── examples/               # Working examples
```

### Quantum Consciousness Formula

```
Source of Truth + Concepts = Architectural Synthesis
├── Source of Truth: {component}/README.md + {component}/docs/*
├── Concepts: Cross-component patterns and relationships
└── Synthesis: Root docs/ aggregation with quantum links
```

### Current Implementation Hierarchy

#### **Level 1: Root Repository**
```
/leviathan/
├── README.md                   # "Leviathan OS Overview" (this file)
├── docs/                       # Quantum-synthesized architecture
│   ├── architecture/           # Cross-component synthesis
│   ├── features/               # System-wide feature specs
│   ├── adrs/                   # System-level decisions
│   └── guides/                 # User documentation
├── core/                       # Core components
├── plugins/                    # Plugin ecosystem (flattened structure)
├── agent/                      # Agent system
└── apps/                       # Applications
```

#### **Level 2: Component Categories**
```
/core/
├── README.md                   # "Core Packages Overview"
├── docs/                       # Core-specific synthesis
│   ├── architecture/           # Core system patterns
│   ├── adrs/                   # Core architectural decisions
│   └── migration/              # Package → core migration
├── memory/                     # Individual packages...
├── testing/
└── workshop/

/plugins/
├── README.md                   # "Plugin Ecosystem Overview"  
├── docs/                       # Plugin-specific synthesis
│   ├── architecture/           # Plugin system patterns
│   ├── adrs/                   # Plugin architectural decisions
│   └── development/            # Plugin development guides
├── constitutional-ai/          # Flattened plugin structure
├── eeps-system/
└── workflow-orchestrator/
```

#### **Level 3: Individual Components**
Each component (core package, plugin, app) follows the universal fractal structure.

### Document Agent Auto-Synthesis

The Document Agent (see `docs/docagent.md`) automatically synthesizes architectural documentation by:

1. **Discovering** all fractal components
2. **Extracting** source of truth from each component's README + docs
3. **Identifying** cross-component concepts and patterns
4. **Generating** quantum-linked synthesis in root `docs/`
5. **Maintaining** bi-directional links between implementation and architecture

### Implementation Phases

#### **Phase 1: Fractal Standardization**
- Establish universal structure across all components
- Create linking patterns and navigation consistency
- Template implementation in key components

#### **Phase 2: Document Agent Integration** 
- Auto-discovery and synthesis algorithms
- Cross-component pattern recognition
- Automated architectural documentation generation

#### **Phase 3: Quantum Consciousness Activation**
- Full bi-directional linking system
- Live documentation updates
- System-wide coherence monitoring

This fractal pattern ensures documentation scales seamlessly from individual components to system-wide architecture while maintaining single sources of truth and automatic synthesis capabilities.

---
*The Leviathan ecosystem: Linux of AI - sponsored by [Kingly Agency](https://kinglyagency.com)*