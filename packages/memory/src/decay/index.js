/**
 * Memory Decay & Self-Learning Module
 * Exports all components for autonomous memory management
 */

const { MemoryDecayManager } = require('./memory-decay-manager')
const { BubbleUpIntelligence } = require('./bubble-up-intelligence')
const { SelfLearningMemory } = require('./self-learning-memory')

module.exports = {
  MemoryDecayManager,
  BubbleUpIntelligence,
  SelfLearningMemory,
}
