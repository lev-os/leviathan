/**
 * Perplexity API Client
 *
 * Supports both Sonar (quick search) and Deep Research (comprehensive analysis)
 */

import axios, { AxiosInstance } from 'axios'
import { getPerplexityConfig, PerplexityConfig } from './config'
import { Logger } from '../../../api/utils/logger'

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexitySonarRequest {
  model: 'sonar' | 'sonar-pro'
  messages: PerplexityMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface PerplexityDeepResearchRequest {
  query: string
  search_type?: 'academic' | 'news' | 'general'
  include_domains?: string[]
  exclude_domains?: string[]
  time_range?: 'day' | 'week' | 'month' | 'year' | 'all'
  max_searches?: number
}

export interface PerplexitySonarResponse {
  id: string
  model: string
  created: number
  choices: Array<{
    message: {
      role: string
      content: string
    }
    citations?: string[]
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface PerplexityDeepResearchResponse {
  id: string
  status: 'processing' | 'completed' | 'failed'
  query: string
  report: {
    title: string
    summary: string
    sections: Array<{
      title: string
      content: string
      sources: string[]
    }>
    sources: Array<{
      url: string
      title: string
      snippet: string
      relevance_score: number
    }>
  }
  metadata: {
    searches_performed: number
    processing_time: number
    total_sources: number
  }
}

export class PerplexityClient {
  private sonarClient: AxiosInstance
  private deepResearchClient?: AxiosInstance
  private config: PerplexityConfig
  private logger = new Logger('PerplexityClient')

  constructor(tier: 'sonar' | 'deep-research' = 'sonar') {
    this.config = getPerplexityConfig(tier)

    // Initialize Sonar client
    this.sonarClient = axios.create({
      baseURL: 'https://api.perplexity.ai',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Initialize Deep Research client if needed
    if (tier === 'deep-research') {
      this.deepResearchClient = axios.create({
        baseURL: 'https://api.perplexity.ai',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
    }
  }

  /**
   * Perform a quick search using Perplexity Sonar
   */
  async search(request: PerplexitySonarRequest): Promise<PerplexitySonarResponse> {
    this.logger.info(`Performing Sonar search with model: ${request.model}`)

    try {
      const response = await this.sonarClient.post('/chat/completions', {
        ...request,
        model: request.model || 'sonar',
      })

      this.logger.info(`Search completed. Tokens used: ${response.data.usage.total_tokens}`)
      return response.data
    } catch (error) {
      this.logger.error('Sonar search failed:', error as Error)
      throw error
    }
  }

  /**
   * Perform deep research (requires Deep Research tier)
   */
  async deepResearch(request: PerplexityDeepResearchRequest): Promise<PerplexityDeepResearchResponse> {
    if (!this.deepResearchClient) {
      throw new Error('Deep Research client not initialized. Use tier="deep-research" in constructor.')
    }

    this.logger.info(`Starting deep research for query: ${request.query}`)

    try {
      // Start the deep research
      const startResponse = await this.deepResearchClient.post('/deep-research/start', {
        ...request,
        max_searches: request.max_searches || 30,
      })

      const researchId = startResponse.data.id
      this.logger.info(`Deep research started with ID: ${researchId}`)

      // Poll for completion
      let result: PerplexityDeepResearchResponse
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max

      while (attempts < maxAttempts) {
        const statusResponse = await this.deepResearchClient.get(`/deep-research/status/${researchId}`)
        result = statusResponse.data

        if (result.status === 'completed' || result.status === 'failed') {
          break
        }

        // Wait 5 seconds between polls
        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      }

      if (result!.status === 'completed') {
        this.logger.info(`Deep research completed. Sources found: ${result!.metadata.total_sources}`)
      } else {
        this.logger.error(`Deep research failed or timed out. Status: ${result!.status}`)
      }

      return result!
    } catch (error) {
      this.logger.error('Deep research failed:', error as Error)
      throw error
    }
  }

  /**
   * Helper method to create a simple search query
   */
  async quickSearch(query: string, options?: { model?: 'sonar' | 'sonar-pro' }): Promise<string> {
    const response = await this.search({
      model: options?.model || 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful research assistant. Provide comprehensive, well-sourced answers.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return response.choices[0].message.content
  }
}
