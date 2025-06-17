/**
 * Session ID utilities for FlowMind workflows
 */
import { randomBytes } from 'crypto'

/**
 * Create a user-friendly session ID that combines semantic meaning with uniqueness
 * Format: {semantic-slug}-{short-guid}
 * 
 * @param {Object} config - Session configuration
 * @param {string} config.workflowId - Workflow identifier
 * @param {string} config.challenge - Challenge description
 * @param {string} config.type - Session type (e2e, research, production)
 * @returns {string} User-friendly session ID
 */
export function createFriendlySessionId(config = {}) {
  const { workflowId, challenge, type = 'session' } = config
  
  // Generate semantic part
  let semanticPart = type
  
  if (workflowId) {
    // Clean workflow ID for use in slug
    const cleanWorkflow = workflowId
      .replace(/[^a-z0-9-]/gi, '')
      .toLowerCase()
      .slice(0, 15) // Keep reasonable length
    semanticPart += `-${cleanWorkflow}`
  }
  
  if (challenge) {
    // Extract key words from challenge for semantic meaning
    const challengeWords = extractKeyWords(challenge)
    if (challengeWords.length > 0) {
      semanticPart += `-${challengeWords.join('-')}`
    }
  }
  
  // Generate short GUID (8 chars instead of full UUID)
  const shortGuid = randomBytes(4).toString('hex')
  
  // Combine with timestamp for uniqueness
  const timestamp = Date.now().toString(36).slice(-4) // Last 4 chars of base36 timestamp
  
  return `${semanticPart}-${timestamp}-${shortGuid}`
}

/**
 * Extract key words from challenge text for semantic session naming
 * @param {string} challenge - Challenge description
 * @returns {string[]} Array of key words
 */
function extractKeyWords(challenge) {
  if (!challenge || typeof challenge !== 'string') return []
  
  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'should', 'we', 'our', 'how', 'what',
    'when', 'where', 'why', 'would', 'could', 'can', 'do', 'does'
  ])
  
  // Extract meaningful words
  const words = challenge
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 3) // Take first 3 meaningful words
    .map(word => word.slice(0, 8)) // Limit word length
  
  return words
}

/**
 * Examples of generated session IDs:
 * 
 * createFriendlySessionId({
 *   workflowId: 'cognitive-parliament-mini',
 *   challenge: 'Should we launch our AI product next month?',
 *   type: 'research'
 * })
 * // → "research-cognitive-launch-product-month-k9x2-a4b8c9"
 * 
 * createFriendlySessionId({
 *   workflowId: 'multi-expert-validation',
 *   type: 'e2e'
 * })
 * // → "e2e-multi-expert-valid-k9x3-d2f7e1"
 * 
 * createFriendlySessionId({
 *   challenge: 'Analyze market competition for startup',
 *   type: 'production'
 * })
 * // → "production-analyze-market-competition-k9x4-8f3a92"
 */