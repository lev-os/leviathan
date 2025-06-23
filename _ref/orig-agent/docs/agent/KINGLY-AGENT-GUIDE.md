# 🧠 Kingly Agent System Guide

*The complete guide to Kingly's LLM-first agent architecture - distilled from 7 documents into one*

## 🎯 Core Architecture Principles

### 1. LLM-First Everything

**The Principle**: Never write traditional algorithms. The LLM is the reasoning engine, JavaScript is just the compute layer.

**What This Means**:
- **No regex, if/else, pattern matching** - use dedicated LLM reasoning calls
- **Each reasoning step gets FULL model capacity** via separate calls
- **JavaScript computes facts, LLM makes decisions**
- **10x-100x more reasoning power** than traditional approaches

**Anti-Pattern Example**:
```javascript
// ❌ WRONG - Traditional algorithm
const intent = text.match(/implement|build|create/) ? 'implementation' : 'general';

// ✅ RIGHT - LLM reasoning
const intent = await llm.reason({
  prompt: "What is the intent behind this human expression?",
  context: parentContextChain
});
```

### 2. Universal Context Architecture

**The Principle**: Everything is a context - tasks, agents, workflows, files, folders, even relationships.

**Key Concepts**:
- **Contexts cascade hierarchically** - child inherits from parent
- **Structure is configurable** - hierarchical, flat, mixed, or emergent via YAML
- **Context.yaml drives behavior** - not hardcoded logic
- **Filesystems ARE graph databases** - directories are just one relationship type

**Context Inheritance Example**:
```yaml
# Task inherits from Project inherits from Workspace inherits from Universal Template
.kingly/workspace.yaml          # Business context
└── projects/my-project/        # Project context  
    └── tasks/my-task/          # Task context
        └── context.yaml        # All parent contexts cascade here
```

### 3. Bidirectional Reasoning Architecture

**The Principle**: Each reasoning step is a dedicated call with callbacks, not internal simulation.

**Implementation Patterns**:
- **Direct Adapter Pattern**: Bypass MCP protocol for 10x development speed
- **Batch Operations**: Avoid 5+ calls for single logical operations
- **Parallel Reasoning**: Tree of Thoughts style for complex decisions
- **Callbacks & Whispers**: Continuous conversation flow

**Performance Impact**:
```
Traditional: 40+ seconds (one large prompt)
Bidirectional: 1.5 seconds (focused reasoning calls)
= 25x speedup with better quality
```

### 4. Relationships Complete the Graph

**The Principle**: Flat storage + relationships = ANY organizational pattern.

**Key Insights**:
- **Directories = ONE relationship type** ("contains")
- **Peer relationships = FULL graph** (blocks, depends_on, relates_to)
- **Structure emerges from relationships** - not storage location
- **Any pattern possible** - Agile, GTD, PARA via configuration

## 🛠️ Implementation Guide

### Development Workflow

**1. Session Setup**:
```markdown
- Re-read ~/.claude/CLAUDE.md (user preferences)
- Re-read project CLAUDE.md
- Re-read _2do.md for current context
- Check docs/agent/KINGLY-AGENT-GUIDE.md (this file)
```

**2. BDD/TDD Process**:
```gherkin
# 1. Write BDD test first
Feature: Task Creation
  Scenario: Create task with intent preservation
    Given a project context with business goals
    When I create a task "Implement OAuth"
    Then the task should inherit project intent
    
# 2. See it fail
# 3. Implement minimally to pass
# 4. Direct test: Claude calls methods directly
```

**3. Progress Tracking**:
```markdown
## AC-TASK-001: Intent Classification ✓
- [x] Tasks inherit intent from parent context
- [x] No hardcoded classification logic
- [x] Business goals preserved through chain
```

### Technical Patterns

**Context Loading**:
```javascript
// Load with full inheritance chain
const context = await contextLoader.createContext('task', config, parentContext);
// Context automatically includes cascaded properties from all parents
```

**Batch Operations**:
```javascript
// One call instead of many
await batchOperation({
  creates: [{type: 'task', config: {...}}],
  relationships: [{type: 'blocks', target: 'task-123'}],
  updates: [{id: 'task-456', status: 'active'}]
});
```

**Intent Classification**:
```javascript
// Intent flows from context, not classification
const taskContext = {
  inherits: ['workspace-goals', 'project-intent'],
  adaptations: 'Technical implementation of business goal'
};
```

## 🔄 Core Workflows

### Insight Bubbling (temp: 0.5)
**Trigger**: Pattern emerges from implementation
**Action**: "I notice [pattern]. Should I extract this for reuse?"

### Spec Complexity Splitting (temp: 0.5)
**Trigger**: >5 acceptance criteria or >500 lines
**Action**: "This spec has [X] concerns. Should I split into focused sub-specs?"

### Coherence Review (temp: 0.5)
**Trigger**: Working with multiple specs
**Action**: "Found [X] specs using traditional algorithms. Create alignment report?"

### LLM-First Debugging
**Approach**: Let LLM analyze symptoms and form hypotheses
**Not**: Traditional step-through debugging

## 📊 Quick Reference

### Reality Checks

**Before ANY Implementation**:
1. "Where's the LLM in this?" 
2. "How does this inherit from context?"
3. "Are we pattern-matching or reasoning?"
4. "Does this use bidirectional architecture?"

### Common Anti-Patterns

| ❌ Avoid | ✅ Instead |
|----------|-----------|
| Hardcoded if/else logic | LLM reasoning calls |
| Fixed class hierarchies | Emergent context relationships |
| Multiple tool calls | Batch operations |
| Building frameworks FOR LLMs | Building WITH LLMs |
| Isolated entities | Context inheritance |

### Success Metrics

- **Development Speed**: 10x faster with direct adapters
- **Reasoning Quality**: 100x more nuanced with dedicated calls
- **Test Coverage**: BDD for features, direct testing during dev
- **Architecture Quality**: No traditional algorithms

## 🚀 The Vision

Build a Universal Context Operating System where:
- **Any organizational pattern** emerges from relationships
- **LLMs converse naturally** without complex frameworks
- **Structure is discovered**, not imposed
- **Everything inherits** from universal business goals
- **Intelligence emerges** from conversation, not code

---

*Remember: We're revealing the universal graph that was always there, not building a new system.*