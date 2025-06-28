# ADR-009: LLM-First Browser Intelligence Architecture

## Status

Proposed

## Context

Traditional browser automation treats the browser as a tool to be controlled through DOM selectors and scripted actions. This approach fundamentally limits intelligence to predefined patterns. Analysis of Leviathan's LLM-first architecture and bi-directional communication patterns reveals an opportunity to invert this paradigm - making the browser a sensory organ for LLM intelligence rather than a puppet to be controlled.

## Decision

Implement a browser intelligence architecture where:

1. **LLM as Runtime**: The LLM becomes the primary execution engine for browsing, not JavaScript
2. **Semantic Navigation**: Intent-based navigation replaces selector-based automation
3. **Context-Aware Perception**: Browser provides rich sensory data interpreted through active contexts
4. **Emergent Understanding**: Intelligence emerges from bi-directional browser-LLM communication

## Architecture

### Core Components

```yaml
browser_intelligence_architecture:
  perception_layer:
    purpose: 'Convert web content to LLM-understandable format'
    components:
      - DOM structure analyzer
      - Visual perception engine
      - Semantic content extractor
      - Metadata enrichment

  reasoning_layer:
    purpose: 'LLM-driven understanding and decision making'
    components:
      - Context-aware analyzer
      - Goal-directed navigator
      - Multi-personality processor
      - Confidence evaluator

  action_layer:
    purpose: 'Semantic interaction with web content'
    components:
      - Intent-based navigator
      - Context-driven extractor
      - Adaptive interaction engine
      - Feedback collector

  orchestration_layer:
    purpose: 'Bi-directional intelligence flow'
    components:
      - Personality switcher
      - Workflow orchestrator
      - Insight synthesizer
      - Learning engine
```

### Key Architectural Patterns

#### 1. Browser as Sensory Organ

```javascript
// Traditional approach (WRONG)
browser.findElement('#search').click()
browser.waitForElement('.results')
results = browser.extractText('.results')

// Leviathan approach (RIGHT)
const perception = await browser.perceive(url)
const understanding = await llm.analyze(perception, {
  context: currentPersonality,
  goal: userIntent,
})
const nextAction = await llm.decide(understanding)
```

#### 2. Context-Triggered Personalities

```yaml
browser_personalities:
  web_researcher:
    extends: nfj-visionary
    focus:
      - future_implications
      - hidden_connections
      - emerging_patterns

  technical_analyst:
    extends: stp-adapter
    focus:
      - actionable_information
      - practical_steps
      - quick_implementation

  competitive_analyst:
    extends: ntj-strategist
    focus:
      - market_positioning
      - power_dynamics
      - strategic_opportunities
```

#### 3. Bi-Directional Intelligence Loop

```javascript
class BrowserIntelligence {
  async explore(url, goal) {
    let state = 'initial'
    const insights = []

    while (state !== 'complete') {
      // Browser perceives
      const perception = await this.browser.perceive()

      // LLM understands through context
      const understanding = await this.llm.analyze(perception, {
        context: this.currentPersonality,
        goal: goal,
        previousInsights: insights,
      })

      // Emergent decision making
      const decision = await this.llm.decide(understanding)

      // Context switching if needed
      if (decision.switchPersonality) {
        await this.switchContext(decision.newPersonality)
      }

      // Semantic action
      await this.browser.execute(decision.action)

      insights.push(understanding.insights)
      state = decision.state
    }

    return this.synthesize(insights)
  }
}
```

## Implementation Strategy

### Phase 1: Browser-Agent Bridge (Week 1)

- Create @lev-os/browser-agent package
- Implement Flutter-Leviathan WebSocket bridge
- Build perception engine for DOM→LLM conversion
- Test basic bi-directional communication

### Phase 2: Context Integration (Week 2)

- Develop browser-specific agent personalities
- Implement dynamic context switching
- Create semantic navigation patterns
- Test multi-personality analysis

### Phase 3: Bi-Directional Workflows (Week 3)

- Build browser-aware workflows
- Implement cognitive parliament for web analysis
- Create insight synthesis engine
- Test emergent intelligence patterns

### Phase 4: Platform Unification (Week 4)

- Abstract browser interface for mobile/desktop
- Implement Flutter browser for mobile
- Integrate Playwright for desktop
- Ensure consistent intelligence across platforms

## Consequences

### Positive

- **True Web Understanding**: Browser comprehends meaning, not just structure
- **Adaptive Intelligence**: Different contexts reveal different insights
- **Emergent Capabilities**: Intelligence beyond scripted automation
- **Natural Interaction**: Semantic goals instead of technical selectors

### Challenges

- **Performance**: LLM analysis adds latency vs direct automation
- **Complexity**: Bi-directional flow more complex than scripts
- **Debugging**: Emergent behavior harder to predict
- **LLM Costs**: Continuous LLM interaction increases API usage

### Mitigation Strategies

- **Caching**: Cache perception data and common patterns
- **Batch Processing**: Group related analyses
- **Confidence Thresholds**: Skip LLM for high-confidence actions
- **Local Models**: Use smaller local models for routine tasks

## Success Metrics

- **Understanding Quality**: 90% accuracy in comprehending page intent
- **Goal Achievement**: 85% success rate in semantic goal completion
- **Insight Generation**: 10x more insights vs traditional scraping
- **User Satisfaction**: Natural language goal specification

## Integration Points

### With Agent System

- Browser personalities extend existing EEPS framework
- Workflows integrate with cognitive parliament
- Session management tracks browsing insights

### With FlowMind Architecture

- Context switching drives browser behavior
- Bi-directional flow creates emergent intelligence
- Multiple personalities analyze same content

### With External Tools

- Integration with existing browser-use MCP tools
- Enhancement of mcp-browser-use with intelligence layer
- Compatibility with browser automation frameworks

## References

- tmp/browser-leviathan-synthesis.md
- tmp/browser-leviathan-implementation.md
- Agent contexts and EEPS framework
- FlowMind bi-directional architecture patterns

## Decision

Proceed with implementation of LLM-first browser intelligence architecture, beginning with Flutter-Leviathan bridge development.
