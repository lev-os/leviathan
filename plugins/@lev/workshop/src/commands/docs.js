#!/usr/bin/env node

/**
 * Workshop Docs Command
 * 
 * Show documentation for specific topics.
 * Community documentation system.
 */

import { logger } from '@lev-os/debug';

export default class DocsCommand {
  constructor() {
    this.description = 'Show documentation for specific topics';
    this.args = ['topic: architecture|plugins|patterns|examples'];
  }

  async execute(args = [], options = {}) {
    const topic = args[0];
    
    if (!topic) {
      return {
        success: false,
        error: 'Topic is required. Available: architecture, plugins, patterns, examples'
      };
    }

    logger.info('Workshop docs command', { topic, options });

    const docs = {
      architecture: () => this.architectureDocs(),
      plugins: () => this.pluginDocs(),
      patterns: () => this.patternDocs(),
      examples: () => this.exampleDocs()
    };

    const docFunction = docs[topic];
    if (!docFunction) {
      return {
        success: false,
        error: `Unknown topic: ${topic}. Available: ${Object.keys(docs).join(', ')}`
      };
    }

    return docFunction();
  }

  architectureDocs() {
    return {
      success: true,
      formatted_response: `🏗️  LEVIATHAN ARCHITECTURE DOCUMENTATION

=== HEXAGONAL ARCHITECTURE PRINCIPLES ===

📋 CORE CONCEPT:
   Separation of business logic from external interfaces
   
   ┌─────────────────┐     ┌─────────────────┐
   │   Core SDK      │────▶│   Adapters      │
   │ (Business Logic)│     │ (CLI, MCP, API) │
   └─────────────────┘     └─────────────────┘

🔧 CORE SDK COMPONENTS:
   • src/core/agents/     - Agent management
   • src/core/sessions/   - Session lifecycle
   • src/core/discovery/  - Context search

🔌 ADAPTER PATTERN:
   • CLI Adapter: Command-line interface
   • MCP Adapter: Model Context Protocol server
   • Future: REST API, GraphQL, gRPC

📦 PLUGIN INTEGRATION:
   • Namespace isolation: lev <plugin> <command>
   • Auto-MCP bootstrap: Commands → MCP tools
   • Core SDK access: Direct function imports
   • Testing integration: @lev-os/testing framework

🎯 BENEFITS:
   • Easy testing and validation
   • Multiple interface support
   • Clean separation of concerns
   • Community extensibility

🔗 RELATED:
   • lev workshop docs plugins  - Plugin development guide
   • lev workshop docs patterns - Common patterns
   • lev workshop examples     - Working examples`,
      data: { topic: 'architecture', related: ['plugins', 'patterns', 'examples'] }
    };
  }

  pluginDocs() {
    return {
      success: true,
      formatted_response: `🔌 PLUGIN DEVELOPMENT DOCUMENTATION

=== PLUGIN CREATION GUIDE ===

📋 PLUGIN STRUCTURE:
   @your-org/plugin-name/
   ├── package.json              # NPM package metadata
   ├── config/plugin.yaml        # Plugin configuration
   ├── src/
   │   ├── index.js              # Main plugin class
   │   └── commands/             # Command implementations
   ├── tests/                    # Plugin tests
   └── README.md                 # Documentation

🚀 PLUGIN CLASS PATTERN:
   export class YourPlugin {
     constructor() {
       this.namespace = 'your-plugin'
       this.commands = new Map()
     }
     
     async register(commandRegistry) {
       // Register commands with CLI adapter
     }
     
     async execute(commandName, args, options) {
       // Route to command handlers
     }
   }

🔧 COMMAND IMPLEMENTATION:
   export default class YourCommand {
     constructor() {
       this.description = 'Your command description'
       this.args = ['arg1: Description']
       this.options = ['--option: Description']
     }
     
     async execute(args, options) {
       // Command logic here
       return { success: true, formatted_response: 'Result' }
     }
   }

📋 YAML CONFIGURATION:
   plugin:
     name: your-plugin
     namespace: your-plugin
     description: 'Plugin description'
   
   commands:
     your-command:
       syntax: 'lev your-plugin your-command <args>'
       description: 'Command description'

🧪 TESTING INTEGRATION:
   • Use @lev-os/testing framework
   • Follow existing test patterns
   • Validate with workshop command

🔗 RELATED:
   • lev workshop create plugin <name> - Generate template
   • lev workshop test <plugin>       - Validate plugin
   • lev workshop examples           - See working examples`,
      data: { topic: 'plugins', related: ['patterns', 'examples', 'architecture'] }
    };
  }

