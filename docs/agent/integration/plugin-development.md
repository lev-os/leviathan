# Plugin Development Guide

## Overview

Leviathan plugins extend system functionality through a standardized architecture that includes comprehensive documentation, whisper guidance, and universal LLM compatibility.

## Plugin Structure

### Required Directory Layout

```
plugins/@namespace/plugin-name/
├── README.md                    # Complete usage guide (required)
├── package.json                # Plugin metadata and dependencies
├── config/
│   └── plugin.yaml             # Plugin configuration with whisper guidance
├── src/                        # Plugin implementation
│   ├── index.js               # Main plugin exports
│   ├── commands/              # Command implementations
│   └── lib/                   # Supporting libraries
├── docs/                      # Extended documentation (recommended)
│   ├── usage-examples.md      # Concrete usage examples
│   ├── integration-patterns.md # How to combine with other plugins
│   └── troubleshooting.md     # Common issues and solutions
└── tests/                     # Plugin tests
    ├── unit/                  # Unit tests for plugin functions
    └── integration/           # Integration tests with core system
```

### Plugin Configuration (plugin.yaml)

```yaml
plugin:
  name: "example-plugin"
  version: "1.0.0"
  type: "core_plugin"           # core_plugin | community_plugin | personal_plugin
  description: "Brief description of plugin functionality"
  namespace: "@lev-os"          # @lev-os | @community | @personal

capabilities:
  - "capability_1"              # List of capabilities this plugin provides
  - "capability_2"

commands:
  command_name:
    syntax: "lev plugin command <args> [options]"
    description: "What this command does"
    whisper:
      "What This Does":
        content: "Brief functional description adapted from README"
      "Quick Usage":
        - "Primary usage pattern from README"
        - "Key integration point with core system"
      "Full Documentation":
        content: "Complete guide: plugins/@namespace/plugin/README.md"
      "Foreign LLM Guidance":
        rotate:
          - "Not 100% confident? Run 'lev help plugin command' for syntax"
          - "Need examples? Check plugin documentation for usage patterns"
        frequency: session_start

dependencies:
  core: ["@lev-os/core"]         # Core system dependencies
  plugins: ["@lev-os/other"]     # Other plugin dependencies
  external: ["axios", "lodash"] # External npm packages
```

## Command Implementation

### Command Function Structure

```javascript
// src/commands/example-command.js

/**
 * Example command implementation
 * @param {Object} args - Command arguments from CLI/MCP
 * @param {Object} context - Injected dependencies
 * @returns {Promise<Object>} Command result
 */
export async function exampleCommand(args, { logger, fileLoader, contextManager }) {
  const { input, options } = args;
  
  try {
    // Command implementation
    const result = await processInput(input, options);
    
    // Log for debugging
    logger.log('example_command', { 
      input: input, 
      success: true, 
      resultCount: result.items.length 
    });
    
    return {
      success: true,
      data: result,
      content: [
        {
          type: 'text',
          text: formatResult(result)
        }
      ]
    };
    
  } catch (error) {
    logger.error('example_command_failed', { error: error.message });
    
    return {
      success: false,
      error: error.message,
      content: [
        {
          type: 'text', 
          text: `❌ Command failed: ${error.message}`
        }
      ]
    };
  }
}

// Metadata for auto-discovery
exampleCommand.description = "Example command with proper error handling";
exampleCommand.inputSchema = {
  type: 'object',
  properties: {
    input: {
      type: 'string',
      description: 'Input data to process'
    },
    options: {
      type: 'object',
      description: 'Command options'
    }
  },
  required: ['input']
};

// MCP tool definition for automatic registration
export const exampleCommandTool = {
  name: 'example_command',
  description: exampleCommand.description,
  inputSchema: exampleCommand.inputSchema,
  handler: exampleCommand
};
```

### Command Registry Integration

