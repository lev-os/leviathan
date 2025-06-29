#!/usr/bin/env node

import { TradingCLI } from './cli/TradingCLI.js';
import { CommandHandlers } from './cli/CommandHandlers.js';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      console.log(chalk.red('❌ Error: Missing API keys'));
      console.log(chalk.yellow('Please set ANTHROPIC_API_KEY and/or OPENAI_API_KEY in your .env file'));
      process.exit(1);
    }

    const cli = new TradingCLI();
    await cli.initialize();
    
    // Start interactive mode by default
    await cli.startInteractiveMode();
    
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n👋 Shutting down gracefully...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.cyan('\n👋 Shutting down gracefully...'));
  process.exit(0);
});

main().catch(error => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});
