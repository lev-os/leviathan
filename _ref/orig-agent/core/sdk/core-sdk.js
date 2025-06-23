/**
 * Core SDK - Universal Context Engine
 * Plugin-based architecture for any organizational flavor
 */

export class CoreSDK {
  constructor() {
    this.plugins = new Map();
    this.contextTypes = new Set();
  }

  /**
   * Register a plugin with the SDK
   * @param {Object} plugin - Plugin object with name and contextTypes
   */
  registerPlugin(plugin) {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin with name "${plugin.name}" already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
    
    // Track context types from this plugin
    if (plugin.contextTypes && Array.isArray(plugin.contextTypes)) {
      plugin.contextTypes.forEach(type => {
        this.contextTypes.add(type);
      });
    }
  }

  /**
   * Get a specific plugin by name
   * @param {string} name - Plugin name
   * @returns {Object|undefined} Plugin object
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Get all available context types from registered plugins
   * @returns {Array<string>} Array of context type names
   */
  getContextTypes() {
    return Array.from(this.contextTypes);
  }

  /**
   * List all registered plugins
   * @returns {Array<Object>} Array of plugin objects
   */
  listPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Create a context using registered plugins
   * @param {string} type - Context type to create
   * @param {Object} config - Configuration for the context
   * @returns {Promise<Object>} Created context object
   */
  async createContext(type, config) {
    // Find plugin that handles this context type
    const plugin = this.findPluginForContextType(type);
    
    if (!plugin) {
      throw new Error(`No plugin found for context type "${type}"`);
    }
    
    if (!plugin.createContext || typeof plugin.createContext !== 'function') {
      throw new Error(`Plugin "${plugin.name}" does not implement createContext method`);
    }
    
    // Delegate to plugin
    return await plugin.createContext(type, config);
  }

  /**
   * Find the plugin that handles a specific context type
   * @param {string} type - Context type to find plugin for
   * @returns {Object|null} Plugin that handles this type
   */
  findPluginForContextType(type) {
    for (const plugin of this.plugins.values()) {
      if (plugin.contextTypes && plugin.contextTypes.includes(type)) {
        return plugin;
      }
    }
    return null;
  }
}