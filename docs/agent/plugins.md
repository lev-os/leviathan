# Community-Friendly Plugin Architecture: Event Bus + YAML Manifests

## Research Insights: Best Practices for Community Plugin Systems

**From Perplexity Research + FlowMind Context Patterns:**

### 🏆 **Winning Patterns from Successful Platforms**

**VSCode Extensions**: Manifest-based permissions + Event emitters + Hot reload + Dev tools
**Browser Extensions**: Declarative manifest + Sandboxed APIs + Dev console debugging  
**WordPress Plugins**: Simple hook system + PHP functions + Extensive documentation
**Obsidian Plugins**: ES6 modules + Event API + Plugin logs + Command palette integration

### 🎯 **Core Requirements for Community Success**

1. **Manifest-Driven Registration** - Plugins declare everything in YAML
2. **Event Bus with Tracing** - All interactions flow through traceable event system
3. **Permission Boundaries** - Core vs Community plugins with clear access levels
4. **Debuggability First** - Event logs, plugin inspector, hot reload
5. **Simple APIs** - High-level abstractions hiding complexity
6. **Code Quality Standards** - Consistent file organization and domain separation

### 📏 **Plugin Development Standards**

**File Organization:**
- **Domain Separation**: One business domain per command file
- **File Size**: 150-200 lines per file (optimal for readability + maintenance)
- **Function Length**: 100-150 lines before considering helper extraction
- **Helper Pattern**: Extract complex utilities to `src/helpers/` when needed

**Code Quality Requirements:**
- **Human + Agent Optimized**: Pretty for developers, structured for AI tools
- **SRP Balance**: Follow Single Responsibility without obsessive micro-optimization
- **Cohesive Functions**: Keep main logic together rather than forced artificial splitting
- **No Cross-Domain Imports**: Commands don't import from other command files

**Testing Standards:**
- **Real CLI Integration**: Test via `lev plugin command` execution
- **MCP Compatibility**: Verify commands appear as MCP tools automatically
- **File Size Validation**: Automated checks for reasonable file sizes
- **Domain Boundary Tests**: Validate proper separation of concerns

## 📋 **Architecture Design: Learning from ~/c Patterns**

### From FlowMind Echo Intelligence Patterns:
- **Recursive Intelligence Loop** - Events can trigger cascading analysis
- **Confidence Calibration** - Plugin operations have confidence scores
- **Multi-Perspective Validation** - Core plugins validate community plugin actions
- **Gap Analysis** - System detects missing capabilities and suggests plugins

### From FlowMind Context System:
- **YAML-First** - Everything configurable through YAML manifests
- **Semantic Triggering** - Events can trigger based on semantic conditions
- **Template System** - Scaffolding for community developers
- **Context Integration** - Plugins complement each other

## 🏗️ **Proposed Architecture: "FlowMind Plugin Bus"**

### Layer 1: Manifest-Based Plugin Declaration
```yaml
# plugin.yaml (community-friendly)
plugin:
  name: my-memory-enhancer
  version: 1.0.0
  type: community_plugin    # vs core_plugin
  author: community-dev
  
capabilities:
  # Declarative permissions (VSCode-style)
  events:
    listen: ["memory:after:search", "user:query"]
    emit: ["plugin:enhanced:results"]
  
  apis:
    memory: read              # read, write, admin
    filesystem: none          # none, read, write
    network: none            # none, limited, full
    
  commands:
    - name: enhance-search
      description: "Enhance search results with custom logic"
      
integration:
  # FlowMind-style semantic integration
  triggers:
    semantic: ["user needs better search", "search quality low"]
  complements: ["@kingly/memory", "search-plugins"]
  
# Development helpers (easy debugging)
development:
  hot_reload: true
  debug_events: true
  test_fixtures: ["test-queries.json"]
```

