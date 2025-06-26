/**
 * Perplexity Research Orchestrator
 *
 * Implements the 5-perspective deep research methodology using Perplexity API
 */

import { PerplexityClient } from './client'
import { v4 as uuidv4 } from 'uuid'
import { Logger } from '../../../api/utils/logger'

export interface ResearchPerspective {
  name: string
  description: string
  systemPrompt: string
  focusAreas: string[]
}

export interface PerspectiveResult {
  perspective: string
  findings: string
  citations: string[]
  confidence: number
  timestamp: Date
}

export interface DeepResearchResult {
  id: string
  query: string
  perspectives: PerspectiveResult[]
  synthesis: string
  metadata: {
    totalSearches: number
    totalSources: number
    executionTime: number
    estimatedCost: number
  }
}

export class PerplexityOrchestrator {
  private sonarClient: PerplexityClient
  private deepResearchClient?: PerplexityClient
  private logger = new Logger('PerplexityOrchestrator')

  // Define the 5 research perspectives
  private readonly perspectives: ResearchPerspective[] = [
    {
      name: 'Technical Implementation',
      description: 'Architecture, code, technical details',
      systemPrompt:
        'You are a technical architect analyzing implementation details, architecture patterns, code availability, and technical feasibility.',
      focusAreas: ['architecture', 'code examples', 'technical documentation', 'implementation complexity'],
    },
    {
      name: 'Academic Research',
      description: 'Papers, theories, methodologies',
      systemPrompt:
        'You are an academic researcher focusing on peer-reviewed papers, theoretical foundations, and scientific validation.',
      focusAreas: ['research papers', 'academic citations', 'theoretical frameworks', 'empirical evidence'],
    },
    {
      name: 'Market & Industry',
      description: 'Companies, products, adoption',
      systemPrompt:
        'You are a market analyst examining competitive landscape, industry adoption, pricing models, and market dynamics.',
      focusAreas: ['market players', 'adoption rates', 'pricing strategies', 'competitive analysis'],
    },
    {
      name: 'User Impact',
      description: 'Use cases, problems solved, friction',
      systemPrompt: 'You are a UX researcher analyzing user needs, pain points, adoption barriers, and value perception.',
      focusAreas: ['user stories', 'pain points', 'adoption barriers', 'value propositions'],
    },
    {
      name: 'Future Implications',
      description: 'Trajectories, scenarios, risks',
      systemPrompt:
        'You are a futurist analyzing long-term implications, potential trajectories, strategic risks, and paradigm shifts.',
      focusAreas: ['future scenarios', 'strategic risks', 'paradigm shifts', 'long-term impact'],
    },
  ]

  constructor(enableDeepResearch: boolean = false) {
    this.sonarClient = new PerplexityClient('sonar')

    if (enableDeepResearch) {
      this.deepResearchClient = new PerplexityClient('deep-research')
    }
  }

  /**
   * Execute 5-perspective deep research using Perplexity
   */
  async executeDeepResearch(
    query: string,
    options?: {
      maxSearchesPerPerspective?: number
      useDeepResearch?: boolean
    }
  ): Promise<DeepResearchResult> {
    const startTime = Date.now()
    const researchId = uuidv4()

    this.logger.info(`Starting 5-perspective deep research: ${query}`)

    // Execute research from each perspective in parallel
    const perspectiveResults = await Promise.all(
      this.perspectives.map((perspective) => this.researchFromPerspective(query, perspective, options))
    )

    // Synthesize findings across all perspectives
    const synthesis = await this.synthesizeFindings(query, perspectiveResults)

    // Calculate metadata
    const totalSearches = this.perspectives.length * (options?.maxSearchesPerPerspective || 1)
    const totalSources = perspectiveResults.reduce((sum, result) => sum + result.citations.length, 0)
    const executionTime = (Date.now() - startTime) / 1000
    const estimatedCost = this.calculateCost(totalSearches, options?.useDeepResearch)

    return {
      id: researchId,
      query,
      perspectives: perspectiveResults,
      synthesis,
      metadata: {
        totalSearches,
        totalSources,
        executionTime,
        estimatedCost,
      },
    }
  }

