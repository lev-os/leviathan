# Kingly Core MCP-MVP Documentation

## Documentation Structure

This documentation follows an ADR-focused organization with clean separation of concerns:

### Core Documentation
- **README.md** - Project overview and getting started
- **CLAUDE.md** - Project instructions for Claude Code integration

### Architecture & Design Records
- **adr/** - Architecture Decision Records (001-007)
  - Sequential numbered ADRs documenting key architectural decisions
  - ADR-007 includes research validation and automated testing
- **architecture/** - Core system design documents
  - `core-system.md` - Foundational architecture overview
  - `hybrid-command-architecture.md` - Hybrid command system design
  - `knowledge-graph.md` - Knowledge graph implementation

### Features Documentation
- **features/** - Detailed feature documentation
  - `job-system.md` - Comprehensive job orchestration system documentation

### Testing Documentation
- **testing/** - Test framework and E2E documentation
  - `framework.md` - Complete testing strategy and implementation
  - `e2e-claude-code.md` - Claude Code integration testing

### Research
- **research/** - Active theoretical and experimental work
  - `constitutional-framework/` - Neurochemical optimization AI research
  - `system-designs/` - Advanced system architecture explorations

### Archive
- **archive/** - Obsolete and deprecated documentation
  - `drafts/` - Outdated system designs
  - `features/` - Deprecated feature documentation
  - Individual archived files: old roadmaps, outdated analysis

## Architecture Decision Records (ADRs)

All major architectural decisions are documented as ADRs in `docs/adr/`:

### Core System Decisions
- [001 - Session Intelligence](adr/001-session-intelligence.md) - Multi-tab coordination and session continuity
- [002 - Template Propagation](adr/002-template-propagation.md) - Context promotion and fractal structure
- [003 - Claude Code Integration](adr/003-claude-code-integration.md) - Direct adapter pattern for performance
- [004 - Distributed Intelligence](adr/004-distributed-intelligence.md) - Cross-workspace intelligence sharing
- [005 - Implementation Roadmap](adr/005-implementation-roadmap.md) - Development phases and priorities
- [006 - Command Naming Strategy](adr/006-command-naming-strategy.md) - CLI command design patterns
- [007 - ACI Optimization Feature Flag](adr/007-aci-optimization-feature-flag.md) - Adaptive Context Intelligence

## Quick Start

### Prerequisites
```bash
npm install -g pnpm
pnpm install
```

### Basic Usage
```bash
# Find workflows
kingly find "creative brainstorming"

# Session management
kingly checkpoint --new "starting feature work"
kingly checkpoint --context "implemented auth system"
kingly checkpoint --final "feature complete"

# Constitutional validation
kingly validate context.yaml
```

## System Overview

### Core Principles
1. **LLM-First Architecture**: Behavior emerges from AI reasoning, not hardcoded logic
2. **Constitutional AI**: Neurochemical optimization for appropriate brain chemistry
3. **Fractal Intelligence**: Local `.kingly/` mirrors global `~/ka/` structure
4. **Direct Adapters**: 10-100x performance boost over MCP protocol
5. **Session Continuity**: Cross-tab coordination and context handoffs

### Key Components
- **Hybrid Router**: Dual CLI (explicit commands + natural language)
- **Constitutional Framework**: Six principles with neurochemical optimization
- **Session Manager**: Multi-tab coordination and checkpoint system
- **Workflow Engine**: Semantic search with combo intelligence
- **Context Promotion**: Fractal validation and global promotion

### Performance Profile
- Quick code lookup: ~10ms
- Semantic search: ~200-500ms
- Constitutional validation: ~100-300ms
- Session operations: ~200ms

## For Developers

## Current Status

**See `current-status.md` for comprehensive analysis of what's actually implemented vs what was previously documented.**

## Documentation Map

See `documentation-map.csv` for complete inventory of all markdown files and their disposition (keep/move/archive).

## Key Findings

### Constitutional Framework Research
The constitutional framework is sophisticated **neurochemical optimization research** for AI personality adaptation:
- High-energy action states for urgent tasks
- Deep focus analytical states for complex problems  
- Creative flow states for ideation
- Crisis management states for emergencies

**Status**: Active research in `docs/research/constitutional-framework/` - theoretical but valuable AI research.

### Code vs Documentation Gap
- **Documented plans**: Admin commands, job system, open source launch
- **Actual codebase**: Job system broken (`generateJobStructure` missing), no admin router
- **Working features**: Hybrid routing, semantic search, checkpoints, testing framework

### Implementation Status
✅ **Core System**: Hybrid router, workflow engine, constitutional framework
✅ **Session System**: Checkpoints, handoffs, multi-tab coordination
✅ **Testing Framework**: Complete and functional test suite
⚠️ **Job System**: Core implemented, missing utility methods
❌ **Admin Commands**: Designed but not implemented
❌ **Constitutional Framework**: Theoretical only, sophisticated but not coded

### Architecture Patterns
- **Direct Adapter Pattern**: Bypass MCP for performance-critical operations
- **Constitutional Validation**: AI ethics with neurochemical optimization
- **Whisper Guidance**: Hidden system prompts for LLM context
- **Fractal Promotion**: Local innovation → global ecosystem

### Testing
```bash
# Test constitutional framework
node test-constitutional-framework.js

# Test core functionality
pnpm test
```

### Key Files
- `src/hybrid-router.js` - Main command routing and session management
- `src/claude-code-adapter.js` - High-performance workflow discovery
- `src/core/constitutional-framework.js` - AI ethics and neurochemical optimization
- `contexts/patterns/personality/context.yaml` - Personality system implementation

## Contributing

1. All architectural decisions must be documented as ADRs
2. Follow LLM-first principles - prefer AI reasoning over hardcoded logic
3. Maintain constitutional compliance for all new features
4. Test constitutional validation for new contexts

## License

Private development - not yet open source