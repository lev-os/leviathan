/**
 * Twitter API Handler for Research Plan Engine
 *
 * Supports both Twitter API v2 and cb3 scraping fallback
 */

const axios = require('axios')

class TwitterHandler {
  constructor() {
    this.apiBase = 'https://api.twitter.com/2'
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN
  }

  async collect(config) {
    const results = []

    // Collect from specified accounts
    if (config.accounts && config.accounts.length > 0) {
      console.log(`    📱 Fetching tweets from ${config.accounts.length} accounts...`)

      for (const username of config.accounts) {
        try {
          const tweets = await this.getUserTweets(username, config)
          results.push(...tweets)
        } catch (error) {
          console.error(`      ⚠️  Failed to fetch @${username}: ${error.message}`)
        }
      }
    }

    // Search by keywords
    if (config.keywords && config.keywords.length > 0) {
      console.log(`    🔍 Searching for ${config.keywords.length} keywords...`)

      const query = this.buildSearchQuery(config)
      const searchResults = await this.searchTweets(query, config)
      results.push(...searchResults)
    }

    // Deduplicate by tweet ID
    const uniqueTweets = this.deduplicateTweets(results)

    // Apply filters
    const filtered = this.applyFilters(uniqueTweets, config)

    return filtered
  }

  async getUserTweets(username, config) {
    // First get user ID
    const userId = await this.getUserId(username)

    // Then fetch timeline
    const params = new URLSearchParams({
      max_results: config.max_results || 100,
      'tweet.fields': 'created_at,author_id,conversation_id,public_metrics,referenced_tweets',
      'user.fields': 'username,name,verified,description',
      exclude: 'retweets,replies',
    })

    const response = await this.makeRequest(`/users/${userId}/tweets`, params)

    return this.transformTweets(response.data || [], response.includes)
  }

  async searchTweets(query, config) {
    const params = new URLSearchParams({
      query: query,
      max_results: config.max_results || 100,
      'tweet.fields': 'created_at,author_id,conversation_id,public_metrics,referenced_tweets',
      'user.fields': 'username,name,verified,description',
      expansions: 'author_id',
    })

    const response = await this.makeRequest('/tweets/search/recent', params)

    return this.transformTweets(response.data || [], response.includes)
  }

  async getUserId(username) {
    const params = new URLSearchParams({
      usernames: username,
      'user.fields': 'id',
    })

    const response = await this.makeRequest('/users/by', params)

    if (!response.data || response.data.length === 0) {
      throw new Error(`User not found: ${username}`)
    }

    return response.data[0].id
  }

  buildSearchQuery(config) {
    const parts = []

    // Add keywords
    if (config.keywords) {
      const keywordQuery = config.keywords.map((k) => `"${k}"`).join(' OR ')
      parts.push(`(${keywordQuery})`)
    }

    // Add hashtags
    if (config.hashtags) {
      const hashtagQuery = config.hashtags.join(' OR ')
      parts.push(`(${hashtagQuery})`)
    }

    // Add accounts if searching from specific users
    if (config.accounts && config.accounts.length > 0) {
      const accountQuery = config.accounts.map((a) => `from:${a}`).join(' OR ')
      parts.push(`(${accountQuery})`)
    }

    // Exclude retweets by default
    parts.push('-is:retweet')

    // Language filter
    if (config.language) {
      parts.push(`lang:${config.language}`)
    }

    return parts.join(' ')
  }

