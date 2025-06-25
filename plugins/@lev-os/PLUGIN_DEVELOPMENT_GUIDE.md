# Leviathan Plugin Development Guide

## 🎯 **SINGLE SOURCE OF TRUTH FOR PLUGIN DEVELOPMENT**

This is the **master reference** for creating Leviathan plugins. All plugin development should follow these standards to ensure seamless integration with the Leviathan ecosystem.

## 📋 **PLUGIN NAMESPACE STANDARD**

### **OFFICIAL NAMESPACE: `@lev-os/`**

All Leviathan plugins MUST use the `@lev-os/` namespace:

```
✅ CORRECT: @lev-os/my-plugin
❌ INCORRECT: @lev/my-plugin
❌ INCORRECT: @leviathan/my-plugin
❌ INCORRECT: @homie/my-plugin
```

**Why `@lev-os/`?**
- Represents "Leviathan Operating System" plugins
- Consistent with the "Linux of AI" vision
- Clear differentiation from other namespaces
- NPM-compatible for future publishing

## 🏗️ **CONSTITUTIONAL PLUGIN ARCHITECTURE**

All plugins must align with Leviathan's constitutional principles:

### **1. Maximum Extensibility**
- Plugins should be hackable and extensible by the community
- Follow auto-bootstrap pattern for zero-configuration integration
- Enable other plugins to build on top of your plugin

### **2. Bi-Directional Communication**
- Support both CLI and MCP interfaces automatically
- Use command registry auto-discovery pattern
- Follow established dependency injection patterns

### **3. Domain Separation (Hexagonal Architecture)**
- Business logic in `src/commands/` (never in adapters)
- Adapters route, core computes
- Clean separation between protocol and business logic

## 📁 **STANDARD PLUGIN STRUCTURE**

```
plugins/@lev-os/your-plugin/
├── config/
│   └── plugin.yaml              # Plugin configuration and metadata
├── src/
│   ├── commands/                # Command implementations (auto-discovered)
│   │   ├── main-command.js      # Primary plugin command
│   │   └── sub-command.js       # Additional commands
│   └── index.js                 # Plugin entry point
├── tests/
│   ├── integration.test.js      # CLI + MCP integration tests
│   └── unit.test.js            # Command business logic tests
├── templates/                   # Usage examples and templates
│   └── usage-examples.md
├── README.md                    # Plugin documentation
└── package.json                 # NPM package configuration
```

## 🔧 **AUTO-BOOTSTRAP COMMAND PATTERN**

### **Command File Template** (`src/commands/example.js`):

```javascript
#!/usr/bin/env node

/**
 * Example Plugin Command
 * Demonstrates auto-bootstrap pattern for Leviathan ecosystem
 */

// ======= MAIN COMMAND (CLI Router) =======

export async function example(args, dependencies) {
  const [subcommand, ...subArgs] = args;
  
  if (!subcommand) {
    throw new Error('Example subcommand required. Available: status, info, test');
  }
  
  // Route to appropriate subcommand
  switch (subcommand) {
    case 'status':
      return await exampleStatus(parseArgs(subArgs), dependencies);
    case 'info':
      const target = subArgs[0];
      return await exampleInfo({ target, ...parseArgs(subArgs.slice(1)) }, dependencies);
    case 'test':
      return await exampleTest(parseArgs(subArgs), dependencies);
    default:
      throw new Error(`Unknown example command: ${subcommand}. Available: status, info, test`);
  }
}

// ======= SUBCOMMAND FUNCTIONS =======

export async function exampleStatus(args, dependencies) {
  const { workflowLoader, debugLogger } = dependencies || {};
  const { format = 'formatted' } = args;
  
  // Business logic here
  const statusData = {
    plugin: 'example-plugin',
    version: '1.0.0',
    status: 'active',
    features: ['auto-bootstrap', 'cli-integration', 'mcp-tools']
  };
  
  return {
    success: true,
    data: statusData,
    format: format
  };
}

// ======= HELPER FUNCTIONS =======

function parseArgs(args) {
  const parsed = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value) {
        if (value === 'true') parsed[key] = true;
        else if (value === 'false') parsed[key] = false;
        else if (!isNaN(value)) parsed[key] = Number(value);
        else parsed[key] = value;
      } else {
        parsed[key] = true;
      }
    }
  }
  
  return parsed;
}

// ======= METADATA FOR AUTO-DISCOVERY =======

example.description = "Example plugin command with subcommands";
example.inputSchema = {
  type: 'object',
  properties: {
    subcommand: {
      type: 'string',
      enum: ['status', 'info', 'test'],
      description: 'Example subcommand to execute'
    },
    args: {
      type: 'array',
      items: { type: 'string' },
      description: 'Additional arguments for the subcommand'
    }
  },
  required: ['subcommand']
};

// ======= MCP TOOL EXPORTS =======

export const exampleTool = {
  name: 'example',
  description: example.description,
  inputSchema: example.inputSchema,
  handler: example
};

export const exampleStatusTool = {
  name: 'example_status',
  description: exampleStatus.description,
  inputSchema: exampleStatus.inputSchema,
  handler: exampleStatus
};
```

## 📦 **PLUGIN CONFIGURATION** (`config/plugin.yaml`):