```javascript
// src/index.js - Plugin main export

import { exampleCommand, exampleCommandTool } from './commands/example-command.js';

// Export all commands for auto-discovery
export const commands = {
  exampleCommand
};

// Export MCP tools for automatic registration
export const tools = {
  exampleCommandTool
};

// Plugin metadata
export const pluginInfo = {
  name: 'example-plugin',
  version: '1.0.0',
  commands: Object.keys(commands),
  tools: Object.keys(tools)
};
```

## Documentation Requirements

### README.md Structure

```markdown
# @namespace/plugin-name

## Purpose
Clear statement of what the plugin does and why someone would use it.

## Quick Start
Immediate usage examples that get users productive quickly:

```bash
# Install plugin
lev plugin install @namespace/plugin-name

# Basic usage
lev plugin command "input"

# Common options
lev plugin command "input" --option=value
```

## Complete Usage

### Command Reference
Detail all commands with examples:

#### plugin command
Description of what the command does.

**Syntax**: `lev plugin command <input> [options]`

**Parameters**:
- `input` - Description of input parameter
- `--option` - Description of optional parameter

**Examples**:
```bash
lev plugin command "simple example"
lev plugin command "complex example" --advanced-option=true
```

### Integration Patterns
How to combine this plugin with others:

#### With Core Commands
```bash
# Use with find command
lev find "context" | lev plugin process

# Chain with checkpoint
lev plugin command "input" && lev checkpoint "plugin task complete"
```

#### With Other Plugins
```bash
# Combine with other community plugins
lev other-plugin prepare | lev this-plugin process
```

## Configuration
How to customize the plugin:

```yaml
# ~/.leviathan/config/plugins/@namespace/plugin-name.yaml
plugin:
  settings:
    option1: value1
    option2: value2
```

## Troubleshooting

### Common Issues

**Issue**: Error message or common problem
**Solution**: Step-by-step resolution

**Issue**: Another common problem  
**Solution**: How to fix it
```

### Extended Documentation (docs/)

**usage-examples.md**: Comprehensive examples for different use cases
**integration-patterns.md**: Advanced patterns for combining with other plugins
**troubleshooting.md**: Detailed troubleshooting guide with solutions

## Whisper Guidelines

### Writing Effective Whispers

**Point to Documentation**:
```yaml
whisper:
  "Full Documentation":
    content: "Complete guide: plugins/@namespace/plugin/README.md + docs/"
```

**Universal LLM Guidance**:
```yaml
"Foreign LLM Guidance":
  rotate:
    - "Not 100% confident? Run 'lev help plugin command' for complete syntax"
    - "Need examples? Check plugin README.md for full usage guide"
    - "Unfamiliar with system? Start with 'lev prime' for orientation"
  frequency: session_start
```

**Rotation Best Practices**:
- Provide 2-4 rotation options to prevent staleness
- Include navigation to help commands and documentation
- Use appropriate frequency for user patterns

**Keep Whispers Brief**:
- Whispers are navigation aids, not complete instructions
- Point to comprehensive documentation rather than including it
- Focus on helping LLMs find what they need

## Plugin Types

### Core Plugins (@lev-os/*)

**Purpose**: Essential system functionality
**Standards**: Highest quality, comprehensive documentation, universal compatibility
**Examples**: cmd (command execution), debug (system debugging), validation (input validation)

**Requirements**:
- Comprehensive test coverage (>90%)
- Universal LLM compatibility testing
- Performance benchmarking
- Extensive documentation with examples

### Community Plugins (@community/*)

**Purpose**: Domain-specific functionality contributed by the community
**Standards**: Good documentation, proper whisper integration, follows plugin patterns
**Examples**: media-forge (media processing), data-analysis (analytics tools)

**Requirements**:
- Complete README.md with usage examples
- Proper whisper configuration
- Integration tests with core system
- Documentation in docs/ directory

### Personal Plugins (@personal/*)

**Purpose**: User-specific functionality and workflow automation
**Standards**: Minimal requirements, focus on personal productivity
**Examples**: Custom workflow automation, personal productivity tools

**Requirements**:
- Basic README.md
- Plugin.yaml configuration
- Working command implementation

## Testing Strategy

