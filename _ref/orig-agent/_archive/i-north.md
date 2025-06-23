# Kingly Agent Development Tasks

## 🌟 NORTHSTAR: Context-Aware Project Management
**The Vision**: "Capture these 3 efforts to v1 kingly dev project" → Instantly organized tasks with full context

### The Life-Changing Workflow
```
You: "Capture decision matrix, plugin architecture, and drift prevention to kingly-v1 project"

Kingly: 
✅ Created 3 tasks in kingly-v1 project:
  - TASK-001: Decision Matrix Framework (planning)
    └── decision-matrix-discussion.md (full context from our chat)
  - TASK-002: Plugin Architecture (planning) 
    └── plugin-boundaries.md (JS vs LLM decisions captured)
  - TASK-003: Agent Drift Prevention (planning)
    └── drift-analysis.md (problem + solutions documented)

You: "Switch to workspace-pm project"

Kingly: 
📊 Workspace PM: 3 new planning tasks ready for review
Each with complete context, no information lost!
```

## 🎯 Current Goal: Implement Workspace/Project Foundation
Progress: [🟩⬜⬜⬜⬜] 20% - Design complete, implementation needed

### What This Enables
- Capture complex discussions as organized tasks
- Each task gets YAML (structure) + MD (context/history)  
- Switch between projects without losing context
- Natural workspace boundaries (backend, frontend, research)
- Tasks live in: `~/.kingly/workspaces/{workspace}/{project}/tasks/`

### Implementation Plan
1. **Workspace/Project MCP Tools**
   - create_workspace({ name, path })
   - discover_projects({ workspace })
   - create_project({ workspace, name })
   - set_context({ workspace, project })

2. **Enhanced Task Creation**
   - capture_discussion({ content, project, title })
   - Auto-generates task YAML + context MD
   - Preserves full conversation context
   - Links related discussions

3. **Context Management**
   - Project-scoped memory
   - Task relationships
   - Discussion threading

## Next Actions (Prioritized)

### 1. Build Workspace/Project Foundation

#### Core MCP Tools Needed
```javascript
// Workspace management
create_workspace({ name: "kingly-dev" })
discover_workspaces({ path: "~/" })
set_workspace({ name: "kingly-dev" })

// Project management  
create_project({ workspace: "kingly-dev", name: "v1-core" })
discover_projects({ workspace: "kingly-dev" })
set_project({ workspace: "kingly-dev", project: "v1-core" })

// Context management
get_current_context() // Returns { workspace, project }
```

#### The Human-Like Delegation Workflow
User: "Save all this" (lazy/tired mode)
→ LLM analyzes conversation for key topics, decisions, insights
→ Proposes 2-3 task organization options
→ Creates self-contained tasks with complete context
→ Asks: Continue here or switch projects?

#### Context Capture Protocol
Context = "All key insights, decisions, code examples, and necessary information to complete this task in isolation during a future session with NO knowledge of current chat history"

Tasks must be completely self-contained for future execution.

#### Task Relationships (Simple)
- `blocked_by`: Critical for sequencing
- `relates_to`: Helpful for context
- NO supersedes, conflicts, dependencies - projects/workspaces handle organization

#### LLM Analysis Prompts (Not JS Functions)

**Conflict Detection:**
```
ANALYZE: Review existing tasks in this project for conflicts with: [new task]
Look for contradictory approaches, duplicate work, incompatible decisions.
Present options: update conflicting task, merge tasks, mark superseded, create decision task.
```

**Lazy Mode Analysis:**
```
CONVERSATION ANALYSIS: User said "save all this"
Review last X minutes for: key topics, decisions made, code examples, insights, action items.
Organize into logical tasks. Present 2-3 task organization approaches if multiple options exist.
```

**Task Relationships:**
```
RELATIONSHIP ANALYSIS: For this new task, identify:
- BLOCKED_BY: What must complete before this can start?  
- RELATES_TO: What tasks work in same domain/context?
Review all project tasks and suggest relationships.
```

**Project Health Check:**
```
PROJECT HEALTH CHECK: Analyze all tasks for:
- DUPLICATES: Multiple tasks doing same work
- CONFLICTS: Tasks with contradictory goals  
- STALE: Tasks based on outdated assumptions
- GAPS: Missing dependencies
Present issues with suggested resolutions.
```

#### The Problem We're Solving
Look at internal/ folder - 25+ scattered files with overlapping ideas, no clear ownership, hard to find decisions, context everywhere. We're building the automated part of project management brain.

