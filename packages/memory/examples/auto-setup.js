#!/usr/bin/env node

/**
 * Auto-Setup Example
 * Demonstrates the new configurable memory system
 */

import { SetupWizard, ConfigManager, HybridMemoryManager } from '../src/config/index.js';
import chalk from 'chalk';

async function demonstrateAutoSetup() {
  console.log(chalk.blue.bold('🚀 Leviathan Memory Auto-Setup Demo\n'));
  
  try {
    // 1. Quick non-interactive setup
    console.log(chalk.yellow('1️⃣ Running auto-detection and configuration...\n'));
    const result = await SetupWizard.quickSetup();
    
    console.log(chalk.green('✅ Auto-setup completed!'));
    console.log(chalk.cyan(`Mode: ${result.config.deploymentMode}`));
    console.log(chalk.cyan(`Neo4j: ${result.config.neo4j.uri}`));
    console.log(chalk.cyan(`Graphiti: ${result.config.features.enableGraphiti ? 'Enabled' : 'Disabled'}\n`));
    
    // 2. Demonstrate usage with the new system
    console.log(chalk.yellow('2️⃣ Testing memory manager with auto-config...\n'));
    
    const memoryManager = new HybridMemoryManager({
      useConfigSystem: true  // Use the new configuration system
    });
    
    console.log(chalk.cyan('Initializing memory manager...'));
    // await memoryManager.initialize(); // Would connect in real usage
    
    console.log(chalk.green('✅ Memory manager ready with auto-detected configuration!'));
    
    // 3. Show configuration summary
    console.log(chalk.yellow('\n3️⃣ Configuration Summary:\n'));
    const configManager = new ConfigManager();
    await configManager.loadConfig();
    console.log(configManager.getConfigSummary());
    
    console.log(chalk.green.bold('\n🎉 Demo completed successfully!'));
    console.log(chalk.cyan('\nTo use in your code:'));
    console.log(chalk.white('  import { HybridMemoryManager } from "@lev-os/memory";'));
    console.log(chalk.white('  const memory = new HybridMemoryManager({ useConfigSystem: true });'));
    console.log(chalk.white('  await memory.initialize(); // Auto-detects and configures'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Demo failed:'), error.message);
    
    console.log(chalk.yellow('\n🔧 Troubleshooting:'));
    console.log(chalk.white('  • Install Neo4j Desktop or start a Neo4j instance'));
    console.log(chalk.white('  • Or install Docker for containerized setup'));
    console.log(chalk.white('  • Run: npm run setup -- --interactive'));
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAutoSetup();
}