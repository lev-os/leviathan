# Core Debug Package Implementation Guide

## 📋 Package Agent Task Export

**Package**: `core/debug`  
**Priority**: Foundational (Second priority)  
**Estimated Effort**: 3-4 hours  
**Target Tests**: 30-35 tests  
**Dependencies**: @lev-os/testing (enhanced from previous task)

## 🎯 Context & Purpose

The core/debug package is a **universal dependency** used by all other packages for logging, tracing, and debugging. It's critical infrastructure that needs comprehensive testing to ensure reliability across the entire ecosystem.

## 📊 Current State Analysis

### Existing Structure
```
core/debug/
├── src/
│   ├── index.js              # Main exports
│   ├── logger.js             # Logging functionality
│   ├── tracer.js             # Tracing utilities
│   └── monitor.js            # Performance monitoring
├── package.json              # Configuration
└── README.md                 # Documentation
```

### Current Test Coverage
- ❌ **No tests** (critical gap)
- ❌ Missing: Universal logging validation
- ❌ Missing: Tracing integration tests
- ❌ Missing: Performance monitoring tests
- ❌ Missing: Cross-package integration validation

## 🔧 Implementation Requirements

### Unit Tests (15-18 tests)

#### Core Logging Functionality (6-8 tests)
- [ ] **Logger Instantiation**
  - Logger creation with different configurations
  - Log level validation (debug, info, warn, error)
  - Custom formatter testing
  - Output destination validation

- [ ] **Log Message Processing**
  - Message formatting and structure
  - Metadata attachment and processing
  - Error object serialization
  - Performance impact measurement

- [ ] **Configuration Management**
  - Environment-based configuration
  - Runtime configuration updates
  - Invalid configuration handling
  - Default fallback behavior

#### Tracing System (5-6 tests)
- [ ] **Trace Generation**
  - Trace ID generation and uniqueness
  - Span creation and nesting
  - Trace context propagation
  - Trace completion and cleanup

- [ ] **Performance Monitoring**
  - Execution time measurement
  - Memory usage tracking
  - Resource utilization monitoring
  - Performance threshold alerting

#### Error Handling (4 tests)
- [ ] **Error Capture and Processing**
  - Exception catching and logging
  - Stack trace preservation
  - Error categorization
  - Error recovery mechanisms

### Integration Tests (10-12 tests)

#### Cross-Package Integration (6-7 tests)
- [ ] **Agent System Integration**
  - MCP adapter logging integration
  - Agent execution tracing
  - Command processing monitoring
  - Session debugging support

- [ ] **Memory System Integration**
  - Memory operation logging
  - Database query tracing
  - Cache performance monitoring
  - Memory leak detection

- [ ] **Plugin Ecosystem Integration**
  - Plugin loading and execution logging
  - Cross-plugin communication tracing
  - Plugin performance monitoring
  - Plugin error handling

#### External System Integration (4-5 tests)
- [ ] **Mastra Observability Integration**
  - OpenTelemetry trace export
  - Mastra dashboard integration
  - Real-time monitoring setup
  - Alert configuration

### E2E Tests (3-4 tests)

#### Complete Debugging Workflows (3-4 tests)
- [ ] **Full System Debugging**
  - End-to-end request tracing
  - Multi-component error tracking
  - Performance bottleneck identification
  - Debug session management

### Performance Tests (2-3 tests)

#### Debug System Performance (2-3 tests)
- [ ] **Logging Performance Impact**
  - High-volume logging performance
  - Memory usage under load
  - Trace overhead measurement
  - Production performance validation

## 🛠️ Implementation Guidelines

### Use Enhanced Testing Framework
```typescript
import { describe, it, expect } from '@lev-os/testing/simple';
import { ConstitutionalAIMetric } from '@lev-os/testing';
import { logger, tracer } from '@lev-os/debug';

describe('Core Debug System', () => {
  describe('Universal Logging', () => {
    it('should provide consistent logging across all packages', () => {
      const testLogger = logger.create('test-package');
      // Validate logging functionality
    });
  });
});
```

