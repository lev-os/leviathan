# Leviathan Plugin Template

## Quick Start

This template demonstrates the auto-bootstrap pattern for creating Leviathan plugins that work seamlessly across CLI and MCP interfaces.

## Plugin Structure

```
plugins/@namespace/plugin-name/
├── src/
│   └── commands/
│       └── my-command.js     # Main command implementation
├── tests/
│   └── integration.test.js   # CLI + MCP integration tests
├── templates/
│   └── usage-examples.md     # Usage examples and docs
├── package.json              # Plugin metadata
└── README.md                 # Plugin description
```

## Command Template

**File**: `src/commands/example.js`

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
  
  // Business logic
  const statusData = {
    plugin: 'example-plugin',
    version: '1.0.0',
    status: 'active',
    features: ['auto-bootstrap', 'cli-integration', 'mcp-tools'],
    stats: {
      commands: 3,
      uptime: '24h',
      lastUpdate: new Date().toISOString()
    }
  };
  
  return {
    success: true,
    data: statusData,
    format: format
  };
}

export async function exampleInfo(args, dependencies) {
  const { workflowLoader, debugLogger } = dependencies || {};
  const { target } = args;
  
  if (!target) {
    throw new Error('Target is required for info command');
  }
  
  // Business logic
  const infoData = {
    target,
    type: 'example-resource',
    description: `Information about ${target}`,
    capabilities: ['query', 'update', 'delete'],
    lastAccessed: new Date().toISOString()
  };
  
  return {
    success: true,
    data: infoData
  };
}

