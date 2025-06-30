/**
 * Setup Wizard
 * Interactive configuration and auto-setup for Leviathan Memory System
 */

import { ConfigManager } from './config-manager.js';
import { ServiceOrchestrator } from './service-orchestrator.js';
import readline from 'readline';
import chalk from 'chalk';

export class SetupWizard {
  constructor() {
    this.configManager = new ConfigManager();
    this.rl = null;
  }

  /**
   * Run the complete setup wizard
   */
  async run(options = {}) {
    console.log(chalk.blue.bold('🧙‍♂️ Leviathan Memory System Setup Wizard\n'));
    
    try {
      // Auto-detect first
      console.log(chalk.yellow('🔍 Detecting your system configuration...\n'));
      const autoConfig = await this.configManager.quickSetup();
      
      if (options.interactive !== false) {
        // Interactive mode
        this.rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const finalConfig = await this.runInteractiveSetup(autoConfig);
        await this.rl.close();
        
        return await this.validateAndStart(finalConfig);
      } else {
        // Non-interactive mode
        return await this.validateAndStart(autoConfig);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message);
      if (this.rl) this.rl.close();
      throw error;
    }
  }

  /**
   * Interactive setup flow
   */  /**
   * Interactive setup flow
   */
  async runInteractiveSetup(autoConfig) {
    console.log(chalk.green('✅ Auto-detection complete!\n'));
    console.log(this.configManager.getConfigSummary());
    
    const useAutoConfig = await this.ask(
      chalk.cyan('\n🤖 Use the auto-detected configuration? (y/n): '),
      'y'
    );
    
    if (useAutoConfig.toLowerCase() === 'y') {
      return autoConfig;
    }
    
    // Manual configuration
    console.log(chalk.yellow('\n⚙️ Manual Configuration\n'));
    
    const deploymentMode = await this.askChoice(
      'Choose deployment mode:',
      [
        { key: '1', value: 'desktop', label: 'Neo4j Desktop (recommended if you have it)' },
        { key: '2', value: 'docker', label: 'Docker Compose (isolated environment)' },
        { key: '3', value: 'external', label: 'Existing Neo4j instance' },
        { key: '4', value: 'native', label: 'Native Python service' }
      ]
    );
    
    const customConfig = { ...autoConfig, deploymentMode };
    
    // Configure Neo4j connection
    if (deploymentMode !== 'docker') {
      console.log(chalk.yellow('\n📊 Neo4j Configuration\n'));
      
      customConfig.neo4j.uri = await this.ask(
        `Neo4j URI (${autoConfig.neo4j.uri}): `,
        autoConfig.neo4j.uri
      );
      
      customConfig.neo4j.username = await this.ask(
        `Username (${autoConfig.neo4j.username}): `,
        autoConfig.neo4j.username
      );
      
      const password = await this.askPassword('Password: ');
      if (password) {
        customConfig.neo4j.password = password;
      }
    }
    
    // Additional options
    console.log(chalk.yellow('\n🔧 Additional Options\n'));
    
    const enableGraphiti = await this.ask(
      'Enable Graphiti temporal memory? (y/n): ',
      'y'
    );
    customConfig.features.enableGraphiti = enableGraphiti.toLowerCase() === 'y';
    
    if (customConfig.features.enableGraphiti) {
      customConfig.graphiti.grpcAddress = await this.ask(
        `Graphiti gRPC address (${autoConfig.graphiti.grpcAddress}): `,
        autoConfig.graphiti.grpcAddress
      );
    }
    
    const fallbackMode = await this.ask(
      'Enable file system fallback mode? (y/n): ',
      'n'
    );
    customConfig.features.fallbackMode = fallbackMode.toLowerCase() === 'y';
    
    return customConfig;
  }

