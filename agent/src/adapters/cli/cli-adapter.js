/**
 * CLI Adapter - Command-line interface for Leviathan Core SDK
 * Handles argument parsing, command routing, and output formatting
 * Extensible adapter supporting plugin command registration
 */

import { loadAgent, listAgents, switchAgent } from '../../core/agents/agent-manager.js';
import { findContexts, scoreContext, listContextTypes } from '../../core/discovery/context-search.js';
import { createCheckpoint, resumeSession, createFinalCheckpoint } from '../../core/sessions/checkpoint-core.js';
import { createSession, updateSessionActivity, detectWorkspace } from '../../core/sessions/session-manager.js';

import { CommandRegistry } from './command-registry.js';
import { commandRegistry as coreCommandRegistry } from '../../core/command-registry.js';
import { ClaudeFormatter } from './formatters/claude-formatter.js';
import { FindRouter } from './routers/find-router.js';
import { CheckpointRouter } from './routers/checkpoint-router.js';
import { AgentRouter } from './routers/agent-router.js';

export class CLIAdapter {
  constructor(dependencies) {
    this.commandRegistry = new CommandRegistry();
    this.coreCommandRegistry = coreCommandRegistry;
    this.formatter = new ClaudeFormatter();
    this.dependencies = dependencies;
    
    // Initialize specialized routers
    this.findRouter = new FindRouter(findContexts, this.formatter);
    this.checkpointRouter = new CheckpointRouter({
      createCheckpoint,
      resumeSession, 
      createFinalCheckpoint,
      createSession,
      updateSessionActivity
    }, this.formatter);
    this.agentRouter = new AgentRouter({
      loadAgent,
      listAgents, 
      switchAgent
    }, this.formatter);
    
    this.initialized = false;
    this.registerCoreCommands();
  }

  /**
   * Initialize CLI adapter
   */
  async initialize() {
    if (this.initialized) return;
    
    // Initialize both CLI registry and core command registry
    await this.commandRegistry.initialize();
    
    // Initialize core command registry with dependencies
    await this.coreCommandRegistry.initialize(this.dependencies);
    
    this.initialized = true;
  }

  /**
   * Handle command from CLI arguments
   * @param {Array} args - Command line arguments
   * @returns {Promise<Object>} Command result
   */
  async handleCommand(args) {
    await this.initialize();
    
    if (args.length === 0 || (args.length === 1 && (args[0] === 'help' || args[0] === '--help'))) {
      return this.handleHelp();
    }
    
    const command = args[0];
    const commandArgs = args.slice(1);

    if (commandArgs.includes('--help')) {
      return this.handleHelp(command);
    }
    
    // Route to appropriate handler
    switch (command) {
      case 'find':
        return await this.findRouter.handle(commandArgs);
        
      case 'checkpoint':
        return await this.checkpointRouter.handle(commandArgs);
        
      case 'agent':
      case 'load':
        return await this.agentRouter.handle(commandArgs);
        
      case 'help':
      case '--help':
        return this.handleHelp(commandArgs[0]);
        
      case 'status':
        return this.handleStatus();
        
      case 'ping':
        return this.handlePing(commandArgs);
        
      default:
        // Check if command is registered by plugin in CLI registry
        if (this.commandRegistry.hasCommand(command)) {
          return await this.commandRegistry.executeCommand(command, commandArgs);
        }
        
        // Check if command is in core command registry (auto-bootstrap)
        const coreCommands = this.coreCommandRegistry.listCommands();
        if (coreCommands.includes(command)) {
          try {
            const result = await this.coreCommandRegistry.executeCommand(command, commandArgs, this.dependencies);
            return this.formatCoreCommandResult(result);
          } catch (error) {
            return {
              success: false,
              error: error.message,
              formatted_response: `❌ Error executing ${command}: ${error.message}`
            };
          }
        }
        
        // Try natural language processing
        return await this.handleNaturalLanguage(args);
    }
  }

  /**
   * Register core Leviathan commands
   */
  registerCoreCommands() {
    // Find command family
    this.commandRegistry.registerCommand('find', {
      description: 'Find contexts, agents, workflows, or patterns',
      usage: 'lev find <query> [--type=<type>] [--all]',
      handler: (args) => this.findRouter.handle(args),
      examples: [
        'lev find "documentation"',
        'lev find --all',
        'lev find doc-shepherd.analyze'
      ]
    });

    // Checkpoint command family  
    this.commandRegistry.registerCommand('checkpoint', {
      description: 'Create, resume, or manage session checkpoints',
      usage: 'lev checkpoint [--resume] [--new] [--final] [--session=<id>] [context]',
      handler: (args) => this.checkpointRouter.handle(args),
      examples: [
        'lev checkpoint "completed feature X"',
        'lev checkpoint --resume --session "2025-06-17-session-abc123"',
        'lev checkpoint --new "starting new task"'
      ]
    });

    // Agent command family
    this.commandRegistry.registerCommand('agent', {
      description: 'Load, switch, or list agents',
      usage: 'lev agent <name> [endpoint] | lev agent list [--type=<type>]',
      handler: (args) => this.agentRouter.handle(args),
      examples: [
        'lev agent doc-shepherd',
        'lev agent doc-shepherd.analyze',
        'lev agent list --type=eeps'
      ]
    });

    // Status and utility commands
    this.commandRegistry.registerCommand('status', {
      description: 'Show current system status',
      usage: 'lev status',
      handler: () => this.handleStatus()
    });

    this.commandRegistry.registerCommand('ping', {
      description: 'Create session activity ping',
      usage: 'lev ping [context]',
      handler: (args) => this.handlePing(args)
    });
  }

