# ADR-002: Perplexity Deep Research Integration

## Status

Accepted

## Context

The TimeTravel project requires sophisticated research capabilities to track AI landscape evolution across multiple time horizons. Current implementation uses basic Perplexity Sonar via MCP, which provides single-step queries but lacks comprehensive research depth.

Key requirements:

- Multi-perspective analysis (technical, academic, market, user, future)
- Source validation and citation tracking
- Cost-effective research at scale
- Integration with existing research engine

## Decision

We will integrate Perplexity API directly with support for both Sonar (quick search) and Deep Research (comprehensive analysis) tiers, implementing a 5-perspective research orchestration pattern.

### Architecture Components

1. **Perplexity Client** (`src/core/integrations/perplexity/client.ts`)

   - Dual-mode support: Sonar and Deep Research
   - Async/await pattern for API calls
   - Built-in retry and error handling
   - Token usage tracking

2. **Research Orchestrator** (`src/core/integrations/perplexity/orchestrator.ts`)

   - 5-perspective parallel research execution
   - Perspective-specific prompting
   - Cross-perspective synthesis
   - Confidence scoring

3. **Configuration** (`src/core/integrations/perplexity/config.ts`)
   - Environment-based API key management
   - Rate limiting configuration
   - Cost tracking setup

### Research Perspectives

1. **Technical Implementation** - Architecture, code, feasibility
2. **Academic Research** - Papers, theories, validation
3. **Market & Industry** - Companies, adoption, pricing
4. **User Impact** - Use cases, pain points, value
5. **Future Implications** - Trajectories, risks, paradigms

### Cost Model

- **Sonar**: $5/1000 searches + $1/1M tokens
- **Deep Research**: $0.15 per session (30+ searches)
- **Estimated monthly**: $150 for comprehensive monitoring

## Consequences

### Positive

- **Comprehensive Coverage**: 5-perspective analysis provides 360° view
- **Scalable Research**: Parallel execution enables efficient deep dives
- **Cost Optimization**: Tiered approach (Sonar → Deep Research) manages spend
- **Research Repository Ready**: Structured outputs feed directly into repository
- **MCP Compatibility**: Can coexist with existing MCP integration

### Negative

- **API Dependency**: Requires Perplexity subscription and API availability
- **Rate Limits**: Must manage 60 req/min (Sonar), 10 req/min (Deep Research)
- **Initial Complexity**: More complex than single MCP tool calls
- **Cost Overhead**: Deep Research tier adds significant monthly cost

### Mitigation Strategies

1. **Caching Layer**: Cache common queries and research results
2. **Intelligent Routing**: Use Sonar for quick checks, Deep Research for strategic analysis
3. **Batch Processing**: Group related queries to optimize API usage
4. **Fallback Options**: Maintain MCP integration as backup

## Implementation Plan

### Phase 1: Core Integration (Complete)

- ✅ Perplexity client implementation
- ✅ 5-perspective orchestrator
- ✅ Configuration management
- ✅ Setup script for API keys

### Phase 2: Research Engine Integration (Next)

- [ ] Update `ToolOrchestrator` to use Perplexity client
- [ ] Implement caching layer
- [ ] Add cost tracking metrics
- [ ] Create research quality validators

### Phase 3: Production Optimization

- [ ] Implement intelligent routing logic
- [ ] Add batch processing capabilities
- [ ] Create monitoring dashboards
- [ ] Build fallback mechanisms

## References

- [Perplexity API Documentation](https://docs.perplexity.ai)
- [Research Repository Best Practices](https://www.nngroup.com/articles/research-repositories/)
- [TimeTravel Research Methodology](_intake/tooling/specs/deep-research-system.md)
