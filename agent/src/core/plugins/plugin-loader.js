/**
 * Plugin Loader - Optional plugin loading system
 * Allows core system to load optional plugins without hard dependencies
 */

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class PluginLoader {
  constructor() {
    this.loadedPlugins = new Map()
    this.pluginPath = path.resolve(__dirname, '../../../../plugins/@lev-os')
  }

  /**
   * Attempt to load a plugin by name
   * @param {string} pluginName - Name of the plugin (e.g., 'constitutional-ai')
   * @returns {Object|null} Loaded plugin or null if not available
   */
  async loadPlugin(pluginName) {
    if (this.loadedPlugins.has(pluginName)) {
      return this.loadedPlugins.get(pluginName)
    }

    try {
      const pluginPath = path.join(this.pluginPath, pluginName, 'src/index.js')
      const pluginModule = await import(pluginPath)

      console.log(`✅ Loaded optional plugin: @lev-os/${pluginName}`)
      this.loadedPlugins.set(pluginName, pluginModule)

      return pluginModule
    } catch (error) {
      // Plugin not available - that's OK, they're optional
      console.log(`ℹ️  Optional plugin @lev-os/${pluginName} not available`)
      return null
    }
  }

  /**
   * Load multiple plugins
   * @param {string[]} pluginNames - Array of plugin names
   * @returns {Map<string, Object>} Map of loaded plugins
   */
  async loadPlugins(pluginNames) {
    const loaded = new Map()

    for (const name of pluginNames) {
      const plugin = await this.loadPlugin(name)
      if (plugin) {
        loaded.set(name, plugin)
      }
    }

    return loaded
  }

  /**
   * Initialize plugins with core systems
   * @param {Object} coreSystems - Core system instances to enhance
   */
  async initializePlugins(coreSystems) {
    // Try to load constitutional AI plugin
    const constitutionalPlugin = await this.loadPlugin('constitutional-ai')

    if (constitutionalPlugin && constitutionalPlugin.plugin?.createValidator) {
      // If available, register with universal context system
      if (coreSystems.universalContextSystem?.setConstitutionalValidator) {
        const validator = await constitutionalPlugin.plugin.createValidator()
        coreSystems.universalContextSystem.setConstitutionalValidator(validator)
      }
    }

    // Future: Load other optional plugins here
    // const eepsPlugin = await this.loadPlugin('eeps-personality');
    // const bidirectionalPlugin = await this.loadPlugin('bidirectional-flow');

    return this.loadedPlugins
  }
}