### Mastra Evaluation Integration
```typescript
import { Agent } from '@mastra/core/agent';
import { FaithfulnessMetric, PerformanceMetric } from '@mastra/evals';

export const debugAgent = new Agent({
  name: 'debug-system-validator',
  instructions: 'Validate debug system functionality and performance',
  model: openai('gpt-4o-mini'),
  evals: {
    faithfulness: new FaithfulnessMetric(model),
    performance: new PerformanceMetric(),
    reliability: new ReliabilityMetric(model)
  }
});
```

### Constitutional AI Debug Patterns
```typescript
export class DebugConstitutionalMetric extends Metric {
  async measure(debugOutput: string): Promise<MetricResult> {
    // Ensure debug logs don't contain sensitive information
    // Validate ethical debugging practices
    // Check for privacy compliance in logging
  }
}
```

## ✅ Success Criteria

### Functional Requirements
- [ ] All 30-35 tests pass consistently
- [ ] Universal logging works across all packages
- [ ] Tracing system provides complete visibility
- [ ] Performance monitoring is accurate
- [ ] Error handling is comprehensive

### Quality Requirements
- [ ] <1ms logging overhead per operation
- [ ] 100% trace coverage for critical paths
- [ ] 99.9% uptime for debug system
- [ ] Zero sensitive data leakage in logs

### Integration Requirements
- [ ] All core packages use debug system
- [ ] Plugin ecosystem integration working
- [ ] Mastra observability integration complete
- [ ] CI/CD monitoring integration ready

## 📚 Dependencies & Integration Points

### Internal Dependencies
- **@lev-os/testing**: Enhanced testing framework
- **Agent system**: MCP adapter integration
- **All core packages**: Universal logging dependency

### External Dependencies
- **@mastra/core**: Observability integration
- **OpenTelemetry**: Tracing standards
- **Winston/Pino**: Logging libraries (optional)

## 🚀 Implementation Patterns

### Universal Logger Pattern
```typescript
// Every package should use this pattern
import { logger } from '@lev-os/debug';

const packageLogger = logger.create('package-name');

export class PackageClass {
  constructor() {
    packageLogger.info('Package initialized');
  }
  
  async operation() {
    const trace = tracer.start('operation');
    try {
      // Package logic
      packageLogger.debug('Operation completed');
    } catch (error) {
      packageLogger.error('Operation failed', { error });
      throw error;
    } finally {
      trace.end();
    }
  }
}
```

### Performance Monitoring Pattern
```typescript
import { monitor } from '@lev-os/debug';

export const performanceMiddleware = monitor.middleware({
  thresholds: {
    warning: 100, // ms
    error: 1000   // ms
  },
  metrics: ['duration', 'memory', 'cpu']
});
```

## 🔍 Testing Focus Areas

### Critical Test Scenarios
1. **High-Volume Logging**: Test system under heavy logging load
2. **Memory Leak Prevention**: Ensure debug system doesn't leak memory
3. **Cross-Package Consistency**: Validate consistent behavior across packages
4. **Error Recovery**: Test system recovery from debug system failures
5. **Performance Impact**: Measure and validate minimal performance overhead

### Constitutional AI Considerations
- **Privacy Protection**: Ensure no sensitive data in logs
- **Ethical Debugging**: Validate responsible debugging practices
- **Transparency**: Provide clear debugging information without exposing internals
- **Security**: Prevent debug information from creating security vulnerabilities

## 📖 Implementation Notes

### Key Focus Areas
1. **Universal Reliability**: Must work consistently across all packages
2. **Performance**: Minimal overhead, maximum visibility
3. **Integration**: Seamless Mastra observability integration
4. **Constitutional Compliance**: Ethical and secure debugging

### Avoid These Pitfalls
- Don't create performance bottlenecks
- Don't log sensitive information
- Don't create circular dependencies
- Don't ignore error scenarios

This implementation establishes the universal debugging foundation that all other packages will depend on.
