# ADR-004: Relationship System and Plugin Strategy

## Status
Accepted

## Context
We discovered through stress testing that our hierarchical context system needed peer-to-peer relationships to complete the graph. This led to several key realizations:

1. **Filesystems ARE graph databases** - directories are just one type of relationship ("contains")
2. **Any organizational pattern** (Agile, GTD, etc.) can be implemented via relationships
3. **Efficiency problem**: Managing contexts would require 5+ tool calls without batching
4. **Quality problem**: Community plugins vary wildly in quality (see MCP ecosystem with 4 mediocre Notion servers)
5. **LLM-First philosophy**: Need to balance LLM reasoning with efficient execution

### Key Insight
With flat storage + relationships, we can implement ANY organizational pattern. The structure emerges from relationships, not directory hierarchy.

## Decision

### 1. Universal Relationship System

#### Core Design
Implement a universal relationship system in the Context Loader with:
- **Universal base relationships** (all contexts can have: relates_to, tagged_with, owned_by, derived_from)
- **Context-defined relationship types** (each context type declares domain-specific relationships)
- **In-context storage** (relationships stored in context.yaml files, not separate DB)
- **Bidirectional sync** (A blocks B automatically creates B blocked_by A)
- **Property schemas** (relationships can carry domain-specific metadata)
- **Validation with escape hatches** (enforce rules by default, allow override with force flag)

#### Abstract Implementation
```javascript
// Core relationship methods in ContextLoader
async addRelationship(sourceId, relationshipType, targetId, properties = {})
async removeRelationship(sourceId, relationshipType, targetId)
async getRelationships(contextId, relationshipType?, direction?)
async queryRelationshipGraph(startNodes, relationshipTypes, depth)
```

### 2. Hybrid LLM-First + Batch Operations

#### Design Philosophy
- **LLM-First**: LLM makes all reasoning decisions about what operations to perform
- **Bidirectional Callbacks**: We guide conversation flow with structured handoffs
- **Batch API**: Efficient execution layer to prevent multiple round trips

#### Implementation
```javascript
// 1. LLM decides operations through reasoning
const plan = await llm.reason({
  prompt: "User wants to create sprint. What operations?",
  context: currentWorkspace
})

// 2. Execute batch atomically
const results = await batchOperation({
  creates: [...],
  updates: [...], 
  relationships: [...],
  queries: [...]
})

// 3. Return with callback guidance
return {
  results,
  callback: {
    instruction: "Sprint created. Define story priorities?",
    actions: ["prioritize_stories", "add_tasks", "assign_team"]
  }
}
```

### 3. Domain-Specific Plugin Strategy

#### OOB Plugins with Rich Relationships
Build 5-7 high-quality plugins that demonstrate domain-specific relationship patterns:

1. **Agile** - blocks, depends_on, validates, in_sprint, story_points
2. **GTD** - next_action, waiting_for, delegated_to, context_bound
3. **PARA** - supports_area, archived_from, resource_for
4. **Wedding Planner** - vendor_conflicts, weather_dependent, emotional_priority
5. **Research** - cites, contradicts, extends, validates
6. **Legal** - precedent, supersedes, governed_by, statute_bound
7. **Creative** - inspired_by, iteration_of, remixes, branches_from

#### Plugin Architecture
```yaml
# Plugin defines domain-specific relationships
epic_config:
  relationship_types:
    blocks:
      description: "This epic must complete before target"
      target_types: ["epic", "story"]
      bidirectional: true
      inverse: "blocked_by"
      properties_schema:
        reason: "string"
        severity: "enum:critical,high,medium,low"
```

### 4. Launch Strategy
```
Core SDK → 5-7 OOB Plugins → Plugin Builder Kit → Community Gallery
         └─ We control quality ─┘  └─── Open ecosystem ───┘
```

## Consequences

### Positive
- **Universal flexibility**: Any organizational pattern possible through configuration
- **Domain emergence**: Unique relationship types emerge from each domain's constraints
- **Efficiency**: Batch operations reduce round trips from 5+ to 1
- **Quality control**: OOB plugins set high standards
- **LLM-friendly**: Agents can learn from quality patterns and discover relationships
- **Fast development**: Each plugin ~1 day with our architecture
- **True abstraction**: Core system knows nothing about specific domains

### Negative
- **Initial complexity**: Relationship system adds conceptual overhead
- **Maintenance burden**: We maintain 5-7 plugins
- **Delayed community**: Plugin ecosystem starts later

### Neutral
- **Storage flexibility**: Support both hierarchical and flat + relationships
- **Plugin architecture**: Must be designed for both human and LLM authors
- **Vernacular precision**: Distinguish between LLM-first reasoning and bidirectional callbacks

## Implementation Details

### Universal Base Relationships
```yaml
# contexts/types/base/context.yaml
base_config:
  universal_relationships:
    relates_to:
      description: "Generic relationship to any other context"
      target_types: ["*"]
      cardinality: "many-to-many"
    
    tagged_with:
      description: "Folksonomy tagging"
      target_types: ["tag"]
      cardinality: "many-to-many"
    
    owned_by:
      description: "Ownership/responsibility"
      target_types: ["user", "agent", "team"]
      cardinality: "many-to-one"
```

### Domain-Specific Relationships
```yaml
# Epic-specific (Agile plugin)
epic_config:
  relationship_types:
    blocks:
      description: "This epic must complete before target"
      target_types: ["epic", "story"]
      bidirectional: true
      inverse: "blocked_by"
      properties_schema:
        reason: "string"
        severity: "enum:critical,high,medium,low"

# Wedding-specific (Wedding plugin)
wedding_event_config:
  relationship_types:
    vendor_conflict:
      description: "Vendors who cannot work at same time"
      target_types: ["vendor"]
      bidirectional: true
      inverse: "conflicts_with"
      properties_schema:
        reason: "string"
        time_slots: "array:datetime"
```

### Batch Operation with Relationships
```javascript
// One atomic operation creates complex graph
await batchOperation({
  creates: [
    {type: "sprint", config: {name: "Sprint 23"}},
    {type: "story", config: {name: "User Auth"}}
  ],
  relationships: [
    {source: "$creates[0]", type: "contains", target: "$creates[1]"},
    {source: "$creates[1]", type: "blocks", target: "existing-story-id"}
  ],
  queries: [
    {type: "graph_traversal", start: "$creates[0]", depth: 2}
  ]
})
```

### Universal Relationship Patterns
Every domain exhibits patterns that emerge from its constraints:
- **Temporal**: before, after, during, delays, expires
- **Causal**: triggers, prevents, requires, enables
- **Resource**: competes_for, shares, exhausts, regenerates
- **Hierarchical**: governs, reports_to, escalates_to
- **Physical**: blocks_space, requires_proximity
- **Probabilistic**: increases_likelihood, prevents_possibility

## References
- Internal brainstorming session: `/internal/relationship-brainstorming-session.md`
- Context system documentation: `/docs/specs/core/universal-context-architecture.md`
- Original MCP integration strategy that highlighted quality issues
- Handoff sequences from: `/kingly/_archive/i-spec.md`