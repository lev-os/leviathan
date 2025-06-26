/**
 * Bubble-Up Intelligence Engine
 * Implements cross-context pattern recognition and insight propagation
 * Based on concepts from _ref/orig-agent bubble-up/trickle-down patterns
 */

class BubbleUpIntelligence {
  constructor(options = {}) {
    // Pattern detection thresholds
    this.significanceThreshold = options.significanceThreshold || 0.8
    this.ahaMomentThreshold = options.ahaMomentThreshold || 0.9
    this.patternConfidenceThreshold = options.patternConfidenceThreshold || 0.7

    // Context hierarchy configuration
    this.contextHierarchy = options.contextHierarchy || new Map()
    this.crossContextPatterns = new Map()

    // Insight tracking
    this.insights = []
    this.ahaMoments = []
    this.propagationHistory = new Map()

    // Event emitter for real-time notifications
    this.listeners = new Map()
  }

  /**
   * Detect aha moments from observations
   * @param {Object} observation - Current observation
   * @param {Object} context - Current context
   * @returns {Object|null} Aha moment if detected
   */
  async detectAhaMoment(observation, context) {
    // Find patterns across contexts
    const patterns = await this.findCrossContextPatterns(observation, context)

    // Calculate significance score
    const significance = this.calculateSignificance(patterns)

    if (significance >= this.ahaMomentThreshold) {
      const ahaMoment = {
        id: this.generateId(),
        type: 'aha_moment',
        timestamp: Date.now(),
        observation,
        context: context.id,
        patterns,
        significance,
        insight: this.synthesizeInsight(patterns),
        affectedContexts: this.identifyAffectedContexts(patterns),
        bubbleUpTo: this.identifyParentContexts(context),
      }

      // Track aha moment
      this.ahaMoments.push(ahaMoment)

      // Emit event
      await this.emit('aha_moment', ahaMoment)

      return ahaMoment
    }

    return null
  }

  /**
   * Find patterns across multiple contexts
   * @param {Object} observation - Current observation
   * @param {Object} context - Current context
   * @returns {Array} Found patterns
   */
  async findCrossContextPatterns(observation, context) {
    const patterns = []

    // Check against existing cross-context patterns
    for (const [patternId, pattern] of this.crossContextPatterns) {
      const match = await this.matchPattern(observation, pattern)

      if (match.confidence >= this.patternConfidenceThreshold) {
        patterns.push({
          ...pattern,
          match,
          contexts: [...pattern.contexts, context.id],
        })
      }
    }

    // Detect new patterns
    const newPatterns = await this.detectNewPatterns(observation, context)
    patterns.push(...newPatterns)

    return patterns
  }

  /**
   * Calculate significance of patterns
   * @param {Array} patterns - Found patterns
   * @returns {number} Significance score (0-1)
   */
  calculateSignificance(patterns) {
    if (patterns.length === 0) return 0

    // Factors for significance
    const contextSpread = new Set(patterns.flatMap((p) => p.contexts)).size
    const patternStrength = patterns.reduce((sum, p) => sum + (p.match?.confidence || 0), 0) / patterns.length
    const novelty = this.calculateNovelty(patterns)
    const impact = this.estimateImpact(patterns)

    // Weighted combination
    return (
      0.2 * (contextSpread / 10) + // Normalize to max 10 contexts
      0.3 * patternStrength +
      0.3 * novelty +
      0.2 * impact
    )
  }

