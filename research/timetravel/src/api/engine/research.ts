import { ResearchConfig, ResearchResult, Finding, PersonalityMode } from '@shared/types'
import { v4 as uuidv4 } from 'uuid'
import { Logger } from '../utils/logger'
import { ToolOrchestrator } from './tools'

export class ResearchEngine {
  private logger = new Logger('ResearchEngine')
  private toolOrchestrator: ToolOrchestrator

  constructor() {
    this.toolOrchestrator = new ToolOrchestrator()
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing research engine...')
    await this.toolOrchestrator.initialize()
  }

  async execute(config: ResearchConfig): Promise<ResearchResult> {
    const startTime = Date.now()
    const researchId = uuidv4()

    this.logger.info(`Starting research: ${config.topic}`)

    const result: ResearchResult = {
      id: researchId,
      topic: config.topic,
      timestamp: new Date(),
      status: 'running',
      findings: [],
      synthesis: '',
      metadata: {
        executionTime: 0,
        toolsUsed: [],
        apiCalls: 0,
        costEstimate: 0,
        quality: 0,
      },
    }

    try {
      // Execute three-tier research workflow
      const tier1Findings = await this.executeTier1(config)
      const tier2Findings = await this.executeTier2(config, tier1Findings)
      const tier3Findings = await this.executeTier3(config, [...tier1Findings, ...tier2Findings])

      result.findings = [...tier1Findings, ...tier2Findings, ...tier3Findings]

      // Apply personality synthesis
      result.synthesis = await this.synthesizeWithPersonalities(result.findings, config.personalities)

      result.status = 'completed'
      result.metadata.executionTime = (Date.now() - startTime) / 1000
      result.metadata.quality = this.calculateQuality(result.findings)

      this.logger.info(`Research completed: ${result.metadata.executionTime}s`)
      return result
    } catch (error) {
      this.logger.error('Research failed:', error as Error)
      result.status = 'failed'
      throw error
    }
  }
  private async executeTier1(config: ResearchConfig): Promise<Finding[]> {
    this.logger.info('Executing Tier 1: Base exploration')

    const streams = [
      { name: 'architecture_revolution', tools: ['WebSearch', 'perplexity_ask'] },
      { name: 'world_models', tools: ['fetch_url', 'WebSearch'] },
      { name: 'reasoning_evolution', tools: ['WebSearch'] },
      { name: 'efficiency_innovations', tools: ['perplexity_ask', 'WebSearch'] },
    ]

    const streamResults = await Promise.all(streams.map((stream) => this.executeStream(config, stream, 1)))

    return streamResults.flat()
  }

  private async executeTier2(config: ResearchConfig, tier1Findings: Finding[]): Promise<Finding[]> {
    this.logger.info('Executing Tier 2: Dynamic deep dives')

    // Find high-relevance findings for deep dive
    const highRelevanceFindings = tier1Findings.filter((f) => f.relevance > 0.7)

    const deepDiveStreams = highRelevanceFindings.slice(0, 6).map((finding, index) => ({
      name: `deep_dive_${index}`,
      tools: ['fetch_url', 'perplexity_ask'],
      focus: finding.content,
    }))

    const deepDiveResults = await Promise.all(deepDiveStreams.map((stream) => this.executeStream(config, stream, 2)))

    return deepDiveResults.flat()
  }

  private async executeTier3(config: ResearchConfig, allFindings: Finding[]): Promise<Finding[]> {
    this.logger.info('Executing Tier 3: Strategic positioning')

    // Focus on competitive positioning and implementation feasibility
    const validationStream = {
      name: 'strategic_validation',
      tools: ['WebSearch', 'perplexity_ask'],
      focus: 'competitive analysis and implementation',
    }

    return await this.executeStream(config, validationStream, 3)
  }
  private async executeStream(config: ResearchConfig, stream: any, tier: 1 | 2 | 3): Promise<Finding[]> {
    const findings: Finding[] = []

    for (const tool of stream.tools) {
      try {
        const toolResults = await this.toolOrchestrator.execute(tool, {
          query: `${config.topic} ${stream.focus || ''}`,
          context: stream.name,
        })

        findings.push(
          ...toolResults.map((result) => ({
            id: uuidv4(),
            source: tool,
            content: result.content,
            relevance: result.relevance || 0.5,
            tier,
            url: result.url,
            timestamp: new Date(),
          }))
        )
      } catch (error) {
        this.logger.error(`Tool ${tool} failed:`, error as Error)
      }
    }

    return findings
  }

  private async synthesizeWithPersonalities(findings: Finding[], personalities: PersonalityMode[]): Promise<string> {
    const perspectives: string[] = []

    for (const personality of personalities) {
      const perspective = await this.applyPersonalityFilter(findings, personality)
      perspectives.push(`## ${personality}\n${perspective}`)
    }

    return `# Research Synthesis\n\n${perspectives.join('\n\n')}`
  }

  private async applyPersonalityFilter(findings: Finding[], personality: PersonalityMode): Promise<string> {
    // Placeholder for personality-based analysis
    const relevantFindings = findings.filter((f) => f.relevance > 0.6)
    const summary = relevantFindings.map((f) => f.content).join('\n\n')

    return `From a ${personality} perspective:\n${summary.substring(0, 500)}...`
  }

  private calculateQuality(findings: Finding[]): number {
    if (findings.length === 0) return 0

    const avgRelevance = findings.reduce((sum, f) => sum + f.relevance, 0) / findings.length
    const sourcesDiversity = new Set(findings.map((f) => f.source)).size
    const totalFindings = findings.length

    return Math.min(1, avgRelevance * 0.5 + sourcesDiversity * 0.2 + Math.min(totalFindings, 20) * 0.015)
  }
}
