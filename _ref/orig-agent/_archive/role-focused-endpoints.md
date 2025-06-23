# 🎯 ROLE-FOCUSED ENDPOINTS SPECIFICATION

*Agent endpoint extensions for focused analytical perspectives*

## 📋 **BUSINESS CASE**

**Goal**: Extend agent schema to support role-focused endpoints for multi-perspective analysis
**Value**: Single agents can provide different analytical lenses through endpoint specialization
**Priority**: High - Foundation for role-focused complexity workflows

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-ENDPOINT-001: Role Endpoint Schema Extension**
```yaml
Given: Agent YAML definition requires role-focused capabilities
When: Agent schema is extended with role_endpoints section
Then: Agents can define multiple analytical perspectives
And: Each role endpoint has focus area and context hints
And: Role endpoints integrate with existing agent routing system
And: LLM can access different analytical lenses through endpoint selection
```

### **AC-ENDPOINT-002: Endpoint Context Loading**
```yaml
Given: Role-focused endpoint is called (e.g., agent://dev.architect)
When: MCP system loads agent with role context
Then: Agent receives base capabilities plus role-specific focus
And: Role context hints are injected into agent instructions
And: Full LLM intelligence is available with focused analytical lens
And: Agent maintains core identity while applying role perspective
```

### **AC-ENDPOINT-003: Role Endpoint Routing**
```yaml
Given: LLM chooses to use role-focused endpoint
When: Request is routed to specific role endpoint
Then: Endpoint URL pattern agent://base_agent.role is supported
And: Routing system loads appropriate role context
And: Agent responds with role-focused analytical perspective
And: Response maintains consistency with base agent capabilities
```

### **AC-ENDPOINT-004: Multi-Role Integration**
```yaml
Given: Complex workflow requires multiple role perspectives
When: LLM sequences different role-focused endpoints
Then: Context flows naturally between different role focuses
And: Each role perspective builds on previous analysis
And: Final output integrates insights from all perspectives
And: Role switching preserves project context and continuity
```## 🏗️ **ENHANCED AGENT SCHEMA**

### **Role Endpoints Extension**
```yaml
# Enhanced agent schema with role-focused endpoints
metadata:
  id: "dev"
  name: "Development Agent"
  
role_endpoints:
  architect:
    focus: "system design and technical planning"
    context_hints: ["scalability", "maintainability", "tech_stack_optimization"]
    analytical_lens: "Technical architecture and system design perspective"
    
  security:
    focus: "security analysis and compliance" 
    context_hints: ["vulnerabilities", "data_protection", "compliance_requirements"]
    analytical_lens: "Security and risk assessment perspective"
    
  implementer:
    focus: "code implementation and delivery"
    context_hints: ["clean_code", "testing", "documentation", "deployment"]
    analytical_lens: "Implementation and delivery perspective"

routing_patterns:
  "agent://dev.architect": "Load dev agent with architect role focus"
  "agent://dev.security": "Load dev agent with security role focus"
  "agent://dev.implementer": "Load dev agent with implementer role focus"
```

### **CEO Agent Role Extensions**
```yaml
# CEO agent with strategic role focuses
metadata:
  id: "ceo"
  name: "Chief Executive Officer"
  
role_endpoints:
  analyst:
    focus: "business analysis and market research"
    context_hints: ["market_fit", "user_needs", "competitive_analysis"]
    analytical_lens: "Business analysis and market research perspective"
    
  strategist:
    focus: "strategic planning and resource allocation"
    context_hints: ["roi_analysis", "timeline_planning", "business_impact"]
    analytical_lens: "Strategic planning and business decision perspective"
```

## 🔧 **IMPLEMENTATION PATTERNS**

### **Role Context Injection**
```javascript
function loadRoleContext(agentId, role) {
  const agent = loadAgent(agentId);
  const roleEndpoint = agent.role_endpoints[role];
  
  return {
    base_agent: agent,
    role_focus: roleEndpoint.focus,
    context_hints: roleEndpoint.context_hints,
    analytical_lens: roleEndpoint.analytical_lens,
    instructions: generateRoleInstructions(agent, roleEndpoint)
  };
}

function generateRoleInstructions(agent, roleEndpoint) {
  return `You are ${agent.name} applying ${roleEndpoint.analytical_lens}.
          Focus on: ${roleEndpoint.focus}
          Consider: ${roleEndpoint.context_hints.join(', ')}
          Apply your full LLM intelligence through this analytical perspective.`;
}
```

### **Endpoint URL Parsing**
```javascript
function parseRoleEndpoint(endpointUrl) {
  // Parse agent://dev.architect format
  const match = endpointUrl.match(/^agent:\/\/(\w+)\.(\w+)$/);
  if (match) {
    return {
      agentId: match[1],
      role: match[2],
      type: 'role-focused'
    };
  }
  // Fallback to standard agent:// format
  return parseStandardEndpoint(endpointUrl);
}
```

## 💡 **ROLE PERSPECTIVE PRINCIPLES**

### **Analytical Lens Philosophy**
- **Same Intelligence**: Full LLM capabilities available in all roles
- **Focused Context**: Role provides analytical framework and priorities
- **Natural Perspective**: LLM applies role focus through native understanding
- **Seamless Switching**: Context flows naturally between role perspectives

### **Role Boundary Guidelines**
- **CEO Roles**: Business analysis, strategic planning, market evaluation
- **Dev Roles**: Technical architecture, security analysis, implementation
- **Future Roles**: Design, operations, testing, marketing perspectives
- **Cross-Role**: Context sharing maintains project continuity

## 🧪 **TESTING APPROACH**

**Unit Tests**: Role context loading, endpoint URL parsing, instruction generation
**Integration Tests**: Role-focused responses, context preservation, multi-role workflows
**E2E Tests**: Complete multi-perspective analysis with role switching

## 🚀 **SCALABILITY FEATURES**

### **Future Role Extensions**
- Easy addition of new role endpoints to existing agents
- Role-focused endpoints for specialized domains (design, operations, etc.)
- Dynamic role creation based on project needs
- Role expertise evolution with LLM advancement