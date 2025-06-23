# i-spawn: Autonomous Agent Spawning & Terminal Workspace Management

*Advanced workflow ideas for parallel execution and workspace management*

## 🎯 **Core Spawning Architecture**

### **Autonomous Task Execution Flow**
```
User Intent → CEO Orchestration → Task Refinement → Spawn Autonomous Agent
```

**Task Refinement to Autonomous Spec**:
```yaml
# tasks/auth-implementation-001.yaml
metadata:
  id: "auth-implementation-001"
  status: "ready_for_autonomous_execution"
  agent_type: "dev"
  
autonomous_spec:
  prompt_template: "mini-dev"
  workspace: "/workspaces/fitness-app"
  project_context: "fitness-app"
  
task_definition:
  objective: "Implement user authentication system with OAuth + JWT"
  implementation_plan: [...]
  technical_requirements: [...]
  acceptance_criteria: [...]
  context_files: [...]
```

### **Docker-Based Spawning System**
```javascript
class ClaudeSpawner {
  async spawnAutonomousAgent({ agentType, taskId, workspace, promptTemplate }) {
    const dockerArgs = [
      'run', '-d',
      '--name', `claude-${agentType}-${taskId}`,
      '-v', `${workspace}:/workspace`,
      '-e', `AGENT_PROMPT=${promptTemplate}`,
      '-e', `TASK_ID=${taskId}`,
      'claude-autonomous-agent'
    ];
    return await this.executeDocker(dockerArgs);
  }
}
```

## 🖥️ **Terminal Workspace Management**

### **Multi-Session Architecture**
```
Terminal 1: Main Project     Terminal 2: Frontend       Terminal 3: Backend
├── kingly-agent CEO        ├── spawned frontend-dev   ├── spawned backend-dev
├── workspace: ./main       ├── workspace: ./frontend  ├── workspace: ./backend
└── orchestrates tasks      └── focused UI work        └── focused API work
```

### **Workspace Switching**
```javascript
class WorkspaceManager {
  async flipProject(sessionId, newProjectPath) {
    const session = this.sessions.get(sessionId);
    session.workspace = newProjectPath;
    await session.ceoAgent.loadProject(newProjectPath);
    console.log(`🔄 Switched to project: ${newProjectPath}`);
  }
}
```

## 🌳 **Git Worktree UI Parallelization**

### **Multiple Approach Testing**
```bash
# Same repo, 3 different worktrees for UI experiments
git worktree add ../ui-approach-1 main
git worktree add ../ui-approach-2 main  
git worktree add ../ui-approach-3 main

# Spawn 3 agents on same UI task
spawn ui-agent-1 --workspace=../ui-approach-1 --task="implement dashboard"
spawn ui-agent-2 --workspace=../ui-approach-2 --task="implement dashboard"  
spawn ui-agent-3 --workspace=../ui-approach-3 --task="implement dashboard"

# Compare results, pick best approach
```

## 🔄 **Sequential Workflow Execution**

### **WRITE Method via Spawned Agents**
```javascript
async executeWriteWorkflow(topic) {
  const steps = [
    { agent: 'researcher', task: `research ${topic}` },
    { agent: 'writer', task: 'draft content using research' },
    { agent: 'fact_checker', task: 'verify claims in draft' },
    { agent: 'editor', task: 'polish and finalize' }
  ];
  
  // Sequential execution - each step waits for previous
  for (const step of steps) {
    const taskSpec = await this.ceo.refineTaskSpec(step);
    const agentId = await this.spawnFocusedAgent(step.agent, taskSpec);
    await this.waitForCompletion(agentId);
  }
}
```

## 🌐 **Future Web UI: Sync → Async**

### **State-Based Workflow Progression**
```javascript
// Current: Synchronous in terminal
const writeWorkflow = ['research', 'draft', 'write', 'fact_check', 'edit'];

// Future: Async via web UI state management
const writeWorkflowState = {
  currentStep: 2,
  completedSteps: ['research', 'draft'],
  nextStep: 'write_content',
  stepExecutor: 'claude-writer-container-id-xyz'
};
```

## 📋 **Implementation Notes**

### **Scope Decision**
- **Terminal system should be separate package** from core kingly-agent
- Core: Task refinement + basic spawning capability
- Terminal package: Workspace management + session handling + CLI interface

### **Dependencies**
- Docker for container management
- Git worktree for parallel UI experiments  
- Enhanced task YAML specifications
- Claude Code integration for autonomous execution

### **Benefits**
✅ True parallel execution via focused instances  
✅ Terminal workspace management for developer workflow  
✅ Git worktree experimentation for UI features  
✅ Sequential workflow support where dependencies matter  
✅ Future async capability via state management

---

**Status**: Advanced spawning concepts documented. Focus on core consolidation first.  
**Package Strategy**: Core kingly-agent + separate terminal management package  
**Priority**: Implement after core system consolidation complete