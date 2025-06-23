# i-spec: Comprehensive Productionalization Specifications

*Complete specifications for next agent implementing the kingly-agent production system*

## 🎯 **Context: What We're Building**

### **Project History**
- Started as "seed" prototype for dropping into other projects
- Evolved into complete self-building AI agent system through simulation
- seed/ became working system, seed/generated/ became self-build output
- Now productionalizing the successful prototype into production system

### **Current Success Metrics**
- **77.8% test pass rate** during self-build evolution
- **CEO → DEV handoffs** validated in real work
- **Synthetic agent factory** creating specialists on-demand
- **Tag soup routing** for 0-token semantic matching
- **Complete project lifecycle** from idea to deployed product

## 🏗️ **Production Architecture Target**

### **Final Directory Structure**
```
kingly-agent/
├── src/                        # PRODUCTION CODE
│   ├── orchestrator.js         # Core orchestration engine
│   ├── routing/                # Routing system
│   │   ├── semantic-router.js  # Tag soup + 3-tier routing
│   │   └── vocabulary.js       # Rich vocabulary library
│   ├── agents/                 # Agent management
│   │   ├── factory.js          # Synthetic agent creation
│   │   └── registry.js         # Agent lifecycle management
│   └── workspace/              # Workspace management
│       └── manager.js          # Hierarchical persistence
├── agents/                     # PRODUCTION AGENTS (YAML + JS)
│   ├── ceo.yaml               # CEO agent definition
│   ├── ceo.js                 # CEO implementation
│   ├── dev.yaml               # DEV agent definition  
│   └── dev.js                 # DEV implementation
├── templates/                  # TOP-LEVEL TEMPLATES
│   ├── tasks/                 # Task YAML templates
│   ├── projects/              # Project structure templates
│   └── workflows/             # Workflow definition templates
├── workflows/                  # TOP-LEVEL WORKFLOWS  
│   ├── content-creation.yaml  # WRITE method implementation
│   ├── development.yaml       # CEO → DEV handoff patterns
│   └── onboarding.yaml        # Workspace onboarding flow
├── workshop/                   # EVOLUTION WORKSPACE
│   ├── current-iteration/     # Working area for next evolution
│   └── archive/               # Previous evolution attempts
└── tests/                     # Production test suite
```

## 🎯 **Agent Architecture Resolution (YAML + JS)**

### **The YAML vs JS Challenge**
- **i-agent.md specifies**: Agents should be YAML files with metadata
- **seed/ reality**: Agents are .js files that work brilliantly (1037 lines mini-dev.js)
- **Solution**: Hybrid approach - YAML definitions + JS implementations

### **Agent Definition Pattern**
```yaml
# agents/ceo.yaml - Agent Definition
metadata:
  id: "ceo"
  name: "Chief Executive Officer"
  version: "1.0.0"
  implementation: "./ceo.js"

tags:
  actions: [plan, strategize, decide, prioritize, approve, budget, evaluate]
  skills: [strategy, leadership, finance, communication, decision_making]
  domains: [business, marketing, product, operations, finance]
  contexts: [startup, enterprise, crisis, growth, pivot, launch]

scenarios:
  crisis_response:
    trigger: "app is down" || "losing money" || "emergency"
    sequential_workflow:
      - self: "assess_situation"
      - self: "communicate_stakeholders"
      - handoff: "dev"

checklist_behavior:
  always_generate: true
  completion_template: |
    ## ✅ Analysis Complete
    [What you accomplished]
    
    ## 🎯 Strategic Options
    [Present 3-4 strategic choices with reasoning]
    
    ## ❓ What's Your Priority?
    **Your choice shapes the next phase of work.**

capabilities:
  - id: "strategic_planning"
    description: "Analyze business context and create strategic plans"
    patterns: ["plan *", "strategy for *", "business case for *"]
    
  - id: "resource_allocation" 
    description: "Determine optimal resource usage and priorities"
    patterns: ["prioritize *", "allocate *", "budget for *"]

promotion_criteria:
  usage_threshold: 10
  success_rate_threshold: 0.85
  user_satisfaction_threshold: 0.8
```

```javascript
// agents/ceo.js - Agent Implementation  
export class CEOAgent {
  constructor(definition) {
    this.definition = definition;
    this.id = definition.metadata.id;
    this.capabilities = definition.capabilities;
  }

  async handle(request, context) {
    // Business logic implementation
    // Uses YAML definition for routing and behavior
  }
}
```

