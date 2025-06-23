/**
 * Hot Reload Manager - Enables live code updates for MCP server
 * Watches for file changes and gracefully reloads without dropping connections
 */

import { watch } from 'fs';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class HotReloadManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      watchPaths: options.watchPaths || [
        path.join(__dirname),
        path.join(__dirname, '..', 'agents'),
        path.join(__dirname, '..', 'workflows')
      ],
      debounceMs: options.debounceMs || 500,
      excludePatterns: options.excludePatterns || [
        /node_modules/,
        /\.git/,
        /\.kingly/,
        /test-/
      ]
    };
    
    this.watchers = new Map();
    this.reloadTimer = null;
    this.moduleCache = new Map();
  }
  
  start() {
    console.log('🔥 Hot Reload Manager starting...');
    
    for (const watchPath of this.config.watchPaths) {
      this.watchDirectory(watchPath);
    }
    
    console.log('✅ Watching for changes in:', this.config.watchPaths);
  }
  
  watchDirectory(dirPath) {
    try {
      const watcher = watch(dirPath, { 
        recursive: true,
        persistent: true
      }, (eventType, filename) => {
        if (!filename) return;
        
        // Check exclude patterns
        const fullPath = path.join(dirPath, filename);
        if (this.shouldExclude(fullPath)) return;
        
        // Only watch JS and YAML files
        if (!filename.endsWith('.js') && !filename.endsWith('.yaml') && !filename.endsWith('.yml')) {
          return;
        }
        
        console.log(`📝 Change detected: ${filename} (${eventType})`);
        this.scheduleReload(fullPath, eventType);
      });
      
      // Also handle errors
      watcher.on('error', (error) => {
        console.error('Watch error:', error);
      });
      
      this.watchers.set(dirPath, watcher);
      console.log(`👁️  Watching directory: ${dirPath}`);
    } catch (error) {
      console.error(`Failed to watch ${dirPath}:`, error);
    }
  }
  
  shouldExclude(filePath) {
    return this.config.excludePatterns.some(pattern => pattern.test(filePath));
  }
  
  scheduleReload(filePath, eventType) {
    // Clear existing timer
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    
    // Debounce reloads
    this.reloadTimer = setTimeout(() => {
      this.performReload(filePath, eventType);
    }, this.config.debounceMs);
  }
  
  async performReload(filePath, eventType) {
    try {
      console.log('🔄 Performing hot reload...');
      
      // Determine what changed
      const ext = path.extname(filePath);
      
      if (ext === '.yaml' || ext === '.yml') {
        // Agent definition changed
        this.emit('agent-changed', filePath);
      } else if (ext === '.js') {
        // JavaScript module changed
        await this.reloadModule(filePath);
        this.emit('module-changed', filePath);
      }
      
      // Emit general reload event
      this.emit('reload', {
        filePath,
        eventType,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Hot reload complete!');
      
    } catch (error) {
      console.error('❌ Hot reload error:', error);
      this.emit('reload-error', error);
    }
  }
  
  async reloadModule(modulePath) {
    // Clear module from Node's require cache
    const resolvedPath = require.resolve(modulePath);
    delete require.cache[resolvedPath];
    
    // For ES modules, we need a cache-busting query param
    const bustCache = `?t=${Date.now()}`;
    const moduleUrl = `file://${modulePath}${bustCache}`;
    
    try {
      // Re-import the module
      const newModule = await import(moduleUrl);
      this.moduleCache.set(modulePath, newModule);
      
      console.log(`♻️  Module reloaded: ${path.basename(modulePath)}`);
      return newModule;
      
    } catch (error) {
      console.error(`Failed to reload module ${modulePath}:`, error);
      throw error;
    }
  }
  
  stop() {
    console.log('🛑 Stopping hot reload manager...');
    
    // Clear timer
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    
    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      watcher.close();
    }
    
    this.watchers.clear();
    this.removeAllListeners();
  }
  
  // Get current module from cache or load fresh
  async getModule(modulePath) {
    if (this.moduleCache.has(modulePath)) {
      return this.moduleCache.get(modulePath);
    }
    
    const module = await import(modulePath);
    this.moduleCache.set(modulePath, module);
    return module;
  }
}

// Plugin for MCP server integration
export const hotReloadPlugin = {
  id: 'hot-reload',
  priority: 100, // Run first
  
  pre: async (context) => {
    // Check if hot reload is enabled
    if (!context.hotReloadManager) return;
    
    // Add reload status to context
    context.hotReloadEnabled = true;
  },
  
  post: async (context) => {
    // Add hot reload info to responses
    if (context.hotReloadEnabled && context.result) {
      context.result.hotReload = {
        enabled: true,
        message: 'Changes will be applied automatically'
      };
    }
  }
};

export default HotReloadManager;