/**
 * ConfigurationManager - Manages plugin configuration
 * Loads from environment variables and config files
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigurationManager {
  constructor() {
    this.config = {};
  }

  /**
   * Load configuration from various sources
   */
  async load() {
    // Load from config file
    const configPath = join(__dirname, '../../config/jared_intelligence_config.json');
    try {
      const configFile = await readFile(configPath, 'utf8');
      this.config = JSON.parse(configFile);
    } catch (error) {
      console.warn('Config file not found, using defaults');
    }    
    // Override with environment variables
    this.config.slack = {
      botToken: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      workspaceId: process.env.SLACK_WORKSPACE_ID
    };
    
    this.config.notion = {
      token: process.env.NOTION_TOKEN
    };
    
    this.config.graphiti = {
      endpoint: process.env.GRAPHITI_ENDPOINT || 'http://localhost:8000'
    };
    
    return this.config;
  }

  /**
   * Get configuration value
   */
  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return undefined;
    }
    
    return value;
  }

  /**
   * Set configuration value
   */
  set(path, value) {
    const keys = path.split('.');
    let obj = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }
    
    obj[keys[keys.length - 1]] = value;
  }
}