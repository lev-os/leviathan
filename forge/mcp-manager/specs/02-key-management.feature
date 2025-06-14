Feature: AI-Powered Key Management
  As a developer
  I want the AI to securely manage my API keys
  So that I never have to manually configure credentials again

  Background:
    Given the kingly key vault is initialized
    And I have encrypted storage available

  Scenario: First-time key collection
    Given I have no stored API keys
    When I run "kingly setup openai-mcp-server"
    Then it should detect that OpenAI API key is required
    And it should prompt me securely for the key
    And it should encrypt and store the key
    And it should test the key validity
    And it should never display the key in plaintext

  Scenario: Key reuse across servers
    Given I have an OpenAI API key stored
    When I install another OpenAI-dependent MCP server
    Then it should automatically use the existing key
    And it should not prompt me again
    And it should ask for permission before reusing

  Scenario: Key rotation and updates
    Given I have stored API keys
    When I run "kingly keys rotate openai"
    Then it should guide me through key rotation
    And it should update all dependent MCP servers
    And it should verify new key works before removing old one
    And it should handle rollback if new key fails

  Scenario: Environment-specific keys
    Given I work on multiple projects
    When I run "kingly keys scope --project=client-work"
    Then it should create project-specific key isolation
    And keys from personal projects should not leak
    And I should be able to switch contexts safely

  Scenario: Key security audit
    Given I have multiple API keys stored
    When I run "kingly keys audit"
    Then it should check for expired keys
    And it should warn about keys with excessive permissions
    And it should suggest least-privilege alternatives
    And it should detect potentially compromised keys