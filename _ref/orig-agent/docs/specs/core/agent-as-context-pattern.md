# 🤖 AGENT AS CONTEXT PATTERN SPECIFICATION

*Agents are just contexts with dynamic assembly - enabling unlimited flexibility and composition*

## 📋 **BUSINESS CASE**

**Goal**: Unified agent system where agents are contexts with type="agent", enabling unlimited flexibility and behavioral composition
**Value**: Same patterns work for simple chatbots and complex multi-agent orchestration - agents compose naturally with all other context types
**Priority**: High - Foundation for scalable agent architecture

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-AGENT-001: Agents as Universal Contexts**
```yaml
Given: Need for an AI agent with specific capabilities
When: Agent is created in the system
Then: Agent is represented as context with type="agent"
And: Agent follows same context.yaml schema as all other contexts
And: Agent can have memory, workflows, and inheritance like any context
And: Agent integrates seamlessly with projects, themes, patterns
```

### **AC-AGENT-002: Dynamic Endpoint Assembly**
```yaml
Given: Agent with multiple specialized capabilities (CEO: strategist, facilitator, negotiator)
When: User intent requires specific expertise perspective
Then: System dynamically assembles appropriate endpoint context
And: Endpoint-specific prompt, memory, and behavior is activated
And: Agent maintains consistency across endpoints while adapting behavior
```

### **AC-AGENT-003: Behavioral Composition and Inheritance**
```yaml
Given: Agent needs complex behavior combining multiple patterns
When: Agent context is assembled for execution
Then: Behaviors compose via inheritance from themes, patterns, workflows
And: Agent can inherit from cyberpunk theme + SWOT pattern + escalation workflow
And: Composition creates emergent capabilities greater than sum of parts
```

### **AC-AGENT-004: Dynamic Context Assembly**
```yaml
Given: Complex task requiring multi-perspective analysis
When: CEO agent endpoint "negotiator" is invoked
Then: System dynamically assembles context including:
  - Base CEO agent capabilities
  - Negotiator-specific prompts and behaviors
  - Multi-expert validation workflow
  - Relevant memory and past negotiations
And: Assembly is token-optimized for execution
And: Context includes appropriate injection rules for situation
```

### **AC-AGENT-005: Cross-Agent Communication**
```yaml
Given: Multiple agents need to collaborate on complex task
When: Agent spawns subtask requiring different expertise
Then: System routes to appropriate agent context via MCP
And: Receiving agent has access to relevant shared context
And: Agent handoffs preserve business goals and intent
And: Communication uses structured task and result formats
```

### **AC-AGENT-006: Recursive Agent Composition**
```yaml
Given: Need for specialized agent not currently available
When: System encounters requirement for new agent type
Then: New agent context can be composed from existing patterns
And: Agent inherits relevant behaviors from similar agent contexts
And: New agent follows same universal context architecture
And: Agent capabilities evolve through usage and memory patterns
```

## Core Concepts

### Agents ARE Contexts

```yaml
# Traditional thinking (separate concepts)
agents/ceo.yaml          # Special agent file
projects/auth.yaml       # Different structure
workflows/deploy.yaml    # Another format

# Universal context pattern (everything unified)
contexts/
  agents/
    ceo/
      context.yaml:      # Just a context with type="agent"
        type: "agent"
        capabilities: ["orchestration", "intent_recognition"]
        
  workflows/
    deploy/
      context.yaml:      # Workflow is also a context
        type: "workflow"
        steps: ["validate", "test", "deploy"]
```

### Endpoint Patterns (Google A2A Heritage)

```yaml
# Base agent context
agent://ceo                     # Default perspective

# Perspective adaptations (same agent, different lens)
agent://ceo.architect          # System design focus
agent://ceo.negotiator         # Deal-making focus
agent://ceo.strategist         # Long-term planning focus

# Behavioral adaptations
agent://ceo?mode=crisis        # Crisis response rules
agent://ceo?experimental=true  # Research features enabled

# Context protocol works everywhere
context://workflows/deploy.validate    # Workflow step
context://patterns/agile.scrum        # Pattern library
context://projects/auth.security      # Project aspect
```

### Dynamic Assembly

