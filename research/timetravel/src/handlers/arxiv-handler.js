/**
 * arXiv Handler
 *
 * Fetches academic papers from arXiv.org using their API
 * No API key required - open access
 */

const axios = require('axios')
const BaseHandler = require('./base-handler')

class ArxivHandler extends BaseHandler {
  constructor(config = {}) {
    super(config)
    this.apiBase = 'http://export.arxiv.org/api/query'
    this.maxResults = 100 // arXiv limits to 100 per request
  }

  async collect(sourceConfig) {
    this.debug('Starting arXiv collection', sourceConfig)

    const results = []

    // Handle different query types
    if (sourceConfig.categories) {
      for (const category of sourceConfig.categories) {
        try {
          await this.rateLimiter.checkLimit()
          const papers = await this.fetchByCategory(category, sourceConfig)
          results.push(...papers)
        } catch (error) {
          this.handleError(error, `category: ${category}`)
        }
      }
    }

    if (sourceConfig.keywords) {
      for (const keyword of sourceConfig.keywords) {
        try {
          await this.rateLimiter.checkLimit()
          const papers = await this.fetchByKeyword(keyword, sourceConfig)
          results.push(...papers)
        } catch (error) {
          this.handleError(error, `keyword: ${keyword}`)
        }
      }
    }

    if (sourceConfig.authors) {
      for (const author of sourceConfig.authors) {
        try {
          await this.rateLimiter.checkLimit()
          const papers = await this.fetchByAuthor(author, sourceConfig)
          results.push(...papers)
        } catch (error) {
          this.handleError(error, `author: ${author}`)
        }
      }
    }

    // Deduplicate by arXiv ID
    const unique = this.deduplicateById(results)

    // Apply filters and sorting
    const filtered = this.applyFilters(unique, sourceConfig.filters)
    const sorted = this.sortResults(filtered, sourceConfig.sort)

    this.debug(`Collected ${sorted.length} papers from arXiv`)
    return sorted
  }

  async fetchByCategory(category, config) {
    const query = `cat:${category}`
    return await this.executeQuery(query, config)
  }

  async fetchByKeyword(keyword, config) {
    // Search in title, abstract, and comments
    const query = `all:"${keyword}"`
    return await this.executeQuery(query, config)
  }

  async fetchByAuthor(author, config) {
    const query = `au:"${author}"`
    return await this.executeQuery(query, config)
  }

  async executeQuery(query, config) {
    const params = {
      search_query: query,
      start: config.start || 0,
      max_results: Math.min(config.max_results || 50, this.maxResults),
      sortBy: config.sortBy || 'submittedDate',
      sortOrder: config.sortOrder || 'descending',
    }

    this.debug(`Executing arXiv query: ${query}`, params)

    try {
      const response = await axios.get(this.apiBase, { params })
      return this.parseArxivResponse(response.data)
    } catch (error) {
      if (error.response) {
        throw new Error(`arXiv API error: ${error.response.status} ${error.response.statusText}`)
      }
      throw error
    }
  }

  parseArxivResponse(xmlData) {
    // Parse XML response from arXiv
    const entries = this.extractEntries(xmlData)
    return entries.map((entry) => this.transform(entry))
  }

  extractEntries(xmlData) {
    // Simple XML parsing - in production, use proper XML parser
    const entries = []
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match

    while ((match = entryRegex.exec(xmlData)) !== null) {
      const entryXml = match[1]
      const entry = this.parseEntry(entryXml)
      entries.push(entry)
    }

    return entries
  }

