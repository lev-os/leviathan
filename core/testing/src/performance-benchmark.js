/**
 * Performance Benchmark
 * 
 * Benchmarks plugin performance including command execution times,
 * memory usage, and capability performance monitoring.
 */

import { logger } from './simple-logger.js';
import { UniversalTestPatterns } from './universal-test-patterns.js';

export class PerformanceBenchmark {
  constructor() {
    this.testPatterns = new UniversalTestPatterns();
    this.benchmarkBaselines = new Map();
  }

  /**
   * Benchmark plugin performance
   */
  async benchmarkPlugin(plugin, options = {}) {
    logger.info(`Starting performance benchmark for plugin: ${plugin.name}`, { options });
    
    try {
      const benchmarkResults = [];
      
      // 1. Command Execution Time Benchmarks
      if (!options.type || options.type.includes('execution')) {
        const executionResult = await this.benchmarkCommandExecution(plugin, options);
        benchmarkResults.push(executionResult);
      }
      
      // 2. Memory Usage Benchmarks
      if (!options.type || options.type.includes('memory')) {
        const memoryResult = await this.benchmarkMemoryUsage(plugin, options);
        benchmarkResults.push(memoryResult);
      }
      
      // 3. Capability Performance Benchmarks
      if (!options.type || options.type.includes('capabilities')) {
        const capabilityResult = await this.benchmarkCapabilities(plugin, options);
        benchmarkResults.push(capabilityResult);
      }
      
      // 4. Load Performance Benchmarks
      if (!options.type || options.type.includes('load')) {
        const loadResult = await this.benchmarkLoadPerformance(plugin, options);
        benchmarkResults.push(loadResult);
      }
      
      // Generate overall performance score
      const performanceScore = this.calculatePerformanceScore(benchmarkResults);
      
      const summary = {
        plugin: plugin.name,
        performanceScore,
        benchmarkResults,
        timestamp: new Date().toISOString(),
        baseline: this.getPerformanceBaseline(plugin.name)
      };
      
      // Update baseline if this is a better result
      this.updatePerformanceBaseline(plugin.name, summary);
      
      logger.info(`Performance benchmark completed for plugin: ${plugin.name}`, {
        performanceScore,
        executionTime: summary.averageExecutionTime,
        memoryUsage: summary.memoryUsage
      });
      
      return summary;
    } catch (error) {
      logger.error(`Performance benchmark failed for plugin: ${plugin.name}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Benchmark command execution times
   */
  async benchmarkCommandExecution(plugin, options = {}) {
    logger.debug(`Benchmarking command execution for plugin: ${plugin.name}`);
    
    const commands = plugin.config?.commands || {};
    const commandNames = Object.keys(commands);
    const iterations = options.iterations || 5;
    const results = [];
    
    for (const commandName of commandNames) {
      const executionTimes = [];
      
      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = process.hrtime.bigint();
          
          // Execute command with --help to avoid side effects
          const result = await this.testPatterns.runKinglyCommand([commandName, '--help'], 10000);
          
          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number(endTime - startTime) / 1000000; // Convert to milliseconds
          
          if (result.success || result.output.includes('help')) {
            executionTimes.push(executionTimeMs);
          }
        } catch (error) {
          logger.debug(`Command execution benchmark failed for ${commandName}`, { error: error.message });
        }
      }
      
      if (executionTimes.length > 0) {
        const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
        const minTime = Math.min(...executionTimes);
        const maxTime = Math.max(...executionTimes);
        
        results.push({
          command: commandName,
          averageTime: avgTime,
          minTime,
          maxTime,
          iterations: executionTimes.length,
          successful: true
        });
      } else {
        results.push({
          command: commandName,
          averageTime: null,
          successful: false
        });
      }
    }
    
    const overallAverage = results
      .filter(r => r.successful)
      .reduce((sum, r) => sum + r.averageTime, 0) / results.filter(r => r.successful).length;
    
    return {
      benchmarkType: 'command_execution',
      overallAverageTime: overallAverage || 0,
      commandResults: results,
      success: results.some(r => r.successful)
    };
  }

  /**
   * Benchmark memory usage
   */
  async benchmarkMemoryUsage(plugin, options = {}) {
    logger.debug(`Benchmarking memory usage for plugin: ${plugin.name}`);
    
    const memorySnapshots = [];
    const iterations = options.iterations || 3;
    
    for (let i = 0; i < iterations; i++) {
      try {
        // Take initial memory snapshot
        const initialMemory = process.memoryUsage();
        
        // Execute plugin commands
        const commands = Object.keys(plugin.config?.commands || {});
        for (const command of commands.slice(0, 2)) { // Test first 2 commands
          try {
            await this.testPatterns.runKinglyCommand([command, '--help'], 5000);
          } catch (error) {
            // Continue with next command
          }
        }
        
        // Take final memory snapshot
        const finalMemory = process.memoryUsage();
        
        memorySnapshots.push({
          iteration: i + 1,
          initialMemory,
          finalMemory,
          memoryDelta: {
            rss: finalMemory.rss - initialMemory.rss,
            heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
            heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
            external: finalMemory.external - initialMemory.external
          }
        });
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      } catch (error) {
        logger.debug(`Memory benchmark iteration ${i + 1} failed`, { error: error.message });
      }
    }
    
    const averageMemoryDelta = memorySnapshots.length > 0 ? {
      rss: memorySnapshots.reduce((sum, s) => sum + s.memoryDelta.rss, 0) / memorySnapshots.length,
      heapUsed: memorySnapshots.reduce((sum, s) => sum + s.memoryDelta.heapUsed, 0) / memorySnapshots.length,
      heapTotal: memorySnapshots.reduce((sum, s) => sum + s.memoryDelta.heapTotal, 0) / memorySnapshots.length,
      external: memorySnapshots.reduce((sum, s) => sum + s.memoryDelta.external, 0) / memorySnapshots.length
    } : { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 };
    
    return {
      benchmarkType: 'memory_usage',
      averageMemoryDelta,
      memorySnapshots,
      success: memorySnapshots.length > 0
    };
  }

  /**
   * Benchmark capability performance
   */
  async benchmarkCapabilities(plugin, options = {}) {
    logger.debug(`Benchmarking capabilities for plugin: ${plugin.name}`);
    
    const capabilities = plugin.config?.capabilities || [];
    const capabilityResults = [];
    
    for (const capability of capabilities) {
      try {
        const startTime = process.hrtime.bigint();
        
        // Find commands that implement this capability
        const relatedCommands = this.findCommandsForCapability(plugin, capability);
        
        let capabilityWorking = false;
        for (const command of relatedCommands.slice(0, 1)) { // Test first related command
          try {
            const result = await this.testPatterns.runKinglyCommand([command, '--help'], 5000);
            if (result.success || result.output.includes('help')) {
              capabilityWorking = true;
              break;
            }
          } catch (error) {
            // Continue
          }
        }
        
        const endTime = process.hrtime.bigint();
        const executionTimeMs = Number(endTime - startTime) / 1000000;
        
        capabilityResults.push({
          capability,
          executionTime: executionTimeMs,
          relatedCommands: relatedCommands.length,
          working: capabilityWorking
        });
      } catch (error) {
        capabilityResults.push({
          capability,
          executionTime: null,
          working: false,
          error: error.message
        });
      }
    }
    
    const averageCapabilityTime = capabilityResults
      .filter(r => r.working && r.executionTime !== null)
      .reduce((sum, r) => sum + r.executionTime, 0) / 
      Math.max(capabilityResults.filter(r => r.working && r.executionTime !== null).length, 1);
    
    return {
      benchmarkType: 'capability_performance',
      averageCapabilityTime,
      capabilityResults,
      success: capabilityResults.some(r => r.working)
    };
  }

  /**
   * Benchmark plugin load performance
   */
  async benchmarkLoadPerformance(plugin, options = {}) {
    logger.debug(`Benchmarking load performance for plugin: ${plugin.name}`);
    
    const loadTimes = [];
    const iterations = options.iterations || 3;
    
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = process.hrtime.bigint();
        
        // Simulate plugin loading by checking configuration access
        const hasValidConfig = plugin.config && 
                              plugin.config.plugin && 
                              plugin.config.plugin.name;
        
        const endTime = process.hrtime.bigint();
        const loadTimeMs = Number(endTime - startTime) / 1000000;
        
        if (hasValidConfig) {
          loadTimes.push(loadTimeMs);
        }
      } catch (error) {
        logger.debug(`Load performance iteration ${i + 1} failed`, { error: error.message });
      }
    }
    
    const averageLoadTime = loadTimes.length > 0 ? 
      loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : 0;
    
    return {
      benchmarkType: 'load_performance',
      averageLoadTime,
      loadTimes,
      success: loadTimes.length > 0
    };
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore(benchmarkResults) {
    let score = 100; // Start with perfect score
    
    for (const result of benchmarkResults) {
      if (!result.success) {
        score -= 20; // Penalty for failed benchmarks
        continue;
      }
      
      switch (result.benchmarkType) {
        case 'command_execution':
          // Penalty for slow command execution (>1000ms average)
          if (result.overallAverageTime > 1000) {
            score -= Math.min(30, (result.overallAverageTime - 1000) / 100);
          }
          break;
          
        case 'memory_usage':
          // Penalty for high memory usage (>50MB average delta)
          const memoryMB = result.averageMemoryDelta.rss / (1024 * 1024);
          if (memoryMB > 50) {
            score -= Math.min(25, (memoryMB - 50) / 10);
          }
          break;
          
        case 'capability_performance':
          // Penalty for slow capability execution (>500ms average)
          if (result.averageCapabilityTime > 500) {
            score -= Math.min(20, (result.averageCapabilityTime - 500) / 50);
          }
          break;
          
        case 'load_performance':
          // Penalty for slow loading (>100ms average)
          if (result.averageLoadTime > 100) {
            score -= Math.min(15, (result.averageLoadTime - 100) / 10);
          }
          break;
      }
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Find commands that implement a specific capability
   */
  findCommandsForCapability(plugin, capability) {
    const commands = plugin.config?.commands || {};
    const commandNames = Object.keys(commands);
    
    return commandNames.filter(cmdName => {
      const cmd = commands[cmdName];
      return cmdName.includes(capability.replace(/_/g, '')) ||
             cmd.description?.toLowerCase().includes(capability.replace(/_/g, ' ')) ||
             cmd.syntax?.includes(capability.replace(/_/g, ''));
    });
  }

  /**
   * Get performance baseline for plugin
   */
  getPerformanceBaseline(pluginName) {
    return this.benchmarkBaselines.get(pluginName) || null;
  }

  /**
   * Update performance baseline
   */
  updatePerformanceBaseline(pluginName, benchmarkResult) {
    const existing = this.benchmarkBaselines.get(pluginName);
    
    if (!existing || benchmarkResult.performanceScore > existing.performanceScore) {
      this.benchmarkBaselines.set(pluginName, {
        performanceScore: benchmarkResult.performanceScore,
        timestamp: benchmarkResult.timestamp,
        averageExecutionTime: benchmarkResult.benchmarkResults
          .find(r => r.benchmarkType === 'command_execution')?.overallAverageTime || 0,
        memoryUsage: benchmarkResult.benchmarkResults
          .find(r => r.benchmarkType === 'memory_usage')?.averageMemoryDelta?.rss || 0
      });
    }
  }

  /**
   * Generate performance regression report
   */
  generateRegressionReport(currentResult, baselineResult) {
    if (!baselineResult) {
      return { hasRegression: false, message: 'No baseline available for comparison' };
    }
    
    const scoreDelta = currentResult.performanceScore - baselineResult.performanceScore;
    const significantRegression = scoreDelta < -10; // More than 10 point drop
    
    return {
      hasRegression: significantRegression,
      scoreDelta,
      message: significantRegression ? 
        `Performance regression detected: ${Math.abs(scoreDelta)} point decrease` :
        `Performance maintained: ${scoreDelta >= 0 ? '+' : ''}${scoreDelta} point change`
    };
  }
}

export default PerformanceBenchmark;