# 🌀 UNIVERSAL CONTEXT ARCHITECTURE SPECIFICATION

*Everything is a context, every process is a workflow, every behavior is a configurable rule*

## 📋 **BUSINESS CASE**

**Goal**: Universal architecture pattern that scales human intent understanding from personal tasks to civilizational coordination through recursive context fractals
**Value**: Single framework handles "order pizza" to "coordinate planetary climate response" with same underlying pattern - everything is a context
**Priority**: High - Foundational architecture for universal AGI systems

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-UNIVERSAL-001: Recursive Context Fractal**
```yaml
Given: Any boundary, file, folder, task, project, or workflow
When: System needs to organize or process it
Then: It is represented as a context with context.yaml
And: Contexts can contain other contexts infinitely
And: Every context supports inheritance, workflows, and rules
And: Files are contexts with content, folders are contexts with children
```

### **AC-UNIVERSAL-002: Intent Recognition and Classification**
```yaml
Given: Any human expression of desire or need
When: System processes the intent
Then: Intent is captured in structured format
And: Intent_type is classified for appropriate routing
And: Intent drives all subsequent context creation and routing decisions
And: Same pattern works at personal, business, organizational, and civilizational scales
```

### **AC-UNIVERSAL-003: Polymorphic Context System**
```yaml
Given: Need for any type of boundary (logical, physical, or conceptual)
When: Context is created
Then: Single context.yaml format handles all types through polymorphism
And: Type field determines specific behaviors and metadata
And: Contexts support cascading inheritance through "extends" relationships
And: Cross-context references work across any boundary
```

### **AC-UNIVERSAL-004: YAML Rule Engine**
```yaml
Given: Context with configurable behavior requirements
When: Events occur or conditions are met
Then: YAML-defined rules determine actions
And: No hardcoded behavior - everything is configurable
And: Rules can trigger workflows, create contexts, or modify behavior
And: LLM evaluates conditions semantically, not through keywords
```

### **AC-UNIVERSAL-005: Dynamic Context Assembly**
```yaml
Given: Request requiring context-aware processing
When: System prepares agent or tool execution
Then: Context is dynamically assembled based on situation
And: Assembly includes relevant inheritance chain
And: Injection rules add conditional context
And: Result is optimized for token efficiency
```

## 🧠 **THE RECURSIVE CONTEXT FRACTAL**

### **Everything is a Context**
```yaml
universal_context_types:
  # Traditional boundaries
  workspace: "Physical isolation boundary (git repo, billing)"
  project: "Logical goal boundary (business objective)"
  task: "Execution boundary (specific deliverable)"
  
  # Everything else is also a context
  file: "Context with content data"
  folder: "Context with child contexts"
  workflow: "Context with execution steps"
  shared_resources: "Context with reusable assets"
  document_collection: "Context with knowledge artifacts"
  agent: "Context with capabilities and behaviors"
  rule_set: "Context with behavioral configurations"
  
  # Infinite extensibility through polymorphism
  custom_type: "Any new type inherits base context behavior"
```

### **Universal Context Schema**
```yaml
# context.yaml - Universal format for ANY context type
metadata:
  id: "unique-identifier"
  type: "workspace|project|task|workflow|file|folder|agent|custom..."
  name: "Human readable name"
  created: timestamp
  updated: timestamp

# Intent and inheritance (all contexts)
intent_context:
  intent_type: "personal_experience|business_growth|organizational_coordination|civilizational_impact"
  business_goal: "What we're fundamentally trying to achieve"
  extends: "reference to parent context (enables inheritance)"
  context_adaptations: "How this context differs from parent"

# Relationships (all contexts)  
relationships:
  depends_on: ["context references"]
  blocks: ["context references"]
  children: ["sub-contexts under this context"]
  shares_with: ["contexts that can access our shared resources"]

# Polymorphic configuration (type-specific)
polymorphic_config:
  # Different fields based on type
  ${type}_specific_fields: "..."

# Behavioral rules (all contexts)
behavior_rules:
  - trigger: "event_type or condition"
    condition: "LLM-evaluated semantic condition"
    action: "workflow to execute or behavior to apply"
    
# Status and execution
status:
  current: "active|inactive|archived|planning"
  progress: 0.0-1.0
  confidence: 0.0-1.0
  blocked_by: "reference to blocking context"
```

