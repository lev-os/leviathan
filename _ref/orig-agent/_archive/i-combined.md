# AIForge Complete Architecture - Combined Implementation

## Core Behavior & Operating Principles

### **Primary Operating Mechanism**
- LLM intelligence + semantic capability drives everything
- Always display options as numbers for quick selection
- System prompts built from "seed" (self-evolving architecture)
- LLM interprets code and writes YAML/logic to match

### **User Interface Pattern**
```
🎯 What would you like to do next?
1. Research competitor analysis
2. Start writing the content  
3. Create visual mockups
4. Run full automated sequence

Choice: 2
```

### **Error Handling & Learning**
- Error handling: Tell user and log to filesystem
- Learning: Every decision logged with turns + success rate
- Context: System recommends based on flow
- Conflicts: User preferences override (`.local` file)
- Fallbacks: Ask user, show reasoning when stuck
- Performance: MCP router as optimization nexus
- Personalization: Decision tracking enables learning

## Agent Architecture

### **Tag Soup Semantic Routing**
Rich vocabulary for intelligent routing without rigid rules:
```
Actions: [analyze, architect, approve, build, code, debug, design, implement, plan, strategize...]
Skills: [api, architecture, business, content, database, frontend, marketing, security...]
Contexts: [startup, enterprise, crisis, growth, pivot...]
```

### **Agent Types**
- **Prompt-based**: Pure LLM (CEO, Content)
- **Tool-based**: MCP/API wrappers (GitHub, Figma)  
- **Hybrid**: Prompt + Tools (Dev, Security)

### **Agent Definition Structure**
```yaml
# agents/core/ceo.yaml
metadata:
  id: "ceo"
  name: "Chief Executive Officer"
  
tags:
  actions: [plan, strategize, decide, prioritize, approve]
  skills: [strategy, leadership, finance, communication]
  contexts: [startup, enterprise, crisis, growth, pivot]

capabilities:
  - strategic_planning
  - decision_approval
  
system_prompt: |
    You are a strategic business leader focused on growth and decision-making.
    Always end work with interactive checklist showing completed work and next options.
```

### **Core Agents (Always Loaded)**
- **Orchestrator**: Routes everything (only "special" component)
- **Memory**: Context and state management
- **CEO**: Business strategy, creates tasks but doesn't split them
- **Dev**: Implementation + complexity analysis + architecture when receiving tasks
- **Security**: Code analysis + safety

## Workflow Architecture

### **Pure Flexibility with Smart Hints**
Workflows are hints, not rules. LLM decides display based on context.

```yaml
# workflows/content-creation.yaml
goal: "Create content (blog, article, documentation)"

agents:
  - researcher: {capabilities: [gather_info, verify_facts]}
  - writer: {capabilities: [outline, draft, edit]}
  - designer: {capabilities: [visuals, layout]}

# Common patterns (LLM inspiration)
steps:
  research_first: [researcher, writer, fact_checker, editor]
  write_first: [writer, researcher, fact_checker, editor]
  
display_strategy: |
  Always include:
  - Smart next step options (3-4 max)
  - Auto mode option
  - Time estimates
  - Gentle pushback if something seems off
```

### **Interactive Checklist Pattern**
```yaml
# Agent completion template
completion_template: |
  ## ✅ Work Completed
  [What you accomplished]
  
  ## 🎯 Next Steps Available
  [3-4 logical next steps with agents and time estimates]
  
  ## ❓ What's Your Priority?
  1. **Research Phase** (researcher, 30min)
  2. **Start Writing** (writer, 45min)
  3. **Plan Visuals** (designer, 15min)
  4. **Auto Mode** - Let me handle full sequence
  
  **Your choice shapes the workflow.**
```

## Task Splitting via Confidence

### **Confidence-Based Recursive Splitting**
- **CEO Exception**: Creates tasks but doesn't split (keeps simple)
- **Technical Agents**: Split if confidence < 8/10
- **Confidence = ability to finish in 1 shot**

### **Universal Splitting Prompt**
```yaml
splitting_protocol: |
  Before starting any task, assess confidence (1-10):
  
  8+ = Execute directly
  <8 = Split into smaller, confident pieces
  
  When splitting:
  - Each piece completable in 1-4 hours
  - Clear inputs and outputs
  - Minimize dependencies
  - Research separate from implementation
  
  Continue splitting until all pieces are 8+ confidence.
```

## Project Management

