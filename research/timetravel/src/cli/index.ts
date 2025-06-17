#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ResearchCommand } from './commands/research';
import { ConfigCommand } from './commands/config';
import { StatusCommand } from './commands/status';
import { WebCommand } from './commands/web';

const program = new Command();

program
  .name('timetravel')
  .description('AI research platform with time travel methodology')
  .version('1.0.0');

// Research command
program
  .command('research')
  .alias('r')
  .description('Execute research workflow')
  .argument('<topic>', 'Research topic')
  .option('-d, --depth <level>', 'Research depth: quick|standard|deep', 'standard')
  .option('-t, --time <minutes>', 'Maximum time in minutes', '60')
  .option('-o, --output <format>', 'Output format: markdown|json|html', 'markdown')
  .option('-p, --personalities <modes>', 'Personality modes (comma-separated)')
  .option('-s, --sources <sources>', 'Data sources (comma-separated)')
  .option('--web', 'Open web interface')
  .action(ResearchCommand);

// Configuration command
program
  .command('config')
  .alias('c')
  .description('Manage configuration')
  .option('--setup', 'Run interactive setup')
  .option('--list', 'List current configuration')
  .option('--validate', 'Validate API keys')
  .action(ConfigCommand);

// Status command  
program
  .command('status')
  .alias('s')
  .description('Show system status and recent research')
  .option('--json', 'Output as JSON')
  .action(StatusCommand);// Web interface command
program
  .command('web')
  .alias('w')
  .description('Start web interface')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('--open', 'Open browser automatically')
  .action(WebCommand);

// Global error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Run `timetravel --help` for available commands'));
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse();