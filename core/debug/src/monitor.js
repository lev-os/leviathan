// Performance monitoring for Kingly plugins and operations
class KinglyMonitor {
  constructor() {
    this.metrics = new Map();
    this.config = null;
  }

  async configure(config) {
    this.config = config;
  }

  // Track plugin performance
  trackPlugin(pluginName, stats = {}) {
    if (!this.config?.monitorEnabled) return;

    const key = `plugin:${pluginName}`;
    const existing = this.metrics.get(key) || {
      name: pluginName,
      type: 'plugin',
      calls: 0,
      totalDuration: 0,
      avgDuration: 0,
      errors: 0,
      lastActivity: null
    };

    // Update metrics
    existing.calls += 1;
    existing.lastActivity = Date.now();
    
    if (stats.duration) {
      existing.totalDuration += stats.duration;
      existing.avgDuration = existing.totalDuration / existing.calls;
    }
    
    if (stats.error) {
      existing.errors += 1;
    }

    this.metrics.set(key, existing);
  }

  // Track command performance
  trackCommand(command, stats = {}) {
    if (!this.config?.monitorEnabled) return;

    const key = `command:${command}`;
    const existing = this.metrics.get(key) || {
      command,
      type: 'command',
      executions: 0,
      totalDuration: 0,
      avgDuration: 0,
      failures: 0,
      lastExecution: null
    };

    existing.executions += 1;
    existing.lastExecution = Date.now();
    
    if (stats.duration) {
      existing.totalDuration += stats.duration;
      existing.avgDuration = existing.totalDuration / existing.executions;
    }
    
    if (!stats.success) {
      existing.failures += 1;
    }

    this.metrics.set(key, existing);
  }

  // Track LLM operations
  trackLLM(operation, stats = {}) {
    if (!this.config?.monitorEnabled) return;

    const key = `llm:${operation}`;
    const existing = this.metrics.get(key) || {
      operation,
      type: 'llm',
      calls: 0,
      totalTokens: 0,
      totalDuration: 0,
      avgConfidence: 0,
      confidenceSum: 0
    };

    existing.calls += 1;
    
    if (stats.tokens) {
      existing.totalTokens += stats.tokens;
    }
    
    if (stats.duration) {
      existing.totalDuration += stats.duration;
    }
    
    if (stats.confidence) {
      existing.confidenceSum += stats.confidence;
      existing.avgConfidence = existing.confidenceSum / existing.calls;
    }

    this.metrics.set(key, existing);
  }

  // Get all metrics
  getMetrics() {
    return Array.from(this.metrics.values());
  }

  // Get metrics by type
  getMetricsByType(type) {
    return Array.from(this.metrics.values())
      .filter(metric => metric.type === type);
  }

  // Get performance summary
  getSummary() {
    const plugins = this.getMetricsByType('plugin');
    const commands = this.getMetricsByType('command');
    const llm = this.getMetricsByType('llm');

    return {
      summary: {
        totalPlugins: plugins.length,
        totalCommands: commands.length,
        totalLLMOperations: llm.length,
        timestamp: Date.now()
      },
      plugins: plugins.slice(0, 10), // Top 10
      commands: commands.slice(0, 10),
      llm: llm.slice(0, 10)
    };
  }

  // Reset metrics
  reset() {
    this.metrics.clear();
  }
}

// Singleton instance
export const monitor = new KinglyMonitor();