  /**
   * Propagate insight through context hierarchy
   * @param {Object} insight - Insight to propagate
   * @returns {Object} Propagation results
   */
  async propagateInsight(insight) {
    const propagationResults = {
      id: this.generateId(),
      insightId: insight.id,
      timestamp: Date.now(),
      bubbledUp: [],
      trickledDown: [],
      errors: [],
    }

    try {
      // Bubble up to parent contexts
      for (const parentContextId of insight.bubbleUpTo) {
        try {
          await this.bubbleUp(parentContextId, insight)
          propagationResults.bubbledUp.push(parentContextId)

          // Get sibling contexts for trickle down
          const siblings = await this.getSiblingContexts(parentContextId)

          for (const siblingId of siblings) {
            if (siblingId !== insight.context) {
              try {
                await this.trickleDown(siblingId, insight)
                propagationResults.trickledDown.push(siblingId)
              } catch (error) {
                propagationResults.errors.push({ context: siblingId, error: error.message })
              }
            }
          }
        } catch (error) {
          propagationResults.errors.push({ context: parentContextId, error: error.message })
        }
      }

      // Track propagation history
      this.propagationHistory.set(insight.id, propagationResults)

      // Emit propagation complete event
      await this.emit('propagation_complete', propagationResults)
    } catch (error) {
      console.error('Propagation failed:', error)
      propagationResults.errors.push({ general: error.message })
    }

    return propagationResults
  }

  /**
   * Bubble up insight to parent context
   * @param {string} parentContextId - Parent context ID
   * @param {Object} insight - Insight to bubble up
   */
  async bubbleUp(parentContextId, insight) {
    const parentContext = this.contextHierarchy.get(parentContextId)

    if (!parentContext) {
      throw new Error(`Parent context ${parentContextId} not found`)
    }

    // Notify parent context
    await this.notifyContext(parentContextId, {
      type: 'bubble_up',
      insight,
      fromContext: insight.context,
      timestamp: Date.now(),
    })

    // Update parent's pattern knowledge
    if (parentContext.patterns) {
      parentContext.patterns.push({
        ...insight,
        bubbledFrom: insight.context,
      })
    }
  }

  /**
   * Trickle down insight to sibling contexts
   * @param {string} siblingContextId - Sibling context ID
   * @param {Object} insight - Insight to trickle down
   */
  async trickleDown(siblingContextId, insight) {
    const siblingContext = this.contextHierarchy.get(siblingContextId)

    if (!siblingContext) {
      throw new Error(`Sibling context ${siblingContextId} not found`)
    }

    // Notify sibling context
    await this.notifyContext(siblingContextId, {
      type: 'trickle_down',
      insight,
      fromContext: insight.context,
      timestamp: Date.now(),
    })

    // Update sibling's awareness
    if (siblingContext.awareness) {
      siblingContext.awareness.push({
        ...insight,
        trickledFrom: insight.context,
      })
    }
  }

  /**
   * Synthesize insight from patterns
   * @param {Array} patterns - Found patterns
   * @returns {string} Synthesized insight
   */
  synthesizeInsight(patterns) {
    // Group patterns by type
    const patternGroups = patterns.reduce((groups, pattern) => {
      const type = pattern.type || 'unknown'
      if (!groups[type]) groups[type] = []
      groups[type].push(pattern)
      return groups
    }, {})

    // Build insight description
    const insights = []

    for (const [type, typePatterns] of Object.entries(patternGroups)) {
      const contexts = new Set(typePatterns.flatMap((p) => p.contexts))
      insights.push(`${type} pattern detected across ${contexts.size} contexts`)
    }

    return insights.join('; ')
  }

  /**
   * Identify contexts affected by patterns
   * @param {Array} patterns - Found patterns
   * @returns {Array} Affected context IDs
   */
  identifyAffectedContexts(patterns) {
    const affected = new Set()

    for (const pattern of patterns) {
      // Direct contexts
      pattern.contexts?.forEach((ctx) => affected.add(ctx))

      // Related contexts
      if (pattern.relatedContexts) {
        pattern.relatedContexts.forEach((ctx) => affected.add(ctx))
      }
    }

    return Array.from(affected)
  }

  /**
   * Get parent contexts in hierarchy
   * @param {Object} context - Current context
   * @returns {Array} Parent context IDs
   */
  identifyParentContexts(context) {
    const parents = []

    // Check direct parent
    if (context.parentId) {
      parents.push(context.parentId)
    }

    // Check hierarchy relationships
    for (const [contextId, contextData] of this.contextHierarchy) {
      if (contextData.children?.includes(context.id)) {
        parents.push(contextId)
      }
    }

    return parents
  }

