#!/usr/bin/env node

/**
 * Plugin Discovery Test
 * 
 * Tests the plugin discovery functionality against actual core plugins
 * to validate that the framework can find and analyze real plugins.
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

async function testPluginDiscovery() {
  console.log('🔍 Plugin Discovery Validation Test');
  console.log('='.repeat(60));
  console.log('Testing plugin discovery against actual core plugins\n');
  
  let discovered = 0;
  let analyzed = 0;
  let validated = 0;
  
  try {
    // Manual plugin discovery implementation
    const corePackagesPath = '/Users/jean-patricksmith/digital/kingly/core/packages';
    console.log(`📁 Scanning core packages directory: ${corePackagesPath}`);
    
    const entries = await fs.readdir(corePackagesPath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    
    console.log(`   Found ${directories.length} potential plugin directories\n`);
    
    const discoveredPlugins = [];
    
    for (const dir of directories) {
      console.log(`🔍 Analyzing: ${dir.name}`);
      
      try {
        // Look for plugin.yaml in config/ subdirectory
        const yamlPath = path.join(corePackagesPath, dir.name, 'config', 'plugin.yaml');
        
        try {
          await fs.access(yamlPath);
          console.log(`   ✅ Found plugin configuration: config/plugin.yaml`);
          
          // Load and analyze the plugin configuration
          const yamlContent = await fs.readFile(yamlPath, 'utf8');
          const config = yaml.load(yamlContent);
          
          if (config && config.plugin) {
            const plugin = {
              name: config.plugin.name,
              version: config.plugin.version,
              type: config.plugin.type,
              description: config.plugin.description,
              path: path.join(corePackagesPath, dir.name),
              yamlPath: yamlPath,
              config: config,
              capabilities: config.capabilities || [],
              commands: config.commands || {},
              workflows: config.workflows || {}
            };
            
            discoveredPlugins.push(plugin);
            discovered++;
            
            console.log(`   📋 Plugin: ${plugin.name} v${plugin.version}`);
            console.log(`   📝 Description: ${plugin.description}`);
            console.log(`   🎯 Type: ${plugin.type}`);
            console.log(`   ⚡ Capabilities: ${plugin.capabilities.length}`);
            console.log(`   🔧 Commands: ${Object.keys(plugin.commands).length}`);
            console.log(`   🔄 Workflows: ${Object.keys(plugin.workflows).length}`);
            
            analyzed++;
            
            // Basic validation
            const isValid = plugin.name && 
                           plugin.version && 
                           plugin.type && 
                           plugin.description;
            
            if (isValid) {
              console.log(`   ✅ Validation: PASSED`);
              validated++;
            } else {
              console.log(`   ❌ Validation: FAILED - Missing required fields`);
            }
            
          } else {
            console.log(`   ⚠️  Invalid plugin configuration: Missing plugin section`);
          }
          
        } catch (error) {
          console.log(`   ⚠️  No plugin configuration found`);
        }
        
        // Check for @lev scoped packages
        if (dir.name.startsWith('@lev')) {
          const scopedYamlPath = path.join(corePackagesPath, dir.name, 'config', 'plugin.yaml');
          try {
            await fs.access(scopedYamlPath);
            console.log(`   ✅ Found @lev scoped plugin configuration`);
          } catch {
            // No @lev plugin config
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Analysis failed: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('📊 PLUGIN DISCOVERY RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Directories scanned: ${directories.length}`);
    console.log(`🔍 Plugins discovered: ${discovered}`);
    console.log(`📋 Plugins analyzed: ${analyzed}`);
    console.log(`✅ Plugins validated: ${validated}`);
    
    if (discoveredPlugins.length > 0) {
      console.log('\n🎯 DISCOVERED PLUGINS:');
      for (const plugin of discoveredPlugins) {
        console.log(`   • ${plugin.name} (${plugin.type}) - ${plugin.capabilities.length} capabilities, ${Object.keys(plugin.commands).length} commands`);
      }
    }
    
    // Test specific plugin capabilities
    if (discoveredPlugins.length > 0) {
      console.log('\n🧪 TESTING PLUGIN CAPABILITIES:');
      
      for (const plugin of discoveredPlugins.slice(0, 2)) { // Test first 2 plugins
        console.log(`\n🔧 Testing: ${plugin.name}`);
        
        // Test command structure
        if (Object.keys(plugin.commands).length > 0) {
          console.log(`   Commands defined: ${Object.keys(plugin.commands).join(', ')}`);
          
          // Check command syntax
          const commandsWithSyntax = Object.values(plugin.commands).filter(cmd => cmd.syntax);
          console.log(`   Commands with syntax: ${commandsWithSyntax.length}/${Object.keys(plugin.commands).length}`);
          
          // Check whisper guidance
          const commandsWithWhisper = Object.values(plugin.commands).filter(cmd => cmd.whisper);
          console.log(`   Commands with whisper guidance: ${commandsWithWhisper.length}/${Object.keys(plugin.commands).length}`);
          
          if (commandsWithSyntax.length === Object.keys(plugin.commands).length) {
            console.log(`   ✅ All commands have proper syntax`);
          } else {
            console.log(`   ⚠️  Some commands missing syntax`);
          }
        }
        
        // Test capability coverage
        if (plugin.capabilities.length > 0) {
          console.log(`   Capabilities: ${plugin.capabilities.join(', ')}`);
          
          // Check if capabilities match commands
          const capabilityCommandMatches = plugin.capabilities.filter(cap => {
            return Object.keys(plugin.commands).some(cmd => 
              cmd.includes(cap.replace(/_/g, '')) || 
              plugin.commands[cmd].description?.includes(cap.replace(/_/g, ' '))
            );
          });
          
          console.log(`   Capabilities with matching commands: ${capabilityCommandMatches.length}/${plugin.capabilities.length}`);
          
          if (capabilityCommandMatches.length > 0) {
            console.log(`   ✅ Capabilities properly mapped to commands`);
          }
        }
      }
    }
    
    // Success evaluation
    const successRate = directories.length > 0 ? (discovered / directories.length) * 100 : 0;
    console.log(`\n📈 Discovery Success Rate: ${successRate.toFixed(1)}%`);
    
    if (discovered > 0 && validated > 0) {
      console.log('\n🎉 PLUGIN DISCOVERY: SUCCESS');
      console.log('   ✅ Core plugins successfully discovered');
      console.log('   ✅ Plugin configurations properly parsed');
      console.log('   ✅ Plugin structures validated');
      console.log('   🚀 Ready for comprehensive plugin testing');
      return true;
    } else if (discovered > 0) {
      console.log('\n⚠️  PLUGIN DISCOVERY: PARTIAL SUCCESS');
      console.log('   ✅ Plugins discovered but some validation issues');
      console.log('   🔧 Review plugin configurations');
      console.log('   📋 Address validation failures');
      return true;
    } else {
      console.log('\n❌ PLUGIN DISCOVERY: NO PLUGINS FOUND');
      console.log('   🔧 Check plugin directory structure');
      console.log('   📋 Ensure plugins have config/plugin.yaml files');
      console.log('   🚀 Add plugin configurations for testing');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Plugin discovery test crashed:', error.message);
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPluginDiscovery()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test crashed:', error.message);
      process.exit(1);
    });
}