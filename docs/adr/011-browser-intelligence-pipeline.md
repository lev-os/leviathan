# ADR-011: Browser-Leviathan Intelligence Pipeline Architecture

## Status

Proposed

## Context

Initial conceptualization of browser intelligence incorrectly placed persona switching and context awareness within the browser layer. The correct architecture recognizes that browsers are perception tools while Leviathan serves as the intelligence middleware that processes raw content through various analytical lenses.

## Decision

Implement a clear three-layer pipeline architecture:

1. **Perception Layer (Browser/CB)**: Raw content acquisition
2. **Intelligence Layer (Leviathan)**: Context/workflow/pattern processing
3. **Output Layer**: Structured intelligence and insights

## Architecture

### Pipeline Flow

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│                 │     │                      │     │                 │
│   Web Content   │────▶│   CB Scraper        │────▶│ Raw Content     │
│                 │     │   (Perception)      │     │                 │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
                                                               │
                                                               ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│                 │◀────│  Leviathan          │◀────│                 │
│   Intelligence  │     │  (Processing)       │     │  Apply:         │
│   Output        │     │                      │     │  - Agents       │
└─────────────────┘     └──────────────────────┘     │  - Workflows    │
                                                      │  - Patterns     │
                                                      └─────────────────┘
```

### Layer Responsibilities

#### 1. Perception Layer (ClaudeBrowser)

```python
# CB's job: Get content efficiently
async def scrape(url, depth=0, engine="auto"):
    """
    Pure scraping - no intelligence, just data acquisition
    - Handle authentication
    - Manage proxies
    - Extract text/HTML/links
    - Deal with JavaScript rendering
    """
    return {
        "text": extracted_text,
        "html": raw_html,
        "links": found_links,
        "metadata": scraping_metadata
    }
```

#### 2. Intelligence Layer (Leviathan Middleware)

```python
class LeviathanIntelligence:
    """
    Process raw content through analytical frameworks
    """

    async def apply_agent(self, content, agent_id):
        """Apply specific agent perspective to content"""
        # Load agent context (e.g., nfj-visionary)
        # Process content through agent's analytical lens
        # Return agent-specific insights

    async def execute_workflow(self, content, workflow_id):
        """Run multi-step workflow on content"""
        # Load workflow (e.g., cognitive-parliament)
        # Execute each step (agents, patterns, synthesis)
        # Return comprehensive analysis

    async def apply_pattern(self, content, pattern_id):
        """Apply thinking pattern to content"""
        # Load pattern (e.g., first-principles-thinking)
        # Apply pattern methodology
        # Return pattern-based findings
```

#### 3. Output Layer

```python
# Structured intelligence output
{
    "source": {
        "url": "https://example.com",
        "scraped_at": "2024-01-15T10:30:00Z",
        "scraper": "ClaudeBrowser"
    },
    "intelligence": {
        "agent_analyses": [...],
        "workflow_results": {...},
        "pattern_findings": [...],
        "synthesis": {...}
    },
    "recommendations": {...}
}
```

### Integration Patterns

#### Pattern 1: Simple Analysis

```python
# User wants to analyze a documentation page
content = await cb.scrape("https://docs.example.com")
analysis = await leviathan.apply_agent(content, "stp-adapter")
# Returns: Actionable implementation steps
```

#### Pattern 2: Multi-Perspective Analysis

```python
# User wants comprehensive understanding
content = await cb.scrape("https://ai-paper.com")
results = await leviathan.execute_workflow(content, "cognitive-parliament")
# Returns: Multiple agent perspectives synthesized
```

#### Pattern 3: Deep Pattern Analysis

```python
# User wants strategic insights
content = await cb.scrape("https://competitor.com")
insights = await leviathan.apply_pattern(content, "blue-ocean-strategy")
# Returns: Strategic opportunities and market gaps
```

## Implementation Strategy

### Phase 1: Define Clear Interfaces

- Browser interface: Input (URL) → Output (raw content)
- Leviathan interface: Input (content) → Output (intelligence)
- Clear separation of concerns

### Phase 2: Build Pipeline Infrastructure

- Message passing between layers
- Async processing support
- Error handling and resilience

### Phase 3: Integrate Existing Components

- CB remains pure scraper
- Leviathan contexts/workflows process content
- Results aggregation and presentation

## Consequences

### Positive

- **Clear Separation**: Each layer has single responsibility
- **Modularity**: Can swap scrapers or add new analysis types
- **Scalability**: Pipeline can handle multiple sources/analyses
- **Maintainability**: Changes isolated to appropriate layer

### Challenges

- **Latency**: Additional processing step adds time
- **Context Size**: Large content may exceed LLM limits
- **Coordination**: Managing async pipeline complexity

### Mitigation Strategies

- **Streaming**: Process content in chunks
- **Caching**: Cache both scraping and analysis results
- **Parallelization**: Run multiple analyses concurrently

## Success Metrics

- **Performance**: <5s for single page analysis
- **Quality**: 90% relevant insights per analysis
- **Flexibility**: Easy to add new agents/workflows
- **Reliability**: 99% pipeline success rate

## References

- ADR-009: LLM-First Browser Intelligence (superseded)
- ADR-010: Browser Persona Context Switching (superseded)
- ClaudeBrowser documentation
- Leviathan context system documentation

## Decision

Proceed with three-layer pipeline architecture, maintaining clear separation between perception (CB), intelligence (Leviathan), and output layers.
