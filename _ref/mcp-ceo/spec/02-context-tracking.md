# Spec 02: Context Tracking System

## Feature: Context Attribution & Lineage

The context tracking system should track which sources contributed what content to the final assembled context, maintaining a complete lineage graph of how context flows through the system.

### Background
```gherkin
Given a ContextTracker instance
And multiple context sources (personalities, workflows, memory)
And an assembled context from multiple sources
```

## Scenario: Track Personality Contributions

```gherkin
Feature: Personality Attribution
  As a context assembler
  I need to track which personality contributed which text
  So that I can understand the source of recommendations

  Scenario: Simple personality attribution
    Given the following personality contributions:
      | personality        | text                                    |
      | cortisol_guardian  | "Let's approach this calmly"           |
      | action_catalyst    | "We need to move quickly on this"      |
      | systems_illuminator| "The pattern here suggests patience"    |
    When I assemble these into a final context
    Then I should be able to query attribution for any text segment
    And attribution for "approach this calmly" should return "cortisol_guardian"
    And attribution for "move quickly" should return "action_catalyst"
    And each attribution should have a confidence score > 0.8

  Scenario: Track overlapping contributions
    Given multiple personalities suggest similar ideas:
      | personality        | text                                    |
      | cortisol_guardian  | "Take a phased approach"               |
      | systems_illuminator| "Phase the implementation"              |
    When these are synthesized into "Use a carefully phased approach"
    Then attribution should return both personalities
    And confidence scores should reflect contribution weight
    And the synthesis strategy should be recorded

  Scenario: Track personality interactions
    Given a Cognitive Parliament workflow
    And 8 EEPS personalities are debating
    When personality A responds to personality B's point
    Then the tracker should record the interaction edge
    And the interaction type should be noted (agrees/challenges/builds)
    And the full debate graph should be queryable
```

### Implementation Example
```javascript
class ContextTracker {
  constructor() {
    this.attributions = new Map() // text segment -> source info
    this.lineage = new DirectedGraph()
    this.interactions = []
    this.segmentIndex = new SegmentIndex() // For efficient text search
  }

  trackContribution(source, text, metadata = {}) {
    const id = this.generateId()
    const contribution = {
      id,
      source,
      text,
      timestamp: Date.now(),
      ...metadata
    }
    
    // Index the text for later attribution queries
    this.segmentIndex.index(text, contribution)
    
    // Add to lineage graph
    this.lineage.addNode(id, contribution)
    
    return id
  }
  
  trackSynthesis(sourceIds, synthesizedText, strategy) {
    const synthesisId = this.generateId()
    const synthesis = {
      id: synthesisId,
      type: 'synthesis',
      sources: sourceIds,
      text: synthesizedText,
      strategy,
      timestamp: Date.now()
    }
    
    // Add synthesis node
    this.lineage.addNode(synthesisId, synthesis)
    
    // Connect source nodes to synthesis
    sourceIds.forEach(sourceId => {
      this.lineage.addEdge(sourceId, synthesisId, { type: 'contributed_to' })
    })
    
    // Index the synthesized text
    this.segmentIndex.index(synthesizedText, synthesis)
    
    return synthesisId
  }
  
  getAttribution(textSegment) {
    const matches = this.segmentIndex.search(textSegment)
    
    return matches.map(match => ({
      source: match.source,
      confidence: match.similarity,
      contribution: match.text,
      metadata: match.metadata
    }))
  }
  
  trackInteraction(fromPersonality, toPersonality, interactionType, context) {
    const interaction = {
      from: fromPersonality,
      to: toPersonality,
      type: interactionType, // agrees, challenges, builds_on, clarifies
      context,
      timestamp: Date.now()
    }
    
    this.interactions.push(interaction)
    this.lineage.addEdge(fromPersonality, toPersonality, interaction)
  }
}
```

## Scenario: Context Lineage Tracking