  transformTweets(tweets, includes = {}) {
    const users = {}

    // Build user lookup
    if (includes.users) {
      includes.users.forEach((user) => {
        users[user.id] = user
      })
    }

    return tweets.map((tweet) => {
      const author = users[tweet.author_id] || {}

      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: tweet.author_id,
          username: author.username,
          name: author.name,
          verified: author.verified,
        },
        metrics: tweet.public_metrics,
        url: `https://twitter.com/${author.username}/status/${tweet.id}`,
        source: 'twitter_api',
        collected_at: new Date().toISOString(),
      }
    })
  }

  deduplicateTweets(tweets) {
    const seen = new Set()
    return tweets.filter((tweet) => {
      if (seen.has(tweet.id)) {
        return false
      }
      seen.add(tweet.id)
      return true
    })
  }

  applyFilters(tweets, config) {
    let filtered = tweets

    // Filter by exclude patterns
    if (config.exclude) {
      config.exclude.forEach((pattern) => {
        filtered = filtered.filter((tweet) => !tweet.text.includes(pattern))
      })
    }

    // Filter by minimum engagement
    if (config.min_engagement) {
      filtered = filtered.filter((tweet) => {
        const total = (tweet.metrics?.like_count || 0) + (tweet.metrics?.retweet_count || 0) + (tweet.metrics?.reply_count || 0)
        return total >= config.min_engagement
      })
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // Limit results
    if (config.max_results) {
      filtered = filtered.slice(0, config.max_results)
    }

    return filtered
  }

  async makeRequest(endpoint, params) {
    if (!this.bearerToken) {
      throw new Error('TWITTER_BEARER_TOKEN not set')
    }

    try {
      const response = await axios.get(`${this.apiBase}${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      })

      return response.data
    } catch (error) {
      if (error.response) {
        const msg = error.response.data?.errors?.[0]?.message || error.response.statusText
        throw new Error(`Twitter API error: ${msg}`)
      }
      throw error
    }
  }

  async testConnection(config) {
    try {
      // Simple test - get rate limit status
      const response = await this.makeRequest('/tweets/search/recent', new URLSearchParams({ query: 'test', max_results: '10' }))

      return {
        status: 'connected',
        rateLimit: response.meta?.result_count !== undefined,
        sample: response.data?.[0] ? this.transformTweets([response.data[0]])[0] : null,
      }
    } catch (error) {
      throw new Error(`Twitter connection test failed: ${error.message}`)
    }
  }
}

// CB3 Fallback Handler
class TwitterCB3Handler extends TwitterHandler {
  constructor() {
    super()
    this.cb3Path = process.env.CB3_PATH || '~/cb3'
  }

  async collect(config) {
    console.log('    🔄 Using cb3 for Twitter scraping...')

    const results = []

    // Scrape accounts
    if (config.accounts) {
      for (const account of config.accounts) {
        try {
          const tweets = await this.scrapeAccount(account, config)
          results.push(...tweets)
        } catch (error) {
          console.error(`      ⚠️  Failed to scrape @${account}: ${error.message}`)
        }
      }
    }

    return results
  }

  async scrapeAccount(username, config) {
    const { exec } = require('child_process').promises

    const command = `${this.cb3Path} scrape --url "https://twitter.com/${username}" --format json`

    try {
      const { stdout } = await exec(command)
      const data = JSON.parse(stdout)

      // Transform cb3 output to our format
      return this.transformCB3Tweets(data.tweets || [], username)
    } catch (error) {
      throw new Error(`cb3 scraping failed: ${error.message}`)
    }
  }

  transformCB3Tweets(tweets, username) {
    return tweets.map((tweet) => ({
      id: tweet.id || `cb3_${Date.now()}_${Math.random()}`,
      text: tweet.text || tweet.content,
      created_at: tweet.date || new Date().toISOString(),
      author: {
        username: username,
        name: tweet.author || username,
      },
      metrics: {
        like_count: tweet.likes || 0,
        retweet_count: tweet.retweets || 0,
        reply_count: tweet.replies || 0,
      },
      url: tweet.url,
      source: 'cb3_scraper',
      collected_at: new Date().toISOString(),
    }))
  }

  async testConnection(config) {
    const { exec } = require('child_process').promises

    try {
      const { stdout } = await exec(`${this.cb3Path} --version`)

      return {
        status: 'connected',
        method: 'cb3',
        version: stdout.trim(),
      }
    } catch (error) {
      throw new Error(`cb3 not available: ${error.message}`)
    }
  }
}

// Export the appropriate handler based on config
module.exports = process.env.USE_CB3_FOR_TWITTER === 'true' ? TwitterCB3Handler : TwitterHandler
