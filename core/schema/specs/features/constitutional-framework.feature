Feature: Constitutional Framework
  As a context author in the Leviathan ecosystem
  I want all contexts to follow constitutional requirements
  So that the system maintains structural integrity and interoperability

  Background:
    Given the base schema is loaded with constitutional requirements
    And the schema defines required fields: id, type, description, version

  Scenario: Valid Context Extends Base Schema
    Given I have a context with all required constitutional fields
    When I validate it against the base schema
    Then validation should succeed
    And constitutional compliance should be confirmed
    And the context should be marked as assembly-ready

  Scenario: Context Missing Required Constitutional Field
    Given I have a context missing the "version" field
    When I validate it against the base schema
    Then validation should fail with constitutional violation
    And error should specify "Missing required constitutional field: version"
    And the context should be rejected from the assembly pipeline

  Scenario: Context with Invalid Version Format
    Given I have a context with version "v1.0" instead of semantic format
    When I validate it against the base schema
    Then validation should fail with format violation
    And error should specify "Version must follow semantic versioning: x.y.z"
    And suggestion should be provided for correct format

  Scenario: Custom Context Type Extends Base
    Given I have a custom context type "strategic-analyzer"
    And it extends the base schema with additional fields
    When I validate it against the constitutional framework
    Then base constitutional fields should be validated first
    And custom fields should be validated second
    And inheritance chain should be preserved

  Scenario: Schema Evolution with Constitutional Compatibility
    Given I have an existing context using base schema v1.0.0
    And the base schema evolves to v1.1.0 with additional optional fields
    When I validate the existing context against the new schema
    Then validation should succeed with backward compatibility
    And optional new fields should be ignored gracefully
    And no migration should be required for constitutional compliance

  Scenario: Multiple Context Types Share Constitutional Foundation
    Given I have contexts of type "agent", "workflow", and "pattern"
    When I validate all contexts against their respective schemas
    Then all should pass constitutional framework validation
    And all should inherit the same base requirements
    And type-specific validations should apply after constitutional validation