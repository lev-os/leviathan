# Spec 03: Assembly Rules System

## Feature: Rule-Based Context Assembly

The assembly rules system should define how multiple context sources are combined, filtered, and transformed into a final assembled context optimized for LLM consumption.

### Background
```gherkin
Given an AssemblyRules engine
And multiple context sources with different priorities
And token limits for efficient LLM usage
And potential conflicts between sources
```

## Scenario: Priority-Based Assembly

```gherkin
Feature: Context Priority Rules
  As a context assembler
  I need to apply priority rules when combining contexts
  So that more important information takes precedence

  Scenario: Simple priority ordering
    Given the following context sources with priorities:
      | source              | priority | content                        |
      | core_principles     | 100      | "Always reduce cortisol"       |
      | cortisol_guardian   | 90       | "Take the calm path"          |
      | action_catalyst     | 70       | "Move fast and break things"   |
      | workflow_context    | 60       | "Previous step suggested X"    |
    When assembling with a 100 token limit
    Then contexts should be included in priority order
    And lower priority content should be truncated first
    And core_principles should always be included

  Scenario: Dynamic priority based on workflow stage
    Given a workflow in the "implementation" stage
    And default priorities for personalities
    When action_catalyst is marked as "lead" for this stage
    Then action_catalyst priority should increase to 95
    And other personalities should maintain base priority
    And the final assembly should reflect this ordering

  Scenario: Priority inheritance and propagation
    Given a parent context with priority 80
    And child contexts derived from it
    When child contexts don't specify priority
    Then they should inherit parent priority
    And explicitly set child priorities should override
```

### Implementation Example
```javascript
class AssemblyRules {
  constructor(config = {}) {
    this.basePriorities = config.basePriorities || this.getDefaultPriorities()
    this.tokenLimit = config.tokenLimit || 4000
    this.tokenCounter = config.tokenCounter || new TokenCounter()
    this.conflictStrategy = config.conflictStrategy || 'weighted_merge'
  }
  
  getDefaultPriorities() {
    return {
      core_principles: 100,
      active_personality: 90,
      workflow_context: 80,
      previous_responses: 70,
      memory_context: 60,
      supporting_personality: 50,
      metadata: 30
    }
  }
  
  applyPriorities(contexts, stageConfig = {}) {
    return contexts.map(context => {
      let priority = context.priority || 
                    this.basePriorities[context.type] || 
                    50
      
      // Apply stage-specific adjustments
      if (stageConfig.lead === context.source) {
        priority = Math.max(priority, 95)
      }
      
      // Apply role-based adjustments
      if (context.role === 'primary' && stageConfig.stage === 'decision') {
        priority += 10
      }
      
      return { ...context, effectivePriority: priority }
    }).sort((a, b) => b.effectivePriority - a.effectivePriority)
  }
  
  assembleWithPriority(contexts, tokenLimit) {
    const prioritized = this.applyPriorities(contexts)
    const assembled = []
    let tokenCount = 0
    
    for (const context of prioritized) {
      const contextTokens = this.tokenCounter.count(context.text)
      
      if (tokenCount + contextTokens <= tokenLimit) {
        assembled.push(context)
        tokenCount += contextTokens
      } else if (context.effectivePriority >= 90) {
        // High priority content must be included
        // Truncate if necessary
        const availableTokens = tokenLimit - tokenCount
        const truncated = this.tokenCounter.truncate(context.text, availableTokens)
        assembled.push({ ...context, text: truncated, truncated: true })
        break
      }
    }
    
    return assembled
  }
}
```

## Scenario: Conflict Resolution

