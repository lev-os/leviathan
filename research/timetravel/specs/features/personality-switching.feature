# Feature: Personality Mode Switching
# Testing the ability to switch between different personality analysis modes

Feature: Personality Mode Switching
  As a researcher using TimeTravel
  I want to switch between personality modes
  So that I can analyze topics from multiple perspectives

  Background:
    Given the personality pattern exists at "@kingly/core/patterns/personality"
    And the TimeTravel project is initialized

  Scenario: List available personality modes
    When I run personality-mode.sh without arguments
    Then I should see all 8 personality modes:
      | mode       | personality    | description                                    |
      | visionary  | NFJ-Visionary  | Long-term implications and paradigm shifts    |
      | strategist | NTJ-Strategist | Competitive positioning and market dynamics    |
      | innovator  | NTP-Innovator  | Novel combinations and creative applications   |
      | leader     | STJ-Leader     | Practical implementation and resource mgmt     |
      | adapter    | STP-Adapter    | Flexibility and rapid response capabilities    |
      | connector  | SFP-Connector  | Stakeholder impact and relationship dynamics   |
      | caregiver  | SFJ-Caregiver  | Ethical considerations and protective measures |
      | advocate   | NFP-Advocate   | Mission alignment and values integration       |

  Scenario: Activate single personality mode
    When I run "personality-mode.sh visionary"
    Then the active personality should be "NFJ-Visionary"
    And a context file should be created at "./contexts/active-personality.yaml"
    And the context should include:
      | field        | value                           |
      | mode         | visionary                       |
      | focus_areas  | paradigm_shifts                 |
      | tone         | inspirational and forward-looking |

  Scenario: Activate all personalities mode
    When I run "personality-mode.sh all"
    Then the active mode should be "Full Spectrum Analysis"
    And the context should specify sequential analysis
    And all 8 personalities should be included in the sequence

  Scenario: Activate team mode
    When I run "personality-mode.sh team"
    Then the active mode should be "Balanced Team"
    And all personalities should have equal weight
    And synthesis should be enabled

  Scenario: Activate innovation focus mode
    When I run "personality-mode.sh innovate"
    Then the primary personalities should be:
      | personality |
      | visionary   |
      | innovator   |
    And the secondary personalities should be:
      | personality |
      | strategist  |
      | adapter     |

  Scenario: Research with active personality
    Given the personality mode is set to "strategist"
    When I run a research task
    Then the analysis should focus on:
      | aspect                  |
      | competitive_advantage   |
      | market_positioning      |
      | power_dynamics         |
      | strategic_moves        |

  Scenario: Switch personalities mid-research
    Given I'm researching "AI breakthroughs"
    And the current personality is "innovator"
    When I switch to "caregiver" personality
    Then the focus should shift from creative possibilities
    To risk assessment and ethical implications