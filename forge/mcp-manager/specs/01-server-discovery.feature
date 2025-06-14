Feature: MCP Server Discovery
  As a developer
  I want the AI to discover relevant MCP servers for my project
  So that I don't have to manually search and evaluate options

  Background:
    Given I have a fresh development environment
    And the kingly MCP manager is installed

  Scenario: Discover servers for web development
    Given I'm working on a Next.js project
    When I run "kingly discover --for='web development'"
    Then the AI should find relevant MCP servers
    And it should include "filesystem" server
    And it should include "git" server
    And it should include "browser-automation" server
    And it should exclude irrelevant servers like "hardware-sensors"

  Scenario: Context-aware discovery
    Given I have a package.json with React dependencies
    And I have a .git directory
    When I run "kingly discover --auto"
    Then the AI should detect my project type as "React web app"
    And it should recommend React-specific MCP servers
    And it should suggest development workflow servers

  Scenario: Discovery with constraints
    Given I want to set up MCP servers
    When I run "kingly discover --budget=free --privacy=local-only"
    Then it should only suggest servers that don't require paid APIs
    And it should exclude servers that send data to external services
    And it should prioritize open-source alternatives

  Scenario: Discovery explains reasoning
    Given I run server discovery
    When the AI recommends servers
    Then it should explain why each server is relevant
    And it should show confidence scores
    And it should warn about potential conflicts