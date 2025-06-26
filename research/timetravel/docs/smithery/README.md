# Smithery Documentation - Complete Reference

## Table of Contents

1. [Introduction](#introduction)
2. [Using MCP Servers](#using-mcp-servers)
3. [Building MCP Servers](#building-mcp-servers)
4. [Project Configuration](#project-configuration)
5. [Integration Approaches](#integration-approaches)
6. [Deep Research Applications](#deep-research-applications)

## Introduction

Smithery is a platform to help developers find and ship AI-native services designed to communicate with AI agents. All services follow the Model Context Protocol (MCP) specification.

### Key Features

- Centralized hub for discovering MCP servers
- Hosting and distribution for MCP servers
- Standardized interfaces for tool integration and configs

### Quick Start

```bash
# Install required packages
npm install @modelcontextprotocol/sdk @smithery/sdk

# For TypeScript development
npm install -g @smithery/cli
```

### Model Context Protocol (MCP)

The MCP is an open protocol that enables seamless integration between LLMs and external data sources and tools. It provides a universal standard for connecting AI systems with the context they need.

## Using MCP Servers

### Integration Approaches

#### 1. Direct User Authentication (Simpler)

Users authenticate directly with Smithery:

- Application redirects users to create Smithery accounts
- Smithery handles storing auth secrets and configurations
- Client only needs user's Smithery API key

**Benefits:**

- Simpler implementation
- Reduced security burden
- Users can reuse configurations across clients

#### 2. White-Label Integration

Application authenticates with Smithery under developer account:

- Application manages user secrets and configurations
- Authenticate with Smithery using developer credentials
- Send user configurations with each connection request

**Benefits:**

- Fully white-labeled experience
- Complete control over UX
- No need for users to create Smithery accounts

### Connecting to MCPs

#### Prerequisites

1. Install required packages:
   ```bash
   npm install @modelcontextprotocol/sdk @smithery/sdk
   ```
2. Smithery API key from [Dashboard](https://smithery.ai/account/api-keys)
3. Node.js 18+

#### Using a Profile (Recommended)

```typescript
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const profileId = 'your-profile-id'
const apiKey = 'your-api-key'
const serverName = 'server-name'

const transport = new StreamableHTTPClientTransport(
  `https://server.smithery.ai/${serverName}/mcp?profile=${profileId}&api_key=${apiKey}`
)

const client = new Client({
  name: 'Test Client',
  version: '1.0.0',
})

await client.connect(transport)
```

#### Manual Configuration

```typescript
// Get server details
const qualifiedName = '@browserbasehq/mcp-browserbase'
const response = await fetch(`https://registry.smithery.ai/servers/${qualifiedName}`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  },
})

const serverInfo = await response.json()
const httpConnection = serverInfo.connections.find((c) => c.type === 'http')

// Create connection
import { createSmitheryUrl } from '@smithery/sdk'

const url = createSmitheryUrl(serverUrl, config, apiKey)
const transport = new StreamableHTTPClientTransport(url)
const client = new Client({ name: 'client', version: '1.0.0' })
await client.connect(transport)
```

**Note:** Remote connections are limited to 10 free concurrent sessions per account.

### Session Configuration

Session configurations customize MCP server behavior for each client session. They allow users to provide API keys, adjust settings, or modify server operations.

### Registry API

The Registry API provides programmatic access to search for MCP servers. Available endpoints include server search, details retrieval, and configuration schema access.

### Deep Linking

Deep links provide seamless integration into supported clients:

```
${clientScheme}:mcp/install?${encodeURIComponent(config)}
```

Config schema:

```typescript
interface StdioMCPConfig {
  name: string
  type: 'stdio'
  command: string
  args: string[]
}

interface HttpMCPConfig {
  name: string
  type: 'http'
  url: string
}
```

## Building MCP Servers

### TypeScript Quick Start

#### 1. Install CLI

```bash
npm install -g @smithery/cli
```

#### 2. Initialize Project

```bash
npm create smithery
```

#### 3. Create Your Server

```typescript
// src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

export const configSchema = z.object({
  apiKey: z.string().describe('Required API key'),
  options: z
    .object({
      timeout: z.number().default(5000),
      retries: z.number().default(3),
    })
    .optional(),
})

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: 'My MCP Server',
    version: '1.0.0',
  })

  server.tool(
    'hello',
    'Say hello to someone',
    {
      name: z.string().describe('Name to greet'),
    },
    async ({ name }) => {
      return {
        content: [{ type: 'text', text: `Hello, ${name}!` }],
      }
    }
  )

  return server.server
}
```

#### 4. Configure Entry Point

```json
// package.json
{
  "name": "mcp-server",
  "module": "./src/index.ts",
  "type": "module"
}
```

#### 5. Start Development

```bash
npx @smithery/cli dev
```

#### 6. Deploy

Create `smithery.yaml`:

```yaml
runtime: typescript
```

### Advanced Build Configuration

Create `smithery.config.js`:

```javascript
export default {
  esbuild: {
    external: ['playwright-core', 'puppeteer-core'],
    minify: true,
    target: 'node18',
  },
}
```

### Deployment Options

#### TypeScript Deploy

For TypeScript MCP servers using the Smithery CLI:

- Create `smithery.yaml` with `runtime: "typescript"`
- Automatic builds using TypeScript runtime
- Best for TypeScript projects

#### Custom Deploy (Docker)

For any language with full control:

- Docker container implementing Streamable HTTP
- Listen on `PORT` environment variable
- Handle `/mcp` endpoint for GET, POST, DELETE

Technical requirements:

- Parse configuration from query parameters (dot-notation)
- Support nested properties in configuration

## Project Configuration

### Required Files

#### smithery.yaml

Specifies how to run your server:

```yaml
# TypeScript runtime
runtime: "typescript"
env:
  NODE_ENV: "production"

# OR Container runtime
runtime: "container"
startCommand:
  type: "http"
  configSchema:
    type: "object"
    properties:
      apiKey:
        type: "string"
        description: "Your API key"
    required: ["apiKey"]
  exampleConfig:
    apiKey: "sk-example123"
build:
  dockerfile: "Dockerfile"
  dockerBuildPath: "."
```

#### Dockerfile (for container runtime)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

**Requirements:** Linux Docker images (Alpine/Debian-based) with `sh` available.

### Best Practices

1. **Tool Discovery**: Implement "lazy loading"

   - List tools without requiring authentication
   - Only validate API keys when tools are invoked
   - Allows users to discover capabilities before configuration

2. **Testing**: Use MCP Inspector locally before deploying
3. **Configuration**: Use configSchema for proper validation
4. **Docker**: Keep images minimal with appropriate base images

## GitHub Integration

### Permissions Required

| Permission       | Read | Write | Description                         |
| ---------------- | ---- | ----- | ----------------------------------- |
| Contents         | ✓    | ✓     | Fetch/write source code for PRs     |
| Pull Requests    | ✓    | ✓     | Create PRs with inspection links    |
| Metadata         | ✓    | ✗     | Access repository information       |
| Checks           | ✓    | ✓     | Create status reports               |
| Commit Status    | ✓    | ✓     | Mark commits with deployment status |
| Deployments      | ✓    | ✓     | Manage deployment processes         |
| Issues           | ✓    | ✓     | Create issues for problems          |
| Repository Hooks | ✓    | ✓     | Create webhooks for automation      |

### Installation

1. **Automatic**: Prompted when creating new MCP server
2. **Manual**: Visit [GitHub App](https://github.com/apps/smithery-ai)
3. **Management**: Modify access in GitHub settings

## Deep Research Applications

### Available MCP Tools for Research

Smithery provides access to numerous MCP servers perfect for deep research:

1. **Web Search & Browsing**

   - Perplexity integration
   - Brave Web Search
   - URL fetching and parsing
   - Browser automation

2. **Data Sources**

   - Academic paper access
   - Code repository analysis
   - Documentation retrieval
   - API integrations

3. **Analysis Tools**
   - Content extraction
   - Summarization
   - Entity recognition
   - Cross-referencing

### Integration with TimeTravel Research System

For deep research needs, Smithery MCP servers can be integrated into multi-tier research workflows:

1. **Tier 1**: Broad scanning using web search MCPs
2. **Tier 2**: Deep dives with specialized data source MCPs
3. **Tier 3**: Synthesis using analysis and summarization MCPs

### Best Practices for Research MCPs

- Configure appropriate rate limits
- Store API keys securely in profiles
- Use concurrent connections for parallel research
- Implement proper error handling and retries

## Data Policy

### Hosted MCPs

- Smithery tracks tool calls for analytics
- Configuration data is ephemeral
- No data sold to third parties
- Individual MCP data handling varies by developer

### Local MCPs

- Install tracking (anonymous)
- Tool call tracking (with consent)
- Only tool names tracked, content redacted
- Configuration arguments are ephemeral

### Playground

- Conversations may be tracked for analytics
- Opt-out available in settings

---

_For support: [contact@smithery.ai](mailto:contact@smithery.ai) or join the [Discord community](https://discord.gg/sKd9uycgH9)_
