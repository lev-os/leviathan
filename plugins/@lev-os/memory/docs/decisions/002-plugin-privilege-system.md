# ADR-002: Plugin Privilege System

**Date:** 2025-06-19  
**Status:** Approved  
**Context:** Security and access control for memory system plugin consumption

## Decision

Implement **two-tier plugin privilege system** separating core system plugins from regular community plugins with different memory access levels.

## Problem Statement

Plugin ecosystem needs:
- **Security**: Prevent plugins from interfering with each other
- **Capabilities**: Core system plugins need enhanced access
- **Isolation**: Regular plugins should be namespace-isolated
- **Performance**: Core plugins need direct database access

## Privilege Architecture

### **Core Plugins** (memory, agent, codex)
```typescript
interface CorePluginMemory {
  // Direct database access
  graphiti: GraphitiClient;
  fileSystem: FileSystemManager;
  
  // Enhanced capabilities
  crossPluginCommunication(): Promise<PluginCommunicationChannel>;
  globalMemoryAccess(): Promise<GlobalMemorySpace>;
  managePluginNamespaces(): Promise<NamespaceManager>;
  
  // Unrestricted access
  access_level: "system_infrastructure";
}
```

**Rationale**: Core plugins are system infrastructure requiring full capabilities for coordination, optimization, and cross-plugin intelligence.

### **Regular Plugins** (community, application-specific)
```typescript
interface RegularPluginMemory {
  // Scoped operations only
  store(key: string, data: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string): Promise<SearchResult[]>;
  
  // Restricted access through proxy
  graphitiProxy: ScopedGraphitiProxy;
  fileSystemAccess: "namespace_only";
  
  // No cross-plugin communication
  access_level: "isolated_namespace";
}
```

**Rationale**: Regular plugins should be isolated for security and cannot access other plugins' data or system infrastructure.

## Implementation Strategy

### **Privilege Enforcement**
```typescript
class MemoryManager {
  createPluginMemory(pluginId: string): PluginMemory {
    if (this.isCorePlugin(pluginId)) {
      return new CorePluginMemory({
        graphiti: this.graphiti,
        fileSystem: this.fileSystem,
        privileges: "full_system_access"
      });
    } else {
      return new RegularPluginMemory({
        namespace: pluginId,
        proxy: this.createScopedProxy(pluginId),
        privileges: "namespace_isolated"
      });
    }
  }
  
  private isCorePlugin(pluginId: string): boolean {
    return ['memory', 'agent', 'codex'].includes(pluginId);
  }
}
```

### **Namespace Isolation**
```typescript
class ScopedGraphitiProxy {
  constructor(private namespace: string, private graphiti: GraphitiClient) {}
  
  async query(request: QueryRequest): Promise<QueryResult> {
    // Automatically scope all queries to plugin namespace
    const scopedRequest = {
      ...request,
      namespace_filter: this.namespace,
      cross_namespace_access: false
    };
    
    return await this.graphiti.query(scopedRequest);
  }
}
```

## Security Benefits

### **Data Isolation**
- ✅ Regular plugins cannot access other plugins' data
- ✅ Namespace boundaries enforced at query level
- ✅ No accidental data leakage between plugins

### **System Protection**
- ✅ Regular plugins cannot modify system infrastructure
- ✅ Core plugin coordination preserved
- ✅ Memory system integrity maintained

### **Community Safety**
- ✅ Community plugins cannot break each other
- ✅ Predictable plugin behavior boundaries
- ✅ Safe ecosystem for plugin development

## Plugin Examples

### **Core Plugin Usage (Codex)**
```typescript
class CodexPlugin {
  constructor(private memory: CorePluginMemory) {}
  
  async discoverPatterns(): Promise<Pattern[]> {
    // Can access all namespaces and cross-plugin data
    return await this.memory.graphiti.hybrid_search({
      query: "successful coding patterns",
      namespaces: ["codex", "agent", "community_plugins"],
      cross_plugin_analysis: true
    });
  }
}
```

### **Regular Plugin Usage (Community)**
```typescript
class CommunityPlugin {
  constructor(private memory: RegularPluginMemory) {}
  
  async storeData(data: any): Promise<void> {
    // Automatically scoped to plugin namespace
    await this.memory.store("my-data", data);
    
    // Cannot access other plugins' data
    // this.memory.crossPluginAccess() // ❌ Not available
  }
}
```

## Migration Strategy

### **Existing Plugins**
1. Audit existing plugin access patterns
2. Classify as core vs regular based on functionality
3. Migrate to appropriate privilege level
4. Test isolation boundaries

### **New Plugin Development**
1. Default to regular plugin privileges
2. Core plugin status requires justification
3. Clear documentation of privilege requirements
4. Security review for core plugin proposals

## Success Criteria

- ✅ Core plugins have necessary system access
- ✅ Regular plugins are properly isolated
- ✅ No unauthorized cross-namespace access
- ✅ Plugin ecosystem remains secure and predictable

---

**This ADR establishes a secure foundation for plugin ecosystem growth while ensuring core system capabilities remain available to infrastructure components.**