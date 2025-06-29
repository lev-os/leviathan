# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technical Architecture - Core Principles

**Leviathan** is an AI-native operating system designed as the "Linux of AI" - a foundational platform for building sophisticated AI systems with maximum extensibility and bi-directional communication patterns.

### Core Technical Principles

1. **LLM-First Architecture** - AI reasoning as the primary execution engine
2. **Maximum Extensibility** - Plugin architecture enabling anyone to hack and extend
3. **Bi-Directional Communication** - System ↔ LLM feedback loops for enhanced capabilities
4. **Bootstrap Sovereignty** - Minimal dependencies, maximum autonomy
5. **Emergent Intelligence** - Behavior emerges from system interaction and configuration

### Bi-Directional Communication Architecture

**Inversion of Control Pattern**: The system creates feedback loops where:

1. **LLM → System Call**: Agent identifies need and calls system via MCP
2. **System → LLM Response**: System responds with workflow, context, and callback instructions
3. **LLM → Enhanced Processing**: LLM executes with full autonomy and system data
4. **LLM → System Callback**: LLM reports results and requests next step
5. **System → Iteration**: System saves progress and guides next iteration

This pattern enables advanced capabilities like the FlowMind meta-programming framework.

### Context-First Architecture

```yaml
context_architecture:
  principle: "context defines behavior and capabilities"
  system_managed:
    - execution_patterns
    - workflow_structures
    - state_management
    - session_continuity
  llm_accessible:
    - situational_patterns
    - knowledge_structures
    - procedural_workflows
    - environmental_data
```

## Project Overview

**Leviathan** is a sophisticated AI-native operating system ecosystem sponsored by Kingly Agency. It represents a revolutionary approach to LLM-first architecture with distributed intelligence, autonomous decision-making, and self-evolving workflows.

### Plugin Development Standards

**CRITICAL**: All Leviathan plugins MUST follow standardized development patterns:

- **Official Namespace**: `@lev-os/` (NOT @lev/ or @leviathan/)
- **Master Development Guide**: `plugins/@lev-os/PLUGIN_DEVELOPMENT_GUIDE.md`
- **Auto-Bootstrap Pattern**: Commands auto-discovered across CLI + MCP
- **MCP Protocol Compliance**: Follow MCP standards for tool integration
- **Testing Requirements**: Include comprehensive test coverage

**For Plugin Development**: Always start with `plugins/@lev-os/PLUGIN_DEVELOPMENT_GUIDE.md` - the single source of truth for all plugin creation.

## Architecture Overview

This is a multi-layered monorepo containing several interconnected systems:

