# ADR 002: Perplexity as Primary Deep Research Engine

Date: 2025-01-09  
Status: Accepted

## Context

TimeTravel needs a primary AI-powered research engine that can:

- Provide high-quality, cited responses
- Handle complex, multi-faceted queries
- Integrate well with other tools
- Scale cost-effectively

Options evaluated:

1. Perplexity API
2. OpenAI + custom RAG
3. Anthropic + web search
4. Google Vertex AI

## Decision

We will use Perplexity API as the primary deep research engine.

## Rationale

### Pros of Perplexity

- Built specifically for research with citations
- Handles web search and synthesis natively
- Good API with reasonable pricing
- Proven quality for research tasks
- Real-time information access

### Cons Addressed

- Single point of failure → Mitigated by multi-tool architecture
- API changes → Abstract behind interface
- Cost at scale → Implement caching and rate limiting

### Why Not Others

- **OpenAI + RAG**: More complex, requires search infrastructure
- **Anthropic + search**: Not specialized for research
- **Vertex AI**: Less mature for research use cases

## Consequences

### Positive

- Faster time to market
- High-quality research outputs
- Reduced complexity
- Good developer experience

### Negative

- Vendor dependency
- Less control over search algorithm
- Potential rate limits

### Mitigations

- Abstract Perplexity behind research interface
- Plan for multiple research engines
- Implement result caching
- Design for provider switching

## Implementation

```typescript
interface ResearchEngine {
  search(query: string, options: SearchOptions): Promise<SearchResult>
}

class PerplexityEngine implements ResearchEngine {
  async search(query: string, options: SearchOptions) {
    // Perplexity-specific implementation
  }
}
```

## References

- [Perplexity API Docs](https://docs.perplexity.ai)
- Initial spike results showing 80% quality improvement
- Cost analysis showing $0.002 per research query average
