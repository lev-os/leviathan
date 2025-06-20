# ADR-001: Testing Engine Foundation

## Status
✅ **APPROVED** - December 19, 2024

## Context
Need a modern, fast testing engine for LLM applications where:
- Each LLM call takes 2-5 seconds (speed is critical)
- Modern ESM/TypeScript support required
- Parallel execution essential for performance
- Developer experience must be excellent

## Decision
**Use Vitest as the core testing engine**

## Options Considered

### 1. Jest (Most Popular)
- ✅ Huge ecosystem and developer familiarity
- ✅ Extensive plugin system
- ❌ ESM/TypeScript setup complexity and configuration overhead
- ❌ Slower execution compared to modern alternatives
- ❌ Not optimized for async-heavy workloads

### 2. Vitest (Modern Alternative) ⭐ **SELECTED**
- ✅ Native ESM/TypeScript support out of the box
- ✅ Vite-powered fast execution and hot reload
- ✅ Jest-compatible API (easy migration path)
- ✅ Built for modern development workflows
- ✅ Excellent parallel execution
- ❌ Smaller ecosystem (but growing rapidly)

### 3. Node.js Built-in Test Runner
- ✅ Zero dependencies
- ✅ Part of Node.js core
- ❌ Limited features and poor developer experience
- ❌ Minimal ecosystem support
- ❌ Not suitable for complex LLM testing scenarios

## Rationale
Speed is absolutely critical when testing LLMs where each call has significant latency. Vitest's performance advantages combined with modern tooling support and Jest compatibility makes it the optimal choice for our use case.

## Implementation
```javascript
import { LLMTestRunner } from '@lev-os/testing';

const runner = new LLMTestRunner({
  engine: 'vitest',        // Default engine
  timeout: 30000,          // LLM-appropriate timeouts
  parallel: true,          // Essential for performance
  reporter: 'verbose'      // Detailed test output
});
```

## Consequences
- **Positive**: Fast test execution, modern developer experience, easy setup
- **Positive**: Jest compatibility allows easy migration from existing test suites
- **Positive**: Native TypeScript support reduces configuration complexity
- **Negative**: Smaller ecosystem compared to Jest (acceptable trade-off)
- **Negative**: Team may need brief learning period (minimal due to Jest compatibility)

## Related Decisions
- Links to ADR-002 (Universal Adapter Strategy)
- Links to ADR-003 (Core Value Proposition)