## 🌊 **INTENT CLASSIFICATION SYSTEM**

### **Intent Types and Routing Matrix**
```yaml
intent_types:
  personal_experience:
    description: "Individual needs, desires, personal growth"
    examples: ["romantic connection", "health improvement", "skill development"]
    typical_complexity: low_to_medium
    default_routing: one_shot_to_mini_workflow
    
  business_growth:
    description: "Revenue generation, customer value, operational efficiency"
    examples: ["customer acquisition", "revenue optimization", "user authentication"]
    typical_complexity: medium
    default_routing: mini_workflow_to_project
    
  organizational_coordination:
    description: "Team productivity, resource allocation, internal systems"
    examples: ["team productivity", "strategic planning", "system architecture"]
    typical_complexity: medium_to_high
    default_routing: project_to_multi_project
    
  civilizational_impact:
    description: "Governance, economic systems, planetary coordination"
    examples: ["taxation systems", "climate coordination", "global resource allocation"]
    typical_complexity: high_to_extreme
    default_routing: multi_workspace_coordination
```

### **Intent-Driven Dynamic Compression**
```yaml
compression_analysis:
  # LLM analyzes these factors
  factors:
    intent_complexity:
      - scope: "How many people/systems affected?"
      - duration: "Timeline from start to completion?"
      - dependencies: "How many external factors involved?"
      - stakeholders: "How many decision makers required?"
      
  # Routing based on intent type + complexity
  routing_decisions:
    one_shot_execution:
      when: "Simple personal tasks with clear outcomes"
      examples: ["fix typo", "order food", "schedule meeting"]
      
    mini_workflow:
      when: "Moderate complexity requiring steps"
      examples: ["add feature", "plan date", "write article"]
      
    context_creation:
      when: "Complex goals requiring structure"
      examples: ["build system", "launch product", "reorganize team"]
      
    multi_context_coordination:
      when: "Cross-boundary complexity"
      examples: ["platform architecture", "climate response", "tax reform"]
```

## 🔄 **YAML RULE ENGINE**

### **Behavioral Configuration**
```yaml
# No hardcoded behavior - everything through rules
context_behavior_rules:
  # Context creation rules
  - trigger: "context_created"
    condition: "type == 'project' AND intent_type == 'business_growth'"
    actions:
      - create_child_contexts:
          - type: "shared_resources"
            path: "./shared/"
          - type: "workflow"
            path: "./workflows/"
          - type: "task"
            path: "./tasks/"
            
  # Workflow trigger rules  
  - trigger: "task_completed"
    condition: "parent.type == 'project' AND progress > 0.8"
    actions:
      - execute_workflow: "../workflows/project-completion-check"
      - notify: "slack:#project-updates"
      
  # Inheritance rules
  - trigger: "context_extends"
    condition: "extends != null"
    actions:
      - inherit_fields: ["business_goal", "intent_type", "shared_resources"]
      - apply_adaptations: "context_adaptations"
```

### **Dynamic Context Assembly Rules**
```yaml
# Assembly based on situation
injection_rules:
  - name: "new_project_initialization"
    condition: "LLM detects: project starting from scratch"
    inject:
      - methodology_selection_guidance
      - project_scaffolding_templates
      - success_criteria_framework
      
  - name: "complexity_detection"
    condition: "LLM detects: rising complexity indicators"
    inject:
      - decomposition_strategies
      - coordination_patterns
      - risk_mitigation_approaches
      
  - name: "crisis_mode"
    condition: "LLM detects: urgent production issue"
    inject:
      - incident_response_protocol
      - rapid_assessment_tools
      - stakeholder_communication_templates
```

## 🌍 **CASCADING CONTEXT EXAMPLES**

### **Universal to Specific: Authentication**
```yaml
# Universal business goal (shared across all implementations)
contexts/universal/user-authentication/
  context.yaml:
    type: "project"
    business_goal: "Secure user authentication"
    intent_type: "business_growth"
    behavior_rules:
      - trigger: "implementation_created"
        action: "inject_security_best_practices"

# Client workspace (physical boundary)
contexts/workspaces/client-abc/
  context.yaml:
    type: "workspace"
    business_goal: "Deliver client solutions"
    polymorphic_config:
      workspace_config:
        physical_path: "~/digital/client-abc/"
        git_remote: "git@github.com:client-abc/repo.git"

# Specific implementation (inherits and adapts)
contexts/workspaces/client-abc/auth-ecommerce/
  context.yaml:
    type: "project"
    extends: "../../../universal/user-authentication"
    context_adaptations: "E-commerce payment integration, PCI compliance"
    # Inherits: business_goal, security practices, auth patterns
    # Adapts: for e-commerce specific requirements
```