### Unit Tests

```javascript
// tests/unit/example-command.test.js
import { exampleCommand } from '../../src/commands/example-command.js';
import { createMockContext } from '@lev-os/testing';

describe('exampleCommand', () => {
  test('should process input correctly', async () => {
    const mockContext = createMockContext();
    const args = { input: 'test input', options: {} };
    
    const result = await exampleCommand(args, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockContext.logger.log).toHaveBeenCalledWith('example_command', expect.any(Object));
  });
  
  test('should handle errors gracefully', async () => {
    const mockContext = createMockContext();
    const args = { input: 'invalid input', options: {} };
    
    const result = await exampleCommand(args, mockContext);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockContext.logger.error).toHaveBeenCalled();
  });
});
```

### Integration Tests

```javascript
// tests/integration/plugin-integration.test.js
import { runLevCommand } from '@lev-os/testing';

describe('Plugin Integration', () => {
  test('should integrate with core command registry', async () => {
    const result = await runLevCommand(['plugin', 'command', 'test']);
    
    expect(result.success).toBe(true);
    expect(result.whisper).toBeDefined();
  });
  
  test('should work with MCP adapter', async () => {
    const mcpResult = await callMcpTool('example_command', { input: 'test' });
    
    expect(mcpResult.success).toBe(true);
  });
});
```

## Plugin Lifecycle

### Development Process

1. **Planning**
   - Define plugin purpose and scope
   - Review existing plugins for patterns
   - Plan command structure and whisper guidance

2. **Implementation**
   - Create plugin directory structure
   - Implement commands with proper error handling
   - Write comprehensive documentation

3. **Testing**
   - Unit tests for all command functions
   - Integration tests with core system
   - Foreign LLM compatibility testing

4. **Documentation**
   - Complete README.md with examples
   - Extended documentation in docs/
   - Proper whisper configuration

5. **Registration**
   - Submit plugin to appropriate registry
   - Community review process (for community plugins)
   - Performance and compatibility validation

### Plugin Distribution

**Core Plugins**: Included with Leviathan installation
**Community Plugins**: Available through plugin registry
**Personal Plugins**: Local installation and development

```bash
# Install community plugin
lev plugin install @community/plugin-name

# Install from git repository
lev plugin install git+https://github.com/user/plugin-repo

# Install local development plugin
lev plugin install ./path/to/plugin
```

## Best Practices

### Code Quality

- Follow existing code patterns in core plugins
- Use dependency injection for testability
- Handle errors gracefully with informative messages
- Include comprehensive logging for debugging

### Documentation

- Write documentation for humans, not just LLMs
- Include concrete examples for every command
- Explain integration patterns with other plugins
- Keep whispers focused on navigation, not complete guidance

### Performance

- Optimize for fast command execution
- Use lazy loading for heavy dependencies
- Cache expensive computations when appropriate
- Profile plugin performance impact

### Compatibility

- Test with multiple LLM providers
- Ensure universal accessibility (not Claude-specific)
- Validate cross-platform compatibility
- Test with different project structures

## Advanced Topics

### Plugin Dependencies

```yaml
# Managing dependencies between plugins
dependencies:
  core: ["@lev-os/core", "@lev-os/debug"]
  plugins: ["@community/data-tools"]
  optional: ["@personal/my-workflow"]
```

### Plugin Configuration

```yaml
# ~/.leviathan/config/plugins/plugin-config.yaml
plugins:
  "@namespace/plugin-name":
    enabled: true
    settings:
      custom_option: value
    whisper_frequency: session_start
```

### Plugin APIs

```javascript
// Exposing plugin APIs for other plugins
export const pluginAPI = {
  processData: (data) => { /* implementation */ },
  validateInput: (input) => { /* implementation */ }
};
```

### Plugin Events

```javascript
// Plugin lifecycle events
export const pluginHooks = {
  onInstall: async () => { /* setup code */ },
  onEnable: async () => { /* activation code */ },
  onDisable: async () => { /* cleanup code */ }
};
```