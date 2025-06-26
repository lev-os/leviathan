import { PersonalityStrategy, SelectionRule, PersonalityCombination } from '@shared/marketplace-types'
import { PersonalityConfig } from '@shared/personality-types'
import { ResearchConfig } from '@shared/types'
import { Logger } from '../utils/logger'

export class PersonalitySelector {
  private logger = new Logger('PersonalitySelector')
  private strategies: Map<string, PersonalityStrategy> = new Map()

  constructor() {
    this.initializeDefaultStrategies()
  }

  async selectOptimalPersonalities(
    config: ResearchConfig,
    availablePersonalities: PersonalityConfig[],
    strategy?: string
  ): Promise<string[]> {
    const selectedStrategy = strategy || this.determineOptimalStrategy(config)
    const strategyConfig = this.strategies.get(selectedStrategy)

    if (!strategyConfig) {
      this.logger.warn(`Strategy not found: ${selectedStrategy}, using balanced`)
      return this.selectBalancedPersonalities(availablePersonalities)
    }

    this.logger.info(`Using strategy: ${strategyConfig.name}`)

    const selectedPersonalities: string[] = []
    const context = this.buildContext(config)

    // Apply selection rules in priority order
    const sortedRules = strategyConfig.selectionRules.sort((a, b) => a.priority - b.priority)

    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, context)) {
        for (const personalityId of rule.personalities) {
          if (availablePersonalities.find((p) => p.id === personalityId) && !selectedPersonalities.includes(personalityId)) {
            selectedPersonalities.push(personalityId)
            this.logger.debug(`Selected ${personalityId} via rule: ${rule.condition}`)
          }
        }
      }
    }

    // Apply combination optimizations
    const optimizedSelection = this.optimizeCombinations(selectedPersonalities, strategyConfig.combinations)

    // Ensure we have at least 3-4 personalities for comprehensive analysis
    const finalSelection = this.ensureMinimumCoverage(optimizedSelection, availablePersonalities, 3)

    this.logger.info(`Final personality selection: ${finalSelection.join(', ')}`)
    return finalSelection
  }

  private determineOptimalStrategy(config: ResearchConfig): string {
    const topic = config.topic.toLowerCase()

    // Strategy selection logic based on topic analysis
    if (topic.includes('risk') || topic.includes('threat') || topic.includes('security')) {
      return 'risk_focused'
    }

    if (
      topic.includes('innovation') ||
      topic.includes('breakthrough') ||
      topic.includes('technology') ||
      topic.includes('research')
    ) {
      return 'innovation'
    }

    if (topic.includes('finance') || topic.includes('investment') || topic.includes('market') || topic.includes('business')) {
      return 'financial'
    }

    // Default to balanced strategy
    return 'balanced'
  }

  private buildContext(config: ResearchConfig): Record<string, any> {
    return {
      topic: config.topic.toLowerCase(),
      depth: config.depth,
      duration: config.duration,
      sources: config.sources,
      outputFormat: config.outputFormat,
    }
  }
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    if (condition === 'always') return true

    // Parse condition format: "type:value" or "type_operator:value"
    const [type, value] = condition.split(':')

    switch (type) {
      case 'topic_contains':
        return value.split('|').some((keyword) => context.topic.includes(keyword.toLowerCase()))

      case 'depth':
        return context.depth === value

      case 'duration_gt':
        return context.duration > parseInt(value)

      case 'duration_lt':
        return context.duration < parseInt(value)

      case 'sources_contains':
        return context.sources.includes(value)

      default:
        this.logger.warn(`Unknown condition type: ${type}`)
        return false
    }
  }

  private optimizeCombinations(selectedPersonalities: string[], combinations: PersonalityCombination[]): string[] {
    // Find combinations with high synergy
    const optimized = [...selectedPersonalities]

    for (const combo of combinations) {
      const hasAllPersonalities = combo.personalities.every((p) => selectedPersonalities.includes(p))

      if (hasAllPersonalities && combo.synergy > 0.8) {
        // High synergy combination detected
        this.logger.debug(`High synergy combination: ${combo.personalities.join(', ')}`)
      } else if (combo.synergy > 0.8) {
        // Add missing personalities from high-synergy combinations
        for (const personality of combo.personalities) {
          if (!optimized.includes(personality)) {
            optimized.push(personality)
            this.logger.debug(`Added ${personality} for high synergy`)
          }
        }
      }
    }

    return optimized
  }

  private ensureMinimumCoverage(selected: string[], available: PersonalityConfig[], minimum: number): string[] {
    if (selected.length >= minimum) return selected

    const result = [...selected]
    const availableIds = available.map((p) => p.id)

    // Add core personalities if missing
    const corePersonalities = ['sovereignty_architect', 'abundance_amplifier', 'cortisol_guardian', 'practical_builder']

    for (const core of corePersonalities) {
      if (result.length >= minimum) break
      if (!result.includes(core) && availableIds.includes(core)) {
        result.push(core)
      }
    }

    // Fill remaining slots with highest-rated available personalities
    const remaining = availableIds.filter((id) => !result.includes(id))
    while (result.length < minimum && remaining.length > 0) {
      result.push(remaining.shift()!)
    }

    return result
  }

  private selectBalancedPersonalities(available: PersonalityConfig[]): string[] {
    // Default balanced selection
    const balanced = ['sovereignty_architect', 'abundance_amplifier', 'cortisol_guardian', 'practical_builder']

    return balanced.filter((id) => available.find((p) => p.id === id))
  }

  getAvailableStrategies(): PersonalityStrategy[] {
    return Array.from(this.strategies.values())
  }

  getStrategy(id: string): PersonalityStrategy | undefined {
    return this.strategies.get(id)
  }

  private initializeDefaultStrategies(): void {
    // Initialize default strategies
    const balancedStrategy: PersonalityStrategy = {
      id: 'balanced',
      name: 'Balanced Analysis',
      description: 'A well-rounded approach using diverse perspectives',
      selectionRules: [
        {
          condition: 'always',
          personalities: ['sovereignty_architect', 'abundance_amplifier', 'cortisol_guardian'],
          weight: 1.0,
          priority: 1,
        },
      ],
      combinations: [
        {
          personalities: ['sovereignty_architect', 'abundance_amplifier'],
          synergy: 0.9,
          conflicts: [],
          recommendedFor: ['technical', 'strategic'],
        },
      ],
      adaptiveWeights: true,
      contextAware: true,
    }

    const innovationStrategy: PersonalityStrategy = {
      id: 'innovation',
      name: 'Innovation Focus',
      description: 'Optimized for breakthrough discoveries and creative solutions',
      selectionRules: [
        {
          condition: 'topic_contains:innovation|technology|breakthrough',
          personalities: ['sovereignty_architect', 'practical_builder'],
          weight: 1.0,
          priority: 1,
        },
      ],
      combinations: [],
      adaptiveWeights: true,
      contextAware: true,
    }

    this.strategies.set('balanced', balancedStrategy)
    this.strategies.set('innovation', innovationStrategy)
    this.logger.info('Initialized default strategies')
  }
}
