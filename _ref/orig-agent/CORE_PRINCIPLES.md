# Kingly Agent Core Principles

**Architectural Decision Record - Immutable Design Principles**

## 🎯 **Primary Philosophy**

### **"Can an LLM do this?"**
- If YES → Don't write JavaScript for it
- If NO → Provide minimal MCP tools for LLM access
- **Corollary**: Never replicate LLM capabilities in code

### **Bidirectional Flow Pattern**
```
LLM → MCP → Kingly → MCP → LLM → MCP → Kingly → ...
```
- LLM drives all decisions using native intelligence
- MCP provides conversation protocol
- Kingly provides infrastructure and persistence
- Continue until task confidence ≥ 80% and execution complete

### **MCP as Intelligence Nexus** ⭐ NEW
**Decision**: MCP is the central point for ALL instruction patching and audit logging
**Rationale**: Discovered through v1→v2 development - MCP responses can dynamically inject context
**Implementation**:
- MCP tools assess confidence AND provide splitting instructions
- MCP responses include audit logging directives
- MCP becomes the "OS layer" for agent intelligence
- No static prompts - all instructions flow through MCP

**Key Insight**: This pattern led directly to Kingly OS v2 concept - if MCP can inject instructions dynamically, why have static prompts at all?

## 📐 **Architectural Decisions**

### **1. LLM-First Design**
**Decision**: All intelligence lives in LLM, not JavaScript
**Rationale**: 
- LLMs are better at complexity assessment than hardcoded algorithms
- Natural language reasoning > programmatic logic
- Flexibility and adaptability > rigid rules

**Implementation**:
- ❌ No JavaScript confidence algorithms
- ❌ No hardcoded routing logic  
- ❌ No vocabulary lists or pattern matching
- ✅ MCP tools for data access and persistence
- ✅ YAML agent definitions for LLM consumption
- ✅ LLM handles routing, splitting, execution decisions

### **2. Confidence Thresholds**
**Decision**: Tasks must achieve sufficient confidence before execution
**Rationale**: Balance between over-decomposition and under-preparation
**Implementation**:
- **95% (0.95)** - High confidence, ready for immediate execution
- **90% (0.90)** - Good confidence, suitable for experienced developers
- **85% (0.85)** - Acceptable with light research during implementation
- `assess_task_confidence()` - LLM rates 0-1 confidence
- `split_task()` - Automatic splitting when below threshold
- Recursive splitting with configurable threshold
- No execution bypass for low-confidence tasks

### **3. Minimal Infrastructure**
**Decision**: Provide data and persistence, not logic
**Rationale**: Keep codebase small, maintainable, and focused
**Implementation**:
- Core: 718 lines total (vs 2000+ simulation)
- Single responsibility: MCP tools + task persistence
- No business logic in JavaScript
- Fast JSON storage, no SQL complexity

### **4. YAML Agent Definitions**
**Decision**: Agents defined in YAML, not JavaScript classes
**Rationale**: 
- Easy for LLMs to read and understand
- Declarative vs imperative
- Version controllable and human readable

**Format**:
```yaml
metadata:
  id: "agent_name"
  description: "What this agent does"
tags:
  actions: [list_of_verbs]
  skills: [list_of_capabilities]
capabilities:
  - id: "capability_name"
    patterns: ["matching_patterns"]
```

### **5. Fast Task Management**
**Decision**: Port agent-mcp for production workspace management
**Rationale**: Proven fast persistence and task hierarchy
**Implementation**:
- JSON storage for speed
- Task hierarchy: parent → subtask → sub-subtask
- Context preservation through splits
- Workspace state tracking

### **6. Span Architecture for Long-Running Tasks**
**Decision**: Ship complex operations to background agents
**Rationale**: Keep main conversation thread responsive
**Implementation**:
- **Task Decomposition Agent** - Recursive parallel decomposer
- **Span IDs** - Track long-running operations
- **Status Polling** - Check progress without blocking
- **Process Manager** - Coordinate multiple agents
**Benefits**:
- User can change topics while decomposition runs
- Multiple decompositions in parallel
- Progress visibility without blocking
- Graceful failure handling

