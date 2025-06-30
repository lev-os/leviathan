# @lev-os/research Plugin Architecture

## Overview

A config-driven, abstract research system that can monitor any source, perform scheduled collection, and trigger downstream workflows in the Lev ecosystem.

## Core Concepts

### Research Plan

A research plan is a **workflow** defined in YAML that:

- Specifies sources to monitor
- Defines collection schedules
- Configures processing steps
- Triggers downstream actions

### Source Abstraction

Each source has:

- **Type**: twitter, github, arxiv, rss, api, scrape
- **Handler**: How to collect data
- **Schema**: Expected output format
- **Validators**: Dry-run checks

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Research Plan Engine                     │
├─────────────────────────────────────────────────────────┤
│  Plan Loader → Scheduler → Collector → Processor → Handoff │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Source Handlers                        │
├─────────────────────────────────────────────────────────┤
│  Twitter API │ GitHub │ arXiv │ ~/cb3 │ Custom APIs    │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Event System                           │
├─────────────────────────────────────────────────────────┤
│  Webhooks │ Lev Events │ Enterprise Events │ Triggers   │
└─────────────────────────────────────────────────────────┘
```

## Research Plan Schema

```yaml
# research-plans/ai-ecosystem.yaml
version: '1.0'
name: 'AI Ecosystem Monitor'
description: 'Track AI research, repos, and discussions'

schedule:
  default: daily
  timezone: UTC

sources:
  # Twitter Monitoring
  - id: ai-researchers
    type: twitter
    handler: api # or cb3
    schedule: hourly
    config:
      accounts:
        - karpathy
        - ylecun
        - GaryMarcus
        - ilyasut
      keywords:
        - 'new paper'
        - 'breakthrough'
        - 'open source'
      max_results: 100

  # GitHub Repository Tracking
  - id: trending-ai-repos
    type: github
    handler: api
    schedule: daily
    config:
      queries:
        - 'language:python stars:>100 created:>2025-01-01 topic:machine-learning'
        - 'language:rust topic:llm'
      watch_repos:
        - openai/whisper
        - pytorch/pytorch
        - huggingface/transformers
      track_metrics:
        - stars
        - forks
        - issues
        - releases

  # Academic Papers
  - id: arxiv-ml
    type: arxiv
    handler: api
    schedule: daily
    config:
      categories:
        - cs.AI
        - cs.LG
        - cs.CL
      max_results: 50
      sort: submittedDate

  # Custom Scraping
  - id: hacker-news
    type: scrape
    handler: cb3
    schedule: hourly
    config:
      url: 'https://news.ycombinator.com/newest'
      selectors:
        title: '.titleline > a'
        discussion: '.subtext > a:last-child'
      filters:
        - contains: ['AI', 'LLM', 'GPT']

processing:
  # LLM Analysis Step
  - id: analyze-trends
    type: llm
    model: gpt-4
    prompt_template: |
      Analyze the following research data and identify:
      1. Emerging trends
      2. Notable papers/projects
      3. Community sentiment
      4. Opportunities

      Data: {{sources}}

  # Pattern Detection
  - id: detect-patterns
    type: flowmind
    config:
      memory_integration: true
      pattern_types:
        - convergence
        - divergence
        - breakthrough

# Handoff to downstream workflows
handoff:
  - id: interesting-repos
    condition: |
      sources.trending-ai-repos.new_count > 0 AND
      processing.analyze-trends.interest_score > 7
    action:
      type: workflow
      target: workshop-intake
      config:
        repos: '{{sources.trending-ai-repos.new_repos}}'

  - id: trend-alert
    condition: |
      processing.detect-patterns.breakthrough == true
    action:
      type: webhook
      url: '${WEBHOOK_URL}'
      payload:
        event: breakthrough_detected
        data: '{{processing.detect-patterns.results}}'

outputs:
  - type: file
    path: 'outputs/research/{{date}}/summary.md'
  - type: memory
    namespace: research-insights
  - type: event
    channel: research-updates
```

## Source Handler Types

### 1. API Handler

```yaml
# handlers/twitter-api.yaml
type: api
auth:
  method: bearer
  token: '${TWITTER_BEARER_TOKEN}'
endpoints:
  search:
    url: 'https://api.twitter.com/2/tweets/search/recent'
    params:
      query: '{{query}}'
      max_results: '{{max_results}}'
  timeline:
    url: 'https://api.twitter.com/2/users/{{user_id}}/tweets'
transform:
  - extract: data
  - map:
      id: id
      text: text
      author: author_id
      created_at: created_at
```

### 2. CB3 Handler

```yaml
# handlers/cb3-scraper.yaml
type: cb3
binary: '~/cb3'
commands:
  twitter:
    template: 'scrape --url https://twitter.com/{{username}} --format json'
  youtube:
    template: 'download --url {{url}} --transcript-only'
  generic:
    template: 'scrape --url {{url}} --selectors {{selectors}}'
