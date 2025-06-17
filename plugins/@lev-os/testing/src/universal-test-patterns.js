/**
 * Universal Test Patterns for Kingly Plugin System
 * 
 * Extracted and generalized from successful mcp-mvp test patterns.
 * Provides reusable test patterns for all plugins.
 */

import { spawn } from 'child_process';
import { logger } from '@lev/debug';

export class UniversalTestPatterns {
  constructor() {
    this.defaultTimeout = 15000;
    this.defaultEnv = { CONTEXTS_PATH: "./contexts" };
  }

  /**
   * Command Routing Test Pattern
   * Tests that plugin commands route correctly through the CLI
   */
  async testCommandRouting(plugin, commands) {
    logger.info(`Testing command routing for plugin: ${plugin.name}`);
    
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const command of commands) {
      try {
        const result = await this.runKinglyCommand(command.args);
        const success = command.validation(result.output);
        
        if (success) {
          logger.debug(`✅ Command routing test passed: ${command.name}`);
          passed++;
          results.push({ 
            test: command.name, 
            status: 'passed', 
            command: command.args.join(' ') 
          });
        } else {
          logger.warn(`❌ Command routing test failed: ${command.name}`);
          logger.debug(`Output preview: ${result.output.substring(0, 100)}...`);
          failed++;
          results.push({ 
            test: command.name, 
            status: 'failed', 
            command: command.args.join(' '),
            output: result.output.substring(0, 200) 
          });
        }
      } catch (error) {
        logger.error(`💥 Command routing test error: ${command.name}`, { error: error.message });
        failed++;
        results.push({ 
          test: command.name, 
          status: 'error', 
          command: command.args.join(' '),
          error: error.message 
        });
      }
    }

