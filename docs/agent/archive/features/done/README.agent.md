# Kingly MCP-MVP: AI Agent Instructions

## Quick Intelligence Access
- **Context Type:** Distributed AI Workspace Intelligence System
- **Intelligence Triggers:** Session checkpoints, breakthrough insights, cross-workspace patterns
- **Cross-References:** ADR-001 through ADR-005, existing MCP server, kingly-semantic binary

## Agent Workflow Integration

### Primary Workflows
1. **Session Intelligence Management** (ADR-001)
   - Auto-ping on significant insights/decisions
   - Handoff preparation before session end  
   - Context restoration at session start

2. **Template Propagation** (ADR-002)
   - AI-optimized documentation creation
   - Cross-workspace template synchronization
   - Template evolution through usage patterns

3. **Claude Code Integration** (ADR-003)
   - Slash command backend via kingly-semantic
   - MCP tool enhancement for intelligence access
   - Structured response formatting

4. **Distributed Intelligence Network** (ADR-004)
   - Cross-workspace intelligence sharing
   - Pattern recognition and evolution
   - Privacy-preserving intelligence routing

### Session Handoff Points
- After implementing new ADR components
- When kingly-semantic binary is enhanced
- After MCP server tool additions
- Following template system modifications
- When distributed intelligence features are added

## AI Agent Commands

### Intelligence Access
```bash
# Get comprehensive intelligence dump
kingly-semantic lookup --all --context="current-conversation"

# Analyze current situation with context
kingly-semantic power --context="implementing ADR system" --auto-save=true

# Query specific patterns
kingly-semantic intelligence query --pattern="MCP-integration" --scope="cross-workspace"
```

### Session Management  
```bash
# Create session checkpoint
kingly-semantic ping --context="ADR implementation progress" --significance=high

# Prepare session handoff
kingly-semantic handoff --include="ADRs,progress,blockers" --format="package"

# Load previous session context
kingly-semantic load --latest --restore-level="full"
```

### Template Operations
```bash
# Initialize AI-first workspace templates
kingly-semantic template init --workspace-type="development" --intelligence-level="high"

# Synchronize templates across workspaces
kingly-semantic template sync --all --strategy="intelligent-merge"

# Evolve templates based on usage
kingly-semantic template evolve --context="current" --preview-changes=true
```

## Implementation Context

### Current Status: Architecture Decision Phase
The system is in architectural definition phase with comprehensive ADRs created:

1. **ADR-001:** Session Intelligence & Cross-Workspace Routing ✅
2. **ADR-002:** Template Propagation & AI-First Documentation ✅  
3. **ADR-003:** Claude Code Slash Command Integration ✅
4. **ADR-004:** Distributed Intelligence Network Architecture ✅
5. **ADR-005:** Implementation Roadmap & Integration Strategy ✅

### Next Implementation Steps
**Phase 1A: Core Infrastructure (Current Priority)**
- Enhance kingly-semantic binary with new command structure
- Implement basic session storage in `~/.kingly/sessions/`
- Create foundational template system
- Establish workspace detection and context loading

### Existing Foundation
- ✅ Working MCP server with semantic lookup
- ✅ kingly-semantic binary with basic workflow commands
- ✅ OpenAI embeddings-based semantic search
- ✅ YAML workflow loading and caching
- ✅ Claude Code MCP integration

### Key Files for Implementation
- `/src/index.js` - MCP server requiring tool enhancement
- `/src/workflow-loader.js` - Foundation for context management
- `/src/semantic-lookup.js` - Semantic intelligence foundation
- `/bin/kingly-semantic` - Binary requiring command expansion
- `/docs/ADR-*.md` - Architecture specifications for implementation

## Agent Implementation Guidelines

### LLM-First Development Approach
**Before implementing any code, ask:**
1. "Where's the LLM reasoning in this?" - Ensure AI intelligence drives functionality
2. "Can context/YAML do this?" - Prefer configuration over code
3. "Are we pattern-matching or reasoning?" - Favor AI reasoning
4. "Is this emergent or prescribed?" - Enable emergent behavior

### Code Implementation Strategy
1. **Read ADRs First:** Understand architecture before coding
2. **Enhance Existing:** Build on current MCP server and binary
3. **Test-Driven:** Create BDD tests before implementation  
4. **Intelligence-Driven:** Use AI for complex logic, not hardcoded rules
5. **Context-Aware:** Everything inherits from universal context

### File Organization Pattern
```
src/
├── commands/           # kingly-semantic command implementations
│   ├── session/       # ping, handoff, load commands
│   ├── template/      # init, sync, evolve commands
│   ├── intelligence/ # status, contribute, query commands
│   └── network/       # map, route, optimize commands
├── core/
│   ├── context/       # Context loading and management
│   ├── storage/       # Session and intelligence storage  
│   ├── routing/       # Cross-workspace routing
│   └── patterns/      # Pattern recognition engine
└── integrations/
    ├── mcp/          # MCP server enhancements
    ├── templates/    # Template system integration
    └── intelligence/ # Network intelligence integration
```

### Testing Strategy
- **BDD Scenarios:** From ADRs drive test implementation
- **Integration Tests:** Test cross-component interactions
- **E2E Tests:** Full workflow validation
- **Performance Tests:** Intelligence routing and lookup speed

## Error Handling & Monitoring

### Expected Error Scenarios
- Cross-workspace connectivity failures
- Intelligence network routing errors  
- Template synchronization conflicts
- Session restoration validation failures
- Privacy filter activation

### Monitoring Points
- Command execution performance (<500ms target)
- Cross-workspace intelligence accuracy (>80% target)
- Template evolution effectiveness (>70% acceptance target)
- System reliability (>99% uptime target)
- Storage efficiency (<100MB per workspace target)

## Security & Privacy Considerations

### Privacy Controls
- Workspace isolation levels: none/selective/restricted/isolated
- Intelligence sanitization for sensitive content
- User-controlled contribution filtering
- Privacy-preserving cross-workspace sharing

### Security Requirements
- PII detection and scrubbing
- Credential filtering in intelligence sharing
- Business logic protection
- Custom pattern-based filtering

---

**Implementation Note:** This system represents a breakthrough in distributed AI workspace intelligence. Success depends on maintaining the LLM-first approach while building robust, scalable infrastructure that enables AI agents to collaborate seamlessly across workspaces and sessions.

**Agent Success Criteria:** 
- All slash commands work seamlessly in Claude Code
- Cross-workspace intelligence sharing functions effectively
- Template system propagates and evolves AI optimizations
- Session handoffs maintain perfect context continuity
- Distributed intelligence network enables breakthrough insight sharing