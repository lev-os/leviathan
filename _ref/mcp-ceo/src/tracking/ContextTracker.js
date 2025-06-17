/**
 * Context Tracking System - Spec 02 Implementation
 * 
 * Implements BDD specs from spec/02-context-tracking.md
 * - Attribution tracking (which source contributed what text)
 * - Lineage graphs (context flow through workflow steps)
 * - Confidence scoring for attributions
 * - Synthesis tracking for personality interactions
 */

import { randomUUID } from 'crypto'

// Context Tracking Classes
export class ContextTracker {
  constructor() {
    this.attributions = new Map() // text segment -> source info
    this.lineage = new DirectedGraph()
    this.interactions = []
    this.segmentIndex = new SegmentIndex() // For efficient text search
    this.confidenceCalculator = new ConfidenceCalculator()
  }

  trackContribution(source, text, metadata = {}) {
    const id = this.generateId()
    const contribution = {
      id,
      source,
      text,
      timestamp: Date.now(),
      confidence: metadata.confidence || 1.0,
      ...metadata
    }
    
    // Index the text for later attribution queries
    this.segmentIndex.index(text, contribution)
    
    // Add to lineage graph
    this.lineage.addNode(id, contribution)
    
    return id
  }
  
  trackSynthesis(sourceIds, synthesizedText, strategy, metadata = {}) {
    const synthesisId = this.generateId()
    const sourceContributions = sourceIds.map(id => this.lineage.getNode(id))
    
    // Calculate synthesis confidence
    const confidence = this.confidenceCalculator.calculateSynthesisConfidence(
      sourceContributions, 
      strategy
    )
    
    const synthesis = {
      id: synthesisId,
      type: 'synthesis',
      sources: sourceIds,
      text: synthesizedText,
      strategy,
      confidence,
      timestamp: Date.now(),
      ...metadata
    }
    
    // Add synthesis node
    this.lineage.addNode(synthesisId, synthesis)
    
    // Connect source nodes to synthesis
    sourceIds.forEach(sourceId => {
      this.lineage.addEdge(sourceId, synthesisId, { 
        type: 'contributed_to',
        timestamp: Date.now()
      })
    })
    
    // Index the synthesized text
    this.segmentIndex.index(synthesizedText, synthesis)
    
    return synthesisId
  }
  
  getAttribution(textSegment) {
    const matches = this.segmentIndex.search(textSegment)
    
    return matches.map(match => ({
      source: match.contribution.source,
      confidence: this.confidenceCalculator.calculateTextConfidence(
        match.contribution.text, 
        textSegment
      ),
      contribution: match.contribution.text,
      contributionId: match.contribution.id,
      metadata: match.contribution
    })).sort((a, b) => b.confidence - a.confidence)
  }
  
  trackInteraction(fromPersonality, toPersonality, interactionType, context, metadata = {}) {
    const interaction = {
      id: this.generateId(),
      from: fromPersonality,
      to: toPersonality,
      type: interactionType, // agrees, challenges, builds_on, clarifies
      context,
      timestamp: Date.now(),
      ...metadata
    }
    
    this.interactions.push(interaction)
    
    // Ensure personality nodes exist before creating edges
    if (!this.lineage.nodes.has(fromPersonality)) {
      this.lineage.addNode(fromPersonality, { type: 'personality', name: fromPersonality })
    }
    if (!this.lineage.nodes.has(toPersonality)) {
      this.lineage.addNode(toPersonality, { type: 'personality', name: toPersonality })
    }
    
    this.lineage.addEdge(fromPersonality, toPersonality, interaction)
    
    return interaction.id
  }
  
  getLineage(nodeId, options = {}) {
    return this.lineage.traceLineage(nodeId, options)
  }
  
  exportTracking() {
    return {
      contributions: Array.from(this.attributions.values()),
      lineage: this.lineage.export(),
      interactions: this.interactions,
      timestamp: Date.now()
    }
  }
  
  generateId() {
    return randomUUID()
  }
}

// Directed Graph for Lineage Tracking
export class DirectedGraph {
  constructor() {
    this.nodes = new Map()
    this.edges = new Map()
    this.reverseEdges = new Map() // for efficient predecessor lookup
  }
  
  addNode(id, data) {
    this.nodes.set(id, data)
    if (!this.edges.has(id)) {
      this.edges.set(id, new Set())
    }
    if (!this.reverseEdges.has(id)) {
      this.reverseEdges.set(id, new Set())
    }
  }
  
  addEdge(fromId, toId, edgeData = {}) {
    // Ensure nodes exist
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      throw new Error(`Cannot add edge: missing node(s)`)
    }
    
    this.edges.get(fromId).add(toId)
    this.reverseEdges.get(toId).add(fromId)
    