### Layer 2: Event Bus with Full Traceability
```javascript
// @kingly/core/event-bus.js
class FlowMindEventBus {
  constructor() {
    this.events = new Map();
    this.plugins = new Map();
    this.traceId = 0;
    this.debugMode = process.env.NODE_ENV === 'development';
  }
  
  // Simple registration (community-friendly)
  async registerPlugin(manifestPath) {
    const manifest = await this.loadManifest(manifestPath);
    
    // Validate permissions (clear error messages)
    const validation = await this.validatePlugin(manifest);
    if (!validation.valid) {
      throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Auto-setup based on manifest
    const plugin = await this.createPlugin(manifest);
    this.plugins.set(manifest.plugin.name, plugin);
    
    // Debug output (community-friendly)
    if (this.debugMode) {
      console.log(`🔌 Plugin registered: ${manifest.plugin.name}`);
      console.log(`   Events: ${manifest.capabilities.events.listen.join(', ')}`);
      console.log(`   Commands: ${manifest.capabilities.commands.length}`);
    }
    
    return plugin;
  }
  
  // Event emission with full tracing (easy debugging)
  async emit(eventName, data, context = {}) {
    const traceId = ++this.traceId;
    const event = {
      id: traceId,
      name: eventName,
      data,
      context,
      timestamp: Date.now(),
      source: context.plugin || 'core'
    };
    
    // Debug logging (developers can trace everything)
    if (this.debugMode) {
      console.log(`📡 Event [${traceId}]: ${eventName} from ${event.source}`);
    }
    
    // Find listeners based on permissions
    const listeners = this.getAuthorizedListeners(eventName);
    
    // Execute with error isolation (one plugin failure doesn't kill others)
    const results = await Promise.allSettled(
      listeners.map(plugin => this.executePluginHandler(plugin, event))
    );
    
    // Collect and trace results
    const processed = this.processResults(results, event);
    
    if (this.debugMode) {
      console.log(`   ✅ Processed by ${processed.successful.length} plugins`);
      if (processed.failed.length > 0) {
        console.log(`   ❌ Failed in ${processed.failed.length} plugins`);
      }
    }
    
    return processed;
  }
}
```

### Layer 3: Permission Model - "Trust with Boundaries"
```javascript
// Permission validation (clear and simple)
class PluginPermissionManager {
  validatePlugin(manifest) {
    const errors = [];
    
    // Core plugins get everything (like sudo)
    if (manifest.plugin.type === 'core_plugin') {
      return { valid: true, level: 'core', access: 'full' };
    }
    
    // Community plugins checked against manifest
    const requested = manifest.capabilities;
    
    // Memory access validation
    if (requested.apis.memory === 'admin' && manifest.plugin.type !== 'core_plugin') {
      errors.push('Admin memory access requires core_plugin type');
    }
    
    // Network access validation
    if (requested.apis.network === 'full') {
      errors.push('Full network access not allowed for community plugins');
    }
    
    // Event access validation  
    const restrictedEvents = ['system:*', 'core:*', 'security:*'];
    const requestedEvents = requested.events.listen || [];
    
    for (const event of requestedEvents) {
      if (restrictedEvents.some(pattern => this.matchesPattern(event, pattern))) {
        errors.push(`Restricted event access: ${event}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      level: 'community',
      access: 'limited',
      errors
    };
  }
}
```### Layer 4: Memory Integration with Plugin Events
```javascript
// @kingly/memory with plugin-friendly events
class MemoryWithPlugins {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.backends = new Map(); // file, transformers, openai, chroma, graphiti
  }
  
  async search(query, options = {}) {
    // Pre-search event (plugins can modify query)
    const beforeEvent = await this.eventBus.emit('memory:before:search', {
      query,
      options,
      confidence: this.assessQueryConfidence(query)
    });
    
    // Use modified query if plugins enhanced it
    const finalQuery = beforeEvent.data.query;
    
    // Execute search with fallback chain
    const results = await this.executeSearchChain(finalQuery, options);
    
    // Post-search event (plugins can enhance results)
    const afterEvent = await this.eventBus.emit('memory:after:search', {
      query: finalQuery,
      results,
      confidence: results.confidence,
      backend_used: results.backend
    });
    
    // Return enhanced results
    return afterEvent.data.results;
  }
  
  // Plugin-friendly API for adding backends
  async registerBackend(name, backend, requiredPermission = 'read') {
    await this.eventBus.emit('memory:backend:registered', {
      name,
      permission: requiredPermission,
      capabilities: backend.capabilities
    });
    
    this.backends.set(name, { backend, permission: requiredPermission });
  }
}
```

### Layer 5: Developer Experience - "Make it Obvious"

**Plugin Inspector Dashboard:**
```javascript
// /debug/plugins endpoint for development
app.get('/debug/plugins', (req, res) => {
  const pluginStats = Array.from(eventBus.plugins.values()).map(plugin => ({
    name: plugin.manifest.plugin.name,
    type: plugin.manifest.plugin.type,
    events_listened: plugin.eventStats.listened,
    events_emitted: plugin.eventStats.emitted,
    commands_registered: plugin.commands.length,
    last_activity: plugin.lastActivity,
    errors: plugin.errorLog.slice(-5) // Last 5 errors
  }));
  
  res.json({
    total_plugins: pluginStats.length,
    core_plugins: pluginStats.filter(p => p.type === 'core_plugin').length,
    community_plugins: pluginStats.filter(p => p.type === 'community_plugin').length,
    plugins: pluginStats,
    recent_events: eventBus.getRecentEvents(100)
  });
});
```

**Plugin CLI for Community Developers:**
```bash
# Scaffold new plugin
kingly plugin create my-enhancer --template=memory-enhancer

