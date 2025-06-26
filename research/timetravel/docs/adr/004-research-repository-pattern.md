# ADR-004: Research Repository Pattern

## Status

Accepted

## Context

The TimeTravel system generates valuable research outputs that need to be:

- Stored persistently
- Easily searchable
- Version controlled
- Organized by time horizons and topics
- Accessible for future reference and trend analysis

We need a pattern for organizing and managing this research data effectively.

## Decision

We will implement a **Structured Research Repository Pattern** with the following organization:

### Directory Structure

```
research/
├── horizons/           # Time-based organization
│   ├── 6-months/
│   ├── 1-year/
│   ├── 2-years/
│   └── 5-years/
├── topics/             # Subject-based organization
│   ├── subquadratic-architectures/
│   ├── world-models/
│   ├── reasoning-models/
│   └── efficiency-innovations/
├── weekly-updates/     # Regular synthesis
└── index.yaml         # Searchable catalog
```

### Research Document Format

Each research output follows a standardized format:

```yaml
metadata:
  id: 'uuid'
  timestamp: 'ISO-8601'
  topic: 'primary topic'
  tags: ['tag1', 'tag2']
  horizon: '6-months'
  confidence: 0.85
  sources_count: 42

summary:
  key_findings: '...'
  implications: '...'
  recommendations: '...'

research:
  perspectives:
    technical: '...'
    academic: '...'
    market: '...'
    user: '...'
    future: '...'

validation:
  cross_referenced: true
  fact_checked: true
  confidence_scores: { ... }

sources:
  - url: '...'
    type: 'academic|web|report'
    reliability: 0.9
```

### Index Structure

The `index.yaml` provides fast lookup:

```yaml
entries:
  - id: 'uuid'
    title: 'Research Title'
    date: '2025-01-09'
    topic: 'subquadratic-architectures'
    horizon: '1-year'
    tags: ['attention', 'efficiency']
    summary: 'One-line summary'
    path: 'topics/subquadratic-architectures/2025-01-09-title.md'
```

### Implementation Details

1. **Storage Backend**: File system with Git version control
2. **Search**: Full-text search via grep + YAML index queries
3. **Deduplication**: Content hashing to avoid duplicates
4. **Archival**: Older research compressed after 6 months

## Consequences

### Positive

- **Persistence**: Research is never lost
- **Discoverability**: Easy to find past research
- **Evolution Tracking**: See how predictions age
- **Knowledge Building**: Each research builds on previous

### Negative

- **Storage Growth**: Repository size increases over time
- **Maintenance**: Requires periodic cleanup and organization
- **Search Complexity**: May need better search as it grows
- **Duplication Risk**: Similar topics may create redundancy

### Migration Strategy

1. Move existing research from `_intake/` to new structure
2. Generate index from existing documents
3. Establish naming conventions
4. Create search utilities

## Future Enhancements

- Embedding-based semantic search
- Automatic tagging and categorization
- Research quality scoring over time
- Trend detection from historical data

## Related Decisions

- ADR-003: Multi-API orchestration (generates the research)
- ADR-001: CLI-first strategy (accesses the repository)