### **One Task Per File + Embedded Context**
```yaml
# .aiforge/projects/fitness-app/tasks/auth-001.yaml
metadata:
  id: "auth-001"
  title: "Implement user registration"
  type: "feature"
  
ownership:
  owner: "ceo"          # Always CEO
  executors: ["dev"]    # Who implements
  
business_context:
  goal: "Allow users to create accounts"
  acceptance_criteria:
    - "User can register with email/password"
    - "Email validation required"
  
technical_context:
  architecture_notes: |
    ## Architecture Input (CEO → Dev handoff)
    - Use Firebase Auth for user management
    - Custom validation layer
    
  implementation_notes: |
    ## Implementation Log (Dev execution)
    - ✅ Set up Firebase Auth configuration
    - ⏳ Working on email validation flow
    - ❌ Discovered SDK compatibility issue
    
workflow:
  current_step: "implementation"
  steps_completed: ["business_analysis", "technical_planning"]
  next_steps: ["resolve_firebase_sdk", "complete_email_flow"]
  
status:
  current: "blocked"
  progress: 60
  blocked_by: "firebase_sdk_compatibility"
  
dependencies:
  blocks: ["profile-001"]
  
checklist:
  business_requirements:
    - [x] User stories defined
    - [ ] Stakeholder approval received
  implementation:
    - [x] Basic registration form created
    - [ ] Email validation implemented
```

### **Pivot as Task Type**
```yaml
# pivot-001.yaml
metadata:
  type: "pivot"
  title: "Switch from React Native to Web-Only"
  
pivot_plan:
  scope: "technical"
  affected_tasks: ["auth-001", "profile-001"]
  transformations:
    - task: "auth-001"
      action: "transform"
      preserve_business_goal: true
      changes: ["React Native → React web", "Firebase Native → Web SDK"]
```

## Workspace Architecture

### **Workspace > Project > Task Hierarchy**
```
workspace/                    # Working directory
├── .aiforge/
│   ├── workspace.yaml       # Workspace metadata
│   ├── agents/              # Agent workspace memory
│   │   ├── ceo/
│   │   │   ├── workspace-brief.md
│   │   │   └── business-context.md
│   │   ├── architect/
│   │   │   ├── architecture.md
│   │   │   ├── code-style.md
│   │   │   └── tech-debt.md
│   │   └── ux/
│   │       ├── style-guide.md
│   │       └── brand-kit.md
│   │
│   └── projects/            # Project organization
│       ├── frontend/
│       │   └── tasks/
│       │       ├── auth-001.yaml
│       │       └── ui-001.yaml
│       └── backend/
│           └── tasks/
│               └── api-001.yaml
│
└── [actual project files]
```

### **Workspace Onboarding Flow**
```yaml
workspace_onboarding:
  trigger: "no memory found for workspace"
  
  steps:
    1_ceo_onboarding:
      - "Analyze workspace directory"
      - "Define goals and business context"
      - "Create workspace brief"
      - "Determine needed agents"
      
    2_agent_onboarding:
      - "CEO orchestrates agent onboarding"
      - "Each agent builds specialized context"
      - "Agents save workspace memory"
      
    3_first_project:
      - "Ready for first project request"
      - "Can auto-start if request has enough context"
```

## Synthetic Agents & MCP Integration

### **Synthetic Agent Creation**
```yaml
synthetic_agent_creation:
  trigger: "no appropriate agent found"
  
  templates:
    analysis: {capabilities: [analyze, research], persona: "analytical"}
    creative: {capabilities: [create, design], persona: "innovative"}
    problem-solver: {capabilities: [debug, optimize], persona: "systematic"}
    
  promotion_criteria:
    min_usage: 5
    min_success_rate: 0.8
    
  process:
    - analyze_request
    - select_template
    - generate_agent_spec
    - create_synthetic_agent
    - track_performance
    - promote_if_successful
```

### **Easy MCP Installation**
```yaml
mcp_installation:
  flow:
    1. "Search existing agents"
    2. "If not found, suggest MCPs"
    3. "Try installation: npx @package/mcp"
    4. "Wrap as agent"
    5. "Test and register"
    6. "Fallback to synthetic if fails"
    
  registry:
    "@anthropic/pdf-mcp":
      capabilities: [pdf_generation]
      install_cmd: "npx @anthropic/pdf-mcp"
      env_vars: [PDF_API_KEY]
```

This combined architecture provides:
- **Intelligent routing** through tag soup
- **User control** via interactive checklists  
- **Confidence-based splitting** for manageable tasks
- **Complete task context** in single files
- **Workspace persistence** with agent specialization
- **Infinite extensibility** via synthetic agents and MCPs
- **Self-evolution** through seed-based improvement