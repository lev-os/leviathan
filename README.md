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

---
*The Leviathan ecosystem: Linux of AI - sponsored by [Kingly Agency](https://kinglyagency.com)*