  /**
   * Research from a single perspective
   */
  private async researchFromPerspective(
    query: string,
    perspective: ResearchPerspective,
    options?: { useDeepResearch?: boolean }
  ): Promise<PerspectiveResult> {
    this.logger.info(`Researching from perspective: ${perspective.name}`)

    try {
      if (options?.useDeepResearch && this.deepResearchClient) {
        // Use deep research for comprehensive analysis
        const result = await this.deepResearchClient.deepResearch({
          query: `${query} - Focus: ${perspective.focusAreas.join(', ')}`,
          search_type: 'general',
          max_searches: 30,
        })

        return {
          perspective: perspective.name,
          findings: this.formatDeepResearchFindings(result),
          citations: result.report.sources.map((s) => s.url),
          confidence: this.calculateConfidence(result),
          timestamp: new Date(),
        }
      } else {
        // Use Sonar for quick research
        const response = await this.sonarClient.search({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: perspective.systemPrompt,
            },
            {
              role: 'user',
              content: `Research the following topic with focus on ${perspective.focusAreas.join(', ')}:\n\n${query}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        })

        return {
          perspective: perspective.name,
          findings: response.choices[0].message.content,
          citations: response.choices[0].citations || [],
          confidence: 0.8, // Default confidence for Sonar
          timestamp: new Date(),
        }
      }
    } catch (error) {
      this.logger.error(`Failed to research from perspective ${perspective.name}:`, error as Error)

      return {
        perspective: perspective.name,
        findings: `Research failed: ${(error as Error).message}`,
        citations: [],
        confidence: 0,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Synthesize findings across all perspectives
   */
  private async synthesizeFindings(query: string, perspectives: PerspectiveResult[]): Promise<string> {
    const synthesisPrompt = `
You are a senior research analyst synthesizing findings from multiple research perspectives.

Original Query: ${query}

Research Findings by Perspective:
${perspectives
  .map(
    (p) => `
## ${p.perspective}
${p.findings}
Citations: ${p.citations.length} sources
Confidence: ${(p.confidence * 100).toFixed(0)}%
`
  )
  .join('\n\n')}

Please provide a comprehensive synthesis that:
1. Identifies common themes across perspectives
2. Highlights contradictions or tensions
3. Extracts key actionable insights
4. Provides strategic recommendations
5. Assesses overall confidence in findings
`

    const response = await this.sonarClient.search({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at synthesizing multi-perspective research into actionable strategic insights.',
        },
        {
          role: 'user',
          content: synthesisPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    })

    return response.choices[0].message.content
  }

  /**
   * Format deep research findings for consistency
   */
  private formatDeepResearchFindings(result: any): string {
    return `
# ${result.report.title}

## Summary
${result.report.summary}

## Key Findings
${result.report.sections
  .map(
    (section: any) => `
### ${section.title}
${section.content}
`
  )
  .join('\n')}

## Sources Analyzed
- Total sources: ${result.metadata.total_sources}
- Searches performed: ${result.metadata.searches_performed}
`
  }

  /**
   * Calculate confidence score based on deep research results
   */
  private calculateConfidence(result: any): number {
    const sourcesScore = Math.min(result.metadata.total_sources / 50, 1) * 0.4
    const searchesScore = Math.min(result.metadata.searches_performed / 30, 1) * 0.3
    const relevanceScore =
      (result.report.sources.reduce((sum: number, s: any) => sum + s.relevance_score, 0) / result.report.sources.length) * 0.3

    return sourcesScore + searchesScore + relevanceScore
  }

  /**
   * Calculate estimated cost for research
   */
  private calculateCost(totalSearches: number, useDeepResearch?: boolean): number {
    if (useDeepResearch) {
      return totalSearches * 0.15 // $0.15 per deep research
    } else {
      return totalSearches * 0.005 // ~$5 per 1000 Sonar searches
    }
  }
}
