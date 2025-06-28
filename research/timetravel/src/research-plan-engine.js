/**
 * @lev-os/research - Abstract Research Plan Engine
 *
 * Config-driven research monitoring with LLM analysis and workflow handoffs
 */

const fs = require('fs').promises
const path = require('path')
const yaml = require('js-yaml')
const cron = require('node-cron')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

// Source handlers
const TwitterHandler = require('./handlers/twitter-handler')
const ArxivHandler = require('./handlers/arxiv-handler')

// Placeholder handlers (to be implemented)
class GitHubHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'GitHub handler not yet implemented' }
  }
}

class CB3Handler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'CB3 handler not yet implemented' }
  }
}

class PubmedHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'PubMed handler not yet implemented' }
  }
}

class RedditHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'Reddit handler not yet implemented' }
  }
}

class HackernewsHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'HackerNews handler not yet implemented' }
  }
}

class ScrapeHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'Scrape handler not yet implemented' }
  }
}

class CustomHandler {
  async collect(config) {
    return []
  }
  async testConnection(config) {
    return { status: 'not_implemented', message: 'Custom handler not yet implemented' }
  }
}

// Placeholder processors (to be implemented)
class LLMProcessor {
  async process(data, config) {
    return { status: 'not_implemented', data: data }
  }
}

class AggregateProcessor {
  async process(data, config) {
    return { status: 'not_implemented', data: data }
  }
}

class PatternDetector {
  async process(data, config) {
    return { status: 'not_implemented', data: data }
  }
}

// Placeholder handoff system (to be implemented)
class WorkflowHandoff {
  async execute(action, context) {
    console.log('Handoff action (not implemented):', action.type)
  }
}

class WebhookHandoff {
  async execute(action, context) {
    console.log('Webhook handoff (not implemented):', action.url)
  }
}

class MemoryHandoff {
  async execute(action, context) {
    console.log('Memory handoff (not implemented):', action.namespace)
  }
}

class ResearchPlanEngine {
  constructor() {
    this.plans = new Map()
    this.handlers = new Map()
    this.processors = new Map()
    this.handoffs = new Map()

    this.initializeComponents()
  }

  initializeComponents() {
    // Register source handlers
    this.handlers.set('twitter', new TwitterHandler())
    this.handlers.set('github', new GitHubHandler())
    this.handlers.set('arxiv', new ArxivHandler())
    this.handlers.set('cb3', new CB3Handler())
    this.handlers.set('pubmed', new PubmedHandler())
    this.handlers.set('reddit', new RedditHandler())
    this.handlers.set('hackernews', new HackernewsHandler())
    this.handlers.set('scrape', new ScrapeHandler())
    this.handlers.set('custom', new CustomHandler())

    // Register processors
    this.processors.set('llm', new LLMProcessor())
    this.processors.set('aggregate', new AggregateProcessor())
    this.processors.set('pattern', new PatternDetector())

    // Register handoffs
    this.handoffs.set('workflow', new WorkflowHandoff())
    this.handoffs.set('webhook', new WebhookHandoff())
    this.handoffs.set('memory', new MemoryHandoff())
  }

  async loadPlan(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf8')
      const config = yaml.load(content)

      // Validate config
      this.validateConfig(config)

      // Create plan instance
      const plan = new ResearchPlan(config, this)
      this.plans.set(config.name, plan)

      console.log(`✅ Loaded research plan: ${config.name}`)
      return plan
    } catch (error) {
      console.error(`❌ Failed to load plan: ${error.message}`)
      throw error
    }
  }

  validateConfig(config) {
    const required = ['version', 'name', 'sources']
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Validate sources
    for (const source of config.sources) {
      if (!source.id || !source.type) {
        throw new Error('Source must have id and type')
      }

      if (!this.handlers.has(source.type)) {
        throw new Error(`Unknown source type: ${source.type}`)
      }
    }
  }

  async runPlan(planName, options = {}) {
    const plan = this.plans.get(planName)
    if (!plan) {
      throw new Error(`Plan not found: ${planName}`)
    }

    return await plan.execute(options)
  }

  async dryRun(planName) {
    const plan = this.plans.get(planName)
    if (!plan) {
      throw new Error(`Plan not found: ${planName}`)
    }

    return await plan.dryRun()
  }

  schedulePlan(planName) {
    const plan = this.plans.get(planName)
    if (!plan) {
      throw new Error(`Plan not found: ${planName}`)
    }

    plan.schedule()
  }

  listPlans() {
    return Array.from(this.plans.keys())
  }

  getStatus(planName) {
    const plan = this.plans.get(planName)
    if (!plan) {
      throw new Error(`Plan not found: ${planName}`)
    }

    return plan.getStatus()
  }
}

