# i-seedadr: Architectural Decision Record

*Post-discussion decisions from i-seed analysis*

## 🎯 **Major Architectural Decisions Made**

### **1. Hexagonal Architecture (Ports & Adapters)**
**Decision**: Implement ports and adapters pattern for universal agent access
**Rationale**: 
- Any agent following specs automatically available via 4 interfaces (LLM/CLI/MCP/API)
- Clean separation between core business logic and interface concerns
- Pluggable agent ecosystem with standardized interfaces

**Architecture**:
```
Core System (Orchestration + Workflow + PM + Memory + Evolution)
    ↓ Agent Specs Interface
Agent Registry (CEO/DEV/Synthetic/Any Agent Following Specs)
    ↓ Port Layer
LLM Port | CLI Port | MCP Port | API Port
    ↓ Adapter Layer
Claude Code | Terminal | Claude Desktop | HTTP Clients
```

### **2. Core System Consolidation**
**Decision**: Merge agent-cli + agent-mcp + kingly-agent into unified system
**Rationale**:
- agent-cli: CLI interface for non-agentic users + capability registry
- agent-mcp: MCP protocol + process management + persistence
- kingly-agent: Self-evolution + synthetic factory + proven CEO/DEV workflow

**Keep Our Proven Components**:
- ✅ TagSoup + Enhanced Orchestrator (proven LLM routing)
- ✅ CEO → DEV handoffs (validated in real work)
- ✅ Synthetic agent factory (on-demand specialists)
- ✅ Self-build capability (recursive improvement)

**Extract Valuable Components**:
- ✅ Capability registry (declarative system from agent-cli)
- ✅ LLM adapters (Claude + Gemini support from agent-cli)
- ✅ MCP server (protocol implementation from agent-mcp)
- ✅ Process management (real execution from agent-mcp)### **3. Testing Architecture**
**Decision**: Triple-mode validation for comprehensive testing
**Testing Strategy**:
- **Claude Code** (Agent Mode): Rapid prototyping + workflow development
- **Claude Desktop** (MCP Integration): E2E MCP testing + bi-directional routing
- **Terminal CLI** (Direct Mode): Non-LLM users + performance testing

### **4. Agent Specification Interface**
**Decision**: Standardized agent interface for pluggable ecosystem
```javascript
class AgentSpec {
  async handle(request, context) // Required: core functionality
  async canHandle(request, context) // Optional: routing hint
  async getCapabilities() // Optional: capability discovery
  async evolve(feedback) // Optional: self-improvement
}
```

### **5. Core vs Bundling Strategy**
**Decision**: Large core bundle with comprehensive defaults
**Components**:
- **Core Agents**: CEO (executive reasoning) + DEV (technical execution)
- **Infrastructure**: Orchestration + Workflow + PM + Memory + Evolution
- **Synthetic Factory**: On-demand specialist creation
- **Multi-Interface**: Automatic availability via LLM/CLI/MCP/API

**Rejected**: Minimal seed approach (too slow for production use)

### **6. Orchestration Strategy**
**Decision**: Keep our proven LLM-based orchestration as primary
**Primary Flow**: TagSoup Router → Enhanced Orchestrator → CEO/DEV agents
**Enhancements**: Add capability registry from agent-cli for declarative system## 🔍 **Resolved from Original i-seed Questions**

### ✅ **Architecture Decisions**
- ~~Single system vs modular~~: **Large core system with pluggable agents**
- ~~Distribution strategy~~: **Multiple interfaces (LLM/CLI/MCP/API)**
- ~~Integration approach~~: **All interfaces supported via ports & adapters**

### ✅ **Technical Decisions**
- ~~Code portability~~: **Extract capability registry + LLM adapters + MCP server**
- ~~Quality thresholds~~: **Keep 77.8% self-build success (proven)**
- ~~Rollback strategy~~: **Agent versioning via evolution engine**

### ✅ **Bundling & Discovery**
- ~~Distribution~~: **NPM package + Docker + MCP server**
- ~~Discovery~~: **Capability registry + synthetic agent creation**
- ~~Packaging~~: **Unified binary with multiple entry points**
- ~~Versioning~~: **Evolution engine tracks agent generations**
- ~~Integration~~: **All interfaces: Claude Code, Claude Desktop, Terminal, HTTP**

## 🚀 **Updated Implementation Plan**

### **Phase 1: Structure Migration** (Current Session)
- [x] ~~Audit existing code across all projects~~ ✅
- [x] ~~Decide what to keep/port/discard~~ ✅  
- [x] ~~Create unified architecture plan~~ ✅
- [x] ~~Define packaging strategy~~ ✅
- [ ] **Execute folder consolidation** ← NEXT
- [ ] **Implement hexagonal architecture**

### **Phase 2: Core Implementation** (Next Session)
- [ ] Merge orchestration systems (keep ours + enhance with agent-cli patterns)
- [ ] Upgrade mini-agents to full CEO/DEV agents
- [ ] Implement standardized agent specification interface
- [ ] Create universal port layer (LLM/CLI/MCP/API)

### **Phase 3: Validation** (Following Session)
- [ ] Test via Claude Code (agent mode)
- [ ] Test via Claude Desktop (MCP integration)
- [ ] Test via Terminal (CLI mode)
- [ ] Validate self-evolution with new architecture

## 📝 **Outstanding Questions**

### **Agent Forge Integration**
- Where does agent builder/forge fit in hexagonal architecture?
- How do created agents auto-register in the system?

### **Synthetic Agent Promotion**
- How does synthetic → permanent agent promotion work?
- What are promotion criteria beyond usage/success metrics?

### **Memory & Context**
- How do we integrate workspace-manager with agent-cli context patterns?
- What's the unified context model across all interfaces?

---

**Status**: Major architectural decisions complete. Ready for implementation phase.
**Next**: Execute folder consolidation and begin hexagonal architecture implementation.