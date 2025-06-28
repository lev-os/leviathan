# ADR-009: Error Handling and Resilience Patterns

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Robust error handling patterns extracted from Erasmus for production stability

## Decision

Implement **comprehensive error handling and resilience patterns** with circuit breakers, graceful degradation, and automatic recovery mechanisms for the IDE auto-injection system.

## Problem Statement

Production reliability challenges:
- **Silent Failures**: File monitoring stops without notification
- **Cascade Failures**: Single file operation failure breaks entire system
- **Resource Exhaustion**: Memory leaks from unclosed file handles
- **User Experience**: Poor error messages and recovery guidance

## Architecture Decision

### **Circuit Breaker Pattern**

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly config: CircuitBreakerConfig;
  
  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      ...config
    };
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### **Graceful Degradation Framework**

```typescript
interface DegradationLevel {
  level: 'FULL' | 'REDUCED' | 'MINIMAL' | 'EMERGENCY';
  capabilities: Set<string>;
  description: string;
}

class GracefulDegradation {
  private currentLevel: DegradationLevel = DEGRADATION_LEVELS.FULL;
  private readonly degradationLevels = {
    FULL: {
      level: 'FULL',
      capabilities: new Set([
        'real_time_sync',
        'memory_integration',
        'ai_summarization',
        'cross_ide_sync',
        'pattern_recognition'
      ]),
      description: 'All features operational'
    },
    
    REDUCED: {
      level: 'REDUCED',
      capabilities: new Set([
        'memory_integration',
        'cross_ide_sync'
      ]),
      description: 'Core features only, disabled AI and real-time sync'
    },
    
    MINIMAL: {
      level: 'MINIMAL',
      capabilities: new Set([
        'memory_integration'
      ]),
      description: 'Basic memory operations only'
    },
    
    EMERGENCY: {
      level: 'EMERGENCY',
      capabilities: new Set(),
      description: 'File-based fallback mode'
    }
  };
  
  async executeWithDegradation<T>(
    capability: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.currentLevel.capabilities.has(capability)) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Capability ${capability} failed, attempting degradation`);
        this.considerDegradation(error);
        
        if (fallback && this.currentLevel.level !== 'EMERGENCY') {
          return await fallback();
        }
        throw error;
      }
    } else {
      if (fallback) {
        return await fallback();
      }
      throw new CapabilityUnavailableError(`${capability} not available at ${this.currentLevel.level} level`);
    }
  }
}
```

### **Automatic Recovery System**

```typescript
class AutoRecoveryManager {
  private recoveryStrategies = new Map<string, RecoveryStrategy>();
  
  constructor() {
    this.registerRecoveryStrategies();
  }
  
  private registerRecoveryStrategies(): void {
    // File system recovery
    this.recoveryStrategies.set('ENOENT', {
      description: 'File not found',
      action: async (context) => {
        await this.recreateFile(context.filePath, context.defaultContent);
      },
      maxAttempts: 3,
      backoffMs: 1000
    });
    
    // Permission recovery
    this.recoveryStrategies.set('EACCES', {
      description: 'Permission denied',
      action: async (context) => {
        await this.fixPermissions(context.filePath);
      },
      maxAttempts: 1,
      requiresElevation: true
    });
    
    // Memory system recovery
    this.recoveryStrategies.set('MEMORY_UNAVAILABLE', {
      description: 'Memory system unreachable',
      action: async (context) => {
        await this.restartMemoryService();
        await this.reloadMemoryState();
      },
      maxAttempts: 2,
      backoffMs: 5000
    });
  }
  
  async attemptRecovery(error: Error, context: ErrorContext): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code || error.name);
    if (!strategy) {
      return false;
    }
    
    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      try {
        await strategy.action(context);
        console.info(`Recovery successful for ${error.code} after ${attempt} attempts`);
        return true;
      } catch (recoveryError) {
        console.warn(`Recovery attempt ${attempt} failed:`, recoveryError);
        
        if (attempt < strategy.maxAttempts) {
          await this.delay(strategy.backoffMs * attempt);
        }
      }
    }
    
    return false;
  }
}
```

### **Resource Management**

```typescript
class ResourceManager {
  private resources = new Set<DisposableResource>();
  private disposed = false;
  
