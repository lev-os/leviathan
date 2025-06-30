# Kingly MCP MVP - CLI Usage Guide

Complete guide for using the ks command-line tool for workflow intelligence and session management.

## Installation & Setup

### Prerequisites
```bash
cd /path/to/kingly/core/mcp-mvp
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Initial Cache Build
```bash
# Build embeddings cache (first time only)
npm run build:embeddings
```

### Make CLI Available
```bash
# Add to your shell PATH or create alias
alias ks="node /path/to/kingly/core/mcp-mvp/bin/kingly-semantic"
```

## Quick Start Examples

### Basic Workflow Discovery
```bash
# Find workflow by natural language
ks find "creative brainstorming"
ks find "strategic planning" 
ks find "user research methods"

# Quick code lookup (instant)
ks find 1a  # Strategic Analysis
ks find 2f  # Decision Framework
ks find 3b  # Action Planning
```

### Get Workflow Combinations
```bash
# Find related workflows
ks combos "strategic decision"
ks combos "creative problem solving"

# Get proven power combinations
ks power creative-problem-solving
ks power strategic-decision
ks power innovation-pipeline
```

### Session Management
```bash
# Create session checkpoint
ks ping --context="implemented OAuth2" --files="src/auth/oauth.js:45-120"

# Handoff to another session/tab
ks handoff --session="auth-work" --files="src/auth/" --decisions="OAuth complete,tests passing"

# Load/restore session
ks load --handoff="~/.kingly/sessions/auth-work.md"
```

## Command Reference

### 🔍 Discovery Commands

#### `find` - Semantic Workflow Search
```bash
ks find "creative brainstorming"           # Natural language search
ks find 1i                                 # Quick code lookup
ks find "strategic planning" --full        # Full details
```

**Output:**
- Workflow code and name
- Similarity percentage (for semantic search)
- Description (in full mode)
- Suggestions if no exact match

#### `list` - Browse Workflows
```bash
ks list                                    # All workflows
ks list agents                             # Just agents (1a-1j)
ks list patterns                           # Just patterns (2a-2z)
ks list workflows                          # Just workflows (3a-3z)
ks list agents --full                      # With descriptions
```

#### `categories` - Show Categories
```bash
ks categories                              # Show counts by category
```

### 🔗 Orchestration Commands

#### `combos` - Find Related Workflows
```bash
ks combos "strategic decision"             # Primary + 3 related workflows
ks combos "creative problem solving"       # Workflow relationships
```

**Output:**
- Primary workflow match
- Related workflows with strength percentages
- Reasoning for each relationship
- Usage suggestions

#### `power` - Get Power Combinations
```bash
ks power creative-problem-solving          # Proven sequence
ks power strategic-decision                # Multi-step approach
ks power innovation-pipeline               # Innovation workflows
ks power user-research                     # Research methodologies
ks power system-optimization               # Performance optimization
ks power                                   # List all available
```

**Output:**
- Sequence of workflows in order
- Support patterns and techniques
- Effectiveness percentage
- Recommended execution flow

#### `chain` - Build Workflow Chains
```bash
ks chain 2i "strategic execution"          # From start code to goal
ks chain 1a "creative solutions"           # Custom chain building
```

#### `next` - Get Next Steps
```bash
ks next 1i                                 # What follows workflow 1i?
ks next 2f                                 # Logical next steps
```

### 💾 Session Commands

#### `ping` - Create Checkpoints
```bash
ks ping --context="debugging performance" --files="src/file.js:100-150"
ks ping --context="implemented auth" --files="src/auth/,tests/auth/"
ks ping --context="architecture decision"
```

**Required:** `--context`  
**Optional:** `--files`

**Output:** JSON checkpoint with session ID and file references

#### `handoff` - Session Transfer
```bash
ks handoff --session="auth-session" --files="src/auth/,tests/auth/" --decisions="OAuth complete,refresh tokens added"
ks handoff --session="debug-work" --files="src/performance/" --decisions="identified bottleneck" --blockers="need database access"
```

**Required:** `--session`, `--files`, `--decisions`  
**Optional:** `--blockers`

**Output:** Markdown handoff document for session transfer

#### `load` - Restore Sessions
```bash
ks load                                    # Auto-detect latest
ks load --handoff="path/to/session.md"    # Specific handoff
ks load --session="session-id"            # Continue session
ks load --accept-job job-2025-06-12-abc   # Accept multi-tab job
```

**Output:** Session context and continuation instructions

### 🤝 Collaboration Commands

#### `post-job` - Create Multi-Tab Jobs
```bash
ks post-job --instructions "Analyze performance metrics" --context "Dashboard optimization" --type "analysis" --minutes 45
ks post-job --instructions "Security audit" --type "security" --minutes 120
```

**Required:** `--instructions`  
**Optional:** `--context`, `--type`, `--minutes`, `--from`

#### `complete-job` - Finish Jobs
```bash
ks complete-job job-2025-06-12-abc123 --summary "Analysis complete"
ks complete-job job-id --summary "Security audit done, 3 issues found"
```

#### `jobs` - List Job Status
```bash
ks jobs                                    # All jobs
ks jobs --status pending                  # Just pending
ks jobs --status completed                # Just completed
```

### 📈 Context Commands

#### `promote` - Elevate Local Patterns
```bash
ks promote pdf-automation                  # Promote by name
ks promote apple-aesthetic                 # Visual patterns
ks promote launch-sequence                 # Workflow sequences
```

**Requirements:**
- Context must exist in `.kingly/contexts/`
- Must pass validation criteria
- Effectiveness metrics above threshold

#### `validate` - Check Promotion Readiness
```bash
ks validate pdf-automation                 # Single context
ks validate --all                         # All local contexts
```

**Output:**
- Effectiveness scores
- Usage frequency
- Documentation completeness
- Promotion readiness status

### ⚙️ System Commands

#### `refresh` - Update Cache
```bash
ks refresh                                 # Light refresh
ks refresh --rebuild                       # Full rebuild with embeddings
```

#### `metrics` - Performance Stats
```bash
ks metrics                                 # System performance info
```

#### `help` - Documentation
```bash
ks help                                    # All commands
ks help find                               # Specific command
ks help combos                             # Command details
```

### 🧠 Natural Language Fallback

Any unrecognized command becomes a natural language query:

```bash
ks "help me with strategic planning"
ks "what workflows for creative problem solving?"
ks "find something like design thinking"
ks "show me project status"
ks "I need help with user research"
```

**CEO Orchestration Response:**
- Intent analysis and complexity assessment
- Workflow matches with similarity scores
- Execution hints and suggested actions
- Multi-tab coordination guidance
- Template suggestions

## Advanced Usage Patterns

### Workflow Discovery Flow
```bash
# 1. Explore by category
ks categories
ks list patterns

