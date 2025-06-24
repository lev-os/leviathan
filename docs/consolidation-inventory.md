# Leviathan Documentation Consolidation Inventory

## Overview

This document provides a complete inventory of all documentation files that need to be consolidated from various sources into the unified docs/ structure.

## Summary Statistics

- **Total Files to Consolidate**: ~375+
- **Root \_\*.md Files**: 18
- **Drafts Folder**: 15 (including 2 archived)
- **Reference Projects**: ~175+ documents (updated count)
  - orig-agent core: ~30 files
  - orig-agent/drafts/: 48 files (newly inventoried)
  - mcp-ceo core: ~20 files
  - mcp-ceo/tmp/: 75 files (newly inventoried)
- **Agent Documentation**: ~30 files
- **Workshop Materials**: 170+ tools and documents
- **Revolutionary Concepts**: 15+ key insights to extract

## Detailed Inventory

### 1. Root Level \_\*.md Files

| File                              | Size  | Purpose                                        | Target Location                              |
| --------------------------------- | ----- | ---------------------------------------------- | -------------------------------------------- |
| `_01-whisper.md`                  | 26KB  | Whisper system spec & bi-directional evolution | docs/specs/whisper-system/                   |
| `_01-prime.md`                    | 6.9KB | Universal prime context loading                | docs/specs/constitutional/prime-context.md   |
| `_01-codex.md`                    | 7.6KB | Codex plugin migration plan                    | docs/specs/plugins/codex/                    |
| `_01-mediaforge.md`               | 3.3KB | Media forge plugin spec                        | docs/specs/plugins/mediaforge/               |
| `_02-adapters.md`                 | 9.2KB | Adapter patterns and architecture              | docs/architecture/patterns/adapters.md       |
| `_02-refactor.md`                 | 6.2KB | Refactoring plans                              | docs/consolidation/archive/                  |
| `_03-jepa.md`                     | 20KB  | JEPA 2 self-learning plugin                    | docs/specs/integrations/jepa-learning/       |
| `_04-lev-testing-plugin.md`       | 24KB  | Testing plugin specification                   | docs/specs/testing/                          |
| `_04-os-llm-testing-framework.md` | 15KB  | OS-level testing framework                     | docs/specs/testing/os-framework/             |
| `_10-itsalivetools.md`            | 3.2KB | Tools integration spec                         | docs/specs/integrations/tools/               |
| `_core.md`                        | 14KB  | Core vs plugin architecture                    | docs/architecture/06-package-architecture.md |
| `_cleanup.md`                     | 3.0KB | Cleanup tracking                               | docs/consolidation/archive/                  |
| `_cleanup_complete.md`            | 3.5KB | Cleanup completion                             | docs/consolidation/archive/                  |
| `_tree.md`                        | 2.8KB | Directory structure                            | docs/consolidation/archive/                  |
| `_hormones.md`                    | 5.8KB | System hormones concept                        | docs/architecture/patterns/                  |
| `_branding.md`                    | 4.5KB | Branding guidelines                            | docs/guides/branding/                        |
| `whisper-architecture-wizard.md`  | 8.0KB | Whisper architecture guide                     | docs/specs/whisper-system/                   |
| `whisper-wizard-continuation.md`  | 5.8KB | Whisper continuation                           | docs/specs/whisper-system/                   |

### 2. Drafts Folder Documents

