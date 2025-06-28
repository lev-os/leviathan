# ADR-004: IDE Auto-Injection Integration

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Integration of sophisticated IDE auto-injection patterns with Leviathan's fractal memory architecture

## Decision

Integrate **real-time IDE auto-injection system** with Leviathan's 5-type memory architecture, implementing **user preference-first IDE selection** with auto-detection fallback, and **fractal memory inheritance** between global and project contexts.

## Problem Statement

Current development workflow challenges:
- **Manual Context Switching**: Developers lose AI assistant context when switching between projects or IDEs
- **Fragmented Development Tools**: Using 4+ coding tools per project requires repetitive context setup
- **Static Context Management**: AI assistants only receive snapshot context, missing real-time project evolution
- **IDE Lock-in**: Current solutions are IDE-specific, limiting developer tool choice

## Architecture Decision

### **Fractal Memory Integration**

```
~/.lev/memory/                  # Global Master Fractal
├── contexts/                   # Enhanced context types
│   ├── drafts/                 # Research templates
│   ├── research/               # Knowledge templates  
│   ├── adrs/                   # Decision record templates
│   └── specs/                  # BDD/TDD/Integration templates
├── ides/                       # IDE-specific configurations
│   ├── windsurf/
│   ├── cursor/
│   ├── claude-code/
│   ├── codex/
│   ├── vscode/                 # Future support
│   └── jetbrains/              # Future support
├── protocols/                  # Universal development workflows
└── templates/                  # Memory-aware merge templates

./lev/memory/                   # Per-Project Fractal
├── contexts/                   # Project-specific contexts
│   ├── .ctx.drafts.md         # Active research
│   ├── .ctx.research.md       # Curated findings
│   ├── .ctx.adrs.md           # Project decisions
│   └── .ctx.specs.md          # Project specifications
├── sync/                       # Memory sync configuration
└── user_preferences.yaml      # Multi-IDE user preferences
```

### **User Preference-First IDE Selection**

**Core Principle**: Respect user workflow patterns over automatic detection

```yaml
# ./lev/memory/user_preferences.yaml
ide_preferences:
  primary: "claude-code"         # Main development IDE
  secondary: "windsurf"          # Code review and refactoring
  tertiary: "cursor"             # Quick edits and exploration
  terminal: "warp"               # Terminal-based work
  
context_sync:
  real_time: true               # Auto-sync context files
  memory_integration: true      # Connect to 5-type memory
  cross_ide_session: true       # Maintain session across IDEs
  
auto_detection:
  enabled: true                 # Fallback when preferences unavailable
  confidence_threshold: 0.8     # Minimum confidence for auto-selection
  prompt_on_ambiguity: true     # Ask user when uncertain
```

### **Enhanced Context File Structure**

**Moving beyond basic architecture/progress/tasks to sophisticated memory-mapped contexts:**

```markdown
<!-- .ctx.drafts.md - Working Memory Integration -->
# 🔬 Active Research & Exploration

## Current Investigations
- [ ] Performance optimization approaches
- [ ] Alternative architecture patterns

<!-- MEMORY_INTEGRATION: working -->
<!-- SYNC_FREQUENCY: real_time -->

<!-- .ctx.research.md - Semantic Memory Integration -->  
# 📚 Curated Knowledge Base

## Technology Survey
### Redis Clustering
**Confidence**: High | **Source**: Official docs + benchmarks

<!-- MEMORY_INTEGRATION: semantic -->
<!-- GRAPHITI_RELATIONSHIPS: technology_choices, performance_benchmarks -->

<!-- .ctx.adrs.md - Temporal Memory Integration -->
# ⚖️ Architectural Decisions

## ADR-001: Database Choice
**Date**: 2025-06-27 | **Status**: Accepted

<!-- MEMORY_INTEGRATION: temporal -->
<!-- DECISION_TRACKING: enabled -->

<!-- .ctx.specs.md - Procedural Memory Integration -->
# 📋 Project Specifications

## BDD Scenarios
Feature: User Authentication

<!-- MEMORY_INTEGRATION: procedural -->
<!-- WORKFLOW_PATTERNS: bdd, tdd, integration_testing -->
```

### **Memory-Aware Template System**

**Enhanced placeholders connecting file changes to memory updates:**

```markdown
<!-- META_TEMPLATE: Memory-Enhanced IDE Rules -->

# AI Assistant Context for {{PROJECT_NAME}}

## 🧠 Memory-Enhanced Context

### Current Focus (Working Memory)
{{MEMORY_WORKING_ACTIVE_DRAFTS}}

### Knowledge Base (Semantic Memory)  
{{MEMORY_SEMANTIC_RESEARCH_SUMMARY}}

### Decision History (Temporal Memory)
{{MEMORY_TEMPORAL_RECENT_ADRS}}

### Established Patterns (Procedural Memory)
{{MEMORY_PROCEDURAL_PROVEN_WORKFLOWS}}

### Learning Insights (Episodic Memory)
{{MEMORY_EPISODIC_PROJECT_PATTERNS}}

## 🎯 Session Intelligence
- **Active Session**: {{SESSION_ID}}
- **Memory State**: {{MEMORY_SYNC_STATUS}}
- **Cross-IDE Continuity**: {{SESSION_CONTINUITY_STATUS}}
```

