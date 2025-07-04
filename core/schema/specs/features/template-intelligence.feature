Feature: Template Intelligence System
  As a context author using @lev-os/schema
  I want intelligent templates with embedded LLM guidance
  So that I can create high-quality contexts with built-in assistance

  Background:
    Given the template intelligence system is loaded
    And BMAD-inspired smartdown format is supported
    And template.smart.md files can contain [[LLM:]] instructions

  Scenario: Smart Template Loading
    Given I have a template.smart.md file with [[LLM:]] instructions
    When I load the template using loadTemplate('concept-lifecycle-analysis')
    Then the markdown content should be parsed
    And [[LLM:]] instruction blocks should be extracted
    And template variables should be identified
    And usage guidance should be available

  Scenario: Template Variable Substitution
    Given a smart template with variables {concept-name} and {status}
    When I apply the template with values: concept-name="ceo-orchestrator", status="specification"
    Then all template variables should be replaced
    And [[LLM:]] instructions should remain intact
    And the result should be valid markdown
    And variable validation should prevent incomplete substitution

  Scenario: LLM Instruction Processing
    Given a template with [[LLM: This template does X. When using: 1. Fill Y 2. Remember Z]]
    When I process the template for LLM consumption
    Then the instruction should be extracted and formatted
    And context should be provided to the LLM
    And the template content should be prepared for variable substitution
    And usage guidance should be automatically generated

  Scenario: Template Validation Against Schema
    Given a template that generates agent contexts
    When I validate the template against agent.schema.yaml
    Then template structure should be checked for constitutional compliance
    And variable placeholders should be validated for required fields
    And generated content should pass schema validation
    And template errors should provide clear guidance

  Scenario: BMAD Integration Pattern
    Given BMAD-style embedded YAML in templates
    When I process a template with YAML frontmatter + markdown + [[LLM:]] blocks
    Then YAML metadata should be parsed and validated
    And markdown content should preserve formatting
    And LLM instructions should be available for processing
    And the combination should create complete template intelligence

  Scenario: Template Library Management
    Given multiple smart templates in the schema package
    When I query available templates by category
    Then templates should be grouped by type: agent, workflow, pattern, etc.
    And each template should include description and usage guidance
    And template dependencies should be tracked
    And version compatibility should be validated

  Scenario: Dynamic Template Generation
    Given a schema definition for 'agent' type
    When I request auto-generation of a template
    Then a smart template should be created with appropriate variables
    And [[LLM:]] guidance should be generated based on schema structure
    And constitutional requirements should be embedded
    And the template should validate against its target schema