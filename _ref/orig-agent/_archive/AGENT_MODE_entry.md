# 🚀 KINGLY AGENT - QUICK START ENTRY

*Get productive immediately with interactive guidance*

## ⚡ **PROJECT STATUS & GOALS**

**Current Project**: Kingly Agent V1 - 85% production-ready AI agent orchestration system
**Active Goal**: Complete V1 finalization while extracting specs from internal/ to plan/domains/
**Your Role**: Operating as Claude in Kingly Agent Mode to organize architecture and complete system

**Key Projects**:
- **kingly-agent/**: 85% complete production system with MCP SDK, background spawning, confidence system
- **Current Session**: Converting internal i-*.md specifications into organized plan/domains/ structure

## 🎯 **QUICK START - GET WORKING NOW**

### **Step 1: Check Current Status**
```
Use TodoRead tool → See what's pending
Check _status.md → Understand progress
Review current task from user
```

### **Step 2: Interactive Tool Discovery**
Try these tools to understand what's available:
```
list_workspaces() → See project structure
get_workspace_state() → Current status
assess_task_confidence() → Check task complexity
```

### **Step 3: Read Agent Cards**
Agent YAML structure you'll encounter:
```yaml
metadata: {id, name, version, type}
endpoints: [agent://, mcp://, spawn://]
tags: {actions, skills, domains, contexts}  
capabilities: [what_agent_does]
system_prompt: |
  Agent behavior definition
```
**Quick interpretation**: tags = routing hints, capabilities = what it can do, endpoints = how to call it

### **Step 4: Handle MCP Responses**
Every tool response includes `agentInstructions` field:
```json
{
  "result": "Tool completed successfully", 
  "agentInstructions": "Context + next options + current state"
}
```
**Treat agentInstructions as OS patches** - they update your understanding of current situation.## 🛠️ **ESSENTIAL TOOLS REFERENCE**

### **Project Management**
- `create_workspace(name)` - Initialize new workspace
- `create_project(workspace, name)` - Add project to workspace  
- `create_task(project, title, description)` - Add task with BDD acceptance criteria
- `list_workspaces()` - See all available workspaces
- `get_workspace_state()` - Current projects and tasks

### **Task Execution**
- `assess_task_confidence(taskId, confidence, factors)` - Rate task complexity (0-1)
- `split_task(taskId, reason, subtasks)` - Break down complex tasks
- `execute_task(taskId, agent, approach)` - Run task with specific agent

### **Memory & Context**
- `remember_context(key, value, category)` - Persist important decisions
- `recall_context(key)` - Retrieve saved context
- `capture_context(strategies)` - Save filesystem/git/environment state

### **Background Operations**
- `spawn_process(command, timeout)` - Run long operations in background
- `check_spawn_status(processId)` - Monitor background processes
- `list_spawns()` - See all running background operations

## 🎮 **INTERACTIVE SYSTEM LEARNING**

### **Try This Sequence** (Learn by doing):

1. **Explore Current Setup**: "Show me the current workspace structure" → Use list_workspaces() and get_workspace_state()

2. **Check Active Tasks**: "What tasks are pending or in progress?" → Use TodoRead tool to see current work

3. **Test Agent Cards**: "Load an example agent and explain its capabilities" → Read from agents/ directory, interpret YAML structure

4. **Practice MCP Pattern**: "Create a simple task and assess its confidence" → Use create_task() then assess_task_confidence() → Notice how agentInstructions updates your context

## 🌐 **MCP NEXUS CONCEPT**

**Every tool call = Mini system update**:
- **Tool executes** → performs action + gathers context
- **Plugins inject** → spawn status, memory, environmental data  
- **Response includes** → agentInstructions with updated situation
- **You integrate** → new context becomes part of your understanding

**Think of it as**: Each MCP call patches your system prompt with current reality.

## 📚 **REFERENCES** | 🚨 **COMMON PATTERNS**

**Deeper Learning**: `AGENT_MODE_os.md` (complete system), `AGENT_MODE_system.md` (pure operations)
**System Prompt Drift**: MCP responses constantly update context via agentInstructions
**Agent Card Reading**: tags.actions = verbs, tags.skills = knowledge, endpoints = routing
**Confidence Flow**: <0.8 = split, 0.9+ = execute, <0.7 = research mode
**Plugin Effects**: Spawn updates + context capture + audit logging happen automatically

---
**🎯 Ready**: Use TodoRead tool! **🔧 Details**: See AGENT_MODE_os.md **🤖 Pure Ops**: See AGENT_MODE_system.md