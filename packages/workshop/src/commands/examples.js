#!/usr/bin/env node

/**
 * Workshop Examples Command
 * 
 * Show real working plugin examples.
 * Live code showcase system.
 */

import { logger } from '@lev-os/debug';

export default class ExamplesCommand {
  constructor() {
    this.description = 'Show real working plugin examples';
    this.args = ['filter: Filter examples by type or complexity'];
  }

  async execute(args = [], options = {}) {
    const filter = args[0];
    
    logger.info('Workshop examples command', { filter, options });

    if (filter) {
      return this.getFilteredExamples(filter);
    }

    return {
      success: true,
      formatted_response: this.getAllExamples(),
      data: {
        action: 'examples_overview',
        available_filters: ['basic', 'advanced', 'production', 'debug', 'testing', 'cmd'],
        total_examples: 8
      }
    };
  }

  getFilteredExamples(filter) {
    const filters = {
      basic: () => this.basicExamples(),
      advanced: () => this.advancedExamples(),
      production: () => this.productionExamples(),
      debug: () => this.debugExamples(),
      testing: () => this.testingExamples(),
      cmd: () => this.cmdExamples()
    };

    const filterFunction = filters[filter];
    if (!filterFunction) {
      return {
        success: false,
        error: `Unknown filter: ${filter}. Available: ${Object.keys(filters).join(', ')}`
      };
    }

    return filterFunction();
  }

  getAllExamples() {
    return `💡 LEVIATHAN PLUGIN EXAMPLES

=== LIVE WORKING EXAMPLES ===

🔌 PRODUCTION PLUGINS (Tier 1):
   • @lev-os/debug    - Universal debugging system
   • @lev-os/testing  - Plugin validation framework  
   • @lev-os/cmd      - Process management system

🚧 DEVELOPMENT PLUGINS (Tier 2):
   • @lev-os/workshop    - Tool integration and plugin creation

🎯 FILTER BY CATEGORY:
   lev workshop examples basic      - Simple plugin patterns
   lev workshop examples advanced   - Complex architectures
   lev workshop examples production - Production-ready examples
   lev workshop examples debug      - Debugging integration
   lev workshop examples testing    - Testing patterns
   lev workshop examples cmd        - Process management

📚 STUDY LOCATIONS:
   • plugins/@lev-os/debug/src/
   • packages/testing/src/
   • packages/commands/src/
   • packages/workshop/src/

🚀 QUICK EXAMPLES:
   lev debug events              # See debug plugin in action
   lev workshop status           # Workshop plugin example
   lev cmd exec "echo hello"     # Command execution example

💡 LEARN BY DOING:
   Each example is a working plugin you can examine, modify, and learn from!`;
  }

  basicExamples() {
    return {
      success: true,
      formatted_response: `🎯 BASIC PLUGIN EXAMPLES

=== SIMPLE PATTERNS FOR BEGINNERS ===

💬 HELLO WORLD PATTERN:
   // src/commands/greet.js
   export default class GreetCommand {
     constructor() {
       this.description = 'Greet someone'
       this.args = ['name: Person to greet']
     }
     
     async execute(args) {
       const name = args[0] || 'World'
       return {
         success: true,
         formatted_response: \`Hello, \${name}!\`,
         data: { greeting: \`Hello, \${name}!\` }
       }
     }
   }

📊 STATUS COMMAND PATTERN:
   // Based on workshop status command
   async execute(args, options) {
     const data = await this.loadData()
     
     if (options.json) {
       return { success: true, data, format: 'json' }
     }
     
     return {
       success: true,
       formatted_response: this.formatOutput(data),
       data
     }
   }

📋 LIST COMMAND PATTERN:
   // Filter and display items
   async execute(args, options) {
     let items = await this.loadItems()
     
     // Apply filters
     if (options.type) {
       items = items.filter(item => item.type === options.type)
     }
     
     return {
       success: true,
       formatted_response: this.formatList(items),
       data: items
     }
   }

🔍 INFO COMMAND PATTERN:
   // Detailed item information
   async execute(args) {
     const itemName = args[0]
     if (!itemName) {
       return { success: false, error: 'Item name required' }
     }
     
     const item = await this.findItem(itemName)
     if (!item) {
       return { success: false, error: \`Item not found: \${itemName}\` }
     }
     
     return {
       success: true,
       formatted_response: this.formatDetails(item),
       data: item
     }
   }

🎯 KEY TAKEAWAYS:
   • Simple, focused commands
   • Consistent return patterns
   • Error handling
   • Optional JSON output

📚 STUDY THESE FILES:
   • packages/workshop/src/commands/status.js
   • packages/workshop/src/commands/list.js
   • packages/workshop/src/commands/info.js`,
      data: { 
        filter: 'basic',
        patterns: ['hello_world', 'status', 'list', 'info'],
        study_files: ['status.js', 'list.js', 'info.js']
      }
    };
  }

