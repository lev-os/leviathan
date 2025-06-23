# ADR-002: Multi-Language Integration Architecture for Echo Intelligence

**Status**: Accepted
**Date**: 2025-01-26
**Author**: CEO Agent + User Validation

## Context

Echo Project Intelligence System requires three distinct language components:
- **Go**: High-performance file system scanning and repository analysis
- **Python**: AI-powered document analysis and intelligence extraction  
- **Node.js**: Web backend, WebSocket server, and MCP integration

**Critical Constraint**: Go scanner must operate as a "black box" with clean API boundaries.

## Requirements

- **Performance**: Go scanner maintains sub-5-second analysis for 1000+ files
- **Integration**: Seamless data flow between Go → Python → Node.js
- **Maintainability**: Each component can be developed and deployed independently
- **Scalability**: Architecture supports horizontal scaling of each component
- **Reliability**: Failure in one component doesn't crash entire system

## Alternatives Considered

### Option 1: Monolithic Node.js with Child Processes
**Description**: Single Node.js application spawning Go and Python as child processes

**Pros**:
- Simple deployment model
- Direct process communication
- Unified logging and monitoring

**Cons**:
- **Tight coupling**: Go scanner not truly "black box"
- **Scaling limitations**: Cannot scale components independently  
- **Resource contention**: All processes compete for same system resources
- **Development friction**: Teams blocked by integration dependencies

### Option 2: Microservices with HTTP APIs (CHOSEN)
**Description**: Independent services communicating via HTTP APIs with message queues

**Pros**:
- **True black box**: Go scanner exposed only via HTTP API
- **Independent scaling**: Scale Go scanners separately from Python analysis
- **Technology isolation**: Each team owns their language stack completely
- **Fault tolerance**: Service failures isolated and recoverable
- **Development velocity**: Teams work independently with API contracts

**Cons**:
- **Network overhead**: HTTP calls add latency vs direct integration
- **Operational complexity**: Multiple services to deploy and monitor
- **Data consistency**: Need coordination for transactional operations

### Option 3: Embedded Libraries with FFI
**Description**: Compile Go as C library, embed in Node.js with Python integration

**Pros**:
- **Performance**: No network overhead for scanner communication
- **Memory sharing**: Direct access to scan results

**Cons**:
- **Complexity**: FFI integration notoriously fragile and hard to debug
- **Deployment issues**: Platform-specific compilation and distribution
- **Not black box**: Tight coupling violates user requirement
- **Development overhead**: Significant integration engineering effort

## Decision

**Chosen Option**: Microservices Architecture with HTTP APIs and Message Queues

**Implementation Strategy**:

### Service Architecture
```yaml
services:
  echo_scanner:
    language: "Go"
    responsibility: "File system scanning, repository analysis, metadata extraction"
    api: "HTTP REST API"
    deployment: "Independent Go binary"
    
  echo_intelligence:
    language: "Python"
    responsibility: "Document analysis, AI processing, health scoring"
    api: "HTTP REST API"
    deployment: "Python service with ML dependencies"
    
  echo_backend:
    language: "Node.js"
    responsibility: "Web API, WebSocket server, MCP integration, orchestration"
    api: "GraphQL + WebSocket + MCP tools"
    deployment: "Node.js application server"
```

### Integration Pattern
```yaml
data_flow:
  1_scan_request:
    source: "echo_backend (user request)"
    destination: "echo_scanner HTTP API"
    payload: "{ workspace_path, options }"
    
  2_scan_results:
    source: "echo_scanner"
    destination: "message_queue (Redis)"
    payload: "{ project_metadata, file_list, hashes }"
    
  3_intelligence_processing:
    source: "echo_intelligence (queue consumer)"
    destination: "echo_scanner API (document fetch)"
    payload: "{ document_analysis_request }"
    
  4_intelligence_results:
    source: "echo_intelligence"
    destination: "echo_backend (HTTP callback)"
    payload: "{ health_scores, recommendations, insights }"
    
  5_ui_updates:
    source: "echo_backend"
    destination: "frontend (WebSocket)"
    payload: "{ real_time_updates, progress, results }"
```