## 🔄 **Component Migration Specifications**

### **1. Enhanced Orchestrator → Production Orchestrator**

**Source**: `seed/enhanced-orchestrator.js` (791 lines, proven)
**Target**: `src/orchestrator.js`
**Generated Input**: `seed/workshop/orchestrator.js` (cleaner architecture)

**Migration Spec**:
```javascript
// src/orchestrator.js - Hybrid of proven + generated
export class Orchestrator extends EventEmitter {
  constructor(config = {}) {
    // Keep proven config from enhanced-orchestrator
    this.config = {
      debug: true,
      trackingEnabled: true,
      syntheticAgentThreshold: 3,
      maxTurns: 50,
      ...config
    };
    
    // Use generated plugin architecture
    this.routingEngine = new RoutingEngine(this.config);
    this.agentRegistry = new AgentRegistry();
    this.pluginSystem = new PluginSystem();
    
    // Keep proven components
    this.syntheticFactory = new SyntheticAgentFactory();
    this.workspaceManager = new WorkspaceManager();
    this.debugStore = new Map(); // Success tracking
  }
  
  // Hybrid routing: proven TagSoup + generated 3-tier
  async route(request, context = {}) {
    // Plugin hooks from generated
    const pluginResult = await this.pluginSystem.execute('beforeRoute', { request, context });
    if (pluginResult.handled) return pluginResult.result;
    
    // Proven TagSoup semantic routing
    const semanticMatch = await this.tagSoupRouter.match(request, context);
    if (semanticMatch.confidence > 0.9) return semanticMatch;
    
    // Generated 3-tier fallback
    return await this.routingEngine.route(request, context);
  }
}
```

**Integration Points**:
- Merge TagSoup vocabulary with generated pattern matching
- Preserve synthetic agent creation capability
- Maintain debug tracking and success metrics
- Add plugin architecture for extensibility

### **2. Tag Soup Router → Semantic Router**

**Source**: `seed/tag-soup-router.js` (223 lines, proven vocabulary)
**Target**: `src/routing/semantic-router.js`  
**Generated Input**: `seed/workshop/routing-engine.js` (3-tier strategy)

**Migration Spec**:
```javascript
// src/routing/semantic-router.js
export class SemanticRouter {
  constructor() {
    // Keep proven vocabulary from tag-soup-router
    this.vocabulary = this.buildVocabulary();
    
    // Add generated 3-tier strategy
    this.patternCache = new Map();
    this.complexityModel = new ComplexityAnalyzer();
  }
  
  buildVocabulary() {
    // From i-agent.md + proven tag-soup implementation
    return {
      actions: [analyze, architect, approve, audit, automate, ...], // 100+ actions
      skills: [accessibility, acquisition, agile, analytics, ...],  // 100+ skills  
      contexts: [startup_founder, enterprise_cto, ...]              // 30+ contexts
    };
  }
  
  async route(request, context) {
    // Tier 1: Tag soup semantic matching (0 tokens)
    const semanticMatch = await this.semanticMatch(request, this.vocabulary);
    if (semanticMatch.confidence > 0.9) return semanticMatch;
    
    // Tier 2: Pattern matching (from generated)
    const patternMatch = await this.patternMatch(request, context);
    if (patternMatch.confidence > 0.8) return patternMatch;
    
    // Tier 3: LLM routing (full semantic understanding)
    return await this.llmRoute(request, context);
  }
}
```

### **3. Synthetic Agent Factory → Agent Factory**

**Source**: `seed/synthetic-agent-factory.js` (462 lines, proven)
**Target**: `src/agents/factory.js`
**Generated Input**: `seed/workshop/agent-registry.js` (YAML-based)

**Migration Spec**:
- Keep proven promotion criteria (minUsage: 5, minSuccessRate: 0.8)
- Add YAML agent definition loading from generated
- Maintain template system for agent creation
- Add versioning support for agent evolution

### **4. Mini Agents → Production Agents**

**Source**: `seed/agents/mini-ceo.js` (166 lines), `seed/agents/mini-dev.js` (1037 lines)
**Target**: `agents/ceo.yaml + agents/ceo.js`, `agents/dev.yaml + agents/dev.js`

**Migration Spec**:
- Extract YAML definitions from JS implementations
- Preserve all working business logic
- Add i-agent.md checklist behaviors
- Implement i-pm.md task management patterns
- Add i-workspace.md onboarding capabilities

