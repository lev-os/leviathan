# 📋 KINGLY-AGENT SPECIFICATION PLAN

*Clean, consistent specifications with resolved architecture*

## 🏗️ **ARCHITECTURE FOUNDATION**

**Read [`architecture.md`](./architecture.md) FIRST** - Unified design that resolves all conflicts

**Core Principles:**
1. **MCP as Intelligence Nexus** - Self-contained responses with complete context
2. **Filesystem as Truth** - All state persisted, no in-memory dependencies
3. **LLM-First Design** - JavaScript provides data, LLM provides logic
4. **Confidence-Driven** - 80% threshold, recursive splitting
5. **Hierarchical Organization** - Workspace > Project > Task

## 📁 **DOMAIN SPECIFICATIONS**

### **🏗️ Core Architecture** (Foundation - Implement First)
- [`workspace-structure.md`](./domains/core-architecture/workspace-structure.md) - Working directory organization
- [`project-structure.md`](./domains/core-architecture/project-structure.md) - Project logical groupings  
- [`task-structure.md`](./domains/core-architecture/task-structure.md) - Dual YAML+MD task files
- [`mcp-nexus.md`](./domains/core-architecture/mcp-nexus.md) - Dynamic context assembly

### **🤖 Agent System** (Second Priority)
- [`agent-system.md`](./domains/agent-system/agent-system.md) - YAML agents + interactive checklists
- [`agent-schema.md`](./domains/agent-system/agent-schema.md) - Agent definition format

### **🧠 Intelligence** (Third Priority)  
- [`confidence-system.md`](./domains/intelligence/confidence-system.md) - 80% threshold + recursive splitting
- [`fallback-behavior.md`](./domains/intelligence/fallback-behavior.md) - Uncertainty handling

### **⚙️ System Operations** (Fourth Priority)
- [`spawn-system.md`](./domains/system-operations/spawn-system.md) - Background process management
- [`audit-trail.md`](./domains/system-operations/audit-trail.md) - Decision logging + debugging

### **🚀 Future Vision** (Long-term Goals)
- [`northstar-vision.md`](./future-vision/northstar-vision.md) - 30min idea→product + democratization

## 🔄 **IMPLEMENTATION WORKFLOW**

1. **Architecture Review** ✅ DONE - Conflicts resolved, clean design
2. **Spec Audit** 🔄 NEXT - Verify all specs align with architecture  
3. **Implementation Gap Analysis** - Compare actual code vs specs
4. **Test Case Generation** - AC format → direct test cases
5. **Implementation** - Fill gaps, fix inconsistencies

## 🧪 **TESTING STRATEGY**

**Acceptance Criteria → Test Cases**: Direct translation using Given/When/Then format
- **Unit Tests**: Business logic, validation, data structures  
- **Integration Tests**: Component interaction, MCP tools, file operations
- **E2E Tests**: Complete workflows, user scenarios

## ✅ **ARCHITECTURE HEALTH CHECK**

- ✅ **Workspace = Working Directory** (single workspace per directory)
- ✅ **Agent Context ≠ Memory** (context files loaded on demand)  
- ✅ **Task Files = Single Truth** (YAML business contract + MD implementation)
- ✅ **MCP Self-Contained** (every response includes complete context)
- ✅ **Confidence Integration** (stored in YAML, triggers splitting)
- ✅ **Clear Hierarchy** (workspace/projects/tasks clean boundaries)

**Status**: Architecture unified, ready for spec validation and implementation audit.