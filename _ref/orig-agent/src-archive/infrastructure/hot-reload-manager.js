/**
 * Hot Reload Manager for Ports & Adapters Architecture
 * Watches for changes and reloads components without dropping MCP connections
 */

import { EventEmitter } from 'events';
import { watch } from 'fs';
import path from 'path';

export class HotReloadManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchPaths = options.watchPaths || ['./src', './agents'];
    this.excludePatterns = options.excludePatterns || [/node_modules/, /\.git/, /\.kingly/];
    this.watchers = [];
    this.isWatching = false;
  }

  start() {
    if (this.isWatching) return;
    
    console.log('🔥 Starting hot reload manager...');
    
    this.watchPaths.forEach(watchPath => {
      try {
        const watcher = watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (!filename) return;
          
          // Skip excluded patterns
          if (this.excludePatterns.some(pattern => pattern.test(filename))) {
            return;
          }
          
          this.handleFileChange(eventType, path.join(watchPath, filename));
        });
        
        this.watchers.push(watcher);
        console.log(`👀 Watching: ${watchPath}`);
      } catch (error) {
        console.warn(`Failed to watch ${watchPath}:`, error.message);
      }
    });
    
    this.isWatching = true;
    console.log('✅ Hot reload manager started');
  }

  stop() {
    if (!this.isWatching) return;
    
    console.log('🛑 Stopping hot reload manager...');
    
    this.watchers.forEach(watcher => {
      try {
        watcher.close();
      } catch (error) {
        console.warn('Error closing watcher:', error.message);
      }
    });
    
    this.watchers = [];
    this.isWatching = false;
    console.log('✅ Hot reload manager stopped');
  }

  handleFileChange(eventType, filePath) {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);
    
    console.log(`📝 File ${eventType}: ${basename}`);
    
    // Determine reload strategy based on file type and location
    if (filePath.includes('/agents/') && (ext === '.yaml' || ext === '.yml')) {
      this.emit('agent-changed', filePath);
    } else if (filePath.includes('/src/domain/')) {
      this.emit('domain-changed', filePath);
    } else if (filePath.includes('/src/adapters/')) {
      this.emit('adapter-changed', filePath);
    } else if (filePath.includes('/src/application/')) {
      this.emit('service-changed', filePath);
    } else if (ext === '.js' || ext === '.mjs') {
      this.emit('module-changed', filePath);
    }
  }

  // Register hot reload handlers for our MCP server
  setupMCPHotReload(mcpAdapter) {
    console.log('🔗 Setting up MCP hot reload handlers...');
    
    // Handle domain changes - need full restart of services
    this.on('domain-changed', async (filePath) => {
      console.log('🏗️ Domain entity changed, reloading services...');
      try {
        // Clear module cache for domain modules
        this.clearModuleCache(filePath);
        
        // Emit event for service layer to reinitialize
        this.emit('services-reload-required');
      } catch (error) {
        console.error('❌ Failed to reload domain:', error.message);
      }
    });
    
    // Handle adapter changes - reload specific adapter
    this.on('adapter-changed', async (filePath) => {
      console.log('🔌 Adapter changed, reloading...', path.basename(filePath));
      try {
        this.clearModuleCache(filePath);
        this.emit('adapter-reload-required', filePath);
      } catch (error) {
        console.error('❌ Failed to reload adapter:', error.message);
      }
    });
    
    // Handle service changes - reload application services
    this.on('service-changed', async (filePath) => {
      console.log('⚙️ Service changed, reloading...', path.basename(filePath));
      try {
        this.clearModuleCache(filePath);
        this.emit('service-reload-required', filePath);
      } catch (error) {
        console.error('❌ Failed to reload service:', error.message);
      }
    });
    
    // Handle agent definition changes
    this.on('agent-changed', async (filePath) => {
      console.log('🎭 Agent definition changed:', path.basename(filePath));
      // Agent reloading would be handled by the agent system
      this.emit('agent-reload-required', filePath);
    });
  }

  clearModuleCache(modulePath) {
    // Clear from Node.js module cache
    const resolvedPath = path.resolve(modulePath);
    delete require.cache[resolvedPath];
    
    // Also clear any related modules in the same directory
    const moduleDir = path.dirname(resolvedPath);
    Object.keys(require.cache).forEach(cached => {
      if (cached.startsWith(moduleDir)) {
        delete require.cache[cached];
      }
    });
  }
}