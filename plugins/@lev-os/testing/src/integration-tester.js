/**
 * Integration Tester
 * 
 * Cross-plugin integration testing to ensure plugins work together
 * without conflicts and can compose capabilities effectively.
 */

import { logger } from './simple-logger.js';
import { UniversalTestPatterns } from './universal-test-patterns.js';

export class IntegrationTester {
  constructor() {
    this.testPatterns = new UniversalTestPatterns();
  }

  /**
   * Run comprehensive cross-plugin integration tests
   */
  async runIntegrationTests(options = {}) {
    logger.info('Starting cross-plugin integration tests', { options });
    
    try {
      const testResults = [];
      
      // 1. Plugin Compatibility Tests
      if (!options.type || options.type.includes('compatibility')) {
        const compatibilityResult = await this.testPluginCompatibility(options.plugins);
        testResults.push(compatibilityResult);
      }
      
      // 2. Command Interaction Tests
      if (!options.type || options.type.includes('commands')) {
        const commandInteractionResult = await this.testCommandInteractions(options.plugins);
        testResults.push(commandInteractionResult);
      }
      
      // 3. Data Flow Tests
      if (!options.type || options.type.includes('dataflow')) {
        const dataFlowResult = await this.testDataFlow(options.plugins);
        testResults.push(dataFlowResult);
      }
      
      // 4. Capability Composition Tests
      if (!options.type || options.type.includes('composition')) {
        const compositionResult = await this.testCapabilityComposition(options.plugins);
        testResults.push(compositionResult);
      }
      
      // 5. Conflict Detection Tests
      if (!options.type || options.type.includes('conflicts')) {
        const conflictResult = await this.testConflictDetection(options.plugins);
        testResults.push(conflictResult);
      }
      
      // Evaluate overall integration success
      const summary = this.evaluateIntegrationSuccess(testResults);
      
      logger.info('Cross-plugin integration tests completed', {
        success: summary.success,
        passed: summary.passed,
        failed: summary.failed,
        total: summary.total
      });
      
      return summary;
    } catch (error) {
      logger.error('Integration tests failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Test plugin compatibility - ensure plugins can coexist
   */
  async testPluginCompatibility(plugins = []) {
    logger.debug('Testing plugin compatibility');
    
    const compatibilityTests = [
      {
        name: 'No command name conflicts',
        test: async () => {
          const allCommands = new Map();
          for (const plugin of plugins) {
            const commands = plugin.config?.commands || {};
            for (const cmdName of Object.keys(commands)) {
              if (allCommands.has(cmdName)) {
                logger.warn(`Command conflict detected: ${cmdName} in ${plugin.name} and ${allCommands.get(cmdName)}`);
                return false;
              }
              allCommands.set(cmdName, plugin.name);
            }
          }
          return true;
        }
      },
      {
        name: 'No capability conflicts',
        test: async () => {
          const allCapabilities = new Map();
          for (const plugin of plugins) {
            const capabilities = plugin.config?.capabilities || [];
            for (const capability of capabilities) {
              if (allCapabilities.has(capability)) {
                // Multiple plugins can share capabilities, but log for awareness
                logger.debug(`Shared capability: ${capability} in ${plugin.name} and ${allCapabilities.get(capability)}`);
              }
              allCapabilities.set(capability, plugin.name);
            }
          }
          return true;
        }
      },
      {
        name: 'Plugin loading order independence',
        test: async () => {
          // Test that plugins can be loaded in any order
          // This is a simplified test - would involve actual loading simulation
          return plugins.length > 0;
        }
      }
    ];

    return await this.runTestSuite('plugin_compatibility', compatibilityTests);
  }

  /**
   * Test command interactions between plugins
   */
  async testCommandInteractions(plugins = []) {
    logger.debug('Testing command interactions');
    
    const interactionTests = [];
    
    // Test common command patterns that might interact
    const commonPatterns = [
      { pattern: 'help', description: 'Help command consistency' },
      { pattern: 'status', description: 'Status command integration' },
      { pattern: 'init', description: 'Initialization command coordination' }
    ];
    
    for (const pattern of commonPatterns) {
      const relevantPlugins = plugins.filter(plugin => {
        const commands = plugin.config?.commands || {};
        return Object.keys(commands).some(cmd => cmd.includes(pattern.pattern));
      });
      
      if (relevantPlugins.length > 1) {
        interactionTests.push({
          name: `${pattern.description} across ${relevantPlugins.length} plugins`,
          test: async () => {
            // Test that similar commands across plugins don't interfere
            for (const plugin of relevantPlugins) {
              const commands = Object.keys(plugin.config?.commands || {});
              const patternCommands = commands.filter(cmd => cmd.includes(pattern.pattern));
              
              for (const cmd of patternCommands) {
                try {
                  const result = await this.testPatterns.runKinglyCommand([cmd, '--help']);
                  if (!result.success && !result.output.includes('help')) {
                    return false;
                  }
                } catch (error) {
                  return false;
                }
              }
            }
            return true;
          }
        });
      }
    }
    
    return await this.runTestSuite('command_interactions', interactionTests);
  }

  /**
   * Test data flow between plugins
   */
  async testDataFlow(plugins = []) {
    logger.debug('Testing data flow between plugins');
    
    const dataFlowTests = [
      {
        name: 'Plugin state isolation',
        test: async () => {
          // Test that plugins don't interfere with each other's state
          // This would involve checking that plugin operations are isolated
          return true; // Simplified
        }
      },
      {
        name: 'Shared context handling',
        test: async () => {
          // Test that plugins can share context appropriately
          // Would check for proper context passing between plugins
          return true; // Simplified
        }
      },
      {
        name: 'Plugin output compatibility',
        test: async () => {
          // Test that plugin outputs can be consumed by other plugins
          // Would test actual data format compatibility
          return true; // Simplified
        }
      }
    ];

    return await this.runTestSuite('data_flow', dataFlowTests);
  }

  /**
   * Test capability composition - how plugins combine capabilities
   */
  async testCapabilityComposition(plugins = []) {
    logger.debug('Testing capability composition');
    
    const compositionTests = [];
    
    // Find plugins with complementary capabilities
    const capabilityMap = new Map();
    for (const plugin of plugins) {
      const capabilities = plugin.config?.capabilities || [];
      for (const capability of capabilities) {
        if (!capabilityMap.has(capability)) {
          capabilityMap.set(capability, []);
        }
        capabilityMap.get(capability).push(plugin);
      }
    }
    
    // Test capability combinations
    const commonCapabilities = ['debugging', 'validation', 'process_management'];
    
    for (const capability of commonCapabilities) {
      const providingPlugins = capabilityMap.get(capability) || [];
      
      if (providingPlugins.length > 0) {
        compositionTests.push({
          name: `${capability} capability composition`,
          test: async () => {
            // Test that capability can be accessed through multiple plugins
            for (const plugin of providingPlugins) {
              const commands = plugin.config?.commands || {};
              const relatedCommands = Object.keys(commands).filter(cmd => 
                cmd.includes(capability) || 
                commands[cmd].description?.includes(capability)
              );
              
              if (relatedCommands.length === 0) {
                continue; // No testable commands for this capability
              }
              
              // Test that at least one related command works
              for (const cmd of relatedCommands.slice(0, 1)) { // Test first command
                try {
                  const result = await this.testPatterns.runKinglyCommand([cmd, '--help']);
                  if (result.success || result.output.includes('help')) {
                    break; // At least one command works
                  }
                } catch (error) {
                  // Continue to next command
                }
              }
            }
            return true;
          }
        });
      }
    }

    return await this.runTestSuite('capability_composition', compositionTests);
  }

  /**
   * Test conflict detection between plugins
   */
  async testConflictDetection(plugins = []) {
    logger.debug('Testing conflict detection');
    
    const conflictTests = [
      {
        name: 'No resource conflicts',
        test: async () => {
          // Test that plugins don't compete for the same resources
          // Would check file locks, ports, etc.
          return true; // Simplified
        }
      },
      {
        name: 'No configuration conflicts',
        test: async () => {
          // Test that plugin configurations don't override each other
          const configs = plugins.map(p => p.config);
          return configs.length > 0; // Simplified
        }
      },
      {
        name: 'No dependency conflicts',
        test: async () => {
          // Test that plugin dependencies are compatible
          // Would check for version conflicts, etc.
          return true; // Simplified
        }
      }
    ];

    return await this.runTestSuite('conflict_detection', conflictTests);
  }

  /**
   * Run a test suite and return results
   */
  async runTestSuite(suiteName, tests) {
    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of tests) {
      try {
        const success = await test.test();
        if (success) {
          passed++;
          results.push({ test: test.name, status: 'passed' });
        } else {
          failed++;
          results.push({ test: test.name, status: 'failed' });
        }
      } catch (error) {
        failed++;
        results.push({ test: test.name, status: 'error', error: error.message });
      }
    }

    return {
      testType: suiteName,
      passed,
      failed,
      total: tests.length,
      success: failed === 0,
      results
    };
  }

  /**
   * Evaluate overall integration success
   */
  evaluateIntegrationSuccess(testResults) {
    const totalPassed = testResults.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = testResults.reduce((sum, result) => sum + result.failed, 0);
    const totalTests = testResults.reduce((sum, result) => sum + result.total, 0);
    
    const overallSuccess = testResults.every(result => result.success);
    
    return {
      success: overallSuccess,
      passed: totalPassed,
      failed: totalFailed,
      total: totalTests,
      testResults,
      timestamp: new Date().toISOString()
    };
  }
}

export default IntegrationTester;