  register<T extends DisposableResource>(resource: T): T {
    if (this.disposed) {
      throw new Error('ResourceManager already disposed');
    }
    
    this.resources.add(resource);
    return resource;
  }
  
  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }
    
    this.disposed = true;
    const disposePromises = Array.from(this.resources).map(async (resource) => {
      try {
        await resource.dispose();
      } catch (error) {
        console.error('Error disposing resource:', error);
      }
    });
    
    await Promise.all(disposePromises);
    this.resources.clear();
  }
}

// Usage with file monitoring
class ResilientFileMonitor {
  private circuitBreaker: CircuitBreaker;
  private degradation: GracefulDegradation;
  private recovery: AutoRecoveryManager;
  private resources: ResourceManager;
  
  async startMonitoring(): Promise<void> {
    try {
      await this.circuitBreaker.execute(async () => {
        const watcher = this.resources.register(
          new FileWatcher(this.config)
        );
        
        await this.degradation.executeWithDegradation(
          'real_time_sync',
          () => watcher.start(),
          () => this.startPollingFallback()
        );
      });
    } catch (error) {
      const recovered = await this.recovery.attemptRecovery(error, {
        component: 'file_monitor',
        operation: 'start_monitoring'
      });
      
      if (!recovered) {
        throw new SystemFailureError('File monitoring could not be started', error);
      }
    }
  }
}
```

### **User-Friendly Error Messages**

```typescript
class ErrorMessageGenerator {
  static generateUserMessage(error: Error, context: ErrorContext): UserMessage {
    const templates = {
      'ENOENT': {
        title: 'Configuration File Missing',
        message: 'A required configuration file could not be found.',
        action: 'The system will automatically recreate the file with default settings.',
        severity: 'warning'
      },
      
      'MEMORY_UNAVAILABLE': {
        title: 'Memory System Temporarily Unavailable',
        message: 'The intelligent memory features are currently offline.',
        action: 'Basic file operations will continue. Memory features will resume automatically.',
        severity: 'info'
      },
      
      'CIRCUIT_OPEN': {
        title: 'System Protection Activated',
        message: 'Some features have been temporarily disabled due to repeated errors.',
        action: 'The system will automatically retry in a few minutes.',
        severity: 'warning'
      }
    };
    
    const template = templates[error.code] || {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred.',
      action: 'Please check the logs for more details.',
      severity: 'error'
    };
    
    return {
      ...template,
      timestamp: new Date().toISOString(),
      details: context.userFriendly ? error.message : undefined
    };
  }
}
```

## Implementation Strategy

### **Phase 1: Core Resilience**
- [ ] Implement circuit breaker pattern
- [ ] Create graceful degradation framework
- [ ] Build resource management system
- [ ] Add comprehensive error classification

### **Phase 2: Recovery & Monitoring**
- [ ] Automatic recovery strategies
- [ ] Health monitoring and alerting
- [ ] User-friendly error messages
- [ ] Recovery success tracking

## Consequences

### **Positive**
- **Production Stability**: System continues operating despite individual failures
- **User Experience**: Clear error messages and automatic recovery
- **Operational Visibility**: Better monitoring and debugging capabilities
- **Graceful Degradation**: Core features remain available during issues

### **Negative**
- **Implementation Complexity**: More code paths and error handling logic
- **Performance Overhead**: Circuit breakers and monitoring add latency
- **Testing Complexity**: Must test various failure scenarios

### **Risk Mitigation**
- **Comprehensive Testing**: Chaos engineering and failure injection testing
- **Monitoring**: Track error rates and recovery success
- **Documentation**: Clear runbooks for operational issues

## Success Metrics

- **System Uptime**: 99.9% availability target
- **Recovery Success Rate**: 95% automatic recovery from transient failures
- **Error Response Time**: < 100ms for error detection and classification
- **User Satisfaction**: Reduced support tickets related to system failures

## References

- Circuit Breaker Pattern: Martin Fowler's blog
- Resilience Engineering: Netflix's approach to distributed systems
- Erasmus Error Handling: `~/lev/_ref/erasmus/erasmus/utils/error.py`

---

**Decision Status**: Proposed  
**Review Date**: 2025-07-04