# TimeTravel Architecture Overview

## 🏗️ High-Level Architecture

TimeTravel follows a hexagonal (ports and adapters) architecture pattern, designed for flexibility and testability.

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interfaces                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │   CLI   │    │ Web UI  │    │   API   │    │   SDK   │ │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘ │
└───────┼──────────────┼──────────────┼──────────────┼───────┘
        │              │              │              │
        └──────────────┴──────┬───────┴──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Application     │
                    │      Core         │
                    │                   │
                    │ ┌───────────────┐ │
                    │ │Research Engine│ │
                    │ ├───────────────┤ │
                    │ │ Personality   │ │
                    │ │   Manager     │ │
                    │ ├───────────────┤ │
                    │ │    Tool       │ │
                    │ │ Orchestrator  │ │
                    │ └───────────────┘ │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                         Adapters                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐│
│  │Perplexity│    │  Brave  │    │Academic │    │Storage ││
│  │ Adapter │    │ Adapter │    │Adapters │    │Adapter ││
│  └─────────┘    └─────────┘    └─────────┘    └────────┘│
└────────────────────────────────────────────────────────────┘
```

## 📦 Core Components

### Research Engine

The heart of TimeTravel, orchestrating the three-tier research process.

**Responsibilities:**

- Execute research workflows
- Coordinate tool usage
- Apply quality metrics
- Manage research lifecycle

**Key Classes:**

- `ResearchEngine` - Main orchestrator
- `ResearchWorkflow` - Tier management
- `QualityScorer` - Result validation

### Personality Manager

Manages personality-based analysis perspectives.

**Responsibilities:**

- Load personality configurations
- Apply personality filters
- Synthesize multi-perspective analysis
- Manage custom personalities

**Key Classes:**

- `PersonalityManager` - Core manager
- `PersonalityConfig` - Configuration
- `PersonalityAnalyzer` - Analysis engine

### Tool Orchestrator

Manages external API integrations and tool execution.

**Responsibilities:**

- Abstract tool interfaces
- Handle rate limiting
- Manage API credentials
- Execute parallel requests

**Key Classes:**

- `ToolOrchestrator` - Main coordinator
- `ToolAdapter` - Base adapter class
- `ToolResult` - Standardized results

## 🔌 Adapters

### Research Tool Adapters

Each external API has its own adapter implementing the `ResearchTool` interface.

```typescript
interface ResearchTool {
  name: string
  search(query: string, options?: ToolOptions): Promise<ToolResult[]>
  validate(): Promise<boolean>
}
```

Current adapters:

- `PerplexityAdapter` - Deep AI research
- `BraveAdapter` - Web search
- `ExaAdapter` - Neural search
- `PubMedAdapter` - Medical research
- `ArxivAdapter` - Academic papers

### Storage Adapter

Handles persistence with swappable backends.

```typescript
interface StorageAdapter {
  save(research: Research): Promise<void>
  load(id: string): Promise<Research>
  search(criteria: SearchCriteria): Promise<Research[]>
}
```

Implementations:

- `FileStorageAdapter` - JSON files (v0.1)
- `PostgresAdapter` - Database (future)

## 🎯 Design Principles

### 1. Dependency Inversion

- Core domain doesn't depend on external services
- All external dependencies injected via interfaces
- Easy to test with mocks

### 2. Single Responsibility

- Each component has one clear purpose
- Minimal coupling between components
- Clear boundaries and contracts

### 3. Open/Closed

- Open for extension (new tools, personalities)
- Closed for modification (stable interfaces)
- Plugin-friendly architecture

### 4. Interface Segregation

- Small, focused interfaces
- Tools don't need to implement unused methods
- Clients depend only on what they use

## 🔄 Data Flow

### Research Execution Flow

```
1. User Input → CLI/Web/API
2. Request Validation → Application Layer
3. Research Planning → Research Engine
4. Tool Selection → Tool Orchestrator
5. Parallel Execution → Tool Adapters
6. Result Aggregation → Research Engine
7. Personality Analysis → Personality Manager
8. Quality Scoring → Quality Metrics
9. Storage → Storage Adapter
10. Response → User Interface
```

### Three-Tier Processing

```
Tier 1: Broad Exploration (30%)
├── Parallel streams
├── Wide coverage
└── Initial scoring

Tier 2: Deep Dives (50%)
├── High-relevance focus
├── Detailed analysis
└── Cross-referencing

Tier 3: Synthesis (20%)
├── Strategic positioning
├── Personality perspectives
└── Final recommendations
```

## 🏛️ Directory Structure

```
src/
├── core/               # Domain logic
│   ├── research/       # Research engine
│   ├── personality/    # Personality system
│   └── models/         # Domain models
├── adapters/           # External integrations
│   ├── tools/          # API adapters
│   └── storage/        # Persistence
├── ports/              # Interface definitions
│   ├── input/          # User interfaces
│   └── output/         # External services
├── application/        # Use cases
│   ├── commands/       # Command handlers
│   └── queries/        # Query handlers
└── infrastructure/     # Technical concerns
    ├── config/         # Configuration
    ├── logging/        # Logging
    └── monitoring/     # Metrics
```

## 🔐 Security Considerations

### API Key Management

- Environment variables for secrets
- Encrypted storage for production
- Key rotation support
- Per-service isolation

### Input Validation

- Sanitize all user inputs
- Rate limiting per user/IP
- Query complexity limits
- Output size limits

### Data Privacy

- No PII in logs
- Configurable retention
- User data isolation
- GDPR compliance ready

## 📈 Scalability

### Horizontal Scaling

- Stateless services
- Queue-based processing
- Load balancer ready
- Distributed caching

### Performance

- Parallel tool execution
- Result caching
- Lazy loading
- Stream processing

### Monitoring

- Health checks
- Performance metrics
- Error tracking
- Usage analytics

## 🚀 Deployment

### Development

```bash
npm run dev
# Runs all services locally
```

### Production

```bash
docker-compose up
# Containerized deployment
```

### Cloud

- AWS/GCP/Azure ready
- Kubernetes configs
- Auto-scaling rules
- CDN integration

## 🔄 Evolution Path

### Current (v0.1)

- Monolithic Node.js app
- File-based storage
- Direct API calls

### Near Future (v0.5)

- Service separation
- Message queues
- Caching layer

### Future (v1.0)

- Microservices
- Event sourcing
- GraphQL API
- Real-time updates

---

_This architecture is designed to evolve. Start simple, grow as needed._
