# Dynamic Context Assembler - Detailed Technical Stress Test Plan

## Core Architecture Analysis

### Current State (MCP-CEO)
```javascript
// Simple personality activation in ceo-core.js
assembleDynamicContext(workflow, step, previousContext = {}, currentStep) {
  const relevantPersonalities = currentStep.personalities || ['cortisol_guardian', 'abundance_amplifier']
  
  // Builds a single context string with:
  // 1. Full system prompt (static)
  // 2. Active personality names (not details)
  // 3. Previous context (JSON dump)
  // 4. Step instructions
  
  return { contextPrompt, activePersonalities }
}
```

### Target State (Dynamic Context Assembler)
```javascript
class ContextAssembler {
  constructor(config) {
    this.loaders = {
      yaml: new YamlContextLoader(),
      markdown: new MarkdownContextLoader(),
      memory: new MemoryContextLoader()
    }
    this.cache = new ContextCache()
    this.tracker = new ContextTracker() // Track what context contributed what
  }
  
  async assemble(recipe) {
    // Recipe defines:
    // - sources: what files/memory to load
    // - rules: how to combine them
    // - filters: what to include/exclude
    // - transformations: how to modify content
    
    const contexts = await this.loadContexts(recipe.sources)
    const filtered = await this.applyFilters(contexts, recipe.filters)
    const transformed = await this.transform(filtered, recipe.transformations)
    const assembled = await this.combine(transformed, recipe.rules)
    
    // Track what contributed to final context
    this.tracker.record(recipe, assembled)
    
    return assembled
  }
}
```

## Detailed Feature Breakdown

### 1. Context Loading System

#### Feature: Multi-Source Context Loading
```javascript
// BDD Spec
describe('ContextLoader', () => {
  it('should load YAML contexts from filesystem', async () => {
    const loader = new YamlContextLoader()
    const context = await loader.load('contexts/agents/ceo/context.yaml')
    
    expect(context).toHaveProperty('metadata')
    expect(context).toHaveProperty('agent_config')
    expect(context.metadata.type).toBe('agent')
  })
  
  it('should load Markdown contexts with XML parsing', async () => {
    const loader = new MarkdownContextLoader()
    const context = await loader.load('contexts/personalities/cortisol_guardian.md')
    
    expect(context).toHaveProperty('role')
    expect(context).toHaveProperty('cognitive_pattern')
    expect(context).toHaveProperty('interaction_style')
  })
  
  it('should load from memory/session store', async () => {
    const loader = new MemoryContextLoader()
    const context = await loader.load('session:123/step:2/response')
    
    expect(context).toHaveProperty('timestamp')
    expect(context).toHaveProperty('content')
  })
})
```

#### Implementation Details:
- **YamlContextLoader**: Parse YAML, validate schema, extract sections
- **MarkdownContextLoader**: Parse MD with XML blocks, extract structured data
- **MemoryContextLoader**: Load from session store, handle different memory types
- **Caching**: LRU cache for frequently accessed contexts
- **Validation**: Schema validation for each context type

### 2. Context Tracking System

#### Feature: Context Attribution & Lineage
```javascript
// BDD Spec
describe('ContextTracker', () => {
  it('should track which personality contributed what text', async () => {
    const tracker = new ContextTracker()
    const assembled = await assembler.assemble(recipe)
    
    const attribution = tracker.getAttribution('reduce cortisol immediately')
    expect(attribution.source).toBe('cortisol_guardian')
    expect(attribution.confidence).toBeGreaterThan(0.8)
  })
  
  it('should maintain context lineage across steps', async () => {
    const lineage = tracker.getLineage('step:3/recommendation')
    
    expect(lineage).toContainEqual({
      step: 1,
      personality: 'systems_illuminator',
      contribution: 'identified pattern X'
    })
  })
})
```

#### Implementation:
- **Attribution Engine**: Map text segments to sources
- **Lineage Graph**: DAG of context flow
- **Confidence Scoring**: How much each source influenced output
- **Memory Integration**: Store attributions for learning

### 3. Dynamic Assembly Rules

#### Feature: Rule-Based Context Combination
```javascript
// BDD Spec  
describe('AssemblyRules', () => {
  it('should apply priority rules for personality conflicts', async () => {
    const rules = new AssemblyRules({
      priority: ['cortisol_guardian', 'action_catalyst'],
      conflict_resolution: 'weighted_merge'
    })
    
    const result = rules.combine([
      { source: 'cortisol_guardian', text: 'slow down' },
      { source: 'action_catalyst', text: 'move fast' }
    ])
    
    expect(result).toContain('balanced approach')
  })
  
  it('should filter context based on relevance', async () => {
    const rules = new AssemblyRules({
      relevance_threshold: 0.7,
      max_context_size: 4000
    })
    
    const filtered = rules.filter(contexts, currentStep)
    expect(filtered.totalTokens).toBeLessThan(4000)
  })
})
```

#### Implementation:
- **Priority System**: Personality/source ranking
- **Conflict Resolution**: merge, override, synthesize
- **Relevance Scoring**: Semantic similarity to current task
- **Size Management**: Token counting and pruning

### 4. Personality System Integration

#### Feature: Multi-System Personality Management
```javascript
// BDD Spec
describe('PersonalityManager', () => {
  it('should load both CEO and EEPS personalities', async () => {
    const manager = new PersonalityManager()
    await manager.loadSystem('ceo', 'contexts/personalities/ceo/*.md')
    await manager.loadSystem('eeps', 'contexts/personalities/eeps/*.md')
    
    expect(manager.getPersonalities()).toHaveLength(16)
  })
  
  it('should handle cross-system interactions', async () => {
    const interaction = manager.getInteraction('cortisol_guardian', 'nfj_visionary')
    
    expect(interaction).toHaveProperty('compatibility')
    expect(interaction).toHaveProperty('conflict_areas')
    expect(interaction).toHaveProperty('synthesis_strategy')
  })
})
```

