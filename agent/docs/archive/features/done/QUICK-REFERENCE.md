# Kingly MCP MVP - Quick Reference

One-page command reference for the kingly-semantic CLI tool.

## Setup
```bash
alias ks="node /path/to/kingly/core/mcp-mvp/bin/kingly-semantic"
```

## 🔍 Discovery Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks find <intent>` | Semantic search | `ks find "creative brainstorming"` |
| `ks find <code>` | Quick lookup | `ks find 1a` |
| `ks list [category]` | Browse workflows | `ks list patterns` |
| `ks categories` | Show categories | `ks categories` |

## 🔗 Orchestration Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks combos <intent>` | Related workflows | `ks combos "strategic decision"` |
| `ks power <scenario>` | Proven sequences | `ks power creative-problem-solving` |
| `ks chain <start> <goal>` | Build chain | `ks chain 2i "execution"` |
| `ks next <code>` | Next steps | `ks next 1i` |

## 💾 Session Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks ping --context="<desc>"` | Checkpoint | `ks ping --context="auth implemented"` |
| `ks handoff --session="<id>" --files="<paths>" --decisions="<summary>"` | Transfer | `ks handoff --session="auth" --files="src/auth/" --decisions="OAuth complete"` |
| `ks load` | Restore session | `ks load --handoff="path/to/session.md"` |

## 🤝 Collaboration Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks post-job --instructions="<task>"` | Create job | `ks post-job --instructions "Security audit"` |
| `ks load --accept-job <job-id>` | Accept job | `ks load --accept-job job-2025-06-12-abc` |
| `ks complete-job <job-id> --summary="<result>"` | Finish job | `ks complete-job job-abc --summary "Audit complete"` |
| `ks jobs` | List jobs | `ks jobs --status pending` |

## 📈 Context Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks promote <name>` | Elevate pattern | `ks promote pdf-automation` |
| `ks validate <name>` | Check readiness | `ks validate my-tool` |
| `ks validate --all` | Check all | `ks validate --all` |

## ⚙️ System Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ks refresh` | Update cache | `ks refresh --rebuild` |
| `ks metrics` | Performance | `ks metrics` |
| `ks help [command]` | Documentation | `ks help find` |

## 🧠 Natural Language

Any unrecognized command becomes a natural language query:
```bash
ks "help me with strategic planning"
ks "what workflows for creative work?"
ks "I need user research methods"
```

## Quick Codes Reference

### Agents (1a-1j)
- `1a` - Strategic Analysis
- `1b` - Systems Thinking  
- `1c` - Creative Director
- `1d` - User Researcher
- `1e` - Technical Architect
- `1f` - Business Analyst
- `1g` - Product Manager
- `1h` - Marketing Strategist
- `1i` - Operations Manager
- `1j` - Innovation Catalyst

### Patterns (2a-2z)
- `2a` - Problem Definition
- `2b` - Root Cause Analysis
- `2c` - Stakeholder Mapping
- `2d` - Risk Assessment
- `2e` - Resource Planning
- `2f` - Decision Framework
- `2g` - Communication Plan
- `2h` - Change Management
- `2i` - Quality Assurance
- `2j` - Performance Metrics
- `2k` - SCAMPER Framework
- `2l` - Design Thinking
- And more...

### Workflows (3a-3z)
- `3a` - Project Initiation
- `3b` - Action Planning
- `3c` - Implementation
- `3d` - Monitoring
- `3e` - Optimization
- `3f` - Documentation
- `3g` - Knowledge Transfer
- `3h` - Retrospective
- And more...

## Common Patterns

### Workflow Discovery Flow
```bash
ks categories                    # 1. Explore categories
ks find "design thinking"        # 2. Find specific workflow
ks combos "design thinking"      # 3. Get related workflows
ks power creative-problem-solving # 4. Get proven sequence
ks next 1i                      # 5. Plan next steps
```

### Session Handoff Flow
```bash
# Tab A: Working
ks ping --context="debugging auth" --files="src/auth/oauth.js"

# Tab A: Handoff
ks handoff --session="auth-work" --files="src/auth/" --decisions="fixed OAuth bug"

# Tab B: Continue
ks load --handoff="~/.kingly/sessions/auth-work.md"
```

### Multi-Tab Job Flow
```bash
# Manager: Post work
ks post-job --instructions "Performance audit" --type "analysis" --minutes 90

# Worker: Accept and complete
ks load --accept-job job-frontend-abc
ks complete-job job-frontend-abc --summary "5 optimizations found"

# Manager: Check status
ks jobs
```

### Context Promotion Flow
```bash
# Check readiness
ks validate my-automation-tool

# If ready, promote
ks promote my-automation-tool

# Now available globally
```

## Performance Notes

- **Quick codes (1a-3z)**: ~10ms
- **Semantic search**: ~200-500ms
- **Combo discovery**: ~400-800ms
- **Power combos**: ~100ms (cached)
- **Session ops**: ~50-200ms

## Error Handling

| Error | Solution |
|-------|----------|
| "No exact match" | Check suggestions provided |
| "Context not found" | `ls .kingly/contexts/` to verify |
| "Job not found" | `ks jobs` to check status |
| Cache issues | `ks refresh --rebuild` |

## File Structure

```
.kingly/                # Project context
├── contexts/          # Local innovations
├── jobs/              # Multi-tab work
└── sessions/          # Checkpoints

~/.kingly/             # Global intelligence
└── sessions/          # Cross-workspace
```

## Integration

### Claude Code MCP
```json
{
  "mcpServers": {
    "kingly-agent": {
      "command": "node",
      "args": ["/path/to/mcp-mvp/src/index.js"],
      "env": {"OPENAI_API_KEY": "your-key"}
    }
  }
}
```

### CLAUDE.md
```markdown
## KINGLY INTELLIGENCE
- Auto-ping: `ks ping --context="breakthrough"`
- Handoff: `ks handoff --session="id" --decisions="summary"`
- Discovery: `ks find <keywords>`
```

## Status Indicators

- ✅ **Working**: Core workflow intelligence, session management, job coordination, context promotion
- 🚧 **Planned**: Template system, intelligence network, workflow execution
- 🔮 **Future**: Bi-directional intelligence, proactive detection, self-evolution

---

**Quick Help**: `ks help` | **Full Docs**: See [CLAUDE-COMMANDS.md](CLAUDE-COMMANDS.md) and [AGENT_GUIDE.md](../AGENT_GUIDE.md)