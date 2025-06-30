# @lev-os/memory Documentation Hub

**Hybrid Memory System Documentation Center**

> 🔗 **Component Entry Point:** [`core/memory/README.md`](../README.md)  
> 🧠 **Architecture:** Hybrid tiered system combining file system reliability with Graphiti intelligence

## 📚 Documentation Structure

### 🏗️ Architecture & Decisions
- [`architecture.md`](architecture.md) - Core system architecture overview
- [`adrs/`](adrs/) - Architecture Decision Records (ADRs)
- [`decisions/`](decisions/) - Historical decisions and rationale

### ⚡ Features & Capabilities  
- [`features/`](features/) - Memory system feature specifications
- [`integration.md`](integration.md) - Integration patterns and examples

### 📖 Specifications & Guides
- [`specs/`](specs/) - Technical specifications and protocols
- [`guides/`](guides/) - Usage and development guides

### 🔬 Examples & Patterns
- [`../examples/`](../examples/) - Working code examples and demonstrations

## 🧠 Memory Types Overview

| Memory Type | Backend | Purpose | Access Pattern |
|-------------|---------|---------|----------------|
| **Working** | RAM/Cache | Active session state | Ultra-fast |
| **Semantic** | Neo4j + Graphiti | Vector embeddings | Vector search |
| **Temporal** | Neo4j + Graphiti | Session evolution | Time-based |
| **Episodic** | Neo4j + Graphiti | Agent learning | Experience-based |
| **Procedural** | File System | YAML workflows | File-based |

## 🔗 Quantum Links

### Component Relationships
- **Parent:** [`core/`](../../README.md) - Core Leviathan packages
- **Siblings:** [`core/commands/`](../../commands/docs/), [`core/debug/`](../../debug/docs/), [`core/validation/`](../../validation/docs/)
- **Dependencies:** [`plugins/`](../../../plugins/) - Memory-aware plugins

### Cross-System Integration
- **Agent System:** [`agent/`](../../../agent/README.md) - Memory-aware agent runtime
- **OS Layer:** [`os/`](../../../os/README.md) - Kernel-level memory management
- **Applications:** [`apps/`](../../../apps/) - Memory-consuming applications

## 🚀 Quick Navigation

**For Developers:**
- **Getting Started:** [`../README.md#quick-start`](../README.md#quick-start)
- **Integration Guide:** [`integration.md`](integration.md)
- **API Reference:** [`specs/`](specs/)

**For Architects:**
- **System Design:** [`architecture.md`](architecture.md)
- **Decision History:** [`decisions/`](decisions/)
- **ADR Collection:** [`adrs/`](adrs/)

**For Users:**
- **Usage Examples:** [`../examples/`](../examples/)
- **Configuration:** [`guides/`](guides/)

---

*Part of the [Leviathan Fractal Documentation Architecture](../../../README.md#documentation-architecture---fractal--quantum-consciousness)*