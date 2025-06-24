#!/usr/bin/env node

/**
 * Workshop Info Command
 * 
 * Shows detailed information about a specific tool or plugin.
 * Demonstrates comprehensive data aggregation and LLM-friendly output.
 */

import { logger } from '@lev-os/debug';
import { promises as fs } from 'fs';
import path from 'path';

export default class InfoCommand {
  constructor() {
    this.description = 'Show detailed information about a specific tool';
    this.args = ['tool-name: Name of tool to get information about'];
  }

  /**
   * Execute info command
   */
  async execute(args = [], options = {}) {
    const toolName = args[0];
    
    if (!toolName) {
      return {
        success: false,
        error: 'Tool name is required. Usage: lev workshop info <tool-name>'
      };
    }

    logger.info('Executing workshop info command', { toolName, options });

    try {
      const toolInfo = await this.getToolInfo(toolName);
      
      if (!toolInfo) {
        return {
          success: false,
          error: `Tool not found: ${toolName}. Use 'lev workshop list' to see available tools.`
        };
      }

      if (options.json) {
        return {
          success: true,
          data: toolInfo,
          format: 'json'
        };
      }

      return {
        success: true,
        formatted_response: this.formatInfoOutput(toolInfo),
        data: toolInfo
      };

    } catch (error) {
      logger.error('Workshop info command failed', { error: error.message, toolName });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get comprehensive tool information
   */
  async getToolInfo(toolName) {
    // Try to find tool in various sources
    const sources = [
      () => this.findInTracker(toolName),
      () => this.findInPlugins(toolName),
      () => this.findInWorkshopDirs(toolName)
    ];

    for (const source of sources) {
      try {
        const toolInfo = await source();
        if (toolInfo) {
          // Enhance with additional metadata
          return await this.enhanceToolInfo(toolInfo);
        }
      } catch (error) {
        logger.debug('Source failed', { error: error.message });
      }
    }

    return null;
  }

  /**
   * Find tool in implementation tracker
   */
  async findInTracker(toolName) {
    const trackerPath = '../../../workshop/IMPLEMENTATION-TRACKER.csv';
    
    try {
      const content = await fs.readFile(trackerPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns[0]?.trim().toLowerCase() === toolName.toLowerCase()) {
          return {
            name: columns[0]?.trim(),
            tier: columns[1]?.trim(),
            status: columns[2]?.trim(),
            description: columns[3]?.trim(),
            source: 'implementation_tracker',
            type: 'tool'
          };
        }
      }
    } catch (error) {
      logger.debug('Could not access implementation tracker', { error: error.message });
    }

    return null;
  }

  /**
   * Find tool in plugins directory
   */
  async findInPlugins(toolName) {
    const pluginsPath = '../../';
    
    try {
      const namespaceDirs = await fs.readdir(pluginsPath);
      
      for (const namespaceDir of namespaceDirs) {
        if (namespaceDir.startsWith('@')) {
          const namespacePath = path.join(pluginsPath, namespaceDir);
          const pluginDirs = await fs.readdir(namespacePath);
          
          for (const pluginDir of pluginDirs) {
            const fullName = `${namespaceDir}/${pluginDir}`;
            if (fullName.toLowerCase().includes(toolName.toLowerCase()) || 
                pluginDir.toLowerCase() === toolName.toLowerCase()) {
              
              return await this.getPluginDetails(namespacePath, pluginDir, fullName);
            }
          }
        }
      }
    } catch (error) {
      logger.debug('Could not search plugins', { error: error.message });
    }

    return null;
  }

  /**
   * Find tool in workshop directories
   */
  async findInWorkshopDirs(toolName) {
    const workshopPath = '../../../workshop';
    const categories = ['essentials', 'foundations', 'accelerators', 'evaluation', 'mcp-ecosystem'];
    
    for (const category of categories) {
      try {
        const categoryPath = path.join(workshopPath, category);
        const items = await fs.readdir(categoryPath);
        
        for (const item of items) {
          if (item.toLowerCase().includes(toolName.toLowerCase())) {
            return await this.getDirectoryToolInfo(categoryPath, item, category);
          }
        }
      } catch (error) {
        logger.debug(`Could not search category ${category}`, { error: error.message });
      }
    }

    return null;
  }

  /**
   * Get plugin details from plugin directory
   */
  async getPluginDetails(namespacePath, pluginDir, fullName) {
    const pluginPath = path.join(namespacePath, pluginDir);
    const info = {
      name: fullName,
      type: 'plugin',
      source: 'plugin_directory',
      tier: '1', // Assume tier 1 for existing plugins
      status: 'production'
    };

    try {
      // Read package.json
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      info.description = packageJson.description;
      info.version = packageJson.version;
      info.dependencies = packageJson.dependencies;
      info.scripts = packageJson.scripts;

      // Read plugin config if available
      const configPath = path.join(pluginPath, 'config/plugin.yaml');
      try {
        const configContent = await fs.readFile(configPath, 'utf8');
        info.config_available = true;
        info.config_preview = configContent.substring(0, 200) + '...';
      } catch (configError) {
        info.config_available = false;
      }

      // Read README if available
      const readmePath = path.join(pluginPath, 'README.md');
      try {
        const readmeContent = await fs.readFile(readmePath, 'utf8');
        info.readme_available = true;
        info.readme_preview = readmeContent.substring(0, 300) + '...';
      } catch (readmeError) {
        info.readme_available = false;
      }

    } catch (error) {
      logger.debug('Could not read plugin details', { error: error.message });
    }

    return info;
  }

  /**
   * Get tool info from workshop directory
   */
  async getDirectoryToolInfo(categoryPath, itemName, category) {
    const itemPath = path.join(categoryPath, itemName);
    const info = {
      name: itemName,
      type: 'tool',
      source: 'workshop_directory',
      category: category,
      tier: this.inferTierFromCategory(category),
      status: 'evaluated'
    };

    try {
      const stats = await fs.stat(itemPath);
      info.is_directory = stats.isDirectory();
      info.last_modified = stats.mtime.toISOString();

      if (stats.isDirectory()) {
        // Count files in directory
        const files = await fs.readdir(itemPath);
        info.file_count = files.length;
        info.files = files.slice(0, 10); // Show first 10 files

        // Look for common files
        const commonFiles = ['README.md', 'package.json', 'Dockerfile', 'requirements.txt'];
        info.has_readme = files.some(f => f.toLowerCase().includes('readme'));
        info.has_package_json = files.includes('package.json');
        info.has_docker = files.includes('Dockerfile');
        info.has_requirements = files.includes('requirements.txt');

        // Try to read README for description
        if (info.has_readme) {
          const readmeFile = files.find(f => f.toLowerCase().includes('readme'));
          try {
            const readmePath = path.join(itemPath, readmeFile);
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            info.description = this.extractDescriptionFromReadme(readmeContent);
          } catch (readmeError) {
            logger.debug('Could not read README', { error: readmeError.message });
          }
        }
      }

    } catch (error) {
      logger.debug('Could not stat directory', { error: error.message });
    }

    return info;
  }

  /**
   * Enhance tool info with additional metadata
   */
  async enhanceToolInfo(toolInfo) {
    // Add tier information
    toolInfo.tier_info = this.getTierInfo(toolInfo.tier);
    
    // Add integration recommendations
    toolInfo.integration = this.getIntegrationRecommendations(toolInfo);
    
    // Add related tools
    toolInfo.related_tools = await this.findRelatedTools(toolInfo);
    
    return toolInfo;
  }

  /**
   * Get tier information
   */
  getTierInfo(tier) {
    const tierInfo = {
      '1': { name: 'PRODUCTION-READY', timeline: '1-2 weeks', priority: 'immediate' },
      '2': { name: 'ADVANCED-STABLE', timeline: '2-4 weeks', priority: 'high' },
      '3': { name: 'EMERGING-VIABLE', timeline: '3-6 weeks', priority: 'medium' },
      '4': { name: 'RESEARCH-READY', timeline: '4-8 weeks', priority: 'medium' },
      '5': { name: 'EXPERIMENTAL-PROMISING', timeline: '6-12 weeks', priority: 'low' },
      '6': { name: 'PROTOTYPE-STAGE', timeline: '8-16 weeks', priority: 'low' },
      '7': { name: 'CONCEPT-PROOF', timeline: '12+ weeks', priority: 'research' },
      '8': { name: 'EXPLORATORY', timeline: 'research only', priority: 'research' }
    };
    
    return tierInfo[tier] || { name: 'UNKNOWN', timeline: 'TBD', priority: 'unknown' };
  }

  /**
   * Get integration recommendations
   */
  getIntegrationRecommendations(toolInfo) {
    const recommendations = {
      next_steps: [],
      considerations: [],
      estimated_effort: 'unknown'
    };

    if (toolInfo.type === 'plugin') {
      recommendations.next_steps.push('Plugin already integrated in Leviathan ecosystem');
      recommendations.next_steps.push('Consider testing with @lev-os/testing framework');
      recommendations.estimated_effort = 'minimal';
    } else {
      const tier = parseInt(toolInfo.tier);
      if (tier <= 2) {
        recommendations.next_steps.push('High priority for integration');
        recommendations.next_steps.push('Review documentation and API compatibility');
        recommendations.next_steps.push('Create integration plan');
        recommendations.estimated_effort = 'low-medium';
      } else if (tier <= 4) {
        recommendations.next_steps.push('Evaluate for future integration');
        recommendations.next_steps.push('Assess community support and stability');
        recommendations.estimated_effort = 'medium';
      } else {
        recommendations.next_steps.push('Monitor for development progress');
        recommendations.next_steps.push('Consider for research projects');
        recommendations.estimated_effort = 'high';
      }
    }

    return recommendations;
  }

  /**
   * Find related tools
   */
  async findRelatedTools(toolInfo) {
    // Simple keyword matching for now
    const keywords = this.extractKeywords(toolInfo);
    return keywords.slice(0, 3); // Return top 3 keywords as "related" for demo
  }

  /**
   * Extract keywords from tool info
   */
  extractKeywords(toolInfo) {
    const text = `${toolInfo.name} ${toolInfo.description || ''}`.toLowerCase();
    const keywords = [];
    
    // Common tool categories
    if (text.includes('mcp')) keywords.push('MCP Protocol');
    if (text.includes('debug')) keywords.push('Debugging');
    if (text.includes('test')) keywords.push('Testing');
    if (text.includes('ai') || text.includes('llm')) keywords.push('AI/LLM');
    if (text.includes('agent')) keywords.push('Agent Systems');
    if (text.includes('plugin')) keywords.push('Plugin Development');
    
    return keywords;
  }

  /**
   * Extract description from README content
   */
  extractDescriptionFromReadme(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('[')) {
        return line.trim().substring(0, 100) + '...';
      }
    }
    return 'No description available';
  }

  /**
   * Infer tier from category
   */
  inferTierFromCategory(category) {
    const categoryTiers = {
      'essentials': '1',
      'foundations': '2', 
      'accelerators': '3',
      'evaluation': '4',
      'mcp-ecosystem': '2'
    };
    return categoryTiers[category] || '4';
  }

  /**
   * Format info output for CLI display
   */
  formatInfoOutput(toolInfo) {
    const lines = [];
    
    lines.push(`🔍 TOOL INFORMATION: ${toolInfo.name}`);
    lines.push('='.repeat(50));
    lines.push('');
    
    // Basic info
    lines.push('📋 BASIC INFORMATION');
    lines.push(`   Name: ${toolInfo.name}`);
    lines.push(`   Type: ${toolInfo.type}`);
    lines.push(`   Tier: ${toolInfo.tier} (${toolInfo.tier_info?.name})`);
    lines.push(`   Status: ${toolInfo.status}`);
    if (toolInfo.category) lines.push(`   Category: ${toolInfo.category}`);
    if (toolInfo.version) lines.push(`   Version: ${toolInfo.version}`);
    lines.push('');
    
    // Description
    if (toolInfo.description) {
      lines.push('📝 DESCRIPTION');
      lines.push(`   ${toolInfo.description}`);
      lines.push('');
    }
    
    // Tier information
    if (toolInfo.tier_info) {
      lines.push('🏗️  TIER INFORMATION');
      lines.push(`   Timeline: ${toolInfo.tier_info.timeline}`);
      lines.push(`   Priority: ${toolInfo.tier_info.priority}`);
      lines.push('');
    }
    
    // Integration recommendations
    if (toolInfo.integration) {
      lines.push('🔧 INTEGRATION RECOMMENDATIONS');
      lines.push(`   Estimated Effort: ${toolInfo.integration.estimated_effort}`);
      lines.push('   Next Steps:');
      for (const step of toolInfo.integration.next_steps) {
        lines.push(`     • ${step}`);
      }
      lines.push('');
    }
    
    // Technical details for plugins
    if (toolInfo.type === 'plugin') {
      lines.push('🔌 PLUGIN DETAILS');
      if (toolInfo.config_available) {
        lines.push('   ✅ Configuration file available');
      }
      if (toolInfo.readme_available) {
        lines.push('   ✅ Documentation available');
      }
      if (toolInfo.dependencies) {
        lines.push(`   Dependencies: ${Object.keys(toolInfo.dependencies).length} packages`);
      }
      lines.push('');
    }
    
    // Directory details for tools
    if (toolInfo.type === 'tool' && toolInfo.is_directory) {
      lines.push('📁 DIRECTORY DETAILS');
      lines.push(`   Files: ${toolInfo.file_count}`);
      if (toolInfo.has_readme) lines.push('   ✅ README available');
      if (toolInfo.has_package_json) lines.push('   ✅ package.json available');
      if (toolInfo.has_docker) lines.push('   ✅ Docker support');
      if (toolInfo.last_modified) lines.push(`   Last Modified: ${toolInfo.last_modified}`);
      lines.push('');
    }
    
    // Related tools
    if (toolInfo.related_tools && toolInfo.related_tools.length > 0) {
      lines.push('🔗 RELATED KEYWORDS');
      lines.push(`   ${toolInfo.related_tools.join(', ')}`);
      lines.push('');
    }
    
    lines.push(`Source: ${toolInfo.source}`);
    
    return lines.join('\n');
  }
}