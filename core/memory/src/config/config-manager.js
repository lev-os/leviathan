/**
 * Configuration Manager
 * Implements hierarchical configuration system with auto-detection
 */

import { Neo4jDetector } from './neo4j-detector.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

export class ConfigManager {
  constructor() {
    this.detector = new Neo4jDetector();
    this.config = null;
    this.configSources = [];
  }

  /**
   * Load configuration using hierarchy:
   * 1. Environment variables
   * 2. Local config file (~/.lev/memory-config.yaml)
   * 3. Project config (plugin.yaml backend section)
   * 4. Auto-detection results
   * 5. Default fallback
   */
  async loadConfig() {
    this.configSources = [];
    let config = {};

    // 1. Start with defaults
    config = this.getDefaultConfig();
    this.configSources.push('defaults');

    // 2. Auto-detection (run early to inform other configs)
    const detection = await this.detector.detect();
    const autoConfig = this.detector.generateConfig();
    config = this.mergeConfigs(config, autoConfig);
    this.configSources.push('auto-detection');

    // 3. Project config
    const projectConfig = await this.loadProjectConfig();
    if (projectConfig) {
      config = this.mergeConfigs(config, projectConfig);
      this.configSources.push('project-config');
    }

    // 4. Local config file    // 4. Local config file
    const localConfig = await this.loadLocalConfig();
    if (localConfig) {
      config = this.mergeConfigs(config, localConfig);
      this.configSources.push('local-config');
    }

    // 5. Environment variables (highest priority)
    const envConfig = this.loadEnvironmentConfig();
    if (Object.keys(envConfig).length > 0) {
      config = this.mergeConfigs(config, envConfig);
      this.configSources.push('environment');
    }

    this.config = config;
    return config;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      deploymentMode: 'auto',
      neo4j: {
        uri: 'bolt://localhost:7687',
        username: 'neo4j',
        password: null,
        timeout: 30000
      },
      graphiti: {
        grpcAddress: 'localhost:50051',
        mode: 'service',
        timeout: 10000,
        retries: 3
      },
      paths: {
        sessionsPath: path.join(os.homedir(), '.kingly', 'sessions'),
        contextsPath: './contexts',
        configPath: path.join(os.homedir(), '.lev', 'memory-config.yaml')
      },
      features: {
        enableGraphiti: true,
        fallbackMode: false,
        autoStart: true
      }
    };
  }

  /**
   * Load configuration from environment variables
   */
  loadEnvironmentConfig() {
    const env = process.env;
    const config = {};

    // Neo4j configuration
    if (env.LEV_NEO4J_URI) config.neo4j = { uri: env.LEV_NEO4J_URI };
    if (env.LEV_NEO4J_USER) config.neo4j = { ...config.neo4j, username: env.LEV_NEO4J_USER };
    if (env.LEV_NEO4J_PASSWORD) config.neo4j = { ...config.neo4j, password: env.LEV_NEO4J_PASSWORD };
    
    // Graphiti configuration
    if (env.LEV_GRPC_ADDRESS) config.graphiti = { grpcAddress: env.LEV_GRPC_ADDRESS };
    
    // Deployment mode
    if (env.LEV_DEPLOYMENT_MODE) config.deploymentMode = env.LEV_DEPLOYMENT_MODE;
    
    // Feature flags
    if (env.LEV_ENABLE_GRAPHITI !== undefined) {
      config.features = { enableGraphiti: env.LEV_ENABLE_GRAPHITI === 'true' };
    }
    if (env.LEV_FALLBACK_MODE !== undefined) {
      config.features = { ...config.features, fallbackMode: env.LEV_FALLBACK_MODE === 'true' };
    }

    return config;
  }  /**
   * Load local configuration file (~/.lev/memory-config.yaml)
   */
  async loadLocalConfig() {
    try {
      const configPath = path.join(os.homedir(), '.lev', 'memory-config.yaml');
      const content = await fs.readFile(configPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error loading local config:', error.message);
      }
      return null;
    }
  }

  /**
   * Load project configuration (plugin.yaml backend section)
   */
  async loadProjectConfig() {
    try {
      const pluginPath = path.join(process.cwd(), 'plugin.yaml');
      const content = await fs.readFile(pluginPath, 'utf8');
      const pluginConfig = yaml.load(content);
      
      if (pluginConfig?.backend) {
        return {
          neo4j: pluginConfig.backend.graphiti,
          features: {
            enableGraphiti: pluginConfig.backend.graphiti?.enable_mcp !== false,
            fallbackMode: pluginConfig.backend.file_system?.fallback_mode || false
          }
        };
      }
      return null;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error loading project config:', error.message);
      }
      return null;
    }
  }

  /**
   * Merge configurations with deep merge
   */
  mergeConfigs(base, override) {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = this.mergeConfigs(merged[key] || {}, value);
      } else if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * Save configuration to local config file
   */
  async saveLocalConfig(config) {
    try {
      const configDir = path.dirname(config.paths.configPath);
      await fs.mkdir(configDir, { recursive: true });
      
      const yamlContent = yaml.dump(config, { 
        defaultStyle: null,
        lineWidth: 120 
      });
      
      await fs.writeFile(config.paths.configPath, yamlContent, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving config:', error.message);
      return false;
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];
    
    if (!config.neo4j?.uri) {
      errors.push('Neo4j URI is required');
    }
    
    if (!config.neo4j?.username) {
      errors.push('Neo4j username is required');
    }
    
    if (config.features?.enableGraphiti && !config.graphiti?.grpcAddress) {
      errors.push('Graphiti gRPC address is required when Graphiti is enabled');
    }
    
    if (!['auto', 'desktop', 'docker', 'external', 'manual'].includes(config.deploymentMode)) {
      errors.push('Invalid deployment mode');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }  /**
   * Get configuration summary for debugging
   */
  getConfigSummary() {
    if (!this.config) {
      return 'Configuration not loaded';
    }

    let summary = '⚙️ Configuration Summary:\n\n';
    summary += `📁 Sources: ${this.configSources.join(' → ')}\n`;
    summary += `🚀 Mode: ${this.config.deploymentMode}\n`;
    summary += `🔗 Neo4j: ${this.config.neo4j.uri}\n`;
    summary += `⚡ Graphiti: ${this.config.features.enableGraphiti ? this.config.graphiti.grpcAddress : 'Disabled'}\n`;
    summary += `💾 Fallback: ${this.config.features.fallbackMode ? 'Enabled' : 'Disabled'}\n`;
    
    if (this.detector.detectionResults) {
      summary += '\n' + this.detector.getSummary();
    }
    
    return summary;
  }

  /**
   * Export configuration for debugging
   */
  exportConfig() {
    return {
      config: this.config,
      sources: this.configSources,
      detection: this.detector.detectionResults,
      validation: this.config ? this.validateConfig(this.config) : null
    };
  }

  /**
   * Quick setup helper - detects and configures automatically
   */
  async quickSetup() {
    console.log('🔍 Running Neo4j detection...');
    await this.loadConfig();
    
    const validation = this.validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
    }
    
    console.log(this.getConfigSummary());
    
    // Save configuration if it's auto-detected
    if (this.configSources.includes('auto-detection')) {
      const saved = await this.saveLocalConfig(this.config);
      if (saved) {
        console.log(`✅ Configuration saved to ${this.config.paths.configPath}`);
      }
    }
    
    return this.config;
  }
}