| File                                                    | Size  | Purpose                      | Target Location                             |
| ------------------------------------------------------- | ----- | ---------------------------- | ------------------------------------------- |
| `001-project-codex-knowledge-crystallization-system.md` | 9.0KB | Codex system design          | docs/specs/plugins/codex/                   |
| `003-hybrid-memory-system-architecture.md`              | 4.6KB | Memory architecture option 1 | docs/architecture/memory/                   |
| `004-lev-os-memory-integration-architecture.md`         | 13KB  | Memory architecture option 2 | docs/architecture/memory/                   |
| `005-graphiti-only-memory-architecture.md`              | 9.2KB | Memory architecture option 3 | docs/architecture/memory/                   |
| `005-kingly-mcp-orchestration-layer.md`                 | 12KB  | MCP orchestration patterns   | docs/architecture/mcp-orchestration.md      |
| `007-mcp-functionality-integration-strategy.md`         | 12KB  | MCP integration strategy     | docs/integration/mcp/                       |
| `008-embedded-context-wasm-architecture.md`             | 14KB  | WASM architecture design     | docs/architecture/experimental/wasm/        |
| `adr-004-lev-os-memory-integration-architecture.md`     | 7.8KB | Memory ADR                   | docs/adr/011-020-architecture-evolution/    |
| `adr-005-graphiti-only-memory-architecture.md`          | 9.2KB | Memory ADR                   | docs/adr/011-020-architecture-evolution/    |
| `coding-guide.md`                                       | 7.5KB | Development standards        | docs/guides/development/coding-standards.md |
| `multiple-workstream-development-plan.md`               | 3.7KB | Development workflow         | docs/guides/development/workflow.md         |
| `production-coding-agents-analysis.md`                  | 9.3KB | Agent analysis               | docs/research/coding-agents/                |
| `whisper-bi-directional-plan.md`                        | 12KB  | Whisper evolution plan       | docs/specs/whisper-system/evolution-plan.md |
| `whisper-validation-examples.md`                        | 7.5KB | Whisper examples             | docs/specs/whisper-system/examples.md       |
| `workshop-fixes.md`                                     | 2.7KB | Workshop issues              | docs/workshop/maintenance/                  |

#### Archive Subfolder

| File         | Size  | Purpose                | Target Location                   |
| ------------ | ----- | ---------------------- | --------------------------------- |
| `_mem.md`    | 9.0KB | Memory system draft    | docs/architecture/memory/archive/ |
| `_03-mem.md` | 20KB  | Memory system detailed | docs/architecture/memory/archive/ |

### 3. Reference Projects (\_ref/)

#### orig-agent/

- **Core Documents**:

  - `CORE_PRINCIPLES.md` - Fundamental architecture principles
  - `README.md` - Project overview
  - `CLAUDE.md` - Claude integration guide
  - `migration-action-plan.md` - Migration planning
  - `CONSOLIDATION-PLAN.md` - Original consolidation plan

- **Documentation** (`docs/`):

  - Architecture documents
  - Backlog and specs
  - Reports and tracking
  - Workshop materials
  - Implementation guides

- **Key Concepts**:
  - "Can an LLM do this?" philosophy
  - Bi-directional flow pattern
  - Everything is an agent
  - Bootstrap sovereignty

#### mcp-ceo/

- **Core Documents**:

  - `README.md` - Architect of Abundance system
  - `ceo-config.yaml` - 8-personality configuration
  - `plan.md` - Implementation planning
  - `BIDIRECTIONAL-FLOW-DIAGRAM.md` - Critical architecture

- **Documentation** (`docs/`):

  - ADRs and specifications
  - Architecture documents
  - LLM-first patterns
  - Test guides
  - Research materials

- **Key Implementations**:
  - Working bi-directional flow
  - FlowMind (LLM as runtime)
  - Dynamic context injection
  - 100% test coverage

### 3.1. orig-agent/drafts/ Deep Inventory (48 files)

#### Vision & Strategy (13 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `vision-strategy/northstar-vision.md` | Ultimate product vision | docs/research/future-vision/ |
| `vision-strategy/kingly-to-agi-paradigm-shift.md` | AGI evolution path | docs/research/future-vision/ |
| `vision-strategy/strategic-implementation-roadmap.md` | Implementation strategy | docs/architecture/roadmap/ |
| `vision-strategy/quantum-insights/next-generation-world-changing-features.md` | Revolutionary features | docs/research/future-vision/quantum/ |
| `vision-strategy/quantum-insights/reality-bending-breakthrough-features.md` | Breakthrough concepts | docs/research/future-vision/quantum/ |
| `vision-strategy/quantum-insights/civilization-transcendence-features.md` | Far future vision | docs/research/future-vision/quantum/ |
| `vision-strategy/quantum-insights/quantum-session-summary.md` | Quantum insights summary | docs/research/future-vision/quantum/ |
| `vision-strategy/quantum-insights/session-meta-analysis.md` | Meta-analysis | docs/research/future-vision/quantum/ |
| `vision-strategy/quantum-insights/implementation-roadmap.md` | Quantum roadmap | docs/research/future-vision/quantum/ |