```yaml
# Plugin Metadata
name: example-plugin
namespace: "@lev-os"
version: "1.0.0"
description: "Example plugin demonstrating Leviathan standards"

# Plugin Type and Capabilities
type: "command-plugin"
capabilities:
  - "cli-integration"
  - "mcp-tools"
  - "auto-bootstrap"

# Command Registration
commands:
  - name: "example"
    description: "Example plugin command with subcommands"
    primary: true
  - name: "example-status" 
    description: "Show example plugin status"
    parent: "example"

# Dependencies
dependencies:
  core:
    - "@lev-os/debug"
  optional:
    - "@lev-os/testing"

# Plugin Configuration
config:
  auto_bootstrap: true
  namespace_isolation: true
  cross_adapter_support: true

# Compatibility
compatibility:
  leviathan_version: ">=1.0.0"
  node_version: ">=18.0.0"
```

## 🧪 **TESTING REQUIREMENTS**

### **Use `@lev-os/testing` Framework**:

```javascript
// tests/integration.test.js
import { runLevCommand, callMCPTool } from '@lev-os/testing';

describe('Example Plugin Integration', () => {
  test('should work via CLI auto-discovery', async () => {
    const result = await runLevCommand(['example', 'status']);
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('example-plugin');
  });
  
  test('should work via MCP auto-discovery', async () => {
    const result = await callMCPTool('example', { subcommand: 'status' });
    
    expect(result.success).toBe(true);
    expect(result.data.plugin).toBe('example-plugin');
  });
  
  test('CLI and MCP should produce identical results', async () => {
    const cliResult = await runLevCommand(['example', 'status']);
    const mcpResult = await callMCPTool('example', { subcommand: 'status' });
    
    expect(cliResult.data).toEqual(mcpResult.data);
  });
});
```

## 📚 **REFERENCE IMPLEMENTATIONS**

### **Study These Excellent Examples**:

1. **`@lev-os/debug`** - Clean logging and monitoring plugin
2. **`@lev-os/testing`** - Comprehensive testing framework
3. **`@lev-os/validation`** - Multi-validator pattern implementation
4. **`@lev-os/cmd`** - Process management and git operations

### **Plugin Template Available**:
- **`packages/workshop/templates/plugin-template.md`** - Complete working template
- **Note**: This will move to `@lev-os/workshop` after refactor completion

## 🚀 **PLUGIN DEVELOPMENT WORKFLOW**

### **1. Create Plugin Structure**
```bash
mkdir -p plugins/@lev-os/your-plugin/{config,src/commands,tests,templates}
cd plugins/@lev-os/your-plugin
```

### **2. Copy and Customize Template**
- Copy command template from this guide
- Update plugin.yaml configuration
- Create integration tests

### **3. Implement Commands**
- Follow auto-bootstrap pattern
- Include proper metadata and MCP exports
- Test via both CLI and MCP

### **4. Validate Integration**
```bash
# Test CLI integration
/path/to/agent/bin/lev your-command status

# Test auto-discovery
/path/to/agent/bin/lev help | grep your-command

# Run integration tests
npm test
```

### **5. Documentation**
- README.md with usage examples
- Update this guide if needed
- Share patterns with community

## 🔄 **CONSTITUTIONAL COMPLIANCE**

### **Required Adherence**:
- **LLM-First Architecture** - Commands should be discoverable and executable by AI
- **Maximum Extensibility** - Other plugins should be able to build on yours
- **Domain Separation** - Business logic in commands, not adapters
- **Auto-Bootstrap** - Zero-configuration integration with CLI + MCP

### **Coding Standards**:
- **100-150 line threshold** - Keep functions focused and readable
- **Human + Agent Optimization** - Code should be readable by both humans and AI
- **Constitutional Alignment** - Follow the 10 core principles

## 📋 **PLUGIN VALIDATION CHECKLIST**

Before submitting or using a plugin, ensure:

- [ ] Uses `@lev-os/` namespace
- [ ] Follows standard directory structure
- [ ] Includes proper `config/plugin.yaml`
- [ ] Commands follow auto-bootstrap pattern
- [ ] Has MCP tool exports for all commands
- [ ] Includes integration tests using `@lev-os/testing`
- [ ] Works via both CLI and MCP interfaces
- [ ] Produces identical results across adapters
- [ ] Follows constitutional principles
- [ ] Adheres to coding standards

## 🆘 **TROUBLESHOOTING**

### **Command Not Auto-Discovered**:
1. Check filename matches expected pattern
2. Verify exported function name
3. Ensure MCP tool export exists
4. Check for syntax errors in command file

### **MCP Tool Missing**:
1. Verify `{commandName}Tool` export
2. Check inputSchema definition
3. Ensure tool name follows naming convention

### **CLI vs MCP Inconsistency**:
1. Check dependency injection consistency
2. Verify both adapters use same command registry
3. Test error handling across both interfaces

## 🌟 **COMMUNITY CONTRIBUTIONS**

### **Contributing to This Guide**:
- Improvements and clarifications welcome
- Add patterns discovered through plugin development
- Share common troubleshooting solutions

### **Plugin Ecosystem Growth**:
- Share successful patterns with community
- Build on existing plugins where possible
- Follow "Linux of AI" extensibility principles

---

**This is the single source of truth for Leviathan plugin development. All plugins should reference and follow these standards for seamless ecosystem integration.**