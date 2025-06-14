# @kingly/debug - Universal Debugging System

## 🎯 Mission
Provide universal debugging, logging, and monitoring capabilities for all Kingly core packages and plugins. Every component imports debug for consistent observability.

## 📦 Package Structure
```
packages/debug/
├── package.json          # Minimal deps for logging/tracing
├── src/
│   ├── index.js         # Main exports: logger, tracer, monitor
│   ├── logger.js        # Universal logging system
│   ├── tracer.js        # Event/execution tracing  
│   └── monitor.js       # Performance monitoring
└── config/plugin.yaml   # YAML-first configuration
```

## 🔧 Core Functionality

### Universal Logging
```javascript
import { logger } from '@kingly/debug'

logger.info('Plugin loaded', { plugin: 'parallel', version: '1.0.0' })
logger.error('Command failed', { command: 'para init', error: details })
logger.debug('LLM reasoning', { prompt, response, confidence: 0.85 })
```

### Event Tracing
```javascript
import { tracer } from '@kingly/debug'

const trace = tracer.start('plugin-execution')
trace.addEvent('command-received', { command: 'para init' })
trace.addEvent('llm-reasoning', { confidence: 0.85 })
trace.end({ success: true, duration: '2.3s' })
```

### Performance Monitoring
```javascript
import { monitor } from '@kingly/debug'

monitor.trackPlugin('parallel', { 
  commands: ['para_init', 'para_status', 'para_sync'],
  performance: { avg_response: '500ms' }
})
```

## 🧠 Universal Debug Commands

### System-Wide Debugging
```bash
kingly debug events              # All plugin events across system
kingly debug processes           # All tracked processes  
kingly debug plugins            # Plugin performance and status
kingly debug llm                # LLM reasoning traces
```

### Plugin-Specific Debugging  
```bash
kingly cmd debug                # @kingly/cmd specific debug
kingly memory debug             # @kingly/memory specific debug
kingly parallel debug           # parallel plugin debug
```

## 🔄 Core Integration Pattern

### Every Plugin Imports Debug
```javascript
// Standard pattern for all core packages
import { logger, tracer, monitor } from '@kingly/debug'

export class ProcessManager {
  async executeCommand(cmd) {
    const trace = tracer.start('process-execution')
    logger.info('Executing command', { cmd })
    
    try {
      const result = await this.runCommand(cmd)
      trace.addEvent('command-success', { duration: result.duration })
      monitor.trackCommand(cmd, { success: true })
      return result
    } catch (error) {
      logger.error('Command failed', { cmd, error })
      trace.addEvent('command-error', { error: error.message })
      monitor.trackCommand(cmd, { success: false })
      throw error
    } finally {
      trace.end()
    }
  }
}
```

## 🎯 YAML Configuration
```yaml
# config/plugin.yaml
plugin:
  name: debug
  version: 1.0.0
  type: core_plugin
  description: Universal debugging and monitoring system

capabilities:
  - universal_logging
  - event_tracing  
  - performance_monitoring
  - plugin_observability

commands:
  debug_events:
    syntax: "kingly debug events [filter]"
    description: "Show all system events with optional filtering"
    
  debug_plugins:
    syntax: "kingly debug plugins [plugin-name]"
    description: "Show plugin status and performance metrics"
    
  debug_llm:
    syntax: "kingly debug llm [trace-id]"
    description: "Show LLM reasoning traces and confidence scores"

configuration:
  log_level: "info"
  trace_enabled: true
  monitor_enabled: true
  output_format: "structured"
```

## 🔧 Integration with Kingly Ecosystem

### LLM-First Reasoning Support
- **Confidence tracking** for all LLM operations
- **Reasoning traces** with decision paths
- **Context switching** logging across agent personalities
- **Constitutional validation** event logging

### Plugin System Integration
- **Universal import** by all core packages and plugins
- **Event bus tracing** for community plugin debugging
- **YAML workflow** debugging and execution traces
- **Command registry** integration with debug commands

### FlowMind Context Integration
```javascript
// Automatic context-aware logging
logger.plugin('parallel', 'Context switch initiated', {
  from: 'nfj-visionary',
  to: 'stp-adapter',
  confidence: 0.87,
  contextPath: 'contexts/agents/eeps/stp-adapter/context.yaml'
})
```

## 🔄 Dependencies

### Minimal Stack
- **winston** or **pino** - Structured logging
- **uuid** - Trace ID generation  
- **@kingly/core** - Core system integration

### Integration Points
- Used by ALL core packages (@kingly/cmd, @kingly/memory)
- Used by ALL plugins (core and community)
- Integrates with command registry for debug commands
- Connects with YAML configuration system

## 🧪 Testing Philosophy

### BDD Integration
This package follows Kingly's LLM-first BDD approach:
- **No unit tests** - Test through actual workflow execution
- **Integration via MCP** - Test with real MCP server and LLM reasoning
- **BDD scenarios** - Generated via `contexts/workflows/bdd-specification/`
- **Personality-driven testing** - Test through agent context switching

### Example Integration Test
```yaml
# Test via existing parallel.yaml plugin
Given: "A parallel development session is initiated"
When: "Debug tracing is enabled"
Then: "All context switches are logged with confidence scores"
And: "LLM reasoning traces are captured for each agent personality"
And: "Performance metrics show sub-500ms context switching"
```

## 🎯 Implementation Priorities

1. **Basic logging system** with structured output ✅
2. **Event tracing** for plugin and command execution ✅
3. **Universal debug commands** accessible from CLI
4. **Performance monitoring** for plugin optimization ✅
5. **LLM reasoning traces** for confidence tracking ✅

## 🚫 Anti-Patterns to Avoid
- ❌ Complex logging frameworks  
- ❌ Heavy monitoring solutions
- ❌ Plugin-specific debug approaches
- ❌ Hardcoded debug configurations

## ✅ Success Criteria
- Every core package uses @kingly/debug ✅
- Universal debug commands work across all plugins
- Event tracing provides full system observability ✅
- LLM reasoning is trackable and analyzable ✅
- Performance monitoring enables optimization ✅
- All configuration via YAML ✅

---
*Universal debugging foundation for entire Kingly ecosystem with LLM-first integration*