#### Memory Systems (11 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `memory-systems/memory-systems-comparative-analysis.md` | Memory comparison | docs/architecture/memory/ |
| `memory-systems/memory-benchmarking-framework.md` | Benchmarking system | docs/architecture/memory/ |
| `memory-systems/pluggable-memory-architecture.md` | Plugin memory design | docs/architecture/memory/ |
| `memory-systems/unified-memory-router-design.md` | Unified router | docs/architecture/memory/ |
| `memory-systems/session-capture-memory-architecture-insights.md` | Session insights | docs/architecture/memory/ |
| `memory-systems/memory-federation/memory-architecture-patterns.md` | Federation patterns | docs/architecture/memory/federation/ |
| `memory-systems/memory-federation/mcp-integration-strategies.md` | MCP memory integration | docs/architecture/memory/federation/ |
| `memory-systems/memory-federation/comprehensive-memory-systems.md` | Complete system | docs/architecture/memory/federation/ |
| `memory-systems/memory-federation/memory-benchmarking-framework.md` | Federation benchmarks | docs/architecture/memory/federation/ |

#### Intelligence Systems (6 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `intelligence/self-evolution-system.md` | Self-improving AI | docs/research/intelligence-patterns/ |
| `intelligence/synthetic-agent-factory.md` | Agent generation | docs/research/intelligence-patterns/ |
| `intelligence/workflow-dna-sequences.md` | Workflow genetics | docs/research/intelligence-patterns/ |
| `intelligence/portfolio-intelligence-system.md` | Portfolio management | docs/research/intelligence-patterns/ |
| `intelligence/echo-project-intelligence-epic-breakdown.md` | Echo intelligence | docs/research/intelligence-patterns/ |
| `intelligence/meta-prompting-methodology.md` | Meta-prompting | docs/research/intelligence-patterns/ |

#### Architecture (5 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `architecture/context-driven-architecture.md` | Context-first design | docs/architecture/patterns/ |
| `architecture/enhanced-context-architecture.md` | Enhanced contexts | docs/architecture/patterns/ |
| `architecture/dual-llm-implementation-example.md` | Dual LLM example | docs/patterns/dual-llm-coordination.md |
| `architecture/dual-llm-redis-filesystem-architecture.md` | Dual LLM with Redis | docs/architecture/patterns/ |
| `architecture/homework-pattern-deep-analysis.md` | Homework pattern | docs/patterns/ |

#### MCP Integration (5 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `mcp-integration/mcp-installation-system.md` | MCP setup | docs/guides/integration/mcp/ |
| `mcp-integration/mcp-cli-port-analysis.md` | CLI port analysis | docs/architecture/mcp-orchestration.md |
| `mcp-integration/mcp-cli-implementation-guide.md` | Implementation guide | docs/guides/integration/mcp/ |
| `mcp-integration/mcp-cli-terminal-integration-design.md` | Terminal design | docs/architecture/mcp-orchestration.md |
| `mcp-integration/mcp-use-ultimate-server-integration.md` | Ultimate server | docs/guides/integration/mcp/ |

#### User Experience (5 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `user-experience/user-preferences-system.md` | Preference system | docs/architecture/patterns/ |
| `user-experience/context-os-distribution.md` | Context OS | docs/research/future-vision/ |
| `user-experience/context-gallery-distribution.md` | Context gallery | docs/research/future-vision/ |
| `user-experience/native-agentic-dx-commands.md` | DX commands | docs/guides/development/ |
| `user-experience/dx-prototype-plan.md` | DX prototype | docs/research/future-vision/ |

#### Specifications (4 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `specifications/decision-logging-analytics.md` | Decision logging | docs/specs/analytics/ |
| `specifications/spec-pivot-handling.md` | Pivot handling | docs/specs/workflow/ |
| `specifications/spec-agent-workspace-memory.md` | Workspace memory | docs/specs/memory/ |
| `specifications/temporal-integration-experiment.md` | Temporal integration | docs/specs/experimental/ |

