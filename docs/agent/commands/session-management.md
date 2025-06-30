# Session Management Commands

## Overview

Leviathan provides comprehensive session management for multi-tab workflows and LLM handoffs. The core commands enable context preservation, session continuity, and efficient coordination across different AI agents.

## Core Commands

### lev prime

**Purpose**: Universal LLM context loading and system orientation

**Usage**:
```bash
lev prime                    # Load constitutional framework and orient to project
lev prime --force-new        # Force new session even if existing sessions found
```

**What It Does**:
1. Loads constitutional framework (ai/coding-guide.md, ai/patterns.md, ai/rules.md)
2. Discovers system capabilities (commands, plugins, contexts)
3. Visualizes project structure for orientation
4. Either resumes existing session or creates new baseline checkpoint

**When to Use**:
- Starting a fresh LLM session
- After context compaction or handoffs
- When foreign LLM needs system orientation
- Multi-tab coordination initialization

### lev checkpoint

**Purpose**: Session state management and continuity

**Usage**:
```bash
lev checkpoint "progress description"           # Create progress checkpoint
lev checkpoint --new "session description"     # Start new session
lev checkpoint --resume                         # Resume latest session
lev checkpoint --resume --session=<id>         # Resume specific session
lev checkpoint --final --session=<id>          # Finalize session with rollup
```

**Checkpoint Types**:
- **Progress** - Regular work milestones during active development
- **New** - Session initialization with fresh context
- **Resume** - Load previous session state and timeline
- **Final** - Session completion with comprehensive rollup

**Session Data**:
- Context description and work progression
- Active files and their relationships
- Session timeline and major milestones
- Cross-session continuity information

### lev find

**Purpose**: Context discovery and navigation

**Usage**:
```bash
lev find "query"                    # Semantic search for contexts
lev find --all                      # List all available contexts
lev find --type=workflows           # Filter by context type
lev find agent.endpoint             # Direct agent loading
```

**Context Types**:
- **Workflows** - Multi-step processes and patterns
- **Agents** - Specialized AI agents for specific tasks
- **Patterns** - Reusable architectural patterns
- **Tools** - Utility functions and helpers

## Session Architecture

### Session Lifecycle

```
1. Initialize    → lev prime (context loading)
2. Work         → lev checkpoint (progress tracking)
3. Coordinate   → lev find (context discovery)
4. Handoff      → lev checkpoint --final (session rollup)
5. Resume       → lev checkpoint --resume (continuity)
```

### Session Storage

Sessions are stored in `~/.leviathan/`:

```
~/.leviathan/
├── sessions/                    # Session metadata and timelines
│   ├── 2024-06-18-session-abc123.yaml
│   └── 2024-06-18-session-def456.yaml
├── checkpoints/                 # Individual checkpoint data
│   ├── checkpoint-timestamp-1.yaml
│   └── checkpoint-timestamp-2.yaml
└── rollups/                    # Session completion summaries
    ├── 2024-06-18-session-abc123-rollup.yaml
    └── 2024-06-18-session-def456-rollup.yaml
```

### Session Data Structure

```yaml
# Session metadata
session:
  id: "2024-06-18-session-abc123"
  created_at: 1718712000000
  last_activity: 1718718000000
  status: "active"
  workspace: "leviathan"
  checkpoints: ["checkpoint-1", "checkpoint-2"]
  context:
    constitutional_framework: ["coding-guide.md", "patterns.md"]
    active_files: ["src/commands/prime.js", "_whisper.md"]
    work_progression: "Session management implementation"
```

## Multi-Tab Coordination

### Session Handoff Pattern

**Between LLM Instances**:
1. **Current LLM**: Creates final checkpoint with context summary
2. **Session Storage**: Preserves state in ~/.leviathan/sessions/
3. **New LLM**: Runs `lev prime` → detects existing session → resumes context

**Handoff Data**:
- Work progression and current state
- Active files and their modifications
- Architectural context and constraints
- Next steps and outstanding items

### Parallel Development

**Git Worktree Integration**:
```bash
# Each tab can work in isolated git worktrees
git worktree add -b feature-branch-1 ./trees/feature-1
git worktree add -b feature-branch-2 ./trees/feature-2

# Each worktree maintains its own session
cd ./trees/feature-1 && lev checkpoint --new "feature 1 development"
cd ./trees/feature-2 && lev checkpoint --new "feature 2 development"
```

**Session Coordination**:
- Independent sessions per worktree
- Cross-reference through session rollups
- Merge coordination through checkpoint summaries

## Foreign LLM Integration

### Universal Onboarding

