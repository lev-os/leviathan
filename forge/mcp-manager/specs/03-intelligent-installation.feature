Feature: Intelligent MCP Server Installation
  As a developer
  I want the AI to handle all MCP server installation complexity
  So that setup "just works" without manual configuration

  Scenario: One-command development environment
    Given I have a fresh Raspberry Pi
    When I run "kingly setup ai-dev-environment"
    Then it should detect my hardware capabilities
    And it should install compatible MCP servers
    And it should configure all required dependencies
    And it should test each server works correctly
    And it should complete in under 2 minutes

  Scenario: Dependency resolution
    Given I want to install "browser-automation" MCP server
    And it requires Chrome browser
    When I run "kingly install browser-automation"
    Then it should detect missing Chrome dependency
    And it should ask permission to install Chrome
    And it should handle the installation automatically
    And it should verify browser automation works

  Scenario: Conflict detection and resolution
    Given I have MCP server A installed
    And MCP server B conflicts with server A
    When I try to install server B
    Then it should detect the conflict
    And it should explain the issue clearly
    And it should suggest resolution options
    And it should handle the resolution automatically if I agree

  Scenario: Platform-specific installation
    Given I'm running on ARM64 architecture
    When I install MCP servers
    Then it should only install ARM64-compatible servers
    And it should compile from source if needed
    And it should use platform-specific optimizations
    And it should warn about performance implications

  Scenario: Rollback on failure
    Given I'm installing multiple MCP servers
    When one server fails to install properly
    Then it should stop the installation process
    And it should rollback any partial changes
    And it should explain what went wrong
    And it should suggest fixes or alternatives

  Scenario: Update management
    Given I have MCP servers installed
    When updates are available
    Then it should notify me of updates
    And it should explain what changed
    And it should handle backwards compatibility
    And it should allow selective updates