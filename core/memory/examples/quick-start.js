#!/usr/bin/env node

/**
 * Quick Start Example
 * Use the memory system with your Neo4j Desktop
 */

import { ConfigManager } from '../src/config/config-manager.js';
import chalk from 'chalk';

async function quickStart() {
  console.log(chalk.blue.bold('🚀 Leviathan Memory Quick Start\n'));
  
  try {
    // 1. Load configuration (auto-detects your Neo4j Desktop)
    console.log(chalk.yellow('Loading configuration...'));
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    
    console.log(chalk.green('✅ Configuration loaded!'));
    console.log(chalk.cyan(`Using: ${config.deploymentMode} mode`));
    console.log(chalk.cyan(`Neo4j: ${config.neo4j.uri}\n`));
    
    // 2. Show how to use in your code
    console.log(chalk.yellow('📝 Example Usage:\n'));
    
    console.log(chalk.white(`// In your application code:
import { HybridMemoryManager } from '@lev-os/memory';

async function main() {
  // Create memory manager with auto-config
  const memory = new HybridMemoryManager({ 
    useConfigSystem: true 
  });
  
  // Initialize (connects to your Neo4j Desktop)
  await memory.initialize();
  
  // Store memories
  await memory.store({
    type: 'procedural',
    content: 'User prefers dark mode',
    metadata: { 
      source: 'user-interaction',
      timestamp: new Date() 
    }
  });
  
  // Retrieve memories
  const memories = await memory.retrieve({
    type: 'procedural',
    limit: 10
  });
  
  console.log('Retrieved memories:', memories);
}

main().catch(console.error);
`));

    // 3. Environment setup instructions
    console.log(chalk.yellow('\n🔧 Environment Setup:\n'));
    console.log(chalk.white('Add these to your .env or shell profile:'));
    console.log(chalk.gray(`
export LEV_NEO4J_URI="${config.neo4j.uri}"
export LEV_NEO4J_USER="${config.neo4j.username}"
export LEV_NEO4J_PASSWORD="your-neo4j-password"
export LEV_DEPLOYMENT_MODE="${config.deploymentMode}"
`));

    // 4. Next steps
    console.log(chalk.yellow('\n🎯 Next Steps:\n'));
    console.log(chalk.white('1. Set your Neo4j password in environment variables'));
    console.log(chalk.white('2. Start the Graphiti service (if using temporal features):'));
    console.log(chalk.gray('   docker-compose -f src/config/docker-compose.external.yml up -d'));
    console.log(chalk.white('3. Install dependencies: pnpm install'));
    console.log(chalk.white('4. Start building with memory!'));
    
    // 5. Show memory types
    console.log(chalk.yellow('\n🧠 Memory Types Available:\n'));
    console.log(chalk.white('• Procedural - How to do things (workflows, patterns)'));
    console.log(chalk.white('• Semantic - Facts and knowledge (docs, APIs)'));
    console.log(chalk.white('• Episodic - Events and experiences (interactions)'));
    console.log(chalk.white('• Working - Active context (current session)'));
    
    console.log(chalk.green.bold('\n✨ Ready to use with your Neo4j Desktop!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  }
}

// Run the quick start
quickStart();