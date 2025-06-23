# 🚨 CRISIS RESPONSE PLUGIN SPECIFICATION

*LLM-first crisis detection and workflow activation*

## 📋 **BUSINESS CASE**

**Goal**: Enable LLM to recognize crisis situations and activate appropriate response workflows
**Value**: Rapid emergency response through intelligent situation assessment
**Priority**: Medium - Emergency preparedness capability

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-CRISIS-001: LLM Crisis Recognition**
```yaml
Given: User input contains potential crisis indicators (server down, outage, emergency)
When: LLM processes the request through MCP nexus
Then: LLM recognizes this may be a crisis situation
And: LLM assesses severity and scope using native intelligence
And: LLM determines if crisis response is warranted
And: LLM activates appropriate crisis workflows if needed
```

### **AC-CRISIS-002: Context-Aware Crisis Assessment**
```yaml
Given: LLM recognizes potential crisis situation
When: LLM evaluates the context and circumstances
Then: LLM considers current agent type (dev, ceo, ops)
And: LLM evaluates business impact and urgency
And: LLM distinguishes between actual crisis and routine issues
And: LLM makes intelligent decision about response level
```

### **AC-CRISIS-003: Crisis Workflow Activation**
```yaml
Given: LLM determines genuine crisis response is needed
When: LLM selects appropriate response strategy
Then: LLM activates crisis response workflow for current agent
And: LLM follows emergency protocols (stakeholder communication, technical triage)
And: LLM prioritizes immediate actions over normal workflow
And: LLM escalates to appropriate authority levels
```

### **AC-CRISIS-004: Crisis Response Integration**
```yaml
Given: Crisis response is activated
When: LLM manages the crisis workflow
Then: Crisis response integrates with existing MCP nexus
And: Crisis workflows follow same agentInstructions patterns
And: Crisis context is maintained through agent handoffs
And: Normal operations resume after crisis resolution
```## 🧠 **LLM-FIRST ARCHITECTURE**

### **Core Principle Compliance**
**"Can an LLM do this?" → YES**
- Crisis recognition: ✅ LLM native intelligence
- Situation assessment: ✅ LLM reasoning capability  
- Response selection: ✅ LLM decision making
- Workflow activation: ✅ LLM using existing MCP tools

### **LLM Responsibilities (Intelligence)**
- **Crisis Recognition**: Identify crisis indicators in natural language
- **Severity Assessment**: Evaluate urgency and business impact
- **Context Analysis**: Consider current agent, project state, available resources
- **Response Strategy**: Select appropriate crisis response workflow
- **Escalation Decisions**: Determine when to involve other agents/stakeholders
- **Recovery Planning**: Guide transition back to normal operations

### **MCP Tool Support (Data Access Only)**
```yaml
available_mcp_tools:
  - get_crisis_workflows() # Returns available crisis response workflows
  - activate_workflow(workflow_id) # Activates specified workflow
  - get_stakeholder_contacts() # Returns emergency contact information
  - log_crisis_event(details) # Records crisis event for audit
```

## 🔄 **CRISIS RESPONSE FLOW**

### **LLM-Driven Crisis Flow**
```
1. User Input → LLM recognizes crisis indicators
2. LLM assesses: "Is this actually a crisis?"
3. If YES → LLM selects appropriate response workflow
4. LLM activates workflow using MCP tools
5. LLM follows workflow steps with agentInstructions
6. LLM manages escalation and stakeholder communication
7. LLM guides resolution and recovery
```

### **Agent-Specific Crisis Protocols**
```yaml
crisis_workflows:
  dev_agent:
    - immediate_incident_response: "Technical triage and system stabilization"
    - rollback_protocol: "Revert recent changes that may have caused issue"
    - communication_protocol: "Update stakeholders on technical status"
    
  ceo_agent:
    - stakeholder_communication: "Notify customers, investors, team members"
    - business_impact_assessment: "Evaluate financial and reputation impact"
    - media_response: "Prepare external communications if needed"
    
  ops_agent:
    - infrastructure_response: "Assess and restore system infrastructure"
    - monitoring_activation: "Enable enhanced monitoring and alerting"
    - documentation_protocol: "Document incident for post-mortem analysis"
```

## 💡 **IMPLEMENTATION PATTERNS**

### **Natural Language Crisis Recognition**
LLM identifies crisis through natural language understanding:
- **Direct indicators**: "server is down", "critical production bug", "emergency"
- **Contextual indicators**: Urgency tone, time pressure, business impact language
- **Escalation patterns**: Multiple failed attempts, increasing severity

### **Intelligent Assessment Process**
LLM evaluates crisis using reasoning:
- **Impact assessment**: How many users/systems affected?
- **Urgency evaluation**: How quickly must this be resolved?
- **Resource analysis**: What capabilities are available right now?
- **Escalation necessity**: Who else needs to be involved?

### **MCP Nexus Integration**
Crisis response follows existing patterns:
- **agentInstructions**: Crisis context injected into all responses
- **Plugin architecture**: Crisis awareness spans all MCP calls
- **Memory integration**: Crisis context persisted across agent switches
- **Audit logging**: All crisis actions logged for post-incident review

## 🧪 **TESTING APPROACH**

**Unit Tests**: Crisis workflow availability, MCP tool access, audit logging
**Integration Tests**: LLM crisis recognition, workflow activation, agent coordination
**E2E Tests**: Complete crisis scenario from detection through resolution

## 🎯 **CORE PRINCIPLE ALIGNMENT**

**✅ LLM-First Design**: All crisis intelligence lives in LLM, not JavaScript
**✅ MCP as Nexus**: Crisis context flows through agentInstructions pattern
**✅ Bidirectional Flow**: LLM → MCP → Crisis Tools → LLM → Resolution
**✅ Everything is Agent**: Crisis response integrates with existing agent system
**✅ Native Intelligence**: LLM uses natural language understanding for crisis recognition

**❌ Anti-Pattern Avoided**: No hardcoded crisis keyword lists or JavaScript decision logic