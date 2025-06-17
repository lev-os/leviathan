# Kingly MCP MVP - Architecture Overview

Consolidated architecture documentation from implementation and design drafts.

## System Architecture

### Core Philosophy
The Kingly MCP MVP implements a **fractal intelligence system** where local project contexts mirror the global ecosystem structure, enabling seamless promotion of effective patterns while maintaining LLM-first design principles.

### Key Design Principles

1. **LLM-First Architecture**: Always ask "Can an LLM do this?" before writing code
2. **Fractal Structure**: Local `.kingly/` mirrors global `~/ka/` for seamless scaling
3. **Intelligence Over Framework**: Behavior emerges from AI reasoning, not hardcoded logic
4. **Direct Adapters**: 10-100x performance via direct calls vs MCP when possible
5. **Whisper Guidance**: Hidden system prompts guide LLM responses for context-aware interactions

## Component Architecture

### 1. Hybrid Command System

**Location**: `bin/kingly-semantic`

**Purpose**: Dual-mode CLI supporting both explicit commands and natural language fallback

**Key Features**:
- **Command Registry**: Centralized definitions with whisper guidance
- **Natural Language Fallback**: Unknown commands become CEO orchestration queries
- **Whisper System**: Hidden guidance for LLM context interpretation
- **Error Handling**: Graceful degradation with intelligent suggestions

```bash
# Explicit commands
ks find "creative brainstorming"
ks combos "strategic decision"

# Natural language fallback
ks "help me with user research methods"
ks "what workflows for creative problem solving?"
```

### 2. Workflow Intelligence Engine

**Location**: `src/claude-code-adapter.js`

**Purpose**: High-performance semantic workflow discovery and relationship analysis

**Key Features**:
- **Semantic Search**: OpenAI embeddings with ~200-500ms response time
- **Quick Code Lookup**: 1a-3z pattern for ~10ms instant access
- **Combo Discovery**: Relationship analysis with strength percentages
- **Power Combinations**: Pre-cached proven workflow sequences
- **Batch Processing**: Multiple queries in single operation

**Performance Profile**:
- Quick codes (1a-3z): ~10ms
- Semantic search: ~200-500ms
- Combo discovery: ~400-800ms
- Power combos: ~100ms (cached)

### 3. Session Intelligence System

**Location**: `src/session-manager.js`

**Purpose**: Multi-tab coordination, context handoff, and session continuity

**Key Features**:
- **Ping Checkpoints**: Session snapshots with file references
- **Handoff Protocol**: Markdown documents for context transfer
- **Context Restoration**: Full conversation continuity across sessions
- **CEO Intelligence**: AI-powered orchestration and guidance

**Storage Structure**:
```
~/.kingly/sessions/     # Global cross-workspace intelligence
$PWD/.kingly/sessions/  # Project-specific checkpoints
```

### 4. Multi-Tab Job Coordination

**Location**: `src/session-manager.js` (job methods)

**Purpose**: Distributed work orchestration across Claude Code tabs

**Key Features**:
- **Job Posting**: Create work packages for other tabs
- **Job Acceptance**: Auto-setup context for distributed work
- **Job Completion**: Track and coordinate results
- **Status Monitoring**: Real-time job progress across tabs

**Job Lifecycle**:
```bash
# Tab A: Post job
ks post-job --instructions "Security audit" --type "analysis"

# Tab B: Accept job
ks load --accept-job job-2025-06-12-abc

# Tab B: Complete job
ks complete-job job-2025-06-12-abc --summary "Results"
```

### 5. Fractal Context Promotion

**Location**: `src/promotion-engine.js`

**Purpose**: Local innovation validation and global promotion

**Key Features**:
- **Validation Pipeline**: Zod schemas + LLM analysis
- **Effectiveness Metrics**: Usage frequency and quality scoring
- **Redundancy Analysis**: Intelligent merge opportunity detection
- **Boundary Assessment**: Natural context limits via AI evaluation
- **Lineage Tracking**: Promotion history and attribution

**Fractal Structure**:
```
# Local project context (mirrors global)
.kingly/
├── contexts/
│   ├── tools/
│   ├── patterns/
│   └── workflows/
├── jobs/
└── sessions/

# Global ecosystem (target for promotion)
~/ka/
├── contexts/
│   ├── tools/
│   ├── patterns/
│   └── workflows/
```

### 6. CEO Orchestration System

**Location**: `src/session-manager.js` (CEO methods)

**Purpose**: Natural language processing and intelligent workflow routing

**Key Features**:
- **Intent Analysis**: Complexity assessment and categorization
- **Workflow Matching**: Semantic similarity with confidence scores
- **Execution Hints**: AI-generated guidance for workflow usage
- **Multi-Tab Guidance**: Coordination recommendations
- **Template Suggestions**: AI-driven pattern recommendations

**CEO Response Structure**:
- Query interpretation and intent analysis
- Workflow matches with similarity scores
- Execution hints and suggested actions
- Multi-tab coordination guidance
- Template and pattern suggestions

## Advanced Architectural Patterns

### 1. Whisper System Architecture

**Purpose**: Provide hidden guidance to LLMs without polluting user output

**Implementation**:
- Commands generate whisper guidance in temporary files
- LLMs access via stderr without user visibility
- Context-aware response formatting suggestions
- Follow-up action recommendations

**Example Whisper**:
```json
{
  "llm_guidance": "User wants workflow discovery - provide top 3 matches",
  "context_hint": "Natural language query - be conversational",
  "response_format": "Show workflow code, name, description, next steps",
  "suggested_followups": ["Execute workflow", "Find related", "Get details"]
}
```

