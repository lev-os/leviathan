# @lev-os/prime: Universal Prime Context Loading

**Package**: `@lev-os/prime`  
**Type**: Core system plugin  
**Purpose**: Universal LLM context loading and system orientation

## Mission: Universal LLM Context Loading

**Purpose**: Orient ANY LLM to Leviathan system architecture and available capabilities, regardless of their PM system or workflow preferences.

**Not Included**: Personal workflows, specific PM patterns, or workflow automation (those belong in Claude commands or personal plugins).

## Constitutional Framework Loading ✅

**Core Architecture Principles**:

- **"Adapters Route, Core Computes"** - Hexagonal architecture with domain separation
- **"Fast Iteration → Lock Down When Working"** - Testing philosophy
- **"Linux of AI"** - Extensible, universal design that works for everyone

**Reference Material Loading**:

```javascript
const constitutionalFramework = await loadReferenceFiles([
  'ai/coding-guide.md', // Development standards and patterns
  'ai/patterns.md', // Architectural patterns and practices
  'ai/rules.md', // System rules and constraints
  '_prime.md', // This constitutional framework
  '_whisper.md', // Whisper system specification
])
```

## Universal Project Orientation

### Visual Structure Discovery

```bash
# Project tree visualization (with fallbacks for different systems)
eza . --tree --level 3 --git-ignore || tree -L 3 -I 'node_modules|.git' || find . -type d -not -path '*/.*' | head -20
```

### Capability Discovery

```javascript
async function discoverSystemCapabilities() {
  return {
    commands: await scanAvailableCommands(),
    plugins: await scanPluginDirectory(),
    contexts: await scanContextDirectory(),
    documentation: await scanDocsStructure(),
    architecture: await detectProjectType(),
  }
}
```

## Prime Command Implementation (Universal)

```javascript
// src/commands/prime.js
export async function primeAgent(args, { fileLoader, contextManager, checkpointCore, projectScanner }) {
  // 1. Load constitutional framework
  const framework = await loadConstitutionalFramework(fileLoader)

  // 2. Discover system capabilities
  const capabilities = await discoverSystemCapabilities(projectScanner)

  // 3. Project structure visualization
  const projectStructure = await getProjectVisualization()

  // 4. Check for existing sessions
  const existingSessions = await checkpointCore.listSessions()

  if (existingSessions.length > 0) {
    // Resume existing session with enhanced context
    const resumeData = await checkpointCore.resumeSession()
    await contextManager.enhanceContext({
      constitutional_framework: framework,
      system_capabilities: capabilities,
      project_structure: projectStructure,
    })

    return formatResumeResponse(resumeData, capabilities)
  } else {
    // Create new session with universal baseline
    const checkpoint = await checkpointCore.createCheckpoint(
      'Prime universal context loaded - session baseline established',
      framework.loadedFiles,
      'new',
      null,
      {
        constitutional_framework: framework,
        system_capabilities: capabilities,
        session_type: 'universal_prime',
      }
    )

    return formatUniversalPrimeResponse(framework, capabilities, checkpoint)
  }
}

// Metadata for auto-discovery
primeAgent.description = 'Universal LLM context loading and system orientation'
primeAgent.inputSchema = {
  type: 'object',
  properties: {
    force_new: {
      type: 'boolean',
      description: 'Force new session even if existing sessions found',
    },
  },
}

export const primeAgentTool = {
  name: 'prime_agent',
  description: primeAgent.description,
  inputSchema: primeAgent.inputSchema,
  handler: primeAgent,
}
```

## Prime Response Format

### New Session Response

```markdown
🧠 **Constitutional Framework Loaded**
**Architecture**: Hexagonal (Adapters Route, Core Computes)
**Reference Material**: coding-guide.md, patterns.md, rules.md
**Capabilities**: {command_count} commands, {plugin_count} plugins, {context_count} contexts

📁 **Project Structure**
{project_tree_visualization}

🎯 **Session Created**
**Checkpoint**: universal-baseline-{timestamp}
**Status**: Ready for work with full system context
```

### Resume Session Response

```markdown
🔄 **Session Resumed**
**Session ID**: {session_id}
**Previous Context**: {previous_work_summary}
**Enhanced**: Constitutional framework and capabilities refreshed

📁 **Current Project State**
{project_tree_visualization}

✅ **Ready**: Full context restored with universal enhancements
```

## Universal Prime Whisper

```yaml
whisper:
  'Universal Context Loading':
    content: 'Constitutional framework and system capabilities loaded for any LLM'

  'System Architecture':
    - 'Hexagonal: Adapters route, core computes'
    - 'Extensible: Plugin system for custom functionality'
    - 'Universal: Works with any PM system or workflow'

  'Available Capabilities':
    content: 'Commands: {command_count}, Plugins: {plugin_count}, Contexts: {context_count}'

  'Foreign LLM Orientation':
    rotate:
      - 'Unfamiliar with system? Check ai/coding-guide.md for development standards'
      - "Need command reference? Run 'lev help' for complete command listing"
      - "Want to explore? Run 'lev find --all' to discover available contexts"
    frequency: session_start

  'Session Management':
    content: "Use 'lev checkpoint' for session continuity across tabs and handoffs"
    frequency: every_3rd
```

## Architecture Constraints Loaded ✅

### Command Registry Auto-Bootstrap Pattern

- **Single Source of Truth**: src/core/command-registry.js discovers all commands
- **MCP Auto-Generation**: Tools created automatically from command metadata
- **Plugin Namespace**: `lev <plugin> <command>` pattern for community extensions

### Domain Separation Rules

- **Core Commands**: Pure business logic in src/commands/ with dependency injection
- **Adapters**: Protocol routing only (CLI, MCP) - NO business logic
- **Anti-Pattern**: God objects, mixed concerns, business logic in adapters

### Hexagonal Architecture

```
External Adapters (CLI, MCP, API) → Command Registry → Core Business Logic
```

## Testing Strategy ✅

### Universal Test Commands

- `npm run test:agent` - Core + adapters
- `npm run test:plugins` - Plugin validation
- `npm run test:e2e` - Full integration
- `npm run test:all` - Complete validation

## Success Criteria

**Universal Compatibility**:

- ✅ Works with ANY LLM (Claude, GPT-4, Gemini, local models)
- ✅ Works with ANY PM system (your workflow, GTD, PARA, custom)
- ✅ Works with ANY project structure

**Context Loading**:

- ✅ Constitutional framework loaded and understood
- ✅ System capabilities discovered and available
- ✅ Project structure visualized and oriented
- ✅ Session continuity enabled

**Clean Separation**:

- ✅ No workflow assumptions or automation
- ✅ No personal PM pattern dependencies
- ✅ Pure universal system orientation

_Universal Prime context loading complete - ready for any LLM to work effectively_
