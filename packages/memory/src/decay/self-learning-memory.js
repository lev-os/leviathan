/**
 * Self-Learning Memory System
 * Integrates decay management with bubble-up intelligence
 * Combines temporal decay, usage reinforcement, and cross-context learning
 */

const { MemoryDecayManager } = require('./memory-decay-manager')
const { BubbleUpIntelligence } = require('./bubble-up-intelligence')

class SelfLearningMemory {
  constructor(memoryManager, options = {}) {
    this.memoryManager = memoryManager

    // Initialize sub-systems
    this.decayManager = new MemoryDecayManager(options.decay || {})
    this.bubbleUpEngine = new BubbleUpIntelligence(options.intelligence || {})

    // Learning configuration
    this.learningEnabled = options.learningEnabled !== false
    this.autoDecayEnabled = options.autoDecayEnabled !== false

    // Metrics tracking
    this.metrics = {
      memoriesDecayed: 0,
      memoriesReinforced: 0,
      ahaMomentsDetected: 0,
      insightsPropagated: 0,
      startTime: Date.now(),
    }

    // Setup event listeners
    this.setupEventListeners()

    // Start auto-decay if enabled
    if (this.autoDecayEnabled) {
      this.startAutoDecay()
    }
  }

  /**
   * Learn from an observation
   * @param {Object} observation - Observation to learn from
   * @param {Object} context - Current context
   * @returns {Object} Learning results
   */
  async learn(observation, context) {
    const results = {
      timestamp: Date.now(),
      observation,
      context: context.id,
      decay: null,
      reinforcement: null,
      ahaMoment: null,
      propagation: null,
    }

    try {
      // 1. Check for aha moments
      const ahaMoment = await this.bubbleUpEngine.detectAhaMoment(observation, context)
      if (ahaMoment) {
        results.ahaMoment = ahaMoment
        this.metrics.ahaMomentsDetected++

        // Propagate insight
        const propagation = await this.bubbleUpEngine.propagateInsight(ahaMoment)
        results.propagation = propagation
        this.metrics.insightsPropagated++
      }

      // 2. Process memory access/reinforcement
      if (observation.memoryAccess) {
        const memory = await this.getMemory(observation.memoryAccess.memoryId)
        if (memory) {
          // Reinforce accessed memory
          const reinforced = await this.reinforceMemory(memory, observation.memoryAccess.strength || 1.0)
          results.reinforcement = reinforced
        }
      }

      // 3. Create new memory from significant observations
      if (observation.significance > 0.7 || ahaMoment) {
        const newMemory = await this.createMemoryFromObservation(observation, context, ahaMoment)
        results.newMemory = newMemory
      }

      // 4. Update context patterns
      if (context && observation.pattern) {
        this.bubbleUpEngine.registerContext(context.id, {
          ...context,
          lastObservation: observation,
          lastUpdated: Date.now(),
        })
      }
    } catch (error) {
      results.error = error.message
      console.error('Learning failed:', error)
    }

    return results
  }

  /**
   * Reinforce a memory based on usage
   * @param {Object} memory - Memory to reinforce
   * @param {number} strength - Reinforcement strength
   * @returns {Object} Updated memory
   */
  async reinforceMemory(memory, strength = 1.0) {
    // Apply reinforcement
    const reinforced = this.decayManager.reinforceMemory(memory, strength)

    // Update in storage
    if (this.memoryManager.updateMemory) {
      await this.memoryManager.updateMemory(reinforced)
    }

    this.metrics.memoriesReinforced++

    return reinforced
  }

  /**
   * Apply decay to memories
   * @param {Object} options - Decay options
   * @returns {Object} Decay results
   */
  async applyDecay(options = {}) {
    const results = {
      timestamp: Date.now(),
      decayed: 0,
      pruned: 0,
      errors: [],
    }

    try {
      // Get memories to decay
      const memories = await this.getMemoriesToDecay(options)

      // Apply batch decay
      const decayed = await this.decayManager.batchDecay(memories, {
        pruneThreshold: options.pruneThreshold || 0.05,
      })

      // Update memories in storage
      for (const memory of decayed) {
        try {
          if (memory.markedForPruning && options.allowPruning) {
            await this.pruneMemory(memory)
            results.pruned++
          } else {
            await this.updateMemory(memory)
            results.decayed++
          }
        } catch (error) {
          results.errors.push({ memoryId: memory.id, error: error.message })
        }
      }

      this.metrics.memoriesDecayed += results.decayed
    } catch (error) {
      results.error = error.message
      console.error('Decay failed:', error)
    }

    return results
  }