export async function exampleTest(args, dependencies) {
  const { workflowLoader, debugLogger } = dependencies || {};
  const { verbose = false } = args;
  
  // Business logic
  const testResults = {
    testSuite: 'example-plugin-tests',
    passed: 5,
    failed: 0,
    skipped: 1,
    duration: '1.2s',
    details: verbose ? ['test1: PASS', 'test2: PASS', 'test3: SKIP'] : null
  };
  
  return {
    success: true,
    data: testResults
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

exampleStatus.description = "Show example plugin status";
exampleStatus.inputSchema = {
  type: 'object',
  properties: {
    format: { 
      type: 'string',
      enum: ['formatted', 'json'],
      default: 'formatted',
      description: 'Output format'
    }
  }
};

exampleInfo.description = "Get information about example resource";
exampleInfo.inputSchema = {
  type: 'object',
  properties: {
    target: { 
      type: 'string',
      description: 'Target resource to get information about'
    }
  },
  required: ['target']
};

exampleTest.description = "Run example plugin tests";
exampleTest.inputSchema = {
  type: 'object',
  properties: {
    verbose: { 
      type: 'boolean',
      default: false,
      description: 'Show detailed test results'
    }
  }
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

export const exampleInfoTool = {
  name: 'example_info',
  description: exampleInfo.description,
  inputSchema: exampleInfo.inputSchema,
  handler: exampleInfo
};

export const exampleTestTool = {
  name: 'example_test',
  description: exampleTest.description,
  inputSchema: exampleTest.inputSchema,
  handler: exampleTest
};
```

## Integration Test Template

**File**: `tests/integration.test.js`

```javascript
#!/usr/bin/env node

/**
 * Example Plugin Integration Tests
 * Tests auto-bootstrap pattern through real CLI integration
 */

import { spawn } from 'child_process';

const agentDir = '/Users/jean-patricksmith/digital/leviathan/agent';

async function runCommand(args) {
  return new Promise((resolve) => {
    const command = `${agentDir}/bin/lev ${args.join(' ')}`;
    const child = spawn('bash', ['-c', command], { 
      stdio: 'pipe',
      timeout: 10000
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        code: code,
        output: (stdout + stderr).trim()
      });
    });
    
    setTimeout(() => {
      child.kill();
      resolve({ success: false, code: -1, output: 'Timeout' });
    }, 10000);
  });
}

async function testExamplePlugin() {
  console.log('🧪 Testing Example Plugin Integration\\n');
  
  const tests = [
    {
      name: 'example status',
      args: ['example', 'status'],
      expectSuccess: true,
      expectInOutput: 'example-plugin'
    },
    {
      name: 'example info resource1',
      args: ['example', 'info', 'resource1'],
      expectSuccess: true,
      expectInOutput: 'resource1'
    },
    {
      name: 'example test',
      args: ['example', 'test'],
      expectSuccess: true,
      expectInOutput: 'test-suite'
    },
    {
      name: 'example test --verbose',
      args: ['example', 'test', '--verbose'],
      expectSuccess: true,
      expectInOutput: 'test1: PASS'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`🧪 ${test.name}... `);
    
    const result = await runCommand(test.args);
    
    let success = true;
    let reason = '';
    
    if (test.expectSuccess && !result.success) {
      success = false;
      reason = `Expected success but got code ${result.code}`;
    }
    
    if (test.expectInOutput && !result.output.includes(test.expectInOutput)) {
      success = false;
      reason = `Expected output to contain "${test.expectInOutput}"`;
    }
    
    if (success) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log(`❌ FAIL - ${reason}`);
      failed++;
    }
  }
  
  console.log(`\\n📊 Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testExamplePlugin().then(success => {
    process.exit(success ? 0 : 1);
  });
}
```

## Usage Examples

### CLI Usage
```bash
# Status command
lev example status
lev example status --format=json

# Info command  
lev example info my-resource
lev example info my-resource --verbose

# Test command
lev example test
lev example test --verbose
```

### MCP Tools
When the plugin is registered, these tools become available:
- `example` - Main command router
- `example_status` - Plugin status
- `example_info` - Resource information
- `example_test` - Run tests

## Package.json Template

```json
{
  "name": "@namespace/example-plugin",
  "version": "1.0.0",
  "description": "Example Leviathan plugin demonstrating auto-bootstrap pattern",
  "type": "module",
  "main": "src/commands/example.js",
  "scripts": {
    "test": "node tests/integration.test.js",
    "test:cli": "node tests/integration.test.js"
  },
  "keywords": ["leviathan", "plugin", "auto-bootstrap", "cli", "mcp"],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "@lev-os/debug": "*",
    "@lev-os/testing": "*"
  },
  "leviathan": {
    "plugin": true,
    "commands": ["example"],
    "namespace": "example",
    "autoBootstrap": true
  }
}
```

## Installation & Development

### 1. Create Plugin Structure
```bash
mkdir -p plugins/@yournamespace/your-plugin/{src/commands,tests,templates}
cd plugins/@yournamespace/your-plugin
```

### 2. Copy Templates
- Copy command template to `src/commands/your-command.js`
- Copy test template to `tests/integration.test.js`
- Copy package.json template

### 3. Customize
- Replace `example` with your command name
- Update business logic in subcommand functions
- Modify tests for your specific functionality
- Update package.json metadata

### 4. Test Integration
```bash
# Test CLI integration
node tests/integration.test.js

# Test manual commands
/path/to/agent/bin/lev your-command status
```

### 5. Plugin Registration
The auto-bootstrap pattern means your commands automatically work once the plugin is properly structured. No manual registration needed!

## Best Practices

### Command Design
- ✅ Use router pattern for multiple subcommands
- ✅ Include proper error handling and validation
- ✅ Support both formatted and JSON output
- ✅ Follow domain separation principles

### Testing
- ✅ Test real CLI integration, not mocks
- ✅ Validate both success and error cases
- ✅ Test argument parsing and validation
- ✅ Verify output formatting

### Documentation
- ✅ Include usage examples
- ✅ Document all subcommands and arguments
- ✅ Provide integration examples
- ✅ Explain business logic and dependencies

---

This template provides a complete foundation for building Leviathan plugins that integrate seamlessly with the auto-bootstrap ecosystem.