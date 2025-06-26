/**
 * Perplexity API Configuration
 *
 * Supports both Sonar (basic) and Deep Research tiers
 */

export interface PerplexityConfig {
  apiKey: string
  baseUrl: string
  tier: 'sonar' | 'deep-research'
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  pricing: {
    perRequest?: number
    perThousandTokens?: number
  }
}

export const PERPLEXITY_CONFIGS: Record<string, Partial<PerplexityConfig>> = {
  sonar: {
    baseUrl: 'https://api.perplexity.ai',
    tier: 'sonar',
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
    },
    pricing: {
      perThousandTokens: 0.001, // $1 per 1M tokens
    },
  },
  'deep-research': {
    baseUrl: 'https://api.perplexity.ai/deep-research',
    tier: 'deep-research',
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerDay: 200,
    },
    pricing: {
      perRequest: 0.15, // $0.15 per deep research session
    },
  },
}

export function getPerplexityConfig(tier: 'sonar' | 'deep-research' = 'sonar'): PerplexityConfig {
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not found in environment variables')
  }

  const baseConfig = PERPLEXITY_CONFIGS[tier]

  if (!baseConfig) {
    throw new Error(`Invalid Perplexity tier: ${tier}`)
  }

  return {
    apiKey,
    ...baseConfig,
  } as PerplexityConfig
}