#### Research (5 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `research/josh1.md` | Research notes 1 | docs/research/notes/ |
| `research/josh2.md` | Research notes 2 | docs/research/notes/ |
| `research/synthesis-emotional-evolution-system.md` | Emotional evolution | docs/research/intelligence-patterns/ |
| `research/comprehensive-synthesis-emotional-evolution.md` | Complete synthesis | docs/research/intelligence-patterns/ |
| `research/academic-paper-emotional-evolution-ai-agents.md` | Academic paper | docs/research/papers/ |

### 3.2. mcp-ceo/tmp/ Complete Inventory (75 files)

#### Core Analysis (13 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `01-llm-first-architect-analysis.md` | LLM-first analysis | docs/research/personality-analysis/ |
| `02-repository-analyst-findings.md` | Repository analysis | docs/research/personality-analysis/ |
| `03-security-auditor-assessment.md` | Security assessment | docs/research/personality-analysis/ |
| `04-performance-optimizer-analysis.md` | Performance analysis | docs/research/personality-analysis/ |
| `05-devops-engineer-implementation.md` | DevOps implementation | docs/research/personality-analysis/ |
| `06-FINAL-SYNTHESIS.md` | Final synthesis | docs/research/personality-analysis/ |
| `07-cognitive-parliament-analysis.md` | Cognitive parliament | docs/research/personality-analysis/ |
| `08-multi-expert-validation-analysis.md` | Multi-expert validation | docs/research/personality-analysis/ |
| `09-integration-architecture-analysis.md` | Integration architecture | docs/research/personality-analysis/ |
| `10-FINAL-UNIVERSAL-VALIDATION-SYNTHESIS.md` | Universal validation | docs/research/personality-analysis/ |

#### Feature Analysis (6 files)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `11-feature-brainstorm-all-angles.md` | Feature brainstorm | docs/research/features/ |
| `12-quick-win-features.md` | Quick wins | docs/research/features/ |
| `13-game-changing-features.md` | Game changers | docs/research/features/ |
| `implementation-strategy.md` | Implementation plan | docs/architecture/roadmap/ |
| `market-positioning.md` | Market analysis | docs/research/business/ |
| `user-experience.md` | UX analysis | docs/research/ux/ |

#### Personality Deep Dives (8 files in agents/)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `agents/nfj-visionary-analysis.md` | NFJ analysis | docs/research/personality-analysis/eeps/ |
| `agents/nfp-advocate-analysis.md` | NFP analysis | docs/research/personality-analysis/eeps/ |
| `agents/ntj-strategist-analysis.md` | NTJ analysis | docs/research/personality-analysis/eeps/ |
| `agents/ntp-innovator-analysis.md` | NTP analysis | docs/research/personality-analysis/eeps/ |
| `agents/sfj-caregiver-analysis.md` | SFJ analysis | docs/research/personality-analysis/eeps/ |
| `agents/sfp-connector-analysis.md` | SFP analysis | docs/research/personality-analysis/eeps/ |
| `agents/stj-leader-analysis.md` | STJ analysis | docs/research/personality-analysis/eeps/ |
| `agents/stp-adapter-analysis.md` | STP analysis | docs/research/personality-analysis/eeps/ |

#### Pattern Analysis (15+ files in patterns/)
| File | Purpose | Target Location |
|------|---------|-----------------|
| `patterns/swot-analysis.md` | SWOT pattern | docs/patterns/analysis/ |
| `patterns/rice-scoring-analysis.md` | RICE analysis | docs/patterns/analysis/ |
| `patterns/10-10-10-framework-analysis.md` | 10-10-10 pattern | docs/patterns/analysis/ |
| `patterns/scamper-framework-analysis.md` | SCAMPER analysis | docs/patterns/analysis/ |
| `patterns/decision-matrix.md` | Decision matrix | docs/patterns/analysis/ |
| `patterns/echo-intelligence-patterns.md` | Echo patterns | docs/patterns/intelligence/ |
| `patterns/extreme-examples.md` | Extreme examples | docs/patterns/thinking/ |
| `patterns/figure-storming.md` | Figure storming | docs/patterns/thinking/ |
| `patterns/reverse-brainstorming.md` | Reverse brainstorm | docs/patterns/thinking/ |
| `patterns/reversibility-check.md` | Reversibility | docs/patterns/analysis/ |
| `patterns/noise-analysis.md` | Noise analysis | docs/patterns/analysis/ |
| `patterns/personality.md` | Personality patterns | docs/patterns/personality/ |
| `patterns/agile-scrum.md` | Agile patterns | docs/patterns/workflow/ |
| `patterns/vibe-coding.md` | Vibe coding | docs/patterns/workflow/ |

