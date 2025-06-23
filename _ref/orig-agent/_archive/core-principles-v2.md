# 🧠 KINGLY AGENT CORE PRINCIPLES V2

*Updated with relationship graph insights and implementation learnings*

## 🎯 **PRIMARY DIRECTIVES**

### **1. LLM-FIRST EVERYTHING**
- **Never write traditional algorithms** - use LLM reasoning
- **No regex, if/else, pattern matching** - use dedicated MCP calls
- **Each reasoning step gets FULL model capacity** via bidirectional MCP
- **JavaScript computes facts, LLM makes decisions**
- **Direct adapter pattern** for 10x development speed

### **2. UNIVERSAL CONTEXT ARCHITECTURE**
- **Everything is a context** - tasks, agents, workflows, files, folders, relationships
- **Contexts cascade hierarchically** - child inherits from parent
- **Structure is configurable** - hierarchical, flat, mixed, or emergent via YAML
- **Context.yaml drives behavior** - not hardcoded logic
- **Filesystems ARE graph databases** - we just use them better

### **3. RELATIONSHIPS COMPLETE THE GRAPH**
- **Directories = ONE relationship type** ("contains")
- **Peer relationships = FULL graph** (blocks, depends_on, relates_to)
- **Structure emerges from relationships** - not storage location
- **Any organizational pattern possible** - Agile, GTD, PARA via relationships
- **Flat storage + relationships = infinite flexibility**

### **4. BIDIRECTIONAL MCP ARCHITECTURE**
- **Each reasoning step = dedicated MCP call** (not internal simulation)
- **Batch operations for efficiency** - avoid 5+ calls per operation
- **Plan workflow of discrete calls** vs single large prompt
- **Parallel reasoning for branches** - Tree of Thoughts style
- **Callbacks and whispers** for continuous conversation

### **5. INTENT-DRIVEN DESIGN**
- **Tasks inherit intent from context cascade** - no classification needed
- **Human intent → context hierarchy → tasks** - natural flow
- **Business goals preserved** through inheritance chain
- **Implementation adapts** to preserve intent
- **Relationships preserve cross-cutting intents**

## 🚨 **ANTI-PATTERNS TO AVOID**

### **Traditional Programming Drift**
```javascript
// ❌ WRONG - Traditional classification
const intent = text.match(/implement|build|create/) ? 'implementation' : 'general';

// ✅ RIGHT - LLM reasoning
const intent = await llm.reason({
  prompt: "What is the intent behind this human expression?",
  context: parentContextChain
});
```

### **Fixed Organizational Structures**
```javascript
// ❌ WRONG - Hardcoded hierarchy
class Workspace { projects = [] }
class Project { tasks = [] }

// ✅ RIGHT - Emergent structure via relationships
const structure = await context.discoverStructure();
const relationships = await context.getRelationships();
```

### **Multiple Tool Calls for Single Operation**
```javascript
// ❌ WRONG - Inefficient separate calls
await createTask(...);
await addRelationship(...);
await updateStatus(...);

// ✅ RIGHT - Batch operation
await batchOperation({
  creates: [{type: 'task', ...}],
  relationships: [{type: 'blocks', ...}],
  updates: [{status: 'active'}]
});
```

### **Framework-Style Thinking**
```javascript
// ❌ WRONG - Building FOR LLMs
class TaskFramework {
  classifyIntent() { }
  routeToHandler() { }
}

// ✅ RIGHT - Building WITH LLMs
const response = await llm.converse({
  context: relevantContexts,
  intent: userExpression,
  availableActions: contextActions
});
```

## 🏗️ **IMPLEMENTATION PRINCIPLES**

### **1. Plugin Quality First**
- **Ship 5-7 high-quality plugins** - set the standard
- **Each plugin demonstrates best practices**
- **LLMs learn from quality examples**
- **Community matches our quality bar**

### **2. Context Storage Flexibility**
- **Support multiple patterns** via YAML configuration
- **Hierarchical** - `.kingly/workspace/projects/project/`
- **Flat** - `.kingly/contexts/ctx-001.yaml`
- **Mixed** - user-defined structures
- **Emergent** - self-organizing patterns

### **3. Containment Rules with Escape Hatches**
- **Default: Enforce allowed_children** from templates
- **Override: {force: true}** for power users
- **Special contexts** (folder, emergent) allow anything
- **Clear error messages** with suggestions

### **4. Direct Testing Philosophy**
- **Claude Code calls methods directly** - no test scripts
- **Manual verification** during development
- **E2E test suites** after features stabilize
- **I am the test runner** for rapid iteration

## 🚀 **THE VISION**

Build a Universal Context Operating System where:
- **Any organizational pattern** emerges from relationships
- **LLMs converse naturally** without complex frameworks
- **Structure is discovered**, not imposed
- **Everything inherits** from universal business goals
- **10x-100x more intelligent** than traditional approaches

---

*Remember: We're revealing the universal graph that was always there, not building a new system.*