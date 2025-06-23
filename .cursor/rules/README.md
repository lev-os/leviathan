# Leviathan Cursor Rules System

This directory contains conditional rules for the Leviathan project using Cursor's MDC (Metadata + Content) format. These rules provide context-aware guidance based on what you're working on.

## Rule Types

### 1. **global-architecture.mdc** (Always Applied)

- Core principles that apply to the entire codebase
- LLM-first philosophy, extensibility patterns, session management
- Always included in AI context

### 2. **javascript-agent-development.mdc** (Auto-Attached)

- Applies when working on JavaScript files in `agent/` directory
- Hexagonal architecture patterns, MCP server development
- Command pattern with pure business logic
- Auto-discovery and bi-directional MCP tools

### 3. **go-kernel-development.mdc** (Auto-Attached)

- Applies when working on Go files in `os/kernel/` directory
- AI-native OS patterns, cognitive parliament, JEPA 2 integration
- Multi-provider LLM routing patterns

### 4. **flowmind-bidirectional-workflows.mdc** (Auto-Attached)

- Applies to `agent/` and `plugins/` JavaScript files
- **FlowMind**: A pattern from `_ref/mcp-ceo` we're implementing
- Bi-directional MCP communication patterns
- Mastra-inspired workflow control flow (.step(), .then(), .after(), .suspend(), .resume())
- Focus on LLM as runtime, context switching for emergent intelligence

### 5. **plugin-development.mdc** (Auto-Attached)

- Applies when working in `plugins/@lev-os/` directory
- Plugin standards, namespace requirements (`@lev-os/` mandatory)
- Testing patterns with CLI/MCP consistency
- Auto-bootstrap command pattern

### 6. **web-integration-patterns.mdc** (Auto-Attached)

- Applies when working on web apps or integration files
- Browser automation with browser-use
- Vercel AI SDK and CopilotKit integration patterns
- Chat UI components and streaming

## Key Concepts

### Agent System

- **MCP Server**: Core agent with 20+ tools for workflow execution, session management
- **Hexagonal Architecture**: Strict separation of business logic (commands) and adapters
- **Auto-Discovery**: Commands automatically become available as CLI and MCP tools

### Plugin Ecosystem

- **Namespace**: All plugins use `@lev-os/` (not @lev/ or @leviathan/)
- **Structure**: Standardized directory layout with YAML-first configuration
- **Testing**: Mandatory CLI/MCP adapter consistency tests

### FlowMind Pattern (In Development)

- **Origin**: Advanced pattern from `_ref/mcp-ceo` reference implementation
- **Goal**: Enable bi-directional LLM ↔ System communication
- **Principle**: The LLM is the runtime, contexts configure its behavior
- **Implementation**: Being adapted for agent/ and plugins/ directories

## How Rules Work

1. **Always Applied**: Rules with `alwaysApply: true` are included in every AI interaction
2. **Auto-Attached**: Rules with glob patterns are automatically included when working on matching files
3. **Manual**: You can reference any rule using `@ruleName` in chat
4. **Agent Requested**: AI can request rules based on their descriptions

## Usage Examples

- When editing `agent/src/commands/example.js`, both JavaScript agent and FlowMind rules apply
- When working on `os/kernel/src/main.go`, Go kernel patterns are included
- Working on any plugin activates both plugin development and FlowMind patterns
- The global architecture rules are always present

## Migration from .cursorrules

The legacy `.cursorrules` file has been removed in favor of this more flexible system that provides:

- Context-aware rule application
- Multiple domain-specific rules
- Better organization and maintainability
- Conditional loading based on current work

## Creating New Rules

Use `Cmd + Shift + P` > "New Cursor Rule" or create a new `.mdc` file with:

```yaml
---
description: Your rule description
globs:
  - 'pattern/**/*.ext'
alwaysApply: false
---
# Rule Content
Your guidance here...
```

## Best Practices

- Keep rules focused on specific domains
- Use code examples to illustrate patterns
- Reference other files with `@filename` syntax
- Update rules as patterns evolve
- Document whether concepts are implemented or planned
