/**
 * Command Registry - Extensible command registration and execution
 * Supports core commands and plugin command extensions
 * Part of Leviathan CLI Adapter
 */

export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.plugins = new Map();
    this.initialized = false;
  }

  /**
   * Initialize command registry
   */
  async initialize() {
    if (this.initialized) return;
    
    // Load any plugin commands
    await this.loadPluginCommands();
    
    this.initialized = true;
  }

  /**
   * Register a command
   * @param {string} name - Command name
   * @param {Object} config - Command configuration
   */
  registerCommand(name, config) {
    const {
      description = 'No description provided',
      usage = `lev ${name}`,
      handler = null,
      examples = [],
      aliases = [],
      plugin = null,
      isPlugin = false
    } = config;

    if (!handler || typeof handler !== 'function') {
      throw new Error(`Command handler must be a function for command: ${name}`);
    }

    const commandData = {
      name,
      description,
      usage,
      handler,
      examples,
      aliases,
      plugin,
      isPlugin,
      registeredAt: Date.now()
    };

    this.commands.set(name, commandData);

    // Register aliases
    aliases.forEach(alias => {
      this.aliases.set(alias, name);
    });

    // Track plugin commands
    if (plugin) {
      if (!this.plugins.has(plugin)) {
        this.plugins.set(plugin, []);
      }
      this.plugins.get(plugin).push(name);
    }
  }

  /**
   * Execute a registered command
   * @param {string} name - Command name or alias
   * @param {Array} args - Command arguments
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(name, args = []) {
    const commandName = this.resolveCommandName(name);
    
    if (!commandName) {
      throw new Error(`Unknown command: ${name}`);
    }

    const command = this.commands.get(commandName);
    
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    try {
      const result = await command.handler(args);
      
      // Ensure result is in expected format
      return this.normalizeCommandResult(result, commandName);
      
    } catch (error) {
      return {
        success: false,
        command: commandName,
        error: error.message,
        formatted_response: `❌ Command '${commandName}' failed: ${error.message}`
      };
    }
  }

  /**
   * Check if command exists
   * @param {string} name - Command name or alias
   * @returns {boolean}
   */
  hasCommand(name) {
    const commandName = this.resolveCommandName(name);
    return this.commands.has(commandName);
  }

  /**
   * Get command information
   * @param {string} name - Command name or alias
   * @returns {Object|null} Command data
   */
  getCommand(name) {
    const commandName = this.resolveCommandName(name);
    return this.commands.get(commandName) || null;
  }

  /**
   * Get all registered commands
   * @param {Object} options - Filtering options
   * @returns {Array} Array of command data
   */
  getAllCommands(options = {}) {
    const { includePlugins = true, plugin = null } = options;
    
    let commands = Array.from(this.commands.values());
    
    // Filter by plugin
    if (plugin) {
      commands = commands.filter(cmd => cmd.plugin === plugin);
    } else if (!includePlugins) {
      commands = commands.filter(cmd => !cmd.isPlugin);
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get command count
   * @returns {number} Number of registered commands
   */
  getCommandCount() {
    return this.commands.size;
  }

  /**
   * Get plugins with their commands
   * @returns {Object} Plugin registry
   */
  getPlugins() {
    const pluginData = {};
    
    this.plugins.forEach((commands, pluginName) => {
      pluginData[pluginName] = {
        name: pluginName,
        commands: commands,
        commandCount: commands.length
      };
    });
    
    return pluginData;
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   * @returns {boolean} Success status
   */
  unregisterCommand(name) {
    const command = this.commands.get(name);
    
    if (!command) {
      return false;
    }
    
    // Remove aliases
    command.aliases.forEach(alias => {
      this.aliases.delete(alias);
    });
    
    // Remove from plugin tracking
    if (command.plugin) {
      const pluginCommands = this.plugins.get(command.plugin) || [];
      const index = pluginCommands.indexOf(name);
      if (index > -1) {
        pluginCommands.splice(index, 1);
        
        // Remove plugin if no commands left
        if (pluginCommands.length === 0) {
          this.plugins.delete(command.plugin);
        }
      }
    }
    
    // Remove command
    this.commands.delete(name);
    
    return true;
  }

  /**
   * Register command extension for existing command
   * @param {string} commandName - Existing command name
   * @param {Object} extension - Extension configuration
   */
  extendCommand(commandName, extension) {
    const command = this.commands.get(commandName);
    
    if (!command) {
      throw new Error(`Cannot extend non-existent command: ${commandName}`);
    }
    
    // Wrap existing handler with extension
    const originalHandler = command.handler;
    
    command.handler = async (args) => {
      // Pre-processing extension
      if (extension.preProcess) {
        args = await extension.preProcess(args);
      }
      
      // Execute original handler
      let result = await originalHandler(args);
      
      // Post-processing extension
      if (extension.postProcess) {
        result = await extension.postProcess(result, args);
      }
      
      return result;
    };
    
    // Update metadata if provided
    if (extension.description) {
      command.description += ` (Extended: ${extension.description})`;
    }
    
    if (extension.examples) {
      command.examples.push(...extension.examples);
    }
  }

  // Private Methods

  /**
   * Resolve command name from alias
   */
  resolveCommandName(nameOrAlias) {
    // Check direct command name first
    if (this.commands.has(nameOrAlias)) {
      return nameOrAlias;
    }
    
    // Check aliases
    return this.aliases.get(nameOrAlias) || null;
  }

  /**
   * Normalize command result format
   */
  normalizeCommandResult(result, commandName) {
    // If result is already properly formatted, return as-is
    if (result && typeof result === 'object' && 'success' in result) {
      return result;
    }
    
    // If result is a string, treat as formatted response
    if (typeof result === 'string') {
      return {
        success: true,
        command: commandName,
        formatted_response: result
      };
    }
    
    // If result is an object without success field, wrap it
    if (result && typeof result === 'object') {
      return {
        success: true,
        command: commandName,
        data: result,
        formatted_response: result.formatted_response || JSON.stringify(result, null, 2)
      };
    }
    
    // Default successful result
    return {
      success: true,
      command: commandName,
      data: result,
      formatted_response: `Command '${commandName}' completed successfully`
    };
  }

  /**
   * Load plugin commands
   */
  async loadPluginCommands() {
    try {
      // This would scan for plugin command registrations
      // For now, return early as plugins aren't implemented yet
      return;
      
    } catch (error) {
      console.warn('Failed to load plugin commands:', error.message);
    }
  }
}