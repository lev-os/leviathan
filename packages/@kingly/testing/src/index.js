/**
 * @kingly/testing - Universal Testing Framework
 * 
 * Provides comprehensive testing capabilities for Kingly core packages and community plugins.
 * Includes plugin discovery, validation, integration testing, and performance benchmarking.
 */

import { logger, tracer, monitor } from '@kingly/debug';
import { PluginDiscovery } from './plugin-discovery.js';
import { PluginValidator } from './plugin-validator.js';
import { IntegrationTester } from './integration-tester.js';
import { CommunityValidator } from './community-validator.js';
import { PerformanceBenchmark } from './performance-benchmark.js';

export class KinglyTestingFramework {
  constructor() {
    this.discovery = new PluginDiscovery();
    this.validator = new PluginValidator();
    this.integrationTester = new IntegrationTester();
    this.communityValidator = new CommunityValidator();
    this.benchmark = new PerformanceBenchmark();
    
    logger.info('Kingly Testing Framework initialized');
  }

  /**
   * Discover all testable plugins in the ecosystem
   */
  async discoverPlugins(options = {}) {
    const span = tracer.startSpan('testing.discover_plugins');
    
    try {
      logger.info('Starting plugin discovery', { options });
      
      const plugins = await this.discovery.discoverPlugins(options);
      
      logger.info(`Discovered ${plugins.length} testable plugins`, {
        corePlugins: plugins.filter(p => p.type === 'core_plugin').length,
        communityPlugins: plugins.filter(p => p.type === 'community_plugin').length
      });
      
      span.setStatus({ code: 'ok' });
      return plugins;
    } catch (error) {
      logger.error('Plugin discovery failed', { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Test specific plugin with comprehensive validation
   */
  async testPlugin(pluginName, options = {}) {
    const span = tracer.startSpan('testing.test_plugin', {
      attributes: { pluginName, suite: options.suite }
    });
    
    try {
      logger.info(`Testing plugin: ${pluginName}`, { options });
      
      const plugin = await this.discovery.getPlugin(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }
      
      const results = await this.validator.validatePlugin(plugin, options);
      
      logger.info(`Plugin test completed: ${pluginName}`, {
        passed: results.passed,
        failed: results.failed,
        total: results.total
      });
      
      span.setStatus({ code: results.success ? 'ok' : 'error' });
      return results;
    } catch (error) {
      logger.error(`Plugin test failed: ${pluginName}`, { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Run cross-plugin integration tests
   */
  async testIntegration(options = {}) {
    const span = tracer.startSpan('testing.test_integration');
    
    try {
      logger.info('Starting integration tests', { options });
      
      const results = await this.integrationTester.runIntegrationTests(options);
      
      logger.info('Integration tests completed', {
        totalTests: results.total,
        passed: results.passed,
        failed: results.failed
      });
      
      span.setStatus({ code: results.success ? 'ok' : 'error' });
      return results;
    } catch (error) {
      logger.error('Integration tests failed', { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Validate community plugins for compatibility
   */
  async testCommunity(options = {}) {
    const span = tracer.startSpan('testing.test_community');
    
    try {
      logger.info('Starting community plugin validation', { options });
      
      const results = await this.communityValidator.validateCommunityPlugins(options);
      
      logger.info('Community validation completed', {
        pluginsValidated: results.total,
        compatible: results.passed,
        incompatible: results.failed
      });
      
      span.setStatus({ code: results.success ? 'ok' : 'error' });
      return results;
    } catch (error) {
      logger.error('Community validation failed', { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Benchmark plugin performance
   */
  async benchmarkPlugin(pluginName, options = {}) {
    const span = tracer.startSpan('testing.benchmark_plugin', {
      attributes: { pluginName }
    });
    
    try {
      logger.info(`Benchmarking plugin: ${pluginName}`, { options });
      
      const plugin = await this.discovery.getPlugin(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }
      
      const results = await this.benchmark.benchmarkPlugin(plugin, options);
      
      logger.info(`Plugin benchmark completed: ${pluginName}`, {
        averageExecutionTime: results.averageExecutionTime,
        memoryUsage: results.memoryUsage,
        performanceScore: results.performanceScore
      });
      
      span.setStatus({ code: 'ok' });
      return results;
    } catch (error) {
      logger.error(`Plugin benchmark failed: ${pluginName}`, { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Generate comprehensive ecosystem health report
   */
  async generateEcosystemReport() {
    const span = tracer.startSpan('testing.ecosystem_report');
    
    try {
      logger.info('Generating ecosystem health report');
      
      const plugins = await this.discoverPlugins();
      const integrationResults = await this.testIntegration();
      const communityResults = await this.testCommunity();
      
      const report = {
        timestamp: new Date().toISOString(),
        ecosystem: {
          totalPlugins: plugins.length,
          corePlugins: plugins.filter(p => p.type === 'core_plugin').length,
          communityPlugins: plugins.filter(p => p.type === 'community_plugin').length
        },
        integration: {
          success: integrationResults.success,
          passed: integrationResults.passed,
          failed: integrationResults.failed
        },
        community: {
          success: communityResults.success,
          compatible: communityResults.passed,
          incompatible: communityResults.failed
        },
        health: {
          overall: integrationResults.success && communityResults.success ? 'healthy' : 'needs_attention',
          recommendations: this._generateRecommendations(integrationResults, communityResults)
        }
      };
      
      logger.info('Ecosystem health report generated', { 
        health: report.health.overall,
        totalPlugins: report.ecosystem.totalPlugins
      });
      
      span.setStatus({ code: 'ok' });
      return report;
    } catch (error) {
      logger.error('Ecosystem report generation failed', { error: error.message });
      span.setStatus({ code: 'error', message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  _generateRecommendations(integrationResults, communityResults) {
    const recommendations = [];
    
    if (!integrationResults.success) {
      recommendations.push('Review failed integration tests for plugin conflicts');
    }
    
    if (!communityResults.success) {
      recommendations.push('Update community plugins for API compatibility');
    }
    
    if (integrationResults.failed > 0) {
      recommendations.push('Fix cross-plugin integration issues');
    }
    
    if (communityResults.failed > 0) {
      recommendations.push('Provide migration guides for incompatible community plugins');
    }
    
    return recommendations;
  }
}

// Export main testing framework and individual components
export {
  PluginDiscovery,
  PluginValidator, 
  IntegrationTester,
  CommunityValidator,
  PerformanceBenchmark
};

// Default export for easy importing
export default KinglyTestingFramework;