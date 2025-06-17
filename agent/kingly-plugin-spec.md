# Kingly Plugin Specification

## Overview

Kingly plugins are lightweight, YAML-based extensions that integrate with the @kingly/cmd core package and ~/mvp central command center. Plugins follow a reverse dependency pattern where they import and use core functionality rather than extending it.

## Plugin Architecture

### Core Principles

1. **YAML-First Configuration**: Behavior defined through configuration, not code
2. **Reverse Dependency**: Plugins import @kingly/cmd, not vice versa
3. **Minimal Dependencies**: Leverage core package functionality
4. **LLM-First Reasoning**: Use prompts and context over hardcoded logic
5. **Integration-Ready**: Work seamlessly with ~/mvp job system

### Plugin Structure

```yaml
# Standard plugin format
plugin:
  name: plugin-name
  version: 1.0.0
  type: core_plugin | utility_plugin | workflow_plugin
  description: Brief description of plugin functionality
  
capabilities:
  - capability_name         # What core features this plugin uses
  
commands:
  command_name:
    syntax: "kingly command-name <args>"
    description: "What this command does"
    whisper:
      strategies: ["LLM guidance patterns"]
      llm_guidance: "How LLM should handle this command"
      
workflows:
  workflow_name:
    description: "Workflow purpose"
    steps: ["Step definitions"]
    
dependencies:
  core_modules: ["Required @kingly/cmd modules"]
  external_tools: ["External CLI tools needed"]
```

## Plugin Types

### Core Plugins
- **Purpose**: Essential functionality that extends @kingly/cmd capabilities
- **Examples**: parallel development, process monitoring, dev server management
- **Location**: `~/k/core/packages/[plugin-name]/`
- **Integration**: Direct imports from @kingly/cmd

### Utility Plugins  
- **Purpose**: Helper tools and convenience functions
- **Examples**: git utilities, log formatters, status dashboards
- **Location**: `~/k/core/packages/utils-[name]/`
- **Integration**: Use @kingly/cmd process management

### Workflow Plugins
- **Purpose**: Complex multi-step processes and automation
- **Examples**: deployment workflows, testing pipelines, CI/CD integration
- **Location**: `~/k/core/packages/workflow-[name]/`
- **Integration**: Orchestrate via @kingly/cmd + ~/mvp job system

## Development Guidelines

### Plugin Creation Process

1. **Use Plugin Generator**: `pnpm create @kingly/plugin [name] [type]`
2. **Define YAML Configuration**: Start with plugin metadata and capabilities
3. **Implement Commands**: Add command definitions with whisper guidance
4. **Create Workflows**: Define multi-step processes if needed
5. **Test Integration**: Ensure compatibility with @kingly/cmd and ~/mvp

### Code Standards

```javascript
// Standard plugin entry point
import { processManager, jobIntegration } from '@kingly/cmd'
import { loadConfig } from './config.js'

export class PluginName {
  constructor() {
    this.config = loadConfig()
    this.processManager = processManager
    this.jobIntegration = jobIntegration
  }
  
  async executeCommand(command, args) {
    // Use @kingly/cmd for process management
    return await this.processManager.spawn(command, args)
  }
}
```

### Integration Patterns

#### Process Management Integration
```javascript
import { processManager } from '@kingly/cmd'

// Spawn processes with tracking
const process = await processManager.spawn('npm run dev', {
  background: true,
  monitor: true,
  logs: true
})

// Monitor status
const status = await processManager.getStatus(process.pid)
```

#### Job System Integration
```javascript
import { jobIntegration } from '@kingly/cmd'

// Create job in ~/mvp system
const job = await jobIntegration.createJob({
  name: 'plugin-task',
  command: 'npm test',
  options: { parallel: true }
})

// Report completion back to ~/mvp
await jobIntegration.reportCompletion(job.id, result)
```

## Plugin Generator

### Generator Commands