    return {
      plugin: plugin.name,
      testType: 'command_routing',
      passed,
      failed,
      total: commands.length,
      success: failed === 0,
      results
    };
  }

  /**
   * YAML Configuration Validation Pattern
   * Tests that plugin YAML configuration is valid and complete
   */
  async testYamlValidation(plugin) {
    logger.info(`Testing YAML validation for plugin: ${plugin.name}`);
    
    const validationTests = [
      {
        name: 'Has valid plugin metadata',
        test: () => {
          return plugin.config?.plugin?.name && 
                 plugin.config?.plugin?.version && 
                 plugin.config?.plugin?.type;
        }
      },
      {
        name: 'Has defined capabilities',
        test: () => {
          return Array.isArray(plugin.config?.capabilities) && 
                 plugin.config.capabilities.length > 0;
        }
      },
      {
        name: 'Has valid commands',
        test: () => {
          const commands = plugin.config?.commands;
          return commands && Object.keys(commands).length > 0 &&
                 Object.values(commands).every(cmd => 
                   cmd.syntax && cmd.description
                 );
        }
      },
      {
        name: 'Has whisper guidance',
        test: () => {
          const commands = plugin.config?.commands;
          return commands && Object.values(commands).some(cmd => 
            cmd.whisper?.strategies || cmd.whisper?.llm_guidance
          );
        }
      }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of validationTests) {
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
      testType: 'yaml_validation',
      passed,
      failed,
      total: validationTests.length,
      success: failed === 0,
      results
    };
  }

  /**
   * Capability Validation Pattern
   * Tests that plugin capabilities work as documented
   */
  async testCapabilityValidation(plugin) {
    logger.info(`Testing capabilities for plugin: ${plugin.name}`);
    
    const capabilities = plugin.config?.capabilities || [];
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const capability of capabilities) {
      try {
        // Test capability by attempting to use related commands
        const relatedCommands = this.findCommandsForCapability(plugin, capability);
        
        if (relatedCommands.length === 0) {
          // Capability exists but no commands to test it
          results.push({ 
            capability, 
            status: 'skipped', 
            reason: 'No testable commands found' 
          });
          continue;
        }

        let capabilityWorking = true;
        for (const command of relatedCommands) {
          try {
            const result = await this.runKinglyCommand([command, '--help']);
            if (!result.success && !result.output.includes(command)) {
              capabilityWorking = false;
              break;
            }
          } catch (error) {
            capabilityWorking = false;
            break;
          }
        }

        if (capabilityWorking) {
          passed++;
          results.push({ capability, status: 'passed' });
        } else {
          failed++;
          results.push({ capability, status: 'failed' });
        }
      } catch (error) {
        failed++;
        results.push({ capability, status: 'error', error: error.message });
      }
    }

    return {
      plugin: plugin.name,
      testType: 'capability_validation',
      passed,
      failed,
      total: capabilities.length,
      success: failed === 0,
      results
    };
  }

  /**
   * Smoke Test Pattern
   * Quick validation that plugin doesn't crash on basic operations
   */
  async testSmokeTest(plugin) {
    logger.info(`Running smoke tests for plugin: ${plugin.name}`);
    
    const commands = plugin.config?.commands || {};
    const commandNames = Object.keys(commands);
    
    const smokeTests = commandNames.map(cmdName => ({
      name: `${cmdName} help command`,
      args: [cmdName, '--help'],
      validation: (output) => {
        return output.length > 0 && 
               !output.includes('ENOENT') && 
               !output.includes('MODULE_NOT_FOUND') &&
               !output.includes('Command not found');
      }
    }));

    return await this.testCommandRouting(plugin, smokeTests);
  }

  /**
   * Success Criteria Evaluation Pattern
   * Standardized success criteria across all plugins
   */
  evaluateSuccessCriteria(testResults) {
    const allResults = Array.isArray(testResults) ? testResults : [testResults];
    
    const criticalCriteria = [
      { 
        name: 'All commands route correctly', 
        met: allResults.every(r => r.testType !== 'command_routing' || r.success) 
      },
      { 
        name: 'YAML configuration valid', 
        met: allResults.every(r => r.testType !== 'yaml_validation' || r.success) 
      },
      { 
        name: 'Basic smoke tests pass', 
        met: allResults.every(r => r.testType !== 'smoke_test' || r.success) 
      },
      { 
        name: 'No critical failures', 
        met: !allResults.some(r => r.results?.some(res => res.status === 'error')) 
      }
    ];

    const overallSuccess = criticalCriteria.every(c => c.met);
    
    return {
      success: overallSuccess,
      criteria: criticalCriteria,
      summary: {
        totalTests: allResults.reduce((sum, r) => sum + r.total, 0),
        totalPassed: allResults.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: allResults.reduce((sum, r) => sum + r.failed, 0)
      }
    };
  }

  /**
   * Run kingly command with proper isolation and timeout
   */
  async runKinglyCommand(args, timeout = this.defaultTimeout) {
    return new Promise((resolve) => {
      const command = `CONTEXTS_PATH="${this.defaultEnv.CONTEXTS_PATH}" ./bin/kingly ${args.join(' ')}`;
      const child = spawn('bash', ['-c', command], { 
        stdio: 'pipe',
        timeout: timeout
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => output += data.toString());
      child.stderr.on('data', (data) => output += data.toString());
      
      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output.trim(),
          exitCode: code
        });
      });
      
      child.on('error', (error) => {
        resolve({
          success: false,
          output: `Command error: ${error.message}`,
          error: error
        });
      });
    });
  }

  /**
   * Helper: Find commands that implement a specific capability
   */
  findCommandsForCapability(plugin, capability) {
    const commands = plugin.config?.commands || {};
    const commandNames = Object.keys(commands);
    
    // Simple heuristic: match command names with capability names
    return commandNames.filter(cmdName => {
      const cmd = commands[cmdName];
      return cmdName.includes(capability.replace(/_/g, '')) ||
             cmd.description?.toLowerCase().includes(capability.replace(/_/g, ' ')) ||
             cmd.syntax?.includes(capability.replace(/_/g, ''));
    });
  }
}

export default UniversalTestPatterns;