### **7. MCP as Dynamic Instruction Nexus**
**Decision**: Each MCP response is a complete mini system prompt
**Rationale**: Rolling context gets lost, instructions must be self-contained
**Implementation**:
- `agentInstructions` field in every response
- Complete context for current state
- Exact tool usage examples
- No reliance on conversation memory
**Pattern**:
```javascript
return {
  message: "Human readable result",
  agentInstructions: "You are now in X MODE. Do exactly this...",
  context: { current state },
  tools: { exact commands to use }
}
```

### **8. Everything is an Agent**
**Decision**: Every system component is designed as an autonomous agent
**Rationale**: Maximum flexibility, composability, and future scaling
**Implementation**:
- **Spawn Agent**: Manages parallel execution lifecycle
- **Pipeline Agent**: Orchestrates MCP request flow
- **Task Agent**: Handles task creation and management
- **Each agent exposes**: LLM interface, CLI, MCP tools, REST API
**Benefits**:
- Agents can call other agents
- Uniform communication patterns
- Easy to add new capabilities
- Natural handoff between agents
**Example**:
```javascript
// Spawn agent registers with pipeline
spawnAgent.registerWithPipeline(mcpAgent);

// Task agent calls spawn agent
const spawnId = await spawnAgent.spawn({
  callingAgent: 'task-agent',
  callbackTool: 'process_decomposition',
  taskData: complexTask
});

// Spawn agent calls back when done
await taskAgent.process_decomposition(results);
```

## 🚫 **Anti-Patterns (Never Do)**

### **Simulation Code**
- ❌ Don't build JavaScript versions of LLM capabilities
- ❌ Don't create hardcoded routing algorithms
- ❌ Don't implement confidence assessment in code
- ❌ Don't build vocabulary lists or pattern matching

### **Complex Abstractions**
- ❌ Don't create elaborate class hierarchies
- ❌ Don't build plugin systems or frameworks
- ❌ Don't abstract what doesn't need abstraction
- ❌ Don't optimize prematurely

### **Business Logic in Infrastructure**
- ❌ Don't embed domain logic in MCP tools
- ❌ Don't make decisions that LLMs should make
- ❌ Don't second-guess LLM assessments
- ❌ Don't validate LLM reasoning

## ✅ **Required Patterns**

### **MCP Tool Design**
```javascript
// ✅ BEST: Data access + Dynamic instruction injection
async handleCreateTask(args) {
  const task = { ...args, created: Date.now() };
  await this.saveTask(task);
  
  // Audit logging
  await this.auditLogger.logAction({
    type: 'task_created',
    target: task.id,
    params: args
  });
  
  // Dynamic instruction injection
  return {
    message: `✅ Created task: ${task.title}`,
    instructions: `Now assess confidence for task ${task.id}. If < 0.8, split it.`,
    audit: `Log: Task ${task.id} created at ${new Date().toISOString()}`
  };
}

// ✅ Good: Data access only (v1 pattern)
async handleCreateTask(args) {
  const task = { ...args, created: Date.now() };
  await this.saveTask(task);
  return `✅ Created task: ${task.title}`;
}

// ❌ Bad: Business logic
async handleCreateTask(args) {
  if (this.isTaskTooComplex(args.description)) {
    return this.suggestTaskSplit(args);
  }
  // ... complexity assessment logic
}
```

### **LLM-Driven Flow**
```javascript
// ✅ Good: LLM decides, MCP provides access
const confidence = await llm.assessConfidence(task);
if (confidence < 0.8) {
  await agent.splitTask(taskId, llmSubtasks);
}

// ❌ Bad: JavaScript decides
if (task.description.length > 100) {
  await this.autoSplitTask(task);
}
```

