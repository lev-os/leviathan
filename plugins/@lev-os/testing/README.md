# @lev-os/testing

## The Jest of LLM Testing

A comprehensive, open-source testing framework specifically designed for LLM applications, agent systems, and AI adapters. Built for speed, extensibility, and production reliability with unique constitutional AI validation capabilities.

---

## 🎯 Vision

**Universal LLM Testing Framework** that works with any agent system while providing constitutional AI compliance validation and advanced evaluation capabilities.

## 🚀 Quick Start

```bash
npm install @lev-os/testing
```

```javascript
import { test, expect } from '@lev-os/testing';

test('my agent handles requests correctly', async () => {
  const agent = new MyAgent();
  const result = await agent.process('Help me solve this problem');
  
  expect(result).toPassEval('accuracy', { threshold: 0.8 });
  expect(result).toPassEval('safety');
  expect(result.latency).toBeLessThan(2000);
});
```

## 🏗 Architecture Decisions

This directory contains the Architecture Decision Records (ADRs) that document the key technical and strategic decisions for the @lev-os/testing framework:

### Core Framework Decisions

- **[ADR-001: Testing Engine Foundation](./adr-001-testing-engine-foundation.md)** ✅ **APPROVED**
  - Decision: Use Vitest as core testing engine
  - Rationale: Speed critical for LLM testing, modern ESM/TypeScript support

- **[ADR-002: Universal Adapter Strategy](./adr-002-universal-adapter-strategy.md)** ✅ **APPROVED** 
  - Decision: Build on existing universal adapter solutions (LiteLLM, LLM.js)
  - Rationale: Focus on testing value, not reinventing adapter layer

- **[ADR-003: Core Value Proposition](./adr-003-core-value-proposition.md)** ✅ **APPROVED**
  - Decision: Position as "The Jest of LLM Testing" with developer experience focus
  - Rationale: Address real pain points in LLM development workflow

### Integration & Interface Decisions

- **[ADR-004: Integration Strategy](./adr-004-integration-strategy.md)** ✅ **APPROVED**
  - Decision: Build universal patterns first, framework adapters later
  - Rationale: Faster time to market, focus on core value

- **[ADR-005: Universal Agent Interface](./adr-005-universal-agent-interface.md)** 📝 **DRAFT**
  - Decision: Abstract common testing patterns (trajectory, sample, conversation, role, handoff)
  - Rationale: One interface for all agent frameworks

### Configuration & Evaluation Decisions

- **[ADR-006: YAML Configuration Standards](./adr-006-yaml-configuration-standards.md)** 📝 **DRAFT**
  - Decision: Comprehensive YAML-first configuration system
  - Rationale: Declarative, version-control friendly, maintainable

- **[ADR-007: Evaluation System Design](./adr-007-evaluation-system-design.md)** 📝 **DRAFT**
  - Decision: Built-in evaluators + custom eval creation + LLM-as-judge patterns
  - Rationale: Comprehensive evaluation is the core value proposition

### Future & Specialization Decisions

- **[ADR-008: Framework Adapter Architecture](./adr-008-framework-adapter-architecture.md)** 📋 **DOCUMENTED**
  - Decision: Document adapter patterns for future implementation
  - Rationale: Valuable future feature, not immediate priority

- **[ADR-009: Leviathan-Specific Features](./adr-009-leviathan-specific-features.md)** 📝 **DRAFT**
  - Decision: Constitutional compliance validation, multi-agent coordination testing
  - Rationale: Unique competitive advantage and responsible AI leadership

## 🎨 Key Features

### Universal Testing Patterns
- **Trajectory Testing** - Multi-step agent execution analysis
- **Sample Testing** - Input/output evaluation
- **Conversation Testing** - Multi-turn dialogue simulation  
- **Role Testing** - Specialized agent collaboration
- **Handoff Testing** - Agent routing validation

### Comprehensive Evaluation System
- **Built-in Evaluators** - Accuracy, safety, cost, latency, bias detection
- **Custom Evaluators** - YAML-defined custom evaluation logic
- **LLM-as-Judge** - AI-powered evaluation with caching
- **Constitutional Compliance** - Responsible AI validation (Leviathan feature)

### Developer Experience
- **Vitest-Powered** - Fast execution and modern tooling
- **YAML Configuration** - Declarative test definitions
- **Cross-Provider Testing** - Compare Claude, GPT-4, Ollama, etc.
- **Load Testing** - Production-grade performance testing

### Production Ready
- **Real-time Monitoring** - Constitutional compliance alerts
- **Session Replay** - Debug production issues
- **Cost Optimization** - Track and optimize LLM costs
- **Performance Analysis** - Latency, throughput, error rates

## 🌟 What Makes This Special

### 1. **Universal Compatibility**
Works with any LLM framework - LangChain, OpenAI Evals, CrewAI, AutoGen, custom agents

### 2. **Constitutional AI Validation** 
First testing framework with built-in responsible AI compliance checking

### 3. **Multi-Agent Coordination Testing**
Advanced simulation and validation of multi-agent systems

### 4. **Production-Grade**
Built for real-world deployment with monitoring, alerting, and debugging

## 🔄 Development Status

### ✅ Completed
- Architecture decisions documented
- Core framework design finalized
- Constitutional AI patterns defined

### 🔄 In Progress
- Package structure and initial implementation
- Basic universal testing patterns
- YAML configuration system

### 📋 Planned
- Framework adapter implementations
- Community plugin ecosystem
- Advanced constitutional monitoring

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and check our ADRs to understand the architectural decisions.

### Development Philosophy
- **LLM-First Architecture** - Always ask "Can an LLM do this?"
- **Constitutional Compliance** - Responsible AI development
- **Maximum Extensibility** - Build the "Linux of AI Testing"
- **Community-Driven** - Open source with clear governance

## 📊 Competitive Analysis

| Feature | @lev-os/testing | LangSmith | OpenAI Evals | PromptFoo |
|---------|----------------|-----------|--------------|-----------|
| Universal Framework Support | ✅ | ❌ | ❌ | ✅ |
| Constitutional AI Testing | ✅ | ❌ | ❌ | ❌ |
| Multi-Agent Simulation | ✅ | ✅ | ❌ | ❌ |
| Production Monitoring | ✅ | ✅ | ❌ | ❌ |
| YAML Configuration | ✅ | ❌ | ✅ | ✅ |
| Load Testing | ✅ | ❌ | ❌ | ❌ |
| Cross-Provider Comparison | ✅ | ✅ | ❌ | ✅ |

## 🎯 Strategic Positioning

- **Open Source Foundation** - Maximum community adoption
- **Leviathan Enhancement** - Constitutional AI competitive advantage  
- **Industry Standards** - Define responsible AI testing practices
- **Ecosystem Leadership** - "Jest of LLM Testing" position

---

*Building the future of reliable LLM applications through comprehensive testing, evaluation, and constitutional AI compliance.*

**Sponsored by Kingly Agency** - Advancing responsible AI development