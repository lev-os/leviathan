#!/usr/bin/env node

/**
 * Workshop Onboard Command
 * 
 * Interactive community onboarding guide.
 * Community-focused implementation.
 */

import { logger } from '@lev-os/debug';

export default class OnboardCommand {
  constructor() {
    this.description = 'Interactive community onboarding guide';
    this.args = ['step: Specific onboarding step (optional)'];
  }

  async execute(args = [], options = {}) {
    const step = args[0];
    
    logger.info('Workshop onboard command', { step, options });

    if (step) {
      return this.executeStep(step);
    }

    return {
      success: true,
      formatted_response: this.getOnboardingGuide(),
      data: {
        action: 'onboarding_guide',
        available_steps: ['architecture', 'setup', 'first-plugin', 'testing', 'community']
      }
    };
  }

  executeStep(step) {
    const steps = {
      architecture: () => this.architectureStep(),
      setup: () => this.setupStep(),
      'first-plugin': () => this.firstPluginStep(),
      testing: () => this.testingStep(),
      community: () => this.communityStep()
    };

    const stepFunction = steps[step];
    if (!stepFunction) {
      return {
        success: false,
        error: `Unknown step: ${step}. Available: ${Object.keys(steps).join(', ')}`
      };
    }

    return stepFunction();
  }

  getOnboardingGuide() {
    return `🎯 WELCOME TO LEVIATHAN PLUGIN DEVELOPMENT

=== COMMUNITY ONBOARDING GUIDE ===

👋 Welcome to the Leviathan ecosystem! This guide will help you become a productive plugin developer.

📚 LEARNING PATH:
   1. Architecture   → lev workshop onboard architecture
   2. Setup         → lev workshop onboard setup  
   3. First Plugin  → lev workshop onboard first-plugin
   4. Testing       → lev workshop onboard testing
   5. Community     → lev workshop onboard community

🚀 QUICK START:
   • lev workshop docs architecture    - Learn hexagonal architecture
   • lev workshop examples            - See working plugin examples
   • lev workshop create plugin hello - Create your first plugin
   • lev workshop test hello          - Validate your plugin

💡 SUPPORT:
   • Documentation: lev workshop docs <topic>
   • Examples: lev workshop examples
   • Tutorials: lev workshop tutorial <level>

Ready to build amazing plugins? Let's start with the architecture!`;
  }

  architectureStep() {
    return {
      success: true,
      formatted_response: `🏗️  LEVIATHAN ARCHITECTURE

=== HEXAGONAL ARCHITECTURE ===

📋 CORE CONCEPT:
   Leviathan uses hexagonal architecture (ports and adapters pattern)
   
   Core SDK (Business Logic) ←→ Adapters (CLI, MCP, API)
   
📦 PLUGIN ARCHITECTURE:
   • Namespace Isolation: lev <plugin> <command>
   • Auto-MCP Bootstrap: Commands become MCP tools automatically
   • Core SDK Integration: Use existing business logic functions
   • Debugging Ready: @lev-os/debug for logging and tracing

🔌 PLUGIN STRUCTURE:
   @your-org/your-plugin/
   ├── package.json              # Plugin metadata
   ├── config/plugin.yaml        # YAML-first configuration
   ├── src/
   │   ├── index.js              # Plugin entry point
   │   └── commands/             # Individual command handlers
   └── tests/                    # Plugin validation tests

🎯 KEY BENEFITS:
   • Clean separation of concerns
   • Easy testing and validation
   • Automatic CLI and MCP integration
   • Community extension patterns

Next: lev workshop onboard setup`,
      data: { step: 'architecture_complete' }
    };
  }