### 2. Validation Pipeline Architecture

**Purpose**: AI-powered assessment of context promotion readiness

**Components**:
- **Schema Validation**: Zod-based structure verification
- **Effectiveness Analysis**: Usage metrics and quality scoring
- **Redundancy Detection**: LLM-powered duplicate analysis
- **Boundary Assessment**: Natural limits via AI evaluation
- **Merge Opportunities**: Intelligent consolidation suggestions

**Validation Criteria**:
- Effectiveness score > 7.0/10
- Usage frequency > 5 instances
- Complete documentation
- No redundancy with existing contexts
- Clear value proposition

### 3. Bi-Directional Intelligence Plan

**Status**: Planned enhancement for future releases

**Vision**: Transform from reactive tool to proactive intelligence partner

**Planned Features**:
- **Enhanced Ping Decorations**: Git intelligence with commit recommendations
- **Context-Aware Lookups**: Recent session integration
- **Bi-Directional Jobs**: Jobs spawn follow-up jobs based on results
- **System-Initiated Callbacks**: Proactive pattern detection and suggestions
- **Infinite Callback Loops**: Controlled AI-driven task chains

**Safety Architecture**:
- Circuit breakers: Max 10 callback levels
- Time boxing: 5-minute limits per chain
- Human override: Emergency stop mechanisms
- Transparent logging: Full audit trails

## Storage Architecture

### Global Intelligence
```
~/.kingly/
├── sessions/           # Cross-workspace session storage
├── intelligence/       # Shared intelligence cache
└── global-registry/    # Context promotion registry
```

### Local Project Context
```
$PWD/.kingly/
├── contexts/          # Local innovations
│   ├── tools/        # Tool contexts
│   ├── patterns/     # Pattern contexts
│   └── workflows/    # Workflow contexts
├── jobs/             # Multi-tab coordination
│   └── job-*/        # Individual job directories
├── sessions/         # Project session checkpoints
└── config.yaml       # Local configuration
```

### Cache Architecture
```
src/
├── embeddings.json   # OpenAI embeddings cache
├── combos.json       # Workflow relationship cache
└── power-combos.json # Pre-built sequence cache
```

## Performance Architecture

### Response Time Targets
- **Quick Code Lookup**: <20ms (1a-3z pattern)
- **Semantic Search**: <500ms (OpenAI embeddings)
- **Combo Discovery**: <800ms (relationship analysis)
- **Session Operations**: <200ms (file I/O)
- **Cache Rebuild**: <60 seconds (full embeddings)

### Optimization Strategies
- **Intelligent Caching**: Embeddings cached until workflow changes
- **Quick Code Patterns**: Direct lookup tables for instant access
- **Batch Operations**: Multiple queries in single API call
- **Lazy Loading**: Components initialized on first use
- **Direct Adapters**: Bypass MCP for performance-critical operations

## Integration Architecture

### Claude Code MCP Integration
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

### CLAUDE.md Integration Pattern
```markdown
## KINGLY INTELLIGENCE

### Auto-Commands
- Ping on breakthroughs: `ks ping --context="discovery"`
- Handoff on session end: `ks handoff --session="id" --decisions="summary"`
- Load on session start: `ks load`

### Workflow Triggers
- /think → `ks power <scenario>`
- /all → `ks "comprehensive analysis"`
- /kingly → `ks find <keywords>`
```

## Error Handling Architecture

### Graceful Degradation Strategy
1. **Primary Path**: Direct adapter with full features
2. **Fallback Path**: Cached results with reduced functionality
3. **Emergency Path**: Basic CLI with manual operations
4. **Recovery Path**: Cache rebuild and system reset

### Error Categories
- **Workflow Not Found**: Suggestions and similarity matches
- **Context Missing**: Validation guidance and creation hints
- **Job Errors**: Status checking and recovery options
- **Cache Issues**: Automatic rebuild triggers
- **API Failures**: Offline mode with cached data

## Security Architecture

### Data Protection
- **API Keys**: Environment variables only, never committed
- **Session Data**: Local storage with user control
- **Context Content**: User-controlled promotion decisions
- **Job Data**: Temporary storage with automatic cleanup

### Access Control
- **Local Context**: Project-scoped access only
- **Global Context**: User-controlled promotion
- **Session Data**: User workspace boundaries
- **Job Coordination**: Tab-scoped isolation

## Scalability Architecture

### Horizontal Scaling Patterns
- **Fractal Replication**: Each project is self-contained
- **Context Federation**: Global registry with local autonomy
- **Session Distribution**: Multi-tab coordination
- **Intelligence Sharing**: Opt-in cross-workspace sharing

### Performance Scaling
- **Cache Partitioning**: Separate caches per workspace
- **Lazy Initialization**: Components loaded on demand
- **Batch Operations**: Reduce API call overhead
- **Direct Adapters**: Bypass frameworks for speed

## Future Architecture Evolution

### Template System (Next Release)
- **AI-Driven Evolution**: Templates that improve based on usage
- **Cross-Project Sync**: Template sharing with intelligent merging
- **Dynamic Generation**: Templates created from successful patterns

### Intelligence Network (Future)
- **Cross-Workspace Sharing**: Federated intelligence network
- **Pattern Recognition**: System-wide pattern detection
- **Network Optimization**: Topology-aware routing

### Bi-Directional Intelligence (Advanced)
- **System Initiative**: AI-driven workflow suggestions
- **Proactive Detection**: Pattern recognition across sessions
- **Self-Evolution**: Context ecosystems that improve autonomously

---

This architecture supports the current MVP while providing a foundation for advanced features like bi-directional intelligence, template evolution, and cross-workspace intelligence networks.