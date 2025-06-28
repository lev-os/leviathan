# ADR-007: Enhanced Context File Structure

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Evolution from basic architecture/progress/tasks to sophisticated context management

## Decision

Implement **enhanced context file structure** with `drafts/research/adrs/specs` organization, replacing basic `.ctx.architecture.md/.ctx.progress.md/.ctx.tasks.md` with memory-type aligned context categories.

## Problem Statement

Current context limitations:
- **Basic Structure**: Only architecture/progress/tasks lacks sophistication
- **No Research Pipeline**: No clear path from exploration to knowledge
- **Missing Decision Tracking**: Architectural decisions scattered across files
- **Specification Gaps**: BDD/TDD/integration specs not systematically managed

## Architecture Decision

### **Enhanced Context Structure**

```
./lev/memory/contexts/
├── drafts/                     # Working Memory Integration
│   ├── .ctx.drafts.md         # Consolidated active research
│   ├── exploration_notes.md    # Raw investigation work
│   ├── concept_sketches.md     # Initial ideas and prototypes
│   └── hypothesis_testing.md   # Experimental approaches
├── research/                   # Semantic Memory Integration
│   ├── .ctx.research.md       # Curated knowledge base
│   ├── technology_survey.md    # Systematic technology evaluation
│   ├── competitor_analysis.md  # Market and solution research
│   └── best_practices.md       # Industry standards and patterns
├── adrs/                       # Temporal Memory Integration
│   ├── .ctx.adrs.md           # Decision summary and index
│   ├── 001-technology-choice.md # Individual decision records
│   ├── 002-architecture-pattern.md
│   └── template.md             # ADR template for consistency
└── specs/                      # Procedural Memory Integration
    ├── .ctx.specs.md          # Specification overview
    ├── bdd/                    # Behavior-Driven Development
    │   ├── user_stories.feature
    │   ├── acceptance_criteria.md
    │   └── scenario_outlines.md
    ├── tdd/                    # Test-Driven Development
    │   ├── test_specifications.md
    │   ├── unit_test_plans.md
    │   └── integration_tests.md
    └── integration/            # System Integration
        ├── api_contracts.yaml
        ├── service_interfaces.md
        └── data_flow_specs.md
```

### **Memory Type Mapping**

```yaml
# Context to Memory Type Mapping
memory_integration:
  drafts:
    primary_type: "working"
    description: "Active exploration and immediate context"
    sync_frequency: "real_time"
    ai_summarization: true
    
  research:
    primary_type: "semantic"
    description: "Curated knowledge and findings"
    graphiti_relationships: true
    cross_reference: true
    
  adrs:
    primary_type: "temporal"
    description: "Decision timeline and evolution"
    decision_tracking: true
    impact_analysis: true
    
  specs:
    primary_type: "procedural"
    description: "Workflows, tests, and processes"
    pattern_extraction: true
    success_tracking: true
```

### **Content Structure Templates**

```markdown
<!-- .ctx.drafts.md - Working Memory Integration -->
# 🔬 Active Research & Exploration

## Current Investigations
- [ ] Performance optimization approaches
- [ ] Alternative architecture patterns
- [ ] Technology evaluation criteria

## Rough Ideas
### Concept: Distributed Caching Layer
Initial thoughts on implementing Redis clustering...

## Questions to Resolve
1. How does X pattern handle Y scenario?
2. What are the trade-offs between A and B?

## Next Steps
- [ ] Research Redis clustering patterns
- [ ] Prototype basic implementation
- [ ] Performance benchmark comparison

<!-- MEMORY_INTEGRATION: working -->
<!-- SYNC_FREQUENCY: real_time -->
<!-- AI_SUMMARIZATION: enabled -->
```

