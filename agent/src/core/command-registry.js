/**
 * Universal Command Registry - Single source of truth for all commands across all adapters
 * Implements auto-bootstrap architecture pattern per _02-adapters.md specification
 */

export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.initialized = false;
  }

  /**
   * Register a command handler with the registry
   */
  register(name, handler, options = {}) {
    this.commands.set(name, {
      name,
      handler,
      description: options.description || `Execute ${name} command`,
      args: options.args || [],
      namespace: options.namespace,
      plugin: options.plugin
    });
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  /**
   * Get all registered commands
   */
  async getAllCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Execute a command by name
   */
  async execute(name, args, dependencies = {}) {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`Command not found: ${name}`);
    }
    
    // Call handler with args and dependencies
    return await command.handler(args, dependencies);
  }

  /**
   * List all command names
   */
  listCommands() {
    return Array.from(this.commands.keys());
  }

  /**
   * Auto-generate MCP tools from registered commands
   */
  getMCPTools() {
    const commands = Array.from(this.commands.values());
    return commands.map(cmd => ({
      name: this.formatMCPToolName(cmd.name),
      description: cmd.description,
      inputSchema: this.generateMCPSchema(cmd.args)
    }));
  }

  /**
   * Format command name for MCP tool compatibility
   */
  formatMCPToolName(commandName) {
    // workshop:discover -> workshop_discover
    // checkpoint -> checkpoint  
    return commandName.replace(':', '_');
  }

  /**
   * Execute command via MCP tool name
   */
  async executeCommand(commandName, args, dependencies = {}) {
    // Convert MCP tool name back to command name
    const originalName = commandName.replace(/_/g, ':');
    
    // If that doesn't exist, try with single underscore replacement
    if (!this.commands.has(originalName)) {
      const singleReplace = commandName.replace('_', ':');
      if (this.commands.has(singleReplace)) {
        return await this.execute(singleReplace, args, dependencies);
      }
    }
    
    return await this.execute(originalName, args, dependencies);
  }

  /**
   * Auto-generate JSON schema from command argument definitions
   */
  generateMCPSchema(commandArgs) {
    return {
      type: "object",
      properties: commandArgs?.reduce((props, arg) => {
        props[arg.name] = {
          type: arg.type || "string",
          description: arg.description
        };
        return props;
      }, {}) || {},
      required: commandArgs?.filter(arg => arg.required).map(arg => arg.name) || []
    };
  }

  /**
   * Auto-import all commands from src/commands/ directory
   */
  async autoImportCommands() {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const commandsDir = path.resolve(__dirname, '..', 'commands');
    
    try {
      const files = await fs.readdir(commandsDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      console.log(`🔍 Auto-importing ${jsFiles.length} commands from ${commandsDir}`);
      
      for (const file of jsFiles) {
        try {
          const commandName = path.basename(file, '.js');
          const modulePath = path.join(commandsDir, file);
          const commandModule = await import(`file://${modulePath}`);
          
          // Convert kebab-case filename to camelCase function name (session-ping -> sessionPing)
          const functionName = commandName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          
          // Look for named export matching the camelCase function name
          if (commandModule[functionName] && typeof commandModule[functionName] === 'function') {
            this.register(commandName, commandModule[functionName], {
              description: commandModule.description || `${commandName} command`,
              args: commandModule.args || [],
              namespace: commandModule.namespace,
              plugin: commandModule.plugin
            });
            
            console.log(`✅ Registered command: ${commandName} (${functionName})`);
          } else if (commandModule.default && typeof commandModule.default === 'function') {
            // Fallback to default export
            this.register(commandName, commandModule.default, {
              description: commandModule.description || `${commandName} command`,
              args: commandModule.args || [],
              namespace: commandModule.namespace,
              plugin: commandModule.plugin
            });
            
            console.log(`✅ Registered command: ${commandName} (default export)`);
          } else {
            console.warn(`⚠️  Command file ${file} does not export function '${functionName}' or default function`);
          }
        } catch (error) {
          console.error(`❌ Failed to import command ${file}:`, error.message);
        }
      }
      
      this.initialized = true;
      console.log(`🎯 Command registry initialized with ${this.commands.size} commands`);
      
    } catch (error) {
      console.error(`❌ Failed to scan commands directory: ${error.message}`);
    }
  }

  /**
   * Initialize command registry with dependencies
   */
  async initialize(dependencies = {}) {
    this.dependencies = dependencies;
    await this.autoImportCommands();
    return this;
  }

  /**
   * Get dependencies for command execution
   */
  getDependencies() {
    return this.dependencies || {};
  }
}

// Export singleton instance
export const commandRegistry = new CommandRegistry();