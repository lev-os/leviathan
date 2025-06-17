/**
 * Command Registry - Auto-discovery and registration of isolated commands
 * Supports both direct function calls and MCP tool generation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.mcpTools = new Map();
    this.dependencies = null;
  }

  // Initialize with service dependencies
  async initialize(dependencies) {
    this.dependencies = dependencies;
    await this.discoverCommands();
  }

  // Auto-discover all command files
  async discoverCommands() {
    const commandsDir = path.join(__dirname, '..', 'commands');
    
    try {
      console.log(`🔍 Looking for commands in: ${commandsDir}`);
      const files = await fs.readdir(commandsDir);
      const commandFiles = files.filter(file => file.endsWith('.js'));
      console.log(`📁 Found command files: ${commandFiles.join(', ')}`);

      for (const file of commandFiles) {
        await this.loadCommand(file);
      }

      console.log(`✅ Discovered ${this.commands.size} commands`);
    } catch (error) {
      console.error(`Failed to discover commands: ${error.message}`);
      console.error(`Attempted path: ${commandsDir}`);
    }
  }

  // Load individual command file
  async loadCommand(filename) {
    try {
      const modulePath = path.join(__dirname, '..', 'commands', filename);
      console.log(`📦 Loading command from: ${modulePath}`);
      const module = await import(modulePath);
      
      // Extract command name from filename
      const commandName = path.basename(filename, '.js').replace('-', '_');
      console.log(`🏷️  Command name: ${commandName}`);
      
      // Look for exported command function
      const camelCaseName = this.camelCase(commandName);
      const kebabCaseName = commandName.replace(/_/g, '-');
      const camelFromKebab = this.camelCase(kebabCaseName);
      
      console.log(`🔍 Looking for function: ${camelCaseName}, ${camelFromKebab}, or default`);
      console.log(`📋 Available exports:`, Object.keys(module));
      
      const commandFunction = module[camelCaseName] || module[camelFromKebab] || module.default;
      
      if (typeof commandFunction === 'function') {
        console.log(`✅ Found command function: ${camelCaseName}`);
        
        // Register the direct function
        this.commands.set(commandName, {
          name: commandName,
          function: commandFunction,
          description: commandFunction.description,
          inputSchema: commandFunction.inputSchema,
          module: module
        });

        // Auto-generate MCP tool if tool definition exists
        const toolName = camelFromKebab + 'Tool';
        console.log(`🔧 Looking for MCP tool: ${toolName}`);
        if (module[toolName]) {
          console.log(`✅ Found MCP tool: ${toolName}`);
          this.mcpTools.set(commandName, module[toolName]);
        }
      } else {
        console.log(`❌ No command function found for ${commandName}`);
      }
    } catch (error) {
      console.error(`Failed to load command ${filename}: ${error.message}`);
    }
  }

  // Execute command by name with dependencies
  async executeCommand(commandName, args) {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    try {
      return await command.function(args, this.dependencies);
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  // Get all MCP tools for server registration
  getMCPTools() {
    return Array.from(this.mcpTools.values());
  }

  // Get command metadata
  getCommandInfo(commandName) {
    return this.commands.get(commandName);
  }

  // List all available commands
  listCommands() {
    return Array.from(this.commands.keys());
  }

  // Helper to convert kebab-case to camelCase
  camelCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();