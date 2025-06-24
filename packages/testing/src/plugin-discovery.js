/**
 * Plugin Discovery System
 * 
 * Discovers testable plugins via YAML manifests and repository scanning.
 * Supports both core packages and community plugins.
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import { logger } from './simple-logger.js';

export class PluginDiscovery {
  constructor() {
    this.pluginCache = new Map();
    this.corePackagesPath = '/Users/jean-patricksmith/digital/kingly/core/packages';
    this.communityPluginsPath = '/Users/jean-patricksmith/digital/kingly/community';
  }

  /**
   * Discover all testable plugins in the ecosystem
   */
  async discoverPlugins(options = {}) {
    logger.info('Starting plugin discovery', { options });
    
    const plugins = [];
    
    // Discover core plugins
    if (!options.type || options.type === 'core') {
      const corePlugins = await this.discoverCorePlugins();
      plugins.push(...corePlugins);
    }
    
    // Discover community plugins
    if (!options.type || options.type === 'community') {
      const communityPlugins = await this.discoverCommunityPlugins();
      plugins.push(...communityPlugins);
    }
    
    // Filter by path if specified
    if (options.path) {
      return plugins.filter(plugin => 
        plugin.path && plugin.path.includes(options.path)
      );
    }
    
    // Cache discovered plugins
    plugins.forEach(plugin => {
      this.pluginCache.set(plugin.name, plugin);
    });
    
    logger.info(`Discovered ${plugins.length} plugins`, {
      core: plugins.filter(p => p.type === 'core_plugin').length,
      community: plugins.filter(p => p.type === 'community_plugin').length
    });
    
    return plugins;
  }

  /**
   * Get specific plugin by name
   */
  async getPlugin(pluginName) {
    if (this.pluginCache.has(pluginName)) {
      return this.pluginCache.get(pluginName);
    }
    
    // Rediscover if not in cache
    const plugins = await this.discoverPlugins();
    return plugins.find(plugin => plugin.name === pluginName);
  }

  /**
   * Discover core plugins via package structure scanning
   */
  async discoverCorePlugins() {
    logger.debug('Discovering core plugins');
    
    try {
      const plugins = [];
      
      // Look for plugin.yaml files in core packages
      const yamlFiles = await glob('**/config/plugin.yaml', {
        cwd: this.corePackagesPath,
        absolute: true
      });
      
      for (const yamlFile of yamlFiles) {
        try {
          const plugin = await this.loadPluginFromYaml(yamlFile);
          if (plugin) {
            plugin.type = 'core_plugin';
            plugin.path = path.dirname(path.dirname(yamlFile)); // Remove /config/plugin.yaml
            plugins.push(plugin);
          }
        } catch (error) {
          logger.warn(`Failed to load plugin from ${yamlFile}`, { error: error.message });
        }
      }
      
      // Also check for @lev scoped packages
      const levPackages = await glob('@lev/*/config/plugin.yaml', {
        cwd: this.corePackagesPath,
        absolute: true
      });
      
      for (const yamlFile of levPackages) {
        try {
          const plugin = await this.loadPluginFromYaml(yamlFile);
          if (plugin) {
            plugin.type = 'core_plugin';
            plugin.path = path.dirname(path.dirname(yamlFile));
            plugins.push(plugin);
          }
        } catch (error) {
          logger.warn(`Failed to load @lev plugin from ${yamlFile}`, { error: error.message });
        }
      }
      
      logger.debug(`Discovered ${plugins.length} core plugins`);
      return plugins;
    } catch (error) {
      logger.error('Core plugin discovery failed', { error: error.message });
      return [];
    }
  }

  /**
   * Discover community plugins via repository scanning
   */
  async discoverCommunityPlugins() {
    logger.debug('Discovering community plugins');
    
    try {
      const plugins = [];
      
      // Check if community plugins directory exists
      try {
        await fs.access(this.communityPluginsPath);
        
        // Look for plugin.yaml files in community directory
        const yamlFiles = await glob('**/plugin.yaml', {
          cwd: this.communityPluginsPath,
          absolute: true
        });
        
        for (const yamlFile of yamlFiles) {
          try {
            const plugin = await this.loadPluginFromYaml(yamlFile);
            if (plugin) {
              plugin.type = 'community_plugin';
              plugin.path = path.dirname(yamlFile);
              plugins.push(plugin);
            }
          } catch (error) {
            logger.warn(`Failed to load community plugin from ${yamlFile}`, { error: error.message });
          }
        }
      } catch (error) {
        logger.debug('Community plugins directory not found, skipping community discovery');
      }
      
      logger.debug(`Discovered ${plugins.length} community plugins`);
      return plugins;
    } catch (error) {
      logger.error('Community plugin discovery failed', { error: error.message });
      return [];
    }
  }

  /**
   * Load plugin configuration from YAML file
   */
  async loadPluginFromYaml(yamlPath) {
    try {
      const yamlContent = await fs.readFile(yamlPath, 'utf8');
      const config = yaml.load(yamlContent);
      
      if (!config.plugin) {
        logger.warn(`Invalid plugin YAML: missing plugin section in ${yamlPath}`);
        return null;
      }
      
      return {
        name: config.plugin.name,
        version: config.plugin.version,
        description: config.plugin.description,
        type: config.plugin.type,
        config: config,
        yamlPath: yamlPath,
        capabilities: config.capabilities || [],
        commands: config.commands || {},
        workflows: config.workflows || {},
        testable: this.isPluginTestable(config)
      };
    } catch (error) {
      logger.error(`Failed to load plugin YAML from ${yamlPath}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Determine if plugin is testable
   */
  isPluginTestable(config) {
    // Plugin is testable if it has commands or capabilities
    const hasCommands = config.commands && Object.keys(config.commands).length > 0;
    const hasCapabilities = config.capabilities && config.capabilities.length > 0;
    
    return hasCommands || hasCapabilities;
  }

  /**
   * Build plugin dependency graph
   */
  async buildDependencyGraph(plugins) {
    logger.debug('Building plugin dependency graph');
    
    const graph = new Map();
    
    for (const plugin of plugins) {
      graph.set(plugin.name, {
        plugin,
        dependencies: [],
        dependents: []
      });
    }
    
    // Analyze dependencies (simplified - could be enhanced with actual dependency parsing)
    for (const plugin of plugins) {
      const node = graph.get(plugin.name);
      
      // Check for @lev/* imports in package.json or source files
      if (plugin.type === 'core_plugin') {
        try {
          const packageJsonPath = path.join(plugin.path, 'package.json');
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
          
          const dependencies = Object.keys(packageJson.dependencies || {})
            .filter(dep => dep.startsWith('@lev/'))
            .map(dep => dep.replace('@lev/', ''));
          
          for (const dep of dependencies) {
            if (graph.has(dep)) {
              node.dependencies.push(dep);
              graph.get(dep).dependents.push(plugin.name);
            }
          }
        } catch (error) {
          logger.debug(`Could not analyze dependencies for ${plugin.name}`, { error: error.message });
        }
      }
    }
    
    return graph;
  }

  /**
   * Get optimal test execution order based on dependencies
   */
  async getTestExecutionOrder(plugins) {
    const graph = await this.buildDependencyGraph(plugins);
    const order = [];
    const visited = new Set();
    
    // Topological sort for dependency-aware testing
    const visit = (pluginName) => {
      if (visited.has(pluginName)) return;
      
      const node = graph.get(pluginName);
      if (!node) return;
      
      // Visit dependencies first
      for (const dep of node.dependencies) {
        visit(dep);
      }
      
      visited.add(pluginName);
      order.push(node.plugin);
    };
    
    // Visit all plugins
    for (const plugin of plugins) {
      visit(plugin.name);
    }
    
    logger.debug(`Determined test execution order for ${order.length} plugins`);
    return order;
  }
}

export default PluginDiscovery;