Feature: Zero-Configuration Experience
  As a developer
  I want MCP servers to work without any manual configuration
  So that I can focus on building instead of setup

  Scenario: The 60-second demo
    Given I have a fresh machine with only kingly installed
    When I run "kingly bootstrap web-dev"
    Then within 60 seconds I should have:
      | Component | Status |
      | Node.js environment | ✅ Ready |
      | Git integration | ✅ Ready |
      | File system access | ✅ Ready |
      | Browser automation | ✅ Ready |
      | Code analysis tools | ✅ Ready |
    And I should be able to start coding immediately

  Scenario: Intent-based setup
    Given I want to build a React app with AI features
    When I say "kingly setup for building AI-powered React apps"
    Then it should understand my intent
    And it should install React-specific MCP servers
    And it should add AI/LLM integration servers
    And it should configure development workflow tools
    And it should test everything works together

  Scenario: Learning from usage patterns
    Given I frequently work with databases
    And I often need API testing tools
    When I run "kingly setup --learn-from-history"
    Then it should analyze my past projects
    And it should predict tools I'll likely need
    And it should pre-install common combinations
    And it should ask before installing expensive resources

  Scenario: Context-aware smart defaults
    Given I'm in a Next.js project directory
    When I run "kingly enhance-project"
    Then it should detect the project type automatically
    And it should suggest relevant MCP servers
    And it should configure servers with project-specific settings
    And it should integrate with existing package.json scripts