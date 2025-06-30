# Kingly MCP MVP - Complete Command Reference

## Core Workflow Commands

### Workflow Discovery
```bash
# Find workflow by intent or code
ks find "creative brainstorming"     # Semantic search
ks find 1i                           # Quick code lookup
ks find "strategic planning" --full  # Full details

# List workflows by category  
ks list                               # All workflows
ks list agents                       # Just agents
ks list patterns --full              # Full descriptions

# Get workflow categories
ks categories                         # Show counts by category
```

### Workflow Combinations
```bash
# Find related workflows (combos)
ks combos "strategic decision"       # Primary + 3 related
ks combos "creative problem solving" # Workflow relationships

# Get power combinations (pre-built sequences)
ks power creative-problem-solving    # Proven workflow sequence
ks power strategic-decision          # Multi-step approach
ks power                             # List available scenarios
```

### Workflow Chaining
```bash
# Build workflow chain from start to goal
ks chain 2i "strategic execution"   # Start code → goal

# Get next workflow suggestions
ks next 1i                          # What follows workflow 1i?
ks next 2f                          # Logical next steps
```

### Batch Operations
```bash
# Multiple searches at once
ks batch "user research, creative solutions, planning"
```

## Session Management

### Session Intelligence
```bash
# Create checkpoint with context
ks ping --context="debugging performance" --files="src/file.js:100-150"

# Session handoff between tabs/sessions
ks handoff --session="session-id" --files="src/file.js,bin/cli.js" --decisions="caching implemented,batch added"

# Load/restore session context
ks load                              # Auto-detect handoff
ks load --handoff="path/to/session" # Specific handoff
ks load --session="session-id"      # Continue specific session
```

### Multi-Tab Job Coordination
```bash
# Post job for other tabs to accept
ks post-job --instructions "Analyze performance metrics" --context "Dashboard optimization" --type "analysis" --minutes 45

# Accept job in another tab  
ks load --accept-job job-2025-06-12-abc123

# Complete accepted job
ks complete-job job-2025-06-12-abc123 --summary "Analysis complete, results saved"

# List all jobs (pending/accepted/completed)
ks jobs
ks jobs --status pending
```

## Context Management

### Fractal Context Promotion
```bash
# Promote local context to global availability
ks promote pdf-automation           # Promote context by name
ks promote apple-aesthetic          # Make locally effective patterns global

# Validate contexts for promotion readiness
ks validate pdf-tool                # Check single context
ks validate --all                   # Check all local contexts
```

## System Management

### Cache & Performance
```bash
# Refresh workflow cache
ks refresh                           # Light refresh
ks refresh --rebuild                 # Full rebuild with embeddings

# System metrics
ks metrics                           # Performance stats
```

### Help System
```bash
# General help
ks help                              # All commands
ks help find                         # Specific command help
```

## Natural Language Fallback

### CEO Orchestration
```bash
# Any unrecognized command becomes natural language query
ks "help me with strategic planning"
ks "what workflows for creative problem solving?"
ks "find something like design thinking"
ks "show me project status"
```

**CEO Response includes:**
- Intent analysis and complexity assessment
- Workflow matches with similarity scores
- LLM guidance whispers (hidden system prompts)
- Execution hints and suggested actions
- Template suggestions

## Command Categories

### 🔍 Discovery Commands
- `find` - Semantic workflow search
- `list` - Browse by category
- `categories` - Show available categories
- `combos` - Find related workflows
- `power` - Get proven combinations

### 🔗 Orchestration Commands  
- `chain` - Build workflow sequences
- `next` - Get logical next steps
- `batch` - Process multiple queries

### 💾 Session Commands
- `ping` - Create checkpoints
- `handoff` - Transfer context
- `load` - Restore sessions

### 🤝 Collaboration Commands
- `post-job` - Create multi-tab jobs
- `complete-job` - Finish accepted jobs
- `jobs` - List job status

### 📈 Context Commands
- `promote` - Elevate local patterns
- `validate` - Check promotion readiness

### ⚙️ System Commands
- `refresh` - Update cache
- `metrics` - Performance stats
- `help` - Documentation

## Integration Patterns

### CLAUDE.md Auto-Commands
```markdown
## SESSION INTELLIGENCE

### Auto-Ping Triggers
- Major decisions or breakthroughs
- Architecture changes  
- Problem resolution
- Before complex operations

### Auto-Handoff Triggers  
- Session ending
- Major milestone reached
- Context switching
- User requests handoff

### CEO Orchestration
- Unknown commands → Natural language processing
- Intent analysis → Workflow recommendations
- Whisper system → LLM guidance
- Multi-tab coordination → Job distribution
```

