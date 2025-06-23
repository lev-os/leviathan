# 🧠 ROLE-FOCUSED COMPLEXITY WORKFLOW SPECIFICATION

*LLM-driven multi-perspective analysis through role-focused agent endpoints*

## 📋 **BUSINESS CASE**

**Goal**: Enable LLM to leverage different analytical perspectives for complex tasks
**Value**: Sophisticated multi-perspective analysis while maintaining LLM-first architecture
**Priority**: High - Core workflow enhancement for complex project handling

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-ROLE-WORKFLOW-001: LLM Complexity Assessment**
```yaml
Given: User presents a request that may benefit from multiple perspectives
When: LLM evaluates the request complexity and scope
Then: LLM decides whether to use single perspective or multi-perspective approach
And: LLM chooses appropriate role-focused endpoints based on needs
And: All complexity and routing decisions are made by LLM intelligence
```

### **AC-ROLE-WORKFLOW-002: Role-Focused Endpoint Selection**
```yaml
Given: LLM determines multi-perspective analysis is beneficial
When: LLM selects role-focused endpoints
Then: LLM can choose from available agent role combinations
And: Each endpoint provides focused analytical lens with full LLM power
And: LLM sequences endpoints based on logical analysis flow
And: Context flows naturally between perspectives
```

### **AC-ROLE-WORKFLOW-003: Workflow Guidance Integration**
```yaml
Given: LLM is evaluating complex requests
When: MCP nexus provides workflow guidance
Then: Guidance suggests available role-focused perspectives
And: Guidance provides context about each analytical lens
And: LLM makes all decisions about which perspectives to use
And: No JavaScript logic determines complexity or routing
```

### **AC-ROLE-WORKFLOW-004: Natural Flow Progression**
```yaml
Given: LLM is working through multi-perspective analysis
When: LLM completes one perspective and moves to next
Then: Context and insights flow naturally between role focuses
And: Each perspective builds on previous analysis
And: LLM can adapt sequence based on discoveries
And: Final implementation has full context from all perspectives
```## 🎯 **ROLE-FOCUSED ENDPOINT STRUCTURE**

### **CEO Agent Role Focus**
```yaml
agent://ceo.analyst:
  focus: "business analysis, market research, requirement gathering"
  context: "Analyze from business perspective: market fit, user needs, competitive advantage"
  
agent://ceo.strategist:
  focus: "strategic planning, resource allocation, priority setting"  
  context: "Plan from strategic perspective: ROI, timeline, business impact"
```

### **Dev Agent Role Focus**
```yaml
agent://dev.architect:
  focus: "system design, scalability, technical planning"
  context: "Architect from technical perspective: scalability, maintainability, tech stack"
  
agent://dev.security:
  focus: "security analysis, vulnerability assessment, compliance"
  context: "Secure from security perspective: vulnerabilities, data protection, compliance"
  
agent://dev.implementer:
  focus: "code implementation, testing, deployment"
  context: "Implement from delivery perspective: clean code, testing, documentation"
```

## 🔄 **WORKFLOW GUIDANCE PATTERNS**

### **Simple Implementation Pattern**
```yaml
single_perspective:
  endpoint: "agent://dev.implementer"
  use_case: "Direct implementation requests with clear requirements"
  context: "Straightforward coding tasks, bug fixes, simple features"
```

### **Complex Analysis Pattern**
```yaml
multi_perspective:
  suggested_flow: |
    1. agent://ceo.analyst - Business requirement analysis
    2. agent://dev.architect - Technical system design
    3. agent://dev.implementer - Implementation with full context
    
  use_case: "Complex projects requiring structured breakdown"
  context: "New applications, major features, system integrations"
```

### **Security-Critical Pattern**
```yaml
security_focused:
  suggested_flow: |
    1. agent://dev.architect - Initial technical design
    2. agent://dev.security - Security analysis and hardening
    3. agent://dev.implementer - Secure implementation
    
  use_case: "Security-sensitive features requiring expert review"
  context: "Authentication, payments, data handling, compliance"
```

## 🧠 **LLM-FIRST IMPLEMENTATION**

### **Workflow Awareness Plugin**
```javascript
const roleAwarenessPlugin = {
  name: 'role-awareness',
  always: async (context) => {
    context.result.agentInstructions += `
    
🎯 ROLE-FOCUSED ENDPOINTS AVAILABLE:
- agent://ceo.analyst (business perspective)
- agent://ceo.strategist (strategic perspective)
- agent://dev.architect (technical design perspective)
- agent://dev.security (security perspective)
- agent://dev.implementer (implementation perspective)

Choose endpoints based on your assessment of what this request needs.
For complex projects, multi-perspective analysis often provides better results.`;
  }
};
```

### **Core LLM-First Principles**
- **LLM Decides**: All complexity assessment and routing decisions
- **JavaScript Provides**: Context, tools, and endpoint availability
- **No Logic Gates**: No "if complexity > 5" type conditionals
- **Natural Intelligence**: LLM uses native understanding to evaluate needs

## 🧪 **TESTING APPROACH**

**Unit Tests**: Role endpoint context loading, guidance injection
**Integration Tests**: Multi-perspective workflow progression, context flow
**E2E Tests**: Complete complex project from analysis through implementation

## 💡 **IMPLEMENTATION BENEFITS**

### **Scales with LLM Power**
- As LLMs improve, role-focused analysis becomes more sophisticated
- No hardcoded complexity thresholds to maintain
- Natural evolution of analytical capabilities

### **Maintains Agent Boundaries**
- CEO focuses on business analysis and strategy
- Dev focuses on technical implementation and security
- Clear role separation with intelligent perspective switching