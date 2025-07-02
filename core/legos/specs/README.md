# 🧱 @lev-os/legos Specifications  

**The Lego Builder - Assembly, Generation & Composition Behaviors**

> 🎯 **Question**: What does "snapping legos together" actually mean in practice? We built the assembly infrastructure, now we need to define the behaviors.

## 🧠 WHAT WE BUILT (Architecture)

### Lego Builder Package Structure
```
core/legos/
├── src/
│   ├── assembly/         # Runtime: snap contexts together
│   ├── generation/       # Build-time: create new components
│   ├── templates/        # Documentation generation  
│   ├── validation/       # Use schemas to validate pieces
│   └── composition/      # Complex multi-piece assemblies
└── package.json          # NPM package with modular exports
```

### Core Capabilities Built
- **AssemblyResult**: Context composition with validation
- **GenerationResult**: New context creation from templates
- **CompositionPattern**: Multi-piece assembly orchestration
- **ValidationPipeline**: Schema-driven quality assurance
- **DocumentationGenerator**: Living docs from assembled contexts

## ❓ BEHAVIORAL QUESTIONS TO ANSWER

### 1. Runtime Assembly System
**What we built**: `assembleContexts()` function with validation  
**What we need to specify**:
- What exactly happens when you "snap contexts together"?
- How are dependencies resolved between contexts?
- What's the performance contract for assembly operations?
- How do assembly failures propagate and recover?

### 2. Build-time Generation System  
**What we built**: `generateContext()` with template rendering
**What we need to specify**:
- What templates are available and how do they work?
- How are intelligent defaults applied?
- What's the customization vs convention balance?
- How do generated contexts integrate with existing ones?

### 3. Complex Composition Patterns
**What we built**: `composeContexts()` with execution graphs
**What we need to specify**:
- What composition patterns exist (agent-workflow, research-pipeline)?
- How are execution graphs generated and used?
- What's the coordination mechanism for multi-agent assemblies?
- How do composition failures affect the entire assembly?

### 4. Validation Integration
**What we built**: Schema validation before assembly
**What we need to specify**:
- When does validation occur in the assembly pipeline?
- What's the strict vs permissive validation behavior?
- How are validation results communicated to users?
- What's the performance impact of validation on assembly?

## 🧪 DRAFT BDD FEATURES

### Feature: Context Assembly
```gherkin
Feature: Runtime Context Assembly
  As a developer building Leviathan workflows
  I want to assemble multiple contexts into cohesive structures  
  So that I can create complex behaviors from validated components

  Scenario: Successful Agent-Workflow Assembly
    Given I have a valid agent context "strategic-analyst"
    And I have a valid workflow context "market-research"
    When I assemble them with validation enabled
    Then the assembly should succeed
    And the result should contain both contexts grouped by type
    And dependency mapping should be calculated
    And composition rules should be generated

  Scenario: Assembly with Invalid Context
    Given I have an invalid agent context missing required fields
    And I have a valid workflow context
    When I assemble them with strict validation
    Then the assembly should fail
    And errors should specify which context is invalid
    And partial assembly should not be created
```

### Feature: Context Generation
```gherkin
Feature: Build-time Context Generation
  As a developer creating new Leviathan components
  I want to generate contexts from templates with intelligent defaults
  So that I can quickly create schema-compliant contexts

  Scenario: Generate Agent from Template
    Given I want to create a new agent context
    When I generate an agent with id "data-scientist" and archetype "The Analyst"
    Then a valid agent context should be created
    And it should include default thinking patterns
    And it should validate against agent.schema.yaml
    And output should be properly formatted YAML

  Scenario: Generate with Custom Template
    Given I have a custom agent template "research-specialist"
    When I generate an agent using this template
    Then the output should follow the custom template structure
    And all required fields should be populated
    And template-specific defaults should be applied
```

### Feature: Complex Composition
```gherkin  
Feature: Multi-Context Composition
  As a system architect designing complex workflows
  I want to compose multiple contexts using predefined patterns
  So that I can create sophisticated multi-agent systems

  Scenario: Research Pipeline Composition
    Given I have a research workflow context
    And I have multiple research agent contexts  
    And I have validation pattern contexts
    When I compose them using "research-pipeline" pattern
    Then an execution graph should be generated
    And parallel execution nodes should be identified
    And sequential dependencies should be mapped
    And the composition should validate pattern requirements
```

## 🎯 FEATURE DISCOVERY SESSION NEEDED

### Critical Questions:
1. **Assembly Semantics**: What does "snapping together" actually create?
2. **Dependency Resolution**: How are context relationships calculated?
3. **Execution Orchestration**: How do composed contexts actually execute?
4. **Performance Contracts**: What are the speed/memory requirements?
5. **Error Recovery**: How do partial failures affect the entire assembly?

### User Stories to Define:
- As a **workflow developer**, I want to compose agents and workflows seamlessly
- As a **system operator**, I want to understand why assemblies fail and how to fix them
- As a **template author**, I want to create reusable generation patterns
- As a **performance engineer**, I want assemblies to complete within defined time limits

## 🔧 IMPLEMENTATION GAPS

### What's Actually Missing:
1. **Real composition logic** - Current implementation is mostly scaffolding
2. **Template library** - Only basic agent template exists
3. **Dependency resolution** - Algorithm not implemented
4. **Performance benchmarks** - No speed/memory requirements defined
5. **Error handling patterns** - Basic error arrays, no recovery mechanisms

### Integration Questions:
- How does this consume schemas from @lev-os/schema?
- How does this integrate with the memory system?
- How do generated contexts get stored and retrieved?
- How does this coordinate with the agent orchestration system?

---

**Status**: Infrastructure complete, behavioral specifications needed  
**Next**: Feature discovery session to define what lego assembly actually DOES in practice