  advancedExamples() {
    return {
      success: true,
      formatted_response: `🏗️  ADVANCED PLUGIN EXAMPLES

=== COMPLEX ARCHITECTURES AND PATTERNS ===

🔧 PLUGIN DEPENDENCY INJECTION:
   // @lev-os plugins demonstrate this pattern
   import { logger, tracer, monitor } from '@lev-os/debug'
   import { processManager } from '@lev-os/cmd'
   
   export class AdvancedPlugin {
     constructor() {
       this.logger = logger
       this.processManager = processManager
       this.monitor = monitor
     }
   }

⚡ STATE MANAGEMENT PATTERN:
   // Shared state across commands
   class PluginState {
     constructor() {
       this.sessions = new Map()
       this.cache = new Map()
     }
     
     getSession(id) {
       return this.sessions.get(id)
     }
   }

🔄 CROSS-COMMAND COMMUNICATION:
   // Commands access shared plugin state
   export default class StatusCommand {
     constructor(plugin) {
       this.plugin = plugin  // Access to shared state
     }
     
     async execute(args, options) {
       const state = this.plugin.getState()
       const metrics = this.plugin.monitor.getMetrics()
       // ... use shared state
     }
   }

🧪 INTEGRATION WITH OTHER PLUGINS:
   // @lev-os/workshop integrates with @lev-os plugins
   import { testFramework } from '@lev-os/testing'
   import { processManager } from '@lev-os/cmd'
   
   async testPlugin(pluginName) {
     return await testFramework.testPlugin(pluginName)
   }
   
   async createWorktree(name) {
     return await processManager.createWorktree(name)
   }

📊 PERFORMANCE MONITORING:
   // Built into @lev-os/debug
   async execute(args, options) {
     const trace = tracer.start('command-execution')
     
     try {
       const result = await this.doWork()
       trace.addEvent('work-completed')
       return result
     } finally {
       trace.end()
     }
   }

🔧 CONFIGURATION MANAGEMENT:
   // YAML-first configuration
   async loadConfig() {
     const configPath = './config/plugin.yaml'
     const config = yaml.load(await fs.readFile(configPath))
     return config
   }

🎯 ADVANCED FEATURES:
   • Async workflows
   • Event-driven architecture
   • Plugin interoperability
   • Performance optimization

📚 STUDY THESE IMPLEMENTATIONS:
   • plugins/@lev-os/debug/src/    - Full debugging system
   • packages/testing/src/  - Testing framework
   • packages/workshop/src/    - Integration patterns`,
      data: { 
        filter: 'advanced',
        patterns: ['dependency_injection', 'state_management', 'plugin_integration', 'performance_monitoring'],
        study_directories: ['@lev-os/debug/src/', 'packages/testing/src/', 'packages/workshop/src/']
      }
    };
  }

