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
    this.detector = null; // Will be initialized after config loading
    this.config = null;
    this.configSources = [];
  }

  /**
   * Load configuration using hierarchy following ~/.leviathan fractal architecture:
   * 1. Default fallback values
   * 2. Component defaults (plugin.yaml backend section)
   * 3. Profile config (~/.leviathan/profiles/{profile}.yaml)
   * 4. Global user config (~/.leviathan/config.yaml)
   * 5. Instance config (~/.leviathan/instances/{instance}/plugins/memory.yaml)
   * 6. Environment variables (highest priority)
   * 7. Auto-detection results (inform but don't override)
   */
  async loadConfig() {
    this.configSources = [];
    let config = {};

    // 1. Start with defaults
    config = this.getDefaultConfig();
    this.configSources.push('defaults');

    // 2. Component defaults (plugin.yaml backend section)
    const projectConfig = await this.loadProjectConfig();
    if (projectConfig) {
      config = this.mergeConfigs(config, projectConfig);
      this.configSources.push('component-defaults');
    }

    // 3. Profile config (~/.leviathan/profiles/{profile}.yaml)
    const profileConfig = await this.loadProfileConfig();
    if (profileConfig) {
      config = this.mergeConfigs(config, profileConfig);
      this.configSources.push('profile-config');
    }

    // 4. Global user config (~/.leviathan/config.yaml)
    const globalConfig = await this.loadGlobalConfig();
    if (globalConfig) {
      config = this.mergeConfigs(config, globalConfig);
      this.configSources.push('global-config');
    }

    const instanceConfig = await this.loadInstanceConfig();
    if (instanceConfig) {
      config = this.mergeConfigs(config, instanceConfig);
      this.configSources.push('instance-config');
    }

    // 6. Environment variables (highest priority)
    const envConfig = this.loadEnvironmentConfig();
    if (Object.keys(envConfig).length > 0) {
      config = this.mergeConfigs(config, envConfig);
      this.configSources.push('environment');
    }

    // Resolve environment variable placeholders first
    config = this.resolveEnvironmentVariables(config);

    // 7. Initialize detector with resolved config and run auto-detection
    this.detector = new Neo4jDetector({
      neo4jHttpPort: config.neo4j?.ports?.http || 7474,
      neo4jBoltPort: config.neo4j?.ports?.bolt || 7687,
      neo4jUri: config.neo4j?.uri || 'bolt://localhost:7687'
    });
    
    const detection = await this.detector.detect();
    const autoConfig = this.detector.generateConfig();
    config = this.mergeAutoDetectionConfig(config, autoConfig);
    this.configSources.push('auto-detection');

    this.config = config;
    return config;
  }

  /**
   * Get default configuration with environment variable placeholders
   */
  getDefaultConfig() {
    return {
      deploymentMode: '${LEV_DEPLOYMENT_MODE:-auto}',
      neo4j: {
        uri: '${NEO4J_URI:-bolt://localhost:7687}',
        username: '${NEO4J_USER:-neo4j}',
        password: '${NEO4J_PASSWORD:-}',
        timeout: '${NEO4J_TIMEOUT:-30000}',
        ports: {
          http: '${NEO4J_HTTP_PORT:-7474}',
          bolt: '${NEO4J_BOLT_PORT:-7687}'
        }
      },
      graphiti: {
        grpcAddress: '${GRAPHITI_GRPC_ADDRESS:-localhost}',
        grpcPort: '${GRAPHITI_GRPC_PORT:-50051}',
        mode: '${GRAPHITI_MODE:-service}',
        timeout: '${GRAPHITI_TIMEOUT:-10000}',
        retries: '${GRAPHITI_RETRIES:-3}',
        enableMcp: '${GRAPHITI_ENABLE_MCP:-true}',
        enableTemporal: '${GRAPHITI_ENABLE_TEMPORAL:-true}'
      },
      paths: {
        sessionsPath: '${LEV_SESSIONS_PATH:-' + path.join(os.homedir(), '.kingly', 'sessions') + '}',
        contextsPath: '${LEV_CONTEXTS_PATH:-./contexts}',
        configPath: '${LEV_CONFIG_PATH:-' + path.join(os.homedir(), '.lev', 'memory-config.yaml') + '}'
      },
      features: {
        enableGraphiti: '${LEV_ENABLE_GRAPHITI:-true}',
        fallbackMode: '${LEV_FALLBACK_MODE:-false}',
        autoStart: '${LEV_AUTO_START:-true}',
        debugEnabled: '${LEV_DEBUG:-false}',
        performanceMonitoring: '${LEV_PERF_MONITOR:-true}'
      },
      memory: {
        cacheSize: '${LEV_CACHE_SIZE:-256MB}',
        queryTimeout: '${LEV_QUERY_TIMEOUT:-30s}',
        syncInterval: '${LEV_SYNC_INTERVAL:-on_demand}',
        backupStrategy: '${LEV_BACKUP_STRATEGY:-file_system_continuous}'
      },
      services: {
        autoDetection: '${LEV_AUTO_DETECTION:-true}',
        healthCheckInterval: '${LEV_HEALTH_CHECK_INTERVAL:-30}',
        startupTimeout: '${LEV_STARTUP_TIMEOUT:-60}'
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
   * Load profile configuration (~/.leviathan/profiles/{profile}.yaml)
   */
  async loadProfileConfig() {
    try {
      const profile = process.env.LEV_PROFILE || 'development';
      const configPath = path.join(os.homedir(), '.leviathan', 'profiles', `${profile}.yaml`);
      const content = await fs.readFile(configPath, 'utf8');
      const profileConfig = yaml.load(content);
      return profileConfig?.memory || null;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error loading profile config:', error.message);
      }
      return null;
    }
  }

  /**
   * Load global user configuration (~/.leviathan/config.yaml)
   */
  async loadGlobalConfig() {
    try {
      const configPath = path.join(os.homedir(), '.leviathan', 'config.yaml');
      const content = await fs.readFile(configPath, 'utf8');
      const globalConfig = yaml.load(content);
      return globalConfig?.memory || null;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error loading global config:', error.message);
      }
      return null;
    }
  }

  /**
   * Load instance configuration (~/.leviathan/instances/{instance}/plugins/memory.yaml)
   */
  async loadInstanceConfig() {
    try {
      const instance = process.env.LEV_INSTANCE || 'default';
      const configPath = path.join(os.homedir(), '.leviathan', 'instances', instance, 'plugins', 'memory.yaml');
      const content = await fs.readFile(configPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error loading instance config:', error.message);
      }
      return null;
    }
  }

  /**
   * Load legacy local configuration file (~/.lev/memory-config.yaml) 
   * @deprecated Use instance config instead
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

  /**
   * Resolve environment variable placeholders in configuration
   * Supports ${VAR:-default} syntax
   */
  resolveEnvironmentVariables(config) {
    const resolved = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && value.includes('${')) {
        resolved[key] = this.resolveEnvString(value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        resolved[key] = this.resolveEnvironmentVariables(value);
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }

  /**
   * Resolve individual environment variable string
   */
  resolveEnvString(str) {
    return str.replace(/\$\{([^}]+)\}/g, (match, varExpr) => {
      const [varName, defaultValue = ''] = varExpr.split(':-');
      const envValue = process.env[varName];
      
      if (envValue !== undefined) {
        // Convert boolean strings to actual booleans
        if (envValue === 'true') return true;
        if (envValue === 'false') return false;
        // Convert numeric strings to numbers
        if (/^\d+$/.test(envValue)) return parseInt(envValue, 10);
        return envValue;
      }
      
      // Handle default value conversions
      if (defaultValue === 'true') return true;
      if (defaultValue === 'false') return false;
      if (/^\d+$/.test(defaultValue)) return parseInt(defaultValue, 10);
      return defaultValue;
    });
  }

  /**
   * Merge auto-detection config without overriding user settings
   * Auto-detection informs but doesn't override explicit user configuration
   */
  mergeAutoDetectionConfig(userConfig, autoConfig) {
    const merged = { ...userConfig };
    
    // Only apply auto-detection if user hasn't explicitly configured
    if (!userConfig.neo4j?.uri || userConfig.neo4j.uri.includes('${')) {
      merged.neo4j = { ...merged.neo4j, ...autoConfig.neo4j };
    }
    
    if (!userConfig.deploymentMode || userConfig.deploymentMode === 'auto') {
      merged.deploymentMode = autoConfig.deploymentMode;
    }
    
    // Store detection results for debugging
    merged._autoDetection = autoConfig.detectionResults;
    
    return merged;
  }
}