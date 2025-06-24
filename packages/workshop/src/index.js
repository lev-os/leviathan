#!/usr/bin/env node

/**
 * @lev-os/workshop - Tool Integration and Plugin Creation System
 * 
 * Main entry point for workshop plugin registration with Leviathan CLI adapter.
 * Demonstrates hexagonal architecture patterns and plugin extensibility.
 */

import { logger } from '@lev-os/debug';
import StatusCommand from './commands/status.js';
import ListCommand from './commands/list.js';
import InfoCommand from './commands/info.js';
import IntakeCommand from './commands/intake.js';
import ClassifyCommand from './commands/classify.js';
import IntegrateCommand from './commands/integrate.js';
import CreateCommand from './commands/create.js';
import TestCommand from './commands/test.js';
import OnboardCommand from './commands/onboard.js';
import DocsCommand from './commands/docs.js';
import TutorialCommand from './commands/tutorial.js';
import ExamplesCommand from './commands/examples.js';

/**
 * Workshop Plugin Class
 * 
 * Follows Leviathan plugin patterns:
 * - Namespace isolation (workshop:*)
 * - Command registry integration
 * - Core SDK usage for business logic
 * - Auto-bootstrap to MCP tools
 */
export class WorkshopPlugin {
  constructor() {
    this.namespace = 'workshop';
    this.commands = new Map();
    this.initializeCommands();
  }

  /**
   * Initialize all workshop commands
   * Each command follows the pattern: lev workshop <command> [args]
   */
  initializeCommands() {
    // Core tool management commands
    this.commands.set('status', new StatusCommand());
    this.commands.set('list', new ListCommand());
    this.commands.set('info', new InfoCommand());
    
    // Tool integration automation
    this.commands.set('intake', new IntakeCommand());
    this.commands.set('classify', new ClassifyCommand());
    this.commands.set('integrate', new IntegrateCommand());
    
    // Plugin creation system
    this.commands.set('create', new CreateCommand());
    this.commands.set('test', new TestCommand());
    
    // Community onboarding
    this.commands.set('onboard', new OnboardCommand());
    this.commands.set('docs', new DocsCommand());
    this.commands.set('tutorial', new TutorialCommand());
    this.commands.set('examples', new ExamplesCommand());

    logger.info('Workshop plugin initialized', { 
      commands: Array.from(this.commands.keys()),
      namespace: this.namespace 
    });
  }

  /**
   * Register workshop commands with Leviathan CLI adapter
   * 
   * This method is called by the CLI adapter during plugin discovery.
   * Each command is registered with namespace prefix for isolation.
   * 
   * @param {CommandRegistry} commandRegistry - CLI adapter command registry
   */
  async register(commandRegistry) {
    logger.info('Registering workshop commands with CLI adapter');

    for (const [commandName, commandHandler] of this.commands) {
      const fullCommandName = `${this.namespace} ${commandName}`;
      
      await commandRegistry.register(fullCommandName, 
        commandHandler.execute.bind(commandHandler), 
        {
          description: commandHandler.description,
          namespace: this.namespace,
          plugin: '@lev-os/workshop',
          args: commandHandler.args || [],
          options: commandHandler.options || []
        }
      );
    }

    logger.info('Workshop plugin registration complete', {
      registered_commands: this.commands.size,
      namespace: this.namespace
    });
  }

  /**
   * Execute workshop command
   * 
   * Called by CLI adapter when processing 'lev workshop <command>' calls.
   * Routes to appropriate command handler.
   * 
   * @param {string} commandName - Command to execute
   * @param {Array} args - Command arguments
   * @param {Object} options - Command options
   */
  async execute(commandName, args = [], options = {}) {
    const command = this.commands.get(commandName);
    
    if (!command) {
      const availableCommands = Array.from(this.commands.keys()).join(', ');
      throw new Error(`Unknown workshop command: ${commandName}. Available: ${availableCommands}`);
    }

    logger.debug('Executing workshop command', { 
      command: commandName, 
      args, 
      options 
    });

    return await command.execute(args, options);
  }

  /**
   * Get plugin metadata for CLI adapter
   */
  getMetadata() {
    return {
      name: '@lev-os/workshop',
      version: '0.1.0',
      namespace: this.namespace,
      description: 'Tool integration and plugin creation system for Leviathan ecosystem',
      commands: Array.from(this.commands.keys()),
      capabilities: [
        'tool_integration',
        'plugin_creation', 
        'community_onboarding',
        'tier_classification',
        'template_generation',
        'integration_automation'
      ]
    };
  }
}

// Export for CLI adapter discovery
export default WorkshopPlugin;