## 📋 **Project Management Integration**

### **Task Management (from i-pm.md)**
```yaml
# Implementation: One task per file with embedded context
# Location: .aiforge/projects/{project}/tasks/{task-id}.yaml

metadata:
  id: "auth-001"
  title: "Implement user registration"
  type: "feature"
  
ownership:
  owner: "ceo"          # Always CEO (combined BMAD roles)
  executors: ["dev"]    # Who will implement
  
business_context:
  goal: "Business objective"
  acceptance_criteria: [...]
  success_metrics: [...]
  
technical_context:
  architecture_notes: "CEO's technical guidance" 
  implementation_notes: "Dev's execution log"
  
workflow:
  current_step: "implementation"
  steps_completed: [...]
  next_steps: [...]
```

### **Workspace Management (from i-workspace.md)**
```yaml
# Implementation: Workspace > Project > Task hierarchy
# Location: .aiforge/workspace.yaml

workspace_onboarding:
  trigger: "no memory found for current workspace"
  steps:
    1_ceo_onboarding: "Analyze workspace and create PRD"
    2_agent_orchestration: "Determine needed agents"
    3_workspace_ready: "Memory established"
```

## 🔀 **Workflow System (from i-wkflw.md)**

### **Pure Flexibility with Smart Hints**
```yaml
# workflows/content-creation.yaml
goal: "Create content (blog, article, documentation)"

agents:
  - researcher: {capabilities: [gather_info, verify_facts]}
  - writer: {capabilities: [outline, draft, edit]}
  - fact_checker: {capabilities: [verify_claims, validate]}

steps:
  research_first: [researcher, writer, fact_checker, editor]
  write_first: [writer, researcher, fact_checker, editor]
  minimal_viable: [writer, fact_checker]

display_strategy: |
  Provide 3-4 smart next step options.
  Include time estimates.
  Always include "auto mode" option.
```

## 🚀 **Self-Evolution System**

### **Evolution Workflow**
```
Production System (src/, agents/) 
    ↓ when ready to evolve
Workshop (experiment, build improvements)
    ↓ test and validate  
Workshop (refined improvements)
    ↓ promote best components
Production System (enhanced src/, agents/)
```

### **Promotion Criteria**
- Component improvement validated through testing
- Performance metrics meet or exceed current system
- No regression in core functionality
- Clear documentation of changes and rationale

## 🧪 **Testing Strategy**

### **Test Coverage Requirements**
- Unit tests for all routing components
- Integration tests for agent handoffs
- End-to-end tests for complete workflows
- Self-build validation tests
- Performance regression tests

### **Validation Metrics**
- Routing accuracy ≥ 95%
- Agent handoff success rate ≥ 90%
- Task completion rate ≥ 80%
- Self-build success rate ≥ 77.8% (maintain current)

## 📦 **Implementation Phases**

### **Phase 1: Core Migration**
1. Create production directory structure
2. Migrate orchestrator with hybrid architecture
3. Migrate semantic router with vocabulary
4. Set up YAML + JS agent system
5. Basic testing framework

### **Phase 2: Agent Production**
1. Create CEO agent (YAML + JS)
2. Create DEV agent (YAML + JS)  
3. Implement agent factory with promotion
4. Add workspace management
5. Integration testing

### **Phase 3: Workflow System**
1. Implement i-pm.md task management
2. Add i-workspace.md onboarding
3. Create i-wkflw.md flexible workflows
4. End-to-end testing
5. Self-evolution validation

### **Phase 4: Polish & Documentation**
1. Complete test coverage
2. Performance optimization
3. Documentation completion
4. Workshop setup for future evolution
5. Production deployment readiness

## 🎯 **Success Criteria**

### **Functional Requirements**
- All current seed/ functionality preserved
- Agent handoffs work identically to current system
- Synthetic agent creation maintains promotion criteria
- Workspace management follows i-workspace.md spec
- Task management follows i-pm.md spec

### **Performance Requirements**
- Response time ≤ current seed/ system
- Memory usage ≤ current seed/ system  
- Routing accuracy ≥ 95%
- Self-build capability maintained

### **Architecture Requirements**
- Clean separation: YAML definitions + JS implementations
- Extensible plugin system
- Clear evolution pathway via workshop/
- Comprehensive test coverage
- Production-ready code quality

---

**This specification provides complete context for implementing the production kingly-agent system while preserving all proven functionality and adding the architectural improvements discovered through self-evolution.**