# 🖥️ KINGLY AGENT OPERATING SYSTEM MANUAL

*Complete system architecture and operational guide*

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

### **Core Components**
1. **MCP Nexus** - Central intelligence coordination with plugin hooks
2. **Agent Card System** - YAML-based agent definitions with multi-endpoint routing
3. **Project Hierarchy** - Workspace > Project > Task organization
4. **Confidence Engine** - Task complexity assessment and recursive splitting
5. **Spawn System** - Background process management with Docker integration
6. **Memory & Context** - Persistent storage + environmental context capture
7. **Audit Trail** - Comprehensive logging for debugging and learning

### **How Everything Connects**
```
User Request → MCP Nexus → Plugin Pipeline → Agent Card Routing → Tool Execution
     ↑                                                                    ↓
Memory System ← Context Capture ← agentInstructions ← Response Assembly
```

## 🌐 **MCP NEXUS - THE CENTRAL NERVOUS SYSTEM**

### **What It Does**
The MCP Nexus is the core coordination point that:
- **Receives all tool calls** and routes them through plugin pipeline
- **Injects agentInstructions** into every response with contextual mini-prompts
- **Assembles context** from memory, filesystem, spawn status, and environmental data
- **Prevents system prompt drift** by constantly updating your operational context

### **Plugin Architecture**
```javascript
// Plugins hook into every MCP call
const spawnStatusPlugin = {
  name: 'spawn-status-checker',
  priority: 100,
  always: async (context) => {
    // Runs on EVERY MCP call
    const updates = await checkBackgroundProcesses();
    if (updates.completed.length > 0) {
      context.result.agentInstructions += "\n⚡ SPAWN UPDATES:\n";
      updates.completed.forEach(s => {
        context.result.agentInstructions += `- ${s.id} completed!\n`;
      });
    }
  }
};
```

### **agentInstructions Pattern**
Every MCP response includes contextual instructions:
```json
{
  "success": true,
  "data": { "taskId": "auth-001", "confidence": 0.9 },
  "agentInstructions": `
    ## Current State
    - Workspace: fitness-app
    - Active project: mobile-app  
    - Recent: auth-001 task created with high confidence
    
    ## Next Actions
    1. execute_task('auth-001') - Start implementation
    2. assess_dependencies() - Check what auth-001 blocks
    3. create_related_task() - Add complementary tasks
    
    ## Context
    - 3 spawn processes running (2 complete, 1 in progress)
    - Memory contains Firebase config from previous session
    
    Your choice: [1-3]
  `
}
```

## 🃏 **AGENT CARD SYSTEM**

### **YAML Structure Deep Dive**
```yaml
metadata:
  id: "dev"                        # Unique identifier for routing
  name: "Development Agent"        # Human-readable name
  version: "1.0.0"                # Semantic versioning
  type: "technical"               # Category for filtering

endpoints:                        # Multi-endpoint routing
  - type: agent                   # Quick estimates/analysis
    url: "agent://dev"
    capabilities: [estimate, analyze, plan]
  - type: mcp                     # Stateful operations
    url: "mcp://localhost:3000/dev"
    capabilities: [implement, debug, test]
  - type: spawn                   # Background execution
    url: "spawn://dev"
    capabilities: [build, deploy, long_tasks]

tags:                            # Semantic routing vocabulary
  actions: [code, debug, test, build, deploy, analyze]
  skills: [javascript, python, architecture, databases, apis]
  domains: [frontend, backend, devops, security]
  contexts: [startup, enterprise, prototype, production]

capabilities:
  - id: "implement_feature"
    description: "Convert requirements to working code"
    patterns: ["implement *", "build *", "code *", "create *"]
  
system_prompt: |
  You are a technical development agent focused on implementation.
  
  Core responsibilities:
  - Convert business requirements to technical specifications
  - Implement features with clean, tested code
  - Debug issues and optimize performance
  
  Always end responses with interactive checklist:
  ## ✅ Work Completed
  [Summary of what was accomplished]
  
  ## 🎯 Next Options
  1. **Continue Implementation** (30min) - Keep building current feature
  2. **Run Tests** (10min) - Validate current work
  3. **Code Review** (15min) - Get feedback before proceeding
  4. **Deploy** (5min) - Push to staging environment
```

### **Agent Card Interpretation Rules**
- **tags.actions** = Verb matching for request routing
- **tags.skills** = Knowledge domain coverage 
- **tags.contexts** = Situational appropriateness
- **endpoints** = Execution strategy selection
- **capabilities.patterns** = Natural language matching

### **Routing Algorithm**
```
1. Parse user request for verbs → match tags.actions
2. Identify knowledge domains → match tags.skills  
3. Assess context (startup vs enterprise) → match tags.contexts
4. Select endpoint based on complexity:
   - Simple query → agent:// endpoint
   - Stateful work → mcp:// endpoint  
   - Long process → spawn:// endpoint
5. Execute via selected agent capability
```## 📁 **PROJECT HIERARCHY SYSTEM**

### **Workspace > Project > Task Structure**
```
workspace/                    # Working directory (one workspace per directory)
├── .kingly/                 # System data (hidden from user)
│   ├── workspace.yaml      # Workspace metadata
│   ├── projects/           # Project organization
│   │   ├── mobile-app/
│   │   │   ├── project.yaml    # Project metadata
│   │   │   └── tasks/          # All tasks for this project
│   │   │       ├── auth-001.yaml  # Business contract
│   │   │       ├── auth-001.md    # Implementation context (optional)
│   │   │       ├── ui-002.yaml
│   │   │       └── ui-002.md
│   │   └── backend-api/
│   │       ├── project.yaml
│   │       └── tasks/
│   ├── agents/             # Agent context files (NOT memory)
│   │   ├── ceo/
│   │   │   ├── business-context.md
│   │   │   └── workspace-brief.md
│   │   └── dev/
│   │       ├── architecture.md
│   │       └── tech-stack.md
│   └── audit/              # Decision logs
│       ├── 2025-05-28.yaml
│       └── decisions.yaml
└── [user's actual files]   # Regular project files
```

