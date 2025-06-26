# TimeTravel AI Research Platform

A production-ready AI research platform that orchestrates multiple AI tools and APIs to conduct deep, multi-perspective research on any topic.

## 🚀 Overview

TimeTravel is a sophisticated research automation platform that:

- Orchestrates multiple AI research tools (Perplexity, Elicit, DeepSeek, etc.)
- Applies personality-based analysis perspectives
- Implements three-tier research methodology
- Provides both CLI and web interfaces
- Stores and indexes research for future reference

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web UI (React)│     │    CLI (Node)    │     │   API Client    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────┬───────┴─────────────────────────┘
                         │
                   ┌─────▼─────┐
                   │ REST API  │
                   │ (Express) │
                   └─────┬─────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼────┐                   ┌─────▼─────┐
    │Research │                   │Personality│
    │ Engine  │                   │  Manager  │
    └────┬────┘                   └─────┬─────┘
         │                               │
         └───────────┬───────────────────┘
                     │
              ┌──────▼──────┐
              │    Tool     │
              │Orchestrator │
              └──────┬──────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐    ┌────▼────┐    ┌────▼────┐
│Perplexity│    │  Brave  │    │   Exa   │
│   API    │    │ Search  │    │   API   │
└──────────┘    └─────────┘    └─────────┘
```

## 🛠️ Technology Stack

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: React, Vite, TailwindCSS
- **APIs**: Perplexity, Brave Search, Exa, Firecrawl
- **Storage**: File-based (future: PostgreSQL)
- **Testing**: Jest, React Testing Library

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/timetravel.git
cd timetravel

# Install dependencies
npm install

# Build the project
npm run build

# Set up your API keys
npm run cli -- config --setup
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# API Keys
PERPLEXITY_API_KEY=your_key_here
BRAVE_API_KEY=your_key_here
EXA_API_KEY=your_key_here
FIRECRAWL_API_KEY=your_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🚀 Quick Start

### CLI Usage

```bash
# Start a new research session
npm run cli -- research --topic "AI reasoning models" --depth comprehensive

# List available personality modes
npm run cli -- personality --list

# Check system status
npm run cli -- status
```

### Web UI

```bash
# Start the API server
npm run api

# In another terminal, start the web UI
npm run web

# Open http://localhost:5173
```

### API Usage

```typescript
// Start the API server
const server = new ApiServer()
await server.start(3000)

// Make a research request
const response = await fetch('http://localhost:3000/api/research/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Subquadratic architectures in AI',
    depth: 'comprehensive',
    personalities: ['sovereignty_architect', 'abundance_amplifier'],
  }),
})
```

## 🧠 Research Methodology

TimeTravel implements a three-tier research approach:

### Tier 1: Base Exploration

- Broad search across multiple sources
- Identify key themes and concepts
- 4 parallel research streams

### Tier 2: Dynamic Deep Dives

- Focus on high-relevance findings
- Deeper investigation of promising areas
- Up to 6 parallel deep dives

### Tier 3: Strategic Positioning

- Competitive analysis
- Implementation feasibility
- Final synthesis and recommendations

## 🎭 Personality System

The platform includes multiple analysis personalities:

- **Sovereignty Architect**: Technical systems perspective
- **Abundance Amplifier**: Growth and opportunity focus
- **Cortisol Guardian**: Risk and stress management
- **Practical Builder**: Implementation-focused analysis

## 📊 Project Status

- ✅ Core architecture implemented
- ✅ TypeScript build system working
- ✅ Basic web UI created
- ✅ CLI framework in place
- 🚧 API integrations (placeholder implementations)
- 🚧 Research repository storage
- 🚧 Full personality system
- 📋 Production deployment

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🔗 Links

- [Architecture Overview](architecture/overview.md)
- [API Documentation](api/README.md)
- [Research Methodology](guides/research-methodology.md)
- [Personality System](guides/personality-modes.md)
