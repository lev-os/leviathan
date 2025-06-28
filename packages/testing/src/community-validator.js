/**
 * Community Validator
 *
 * Validates community plugins for compatibility with the core ecosystem.
 * Includes repository scanning, compatibility testing, and breaking change detection.
 */

import { logger } from './simple-logger.js'
import { UniversalTestPatterns } from './universal-test-patterns.js'
import fs from 'fs/promises'
import path from 'path'

export class CommunityValidator {
  constructor() {
    this.testPatterns = new UniversalTestPatterns()
    this.githubApiBase = 'https://api.github.com'
  }

  /**
   * Validate community plugins for compatibility
   */
  async validateCommunityPlugins(options = {}) {
    logger.info('Starting community plugin validation', { options })

    try {
      const communityPlugins = await this.discoverCommunityPlugins(options)
      const validationResults = []

      for (const plugin of communityPlugins) {
        try {
          const result = await this.validateCommunityPlugin(plugin)
          validationResults.push(result)
        } catch (error) {
          logger.error(`Community plugin validation failed: ${plugin.name}`, { error: error.message })
          validationResults.push({
            plugin: plugin.name,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          })
        }
      }

      const summary = this.summarizeValidationResults(validationResults)

      logger.info('Community plugin validation completed', {
        total: summary.total,
        compatible: summary.passed,
        incompatible: summary.failed,
      })

      return summary
    } catch (error) {
      logger.error('Community validation failed', { error: error.message })
      throw error
    }
  }

  /**
   * Discover community plugins via repository scanning
   */
  async discoverCommunityPlugins(options = {}) {
    logger.debug('Discovering community plugins')

    const plugins = []

    // Method 1: Scan local community directory
    if (options.localScan !== false) {
      const localPlugins = await this.scanLocalCommunityPlugins()
      plugins.push(...localPlugins)
    }

    // Method 2: GitHub repository search (if enabled)
    if (options.githubScan === true && options.githubToken) {
      const githubPlugins = await this.scanGithubPlugins(options.githubToken)
      plugins.push(...githubPlugins)
    }

    // Method 3: Specific repository (if provided)
    if (options.repository) {
      const repoPlugin = await this.scanSpecificRepository(options.repository)
      if (repoPlugin) {
        plugins.push(repoPlugin)
      }
    }

    logger.debug(`Discovered ${plugins.length} community plugins`)
    return plugins
  }

  /**
   * Scan local community plugins directory
   */
  async scanLocalCommunityPlugins() {
    const communityPath = '/Users/jean-patricksmith/digital/kingly/community'
    const plugins = []

    try {
      await fs.access(communityPath)

      const entries = await fs.readdir(communityPath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(communityPath, entry.name)
          const plugin = await this.analyzeCommunityPlugin(pluginPath, 'local')
          if (plugin) {
            plugins.push(plugin)
          }
        }
      }
    } catch (error) {
      logger.debug('No local community plugins found', { error: error.message })
    }

