# 🧠 MEMORY ARCHITECTURE SPECIFICATION

*Dynamic, multi-layered memory system for intelligent context assembly*

## 📋 **BUSINESS CASE**

**Goal**: Universal memory system that enables workflow-based intelligence propagation across ANY context type
**Value**: Breakthrough in one domain (dating) automatically improves all relevant contexts (business, team coordination) through intelligent pattern propagation
**Priority**: High - Intelligence multiplier for universal human-AI coordination

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-MEMORY-001: Universal Context Memory Support**
```yaml
Given: Any context type (agent, workflow, project, theme, pattern)
When: Context needs memory capabilities
Then: Context can have working, episodic, semantic, and shared memory
And: Memory types are available regardless of context type
And: Memory organization follows consistent schema patterns
```

### **AC-MEMORY-002: Workflow-Based Intelligence Propagation**
```yaml
Given: Breakthrough insight occurs in source context
When: Bubbling workflow evaluates significance > 0.7
Then: Insight is propagated to relevant contexts via workflow
And: Adaptation guidance is provided for each target context
And: Cross-context memory references are created (not copies)
And: User maintains control over sharing boundaries
```

### **AC-MEMORY-003: Portfolio Intelligence Multiplication**
```yaml
Given: Pattern succeeds in one context (e.g., listening before solutions in dating)
When: Cross-context learning workflow detects transferable principles
Then: Pattern is tested for applicability to other contexts (client relationships, team management)
And: Successful transfers create portfolio-wide intelligence improvement
And: Intelligence compounds across entire activity portfolio
```

## ⚡ **REVOLUTIONARY PRINCIPLES**

### Universal Scaling Architecture
- **Same patterns** handle dating coordination and climate governance
- **Polymorphic structure** adapts to complexity, not separate systems
- **Intent-driven organization** around human goals, not technical boundaries
- **Context cascade inheritance** flows knowledge where needed automatically

### Portfolio Intelligence Multiplier
- **Every insight benefits ALL contexts** - breakthrough in one domain improves everything
- **Multiplicative intelligence** - value compounds across entire activity portfolio
- **Cross-context pattern propagation** - successful approaches spread naturally
- **Meta-learning substrate** - system learns how to learn across domains

## Memory Types (Universal Context Pattern)

### Working Memory (Active Session)
- **Purpose**: Current context state and confidence tracking
- **Available to**: ALL context types (agent, workflow, project, etc.)
- **Retention**: Session duration
- **Features**: Context whispers, confidence tracking, breakthrough detection

### Episodic Memory (Experience Capture)
- **Purpose**: Specific experiences and interactions
- **Available to**: ANY context that has experiences
- **Organization**: Chronological with semantic tagging
- **Bubbling**: Significant experiences can bubble to parent/related contexts
- **Features**: Full interaction capture, pattern extraction, cross-references

### Semantic Memory (Extracted Knowledge)  
- **Purpose**: Learned patterns and insights
- **Available to**: ANY context that learns
- **Organization**: By patterns and domains (LLM-determined)
- **Propagation**: Via bubbling/trickling workflows
- **Features**: Pattern storage, insight links, adaptation notes

### Shared Memory (Cross-Context References)
- **Purpose**: References to insights from other contexts
- **Available to**: ANY context (configurable)
- **Organization**: Links + summaries, not copies
- **Access**: Via workflow-driven sharing
- **Features**: Cross-pollination, adaptation guidance, relevance scoring

## Storage Architecture (Flexible Patterns)

### Option A: Agent-Centric Memory (Traditional)
```
contexts/
  agents/
    {agent-id}/
      memory/
        episodic/          # Agent's experiences
        semantic/          # Agent's learned knowledge  
        working/           # Agent's current session
        shared/            # Cross-agent memory sharing
```