#### Implementation:
- **System Registry**: Track multiple personality systems
- **Interaction Matrix**: Define how personalities interact
- **Activation Logic**: Trigger-based activation
- **Neurotransmitter Modeling**: For EEPS system

### 5. Workflow Orchestration

#### Feature: Complex Multi-Step Workflows
```javascript
// BDD Spec
describe('WorkflowOrchestrator', () => {
  it('should execute Cognitive Parliament with 8 personalities', async () => {
    const orchestrator = new WorkflowOrchestrator()
    const session = await orchestrator.startWorkflow('cognitive_parliament', {
      topic: 'Should we pivot?',
      personalities: 'all_eeps'
    })
    
    // Each step gets different personality perspectives
    const step1 = await orchestrator.executeStep(session, 1)
    expect(step1.context).toContain('nfj_visionary perspective')
    
    const step8 = await orchestrator.executeStep(session, 8)
    expect(step8.context).toContain('synthesis of all perspectives')
  })
})
```

#### Implementation:
- **Step Context Evolution**: Each step builds on previous
- **Personality Rotation**: Different personalities per step
- **Synthesis Logic**: Combine multiple perspectives
- **State Management**: Track workflow progress

### 6. Memory Integration

#### Feature: Context-Aware Memory System
```javascript
// BDD Spec
describe('MemoryIntegration', () => {
  it('should inject relevant episodic memory', async () => {
    const memory = new MemorySystem()
    const relevantMemories = await memory.getRelevant('scaling challenges', {
      type: 'episodic',
      limit: 3,
      recency_weight: 0.7
    })
    
    expect(relevantMemories).toHaveLength(3)
    expect(relevantMemories[0].relevance).toBeGreaterThan(0.8)
  })
  
  it('should respect memory boundaries', async () => {
    const assembler = new ContextAssembler({ memory })
    const context = await assembler.assemble({
      sources: ['memory:semantic/*'],
      filters: { boundary: 'project' }
    })
    
    expect(context).not.toContain('other_project_data')
  })
})
```

### 7. Performance & Scale

#### Feature: Efficient Large-Scale Assembly
```javascript
// BDD Spec
describe('Performance', () => {
  it('should handle 16+ personalities efficiently', async () => {
    const start = Date.now()
    const context = await assembler.assemble({
      sources: ['personalities/*/active'],
      max_time: 100 // ms
    })
    
    expect(Date.now() - start).toBeLessThan(100)
    expect(context.tokenCount).toBeLessThan(4000)
  })
  
  it('should cache frequently used contexts', async () => {
    // First call - loads from disk
    const time1 = await timeExecution(() => 
      assembler.load('personalities/cortisol_guardian')
    )
    
    // Second call - from cache
    const time2 = await timeExecution(() =>
      assembler.load('personalities/cortisol_guardian')
    )
    
    expect(time2).toBeLessThan(time1 / 10)
  })
})
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1, Days 1-2)
1. Create base `ContextAssembler` class
2. Implement `YamlContextLoader` for existing CEO config
3. Implement `MarkdownContextLoader` for new personality files
4. Create `ContextTracker` for attribution
5. Write comprehensive tests

### Phase 2: Personality Systems (Week 1, Days 3-4)
1. Create markdown templates for personalities
2. Convert CEO personalities to markdown
3. Create EEPS personality files
4. Implement `PersonalityManager`
5. Test cross-system interactions

### Phase 3: Assembly Rules (Week 1, Days 5-7)
1. Implement priority system
2. Create conflict resolution strategies
3. Build relevance scoring
4. Add token management
5. Test with complex scenarios

### Phase 4: Workflow Integration (Week 2, Days 1-3)
1. Enhance workflow orchestrator
2. Implement Cognitive Parliament
3. Add Echo Intelligence recursion
4. Test bidirectional flow
5. Validate state management

### Phase 5: Memory & Scale (Week 2, Days 4-5)
1. Mock memory system integration
2. Add caching layer
3. Performance profiling
4. Concurrent workflow tests
5. Production readiness assessment

## Success Criteria

### Functionality
- [ ] Load contexts from YAML, Markdown, Memory
- [ ] Track context attribution and lineage
- [ ] Apply complex assembly rules
- [ ] Handle 16+ personalities efficiently
- [ ] Execute multi-step workflows
- [ ] Integrate with memory systems

### Performance
- [ ] <100ms assembly time for typical context
- [ ] <4000 tokens for assembled context
- [ ] 10x speedup with caching
- [ ] Linear scaling with complexity

### Quality
- [ ] 100% test coverage on core functions
- [ ] Clean separation of concerns
- [ ] Extensible architecture
- [ ] Clear documentation

## Risk Areas & Mitigations

1. **Complexity Explosion**
   - Risk: Too many features, unclear boundaries
   - Mitigation: Start simple, add incrementally

2. **Performance Degradation**
   - Risk: Slow assembly with many sources
   - Mitigation: Aggressive caching, lazy loading

3. **Context Confusion**
   - Risk: Mixing incompatible contexts
   - Mitigation: Clear boundaries, validation

4. **Testing Overhead**
   - Risk: Too many test scenarios
   - Mitigation: Focus on critical paths first

## Next Steps

1. Create `spec/01-context-loading.md` with detailed BDD specs
2. Create `spec/02-context-tracking.md` for attribution system
3. Create `spec/03-assembly-rules.md` for combination logic
4. Start implementing `ContextAssembler` base class
5. Create first personality markdown template