```gherkin
Feature: Personality Conflict Resolution
  As a context assembler
  I need to resolve conflicts between different personalities
  So that the final context is coherent and actionable

  Scenario: Direct contradiction resolution
    Given conflicting recommendations:
      | personality         | recommendation           | confidence |
      | cortisol_guardian   | "Delay the launch"      | 0.9        |
      | action_catalyst     | "Launch immediately"     | 0.8        |
    When applying conflict resolution rules
    Then the system should synthesize a balanced approach
    And the synthesis should acknowledge both perspectives
    And include reasoning for the resolution

  Scenario: Nuanced conflict handling
    Given partially overlapping recommendations:
      | personality         | recommendation                    |
      | systems_illuminator | "Architecture needs refinement"   |
      | flow_creator       | "User experience is smooth"       |
      | action_catalyst    | "Ship the MVP now"               |
    When these perspectives conflict on timing
    Then synthesis should find common ground
    And preserve unique insights from each
    And create actionable compromise

  Scenario: Conflict escalation rules
    Given high-confidence conflicting views
    And conflict_resolution_strategy is "escalate"
    When confidence difference is less than 0.1
    Then present both options to user
    And explain the trade-offs
    And request explicit decision
```

### Implementation Example
```javascript
class ConflictResolver {
  constructor(strategy = 'weighted_merge') {
    this.strategy = strategy
    this.synthesizer = new TextSynthesizer()
  }
  
  resolveConflicts(contexts) {
    const conflicts = this.detectConflicts(contexts)
    
    if (conflicts.length === 0) {
      return this.simplemerge(contexts)
    }
    
    switch (this.strategy) {
      case 'weighted_merge':
        return this.weightedMerge(contexts, conflicts)
      
      case 'synthesis':
        return this.synthesizeResolution(contexts, conflicts)
        
      case 'escalate':
        return this.escalateConflicts(contexts, conflicts)
        
      case 'personality_lead':
        return this.personalityLead(contexts, conflicts)
        
      default:
        return this.simplemerge(contexts)
    }
  }
  
  detectConflicts(contexts) {
    const conflicts = []
    
    for (let i = 0; i < contexts.length; i++) {
      for (let j = i + 1; j < contexts.length; j++) {
        const similarity = this.semanticSimilarity(
          contexts[i].text, 
          contexts[j].text
        )
        
        // High similarity but opposite sentiment = conflict
        if (similarity > 0.7) {
          const sentiment1 = this.analyzeSentiment(contexts[i].text)
          const sentiment2 = this.analyzeSentiment(contexts[j].text)
          
          if (Math.abs(sentiment1 - sentiment2) > 0.6) {
            conflicts.push({
              sources: [contexts[i].source, contexts[j].source],
              type: 'direct_contradiction',
              confidence: similarity
            })
          }
        }
      }
    }
    
    return conflicts
  }
  
  synthesizeResolution(contexts, conflicts) {
    const template = `
Given these perspectives:
${contexts.map(c => `- ${c.source}: "${c.text}"`).join('\n')}

Conflicts detected:
${conflicts.map(c => `- ${c.sources.join(' vs ')}: ${c.type}`).join('\n')}

Synthesized resolution:
Taking into account all perspectives, here's a balanced approach that ${this.getResolutionStrategy(conflicts)}...
`
    
    return this.synthesizer.generate(template, contexts)
  }
}
```

## Scenario: Filtering and Relevance

```gherkin
Feature: Context Filtering Rules
  As a context assembler
  I need to filter contexts based on relevance
  So that only pertinent information reaches the LLM

  Scenario: Relevance-based filtering
    Given a current task about "technical architecture"
    And contexts from various sources:
      | source              | content                          | relevance |
      | systems_illuminator | "Database schema design..."      | 0.95      |
      | harmony_weaver      | "Team dynamics consideration..." | 0.4       |
      | previous_step       | "User research findings..."      | 0.3       |
    When filtering with relevance threshold 0.6
    Then only systems_illuminator content should be included
    And filtered contexts should be noted in metadata

  Scenario: Temporal relevance decay
    Given contexts with timestamps:
      | source     | age_hours | content                    |
      | memory_1   | 1         | "Recent decision on API"   |
      | memory_2   | 24        | "Yesterday's architecture" |
      | memory_3   | 168       | "Last week's planning"     |
    When applying temporal decay factor 0.9 per day
    Then recent memories should have higher relevance
    And week-old memories should be significantly decayed

  Scenario: Contextual relevance boosting
    Given a workflow focused on "stress reduction"
    When cortisol_guardian contributes content
    Then its relevance should be boosted by 1.5x
    And stress-related keywords should increase relevance
    And conflicting themes should decrease relevance
```

