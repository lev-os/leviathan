# TimeTravel Research Platform

A production-quality AI research platform combining CLI tools and web interfaces for systematic research using the TimeTravel methodology.

## 🚀 Quick Start

### Installation
```bash
npm install
npm run install:web
```

### Setup API Keys
```bash
# Interactive setup
npx timetravel config --setup

# Or create .env file
cp .env.example .env
# Edit .env with your API keys
```

### Run Research
```bash
# CLI
npx timetravel research "quantum computing breakthroughs"

# Web Interface  
npx timetravel web --open
```

## 🏗️ Architecture

### CLI Layer (`src/cli/`)
- **Commander.js** - Modern CLI framework
- **Inquirer** - Interactive prompts
- **Ora** - Progress spinners
- **Chalk** - Colored output

### API Layer (`src/api/`)
- **Express** - Web server
- **WebSocket** - Real-time updates
- **Research Engine** - Three-tier workflow
- **Tool Orchestrator** - MCP integration

### Web Layer (`src/web/`)
- **React 18** - Modern UI framework
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

## 🔧 CLI Commands

### Research
```bash
timetravel research <topic> [options]

Options:
  -d, --depth <level>     Research depth: quick|standard|deep
  -t, --time <minutes>    Maximum time in minutes
  -o, --output <format>   Output format: markdown|json|html
  -p, --personalities     Personality modes (comma-separated)
  -s, --sources          Data sources (comma-separated)
  --web                  Open web interface
```

### Configuration
```bash
timetravel config [options]

Options:
  --setup     Run interactive setup
  --list      List current configuration  
  --validate  Validate API keys
```

### Status
```bash
timetravel status [options]

Options:
  --json      Output as JSON
```

### Web Interface
```bash
timetravel web [options]

Options:
  -p, --port <port>       Port number (default: 3000)
  --open                  Open browser automatically
```

## 📡 API Endpoints

### Research
- `POST /api/research/execute` - Start research
- `GET /api/research/:id` - Get research status
- `GET /api/research` - List all research
- `DELETE /api/research/:id` - Delete research

### Configuration
- `GET /api/config` - Get configuration
- `PUT /api/config` - Update configuration
- `POST /api/config/validate` - Validate API keys

### Status
- `GET /api/status` - System status
- `GET /api/status/stats` - Usage statistics

## 🎭 Personality Modes

The platform applies eight personality perspectives to research:

1. **sovereignty_architect** - Independence and self-reliance focus
2. **abundance_amplifier** - 10x opportunity identification  
3. **visionary_pioneer** - Paradigm shift recognition
4. **cortisol_guardian** - Risk assessment and threat analysis
5. **strategic_commander** - Competitive positioning insights
6. **empathetic_connector** - User impact and adoption factors
7. **practical_builder** - Implementation requirements
8. **systems_thinker** - Interconnections and emergent properties

## 🔬 Research Methodology

### Three-Tier Deep Research

**Tier 1 (30 min): Parallel Base Exploration**
- Architecture Revolution (WebSearch, Perplexity)
- World Models (URL fetch, analysis)
- Reasoning Evolution (competitive intel)
- Efficiency Innovations (cost analysis)

**Tier 2 (45 min): Dynamic Deep Dives**
- Generated from Tier 1 findings with >0.7 relevance
- 6-8 focused investigations
- Deep content analysis

**Tier 3 (30 min): Strategic Positioning**
- Competitive advantage opportunities
- White space identification
- Technical differentiation potential
- Implementation feasibility

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start all services in development
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
npm run docs         # Generate API documentation
```

### Project Structure
```
src/
├── cli/             # Command-line interface
│   ├── commands/    # CLI command implementations
│   └── index.ts     # Main CLI entry point
├── api/             # API server and business logic
│   ├── routes/      # Express routes
│   ├── engine/      # Research engine
│   ├── config/      # Configuration management
│   └── utils/       # Utilities
├── web/             # React web interface
│   ├── src/         # React components and pages
│   └── package.json # Web-specific dependencies
└── shared/          # Shared types and utilities
```

## 🔌 API Integration

The platform integrates with multiple research APIs:

- **Perplexity** - AI-powered search with citations
- **Brave Search** - Privacy-focused web search  
- **Exa** - Neural search engine
- **Firecrawl** - Web scraping and content extraction

## 📊 Output Formats

### Markdown
```markdown
# Research Report: Topic
## Executive Summary
## Key Findings
## Personality Analysis
## Strategic Implications
```

### JSON
```json
{
  "id": "uuid",
  "topic": "research topic",
  "findings": [...],
  "synthesis": "...",
  "metadata": {...}
}
```

### HTML
Complete web-ready report with styling and interactive elements.

## 🔒 Security

- API keys stored in environment variables
- Request validation with Joi
- Rate limiting and CORS protection
- Input sanitization
- Secure headers with Helmet

## 📈 Monitoring

- Structured logging with Winston
- Performance metrics
- Error tracking
- Usage analytics
- Quality scoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.