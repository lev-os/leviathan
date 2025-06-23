# 📋 TASK STRUCTURE SPECIFICATION

*Feature extracted from i-pm.md*

## 📋 **BUSINESS CASE**

**Goal**: Dual-file task system with YAML metadata and Markdown context
**Value**: Separation of business case from implementation details, supports powerful model planning with background execution
**Priority**: High - Core task management

**BDD Integration**: YAML file contains business case, goal, description, and acceptance criteria in Given/When/Then format that translates directly to test cases for developers to implement

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-TASK-001: Dual File Task Structure**
```yaml
Given: A project "payment-system" exists
When: create_task is called with name "Stripe Integration"
Then: File "payment-system/tasks/stripe-integration.yaml" is created
And: File "payment-system/tasks/stripe-integration.md" is created
And: Both files have consistent naming (lowercase slug)
```

### **AC-TASK-002: Task YAML Metadata**
```yaml
Given: A task YAML file exists
When: Reading stripe-integration.yaml
Then: It contains metadata (id, title, type, created, updated, confidence)
And: It contains ownership (owner, executors) 
And: It contains business_context (goal, business_value)
And: It contains acceptance_criteria in BDD Given/When/Then format
And: It contains status (current, blocked_by)
And: It contains dependencies (depends_on, blocks)
And: Maximum 30 lines for clean focus
```

### **AC-TASK-003: Task MD Context**
```yaml
Given: A task MD file exists  
When: Reading stripe-integration.md
Then: It contains fully formed implementation ideas
And: It includes code examples and documentation
And: It contains session context that was saved
And: It includes file references and command history
And: It has conversation summary and reasoning
```

### **AC-TASK-004: Planning vs Implementation Stage**
```yaml
Given: A task in planning stage
When: Examining task files
Then: YAML exists with business case and AC
And: MD may be minimal or absent
Given: A task ready for implementation
When: Examining task files  
Then: MD contains extensive documentation and examples
And: Background agent can execute against documentation
```

### **AC-TASK-005: Simple Status Tracking**
```yaml
Given: A task exists
When: Checking task status
Then: Status is one of: pending, in_progress, completed, blocked
And: blocked_by field explains any blockers
And: Tasks are split until they have "1 shot complete" confidence scores
And: No complex progress tracking within individual tasks
```

### **AC-TASK-006: Dependency Management**
```yaml
Given: A task with dependencies
When: Reading task YAML
Then: depends_on lists tasks that must complete first
And: blocks lists tasks that this task prevents
And: Dependencies enable project-level progress calculation
And: Dependency chains can be visualized
```

### **AC-TASK-007: Self-Contained Context**
```yaml
Given: A task is created from conversation or discussion
When: Task context is captured in MD file
Then: Task contains complete context for isolated execution
And: All key decisions, examples, and reasoning are preserved
And: Task can be completed without access to original conversation
And: Discussion insights are embedded with clear references
And: Context includes technical decisions and implementation guidance
```

### **AC-TASK-008: Automated Context Capture**
```yaml
Given: User requests to save conversation context or LLM recognizes capture opportunity
When: Context capture workflow is triggered
Then: LLM analyzes conversation for actionable tasks and decisions
And: LLM proposes task organization with clear boundaries
And: LLM creates tasks using existing task creation tools
And: Each task receives complete self-contained context from discussion
And: Context capture preserves full conversational reasoning and examples
```

## 🧪 **TESTING APPROACH**

**BDD Translation**: Acceptance criteria in YAML translate directly to test cases
**Unit Tests**: File naming, YAML structure, content validation, BDD format validation
**Integration Tests**: File creation, content persistence, stage transitions
**E2E Tests**: Complete task lifecycle from planning to implementation

**Example Task Structure**:
```yaml
# stripe-integration.yaml (30 lines max)
metadata:
  id: "stripe-integration"
  title: "Implement Stripe Payment Integration"
  type: "feature"
  created: "2025-05-28T10:00:00Z"
  updated: "2025-05-28T15:30:00Z"
  confidence: 0.9

ownership:
  owner: "ceo"
  executors: ["dev"]

business_context:
  goal: "Enable secure payment processing"
  business_value: "Allows users to purchase premium features"

acceptance_criteria:
  - Given: User is on payment page
    When: They enter valid credit card details
    Then: Payment is processed successfully
    And: User receives confirmation email

status:
  current: "completed"
  blocked_by: null

dependencies:
  depends_on: ["user-authentication"]
  blocks: ["subscription-management"]

# Becomes test case:
test('AC: Payment processing', async () => {
  const user = await setupUserOnPaymentPage();
  await user.enterCreditCard(validCardDetails);
  const result = await user.submitPayment();
  expect(result.status).toBe('success');
  expect(await user.getConfirmationEmail()).toBeDefined();
});
```

### **Context Capture Examples**

**From Discussion to Self-Contained Task**:
```yaml
# role-endpoint-implementation.yaml (generated from conversation)
metadata:
  id: "role-endpoint-implementation"
  title: "Implement agent://base.role endpoint pattern"
  context_source: "conversation_2025-05-28_endpoint-design"
  
business_context:
  goal: "Enable multi-perspective analysis through role-focused endpoints"
  decision_rationale: "Chosen over separate agents to maintain LLM-first architecture"
  
technical_context:
  architecture_decisions: |
    - Use agent://dev.architect, agent://dev.security pattern
    - Role context injection via endpoint parsing
    - Maintain single agent with perspective switching
  implementation_approach: |
    - Extend agent schema with role_endpoints section
    - Add endpoint URL parsing (agent://base.role format)
    - Create role context injection system
    
conversation_context: |
    ## Key Discussion Points
    - Complexity workflow needs structured multi-perspective analysis
    - Rejected separate agents (violates LLM-first principle)
    - Rejected mask switching (confusing agent identity)
    - Role-focused endpoints provide analytical lenses with clear boundaries
```

**Progress Tracking Strategy**:
- **Individual tasks**: Binary status (pending → in_progress → completed)
- **Project level**: Count completed/total tasks with dependency awareness
- **Progress bars**: Show at project/workspace level for motivation
- **Context Validation**: Tasks verified as self-contained and executable in isolation