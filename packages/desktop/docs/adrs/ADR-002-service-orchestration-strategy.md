# ADR-002: Service Orchestration Strategy

**Status**: Proposed  
**Date**: 2025-06-27  
**Deciders**: Leviathan Core Team  

## Context

Leviathan Desktop must manage multiple heterogeneous services:

1. **Neo4j Database** - Graph database (Java)
2. **Graphiti gRPC Service** - Python-based memory system
3. **Agent System** - Node.js MCP server
4. **OS Kernel** - Go-based system (future)

Each service has different:
- **Startup requirements** (database initialization, dependency checking)
- **Health check mechanisms** (HTTP endpoints, process monitoring, database queries)
- **Failure modes** (crashes, hangs, resource exhaustion)
- **Recovery strategies** (restart, reset state, dependency cascade)

## Decision

We will implement a **hierarchical service orchestration** system with intelligent auto-healing and dependency management.

### Service Architecture

```
Service Manager (Rust)
├── Dependency Graph Resolution
├── Health Monitoring System
├── Auto-Healing Engine
└── Service Registry

Services:
┌─ Neo4j (External/Bundled)
│  └─ Graphiti gRPC Service (Python)
│     └─ Agent System (Node.js)
│        └─ OS Kernel (Go) [Future]
```

### Service Definitions

```yaml
# Service registry configuration
services:
  neo4j:
    type: database
    startup_timeout: 30s
    health_check:
      type: http
      endpoint: "http://localhost:7474/db/system/tx/commit"
      method: POST
      auth: basic
    dependencies: []
    
  graphiti-service:
    type: grpc_service
    command: ["python", "src/memory_service.py"]
    working_dir: "packages/memory/graphiti-service"
    startup_timeout: 15s
    health_check:
      type: grpc
      endpoint: "localhost:50051"
      method: "HealthCheck"
    dependencies: ["neo4j"]
    
  agent-system:
    type: mcp_server
    command: ["node", "src/index.js"]
    working_dir: "agent"
    startup_timeout: 10s
    health_check:
      type: http
      endpoint: "http://localhost:3333/health"
    dependencies: ["graphiti-service"]
```

## Implementation Strategy

### 1. Service Lifecycle Management

```rust
pub struct ServiceHandle {
    id: String,
    config: ServiceConfig,
    process: Option<Child>,
    state: ServiceState,
    last_health_check: Instant,
    restart_count: u32,
    dependencies: Vec<String>,
}

pub enum ServiceState {
    Stopped,
    Starting,
    Running,
    Unhealthy,
    Failed,
    Restarting,
}

impl ServiceManager {
    pub async fn start_service(&mut self, id: &str) -> Result<()> {
        // 1. Check dependencies are running
        self.verify_dependencies(id).await?;
        
        // 2. Start the service process
        let child = self.spawn_service_process(id).await?;
        
        // 3. Wait for health check to pass
        self.wait_for_healthy(id, Duration::from_secs(30)).await?;
        
        // 4. Start dependent services
        self.start_dependent_services(id).await?;
        
        Ok(())
    }
}
```

### 2. Health Monitoring System

```rust
pub struct HealthMonitor {
    checkers: HashMap<String, Box<dyn HealthChecker>>,
    schedule: TaskScheduler,
}

#[async_trait]
pub trait HealthChecker: Send + Sync {
    async fn check_health(&self) -> HealthStatus;
    fn check_interval(&self) -> Duration;
}

pub struct HttpHealthChecker {
    endpoint: String,
    timeout: Duration,
    expected_status: u16,
}

pub struct GrpcHealthChecker {
    endpoint: String,
    service_name: String,
}

pub struct ProcessHealthChecker {
    pid: u32,
    max_memory_mb: u64,
    max_cpu_percent: f64,
}
```

### 3. Auto-Healing Engine

```rust
pub struct AutoHealingEngine {
    policies: HashMap<String, RestartPolicy>,
    circuit_breakers: HashMap<String, CircuitBreaker>,
}

pub struct RestartPolicy {
    max_restarts: u32,
    restart_window: Duration,
    backoff_strategy: BackoffStrategy,
    escalation_actions: Vec<EscalationAction>,
}

pub enum BackoffStrategy {
    Fixed(Duration),
    Exponential { base: Duration, max: Duration },
    Linear { increment: Duration, max: Duration },
}

pub enum EscalationAction {
    RestartService(String),
    RestartDependencies,
    ResetDatabase,
    NotifyUser,
    FullSystemRestart,
}
```