    // Store edge data
    const edgeKey = `${fromId}->${toId}`
    if (!this.edgeData) this.edgeData = new Map()
    this.edgeData.set(edgeKey, edgeData)
  }
  
  getNode(id) {
    return this.nodes.get(id)
  }
  
  getSuccessors(id) {
    return Array.from(this.edges.get(id) || [])
  }
  
  getPredecessors(id) {
    return Array.from(this.reverseEdges.get(id) || [])
  }
  
  traceLineage(nodeId, options = {}) {
    const { maxDepth = 10, includeMetadata = true, direction = 'backward' } = options
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
        content: includeMetadata ? node : { id, type: node.type },
        timestamp: node.timestamp
      })
      
      // Trace based on direction
      const nextNodes = direction === 'backward' 
        ? this.getPredecessors(id)
        : this.getSuccessors(id)
        
      nextNodes.forEach(nextId => trace(nextId, depth + 1))
    }
    
    trace(nodeId)
    return lineage.sort((a, b) => a.depth - b.depth)
  }
  
  detectCycles() {
    const cycles = []
    const visited = new Set()
    const recursionStack = new Set()
    
    const dfs = (nodeId, path = []) => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)
      
      const successors = this.getSuccessors(nodeId)
      for (const successor of successors) {
        if (!visited.has(successor)) {
          dfs(successor, [...path])
        } else if (recursionStack.has(successor)) {
          // Found cycle
          const cycleStart = path.indexOf(successor)
          cycles.push(path.slice(cycleStart))
        }
      }
      
      recursionStack.delete(nodeId)
    }
    
    // Run DFS from all unvisited nodes
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    }
    
    return cycles
  }
  
  export() {
    return {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()).map(([from, toSet]) => 
        Array.from(toSet).map(to => ({ from, to }))
      ).flat(),
      edgeData: this.edgeData ? Array.from(this.edgeData.entries()) : []
    }
  }
}// Segment Index for Efficient Text Search
export class SegmentIndex {
  constructor() {
    this.segments = new Map() // normalized text -> contributions
    this.wordIndex = new Map() // word -> segments containing it
  }
  
  index(text, contribution) {
    const normalized = this.normalizeText(text)
    
    // Store full text segment
    if (!this.segments.has(normalized)) {
      this.segments.set(normalized, [])
    }
    this.segments.get(normalized).push(contribution)
    
    // Index individual words
    const words = this.extractWords(normalized)
    words.forEach(word => {
      if (!this.wordIndex.has(word)) {
        this.wordIndex.set(word, new Set())
      }
      this.wordIndex.get(word).add(normalized)
    })
  }
  
  search(queryText) {
    if (!queryText) return []
    const normalizedQuery = this.normalizeText(queryText)
    const matches = []
    
    // Exact matches first
    if (this.segments.has(normalizedQuery)) {
      const contributions = this.segments.get(normalizedQuery)
      matches.push(...contributions.map(c => ({
        contribution: c,
        similarity: 1.0,
        matchType: 'exact'
      })))
    }
    
    // Substring matches
    for (const [segmentText, contributions] of this.segments.entries()) {
      if (segmentText !== normalizedQuery) {
        if (segmentText.includes(normalizedQuery) || normalizedQuery.includes(segmentText)) {
          const similarity = this.calculateSubstringSimilarity(segmentText, normalizedQuery)
          matches.push(...contributions.map(c => ({
            contribution: c,
            similarity,
            matchType: 'substring'
          })))
        }
      }
    }
    
    // Word-based matches
    const queryWords = this.extractWords(normalizedQuery)
    const candidateSegments = new Set()
    
    queryWords.forEach(word => {
      const segments = this.wordIndex.get(word)
      if (segments) {
        segments.forEach(segment => candidateSegments.add(segment))
      }
    })
    
    for (const segmentText of candidateSegments) {
      if (!this.segments.get(segmentText).some(c => 
        matches.find(m => m.contribution.id === c.id))) {
        const similarity = this.calculateWordSimilarity(segmentText, normalizedQuery)
        if (similarity > 0.3) { // threshold for relevance
          const contributions = this.segments.get(segmentText)
          matches.push(...contributions.map(c => ({
            contribution: c,
            similarity,
            matchType: 'word_based'
          })))
        }
      }
    }
    
    return matches.sort((a, b) => b.similarity - a.similarity)
  }
  
  normalizeText(text) {
    return text.toLowerCase().trim().replace(/\s+/g, ' ')
  }
  
  extractWords(text) {
    return text.split(/\W+/).filter(word => word.length > 2)
  }
  
  calculateSubstringSimilarity(text1, text2) {
    const shorter = text1.length < text2.length ? text1 : text2
    const longer = text1.length >= text2.length ? text1 : text2
    return shorter.length / longer.length
  }
  
  calculateWordSimilarity(text1, text2) {
    const words1 = new Set(this.extractWords(text1))
    const words2 = new Set(this.extractWords(text2))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size // Jaccard similarity
  }
}

// Confidence Calculator
export class ConfidenceCalculator {
  constructor(options = {}) {
    this.decayRate = options.decayRate || 0.05
    this.minConfidence = options.minConfidence || 0.1
    this.semanticThreshold = options.semanticThreshold || 0.6
  }
  
