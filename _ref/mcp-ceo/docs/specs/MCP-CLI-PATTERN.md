# MCP CLI Test Harness Pattern

This pattern allows you to bypass the MCP protocol for direct testing and automation of MCP servers.

## Pattern Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   CLI.js    │────▶│  Core.js    │────▶│  Sessions    │
│  (wrapper)  │     │ (business)  │     │  (markdown)  │
└─────────────┘     └─────────────┘     └──────────────┘
        │                   ▲
        │                   │
        ▼                   │
┌─────────────┐     ┌─────────────┐
│  Server.js  │────▶│  MCP Proto  │
│   (when     │     │  (optional) │
│   needed)   │     └─────────────┘
└─────────────┘
```

## Implementation Steps

### 1. Extract Core Business Logic

Create a `ceo-core.js` (or `{project}-core.js`) that exports:
- Business logic classes
- Tool implementations
- Utilities (logger, session manager)
- Configuration loading

```javascript
// ceo-core.js
export class YourBusinessLogic {
  // Core functionality
}

export const toolImplementations = {
  your_tool: async (args) => {
    // Direct implementation
  }
}
```

### 2. Create CLI Wrapper

Build a `cli.js` that:
- Imports core business logic
- Handles multiple input methods
- Provides clean command interface

```javascript
// cli.js
import { YourBusinessLogic } from './your-core.js';

// Input methods:
// 1. Simple text: node cli.js command "text"
// 2. JSON stdin: echo '{"key": "value"}' | node cli.js command
// 3. File input: node cli.js command --file input.json
// 4. Options: --quiet, --pretty, --raw
```

### 3. Enhanced Session Management

Create folders per session with:
```
sessions/
└── {session-id}/
    ├── README.md          # Session summary
    ├── session.json       # Overall state
    ├── step-1.json       # Raw step data
    ├── step-1.md         # Human-readable step
    ├── step-2.json
    └── step-2.md
```

### 4. Keep MCP Server Separate

The server.js imports the core and wraps it with MCP protocol:
```javascript
// server.js
import { toolImplementations } from './your-core.js';

if (import.meta.url === `file://${process.argv[1]}`) {
  // Only start MCP server if run directly
}
```

## Benefits

1. **Direct Testing**: No MCP protocol overhead
2. **Automation Ready**: Easy to script and integrate
3. **Full Logging**: Every step captured in JSON and markdown
4. **Debugging**: See exact inputs/outputs for each step
5. **Reusability**: Core logic works with both CLI and MCP

## Usage Examples

```bash
# Simple command
node cli.js analyze "How to reduce stress?"

# Complex JSON input
echo '{"challenge": "Scale my startup", "context": {"urgency": "high"}}' | node cli.js analyze

# Start workflow
node cli.js workflow deep_analysis

# Continue workflow
node cli.js workflow deep_analysis 2 --session {id}

# Quiet mode (no terminal art)
node cli.js analyze "test" --quiet

# Raw JSON output
node cli.js list --raw --pretty
```

## Testing Workflows

The enhanced session management creates detailed logs:

1. **Input Tracking**: Full context prompts and active personalities
2. **Output Capture**: Responses and next-step instructions
3. **Markdown Summaries**: Human-readable workflow progress
4. **State Evolution**: See how context builds across steps

## Applying This Pattern

To apply to any MCP server:

1. **Identify core logic** that doesn't depend on MCP
2. **Extract to core module** with clean exports
3. **Create CLI wrapper** with input handling
4. **Add session management** for debugging
5. **Keep server thin** - just MCP protocol wrapper

This pattern enables rapid development, testing, and debugging of MCP servers without the protocol overhead!