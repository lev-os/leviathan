# Dynamic Workflow System for Leviathan Platform

## Core Vision
Enable Leviathan to create and execute dynamic workflows on-demand where users can say:
- "add this https://youtu.be/..." → auto-ingest tool using @media + @workshop
- "use this and then scrape firebase docs, save them to this project and run doc llm synthesis" → dynamic workflow creation

## System-Wide Architecture Changes

### 1. Enhanced Agent System (`/agent/`)
**Current**: Static MCP tools, predefined workflows
**New**: Dynamic tool registration, runtime workflow composition, failure handling

Key additions:
- `src/dynamic-workflow-engine.js` - Parse natural language → executable workflows  
- `src/tool-registry-live.js` - Real-time tool registration from ingestion
- `src/failure-orchestrator.js` - Retry strategies, fallbacks, cross-workflow recovery

### 2. Workshop Evolution (`/workshop/`)
**Current**: Static tool evaluation and classification
**New**: Live ingestion pipeline, real-time evaluation, automatic packaging

Enhancements:
- `intake/live-evaluation/` - Real-time tool assessment using existing tier framework
- `intake/packaging-automation/` - Auto-create tool packages following plugin patterns
- `intake/mcp-integration/` - Auto-register with agent system

### 3. Plugin System (`/plugins/`)
**Current**: Static @lev-os plugins
**New**: Dynamic plugin creation, tool-to-plugin conversion

New capabilities:
- Auto-generate plugin.yaml from workshop evaluation
- Runtime plugin loading and unloading
- Tool capability discovery and mapping

### 4. Cross-System Integration
**Workflow**: URL → @media (transcript) → @workshop (evaluate) → @plugins (package) → @agent (register) → Available to all agents

## Dogfooding Implementation Plan

### Phase 1: Core Dynamic Engine (2 weeks)
1. **Workflow Parser** - "use X then do Y" → structured execution plan
2. **Tool Ingestion** - URL → evaluated tool using existing workshop framework  
3. **MCP Registration** - New tools automatically available to agents

### Phase 2: Advanced Orchestration (2 weeks)
4. **Failure Handling** - "what happens on failure? retries?" 
5. **Cross-Agent Coordination** - Multi-tab workflow execution
6. **State Management** - Workflow persistence and resumption

### Phase 3: Dogfooding Test (1 week)
7. **Test Case**: "add this https://youtu.be/g8JM3prvEf4?si=0Po9R1ZMOVrRoJin" 
8. **Complex Workflow**: "use this and then scrape firebase docs, save them to this project and run doc llm synthesis"
9. **Validation**: End-to-end workflow creation and execution

## Key System Changes
- **Agent System**: Runtime tool discovery, dynamic workflow composition
- **Workshop**: Live evaluation pipeline, auto-packaging
- **Plugin System**: Dynamic plugin creation and loading
- **Cross-System**: Unified workflow orchestration across all components

## Success Criteria
✅ Say "add this URL" → working tool in <5 minutes
✅ Natural language workflows → executable automation  
✅ Failure resilience with automatic retries
✅ All agents get new capabilities instantly
✅ True dynamic workflow composition on-demand

This transforms Leviathan from static tool collection to dynamic workflow platform - the foundation for long-running, adaptive AI systems.