  patternDocs() {
    return {
      success: true,
      formatted_response: `🎨 LEVIATHAN DESIGN PATTERNS

=== COMMON PLUGIN PATTERNS ===

🔧 COMMAND REGISTRATION PATTERN:
   // Auto-registration with CLI adapter
   async register(commandRegistry) {
     for (const [name, handler] of this.commands) {
       await commandRegistry.register(
         \`\${this.namespace} \${name}\`,
         handler.execute.bind(handler),
         { description: handler.description }
       )
     }
   }

📊 STRUCTURED OUTPUT PATTERN:
   // LLM-friendly responses
   return {
     success: true,
     formatted_response: 'Human-readable output',
     data: { structured: 'data' }
   }

🧪 TESTING PATTERN:
   // Real workflow validation
   const result = await plugin.execute('command', args, options)
   expect(result.success).toBe(true)
   expect(result.formatted_response).toContain('expected')

🔍 DEBUG INTEGRATION PATTERN:
   import { logger } from '@lev-os/debug'
   
   async execute(args, options) {
     logger.info('Command executed', { args, options })
     // ... command logic
   }

📦 DEPENDENCY PATTERN:
   // Use existing Leviathan infrastructure
   import { processManager } from '@lev-os/cmd'
   import { testFramework } from '@lev-os/testing'

🔄 ERROR HANDLING PATTERN:
   try {
     // Command logic
     return { success: true, data: result }
   } catch (error) {
     logger.error('Command failed', { error: error.message })
     return { success: false, error: error.message }
   }

🎯 NAMESPACE PATTERN:
   // Automatic conflict prevention
   lev <plugin> <command>  // CLI
   plugin_command          // MCP tool

🔗 RELATED:
   • lev workshop docs plugins     - Plugin development
   • lev workshop examples        - Working implementations
   • @lev-os/debug, testing, cmd - Infrastructure plugins`,
      data: { topic: 'patterns', related: ['plugins', 'examples', 'architecture'] }
    };
  }

  exampleDocs() {
    return {
      success: true,
      formatted_response: `💡 PLUGIN EXAMPLES DOCUMENTATION

=== WORKING PLUGIN EXAMPLES ===

🔌 EXISTING PLUGINS:

📋 @lev-os/debug (Tier 1 - Production)
   • Universal logging and tracing
   • Performance monitoring
   • LLM confidence tracking
   • Commands: lev debug events, lev debug plugins

🧪 @lev-os/testing (Tier 1 - Production)
   • Plugin validation framework
   • Compatibility testing
   • Performance benchmarking
   • Commands: lev test plugin <name>

⚙️  @lev-os/cmd (Tier 1 - Production)
   • Process management
   • Git worktree operations
   • Job system integration
   • Commands: lev cmd exec, lev cmd worktree

🔧 @lev/workshop (Tier 2 - Development)
   • Tool integration automation
   • Plugin creation system
   • Community onboarding
   • Commands: lev workshop status, create, test

🎯 EXAMPLE COMMAND PATTERNS:

STATUS COMMAND:
   • Show system overview
   • Structured JSON output option
   • Integration with existing data

LIST COMMAND:
   • Filter and sort items
   • Multiple output formats
   • Tier-based organization

INFO COMMAND:
   • Detailed item information
   • Related item suggestions
   • Integration recommendations

CREATE COMMAND:
   • Template generation
   • Git worktree integration
   • Validation checks

🔗 USAGE EXAMPLES:
   lev workshop status --json          # JSON output
   lev workshop list --tier=1          # Filter by tier
   lev workshop info ultimate-mcp      # Tool details
   lev workshop create plugin hello    # Generate template

📚 STUDY THESE IMPLEMENTATIONS:
   • plugins/@lev-os/debug/src/commands/
   • plugins/@lev-os/testing/src/
   • plugins/@lev/workshop/src/commands/

🔗 RELATED:
   • lev workshop docs plugins   - Development guide
   • lev workshop docs patterns  - Common patterns
   • lev workshop list          - See all tools`,
      data: { 
        topic: 'examples', 
        example_plugins: ['@lev-os/debug', '@lev-os/testing', '@lev-os/cmd', '@lev/workshop'],
        related: ['plugins', 'patterns', 'architecture']
      }
    };
  }
}