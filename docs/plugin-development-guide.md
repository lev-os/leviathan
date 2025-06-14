# Plugin Development Guide

## 🎯 Overview
Kingly uses a YAML-first plugin architecture where behavior is defined through configuration, not code. Every plugin (core or community) follows the same pattern with different permission boundaries.

## 📦 Two Types of Plugins

### Core Plugins
- **Location**: `core/packages/` - NPM packages with direct imports
- **Permissions**: Full system access, can import other core packages
- **Examples**: @kingly/cmd, @kingly/debug, @kingly/memory
- **Communication**: Direct imports + YAML configuration

### Community Plugins  
- **Location**: User-defined - YAML manifests with optional JS handlers
- **Permissions**: Sandboxed access via event bus and manifest permissions
- **Examples**: Custom memory enhancers, workflow extensions
- **Communication**: Event bus + YAML configuration

## 🔧 Core Plugin Development

### 1. Package Structure
```
core/packages/your-plugin/
├── package.json          # Dependencies and metadata
├── src/
│   ├── index.js         # Main exports
│   └── your-logic.js    # Implementation
└── config/plugin.yaml   # YAML configuration
```

### 2. Standard Dependencies
```javascript
// Every core plugin imports debug
import { logger, tracer, monitor } from '@kingly/debug'

// Import other core packages as needed
import { processManager } from '@kingly/cmd'
import { memoryBackend } from '@kingly/memory'
```

### 3. YAML Configuration Template
```yaml
plugin:
  name: your-plugin
  version: 1.0.0
  type: core_plugin
  description: "Brief description of plugin functionality"

capabilities:
  - your_capability_1
  - your_capability_2

commands:
  your_command:
    syntax: "kingly your command <args>"
    description: "What this command does"
    whisper:
      strategies:
        - "LLM-first strategy 1"
        - "LLM-first strategy 2"  
      llm_guidance: "How LLM should approach this command"

workflows:
  your_workflow:
    description: "Workflow description"
    steps:
      - step: "Step 1"
        context: "contexts/your-context.yaml"

reasoning_patterns:
  your_pattern:
    prompt: |
      You are handling [specific scenario].
      
      Context: [Context description]
      
      Your reasoning should:
      1. [Reasoning step 1]
      2. [Reasoning step 2]
      
      Always prioritize: [Core principles]
```## 🌐 Community Plugin Development

### 1. YAML Manifest (Required)
```yaml
plugin:
  name: my-community-plugin
  version: 1.0.0
  type: community_plugin
  author: community-developer

capabilities:
  events:
    listen: ["memory:after:search", "user:query"]
    emit: ["plugin:enhanced:results"]
  
  apis:
    memory: read              # read, write (no admin for community)
    filesystem: none          # none, read (no write for community)
    network: limited          # none, limited (no full for community)

commands:
  enhance_search:
    description: "Enhance search results with custom logic"

development:
  hot_reload: true
  debug_events: true
```

### 2. Optional JavaScript Handler
```javascript
// my-plugin-handler.js (optional)
export class MyPluginHandler {
  constructor(eventBus, logger) {
    this.eventBus = eventBus;
    this.logger = logger;
  }

  async onMemorySearch(event) {
    this.logger.info('Enhancing search results', { query: event.data.query });
    
    // Custom enhancement logic
    const enhanced = await this.enhanceResults(event.data.results);
    
    await this.eventBus.emit('plugin:enhanced:results', {
      original: event.data.results,
      enhanced: enhanced,
      confidence: 0.9
    });
  }
}
```

## 🏗️ Plugin Architecture Principles

### YAML-First Everything
- **Behavior**: Defined in YAML, not hardcoded
- **Configuration**: All settings in YAML manifests
- **Commands**: Registered via YAML with whisper guidance
- **Workflows**: Orchestrated through YAML definitions

### LLM-First Reasoning
- **No Pattern Matching**: Use LLM reasoning instead of if/else logic
- **Confidence Scores**: Track and report confidence in decisions
- **Whisper Guidance**: Provide LLM strategy hints in YAML
- **Context Integration**: Everything inherits from universal context

### Universal Debugging
```javascript
// Every plugin uses @kingly/debug
import { logger, tracer, monitor } from '@kingly/debug'

// Standard debugging pattern
const trace = tracer.start('plugin-operation')
logger.info('Plugin operation started', { plugin: 'my-plugin' })
// ... operation logic ...
monitor.trackOperation('my-plugin', { success: true, duration: '500ms' })
trace.end()
```

## 📋 Development Workflow

### Core Plugin Workflow
1. **Create package structure** in `core/packages/your-plugin/`
2. **Define YAML configuration** with commands and workflows
3. **Implement JavaScript logic** using core imports
4. **Add universal debugging** with @kingly/debug
5. **Test integration** with existing core packages

### Community Plugin Workflow  
1. **Create YAML manifest** with permissions and capabilities
2. **Optional JS handler** for complex logic (stay in event boundaries)
3. **Test via event bus** using debug tools
4. **Validate permissions** work as expected
5. **Submit to community** via plugin marketplace

## ✅ Best Practices

### Do's
- ✅ YAML-first configuration for all behavior
- ✅ LLM reasoning over pattern matching
- ✅ Universal debugging in all plugins  
- ✅ Event bus for community plugin communication
- ✅ Direct imports for core package integration
- ✅ Confidence tracking in LLM operations

### Don'ts  
- ❌ Hardcode behavior in JavaScript
- ❌ Build complex frameworks instead of using LLM reasoning
- ❌ Skip universal debugging integration
- ❌ Give community plugins direct system access
- ❌ Create plugins without YAML manifests
- ❌ Pattern match instead of using LLM capabilities

---
*Plugin development guide for both core and community developers*