# TimeTravel MCP & API Ecosystem Report

## 🎯 Executive Summary

This report provides a comprehensive analysis of all MCPs, APIs, and keys needed for TimeTravel research infrastructure, along with a CLI-first → MCP wrapper development strategy.

## 📊 Current API/MCP Status

### ✅ Currently Configured APIs
| API | Status | Purpose | Priority | Cost |
|-----|--------|---------|----------|------|
| **PERPLEXITY_API_KEY** | ✅ Required | AI-powered search (Sonar Pro) | P0 | $20/mo |
| **BRAVE_API_KEY** | ✅ Required | Privacy web search | P0 | Free tier |
| **EXA_API_KEY** | ✅ Required | Neural search engine | P0 | $20/mo |
| **FIRECRAWL_API_KEY** | ✅ Required | Web scraping/extraction | P0 | $29/mo |
| **TAVILY_API_KEY** | ✅ Required | Web search API | P0 | $50/mo |
| **SMITHERY_API_KEY** | ✅ Required | Universal MCP access | P0 | Unknown |
| **ANTHROPIC_API_KEY** | 🔄 Optional | Claude synthesis | P1 | Usage |
| **OPENAI_API_KEY** | 🔄 Optional | GPT models | P1 | Usage |
| **GEMINI_API_KEY** | 🔄 Optional | Google AI | P2 | Usage |
| **BROWSER_CAT_API_KEY** | 🔄 Optional | Browser automation | P2 | Unknown |

**Total Monthly Cost Estimate: ~$119/month + usage-based**

### ❌ Missing Academic/Research APIs
| API | Status | Purpose | Integration Effort | Priority |
|-----|--------|---------|-------------------|----------|
| **PubMed API** | 🚫 Missing | Academic papers | Medium | P1 |
| **arXiv API** | 🚫 Missing | Research preprints | Low | P1 |
| **Hacker News API** | 🚫 Missing | Tech discussions | Low | P2 |
| **Y Combinator API** | 🚫 Missing | Startup intelligence | Medium | P2 |
| **DeepSeek API** | 🚫 Missing | Alternative AI model | Medium | P2 |
| **Google Scholar** | 🚫 Missing | Citation analysis | High | P1 |
| **Semantic Scholar** | 🚫 Missing | Academic search | Medium | P1 |
| **SSRN API** | 🚫 Missing | Social science papers | Low | P3 |

## 🔄 CLI-First → MCP Wrapper Strategy

### Phase 1: CLI/API Foundation (Current)
```
TimeTravel CLI/API → Direct API Calls → Research Engine
```

**Current Architecture:**
- ✅ CLI commands (`src/cli/commands/research.ts`)
- ✅ API server (`src/api/server.ts`) 
- ✅ Research engine (`src/api/engine/research.ts`)
- ✅ Web interface (`src/web/`)

### Phase 2: MCP Wrapper Layer (Planned)
```
Claude Code → TimeTravel MCP → TimeTravel CLI/API → Research Engine
```

**MCP Integration Strategy:**
1. **Create MCP Server** (`src/mcp/server.ts`)
2. **Expose CLI as MCP Tools** (research, status, personality)
3. **Add MCP Resource Providers** (research outputs, memory)
4. **Enable Claude Code Integration**

### Phase 3: Hybrid Access (Goal)
```
┌─ Claude Code → TimeTravel MCP ─┐
│                                ├─→ TimeTravel Engine
└─ Direct CLI/API Access ───────┘
```

## 📁 Research Project Storage Architecture

### Current Structure
```
timetravel/
├── outputs/                    # 📊 Generated Research Reports
│   ├── research/              # Individual research files
│   │   ├── {topic}_{timestamp}.md
│   │   └── *.md               # 6 current reports
│   ├── synthesis/             # Monthly/weekly synthesis
│   └── trends/                # Trend monitoring
│
├── memory/                     # 🧠 Research Memory & Cache
│   └── index.yaml             # Memory index
│
├── cache/                      # ⚡ Performance Cache
│   └── combos-cache.json      # Cached combinations
│
└── personalities/              # 🎭 Analysis Personalities
    ├── core/                  # Built-in personalities
    └── custom/                # User-defined personalities
```

