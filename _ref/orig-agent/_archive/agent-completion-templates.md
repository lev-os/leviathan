# 🎯 AGENT COMPLETION TEMPLATES SPECIFICATION

*Agent-specific checklist formats for consistent completion patterns*

## 📋 **BUSINESS CASE**

**Goal**: Provide agent-specific completion templates that reinforce numbered choice patterns
**Value**: Consistent UX with domain-appropriate next steps for each agent type
**Priority**: Medium - Enhanced agent interaction patterns

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-TEMPLATE-001: Agent-Specific Templates**
```yaml
Given: An agent completes a task or analysis
When: Agent generates completion checklist
Then: Agent uses its specific completion template format
And: Template provides domain-appropriate next step options
And: Template includes time estimates and agent assignments
And: Template follows consistent numbered choice pattern
```

### **AC-TEMPLATE-002: CEO Completion Template**
```yaml
Given: CEO agent completes strategic work
When: CEO generates completion checklist
Then: Checklist focuses on strategic options (market research, resource planning, risk assessment)
And: Options include business-focused activities and handoffs to technical agents
And: Template reinforces CEO role as business decision maker
And: Template provides clear strategic priorities for user selection
```

### **AC-TEMPLATE-003: Dev Completion Template**
```yaml
Given: Dev agent completes technical work
When: Dev generates completion checklist
Then: Checklist focuses on technical options (code review, testing, documentation, deployment)
And: Options include implementation-focused activities and quality assurance steps
And: Template reinforces dev role as technical implementer
And: Template provides clear technical priorities for user selection
```

### **AC-TEMPLATE-004: Template Customization**
```yaml
Given: New agent types are added to system
When: Agent requires completion template
Then: Agent YAML can define custom completion_template
And: Template follows same numbered choice pattern as standard templates
And: Template reflects agent's specific domain and responsibilities
And: Template integrates with existing workflow and MCP systems
```## 🎨 **TEMPLATE SPECIFICATIONS**

### **CEO Agent Template**
```yaml
# agents/ceo.yaml
completion_template: |
  ## ✅ Analysis Complete
  {completed_work}
  
  ## 🎯 Strategic Options
  1. **Market Research** (researcher, 30min) - Competitive analysis & positioning
  2. **Technical Validation** (dev, 20min) - Feasibility and architecture review
  3. **Resource Planning** (ceo, 15min) - Budget, timeline, and team requirements
  4. **Risk Assessment** (ceo, 25min) - Identify and mitigate key risks
  
  Your strategic priority: [1-4]
```

### **Dev Agent Template**
```yaml
# agents/dev.yaml
completion_template: |
  ## ✅ Implementation Complete
  {completed_work}
  
  ## 🎯 Technical Options
  1. **Code Review** (dev, 15min) - Review implementation for best practices
  2. **Testing** (dev, 25min) - Unit tests and integration validation
  3. **Documentation** (dev, 20min) - Update architecture docs and README
  4. **Deploy to Staging** (dev, 10min) - Push to staging environment
  
  Your technical priority: [1-4]
```

### **Future Agent Template Example**
```yaml
# agents/designer.yaml
completion_template: |
  ## ✅ Design Complete
  {completed_work}
  
  ## 🎯 Design Options
  1. **User Testing** (ux, 45min) - Validate design with target users
  2. **Design System** (designer, 30min) - Create reusable components
  3. **Developer Handoff** (dev, 20min) - Provide implementation specifications
  4. **Accessibility Review** (designer, 25min) - Ensure inclusive design
  
  Your design priority: [1-4]
```

## 💡 **IMPLEMENTATION PATTERNS**

### **Template Structure Requirements**
- **Work Summary**: `{completed_work}` placeholder for dynamic content
- **Domain Focus**: Options relevant to agent's expertise area
- **Time Estimates**: Realistic time expectations for each option
- **Agent Assignments**: Clear indication of which agent handles each option
- **Numbered Choices**: Consistent [1-4] selection pattern
- **Priority Question**: Clear call-to-action for user selection

### **Integration with Existing Systems**
- **Workflow Bridge**: Templates can trigger full workflows when needed
- **MCP Nexus**: Templates inject via agentInstructions pattern
- **Agent Schema**: completion_template field added to agent YAML
- **Default Behavior**: Templates provide options when no active workflow

### **Template Customization Rules**
- Templates reflect agent's core domain expertise
- Options balance immediate actions with strategic handoffs
- Time estimates encourage realistic planning
- Agent assignments clarify responsibility boundaries

## 🧪 **TESTING APPROACH**

**Unit Tests**: Template parsing, placeholder substitution, option formatting
**Integration Tests**: Template injection into agentInstructions, agent schema validation
**E2E Tests**: Complete agent interaction with template-based completion patterns

## 🎯 **REINFORCEMENT PATTERNS**

### **Checklist Habit Formation**
- **Every completion**: Agent always provides numbered options
- **Domain consistency**: CEO gets strategic, Dev gets technical
- **Workflow integration**: Templates can escalate to full workflows
- **User training**: Consistent pattern teaches users to expect and use choices

### **Agent Role Clarity**
- **CEO templates**: Reinforce business strategy and decision-making role
- **Dev templates**: Reinforce technical implementation and quality focus
- **Future agents**: Each gets domain-specific completion patterns
- **Boundary clarity**: Templates respect agent expertise boundaries