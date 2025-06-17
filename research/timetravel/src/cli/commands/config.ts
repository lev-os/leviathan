import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '@api/config/manager';

export async function ConfigCommand(options: {
  setup?: boolean;
  list?: boolean;
  validate?: boolean;
}) {
  const configManager = new ConfigManager();
  
  if (options.setup) {
    await runSetup(configManager);
  } else if (options.list) {
    await listConfig(configManager);
  } else if (options.validate) {
    await validateConfig(configManager);
  } else {
    console.log(chalk.yellow('Please specify an option: --setup, --list, or --validate'));
  }
}

async function runSetup(configManager: ConfigManager) {
  console.log(chalk.blue('🔧 TimeTravel Configuration Setup\n'));
  
  const questions = [
    {
      type: 'input',
      name: 'perplexityKey',
      message: 'Perplexity API Key:',
      validate: (input: string) => input.length > 0 || 'API key is required'
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
    }
  ];
  
  const answers = await inquirer.prompt(questions);
  await configManager.updateKeys(answers);
  
  console.log(chalk.green('✅ Configuration saved!'));
}async function listConfig(configManager: ConfigManager) {
  const config = await configManager.getConfig();
  
  console.log(chalk.blue('📋 Current Configuration:\n'));
  console.log(`API Keys configured: ${Object.keys(config.apiKeys).length}`);
  console.log(`Default depth: ${config.defaults.depth}`);
  console.log(`Default duration: ${config.defaults.duration} minutes`);
  console.log(`Output directory: ${config.paths.output}`);
}

async function validateConfig(configManager: ConfigManager) {
  console.log(chalk.blue('🔍 Validating configuration...\n'));
  
  const results = await configManager.validateKeys();
  
  for (const [service, isValid] of Object.entries(results)) {
    const status = isValid ? chalk.green('✅') : chalk.red('❌');
    console.log(`${status} ${service}`);
  }
  
  const allValid = Object.values(results).every(Boolean);
  if (allValid) {
    console.log(chalk.green('\n✅ All API keys are valid!'));
  } else {
    console.log(chalk.yellow('\n⚠️ Some API keys need attention'));
  }
}