# ADR: Core Packages Integration with Existing Leviathan System

## Status
**ACCEPTED** - Integration plan for @lev-os/debug and @lev-os/cmd with existing LLM-first architecture

## Context
Two new core packages (@lev-os/debug, @lev-os/cmd) need integration with existing Leviathan system at `/digital/leviathan/agent` which has:
- **BDD workflow system** for generating specifications from ADRs
- **YAML-first plugin architecture** with existing parallel.yaml plugin
- **FlowMind context switching** with agent personalities (NFJ-Visionary, STP-Adapter, etc.)
- **MCP server integration** with semantic workflow discovery
- **Constitutional AI framework** for validation and stress reduction

## Decision

### Integration Strategy: Extend, Don't Replace

#### 1. Core Packages as Foundation Layer
- **@kingly/debug** becomes universal debugging for ALL existing agents and workflows
- **@kingly/cmd** handles process management for parallel development (git worktree, Claude Code spawning)
- Both packages integrate with existing command registry and YAML configuration system

#### 2. BDD Testing via Existing Workflow
- **No separate test framework** - use existing `contexts/workflows/bdd-specification/`
- **LLM-generated tests** through personality-driven BDD workflow steps
- **Integration testing** via MCP server and actual agent context switching
- **Test through usage** - parallel.yaml plugin becomes first integration test

#### 3. Extend Existing Plugin Architecture
```yaml
# Enhanced parallel.yaml with core package integration
plugin:
  name: parallel
  dependencies:
    core_packages:
      - "@kingly/debug"    # Universal debugging integration  
      - "@kingly/cmd"      # Process management for worktrees
```

#### 4. Command Registry Enhancement
```yaml
# Add core package commands to existing registry
commands:
  debug_events:
    plugin: "@kingly/debug"
    personality: "doc-shepherd"
    llm_guidance: "Analyze system events for patterns and insights"
    
  cmd_worktree:
    plugin: "@kingly/cmd"  
    personality: "stp-adapter"
    llm_guidance: "Coordinate parallel development via git worktrees"
```

## Implementation Plan

### Phase 1: Foundation Integration
1. **Add core packages** to existing agent system package.json dependencies
2. **Enhance parallel.yaml** to use @kingly/debug and @kingly/cmd
3. **Update command registry** to include core package commands
4. **Extend MCP server** to expose debug and cmd functionality

### Phase 2: Agent Personality Integration  
1. **Debug integration** with FlowMind context switching
2. **Process management** for spawning Claude Code instances with agent contexts
3. **Constitutional validation** logging through @kingly/debug
4. **Confidence tracking** for all LLM operations

### Phase 3: BDD Workflow Enhancement
1. **Generate BDD specs** for core packages using existing workflow
2. **Test via agent personalities** through context switching scenarios
3. **Integration validation** via parallel development workflows
4. **Performance benchmarking** through @kingly/debug monitoring

## Rationale

### Why Extend vs Replace
- **Existing system works** - Has proven BDD workflow and agent personalities
- **LLM-first philosophy intact** - Core packages support, don't replace LLM reasoning
- **Context system powerful** - YAML-first configuration already handles complexity
- **Integration over isolation** - Core packages become tools for agents, not separate systems

### Benefits of This Approach
- ✅ **Immediate value** - Core packages enhance existing parallel development
- ✅ **LLM-first maintained** - All testing through agent personalities and reasoning
- ✅ **No architectural disruption** - Builds on existing patterns
- ✅ **Constitutional compliance** - Stress reduction through better debugging/monitoring
- ✅ **FlowMind integration** - Debug traces across personality switches

## Consequences

### Positive
- ✅ **Enhanced parallel development** - Git worktree + Claude Code + agent personalities
- ✅ **Universal debugging** - Trace LLM reasoning across all agent operations
- ✅ **Better process management** - Clean spawning and cleanup of parallel instances
- ✅ **Constitutional AI validation** - Debug constitutional framework operations
- ✅ **Preserved LLM-first philosophy** - Core packages serve agents, not replace them

### Negative
- ❌ **Increased complexity** - More moving parts in the system
- ❌ **Integration effort** - Need to update existing workflows and plugins
- ❌ **Dependency management** - Core packages become critical dependencies

### Neutral
- 🔄 **Learning curve** - Developers need to understand both core packages and agent system
- 🔄 **Documentation needs** - Must document integration patterns clearly
- 🔄 **Migration path** - Existing users need guidance on new capabilities

## Integration Examples

### Parallel Development with Core Packages
```yaml
# Enhanced parallel.yaml workflow
workflows:
  constitutional_discord_parallel:
    description: "Constitutional AI + Discord integration with enhanced debugging"
    initialization:
      debug_trace: "@kingly/debug traces all personality switches"
      worktree_setup: "@kingly/cmd creates isolated git worktrees"
      process_management: "@kingly/cmd spawns Claude Code with agent contexts"
    
    streams:
      - stream_id: constitutional_ai
        agent_personality: "nfj-visionary"
        worktree: ".kingly-worktrees/constitutional"
        debug_context: "constitutional-framework-trace"
        
      - stream_id: discord_integration
        agent_personality: "stp-adapter"  
        worktree: ".kingly-worktrees/discord"
        debug_context: "discord-integration-trace"
```

### BDD Testing Integration
```gherkin
Feature: Core Package Integration with Agent Personalities

Scenario: Debug traces personality switching
  Given a parallel development session is active
  And @kingly/debug tracing is enabled
  When the system switches from NFJ-Visionary to STP-Adapter
  Then the debug trace captures the context switch
  And confidence scores are logged for each personality
  And performance metrics show sub-500ms switching time

Scenario: Process management for parallel development
  Given multiple agent personalities need isolated workspaces
  When @kingly/cmd creates git worktrees for each agent
  Then each personality operates in isolation
  And constitutional AI validation applies to all streams
  And cleanup occurs automatically on session end
```

---
*Integration architecture for core packages with existing LLM-first agent system*