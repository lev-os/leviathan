import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ContextTracker, 
  SegmentIndex,
  ConfidenceCalculator,
  TrackingContextAssembler
} from '../../src/tracking/ContextTracker.js'

describe('Stress Tests - Context Tracking System', () => {
  describe('8-Personality CEO Debate', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should handle complex 8-personality debate', () => {
      const personalities = [
        'cortisol_guardian',
        'abundance_amplifier', 
        'sovereignty_architect',
        'harmony_weaver',
        'systems_illuminator',
        'resilience_guardian',
        'flow_creator',
        'action_catalyst'
      ]
      
      const contributions = []
      
      // Each personality contributes
      personalities.forEach(personality => {
        const id = tracker.trackContribution(
          personality,
          `${personality} perspective on the challenge`,
          { confidence: 0.8 + Math.random() * 0.2 }
        )
        contributions.push(id)
      })
      
      // Track interactions between personalities
      for (let i = 0; i < personalities.length; i++) {
        for (let j = i + 1; j < personalities.length; j++) {
          const interactionType = Math.random() > 0.5 ? 'agrees' : 'challenges'
          tracker.trackInteraction(
            personalities[i],
            personalities[j],
            interactionType,
            `${personalities[i]} ${interactionType} ${personalities[j]}`
          )
        }
      }
      
      // Create synthesis
      const synthesisId = tracker.trackSynthesis(
        contributions,
        'Unified perspective integrating all 8 CEO personalities',
        'multi_personality_synthesis'
      )
      
      expect(tracker.contributions.size).toBe(9) // 8 contributions + 1 synthesis
      expect(tracker.interactions.length).toBe(28) // C(8,2) = 28 pairs
      
      // Check lineage
      const lineage = tracker.getLineage(synthesisId)
      expect(lineage.length).toBe(9)
    })
  })
  
  describe('EEPS Parliament Simulation', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should handle 69-member parliament voting simulation', () => {
      const parties = {
        'exploration': 17,
        'exploitation': 17,
        'preservation': 17,
        'synthesis': 18
      }
      
      const votes = []
      const start = Date.now()
      
      // Each member votes
      Object.entries(parties).forEach(([party, members]) => {
        for (let i = 0; i < members; i++) {
          const voterId = `${party}_member_${i}`
          const voteId = tracker.trackContribution(
            voterId,
            `I vote for ${party} approach to the challenge`,
            { 
              confidence: 0.7 + Math.random() * 0.3,
              metadata: { party, memberId: i }
            }
          )
          votes.push({ party, voteId })
        }
      })
      
      // Track party consensus
      const partyConsensus = {}
      Object.keys(parties).forEach(party => {
        const partyVotes = votes.filter(v => v.party === party).map(v => v.voteId)
        const consensusId = tracker.trackSynthesis(
          partyVotes,
          `${party} party consensus position`,
          'party_consensus'
        )
        partyConsensus[party] = consensusId
      })
      
      // Final parliament synthesis
      const finalDecision = tracker.trackSynthesis(
        Object.values(partyConsensus),
        'Parliament decision: Balanced approach incorporating all perspectives',
        'parliament_decision'
      )
      
      const duration = Date.now() - start
      
      expect(votes.length).toBe(69)
      expect(Object.keys(partyConsensus).length).toBe(4)
      expect(duration).toBeLessThan(50) // Should be very fast
      
      // Check complex lineage
      const lineage = tracker.getLineage(finalDecision)
      expect(lineage.length).toBe(74) // 69 votes + 4 consensus + 1 final
    })
  })
  
  describe('Recursive Analysis - Echo Intelligence', () => {
    let tracker
    let calculator
    
    beforeEach(() => {
      tracker = new ContextTracker()
      calculator = new ConfidenceCalculator()
    })
    
    it('should handle 10-level recursive analysis', () => {
      let previousAnalysis = tracker.trackContribution(
        'initial_analyst',
        'Base analysis of the problem',
        { confidence: 0.6 }
      )
      
      const confidences = [0.6]
      
      // 10 levels of recursive refinement
      for (let level = 1; level <= 10; level++) {
        const newConfidence = Math.min(
          confidences[level - 1] + 0.05,
          0.95
        )
        
        previousAnalysis = tracker.trackSynthesis(
          [previousAnalysis],
          `Level ${level} refined analysis building on previous insights`,
          'recursive_refinement',
          { confidence: newConfidence }
        )
        
        confidences.push(newConfidence)
      }
      
      // Verify confidence evolution
      expect(confidences[0]).toBe(0.6)
      expect(confidences[10]).toBeGreaterThan(0.9)
      expect(confidences[10]).toBeLessThanOrEqual(0.95)
      
      // Check lineage depth
      const lineage = tracker.getLineage(previousAnalysis)
      expect(lineage.length).toBe(11) // Initial + 10 refinements
      expect(lineage[10].depth).toBe(10)
    })
  })
  
  describe('Cross-Domain Knowledge Transfer', () => {
    let assembler
    
    beforeEach(() => {
      assembler = new TrackingContextAssembler({
        yaml: { basePath: './' }
      })
    })
    
    it('should track attribution across 5 different domains', async () => {
      const domains = [
        { name: 'medical', concept: 'diagnosis through pattern recognition' },
        { name: 'finance', concept: 'risk assessment via pattern analysis' },
        { name: 'engineering', concept: 'fault detection using patterns' },
        { name: 'education', concept: 'learning gap identification patterns' },
        { name: 'security', concept: 'threat detection pattern matching' }
      ]
      
      const tracker = assembler.tracker
      const domainContributions = []
      
      // Each domain contributes
      domains.forEach(domain => {
        const id = tracker.trackContribution(
          `${domain.name}_expert`,
          domain.concept,
          { confidence: 0.85, domain: domain.name }
        )
        domainContributions.push(id)
      })
      
      // Cross-domain synthesis
      const crossDomainId = tracker.trackSynthesis(
        domainContributions,
        'Universal pattern recognition principle applies across all domains',
        'cross_domain_transfer'
      )
      
      // Test attribution across domains
      const patternAttribution = tracker.getAttribution('pattern')
      expect(patternAttribution.length).toBe(5) // All domains mention patterns
      
      const medicalAttribution = tracker.getAttribution('diagnosis')
      expect(medicalAttribution.length).toBe(1)
      expect(medicalAttribution[0].source).toBe('medical_expert')
    })
  })
  
  describe('Performance Benchmarks', () => {
    it('should handle 10k contributions with sub-second performance', () => {
      const tracker = new ContextTracker()
      const start = Date.now()
      
      // Add 10k contributions
      for (let i = 0; i < 10000; i++) {
        tracker.trackContribution(
          `source_${i % 100}`,
          `Contribution ${i} with detailed content about various topics`,
          { confidence: Math.random() }
        )
      }
      
      const trackingTime = Date.now() - start
      expect(trackingTime).toBeLessThan(1000) // Under 1 second
      
      // Test search performance
      const searchStart = Date.now()
      const results = tracker.getAttribution('Contribution 5000')
      const searchTime = Date.now() - searchStart
      
      expect(searchTime).toBeLessThan(50) // Fast search
      expect(results.length).toBeGreaterThan(0)
    })
    
    it('should export large tracking data efficiently', () => {
      const tracker = new ContextTracker()
      
      // Create complex scenario
      for (let i = 0; i < 1000; i++) {
        const c1 = tracker.trackContribution(`p1`, `Text A ${i}`)
        const c2 = tracker.trackContribution(`p2`, `Text B ${i}`)
        
        if (i % 10 === 0) {
          tracker.trackSynthesis([c1, c2], `Synthesis ${i}`, 'merge')
        }
        
        if (i % 50 === 0) {
          tracker.trackInteraction('p1', 'p2', 'challenges', `Debate ${i}`)
        }
      }
      
      const exportStart = Date.now()
      const exported = tracker.exportTracking()
      const exportTime = Date.now() - exportStart
      
      expect(exportTime).toBeLessThan(100) // Fast export
      expect(exported.contributions.length).toBeGreaterThan(2000)
      
      // Check serialization size
      const serialized = JSON.stringify(exported)
      expect(serialized.length).toBeLessThan(500000) // Reasonable size
    })
  })
})