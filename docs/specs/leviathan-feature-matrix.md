# Leviathan Feature Matrix - BDD-First Architecture

**All Features Defined Before Implementation**

## 🏗️ Core Package Features

### @lev-os/schema (The Lego Factory)
**Status**: Architecture complete, behavioral specs needed

**Features to Define**:
- [ ] Constitutional framework inheritance
- [ ] Schema validation pipeline  
- [ ] Lego mold definition system
- [ ] Template intelligence (BMAD-inspired)
- [ ] Version management and migration
- [ ] Performance requirements (validation speed)

**Spec Location**: `core/schema/specs/`
**Current State**: Has architecture, needs behavioral definitions

### @lev-os/legos (The Lego Builder)  
**Status**: Basic structure, needs complete feature definition

**Features to Define**:
- [ ] Context assembly system (runtime composition)
- [ ] Generation system (build-time creation)
- [ ] Template processing engine
- [ ] Validation pipeline integration
- [ ] Task orchestration framework
- [ ] Multi-adapter support (MCP, CLI, HTTP, gRPC)

**Spec Location**: `core/legos/specs/`
**Current State**: TypeScript interfaces exist, behaviors undefined

### @lev-os/context (Universal Context Library)
**Status**: Concept exists, implementation pending

**Features to Define**:
- [ ] Context storage and retrieval
- [ ] BDD specs for context behaviors
- [ ] User-facing context library interface
- [ ] Context linking and composition
- [ ] Search and discovery
- [ ] Version control for contexts

**Spec Location**: `core/context/specs/` (to be created)
**Current State**: Architectural concept only

### @lev-os/workshop (Meta-Development System)
**Status**: Partial implementation, needs feature completion

**Features to Define**:
- [ ] Wizard experience with five-fold path
- [ ] Intake pipeline automation
- [ ] ADR generation workflow
- [ ] Concept lifecycle management
- [ ] BMAD template integration
- [ ] MCP tool auto-generation

**Spec Location**: `core/workshop/specs/` (enhance existing)
**Current State**: Has commands, needs systematic feature definition

## 🧠 Agent System Features

### Memory System
**Status**: Advanced implementation, needs behavioral specs

**Features to Define**:
- [ ] Five memory types (procedural, semantic, episodic, working, temporal)
- [ ] Hybrid backend architecture (Neo4j, Qdrant, Graphiti)
- [ ] Auto-detection and service orchestration
- [ ] Plugin-specific memory contexts
- [ ] Memory decay and intelligence bubbling
- [ ] Cross-agent memory sharing

**Spec Location**: `core/memory/docs/specs/` (enhance existing)
**Current State**: Working implementation, documented decisions

### Agent Orchestration
**Status**: MCP implementation exists, needs feature formalization

**Features to Define**:
- [ ] CEO orchestrator pattern
- [ ] Synth agent creation and management
- [ ] Universal command registry
- [ ] Multi-adapter command routing
- [ ] Session management and continuity
- [ ] Confidence-based task routing

**Spec Location**: `agent/specs/` (to be created)
**Current State**: Working MCP server, needs BDD specs

## 🧪 Testing & Validation Framework

### Universal Testing Engine
**Status**: Comprehensive framework exists

**Features Already Defined**:
- ✅ Universal adapter strategy
- ✅ Plugin validation framework
- ✅ Performance benchmarking
- ✅ Community validation
- ✅ Integration testing patterns

**Spec Location**: `core/testing/` (complete)
**Current State**: ADRs exist, comprehensive implementation

### Validation Framework  
**Status**: Advanced implementation with philosophical approach

**Features Already Defined**:
- ✅ Mathematical validation
- ✅ Expert consensus validation
- ✅ Opposition validation (devil's advocate)
- ✅ Parliament validation (multiple perspectives)
- ✅ Breakthrough bubbling
- ✅ Visualization validation

**Spec Location**: `core/validation/` (complete)
**Current State**: Sophisticated implementation with philosophical grounding

## 📋 Implementation Priority Matrix

### Phase 1: Constitutional Framework (Week 1-2)
1. **@lev-os/schema behavioral specs** - Foundation for everything else
2. **Template intelligence specification** - BMAD-inspired patterns
3. **Instance configuration system** - Fractal deployment patterns

### Phase 2: Assembly System (Week 3-4)  
1. **@lev-os/legos behavioral specs** - How contexts get assembled
2. **Workshop MCP tool integration** - Automation patterns
3. **Context library design** - Storage and retrieval patterns

### Phase 3: Meta-System (Week 5-6)
1. **Workshop feature completion** - Full wizard experience
2. **Agent orchestration specs** - CEO + synth patterns  
3. **End-to-end integration testing** - Full system validation

## 🎯 BDD-First Development Workflow

### For Each Module:
1. **Define Features** - What should this module DO?
2. **Write BDD Specs** - Behavioral specifications in Gherkin
3. **Create Behavioral Docs** - Detailed behavior descriptions
4. **Define Contracts** - Input/output specifications
5. **Implement Tests** - Driven by the specs
6. **Generate Documentation** - Derived from specs
7. **Build Implementation** - Validated by tests

### Success Criteria:
- [ ] Every feature has a BDD specification
- [ ] Every spec has corresponding tests
- [ ] Every test passes before implementation begins
- [ ] Documentation is generated from specs
- [ ] All modules follow the same spec structure

---

**Next Action**: Apply concept lifecycle analysis template to determine which module specs to tackle first.