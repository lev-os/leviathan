# 🏭 @lev-os/schema Specifications

**The Lego Factory - Constitutional Framework Behaviors**

> 🎯 **Question**: What does the constitutional framework actually DO? We built the structure, now we need to define the behaviors.

## 🧠 WHAT WE BUILT (Architecture)

### Schema Package Structure
```
core/schema/
├── src/
│   ├── base.schema.yaml        # Constitutional foundation
│   ├── agent.schema.yaml       # Agent lego mold
│   ├── workflow.schema.yaml    # Workflow lego mold  
│   ├── pattern.schema.yaml     # Pattern lego mold
│   ├── tool.schema.yaml        # Tool lego mold
│   ├── template.schema.yaml    # Template lego mold
│   ├── validator.schema.yaml   # Validator lego mold
│   ├── context.schema.yaml     # Context lego mold
│   └── project.schema.yaml     # Project lego mold
└── package.json                # NPM package with exports
```

### 9 Lego Block Types Rescued
- Moved from broken `/digital/kingly/~/lev/` path
- Each schema extends base.schema.yaml
- Constitutional inheritance pattern established

## ❓ BEHAVIORAL QUESTIONS TO ANSWER

### 1. Constitutional Framework
**What we built**: `base.schema.yaml` with required fields  
**What we need to specify**:
- How does inheritance actually work?
- What happens when a context violates the constitution?
- How are validation failures handled?
- What's the extension mechanism for new lego types?

### 2. Schema Validation Pipeline
**What we built**: TypeScript interfaces for validation  
**What we need to specify**:
- When does validation occur? (runtime vs build-time vs load-time)
- What's the performance contract? (validation latency requirements)
- How do validation errors propagate?
- What's the fallback behavior for unknown schema types?

### 3. Lego Mold Definition
**What we built**: 9 sophisticated schema types  
**What we need to specify**:
- How are new lego types added to the factory?
- What's the approval process for schema changes?
- How do schema versions evolve?
- What's the migration path for contexts using old schemas?

## 🧪 DRAFT BDD FEATURES

### Feature: Constitutional Inheritance
```gherkin
Feature: Schema Constitutional Framework
  As a context author in the Leviathan ecosystem
  I want all contexts to follow constitutional requirements
  So that the system maintains structural integrity

  Scenario: Valid Context Extends Base
    Given I have a context with required fields: id, type, description, version
    When I validate it against the base schema
    Then validation should succeed
    And constitutional compliance should be confirmed

  Scenario: Invalid Context Missing Required Field  
    Given I have a context missing the 'version' field
    When I validate it against the base schema
    Then validation should fail
    And error should specify "Missing required field: version"
```

### Feature: Lego Mold Validation
```gherkin
Feature: Agent Schema Validation
  As a developer creating agent contexts
  I want to ensure my agent follows the agent lego mold
  So that it can be properly assembled by the lego builder

  Scenario: Valid Agent Context
    Given I have an agent with persona and toolkit
    When I validate it against agent.schema.yaml
    Then validation should succeed
    And agent should be marked as assembly-ready

  Scenario: Agent Missing Persona
    Given I have an agent without persona information
    When I validate it against agent.schema.yaml  
    Then validation should fail
    And error should specify "Agent missing required field: persona"
```

## 🎯 FEATURE DISCOVERY SESSION NEEDED

### Questions for Next Session:
1. **Performance Requirements**: How fast should schema validation be?
2. **Error Handling**: What happens when validation fails?
3. **Extension Mechanism**: How do we add new lego types?
4. **Version Management**: How do schemas evolve over time?
5. **Integration Points**: How does this integrate with @lev-os/legos?

### User Stories to Define:
- As a **context author**, I want to know immediately if my context violates the constitution
- As a **lego builder**, I want guaranteed valid inputs from the schema factory
- As a **system administrator**, I want to track schema compliance across the ecosystem  
- As a **framework developer**, I want to extend the lego types without breaking existing contexts

## 🔧 IMPLEMENTATION GAPS

### What's Missing:
1. **Actual validation implementation** - We have TypeScript interfaces, need runtime validation
2. **Error message specifications** - What exactly do users see when validation fails?
3. **Performance benchmarks** - What are the speed requirements?
4. **Integration contracts** - How does @lev-os/legos consume these schemas?

---

**Status**: Architecture complete, behavioral specifications needed  
**Next**: Feature discovery session to define what the constitutional framework actually DOES