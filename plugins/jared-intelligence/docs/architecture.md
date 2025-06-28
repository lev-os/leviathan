# Jared Intelligence Architecture

## Fractal Hexagonal Architecture

This plugin implements a sophisticated fractal hexagonal architecture where everything is an adapter with clear ports.

### Core Principles

1. **Dependency Inversion**: Core domain NEVER depends on adapters
2. **Fractal Composition**: Adapters can contain other adapters
3. **Bidirectional Adapters**: Input (External→Domain) and Output (Domain→External)
4. **Protocol Agnostic Core**: Core doesn't know about MCP, HTTP, WebSocket
5. **Platform Agnostic Intelligence**: Slack, Discord, Teams are just adapters

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                         │
│  (Slack, Notion, MCP, HTTP, CB, Graphiti, Leviathan)       │
└─────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│                        ADAPTERS                              │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ Input Adapters  │              │ Output Adapters │      │
│  │                 │              │                 │      │
│  │ • MCP Protocol  │              │ • Lev Memory    │      │
│  │ • Slack Events  │              │ • Graphiti      │      ││  │ • HTTP REST     │              │ • Slack Notify  │      │
│  │ • CB Intel      │              │ • File System   │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│                      PORT INTERFACES                         │
│         (IConversationPort, IIntelligencePort,              │
│          IMemoryPort, INotificationPort)                    │
└─────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│                      CORE DOMAIN                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │           Pure Business Logic                     │      │
│  │                                                   │      │
│  │  • Conversation Processing                        │      │
│  │  • Project Memory Management                      │      │
│  │  • Intelligence Analysis                          │      │
│  │  • Opportunity Detection                          │      │
│  │                                                   │      │
│  │  No external dependencies!                        │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Adapter Categories

#### Input Adapters (External → Core)

1. **Protocol Adapters**
   - MCPAdapter: MCP protocol → Domain Commands
   - HTTPAdapter: REST API → Domain Commands  
   - WebSocketAdapter: Real-time → Domain Events

2. **Platform Adapters**
   - SlackAdapter: Slack Events → Conversations
   - NotionAdapter: Webhooks → Projects
   - GitHubAdapter: Webhooks → Intelligence

3. **Intelligence Adapters**
   - CBAdapter: Scraping → Intelligence
   - PerplexityAdapter: AI → Insights
   - NewsAPIAdapters: RSS → Intelligence

#### Output Adapters (Core → External)

1. **Storage Adapters**
   - LeviathanMemoryAdapter: Domain → Lev Plugin
   - GraphitiAdapter: Domain → Knowledge Graph
   - FileSystemAdapter: Domain → Local Brain

2. **Notification Adapters**
   - SlackNotifier: Events → Slack Messages
   - EmailNotifier: Events → Email
   - WebhookNotifier: Events → HTTP

3. **Integration Adapters**
   - WorkflowAdapter: Tasks → Lev Workflows
   - PatternAdapter: Decisions → Lev Patterns
   - AgentAdapter: Coordination → Lev Agents

### Fractal Composition Example

```javascript
// Adapters can contain other adapters
class UnifiedIntelligenceAdapter extends IIntelligencePort {
  constructor() {
    super();
    this.adapters = {
      cb: new CBScrapingAdapter(),
      perplexity: new PerplexityAdapter(),
      hackernews: new HackerNewsAdapter(),
      github: new GitHubAdapter()
    };
  }
  
  async gatherIntelligence(query) {
    // Orchestrate multiple adapters
    const results = await Promise.allSettled([
      this.adapters.cb.scrape(query.keywords),
      this.adapters.perplexity.search(query.topic),
      this.adapters.hackernews.fetchTrending(),
      this.adapters.github.getTrending()
    ]);
    
    return this.mergeIntelligenceResults(results);
  }
}
```

### Benefits

1. **True Hexagonal**: Every external system is an adapter
2. **Fractal**: Adapters compose at any level
3. **Testable**: Core logic has zero external dependencies
4. **Extensible**: New protocols/platforms are just new adapters
5. **Lev-Native**: First-class Leviathan plugin citizen
6. **Cloud/Local**: Same architecture works everywhere