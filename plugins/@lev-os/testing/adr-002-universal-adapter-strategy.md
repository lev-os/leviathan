# ADR-002: Universal Adapter Strategy

## Status
✅ **APPROVED** - December 19, 2024

## Context
Initially considered building a universal LLM adapter interface, but research revealed this is a solved problem with existing mature solutions like LiteLLM (Python) and LLM.js (JavaScript).

## Decision
**Build on existing universal adapter solutions rather than reinventing the interface layer**

## Options Considered

### 1. Build Custom Universal Adapter ❌
- ✅ Complete control over interface design
- ✅ Optimized for our specific use cases
- ❌ Significant development and maintenance overhead
- ❌ Reinventing solved problems
- ❌ Community fragmentation
- ❌ Missing provider-specific optimizations

### 2. Use Existing Solutions ⭐ **SELECTED**
- ✅ Proven, battle-tested implementations
- ✅ Community-driven maintenance and improvements
- ✅ Broader provider support than we could build
- ✅ Focus our energy on unique testing value
- ✅ Faster time to market
- ❌ Less control over adapter interface

## Existing Solutions Identified

### LLM.js (JavaScript)
- Universal LLM interface for Node.js and browser
- Zero-dependency library
- Supports OpenAI, Claude, Ollama, and hundreds more
- Production-ready with excellent developer experience

### LiteLLM (Python)
- Python SDK and proxy server
- 100+ LLM APIs in OpenAI format
- Enterprise-grade with extensive provider support
- Gateway functionality for production deployments

## Implementation Strategy
```javascript
// Build testing framework on top of existing adapters
import LLM from 'llm.js';

class LLMTestFramework {
  constructor() {
    this.llm = new LLM(); // Universal adapter layer
  }
  
  async test(prompt, providers = ['openai', 'claude']) {
    // Focus on TESTING tooling, not adapter complexity
    const results = await Promise.all(
      providers.map(provider => this.llm.chat(prompt, { provider }))
    );
    return this.evaluate(results);
  }
}
```

## Value Focus Shift
Our unique value lies in:
1. **Testing Harness** - Superior developer experience for LLM testing
2. **Evaluation Metrics** - Comprehensive evaluation framework
3. **Load Testing** - Production-grade performance testing
4. **Constitutional Validation** - Leviathan-specific testing capabilities

## Consequences
- **Positive**: Faster development by leveraging proven solutions
- **Positive**: Broader provider support than we could build
- **Positive**: Community-maintained adapter improvements
- **Positive**: Focus resources on unique testing value proposition
- **Negative**: Dependency on external adapter libraries
- **Negative**: Less control over adapter interface evolution

## Related Decisions
- Links to ADR-001 (Testing Engine Foundation)
- Links to ADR-003 (Core Value Proposition)