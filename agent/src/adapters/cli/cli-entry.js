#!/usr/bin/env node

/**
 * CLI Entry Point - New hexagonal architecture CLI adapter
 * Routes commands through the new CLI adapter system
 */

import { CLIAdapter } from './cli-adapter.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    
    const cliAdapter = new CLIAdapter();
    const result = await cliAdapter.handleCommand(args);
    
    // Output formatted response
    if (result.formatted_response) {
      console.log(result.formatted_response);
    } else if (result.success) {
      console.log('Command completed successfully');
    } else {
      console.error(result.error || 'Command failed');
      process.exit(1);
    }
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}