### Option B: Portfolio Intelligence Memory (Cross-Context)
```
contexts/
  memory/
    shared/
      patterns/            # Universal coordination patterns
      insights/            # Cross-domain breakthrough insights
      templates/           # Scaling templates
    agents/
      {agent-id}/
        episodic/          # Agent-specific experiences
        preferences/       # How agent uses shared memory
```

### Configurable Memory Organization
```yaml
# Memory organization is just a pattern/config choice
memory_organization_patterns:
  agent_focused:
    philosophy: "Each agent owns its memory, shares selectively"
    structure: "contexts/agents/{agent}/memory/"
    benefits: ["clear ownership", "privacy control", "familiar"]
    
  portfolio_intelligence:
    philosophy: "Shared memory substrate, agent-specific access"
    structure: "contexts/memory/shared/ + agent preferences"
    benefits: ["cross-pollination", "multiplicative intelligence", "universal patterns"]
    
  hybrid:
    philosophy: "Agent memory + shared portfolio layer"
    structure: "Both structures with cross-references"
    benefits: ["best of both", "user choice", "evolution path"]
```

### Dynamic Intent Classification (Not Rigid Categories)
```yaml
# Intent is dynamic/contextual, not hardcoded categories
intent_classification:
  approach: "LLM-driven classification based on context"
  
  # These are EXAMPLES, not rigid categories
  example_patterns:
    - coordination_complexity: "1-person vs team vs multi-org"
    - time_horizon: "immediate vs long-term vs generational" 
    - stakes: "low vs medium vs high vs civilizational"
    - domain: "personal vs professional vs public vs universal"
    
  # Classification is configurable
  classification_rules:
    - pattern: "user_defines_own_categories"
    - pattern: "llm_infers_from_context"
    - pattern: "learns_from_usage_patterns"
```

### Memory Reference Format
```yaml
# Instead of sending full content over wire
memory_reference:
  type: "semantic|episodic|procedural"
  location: "path/to/memory/file.md"
  summary: "Brief description for context"
  relevance: 0.0-1.0
  size: "file size"
  last_accessed: "timestamp"
```

## Dynamic Assembly Rules

### Intent-Based Memory Injection
```yaml
memory_injection_rules:
  - name: "Business context recall"
    when:
      intent_type: "business_growth"
    inject:
      semantic: ["business-strategies.md", "market-analysis.md"]
      episodic: ["last-3-business-discussions"]
      
  - name: "Returning user context"
    when:
      condition: "user_returning after 7+ days"
    inject:
      episodic: ["last-session-summary"]
      semantic: ["user-preferences.md"]
      
  - name: "Technical implementation"
    when:
      intent_type: "development"
      complexity: "> 0.7"
    inject:
      procedural: ["similar-implementations"]
      semantic: ["technical-decisions.md"]
```

### Token Budget Management
```yaml
token_allocation:
  total_budget: 2000
  distribution:
    working_memory: 500      # Current state
    episodic_summary: 1000   # Recent relevant experiences
    semantic_refs: 300       # Knowledge pointers
    procedural_hints: 200    # Workflow suggestions
    
  strategies:
    over_budget: "Summarize and reference"
    under_budget: "Include more detail"
    priority: "working > episodic > semantic > procedural"
```

## Memory Schemas

### Episodic Memory Schema
```yaml
# episodic/session-{id}.yaml
metadata:
  type: "episodic_memory"
  session_id: "unique-session-id"
  timestamp: "ISO-8601"
  duration: "minutes"
  intent_type: "classification"
  agent: "agent-id"
  
interaction:
  trigger: "What started this session"
  context: "Relevant background"
  participants: ["user", "agents involved"]
  
key_moments:
  - timestamp: "ISO-8601"
    type: "insight|decision|pivot|completion|failure"
    description: "What happened"
    significance: 0.0-1.0
    
patterns_detected:
  - pattern: "Description"
    confidence: 0.0-1.0
    
outcomes:
  successful: boolean
  learned: ["list of insights"]
  
next_session_hints: "What to remember"
```