  parseEntry(entryXml) {
    const extractField = (xml, field) => {
      const regex = new RegExp(`<${field}[^>]*>(.*?)<\/${field}>`, 's')
      const match = xml.match(regex)
      return match ? match[1].trim() : ''
    }

    const extractMultiple = (xml, field) => {
      const regex = new RegExp(`<${field}[^>]*>(.*?)<\/${field}>`, 'gs')
      const matches = []
      let match
      while ((match = regex.exec(xml)) !== null) {
        matches.push(match[1].trim())
      }
      return matches
    }

    return {
      id: extractField(entryXml, 'id'),
      title: extractField(entryXml, 'title').replace(/\s+/g, ' '),
      summary: extractField(entryXml, 'summary').replace(/\s+/g, ' '),
      authors: extractMultiple(entryXml, 'name'),
      published: extractField(entryXml, 'published'),
      updated: extractField(entryXml, 'updated'),
      categories: extractMultiple(entryXml, 'category')
        .map((cat) => cat.match(/term="([^"]+)"/)?.[1] || cat)
        .filter(Boolean),
      links: extractMultiple(entryXml, 'link').map((link) => {
        const hrefMatch = link.match(/href="([^"]+)"/)
        const titleMatch = link.match(/title="([^"]+)"/)
        return {
          href: hrefMatch ? hrefMatch[1] : '',
          title: titleMatch ? titleMatch[1] : '',
        }
      }),
      comment: extractField(entryXml, 'arxiv:comment'),
      journal_ref: extractField(entryXml, 'arxiv:journal_ref'),
      doi: extractField(entryXml, 'arxiv:doi'),
    }
  }

  transform(rawData) {
    const arxivId = this.extractArxivId(rawData.id)
    const pdfUrl = rawData.links.find((link) => link.title === 'pdf')?.href || ''
    const absUrl = rawData.links.find((link) => link.title === 'abs')?.href || rawData.id

    return this.standardize({
      id: arxivId,
      title: rawData.title,
      content: rawData.summary,
      abstract: rawData.summary,
      url: absUrl,
      pdf_url: pdfUrl,
      authors: rawData.authors.map((name) => ({ name })),
      created_at: rawData.published,
      updated_at: rawData.updated,
      categories: rawData.categories,
      tags: rawData.categories,
      comment: rawData.comment,
      journal_ref: rawData.journal_ref,
      doi: rawData.doi,
      metrics: {
        categories_count: rawData.categories.length,
      },
      raw_data: this.config.includeRaw ? rawData : undefined,
    })
  }

  extractArxivId(fullId) {
    // Extract arXiv ID from full URL
    const match = fullId.match(/arxiv\.org\/abs\/(.+)$/)
    return match ? match[1] : fullId
  }

  deduplicateById(papers) {
    const seen = new Set()
    return papers.filter((paper) => {
      if (seen.has(paper.id)) {
        return false
      }
      seen.add(paper.id)
      return true
    })
  }

  sortResults(papers, sortBy = 'created_at') {
    return papers.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
        case 'submittedDate':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'updated_at':
        case 'lastUpdatedDate':
          return new Date(b.updated_at) - new Date(a.updated_at)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'relevance':
          // Could implement relevance scoring here
          return 0
        default:
          return 0
      }
    })
  }

  async testConnection(sourceConfig) {
    try {
      // Test with a simple query
      const testQuery = 'cat:cs.AI'
      const params = {
        search_query: testQuery,
        start: 0,
        max_results: 1,
      }

      this.debug('Testing arXiv connection')
      const response = await axios.get(this.apiBase, { params })

      if (response.status === 200) {
        const entries = this.extractEntries(response.data)
        const sample = entries.length > 0 ? this.transform(entries[0]) : null

        return {
          status: 'connected',
          message: 'arXiv API accessible',
          sample: sample,
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      }
    }
  }

  // Category helpers
  static getAvailableCategories() {
    return {
      'cs.AI': 'Artificial Intelligence',
      'cs.LG': 'Machine Learning',
      'cs.CL': 'Computation and Language',
      'cs.CV': 'Computer Vision and Pattern Recognition',
      'cs.NE': 'Neural and Evolutionary Computing',
      'cs.RO': 'Robotics',
      'cs.HC': 'Human-Computer Interaction',
      'stat.ML': 'Machine Learning (Statistics)',
      'math.ST': 'Statistics Theory',
      'q-bio.QM': 'Quantitative Methods (Biology)',
      'physics.med-ph': 'Medical Physics',
      'eess.IV': 'Image and Video Processing',
      'eess.AS': 'Audio and Speech Processing',
    }
  }

  static getCategoryDescription(category) {
    const categories = ArxivHandler.getAvailableCategories()
    return categories[category] || category
  }
}

module.exports = ArxivHandler
