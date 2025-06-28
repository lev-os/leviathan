/**
 * Base Handler Abstract Class
 *
 * All source handlers must extend this class and implement the required methods
 */

class BaseHandler {
  constructor(config = {}) {
    this.config = config
    this.rateLimiter = new RateLimiter(config.rateLimit || {})
  }

  /**
   * Collect data from the source
   * @param {Object} sourceConfig - Configuration for this specific collection
   * @returns {Array} Array of standardized data objects
   */
  async collect(sourceConfig) {
    throw new Error('collect() method must be implemented by subclass')
  }

  /**
   * Test connection to the source
   * @param {Object} sourceConfig - Configuration to test
   * @returns {Object} { status: 'connected'|'error', sample?, error? }
   */
  async testConnection(sourceConfig) {
    throw new Error('testConnection() method must be implemented by subclass')
  }

  /**
   * Transform raw data to standardized format
   * @param {*} rawData - Raw data from source
   * @returns {Object} Standardized data object
   */
  transform(rawData) {
    throw new Error('transform() method must be implemented by subclass')
  }

  /**
   * Standardized data format that all handlers should return
   * @param {Object} data - Raw data to standardize
   * @returns {Object} Standardized format
   */
  standardize(data) {
    return {
      id: data.id || this.generateId(),
      title: data.title || data.name || 'Untitled',
      content: data.content || data.description || data.abstract || '',
      url: data.url || data.link || '',
      author: this.extractAuthor(data),
      created_at: this.parseDate(data.created_at || data.date || data.published),
      updated_at: this.parseDate(data.updated_at || data.modified),
      metrics: this.extractMetrics(data),
      tags: this.extractTags(data),
      source: this.getSourceName(),
      collected_at: new Date().toISOString(),
      raw_data: this.config.includeRaw ? data : undefined,
    }
  }

  /**
   * Extract author information from various formats
   */
  extractAuthor(data) {
    if (data.author) {
      if (typeof data.author === 'string') {
        return { name: data.author }
      }
      if (typeof data.author === 'object') {
        return {
          name: data.author.name || data.author.username || data.author.login,
          id: data.author.id,
          url: data.author.url || data.author.html_url,
          verified: data.author.verified || false,
        }
      }
    }

    if (data.authors) {
      return data.authors.map((author) => ({
        name: typeof author === 'string' ? author : author.name,
        id: author.id,
        url: author.url,
      }))
    }

    return { name: 'Unknown' }
  }

  /**
   * Parse various date formats to ISO string
   */
  parseDate(dateStr) {
    if (!dateStr) return null

    try {
      const date = new Date(dateStr)
      return date.toISOString()
    } catch (error) {
      console.warn(`Failed to parse date: ${dateStr}`)
      return null
    }
  }

  /**
   * Extract metrics (engagement, stats, etc.)
   */
  extractMetrics(data) {
    const metrics = {}

    // Common metric fields
    const metricFields = [
      'likes',
      'like_count',
      'favorites',
      'favorite_count',
      'shares',
      'share_count',
      'retweets',
      'retweet_count',
      'comments',
      'comment_count',
      'replies',
      'reply_count',
      'views',
      'view_count',
      'impressions',
      'stars',
      'stargazers_count',
      'watchers',
      'watchers_count',
      'forks',
      'forks_count',
      'citations',
      'citation_count',
    ]

    metricFields.forEach((field) => {
      if (data[field] !== undefined) {
        metrics[field] = parseInt(data[field]) || 0
      }
    })

    // Extract nested metrics
    if (data.public_metrics) {
      Object.assign(metrics, data.public_metrics)
    }

    if (data.metrics) {
      Object.assign(metrics, data.metrics)
    }

    return metrics
  }

  /**
   * Extract tags from various formats
   */
  extractTags(data) {
    const tags = []

    if (data.tags) {
      tags.push(...(Array.isArray(data.tags) ? data.tags : [data.tags]))
    }

    if (data.hashtags) {
      tags.push(...(Array.isArray(data.hashtags) ? data.hashtags : [data.hashtags]))
    }

    if (data.topics) {
      tags.push(...(Array.isArray(data.topics) ? data.topics : [data.topics]))
    }

    if (data.categories) {
      tags.push(...(Array.isArray(data.categories) ? data.categories : [data.categories]))
    }

    return [...new Set(tags.map((tag) => tag.toLowerCase()))]
  }

  /**
   * Generate unique ID for items without one
   */
  generateId() {
    return `${this.getSourceName()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get source name for identification
   */
  getSourceName() {
    return this.constructor.name.toLowerCase().replace('handler', '')
  }

  /**
   * Apply filters to collected data
   */
  applyFilters(data, filters) {
    if (!filters) return data

    let filtered = data

    // Date filters
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from)
      filtered = filtered.filter((item) => new Date(item.created_at) >= fromDate)
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to)
      filtered = filtered.filter((item) => new Date(item.created_at) <= toDate)
    }

    // Content filters
    if (filters.contains) {
      const contains = Array.isArray(filters.contains) ? filters.contains : [filters.contains]
      filtered = filtered.filter((item) =>
        contains.some(
          (term) =>
            item.title.toLowerCase().includes(term.toLowerCase()) || item.content.toLowerCase().includes(term.toLowerCase())
        )
      )
    }

    if (filters.excludes) {
      const excludes = Array.isArray(filters.excludes) ? filters.excludes : [filters.excludes]
      filtered = filtered.filter(
        (item) =>
          !excludes.some(
            (term) =>
              item.title.toLowerCase().includes(term.toLowerCase()) || item.content.toLowerCase().includes(term.toLowerCase())
          )
      )
    }

    // Metric filters
    if (filters.min_engagement) {
      filtered = filtered.filter((item) => {
        const total = Object.values(item.metrics || {}).reduce((sum, val) => sum + (val || 0), 0)
        return total >= filters.min_engagement
      })
    }

    // Limit results
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  /**
   * Handle errors consistently
   */
  handleError(error, context = '') {
    const errorMsg = `${this.getSourceName()} error${context ? ` (${context})` : ''}: ${error.message}`
    console.error(errorMsg)

    // Log full error in debug mode
    if (process.env.DEBUG) {
      console.error(error)
    }

    throw new Error(errorMsg)
  }

  /**
   * Log debug information
   */
  debug(message, data = null) {
    if (process.env.DEBUG) {
      console.log(`[${this.getSourceName()}] ${message}`, data || '')
    }
  }
}

/**
 * Simple rate limiter
 */
class RateLimiter {
  constructor(config = {}) {
    this.requests = []
    this.maxRequests = config.maxRequests || 100
    this.windowMs = config.windowMs || 60000 // 1 minute
    this.enabled = config.enabled !== false
  }

  async checkLimit() {
    if (!this.enabled) return

    const now = Date.now()

    // Remove old requests outside the window
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs)

    // Check if we're at the limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)

      console.warn(`Rate limit reached. Waiting ${waitTime}ms...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    // Add current request
    this.requests.push(now)
  }
}

module.exports = BaseHandler
