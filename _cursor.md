# Cursor & IDE Integration Architecture Plan

## Overview

This document outlines the hexagonal architecture terminology and IDE integration patterns for the Leviathan agent system.

## Hexagonal Architecture Terminology in Leviathan

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     DRIVER ADAPTERS                         │
│  (IDEs & Agentic Platforms - They DRIVE the system)        │
├─────────────────────────────────────────────────────────────┤
│  Claude Code │ Cursor │ VSCode │ Cline │ Roo │ Augment    │
│     ↓            ↓        ↓        ↓      ↓       ↓        │
│  [Composite]  [Direct]  [Direct] [MCP]  [MCP]   [MCP]      │
│     ↓            ↓        ↓        ↓      ↓       ↓        │
├─────────────────────────────────────────────────────────────┤
│                    DRIVER PORTS (APIs)                      │
│              CLI Port    |    MCP Port                      │
└──────────────────┬──────────────┬──────────────────────────┘
                   │              │
          ┌────────▼──────────────▼────────┐
          │      HEXAGON (Core Logic)      │
          │   agent/src/commands/*.js      │
          │  Pure Business Logic Only      │
          └────────┬──────────────┬────────┘
                   │              │
┌──────────────────▼──────────────▼──────────────────────────┐
│                 DRIVEN PORTS (SPIs)                         │
│          FileSystem    |    Database                        │
├─────────────────────────────────────────────────────────────┤
│                  DRIVEN ADAPTERS                            │
│  (The system DRIVES these external resources)              │
├─────────────────────────────────────────────────────────────┤
│   Qdrant  │  Neo4j  │  FileSystem  │  APIs  │  Services   │
└─────────────────────────────────────────────────────────────┘
```

### Key Terms

1. **Driver/Primary Adapters** (Inbound): Claude Code, Cursor, VSCode - they DRIVE the system
2. **Driven/Secondary Adapters** (Outbound): Databases, file systems - the system DRIVES them
3. **Composite/Meta-Adapter**: When Claude Code uses MCP (adapter using adapter)
4. **Hexagon/Core**: Pure business logic in `agent/src/commands/`

## Cursor Integration Strategy

### Phase 1: Documentation Updates

1. **Create IDE integration docs** in `agent/docs/architecture/`
2. **Update cursor rules** in `.cursor/rules/`
3. **Simplify root `.cursorrules`** to point to modular rules
4. **Add workflow patterns** for save/synthesize behavior

### Phase 2: Cursor Rule Updates

#### Root `.cursorrules` (Simplified Pointer)

```markdown
# Leviathan Cursor Rules

This project uses modular cursor rules. See `.cursor/rules/` for:

- `global-architecture.mdc` - Core principles (always applied)
- `javascript-agent-development.mdc` - Agent development patterns
- `plugin-development.mdc` - Plugin creation guidelines
- `ide-integration-patterns.mdc` - IDE/Cursor integration helpers
- `flowmind-bidirectional-workflows.mdc` - Advanced workflow patterns

Quick Start Commands:

- `lev help` - See all available commands
- `lev context search "<need>"` - Find thinking patterns
- `lev checkpoint --new "<task>"` - Start work session
```

#### New `.cursor/rules/ide-integration-patterns.mdc`

- Workflow patterns (save turns, synthesize)
- Context discovery helpers
- Power combo patterns
- Architecture clarifications

### Phase 3: MCP Tool Enhancements

Create IDE-specific MCP tools:

- `save_workflow_turn` - Save analysis for synthesis
- `synthesize_turns` - Synthesize multiple turns
- `context_search` - Semantic context discovery
- `workflow_run` - Execute workflows

## Workflow Patterns for Cursor

### Save & Synthesize Pattern

```bash
# Step 1: Initialize session
mkdir -p tmp/
lev checkpoint --new "analyzing <topic>"

# Step 2: Save each turn
echo "## Turn 1: Analysis
<content>
" > tmp/turn-1.md

# Step 3: Synthesize
lev workflow run document-synthesis --input "tmp/turn-*.md"

# Step 4: Validate (optional)
lev workflow run cognitive-parliament --input tmp/synthesis.md
```

### Context Discovery Pattern

```bash
# Search semantically
lev context search "synthesis"
lev context search "decision making"

# Apply contexts
lev context apply echo-intelligence-patterns
lev context apply design-thinking-process
```

### Power Combo Pattern

```bash
# Parallel analysis
lev context apply echo-intelligence-patterns > tmp/echo.md &
lev context apply first-principles-thinking > tmp/principles.md &
lev context apply systems-thinking > tmp/systems.md &
wait

# Synthesize all
lev workflow run document-synthesis --input "tmp/*.md"
```

## Implementation Checklist

- [ ] Update `_02-adapters.md` with composite adapter pattern
- [ ] Create `agent/docs/architecture/hexagonal-ide-integration.md`
- [ ] Update `.cursor/rules/javascript-agent-development.mdc`
- [ ] Create `.cursor/rules/ide-integration-patterns.mdc`
- [ ] Simplify root `.cursorrules`
- [ ] Update plugin development guide with IDE context
- [ ] Add IDE integration to testing framework docs

## Benefits

1. **Clear Terminology**: Everyone understands adapter relationships
2. **Better Integration**: IDEs know how to interact with the system
3. **Workflow Support**: Natural patterns for multi-turn analysis
4. **Extensibility**: Easy to add new IDE integrations

# Cursor-Leviathan Integration Testing Guide

## Overview

Testing the Cursor-Leviathan integration requires understanding that Cursor acts as a **composite adapter** - it translates natural language commands into Lev CLI executions through MDC rules.

## Testing Approach: Playwright with Electron

Since Spectron was deprecated in 2022, Playwright now has direct Electron support and is the recommended approach for testing Electron apps like Cursor.

### Why This Approach Works

1. **Direct Electron testing** - No proxy tools or MCP complexity needed
2. **Real browser environment** - Tests actual Cursor behavior
3. **Fast feedback** - Can run locally during development
4. **CI/CD friendly** - Works in GitHub Actions
5. **No flakiness** - Deterministic test flow

## Composite Adapter Architecture

```
User Input (Natural Language)
    ↓
Cursor MDC Rules (.cursor/rules/commands/*.mdc)
    ↓
Pattern Matching & Command Extraction
    ↓
Terminal Execution (lev CLI)
    ↓
Output & Side Effects
```

## Test Implementation

### Basic Test Structure

```javascript
// test-cursor-lev-integration.spec.js
const { test, expect, _electron: electron } = require('@playwright/test')
const path = require('path')

test.describe('Cursor Lev Integration', () => {
  let electronApp
  let window

  test.beforeEach(async () => {
    // Launch Cursor as an Electron app
    electronApp = await electron.launch({
      args: ['/Applications/Cursor.app/Contents/MacOS/Cursor'],
    })
    window = await electronApp.firstWindow()
  })

  test('natural language "checkpoint" triggers lev checkpoint', async () => {
    // Open terminal in Cursor
    await window.keyboard.press('Control+`')

    // Type natural language command
    await window.keyboard.type('checkpoint the current state')
    await window.keyboard.press('Enter')

    // Wait for and verify terminal output
    await expect(window.locator('.terminal')).toContainText('lev checkpoint')
  })

  test('find command with context', async () => {
    // Type in editor
    await window.keyboard.type('find all references to semantic-lookup')
    await window.keyboard.press('Enter')

    // Verify lev find command executed
    await expect(window.locator('.terminal')).toContainText('lev find "semantic-lookup"')
  })

  test.afterEach(async () => {
    await electronApp.close()
  })
})
```

### Test Directory Structure

```bash
tests/
├── cursor-integration/
│   ├── commands.spec.js      # Test natural language → CLI mapping
│   ├── mdc-rules.spec.js     # Test MDC rule activation
│   ├── workflows.spec.js     # Test complete user workflows
│   └── edge-cases.spec.js    # Test error handling & edge cases
└── playwright.config.js
```

## Key Testing Points

### 1. Natural Language → Command Translation

Test that various phrasings map to the correct CLI command:

```javascript
test.describe('Natural language variations', () => {
  const testCases = [
    { input: 'checkpoint this', expected: 'lev checkpoint' },
    { input: 'save a checkpoint', expected: 'lev checkpoint' },
    { input: 'create checkpoint now', expected: 'lev checkpoint' },
    { input: 'find references to API', expected: 'lev find "API"' },
    { input: 'search for user authentication', expected: 'lev find "user authentication"' },
  ]

  testCases.forEach(({ input, expected }) => {
    test(`"${input}" executes "${expected}"`, async () => {
      await window.keyboard.type(input)
      await window.keyboard.press('Enter')
      await expect(window.locator('.terminal')).toContainText(expected)
    })
  })
})
```

### 2. MDC Rule Activation

Test that MDC rules are properly loaded and activated:

```javascript
test('MDC rules are loaded from .cursor/rules/commands/', async () => {
  // Verify rule files exist and are recognized
  const rulesDir = '.cursor/rules/commands/'
  const expectedRules = ['checkpoint.mdc', 'find.mdc', 'intake.mdc', 'research.mdc']

  // Test each rule activates correctly
  for (const rule of expectedRules) {
    // Implementation depends on how Cursor exposes rule status
  }
})
```

### 3. Terminal Integration

Test that commands execute in the correct terminal context:

```javascript
test('commands execute in project directory', async () => {
  // Change to project directory
  await window.keyboard.type('cd ~/lev/agent')
  await window.keyboard.press('Enter')

  // Execute lev command
  await window.keyboard.type('check system health')
  await window.keyboard.press('Enter')

  // Verify execution context
  await expect(window.locator('.terminal')).toContainText('lev sitrep')
  await expect(window.locator('.terminal')).toContainText('/Users/jean-patricksmith/lev/agent')
})
```

## Composite Adapter Benefits

1. **Separation of Concerns**

   - Cursor handles natural language processing
   - Lev handles actual functionality
   - Clean interface between the two

2. **Maintainability**

   - MDC rules are simple to update
   - No duplicate logic between systems
   - Changes to Lev don't break Cursor integration

3. **Testability**
   - Can test MDC rule matching independently
   - Can test CLI execution independently
   - Integration tests verify the connection

## Common Pitfalls to Avoid

1. **Don't Mock the CLI** - Test real command execution
2. **Don't Over-test** - Focus on integration points, not Lev internals
3. **Don't Test Cursor Internals** - Test observable behavior only
4. **Don't Ignore Edge Cases** - Test malformed input, missing commands, etc.

## CI/CD Integration

```yaml
# .github/workflows/cursor-tests.yml
name: Cursor Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install

      - name: Run Cursor integration tests
        run: npx playwright test tests/cursor-integration/

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Future Considerations

1. **Performance Testing** - Measure command execution latency
2. **Load Testing** - Multiple concurrent commands
3. **Compatibility Testing** - Different Cursor versions
4. **Accessibility Testing** - Keyboard-only navigation

## Summary

The key insight is that Cursor acts as a thin translation layer between natural language and CLI commands. Testing should focus on:

- Accurate command translation
- Proper terminal integration
- Error handling and edge cases
- User workflow completion

By using Playwright's Electron support, we get deterministic, fast, and reliable tests without the complexity of MCP or other proxy tools.
