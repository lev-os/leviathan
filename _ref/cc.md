# Claude Code Commands & Hooks Reference

## Commands Documentation

### Custom Slash Commands
Store prompt templates in Markdown files within the `.claude/commands` folder. Define slash commands in `.claude/commands` Create files in the `.claude/commands` directory (either in your project root or your global `~/.claude/` directory).

#### Using Arguments in Commands
Custom slash commands can include the special keyword `$ARGUMENTS` to pass parameters from command invocation. 

Example: `/project:fix-github-issue 1234` to have Claude fix issue #1234.

### Key Built-in Commands
- `/clear` - Clear conversation context (call more often for predictable behavior)
- `/compact` - Manually compact context when window gets full
- `/hooks` - Configure hooks in interactive REPL

## Hooks Configuration

### Core Functionality
Claude Code hooks are user-defined shell commands that execute automatically at specific points in Claude Code's lifecycle. They provide deterministic control over Claude Code's behavior.

### Key Use Cases
- **Notifications**: Customize how you get notified when Claude Code is awaiting input
- **Automatic formatting**: Run prettier on .ts files, gofmt on .go files after every file edit
- **Logging**: Track and count all executed commands for compliance or debugging  
- **Feedback**: Provide automated feedback when Claude produces non-conformant code
- **Custom permissions**: Block modifications to production files or sensitive directories

### Configuration Process
1. Run `/hooks` command in interactive REPL
2. Select trigger event (e.g., PreToolUse)
3. Define matching conditions (e.g., bash tool calls only)
4. Define shell command to execute

### Storage Locations
- Global settings: `~/.claude/settings.json`
- Project settings: `.claude/settings.json` (shareable with teams)

### Environment Variables
Rich support for environment variables in hook commands:
- `$CLAUDE_FILE_PATHS` - Related file paths
- Custom environment variables for dynamic behavior

### MCP Integration
MCP tools follow pattern: `mcp__<server>__<tool>`
Example: `mcp__memory__create_entities` - Memory server's create entities tool

### Security Considerations
Hooks can execute any shell command - validate input and paths carefully to avoid security risks.

### Debugging
Use `claude --debug` to debug your hooks.

## Best Practices
- Call `/clear` more often as AI agents become unpredictable with longer conversations
- Commit changes after every significant modification for easy rollback
- Use `/compact` at natural breakpoints when context window gets full
- Store custom workflows as slash commands for repeated use

## Sources
- Official docs: https://docs.anthropic.com/en/docs/claude-code/hooks
- Best practices: https://www.anthropic.com/engineering/claude-code-best-practices
- Community resources: https://github.com/hesreallyhim/awesome-claude-code