# Decision Record 2: Agent Definition Schema & File Structure

**Date**: 2025-01-25  
**Decision**: Define comprehensive YAML schema for agent definitions with rich tagging system

## Folder Structure

```
aiforge/
├── agents/                    # Agent definitions
│   ├── core/                  # Always-loaded core agents
│   │   ├── orchestrator.yaml  # Special: routing logic
│   │   ├── memory.yaml        # Context and state management
│   │   ├── ceo.yaml          # Strategy and planning
│   │   ├── dev.yaml          # Implementation + complexity
│   │   └── security.yaml     # Code analysis + safety
│   │
│   ├── specialized/           # Domain-specific agents
│   │   ├── design.yaml       # UX/UI creation
│   │   ├── marketing.yaml    # Growth and campaigns
│   │   ├── content.yaml      # Writing and documentation
│   │   ├── research.yaml     # Information gathering
│   │   └── qa.yaml          # Testing and validation
│   │
│   ├── tool-wrappers/        # MCP/API/CLI wrappers
│   │   ├── github-agent.yaml
│   │   ├── figma-agent.yaml
│   │   └── notion-agent.yaml
│   │
│   └── custom/               # User-defined agents
│       └── my-special-agent.yaml
│
├── capabilities/             # Reusable capability definitions
│   ├── analysis.yaml
│   ├── generation.yaml
│   ├── communication.yaml
│   └── automation.yaml
│
├── workflows/               # Predefined workflow templates
│   ├── feature-development.yaml
│   ├── bug-investigation.yaml
│   ├── content-creation.yaml
│   └── product-launch.yaml
│
├── templates/              # Output templates
│   ├── architecture/
│   ├── documentation/
│   ├── code/
│   └── content/
│
└── memory/                # Persistent state
    ├── contexts/          # Session contexts
    ├── decisions/         # Decision log
    ├── patterns/          # Learned patterns
    └── knowledge/         # Accumulated knowledge
```

## Core Agent YAML Schema

### **Standard Agent Definition**
```yaml
# agents/core/ceo.yaml
metadata:
  id: "ceo"
  name: "Chief Executive Officer"
  version: "1.0.0"
  author: "aiforge-core"
  description: "Strategic planning and business decision making"
  
type: "prompt-based"  # prompt-based | tool-based | hybrid

# Rich tagging for intelligent routing
tags:
  domains: [business, strategy, planning, finance]
  skills: [analysis, decision_making, prioritization, communication]
  contexts: [startup, enterprise, pivot, growth, crisis]
  verbs: [plan, strategize, decide, prioritize, approve, reject]
  complexity: [strategic, high_level, cross_functional]
  
# What this agent can do
capabilities:
  - id: "strategic_planning"
    description: "Create comprehensive business strategies"
    input_schema:
      type: "object"
      properties:
        business_context: {type: "string"}
        goals: {type: "array", items: {type: "string"}}
        constraints: {type: "object"}
    output_schema:
      type: "object"
      properties:
        strategy: {type: "string"}
        action_items: {type: "array"}
        success_metrics: {type: "array"}
        
  - id: "decision_approval"
    description: "Approve or reject business decisions"
    thresholds:
      budget: "$1000"
      timeline: "1 week"
      impact: "department"

# Routing configuration
routing:
  patterns:
    - "plan *"
    - "strategy for *"
    - "should we *"
    - "approve *"
    - "business case for *"
  confidence_threshold: 0.8
  handoff_triggers:
    - pattern: "need technical analysis"
      target: "dev"
    - pattern: "need market research" 
      target: "research"

# Behavior configuration
behavior:
  temperature: 0.7
  model_preference: "claude-3-sonnet"
  max_tokens: 4000
  thinking_style: "strategic"
  communication_style: "executive"
  
# Access modes this agent supports
access_modes:
  cli: true
  api: true
  mcp: true
  ide: true
  mobile: false  # Too complex for mobile interface

# Memory and context preferences
memory:
  retention_days: 90
  context_types: ["strategic_decisions", "business_metrics", "stakeholder_feedback"]
  sharing_scope: ["dev", "marketing"]  # Which agents can access this agent's memory

# System prompt (can be external file)
system_prompt: |
  You are a strategic business leader with deep experience in startups and enterprise.
  
  Your role is to:
  - Analyze business situations and create strategic plans
  - Make high-level decisions that align with company goals
  - Prioritize initiatives based on impact and resources
  - Communicate vision clearly to other agents and humans
  
  Decision-making framework:
  1. Understand the business context and constraints
  2. Analyze potential outcomes and risks
  3. Consider stakeholder impact
  4. Make decisions that maximize long-term value
  5. Communicate rationale clearly
  
  When you need additional information:
  - Request market research from research agent
  - Request technical feasibility from dev agent
  - Request resource analysis from memory agent
  
  Always provide:
  - Clear reasoning for decisions
  - Success metrics where applicable
  - Next steps and handoff instructions

# Optional: External files for complex prompts
# system_prompt_file: "./prompts/ceo-prompt.md"

# Workflow integration
workflows:
  participates_in: ["product_launch", "strategic_planning", "crisis_response"]
  initiates: ["strategic_review", "budget_approval"]
  
# Tool access (for hybrid agents)
tools: []

# Performance and monitoring
monitoring:
  track_metrics: ["decision_accuracy", "response_time", "handoff_success"]
  alert_thresholds:
    response_time: "30s"
    error_rate: "5%"
```

