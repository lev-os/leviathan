# Leviathan Adapter Build System - Implementation Handoff

## 🎯 Mission

Create a core package `@lev-os/adapter-builder` that transforms universal contexts from `~/c` (FlowMind) into platform-specific adapters for various AI coding assistants and CLIs.

## 🏗️ Architecture Vision

### Universal Context Distribution System

```
~/c (FlowMind Central Repository)
├── prompts/          # Universal prompts
├── patterns/         # Framework patterns (porter-five-forces, etc.)
├── workflows/        # Multi-step processes (cognitive-parliament, etc.)
├── agents/           # Agent personalities (eeps framework)
└── build.yaml        # Build configuration

     ↓ BUILD PROCESS (New Core Package) ↓

~/lev/adapters/
├── claude-code/      # Cursor/Claude optimized (.cursor/rules/)
├── gemini-cli/       # Gemini CLI optimized
├── vscode/           # VSCode extension
├── cline/            # Cline integration
└── web/              # Future web UI
```

## 📦 Core Package Requirements

### Package: `@lev-os/adapter-builder`

**Location**: `~/lev/packages/adapter-builder/`

**Core Functionality**:

1. **Context Loading** - Parse and load all contexts from ~/c
2. **Platform Templates** - Template system for each adapter type
3. **Transformation Pipeline** - Convert universal contexts to platform formats
4. **Build Commands** - CLI commands for building adapters
5. **Hot Reload** - Watch mode for development

### Key Components to Build

```javascript
// src/index.js - Main adapter builder
export class AdapterBuilder {
  async loadContexts(sourcePath = '~/c')
  async buildAdapter(platform, options)
  async buildAllAdapters()
  async watch(platform)
}

// src/transformers/claude-code.js
export class ClaudeCodeTransformer {
  async transformPatterns(patterns) // → .cursor/rules/
  async transformWorkflows(workflows) // → .cursor/prompts/
  async optimizeForClaude(content) // Token optimization
}

// src/transformers/gemini-cli.js
export class GeminiTransformer {
  async transformForGemini(contexts)
  async adjustTokenLimits(content)
  async generateGeminiCommands(workflows)
}
```

## 🔄 Current Claude/Cursor Integration Details

### Existing Setup in ~/.claude

```
.cursor/
├── prompts/
│   └── intake.md         # Example of adapted workflow
├── global-rules/         # Current rule structure
│   ├── 00-lev-super-agent.md
│   ├── 01-response-format.md
│   └── ... (17 rules total)
└── project-types/
```

### Key Patterns from Current Integration

1. **Intake Pattern** (`.cursor/prompts/intake.md`)

   - 3-phase process: Acquisition → Analysis → Post-processing
   - URL routing (GitHub, YouTube, Articles)
   - Handoff to workshop files

2. **Global Rules Structure**

   - Modular rules in separate files
   - Priority ordering (00-, 01-, etc.)
   - Mix of behavioral and integration rules

3. **Commands Mapped**
   - Natural language → CLI mapping
   - "checkpoint" → `lev checkpoint`
   - "find X" → `lev find "X"`
   - "intake URL" → `lev intake <url>`

## 🎨 Transformation Examples

### Pattern: `~/c/patterns/first-principles-thinking/`

**Transforms to:**

- **Claude Code**: `.cursor/rules/patterns/first-principles-thinking.md`
- **Gemini CLI**: `gemini-patterns/first-principles.yaml`
- **VSCode**: `extensions/patterns/firstPrinciples.ts`

### Workflow: `~/c/workflows/cognitive-parliament/`

**Transforms to:**

- **Claude Code**: `.cursor/prompts/cognitive-parliament.md`
- **Gemini CLI**: `gemini-flows/cognitive-parliament.yaml`
- **MCP Tool**: Auto-registered as `cognitive_parliament`

## 🛠️ Implementation Plan

### Phase 1: Core Infrastructure

1. Create package structure
2. Implement context loader
3. Build transformation pipeline
4. Add platform templates

### Phase 2: Platform Adapters

1. **Claude Code Adapter** (Priority 1)
   - Transform patterns → cursor rules
   - Transform workflows → cursor prompts
   - Optimize for Claude's context window
2. **Gemini CLI Adapter** (Priority 2)
   - Adjust for Gemini's formatting
   - Handle token limit differences
   - Generate CLI-specific commands

### Phase 3: Integration

1. Add build commands to Lev CLI
2. Create watch mode for development
3. Add adapter testing framework
4. Document adapter creation

## 📋 Technical Specifications

### Plugin Configuration (`plugin.yaml`)

```yaml
plugin:
  name: adapter-builder
  version: 1.0.0
  type: core_plugin
  description: 'Universal context to platform adapter build system'
  namespace: adapters

capabilities:
  - context_loading
  - platform_transformation
  - adapter_generation
  - hot_reload
  - template_management

commands:
  build:
    syntax: 'lev adapters build [platform] [options]'
    description: 'Build platform-specific adapters from universal contexts'

  watch:
    syntax: 'lev adapters watch <platform>'
    description: 'Watch mode for adapter development'

  list:
    syntax: 'lev adapters list'
    description: 'List available adapter platforms'
```

### Dependencies

- `js-yaml` - YAML parsing
- `glob` - File discovery
- `chokidar` - File watching
- `@lev-os/core` - Core utilities
- `@lev-os/debug` - Universal debugging

## 🎯 Success Criteria

1. **Zero Duplication** - Single source of truth in ~/c
2. **Platform Optimization** - Each adapter optimized for its platform
3. **Automatic Updates** - Changes in ~/c propagate to all adapters
4. **Developer Experience** - Simple commands, hot reload, clear errors
5. **Extensibility** - Easy to add new platforms

## 📝 Key Insights from Discussion

1. **Composite Adapter Pattern** - Platforms like Claude Code act as adapters that use other adapters (MCP)
2. **YAML-First Philosophy** - Configuration drives behavior across the system
3. **LLM-First Reasoning** - Use AI reasoning instead of pattern matching
4. **Universal Command Registry** - Commands defined once, exposed everywhere
5. **Prompt as Software** - Treat prompts as versioned, buildable artifacts

## 🚀 Next Steps for Leviathan Agent

1. **Review** this handoff and the current ~/.claude setup
2. **Create** the core package structure in ~/lev/packages/adapter-builder/
3. **Implement** the transformation pipeline starting with Claude Code
4. **Test** with existing intake.md as reference implementation
5. **Expand** to Gemini CLI as second platform
6. **Document** the adapter creation process for community

## 📎 Additional Context Files

Please also review:

- `~/.claude/.cursor/prompts/intake.md` - Example adapted workflow
- `~/lev/_cursor.md` - Cursor integration architecture
- `~/lev/_02-adapters.md` - Adapter auto-bootstrap pattern
- `~/c/INDEX.md` - FlowMind context structure

---

_This handoff prepared from conversation between user and Claude about creating a universal adapter build system for AI coding assistants. The goal is to maintain a single source of truth in ~/c while optimizing delivery for each platform._
