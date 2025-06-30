/**
 * Memory Decay Manager
 * Implements temporal and usage-based memory decay/reinforcement
 * Extracted and enhanced from mcp-ceo/src/tracking/ContextTracker.js
 */

class MemoryDecayManager {
  constructor(options = {}) {
    // Decay configuration
    this.temporalDecayRate = options.temporalDecayRate || 0.95 // 5% decay per day
    this.transformDecayRate = options.transformDecayRate || 0.05
    this.minConfidence = options.minConfidence || 0.1
    this.maxConfidence = options.maxConfidence || 1.0

    // Reinforcement configuration
    this.reinforcementStrength = options.reinforcementStrength || 0.1
    this.accessCountWeight = options.accessCountWeight || 0.02

    // Decay scheduling
    this.decayInterval = options.decayInterval || 60 * 60 * 1000 // 1 hour
    this.decayTimer = null

    // Memory tracking
    this.memoryLastDecayed = new Map()
  }

  /**
   * Apply temporal decay based on age
   * @param {Object} memory - Memory object with confidence and timestamp
   * @param {number} currentTime - Current timestamp (optional)
   * @returns {Object} Updated memory with decayed confidence
   */
  applyTemporalDecay(memory, currentTime = Date.now()) {
    const ageInMs = currentTime - (memory.createdAt || memory.timestamp)
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24)

    // Exponential decay: confidence = initial * (decayRate ^ days)
    const decayFactor = Math.pow(this.temporalDecayRate, ageInDays)
    const newConfidence = Math.max(this.minConfidence, memory.confidence * decayFactor)

    return {
      ...memory,
      confidence: newConfidence,
      lastDecayedAt: currentTime,
      decayMetadata: {
        ageInDays,
        decayFactor,
        previousConfidence: memory.confidence,
      },
    }
  }

  /**
   * Apply transformation-based decay
   * @param {Object} memory - Memory object
   * @param {number} transformationCount - Number of transformations
   * @param {number} complexity - Transformation complexity (1.0 = normal)
   * @returns {Object} Updated memory
   */
  applyTransformationDecay(memory, transformationCount, complexity = 1.0) {
    const decay = this.transformDecayRate * transformationCount * complexity
    const newConfidence = Math.max(this.minConfidence, memory.confidence - decay)

    return {
      ...memory,
      confidence: newConfidence,
      transformationCount: (memory.transformationCount || 0) + transformationCount,
      lastTransformedAt: Date.now(),
    }
  }

  /**
   * Reinforce memory based on usage
   * @param {Object} memory - Memory object
   * @param {number} usageStrength - Strength of reinforcement (0-1)
   * @returns {Object} Updated memory with increased confidence
   */
  reinforceMemory(memory, usageStrength = 1.0) {
    // Calculate reinforcement based on usage strength and access count
    const accessBonus = Math.min(0.2, (memory.accessCount || 0) * this.accessCountWeight)
    const reinforcement = this.reinforcementStrength * usageStrength + accessBonus

    const newConfidence = Math.min(this.maxConfidence, memory.confidence + reinforcement)

    return {
      ...memory,
      confidence: newConfidence,
      lastAccessedAt: Date.now(),
      accessCount: (memory.accessCount || 0) + 1,
      reinforcementHistory: [
        ...(memory.reinforcementHistory || []),
        {
          timestamp: Date.now(),
          strength: usageStrength,
          resultingConfidence: newConfidence,
        },
      ].slice(-10), // Keep last 10 reinforcements
    }
  }

  /**
   * Calculate memory importance score
   * @param {Object} memory - Memory object
   * @returns {number} Importance score (0-1)
   */
  calculateImportance(memory) {
    const recency = this.calculateRecencyScore(memory)
    const frequency = this.calculateFrequencyScore(memory)
    const confidence = memory.confidence || 0.5

    // Weighted combination
    return 0.3 * recency + 0.3 * frequency + 0.4 * confidence
  }

  /**
   * Calculate recency score
   * @param {Object} memory - Memory object
   * @returns {number} Recency score (0-1)
   */
  calculateRecencyScore(memory) {
    const lastAccessed = memory.lastAccessedAt || memory.createdAt || memory.timestamp
    const ageInHours = (Date.now() - lastAccessed) / (1000 * 60 * 60)

    // Exponential decay over 30 days
    return Math.exp(-ageInHours / (30 * 24))
  }

  /**
   * Calculate frequency score
   * @param {Object} memory - Memory object
   * @returns {number} Frequency score (0-1)
   */
  calculateFrequencyScore(memory) {
    const accessCount = memory.accessCount || 0

    // Logarithmic scale capped at 100 accesses
    return Math.min(1, Math.log(accessCount + 1) / Math.log(100))
  }

  /**
   * Process batch decay for multiple memories
   * @param {Array} memories - Array of memory objects
   * @param {Object} options - Decay options
   * @returns {Array} Updated memories
   */
  async batchDecay(memories, options = {}) {
    const currentTime = Date.now()
    const results = []

    for (const memory of memories) {
      // Skip if recently decayed
      const lastDecayed = this.memoryLastDecayed.get(memory.id)
      if (lastDecayed && currentTime - lastDecayed < this.decayInterval) {
        results.push(memory)
        continue
      }

      // Apply temporal decay
      let updated = this.applyTemporalDecay(memory, currentTime)

      // Mark as decayed
      this.memoryLastDecayed.set(memory.id, currentTime)

      // Check if memory should be pruned
      if (options.pruneThreshold && updated.confidence < options.pruneThreshold) {
        updated.markedForPruning = true
      }

      results.push(updated)
    }

    return results
  }

  /**
   * Start automatic decay scheduling
   * @param {Function} decayCallback - Callback to execute decay
   */
  startDecayScheduler(decayCallback) {
    this.stopDecayScheduler()

    this.decayTimer = setInterval(async () => {
      try {
        await decayCallback()
      } catch (error) {
        console.error('Decay scheduler error:', error)
      }
    }, this.decayInterval)
  }

  /**
   * Stop decay scheduler
   */
  stopDecayScheduler() {
    if (this.decayTimer) {
      clearInterval(this.decayTimer)
      this.decayTimer = null
    }
  }

  /**
   * Get decay statistics
   * @returns {Object} Decay statistics
   */
  getDecayStats() {
    return {
      temporalDecayRate: this.temporalDecayRate,
      transformDecayRate: this.transformDecayRate,
      decayInterval: this.decayInterval,
      memoriesTracked: this.memoryLastDecayed.size,
      schedulerActive: !!this.decayTimer,
    }
  }

  /**
   * Export decay configuration
   * @returns {Object} Configuration object
   */
  exportConfig() {
    return {
      temporalDecayRate: this.temporalDecayRate,
      transformDecayRate: this.transformDecayRate,
      minConfidence: this.minConfidence,
      maxConfidence: this.maxConfidence,
      reinforcementStrength: this.reinforcementStrength,
      accessCountWeight: this.accessCountWeight,
      decayInterval: this.decayInterval,
    }
  }
}

module.exports = { MemoryDecayManager }
