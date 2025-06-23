# 🚀 Kingly Agent Development Workflow Entry Point

**Main entry point for all development work on Kingly Agent system**

## 📋 **Agent Onboarding Protocol**

### **Step 1: Read Core Documents (Required)**
1. **`CORE_PRINCIPLES.md`** - Immutable architectural decisions and vision
2. **`README.md`** - Complete system documentation and usage
3. **`DEVELOPMENT_WORKFLOW.md`** - Standard development process
4. **`VISION_SUMMARY.md`** - Current state and northstar goals

### **Step 2: Understand Current State**
1. **Test the system**: Run `node test-confidence-splitting.js`
2. **Check implementation status**: Review `I_FILE_STATUS.md`
3. **Examine internal docs**: Browse `internal/` folder for strategic context

### **Step 3: Get Task Recommendation**
After reading the above documents, **ask the system**: 

> "Based on the core principles, current implementation status, and NORTHSTAR vision, what should be the next priority task for Kingly Agent development?"

## 🎯 **Quick Context Overview**

### **What Kingly Agent Is**
- LLM-first AI agent system with bidirectional flow (LLM ↔ MCP ↔ Kingly)
- 80% confidence threshold with recursive task splitting
- Fast workspace management through MCP tools
- YAML agent definitions for intelligent routing

### **Current State**
- ✅ **Production ready**: 718 lines of core functionality
- ✅ **Bidirectional flow**: Working LLM conversation until task completion
- ✅ **Confidence splitting**: Recursive breakdown until executable
- ✅ **Documentation**: Complete principles and workflow guides

### **NORTHSTAR Vision**
- 🌟 **Holy Grail**: Idea → deployed product in 30 minutes
- 🌟 **Democratization**: Web GUI + project crawler for non-technical users
- 🌟 **Drop-and-go**: Place in `~/digital` → instant AI project management

## 📁 **File Organization Reference**

### **Core System Files**
```
src/
├── index.js                 # Main API (68 lines)
├── mcp-server.js           # MCP routing + tools (207 lines)
└── mcp-tool-handlers.js    # Fast task management (443 lines)

agents/
├── ceo.yaml               # Strategic planning agent
└── dev.yaml               # Technical implementation agent
```

### **Documentation Files**
```
CORE_PRINCIPLES.md         # Immutable architectural decisions + NORTHSTAR
README.md                  # Complete system documentation
DEVELOPMENT_WORKFLOW.md    # Standard development process
VISION_SUMMARY.md         # Current state + future vision
I_FILE_STATUS.md          # Strategic document implementation status
WEB_GUI_VISION.md         # Technical vision for democratization
```

### **Internal Strategy Files**
```
internal/
├── i-pm.md               # Project management patterns
├── i-wkflw.md           # Workflow system design  
├── i-spec.md            # Production specifications
├── i-spawn.md           # Agent spawning (future)
├── i-onboard.md         # Onboarding automation (future)
└── [other i-files...]   # Strategic context documents
```

## 🔄 **Self-Development Protocol**

### **Can Kingly Agent Manage Its Own Development?**
**YES!** Here's how:

1. **Create development tasks** using the task management system
2. **Assess confidence** for each development task  
3. **Split complex tasks** until ≥80% confidence
4. **Execute tasks** through the bidirectional flow
5. **Track progress** in the workspace system

### **Self-Development Workflow**
```bash
# Initialize Kingly for self-development
cd kingly-agent/
node src/index.js

# Create task for next feature
await agent.createTask(
  'Implement project hierarchy system',
  'Add Workspace > Project > Task structure from i-pm.md',
  'Kingly-Development'
);

# Let LLM assess and split if needed
await agent.assessTaskConfidence(taskId, confidence, factors);

# Execute when ready
await agent.executeTask(taskId, 'dev', approach);
```

## 🎯 **Common Development Tasks**

### **High Priority (from I_FILE_STATUS.md)**
1. **Project Hierarchy** (`internal/i-pm.md`)
   - Workspace > Project > Task structure
   - Project-level MCP tools and context

2. **Enhanced Workflows** (`internal/i-wkflw.md`)  
   - Workflow template library
   - Multi-agent execution patterns

3. **Remaining Spec Features** (`internal/i-spec.md`)
   - Agent promotion system
   - Advanced confidence analysis

### **NORTHSTAR Priority**
1. **Web GUI + Project Crawler** (`WEB_GUI_VISION.md`)
   - Local web server + React dashboard
   - Project discovery engine
   - Visual task management interface

## 🤖 **Meta-Development Instructions**

### **For Agents Working on Kingly Agent**

**Before starting any work:**
1. Read this file (`I_WORKFLOW.md`)
2. Review the 4 required documents listed in Step 1
3. Ask: *"What should be the next priority task for Kingly Agent development?"*
4. Use the system's own task management to track your work

**Development approach:**
- Apply the same confidence-based splitting to your own development tasks
- Use bidirectional flow: plan → assess → split → execute
- Follow core principles: "Can an LLM do this?" 
- Maintain the 80% confidence threshold

**Self-dogfooding benefits:**
- Test the system on real complex tasks
- Validate bidirectional flow works for development
- Improve task management through actual usage
- Prove the system can evolve itself

## 📋 **Getting Started Checklist**

- [ ] Read `CORE_PRINCIPLES.md` (immutable guidelines)
- [ ] Read `README.md` (system documentation)  
- [ ] Read `DEVELOPMENT_WORKFLOW.md` (process standards)
- [ ] Read `VISION_SUMMARY.md` (current state + goals)
- [ ] Test system: `node test-confidence-splitting.js`
- [ ] Review `I_FILE_STATUS.md` for implementation status
- [ ] Browse `internal/` folder for strategic context
- [ ] Ask system: "What should be the next priority task?"
- [ ] Create task using Kingly's own task management
- [ ] Apply confidence assessment and splitting
- [ ] Execute through bidirectional flow

---

**This is your main entry point. Always start here. The system will guide you to the right next task based on current priorities and the NORTHSTAR vision.** 🎯