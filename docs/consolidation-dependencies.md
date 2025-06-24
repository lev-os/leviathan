# Leviathan Documentation Dependency Graph

## Overview

This document maps the dependencies between different documentation concepts to guide the consolidation order. Understanding these relationships is critical for maintaining conceptual integrity during the merge.

## Core Dependency Tree

```
┌─────────────────────────────────────────┐
│   LLM-First Principles (orig-agent)     │
│   "Can an LLM do this?"                 │
└────────────┬────────────────────────────┘
             │
             ├──► Bi-Directional Flow (mcp-ceo)
             │    ├──► FlowMind (LLM as runtime)
             │    ├──► Dynamic Context Assembly
             │    └──► Personality System (8 EEPS)
             │
             ├──► Constitutional AI Framework
             │    ├──► Prime Context Loading
             │    ├──► Values-Based Decisions
             │    └──► Governance Patterns
             │
             └──► Everything is Context/Agent
                  ├──► Hexagonal Architecture
                  ├──► Package vs Plugin Design
                  └──► Workflow Orchestration
```

## Critical Path Dependencies

### 1. Foundation Layer (Must Complete First)

```
Core Principles → Architecture Patterns → Implementation Specs
```

- **Core Principles** (CORE_PRINCIPLES.md)

  - Blocks: All architectural decisions
  - Defines: LLM-first philosophy
  - Critical for: Understanding system design

- **Bi-Directional Flow** (BIDIRECTIONAL-FLOW-DIAGRAM.md)
  - Blocks: Whisper evolution, MCP patterns
  - Defines: Communication architecture
  - Critical for: Context assembly, callbacks

### 2. Architecture Layer

```
Package Architecture ←→ Memory Design ←→ Plugin System
```

- **Package vs Plugin** (\_core.md)

  - Blocks: Import patterns, project structure
  - Influences: Memory backend design
  - Critical for: Clean boundaries

- **Memory Architecture** (3 competing designs)
  - Blocks: Data persistence patterns
  - Influences: Context storage
  - Requires: Architecture decision

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

### Hard Blocks (Must Resolve First)

1. **Bi-Directional Flow Understanding**

   - Blocks: Whisper evolution, MCP patterns, context assembly
   - Resolution: Deep dive into mcp-ceo implementation

2. **Package Architecture Decision**

   - Blocks: All code organization, imports, structure
   - Resolution: Finalize \_core.md recommendations

3. **Memory Architecture Choice**
   - Blocks: Data persistence, context storage
   - Resolution: Compare 3 designs, make decision

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

### Phase 1A: Critical Foundation (Week 1)

1. Extract Core Principles from orig-agent
2. Document Bi-Directional Flow from mcp-ceo
3. Resolve Package vs Plugin architecture

### Phase 1B: Architecture Decisions (Week 1-2)

1. Memory architecture decision (choose from 3)
2. FlowMind documentation
3. Hexagonal architecture patterns

### Phase 2A: Current State Documentation (Week 2)

1. Whisper system current state
2. Existing MCP patterns
3. Current plugin system

### Phase 2B: Evolution Planning (Week 2-3)

1. Whisper → Bi-directional migration
2. Static → Dynamic context assembly
3. Plugin → Package migration

### Phase 3: Implementation Patterns (Week 3-4)

1. Extract working code from mcp-ceo
2. Document test patterns
3. Create migration guides

### Phase 4: Integration Planning (Week 4+)

1. Workshop tool classification
2. Mastra pattern integration
3. Advanced feature specs (JEPA, etc.)

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

### Dependency Resolution Checklist

- [ ] Core principles documented and understood
- [ ] Bi-directional flow patterns extracted
- [ ] Package architecture finalized
- [ ] Memory architecture chosen
- [ ] Evolution paths clearly defined
- [ ] No circular dependencies
- [ ] All concepts have a home

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
Start → Foundation → Concepts → Architecture → Implementation → Integration → Advanced
  ↓         ↓          ↓            ↓               ↓              ↓           ↓
Phase 0   Phase 1   Phase 0.5    Phase 1-2      Phase 2-3      Phase 4     Phase 5
```

---

_This dependency graph ensures we consolidate documentation in the correct order, preserving conceptual integrity and avoiding rework. Updated to include revolutionary concepts and their specific line-number dependencies._
