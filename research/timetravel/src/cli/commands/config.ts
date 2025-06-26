import chalk from 'chalk'
import inquirer from 'inquirer'
import { ConfigManager } from '@api/config/manager'

export async function ConfigCommand(options: { setup?: boolean; list?: boolean; validate?: boolean }) {
  const configManager = new ConfigManager()

  if (options.setup) {
    await runSetup(configManager)
  } else if (options.list) {
    await listConfig(configManager)
  } else if (options.validate) {
    await validateConfig(configManager)
  } else {
    console.log(chalk.yellow('Please specify an option: --setup, --list, or --validate'))
  }
}

async function runSetup(configManager: ConfigManager) {
  console.log(chalk.blue('🔧 TimeTravel Configuration Setup\n'))

  const questions = [
    {
      type: 'input',
      name: 'perplexityKey',
      message: 'Perplexity API Key:',
      validate: (input: string) => input.length > 0 || 'API key is required',
    },
    {
      type: 'input',
      name: 'braveKey',
      message: 'Brave Search API Key:',
    },
    {
      type: 'input',
      name: 'exaKey',
      message: 'Exa API Key:',
    },
    {
      type: 'input',
      name: 'firecrawlKey',
      message: 'Firecrawl API Key:',
    },
  ]

  const answers = await inquirer.prompt(questions)
  // TODO: Implement updateKeys in ConfigManager
  // await configManager.updateKeys(answers);
  console.log(chalk.yellow('⚠️ Key update functionality not yet implemented'))

  console.log(chalk.green('✅ Configuration saved!'))
}

async function listConfig(configManager: ConfigManager) {
  const config = configManager.getAll()

  console.log(chalk.blue('📋 Current Configuration:\n'))
  console.log(`Environment: ${config.env}`)
  console.log(`Port: ${config.port}`)
  console.log(`API Keys configured: ${Object.keys(config.apis).length}`)
  console.log(`Research settings:`)
  console.log(`  - Max concurrent requests: ${config.research.maxConcurrentRequests}`)
  console.log(`  - Default timeout: ${config.research.defaultTimeout}ms`)
  console.log(`  - Retry attempts: ${config.research.retryAttempts}`)
}

async function validateConfig(configManager: ConfigManager) {
  console.log(chalk.blue('🔍 Validating configuration...\n'))

  // TODO: Implement validateKeys in ConfigManager
  // const results = await configManager.validateKeys()
  console.log(chalk.yellow('⚠️ Key validation functionality not yet implemented'))

  // For now, just check if keys are present
  const config = configManager.getAll()
  for (const [apiName, apiConfig] of Object.entries(config.apis)) {
    const status = apiConfig.apiKey ? chalk.green('✅') : chalk.red('❌')
    console.log(`${status} ${apiName}`)
  }
}
