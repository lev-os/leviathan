// Plugin Loader - YAML-based plugin architecture for Kingly core
// Every plugin is a YAML file that defines capabilities, commands, and workflows

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

export class PluginLoader {
  constructor() {
    this.pluginPath = process.env.PLUGINS_PATH || path.resolve('kingly/contexts/plugins');
    this.plugins = new Map();
    this.loaded = false;
  }

  async ensureLoaded() {
    if (!this.loaded) {
      await this.loadAllPlugins();
    }
  }

  async loadAllPlugins() {
    console.error('Loading core plugins...');
    
    if (!await fs.pathExists(this.pluginPath)) {
      console.error(`Plugin path does not exist: ${this.pluginPath}`);
      return;
    }

    const pluginFiles = await glob('*.yaml', {
      cwd: this.pluginPath,
      absolute: true
    });

    let totalLoaded = 0;
    for (const filePath of pluginFiles) {
      try {
        const plugin = await this.loadPlugin(filePath);
        if (plugin && plugin.plugin?.name) {
          this.plugins.set(plugin.plugin.name, plugin);
          totalLoaded++;
          console.error(`✅ Loaded plugin: ${plugin.plugin.name} v${plugin.plugin.version}`);
        }
      } catch (error) {
        console.error(`❌ Error loading plugin ${filePath}:`, error.message);
      }
    }

    this.loaded = true;
    console.error(`📦 ${totalLoaded} plugins loaded successfully`);
  }  async loadPlugin(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const plugin = yaml.load(content);
    
    // Validate plugin structure
    if (!plugin.plugin?.name) {
      throw new Error('Plugin must have plugin.name field');
    }
    
    if (!plugin.plugin?.type) {
      throw new Error('Plugin must have plugin.type field');
    }
    
    // Add metadata
    plugin._metadata = {
      filePath,
      loadedAt: new Date().toISOString(),
      fileName: path.basename(filePath, '.yaml')
    };
    
    return plugin;
  }

  // Get all loaded plugins
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  // Get plugin by name
  getPlugin(name) {
    return this.plugins.get(name);
  }

  // Get all commands from all plugins
  getPluginCommands() {
    const commands = {};
    
    for (const plugin of this.plugins.values()) {
      if (plugin.commands) {
        Object.entries(plugin.commands).forEach(([commandName, commandDef]) => {
          // Prefix plugin commands to avoid conflicts
          const fullCommandName = `${plugin.plugin.name}_${commandName}`;
          commands[fullCommandName] = {
            ...commandDef,
            _plugin: plugin.plugin.name,
            _pluginVersion: plugin.plugin.version
          };
        });
      }
    }
    
    return commands;
  }

  // Get all workflows from all plugins
  getPluginWorkflows() {
    const workflows = {};
    
    for (const plugin of this.plugins.values()) {
      if (plugin.workflows) {
        Object.entries(plugin.workflows).forEach(([workflowName, workflowDef]) => {
          workflows[workflowName] = {
            ...workflowDef,
            _plugin: plugin.plugin.name,
            _pluginVersion: plugin.plugin.version
          };
        });
      }
    }
    
    return workflows;
  }

  // Check if plugin has specific capability
  pluginHasCapability(pluginName, capability) {
    const plugin = this.getPlugin(pluginName);
    return plugin?.capabilities?.includes(capability) || false;
  }
}

export const pluginLoader = new PluginLoader();