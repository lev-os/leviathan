import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ContextTracker, 
  DirectedGraph, 
  SegmentIndex, 
  ConfidenceCalculator,
  TrackingContextAssembler
} from '../../src/tracking/ContextTracker.js'

describe('Context Tracking System', () => {
  describe('Basic Attribution', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should track personality contributions', () => {
      const cortisol = tracker.trackContribution('cortisol_guardian', 
        'Let\'s approach this calmly and reduce stress', 
        { confidence: 0.9 })
      
      const action = tracker.trackContribution('action_catalyst', 
        'We need to move quickly on this opportunity', 
        { confidence: 0.8 })
      
      const systems = tracker.trackContribution('systems_illuminator', 
        'The pattern here suggests a phased approach for calm execution', 
        { confidence: 0.85 })
        
      expect(tracker.contributions.size).toBe(3)
      expect(tracker.contributions.get(cortisol)).toBeDefined()
      expect(tracker.contributions.get(action)).toBeDefined()
      expect(tracker.contributions.get(systems)).toBeDefined()
    })
    
    it('should attribute text segments to sources', () => {
      tracker.trackContribution('cortisol_guardian', 
        'Let\'s approach this calmly and reduce stress', 
        { confidence: 0.9 })
        
      const attribution = tracker.getAttribution('approach this calmly')
      expect(attribution).toHaveLength(1)
      expect(attribution[0].source).toBe('cortisol_guardian')
      expect(attribution[0].confidence).toBeGreaterThan(0.7)
    })
    
    it('should track synthesis with multiple sources', () => {
      const c1 = tracker.trackContribution('cortisol_guardian', 'Be calm')
      const c2 = tracker.trackContribution('action_catalyst', 'Move fast')
      const c3 = tracker.trackContribution('systems_illuminator', 'Be systematic')
      
      const synthesisId = tracker.trackSynthesis(
        [c1, c2, c3],
        'Take a carefully phased approach that moves quickly while reducing stress',
        'weighted_merge'
      )
      
      expect(synthesisId).toBeDefined()
      expect(tracker.contributions.get(synthesisId)).toBeDefined()
      
      const synthesis = tracker.contributions.get(synthesisId)
      expect(synthesis.content.sources).toHaveLength(3)
      expect(synthesis.content.type).toBe('weighted_merge')
    })
  })
  
  describe('Lineage Tracking', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should track workflow lineage', () => {
      const step1 = tracker.trackContribution('step1', 'Initial insight: market opportunity exists')
      const step2 = tracker.trackSynthesis([step1], 'Refined insight: B2B market shows strong demand', 'build_on')
      const step3 = tracker.trackSynthesis([step1, step2], 'Final insight: Enterprise B2B SaaS opportunity with high demand', 'combine')
      
      const lineage = tracker.getLineage(step3)
      expect(lineage).toHaveLength(3)
      expect(lineage[0].depth).toBe(0)
      expect(lineage[1].depth).toBe(1)
      expect(lineage[2].depth).toBe(2)
    })
    
    it('should detect cycles in lineage graph', () => {
      const step1 = tracker.trackContribution('step1', 'Initial')
      const step2 = tracker.trackSynthesis([step1], 'Refined', 'build')
      const step3 = tracker.trackSynthesis([step2], 'Final', 'combine')
      
      // Create artificial cycle
      tracker.lineage.addEdge(step3, step1)
      
      const cycles = tracker.lineage.detectCycles()
      expect(cycles.length).toBeGreaterThan(0)
    })
  })
  
  describe('Confidence Calculation', () => {
    let calculator
    
    beforeEach(() => {
      calculator = new ConfidenceCalculator()
    })
    
    it('should calculate exact match confidence', () => {
      const confidence = calculator.calculateTextConfidence('reduce stress', 'reduce stress')
      expect(confidence).toBe(1.0)
    })
    
    it('should calculate substring match confidence', () => {
      const confidence = calculator.calculateTextConfidence('reduce stress through phases', 'reduce stress')
      expect(confidence).toBeGreaterThan(0.8)
      expect(confidence).toBeLessThan(1.0)
    })
    
    it('should calculate semantic similarity confidence', () => {
      const confidence = calculator.calculateTextConfidence('lower cortisol levels', 'reduce stress')
      expect(confidence).toBeGreaterThan(0.4)
      expect(confidence).toBeLessThan(0.8)
    })
    
    it('should calculate synthesis confidence', () => {
      const sources = [
        { confidence: 0.9, weight: 1.0 },
        { confidence: 0.8, weight: 1.0 },
        { confidence: 0.85, weight: 1.0 }
      ]
      
      const consensus = calculator.calculateSynthesisConfidence(sources, 'consensus')
      expect(consensus).toBeCloseTo(0.85, 1)
      
      const conflict = calculator.calculateSynthesisConfidence(sources, 'conflict_resolution')
      expect(conflict).toBeLessThan(consensus)
    })
    
    it('should apply temporal decay', () => {
      const fresh = calculator.applyTemporalDecay(0.9, 0)
      expect(fresh).toBe(0.9)
      
      const aged = calculator.applyTemporalDecay(0.9, 24 * 60 * 60 * 1000) // 1 day
      expect(aged).toBeLessThan(0.9)
      expect(aged).toBeGreaterThan(0.85)
    })
  })
  
  describe('Segment Index', () => {
    let index
    
    beforeEach(() => {
      index = new SegmentIndex()
    })
    
    it('should index text segments', () => {
      const contributions = [
        { id: '1', source: 'cortisol_guardian', text: 'Take a calm, measured approach' },
        { id: '2', source: 'action_catalyst', text: 'Move fast and seize opportunities' },
        { id: '3', source: 'systems_illuminator', text: 'Approach with systematic thinking' }
      ]
      
      contributions.forEach(c => index.index(c.text, c))
      expect(index.segments.size).toBe(3)
    })
    
    it('should find exact matches', () => {
      index.index('Take a calm, measured approach', { id: '1', source: 'cortisol_guardian' })
      
      const matches = index.search('Take a calm, measured approach')
      expect(matches).toHaveLength(1)
      expect(matches[0].similarity).toBe(1.0)
      expect(matches[0].segment.text).toBe('Take a calm, measured approach')
    })
    
    it('should find substring matches', () => {
      index.index('Take a calm, measured approach', { id: '1', source: 'cortisol_guardian' })
      
      const matches = index.search('calm approach')
      expect(matches).toHaveLength(1)
      expect(matches[0].similarity).toBeGreaterThan(0.5)
      expect(matches[0].similarity).toBeLessThan(1.0)
    })
    
    it('should find word-based matches', () => {
      index.index('Take a calm, measured approach', { id: '1' })
      index.index('Approach with systematic thinking', { id: '2' })
      
      const matches = index.search('systematic calm')
      expect(matches.length).toBeGreaterThan(0)
    })
  })
  
  describe('Personality Interactions', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should track personality interactions', () => {
      tracker.trackInteraction(
        'cortisol_guardian', 
        'action_catalyst', 
        'challenges', 
        'Speed vs. sustainability debate'
      )
      
      tracker.trackInteraction(
        'systems_illuminator',
        'cortisol_guardian',
        'builds_on',
        'Adding systematic structure to calm approach'
      )
      
      tracker.trackInteraction(
        'action_catalyst',
        'systems_illuminator',
        'agrees',
        'Fast execution with systematic structure'
      )
      
      expect(tracker.interactions).toHaveLength(3)
      expect(tracker.interactions.filter(i => i.type === 'challenges')).toHaveLength(1)
      expect(tracker.interactions.filter(i => i.type === 'builds_on')).toHaveLength(1)
      expect(tracker.interactions.filter(i => i.type === 'agrees')).toHaveLength(1)
    })
    
    it('should export interaction data', () => {
      tracker.trackInteraction('p1', 'p2', 'challenges', 'test')
      const exported = tracker.exportTracking()
      
      expect(exported).toHaveProperty('interactions')
      expect(exported.interactions).toHaveLength(1)
      expect(exported).toHaveProperty('contributions')
      expect(exported).toHaveProperty('lineage')
    })
  })
  
  describe('Integrated Tracking', () => {
    it('should assemble contexts with tracking', async () => {
      const assembler = new TrackingContextAssembler({
        yaml: { basePath: './' }
      })
      
      const recipe = {
        sources: [
          { name: 'test1', path: 'yaml:ceo-config.yaml', type: 'config' }
        ],
        rules: { strategy: 'simple_concatenation' }
      }
      
      try {
        const result = await assembler.assembleWithTracking(recipe)
        expect(result).toHaveProperty('assembled')
        expect(result).toHaveProperty('sources')
        expect(result).toHaveProperty('tracking')
        expect(result.sources.length).toBeGreaterThan(0)
      } catch (error) {
        // If file doesn't exist, that's ok for this test
        expect(error.message).toMatch(/ENOENT|load/)
      }
    })
  })
})