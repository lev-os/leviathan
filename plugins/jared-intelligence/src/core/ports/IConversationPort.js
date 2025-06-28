/**
 * IConversationPort - Core Domain Port Interface
 * Defines the contract for conversation handling capabilities
 */

export class IConversationPort {
  /**
   * Process a message with context
   * @param {string} message - The message to process
   * @param {Object} context - The conversation context
   * @returns {Promise<Object>} - The conversation response
   */
  async processMessage(message, context) {
    throw new Error('Port method processMessage not implemented');
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - The user identifier
   * @returns {Promise<Array>} - The conversation history
   */
  async getConversationHistory(userId) {
    throw new Error('Port method getConversationHistory not implemented');
  }

  /**
   * Analyze intent from natural language
   * @param {string} message - The message to analyze
   * @returns {Promise<Object>} - The intent analysis result
   */
  async analyzeIntent(message) {
    throw new Error('Port method analyzeIntent not implemented');
  }
}