  /**
   * Handle help command
   */
  handleHelp(specificCommand = null) {
    if (specificCommand) {
      let commandInfo = this.commandRegistry.getCommand(specificCommand);
      if (!commandInfo) {
        commandInfo = this.coreCommandRegistry.getCommand(specificCommand);
      }

      if (commandInfo) {
        return {
          success: true,
          command: specificCommand,
          help: this.formatter.formatCommandHelp(commandInfo)
        };
      }
    }

    const allCommands = this.commandRegistry.getAllCommands();
    return {
      success: true,
      help: this.formatter.formatGeneralHelp(allCommands)
    };
  }

  /**
   * Handle status command
   */
  async handleStatus() {
    try {
      const workspace = detectWorkspace();
      const contextTypes = await listContextTypes();
      
      const status = {
        workspace: workspace,
        contextTypes: contextTypes.length,
        availableCommands: this.commandRegistry.getCommandCount(),
        initialized: this.initialized,
        adapters: ['CLI', 'MCP'], // Would be dynamic
        timestamp: Date.now()
      };

      return {
        success: true,
        status: status,
        formatted_response: this.formatter.formatStatus(status)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Status check failed: ${error.message}`
      };
    }
  }

  /**
   * Handle ping command (session activity)
   */
  async handlePing(args) {
    try {
      const context = args.join(' ') || 'Activity ping';
      const workspace = detectWorkspace();
      
      // Create or update session activity
      const sessionId = generateSessionId();
      await updateSessionActivity(sessionId, {
        context: context,
        workspace: workspace,
        ping: true
      });

      return {
        success: true,
        sessionId: sessionId,
        context: context,
        workspace: workspace,
        formatted_response: this.formatter.formatPing(sessionId, context, workspace)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Ping failed: ${error.message}`
      };
    }
  }

  /**
   * Handle natural language commands
   */
  async handleNaturalLanguage(args) {
    const query = args.join(' ');
    
    try {
      // Try to interpret as context search
      const result = await findContexts(query, { limit: 5 });
      
      if (result.found) {
        return {
          success: true,
          query: query,
          interpretation: 'natural_language_search',
          result: result,
          formatted_response: this.formatter.formatSearchResult(result)
        };
      }

      // If no results, provide suggestions
      return {
        success: false,
        query: query,
        interpretation: 'unknown_command',
        suggestions: result.suggestions || [],
        formatted_response: this.formatter.formatUnknownCommand(query, result.suggestions)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Natural language processing failed: ${error.message}`
      };
    }
  }

  /**
   * Register plugin command
   * @param {string} name - Command name
   * @param {Object} commandConfig - Command configuration
   * @param {string} pluginName - Plugin name for tracking
   */
  registerPluginCommand(name, commandConfig, pluginName = 'unknown') {
    this.commandRegistry.registerCommand(name, {
      ...commandConfig,
      plugin: pluginName,
      isPlugin: true
    });
  }

  /**
   * Get command registry for plugin access
   */
  getCommandRegistry() {
    return this.commandRegistry;
  }

  /**
   * Get formatter for plugin access
   */
  getFormatter() {
    return this.formatter;
  }

  /**
   * Format result from core command registry execution
   * @param {Object} result - Result from core command execution
   * @returns {Object} Formatted CLI adapter result
   */
  formatCoreCommandResult(result) {
    // Handle different result formats from core commands
    if (typeof result === 'object' && result !== null) {
      // If result already has formatted_response, use it
      if (result.formatted_response) {
        return {
          success: result.success !== false,
          data: result.data,
          formatted_response: result.formatted_response
        };
      }
      
      // If result has success/data structure, format appropriately
      if ('success' in result) {
        let formatted_response;
        
        if (result.success && result.data) {
          // Use formatter to create appropriate output based on data type
          if (result.format === 'json') {
            formatted_response = JSON.stringify(result.data, null, 2);
          } else if (result.format === 'formatted') {
            // Use Claude formatter for structured output
            formatted_response = this.formatter.formatCommandResult(result.data);
          } else {
            // Default fallback
            formatted_response = this.formatter.formatCommandResult(result.data);
          }
        } else if (!result.success) {
          formatted_response = `❌ Command failed: ${result.error || 'Unknown error'}`;
        } else {
          formatted_response = '✅ Command completed successfully';
        }
        
        return {
          success: result.success,
          data: result.data,
          error: result.error,
          formatted_response: formatted_response
        };
      }
      
      // Fallback: treat as data object
      return {
        success: true,
        data: result,
        formatted_response: this.formatter.formatCommandResult(result)
      };
    }
    
    // Handle primitive results (string, number, boolean)
    return {
      success: true,
      data: result,
      formatted_response: String(result)
    };
  }
}

// Helper Functions

/**
 * Generate session ID
 */
function generateSessionId() {
  const timestamp = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-session-${random}`;
}