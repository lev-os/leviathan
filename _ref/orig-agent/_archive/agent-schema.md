# 🤖 AGENT SCHEMA SPECIFICATION

*Extracted from actual implemented agents (ceo.yaml, dev.yaml)*

## 📋 **BUSINESS CASE**

**Goal**: Standardized YAML schema for agent definitions based on working implementation
**Value**: Consistent agent creation, focused tags, multi-endpoint routing
**Priority**: High - Foundation for agent system

## 🏗️ **IMPLEMENTED SCHEMA**

Based on working agents in `/agents/` directory:

```yaml
metadata:
  id: "agent-id"                    # Unique identifier (required)
  name: "Human Readable Name"       # Display name (required)
  version: "1.0.0"                  # Semantic versioning (required)
  type: "strategic|technical|..."   # Agent category (required)
  description: "What this agent does" # Purpose description (required)

endpoints:                          # Multi-endpoint routing (required)
  - type: agent                     # Quick queries
    url: "agent://agent-id"
    description: "Lightweight queries and estimates"
    capabilities: [estimate, analyze, prioritize, recommend]
    
  - type: mcp                       # Stateful operations
    url: "mcp://localhost:3000/agents/agent-id"
    description: "Stateful decisions and task management"
    capabilities: [create_task, implement, manage]
    
  - type: spawn                     # Background execution
    url: "spawn://agent-id"
    description: "Long-running background tasks"
    capabilities: [deep_analysis, build, deploy]

tags:                               # Focused semantic tags (required)
  actions: [5-10 focused verbs]     # What agent DOES
  skills: [5-15 focused skills]     # What agent KNOWS
  domains: [3-8 focused areas]      # Where agent OPERATES
  contexts: [5-10 situations]       # When agent is NEEDED

capabilities:                       # Specific capabilities (required)
  - id: "capability_name"
    description: "What this capability does"
    patterns: ["pattern *", "match *", "example *"]

system_prompt: |                   # Agent behavior definition (required)
  You are a [role] focused on [purpose].
  
  Your core responsibilities:
  - Responsibility 1
  - Responsibility 2
  
  Key behaviors:
  - Behavior 1
  - Behavior 2
```

## 🎯 **SCHEMA VALIDATION RULES**

### **AC-SCHEMA-001: Required Fields**
```yaml
Given: An agent YAML file
When: Loading agent definition
Then: All required fields must be present
And: metadata.id must be unique
And: At least one endpoint must be defined
And: At least one capability must be defined
```

### **AC-SCHEMA-002: Focused Tags**
```yaml
Given: Agent tags section
When: Validating tag counts
Then: actions should have 5-10 items (not 100+)
And: skills should have 5-15 items
And: domains should have 3-8 items  
And: contexts should have 5-10 items
And: Tags should be focused and relevant
```

### **AC-SCHEMA-003: Multi-Endpoint Structure**
```yaml
Given: Agent endpoints section
When: Validating endpoint types
Then: agent:// endpoint should exist for quick queries
And: mcp:// endpoint should exist for stateful operations
And: spawn:// endpoint should exist for background tasks
And: Each endpoint should have appropriate capabilities
```

### **AC-SCHEMA-004: Capability Patterns**
```yaml
Given: Agent capabilities
When: Validating capability definitions
Then: Each capability must have id, description, patterns
And: Patterns should be realistic user inputs
And: Capabilities should match agent's domain
```

## 🧪 **TESTING APPROACH**

**Unit Tests**: YAML schema validation, required field validation
**Integration Tests**: Agent loading, endpoint routing, capability matching
**E2E Tests**: Complete agent behavior through all endpoints

## 📂 **USAGE**

**Location**: `/agents/{agent-id}.yaml`
**Naming**: Lowercase with hyphens (e.g., `content-strategist.yaml`)
**Loading**: System auto-discovers all YAML files in `/agents/` directory
**Validation**: Schema validated on system startup and agent reload