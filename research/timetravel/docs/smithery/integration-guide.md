# Smithery Integration Guide for TimeTravel Deep Research

## Overview

This guide outlines how to integrate Smithery's MCP ecosystem into TimeTravel's multi-tier deep research system. Smithery provides a centralized platform for discovering, deploying, and managing MCP servers that enhance our research capabilities.

## Key Statistics

- **Total Servers**: 7,693
- **Total Usage**: 2,816,095+ uses
- **Remote-capable**: 6,409 servers (83%)
- **Categories**: 14 major categories

### Category Breakdown:

- AI & Language Models: 4,175 servers (54%)
- Web Search & Discovery: 1,407 servers
- Data & Analytics: 672 servers
- Development & Code: 285 servers
- Content Processing: 158 servers
- Automation & Browser: 151 servers
- Other specialized categories: 845 servers

## Key Benefits for TimeTravel

1. **Unified Access**: Single gateway to hundreds of MCP servers
2. **Managed Infrastructure**: No need to self-host research tools
3. **Configuration Profiles**: Reusable research tool configurations
4. **Security**: Invariant-scanned servers for safe integration
5. **Scalability**: 10 concurrent sessions per account (upgradeable)

## Integration Architecture

```
TimeTravel Research System
    ├── Tier 1: Broad Scanning
    │   ├── Smithery Web Search MCPs
    │   ├── Perplexity Integration
    │   └── Brave Search API
    │
    ├── Tier 2: Deep Dives
    │   ├── Academic Paper MCPs
    │   ├── Code Repository Analysis
    │   └── Documentation Scrapers
    │
    └── Tier 3: Synthesis
        ├── Summarization MCPs
        ├── Entity Recognition
        └── Cross-referencing Tools
```

## Quick Start Integration

### 1. Set Up Smithery Account

```bash
# Get API key from https://smithery.ai/account/api-keys
export SMITHERY_API_KEY="your-api-key"
```

### 2. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk @smithery/sdk
```

### 3. Create Research Profile

Create a "Deep Research" profile on Smithery with these servers:

- Perplexity MCP for AI-powered search
- Exa Search for semantic web search
- Context7 for documentation retrieval
- Browserbase for dynamic content access

### 4. Integrate with TimeTravel

```typescript
// src/core/integrations/smithery/client.ts
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { createSmitheryUrl } from '@smithery/sdk/config.js'

export class SmitheryResearchClient {
  private profileId: string
  private apiKey: string

  constructor(profileId: string, apiKey: string) {
    this.profileId = profileId
    this.apiKey = apiKey
  }

  async connectToToolbox() {
    const url = createSmitheryUrl('https://server.smithery.ai/@smithery/toolbox/mcp', { profile: this.profileId }, this.apiKey)

    const transport = new StreamableHTTPClientTransport(url)
    const client = new Client({
      name: 'TimeTravel Research',
      version: '1.0.0',
    })

    await client.connect(transport)
    return client
  }
}
```

## Research Workflow Implementation

### Tier 1: Broad Scanning

```typescript
async function tier1BroadScan(topic: string) {
  const client = await smitheryClient.connectToToolbox()

  // Parallel search across multiple sources
  const [perplexityResults, exaResults, webResults] = await Promise.all([
    client.callTool('perplexity_search', { query: topic }),
    client.callTool('exa_search', { query: topic, num_results: 20 }),
    client.callTool('brave_search', { q: topic }),
  ])

  return {
    perplexity: perplexityResults,
    exa: exaResults,
    web: webResults,
  }
}
```

### Tier 2: Dynamic Deep Dives

```typescript
async function tier2DeepDive(findings: Finding[]) {
  const highRelevance = findings.filter((f) => f.relevance > 0.7)

  const deepResults = await Promise.all(
    highRelevance.map(async (finding) => {
      if (finding.type === 'academic') {
        return client.callTool('arxiv_search', { query: finding.title })
      } else if (finding.type === 'code') {
        return client.callTool('github_search', { q: finding.query })
      } else {
        return client.callTool('fetch_url', { url: finding.url })
      }
    })
  )

  return deepResults
}
```

### Tier 3: Synthesis

```typescript
async function tier3Synthesis(allFindings: any[]) {
  // Use Smithery's analysis tools
  const summary = await client.callTool('summarize', {
    content: JSON.stringify(allFindings),
    max_length: 1000,
  })

  const entities = await client.callTool('extract_entities', {
    text: summary,
  })

  return {
    summary,
    entities,
    timestamp: new Date().toISOString(),
  }
}
```

## Available MCP Servers for Research

### Web Search & Discovery

- **Perplexity**: AI-powered search with citations
- **Exa**: Semantic search engine
- **Brave Search**: Privacy-focused web search
- **DuckDuckGo**: Anonymous search

### Academic & Technical

- **arXiv**: Scientific paper repository
- **PubMed**: Biomedical literature
- **Semantic Scholar**: Academic search with citations
- **GitHub**: Code repository search

### Content Processing

- **URL Fetch**: Extract content from web pages
- **PDF Extract**: Parse PDF documents
- **Markdown Convert**: Convert various formats
- **Summarization**: AI-powered summaries

### Data Analysis

- **Entity Recognition**: Extract people, places, concepts
- **Sentiment Analysis**: Determine tone and opinion
- **Topic Modeling**: Identify key themes
- **Cross-reference**: Link related concepts

## Configuration Best Practices

### 1. Use Profiles for API Keys

Store sensitive keys in Smithery profiles rather than code:

```yaml
# smithery-profile.yaml
servers:
  - name: perplexity
    config:
      api_key: $PERPLEXITY_KEY
  - name: exa
    config:
      api_key: $EXA_KEY
