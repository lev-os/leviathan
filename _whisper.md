# Whisper System Design & Insights

## Core Philosophy

Whisper system provides LLM-first guidance for AI agents that may not have specific adapter bindings. The goal is enabling any LLM to quickly understand and effectively use the Leviathan system through contextual guidance sprinkled into command responses.

## Key Insights

### The Real Problem for LLMs
- **Session Continuity Crisis**: Every new Claude session or compact is a blank slate
- **Context Discovery Gap**: Need to understand available workflows, agents, and system capabilities
- **Power User Challenge**: 12+ tabs with frequent context switches require consistent governance patterns
- **Foreign LLM Integration**: System should work for any LLM, not just Claude with specific bindings

### Design Principles

1. **Static Documentation**: All whisper content is predefined, no dynamic context detection
2. **Loose Object Structure**: Each command defines its own whisper object where keys become markdown headings
3. **Scalable Plugin Support**: Must work with 100+ plugins without performance degradation
4. **Self-Teaching System**: Combined with help commands, enables foreign LLMs to understand the system
5. **Governance Focus**: Teach workflow patterns, not just command syntax

## Whisper Object Structure

### Flexible Entry Types

```yaml
whisper:
  "Any Heading Name":
    content: "Static text content"           # Simple content
    rotate: ["option 1", "option 2"]        # Rotating variants  
    frequency: every_3rd                    # When to show
    
  "Another Section": 
    - "Array item 1"                        # Simple array
    - "Array item 2"
    
  "Complex Section":
    content: "Base content here"
    rotate: ["variant a", "variant b"] 
    frequency: session_start
    placement: top                          # Override default placement
```

### Frequency Controls

- `session_start`: Every new session/compact
- `every_3rd`: Show every 3rd command usage
- `on_use`: Show when command is used
- `weekly`: Rotate weekly (deterministic based on date)
- `power_user`: Show for multi-tab patterns

## LLM-Optimized Examples

### Find Command - Context Discovery for Foreign LLMs

```yaml
whisper:
  "System Navigation":
    content: "Semantic search across workflows, agents, and patterns in current workspace"
    
  "Discovery Patterns":
    rotate:
      - "agent.endpoint notation loads specific agents (cognitive-parliament.debate)"
      - "Semantic queries search fuzzy context ('documentation audit')"
      - "--type=workflows filters by category for focused discovery"
    frequency: every_3rd
    
  "Workspace Intelligence": 
    - "Use --all to see full context landscape before starting"
    - "Multiple context types: workflows, agents, patterns, tools"
    - "Foreign LLMs: Start with find --all for system orientation"
    
  "Integration Guidance":
    content: "New to system? Combine with 'lev help' for complete command reference"
    frequency: session_start
```

### Checkpoint Command - Session Governance

```yaml
whisper:
  "Session Governance":
    content: "Creates persistent session state for multi-tab coordination and LLM handoffs"
    
  "Governance Triggers":
    rotate:
      - "ADR decisions → Mandatory checkpoint for architectural tracking"
      - "Spec completion → Session milestone for requirement capture"
      - "Context switches → Coordination point for multi-tab workflows"
    frequency: on_use
    
  "Multi-Tab Strategy":
    - "Session IDs enable seamless handoffs between LLM instances"
    - "Use --resume to recover previous session context"
    - "Foreign LLMs: Session state provides workflow memory"
    
  "Power User Pattern":
    content: "12+ tabs = checkpoint every major decision for coordination"
    frequency: session_start
```

## Plugin Architecture

### Core Plugin Whispers
```yaml
# Core plugins get priority placement
whisper:
  priority: high
  "Core System":
    content: "Part of Leviathan core - always available"
```

### Community Plugin Whispers
```yaml  
# Community plugins use namespaced guidance
whisper:
  namespace: "community.plugin-name"
  "Plugin Guidance":
    content: "Community-contributed functionality"
    rotate: ["Usage pattern 1", "Integration tip 2"]
```

### Plugin Whisper Aggregation Strategy

1. **Core First**: Core plugin whispers get top priority
2. **Relevance Filtering**: Only show whispers for commands being used
3. **Rotation Coordination**: Prevent whisper overflow with smart rotation
4. **Performance**: Static whisper lookup, no dynamic aggregation

## Foreign LLM Integration Strategy

### Self-Teaching System Components

1. **Help Command**: Complete command reference and syntax
2. **Command Help**: Specific command usage and options  
3. **Whisper Guidance**: Contextual workflow intelligence
4. **Combined Effect**: Any LLM can learn system through exploration

### Example: Foreign LLM Learning Flow

```
Foreign LLM Session Start:
1. `lev help` → See all available commands
2. `lev find --help` → Learn find command syntax
3. `lev find --all` → Discover available contexts (with whisper guidance)
4. `lev checkpoint --help` → Learn session management
5. `lev checkpoint --new "exploration session"` → Start governed session (with whisper guidance)

Result: Foreign LLM understands system capabilities and governance patterns
```

## Scaling Considerations

### 100+ Plugin Scenario

**Challenge**: Plugin whisper overflow
**Solution**: 
- Relevance filtering (only active command whispers)
- Rotation coordination (prevent duplicate guidance)
- Namespace isolation (core vs community)
- Performance optimization (static lookup tables)

### Whisper Performance

```javascript
// Efficient whisper lookup for 100+ plugins
const whisperRegistry = {
  'core.find': findWhispers,
  'core.checkpoint': checkpointWhispers,
  'community.plugin-x': pluginXWhispers
};

function getWhispers(command, plugins) {
  // Only lookup whispers for active command + relevant plugins
  const relevantWhispers = plugins
    .filter(p => p.isRelevantFor(command))
    .map(p => whisperRegistry[p.namespace]);
    
  return aggregateWithRotation(relevantWhispers);
}
```

## Implementation Roadmap

### Phase 1: Core Whisper Engine
- Loose object parser (keys → headings)
- Rotation logic with frequency controls
- Markdown generation and placement

### Phase 2: Command Integration  
- Find command whispers for context discovery
- Checkpoint command whispers for session governance
- Help command integration for complete LLM onboarding

### Phase 3: Plugin Architecture
- Plugin whisper registration system
- Namespace isolation and priority handling
- Performance optimization for scale

### Phase 4: Foreign LLM Testing
- Test with different LLM providers
- Validate self-teaching effectiveness
- Optimize guidance for non-Claude systems

## Success Metrics

1. **Foreign LLM Onboarding**: Any LLM can learn system in <5 commands
2. **Plugin Scale**: Performance remains good with 100+ plugins
3. **Session Governance**: Consistent workflow patterns across LLM sessions
4. **Context Recovery**: Effective session resumption after compacts/handoffs