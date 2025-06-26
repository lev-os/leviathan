# Available MCP Tools from ClaudeBrowser

This document catalogs the MCP tools available in the `~/cb` (claudebrowser-v2) directory that can be used with Smithery for deep research needs.

## Overview

The ClaudeBrowser environment provides access to numerous MCP servers and tools that can be integrated with Smithery for comprehensive research capabilities.

## Available Tools

### 1. Browser MCP

- **Location**: `~/cb/browser-mcp/`
- **Purpose**: Browser automation and web interaction
- **Use Cases**:
  - Web scraping
  - Dynamic content interaction
  - Form submission
  - Screenshot capture

### 2. MCP Server Scraper

- **File**: `~/cb/mcp_server_scraper.py`
- **Purpose**: Scrape and catalog MCP servers
- **Use Cases**:
  - Discovering new MCP servers
  - Analyzing server capabilities
  - Building server inventories

### 3. MCP Demo Scraper

- **File**: `~/cb/mcp_demo_scraper.py`
- **Purpose**: Demonstrate MCP scraping capabilities
- **Use Cases**:
  - Testing MCP integrations
  - Learning MCP patterns
  - Prototyping scrapers

## Integration with Smithery

These tools can be integrated with Smithery in several ways:

### Local Development

```bash
# Use the Smithery CLI to run local MCP servers
npx @smithery/cli run ~/cb/browser-mcp
```

### Custom Deployment

Create a `smithery.yaml` in the tool directory:

```yaml
runtime: 'container'
build:
  dockerfile: 'Dockerfile'
  dockerBuildPath: '.'
startCommand:
  type: 'http'
  configSchema:
    type: 'object'
    properties:
      browserOptions:
        type: 'object'
        properties:
          headless:
            type: 'boolean'
            default: true
```

### Research Workflow Integration

1. **Web Research Pipeline**:

   - Use Browser MCP for dynamic content access
   - Combine with Smithery's web search MCPs
   - Feed results to analysis MCPs

2. **Documentation Scraping**:

   - Use scrapers to gather technical documentation
   - Process with Smithery's text analysis tools
   - Store in vector databases via Smithery MCPs

3. **API Discovery**:
   - Use MCP server scraper to find new tools
   - Test with Smithery's playground
   - Deploy successful integrations

## Best Practices

1. **Security**: Always validate scraped content before processing
2. **Rate Limiting**: Respect website rate limits when scraping
3. **Caching**: Use Smithery's caching capabilities to avoid redundant requests
4. **Error Handling**: Implement robust error handling for network failures

## Future Additions

As new MCP tools are added to the ClaudeBrowser environment, they should be documented here with:

- Tool name and location
- Primary purpose
- Integration instructions
- Example use cases

---

_Note: This is a living document. Update as new MCP tools become available in the ClaudeBrowser environment._