### 4. Dependency Management

```rust
impl ServiceManager {
    pub fn build_dependency_graph(&self) -> DependencyGraph {
        let mut graph = DependencyGraph::new();
        
        for (id, config) in &self.service_configs {
            graph.add_service(id.clone());
            for dep in &config.dependencies {
                graph.add_dependency(id, dep);
            }
        }
        
        graph.validate_acyclic()?;
        graph
    }
    
    pub async fn shutdown_cascade(&mut self, failed_service: &str) {
        let dependent_services = self.dependency_graph
            .get_dependents(failed_service);
            
        for service in dependent_services {
            self.graceful_shutdown(service).await;
        }
    }
}
```

## Service-Specific Strategies

### Neo4j Management
```rust
impl Neo4jService {
    pub async fn ensure_running(&self) -> Result<()> {
        // 1. Check if Neo4j Desktop is installed and running
        if self.check_desktop_instance().await.is_ok() {
            return Ok(());
        }
        
        // 2. Check if Docker Neo4j is available
        if self.check_docker_instance().await.is_ok() {
            return Ok(());
        }
        
        // 3. Start bundled Neo4j instance
        self.start_bundled_instance().await
    }
}
```

### Graphiti Service Management
```rust
impl GraphitiService {
    pub async fn health_check(&self) -> HealthStatus {
        // 1. Check process is running
        if !self.process_alive() {
            return HealthStatus::Dead;
        }
        
        // 2. Check gRPC endpoint responds
        match self.grpc_health_check().await {
            Ok(_) => HealthStatus::Healthy,
            Err(_) => HealthStatus::Unhealthy,
        }
    }
    
    pub async fn restart_with_state_preservation(&mut self) -> Result<()> {
        // 1. Graceful shutdown with state save
        self.save_current_state().await?;
        self.graceful_shutdown().await?;
        
        // 2. Restart and restore state
        self.start().await?;
        self.restore_state().await?;
        
        Ok(())
    }
}
```

## Error Handling & Recovery

### Circuit Breaker Pattern
```rust
pub struct CircuitBreaker {
    state: CircuitState,
    failure_count: u32,
    failure_threshold: u32,
    recovery_timeout: Duration,
    last_failure: Option<Instant>,
}

pub enum CircuitState {
    Closed,    // Normal operation
    Open,      // Blocking requests
    HalfOpen,  // Testing recovery
}
```

### Escalation Workflow
1. **Level 1**: Simple restart (< 5 failures)
2. **Level 2**: Restart with dependency check (5-10 failures)
3. **Level 3**: Reset service state and restart (10-15 failures)
4. **Level 4**: Full cascade restart (15+ failures)
5. **Level 5**: User notification and manual intervention

## Monitoring & Observability

```rust
pub struct ServiceMetrics {
    uptime: Duration,
    restart_count: u32,
    last_restart: Option<Instant>,
    health_check_failures: u32,
    performance_metrics: PerformanceMetrics,
}

pub struct PerformanceMetrics {
    memory_usage_mb: f64,
    cpu_usage_percent: f64,
    response_time_ms: f64,
    request_rate: f64,
}
```

## Consequences

### Positive
✅ **Intelligent Recovery**: Multi-level escalation prevents cascade failures  
✅ **Dependency Awareness**: Services start in correct order  
✅ **Resource Monitoring**: Prevent resource exhaustion  
✅ **State Preservation**: Minimize data loss during restarts  
✅ **Transparent Operation**: Users don't need to manage services manually  

### Negative
❌ **Complexity**: Sophisticated orchestration logic  
❌ **Resource Usage**: Monitoring overhead  
❌ **Debug Difficulty**: Complex failure scenarios  

### Risks
⚠️ **Restart Loops**: Poorly configured policies could cause infinite restarts  
⚠️ **Resource Leaks**: Failed processes might not clean up properly  
⚠️ **Dependency Deadlocks**: Circular dependencies in configuration  

## Monitoring

Success metrics:
- [ ] Service availability > 99.9%
- [ ] Mean time to recovery < 30 seconds
- [ ] False positive health checks < 1%
- [ ] Successful automatic recovery > 95%
- [ ] Resource usage stays within 150% of baseline