### **Cross-Context Resource Sharing**
```yaml
# Shared design system
contexts/shared/design-system/
  context.yaml:
    type: "shared_resources"
    business_goal: "Consistent user experience"
    shares_with: ["workspace:*"] # Available to all workspaces
    
# Workflow library
contexts/workflows/deployment/
  context.yaml:
    type: "workflow"
    trigger_rules:
      - event: "code_push"
        condition: "branch == 'main'"
    workflow_steps:
      - validate_context
      - run_tests
      - deploy_to_staging
      - await_approval
      - deploy_to_production
```

### **Files and Folders as Contexts**
```yaml
# Even files are contexts
src/auth/login.ts/
  context.yaml:
    type: "file"
    intent_context:
      business_goal: "Handle user login flow"
      extends: "../"
    behavior_rules:
      - trigger: "file_modified"
        condition: "changes affect security"
        action: "flag_for_security_review"
        
# Folders aggregate child contexts
src/auth/
  context.yaml:
    type: "folder"
    business_goal: "Authentication subsystem"
    children: ["login.ts", "logout.ts", "session.ts"]
```

## 💫 **DYNAMIC CONTEXT ASSEMBLY**

### **Runtime Assembly Process**
```yaml
assembly_pipeline:
  1_analyze_request:
    input: "User request or task"
    process: "LLM analyzes intent and context needs"
    output: "Intent classification and requirements"
    
  2_gather_context_chain:
    input: "Current context reference"
    process: "Walk inheritance chain gathering relevant contexts"
    output: "Full context cascade"
    
  3_evaluate_injection_rules:
    input: "Context chain + current situation"
    process: "LLM evaluates which injection rules apply"
    output: "Additional context to inject"
    
  4_optimize_assembly:
    input: "Full context set"
    process: "Remove redundancy, optimize for tokens"
    output: "Optimized context for execution"
    
  5_execute_with_context:
    input: "Optimized context + request"
    process: "Execute agent/tool with assembled context"
    output: "Context-aware response"
```

### **Context Whispers**
```yaml
# Periodic check-ins during execution
whisper_system:
  triggers:
    - every_n_tokens: 1000
    - on_complexity_indicator: true
    - on_confidence_drop: true
    
  whisper_types:
    complexity_check:
      message: "Check if this is getting too complex for current approach"
      action: "Consider splitting or escalating"
      
    aha_moment_check:
      message: "Any breakthrough insights to capture?"
      action: "Log to context for pattern learning"
      
    confidence_check:
      message: "Still confident in current direction?"
      action: "Pivot or request human input if needed"
```

## 🚀 **STRATEGIC IMPLICATIONS**

### **Immediate Benefits**
- **Universal Pattern**: Everything uses same context system
- **Infinite Flexibility**: New types without architecture changes
- **Dynamic Intelligence**: Context assembled per situation
- **Token Efficiency**: Only relevant context included

### **Long-term Vision**
- **Self-Organizing**: Contexts arrange optimally through rules
- **Pattern Learning**: System discovers what works through usage
- **Universal Scaling**: Personal to planetary with same patterns
- **Emergent Intelligence**: Complex behavior from simple rules

### **The Ultimate Realization**
```yaml
everything_is_context:
  files: "contexts with content"
  folders: "contexts with children"  
  tasks: "contexts with workflows"
  projects: "contexts with sub-contexts"
  workspaces: "contexts with boundaries"
  workflows: "contexts with triggers"
  agents: "contexts with capabilities"
  rules: "contexts with behaviors"
  
# INFINITE RECURSION: contexts all the way down
# INFINITE FLEXIBILITY: any new type fits the pattern
# INFINITE INTELLIGENCE: LLM-driven assembly and rules
```

**The same system that manages a single file can coordinate planetary governance - it's all just contexts with different types and scales.**