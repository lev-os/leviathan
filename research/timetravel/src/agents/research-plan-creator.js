/**
 * Research Plan Creator Agent
 *
 * Interactive agent that helps users create research plans step by step
 */

const inquirer = require('inquirer')
const yaml = require('js-yaml')
const fs = require('fs').promises
const path = require('path')

class ResearchPlanCreator {
  constructor() {
    this.plan = {
      version: '1.0',
      metadata: {
        created: new Date().toISOString(),
        tags: [],
      },
      sources: [],
      processing: [],
      handoff: [],
      outputs: [],
    }

    this.sourceTypes = {
      twitter: {
        name: 'Twitter/X',
        description: 'Monitor Twitter accounts and keywords',
        requiresAPI: true,
        config: ['accounts', 'keywords', 'hashtags'],
      },
      github: {
        name: 'GitHub',
        description: 'Track repositories, stars, and releases',
        requiresAPI: true,
        config: ['queries', 'watch_repos'],
      },
      arxiv: {
        name: 'arXiv',
        description: 'Academic papers in AI/ML/Physics',
        requiresAPI: false,
        config: ['categories', 'keywords'],
      },
      pubmed: {
        name: 'PubMed',
        description: 'Medical and biomedical research',
        requiresAPI: true,
        config: ['queries', 'date_range'],
      },
      reddit: {
        name: 'Reddit',
        description: 'Subreddit discussions',
        requiresAPI: false,
        handler: 'cb3',
        config: ['subreddits', 'sort'],
      },
      hackernews: {
        name: 'Hacker News',
        description: 'Tech community discussions',
        requiresAPI: false,
        handler: 'cb3',
        config: ['filters'],
      },
      custom: {
        name: 'Custom Website',
        description: 'Scrape any website with cb3',
        requiresAPI: false,
        handler: 'cb3',
        config: ['url', 'selectors'],
      },
    }
  }

  async create() {
    console.log('\n🚀 Research Plan Creator\n')
    console.log("I'll help you create a research plan to monitor any topic.")
    console.log("Let's start with some basic information.\n")

    // Step 1: Basic Info
    await this.getBasicInfo()

    // Step 2: Understand Goal
    await this.understandGoal()

    // Step 3: Select Sources
    await this.selectSources()

    // Step 4: Configure Sources
    await this.configureSources()

    // Step 5: Set Schedule
    await this.setSchedule()

    // Step 6: Configure Processing
    await this.configureProcessing()

    // Step 7: Configure Handoffs
    await this.configureHandoffs()

    // Step 8: Configure Outputs
    await this.configureOutputs()

    // Step 9: Review and Save
    await this.reviewAndSave()
  }