```yaml
# Agents assemble their prompts at runtime
agent_context:
  base_prompt: "minimal scaffolding (~500 tokens)"
  
  assembly_rules:
    - when: "intent_type == 'business_growth'"
      inject: "business strategy patterns"
      
    - when: "user_preference == 'numbered_lists'"
      inject: "numbered output formatting"
      
    - when: "complexity > 0.8"
      inject: "decomposition strategies"
      
  # Result: 2000 tokens contextual, not 6000 static
```

## Architecture

### Universal Context Schema for Agents

```yaml
# contexts/agents/{agent-name}/context.yaml
metadata:
  type: "agent"  # This makes it an agent
  id: "unique-id"
  name: "Human Readable Name"
  
intent_context:
  capabilities: ["primary_skill", "secondary_skill"]
  perspective: "default perspective/role"
  
# Polymorphic agent config
agent_config:
  interaction_style: "professional|casual|academic"
  output_preferences: "detailed|concise|numbered"
  expertise_domains: ["software", "business", "strategy"]
  
# Behavioral adaptation rules  
behavior_rules:
  - trigger: "endpoint_accessed"
    condition: "endpoint == 'architect'"
    actions:
      - inject: "system design patterns"
      - adapt: "focus on technical architecture"
      
# Standard context features work
relationships:
  extends: "../../patterns/base-orchestrator"
  depends_on: ["context://tools/analyzer"]
```

### Perspective Endpoints

```yaml
# Each endpoint provides a different analytical lens
endpoints:
  default:
    description: "Balanced general perspective"
    prompt_adaptations: "standard analysis"
    
  architect:
    description: "System design and technical focus"
    prompt_adaptations: |
      - Emphasize scalability and patterns
      - Consider technical debt
      - Focus on system boundaries
      
  negotiator:
    description: "Deal-making and compromise finding"  
    prompt_adaptations: |
      - Find win-win solutions
      - Consider stakeholder interests
      - Emphasize relationship building
```

### Interaction Templates

```yaml
# Preserve the 1-5 numbered interaction pattern
interaction_templates:
  completion_format: |
    ## ✅ ${task_completed}
    ${brief_summary}
    
    ## 🎯 Next Options
    1. **${option_1}** (${time_1}) - ${description_1}
    2. **${option_2}** (${time_2}) - ${description_2}
    3. **${option_3}** (${time_3}) - ${description_3}
    4. **${option_4}** (${time_4}) - ${description_4}
    5. **${option_5}** (${time_5}) - ${description_5}
    
    Your choice: [1-5]
```

## Flexibility Examples

### Workflow Agent Managing Workflows

```yaml
contexts/
  agents/
    workflow-orchestrator/
      context.yaml:
        type: "agent"
        capabilities: ["workflow_management", "parallel_coordination"]
        manages: ["context://workflows/*"]
```

### Workflow Context Managing Agents

```yaml
contexts/
  workflows/
    agent-coordinator/
      context.yaml:
        type: "workflow"
        coordinates: ["agent://ceo", "agent://dev", "agent://qa"]
        steps:
          - assign: "agent://ceo"
            task: "analyze requirements"
          - parallel:
              - agent: "dev"
              - agent: "qa"
```

### Recursive Meta-Agent

```yaml
contexts/
  experimental/
    meta-agent/
      context.yaml:
        type: "agent"
        capabilities: ["context_creation", "agent_synthesis"]
        can_create:
          - type: "agent"
          - type: "workflow"
          - type: "itself"  # Meta!
```

## Benefits

### For Users
- **Familiar Terms**: Still called "agents" in UI/UX
- **More Power**: Agents can contain/create any context type
- **Clean URLs**: agent://ceo feels natural
- **Flexibility**: Organize however makes sense

### For System
- **One Pattern**: Everything uses context.yaml
- **Composition**: Agents can have child agents/workflows/files
- **Inheritance**: Agents can extend patterns or other agents
- **Dynamic**: Assembly prevents prompt bloat

### For Innovation
- **Experimental**: Easy to try new agent types
- **Patterns**: Share agent patterns as contexts
- **Evolution**: Agents can modify their own context
- **Scale**: Same pattern for simple to complex agents

## Migration from Old Agent System