## Storage Architecture

**Global Intelligence:** `~/.kingly/sessions/` - Cross-workspace
**Local Context:** `$PWD/.kingly/` - Project-specific  
**Job Coordination:** `.kingly/jobs/` - Multi-tab work
**Context Promotion:** `.kingly/contexts/` - Local innovations

## Advanced Features

### Whisper System
All commands include hidden "whisper" guidance for LLM context:
- Command execution hints
- Response formatting suggestions  
- Follow-up action recommendations
- Context interpretation guidance

### Fractal Context System
- Local `.kingly/` mirrors global `~/ka/` structure
- Automatic validation pipeline with Zod schemas
- LLM-powered redundancy analysis
- Intelligent boundary assessment
- Promotion workflow with lineage tracking

## Usage Examples

### Typical Workflow Discovery
```bash
# Find by intent
$ ks find "creative brainstorming"
✅ 1i - Reverse Brainstorming (0.89 match)
📝 Generate ideas by exploring opposite approaches
🎯 Similarity: 89.2%

# Get related workflows
$ ks combos "strategic decision"
🎯 Primary: 2f - Strategic Decision Framework
🔗 Combo Suggestions:
   1. 3b (complement, strength: 85%)
   2. 1a (enhance, strength: 78%)
```

### Session Handoff Example
```bash
# Create checkpoint
$ ks ping --context="implemented OAuth2 with refresh tokens" --files="src/auth/oauth.js:45-120,config/auth.yaml"

# Handoff to another session
$ ks handoff --session="auth-session-123" --files="src/auth/,tests/auth/" --decisions="OAuth2 complete,refresh tokens added,tests passing"

# Load in new session
$ ks load --handoff="~/.kingly/sessions/auth-session-123.md"
```

### Multi-Tab Job Coordination
```bash
# Tab A: Post job
$ ks post-job --instructions "Comprehensive security audit of authentication system" --type "security-analysis" --minutes 120
💼 JOB POSTED: job-2025-06-12-security-abc
📋 Other tabs can accept with: load --accept-job job-2025-06-12-security-abc

# Tab B: Accept job
$ ks load --accept-job job-2025-06-12-security-abc
💼 JOB ACCEPTED - CEO INTELLIGENCE LOADED
📋 JOB INSTRUCTIONS: Comprehensive security audit of authentication system
📁 Results Path: .kingly/jobs/job-2025-06-12-security-abc/

# Tab B: Complete job
$ ks complete-job job-2025-06-12-security-abc --summary "Security audit complete, 3 vulnerabilities found and documented"
✅ JOB COMPLETED
```

### Context Promotion Workflow
```bash
# Create local context (automatically registered)
# Work with it, prove effectiveness

# Validate readiness
$ ks validate pdf-automation
📊 Validation Results:
   Effectiveness: 8.5/10 ✅
   Usage frequency: 12 times ✅
   Documentation: Complete ✅
   ✅ Ready for promotion

# Promote to global
$ ks promote pdf-automation
✅ pdf-automation promoted to global contexts
📁 Available globally at: ~/ka/contexts/tools/pdf-automation/
```

## Error Handling

### Common Issues
```bash
# No match found
$ ks find "nonexistent workflow"
❌ No exact match for "nonexistent workflow"
💡 Suggestions:
   1. 1a - Strategic Analysis
   2. 2f - Decision Framework

# Invalid job ID
$ ks complete-job invalid-job
❌ Job invalid-job not found

# Missing context for promotion
$ ks promote missing-context
❌ Context 'missing-context' not found in .kingly/contexts/
```

## Performance Notes

- **Quick codes (1a-3z)**: ~10ms lookup
- **Semantic search**: ~200-500ms  
- **Combo discovery**: ~400-800ms
- **Power combos**: ~100ms (pre-cached)
- **Cache refresh**: ~30 seconds for full rebuild

## Required Parameters Reference

**ping:** `--context` (required), `--files` (optional)
**handoff:** `--session`, `--files`, `--decisions` (all required)
**post-job:** `--instructions` (required), others optional
**promote:** `<context-name>` (required)
**find:** `<intent-or-code>` (required)
**combos:** `<intent>` (required)