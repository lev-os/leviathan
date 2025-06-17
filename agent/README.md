# Leviathan Agent - Workflow Intelligence & Session Management

Advanced semantic workflow discovery, multi-tab job coordination, and session intelligence for the Leviathan ecosystem, sponsored by [Kingly Agency](https://kinglyagency.com).

## 🚀 Quick Start

### Installation
```bash
cd leviathan/agent
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Initial Setup
```bash
# Build embeddings cache (required first time)
npm run build:embeddings

# Test the system
npm test
npm run test:ceo

# Make CLI available globally
alias lev="node $(pwd)/bin/lev-semantic"
```

### Basic Usage
```bash
# Find workflows
lev find "creative brainstorming"
lev find 1a  # Quick code lookup

# Get workflow combinations
lev combos "strategic decision"
lev power creative-problem-solving

# Session management
lev ping --context="implemented OAuth2" --files="src/auth/oauth.js"
lev handoff --session="auth-work" --files="src/auth/" --decisions="OAuth complete"
lev load  # Restore session
```

## ✅ Current Features (Working)

### 🔍 Workflow Intelligence
- **Semantic Search**: Natural language to workflow mapping via OpenAI embeddings
- **Quick Codes**: Instant lookup with 1a-3z pattern (agents/patterns/workflows)
- **Combo Discovery**: Find related workflows with relationship analysis
- **Power Combinations**: Pre-built proven workflow sequences
- **Workflow Chaining**: Build sequences from start point to goal
- **Batch Processing**: Multiple queries in single operation

### 💾 Session Management
- **Ping Checkpoints**: Create session snapshots with file references
- **Session Handoff**: Transfer context between tabs/sessions with Markdown docs
- **Context Restoration**: Load previous sessions with full conversation context
- **CEO Intelligence**: AI-powered session orchestration and guidance

### 🤝 Multi-Tab Coordination
- **Job Posting**: Create jobs for other tabs to accept
- **Job Acceptance**: Accept jobs with automatic context setup
- **Job Completion**: Track and complete distributed work
- **Job Status**: Monitor pending/accepted/completed jobs across tabs

### 📈 Context Promotion
- **Fractal Structure**: Local `.leviathan/` mirrors global `~/ka/` structure
- **Validation Pipeline**: Zod schemas + LLM analysis for promotion readiness
- **Automatic Registration**: Auto-detect and bootstrap local contexts
- **Promotion Workflow**: Elevate effective local patterns to global availability

### 🧠 Natural Language Processing
- **CEO Orchestration**: Unknown commands become intelligent queries
- **Intent Analysis**: Complexity assessment and workflow recommendations
- **Whisper System**: Hidden LLM guidance for context-aware responses
- **Template Suggestions**: AI-driven workflow and pattern recommendations

### ⚙️ System Features
- **Performance Caching**: Intelligent embeddings cache with 200-500ms semantic search
- **Quick Code Lookup**: ~10ms for exact code matches (1a-3z)
- **Cache Management**: Light refresh and full rebuild options
- **Error Handling**: Graceful fallbacks with suggestions

## 🚧 Placeholder Features (Implemented but Non-Functional)

### 📝 Template System
- `lev template init/sync/evolve/status` - Shows help but not implemented
- **Planned**: AI-driven workspace template evolution

### 🌐 Intelligence Network  
- `lev intelligence status/contribute/query/sync` - Shows help but not implemented
- **Planned**: Cross-workspace intelligence sharing

### 🗺️ Network Management
- `lev network map/route/optimize` - Shows help but not implemented  
- **Planned**: Workspace topology mapping and optimization

### 🔧 Workflow Management
- `lev workflow select/execute` - Shows help but not implemented
- **Planned**: Interactive workflow selection and execution

## 📊 Architecture & Performance

### Response Times
- **Quick codes (1a-3z)**: ~10ms
- **Semantic search**: ~200-500ms  
- **Combo discovery**: ~400-800ms
- **Power combinations**: ~100ms (pre-cached)
- **Session operations**: ~50-200ms
- **Cache rebuild**: ~30 seconds

### Storage Structure
```
.leviathan/                    # Project-local context
├── contexts/              # Local innovations
│   ├── tools/            # Tool contexts
│   ├── patterns/         # Pattern contexts
│   └── workflows/        # Workflow contexts
├── jobs/                 # Multi-tab coordination
└── sessions/             # Session checkpoints

~/.leviathan/                 # Global intelligence
└── sessions/             # Cross-workspace sessions
```

### Core Components
- **ClaudeCodeAdapter**: Direct workflow intelligence (10-100x faster than MCP)
- **Session Manager**: Multi-tab coordination and context handoff
- **CEO Binding**: Natural language orchestration with whisper guidance
- **Promotion Engine**: Context validation and global promotion
- **Hybrid Router**: Explicit commands + natural language fallback

## 🔄 Usage Patterns

### Workflow Discovery
```bash
lev categories                           # Explore what's available
lev find "user research"                 # Semantic search
lev combos "user research"               # Get related workflows
lev power user-research                  # Get proven sequence
lev next 1a                             # What comes after workflow 1a?
```

### Session Continuity
```bash
# Tab A: Create checkpoint
lev ping --context="debugging auth" --files="src/auth/oauth.js:45-120"

# Handoff to Tab B  
lev handoff --session="auth-debug" --files="src/auth/" --decisions="found root cause"

# Tab B: Continue work
lev load --handoff="~/.leviathan/sessions/auth-debug.md"
```

### Multi-Tab Collaboration
```bash
# Manager: Post jobs
lev post-job --instructions "Frontend audit" --type "analysis" --minutes 90
lev post-job --instructions "Security review" --type "security" --minutes 120

# Workers: Accept and complete
lev load --accept-job job-frontend-abc
lev complete-job job-frontend-abc --summary "Audit complete, 5 optimizations found"

# Manager: Monitor progress
lev jobs
```

### Context Evolution
```bash
# Work develops local effectiveness
lev validate my-tool                     # Check promotion readiness
lev promote my-tool                      # Elevate to global availability
```

### Natural Language
```bash
lev "help me with strategic planning"    # CEO orchestration
lev "what workflows for creative work?"  # Intent analysis
lev "I need user research methods"       # Workflow recommendations
```

## 🛠️ Development & Testing

### Test Suite
```bash
npm test                               # Core functionality
npm run test:ceo                       # CEO binding system
npm run test:direct                    # Direct adapter performance
```

### Development Commands
```bash
npm run build:embeddings               # Rebuild semantic cache
npm run dev                           # Start with hot reload
```

### Adding New Workflows
1. Add to `leviathan/contexts/` directory structure
2. Run `lev refresh --rebuild` to update embeddings
3. Test with `lev find "your workflow description"`

## 📖 Documentation

- **[Complete Command Reference](docs/CLAUDE-COMMANDS.md)** - All commands with examples
- **[CLI Usage Guide](AGENT_GUIDE.md)** - Comprehensive usage patterns
- **[Architecture Docs](docs/)** - ADRs and technical decisions

## 🔌 Integration

### Claude Code MCP
```json
{
  "mcpServers": {
    "leviathan-agent": {
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
```markdown
## LEVIATHAN INTELLIGENCE
- Auto-ping: `lev ping --context="breakthrough"`  
- Session handoff: `lev handoff --session="id" --decisions="accomplished"`
- Workflow discovery: `lev find <context-keywords>`
```

## 🎯 Key Benefits

1. **10-100x Speed**: Direct adapter vs MCP for workflow operations
2. **Session Continuity**: Perfect context preservation across tabs/sessions  
3. **Multi-Tab Coordination**: Distributed work with job orchestration
4. **Intelligent Discovery**: Semantic search with relationship analysis
5. **Context Evolution**: Local innovations promoted to global availability
6. **Natural Language**: CEO orchestration for complex queries
7. **Fractal Architecture**: Local mirrors global for seamless scaling

## 🔮 Roadmap

### Next Release (Template System)
- AI-driven workspace template evolution
- Cross-project template synchronization
- Intelligent template suggestions

### Future (Intelligence Network)
- Cross-workspace intelligence sharing
- Network topology optimization  
- Distributed pattern recognition

### Advanced (Bi-Directional Intelligence)
- System-initiated workflows
- Proactive pattern detection
- Self-evolving context ecosystems

## 🐛 Known Issues

- Template/Intelligence/Network commands show help but don't execute
- Some error messages could be more descriptive
- Cache rebuild can be slow on first run (~30 seconds)

## 💡 Contributing

1. Fork the repository
2. Add workflows to `leviathan/contexts/` structure
3. Test with semantic search: `lev find "your workflow"`
4. Submit PR with workflow additions or improvements

---

**Status**: ✅ Core MVP Complete | 🚧 Template System Next | 🔮 Intelligence Network Future