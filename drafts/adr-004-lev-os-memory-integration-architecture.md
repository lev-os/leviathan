# ADR-004: @lev-os/memory Integration Architecture

**Date:** 2025-06-16  
**Status:** Approved  
**Context:** Creating @lev-os/memory as abstraction layer over existing Leviathan agent memory system

## Decision

Create @lev-os/memory as a **unified abstraction layer** that wraps existing Leviathan agent memory components (SessionManager, UniversalContextSystem, IntelligenceCoordinator) while providing clean plugin consumption interfaces for the ecosystem.

## Problem Statement

The Leviathan agent system has sophisticated memory components, but no unified interface for plugin consumption. We need to:

1. **Enable Plugin Memory Access**: Provide clean interfaces for plugins like infinite-genesis-canvas
2. **Maintain Backward Compatibility**: Preserve existing agent system functionality
3. **Enforce Memory Boundaries**: Scope plugin access through configuration
4. **Support Real-time Operations**: Enable memory streaming for canvas collaboration
5. **Validate Through Dogfooding**: Create and test @lev-os/memory through actual usage

## Architecture Decision

### **Enhanced Memory Abstraction Strategy (Updated 2025-06-19)**

**Note**: This architecture now integrates with ADR-005 Graphiti-only memory system.

```
@lev-os/memory (Enhanced Abstraction Layer)
├── GraphitiMemory (unified vector + graph + temporal)
├── SessionMemory (wraps ~/lev/agent SessionManager)
├── ContextMemory (wraps ~/lev/agent UniversalContextSystem)  
├── IntelligenceMemory (wraps ~/lev/agent IntelligenceCoordinator)
├── CorePluginMemory (elevated access for system plugins)
└── PluginMemory (scoped interface for regular plugins)
    ↓
Existing Leviathan Agent System + Graphiti Integration
├── SessionManager (YAML session persistence)
├── UniversalContextSystem (YAML inheritance & merging)
├── IntelligenceCoordinator (procedural memory & patterns)
├── PluginLoader (YAML-based plugin access)
└── GraphitiClient (unified memory backend on local Neo4j)
```

### **Enhanced Memory Interface Design**
```typescript
// @lev-os/memory main interface with plugin privilege system
export class MemoryManager {
  private graphiti: GraphitiClient;
  sessions: SessionMemory;      // Wraps existing SessionManager
  contexts: ContextMemory;      // Wraps existing UniversalContextSystem
  intelligence: IntelligenceMemory; // Wraps existing IntelligenceCoordinator
  
  constructor(options: MemoryOptions) {
    this.graphiti = new GraphitiClient({
      neo4j_uri: options.neo4jUri || "bolt://localhost:7687"
    });
    this.scope = options.scope;
    this.config = options.config;
  }
  
  // Core plugins (codex, memory, agent) get elevated access
  createCorePluginMemory(pluginId: string): CorePluginMemory {
    if (!this.isCorePlugin(pluginId)) {
      throw new Error(`Plugin ${pluginId} not authorized for core access`);
    }
    return new CorePluginMemory({
      graphiti: this.graphiti,           // Direct Graphiti access
      crossPluginComm: true,             // Inter-plugin communication
      globalMemoryAccess: true,          // Shared knowledge access
      namespaceManagement: true          // Can manage other plugin namespaces
    });
  }
  
  // Regular plugins get scoped, isolated access
  createPluginMemory(pluginId: string): PluginMemory {
    return new PluginMemory({
      scope: pluginId,
      graphiti: this.createScopedGraphitiProxy(pluginId),
      isolation: 'strict',
      permissions: 'standard'
    });
  }
  
  private isCorePlugin(pluginId: string): boolean {
    return ['codex', 'memory', 'agent'].includes(pluginId);
  }
}

// Core plugin interface (for Codex and system plugins)
interface CorePluginMemory {
  // Direct Graphiti access for advanced operations
  graphiti: GraphitiClient;
  
  // Enhanced capabilities
  crossPluginCommunication(): Promise<PluginCommunicationChannel>;
  globalMemoryAccess(): Promise<GlobalMemorySpace>;
  managePluginNamespaces(): Promise<NamespaceManager>;
  
  // All standard plugin capabilities
  store(key: string, data: any, options?: MemoryOptions): Promise<void>;
  retrieve(key: string, options?: RetrievalOptions): Promise<any>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  temporalQuery(timeRange: TimeRange, query?: string): Promise<TemporalResult[]>;
}

// Regular plugin interface (isolated and scoped)
interface PluginMemory {
  // Standard memory operations with namespace isolation
  store(key: string, data: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string): Promise<SearchResult[]>;
  
  // Limited temporal access (own namespace only)
  getHistory(key: string, timeRange?: TimeRange): Promise<HistoryResult[]>;
  
  // No direct Graphiti access - operations go through scoped proxy
}

// Plugin consumption patterns
import { MemoryManager } from '@lev-os/memory';

// Codex as core plugin
const codexMemory = memoryManager.createCorePluginMemory('codex');
await codexMemory.graphiti.hybrid_search({ /* advanced queries */ });

// Regular plugin
const regularMemory = memoryManager.createPluginMemory('my-plugin');
await regularMemory.search('pattern query'); // Scoped to plugin namespace
```