# 2. Find specific workflow
ks find "design thinking"

# 3. Get related workflows
ks combos "design thinking"

# 4. Build execution sequence
ks power creative-problem-solving

# 5. Execute with next steps
ks next 1i
```

### Session Continuity Pattern
```bash
# Tab A: Working session
ks ping --context="debugging auth issues" --files="src/auth/oauth.js"

# Major breakthrough - create handoff
ks handoff --session="auth-debug-123" --files="src/auth/" --decisions="found root cause,implemented fix"

# Tab B: Continue work
ks load --handoff="~/.kingly/sessions/auth-debug-123.md"
```

### Multi-Tab Coordination
```bash
# Manager Tab: Distribute work
ks post-job --instructions "Frontend performance audit" --type "analysis" --minutes 90
ks post-job --instructions "Backend security review" --type "security" --minutes 120

# Worker Tab A: Accept frontend job
ks load --accept-job job-frontend-abc

# Worker Tab B: Accept security job  
ks load --accept-job job-security-def

# Worker Tabs: Complete jobs
ks complete-job job-frontend-abc --summary "Performance audit complete, 5 optimizations identified"
ks complete-job job-security-def --summary "Security review done, 2 vulnerabilities found"

# Manager Tab: Check status
ks jobs
```

### Context Evolution Pattern
```bash
# Work with local context, prove effectiveness
# System automatically tracks usage

# Check promotion readiness
ks validate my-automation-tool

# If ready, promote to global
ks promote my-automation-tool

# Now available across all projects
```

## Integration with Claude Code

### MCP Server Setup
Add to Claude Code MCP settings:
```json
{
  "mcpServers": {
    "kingly-agent": {
      "command": "node",
      "args": ["/path/to/mcp-mvp/src/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

### CLAUDE.md Integration
Add to your project's CLAUDE.md:
```markdown
## KINGLY INTELLIGENCE

### Auto-Commands
- Ping on major decisions: `ks ping --context="breakthrough"`
- Handoff on session end: `ks handoff --session="id" --decisions="what was accomplished"`
- Load on session start: `ks load`

### Workflow Triggers
- /think → `ks power <detected-scenario>`
- /all → `ks "comprehensive analysis of <topic>"`
- /kingly → `ks find <context-keywords>`
```

## Troubleshooting

### Common Issues

#### "No exact match found"
```bash
# Solution: Check suggestions or try different terms
ks find "creative brainstorming"
# Look at the suggestions provided
```

#### "Context not found for promotion"
```bash
# Solution: Ensure context exists in .kingly/contexts/
ls .kingly/contexts/
ks validate --all  # Check what's available
```

#### "Job not found"
```bash
# Solution: Check job ID and status
ks jobs  # List all jobs
```

#### Cache issues
```bash
# Solution: Refresh cache
ks refresh --rebuild
```

### Performance Optimization

- Use quick codes (1a-3z) for fastest lookup
- Cache refresh only when adding new workflows
- Use `--full` flag only when you need detailed descriptions
- Batch multiple queries when possible

### Best Practices

1. **Session Management:**
   - Ping at major decision points
   - Handoff with comprehensive file lists
   - Include blockers in handoffs

2. **Workflow Discovery:**
   - Start with categories to explore
   - Use combos for comprehensive approaches
   - Try power combinations for proven sequences

3. **Context Promotion:**
   - Build effectiveness metrics before promoting
   - Document contexts thoroughly
   - Validate before promotion attempts

4. **Multi-Tab Coordination:**
   - Post jobs with clear instructions
   - Include time estimates
   - Provide comprehensive completion summaries

## File Structure Understanding

```
.kingly/
├── contexts/          # Local innovations
│   ├── tools/        # Tool contexts
│   ├── patterns/     # Pattern contexts  
│   └── workflows/    # Workflow contexts
├── jobs/             # Multi-tab coordination
└── sessions/         # Session checkpoints

~/.kingly/
└── sessions/         # Global session storage
```

## Quick Reference Card

**Discovery:** `find`, `list`, `categories`, `combos`, `power`  
**Orchestration:** `chain`, `next`, `batch`  
**Sessions:** `ping`, `handoff`, `load`  
**Collaboration:** `post-job`, `complete-job`, `jobs`  
**Context:** `promote`, `validate`  
**System:** `refresh`, `metrics`, `help`  
**Natural Language:** Any unrecognized command