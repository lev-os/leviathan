/**
 * IMemoryPort - Core Domain Port Interface
 * Defines the contract for memory storage capabilities
 */

export class IMemoryPort {
  /**
   * Store data in memory system
   * @param {string} namespace - The memory namespace
   * @param {Object} data - The data to store
   * @returns {Promise<string>} - The stored item ID
   */
  async store(namespace, data) {
    throw new Error('Port method store not implemented');
  }

  /**
   * Retrieve data from memory system
   * @param {string} namespace - The memory namespace
   * @param {Object} query - The retrieval query
   * @returns {Promise<Array>} - The retrieved items
   */
  async retrieve(namespace, query) {
    throw new Error('Port method retrieve not implemented');
  }

  /**
   * Update existing memory entry
   * @param {string} namespace - The memory namespace
   * @param {string} id - The item ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<boolean>} - Success status
   */
  async update(namespace, id, updates) {
    throw new Error('Port method update not implemented');
  }
}