  async getBasicInfo() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What would you like to name this research plan?',
        default: 'my-research-plan',
      },
      {
        type: 'input',
        name: 'description',
        message: "Brief description of what you're researching:",
        default: 'Monitor AI developments and trends',
      },
    ])

    this.plan.name = answers.name
    this.plan.description = answers.description
  }

  async understandGoal() {
    console.log('\n📎 Understanding your research goals...\n')

    const { goal } = await inquirer.prompt([
      {
        type: 'list',
        name: 'goal',
        message: 'What type of research are you conducting?',
        choices: [
          { name: '🧠 AI/ML Research (papers, code, discussions)', value: 'ai' },
          { name: '🏥 Medical/Clinical AI Research', value: 'medical' },
          { name: '💼 Competitive Intelligence', value: 'competitive' },
          { name: '📈 Market Trends & SEO', value: 'market' },
          { name: '🔬 Academic Research (general)', value: 'academic' },
          { name: '🎯 Custom Topic', value: 'custom' },
        ],
      },
    ])

    this.researchType = goal
    this.plan.metadata.tags.push(goal)

    // Suggest relevant sources based on goal
    this.suggestedSources = this.getSuggestedSources(goal)
  }

  getSuggestedSources(goal) {
    const suggestions = {
      ai: ['twitter', 'github', 'arxiv', 'reddit', 'hackernews'],
      medical: ['pubmed', 'twitter', 'arxiv', 'github'],
      competitive: ['github', 'twitter', 'custom', 'reddit'],
      market: ['twitter', 'reddit', 'custom', 'github'],
      academic: ['arxiv', 'pubmed', 'custom'],
      custom: ['twitter', 'custom', 'reddit'],
    }

    return suggestions[goal] || ['twitter', 'custom']
  }

  async selectSources() {
    console.log('\n🔍 Selecting data sources...\n')
    console.log('Based on your goal, I recommend these sources:')
    this.suggestedSources.forEach((s) => {
      const source = this.sourceTypes[s]
      console.log(`  • ${source.name}: ${source.description}`)
    })

    const { sources } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'sources',
        message: 'Select the sources you want to monitor:',
        choices: Object.entries(this.sourceTypes).map(([key, source]) => ({
          name: `${source.name} ${source.requiresAPI ? '(API key required)' : ''}`,
          value: key,
          checked: this.suggestedSources.includes(key),
        })),
      },
    ])

    this.selectedSources = sources
  }

  async configureSources() {
    console.log('\n⚙️  Configuring sources...\n')

    for (const sourceType of this.selectedSources) {
      console.log(`\n📌 Configuring ${this.sourceTypes[sourceType].name}:`)

      const config = await this.configureSource(sourceType)

      this.plan.sources.push({
        id: `${sourceType}-${this.plan.sources.length + 1}`,
        type: sourceType,
        handler: this.sourceTypes[sourceType].handler || 'api',
        config,
      })
    }
  }

  async configureSource(type) {
    const config = {}

    switch (type) {
      case 'twitter':
        const twitter = await inquirer.prompt([
          {
            type: 'input',
            name: 'accounts',
            message: 'Twitter accounts to monitor (comma-separated, e.g., karpathy,ylecun):',
            filter: (input) =>
              input
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
          },
          {
            type: 'input',
            name: 'keywords',
            message: 'Keywords to search (comma-separated):',
            filter: (input) =>
              input
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
          },
          {
            type: 'input',
            name: 'hashtags',
            message: 'Hashtags to track (comma-separated, include #):',
            filter: (input) =>
              input
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            default: '',
          },
        ])
        Object.assign(config, twitter)
        config.max_results = 200
        break

      case 'github':
        const github = await inquirer.prompt([
          {
            type: 'input',
            name: 'queries',
            message: 'GitHub search queries (one per line):\n',
            default: 'stars:>100 created:>2025-01-01 language:python topic:ai',
          },
          {
            type: 'input',
            name: 'watch_repos',
            message: 'Specific repos to watch (comma-separated, e.g., openai/whisper):',
            filter: (input) =>
              input
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            default: '',
          },
        ])
        config.queries = github.queries.split('\n').filter(Boolean)
        config.watch_repos = github.watch_repos
        break

      case 'arxiv':
        const arxiv = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'categories',
            message: 'Select arXiv categories:',
            choices: [
              { name: 'cs.AI - Artificial Intelligence', value: 'cs.AI' },
              { name: 'cs.LG - Machine Learning', value: 'cs.LG' },
              { name: 'cs.CL - Computation and Language', value: 'cs.CL' },
              { name: 'cs.CV - Computer Vision', value: 'cs.CV' },
              { name: 'stat.ML - Machine Learning (Stats)', value: 'stat.ML' },
            ],
          },
          {
            type: 'number',
            name: 'max_results',
            message: 'Maximum papers per day:',
            default: 50,
          },
        ])
        Object.assign(config, arxiv)
        break

      case 'custom':
        const custom = await inquirer.prompt([
          {
            type: 'input',
            name: 'url',
            message: 'Website URL to monitor:',
          },
          {
            type: 'input',
            name: 'name',
            message: 'Name for this source:',
            default: 'custom-website',
          },
        ])
        config.url = custom.url
        config.name = custom.name
        break
    }

    return config
  }

  async setSchedule() {
    console.log('\n⏰ Setting collection schedule...\n')

    const { defaultSchedule } = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultSchedule',
        message: 'How often should I check these sources?',
        choices: [
          { name: 'Every hour', value: 'hourly' },
          { name: 'Every 3 hours', value: 'every_3_hours' },
          { name: 'Daily (9 AM)', value: 'daily' },
          { name: 'Weekly (Mondays)', value: 'weekly' },
        ],
        default: 'daily',
      },
    ])

    this.plan.schedule = {
      default: defaultSchedule,
      timezone: 'UTC',
    }

    // Ask about source-specific schedules
    const { customSchedule } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customSchedule',
        message: 'Do you want different schedules for specific sources?',
        default: false,
      },
    ])

    if (customSchedule) {
      for (const source of this.plan.sources) {
        const { schedule } = await inquirer.prompt([
          {
            type: 'list',
            name: 'schedule',
            message: `Schedule for ${source.id}:`,
            choices: ['hourly', 'every_3_hours', 'daily', 'weekly', 'use default'],
            default: 'use default',
          },
        ])

        if (schedule !== 'use default') {
          source.schedule = schedule
        }
      }
    }
  }

  async configureProcessing() {
    console.log('\n🔄 Configuring data processing...\n')

    const { processing } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'processing',
        message: 'How should I process the collected data?',
        choices: [
          { name: '📊 Aggregate and deduplicate', value: 'aggregate', checked: true },
          { name: '🤖 AI trend analysis (requires GPT-4)', value: 'llm_analysis', checked: true },
          { name: '🔍 Pattern detection', value: 'patterns' },
          { name: '🌊 Perplexity deep dive on breakthroughs', value: 'perplexity' },
        ],
      },
    ])

    if (processing.includes('aggregate')) {
      this.plan.processing.push({
        id: 'aggregate',
        type: 'aggregate',
        config: {
          dedupe_by: ['title', 'url'],
          merge_similar: true,
        },
      })
    }

    if (processing.includes('llm_analysis')) {
      this.plan.processing.push({
        id: 'trend-analysis',
        type: 'llm',
        model: 'gpt-4',
        prompt_template: this.getTrendAnalysisPrompt(),
      })
    }
  }

  getTrendAnalysisPrompt() {
    return `Analyze the following research data and identify:
1. Emerging trends
2. Breakthrough findings
3. Community sentiment
4. Opportunities

Format as structured JSON with scores and reasoning.`
  }

  async configureHandoffs() {
    console.log('\n🤝 Configuring workflow handoffs...\n')

    const { handoffs } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'handoffs',
        message: 'What actions should trigger based on findings?',
        choices: [
          { name: '📧 Send alerts on breakthroughs', value: 'alerts' },
          { name: '🔧 Trigger workshop analysis for repos', value: 'workshop' },
          { name: '💾 Update memory/knowledge base', value: 'memory' },
          { name: '🪝 Call webhooks', value: 'webhook' },
        ],
      },
    ])

    if (handoffs.includes('workshop')) {
      this.plan.handoff.push({
        id: 'workshop-intake',
        condition: 'sources.github.new_repos.length > 0',
        action: {
          type: 'workflow',
          target: 'workshop-intake',
          config: {
            repos: '{{matching_repos}}',
          },
        },
      })
    }
  }

  async configureOutputs() {
    console.log('\n💾 Configuring outputs...\n')

    this.plan.outputs = [
      {
        type: 'file',
        path: `outputs/research/{{date}}/${this.plan.name}-summary.md`,
        template: 'default',
      },
      {
        type: 'append',
        path: '_trends.md',
        content: '{{processing.trend-analysis.trends_update}}',
      },
    ]

    const { saveToMemory } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'saveToMemory',
        message: 'Save insights to memory system?',
        default: true,
      },
    ])

    if (saveToMemory) {
      this.plan.outputs.push({
        type: 'memory',
        namespace: this.plan.name,
        operation: 'upsert',
      })
    }
  }

  async reviewAndSave() {
    console.log('\n📋 Review your research plan:\n')
    console.log(yaml.dump(this.plan, { lineWidth: -1 }))

    const { confirm, filename } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Does this look correct?',
        default: true,
      },
      {
        type: 'input',
        name: 'filename',
        message: 'Save as:',
        default: `research-plans/${this.plan.name}.yaml`,
        when: (answers) => answers.confirm,
      },
    ])

    if (confirm) {
      const dir = path.dirname(filename)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filename, yaml.dump(this.plan, { lineWidth: -1 }))

      console.log(`\n✅ Research plan saved to: ${filename}`)
      console.log('\nNext steps:')
      console.log(`1. Test: node src/research-plan-engine.js dry-run ${filename}`)
      console.log(`2. Run once: node src/research-plan-engine.js run ${filename}`)
      console.log(`3. Schedule: node src/research-plan-engine.js schedule ${filename}`)
    }
  }
}

// CLI
if (require.main === module) {
  const creator = new ResearchPlanCreator()
  creator.create().catch(console.error)
}

module.exports = ResearchPlanCreator