  productionExamples() {
    return {
      success: true,
      formatted_response: `🏆 PRODUCTION PLUGIN EXAMPLES

=== BATTLE-TESTED IMPLEMENTATIONS ===

🔍 @lev-os/debug (Universal Debugging):
   Features:
   • Universal logging across all plugins
   • Event tracing for command execution
   • Performance monitoring and optimization
   • LLM confidence tracking
   
   Commands:
   lev debug events             # System-wide event log
   lev debug plugins           # Plugin performance metrics
   lev debug llm               # LLM reasoning traces

🧪 @lev-os/testing (Plugin Validation):
   Features:
   • Comprehensive plugin testing framework
   • YAML configuration validation
   • Command routing verification
   • Performance benchmarking
   
   Commands:
   lev test plugin <name>      # Validate specific plugin
   lev test integration        # Cross-plugin compatibility
   lev test ecosystem          # Full ecosystem health

⚙️  @lev-os/cmd (Process Management):
   Features:
   • Ultra-lightweight process execution
   • Git worktree management
   • Job system integration
   • Constitutional validation
   
   Commands:
   lev cmd exec <command>      # Execute with tracking
   lev cmd worktree <action>   # Manage worktrees
   lev cmd jobs                # Job system integration

🎯 PRODUCTION QUALITIES:
   • Comprehensive error handling
   • Performance optimization
   • Extensive logging and monitoring
   • Integration testing
   • Documentation and examples

📊 USAGE STATISTICS:
   • @lev-os/debug: Used by ALL plugins
   • @lev-os/testing: 100% plugin validation
   • @lev-os/cmd: Core system operations

🔧 INTEGRATION PATTERNS:
   // Every plugin imports debug
   import { logger, tracer, monitor } from '@lev-os/debug'
   
   // Testing integration
   import { testFramework } from '@lev-os/testing'
   
   // Process management
   import { processManager } from '@lev-os/cmd'

💡 LEARN FROM THE BEST:
   These plugins demonstrate production-ready patterns you should follow in your own plugins.

📚 DEEP DIVE STUDY:
   • Read the source code in plugins/@lev-os/
   • Examine test suites and validation
   • Study integration patterns
   • Follow error handling approaches`,
      data: { 
        filter: 'production',
        plugins: ['@lev-os/debug', '@lev-os/testing', '@lev-os/cmd'],
        qualities: ['error_handling', 'performance', 'logging', 'testing', 'documentation']
      }
    };
  }

  debugExamples() {
    return {
      success: true,
      formatted_response: `🔍 DEBUG INTEGRATION EXAMPLES

=== @lev-os/debug PATTERNS ===

📋 BASIC LOGGING PATTERN:
   import { logger } from '@lev-os/debug'
   
   async execute(args, options) {
     logger.info('Command executed', { args, options })
     
     try {
       const result = await this.doWork()
       logger.debug('Work completed', { result })
       return result
     } catch (error) {
       logger.error('Command failed', { error: error.message })
       throw error
     }
   }

⏱️  EVENT TRACING PATTERN:
   import { tracer } from '@lev-os/debug'
   
   async execute(args, options) {
     const trace = tracer.start('workshop-command')
     trace.addEvent('command-started', { args })
     
     try {
       const result = await this.processCommand(args)
       trace.addEvent('processing-complete', { success: true })
       return result
     } finally {
       trace.end()
     }
   }

📊 PERFORMANCE MONITORING:
   import { monitor } from '@lev-os/debug'
   
   async execute(args, options) {
     const startTime = Date.now()
     
     try {
       const result = await this.doWork()
       const duration = Date.now() - startTime
       
       monitor.trackCommand('workshop-status', {
         success: true,
         duration,
         args_count: args.length
       })
       
       return result
     } catch (error) {
       monitor.trackCommand('workshop-status', {
         success: false,
         error: error.message
       })
       throw error
     }
   }

🧠 LLM CONFIDENCE TRACKING:
   logger.plugin('workshop', 'Classification decision', {
     tool: 'ultimate-mcp-server',
     tier: 1,
     confidence: 0.87,
     reasoning: 'Production-ready with comprehensive docs'
   })

🔧 SYSTEM-WIDE DEBUG COMMANDS:
   lev debug events                    # All system events
   lev debug plugins                   # Plugin performance
   lev debug events --filter=workshop # Workshop-specific events

📚 REAL IMPLEMENTATION:
   Study plugins/@lev-os/debug/src/ for complete implementation patterns`,
      data: { 
        filter: 'debug',
        patterns: ['basic_logging', 'event_tracing', 'performance_monitoring', 'llm_tracking'],
        commands: ['lev debug events', 'lev debug plugins']
      }
    };
  }