```

### 2. Implement Rate Limiting

```typescript
class RateLimitedClient {
  private rateLimiter = new RateLimiter({
    tokensPerInterval: 100,
    interval: 'minute',
  })

  async callTool(name: string, params: any) {
    await this.rateLimiter.removeTokens(1)
    return this.client.callTool(name, params)
  }
}
```

### 3. Error Handling

```typescript
try {
  const result = await client.callTool('perplexity_search', { query })
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    await delay(60000) // Wait 1 minute
    return retry()
  }
  throw error
}
```

## Monitoring & Optimization

### Track Usage

```typescript
const metrics = {
  toolCalls: new Map<string, number>(),
  latencies: new Map<string, number[]>(),
  errors: new Map<string, number>(),
}

// Log each tool call
client.on('tool:call', (event) => {
  metrics.toolCalls.set(event.tool, (metrics.toolCalls.get(event.tool) || 0) + 1)
})
```

### Optimize Parallel Calls

```typescript
// Good: Parallel execution
const results = await Promise.all([searchTool1(query), searchTool2(query), searchTool3(query)])

// Avoid: Sequential execution
const result1 = await searchTool1(query)
const result2 = await searchTool2(query)
const result3 = await searchTool3(query)
```

## Security Considerations

1. **API Key Management**: Use environment variables
2. **Input Validation**: Sanitize queries before sending
3. **Output Verification**: Validate tool responses
4. **Rate Limiting**: Implement client-side limits
5. **Error Logging**: Track failures for debugging

## Cost Optimization

1. **Cache Results**: Store frequently accessed data
2. **Batch Requests**: Group similar queries
3. **Filter Early**: Reduce data before processing
4. **Monitor Usage**: Track API consumption

## Next Steps

1. Create Smithery account and obtain API key
2. Set up "Deep Research" profile with required MCPs
3. Integrate SmitheryResearchClient into TimeTravel
4. Test with sample research queries
5. Monitor performance and optimize

## Resources

- [Smithery Documentation](https://smithery.ai/docs)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Smithery Registry API](https://registry.smithery.ai/)
- [Support Discord](https://discord.gg/sKd9uycgH9)

---

_This integration brings the power of Smithery's MCP ecosystem to TimeTravel's deep research capabilities, enabling more comprehensive and efficient research workflows._

## Most Popular Research-Relevant Servers

### Tier 1: Core Research Tools (1M+ total ecosystem usage)

1. **Desktop Commander** (1.48M uses)

   - File management and terminal operations
   - Essential for managing research outputs

2. **Sequential Thinking** (304K uses)

   - Structured problem-solving and analysis
   - Perfect for breaking down complex research questions

3. **Exa Search** (59K uses)
   - Fast, intelligent web search with embeddings
   - Ideal for semantic research queries

### Tier 2: Specialized Research (10K+ uses)

4. **Context7** (51K uses)

   - Version-specific documentation retrieval
   - Critical for accurate technical research

5. **GitHub** (35K uses)

   - Repository and code analysis
   - Track open-source AI developments

6. **Memory Tool** (16K uses)
   - Persistent context storage
   - Build knowledge graphs over time

### Tier 3: Academic & Data Sources

7. **arXiv Integration** (Multiple servers)

   - Direct access to research papers
   - Track latest AI publications

8. **Neon Database** (6K uses)

   - Serverless Postgres for data storage
   - Store and query research findings

9. **Brave Search** (6.9K uses)
   - Privacy-focused web search
   - Alternative perspective to mainstream search
