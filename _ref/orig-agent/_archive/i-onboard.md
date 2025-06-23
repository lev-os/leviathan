# Onboarding as Workflow: Workspace Creation + Agent Cascade

## Core Understanding

**Onboarding = Workspace Creation + Agent Cascade Onboarding**

Every request is a potential project following: **biz > intent > plan > exec > complete**

## Vernacular Clarification

### **Workspace vs Project**
- **Workspace**: Working directory with persistent memory (d/lore, d/mono-repo)
- **Project**: Specific initiative within workspace ("upgrade to react 19", "make buttons round")
- **Workspace Brief**: Initial context and settings (not "project brief")

### **Onboarding Types**
1. **Workspace Onboarding**: First time in new directory
2. **Project Onboarding**: Each new request/initiative

## Example Flows

### **Example 1: New Workspace**
```
User: "i want to work on d/lore"

Flow:
1. CEO enters → no memory found
2. CEO: "What type of project is this? What are your goals?"
3. CEO defines workspace with agents
4. User reviews workspace brief
5. CEO: "Workspace ready. What would you like to work on?"

Result: Workspace onboarded, ready for first project
```

### **Example 2: Known Workspace + Auto Project Start**
```
User: "onboard into d/mono-repo and upgrade to react 19"

Flow:
1. CEO has enough context from request
2. CEO creates workspace memory
3. Agent onboarding cascade
4. CEO automatically starts "React 19 Upgrade" project
5. Project begins execution

Result: Workspace + Project both initiated
```

### **Example 3: Subsequent Project in Known Workspace**
```
User: "make the buttons round" (after React 19 project complete)

Flow:
1. CEO → creates PRD for "round buttons"
2. UX → looks at code for existing styles
3. UX → no style guide found
4. UX → human: "do you have a design in mind?"
5. Human: "google.com"
6. UX → OCR analysis of google.com
7. UX → creates sketches, saves ux.md
8. CEO → reviews UX output
9. Arch → technical approach
10. Dev → implementation
11. Complete

Questions: Do we need step 8 (CEO review)?
```

## Agent-to-Agent Flow Decision Making

### **LLM Semantic Intelligence Decides**
The LLM's system prompts and semantic understanding should determine:
- When to involve CEO vs direct agent-to-agent
- When to ask human vs proceed autonomously
- When to create formal handoffs vs continue

### **User Settings Override**
```yaml
user_preferences:
  ceo_involvement: "always" | "major_decisions" | "minimal"
  human_approval: "always" | "budget_decisions" | "never"
  agent_autonomy: "high" | "medium" | "low"
```

### **Example Decision Points**
```
UX completes design → Next step options:
1. Direct to Dev (if simple implementation)
2. Through CEO (if business implications)
3. Through Arch (if complex technical requirements)
4. To Human (if creative approval needed)

LLM decides based on:
- Complexity of change
- Business impact
- User preferences
- Project context
```

## Onboarding as Workflow

### **Workspace Onboarding Workflow**
```yaml
workflow: workspace_onboarding
goal: "Establish workspace context and agent memory"

steps:
  - agent: "ceo"
    action: "analyze_workspace_directory"
    
  - agent: "ceo" 
    action: "create_workspace_brief"
    
  - cascade: "agent_onboarding"
    agents: ["architect", "dev", "ux", "marketing", "content"]
    condition: "as_needed_basis"
    
  - agent: "ceo"
    action: "workspace_ready_confirmation"
    
  - human_checkpoint: "review_workspace_setup"
  
  - agent: "ceo"
    action: "await_first_project_request"
```

### **Project Creation Workflow**
```yaml
workflow: project_creation
goal: "Transform user request into executable project"

steps:
  - agent: "ceo"
    action: "analyze_request_intent"
    
  - agent: "ceo"
    action: "create_project_prd"
    
  - decision_point: "complexity_routing"
    simple: ["dev"]
    moderate: ["arch", "dev"] 
    complex: ["ux", "arch", "dev"]
    strategic: ["ceo", "marketing", "ux", "arch", "dev"]
    
  - execution: "project_workflow"
  
  - agent: "ceo"
    action: "project_completion_review"
```

## Real-World Examples

### **Google.com Button Analysis**
```yaml
ux_agent_process:
  input: "make buttons round like google.com"
  
  steps:
    1_analyze_current:
      - scan_existing_button_styles
      - identify_current_border_radius: "0px"
      
    2_research_reference:
      - fetch_google_homepage
      - ocr_analysis: "buttons have 24px border-radius"
      - color_analysis: "#4285f4 background"
      
    3_design_proposal:
      - create_style_guide_entry
      - generate_css_changes
      - create_visual_mockup
      
    4_save_context:
      - file: "ux.md"
      - content: "Google-inspired button design system"
      
  output: "Complete design specification ready for development"
```

### **Agent Decision Flow**
```yaml
decision_flow:
  ux_completes_design:
    
    analyze_complexity:
      - change_scope: "simple CSS update"
      - business_impact: "low"
      - technical_risk: "minimal"
      
    llm_decision: "direct_to_dev"
    reasoning: "Simple styling change, no CEO review needed"
    
    alternative_scenarios:
      - if: "major_design_system_change"
        then: "route_through_ceo"
      - if: "affects_brand_guidelines"  
        then: "human_approval_required"
      - if: "complex_technical_implementation"
        then: "route_through_architect"
```

## Key Insights

1. **Onboarding IS a workflow** - Same pattern as any other workflow
2. **Context drives decisions** - LLM uses workspace memory + request context
3. **Flexible routing** - Not rigid handoffs, semantic intelligence decides
4. **User preferences matter** - Settings override default routing
5. **Every request can spawn project** - Workspace ready for any scale of work

The system learns and adapts its routing based on success patterns and user feedback, making it smarter over time while maintaining the flexible, context-aware approach.