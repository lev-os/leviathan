import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ContextTracker, 
  SegmentIndex,
  ConfidenceCalculator,
  DirectedGraph
} from '../../src/tracking/ContextTracker.js'

describe('Edge Cases - Context Tracking System', () => {
  describe('Empty and Null Inputs', () => {
    let tracker
    let calculator
    
    beforeEach(() => {
      tracker = new ContextTracker()
      calculator = new ConfidenceCalculator()
    })
    
    it('should handle empty text contributions', () => {
      const emptyId = tracker.trackContribution('test_source', '', { confidence: 0.5 })
      expect(emptyId).toBeDefined()
      expect(tracker.contributions.get(emptyId).content.text).toBe('')
    })
    
    it('should handle empty attribution queries', () => {
      tracker.trackContribution('source', 'Some text')
      const emptyAttribution = tracker.getAttribution('')
      expect(emptyAttribution).toEqual([])
    })
    
    it('should handle null attribution queries gracefully', () => {
      const nullAttribution = tracker.getAttribution(null)
      expect(nullAttribution).toEqual([])
      
      const undefinedAttribution = tracker.getAttribution(undefined)
      expect(undefinedAttribution).toEqual([])
    })
    
    it('should calculate confidence for empty strings', () => {
      const emptyConfidence = calculator.calculateTextConfidence('', 'test')
      expect(emptyConfidence).toBe(0)
      
      const bothEmpty = calculator.calculateTextConfidence('', '')
      expect(bothEmpty).toBe(1.0) // Both empty = perfect match
    })
    
    it('should handle synthesis with no sources', () => {
      const noSourcesConfidence = calculator.calculateSynthesisConfidence([], 'consensus')
      expect(noSourcesConfidence).toBe(0.5) // Default confidence
    })
  })
  
  describe('Large Scale Tracking', () => {
    let tracker
    
    beforeEach(() => {
      tracker = new ContextTracker()
    })
    
    it('should handle 1000+ contributions efficiently', () => {
      const start = Date.now()
      const contributions = []
      
      for (let i = 0; i < 1000; i++) {
        const id = tracker.trackContribution(
          `source_${i % 10}`,
          `Contribution text ${i} with some content`,
          { confidence: Math.random() }
        )
        contributions.push(id)
      }
      
      const trackingTime = Date.now() - start
      expect(trackingTime).toBeLessThan(50) // Should complete quickly
      expect(tracker.contributions.size).toBe(1000)
    })
    
    it('should handle deep lineage chains', () => {
      let previousId = tracker.trackContribution('root', 'Root contribution')
      
      // Create a 50-level deep chain
      for (let i = 0; i < 50; i++) {
        previousId = tracker.trackSynthesis(
          [previousId],
          `Level ${i + 1} synthesis`,
          'build_on'
        )
      }
      
      const lineage = tracker.getLineage(previousId)
      expect(lineage.length).toBe(51) // Root + 50 levels
      expect(Math.max(...lineage.map(n => n.depth))).toBe(50)
    })
    
    it('should detect cycles in complex graphs', () => {
      // Create a complex graph with multiple cycles
      const nodes = []
      for (let i = 0; i < 10; i++) {
        nodes.push(tracker.trackContribution(`node_${i}`, `Content ${i}`))
      }
      
      // Create edges that form cycles
      tracker.lineage.addEdge(nodes[0], nodes[1])
      tracker.lineage.addEdge(nodes[1], nodes[2])
      tracker.lineage.addEdge(nodes[2], nodes[0]) // Cycle 1
      
      tracker.lineage.addEdge(nodes[3], nodes[4])
      tracker.lineage.addEdge(nodes[4], nodes[5])
      tracker.lineage.addEdge(nodes[5], nodes[3]) // Cycle 2
      
      const cycles = tracker.lineage.detectCycles()
      expect(cycles.length).toBeGreaterThanOrEqual(2)
    })
  })
  
  describe('Unicode and Special Characters', () => {
    let tracker
    let index
    
    beforeEach(() => {
      tracker = new ContextTracker()
      index = new SegmentIndex()
    })
    
    it('should handle Unicode text correctly', () => {
      const unicodeTexts = [
        '你好世界 Hello World',
        '🚀 Launch with emojis 🎉',
        'Mathematical: ∑∫∂ϕ',
        'Café résumé naïve',
        'عربي العالم'
      ]
      
      unicodeTexts.forEach(text => {
        const id = tracker.trackContribution('unicode_source', text)
        index.index(text, { id, text })
      })
      
      // Test searching for Unicode content
      const chineseMatch = index.search('你好')
      expect(chineseMatch.length).toBeGreaterThan(0)
      
      const emojiMatch = index.search('🚀')
      expect(emojiMatch.length).toBeGreaterThan(0)
    })
    
    it('should handle special characters in text', () => {
      const specialTexts = [
        'Code: if (x > 0) { return true; }',
        'Path: /usr/local/bin/node',
        'Regex: /^[a-zA-Z0-9]+$/',
        'Quote: "Hello, World!"',
        'Escape: \n\t\r\\'
      ]
      
      specialTexts.forEach(text => {
        const id = tracker.trackContribution('special_source', text)
        expect(tracker.contributions.get(id).content.text).toBe(text)
      })
    })
  })
  
  describe('Boundary Conditions', () => {
    let calculator
    
    beforeEach(() => {
      calculator = new ConfidenceCalculator()
    })
    
    it('should handle extreme confidence values', () => {
      const sources = [
        { confidence: 0, weight: 1 },
        { confidence: 1, weight: 1 },
        { confidence: -1, weight: 1 }, // Invalid but should handle
        { confidence: 2, weight: 1 }   // Invalid but should handle
      ]
      
      const confidence = calculator.calculateSynthesisConfidence(sources, 'consensus')
      expect(confidence).toBeGreaterThanOrEqual(0)
      expect(confidence).toBeLessThanOrEqual(1)
    })
    
    it('should handle very long texts', () => {
      const longText = 'A'.repeat(100000) // 100k characters
      const tracker = new ContextTracker()
      
      const id = tracker.trackContribution('long_source', longText)
      expect(tracker.contributions.get(id).content.text.length).toBe(100000)
      
      // Attribution should still work
      const start = Date.now()
      const attribution = tracker.getAttribution('A'.repeat(50))
      const searchTime = Date.now() - start
      
      expect(searchTime).toBeLessThan(100) // Should be fast even with long text
      expect(attribution.length).toBeGreaterThan(0)
    })
    
    it('should handle circular references in lineage', () => {
      const graph = new DirectedGraph()
      
      // Create nodes
      graph.addNode('A', { id: 'A' })
      graph.addNode('B', { id: 'B' })
      graph.addNode('C', { id: 'C' })
      
      // Create circular reference
      graph.addEdge('A', 'B')
      graph.addEdge('B', 'C')
      graph.addEdge('C', 'A')
      
      // BFS should handle this without infinite loop
      const traversal = graph.bfs('A')
      expect(traversal.length).toBe(3)
      expect(traversal.every(n => n.visited)).toBe(true)
    })
  })
  
  describe('Concurrent Operations', () => {
    it('should handle concurrent tracking operations', async () => {
      const tracker = new ContextTracker()
      
      // Simulate concurrent contributions
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              const id = tracker.trackContribution(`source_${i}`, `Text ${i}`)
              resolve(id)
            }, Math.random() * 10)
          })
        )
      }
      
      const ids = await Promise.all(promises)
      
      expect(ids.length).toBe(100)
      expect(new Set(ids).size).toBe(100) // All IDs should be unique
      expect(tracker.contributions.size).toBe(100)
    })
  })
  
  describe('Memory Efficiency', () => {
    it('should export tracking data efficiently', () => {
      const tracker = new ContextTracker()
      
      // Create a complex tracking scenario
      for (let i = 0; i < 100; i++) {
        const c1 = tracker.trackContribution(`p1_${i}`, `Perspective 1 iteration ${i}`)
        const c2 = tracker.trackContribution(`p2_${i}`, `Perspective 2 iteration ${i}`)
        tracker.trackSynthesis([c1, c2], `Synthesis ${i}`, 'merge')
        
        if (i % 10 === 0) {
          tracker.trackInteraction(`p1_${i}`, `p2_${i}`, 'challenges', `Conflict ${i}`)
        }
      }
      
      const exported = tracker.exportTracking()
      const exportSize = JSON.stringify(exported).length
      
      expect(exported.contributions.length).toBe(300) // 100 * 3
      expect(exported.interactions.length).toBe(10)
      expect(exportSize).toBeLessThan(100000) // Should be reasonably sized
    })
  })
})