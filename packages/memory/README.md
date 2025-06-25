# @lev-os/memory

**Hybrid Memory System for Leviathan Ecosystem**

A sophisticated memory architecture combining file system reliability with Graphiti intelligence capabilities, implementing five distinct memory types based on cognitive science principles.

## 🧠 Architecture Overview

### Hybrid Tiered System
```
Fast Access Layer (RAM/Cache)
├─ Working Memory: Active session state
└─ Context Buffers: Current conversation

Medium Access Layer (Graphiti on Neo4j)  
├─ Semantic Memory: Vector embeddings
├─ Temporal Memory: Session evolution
├─ Episodic Memory: Agent learning
└─ Graph Relationships: Dependencies

Persistent Layer (File System - Source of Truth)
├─ Procedural Memory: YAML workflows
├─ Session Checkpoints: ~/.kingly/sessions/
├─ Context Definitions: contexts/*.yaml
└─ Constitutional Framework: Validation rules
```

## 🚀 Quick Start

### Installation

```bash
# Prerequisites: Neo4j running locally
# Install Graphiti
pip install graphiti-core

# Initialize memory system
cd ~/lev/packages/memory
npm install
```

### Basic Usage

```javascript
const { HybridMemoryManager } = require('./src/memory-manager');

// Initialize memory system
const memory = new HybridMemoryManager({
  neo4jUri: "bolt://localhost:7687",
  sessionsPath: "~/.kingly/sessions/",
  contextsPath: "./contexts/"
});

// Core plugin access (full capabilities)
const codexMemory = memory.createPluginMemory('codex');
await codexMemory.graphiti.hybrid_search({
  query: "React optimization patterns",
  include_relationships: true
});

// Regular plugin access (scoped)
const appMemory = memory.createPluginMemory('my-app');
await appMemory.store('user-preferences', { theme: 'dark' });
```

## 🧩 Five Memory Types

### 1. **Procedural Memory** - "How to do things"
- **Purpose**: Agent patterns, workflows, coding procedures
- **Storage**: Files (fast) + Graphiti (searchable)
- **Examples**: React component creation, Git workflows

```javascript
// Store a new pattern
await memory.procedural.storePattern({
  id: 'react-component-creation',
  title: 'Create React Component',
  steps: [
    'Create .tsx file',
    'Define props interface',
    'Export functional component'
  ],
  success_rate: 0.95
});

// Find applicable patterns
const patterns = await memory.procedural.getApplicablePatterns({
  task: 'create component',
  language: 'typescript',
  framework: 'react'
});
```

### 2. **Semantic Memory** - "Facts and knowledge"
- **Purpose**: API docs, framework knowledge, facts
- **Storage**: Graphiti (vector search) + Files (backup)

```javascript
// Search for knowledge
const knowledge = await memory.semantic.search('React hooks lifecycle');

// Store new knowledge
await memory.semantic.store({
  concept: 'useEffect cleanup',
  definition: 'Function returned by useEffect for cleanup',
  relationships: ['useEffect', 'component unmount']
});
```

### 3. **Temporal Memory** - "Timeline of events"
- **Purpose**: Conversation history, session evolution
- **Storage**: Graphiti (temporal queries) + Files (checkpoints)

```javascript
// Query conversation history
const history = await memory.temporal.getHistory({
  timeRange: 'last_24_hours',
  topic: 'React optimization'
});

// Track conversation turn
await memory.temporal.addConversationTurn({
  content: 'User asked about performance',
  context: 'React app optimization'
});
```

### 4. **Working Memory** - "Active thinking space"
- **Purpose**: Current context, active variables
- **Storage**: Memory cache + Session persistence

```javascript
// Set active context
await memory.working.setContext({
  currentlyEditing: ['./src/App.tsx', './src/hooks/useData.ts'],
  activeDebugging: 'useEffect infinite loop'
});

// Get current context
const context = await memory.working.getCurrentContext();
```

### 5. **Episodic Memory** - "Personal experiences"
- **Purpose**: Learning experiences, successes/failures
- **Storage**: Graphiti (relationships) + Files (summaries)

```javascript
// Record learning experience
await memory.episodic.recordExperience({
  approach: 'Added React.memo optimization',
  outcome: 'Performance improved 40ms',
  context: 'Large user list rendering',
  success: true,
  confidence: 0.85
});

// Find similar experiences
const similar = await memory.episodic.findSimilarExperiences({
  context: 'React performance',
  successful: true
});
```

## 🔐 Plugin Privilege System

### Core Plugins (memory, agent, codex)
- **Direct Graphiti Access**: Advanced query capabilities
- **Cross-Plugin Communication**: Can coordinate with other plugins
- **Global Memory Access**: Shared knowledge and patterns
- **Namespace Management**: Can manage other plugin data

### Regular Plugins (community, application-specific)
- **Scoped Access**: Isolated to plugin namespace
- **Proxy Access**: Graphiti operations through safety layer
- **No Cross-Plugin**: Cannot access other plugins' data

```javascript
// Core plugin (full access)
const coreMemory = memory.createPluginMemory('codex');
await coreMemory.globalMemoryAccess();

// Regular plugin (scoped)
const regularMemory = memory.createPluginMemory('my-plugin');
await regularMemory.store('data', value); // Automatically namespaced
```

## 🛠 CLI Commands

```bash
# Memory system status
lev memory status --json

# Search across all memory types
lev memory query "React optimization patterns" --type=procedural

# Store data in specific memory type
lev memory store "react-tips" "Use React.memo for performance" --type=semantic

# Sync files to Graphiti
lev memory sync --path=./contexts/ --force

# System health check
lev memory test all

# Enable/disable fallback mode
lev memory fallback enable
```

## 📊 Configuration

**plugin.yaml** defines the complete memory system configuration:
- Memory type specifications
- Plugin privilege rules
- Performance optimization settings
- Fallback strategies

## 🧪 Testing & Validation

### BDD Specifications
- Memory type isolation and integration
- Plugin privilege enforcement
- Fallback mode operation
- Performance benchmarks

### Integration Tests
- Component wrapper compatibility
- Cross-memory learning validation
- Plugin consumption patterns

## 📚 Architecture Decisions

See `docs/decisions/` for detailed ADRs:
- **001**: Hybrid Memory Architecture
- **002**: Plugin Privilege System  
- **003**: Five Memory Types Classification

## 🔄 Integration with Existing Systems

### Wrapped Components
- **SessionManager** → Enhanced with relationship tracking
- **UniversalContextSystem** → Usage pattern analysis
- **IntelligenceCoordinator** → Adaptive learning integration

### Migration Strategy
1. **Preserve existing workflows** - No disruption to current operations
2. **Add Graphiti enhancements** - Intelligence without replacement
3. **Gradual plugin migration** - Core plugins first, then community

## 🎯 Performance Targets

- **Procedural Memory**: <10ms file access for patterns
- **Semantic Search**: <200ms Graphiti queries
- **Hybrid Queries**: <500ms file + graph combination
- **Fallback Mode**: <50ms degradation to file-only

## 🤝 Contributing

This memory system is core infrastructure for the Leviathan ecosystem. All changes should:
1. Preserve backward compatibility
2. Maintain performance targets
3. Include comprehensive tests
4. Update relevant ADRs

---

**@lev-os/memory establishes the intelligent foundation for the entire Leviathan plugin ecosystem, combining proven reliability with cutting-edge AI capabilities.**