### 2. Implement Centralized .kingly Structure
```
~/.kingly/
├── config.yaml                    # Global Kingly settings
├── registry.json                  # Workspace/project registry
├── workspaces/
│   ├── kingly-dev/                # Workspace directory
│   │   ├── workspace.json         # Workspace metadata
│   │   ├── v1-core/               # Project directory
│   │   │   ├── project.json       # Project metadata
│   │   │   ├── tasks/             # Task files
│   │   │   │   ├── TASK-001.json  # Task structure
│   │   │   │   ├── TASK-001.md    # Complete context
│   │   │   │   ├── TASK-002.json
│   │   │   │   └── TASK-002.md
│   │   │   └── memory/            # Project-scoped memory
│   │   └── research/              # Another project
│   └── client-work/               # Another workspace
└── global-memory/                 # Cross-workspace knowledge
```

### 3. Test Implementation by Using It

**Phase 1: Build Core Tools**
- Workspace/project MCP tools
- Basic task creation with context
- Simple relationships (blocked_by, relates_to)

**Phase 2: Test Lazy Mode**
- Try "save all this" workflow
- Test context capture quality
- Refine LLM analysis prompts

**Phase 3: Test at Scale**  
- Multiple workspaces/projects
- Task relationship management
- Project health checks
- Context switching workflow

### 4. Success Metrics
- Can say "save all this" and get well-organized tasks
- Context is truly self-contained for future sessions
- Easy switching between projects without losing context
- No more scattered ideas in random files
│   │   └── research/
│   └── client-work/
└── registry.json
```

### 3. Add Context Capture Tools
- Extract conversation segments
- Auto-generate task context
- Link related discussions
- Preserve decision rationale

## Completed Features ✅

### Spawn Architecture
- Process management with log streaming
- Docker spawn adapter with simulation  
- Hot reload MCP server
- Background monitoring integration

### Decision Framework
- Decision Matrix Protocol (i-swot.md)
- Plugin architecture decisions
- Agent drift analysis
- Docker spawn adapter with simulation fallback
- Process registry that persists across restarts
- MCP tools integration (removed verbose mode)
- Efficient log handling (return paths, not content)

### 2. Create Agent Registry/Catalog System
- [ ] Design agent manifest format (capabilities, version, dependencies)
- [ ] Build agent discovery service
- [ ] Implement dynamic agent loading
- [ ] Create agent search/query tools
- [ ] Add version management

### 3. Enable Kingly Agent Hot-Reload as MCP ✅
- [x] Update start-kingly-mcp.js for development mode
- [x] Configure nodemon for proper MCP restart
- [x] Create HotReloadManager for live updates
- [x] Add hot reload support to MCP server
- [x] Create npm scripts (dev:hot, dev:restart)
- [x] Document development workflow

**What we built:**
- Hot reload mode - Agent/module changes without dropping connections
- Restart mode - Traditional nodemon for structural changes
- Process-based architecture using our ProcessAdapter
- Demo script showing hot reload in action

**To use:**
```bash
npm run dev:hot      # Hot reload mode (recommended)
npm run dev:restart  # Full restart mode
npm run mcp:status   # Check server status
npm run mcp:stop     # Stop server
```

### 4. Build Background Monitoring Dashboard
- [ ] Design real-time status UI
- [ ] Implement log streaming viewer
- [ ] Add task progress visualization
- [ ] Create agent communication history
- [ ] Deploy as web interface

### 5. Implement Agent Communication Patterns
- [ ] Design agent-to-agent handoff protocol
- [ ] Build shared context/memory system
- [ ] Enable result passing between agents
- [ ] Support parallel agent coordination
- [ ] Create communication examples

## 🏗️ **NEW: PORTS & ADAPTERS ARCHITECTURE PLAN**

### **Implementation Strategy**

#### **Phase 1: Foundation Refactor** 
**Goal**: Reorganize current working code into proper ports & adapters structure

```
src/
├── domain/                     # Pure business logic (no external deps)
│   ├── workspace/             # Workspace entity & validation rules
│   ├── tasks/                 # Task confidence & lifecycle rules  
│   ├── agents/                # Agent routing & delegation logic
│   └── protocols/             # Communication rules (agent:// parsing)
│
├── ports/                     # Interfaces (contracts only)
│   ├── workspace-management.js # Primary - how external systems drive us
│   ├── persistence.js         # Secondary - storage needs
│   ├── agent-communication.js # Secondary - agent:// needs
│   ├── background-execution.js # Secondary - spawn/process needs
│   └── project-discovery.js   # Secondary - crawler needs (Phase 3)
│
├── adapters/                  # External integrations
│   ├── primary/               # External systems → Our app
│   │   ├── mcp-server.js      # Current: MCP tools → business logic
│   │   ├── web-server.js      # Phase 3: HTTP endpoints → business logic
│   │   └── cli-interface.js   # Future: CLI commands → business logic
│   └── secondary/             # Our app → External systems
│       ├── json-storage.js    # Current: Business logic → JSON files
│       ├── agent-protocol.js  # Current: Business logic → agent:// URLs
│       ├── spawn-manager.js   # Current: Business logic → Docker/processes
│       └── project-crawler.js # Phase 3: Business logic → file system
│
├── application/               # Use cases & orchestration
│   ├── workspace-onboarding.js # CEO analysis → agent onboarding flow
│   ├── task-decomposition.js   # Confidence assessment → splitting flow
│   ├── agent-routing.js        # LLM-driven agent selection
│   └── spawn-coordination.js   # Background task management
│
└── infrastructure/            # Wiring & startup
    ├── server.js              # Main entry point
    ├── config.js              # Configuration management
    └── dependency-injection.js # Wire adapters to ports
