# 🎯 Enhanced Context Architecture - Building on What Exists

## Current Reality Check

You already have:
- **Polymorphic context system** with agents, workflows, patterns, tools, themes, preferences
- **Meta-language recursion** for dynamic workflow composition  
- **Memory boundaries** and sophisticated agent capabilities
- **Working MCP integration** in src/

What's missing:
- **Organizational contexts** (workspace/project/task) as first-class context types
- **Folder contexts** for simple file organization
- **Emergent contexts** that self-organize

## The Right Approach

### 1. Add Organizational Context Types

```yaml
# contexts/types/workspace/context.yaml
metadata:
  type: "workspace"
  id: "workspace-template"
  version: "1.0.0"
  description: "Physical and billing isolation boundary"

workspace_config:
  capabilities:
    - "project_management"
    - "resource_isolation"
    - "billing_boundary"
    - "git_integration"
    
  behavior_rules:
    - trigger: "project_created"
      action: "setup_project_structure"
    - trigger: "billing_limit_approaching"
      action: "notify_stakeholders"
      
  memory_config:
    isolation: "strict"  # Don't leak across workspaces
    shares_with: []      # Explicit sharing only

# contexts/types/project/context.yaml  
metadata:
  type: "project"
  id: "project-template"
  version: "1.0.0"
  description: "Goal-oriented work container"

project_config:
  capabilities:
    - "task_management"
    - "team_coordination"
    - "progress_tracking"
    - "workflow_integration"
    
  workflow_integration:
    # Can invoke existing workflows!
    available_workflows:
      - "contexts/workflows/document-synthesis/context.yaml"
      - "contexts/workflows/multi-expert-validation/context.yaml"
      
# contexts/types/task/context.yaml
metadata:
  type: "task"
  id: "task-template"
  version: "1.0.0"
  description: "Executable work unit with confidence tracking"

task_config:
  capabilities:
    - "execution_tracking"
    - "confidence_assessment"
    - "auto_splitting"
    - "agent_assignment"
    
  behavior_rules:
    - trigger: "confidence < threshold"
      action: "split_into_subtasks"
    - trigger: "completed"
      action: "update_project_progress"
```

### 2. The Root Context Enhancement

```yaml
# /context.yaml (Enhanced root)
metadata:
  type: "root"
  id: "kingly-os"
  version: "2.0.0"
  description: "Universal context OS with organizational flexibility"

root_config:
  # Core context types (existing)
  core_types:
    - agent       # AI personalities (CEO, Dev)
    - workflow    # Executable patterns
    - pattern     # Decision frameworks
    - tool        # MCP tool definitions
    - theme       # UI/UX configurations
    - preference  # User preferences
    
  # Organizational types (NEW)
  organizational_types:
    - workspace   # Billing/isolation boundary
    - project     # Goal boundary
    - task        # Execution unit
    - folder      # Simple container
    - emergent    # Self-organizing
    
  # Type registry
  type_definitions:
    workspace:
      extends: "contexts/types/workspace/context.yaml"
      icon: "🏢"
      contains: ["project", "folder", "agent"]
      
    project:
      extends: "contexts/types/project/context.yaml"
      icon: "📁"
      contains: ["task", "workflow", "pattern"]
      
    task:
      extends: "contexts/types/task/context.yaml"
      icon: "✅"
      contains: ["task"]  # Subtasks
      
    folder:
      icon: "📂"
      contains: ["folder", "any"]
      minimal: true  # No fancy features
      
    emergent:
      icon: "🌱"
      contains: ["any"]
      evolves: true
      learns_structure: true
```

### 3. Integration with Existing System

The beauty is these new organizational contexts can:
- **Use existing workflows** - Projects can invoke document-synthesis
- **Leverage existing agents** - Tasks can be assigned to CEO or Dev agents
- **Apply existing patterns** - Use SWOT analysis on projects
- **Respect memory boundaries** - Workspaces maintain isolation

### 4. Example Usage

```yaml
# A real workspace using the system
# contexts/workspaces/client-abc/context.yaml
metadata:
  type: "workspace"
  id: "client-abc"
  extends: "/types/workspace"
  
workspace_config:
  physical_path: "~/projects/client-abc"
  git_remote: "git@github.com:client/abc.git"
  
  # This workspace uses the CEO agent!
  default_agent: "contexts/agents/ceo"
  
  # And has access to workflows
  enabled_workflows:
    - "multi-expert-validation"  # For big decisions
    - "document-synthesis"       # For research

# A project within that workspace
# contexts/workspaces/client-abc/auth-system/context.yaml
metadata:
  type: "project"
  id: "auth-system"
  extends: "/types/project"
  
project_config:
  goal: "Implement secure authentication"
  
  # Automatically use patterns for decisions
  decision_patterns:
    - "contexts/patterns/swot-analysis"
    - "contexts/patterns/rice-scoring"
    
  # Project-specific agent config
  agent_assignment:
    architecture: "dev"      # Dev agent for technical work
    negotiation: "ceo"       # CEO for vendor discussions
```

## The Implementation Path

1. **Keep existing src/** - It has working MCP, spawn, persistence
2. **Add context type definitions** - workspace/project/task as contexts
3. **Enhance root context.yaml** - Register all types
4. **Create type templates** - In contexts/types/
5. **Test with real examples** - Mix organizational with existing features

## Why This Works

- **No new infrastructure** - Uses existing context system
- **Leverages what exists** - Agents, workflows, patterns all work
- **Flexible organization** - Users choose their structure
- **Backward compatible** - Existing contexts still work
- **Forward looking** - Emergent contexts can evolve

The key insight: Workspace/Project/Task are just more context types, not special entities!