### **Task File Structure**
**YAML File (Business Contract)**:
```yaml
metadata:
  id: "auth-001"
  title: "User Authentication System" 
  confidence: 0.9
  status: "in_progress"

business_context:
  goal: "Enable secure user login"
  business_value: "Required for user accounts"

acceptance_criteria:
  - Given: User has valid credentials
    When: They attempt to login  
    Then: They are authenticated and redirected

dependencies:
  depends_on: []
  blocks: ["profile-001", "dashboard-001"]
```

**MD File (Implementation Context - Optional)**:
```markdown
# Auth Implementation Notes

## Architecture Decisions
- Using Firebase Auth for user management
- JWT tokens for session management

## Code Examples
```javascript
const auth = firebase.auth();
// Implementation details...
```

## Session Log
- Started implementation at 2:30pm
- Discovered Firebase SDK v9 compatibility issue
- Resolved by upgrading configuration
```

## 🧠 **CONFIDENCE ENGINE**

### **How Confidence Assessment Works**
```javascript
function assessTaskConfidence(task) {
  const factors = {
    clarity: "How well-defined are the requirements?",
    complexity: "How many moving parts?", 
    knowledge: "Do I have domain expertise?",
    dependencies: "How many unknowns?",
    scope: "Can this be completed in one focused session?"
  };
  
  // Confidence scale: 0.0 - 1.0
  // 0.8+ = Execute directly
  // 0.6-0.8 = Consider splitting
  // <0.6 = Must split or research first
}
```

### **Recursive Splitting Protocol**
```yaml
original_task:
  title: "Build user authentication system"
  confidence: 0.4
  reason: "Too many components, unclear integration"

split_into:
  - title: "Research Firebase Auth options"
    confidence: 0.9
    type: "research"
  - title: "Set up Firebase project configuration"  
    confidence: 0.8
    type: "setup"
  - title: "Implement login form UI"
    confidence: 0.9
    type: "frontend"
  - title: "Add registration validation"
    confidence: 0.8  
    type: "backend"
  - title: "Test authentication flow"
    confidence: 0.9
    type: "testing"
```

## 🚀 **SPAWN SYSTEM**

### **Background Process Management**
The spawn system handles long-running operations:
```javascript
// Spawn a background process
const spawnId = await spawn_process({
  command: "npm run build:production",
  timeout: "30m",
  callback_tool: "process_build_results"
});

// Check status (runs automatically via plugins)
const status = await check_spawn_status(spawnId);
// Status updates appear in agentInstructions automatically
```

### **Integration with MCP Nexus**
- **Spawn status plugin** runs on every MCP call
- **Completed processes** automatically inject updates into agentInstructions
- **Background monitoring** prevents lost processes
- **Result callbacks** trigger follow-up actions

## 🧠 **MEMORY & CONTEXT SYSTEM**

### **Persistent Memory**
```javascript
// Store important decisions
await remember_context("firebase_config", {
  apiKey: "xxx",
  authDomain: "myapp.firebaseapp.com"
}, "configuration");

// Retrieve for future use
const config = await recall_context("firebase_config");
```

### **Context Capture Strategies**
```javascript
// Capture environmental context
const context = await capture_context([
  'filesystem',  // Working directory state
  'git',        // Repository status  
  'environment' // Node version, platform, etc.
]);

// Results feed into agentInstructions for situation awareness
```

## 🔍 **AUDIT TRAIL & LEARNING**

### **Comprehensive Logging**
Every operation logs:
```yaml
- timestamp: "2025-05-28T15:30:00Z"
  event: "task_created"
  details:
    task_id: "auth-001"
    confidence: 0.9
    agent: "ceo"
    reasoning: "Clear requirements, known technology"
  
- timestamp: "2025-05-28T15:31:00Z" 
  event: "agent_routing"
  details:
    request: "implement authentication"
    agent_selected: "dev"
    confidence: 0.95
    alternatives_considered: ["security", "fullstack"]
```

### **System Learning Patterns**
- **Decision tracking** → Improves future routing
- **Success rate monitoring** → Identifies effective patterns  
- **Error pattern recognition** → Prevents repeated mistakes
- **Context correlation** → Better situation assessment

---

## 🎯 **OPERATIONAL PROTOCOLS**

### **System Startup Sequence**
1. **Load agent cards** from `/agents/` directory
2. **Initialize MCP pipeline** with all plugins
3. **Check workspace state** and restore context
4. **Load memory** and recent audit history
5. **Ready for first tool call** with full context

### **Tool Call Execution Flow**
1. **Receive request** → Route through MCP nexus
2. **Pre-plugins execute** → Context capture, memory loading
3. **Tool executes** → Perform requested action
4. **Post-plugins execute** → Spawn status, audit logging
5. **Assemble response** → Include agentInstructions with updated context
6. **Return to user** → Complete situational awareness

### **Context Refresh Strategy**
- **Every MCP call** refreshes agentInstructions
- **Plugin system** injects dynamic updates
- **Memory system** persists key decisions
- **Audit trail** provides historical context
- **No conversation memory dependency** - each response is complete

This operating system ensures consistent, context-aware operation with intelligent routing, comprehensive logging, and dynamic adaptation to changing conditions.