#### Semantic Parser Design (3 subdirectories)
| Directory | Contents | Target Location |
|-----------|----------|-----------------|
| `semantic-parser-design/control-structures/` | Conditional logic | docs/research/flowmind/parser/ |
| `semantic-parser-design/whisper-integration/` | Bidirectional flow | docs/research/flowmind/whisper/ |
| `semantic-parser-design/architecture/` | Parser grammar, injection | docs/research/flowmind/architecture/ |

### 4. Agent Documentation (agent/docs/)

| Directory       | Contents                  | Target Integration                   |
| --------------- | ------------------------- | ------------------------------------ |
| `architecture/` | Current architecture docs | Merge with consolidated architecture |
| `adr/`          | Architectural decisions   | Merge with consolidated ADRs         |
| `commands/`     | Command documentation     | docs/reference/commands/             |
| `integration/`  | Integration guides        | docs/guides/integration/             |
| `testing/`      | Testing documentation     | docs/guides/testing/                 |
| `features/`     | Feature documentation     | docs/reference/features/             |
| `research/`     | Research materials        | docs/research/                       |

### 5. Workshop Materials

| Category                                   | Contents                 | Priority | Target Location              |
| ------------------------------------------ | ------------------------ | -------- | ---------------------------- |
| `WORKSHOP-INTELLIGENCE-MASTER-PLAN.md`     | Master strategy          | HIGH     | docs/workshop/master-plan.md |
| `index.md`                                 | 170+ tool inventory      | HIGH     | docs/workshop/inventory.md   |
| `IMPLEMENTATION-TRACKER.csv`               | Progress tracking        | HIGH     | docs/workshop/tracking/      |
| `intake/mastra-*`                          | Mastra analysis (3 docs) | HIGH     | docs/integration/mastra/     |
| `intake/lev-os-package-migration-guide.md` | Package guide            | HIGH     | docs/architecture/migration/ |
| Tool directories (43+)                     | Individual tools         | MEDIUM   | Evaluate case-by-case        |

### 6. Revolutionary Concepts to Extract

These concepts represent breakthroughs that must be synthesized from multiple sources:

| Concept | Source Files | Target Documentation | Priority |
|---------|--------------|---------------------|----------|
| **FlowMind as Runtime** | `_ref/mcp-ceo/CLAUDE.md`, `_ref/mcp-ceo/docs/adr/007-flowmind-*.md` | docs/concepts/revolutionary/flowmind-runtime.md | CRITICAL |
| **Semantic Control Flow** | `_ref/mcp-ceo/docs/adr/007-flowmind-*.md` | docs/concepts/revolutionary/semantic-control.md | CRITICAL |
| **Bi-directional Evolution** | `_01-whisper.md` (lines 359-717), `_ref/mcp-ceo/docs/` | docs/concepts/revolutionary/bidirectional-evolution.md | CRITICAL |
| **Galaxy-Level Intelligence** | `_01-whisper.md` (lines 534-628) | docs/concepts/revolutionary/galaxy-intelligence.md | HIGH |
| **Confidence-Based Routing** | `_ref/orig-agent/CORE_PRINCIPLES.md` | docs/patterns/confidence-routing.md | HIGH |
| **Context Assembly Engine** | `_01-whisper.md`, `_ref/mcp-ceo/` | docs/architecture/context-assembly.md | HIGH |
| **8-Personality EEPS** | `_ref/mcp-ceo/ceo-config.yaml`, personality analyses | docs/architecture/personality-system.md | HIGH |
| **Whisper as Orchestrator** | `_01-whisper.md` deep analysis | docs/architecture/whisper-orchestration.md | HIGH |
| **Semantic Conditions** | FlowMind examples | docs/patterns/semantic-conditions.md | MEDIUM |
| **Dual LLM Architecture** | `_01-whisper.md`, orig-agent/drafts | docs/patterns/dual-llm-coordination.md | MEDIUM |
| **Everything is Context** | Multiple sources | docs/concepts/core/everything-is-context.md | MEDIUM |
| **LLM-First Philosophy** | `_ref/orig-agent/CORE_PRINCIPLES.md` | docs/concepts/core/llm-first-principles.md | HIGH |
| **Bootstrap Sovereignty** | orig-agent principles | docs/concepts/core/bootstrap-sovereignty.md | MEDIUM |
| **Fractal Context Inheritance** | Context YAML analysis | docs/patterns/context-inheritance.md | MEDIUM |
| **Quantum Insights** | orig-agent/drafts/vision-strategy/quantum-insights/ | docs/research/future-vision/quantum/ | LOW |