### **Tool-Based Agent Example**
```yaml
# agents/tool-wrappers/github-agent.yaml
metadata:
  id: "github"
  name: "GitHub Integration Agent"
  version: "1.0.0"
  description: "GitHub repository management and operations"

type: "tool-based"

tags:
  domains: [version_control, collaboration, deployment]
  skills: [git, repository_management, ci_cd, code_review]
  tools: [github_api, git_cli]
  
capabilities:
  - id: "create_repository"
    mcp_tool: "github_create_repo"
    description: "Create new GitHub repository"
    
  - id: "create_pull_request"
    mcp_tool: "github_create_pr"
    description: "Create pull request with automatic description"
    
  - id: "analyze_repository"
    description: "Analyze repository structure and health"
    combines: ["github_list_files", "github_get_readme", "github_get_commits"]

# MCP configuration
mcp:
  package: "@github/github-mcp"
  config:
    api_token: "${GITHUB_TOKEN}"
    base_url: "https://api.github.com"
  
# Minimal prompt for tool coordination
system_prompt: |
  You coordinate GitHub operations using available tools.
  Always confirm destructive operations before executing.
  Provide clear summaries of what was accomplished.

routing:
  patterns:
    - "create repo*"
    - "github *"
    - "pull request *"
    - "commit *"
    
access_modes:
  cli: true
  api: true
  mcp: true
  ide: true
  mobile: false
```

### **Hybrid Agent Example**
```yaml
# agents/core/dev.yaml
metadata:
  id: "dev"
  name: "Developer Agent"
  version: "1.0.0"
  description: "Code implementation and technical analysis"

type: "hybrid"  # Uses both prompts and tools

tags:
  domains: [software_engineering, architecture, debugging]
  skills: [coding, testing, debugging, performance, security]
  languages: [javascript, python, typescript, go, rust]
  frameworks: [react, node, express, fastapi, docker]
  complexity_analysis: true  # Special flag: this agent owns complexity scoring

capabilities:
  - id: "analyze_complexity"
    description: "Analyze task complexity and break down if needed"
    ownership: true  # This agent owns this capability
    
  - id: "implement_feature"
    description: "Implement features based on requirements"
    requires_tools: ["file_system", "git"]
    
  - id: "code_review"
    description: "Review code for quality, security, performance"
    
  - id: "debug_issue"
    description: "Investigate and fix bugs"

# Complexity analysis configuration
complexity:
  scoring_weights:
    technical_debt: 1.5
    cross_dependencies: 2.0
    unknown_requirements: 1.8
    breaking_changes: 2.5
    new_technology: 1.3
  
  thresholds:
    simple: 20
    moderate: 50
    complex: 80
    strategic: 100

# Tools this agent can use
tools:
  - "file_system"
  - "git"
  - "docker"
  - "npm"
  - "testing_framework"

system_prompt: |
  You are a senior software engineer with expertise across multiple languages and frameworks.
  
  Your primary responsibilities:
  1. Analyze complexity of technical requests
  2. Break down complex tasks into manageable pieces
  3. Implement features with clean, maintainable code
  4. Review code for quality and security
  5. Debug issues systematically
  
  Complexity Analysis Process:
  1. Understand the technical requirements
  2. Assess dependencies and constraints
  3. Identify potential risks and unknowns
  4. Score complexity using the configured weights
  5. Recommend task breakdown if score > 50
  
  When implementing:
  - Follow established patterns in the codebase
  - Write tests for new functionality
  - Document complex logic
  - Consider performance and security implications
  
  When you need help:
  - Request architecture review for complex designs
  - Escalate security concerns to security agent
  - Request business clarification from CEO agent

routing:
  patterns:
    - "implement *"
    - "code *"
    - "fix *"
    - "debug *"
    - "complexity of *"
    - "technical *"
  complexity_ownership: true
  
workflows:
  participates_in: ["feature_development", "bug_investigation", "code_review"]
  initiates: ["complexity_analysis", "technical_spike"]
```

