# Leviathan Documentation Dependency Graph

## Overview

This document maps the dependencies between different documentation concepts to guide the consolidation order. Understanding these relationships is critical for maintaining conceptual integrity during the merge.

## v1.0 Core Technical Dependency Tree (Pure Plumbing)

```
┌─────────────────────────────────────────┐
│   LLM-First Principles (orig-agent)     │
│   "Can an LLM do this?"                 │
└────────────┬────────────────────────────┘
             │
             ├──► Hexagonal Architecture
             │    ├──► Adapters (CLI, MCP, API)
             │    ├──► Core Business Logic
             │    └──► Infrastructure Layer
             │
             ├──► Package vs Plugin Architecture
             │    ├──► Core Packages (directly imported)
             │    ├──► True Plugins (optional)
             │    └──► Clean Import Patterns
             │
             └──► Production Infrastructure
                  ├──► MCP Server (production-ready)
                  ├──► CLI Adapter (production-ready)
                  ├──► Test Suite (100% coverage)
                  ├──► Memory Interface (swappable backends)
                  └──► Mastra Pattern Integration
```

## v2.0 Advanced Features (After v1.0 Complete)

```
v1.0 Stable Foundation
         │
         ├──► Bi-Directional Flow Research (mcp-ceo)
         │    ├──► Dynamic Context Assembly
         │    ├──► Callback/Handoff System
         │    └──► FlowMind (LLM as runtime)
         │
         └──► Revolutionary Concepts
              ├──► Whisper Evolution
              ├──► Semantic Control Patterns
              └──► Galaxy-Level Intelligence
```

## Optional Experimental Plugins (Not Core)

```
Experimental Overlays (Enable/Disable at Will)
├──► Constitutional AI Plugin
│    └──► Values-based filtering overlay
├──► EEPS Personality Plugin
│    └──► 8-personality context overlay
└──► JEPA Learning Plugin
     └──► Self-learning capabilities
```

## Critical Path Dependencies

### v1.0 Foundation (Must Complete First)

```
Core Principles → Hexagonal Architecture → Package Structure → Production Infrastructure
```

- **Core Principles** (CORE_PRINCIPLES.md)

  - Blocks: All architectural decisions
  - Defines: LLM-first philosophy
  - Critical for: Understanding system design

- **Hexagonal Architecture**

  - Blocks: All code organization
  - Defines: Clean separation of concerns
  - Critical for: Maintainable system

- **Package vs Plugin** (\_core.md)
  - Blocks: Import patterns, project structure
  - Defines: What's core vs optional
  - Critical for: Clean dependencies

### v1.0 Infrastructure Requirements

```
MCP Server ←→ CLI Adapter ←→ Test Framework ←→ Memory Interface
     ↓            ↓              ↓                    ↓
Production   Production    100% Coverage      Swappable Backends
```

- **Production MCP Server**

  - Current: Working in agent/
  - Needs: Production hardening, full test coverage
  - Critical for: Tool integration

- **Production CLI Adapter**

  - Current: Working commands
  - Needs: Complete test coverage, error handling
  - Critical for: User interface

- **Memory Interface**
  - Current: 3 competing designs
  - Needs: Interface decision (not implementation)
  - Critical for: Data persistence abstraction

### v2.0 Research Dependencies (After v1.0)

```
v1.0 Complete → Bi-Directional Study → FlowMind Design → Implementation
                         ↓
                 Extract from mcp-ceo:
                 - Working patterns
                 - Test strategies
                 - Context switching
```

- **Bi-Directional Flow** (BIDIRECTIONAL-FLOW-DIAGRAM.md)

  - When: After v1.0 stable
  - Purpose: Advanced communication patterns
  - Not blocking: v1.0 production readiness

- **FlowMind** (mcp-ceo research)
  - When: After bi-directional understood
  - Purpose: LLM as runtime concept
  - Requires: Stable v1.0 foundation

### 3. Implementation Layer

```
Whisper System → Context Assembly → Workflow Execution
```

- **Current Whisper** (\_01-whisper.md)

  - Evolution path to: Bi-directional callbacks
  - Depends on: FlowMind concepts
  - Influences: All guidance systems

- **Workshop Intelligence** (workshop/)
  - Depends on: Package architecture
  - Influences: Tool integration patterns
  - Scale: 170+ tools

## Concept Relationship Map

### Evolutionary Paths

```
Static Whispers → Dynamic Context Assembly → FlowMind Orchestration
                    ↓                           ↓
              Callbacks/Handoffs          LLM as Runtime
```

