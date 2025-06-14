/**
 * Dynamic Context Loader with Type Discovery
 * 
 * EXTRACTED FROM: mcp-mvp/src/workflow-loader.js  
 * UNIFIED FOR: Kingly Core Agent
 * 
 * Features:
 * - Dynamic type discovery from file system
 * - Slug-based identification (discord-tool vs weird codes like 1a, 2a)
 * - Rich YAML content extraction
 * - Supports FlowMind context loading
 */
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

export class WorkflowLoader {
  constructor() {
    // Updated to use unified contexts directory
    this.contextPath = process.env.CONTEXTS_PATH || path.resolve('./contexts');
    this.cache = new Map();
    this.quickCodes = new Map();
    this.loaded = false;
  }

  async ensureLoaded() {
    if (!this.loaded) {
      await this.loadAllWorkflows();
    }
  }

  async loadAllWorkflows() {
    console.error('Loading contexts from all types...');
    
    // Dynamic type discovery - no hardcoded categories
    const contextTypes = await this.discoverContextTypes();
    let totalLoaded = 0;

    for (const type of contextTypes) {
      const typePath = path.join(this.contextPath, type);
      if (!await fs.pathExists(typePath)) {
        continue;
      }

      const contextFiles = await glob('**/context.yaml', { 
        cwd: typePath,
        absolute: true 
      });

      for (const filePath of contextFiles) {
        try {
          const context = await this.loadWorkflow(filePath, type);
          if (context) {
            this.cache.set(context.id, context);
            this.quickCodes.set(context.slug, context);
            totalLoaded++;
          }
        } catch (error) {
          console.error(`Error loading ${filePath}:`, error.message);
        }
      }
    }

    console.error(`✅ Loaded ${totalLoaded} contexts from ${contextTypes.length} types`);
    this.loaded = true;
  }  // Dynamic type discovery - scans file system to find available context types
  async discoverContextTypes() {
    const contextsPath = this.contextPath;
    const entries = await fs.readdir(contextsPath, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  async loadWorkflow(filePath, category) {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(content);
    
    if (!data?.metadata) {
      return null;
    }

    const dirName = path.basename(path.dirname(filePath));
    const slug = this.generateSlug(category, dirName, data);
    
    return {
      id: data.metadata.id || dirName,
      slug,
      code: slug, // Keep for backward compatibility
      name: this.formatName(data.metadata.description || dirName),
      description: data.metadata.description || '',
      category,
      type: category,
      filePath,
      data,
      instructions: this.extractInstructions(data),
      triggers: this.extractTriggers(data),
    };
  }

  // Slug generation - clean, memorable names instead of weird codes
  generateSlug(category, dirName, yamlData) {
    return dirName; // Use directory name as slug
  }  formatName(text) {
    return text.replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  extractInstructions(data) {
    const instructions = [];
    
    // Extract workflow process instructions
    if (data.workflow_config?.process) {
      instructions.push(data.workflow_config.process);
    }
    if (data.pattern_config?.process) {
      instructions.push(Object.values(data.pattern_config.process).join('\\n'));
    }
    
    // Add tool capabilities and MCP tools
    if (data.tool_config?.capabilities) {
      instructions.push(`Capabilities: ${data.tool_config.capabilities.join(', ')}`);
    }
    if (data.tool_config?.mcp_tools) {
      const toolNames = data.tool_config.mcp_tools.map(t => t.name).join(', ');
      instructions.push(`MCP Tools: ${toolNames}`);
    }
    
    return instructions.length > 0 ? instructions.join('\\n') : 'Execute this context with current setup.';
  }

  extractTriggers(data) {
    const triggers = [];
    
    // Extract workflow triggers
    if (data.workflow_config?.triggers) {
      if (Array.isArray(data.workflow_config.triggers)) {
        triggers.push(...data.workflow_config.triggers);
      } else if (data.workflow_config.triggers.manual) {
        triggers.push(...data.workflow_config.triggers.manual);
      }
    }
    
    if (data.pattern_config?.use_cases) {
      triggers.push(...data.pattern_config.use_cases);
    }
    
    // Add tool-specific triggers
    if (data.tool_config?.capabilities) {
      triggers.push(...data.tool_config.capabilities);
    }
    
    return triggers.length > 0 ? triggers : ['General purpose context'];
  }  async getByCode(code) {
    await this.ensureLoaded();
    return this.quickCodes.get(code?.toLowerCase());
  }
  
  async getBySlug(slug) {
    await this.ensureLoaded();
    return this.quickCodes.get(slug?.toLowerCase());
  }

  async listByCategory(category) {
    await this.ensureLoaded();
    
    if (category === 'all') {
      return Array.from(this.cache.values());
    }
    
    return Array.from(this.cache.values())
      .filter(context => context.category === category);
  }
  
  async listByType(type) {
    await this.ensureLoaded();
    
    if (type === 'all') {
      return Array.from(this.cache.values());
    }
    
    return Array.from(this.cache.values())
      .filter(context => context.type === type);
  }

  async refreshCache() {
    this.cache.clear();
    this.quickCodes.clear();
    this.loaded = false;
    
    await this.loadAllWorkflows();
    
    const types = await this.discoverContextTypes();
    const typeCounts = {};
    types.forEach(type => {
      typeCounts[type] = this.countByCategory(type);
    });
    
    return {
      summary: `Refreshed cache with ${this.cache.size} contexts`,
      types: typeCounts,
      dynamic_discovery: true
    };
  }

  countByCategory(category) {
    return Array.from(this.cache.values())
      .filter(c => c.category === category).length;
  }
  
  async getAvailableTypes() {
    return await this.discoverContextTypes();
  }

  async loadAll() {
    await this.ensureLoaded();
    return Array.from(this.cache.values());
  }
}