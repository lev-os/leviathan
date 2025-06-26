# Smithery MCP Servers for Deep Research

## Overview

Based on the scraped Smithery catalog, here are the most relevant MCP servers for TimeTravel's multi-tier deep research system. These servers provide comprehensive coverage for academic research, web search, content processing, and analysis.

## Tier 1: Broad Scanning

### Featured Research Tools

1. **Perplexity** - AI-powered search with citations

   - URL: https://smithery.ai/server/perplexity
   - Category: Featured
   - Perfect for: Initial topic exploration with AI-generated summaries

2. **Exa Search** - Semantic search engine

   - URL: https://smithery.ai/server/exa
   - Category: Featured
   - Perfect for: Finding semantically related content

3. **Brave Search** - Privacy-focused web search

   - URL: https://smithery.ai/server/brave-search
   - Category: Web Search
   - Perfect for: General web search without tracking

4. **Google Search** - Google search integration
   - URL: https://smithery.ai/server/google-search
   - Category: Web Search
   - Perfect for: Comprehensive web results

## Tier 2: Deep Dives

### Academic & Technical

1. **arXiv** - Scientific paper repository

   - URL: https://smithery.ai/server/arxiv
   - Category: Academic
   - Perfect for: Cutting-edge research papers

2. **PubMed** - Biomedical literature database

   - URL: https://smithery.ai/server/pubmed
   - Category: Academic
   - Perfect for: Medical and life sciences research

3. **Semantic Scholar** - Academic search with citations

   - URL: https://smithery.ai/server/semantic-scholar
   - Category: Academic
   - Perfect for: Citation tracking and related papers

4. **GitHub** - Code repository search and analysis
   - URL: https://smithery.ai/server/github
   - Category: Popular
   - Perfect for: Technical implementations and code examples

### Content Processing

1. **URL Fetch** - Extract content from web pages

   - URL: https://smithery.ai/server/url-fetch
   - Category: Content Processing
   - Perfect for: Scraping specific web pages

2. **PDF Extract** - Parse PDF documents

   - URL: https://smithery.ai/server/pdf-extract
   - Category: Content Processing
   - Perfect for: Extracting text from research papers

3. **Browser Use** - Browser automation for web interaction
   - URL: https://smithery.ai/server/browser-use
   - Category: Featured
   - Perfect for: Dynamic content that requires JavaScript

## Tier 3: Synthesis & Analysis

### Knowledge & Context

1. **Context7** - Documentation retrieval system

   - URL: https://smithery.ai/server/@upstash/context7-mcp
   - Category: Featured
   - Perfect for: Technical documentation lookup

2. **Wikipedia** - Wikipedia content access

   - URL: https://smithery.ai/server/wikipedia
   - Category: Knowledge Base
   - Perfect for: General knowledge and background

3. **Memory Tool** - Store and retrieve context
   - URL: https://smithery.ai/server/memory
   - Category: Memory Management
   - Perfect for: Maintaining research context across sessions

## Specialized Research Categories

### News & Current Events

- **News API** - News aggregation
- **Hacker News** - Tech news and discussions
- **Reddit** - Community discussions
- **Twitter/X** - Real-time social media insights

### Financial & Market Research

- **Stock Market** - Stock market data
- **Cryptocurrency** - Crypto market data

### Technical Analysis

- **Gitingest** - Code repository ingestion
- **Elasticsearch** - Full-text search capabilities
- **MongoDB**, **PostgreSQL**, **Redis** - Database integrations

### AI Model Access

- **OpenAI** - OpenAI API integration
- **Anthropic** - Claude API integration

## Integration Example

```typescript
// TimeTravel Deep Research Configuration
const researchProfile = {
  tier1: [
    'perplexity', // AI-powered initial search
    'exa', // Semantic search
    'brave-search', // Privacy-focused web search
  ],
  tier2: [
    'arxiv', // Academic papers
    'semantic-scholar', // Citation tracking
    'github', // Code examples
    'url-fetch', // Web scraping
  ],
  tier3: [
    'context7', // Documentation
    'wikipedia', // Background knowledge
    'memory', // Context persistence
  ],
}
```

## Usage Recommendations

### For Academic Research

Combine: arXiv + Semantic Scholar + PubMed + PDF Extract

### For Technical Research

Combine: GitHub + Context7 + Gitingest + Stack Overflow (if available)

### For Market Research

Combine: News API + Stock Market + Cryptocurrency + Reddit

### For Comprehensive Analysis

Combine: Perplexity + Exa + Multiple specialized sources

## Next Steps

1. **Create Smithery Profile**: Set up a "Deep Research" profile with these servers
2. **Configure API Keys**: Add necessary API keys for each service
3. **Test Integration**: Run sample queries through each tier
4. **Monitor Usage**: Track which servers provide the most value

---

_Note: This list represents 67 servers from Smithery's homepage. The full catalog at https://smithery.ai/servers contains thousands more specialized tools._