  setupStep() {
    return {
      success: true,
      formatted_response: `⚙️  DEVELOPMENT SETUP

=== REQUIRED TOOLS ===

📋 PREREQUISITES:
   • Node.js 18.0.0 or later
   • pnpm package manager
   • Git for version control
   • Code editor with JavaScript support

🚀 LEVIATHAN SETUP:
   1. Clone Leviathan repository
   2. Install dependencies: pnpm install
   3. Verify installation: npm test
   4. Start development: npm run dev

🔧 PLUGIN DEVELOPMENT:
   1. Create plugin directory: plugins/@your-org/plugin-name/
   2. Initialize package.json with proper metadata
   3. Create config/plugin.yaml for command definitions
   4. Implement src/index.js with plugin class

🧪 TESTING SETUP:
   • @lev-os/testing framework available
   • Follow existing test patterns
   • Validate with: lev workshop test <plugin>

💡 TIPS:
   • Use existing plugins as templates
   • Follow namespace conventions
   • Integrate with @lev-os/debug for logging

Next: lev workshop onboard first-plugin`,
      data: { step: 'setup_complete' }
    };
  }

  firstPluginStep() {
    return {
      success: true,
      formatted_response: `🎉 YOUR FIRST PLUGIN

=== HELLO WORLD PLUGIN ===

🚀 CREATE YOUR PLUGIN:
   lev workshop create plugin hello-world

📋 PLUGIN STRUCTURE CREATED:
   @your-org/hello-world/
   ├── package.json
   ├── config/plugin.yaml
   ├── src/index.js
   └── tests/

🔧 IMPLEMENT COMMANDS:
   • Edit src/commands/greet.js
   • Add lev hello-world greet functionality
   • Test with plugin validation framework

🧪 VALIDATE YOUR WORK:
   lev workshop test hello-world

🎯 LEARNING OUTCOMES:
   • Understanding plugin structure
   • Command registration patterns
   • CLI adapter integration
   • Testing workflow

💡 EXAMPLE USAGE:
   After creation: lev hello-world greet "World"
   Expected output: "Hello, World!"

Next: lev workshop onboard testing`,
      data: { step: 'first_plugin_complete' }
    };
  }

  testingStep() {
    return {
      success: true,
      formatted_response: `🧪 TESTING YOUR PLUGINS

=== VALIDATION FRAMEWORK ===

🔬 TESTING APPROACH:
   Leviathan uses real workflow validation, not just unit tests
   
📋 TEST TYPES:
   • Plugin Structure: YAML config, package.json validation
   • Command Routing: CLI integration testing
   • Functionality: Real command execution tests
   • Performance: Benchmarking and optimization

🚀 USING @lev-os/testing:
   import { KinglyTestingFramework } from '@lev-os/testing'
   
   // Discover and test your plugin
   const framework = new KinglyTestingFramework()
   await framework.testPlugin('your-plugin-name')

🔧 WORKSHOP INTEGRATION:
   lev workshop test <plugin-name>
   
   Automatically runs:
   • Configuration validation
   • Command routing tests
   • Integration compatibility
   • Performance benchmarks

✅ SUCCESS CRITERIA:
   • All commands route correctly
   • YAML configuration valid
   • No namespace conflicts
   • Performance within thresholds

Next: lev workshop onboard community`,
      data: { step: 'testing_complete' }
    };
  }

  communityStep() {
    return {
      success: true,
      formatted_response: `🤝 COMMUNITY CONTRIBUTION

=== SHARING YOUR PLUGIN ===

🌟 PUBLICATION GUIDELINES:
   • Follow semantic versioning
   • Include comprehensive README
   • Add MIT license
   • Tag with 'leviathan-plugin' topic

📦 PACKAGE NAMING:
   • Use @your-org/plugin-name format
   • Follow namespace conventions
   • Avoid conflicts with existing plugins

🚀 CONTRIBUTION PROCESS:
   1. Develop and test locally
   2. Publish to npm registry
   3. Submit to community showcase
   4. Share with community

🧪 VALIDATION REQUIREMENTS:
   • Pass @lev-os/testing validation
   • No command name conflicts
   • Compatible with current Leviathan version
   • Performance benchmarks met

🎯 COMMUNITY BENEFITS:
   • Your plugin automatically gets MCP support
   • CLI integration out of the box
   • Debugging and testing infrastructure
   • Community discovery and adoption

🏆 CONGRATULATIONS!
   You're ready to contribute to the Leviathan ecosystem!
   
   Resources:
   • Documentation: lev workshop docs
   • Examples: lev workshop examples
   • Support: Community forums and GitHub`,
      data: { step: 'community_complete', onboarding_finished: true }
    };
  }
}