```yaml
# Old way
agents/ceo.yaml:
  name: "CEO"
  system_prompt: "You are the CEO..."  # Static 2000 lines
  
# New way  
contexts/agents/ceo/context.yaml:
  type: "agent"
  name: "CEO"
  # Prompt assembled dynamically from context
```

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```yaml
test_agent_context_creation:
  scenario: "Create new agent as context"
  given: "Agent specification with capabilities and endpoints"
  when: "Agent context is created"
  then: "Context follows universal schema with type='agent'"
  
test_endpoint_assembly:
  scenario: "Dynamic endpoint context assembly"
  given: "CEO agent with negotiator endpoint"
  when: "Negotiator endpoint is invoked"
  then: "Context includes negotiator-specific behavior and memory"
  
test_behavior_inheritance:
  scenario: "Agent inherits from multiple contexts"
  given: "Agent extends theme, pattern, and workflow contexts"
  when: "Agent context is assembled"
  then: "Behaviors compose without conflicts"
```

### **Integration Tests**
```yaml
test_cross_agent_communication:
  scenario: "Multi-agent task coordination"
  steps:
    1. CEO agent analyzes complex task
    2. Routes subtask to DEV agent context
    3. DEV agent inherits relevant context
    4. Results flow back with preserved intent
    
test_recursive_composition:
  scenario: "Agent creates specialized sub-agent"
  given: "Need for new agent type not yet available"
  when: "System composes new agent from existing patterns"
  then: "New agent follows universal context architecture"
  
test_workflow_agent_integration:
  scenario: "Agent manages other agents via workflows"
  given: "Workflow-orchestrator agent with parallel coordination"
  when: "Complex multi-agent task is assigned"
  then: "Orchestrator coordinates multiple agent contexts"
```

### **End-to-End Tests**
```yaml
test_complete_agent_lifecycle:
  scenario: "Agent creation, execution, evolution, and memory"
  flow:
    1. Create specialized agent via context composition
    2. Execute tasks with memory persistence
    3. Agent learns and adapts behavior patterns
    4. Agent spawns and coordinates with other agents
    5. Verify business goals preserved throughout
    
test_multi_perspective_validation:
  scenario: "CEO agent using expert validation workflow"
  given: "High-stakes decision requiring multiple perspectives"
  when: "CEO negotiator endpoint is triggered"
  then: "Multi-expert validation workflow assembles dynamically"
  and: "Legal, business, technical perspectives are synthesized"
  and: "Final decision reflects integrated expert analysis"
```

### **Performance Tests**
```yaml
performance_benchmarks:
  context_assembly: "<100ms for complex agent with 5+ inherited contexts"
  endpoint_switching: "<50ms to switch between agent endpoints"  
  agent_communication: "<200ms for cross-agent task handoff"
  memory_integration: "<150ms for agent with semantic memory lookup"
```

## 💡 **IMPLEMENTATION NOTES**

### **Migration Strategy**
```yaml
phase_1_foundation:
  - Convert existing agent YAMLs to context format
  - Implement dynamic endpoint assembly
  - Test backward compatibility
  
phase_2_enhancement:
  - Add behavioral composition and inheritance
  - Implement cross-agent communication
  - Integrate with memory system
  
phase_3_advanced:
  - Recursive agent composition
  - Self-modifying agent behaviors
  - Multi-agent workflow orchestration
```

### **Development Guidelines**
```yaml
agent_development_principles:
  - Agents are contexts first, specialized behavior second
  - All agent functionality should work with universal context patterns
  - Agent endpoints are assembled, not hardcoded
  - Memory and learning are context-inherited capabilities
  - Avoid agent-specific infrastructure - use universal context system
```

## 🎯 **SUCCESS METRICS**

### **Immediate (Week 1)**
- [ ] Existing agents work as contexts without breaking changes
- [ ] Dynamic endpoint assembly functional for CEO agent
- [ ] Agent context assembly <100ms response time

### **Enhanced (Week 2)**  
- [ ] Behavioral composition working across themes/patterns/workflows
- [ ] Cross-agent communication via MCP tools
- [ ] Memory integration enhances agent performance

### **Advanced (Month 1)**
- [ ] Recursive agent composition enables new agent types
- [ ] Multi-agent orchestration via workflow contexts
- [ ] Agent system scales to 10+ specialized agent types

## Next Steps

1. Transform existing agent specs to pattern examples
2. Create generation UI spec for first-class UX
3. Design experimental system features
4. Implement meta-language for imports

---

*The beauty: users still work with "agents" but gain the power of universal contexts. The boundaries between agents, workflows, and projects become fluid creativity tools rather than rigid constraints.*