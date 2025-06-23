/**
 * Dynamic Tool Registry
 * Auto-discovers and loads all MCP tools
 * Supports hot reloading without breaking connections
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.handlers = new Map();
    this.toolsDir = path.join(__dirname, 'tools');
    this.lastScan = 0;
  }

  /**
   * Scan and load all tools from tools/ directory
   * Each tool file exports: { tools: [...], handlers: {...} }
   */
  async scanTools() {
    if (!await fs.pathExists(this.toolsDir)) {
      console.log('📁 Creating tools directory...');
      await fs.ensureDir(this.toolsDir);
      return;
    }

    const files = await fs.readdir(this.toolsDir);
    const toolFiles = files.filter(f => f.endsWith('.js') && !f.startsWith('_'));

    console.log(`🔍 Scanning ${toolFiles.length} tool files...`);

    for (const file of toolFiles) {
      try {
        await this.loadToolFile(file);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error.message);
      }
    }

    this.lastScan = Date.now();
    console.log(`✅ Loaded ${this.tools.size} tools from ${toolFiles.length} files`);
  }  /**
   * Load a single tool file with cache busting for hot reload
   */
  async loadToolFile(filename) {
    const filepath = path.join(this.toolsDir, filename);
    const toolName = path.basename(filename, '.js');

    // Clear module cache for hot reload (ES modules don't use require.cache)
    const moduleUrl = `file://${filepath}`;

    // Import with cache bust
    const cacheBust = `?t=${Date.now()}`;
    const module = await import(`${moduleUrl}${cacheBust}`);

    if (!module.tools || !module.handlers) {
      throw new Error(`Tool file ${filename} must export { tools, handlers }`);
    }

    // Register tools
    for (const tool of module.tools) {
      this.tools.set(tool.name, {
        ...tool,
        source: toolName
      });
    }

    // Register handlers
    this.handlers.set(toolName, module.handlers);

    console.log(`📦 Loaded ${module.tools.length} tools from ${toolName}`);
  }

  /**
   * Get all tool definitions for MCP
   */
  getToolDefinitions() {
    return Array.from(this.tools.values());
  }

  /**
   * Handle a tool call by finding the right handler
   */
  async handleToolCall(toolName, args) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const handlers = this.handlers.get(tool.source);
    if (!handlers || !handlers[toolName]) {
      throw new Error(`No handler for tool: ${toolName}`);
    }

    return await handlers[toolName](args);
  }  /**
   * Hot reload a specific tool file
   */
  async reloadTool(filename) {
    console.log(`🔄 Hot reloading tool: ${filename}`);
    
    // Remove old tools from this file
    const toolName = path.basename(filename, '.js');
    const oldTools = Array.from(this.tools.entries())
      .filter(([_, tool]) => tool.source === toolName)
      .map(([name]) => name);

    oldTools.forEach(name => this.tools.delete(name));
    this.handlers.delete(toolName);

    // Reload the file
    await this.loadToolFile(filename);
    
    return {
      reloaded: toolName,
      toolsRemoved: oldTools.length,
      toolsAdded: Array.from(this.tools.values())
        .filter(tool => tool.source === toolName).length
    };
  }

  /**
   * Get tools by category/tag
   */
  getToolsByCategory(category) {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category || tool.tags?.includes(category));
  }

  /**
   * Health check - verify all tools have handlers
   */
  async healthCheck() {
    const issues = [];
    
    for (const [toolName, tool] of this.tools) {
      const handlers = this.handlers.get(tool.source);
      if (!handlers || !handlers[toolName]) {
        issues.push(`Missing handler for ${toolName} from ${tool.source}`);
      }
    }

    return {
      healthy: issues.length === 0,
      toolCount: this.tools.size,
      handlerCount: this.handlers.size,
      issues
    };
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();