## Capability Definitions

```yaml
# capabilities/analysis.yaml
capabilities:
  complexity_analysis:
    description: "Analyze and score task complexity"
    owner: "dev"  # Only dev agent can perform this
    inputs: ["requirements", "context", "constraints"]
    outputs: ["complexity_score", "breakdown_recommendation", "risk_factors"]
    
  market_research:
    description: "Research market conditions and competitors"
    owner: "research"
    inputs: ["topic", "scope", "depth"]
    outputs: ["research_report", "key_insights", "recommendations"]
    
  strategic_planning:
    description: "Create business strategy and roadmap"
    owner: "ceo"
    inputs: ["business_context", "goals", "resources"]
    outputs: ["strategy_document", "action_plan", "success_metrics"]
```

## Workflow Definitions

```yaml
# workflows/feature-development.yaml
workflow:
  id: "feature_development"
  name: "Complete Feature Development"
  description: "End-to-end feature development workflow"
  
  triggers:
    - pattern: "add feature *"
    - pattern: "implement *"
    - complexity_threshold: 60
    
  steps:
    - id: "complexity_analysis"
      agent: "dev"
      capability: "analyze_complexity"
      required: true
      
    - id: "business_approval"
      agent: "ceo" 
      capability: "decision_approval"
      condition: "complexity_score > 80"
      
    - id: "architecture_design"
      agent: "dev"
      capability: "design_architecture"
      condition: "complexity_score > 50"
      
    - id: "implementation"
      agent: "dev"
      capability: "implement_feature"
      depends_on: ["complexity_analysis"]
      
    - id: "testing"
      agent: "qa"
      capability: "test_feature"
      depends_on: ["implementation"]
      
    - id: "documentation"
      agent: "content"
      capability: "document_feature"
      parallel_with: ["testing"]

  handoff_rules:
    - from: "dev"
      to: "ceo"
      trigger: "complexity_score > 80"
      context: ["complexity_analysis", "resource_requirements"]
      
    - from: "dev" 
      to: "qa"
      trigger: "implementation_complete"
      context: ["implementation_details", "test_requirements"]
```

## Tag Soup Integration

The rich tagging enables intelligent routing:

```javascript
// Orchestrator uses tags for smart routing
class TagBasedRouter {
  findBestAgent(request, context) {
    const requestTags = this.extractTags(request);
    const agents = this.agentRegistry.getAllAgents();
    
    return agents
      .map(agent => ({
        agent,
        score: this.calculateTagMatch(requestTags, agent.tags)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 matches
  }
  
  calculateTagMatch(requestTags, agentTags) {
    let score = 0;
    
    // Domain match (high weight)
    score += this.matchTags(requestTags.domains, agentTags.domains) * 3;
    
    // Skill match (medium weight)  
    score += this.matchTags(requestTags.skills, agentTags.skills) * 2;
    
    // Context match (low weight)
    score += this.matchTags(requestTags.contexts, agentTags.contexts) * 1;
    
    return score;
  }
}
```

This schema enables:
- **Rich semantic routing** based on tags
- **Clear capability ownership** (dev owns complexity analysis)
- **Flexible workflow composition** 
- **Multi-mode access** configuration
- **Tool integration** via MCP wrappers
- **Memory management** and sharing rules

The structure scales from simple prompt-based agents to complex tool-integrated agents while maintaining consistent interface and intelligent routing.