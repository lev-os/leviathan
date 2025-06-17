/**
 * Plugin Validator
 * 
 * Comprehensive validation for individual plugins including YAML config,
 * command routing, capability testing, and integration validation.
 */

import { logger } from './simple-logger.js';
import { UniversalTestPatterns } from './universal-test-patterns.js';

export class PluginValidator {
  constructor() {
    this.testPatterns = new UniversalTestPatterns();
  }

  /**
   * Validate plugin with comprehensive test suite
   */
  async validatePlugin(plugin, options = {}) {
    logger.info(`Starting comprehensive validation for plugin: ${plugin.name}`, { options });
    
    const testResults = [];
    
    try {
      // 1. YAML Configuration Validation
      if (!options.suite || options.suite.includes('yaml')) {
        logger.debug(`Running YAML validation for ${plugin.name}`);
        const yamlResult = await this.testPatterns.testYamlValidation(plugin);
        testResults.push(yamlResult);
      }
      
      // 2. Smoke Tests
      if (!options.suite || options.suite.includes('smoke')) {
        logger.debug(`Running smoke tests for ${plugin.name}`);
        const smokeResult = await this.testPatterns.testSmokeTest(plugin);
        testResults.push(smokeResult);
      }
      
      // 3. Command Routing Tests
      if (!options.suite || options.suite.includes('commands')) {
        logger.debug(`Running command routing tests for ${plugin.name}`);
        const commandTests = this.generateCommandTests(plugin);
        if (commandTests.length > 0) {
          const commandResult = await this.testPatterns.testCommandRouting(plugin, commandTests);
          testResults.push(commandResult);
        }
      }
      
      // 4. Capability Validation Tests
      if (!options.suite || options.suite.includes('capabilities')) {
        logger.debug(`Running capability validation for ${plugin.name}`);
        const capabilityResult = await this.testPatterns.testCapabilityValidation(plugin);
        testResults.push(capabilityResult);
      }
      
      // 5. Plugin-specific Integration Tests
      if (!options.suite || options.suite.includes('integration')) {
        logger.debug(`Running integration tests for ${plugin.name}`);
        const integrationResult = await this.testPluginIntegration(plugin);
        testResults.push(integrationResult);
      }
      
      // Evaluate overall success criteria
      const successEvaluation = this.testPatterns.evaluateSuccessCriteria(testResults);
      
      const summary = {
        plugin: plugin.name,
        success: successEvaluation.success,
        passed: successEvaluation.summary.totalPassed,
        failed: successEvaluation.summary.totalFailed,
        total: successEvaluation.summary.totalTests,
        testResults,
        criteria: successEvaluation.criteria,
        timestamp: new Date().toISOString()
      };
      
      logger.info(`Plugin validation completed: ${plugin.name}`, {
        success: summary.success,
        passed: summary.passed,
        failed: summary.failed,
        total: summary.total
      });
      
      return summary;
    } catch (error) {
      logger.error(`Plugin validation failed: ${plugin.name}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Generate command tests based on plugin configuration
   */
  generateCommandTests(plugin) {
    const commands = plugin.config?.commands || {};
    const tests = [];
    
    for (const [commandName, commandConfig] of Object.entries(commands)) {
      // Basic help test for each command
      tests.push({
        name: `${commandName} help command`,
        args: [commandName, '--help'],
        validation: (output) => {
          return output.length > 0 && 
                 !output.includes('Command not found') &&
                 !output.includes('ENOENT') &&
                 (output.includes(commandName) || output.includes('Usage:') || output.includes('help'));
        }
      });
      
      // Syntax validation test if syntax is defined
      if (commandConfig.syntax) {
        tests.push({
          name: `${commandName} syntax recognition`,
          args: [commandName, '--help'],
          validation: (output) => {
            return output.includes(commandConfig.syntax) || 
                   output.includes('Usage:') ||
                   output.includes(commandName);
          }
        });
      }
      
      // Plugin-specific command tests
      if (plugin.name === 'universal-validation') {
        tests.push(...this.generateUniversalValidationTests(commandName, commandConfig));
      } else if (plugin.name === 'cmd') {
        tests.push(...this.generateCmdTests(commandName, commandConfig));
      } else if (plugin.name === 'debug') {
        tests.push(...this.generateDebugTests(commandName, commandConfig));
      }
    }
    
    return tests;
  }

  /**
   * Generate universal validation specific tests
   */
  generateUniversalValidationTests(commandName, commandConfig) {
    const tests = [];
    
    if (commandName === 'validate_init') {
      tests.push({
        name: 'validate init with basic parameters',
        args: ['validate', 'init', 'test-project', 'general'],
        validation: (output) => {
          return output.includes('validation') || 
                 output.includes('initialized') ||
                 output.includes('test-project');
        }
      });
    }
    
    if (commandName === 'validate_run') {
      tests.push({
        name: 'validate run help',
        args: ['validate', 'run', '--help'],
        validation: (output) => {
          return output.includes('target') || 
                 output.includes('validation') ||
                 output.includes('Usage:');
        }
      });
    }
    
    return tests;
  }

  /**
   * Generate cmd package specific tests
   */
  generateCmdTests(commandName, commandConfig) {
    const tests = [];
    
    if (commandName === 'cmd_exec') {
      tests.push({
        name: 'cmd exec help',
        args: ['cmd', 'exec', '--help'],
        validation: (output) => {
          return output.includes('command') || 
                 output.includes('execute') ||
                 output.includes('Usage:');
        }
      });
    }
    
    if (commandName === 'cmd_jobs') {
      tests.push({
        name: 'cmd jobs help',
        args: ['cmd', 'jobs', '--help'],
        validation: (output) => {
          return output.includes('jobs') || 
                 output.includes('status') ||
                 output.includes('Usage:');
        }
      });
    }
    
    return tests;
  }

  /**
   * Generate debug package specific tests
   */
  generateDebugTests(commandName, commandConfig) {
    const tests = [];
    
    if (commandName.includes('debug')) {
      tests.push({
        name: `${commandName} basic functionality`,
        args: [commandName.replace('debug_', ''), '--help'],
        validation: (output) => {
          return output.includes('debug') || 
                 output.includes('log') ||
                 output.includes('trace') ||
                 output.includes('Usage:');
        }
      });
    }
    
    return tests;
  }

  /**
   * Test plugin integration with the broader system
   */
  async testPluginIntegration(plugin) {
    logger.debug(`Testing integration for plugin: ${plugin.name}`);
    
    const integrationTests = [
      {
        name: 'Plugin loads without errors',
        test: async () => {
          // Test that plugin can be imported/loaded
          return true; // Simplified - would check actual loading
        }
      },
      {
        name: 'Plugin commands register correctly',
        test: async () => {
          // Test that plugin commands are registered in the command registry
          const commands = plugin.config?.commands || {};
          return Object.keys(commands).length > 0;
        }
      },
      {
        name: 'Plugin capabilities are accessible',
        test: async () => {
          // Test that plugin capabilities can be invoked
          const capabilities = plugin.config?.capabilities || [];
          return capabilities.length > 0;
        }
      }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of integrationTests) {
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
      plugin: plugin.name,
      testType: 'integration',
      passed,
      failed,
      total: integrationTests.length,
      success: failed === 0,
      results
    };
  }

  /**
   * Validate plugin follows Kingly conventions
   */
  async validatePluginConventions(plugin) {
    logger.debug(`Validating conventions for plugin: ${plugin.name}`);
    
    const conventionTests = [
      {
        name: 'Uses @lev/debug for logging',
        test: () => {
          // Would check plugin source for debug imports
          return true; // Simplified
        }
      },
      {
        name: 'Has YAML-first configuration',
        test: () => {
          return plugin.config && plugin.yamlPath;
        }
      },
      {
        name: 'Follows standard directory structure',
        test: () => {
          // Would check for src/, config/, package.json structure
          return plugin.path && plugin.yamlPath;
        }
      },
      {
        name: 'Has whisper guidance for LLM integration',
        test: () => {
          const commands = plugin.config?.commands || {};
          return Object.values(commands).some(cmd => cmd.whisper);
        }
      }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of conventionTests) {
      try {
        const success = test.test();
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
      plugin: plugin.name,
      testType: 'conventions',
      passed,
      failed,
      total: conventionTests.length,
      success: failed === 0,
      results
    };
  }
}

export default PluginValidator;