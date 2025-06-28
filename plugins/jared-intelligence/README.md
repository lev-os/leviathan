# Jared Intelligence Coordinator - Leviathan Plugin

AI-powered intelligence coordination and project memory system with fractal hexagonal adapter architecture.

## Architecture Overview

This plugin implements a sophisticated fractal hexagonal architecture where everything is an adapter with clear ports:

```
JARED CORE (Pure Domain Logic)
    ↕️ Ports (Interfaces)
ADAPTERS (Bidirectional)
├── INPUT ADAPTERS (External → Core)
│   ├── Protocol Adapters (MCP, HTTP, WebSocket)
│   ├── Platform Adapters (Slack, Notion, GitHub)
│   └── Intelligence Adapters (CB, Perplexity, News APIs)
└── OUTPUT ADAPTERS (Core → External)
    ├── Storage Adapters (Leviathan, Graphiti, FileSystem)
    ├── Notification Adapters (Slack, Email)
    └── Integration Adapters (Lev Workflows, Patterns, Agents)
```

## Key Features

- **Fractal Composition**: Adapters can contain other adapters at any level
- **Protocol Agnostic**: Core domain doesn't know about MCP, HTTP, or WebSocket
- **Platform Agnostic**: Slack, Discord, Teams are just adapters
- **Bidirectional Flow**: Input adapters transform external to domain, output adapters transform domain to external
- **Dependency Inversion**: Core never depends on adapters, only on port interfaces## Installation

```bash
cd ~/lev/plugins/jared-intelligence
npm install
```

## Configuration

Set the following environment variables:

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_WORKSPACE_ID=T...

# Notion Configuration  
NOTION_TOKEN=ntn_...

# Graphiti Memory
GRAPHITI_ENDPOINT=http://localhost:8000
```

## Usage

### As a Leviathan Plugin

```javascript
import JaredIntelligencePlugin from '@lev/jared-intelligence';

const jared = new JaredIntelligencePlugin();
await jared.initialize();
```

### MCP Server Mode

The plugin exposes MCP tools for integration with Claude/Cursor:

- `chat_with_jared`: Have a conversation with Jared
- `gather_intelligence`: Gather intelligence on topics
- `update_project_status`: Update project status
- `search_opportunities`: Search for AI opportunities

## Architecture Details

### Core Domain

Pure business logic with no external dependencies:
- `Conversation`: Handles natural language processing
- `Project`: Manages project memory and relationships
- `Intelligence`: Processes and analyzes gathered intelligence
- `Memory`: Aggregates and manages all memory operations

### Port Interfaces

Contracts that adapters must implement:
- `IConversationPort`: Conversation handling capabilities
- `IIntelligencePort`: Intelligence gathering capabilities
- `IMemoryPort`: Memory storage capabilities
- `INotificationPort`: Notification capabilities

### Adapter Examples

#### MCP Protocol Adapter
Transforms MCP protocol requests into domain commands:
```javascript
const mcpAdapter = new MCPAdapter(conversationPort, intelligencePort);
const response = await mcpAdapter.handleChatTool({ message: "Hello Jared" });
```

#### Leviathan Memory Adapter
Integrates with Leviathan's memory system:
```javascript
const levAdapter = new LeviathanMemoryAdapter(levPlugin);
await levAdapter.store('conversations', conversationData);
```

## Development

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Integration with Jared2

This plugin is designed to work with the main Jared2 system at `~/digital/kingly/hub/jared2/`. It provides:

1. **Enhanced Conversation Engine**: NLP-based routing instead of slash commands
2. **Graphiti Integration**: Project memory and relationship tracking
3. **CB Intelligence Bridge**: Integration with ~/cb for intelligence gathering
4. **Meta-Intelligence**: Self-improvement through intelligence analysis

## Contributing

See the main Jared2 documentation at `~/digital/kingly/hub/jared2/_jared.md` for the complete architecture vision.