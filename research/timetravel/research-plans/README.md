# Research Plan System

An abstract, config-driven research monitoring system that's part of the @lev-os ecosystem.

## Overview

The Research Plan System allows you to:

- Monitor any source (Twitter, GitHub, arXiv, websites, etc.)
- Schedule automated collection (hourly, daily, weekly)
- Process data with LLM analysis
- Trigger workflows based on findings
- Hand off to other Lev components

## Quick Start

### 1. Create a Research Plan

Use the interactive creator:

```bash
node src/agents/research-plan-creator.js
```

Or copy an example:

```bash
cp research-plans/timetravel-ai-research.yaml research-plans/my-plan.yaml
# Edit my-plan.yaml
```

### 2. Test Your Plan

Always dry-run first to test connections:

```bash
node src/research-plan-engine.js dry-run research-plans/my-plan.yaml
```

### 3. Run Once

Execute the plan manually:

```bash
node src/research-plan-engine.js run research-plans/my-plan.yaml
```

### 4. Schedule Continuous Monitoring

Set up automated collection:

```bash
node src/research-plan-engine.js schedule research-plans/my-plan.yaml
```

## Research Plan Structure

```yaml
version: '1.0'
name: 'My Research Plan'
description: "What I'm monitoring"

# Environment variables needed
env:
  - TWITTER_BEARER_TOKEN
  - GITHUB_TOKEN
  - PERPLEXITY_API_KEY

# Collection schedule
schedule:
  default: daily
  timezone: UTC

# Data sources
sources:
  - id: twitter-ai
    type: twitter
    handler: api # or cb3
    schedule: hourly
    config:
      accounts: [karpathy, ylecun]
      keywords: ['new paper', 'breakthrough']
      max_results: 200

# Processing pipeline
processing:
  - id: trend-analysis
    type: llm
    model: gpt-4
    prompt_template: |
      Analyze trends and breakthroughs...

# Workflow handoffs
handoff:
  - id: workshop-intake
    condition: 'new_repos.length > 0'
    action:
      type: workflow
      target: workshop-intake

# Output configuration
outputs:
  - type: file
    path: 'outputs/{{date}}/summary.md'
  - type: memory
    namespace: research-insights
```

## Source Types

### Twitter/X

- Monitor accounts and keywords
- Requires `TWITTER_BEARER_TOKEN`
- Falls back to cb3 scraping if API fails

### GitHub

- Track repos, search queries
- Monitor stars, forks, releases
- Requires `GITHUB_TOKEN`

### arXiv

- Academic papers by category
- No API key required

### PubMed

- Medical research papers
- Requires API key

### Reddit/HackerNews

- Community discussions
- Uses cb3 scraping

### Custom Websites

- Scrape any URL with cb3
- CSS selectors for extraction

## Processing Options

### Aggregate

- Deduplicate results
- Merge similar items

### LLM Analysis

- Trend detection
- Breakthrough identification
- Opportunity analysis

### Pattern Detection

- Cross-source convergence
- Cascade effects (paper → code → product)

### Perplexity Deep Dive

- In-depth research on breakthroughs
- Requires `PERPLEXITY_API_KEY`

## Handoff Actions

### Workshop Intake

```yaml
action:
  type: workflow
  target: workshop-intake
  config:
    repos: '{{matching_repos}}'
```

### Webhooks

```yaml
action:
  type: webhook
  url: '${SLACK_WEBHOOK_URL}'
  payload:
    text: 'Breakthrough detected'
```

### Memory Updates

```yaml
action:
  type: memory
  namespace: ai-insights
  operation: append
```

## Environment Setup

Required environment variables:

```bash
# Twitter API v2
export TWITTER_BEARER_TOKEN="your-token"

# GitHub API
export GITHUB_TOKEN="your-token"

# OpenAI (for LLM processing)
export OPENAI_API_KEY="your-key"

# Perplexity (optional)
export PERPLEXITY_API_KEY="your-key"

# cb3 path (optional)
export CB3_PATH="~/cb3"
```

## Examples

### AI Research Plan

Monitor AI/ML developments across papers, code, and discussions:

```bash
node src/research-plan-engine.js run research-plans/timetravel-ai-research.yaml
```

### Competitive Intelligence

Track competitor GitHub repos and Twitter:

```bash
node src/agents/research-plan-creator.js
# Select: Competitive Intelligence
# Add competitor accounts and repos
```

### Medical AI Monitoring

Focus on clinical AI and FDA approvals:

```bash
# Use the creator and select Medical/Clinical AI
node src/agents/research-plan-creator.js
```

## Integration with Lev Ecosystem

### Workshop Integration

Discovered repos can trigger automatic workshop analysis:

```yaml
handoff:
  - id: workshop-intake
    condition: 'repo.stars > 1000'
    action:
      type: workflow
      target: workshop-intake
```

### Memory System

Research insights are stored in Lev's memory:

```yaml
outputs:
  - type: memory
    namespace: research-insights
    operation: upsert
```

### Event Bus

Emit events for enterprise integration:

```yaml
outputs:
  - type: event
    channel: research-updates
    event: daily-summary
```

## Troubleshooting

### Twitter API Issues

- Check rate limits: 300 requests/15min
- Use cb3 fallback: `export USE_CB3_FOR_TWITTER=true`

### GitHub Rate Limiting

- Authenticated: 5000 requests/hour
- Use search wisely

### Memory Errors

- Ensure memory system is initialized
- Check namespace permissions

## Next Steps

1. **Create your first plan**: `node src/agents/research-plan-creator.js`
2. **Test it**: `node src/research-plan-engine.js dry-run your-plan.yaml`
3. **Schedule it**: `node src/research-plan-engine.js schedule your-plan.yaml`
4. **Monitor outputs**: Check `outputs/research/` directory

## Contributing

This will become the `@lev-os/research` plugin. Contributions welcome!

- Add new source handlers in `src/handlers/`
- Add processors in `src/processors/`
- Add handoff types in `src/handoff/`