```markdown
<!-- .ctx.research.md - Semantic Memory Integration -->
# 📚 Curated Knowledge Base

## Technology Survey
### Redis Clustering
**Source**: Official documentation + performance benchmarks
**Confidence**: High
**Key Findings**: 
- Linear scalability up to 1000 nodes
- Automatic failover in 15-30 seconds
- Memory overhead: ~2% per node

**Relationships**: 
- Related to: performance_optimization, distributed_systems
- Conflicts with: single_instance_redis
- Depends on: cluster_networking, monitoring_infrastructure

## Competitor Analysis
### Solution A vs Solution B
Detailed comparison matrix with evidence...

<!-- MEMORY_INTEGRATION: semantic -->
<!-- GRAPHITI_RELATIONSHIPS: technology_choices, performance_benchmarks -->
<!-- CROSS_REFERENCE: enabled -->
```

```markdown
<!-- .ctx.adrs.md - Temporal Memory Integration -->
# ⚖️ Architectural Decisions

## Decision Index
| ID | Title | Status | Date | Impact |
|----|-------|--------|------|--------|
| 001 | Database Choice | Accepted | 2025-06-27 | High |
| 002 | API Framework | In Review | 2025-06-28 | Medium |

## Recent Decisions (Last 30 Days)
### ADR-001: Database Choice
**Context**: Need scalable data persistence
**Decision**: PostgreSQL with read replicas
**Impact**: Foundation for all data operations

## Decision Trends
- **Technology Focus**: Database and API choices
- **Decision Velocity**: 2 decisions/week average
- **Reversal Rate**: 5% (1 out of 20 decisions)

<!-- MEMORY_INTEGRATION: temporal -->
<!-- DECISION_TRACKING: enabled -->
<!-- IMPACT_ANALYSIS: enabled -->
```

```markdown
<!-- .ctx.specs.md - Procedural Memory Integration -->
# 📋 Project Specifications

## BDD Scenarios Summary
- **Features**: 12 defined, 8 implemented
- **Scenarios**: 45 total, 38 passing
- **Coverage**: 85% of user journeys

## TDD Test Plans
### Unit Tests
- Authentication service: 95% coverage
- Business logic: 87% coverage
- Data access: 92% coverage

### Integration Tests
- API endpoints: All green
- Database operations: All green
- External services: 3 failing (under investigation)

## Current Sprint Specifications
### Feature: User Authentication
```gherkin
Scenario: Successful login
  Given a user with valid credentials
  When they attempt to log in
  Then they should be granted access
```

<!-- MEMORY_INTEGRATION: procedural -->
<!-- PATTERN_EXTRACTION: enabled -->
<!-- SUCCESS_TRACKING: enabled -->
```

## Implementation Strategy

### **Phase 1: Structure Migration**
- [ ] Create enhanced directory structure
- [ ] Migrate existing .ctx files to new categories
- [ ] Implement memory type mappings
- [ ] Update file monitoring patterns

### **Phase 2: Intelligence Integration**
- [ ] AI-powered content categorization
- [ ] Cross-file relationship detection
- [ ] Pattern extraction from specifications
- [ ] Decision impact analysis

## Consequences

### **Positive**
- **Sophisticated Organization**: Clear research pipeline from drafts to decisions
- **Memory Integration**: Each category aligns with memory types
- **Better AI Understanding**: Structured context improves AI assistant capabilities
- **Knowledge Management**: Systematic approach to capturing and reusing insights

### **Negative**
- **Migration Effort**: Need to restructure existing projects
- **Learning Curve**: Developers need to understand new structure
- **File Proliferation**: More files to manage per project

### **Risk Mitigation**
- **Migration Tools**: Automated conversion from old structure
- **Documentation**: Clear guidelines and examples
- **Optional Adoption**: Gradual migration, not forced

## Success Metrics

- **Content Quality**: 90% of context files properly categorized
- **Usage Adoption**: 80% of projects using enhanced structure within 3 months
- **AI Effectiveness**: 25% improvement in AI assistant relevance scores
- **Knowledge Reuse**: 60% increase in cross-project pattern adoption

## References

- Erasmus Context Structure: `~/lev/_ref/erasmus/.ctx.*`
- Current Memory Types: `~/lev/packages/memory/docs/decisions/003-five-memory-types.md`
- Research Pipeline Patterns: Industry knowledge management best practices

---

**Decision Status**: Proposed  
**Review Date**: 2025-07-04