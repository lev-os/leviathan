# ADR-005: Watchdog File Monitoring as Core Tool

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Integration of real-time file monitoring as core Leviathan infrastructure

## Decision

Adopt **watchdog-based file monitoring as a core Leviathan tool** with debounced event processing, memory integration, and Graphiti synchronization capabilities.

## Problem Statement

Current challenges:
- **Manual Memory Updates**: File changes don't automatically reflect in memory system
- **Graphiti Sync Gaps**: No real-time synchronization between file system and knowledge graph
- **Context Staleness**: AI assistants work with outdated context snapshots
- **Performance Issues**: Excessive file system events can overwhelm processing

## Architecture Decision

### **Core Watchdog Integration**

```typescript
interface LeviathanWatchdog {
  // Core monitoring
  observer: FileSystemObserver;
  eventHandler: DebouncedEventHandler;
  
  // Memory integration
  memoryBridge: MemorySystemBridge;
  graphitiSync: GraphitiSynchronizer;
  
  // Performance optimization
  debounceTime: number;        // Default: 100ms
  eventCache: LRUCache;        // Prevent duplicate processing
  circuitBreaker: CircuitBreaker;
}

class DebouncedEventHandler {
  private lastProcessed: Map<string, number> = new Map();
  private debounceTime: number = 100; // ms
  
  shouldProcessEvent(event: FileSystemEvent): boolean {
    const currentTime = Date.now();
    const eventKey = `${event.type}:${event.path}`;
    
    const lastTime = this.lastProcessed.get(eventKey);
    if (lastTime && currentTime - lastTime < this.debounceTime) {
      return false;
    }
    
    this.lastProcessed.set(eventKey, currentTime);
    return true;
  }
}
```

### **Event Processing Pipeline**

```
File System Event
    ↓
Debounce Filter (100ms)
    ↓
Pattern Matching (glob/regex)
    ↓
Memory Type Classification
    ↓
Parallel Processing:
    ├─ Memory System Update
    ├─ Graphiti Synchronization
    └─ IDE Notification (if enabled)
    ↓
Event Completion Tracking
```

### **Pattern Matching Configuration**

```yaml
# ~/.lev/memory/watch_patterns.yaml
watch_patterns:
  memory_contexts:
    - pattern: "**/.ctx.*.md"
      memory_type: "context_file"
      sync_to_graphiti: true
      
  research_documents:
    - pattern: "**/research/**/*.md"
      memory_type: "semantic"
      extract_relationships: true
      
  decision_records:
    - pattern: "**/adrs/*.md"
      memory_type: "temporal"
      track_evolution: true
      
  specifications:
    - pattern: "**/specs/**/*.{feature,md,yaml}"
      memory_type: "procedural"
      validate_syntax: true
```

## Implementation Strategy

### **Phase 1: Core Infrastructure**
- [ ] Port Erasmus file monitoring patterns to TypeScript
- [ ] Implement debounced event processing
- [ ] Create memory type classification system
- [ ] Build basic Graphiti synchronization

### **Phase 2: Advanced Features**
- [ ] Circuit breaker for fault tolerance
- [ ] Performance monitoring and optimization
- [ ] Selective sync based on file patterns
- [ ] Event replay for recovery scenarios

## Consequences

### **Positive**
- **Real-Time Intelligence**: Memory system always reflects current file state
- **Unified Infrastructure**: Single monitoring system for IDE sync and Graphiti
- **Performance Optimized**: Debouncing prevents event storms
- **Extensible Architecture**: Easy to add new file patterns and handlers

### **Negative**
- **Resource Usage**: Continuous monitoring requires system resources
- **Complexity**: Adds moving parts to the memory system
- **Platform Differences**: File watching behaves differently across OS platforms

### **Risk Mitigation**
- **Resource Management**: Implement circuit breakers and resource limits
- **Platform Testing**: Comprehensive testing on macOS, Linux, Windows
- **Graceful Degradation**: System functions without real-time sync if needed

## Success Metrics

- **Event Processing Latency**: < 100ms from file change to memory update
- **Resource Usage**: < 2% CPU, < 50MB RAM for typical project
- **Reliability**: 99.9% uptime for monitoring service
- **Platform Compatibility**: Works identically across all platforms

## References

- Erasmus File Monitoring Implementation: `~/lev/_ref/erasmus/erasmus/file_monitor.py`
- Watchdog Documentation: https://github.com/gorakhargosh/watchdog
- Circuit Breaker Pattern: Martin Fowler's Enterprise Integration Patterns

---

**Decision Status**: Proposed  
**Review Date**: 2025-07-04