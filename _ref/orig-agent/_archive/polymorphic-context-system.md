# 🔄 POLYMORPHIC CONTEXT SYSTEM SPECIFICATION

*Universal context architecture replacing separate project/workspace concepts*

## 📋 **BUSINESS CASE**

**Goal**: Single context.yaml schema that handles both logical boundaries (projects) and physical boundaries (workspaces) through polymorphic type system
**Value**: Eliminates architectural complexity, enables cascading inheritance, supports universal scaling from personal to planetary
**Priority**: High - Foundational architecture simplification

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-CONTEXT-001: Universal Context Schema**
```yaml
Given: Need for any type of boundary (logical or physical)
When: Context is created
Then: Single context.yaml format handles both project and workspace types
And: Polymorphic metadata adapts based on type field
And: Inheritance through "extends" field enables context cascade
And: Cross-workspace references supported through absolute paths
```

### **AC-CONTEXT-002: Context Cascade Inheritance**
```yaml
Given: Context with "extends" reference to parent context
When: Context inherits from parent
Then: Business goals and intent types are inherited
And: Context adaptations customize inherited goals for specific implementation
And: Inheritance chain is preserved and traceable
And: Dependencies can reference any context in the cascade
```

## 🏗️ **UNIVERSAL CONTEXT SCHEMA**

```yaml
# context.yaml - Works for BOTH projects and workspaces
metadata:
  id: "unique-identifier"
  type: "project" | "workspace"
  name: "Human readable name"
  created: timestamp
  updated: timestamp

# Intent and inheritance (for all contexts)
intent_context:
  intent_type: "personal_experience | business_growth | organizational_coordination | civilizational_impact"
  business_goal: "What we're fundamentally trying to achieve"
  extends: "reference to parent context (enables inheritance)"
  context_adaptations: "How this context differs from parent"

# Relationships (for all contexts)  
relationships:
  depends_on: ["context references"]
  blocks: ["context references"]
  children: ["sub-contexts under this context"]

# Polymorphic configuration
if type == "workspace":
  workspace_config:
    physical_path: "filesystem location"
    isolation_boundary: "git repo | billing | security context"
    default_contexts: ["maintenance", "security", "experiments"]
    cross_workspace_access: ["allowed workspace references"]

if type == "project":
  project_config:
    implementation_scope: "what this project delivers"
    success_criteria: "how success is measured"
    routing_preference: "one_shot | mini_workflow | project_structure | multi_project"
    
# Status and execution
status:
  current: "active | inactive | archived | planning"
  progress: 0.0-1.0
  confidence: 0.0-1.0
  blocked_by: "reference to blocking context"
```

## 🌊 **CASCADING INHERITANCE EXAMPLES**

### **Universal to Specific: Authentication**
```yaml
# Root universal business goal
contexts/user-authentication/context.yaml:
  type: project
  business_goal: "Secure user authentication"
  intent_type: business_growth

# Physical workspace boundary
contexts/client-abc/context.yaml:
  type: workspace
  physical_path: "~/digital/client-abc/"
  business_goal: "Deliver client solutions"
  intent_type: business_growth

# Specific implementation inherits from universal
contexts/client-abc/auth-ecommerce/context.yaml:
  type: project
  extends: "../../user-authentication"
  business_goal: "Secure user authentication" # inherited
  context_adaptations: "E-commerce payment integration, PCI compliance"
```

### **Cross-Workspace Shared Dependencies**
```yaml
# Shared design system
contexts/company-shared/design-system/context.yaml:
  type: project
  business_goal: "Consistent user experience across all products"
  intent_type: business_growth

# Client project references shared resource
contexts/client-abc/website/context.yaml:
  type: project
  extends: "../../user-interfaces" 
  relationships:
    depends_on: ["workspace:company-shared/design-system"]
  context_adaptations: "Client branding on shared design system"
```

## 💡 **POLYMORPHIC BEHAVIOR PATTERNS**

### **Type-Specific Operations**
```yaml
operations_by_type:
  workspace:
    primary_operations: ["isolation", "resource_allocation", "access_control"]
    contains: ["projects", "sub-workspaces"]
    physical_mapping: "filesystem directories, git repositories, billing boundaries"
    
  project:
    primary_operations: ["goal_achievement", "progress_tracking", "dependency_management"]
    contains: ["tasks", "sub-projects"]
    logical_mapping: "business objectives, implementation scopes, success criteria"
```

### **Context Resolution Patterns**
```yaml
resolution_rules:
  relative_references: "../sibling-context" # Within same parent
  absolute_references: "/root/path/to/context" # From repository root
  workspace_references: "workspace:other-workspace/context" # Cross-workspace
  universal_references: "universal:user-authentication" # Shared business goals
```

This eliminates the project vs workspace distinction while preserving all functionality through polymorphism!