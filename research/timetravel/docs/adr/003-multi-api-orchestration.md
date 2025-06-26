# ADR-003: Multi-API Orchestration Strategy

## Status

Accepted

## Context

The TimeTravel research system needs to leverage multiple AI research APIs to conduct comprehensive, multi-perspective analysis. Each API has different strengths:

- **Perplexity Sonar**: Real-time web search with citations
- **Elicit**: Academic paper analysis (125M+ papers)
- **DeepSeek**: Cost-effective verification (90% cheaper)
- **Claude 3.5**: Superior reasoning and synthesis

We need a strategy to orchestrate these APIs effectively while managing costs, rate limits, and ensuring quality results.

## Decision

We will implement a **Multi-Agent Orchestration Pattern** with the following principles:

1. **Parallel Execution**: Run multiple research perspectives simultaneously
2. **Tool Specialization**: Each API used for its strengths
3. **Cross-Validation**: Results verified across multiple sources
4. **Intelligent Routing**: Query routing based on intent and cost

### Orchestration Flow

```yaml
research_flow:
  1_discovery:
    tool: perplexity_sonar
    purpose: 'Broad exploration'

  2_deep_research:
    parallel:
      - tool: perplexity_deep_research
        focus: 'Comprehensive web analysis'
      - tool: elicit
        focus: 'Academic literature'
      - tool: deepseek
        focus: 'Cost-effective verification'

  3_synthesis:
    tool: claude_3.5
    purpose: 'Meta-analysis and insights'
```

### Implementation Pattern

```javascript
class ResearchOrchestrator {
  async conduct(topic) {
    // Parallel research gathering
    const results = await Promise.all([this.technicalResearch(topic), this.academicResearch(topic), this.marketResearch(topic)])

    // Cross-validation
    const validated = await this.validate(results)

    // Final synthesis
    return await this.synthesize(validated)
  }
}
```

## Consequences

### Positive

- **Comprehensive Coverage**: Multiple perspectives ensure thorough research
- **Cost Optimization**: Use cheaper APIs for verification
- **Quality Assurance**: Cross-validation improves accuracy
- **Performance**: Parallel execution reduces total time

### Negative

- **Complexity**: Managing multiple APIs increases system complexity
- **Cost Management**: Need careful monitoring to control expenses
- **Rate Limiting**: Must handle different rate limits per API
- **Inconsistency**: Different APIs may return conflicting information

### Mitigation Strategies

1. **Caching Layer**: Cache common queries to reduce API calls
2. **Budget Controls**: Daily/monthly spending limits per API
3. **Fallback Logic**: Graceful degradation if an API fails
4. **Quality Metrics**: Track accuracy and adjust routing

## Related Decisions

- ADR-001: CLI-first MCP wrapper strategy
- ADR-002: Perplexity deep research integration
