# TimeTravel Quick Start Guide

Get up and running with TimeTravel in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- API keys for at least one service:
  - Perplexity API key (recommended)
  - Brave Search API key
  - Other supported APIs

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/timetravel.git
cd timetravel

# Install dependencies
npm install

# Build the project
npm run build
```

## 🔑 Configuration

### Option 1: Interactive Setup (Recommended)

```bash
npm run cli -- config --setup
```

Follow the prompts to enter your API keys.

### Option 2: Manual Setup

Create a `.env` file in the project root:

```env
PERPLEXITY_API_KEY=your_perplexity_key_here
BRAVE_API_KEY=your_brave_key_here
EXA_API_KEY=your_exa_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here
```

## 🎯 Your First Research

### Using the CLI

```bash
# Simple research
npm run cli -- research --topic "latest breakthroughs in quantum computing"

# With options
npm run cli -- research \
  --topic "AI reasoning models comparison" \
  --depth comprehensive \
  --personalities sovereignty_architect,abundance_amplifier
```

### Using the Web UI

```bash
# Start the API server
npm run api

# In another terminal, start the web UI
npm run web

# Open http://localhost:5173 in your browser
```

## 📊 Understanding the Output

TimeTravel provides research results in multiple formats:

### Markdown Report

```markdown
# Research Report: [Your Topic]

## Executive Summary

Key findings and insights...

## Tier 1: Base Exploration

Initial findings across multiple sources...

## Tier 2: Deep Dives

Detailed analysis of high-relevance topics...

## Tier 3: Strategic Synthesis

Final recommendations and positioning...

## Personality Perspectives

### Sovereignty Architect

Technical implementation considerations...

### Abundance Amplifier

Growth opportunities and 10x potential...
```

### JSON Output

```json
{
  "id": "research-uuid",
  "topic": "your research topic",
  "findings": [...],
  "synthesis": "...",
  "metadata": {
    "duration": 180,
    "sources": 24,
    "quality": 0.85
  }
}
```

## 🎭 Using Personalities

TimeTravel applies different analytical perspectives to your research:

```bash
# List available personalities
npm run cli -- personality --list

# Use specific personalities
npm run cli -- research \
  --topic "blockchain scalability solutions" \
  --personalities cortisol_guardian,practical_builder
```

### Core Personalities

- **sovereignty_architect**: Focus on independence and self-reliance
- **abundance_amplifier**: Identify 10x growth opportunities
- **cortisol_guardian**: Risk assessment and threat analysis
- **practical_builder**: Implementation and feasibility focus

## 🛠️ Common Use Cases

### Technology Research

```bash
npm run cli -- research --topic "compare React vs Vue vs Svelte for enterprise apps" --depth comprehensive
```

### Market Analysis

```bash
npm run cli -- research --topic "AI startup opportunities in healthcare 2025" --personalities abundance_amplifier,strategic_commander
```

### Academic Research

```bash
npm run cli -- research --topic "recent advances in transformer architectures" --sources arxiv,semantic_scholar
```

## 🔧 Troubleshooting

### API Key Issues

```bash
# Validate your API keys
npm run cli -- config --validate
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Research Timeouts

- Use `--depth quick` for faster results
- Check your internet connection
- Verify API rate limits

## 📚 Next Steps

- Read the [Architecture Overview](../architecture/overview.md)
- Learn about [Research Methodology](./research-methodology.md)
- Explore [Personality System](./personality-modes.md)
- Join our [Discord Community](#)

## 💡 Tips

1. **Start Simple**: Begin with quick searches before comprehensive research
2. **Experiment with Personalities**: Different perspectives reveal different insights
3. **Save Important Research**: Results are stored in `outputs/` directory
4. **Monitor Costs**: Check API usage in your provider dashboards

---

Need help? Open an issue on GitHub or reach out in our community!
