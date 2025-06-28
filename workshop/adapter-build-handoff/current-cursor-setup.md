# Current Cursor Setup Reference

## 📁 Directory Structure

```
.cursor/
├── prompts/
│   └── intake.md                    # Intake workflow (142 lines)
├── global-rules/
│   ├── 00-lev-super-agent.md       # Main agent configuration
│   ├── 01-response-format.md       # Response formatting rules
│   ├── 02-perplexity-trigger.md    # Perplexity integration
│   ├── 03-persistent-context.md    # Context persistence
│   ├── 04-progress-tracking.md     # Progress tracking
│   ├── 05-natural-language-triggers.md
│   ├── 06-python-environment.md
│   ├── 07-package-managers.md
│   ├── 08-code-quality.md
│   ├── 09-file-operations.md
│   ├── 10-git-workflow.md
│   ├── 11-research-workflow.md
│   ├── 12-validation-mindset.md
│   ├── 13-search-context.md
│   ├── 14-leviathan-integration.md
│   ├── 15-quick-commands.md
│   └── 00-index.md                 # Rule index
├── project-types/
├── rules/
├── index.mdc                        # Main index (334 lines)
├── test-commands.md                 # Test documentation
├── README.md                        # Setup guide (137 lines)
└── setup-cursor-kingly.sh          # Setup script (47 lines)
```

## 📝 Key Files Overview

### `/prompts/intake.md`

- Universal content intake system
- Handles GitHub repos, YouTube videos, articles
- 3-phase process: Acquisition → Analysis → Post-processing
- Demonstrates workflow adaptation pattern

### `/global-rules/00-lev-super-agent.md`

- Core agent behavior configuration
- Integration with Leviathan commands
- Natural language → CLI mappings

### Command Mappings (from various rules)

- "checkpoint" → `lev checkpoint`
- "find X" → `lev find "X"`
- "intake URL" → `lev intake <url>`
- "perp"/"perp this" → Perplexity integration
- "validate" → `lev validate`

## 🔧 Integration Patterns

### 1. Natural Language Triggers

- Semantic conditions: `when_semantic: "user seems frustrated"`
- Command shortcuts and aliases
- Context-aware responses

### 2. File Operation Rules

- NEVER create files unless requested
- ALWAYS prefer editing existing files
- Document file creation decisions

### 3. Git Workflow

- Auto-commit on significant changes
- Semantic commit messages
- Branch strategy defined

### 4. Response Format

- ≤6 lines unless detail requested
- Actionable follow-ups
- Encouraging tone

## 🎯 Current Limitations

1. **Manual Process** - No automated generation from ~/c
2. **No Versioning** - Changes in ~/c don't propagate
3. **Platform Lock-in** - Optimized only for Claude/Cursor
4. **Static Rules** - Can't dynamically load new patterns

## 💡 What Works Well

1. **Modular Structure** - Each rule in separate file
2. **Priority System** - Numbered files for ordering
3. **Clear Patterns** - intake.md shows adaptation model
4. **Integration Points** - Natural language → CLI works smoothly

---

_This represents the current state before implementing the adapter build system. The new system will automate the generation and maintenance of these files from the universal contexts in ~/c._