```bash
# Create new plugin
pnpm create @kingly/plugin my-plugin core

# Available templates
pnpm create @kingly/plugin my-utility utility
pnpm create @kingly/plugin my-workflow workflow

# With specific features
pnpm create @kingly/plugin my-dev-tool core --features=git,claude,parallel
```

### Generated Structure

```
packages/my-plugin/
├── src/
│   ├── index.js             # Main plugin entry point
│   ├── commands.js          # Command implementations
│   ├── workflows.js         # Workflow definitions
│   └── config.js            # Configuration loader
├── config/
│   ├── plugin.yaml          # Plugin configuration
│   ├── commands.yaml        # Command definitions
│   └── workflows.yaml       # Workflow definitions
├── tests/
│   ├── commands.test.js     # Command tests
│   └── integration.test.js  # Integration tests
├── package.json
├── README.md
└── .plugin-config.json     # Generator metadata
```

## Best Practices

### Configuration Management

1. **YAML Configuration**: Use YAML for all behavior definitions
2. **Environment Variables**: Support configuration via ENV vars
3. **Validation**: Validate configuration on plugin load
4. **Defaults**: Provide sensible default configurations

### Error Handling

1. **Graceful Degradation**: Plugin failures should not break core system
2. **Error Reporting**: Report errors back to ~/mvp job system
3. **Logging**: Use @kingly/cmd log aggregation
4. **Recovery**: Implement retry and recovery mechanisms

### Performance Considerations

1. **Lazy Loading**: Load plugin resources only when needed
2. **Process Isolation**: Use @kingly/cmd for process separation
3. **Resource Management**: Clean up processes and resources
4. **Background Processing**: Leverage @kingly/cmd background capabilities

### Testing Strategy

1. **Unit Tests**: Test individual plugin components
2. **Integration Tests**: Test with @kingly/cmd and ~/mvp
3. **E2E Tests**: Test complete workflow scenarios
4. **Mock Dependencies**: Mock external tools and services

## Plugin Registry

### Discovery
- Plugins discovered automatically in `packages/` directory
- Plugin metadata loaded from `plugin.yaml` configuration
- Commands registered with ~/mvp command center

### Activation
- Plugins activated on-demand when commands are used
- Background plugins can run persistently
- Resource management handled by @kingly/cmd

### Updates
- Plugin versioning follows semantic versioning
- Hot-reload support for development
- Backwards compatibility requirements

## Example Plugins

### Parallel Development Plugin
```yaml
plugin:
  name: parallel
  type: core_plugin
  description: Git worktree + Claude Code parallel development

capabilities:
  - process_management
  - git_worktree
  - claude_spawning

commands:
  para_init:
    syntax: "kingly para init <session> [streams...]"
    description: "Initialize parallel development session"
```

### Dev Server Plugin
```yaml
plugin:
  name: dev-server
  type: utility_plugin
  description: Development server management with log streaming

capabilities:
  - process_management
  - log_streaming

commands:
  dev_start:
    syntax: "kingly dev start [--monitor]"
    description: "Start development server with monitoring"
```

## Migration Guide

### From Existing Systems
1. **~/mvp Integration**: Use existing job system, add @kingly/cmd process management
2. **~/c Context System**: Reference contexts in place, no extraction needed
3. **Hub Parallel Work**: Use as reference, implement with @kingly/cmd patterns

### Plugin Conversion
1. **Analyze Current Implementation**: Identify core functionality
2. **Extract Configuration**: Move behavior to YAML definitions
3. **Implement Commands**: Use @kingly/cmd for process management
4. **Test Integration**: Ensure compatibility with ecosystem

## Future Considerations

### Planned Features
- Plugin marketplace and discovery
- Cross-plugin communication
- Plugin dependency management
- Visual plugin builder
- Cloud plugin registry

### Compatibility
- Maintain backwards compatibility for core plugin API
- Support for plugin versioning and updates
- Migration tools for plugin updates
- Documentation generation from plugin metadata