  /**
   * Get sibling contexts
   * @param {string} parentContextId - Parent context ID
   * @returns {Array} Sibling context IDs
   */
  async getSiblingContexts(parentContextId) {
    const parentContext = this.contextHierarchy.get(parentContextId)

    if (!parentContext || !parentContext.children) {
      return []
    }

    return parentContext.children
  }

  /**
   * Calculate novelty of patterns
   * @param {Array} patterns - Found patterns
   * @returns {number} Novelty score (0-1)
   */
  calculateNovelty(patterns) {
    // Check how many patterns are new vs seen before
    let newPatterns = 0

    for (const pattern of patterns) {
      if (!this.crossContextPatterns.has(pattern.id)) {
        newPatterns++
      }
    }

    return patterns.length > 0 ? newPatterns / patterns.length : 0
  }

  /**
   * Estimate impact of patterns
   * @param {Array} patterns - Found patterns
   * @returns {number} Impact score (0-1)
   */
  estimateImpact(patterns) {
    // Estimate based on number of affected contexts and pattern strength
    const affectedContexts = new Set(patterns.flatMap((p) => p.contexts || []))
    const avgStrength = patterns.reduce((sum, p) => sum + (p.strength || 0.5), 0) / patterns.length

    return Math.min(1, (affectedContexts.size / 10) * avgStrength)
  }

  /**
   * Match observation against pattern
   * @param {Object} observation - Observation to match
   * @param {Object} pattern - Pattern to match against
   * @returns {Object} Match result with confidence
   */
  async matchPattern(observation, pattern) {
    // Simple matching logic - can be enhanced with ML
    const similarities = []

    // Match by type
    if (pattern.type && observation.type === pattern.type) {
      similarities.push(0.3)
    }

    // Match by features
    if (pattern.features && observation.features) {
      const matchingFeatures = pattern.features.filter((f) => observation.features.includes(f))
      similarities.push((matchingFeatures.length / pattern.features.length) * 0.4)
    }

    // Match by context similarity
    if (pattern.contextPattern && observation.context) {
      // Simplified context matching
      similarities.push(0.3)
    }

    const confidence = similarities.reduce((sum, score) => sum + score, 0)

    return {
      confidence,
      matched: confidence >= this.patternConfidenceThreshold,
      details: { similarities },
    }
  }

  /**
   * Detect new patterns from observation
   * @param {Object} observation - Current observation
   * @param {Object} context - Current context
   * @returns {Array} New patterns detected
   */
  async detectNewPatterns(observation, context) {
    const newPatterns = []

    // Simple pattern detection - enhance with ML
    if (observation.repeatedAction && observation.repeatCount > 3) {
      newPatterns.push({
        id: this.generateId(),
        type: 'repeated_action',
        contexts: [context.id],
        features: [observation.action],
        strength: Math.min(1, observation.repeatCount / 10),
        detectedAt: Date.now(),
      })
    }

    return newPatterns
  }

  /**
   * Register context in hierarchy
   * @param {string} contextId - Context ID
   * @param {Object} contextData - Context data
   */
  registerContext(contextId, contextData) {
    this.contextHierarchy.set(contextId, {
      ...contextData,
      patterns: [],
      awareness: [],
      registeredAt: Date.now(),
    })
  }

  /**
   * Notify context of insight
   * @param {string} contextId - Context to notify
   * @param {Object} notification - Notification data
   */
  async notifyContext(contextId, notification) {
    // Emit context-specific event
    await this.emit(`context:${contextId}`, notification)

    // Store in context's notification history
    const context = this.contextHierarchy.get(contextId)
    if (context) {
      if (!context.notifications) context.notifications = []
      context.notifications.push(notification)
    }
  }

  /**
   * Event emitter functionality
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(listener)
  }

  async emit(event, data) {
    const eventListeners = this.listeners.get(event) || []
    for (const listener of eventListeners) {
      await listener(data)
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get intelligence statistics
   */
  getStats() {
    return {
      totalInsights: this.insights.length,
      ahaMoments: this.ahaMoments.length,
      crossContextPatterns: this.crossContextPatterns.size,
      registeredContexts: this.contextHierarchy.size,
      propagationHistory: this.propagationHistory.size,
    }
  }
}

module.exports = { BubbleUpIntelligence }
