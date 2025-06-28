/**
 * IIntelligencePort - Core Domain Port Interface
 * Defines the contract for intelligence gathering capabilities
 */

export class IIntelligencePort {
  /**
   * Gather intelligence based on query parameters
   * @param {Object} query - The intelligence query
   * @returns {Promise<Array>} - The gathered intelligence results
   */
  async gatherIntelligence(query) {
    throw new Error('Port method gatherIntelligence not implemented');
  }

  /**
   * Analyze relevance of content
   * @param {Object} content - The content to analyze
   * @returns {Promise<Object>} - The relevance analysis
   */
  async analyzeRelevance(content) {
    throw new Error('Port method analyzeRelevance not implemented');
  }

  /**
   * Monitor keywords in real-time
   * @param {Array} keywords - Keywords to monitor
   * @param {Function} callback - Callback for new matches
   * @returns {Promise<void>}
   */
  async monitorKeywords(keywords, callback) {
    throw new Error('Port method monitorKeywords not implemented');
  }
}