- **`/agent`** - Core Leviathan agent system with MCP protocol implementation
- **`/os`** - AI-native operating system components and kernel research
- **`/plugins`** - Published @lev-os/* npm packages for the ecosystem
- **`/apps`** - Application layer (Next.js, Expo, auth-proxy)
- **`/tooling`** - Shared development tooling (ESLint, Prettier, TypeScript, Tailwind)
- **`/forge`** - Experimental features and prototypes
- **`/packages`** - Core shared packages and libraries
- **`/workshop`** - Research, evaluation, and development accelerators

## Development Environment

### Development Approach

**LLM-First Methodology**: Always ask "Can an LLM do this?" before writing code. Use prompts, context, and system patterns instead of traditional programming where possible.

**Maximum Extensibility Principle**: Design every component to be hackable. Others should be able to extend and modify the system without breaking core technical principles.

### Package Management
- **Primary**: `pnpm` (workspace-aware, required for monorepo)
- **Version**: pnpm@8.15.0 or later
- **Node**: 18.0.0 or later
- **Workspaces**: Includes `tooling/*` for shared development tools

### Core Commands

```bash
# Install all dependencies (monorepo-aware)
pnpm install

# Build all packages with dependency validation
pnpm build

# Run all tests with comprehensive coverage
pnpm test

# Development mode with bi-directional feedback loops
pnpm dev

# Lint all packages (maintains code quality)
pnpm lint

# Clean all build artifacts
pnpm clean
```

### Technical Standards in Development

Every development action should align with core technical principles:
- Optimize for developer experience and system performance
- Enable clear communication and understanding across components
- Preserve minimal dependencies and maximum autonomy
- Use LLM-first architecture (AI reasoning over rigid frameworks)

### Turborepo Configuration
The project uses Turborepo for build orchestration with dependency-aware caching:
- Tasks depend on upstream builds (`^build`, `^topo`)
- Outputs are cached (`.cache/`, `dist/`)
- Development tasks are persistent and uncached

## Agent System Architecture

### Core Components (`/agent`)

The Leviathan agent system implements a sophisticated MCP (Model Context Protocol) server with multi-tiered intelligence:

#### Key Entry Points
- **`src/index.js`** - Main MCP server with Universal Command Registry
- **`bin/lev`** - CLI interface for agent interaction
- **`src/ceo-binding.js`** - CEO agent binding with intent detection
- **`src/semantic-lookup.js`** - Semantic workflow discovery
- **`src/session-manager.js`** - Session continuity and checkpoints

#### Agent Commands
```bash
# Start the MCP server
cd agent && node src/index.js

# Development with hot reload
cd agent && npm run dev

# Test agent functionality
cd agent && npm test

# Build embeddings for semantic search
cd agent && npm run build:embeddings

# Test CEO binding system
cd agent && npm run test:ceo

# Run end-to-end tests
cd agent && npm run test:e2e
```

#### Available Commands
The system provides commands via Universal Command Registry including:
- `get_workflow` - Semantic workflow lookup
- `ceo_bind` - Agent switching and intent detection
- `session_ping` - Session checkpoints
- `intelligence_power` - Deep contextual analysis
- `network_intelligence` - Distributed intelligence access
- `template_sync` - Cross-workspace synchronization

**Architecture Note**: Commands are defined once in the Universal Command Registry, then auto-adapted by:
- **MCP Adapter**: Transforms commands into MCP tools for Claude Code integration
- **CLI Adapter**: Transforms commands into CLI commands for terminal usage
- **Future Adapters**: Can transform commands into any platform-specific format

### Session Management & Bi-Directional Communication

**Critical**: Always initialize with session loading to activate bi-directional communication:
```bash
lev load --session "your-session-id"
```

**Bi-Directional Flow Pattern**:
1. **Claude Code → Agent Call**: Use MCP tools to communicate intent
2. **Agent → System Response**: Agent provides workflow + callback instructions
3. **Claude Code → Execute**: Follow workflow with full autonomy
4. **Claude Code → Callback**: Report results and request next step
5. **Agent → Save & Guide**: Agent saves progress and provides next iteration

This pattern enables the **FlowMind meta-programming framework** where natural language instructions become executable workflows.

**Session Continuity**: The system maintains session state across multiple Claude Code tabs using unique session IDs, enabling quantum context entanglement across your development environment.

## Operating System Layer (`/os`)

### AI-Native Kernel Research (`/os/kernel`)

**Revolutionary Architecture**: World's first AI-controlled operating system where LLM serves as the decision engine, not just an assistant. Now enhanced with **JEPA 2 world model integration** for predictive intelligence and autonomous optimization.

#### Key Components
- **`src/main.go`** - Core Go-based system with cognitive parliament
- **`src/llm_providers.go`** - Multi-provider LLM routing (Ollama, Claude, OpenAI)
- **`src/leviathan_intelligence.go`** - AI-native decision engine
- **`src/flowmind_parser.go`** - Natural language instruction parser
- **`lev/_jepa.md`** - JEPA 2 self-learning plugin specification

#### Architecture Layers
1. **Layer 5**: **JEPA 2 World Model** - predictive intelligence and temporal reasoning
2. **Layer 4**: AI Decision Engine (TinyLlama) - autonomous optimization  
3. **Layer 3**: Verified Dynamic Extensions (eBPF) - AI-generated optimizations
4. **Layer 2**: Safe Plugin System (WASM) - portable drivers
5. **Layer 1**: Static Kernel Core (C + Go) - hardware abstraction

#### JEPA 2 Integration Capabilities
- **Predictive Computing**: Anticipates user needs and system requirements
- **Zero-Shot Adaptation**: Learns new patterns without explicit training  
- **Temporal Intelligence**: 4D reasoning across space, time, code, and context
- **Embodied Intelligence**: Physical-digital world understanding and control
- **Autonomous Optimization**: Self-managing systems with continuous improvement

#### Development Commands
```bash
# Start the AI-native system
cd os/kernel && go run .

# Build kernel components
cd os/kernel && go build .

# Test FlowMind parser
cd os/kernel && go test ./tests/
```

### Semantic Search System (`/os/agent`)

**Enterprise-grade semantic search** with 23,541+ indexed Go documentation entries:

```bash
# Start Qdrant (if not running)
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest

# Start search API
cd os/agent && python search_api.py

# Test semantic search
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "HTTP client server networking", "limit": 5}'
```

## Application Layer (`/apps`)

### Next.js Application (`/apps/nextjs`)
```bash
cd apps/nextjs
pnpm install
pnpm dev    # Start development server
pnpm build  # Production build
```

### Expo Application (`/apps/expo`)
```bash
cd apps/expo
pnpm install
npx expo install  # Install Expo dependencies
npx expo start    # Start development
npx expo run:ios  # iOS simulator
```

### Auth Proxy (`/apps/auth-proxy`)
```bash
cd apps/auth-proxy
pnpm install
pnpm dev    # Start proxy server
```

## Plugin Development (`/plugins`)

Plugins are published as `@lev-os/*` packages following YAML-first, LLM-native architecture:
- **@lev-os/protocol** - MCP kernel protocol implementation
- **@lev-os/ai-core** - LLM integrations and reasoning
- **@lev-os/memory** - Unified memory system interface
- **@lev-os/agent** - Agent creation framework
- **@lev-os/jepa-learning** - JEPA 2 self-learning plugin (planned)

### JEPA 2 Self-Learning Plugin (`/plugins/@lev-os/jepa-learning`)

**Revolutionary AI Plugin**: First production implementation of JEPA 2 world models in an operating system context.

#### Core Capabilities
- **Predictive Modeling**: Anticipate system states and user workflows
- **Zero-Shot Learning**: Adapt to new patterns without explicit training
- **Temporal Reasoning**: 4D understanding of space, time, code, and context
- **Autonomous Optimization**: Self-improving system performance
- **Embodied Intelligence**: Physical-digital environment integration

#### Plugin Architecture
```
@lev-os/jepa-learning/
├── config/plugin.yaml           # YAML-first configuration
├── src/core/jepa-engine.js     # JEPA 2 world model integration
├── src/learning/               # Self-supervised learning systems
├── src/integration/            # Leviathan ecosystem adapters
└── models/                     # Pre-trained JEPA 2 models
```

#### Integration Points
- **Semantic Search**: Leverages existing Qdrant infrastructure (23,541+ indexed docs)
- **Universal Debugging**: Integrates with `@lev-os/debug` framework
- **YAML Workflows**: LLM-first behavior definition and execution
- **Hexagonal Architecture**: Compatible with ongoing architectural patterns

```bash
# Install plugin dependencies
cd plugins/@lev-os/protocol && pnpm install

# Build plugin
pnpm build

# Test plugin
pnpm test
```

## Memory Systems Architecture

The project implements a unified memory architecture connecting multiple backends:

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

Required services:
- Neo4j: localhost:7687
- Qdrant: localhost:6333
- Redis: localhost:6379 (optional)

## Testing Strategy

### Agent System Tests
```bash
cd agent

# Core integration tests
npm run test:core

# CEO binding system
npm run test:ceo

# Session management
npm run test:components

# Workflow validation
npm run test:workflows

# End-to-end testing
npm run test:e2e

# Smoke tests
npm run test:smoke
```

### Operating System Tests
```bash
cd os/kernel

# FlowMind parser tests
go test ./tests/

# System integration
./test_system.sh

# BDD workflow validation
go test -tags=bdd
```

## Development Workflow

### Development Patterns

**LLM-First Architecture Principles**:
1. **Always ask "Can an LLM do this?"** before writing code
2. Use prompts and context instead of traditional programming where possible
3. Implement confidence-based task routing (80% threshold for task splitting)
4. Design for autonomous operation and self-improvement
5. **Maximum Extensibility**: Make everything hackable for the community
6. **Bi-Directional Communication**: Enable LLM ↔ System feedback loops

**Technical Validation**: Every component must align with core technical principles and maintain:
- **Performance**: Optimize for speed and resource efficiency
- **Extensibility**: Preserve autonomy and hackability
- **Clarity**: Simplify complexity, don't add unnecessary complications

**FlowMind Integration**: Natural language instructions should translate into executable workflows through the bi-directional communication architecture.

### Linux of AI Philosophy

**Maximum Extensibility**: Leviathan is designed as the "Linux of AI" - a foundational platform that anyone can hack, extend, and modify:

**Core Extensibility Principles**:
- **Plugin Architecture**: Everything is a plugin that can be replaced or extended
- **Technical Standards**: Extensions must align with core technical principles but can innovate freely
- **Context Integration**: Your extensions automatically benefit from the advanced context system
- **Bootstrap Sovereignty**: Extensions should work with minimal dependencies
- **Community Hackability**: Documentation and architecture designed for third-party innovation

**How to Hack Leviathan**:
1. **Fork Technical Framework**: Take the core patterns and extend them for your needs
2. **Extend Agent System**: Add new MCP tools and capabilities
3. **Build on Context Engine**: Leverage advanced context management for your applications
4. **Contribute Back**: Share innovations that maintain technical standards

**World Models Integration**: Design for the coming wave of LLMs with world models - Leviathan provides the structural foundation for these advanced capabilities.

### Session Continuity
- Each Claude Code tab gets a unique session ID
- Use `lev load --session "id"` to restore context
- Create checkpoints with `lev ping --context "current work"`
- Generate session rollups for handoffs between tabs

### Debugging and Monitoring
```bash
# Check agent logs
tail -f agent/logs/ultimate_mcp_server.log

# Monitor OS kernel
cd os/kernel && go run . --verbose

# View semantic search stats
curl http://localhost:8000/health
```

## Environment Setup

### Required Environment Variables
```bash
# LLM Providers
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
OLLAMA_URL=http://localhost:11434

# System Configuration
WEB_API_URL=http://localhost:3000
DRY_RUN=false

# Database connections (for memory systems)
NEO4J_URI=bolt://localhost:7687
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379
```

### Docker Services
```bash
# Start required services
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
docker run -d --name neo4j -p 7687:7687 -p 7474:7474 neo4j:latest
docker run -d --name redis -p 6379:6379 redis:latest
```

## Integration Patterns

### Claude Code Integration
The system is specifically designed for Claude Code with:
- MCP protocol implementation for tool access
- Session management across multiple tabs
- Automatic context preservation and restoration
- Hot-reload development support

### Cross-Workspace Intelligence
- Templates synchronize across workspaces using `template_sync`
- Intelligence patterns propagate via `network_intelligence`
- Session data persists across agent instances
- Workflow combinations discovered through semantic search

## Important Warnings

1. **Experimental Research**: This is a high-risk R&D project exploring AI-native operating systems
2. **Resource Intensive**: Requires significant computational resources and expert knowledge
3. **Active Development**: Architecture and APIs change frequently
4. **Memory Requirements**: Vector embeddings and multi-modal memory systems require substantial RAM

## Troubleshooting

### Common Issues
- **MCP Connection Failed**: Ensure agent is running with `cd agent && npm run dev`
- **Semantic Search 404**: Start Qdrant and run `cd os/agent && python search_api.py`
- **Session Not Found**: Use `lev load --session latest` or initialize with `lev ping`
- **Build Failures**: Clear caches with `pnpm clean` and rebuild with `pnpm build`

### Performance Optimization
- Enable MCP tool caching for repeated operations
- Use semantic search for workflow discovery instead of manual lookup
- Leverage session checkpoints to avoid context loss
- Monitor memory usage when running multiple LLM providers

---

*The Leviathan ecosystem: Pioneering AI-native computing architecture - sponsored by Kingly Agency*