# Workspace-Centric Architecture with Agent Onboarding

## Core Concept: Workspace > Project > Task

### **Hierarchy**
```
Workspace (new working directory)
├── Project A (folder/focus area)
├── Project B  
└── Shared resources
```

**Workspace** = New entity, represents a working directory with its own context
**Project** = Can silo into folders within workspace to reduce context/focus
**Task** = Individual work items within projects

## Workspace Onboarding Flow

### **When No Memory Exists (New Workspace)**
```yaml
workspace_onboarding:
  trigger: "no memory found for current workspace"
  
  steps:
    1_ceo_onboarding:
      - "Analyze workspace: what's here and why?"
      - "Define project status and goals" 
      - "Create PRD (product requirements document)"
      - "Run split_prd to break into manageable pieces"
      
    2_agent_orchestration:
      - "CEO determines which agents are needed"
      - "For each agent: run onboarding process"
      - "Agents save specialized context to workspace memory"
      
    3_workspace_ready:
      - "All agents have workspace context"
      - "Memory established for future sessions"
```

### **CEO Onboarding (First Step)**
```yaml
# CEO is the public face of orchestrator - drives everything
ceo_onboarding:
  analyze_workspace:
    - "Scan directory structure"
    - "Read README, package.json, config files"
    - "Understand what type of project this is"
    - "Determine current status (new, in-progress, maintenance)"
    
  define_goals:
    - "Why is this project in this workspace?" 
    - "What are we trying to achieve?"
    - "What's the business context?"
    - "Who are the stakeholders?"
    
  create_prd:
    - "Document product requirements"
    - "Define success criteria"
    - "Outline key features and functionality"
    
  split_prd:
    - "Break PRD into manageable epics"
    - "Create initial task breakdown"
    - "Identify dependencies and priorities"
    - "Generate task files in workspace memory"
```

### **Agent-Specific Onboarding**
```yaml
agent_onboarding:
  architect_onboarding:
    - "Analyze codebase structure and patterns"
    - "Identify existing architecture decisions"
    - "Document technical debt and constraints"
    - "Create architecture context files"
    - "Use templates and workflows for assessment"
    
  dev_onboarding:
    - "Scan for development setup (package.json, etc.)"
    - "Understand build and deployment processes"
    - "Identify testing frameworks and patterns"
    - "Document development context"
    
  marketing_onboarding:
    - "Analyze existing marketing materials"
    - "Understand target audience and positioning"
    - "Document brand guidelines and voice"
    
  # Only onboard agents that CEO determines are needed
  conditional_onboarding:
    - if: "has_frontend_code"
      then: "onboard design agent"
    - if: "has_documentation"
      then: "onboard content agent"
    - if: "has_marketing_materials"
      then: "onboard marketing agent"
```

## Workspace Memory Structure

```
workspace/
├── .aiforge/
│   ├── workspace.yaml          # Workspace metadata
│   ├── agents/                 # Agent-specific memory
│   │   ├── ceo/
│   │   │   ├── project-status.md
│   │   │   ├── business-context.md
│   │   │   └── prd.md
│   │   ├── architect/
│   │   │   ├── codebase-analysis.md
│   │   │   ├── architecture-decisions.md
│   │   │   └── technical-debt.md
│   │   └── dev/
│   │       ├── setup-notes.md
│   │       └── development-context.md
│   │
│   └── projects/               # Project-specific organization
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

## Cascading Request > Completion Flow

### **Vibe Coding Architecture**
```yaml
cascading_flow:
  user_request: "Build a user dashboard"
  
  cascade_levels:
    1_business_analysis:
      agent: "ceo"
      output: "Business requirements and success criteria"
      
    2_technical_planning:
      agent: "architect" 
      input: "Business requirements"
      output: "Technical approach and architecture"
      
    3_implementation_breakdown:
      agent: "dev"
      input: "Technical approach"
      output: "Detailed task breakdown with complexity scores"
      
    4_execution:
      agent: "dev"
      input: "Task breakdown"
      output: "Working implementation"
      
    5_validation:
      agent: "ceo"
      input: "Implementation"
      output: "Business validation and next steps"

  # Each level can spawn subtasks or pivot the approach
  interruption_points:
    - "After business analysis: user can redirect or add requirements"
    - "After technical planning: can choose different approach"
    - "After breakdown: can prioritize different tasks"
    - "During execution: can pause and pivot"
```

## Vibe Coding Flow (From BMAD)

### **Eventual Autonomous Flow**
```yaml
vibe_coding:
  philosophy: "Think like a CEO with unlimited resources and singular vision"
  
  user_input: "I want to increase conversion by 20%"
  
  autonomous_cascade:
    ceo_analysis:
      - "Analyze current conversion metrics"
      - "Identify improvement opportunities" 
      - "Define success criteria and timeline"
      
    architect_design:
      - "Review current funnel architecture"
      - "Design A/B testing framework"
      - "Plan optimization infrastructure"
      
    dev_implementation:
      - "Implement tracking and analytics"
      - "Build A/B testing capabilities"
      - "Create optimization experiments"
      
    marketing_optimization:
      - "Design test variations"
      - "Set up campaign tracking"
      - "Analyze and iterate on results"
      
  human_touchpoints:
    - "Approve budget for paid experiments"
    - "Review sensitive user experience changes"
    - "Validate business metric improvements"
```

## Role Clarifications

### **CEO (Public Face of Orchestrator)**
- **Not an architect**: Provides business context, not technical guidance
- **Business-focused**: Goals, requirements, success criteria
- **Orchestration driver**: Determines which agents to involve
- **Decision maker**: Approves major pivots and resource allocation

### **Dev as Architect**
- **When dev receives task**: Acts as architect first
- **Scans codebase**: Uses workspace onboarding context
- **Technical decisions**: Architecture, patterns, implementation approach
- **Context-aware**: Leverages workspace memory from onboarding

### **Workspace Entity Benefits**
1. **Persistent context**: Onboarding happens once per workspace
2. **Agent memory**: Each agent builds workspace-specific knowledge
3. **Project flexibility**: Can organize into folders for focus
4. **Context efficiency**: Reduces repeated analysis of same codebase

This structure gives us **intelligent workspace awareness** with **role-appropriate responsibilities** and **cascading autonomous execution** for eventual vibe coding! 🎯