### Implementation Example
```javascript
class RelevanceFilter {
  constructor(config = {}) {
    this.threshold = config.threshold || 0.6
    this.decayFactor = config.decayFactor || 0.9
    this.boostRules = config.boostRules || {}
    this.embedder = config.embedder || new TextEmbedder()
  }
  
  filterByRelevance(contexts, currentTask) {
    const taskEmbedding = this.embedder.embed(currentTask.description)
    
    const scored = contexts.map(context => {
      let relevance = this.calculateSemanticRelevance(
        context.text, 
        taskEmbedding
      )
      
      // Apply temporal decay
      if (context.timestamp) {
        relevance *= this.applyTemporalDecay(context.timestamp)
      }
      
      // Apply contextual boosting
      relevance *= this.applyBoostRules(context, currentTask)
      
      return { ...context, relevance }
    })
    
    // Filter and sort
    return scored
      .filter(c => c.relevance >= this.threshold)
      .sort((a, b) => b.relevance - a.relevance)
  }
  
  calculateSemanticRelevance(text, taskEmbedding) {
    const textEmbedding = this.embedder.embed(text)
    return this.cosineSimilarity(textEmbedding, taskEmbedding)
  }
  
  applyTemporalDecay(timestamp) {
    const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
    return Math.pow(this.decayFactor, ageInDays)
  }
  
  applyBoostRules(context, task) {
    let boost = 1.0
    
    // Check if source matches task focus
    if (task.focus && this.boostRules[task.focus]) {
      const rule = this.boostRules[task.focus]
      if (rule.sources.includes(context.source)) {
        boost *= rule.multiplier
      }
    }
    
    // Keyword matching
    const keywords = task.keywords || []
    const matches = keywords.filter(k => 
      context.text.toLowerCase().includes(k.toLowerCase())
    ).length
    boost *= (1 + 0.1 * matches)
    
    return boost
  }
}
```

## Scenario: Token Optimization

```gherkin
Feature: Token-Efficient Assembly
  As a context assembler
  I need to optimize token usage
  So that we maximize information within LLM limits

  Scenario: Intelligent truncation
    Given a context exceeding token limits
    When truncating to fit
    Then preserve complete thoughts/sentences
    And maintain critical information
    And add truncation indicators

  Scenario: Context compression
    Given verbose context with redundancy
    When compression is enabled
    Then remove redundant information
    And preserve unique insights
    And maintain readability

  Scenario: Dynamic token allocation
    Given different context types
    When assembling with 4000 token limit
    Then allocate tokens based on importance:
      | type                | allocation |
      | core_principles     | 10%        |
      | active_personality  | 40%        |
      | workflow_context    | 30%        |
      | previous_responses  | 15%        |
      | metadata           | 5%         |
```

### Implementation Example
```javascript
class TokenOptimizer {
  constructor(config = {}) {
    this.tokenizer = config.tokenizer || new GPTTokenizer()
    this.compressionRules = config.compressionRules || this.getDefaultRules()
  }
  
  optimizeAssembly(contexts, totalLimit) {
    const allocations = this.calculateAllocations(contexts, totalLimit)
    const optimized = []
    
    for (const context of contexts) {
      const allocation = allocations[context.type] || 
                        totalLimit / contexts.length
      
      let optimizedText = context.text
      
      // Apply compression if needed
      if (this.tokenizer.count(optimizedText) > allocation) {
        optimizedText = this.compress(optimizedText, allocation)
      }
      
      optimized.push({
        ...context,
        text: optimizedText,
        tokens: this.tokenizer.count(optimizedText),
        compressed: optimizedText !== context.text
      })
    }
    
    return optimized
  }
  
  compress(text, targetTokens) {
    // Remove redundancy
    text = this.removeRedundancy(text)
    
    // If still too long, intelligently truncate
    if (this.tokenizer.count(text) > targetTokens) {
      text = this.intelligentTruncate(text, targetTokens)
    }
    
    return text
  }
  
  removeRedundancy(text) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    const unique = []
    const seen = new Set()
    
    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase().trim()
      const hash = this.semanticHash(normalized)
      
      if (!seen.has(hash)) {
        seen.add(hash)
        unique.push(sentence)
      }
    }
    
    return unique.join(' ')
  }
}
```