### Research Report Naming Convention
- **Pattern**: `{topic_sanitized}_{YYYYMMDD_HHMMSS}.md`
- **Examples**:
  - `subquadratic_attention_revolution_20250106_115432.md`
  - `ai_future_positioning_subquadratic_attention_20250612.md`
  - `world_models_context_evolution_20250613.md`

## 🏗️ Docs/ADR Organization Recommendations

### Current Docs Structure
```
docs/
├── README.md                   # Basic overview
├── examples.md                 # Usage examples  
├── personality-guide.md        # Personality system
└── whitepaper.md              # Technical architecture
```

### Recommended ADR Structure
```
docs/
├── adr/                       # 📋 Architecture Decision Records
│   ├── 001-cli-first-mcp-wrapper-strategy.md
│   ├── 002-research-storage-architecture.md
│   ├── 003-api-selection-criteria.md
│   ├── 004-personality-driven-analysis.md
│   ├── 005-three-tier-research-methodology.md
│   └── 006-academic-api-integration-plan.md
│
├── setup/                     # 🚀 Setup & Configuration
│   ├── api-key-management.md
│   ├── development-setup.md
│   └── production-deployment.md
│
├── architecture/              # 🏛️ Technical Architecture
│   ├── system-overview.md
│   ├── mcp-integration.md
│   ├── research-engine.md
│   └── data-flow.md
│
└── research/                  # 📚 Research Methodology
    ├── three-tier-methodology.md
    ├── personality-system.md
    ├── tool-orchestration.md
    └── quality-metrics.md
```

## 🎯 Immediate Action Items

### Priority 1: API Setup
1. **Get Required Keys** (Perplexity, Brave, EXA, Firecrawl, Tavily, Smithery)
2. **Run Setup Wizard**: `./scripts/setup-keys.sh`
3. **Validate Configuration**: `./scripts/validate-keys.sh`
4. **Test Research Flow**: `./kingly-sim.sh research "test topic"`

### Priority 2: Academic API Integration
1. **PubMed Integration** - Free API, good documentation
2. **arXiv Integration** - Simple REST API, no key required
3. **Semantic Scholar** - Academic search with free tier

### Priority 3: MCP Wrapper Development
1. **Create MCP Server Structure** (`src/mcp/`)
2. **Define MCP Tools Schema** (research, status, memory)
3. **Implement Resource Providers** (outputs, cache)
4. **Test Claude Code Integration**

### Priority 4: Documentation
1. **Create ADR Structure** 
2. **Document API Selection Rationale**
3. **Write MCP Integration Guide**
4. **Update Setup Documentation**

## 🔧 Development Commands Reference

### Current CLI Commands
```bash
# Research execution
./kingly-sim.sh research "topic"
./kingly-sim.sh personality sovereignty_architect
./kingly-sim.sh status

# Development
npm run dev                    # API + Web + CLI
npm run dev:api               # API server only
npm run build                 # Full build
npm test                      # Run tests

# Setup & validation
./scripts/setup-keys.sh       # Interactive key setup
./scripts/validate-keys.sh    # Verify configuration
./scripts/test-system.sh      # System validation
```

### Planned MCP Commands
```bash
# MCP development (planned)
npm run mcp:dev               # MCP server development
npm run mcp:build             # Build MCP server
npm run mcp:test              # Test MCP integration

# Claude Code integration
claude-code --mcp timetravel research "topic"
claude-code --mcp timetravel status
```

## 💰 Cost Analysis

### Monthly API Costs
- **Core Research APIs**: ~$119/month
- **Academic APIs**: Mostly free tiers
- **Usage-Based APIs**: Variable ($10-100/month)
- **Total Estimated**: $130-220/month

### Development Investment
- **Phase 1 (CLI/API)**: ✅ Complete
- **Phase 2 (MCP Wrapper)**: ~2-3 weeks
- **Phase 3 (Documentation)**: ~1 week
- **Phase 4 (Academic APIs)**: ~2-4 weeks per API

## 🚀 Next Steps

1. **Immediate**: Set up required API keys and test current system
2. **Week 1**: Create ADR structure and document current architecture  
3. **Week 2-3**: Build MCP wrapper layer for Claude Code integration
4. **Week 4+**: Integrate academic APIs (PubMed, arXiv, Semantic Scholar)

---

*Generated: $(date)*
*Status: Analysis Complete - Ready for Implementation*