**Standard Flow for Any LLM**:
```bash
1. lev prime                     # Universal context loading
2. lev help                      # Command reference
3. lev find --all               # Discover available contexts
4. lev checkpoint --new "..."   # Begin governed session
```

**Self-Teaching Components**:
- **Constitutional Framework** - Loaded by `lev prime`
- **Command Reference** - Available through `lev help`
- **Context Discovery** - Enabled by `lev find`
- **Session Governance** - Managed by `lev checkpoint`

### Context Preservation

**What Gets Preserved**:
- Architectural patterns and constraints
- Active work context and file relationships
- Session timeline and major decisions
- Cross-session learning and insights

**What Doesn't**:
- LLM-specific adapter state
- Runtime memory or conversation history
- Temporary computation results

## Best Practices

### Session Naming

**Descriptive Context**:
```bash
# Good examples
lev checkpoint "whisper system implementation complete"
lev checkpoint --new "foreign LLM integration testing"
lev checkpoint "ADR-0123 architectural decision finalized"

# Poor examples  
lev checkpoint "progress"
lev checkpoint --new "work"
lev checkpoint "checkpoint"
```

### Checkpoint Frequency

**When to Checkpoint**:
- ✅ **Major milestones** - Feature completion, architectural decisions
- ✅ **Context switches** - Changing focus areas or switching between tasks
- ✅ **Handoff points** - Before switching tabs or ending sessions
- ✅ **Decision points** - After making significant architectural choices

**When NOT to Checkpoint**:
- ❌ **Every minor change** - Over-checkpointing creates noise
- ❌ **Experimental work** - Unless experiment yields significant insights
- ❌ **Incomplete thoughts** - Wait until ideas are sufficiently developed

### Session Hygiene

**Regular Maintenance**:
```bash
# Review active sessions
lev sessions list

# Clean up completed sessions
lev sessions archive --older-than=30-days

# Validate session integrity
lev sessions validate
```

**Session Organization**:
- One session per major feature or architectural initiative
- Clear session boundaries for different work streams
- Regular rollups for long-running sessions

## Advanced Patterns

### Session Templating

**Project-Specific Templates**:
```yaml
# .leviathan/templates/session-template.yaml
template:
  constitutional_framework: ["ai/coding-guide.md", "ai/patterns.md"]
  default_contexts: ["architecture-review", "implementation-planning"]
  checkpoint_frequency: "major-milestones"
  rollup_triggers: ["adr-creation", "feature-completion"]
```

### Cross-Project Sessions

**Multi-Project Coordination**:
```bash
# Project A session
cd /project-a && lev checkpoint --tag="cross-project-feature"

# Project B session references Project A
cd /project-b && lev checkpoint --reference="project-a:session-id"
```

### Automated Session Management

**Trigger-Based Checkpointing**:
```yaml
# .leviathan/automation/session-triggers.yaml
triggers:
  git_commit: "auto-checkpoint"
  adr_creation: "mandatory-checkpoint"
  test_completion: "milestone-checkpoint"
```

## Troubleshooting

### Common Issues

**Session Not Found**:
```bash
# Check available sessions
lev sessions list

# Verify session storage
ls ~/.leviathan/sessions/

# Create new session if needed
lev checkpoint --new "recovery session"
```

**Context Loading Failures**:
```bash
# Validate constitutional framework files
lev prime --validate

# Check file permissions
ls -la ai/*.md

# Force reload context
lev prime --force-reload
```

**Checkpoint Corruption**:
```bash
# Validate checkpoint integrity
lev checkpoint --validate --session=<id>

# Repair session from previous checkpoint
lev checkpoint --repair --session=<id>

# Last resort: create new session
lev checkpoint --new "recovery from corruption"
```

### Performance Issues

**Large Session History**:
```bash
# Compress old checkpoints
lev sessions compress --older-than=7-days

# Archive completed sessions
lev sessions archive --status=completed

# Clean up orphaned checkpoints
lev sessions cleanup --orphaned
```

## Integration with Other Systems

### Git Integration

```bash
# Checkpoint on significant commits
git commit -m "Feature complete" && lev checkpoint "$(git log -1 --oneline)"

# Session per branch
git checkout -b feature-branch && lev checkpoint --new "$(git branch --show-current)"
```

### CI/CD Integration

```bash
# Checkpoint before deployment
lev checkpoint "pre-deployment validation complete"

# Session rollup after release
lev checkpoint --final --session=$BUILD_SESSION_ID
```

### Documentation Generation

```bash
# Generate session summary for documentation
lev sessions export --format=markdown --session=<id> > docs/session-summary.md

# Create ADR from session rollup
lev sessions to-adr --session=<id> --output=docs/adrs/
```