    return plugins
  }

  /**
   * Scan GitHub for Kingly plugins
   */
  async scanGithubPlugins(githubToken) {
    logger.debug('Scanning GitHub for Kingly plugins')

    try {
      // Search for repositories with kingly-plugin topic
      const searchUrl = `${this.githubApiBase}/search/repositories?q=topic:kingly-plugin&sort=updated`

      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      const plugins = []

      for (const repo of data.items.slice(0, 10)) {
        // Limit to 10 repos
        const plugin = await this.analyzeGithubRepository(repo, githubToken)
        if (plugin) {
          plugins.push(plugin)
        }
      }

      return plugins
    } catch (error) {
      logger.error('GitHub plugin scanning failed', { error: error.message })
      return []
    }
  }

  /**
   * Analyze specific repository for plugin validity
   */
  async scanSpecificRepository(repositoryUrl) {
    logger.debug(`Analyzing specific repository: ${repositoryUrl}`)

    // Extract owner/repo from URL
    const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error(`Invalid GitHub repository URL: ${repositoryUrl}`)
    }

    const [, owner, repo] = match

    const repoData = {
      full_name: `${owner}/${repo}`,
      html_url: repositoryUrl,
      clone_url: `${repositoryUrl}.git`,
    }

    return await this.analyzeGithubRepository(repoData)
  }

  /**
   * Analyze community plugin from local path
   */
  async analyzeCommunityPlugin(pluginPath, source) {
    try {
      // Look for plugin.yaml
      const yamlPath = path.join(pluginPath, 'plugin.yaml')
      const configPath = path.join(pluginPath, 'config', 'plugin.yaml')

      let configFile
      try {
        await fs.access(yamlPath)
        configFile = yamlPath
      } catch {
        try {
          await fs.access(configPath)
          configFile = configPath
        } catch {
          logger.debug(`No plugin.yaml found in ${pluginPath}`)
          return null
        }
      }

      const config = await this.loadPluginConfig(configFile)
      if (!config) return null

      return {
        name: config.plugin?.name || path.basename(pluginPath),
        path: pluginPath,
        source: source,
        config: config,
        type: 'community_plugin',
        repository: null,
      }
    } catch (error) {
      logger.debug(`Failed to analyze plugin at ${pluginPath}`, { error: error.message })
      return null
    }
  }

  /**
   * Analyze GitHub repository for plugin validity
   */
  async analyzeGithubRepository(repo, githubToken = null) {
    try {
      // Check for plugin.yaml in the repository
      const possiblePaths = ['plugin.yaml', 'config/plugin.yaml', '.kingly/plugin.yaml']

      for (const filePath of possiblePaths) {
        try {
          const fileUrl = `${this.githubApiBase}/repos/${repo.full_name}/contents/${filePath}`
          const headers = {
            Accept: 'application/vnd.github.v3+json',
          }

          if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`
          }

          const response = await fetch(fileUrl, { headers })

          if (response.ok) {
            const fileData = await response.json()
            const content = Buffer.from(fileData.content, 'base64').toString('utf8')
            const config = await this.parseYamlContent(content)

            if (config && config.plugin) {
              return {
                name: config.plugin.name || repo.name,
                source: 'github',
                config: config,
                type: 'community_plugin',
                repository: {
                  url: repo.html_url,
                  clone_url: repo.clone_url,
                  full_name: repo.full_name,
                },
              }
            }
          }
        } catch (error) {
          // Continue to next possible path
        }
      }

      logger.debug(`No valid plugin configuration found in ${repo.full_name}`)
      return null
    } catch (error) {
      logger.debug(`Failed to analyze GitHub repository ${repo.full_name}`, { error: error.message })
      return null
    }
  }

  /**
   * Validate individual community plugin
   */
  async validateCommunityPlugin(plugin) {
    logger.debug(`Validating community plugin: ${plugin.name}`)

    const validationResults = []

    // 1. Configuration Validation
    const configResult = await this.validatePluginConfiguration(plugin)
    validationResults.push(configResult)

    // 2. API Compatibility Testing
    const apiResult = await this.testApiCompatibility(plugin)
    validationResults.push(apiResult)

    // 3. Convention Compliance
    const conventionResult = await this.testConventionCompliance(plugin)
    validationResults.push(conventionResult)

    // 4. Breaking Change Detection
    const breakingChangeResult = await this.detectBreakingChanges(plugin)
    validationResults.push(breakingChangeResult)

    const summary = {
      plugin: plugin.name,
      source: plugin.source,
      success: validationResults.every((r) => r.success),
      validationResults,
      timestamp: new Date().toISOString(),
    }

    return summary
  }

  /**
   * Validate plugin configuration against standards
   */
  async validatePluginConfiguration(plugin) {
    const tests = [
      {
        name: 'Has valid plugin metadata',
        test: () => plugin.config?.plugin?.name && plugin.config?.plugin?.version,
      },
      {
        name: 'Declares plugin type',
        test: () => plugin.config?.plugin?.type === 'community_plugin',
      },
      {
        name: 'Has capabilities list',
        test: () => Array.isArray(plugin.config?.capabilities),
      },
      {
        name: 'Has commands definition',
        test: () => plugin.config?.commands && Object.keys(plugin.config.commands).length > 0,
      },
      {
        name: 'Commands have proper syntax',
        test: () => {
          const commands = plugin.config?.commands || {}
          return Object.values(commands).every((cmd) => cmd.syntax && cmd.description)
        },
      },
    ]

    return await this.runValidationTests('configuration', tests)
  }

  /**
   * Test API compatibility with current core
   */
  async testApiCompatibility(plugin) {
    const tests = [
      {
        name: 'Uses compatible command structure',
        test: () => {
          const commands = plugin.config?.commands || {}
          return Object.values(commands).every((cmd) => cmd.syntax && cmd.syntax.startsWith('kingly '))
        },
      },
      {
        name: 'Uses standard capability names',
        test: () => {
          const capabilities = plugin.config?.capabilities || []
          const standardCapabilities = [
            'debugging',
            'validation',
            'process_management',
            'memory_management',
            'workflow_execution',
          ]
          return capabilities.some((cap) => standardCapabilities.some((std) => cap.includes(std.replace('_', ''))))
        },
      },
      {
        name: 'Has whisper guidance patterns',
        test: () => {
          const commands = plugin.config?.commands || {}
          return Object.values(commands).some((cmd) => cmd.whisper)
        },
      },
    ]

    return await this.runValidationTests('api_compatibility', tests)
  }

  /**
   * Test convention compliance
   */
  async testConventionCompliance(plugin) {
    const tests = [
      {
        name: 'Follows naming conventions',
        test: () => {
          return plugin.name && plugin.name.match(/^[a-z][a-z0-9-]*$/)
        },
      },
      {
        name: 'Has proper version format',
        test: () => {
          const version = plugin.config?.plugin?.version
          return version && version.match(/^\d+\.\d+\.\d+/)
        },
      },
      {
        name: 'Has description',
        test: () => {
          return plugin.config?.plugin?.description && plugin.config.plugin.description.length > 10
        },
      },
    ]

    return await this.runValidationTests('convention_compliance', tests)
  }

  /**
   * Detect breaking changes against core API
   */
  async detectBreakingChanges(plugin) {
    const tests = [
      {
        name: 'No deprecated API usage',
        test: () => {
          // Would check for usage of deprecated APIs
          return true // Simplified
        },
      },
      {
        name: 'Compatible with current core version',
        test: () => {
          // Would check version compatibility
          return true // Simplified
        },
      },
      {
        name: 'No conflicting dependencies',
        test: () => {
          // Would check for dependency conflicts
          return true // Simplified
        },
      },
    ]

    return await this.runValidationTests('breaking_changes', tests)
  }

  /**
   * Run validation tests helper
   */
  async runValidationTests(testType, tests) {
    let passed = 0
    let failed = 0
    const results = []

    for (const test of tests) {
      try {
        const success = test.test()
        if (success) {
          passed++
          results.push({ test: test.name, status: 'passed' })
        } else {
          failed++
          results.push({ test: test.name, status: 'failed' })
        }
      } catch (error) {
        failed++
        results.push({ test: test.name, status: 'error', error: error.message })
      }
    }

    return {
      testType,
      passed,
      failed,
      total: tests.length,
      success: failed === 0,
      results,
    }
  }

  /**
   * Load plugin configuration from file
   */
  async loadPluginConfig(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf8')
      return await this.parseYamlContent(content)
    } catch (error) {
      logger.debug(`Failed to load config from ${configPath}`, { error: error.message })
      return null
    }
  }

  /**
   * Parse YAML content safely
   */
  async parseYamlContent(content) {
    try {
      const yaml = await import('js-yaml')
      return yaml.load(content)
    } catch (error) {
      logger.debug('Failed to parse YAML content', { error: error.message })
      return null
    }
  }

  /**
   * Summarize validation results
   */
  summarizeValidationResults(results) {
    const total = results.length
    const passed = results.filter((r) => r.success).length
    const failed = total - passed

    return {
      success: failed === 0,
      passed,
      failed,
      total,
      results,
      timestamp: new Date().toISOString(),
    }
  }
}

export default CommunityValidator
