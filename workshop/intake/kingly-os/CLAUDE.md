# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kingly OS** is an innovative AI Operating System built using Test-Driven Development (TDD) principles. It implements a revolutionary approach to AI agent management through dynamic context assembly and nano-agent architecture.

## Key Architecture Components

### Core Systems
- **KinglyOS** (`kingly-os.js`) - Main orchestrator with workflow detection, learning mode routing, and agent selection
- **ContextAssembler** (`assembly-engine/context-assembler.js`) - Dynamic context assembly with rule-based injection and user preferences
- **NanoAgent** (`nano-agents/base-nano-agent.js`) - Ultra-minimal agents with no built-in behavior, all intelligence from context
- **PatternDetector** (`learning-engine/pattern-detector.js`) - Analyzes interactions to discover successful patterns
- **ExperimentSpawner** (`cloud-spawn/experiment-spawner.js`) - Generates and manages experimental approaches for learning mode

### Key Features
- **Three Operation Modes**: Workflow (established patterns), Learning (discovery through experiments), Default (standard agent routing)
- **Dynamic Context Assembly**: No hardcoded prompts - everything assembled at runtime based on rules, user preferences, and learned patterns
- **Nano-Agent Architecture**: Agents have no built-in behavior - all intelligence comes from OS context assembly
- **Parallel Learning**: Spawns multiple experimental approaches for unknown/complex tasks
- **Pattern Learning**: Continuously learns from interaction outcomes to improve future performance

## Development Commands

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode  
pnpm test:watch

# Run specific test file
node --test tests/kingly-os.test.js
```

### Development Workflow
```bash
# Install dependencies
pnpm install

# Run the main system
node kingly-os.js

# Run translation demo (converts traditional agents to nano-agents)
node translation-demo.js

# Run simple validation
node simple-test.js
```

## Test-Driven Development Approach

This project was built using strict TDD methodology:

1. **Comprehensive Test Suite**: Created extensive tests covering all core functionality before implementation
2. **Red-Green-Refactor**: Each feature implemented to pass specific test requirements
3. **Component Testing**: Each major component (KinglyOS, ContextAssembler, NanoAgent, PatternDetector, ExperimentSpawner) has dedicated test files
4. **Integration Testing**: Tests verify system-wide behavior and component interactions

### Test Structure
- `tests/kingly-os.test.js` - Main orchestrator tests (routing, agent selection, workflow management)
- `tests/context-assembler.test.js` - Context assembly, rule application, user preferences
- `tests/nano-agent.test.js` - Agent behavior, context handling, performance tracking
- `tests/pattern-detector.test.js` - Pattern analysis, learning, prediction
- `tests/basic-assembly.test.js` - Legacy test for basic assembly functionality
- `tests/translation-service.test.js` - Agent translation service tests

## Core Principles

### LLM-First Architecture
- All behavior emerges from context assembly rather than hardcoded logic
- Agents are ultra-minimal containers that execute with injected context
- System learns and adapts patterns based on successful interactions

### Dynamic Context Assembly
- Context assembled from: base templates, injection rules, user preferences, workflow state, learned patterns
- Rules applied in priority order with conditions for agent type, task content, workflow state
- Experimental variations generated for learning mode

### Learning and Adaptation
- Interaction outcomes analyzed to identify successful patterns
- Anti-patterns detected and avoided
- User preferences learned from behavior and feedback
- Environment changes incorporated into pattern evolution

## Common Development Tasks

### Adding New Agent Types
1. Add agent type to `initializeNanoAgents()` in `kingly-os.js`
2. Add base template in `ContextAssembler.baseTemplates`
3. Add agent-task alignment patterns in selection logic
4. Create tests for new agent behavior

### Adding Injection Rules
```javascript
assembler.addRule({
  condition: { agentType: 'dev', taskContains: 'performance' },
  inject: { 
    prepend: 'Performance optimization expert.',
    append: 'Focus on measurable improvements.'
  },
  priority: 5,
  confidence: 0.9
});
```

### Adding Workflows
```javascript
kinglyOS.addWorkflow('code-review', {
  trigger: /review.*code|code.*review/i,
  agents: ['dev', 'qa'],
  sequence: 'sequential' // or 'parallel'
});
```

## Architecture Insights

### Request Processing Flow
1. **Mode Detection**: Analyze request complexity and known patterns to determine workflow/learning/default mode
2. **Agent Selection**: Route to appropriate nano-agent based on task characteristics
3. **Context Assembly**: Dynamically build context from multiple sources
4. **Execution**: Agent processes with assembled context
5. **Learning**: Analyze outcomes and update patterns

### Learning Mode Operation
- Triggered by high complexity or knowledge gaps
- Spawns multiple experimental approaches (research-heavy, implementation-focused, etc.)
- Runs parallel experiments and analyzes results
- Codifies successful patterns for future use

### Context Assembly Process
- Start with base agent template
- Apply injection rules in priority order
- Add workflow-specific context
- Include user preferences
- Incorporate learned patterns
- Calculate confidence and estimate token usage

## Performance Considerations

- **Token Optimization**: Context assembly includes token estimation and warnings
- **History Management**: Interaction history limited to prevent memory issues
- **Pattern Diversity**: Automatic removal of redundant patterns to maintain efficiency
- **Confidence Scoring**: All operations include confidence metrics for quality assessment

This system represents a fundamental shift from traditional hardcoded AI agents to a dynamic, learning-based OS that assembles optimal context on demand.