### Semantic Memory Schema
```yaml
---
# Frontmatter for semantic memory files
type: semantic_memory
domain: "business|technical|user|general"
topics: ["list", "of", "topics"]
confidence: 0.0-1.0
sources: ["episodic memories this was extracted from"]
last_updated: "ISO-8601"
---

# Knowledge Title

## Key Facts
- Fact 1
- Fact 2

## Patterns
- Pattern description

## Related Concepts
- [[Link to other semantic memory]]
```

### Working Memory Schema
```yaml
# Temporary session state
working_memory:
  session_id: "current"
  started: "timestamp"
  
  context_stack:
    - context: "Current focus"
      confidence: 0.0-1.0
      
  active_patterns:
    - pattern: "What's being attempted"
      
  whisper_history:
    - timestamp: "when"
      type: "complexity|confidence|aha"
      message: "whisper content"
      
  pending_capture:
    - candidate: "Potential memory"
      significance: 0.0-1.0
```

## Memory Operations

### Capture Triggers
```yaml
memory_capture:
  automatic_triggers:
    - aha_moment_detected
    - confidence_spike: "> 0.9"
    - pattern_recognized
    - task_completed
    - failure_analyzed
    
  whisper_prompts:
    - "Should I remember this approach?"
    - "This seems like a key insight"
    - "Pattern detected - worth saving?"
```

### Compression & Evolution
```yaml
memory_evolution:
  episodic_to_semantic:
    trigger: "Age > 30 days"
    process:
      - Extract patterns
      - Generalize insights
      - Update semantic memory
      - Archive episodic source
      
  semantic_reinforcement:
    trigger: "Pattern confirmed in new episode"
    process:
      - Increase confidence
      - Add supporting evidence
      - Update last_confirmed
      
  procedural_extraction:
    trigger: "Workflow repeated successfully 3+ times"
    process:
      - Create pattern context
      - Document workflow
      - Tag with success metrics
```

## MCP Integration

### Response Size Guidelines
```yaml
mcp_response_guidelines:
  max_response_size: "4MB default"
  
  memory_inclusion_strategy:
    inline_threshold: "10KB"
    reference_format: "Summary + location"
    
  progressive_disclosure:
    initial: "Working memory + relevant summaries"
    on_request: "Full episodic details"
    background: "Semantic references"
```

### Memory Tools
```yaml
mcp_memory_tools:
  - name: "recall_memory"
    parameters:
      type: "working|episodic|semantic|procedural"
      query: "search terms or timeframe"
      
  - name: "save_memory"
    parameters:
      type: "episodic|semantic"
      content: "memory content"
      significance: 0.0-1.0
      
  - name: "forget_memory"
    parameters:
      type: "working|episodic"
      identifier: "memory id"
```

## Privacy & Boundaries

### Agent Memory Isolation
```yaml
memory_boundaries:
  default: "Agent memories are private"
  
  sharing_rules:
    - from: "ceo"
      to: "dev"
      type: "semantic"
      when: "implementing strategy"
      
    - from: "any"
      to: "any"
      type: "procedural"
      when: "explicit share"
```

### User Privacy
```yaml
privacy_features:
  - Memories stored locally
  - No cloud sync without permission
  - User can view all memories
  - Right to delete any memory
  - Anonymization options
```

## Implementation Guidelines

### Memory Lifecycle
1. **Capture**: Detect significant moments
2. **Store**: Save with appropriate type
3. **Index**: Make searchable/retrievable
4. **Retrieve**: Dynamic assembly on need
5. **Evolve**: Compress and generalize
6. **Expire**: Archive or delete

### Performance Considerations
- Use file references over content inclusion
- Implement lazy loading
- Cache frequently accessed memories
- Index for fast retrieval
- Compress old episodic memories

### Integration Points
- Context whisper system
- Dynamic assembly engine
- Pattern detection system
- Agent context definitions
- MCP tool handlers

---

*Memory is just another type of context in our universal system - dynamically assembled, continuously evolving, and always in service of intelligent behavior.*