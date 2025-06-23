# 🏁 WORKSPACE ONBOARDING WORKFLOW SPECIFICATION

*Special workflow for first-time workspace initialization*

## 📋 **BUSINESS CASE**

**Goal**: Automated workspace onboarding workflow triggered when no memory exists
**Value**: Seamless workspace initialization with agent context establishment
**Priority**: High - Critical for new workspace setup

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-ONBOARD-001: Automatic Trigger Detection**
```yaml
Given: A workspace directory is accessed
When: No .kingly/workspace.yaml or agent memory exists
Then: Workspace onboarding workflow is automatically triggered
And: System detects this is a fresh workspace initialization
And: Onboarding flow begins with CEO agent analysis
```

### **AC-ONBOARD-002: CEO Onboarding Phase**
```yaml
Given: Workspace onboarding workflow is triggered
When: CEO onboarding phase executes
Then: CEO agent analyzes workspace directory structure
And: CEO defines goals and business context based on existing files
And: CEO creates workspace brief in .kingly/agents/ceo/workspace-brief.md
And: CEO determines which agents are needed for this workspace
```

### **AC-ONBOARD-003: Agent Onboarding Phase**
```yaml
Given: CEO onboarding phase is complete
When: Agent onboarding phase executes
Then: CEO orchestrates onboarding of determined agents
And: Each agent builds specialized context for this workspace
And: Agents save workspace memory in their respective directories
And: Agent context files are created (architecture.md, style-guide.md, etc.)
```

### **AC-ONBOARD-004: First Project Readiness**
```yaml
Given: Agent onboarding phase is complete
When: System reaches first project readiness
Then: Workspace is ready for first project request
And: System can auto-start projects if request has enough context
And: All agent memory is established and accessible
And: Workspace onboarding is marked complete
```## 🔄 **ONBOARDING WORKFLOW STRUCTURE**

### **Phase 1: CEO Analysis**
```yaml
trigger: "no memory found for workspace"
agent: "ceo"
duration: "5-10 minutes"

tasks:
  - analyze_workspace_directory:
      scan: [README.md, package.json, file_structure, existing_docs]
      identify: [project_type, technology_stack, business_domain]
  
  - define_business_context:
      create: workspace_goals, target_users, success_metrics
      document: .kingly/agents/ceo/workspace-brief.md
  
  - determine_needed_agents:
      required: [dev] # Always needed
      conditional:
        - frontend: if web/mobile UI detected
        - backend: if API/database detected  
        - design: if UI/UX requirements found
        - security: if sensitive data detected
```

### **Phase 2: Agent Orchestration**
```yaml
agent: "ceo"
duration: "10-15 minutes"

process:
  - for_each_needed_agent:
      action: "orchestrate_agent_onboarding"
      provide: workspace_context, business_brief, specific_role_requirements
  
  - agent_context_creation:
      dev: [architecture.md, tech-stack.md, coding-standards.md]
      frontend: [style-guide.md, component-library.md, ux-patterns.md]
      backend: [api-design.md, database-schema.md, integration-patterns.md]
      design: [brand-kit.md, design-system.md, user-personas.md]
```

### **Phase 3: Readiness Validation**
```yaml
agent: "system"
duration: "2-3 minutes"

validation:
  - workspace_yaml_created: true
  - agent_directories_populated: true
  - memory_files_exist: true
  - first_project_capability: true

completion:
  status: "workspace_onboarded"
  ready_for: "first_project_request"
  auto_start_capable: true
```

## 💡 **WORKFLOW PATTERNS**

### **Onboarding as Special Workflow Type**
- **Automatic trigger**: Unlike manual workflows, onboarding is system-initiated
- **Sequential phases**: Must complete CEO → Agent → Validation in order
- **Context building**: Each phase builds on previous phase outputs
- **One-time execution**: Onboarding only runs once per workspace

### **Integration with Regular Workflows**
- **Post-onboarding**: Regular workflows (content-creation, development) become available
- **Context enrichment**: Onboarding-created context enhances future workflow suggestions
- **Agent availability**: Onboarding determines which agents are active for workspace

## 🧪 **TESTING APPROACH**

**Unit Tests**: Phase completion validation, agent context creation, trigger detection
**Integration Tests**: Complete onboarding flow, agent orchestration, context persistence
**E2E Tests**: Fresh workspace to first project completion

## 📊 **SUCCESS CRITERIA**

**Onboarding Complete When**:
- CEO workspace brief exists and is comprehensive
- All determined agents have context files created
- workspace.yaml is properly configured
- System can handle first project request without additional setup