### Architectural Relationships

```
Hexagonal Architecture
    ├── Adapters (CLI, MCP, API)
    ├── Core Domain (Business Logic)
    └── Infrastructure (Memory, Plugins)
         ↓
Package Structure
    ├── Core Packages (Required)
    └── Optional Plugins (True plugins)
```

### Integration Dependencies

```
Mastra Patterns → Memory Backends → Workflow Engine
                     ↓                    ↓
              Graphiti Integration    State Management
```

## Blocking Dependencies

### v1.0 Hard Blocks (Must Resolve First)

1. **Package Architecture Decision**

   - Blocks: All code organization, imports, structure
   - Resolution: Finalize \_core.md recommendations
   - Remove: Experimental features from core

2. **Hexagonal Architecture Implementation**

   - Blocks: Clean separation of concerns
   - Resolution: Adapters route, core computes
   - Critical: No business logic in adapters

3. **Memory Interface Definition**
   - Blocks: Data persistence abstraction
   - Resolution: Define interface only, not backend choice
   - Allows: Multiple backend implementations

### v2.0 Dependencies (Not Blocking v1.0)

1. **Bi-Directional Flow Understanding**

   - When: After v1.0 stable
   - Purpose: Advanced communication patterns
   - Resolution: Deep dive into mcp-ceo implementation

2. **FlowMind Architecture**
   - When: After bi-directional understood
   - Purpose: Revolutionary LLM runtime concept
   - Requires: Stable v1.0 base

### Soft Dependencies (Can Parallel)

1. **Workshop Tool Evaluation**

   - Can proceed independently
   - Influences integration priorities
   - No blocking on core architecture

2. **JEPA Learning System**

   - Advanced feature, not blocking
   - Depends on semantic search
   - Can design interface first

3. **Testing Frameworks**
   - Can consolidate in parallel
   - Influences quality assurance
   - Not blocking core design

## Consolidation Order Recommendation

### v1.0 Phase 1: Technical Foundation (Weeks 1-2)

1. Extract Core Principles from orig-agent (LLM-first philosophy)
2. Document Hexagonal Architecture patterns
3. Finalize Package vs Plugin separation
4. Define Memory Interface (not implementation)
5. Document Production MCP/CLI requirements
6. Extract Mastra integration patterns

### v1.0 Phase 2: Infrastructure Documentation (Weeks 3-4)

1. Production MCP Server specifications
2. CLI Adapter production requirements
3. Test framework patterns (100% coverage goal)
4. Current system analysis (what works, what needs fixing)
5. Migration plan from plugins to packages

### v1.0 Phase 3: Implementation (Weeks 5-6)

1. Package structure creation
2. Move false plugins to core packages
3. Extract experimental features to optional plugins
4. Update all import paths
5. Production hardening checklist

### v2.0 Phase 4: Research Only (Weeks 7-8)

1. Study Bi-Directional Flow from mcp-ceo
2. Extract FlowMind concepts
3. Document revolutionary patterns
4. Plan v2.0 architecture (no implementation yet)

### Parallel Work (Non-Blocking)

1. Workshop tool classification (can start anytime)
2. JEPA plugin design (optional feature)
3. Constitutional AI extraction (to plugin)
4. EEPS personality extraction (to plugin)
5. Documentation cleanup

## Risk Mitigation Through Dependencies

### High-Risk Dependencies

- **Bi-directional flow**: Document thoroughly before any implementation
- **Memory conflicts**: Create comparison matrix, spike if needed
- **Package migration**: Maintain parallel structures during transition

### Low-Risk Parallel Work

- Workshop evaluations can proceed anytime
- Test consolidation can happen independently
- Documentation cleanup is non-blocking

## Success Validation

### v1.0 Success Checklist

- [ ] Core principles (LLM-first) documented
- [ ] Hexagonal architecture implemented
- [ ] Package vs plugin separation complete
- [ ] MCP server production-ready
- [ ] CLI adapter production-ready
- [ ] 100% test coverage achieved
- [ ] Memory interface defined
- [ ] NO experimental code in core
- [ ] Mastra patterns integrated

### v2.0 Readiness Checklist

- [ ] v1.0 running stable in production
- [ ] Bi-directional flow patterns researched
- [ ] FlowMind concepts documented
- [ ] Migration path from v1.0 to v2.0 clear
- [ ] Revolutionary features understood

### Plugin Extraction Checklist

- [ ] Constitutional AI extracted to plugin
- [ ] EEPS personalities extracted to plugin
- [ ] JEPA design as optional plugin
- [ ] All experimental features out of core