  testingExamples() {
    return {
      success: true,
      formatted_response: `🧪 TESTING INTEGRATION EXAMPLES

=== @lev-os/testing PATTERNS ===

🎯 PLUGIN VALIDATION PATTERN:
   import { testFramework } from '@lev-os/testing'
   
   // Workshop test command uses this
   async testPlugin(pluginName) {
     const result = await testFramework.testPlugin(pluginName, {
       suite: ['yaml', 'commands', 'integration'],
       verbose: true
     })
     
     return {
       success: result.success,
       formatted_response: this.formatTestResults(result),
       data: result
     }
   }

✅ VALIDATION PATTERNS:
   // Command validation
   await testFramework.testCommandRouting(plugin, ['status', 'list', 'info'])
   
   // YAML validation
   await testFramework.testYamlValidation(plugin)
   
   // Performance validation
   await testFramework.benchmarkPlugin(plugin, {
     type: ['execution', 'memory'],
     iterations: 5
   })

🔧 INTEGRATION TESTING:
   // Cross-plugin compatibility
   await testFramework.testIntegration({
     type: ['compatibility', 'commands', 'dataflow'],
     plugins: ['debug', 'testing', 'workshop']
   })

📊 SUCCESS CRITERIA PATTERN:
   const criteria = {
     commands_route_correctly: true,
     yaml_configuration_valid: true,
     no_namespace_conflicts: true,
     performance_within_thresholds: true
   }
   
   const success = await testFramework.evaluateSuccessCriteria(results, criteria)

🏗️  BDD WORKFLOW TESTING:
   // Test real user workflows
   const result = await executeCommand(['workshop', 'status'])
   expect(result.success).toBe(true)
   expect(result.formatted_response).toContain('WORKSHOP STATUS')

🎯 COMMUNITY PLUGIN VALIDATION:
   // Validate community plugins
   await testFramework.testCommunity({
     repository: 'github.com/user/awesome-plugin',
     compatibility: true
   })

📚 COMPLETE FRAMEWORK:
   Study packages/testing/src/ for full testing patterns and framework implementation`,
      data: { 
        filter: 'testing',
        patterns: ['plugin_validation', 'integration_testing', 'performance_benchmarking', 'community_validation'],
        framework_location: 'packages/testing/src/'
      }
    };
  }

  cmdExamples() {
    return {
      success: true,
      formatted_response: `⚙️  PROCESS MANAGEMENT EXAMPLES

=== @lev-os/cmd PATTERNS ===

🚀 PROCESS EXECUTION PATTERN:
   import { processManager } from '@lev-os/cmd'
   
   // Execute command with tracking
   async integrateToolWithGit(toolName) {
     const result = await processManager.execute([
       'git', 'clone', \`https://github.com/user/\${toolName}\`
     ], {
       cwd: './workshop/intake/',
       timeout: 30000
     })
     
     return result
   }

🌳 GIT WORKTREE MANAGEMENT:
   // Create isolated development environment
   async createPluginWorktree(pluginName) {
     const worktreePath = await processManager.createWorktree(
       pluginName,
       \`feature/\${pluginName}-development\`
     )
     
     return {
       success: true,
       worktree_path: worktreePath,
       formatted_response: \`Created worktree at \${worktreePath}\`
     }
   }

🔧 JOB SYSTEM INTEGRATION:
   // Long-running processes
   async startIntegrationPipeline(toolName, tier) {
     const jobId = await processManager.startJob('tool-integration', {
       tool: toolName,
       tier: tier,
       steps: ['clone', 'analyze', 'test', 'integrate']
     })
     
     return {
       success: true,
       job_id: jobId,
       formatted_response: \`Integration job started: \${jobId}\`
     }
   }

⚡ ULTRA-LIGHTWEIGHT APPROACH:
   // No PM2, just execa + ps-tree + tree-kill
   import execa from 'execa'
   import psTree from 'ps-tree'
   import treeKill from 'tree-kill'
   
   class ProcessManager {
     async execute(command, options = {}) {
       const process = execa(command[0], command.slice(1), options)
       this.trackProcess(process.pid)
       return await process
     }
   }

🛡️  CONSTITUTIONAL VALIDATION:
   // Before sensitive operations
   async validateBeforeExecution(command) {
     const isAllowed = await this.constitutionalValidator.validate(command)
     if (!isAllowed) {
       throw new Error('Command violates constitutional constraints')
     }
   }

📊 PROCESS MONITORING:
   lev cmd processes           # Show tracked processes
   lev cmd jobs               # Job system status
   lev cmd worktrees          # Active worktrees

📚 PRODUCTION USAGE:
   • Workshop plugin uses cmd for git operations
   • Tool integration pipelines
   • Plugin creation workflows
   • Background job management

🔧 IMPLEMENTATION STUDY:
   packages/commands/src/ contains full implementation patterns for process management`,
      data: { 
        filter: 'cmd',
        patterns: ['process_execution', 'worktree_management', 'job_integration', 'constitutional_validation'],
        commands: ['lev cmd processes', 'lev cmd jobs', 'lev cmd worktrees']
      }
    };
  }
}