class ResearchPlan {
  constructor(config, engine) {
    this.config = config
    this.engine = engine
    this.sources = []
    this.lastRun = null
    this.status = 'initialized'
    this.cronJobs = []

    this.initializeSources()
  }

  initializeSources() {
    for (const sourceConfig of this.config.sources) {
      const handler = this.engine.handlers.get(sourceConfig.type)
      const source = {
        id: sourceConfig.id,
        type: sourceConfig.type,
        handler: handler,
        config: sourceConfig.config,
        schedule: sourceConfig.schedule || this.config.schedule?.default || 'daily',
      }
      this.sources.push(source)
    }
  }

  async execute(options = {}) {
    console.log(`\n🚀 Executing research plan: ${this.config.name}`)
    console.log(`⏰ Started at: ${new Date().toISOString()}`)

    this.status = 'running'
    const results = {
      sources: {},
      processing: {},
      handoffs: [],
      outputs: [],
      metrics: {
        startTime: Date.now(),
        sources: {},
      },
    }

    try {
      // Phase 1: Collect from sources
      console.log('\n📥 Phase 1: Collecting from sources...')
      for (const source of this.sources) {
        if (options.sources && !options.sources.includes(source.id)) {
          continue // Skip if filtering sources
        }

        try {
          console.log(`  → Collecting from ${source.id}...`)
          const startTime = Date.now()

          const data = await source.handler.collect(source.config)

          results.sources[source.id] = {
            count: Array.isArray(data) ? data.length : 1,
            data: data,
          }

          results.metrics.sources[source.id] = {
            duration: Date.now() - startTime,
            success: true,
            count: results.sources[source.id].count,
          }

          console.log(`    ✓ Collected ${results.sources[source.id].count} items`)
        } catch (error) {
          console.error(`    ✗ Failed: ${error.message}`)
          results.metrics.sources[source.id] = {
            success: false,
            error: error.message,
          }
        }
      }

      // Phase 2: Processing
      if (this.config.processing) {
        console.log('\n🔄 Phase 2: Processing data...')

        for (const processor of this.config.processing) {
          const processorType = processor.type || Object.keys(processor)[0]
          const processorConfig = processor[processorType] || processor

          console.log(`  → Running ${processor.id || processorType}...`)

          // Check conditions
          if (processor.condition && !this.evaluateCondition(processor.condition, results)) {
            console.log('    ⊘ Skipped (condition not met)')
            continue
          }

          const processorInstance = this.engine.processors.get(processorType)
          if (!processorInstance) {
            console.error(`    ✗ Unknown processor: ${processorType}`)
            continue
          }

          try {
            const input = processor.input || results.sources
            const output = await processorInstance.process(input, processorConfig)

            results.processing[processor.id || processorType] = output
            console.log('    ✓ Completed')
          } catch (error) {
            console.error(`    ✗ Failed: ${error.message}`)
          }
        }
      }

      // Phase 3: Handoffs
      if (this.config.handoff) {
        console.log('\n🤝 Phase 3: Executing handoffs...')

        for (const handoff of this.config.handoff) {
          // Check conditions
          if (!this.evaluateCondition(handoff.condition, results)) {
            console.log(`  ⊘ Skipping ${handoff.id} (condition not met)`)
            continue
          }

          console.log(`  → Executing ${handoff.id}...`)

          const handoffInstance = this.engine.handoffs.get(handoff.action.type)
          if (!handoffInstance) {
            console.error(`    ✗ Unknown handoff type: ${handoff.action.type}`)
            continue
          }

          try {
            await handoffInstance.execute(handoff.action, results)
            results.handoffs.push(handoff.id)
            console.log('    ✓ Completed')
          } catch (error) {
            console.error(`    ✗ Failed: ${error.message}`)
          }
        }
      }

      // Phase 4: Outputs
      if (this.config.outputs) {
        console.log('\n💾 Phase 4: Generating outputs...')

        for (const output of this.config.outputs) {
          console.log(`  → ${output.type}: ${output.path || output.namespace || 'default'}...`)

          try {
            await this.generateOutput(output, results)
            results.outputs.push(output)
            console.log('    ✓ Saved')
          } catch (error) {
            console.error(`    ✗ Failed: ${error.message}`)
          }
        }
      }

      // Complete
      results.metrics.endTime = Date.now()
      results.metrics.duration = results.metrics.endTime - results.metrics.startTime

      this.lastRun = new Date()
      this.status = 'completed'

      console.log(`\n✅ Research plan completed in ${Math.round(results.metrics.duration / 1000)}s`)

      return results
    } catch (error) {
      this.status = 'error'
      console.error(`\n❌ Research plan failed: ${error.message}`)
      throw error
    }
  }