```

## Research Plan Agent

The agent helps users create research plans interactively:

```yaml
# agents/research-plan-creator.yaml
name: Research Plan Creator
personality: methodical, thorough
steps:
  1_understand_goal:
    prompt: |
      What are you trying to research or monitor?
      Examples: AI breakthroughs, competitor activity, market trends

  2_identify_sources:
    prompt: |
      Based on {{goal}}, I recommend monitoring:
      {{suggested_sources}}

      What specific accounts, repos, or keywords?
    actions:
      - search_web: Find relevant sources
      - validate_source: Check if we can access

  3_set_schedule:
    prompt: |
      How often should I check these sources?
      - Hourly: Twitter, news
      - Daily: GitHub, arXiv
      - Weekly: Deep analysis

  4_configure_processing:
    prompt: |
      What should I do with the data?
      - Summarize findings
      - Detect patterns
      - Alert on breakthroughs
      - Trigger workflows

  5_dry_run:
    prompt: |
      Let's test your configuration...
    actions:
      - test_each_source
      - show_sample_output
      - validate_handoffs
```

## Implementation Phases

### Phase 1: Core Engine

```javascript
// src/engine/research-plan.js
class ResearchPlan {
  constructor(config) {
    this.config = this.validateConfig(config)
    this.sources = this.initializeSources()
    this.scheduler = new Scheduler(this.config.schedule)
  }

  async execute() {
    const data = await this.collectFromSources()
    const processed = await this.runProcessing(data)
    await this.handleHandoffs(processed)
    return this.generateOutputs(processed)
  }

  async dryRun() {
    console.log('🧪 Running dry run...')
    for (const source of this.sources) {
      try {
        const sample = await source.testConnection()
        console.log(`✅ ${source.id}: Connected successfully`)
        console.log(`   Sample: ${JSON.stringify(sample, null, 2)}`)
      } catch (error) {
        console.log(`❌ ${source.id}: ${error.message}`)
      }
    }
  }
}
```

### Phase 2: Source Handlers

```javascript
// src/handlers/twitter-handler.js
class TwitterHandler extends BaseHandler {
  async collect(config) {
    const results = []

    // Collect from accounts
    for (const account of config.accounts) {
      const tweets = await this.getTimeline(account)
      results.push(...tweets)
    }

    // Search keywords
    for (const keyword of config.keywords) {
      const tweets = await this.search(keyword)
      results.push(...tweets)
    }

    return this.transform(results)
  }
}
```

### Phase 3: Processing Pipeline

```javascript
// src/processing/llm-processor.js
class LLMProcessor {
  async process(data, config) {
    const prompt = this.renderTemplate(config.prompt_template, { sources: data })

    const response = await this.llm.complete({
      model: config.model,
      prompt,
      temperature: 0.7,
    })

    return this.parseResponse(response)
  }
}
```

### Phase 4: Handoff System

```javascript
// src/handoff/workflow-handoff.js
class WorkflowHandoff {
  async execute(action, context) {
    const { target, config } = action

    // Prepare handoff data
    const handoffData = {
      source: 'research-plan',
      timestamp: new Date(),
      context,
      config,
    }

    // Trigger target workflow
    if (target === 'workshop-intake') {
      await this.triggerWorkshopIntake(handoffData)
    }
  }

  async triggerWorkshopIntake(data) {
    // Call workshop intake with discovered repos
    const repos = data.config.repos

    await exec(`cd ~/lev/workshop && ./intake.sh ${repos.join(' ')}`)
  }
}
```

## CLI Usage

```bash
# Create new research plan
lev research create

# Run from config
lev research run ai-ecosystem.yaml

# Dry run to test
lev research dry-run ai-ecosystem.yaml

# Schedule persistent monitoring
lev research schedule ai-ecosystem.yaml

# View active plans
lev research list

# Check plan status
lev research status ai-ecosystem
```

## Integration Points

### 1. Lev Ecosystem

- Memory: Store insights
- Workshop: Analyze repos
- Validation: Verify findings
- Debug: Monitor execution

### 2. Enterprise Events

- Publish to ~/k event bus
- Subscribe to external triggers
- Webhook integrations

### 3. Bi-directional LLM

- Agent can modify plans
- Dynamic source addition
- Adaptive scheduling

## Example: AI Research Workflow

```yaml
# Complete example tracking AI ecosystem
name: 'AI Ecosystem Intelligence'

sources:
  - id: twitter-ai
    type: twitter
    handler: api
    accounts: [karpathy, ylecun]
    keywords: ['new model', 'paper:', 'breakthrough']

  - id: github-trending
    type: github
    handler: api
    query: 'stars:>50 created:>{{last_run}} language:python topic:ai'

  - id: arxiv-daily
    type: arxiv
    categories: [cs.AI, cs.LG]

processing:
  - analyze-with-gpt4:
      prompt: 'Identify key developments and opportunities'
  - detect-patterns:
      type: flowmind
      memory: true

handoff:
  - condition: 'new_repo.stars > 1000'
    action:
      type: workflow
      target: workshop-intake
      params:
        repo: '{{new_repo.url}}'
        priority: high
```

This architecture provides:

- **Flexibility**: Any source, any schedule
- **Integration**: Hooks into Lev ecosystem
- **Intelligence**: LLM analysis built-in
- **Automation**: Hands-free monitoring
- **Extensibility**: Easy to add new sources

Ready to implement the first phase? 🚀