## Revolutionary Concepts Dependencies

### Core Concept Evolution

```
1. Whisper System → Bi-directional Flow → FlowMind Runtime
   └─ From static breadcrumbs to dynamic orchestration

2. LLM-First → Everything is Context → Semantic Control
   └─ Philosophy enabling revolutionary architecture

3. Confidence Routing → Task Splitting → Agent Orchestration
   └─ Core workflow patterns (80% threshold)

4. Context Assembly → Dynamic Whispers → Galaxy Intelligence
   └─ Advanced intelligence patterns (dual LLM)

5. Memory Federation → Session Management → Multi-Tab Coordination
   └─ State and continuity systems
```

### FlowMind Concept Dependencies

```
FlowMind (THE LLM IS THE RUNTIME)
    ├─ Semantic Conditions ("when_semantic: 'user frustrated'")
    ├─ Dynamic Context Injection
    ├─ Natural Language Control Flow
    └─ Bidirectional Reasoning Loops
        └─ LLM → MCP → Context → LLM → Callback
```

### Whisper Evolution Dependencies

```
Phase 1: Static Breadcrumbs (_01-whisper.md lines 1-358)
    ↓
Phase 2: Dynamic Context Assembly (_01-whisper.md lines 359-533)
    ↓
Phase 3: Bi-directional Integration (_01-whisper.md lines 534-628)
    ↓
Phase 4: Galaxy-Level Intelligence (_01-whisper.md lines 629-717)
    ↓
Phase 5: Full FlowMind Orchestration (mcp-ceo implementation)
```

### 8-Personality EEPS Dependencies

```
CEO Configuration (ceo-config.yaml)
    ├─ NFJ-Visionary (Big picture)
    ├─ NFP-Advocate (User empathy)
    ├─ NTJ-Strategist (Technical architecture)
    ├─ NTP-Innovator (Creative solutions)
    ├─ SFJ-Caregiver (Team support)
    ├─ SFP-Connector (Integration)
    ├─ STJ-Leader (Execution)
    └─ STP-Adapter (Pragmatic adaptation)
        └─ All work through context switching
```

## Critical Implementation Dependencies

### Bi-directional Flow Implementation

```
mcp-ceo/src/
    ├─ bidirectional-flow.js (Core pattern)
    ├─ context-switcher.js (Dynamic contexts)
    ├─ semantic-evaluator.js (Natural language)
    └─ personality-engine.js (8 EEPS system)
        ↓
    100% test coverage proves the pattern works
```

### Semantic Control Implementation

```
ADR-007-flowmind-semantic-control-language.md
    ├─ Lines 15-45: when_semantic patterns
    ├─ Lines 63-84: Technical implementation
    └─ Lines 86-90: Three-tier synthesis
        ↓
    Enables natural language workflow control
```

## Phase 0.5 Dependencies (Revolutionary Concepts)

```
P05T01: FlowMind Runtime ← mcp-ceo/CLAUDE.md + ADR-007
P05T02: Semantic Control ← ADR-007 lines 15-45
P05T03: Bi-directional Evolution ← _01-whisper.md + mcp-ceo docs
P05T04: Galaxy Intelligence ← _01-whisper.md lines 534-628
P05T05: Pattern Library ← Multiple sources synthesis
```

## Visual Summary

```
v1.0: Start → Core Principles → Hex Architecture → Package Structure → Production Infrastructure → Testing
        ↓           ↓                 ↓                    ↓                      ↓              ↓
     Phase 0    Phase 1.1         Phase 1.2            Phase 1.3              Phase 2       Phase 3

v2.0: v1.0 Complete → Bi-Directional Research → FlowMind Study → Advanced Features → Revolutionary Concepts
           ↓                    ↓                      ↓                 ↓                    ↓
      Production            Phase 4.1              Phase 4.2         Phase 5              Future
```

## Key Distinctions

### v1.0 = Production Technical Foundation

- Pure technical plumbing
- No experimental features
- Battle-tested patterns
- 100% test coverage
- Clean architecture

### v2.0 = Revolutionary Features (After v1.0)

- Bi-directional flow
- FlowMind (LLM as runtime)
- Dynamic context assembly
- Advanced orchestration

### Plugins = Optional Experiments

- Constitutional AI (overlay)
- EEPS Personalities (overlay)
- JEPA Learning (advanced feature)
- Enable/disable without breaking core

---

_This dependency graph ensures v1.0 delivers a solid technical foundation before exploring v2.0 revolutionary features. All experimental concepts are extracted to optional plugins._
