# Feature: Three-Tier Research Workflow
# Testing the complete three-tier research execution flow

Feature: Three-Tier Research Workflow
  As a TimeTravel researcher
  I want to execute three-tier deep research
  So that I can progressively explore topics with increasing depth

  Background:
    Given the three-tier workflow is loaded
    And all required MCP tools are available
    And API keys are configured in .env

  Scenario: Execute complete three-tier research
    Given the research topic "subquadratic attention mechanisms"
    When I execute "kingly-sim.sh research 'subquadratic attention mechanisms'"
    Then Tier 1 should execute with:
      | stream                  | duration | tools                           |
      | architecture_revolution | 30_min   | WebSearch, perplexity_ask      |
      | world_models           | 30_min   | memory_retrieve, search_exa     |
      | reasoning_evolution    | 30_min   | WebSearch, search_tavily       |
      | efficiency_innovations | 30_min   | perplexity_ask, WebSearch      |
    And Tier 2 should dynamically generate based on Tier 1 findings
    And Tier 3 should validate strategic positioning
    And a comprehensive report should be generated

  Scenario: Tier 1 parallel execution
    Given Tier 1 is starting
    When the four research streams begin
    Then all streams should execute in parallel
    And each stream should maintain independence
    And results should be synthesized after completion
    And relevance scores should be assigned to findings

  Scenario: Tier 2 dynamic generation
    Given Tier 1 has completed with findings:
      | finding                     | relevance |
      | LoLCATs linear attention   | 0.9       |
      | Hyena hierarchy operators  | 0.8       |
      | Minor optimization         | 0.3       |
      | Flash attention update     | 0.7       |
    When Tier 2 streams are generated
    Then only findings with relevance >= 0.7 should be pursued
    And 3 deep dive streams should be created:
      | stream                    | based_on                  |
      | LoLCATs deep analysis    | LoLCATs linear attention  |
      | Hyena implementation     | Hyena hierarchy operators |
      | Flash attention impact   | Flash attention update    |

  Scenario: Tier 3 strategic validation
    Given Tier 2 has completed deep dives
    When Tier 3 validation begins
    Then the following dimensions should be evaluated:
      | dimension                 | weight |
      | competitive_advantage     | 0.3    |
      | white_space_opportunities | 0.25   |
      | technical_differentiation | 0.25   |
      | implementation_feasibility| 0.2    |
    And positioning recommendations should be generated
    And action items should be prioritized

  Scenario: Memory integration throughout workflow
    Given memory system is enabled
    When research workflow executes
    Then memory should be checked at Tier 1 start
    And valuable findings should be saved after each tier
    And final synthesis should be stored in memory
    And connections to previous research should be identified

  Scenario: Cost-optimized tool usage
    Given the research is in progress
    When tools are selected for tasks
    Then the cost optimization hierarchy should be:
      | priority | tools                              |
      | 1        | memory_retrieve, WebSearch         |
      | 2        | brave_web_search, fetch_url        |
      | 3        | perplexity_ask, search_tavily      |
      | 4        | arxiv_search, semantic_scholar     |
    And premium tools should only be used when necessary

  Scenario: Research output generation
    Given the three-tier research has completed
    When the final report is generated
    Then it should include:
      | section                    | content                            |
      | executive_summary          | 2-3 paragraph overview             |
      | key_findings              | 5-7 bullet points with evidence    |
      | deep_analysis             | Structured findings from all tiers |
      | strategic_implications    | Positioning recommendations        |
      | recommended_actions       | Prioritized next steps             |
      | further_research_needed   | Identified knowledge gaps          |
    And the report should be saved to "./outputs/research/"