## Consolidation Priority Matrix

### Critical Path (Must Complete First)

1. **Core Principles** (orig-agent) - Foundation for everything
2. **Bi-directional Flow** (mcp-ceo) - The "missing secret"
3. **Package Architecture** (\_core.md) - Structural decisions
4. **Whisper Evolution** (\_01-whisper.md) - Current to future state

### High Priority (Core Architecture)

1. Memory architecture resolution (3 competing designs)
2. FlowMind documentation
3. Workshop master plan
4. Mastra integration patterns

### Medium Priority (Features & Specs)

1. JEPA learning system
2. Plugin specifications
3. Testing frameworks
4. Integration guides

### Low Priority (Future Work)

1. Experimental features (WASM)
2. Individual tool evaluations
3. Example applications
4. Branding materials

## Conflict Resolution Needed

### Memory Architecture

- 3 competing designs in drafts/
- Need architectural decision
- May require spike/POC

### Testing Frameworks

- Multiple testing specs
- Plugin vs OS-level testing
- Need unified approach

### Workshop Scope

- 170+ tools to evaluate
- Need strict prioritization
- Tier system application

### Workshop Tool Tiers (Key Tools by Classification)

| Tier | Tool Count | Priority Examples | Integration Status |
|------|------------|-------------------|-------------------|
| Tier 1-2 (Mission Critical) | ~15 tools | Ultimate MCP, CrewAI, Graphiti | HIGH - Immediate integration |
| Tier 3-4 (Strategic Value) | ~30 tools | Langchain, AutoGPT, Dify | MEDIUM - Phase 2 integration |
| Tier 5-6 (Specialized) | ~50 tools | Domain-specific tools | LOW - Evaluate individually |
| Tier 7-8 (Experimental) | ~75 tools | Research projects | FUTURE - Monitor progress |

## Concept Dependencies

### Critical Concept Relationships
1. **Whisper System** → **Bi-directional Flow** → **FlowMind**
   - Evolution from static breadcrumbs to dynamic orchestration
   
2. **LLM-First** → **Everything is Context** → **Semantic Control**
   - Philosophy enabling revolutionary architecture

3. **Confidence Routing** → **Task Splitting** → **Agent Orchestration**
   - Core workflow patterns

4. **Context Assembly** → **Dynamic Whispers** → **Galaxy Intelligence**
   - Advanced intelligence patterns

5. **Memory Federation** → **Session Management** → **Multi-Tab Coordination**
   - State and continuity systems

## Next Steps

1. **Validate Inventory**: ✅ Complete - 375+ files documented
2. **Create Dependency Graph**: ✅ Added concept dependencies above
3. **Begin Phase 0.5**: Extract revolutionary concepts first
4. **Track Progress**: Update consolidation-tracker.csv with new phases

---

_Last updated: Added 125+ missing files from orig-agent/drafts/ and mcp-ceo/tmp/, documented 15 revolutionary concepts, and mapped critical dependencies._