```gherkin
Feature: Context Lineage
  As a context assembler
  I need to track how context flows through workflow steps
  So that I can understand the evolution of ideas

  Scenario: Track multi-step workflow lineage
    Given a deep_analysis workflow with 8 steps
    When step 1 produces insight A
    And step 2 builds on insight A to produce insight B
    And step 3 combines A and B to produce insight C
    Then the lineage graph should show A -> B and A,B -> C
    And I should be able to trace any final recommendation back to origins

  Scenario: Track recursive context building
    Given an Echo Intelligence workflow
    And iteration 1 produces context C1
    When iteration 2 analyzes C1 to produce C2
    And iteration 3 analyzes C2 to produce C3
    Then the lineage should show C1 -> C2 -> C3
    And recursion depth should be tracked
    And circular dependencies should be detected

  Scenario: Cross-session lineage
    Given a session S1 that produces insight I1
    When session S2 loads I1 from memory
    And builds on I1 to produce I2
    Then lineage should connect across sessions
    And the full history should be preserved
```

### Implementation Example
```javascript
class LineageGraph extends DirectedGraph {
  constructor() {
    super()
    this.metadata = new Map()
  }
  
  traceLineage(nodeId, options = {}) {
    const { maxDepth = 10, includeMetadata = true } = options
    const lineage = []
    const visited = new Set()
    
    const trace = (id, depth = 0) => {
      if (visited.has(id) || depth > maxDepth) return
      visited.add(id)
      
      const node = this.getNode(id)
      if (!node) return
      
      lineage.push({
        id,
        depth,
        content: includeMetadata ? node : { id, type: node.type }
      })
      
      // Trace predecessors
      const predecessors = this.getPredecessors(id)
      predecessors.forEach(pred => trace(pred, depth + 1))
    }
    
    trace(nodeId)
    return lineage
  }
  
  detectCycles() {
    // DFS-based cycle detection
    const cycles = []
    const visited = new Set()
    const recursionStack = new Set()
    
    const dfs = (node, path = []) => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)
      
      const neighbors = this.getSuccessors(node)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path])
        } else if (recursionStack.has(neighbor)) {
          // Found cycle
          const cycleStart = path.indexOf(neighbor)
          cycles.push(path.slice(cycleStart))
        }
      }
      
      recursionStack.delete(node)
    }
    
    // Run DFS from all unvisited nodes
    this.nodes.forEach(node => {
      if (!visited.has(node)) dfs(node)
    })
    
    return cycles
  }
}
```

## Scenario: Confidence Scoring

```gherkin
Feature: Attribution Confidence
  As a context tracker
  I need to assign confidence scores to attributions
  So that users understand the certainty of source attribution

  Scenario: Calculate text similarity confidence
    Given a source text "reduce cortisol through phased approach"
    And a query for "phased approach to lower stress"
    When calculating attribution confidence
    Then semantic similarity should be computed
    And confidence should be between 0.7 and 0.9
    And exact matches should have confidence 1.0

  Scenario: Propagate confidence through synthesis
    Given two sources with confidence scores:
      | source | text | confidence |
      | A      | "go slow" | 0.9 |
      | B      | "be fast" | 0.8 |
    When synthesized into "balanced pace"
    Then synthesis confidence should be weighted average
    And conflict should reduce confidence
    And agreement should increase confidence

  Scenario: Decay confidence over workflow steps
    Given an insight from step 1 with confidence 0.95
    When it flows through 5 transformation steps
    Then confidence should decay based on transformation complexity
    And minimum confidence threshold should be enforced
    And high-impact transformations should decay more
```

### Implementation Example
```javascript
class ConfidenceCalculator {
  constructor(options = {}) {
    this.semanticModel = options.semanticModel || new SemanticSimilarity()
    this.decayRate = options.decayRate || 0.05
    this.minConfidence = options.minConfidence || 0.1
  }
  
  calculateTextConfidence(sourceText, queryText) {
    // Exact match
    if (sourceText === queryText) return 1.0
    
    // Substring match
    if (sourceText.includes(queryText) || queryText.includes(sourceText)) {
      const ratio = Math.min(sourceText.length, queryText.length) / 
                    Math.max(sourceText.length, queryText.length)
      return 0.8 + (0.2 * ratio)
    }
    
    // Semantic similarity
    return this.semanticModel.similarity(sourceText, queryText)
  }
  
  calculateSynthesisConfidence(sources, strategy) {
    const confidences = sources.map(s => s.confidence)
    
    switch (strategy) {
      case 'consensus':
        // High confidence if sources agree
        const variance = this.calculateVariance(confidences)
        return Math.max(...confidences) * (1 - variance)
        
      case 'weighted_merge':
        // Weighted average
        return sources.reduce((sum, s) => sum + s.confidence * s.weight, 0) /
               sources.reduce((sum, s) => sum + s.weight, 0)
               
      case 'conflict_resolution':
        // Lower confidence due to conflict
        return Math.min(...confidences) * 0.8
        
      default:
        return this.average(confidences)
    }
  }
  
  applyDecay(confidence, transformationCount, complexity = 1.0) {
    const decay = this.decayRate * transformationCount * complexity
    return Math.max(this.minConfidence, confidence - decay)
  }
}
```