  async dryRun() {
    console.log(`\n🧪 Dry run for: ${this.config.name}`)
    console.log('=' + '='.repeat(50))

    const results = {
      sources: {},
      handlers: {},
      processors: {},
      handoffs: [],
    }

    // Test sources
    console.log('\n📡 Testing sources...')
    for (const source of this.sources) {
      console.log(`\n  ${source.id} (${source.type}):`)

      try {
        // Check handler exists
        if (!source.handler) {
          throw new Error('Handler not found')
        }

        // Test connection
        const testResult = await source.handler.testConnection(source.config)

        results.sources[source.id] = {
          status: 'ready',
          sample: testResult,
        }

        console.log('    ✅ Connection successful')
        if (testResult) {
          console.log(`    📋 Sample: ${JSON.stringify(testResult, null, 2).substring(0, 200)}...`)
        }
      } catch (error) {
        results.sources[source.id] = {
          status: 'error',
          error: error.message,
        }
        console.log(`    ❌ Connection failed: ${error.message}`)
      }
    }

    // Test processors
    if (this.config.processing) {
      console.log('\n⚙️  Testing processors...')
      for (const processor of this.config.processing) {
        const type = processor.type || Object.keys(processor)[0]
        console.log(`  - ${processor.id || type}: ${this.engine.processors.has(type) ? '✅' : '❌'}`)
      }
    }

    // Test handoffs
    if (this.config.handoff) {
      console.log('\n🔗 Testing handoffs...')
      for (const handoff of this.config.handoff) {
        console.log(`  - ${handoff.id} (${handoff.action.type}): ${this.engine.handoffs.has(handoff.action.type) ? '✅' : '❌'}`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('Dry run complete\n')

    return results
  }

  schedule() {
    // Clear existing jobs
    this.cronJobs.forEach((job) => job.stop())
    this.cronJobs = []

    // Schedule sources with different schedules
    const schedules = new Set()

    for (const source of this.sources) {
      schedules.add(source.schedule)
    }

    // Use plan default if no source-specific schedules
    if (schedules.size === 0 && this.config.schedule?.default) {
      schedules.add(this.config.schedule.default)
    }

    // Create cron jobs
    for (const schedule of schedules) {
      const cronExpression = this.scheduleToCron(schedule)

      const job = cron.schedule(cronExpression, async () => {
        console.log(`\n⏰ Scheduled run triggered for: ${this.config.name}`)

        try {
          await this.execute({
            scheduled: true,
            schedule: schedule,
          })
        } catch (error) {
          console.error(`Scheduled run failed: ${error.message}`)
        }
      })

      this.cronJobs.push(job)
      console.log(`📅 Scheduled: ${schedule} (${cronExpression})`)
    }

    this.status = 'scheduled'
  }

  scheduleToCron(schedule) {
    const scheduleMap = {
      hourly: '0 * * * *',
      every_3_hours: '0 */3 * * *',
      daily: '0 9 * * *',
      weekly: '0 9 * * 1',
      monthly: '0 9 1 * *',
    }

    return scheduleMap[schedule] || schedule
  }

  evaluateCondition(condition, context) {
    // Simple condition evaluation
    // In production, use a proper expression evaluator
    try {
      // This is a simplified version - in production use safe evaluation
      return true // Placeholder
    } catch (error) {
      console.error(`Failed to evaluate condition: ${error.message}`)
      return false
    }
  }

  async generateOutput(output, results) {
    const date = new Date().toISOString().split('T')[0]
    const timestamp = new Date().toISOString()

    // Template variables
    const vars = {
      date,
      timestamp,
      ...results,
    }

    switch (output.type) {
      case 'file': {
        const filePath = output.path.replace('{{date}}', date)
        const dir = path.dirname(filePath)

        await fs.mkdir(dir, { recursive: true })

        let content
        if (output.template) {
          content = this.renderTemplate(output.template, vars)
        } else {
          content = JSON.stringify(results, null, 2)
        }

        await fs.writeFile(filePath, content)
        break
      }

      case 'append': {
        const content = output.content || JSON.stringify(results.processing, null, 2)
        await fs.appendFile(output.path, `\n${content}\n`)
        break
      }

      case 'memory': {
        // Integrate with memory system
        console.log(`    → Saving to memory: ${output.namespace}`)
        break
      }

      case 'event': {
        // Emit event
        console.log(`    → Emitting event: ${output.event} on ${output.channel}`)
        break
      }
    }
  }

  renderTemplate(template, vars) {
    // Simple template rendering - in production use handlebars or similar
    let result = template

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, typeof value === 'object' ? JSON.stringify(value, null, 2) : value)
    }

    return result
  }

  getStatus() {
    return {
      name: this.config.name,
      status: this.status,
      lastRun: this.lastRun,
      scheduled: this.cronJobs.length > 0,
      sources: this.sources.length,
      description: this.config.description,
    }
  }
}

// CLI interface
if (require.main === module) {
  const engine = new ResearchPlanEngine()
  const args = process.argv.slice(2)
  const command = args[0]

  async function main() {
    try {
      switch (command) {
        case 'run': {
          const planFile = args[1]
          if (!planFile) {
            console.error('Usage: research-plan run <plan.yaml>')
            process.exit(1)
          }

          const plan = await engine.loadPlan(planFile)
          await plan.execute()
          break
        }

        case 'dry-run': {
          const planFile = args[1]
          if (!planFile) {
            console.error('Usage: research-plan dry-run <plan.yaml>')
            process.exit(1)
          }

          const plan = await engine.loadPlan(planFile)
          await plan.dryRun()
          break
        }

        case 'schedule': {
          const planFile = args[1]
          if (!planFile) {
            console.error('Usage: research-plan schedule <plan.yaml>')
            process.exit(1)
          }

          const plan = await engine.loadPlan(planFile)
          plan.schedule()

          console.log('\n📅 Research plan scheduled. Press Ctrl+C to stop.')

          // Keep process alive
          process.on('SIGINT', () => {
            console.log('\n👋 Stopping scheduled plans...')
            process.exit(0)
          })

          break
        }

        default: {
          console.log(`
@lev-os/research - Research Plan Engine

Commands:
  run <plan.yaml>       Execute a research plan
  dry-run <plan.yaml>   Test connections and validate config
  schedule <plan.yaml>  Schedule plan for continuous monitoring
  
Example:
  research-plan run research-plans/ai-ecosystem.yaml
  research-plan dry-run research-plans/ai-ecosystem.yaml
  research-plan schedule research-plans/ai-ecosystem.yaml
          `)
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`)
      process.exit(1)
    }
  }

  main()
}

module.exports = { ResearchPlanEngine, ResearchPlan }