## Test Implementation

```javascript
describe('AssemblyRules', () => {
  let assembler
  
  beforeEach(() => {
    assembler = new AssemblyRules({
      tokenLimit: 1000,
      conflictStrategy: 'synthesis'
    })
  })
  
  describe('Priority Assembly', () => {
    it('should respect priority ordering', () => {
      const contexts = [
        { source: 'low', type: 'metadata', text: 'low priority', priority: 30 },
        { source: 'high', type: 'core_principles', text: 'high priority', priority: 100 },
        { source: 'med', type: 'workflow_context', text: 'medium priority', priority: 70 }
      ]
      
      const assembled = assembler.assembleWithPriority(contexts, 100)
      expect(assembled[0].source).toBe('high')
      expect(assembled[1].source).toBe('med')
    })
    
    it('should handle dynamic priority adjustments', () => {
      const contexts = [
        { source: 'action_catalyst', type: 'personality', text: 'act now' },
        { source: 'cortisol_guardian', type: 'personality', text: 'stay calm' }
      ]
      
      const stageConfig = { lead: 'action_catalyst', stage: 'implementation' }
      const prioritized = assembler.applyPriorities(contexts, stageConfig)
      
      expect(prioritized[0].source).toBe('action_catalyst')
      expect(prioritized[0].effectivePriority).toBeGreaterThanOrEqual(95)
    })
  })
  
  describe('Conflict Resolution', () => {
    it('should detect direct contradictions', () => {
      const resolver = new ConflictResolver('synthesis')
      const contexts = [
        { source: 'A', text: 'Speed is essential, launch now' },
        { source: 'B', text: 'Quality matters, delay the launch' }
      ]
      
      const conflicts = resolver.detectConflicts(contexts)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('direct_contradiction')
    })
    
    it('should synthesize balanced resolution', () => {
      const resolver = new ConflictResolver('synthesis')
      const contexts = [
        { source: 'fast', text: 'Ship immediately' },
        { source: 'slow', text: 'Take more time' }
      ]
      
      const resolution = resolver.resolveConflicts(contexts)
      expect(resolution).toContain('balanced approach')
    })
  })
  
  describe('Relevance Filtering', () => {
    it('should filter by semantic relevance', async () => {
      const filter = new RelevanceFilter({ threshold: 0.7 })
      const task = { description: 'Design database schema' }
      
      const contexts = [
        { source: 'tech', text: 'Consider normalized tables and indexes' },
        { source: 'team', text: 'Team morale is important' },
        { source: 'user', text: 'Users need fast queries' }
      ]
      
      const filtered = await filter.filterByRelevance(contexts, task)
      expect(filtered.map(c => c.source)).toContain('tech')
      expect(filtered.map(c => c.source)).not.toContain('team')
    })
  })
})
```

## Integration Example

```javascript
class ContextAssembler {
  constructor(config) {
    this.rules = new AssemblyRules(config.rules)
    this.resolver = new ConflictResolver(config.conflictStrategy)
    this.filter = new RelevanceFilter(config.filterConfig)
    this.optimizer = new TokenOptimizer(config.tokenizerConfig)
  }
  
  async assemble(recipe) {
    // Load contexts
    let contexts = await this.loadContexts(recipe.sources)
    
    // Apply relevance filtering
    if (recipe.task) {
      contexts = await this.filter.filterByRelevance(contexts, recipe.task)
    }
    
    // Apply priority rules
    contexts = this.rules.applyPriorities(contexts, recipe.stageConfig)
    
    // Resolve conflicts
    contexts = this.resolver.resolveConflicts(contexts)
    
    // Optimize for tokens
    contexts = this.optimizer.optimizeAssembly(contexts, recipe.tokenLimit)
    
    // Combine into final text
    return this.combineContexts(contexts)
  }
}
```