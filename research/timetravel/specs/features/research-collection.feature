Feature: Research Data Collection
  As a research intelligence system
  I want to collect data from multiple sources
  So that I can analyze trends and opportunities

  Background:
    Given the research plan engine is initialized
    And I have valid configuration for all sources

  Scenario: Daily arXiv Paper Collection
    Given I have a research plan with arXiv source
    And the arXiv source is configured for "cs.AI" category
    When I execute the plan collection phase
    Then I should receive at least 5 papers
    And each paper should have title, abstract, authors
    And papers should be from the last 7 days
    And papers should include arXiv ID and PDF URL
    And papers should be tagged with categories

  Scenario: arXiv Multi-Category Collection
    Given I have a research plan with arXiv source
    And the arXiv source is configured for categories ["cs.AI", "cs.LG", "cs.CL"]
    When I execute the plan collection phase
    Then I should receive papers from all requested categories
    And papers should be deduplicated by arXiv ID
    And papers should be sorted by submission date descending

  Scenario: arXiv Keyword Search
    Given I have a research plan with arXiv source
    And the arXiv source is configured for keywords ["neural network", "transformer"]
    When I execute the plan collection phase
    Then I should receive papers containing the keywords
    And paper titles or abstracts should contain at least one keyword
    And results should be relevant to the search terms

  Scenario: Twitter AI Researcher Monitoring
    Given I have a research plan with Twitter source
    And I have valid Twitter API credentials
    And the Twitter source is configured to monitor accounts ["karpathy", "ylecun"]
    When I execute the plan collection phase
    Then I should collect recent tweets
    And tweets should be filtered to exclude retweets
    And tweets should include engagement metrics
    And tweets should have author information
    And tweets should be from the last 24 hours

  Scenario: GitHub Trending Repo Detection
    Given I have a research plan with GitHub source
    And I have valid GitHub API credentials
    And the GitHub source is configured to search for trending AI repos
    When I execute the plan collection phase
    Then I should find repos with >100 stars
    And repos should be created in the last week
    And repos should be tagged with AI/ML topics
    And repos should include star count and fork metrics

  Scenario: Source Handler Error Handling
    Given I have a research plan with arXiv source
    And the arXiv API is temporarily unavailable
    When I execute the plan collection phase
    Then the system should handle the error gracefully
    And continue with other available sources
    And log the error for debugging
    And mark the source as failed in results

  Scenario: Rate Limiting Compliance
    Given I have a research plan with multiple API sources
    And the sources have rate limiting configured
    When I execute the plan collection phase multiple times rapidly
    Then the system should respect rate limits
    And delay requests when limits are approached
    And not receive HTTP 429 errors
    And complete successfully with all data

  Scenario: Data Standardization Across Sources
    Given I have a research plan with multiple source types
    And sources include arXiv, Twitter, and GitHub
    When I execute the plan collection phase
    Then all collected items should have standardized format
    And each item should have id, title, content, url fields
    And each item should have created_at timestamp
    And each item should have source identification
    And metrics should be normalized across sources

  Scenario: Filter Application
    Given I have a research plan with arXiv source
    And the source has filters configured for minimum 2 authors
    And the source has date filters for last 30 days
    When I execute the plan collection phase
    Then results should be filtered according to configuration
    And all papers should have at least 2 authors
    And all papers should be within the date range
    And filtered count should be reported in metrics

  Scenario: Empty Results Handling
    Given I have a research plan with arXiv source
    And the source is configured for a very specific keyword with no results
    When I execute the plan collection phase
    Then the system should handle zero results gracefully
    And return an empty array for that source
    And not throw errors or crash
    And report zero count in metrics
    And continue processing other sources

  Scenario: Large Dataset Handling
    Given I have a research plan with arXiv source
    And the source is configured to fetch 100 papers
    When I execute the plan collection phase
    Then the system should handle large datasets efficiently
    And complete within reasonable time (< 30 seconds)
    And not exceed memory limits
    And return all requested papers
    And maintain data quality throughout

  Scenario: Connection Testing
    Given I have a research plan with arXiv source
    When I run a dry-run test on the plan
    Then the system should test connectivity to arXiv
    And report connection status for each source
    And provide sample data for verification
    And identify any configuration issues
    And suggest fixes for problems

  Scenario: Concurrent Source Collection
    Given I have a research plan with multiple sources
    And sources include arXiv, Twitter, and GitHub
    When I execute the plan collection phase
    Then sources should be processed concurrently when possible
    And total execution time should be less than sequential processing
    And all sources should complete successfully
    And results should be merged correctly
    And no data should be lost during concurrent processing 