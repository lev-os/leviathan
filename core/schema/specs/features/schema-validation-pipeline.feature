Feature: Schema Validation Pipeline
  As a developer using @lev-os/schema
  I want contexts to be validated against their schemas
  So that the ecosystem maintains structural integrity and type safety

  Background:
    Given the schema package is loaded
    And all 9 schema types are available: base, agent, workflow, pattern, tool, template, validator, context, project

  Scenario: Load and Validate Agent Context
    Given I have an agent context with valid structure
    When I validate it using loadSchema('agent')
    Then the base schema validation should run first
    And the agent-specific validation should run second
    And the result should include validation: true, type: 'agent'
    And constitutional compliance should be confirmed

  Scenario: Schema Loading Performance
    Given the schema package is imported
    When I call loadSchema('agent') multiple times
    Then first load should take less than 100ms
    And subsequent loads should be cached and take less than 10ms
    And memory usage should not grow with repeated loads

  Scenario: Constitutional Inheritance Chain
    Given I load an agent schema
    When I validate a context against it
    Then base.schema.yaml requirements should be validated first
    And agent.schema.yaml extensions should be validated second
    And inheritance chain should be preserved in validation results
    And error messages should specify which level failed

  Scenario: Invalid Context Rejection
    Given I have a context missing required base field 'version'
    When I validate it against any schema type
    Then validation should fail at constitutional level
    And error should specify "Constitutional violation: missing required field 'version'"
    And the context should be rejected before type-specific validation
    And suggested fix should be provided

  Scenario: Schema Type Auto-Detection
    Given I have a context with type: 'workflow'
    When I call validateContext(context) without specifying schema type
    Then the system should auto-detect type from context.type field
    And load the appropriate workflow.schema.yaml
    And perform complete validation chain
    And return validation results with detected type

  Scenario: Multiple Contexts Batch Validation
    Given I have an array of mixed context types
    When I call validateContexts(contexts)
    Then each context should be validated against its appropriate schema
    And results should include per-context validation status
    And batch operation should fail fast on first constitutional violation
    And performance should scale linearly with context count

  Scenario: Schema Export System Integration
    Given @lev-os/legos package imports @lev-os/schema
    When legos calls loadSchema('agent')
    Then the schema should be returned in legos-compatible format
    And validation functions should be available
    And TypeScript types should be properly exported
    And integration should require no additional configuration