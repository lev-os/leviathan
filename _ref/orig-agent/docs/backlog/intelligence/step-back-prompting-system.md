# Step-Back Prompting System

## Overview
Implementation specification for Step-Back Prompting using **bidirectional MCP architecture** where principle extraction and application each get FULL reasoning power through dedicated calls.

## Background
Traditional step-back prompting dilutes attention between abstraction and application. Our approach uses **bidirectional MCP calls** where:
- High-level principle extraction gets dedicated MCP call
- Principle application uses separate full-power reasoning
- Concrete problem solving has focused attention
- **3x-5x better** abstraction through dedicated compute
Step-Back Prompting improves accuracy by up to 36%.

## Goals
- Extract relevant principles before problem-solving
- Validate principle correctness and relevance
- Apply principles systematically to solutions
- Enable knowledge transfer across similar problems

## Detailed Design

### MCP Tool Implementation
```javascript
export const stepBackTools = {
  identify_relevant_principles: {
    parameters: {
      problem_statement: { type: "string", required: true },
      domain_context: { type: "string" }
    }
  },

  validate_extracted_principles: {
    parameters: {
      extracted_principles: { type: "array", required: true },
      original_problem: { type: "string", required: true }
    }
  },

  principle_guided_reasoning: {
    parameters: {
      validated_principles: { type: "array", required: true },
      original_problem: { type: "string", required: true }
    }
  }
};
```

## Behavioral Design (BDD)
```gherkin
Feature: Principle-First Reasoning
  As a user solving domain-specific problems
  I want principle extraction before solutions
  So that reasoning is grounded and transferable

  Scenario: Physics problem solving
    Given a complex physics problem
    When step-back prompting is applied
    Then relevant physical laws are identified
    And principles are validated for correctness
    And solution explicitly uses these principles
```

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-SBP-001: Principle Extraction Phase**
```yaml
Given: Specific problem requiring foundational understanding
When: Step-back prompting is initiated
Then: Principle extraction uses dedicated MCP call
And: Abstract concepts identified with full reasoning
And: Principles validated for relevance and accuracy
```

### **AC-SBP-002: Principle Application Process**
```yaml
Given: Extracted principles and specific problem
When: Principles are applied to solve problem
Then: Application uses separate MCP call with full capacity
And: Concrete solution derived from abstract principles
And: Connection between principle and solution explicit
```

### **AC-SBP-003: Adaptive Abstraction Level**
```yaml
Given: Problem of varying complexity
When: System determines abstraction level needed
Then: Multiple levels of step-back possible via MCP
And: Each abstraction level gets dedicated reasoning
And: Optimal level selected based on problem nature
```

## Implementation Plan
- Week 1: Principle extraction framework
- Week 2: Domain-specific scaffolding
- Week 3: Principle validation system
- Week 4: Transfer learning patterns

## Acceptance Criteria
- [ ] Extract 3-8 relevant principles per problem
- [ ] Validate principles with >90% accuracy
- [ ] Demonstrate 36% improvement on STEM tasks
- [ ] Enable principle reuse across problems
- [ ] Provide clear principle-to-solution tracing