## Implementation Strategy

### **Phase 1: Foundation (Weeks 1-2)**
- [ ] Extend `@lev-os/memory` with file monitoring capabilities
- [ ] Implement fractal inheritance between global and project memory
- [ ] Create enhanced context file types (drafts, research, adrs, specs)
- [ ] Build user preference management system

### **Phase 2: IDE Integration (Weeks 3-4)**
- [ ] Multi-IDE detection with user preference priority
- [ ] Memory-aware template merge engine  
- [ ] Real-time context file synchronization
- [ ] MCP integration for supported IDEs

### **Phase 3: Intelligence Layer (Weeks 5-6)**
- [ ] Bi-directional sync between files and memory
- [ ] Cross-IDE session continuity
- [ ] Intelligent context summarization
- [ ] Pattern recognition and optimization suggestions

## Consequences

### **Positive**
- **Seamless Multi-IDE Workflow**: Users can switch between 4+ tools with perfect context continuity
- **Enhanced AI Understanding**: Memory integration provides richer, more accurate context to AI assistants
- **Intelligent Pattern Recognition**: System learns from successful patterns and suggests optimizations
- **Universal Compatibility**: Works across all major IDEs with appropriate feature levels
- **Future-Proof Architecture**: Supports emerging IDEs and development patterns

### **Negative**
- **Implementation Complexity**: Sophisticated memory integration requires careful architecture
- **Performance Considerations**: Real-time sync may impact system performance on large projects
- **User Learning Curve**: Enhanced context structure may require education for optimal usage
- **Maintenance Overhead**: Supporting multiple IDEs with different capabilities increases maintenance burden

### **Risk Mitigation**
- **Performance**: Implement debouncing, caching, and selective sync strategies
- **Complexity**: Provide sensible defaults and progressive enhancement
- **Compatibility**: Tiered support model with graceful degradation
- **Migration**: Provide migration tools and backward compatibility

## Integration Points

### **Existing Memory System Enhancement**
- **Procedural Memory**: Development protocols, testing procedures, deployment patterns
- **Semantic Memory**: Research findings, technology surveys, knowledge bases  
- **Temporal Memory**: Decision timeline, project evolution, change history
- **Working Memory**: Current drafts, active research, immediate context
- **Episodic Memory**: Project successes, pattern discoveries, learned optimizations

### **MCP Tools Enhancement**
**New Tools**:
- `memory_file_sync` - Synchronize files with memory system
- `context_generate` - Generate enhanced context for current project
- `ide_configure` - Set up IDE integration for current project
- `pattern_analyze` - Analyze project patterns and suggest optimizations

### **Session Manager Integration**
- File monitoring state preservation across sessions
- IDE configuration persistence and restoration  
- Context file versioning and rollback capabilities
- Cross-session pattern recognition and learning

## Success Metrics

### **Technical Performance**
- File monitoring latency: < 100ms from change to memory update
- IDE sync performance: < 250ms from memory update to rules file injection
- Memory query speed: < 50ms for context file retrieval
- Session continuity: 100% context preservation across IDE switches

### **User Experience**
- Context accuracy: AI assistant maintains 95%+ relevant context
- Setup time: < 5 minutes from installation to working IDE integration
- Error recovery: Graceful handling of 99%+ failure scenarios
- Cross-platform compatibility: Works on macOS, Linux, Windows

### **Intelligence Capabilities**
- Pattern recognition: Identifies optimizations in 80%+ of projects
- Predictive accuracy: Context predictions relevant 90%+ of the time
- Learning effectiveness: Improves recommendations over time
- Knowledge synthesis: Successfully combines information across memory types

## Alternative Approaches Considered

### **Single IDE Focus**
**Rejected**: Limits developer tool choice and doesn't address multi-tool workflows

### **External Service Architecture** 
**Rejected**: Adds deployment complexity and potential security concerns

### **File-Only Approach (No Memory Integration)**
**Rejected**: Misses opportunity to leverage sophisticated 5-type memory system

### **Auto-Detection Only**
**Rejected**: Doesn't respect user workflow preferences and tool choices

## Related ADRs

- **ADR-001**: Hybrid Memory Architecture - Foundation for memory integration
- **ADR-002**: Plugin Privilege System - Security framework for IDE integration
- **ADR-003**: Five Memory Types - Memory classification system being enhanced

## References

- Erasmus Repository Analysis: `~/lev/_ref/erasmus/`
- Pattern Extraction Documentation: `~/lev/packages/memory/_lev.md`
- Workshop Analysis: `~/lev/workshop/analysis/erasmus/`
- Existing Memory Documentation: `~/lev/packages/memory/docs/`

---

**Decision Status**: Proposed  
**Next Steps**: Review with team, begin Phase 1 implementation  
**Review Date**: 2025-07-04