### API Contracts

#### Go Scanner API
```yaml
endpoints:
  POST /scan:
    request: "{ workspace_path: string, options: ScanOptions }"
    response: "{ scan_id: string, status: 'started' }"
    
  GET /scan/{id}:
    response: "{ status: 'complete', results: ProjectMetadata }"
    
  GET /scan/{id}/files:
    response: "{ files: FileMetadata[] }"
    
  GET /scan/{id}/content/{path}:
    response: "{ content: string, encoding: string }"
```

#### Python Intelligence API  
```yaml
endpoints:
  POST /analyze:
    request: "{ project_metadata: object, documents: string[] }"
    response: "{ analysis_id: string, status: 'processing' }"
    
  GET /analyze/{id}:
    response: "{ status: 'complete', insights: ProjectIntelligence }"
    
  POST /health_score:
    request: "{ project_data: object }"
    response: "{ health_score: number, recommendations: string[] }"
```

## Risk Mitigation

### Service Communication Failures
- **Circuit breakers**: Prevent cascade failures between services
- **Retry policies**: Automatic retry with exponential backoff
- **Timeouts**: Prevent hanging requests from blocking system
- **Health checks**: Monitor service availability and route traffic accordingly

### Data Consistency
- **Event sourcing**: Use message queue as source of truth for state changes
- **Eventual consistency**: Accept that updates may not be immediately consistent
- **Compensating transactions**: Handle partial failures with rollback mechanisms

### Development Coordination
- **API-first development**: Define and version APIs before implementation
- **Contract testing**: Automated tests verify API contracts between services
- **Independent deployment**: Each service can be deployed without others
- **Shared types**: Generate type definitions from API schemas

## Implementation Plan

### Phase 1: Service Foundations (Week 1-2)
```yaml
deliverables:
  - "Go scanner HTTP API with basic endpoints"
  - "Python intelligence service HTTP API"
  - "Node.js backend with service integration"
  - "Redis message queue setup"
  - "API contract definitions and documentation"
```

### Phase 2: Integration Testing (Week 3)
```yaml
deliverables:
  - "End-to-end integration tests"
  - "Service communication validation"
  - "Error handling and retry mechanisms"
  - "Performance testing under load"
```

### Phase 3: Production Readiness (Week 4)
```yaml
deliverables:
  - "Service monitoring and health checks"
  - "Circuit breakers and timeout configuration"
  - "Deployment automation for all services"
  - "Documentation and runbooks"
```

## Consequences

### Positive
- **True Black Box**: Go scanner completely isolated and independently maintainable
- **Independent Development**: Teams can work in parallel without integration blocking
- **Horizontal Scaling**: Each service scales based on its specific resource needs
- **Technology Freedom**: Each service uses optimal technology stack
- **Fault Isolation**: Service failures contained and recoverable

### Negative
- **Operational Complexity**: More services to deploy, monitor, and maintain
- **Network Latency**: HTTP calls add overhead vs direct integration
- **Data Flow Complexity**: More moving parts to understand and debug
- **Development Setup**: Local development requires running multiple services

### Neutral
- **Development Effort**: Similar total effort, distributed differently across services
- **Testing Strategy**: Need both unit tests per service and integration tests

## Success Metrics

```yaml
integration_success:
  api_response_time: "< 100ms for scanner API calls"
  end_to_end_latency: "< 2 seconds from scan request to UI update"
  service_availability: "> 99.5% uptime for each service"
  
development_velocity:
  independent_deployments: "> 80% of deployments are single-service"
  cross_team_blocking: "< 20% of development time waiting on other teams"
  api_contract_stability: "< 5% breaking changes per month"
```

## Follow-up

- **Review Date**: After Phase 1 completion (2 weeks)
- **Related ADRs**: ADR-003 (Message queue patterns), ADR-004 (Service monitoring)
- **Success Criteria**: All three services communicating successfully with < 2 second end-to-end latency

---

*This ADR ensures the Go scanner remains a true "black box" while enabling efficient integration across the multi-language architecture.*