```

#### **Migration Plan**
1. **Keep current structure working** (don't break anything)
2. **Create new structure in parallel** 
3. **Move files incrementally** (preserve git history)
4. **Update imports** as we go
5. **Test each migration step**

#### **Key Benefits**
- **Phase 3 Web GUI**: Add WebAdapter, zero domain changes
- **Future CLI**: Add CLIAdapter, zero domain changes  
- **Storage evolution**: Swap JSON → SQL, zero domain changes
- **Multiple interfaces**: MCP + Web + CLI + API simultaneously

### **Next Actions: Architecture + Dev Tooling**

#### **1. Continue MCP Tool Development** 🔄 **IN PROGRESS**
- Complete workspace/project MCP tools implementation
- Add enhanced task creation with context capture
- Implement "save all this" lazy mode workflow
- Test context-aware project management vision

#### **2. Fix Development Environment** ⚠️ **NEEDS ATTENTION**
Current issues preventing smooth development:

**Hot Reload Issues:**
- Tool registry not loading workspace tools properly
- Integration between hot reload and MCP server incomplete  
- Need clean development workflow

**Standalone Server Problems:**
- Reference errors in mcp-server-standalone.js
- Tool registration not working correctly
- Need reliable standalone testing

**Required Tasks:**
```javascript
// Fix standalone server
fix_standalone_mcp_server: {
  issues: [
    "Reference error: 'agent' should be 'kinglyAgent'",
    "Tool registration not wiring to actual tool list", 
    "Agent protocol tools not exposed to MCP interface"
  ],
  priority: "HIGH - blocks development workflow"
}

// Complete hot reload system  
complete_hot_reload: {
  issues: [
    "Tool registry loading but tools not accessible",
    "Workspace tools failing with 'not a function' errors",
    "Need integration testing between hot reload and tools"
  ],
  priority: "HIGH - needed for iterative development"
}

// Clean development workflow
establish_dev_workflow: {
  goals: [
    "npm run dev:hot → working MCP server with tool access",
    "File changes → immediate reflection without restart", 
    "npm run test → validate all tools working",
    "Clear debugging when things break"
  ],
  priority: "MEDIUM - quality of life"
}
```

#### **3. Discussion Topics** 💬 **NEEDS DECISION**

**Architecture Questions:**
- Should we start ports & adapters refactor now or after MCP tools complete?
- Keep current 23-file structure vs migrate to organized structure?
- Timeline for Web GUI development (affects architecture decisions)

**Development Process:**
- Hot reload vs restart mode for development?
- Testing strategy for MCP tools?
- How to validate tool integrations work correctly?

**Implementation Priorities:**
- Complete workspace/project vision first?
- Fix development tooling first?  
- Start architectural refactor in parallel?

### **Success Metrics**
- **Development**: `npm run dev:hot` → working server + tools
- **Architecture**: Clean separation ready for Web GUI phase
- **Vision**: "Save all this" workflow demonstrably working
- **Quality**: Hot reload enables rapid iteration

## History
- ✅ Implemented agent:// protocol for spawn URLs
- ✅ Created unified spawn adapter system
- ✅ Built process management (ProcessAdapter)
- ✅ Added Docker container support (DockerSpawnAdapter)
- ✅ Integrated background monitoring
- ✅ Implemented efficient log streaming (no verbose mode)
- ✅ Created MCP tools for process control
- ✅ **NEW**: Hot reload MCP server implementation
- ✅ **NEW**: Ports & adapters architecture planning

## Key Decisions
- Spawn system automatically chooses Docker vs lightweight based on task needs
- "Never bog down MCP response" - return log paths, not content
- Process registry persists across restarts
- Context passed via environment variables for Docker spawns
- Agents use Read tool for full log access
- **NEW**: Ports & adapters pattern chosen for multi-interface future (MCP/Web/CLI/API)
- **NEW**: Development environment needs fixing before proceeding

## Memory/Patterns
- Docker spawns: Full isolation for autonomous tasks
- Lightweight spawns: Dev servers, builds, local processes
- Background monitoring: All spawns report to monitoring service
- Log strategy: Return metadata in MCP, let agents read as needed
- **NEW**: Domain logic stays pure, adapters handle external integration
- **NEW**: Single business logic serves multiple interfaces