## Scenario: Memory Integration

```gherkin
Feature: Track Context Memory Storage
  As a context tracker
  I need to integrate with memory systems
  So that attributions persist across sessions

  Scenario: Save attribution to memory
    Given a completed workflow with full attribution data
    When saving to long-term memory
    Then key attributions should be preserved
    And storage should be space-efficient
    And retrieval should be fast

  Scenario: Load historical attributions
    Given a new session referencing old insights
    When loading attribution history
    Then previous attributions should be available
    And confidence should reflect age/relevance
    And lineage should connect across time
```

## Test Implementation

```javascript
describe('ContextTracking', () => {
  let tracker
  
  beforeEach(() => {
    tracker = new ContextTracker()
  })
  
  describe('Attribution', () => {
    it('should track simple personality contributions', () => {
      const id = tracker.trackContribution('cortisol_guardian', 
        'Take a calm approach', { confidence: 0.9 })
      
      const attribution = tracker.getAttribution('calm approach')
      expect(attribution[0].source).toBe('cortisol_guardian')
      expect(attribution[0].confidence).toBeGreaterThan(0.8)
    })
    
    it('should track synthesis from multiple sources', () => {
      const id1 = tracker.trackContribution('A', 'go slow')
      const id2 = tracker.trackContribution('B', 'move fast')
      
      const synthId = tracker.trackSynthesis([id1, id2], 
        'balanced pace', 'weighted_merge')
      
      const lineage = tracker.lineage.traceLineage(synthId)
      expect(lineage).toHaveLength(3) // synthesis + 2 sources
    })
  })
  
  describe('Lineage', () => {
    it('should detect circular dependencies', () => {
      tracker.lineage.addEdge('A', 'B')
      tracker.lineage.addEdge('B', 'C')
      tracker.lineage.addEdge('C', 'A')
      
      const cycles = tracker.lineage.detectCycles()
      expect(cycles).toHaveLength(1)
      expect(cycles[0]).toEqual(['A', 'B', 'C'])
    })
    
    it('should trace multi-step lineage', () => {
      // Simulate workflow steps
      const step1 = tracker.trackContribution('step1', 'initial insight')
      const step2 = tracker.trackSynthesis([step1], 'refined insight', 'build')
      const step3 = tracker.trackSynthesis([step1, step2], 'final insight', 'combine')
      
      const lineage = tracker.lineage.traceLineage(step3)
      expect(lineage.map(l => l.depth)).toEqual([0, 1, 2, 1])
    })
  })
  
  describe('Confidence', () => {
    it('should calculate semantic similarity', () => {
      const calc = new ConfidenceCalculator()
      const conf = calc.calculateTextConfidence(
        'reduce stress through phases',
        'lower cortisol with phased approach'
      )
      expect(conf).toBeGreaterThan(0.6)
      expect(conf).toBeLessThan(0.9)
    })
    
    it('should decay confidence through transformations', () => {
      const calc = new ConfidenceCalculator()
      const initial = 0.95
      const decayed = calc.applyDecay(initial, 5, 1.2)
      expect(decayed).toBeLessThan(initial)
      expect(decayed).toBeGreaterThan(calc.minConfidence)
    })
  })
})
```

## Integration with Assembly

```javascript
class ContextAssembler {
  constructor(options) {
    // ... other initialization
    this.tracker = new ContextTracker()
  }
  
  async assemble(recipe) {
    // Track each source as we load it
    const trackedSources = []
    
    for (const source of recipe.sources) {
      const content = await this.loadContent(source)
      const id = this.tracker.trackContribution(
        source.name,
        content.text,
        { type: source.type, metadata: content.metadata }
      )
      trackedSources.push({ id, content })
    }
    
    // Track assembly process
    const assembled = await this.combineWithTracking(
      trackedSources,
      recipe.rules
    )
    
    return {
      text: assembled.text,
      tracking: this.tracker.exportTracking()
    }
  }
}
```