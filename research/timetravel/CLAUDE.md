# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

TimeTravel is a production-quality AI research platform that implements the Kingly/FlowMind methodology for conducting systematic AI future research. It features multi-tier research workflows, personality-driven analysis, and comprehensive tooling for research automation.

## Package Management

- **Node.js/TypeScript**: Use `npm` (package-lock.json exists)
- **Web frontend**: Use `npm` in `src/web/` directory
- Node.js >= 18.0.0 required

## Development Commands

### Main Development
```bash
# Build entire project
npm run build

# Development mode (API + Web + CLI)
npm run dev

# Individual components
npm run dev:api     # TypeScript API server
npm run dev:web     # React web interface  
npm run dev:cli     # CLI development

# Start production server
npm start

# Web-specific (from src/web/)
cd src/web && npm install  # First time setup
cd src/web && npm run dev  # Development
cd src/web && npm run build  # Production build
```

### Testing and Quality
```bash
# Run all tests
npm test
npm run test:watch  # Watch mode

# Code quality
npm run lint        # ESLint
npm run format      # Prettier
npm run docs        # Generate API docs
```

### Research Workflow Commands
```bash
# Main research simulation
./kingly-sim.sh research "subquadratic attention"
./kingly-sim.sh personality sovereignty_architect
./kingly-sim.sh status

# Setup and validation
./scripts/setup-keys.sh      # Interactive API key setup
./scripts/validate-keys.sh   # Verify configuration
./scripts/test-system.sh     # System validation
```

## Architecture Overview

### Core Components
- **CLI** (`src/cli/`): Command-line interface for research operations
- **API** (`src/api/`): Express server with research engine and routing
- **Web** (`src/web/`): React frontend with Vite, TailwindCSS, TypeScript
- **Shared** (`src/shared/`): Common types and utilities

### Research System Architecture
The system implements a **three-tier research methodology**:

1. **Tier 1 (30min)**: 4 parallel base exploration streams
   - Architecture Revolution, World Models, Reasoning Evolution, Efficiency Innovations
2. **Tier 2 (45min)**: Dynamic deep dives on high-relevance findings (>0.7 threshold)
3. **Tier 3 (30min)**: Strategic positioning validation for Kingly/FlowMind

### Context System
- **Contexts** (`contexts/`): Local behavior overrides and personality definitions
- **Project Config** (`project.yaml`): Kingly project configuration with imports
- **Personalities**: 8 distinct analysis perspectives (sovereignty_architect, abundance_amplifier, etc.)

### Key Integrations
- **MCP Tools**: Multi-tool research suite (Perplexity, WebSearch, fetch_url, desktop_commander)
- **API Keys**: Managed via `.env` file (gitignored) for development
- **Memory System**: Research caching and synthesis in `memory/` directory

## Important Files

### Configuration
- `project.yaml`: Main Kingly project configuration with research domains and personality focus
- `tsconfig.json`: TypeScript configuration with path aliases (`@/*`, `@cli/*`, `@api/*`, `@shared/*`)
- `context-manifest.yaml`: Context loading definitions
- `.env`: API keys (create from setup script, never commit)

### Research Outputs
- `outputs/research/`: Generated research reports with timestamps
- `execution-log.md`: Research execution history
- `memory/index.yaml`: Research memory and caching
- `feedback-journal.md`: System improvement feedback

### Scripts and Automation
- `kingly-sim.sh`: Main simulation orchestrator
- `scripts/execute-research.sh`: Core research workflow execution
- BDD specs in `specs/features/` and `specs/tests/`

## Development Workflow

### Research Execution Pattern
1. **Context Loading**: Import Kingly core contexts (@kingly/core/agents/research/deep-researcher)
2. **Tool Orchestration**: Coordinate MCP tools with cost optimization
3. **Multi-Tier Analysis**: Execute parallel research streams with dynamic expansion
4. **Personality Synthesis**: Apply 8 personality perspectives for comprehensive analysis
5. **Report Generation**: Structured output with executive summary and strategic implications

### API Key Management
Development uses `.env` file storage. Production roadmap includes:
- macOS Keychain with Touch ID
- Linux Secret Service integration
- Mobile secure proxy support

### Testing Strategy
- **BDD**: Gherkin features for context loading and workflow behavior
- **TDD**: Jest unit tests for research workflow logic
- **Integration**: System validation scripts for end-to-end testing

## TypeScript Path Aliases
- `@/*`: `./src/*`
- `@cli/*`: `./src/cli/*`
- `@api/*`: `./src/api/*`
- `@shared/*`: `./src/shared/*`

## Required Environment Variables
- `SMITHERY_API_KEY`: Universal MCP access
- `PERPLEXITY_API_KEY`: AI-powered search
- `TAVILY_API_KEY`, `BRAVE_API_KEY`, `EXA_API_KEY`: Web search APIs
- `FIRECRAWL_API_KEY`: Web scraping