  calculateTextConfidence(sourceText, queryText) {
    // Exact match
    if (sourceText === queryText) return 1.0
    
    // Normalize both texts
    const normalizedSource = sourceText.toLowerCase().trim()
    const normalizedQuery = queryText.toLowerCase().trim()
    
    if (normalizedSource === normalizedQuery) return 0.98
    
    // Substring match
    if (normalizedSource.includes(normalizedQuery) || normalizedQuery.includes(normalizedSource)) {
      const ratio = Math.min(normalizedSource.length, normalizedQuery.length) / 
                    Math.max(normalizedSource.length, normalizedQuery.length)
      return 0.7 + (0.25 * ratio) // 0.7 to 0.95 range
    }
    
    // Word-based similarity (Jaccard)
    const words1 = new Set(normalizedSource.split(/\W+/).filter(w => w.length > 2))
    const words2 = new Set(normalizedQuery.split(/\W+/).filter(w => w.length > 2))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    if (union.size === 0) return 0
    
    const jaccardSimilarity = intersection.size / union.size
    return Math.max(this.minConfidence, jaccardSimilarity * 0.8) // Scale to 0.8 max
  }
  
  calculateSynthesisConfidence(sources, strategy) {
    if (!sources || sources.length === 0) return 0
    
    const confidences = sources.map(s => s.confidence || 1.0)
    
    switch (strategy) {
      case 'consensus':
        // High confidence if sources agree (low variance)
        const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length
        const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length
        return Math.max(this.minConfidence, mean * (1 - Math.sqrt(variance)))
        
      case 'weighted_merge':
        // Weighted average (assuming equal weights if not specified)
        const weights = sources.map(s => s.weight || 1.0)
        const weightedSum = confidences.reduce((sum, c, i) => sum + c * weights[i], 0)
        const totalWeight = weights.reduce((a, b) => a + b, 0)
        return totalWeight > 0 ? weightedSum / totalWeight : this.minConfidence
        
      case 'conflict_resolution':
        // Lower confidence due to conflict
        const minConfidence = Math.min(...confidences)
        return Math.max(this.minConfidence, minConfidence * 0.8)
        
      case 'build_on':
        // Confidence builds on previous
        return Math.max(this.minConfidence, Math.max(...confidences) * 0.95)
        
      default:
        // Simple average
        return confidences.reduce((a, b) => a + b, 0) / confidences.length
    }
  }
  
  applyDecay(confidence, transformationCount, complexity = 1.0) {
    const decay = this.decayRate * transformationCount * complexity
    return Math.max(this.minConfidence, confidence - decay)
  }
  
  applyTemporalDecay(confidence, ageInMs) {
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
    const decayFactor = Math.pow(0.95, ageInDays) // 5% decay per day
    return Math.max(this.minConfidence, confidence * decayFactor)
  }
}

// Integration with Context Assembler
export class TrackingContextAssembler {
  constructor(config = {}) {
    // Import the base assembler - use dynamic import for ES modules
    this.assemblerConfig = config
    this.tracker = new ContextTracker()
    this._assembler = null
  }
  
  async getAssembler() {
    if (!this._assembler) {
      const { ContextAssembler } = await import('../context-assembler.js')
      this._assembler = new ContextAssembler(this.assemblerConfig)
    }
    return this._assembler
  }
  
  async assembleWithTracking(recipe) {
    const assembler = await this.getAssembler()
    const trackedSources = []
    
    // Load and track each source
    for (const source of recipe.sources) {
      const content = await assembler.load(source.path)
      
      const contributionId = this.tracker.trackContribution(
        source.name,
        JSON.stringify(content), // For now, track full content
        { 
          type: source.type || 'context',
          path: source.path,
          loadedAt: Date.now()
        }
      )
      
      trackedSources.push({ 
        id: contributionId,
        content, 
        source: source.name,
        path: source.path
      })
    }
    
    // Apply assembly rules with tracking
    const assembled = await this.combineWithTracking(trackedSources, recipe.rules)
    
    return {
      assembled: assembled.content,
      tracking: this.tracker.exportTracking(),
      sources: trackedSources.map(s => ({ id: s.id, source: s.source, path: s.path }))
    }
  }
  
  async combineWithTracking(trackedSources, rules) {
    // Simple combination for now - will be enhanced in Spec 03
    const combined = trackedSources.map(s => s.content).join('\n\n')
    
    // Track the synthesis
    const synthesisId = this.tracker.trackSynthesis(
      trackedSources.map(s => s.id),
      combined,
      'simple_concatenation',
      { combinedAt: Date.now() }
    )
    
    return {
      content: combined,
      synthesisId,
      sourceIds: trackedSources.map(s => s.id)
    }
  }
  
  getAttribution(text) {
    return this.tracker.getAttribution(text)
  }
  
  getLineage(nodeId) {
    return this.tracker.getLineage(nodeId)
  }
}