  /**
   * Validate configuration and start services
   */
  async validateAndStart(config) {
    console.log(chalk.yellow('\n🔍 Validating configuration...\n'));
    
    const validation = this.configManager.validateConfig(config);
    if (!validation.valid) {
      console.error(chalk.red('❌ Configuration errors:'));
      validation.errors.forEach(error => console.error(chalk.red(`  • ${error}`)));
      throw new Error('Invalid configuration');
    }
    
    console.log(chalk.green('✅ Configuration is valid\n'));
    
    // Save configuration
    const saved = await this.configManager.saveLocalConfig(config);
    if (saved) {
      console.log(chalk.green(`💾 Configuration saved to ${config.paths.configPath}\n`));
    }
    
    // Ask if user wants to start services
    if (this.rl) {
      const startServices = await this.ask(
        chalk.cyan('🚀 Start services now? (y/n): '),
        'y'
      );
      
      if (startServices.toLowerCase() === 'y') {
        return await this.startServices(config);
      }
    }
    
    return {
      config,
      services: null,
      message: 'Configuration complete. Run services manually when ready.'
    };
  }  /**
   * Start services using orchestrator
   */
  async startServices(config) {
    console.log(chalk.yellow('🚀 Starting services...\n'));
    
    try {
      const orchestrator = new ServiceOrchestrator(config);
      const result = await orchestrator.start();
      
      console.log(chalk.green.bold('\n🎉 Setup Complete!\n'));
      console.log(chalk.green(`✅ Mode: ${result.mode}`));
      console.log(chalk.green(`✅ Services: ${result.services.join(', ')}`));
      
      // Test the connection
      console.log(chalk.yellow('\n🧪 Testing connection...\n'));
      const status = await orchestrator.getStatus();
      
      if (status.healthy) {
        console.log(chalk.green.bold('🎊 All systems operational!\n'));
        console.log(chalk.cyan('You can now use the Leviathan Memory System:'));
        console.log(chalk.cyan('  • Node.js: import { HybridMemoryManager } from "@lev-os/memory"'));
        console.log(chalk.cyan('  • CLI: lev memory --help'));
      } else {
        console.log(chalk.yellow.bold('⚠️ Some services are not responding correctly'));
        console.log(chalk.yellow('Check the logs and try restarting if needed'));
      }
      
      return {
        config,
        services: result,
        status,
        orchestrator
      };
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Failed to start services:'), error.message);
      console.error(chalk.red('\nTroubleshooting:'));
      console.error(chalk.red('  • Check if Neo4j is running and accessible'));
      console.error(chalk.red('  • Verify your credentials are correct'));
      console.error(chalk.red('  • Try running: lev memory setup --interactive'));
      throw error;
    }
  }

  /**
   * Ask a question with default value
   */
  async ask(question, defaultValue = '') {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  /**
   * Ask for password (hidden input)
   */
  async askPassword(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
      this.rl.stdoutMuted = true;
    });
  }

  /**
   * Ask user to choose from options
   */
  async askChoice(question, choices) {
    console.log(chalk.cyan(question));
    choices.forEach(choice => {
      console.log(chalk.white(`  ${choice.key}. ${choice.label}`));
    });
    
    const answer = await this.ask(chalk.cyan('\nEnter choice (1-4): '), '1');
    const choice = choices.find(c => c.key === answer);
    
    return choice ? choice.value : choices[0].value;
  }

  /**
   * Non-interactive quick setup
   */
  static async quickSetup() {
    const wizard = new SetupWizard();
    return await wizard.run({ interactive: false });
  }

  /**
   * Generate installation script
   */
  static generateInstallScript(config) {
    const envVars = [
      `export LEV_NEO4J_URI="${config.neo4j.uri}"`,
      `export LEV_NEO4J_USER="${config.neo4j.username}"`,
      `export LEV_NEO4J_PASSWORD="${config.neo4j.password || 'your-password'}"`,
      `export LEV_DEPLOYMENT_MODE="${config.deploymentMode}"`,
      `export LEV_ENABLE_GRAPHITI="${config.features.enableGraphiti}"`,
      `export LEV_GRPC_ADDRESS="${config.graphiti.grpcAddress}"`
    ];
    
    return {
      bash: envVars.join('\n'),
      docker: `# Add to docker-compose.yml environment section:\n${envVars.map(e => `      - ${e.replace('export ', '')}`).join('\n')}`,
      instructions: [
        '1. Save environment variables to your shell profile (.bashrc, .zshrc, etc.)',
        '2. Or use a .env file in your project directory',
        '3. Restart your shell or run: source ~/.bashrc',
        '4. Test with: lev memory status'
      ]
    };
  }
}