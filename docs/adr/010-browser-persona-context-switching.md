# ADR-010: Browser Persona Context Switching Architecture

## Status

Proposed

## Context

Web browsing is not a monolithic activity - different goals require different analytical lenses. A competitive analyst sees market dynamics where a technical researcher sees implementation details. Traditional browser automation lacks this contextual awareness. Building on ADR-009's LLM-first browser intelligence and Leviathan's EEPS personality framework, we can create context-aware browser personas that fundamentally change how we interact with web content.

## Decision

Implement a browser persona system that:

1. **Extends EEPS Framework**: Browser personas inherit from existing agent personalities
2. **Dynamic Context Switching**: Automatically switch personas based on content and goals
3. **Multi-Perspective Analysis**: Apply cognitive parliament to web content
4. **Emergent Insights**: Different personas reveal different truths in same content

## Architecture

### Browser Persona Hierarchy

```yaml
browser_personas:
  base_personas:
    web_explorer:
      description: 'General purpose web navigation'
      extends: base_agent
      capabilities:
        - broad_scanning
        - curiosity_driven
        - pattern_detection

  specialized_personas:
    web_researcher:
      extends: nfj-visionary
      browser_specific:
        perception_focus:
          - future_implications
          - hidden_connections
          - paradigm_shifts
        navigation_style:
          - explore_broadly
          - follow_intuition
          - seek_novel_perspectives
        extraction_priorities:
          - conceptual_insights
          - trend_indicators
          - emergent_patterns

    technical_analyst:
      extends: stp-adapter
      browser_specific:
        perception_focus:
          - implementation_details
          - code_examples
          - practical_steps
        navigation_style:
          - direct_to_documentation
          - find_working_examples
          - verify_claims
        extraction_priorities:
          - executable_code
          - configuration_details
          - dependency_information

    competitive_analyst:
      extends: ntj-strategist
      browser_specific:
        perception_focus:
          - market_positioning
          - competitive_advantages
          - strategic_moves
        navigation_style:
          - analyze_competitors
          - map_ecosystems
          - identify_opportunities
        extraction_priorities:
          - pricing_strategies
          - feature_comparisons
          - market_dynamics
```

### Context Switching Patterns

#### 1. Automatic Persona Selection

```javascript
class PersonaSelector {
  async detectOptimalPersona(url, goal, initialPerception) {
    // Analyze content type
    const contentAnalysis = await this.analyzeContent(initialPerception)

    // Match to goal
    const goalAlignment = await this.alignToGoal(goal)

    // Select best persona
    const personas = {
      technical: ['documentation', 'code', 'api', 'tutorial'],
      research: ['paper', 'study', 'analysis', 'trend'],
      competitive: ['pricing', 'features', 'comparison', 'market'],
      financial: ['investor', 'earnings', 'financial', 'stock'],
    }

    return this.matchPersona(contentAnalysis, goalAlignment, personas)
  }
}
```

#### 2. Multi-Persona Analysis

```yaml
browser_workflows:
  cognitive_parliament_browsing:
    description: 'Multiple personas analyze same content'
    steps:
      - parallel_analysis:
          personas:
            - web_researcher: 'What future implications?'
            - technical_analyst: 'How to implement?'
            - competitive_analyst: 'Market positioning?'
            - risk_analyst: 'What could go wrong?'

      - synthesis:
          method: cognitive_parliament
          output: unified_intelligence_report
```

#### 3. Context-Triggered Behaviors

```javascript
class ContextAwareBrowser {
  constructor() {
    this.triggers = {
      financial_data_detected: {
        action: 'switch_to_financial_analyst',
        reasoning: 'Specialized analysis needed for financial content',
      },
      code_repository_detected: {
        action: 'switch_to_code_archaeologist',
        reasoning: 'Deep technical analysis required',
      },
      emotional_manipulation_detected: {
        action: 'switch_to_psychological_defender',
        reasoning: 'Critical analysis of persuasion tactics',
      },
    }
  }

  async processPerception(perception) {
    for (const [condition, response] of Object.entries(this.triggers)) {
      if (await this.detectCondition(condition, perception)) {
        await this.executeResponse(response)
      }
    }
  }
}
```

### Implementation Architecture

#### 1. Flutter-Leviathan Bridge Enhancement

```dart
class PersonaAwareBridge {
  void updateBrowserPersonality(String personaId) {
    // Load persona-specific behaviors
    final persona = PersonaLoader.load(personaId);

    // Update injection scripts
    webView.injectJavaScript(persona.perceptionScript);

    // Update extraction patterns
    extractionEngine.updatePatterns(persona.extractionPriorities);

    // Update navigation hints
    navigationAssist.updateStrategy(persona.navigationStyle);
  }
}
```

#### 2. Persona State Management

```javascript
export class BrowserPersonaManager {
  constructor(dependencies) {
    this.contextLoader = dependencies.contextLoader
    this.currentPersona = null
    this.personaHistory = []
    this.insights = new Map()
  }

  async switchPersona(newPersona, reason) {
    // Save current persona insights
    if (this.currentPersona) {
      this.insights.set(this.currentPersona.id, await this.gatherInsights())
    }

    // Load new persona
    this.currentPersona = await this.contextLoader.load(`agents/browser-personas/${newPersona}`)

    // Record switch
    this.personaHistory.push({
      from: this.previousPersona?.id,
      to: newPersona,
      reason,
      timestamp: Date.now(),
    })

    // Apply persona to browser
    await this.applyPersonaToBrowser()
  }
}
```

## Implementation Strategy

### Quick POC (3-5 Days)

1. Create 2-3 basic browser personas
2. Implement simple WebSocket bridge
3. Test persona switching on single page
4. Demonstrate different insights from same content

### Full Implementation (3-4 Weeks)

- Week 1: Core persona infrastructure
- Week 2: Automatic persona selection
- Week 3: Multi-persona workflows
- Week 4: Learning and optimization

## Consequences

### Positive

- **Contextual Intelligence**: Right analytical lens for each situation
- **Richer Insights**: Multiple perspectives reveal hidden patterns
- **Adaptive Behavior**: Browser behavior matches user intent
- **Personality Continuity**: Leverage existing EEPS framework

### Challenges

- **Persona Management**: Complexity of multiple active contexts
- **Switching Overhead**: Context switches add latency
- **Coherence**: Maintaining coherent narrative across personas
- **User Understanding**: Explaining why browser "thinks differently"

### Mitigation Strategies

- **Persona Caching**: Pre-load likely personas
- **Smooth Transitions**: Gradual persona blending
- **Unified Synthesis**: Always provide coherent summary
- **Transparency Mode**: Explain persona reasoning

## Success Metrics

- **Insight Diversity**: 5x more unique insights per page
- **Goal Achievement**: 90% semantic goal completion
- **Persona Accuracy**: 85% optimal persona selection
- **User Satisfaction**: Natural, intelligent browsing experience

## References

- ADR-009: LLM-First Browser Intelligence
- EEPS Personality Framework (agent/contexts/agents/eeps/)
- Cognitive Parliament workflow
- Browser implementation plans in tmp/

## Decision

Proceed with browser persona implementation, starting with POC using existing EEPS framework personas adapted for browsing contexts.
