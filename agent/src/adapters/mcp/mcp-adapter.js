/**
 * MCP Auto-Bootstrap Adapter - Pure protocol translation using Universal Command Registry
 * Implements auto-bootstrap architecture pattern per _02-adapters.md specification
 */

import { commandRegistry } from '../../core/command-registry.js';

export class MCPAdapter {
  constructor() {
    this.commandRegistry = commandRegistry;
    this.mcpTools = [];
  }

  /**
   * Initialize auto-bootstrap: discover commands and generate MCP tools
   */
  async initialize(dependencies = {}) {
    // Initialize command registry with dependencies
    await this.commandRegistry.initialize(dependencies);
    
    // Auto-discover all registered commands (core + plugins)
    const commands = await this.commandRegistry.getAllCommands();
    
    // Auto-generate MCP tools from CLI commands
    this.mcpTools = commands.map(cmd => ({
      name: this.formatMCPToolName(cmd.name),
      description: cmd.description,
      inputSchema: this.generateMCPSchema(cmd.args)
    }));
    
    console.log(`Auto-bootstrapped ${this.mcpTools.length} MCP tools from command registry`);
  }

  /**
   * Get all auto-generated MCP tools
   */
  getMCPTools() {
    return this.mcpTools;
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
   * Handle MCP tool call by routing back through command registry
   */
  async handleToolCall(toolName, args, dependencies = {}) {
    // Route MCP tool calls back through command registry
    const commandName = toolName.replace('_', ':');
    
    // Try with colon replacement first, then fallback to underscore version
    try {
      return await this.commandRegistry.execute(commandName, args, dependencies);
    } catch (error) {
      if (error.message.includes('Command not found')) {
        // Try with underscore as original name
        return await this.commandRegistry.execute(toolName, args, dependencies);
      }
      throw error;
    }
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
        if (arg.enum) props[arg.name].enum = arg.enum;
        if (arg.default !== undefined) props[arg.name].default = arg.default;
        return props;
      }, {}) || {},
      required: commandArgs?.filter(arg => arg.required).map(arg => arg.name) || []
    };
  }
}