## 🔄 **Evolution Guidelines**

### **Adding New Capabilities**
1. Ask: "Can an LLM do this?"
2. If YES → Add MCP tool for data access only
3. If NO → Consider if it's really needed
4. Always preserve bidirectional flow pattern

### **Extending Agents**
1. Add YAML agent definition
2. Let LLM use existing MCP tools
3. No JavaScript agent classes
4. Test with confidence assessment flow

### **Performance Optimization**
1. Optimize MCP tool response time
2. Improve task persistence speed
3. Never optimize by removing LLM decision-making
4. Cache data, not decisions

## 📊 **Success Metrics**

### **Code Quality**
- Total lines < 1000 (currently 718)
- MCP tools only provide data access
- No business logic in JavaScript
- All decisions made by LLM

### **Functional Quality**
- Task confidence assessment working
- Recursive splitting until ≥80% confidence
- Bidirectional flow completing tasks
- Fast workspace persistence

### **Architecture Quality**
- LLM-first principle maintained
- No simulation code in production
- YAML agent definitions only
- Clear separation: LLM (intelligence) + MCP (data)

## 🔮 **Future Considerations**

### **Scaling Guidelines**
- Add MCP tools for data access, never decision logic
- Create new YAML agents, not JavaScript classes
- Maintain 80% confidence threshold
- Preserve bidirectional flow pattern

### **Integration Points**
- Other systems can provide MCP tools
- LLM routes to external capabilities via MCP
- No direct API integration in Kingly core
- Everything flows through LLM decision-making

---

**These principles are derived from successful 77.8% self-evolution experiments and must be preserved in all future development.**

**Core Insight**: JavaScript taught us the patterns. LLMs apply the intelligence.
## 🌟 **NORTHSTAR VISION**

### **The Holy Grail Demo: Idea → Deployed Product (One Session)**

**Ultimate Goal**: Walk into a room, say "I want to build a fitness tracking app" and walk out 30 minutes later with a deployed, working product that users can immediately access.

**The Flow**:
1. **Request**: "Build me a fitness tracking app"
2. **CEO Analysis**: Market research, competitor analysis, feature prioritization
3. **Architecture**: Technical stack selection, database design, API planning
4. **Implementation**: Full-stack development with best practices
5. **Testing**: Automated testing suite creation and execution
6. **Deployment**: Production deployment with monitoring
7. **Access**: Real URL users can visit immediately

**Success Criteria**:
- ⏱️ **Time**: 30 minutes or less from idea to deployed product
- 🏆 **Quality**: Production-ready code with proper error handling
- 📱 **Completeness**: Full-stack application with authentication, data persistence, responsive UI
- 🌐 **Accessibility**: Real users can immediately register and use the app
- 🔧 **Maintenance**: Self-documenting code with deployment pipelines

### **Democratization Vision: Web GUI + Project Crawler**

**Vision**: Drop Kingly into any project root (like `~/digital`) and instantly get:
- **📊 Dashboard UI**: Visual project management and workflow interface
- **🔍 Project Crawler**: Auto-discovery of all projects and their contexts
- **🎯 One-Shot Management**: Complete project overview and task coordination
- **👥 Non-Technical Access**: Easy interface for anyone to manage complex workflows

**Business Reality**: This represents the ultimate democratization of software development:
- Non-technical founders can validate ideas instantly
- Entrepreneurs can test market hypotheses in real-time  
- Businesses can adapt to opportunities immediately
- The barrier between idea and execution disappears

### **All Development Decisions Must Serve This Vision**

**Current State**: We can plan, architect, and guide development via bidirectional flow
**Northstar**: We deliver working, deployed products + beautiful management interface in one session

This is the benchmark against which all development decisions should be measured.

---

**Core Insight**: JavaScript taught us the patterns. LLMs apply the intelligence. The GUI democratizes the magic.