# Feature: Context Loading and Resolution
# Testing the core capability of loading and resolving Kingly contexts

Feature: Context Loading and Resolution
  As a Kingly user
  I want to load contexts with @kingly/core references
  So that I can use reusable components from the core system

  Background:
    Given the Kingly core contexts exist at "/digital/mcp-ceo/contexts/"
    And the TimeTravel project exists at "~/.kingly/projects/timetravel/"

  Scenario: Load agent context with @kingly/core reference
    Given a context reference "@kingly/core/agents/research/deep-researcher"
    When I resolve the reference using load-context.sh
    Then the path should resolve to "/digital/mcp-ceo/contexts/agents/research/deep-researcher"
    And the context.yaml file should exist
    And the context type should be "agent"
    And the following prompts should be found:
      | prompt_file     |
      | default.md      |
      | academic.md     |
      | synthesis.md    |
      | intelligence.md |

  Scenario: Load tool context
    Given a context reference "@kingly/core/tools/research/mcp-suite"
    When I resolve the reference using load-context.sh
    Then the path should resolve to "/digital/mcp-ceo/contexts/tools/research/mcp-suite"
    And the context.yaml file should exist
    And the context type should be "tool"
    And the available_tools section should include:
      | tool_name          |
      | perplexity_ask     |
      | brave_web_search   |
      | fetch_url          |
      | WebSearch          |

  Scenario: Load workflow context
    Given a context reference "@kingly/core/workflows/research/three-tier-deep"
    When I resolve the reference using load-context.sh
    Then the path should resolve to "/digital/mcp-ceo/contexts/workflows/research/three-tier-deep"
    And the context.yaml file should exist
    And the context type should be "workflow"
    And the tier definitions should exist:
      | tier_file            |
      | tier-1-base.yaml     |
      | tier-2-dynamic.yaml  |
      | tier-3-validation.yaml |

  Scenario: Load local context override
    Given a local context file "./contexts/custom-agent.yaml"
    When I load the context
    Then the local file should be used
    And any @kingly/core references within should be resolved

  Scenario: Handle missing context gracefully
    Given a context reference "@kingly/core/agents/nonexistent"
    When I attempt to resolve the reference
    Then an error should be displayed
    And the error should indicate "Context not found"
    And the system should suggest available contexts

  Scenario: Validate context dependencies
    Given a context with multiple @kingly/core dependencies
    When I load the context
    Then all dependencies should be validated
    And missing dependencies should be reported
    And the load should succeed if all dependencies exist