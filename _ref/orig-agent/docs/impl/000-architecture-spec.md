# Implementation Ticket: 000 - Architecture Specification

## 📋 Overview
Defines the core architectural patterns and structure for Kingly's implementation, preserving the excellent hexagonal architecture while integrating our universal context vision.

## 🏗️ Architecture Pattern: Hexagonal (Ports & Adapters)

### Core Principles
1. **Domain Independence** - Business logic has zero external dependencies
2. **Port Interfaces** - Clear contracts for what the application needs
3. **Adapter Implementation** - Concrete implementations of ports
4. **Single Wiring Point** - dependency-injection.js is the ONLY place that knows implementations
5. **Inversion of Control** - Domain/Application never imports infrastructure

### Layer Structure

```
src/
├── domain/                   # Pure business logic (no external deps)
│   ├── entities/            # Core business entities
│   │   ├── context.js       # NEW: Universal context entity
│   │   ├── workspace.js     # KEEP: Enhanced with context
│   │   ├── task.js          # KEEP: Enhanced with context
│   │   └── agent.js         # NEW: Nano-agent entity
│   ├── services/            # Domain services
│   │   ├── intent-classifier.js  # KEEP: Enhanced
│   │   └── context-inheritance.js # NEW: Context logic
│   └── value-objects/       # Immutable values
│       └── intent-type.js   # NEW: Intent type enum
│
├── application/             # Use case orchestration
│   ├── workspace-service.js # KEEP: Enhanced
│   ├── context-service.js   # NEW: Context operations
│   ├── workflow-executor.js # NEW: Workflow engine
│   ├── agent-coordinator.js # NEW: Agent orchestration
│   └── memory-service.js    # NEW: Memory operations
│
├── ports/                   # Interface definitions
│   ├── persistence.js       # KEEP: Storage interface
│   ├── agent-communication.js # KEEP: Enhanced
│   ├── background-execution.js # KEEP: For workflows
│   ├── llm-adapter.js       # NEW: LLM interface
│   ├── memory-store.js      # NEW: Memory interface
│   └── context-resolver.js  # NEW: Context interface
│
├── adapters/
│   ├── primary/            # Driven by external systems
│   │   ├── mcp-adapter.js  # KEEP: Main MCP interface
│   │   └── http-adapter.js # Future: REST API
│   └── secondary/          # Drive external systems
│       ├── json-storage.js # KEEP: File storage
│       ├── llm-openai.js   # NEW: OpenAI adapter
│       ├── vector-db.js    # NEW: Memory storage
│       └── agent-registry.js # NEW: Agent management
│
├── infrastructure/
│   ├── dependency-injection.js # KEEP: Central wiring
│   ├── server.js              # KEEP: Entry point
│   └── config.js              # NEW: Configuration
│
└── index.js                   # KEEP: Package entry
```

## 🔄 What We Keep vs Archive

### KEEP (Move to new src/):
```yaml
Core Architecture:
  - domain/workspace.js → Enhance with context
  - domain/task.js → Enhance with context  
  - application/workspace-service.js → Enhance
  - ports/*.js → All port interfaces
  - adapters/secondary/json-storage.js → Clean example
  - infrastructure/dependency-injection.js → Perfect as-is
  - Hexagonal architecture pattern → Foundation

Key Patterns:
  - Constructor injection everywhere
  - Port interfaces for all external deps
  - Single wiring point
  - Domain event patterns
  - Intent classification
```

### ARCHIVE (Move to src-archive/):
```yaml
Duplicates/Legacy:
  - mcp-server.js (root) → Duplicate
  - *-mcp-tools.js files → Consolidate into adapter
  - *-integration.js files → Refactor into adapters
  - Experimental features → hot-reload, etc
  - Dead code paths → Unused integrations
```

## 🎯 Integration Strategy

### Phase 1: Core Structure
1. Archive current src/ → src-archive/
2. Create new src/ with clean structure
3. Copy ONLY the keeper files
4. Set up base infrastructure

### Phase 2: Universal Context
1. Implement context entity as core domain model
2. Everything inherits from context
3. Workspace, Task, Agent all become context types
4. Maintain existing port/adapter boundaries

### Phase 3: Enhanced Capabilities
1. Add new ports for LLM, memory, etc
2. Implement adapters for each
3. Enhance services with context awareness
4. Maintain backwards compatibility at adapter level only

## 🚀 Key Architectural Decisions

### AD-001: Everything is a Context
- All entities extend base Context class
- Enables universal behavior inheritance
- Simplifies mental model

### AD-002: Ports for All External Dependencies
- No direct external imports in domain/application
- All capabilities defined as ports
- Multiple adapters can implement same port

### AD-003: LLM as First-Class Dependency
- LLM operations abstracted behind port
- Enables testing with mock LLM
- Allows swapping LLM providers

### AD-004: Memory as Infrastructure
- Memory/learning abstracted to port
- Can use simple JSON or vector DB
- Domain doesn't know storage details

## 📝 Migration Plan

```bash
# Step 1: Archive existing
mv src/ src-archive/

# Step 2: Create new structure
mkdir -p src/{domain/{entities,services,value-objects},application,ports,adapters/{primary,secondary},infrastructure}

# Step 3: Copy keepers with enhancements
# (Copy files maintaining structure)

# Step 4: Implement new components following tickets 001-016
```

## ✅ Success Criteria
- Clean hexagonal architecture maintained
- No backwards compatibility debt
- All components follow port/adapter pattern
- Universal context system integrated seamlessly
- Zero coupling between layers

## 🔧 Enforcement Rules
1. Domain imports NOTHING external
2. Application imports only domain and ports
3. Adapters import ports (not each other)
4. Infrastructure wires everything together
5. Use linting to enforce boundaries

This architecture provides the perfect foundation for our universal context system while maintaining the excellent patterns already in place.