## Implementation Plan

### **Phase 1: Core Abstraction Layer (Week 1)**
1. **Create Package Structure**: `packages/memory/` with TypeScript interfaces
2. **Wrap Existing Components**: SessionMemory, ContextMemory, IntelligenceMemory
3. **Plugin Interface Layer**: PluginMemory with scoped access
4. **Basic TDD Tests**: Core functionality and boundaries

### **Phase 2: Plugin Consumption Testing (Week 2)**
1. **Infinite Canvas Integration**: Test memory consumption in real usage
2. **BDD Scenario Validation**: Run behavior-driven tests
3. **Memory Streaming**: Implement real-time features for collaboration
4. **Performance Testing**: Ensure memory operations meet requirements

### **Phase 3: Ecosystem Integration (Week 3)**
1. **Workspace Linking**: Test with ~/lev/packages/ integration
2. **Agent Compatibility**: Validate existing agent workflows
3. **Cross-Plugin Communication**: Test memory sharing patterns
4. **Constitutional Compliance**: Maintain validation frameworks

### **Phase 4: Production Migration (Week 4)**
1. **Move to Leviathan**: Transfer packages/memory/ → ~/lev/packages/memory/
2. **Publish Package**: Release @lev-os/memory to npm
3. **Update Documentation**: Create plugin consumption guides
4. **Ecosystem Adoption**: Support other plugin migrations

## Success Criteria

### **Technical Requirements**
- ✅ Backward compatibility with existing agent memory operations
- ✅ Clean plugin interfaces for scoped memory access
- ✅ Real-time memory streaming for collaboration features
- ✅ Constitutional compliance maintained throughout
- ✅ Performance equivalent to direct agent system access

### **Plugin Privilege System**
- ✅ Core plugins (codex, memory, agent) receive direct Graphiti access
- ✅ Regular plugins isolated via namespace boundaries
- ✅ Cross-plugin communication enabled for core plugins only
- ✅ Security boundaries enforced through configuration

## Updates and Integration

### **2025-06-19 Update: Graphiti Integration**
This ADR has been enhanced to integrate with **ADR-005: Graphiti-Only Memory Architecture**. Key additions:

- **Plugin Privilege System**: Core plugins (codex, memory, agent) receive elevated access
- **Direct Graphiti Access**: Core plugins can use Graphiti client directly for advanced operations
- **Namespace Management**: Regular plugins isolated via scoped proxy access
- **Cross-Plugin Communication**: Core plugins can coordinate via MCP protocol

The enhanced architecture maintains backward compatibility while providing the unified memory capabilities defined in ADR-005.

---

**This ADR establishes @lev-os/memory as the foundational memory system for the Leviathan ecosystem, with enhanced plugin privilege architecture and Graphiti integration for unified memory operations.**