  /**
   * Create memory from observation
   * @param {Object} observation - Observation data
   * @param {Object} context - Context data
   * @param {Object} ahaMoment - Optional aha moment
   * @returns {Object} Created memory
   */
  async createMemoryFromObservation(observation, context, ahaMoment) {
    const memory = {
      id: this.generateId(),
      content: observation.content || JSON.stringify(observation),
      type: observation.type || 'observation',
      timestamp: Date.now(),
      confidence: ahaMoment ? 0.9 : 0.7,
      accessCount: 0,
      importance_score: this.decayManager.calculateImportance({
        confidence: ahaMoment ? 0.9 : 0.7,
        createdAt: Date.now(),
      }),
      workspace_id: context.workspace_id,
      metadata: {
        context_id: context.id,
        observation_type: observation.type,
        has_aha_moment: !!ahaMoment,
        aha_moment_id: ahaMoment?.id,
      },
    }

    // Create in storage
    if (this.memoryManager.createMemory) {
      return await this.memoryManager.createMemory(memory)
    }

    return memory
  }

  /**
   * Get memories that need decay
   * @param {Object} options - Query options
   * @returns {Array} Memories to decay
   */
  async getMemoriesToDecay(options = {}) {
    // If specific memory IDs provided
    if (options.memoryIds && options.memoryIds.length > 0) {
      const memories = []
      for (const id of options.memoryIds) {
        const memory = await this.getMemory(id)
        if (memory) memories.push(memory)
      }
      return memories
    }

    // Otherwise get all memories from workspace
    if (this.memoryManager.searchMemory) {
      const result = await this.memoryManager.searchMemory({
        workspace_id: options.workspace_id,
        limit: options.limit || 1000,
      })
      return result.memories || []
    }

    return []
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for aha moments
    this.bubbleUpEngine.on('aha_moment', async (ahaMoment) => {
      console.log('Aha moment detected:', ahaMoment.insight)

      // Could trigger additional processing here
      if (this.onAhaMoment) {
        await this.onAhaMoment(ahaMoment)
      }
    })

    // Listen for propagation completion
    this.bubbleUpEngine.on('propagation_complete', async (results) => {
      console.log(`Insight propagated to ${results.bubbledUp.length} parents, ${results.trickledDown.length} siblings`)
    })
  }

  /**
   * Start automatic decay scheduling
   */
  startAutoDecay() {
    this.decayManager.startDecayScheduler(async () => {
      console.log('Running scheduled memory decay...')
      const results = await this.applyDecay({
        pruneThreshold: 0.05,
        allowPruning: true,
      })
      console.log(`Decayed ${results.decayed} memories, pruned ${results.pruned}`)
    })
  }

  /**
   * Stop automatic decay
   */
  stopAutoDecay() {
    this.decayManager.stopDecayScheduler()
  }

  /**
   * Get memory by ID
   * @param {string} memoryId - Memory ID
   * @returns {Object|null} Memory object
   */
  async getMemory(memoryId) {
    if (this.memoryManager.getMemory) {
      return await this.memoryManager.getMemory({ id: memoryId })
    }
    return null
  }

  /**
   * Update memory in storage
   * @param {Object} memory - Memory to update
   */
  async updateMemory(memory) {
    if (this.memoryManager.updateMemory) {
      await this.memoryManager.updateMemory(memory)
    }
  }

  /**
   * Prune (delete) memory
   * @param {Object} memory - Memory to prune
   */
  async pruneMemory(memory) {
    if (this.memoryManager.deleteMemory) {
      await this.memoryManager.deleteMemory({ id: memory.id })
    }
  }

  /**
   * Register context hierarchy
   * @param {string} contextId - Context ID
   * @param {Object} contextData - Context data including parent/children
   */
  registerContext(contextId, contextData) {
    this.bubbleUpEngine.registerContext(contextId, contextData)
  }

  /**
   * Get system statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const uptime = Date.now() - this.metrics.startTime

    return {
      uptime,
      metrics: this.metrics,
      decay: this.decayManager.getDecayStats(),
      intelligence: this.bubbleUpEngine.getStats(),
      learningRate: {
        memoriesPerHour: (this.metrics.memoriesReinforced / uptime) * 3600000,
        ahaMomentsPerDay: (this.metrics.ahaMomentsDetected / uptime) * 86400000,
      },
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Export configuration
   */
  exportConfig() {
    return {
      learningEnabled: this.learningEnabled,
      autoDecayEnabled: this.autoDecayEnabled,
      decay: this.decayManager.exportConfig(),
      intelligence: {
        significanceThreshold: this.bubbleUpEngine.significanceThreshold,
        ahaMomentThreshold: this.bubbleUpEngine.ahaMomentThreshold,
        patternConfidenceThreshold: this.bubbleUpEngine.patternConfidenceThreshold,
      },
    }
  }
}

module.exports = { SelfLearningMemory }