# Test plugin in isolation  
kingly plugin test my-enhancer --events=test-events.json

# Debug plugin interactions
kingly plugin debug my-enhancer --trace --verbose

# Validate before publishing
kingly plugin validate my-enhancer

# Community marketplace integration
kingly plugin publish my-enhancer --to=community
```

## 🎯 **Community Success Strategy**

### Documentation-First Approach
```markdown
# Plugin Development Guide

## 5-Minute Quickstart
1. `kingly plugin create my-plugin`
2. Edit `plugin.yaml` manifest
3. Write simple event handlers  
4. Test with `kingly plugin test my-plugin`
5. Debug with plugin inspector at http://localhost:3000/debug

## Event Patterns
- `memory:*` - Memory system integration
- `user:*` - User interaction events  
- `command:*` - Command system events
- `plugin:*` - Inter-plugin communication

## Permission Levels
- `core_plugin` - Full system access (trusted contributors)
- `community_plugin` - Sandboxed APIs (community developers)
```

### Plugin Marketplace Integration
```yaml
# Community plugin registry
marketplace:
  registry: "https://plugins.kingly.ai"
  categories: ["memory", "search", "analysis", "automation"]
  verification:
    - manifest_validation
    - security_scan  
    - integration_test
    - community_review
```

## 🔄 **Implementation Roadmap**

### Week 1: Event Bus Foundation
1. **Core event bus** with tracing and plugin registration
2. **Manifest validation** with clear error messages  
3. **Permission boundaries** between core/community plugins
4. **Basic plugin inspector** for debugging

### Week 2: Memory Integration
1. **Memory events** for all operations (before/after hooks)
2. **Plugin-enhanced search** with result modification
3. **Backend registration** API for plugins
4. **Confidence scoring** integration

### Week 3: Developer Experience  
1. **Plugin CLI** with scaffolding and testing
2. **Hot reload** for development workflow
3. **Documentation** with examples and patterns
4. **Debug dashboard** with event tracing

### Week 4: Community Readiness
1. **Plugin marketplace** foundation
2. **Security validation** pipeline
3. **Community templates** and examples
4. **Publishing workflow** to registry

## 🏆 **Success Criteria**

- ✅ **5-minute plugin creation** from idea to working code
- ✅ **Full event traceability** for debugging complex interactions  
- ✅ **Clear permission model** that's secure but not restrictive
- ✅ **Memory system enhancement** via community plugins
- ✅ **Hot reload development** for rapid iteration
- ✅ **Plugin marketplace** for community sharing

**Philosophy**: "Make plugin development as easy as WordPress, as powerful as VSCode, as debuggable as browser dev tools."

---

*Saved: Plugin architecture plan for @kingly/memory event-driven system with community-friendly development experience*