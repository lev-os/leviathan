/**
 * Core Initializer - Unified initialization of all core systems
 * Orchestrates session, workflow, intelligence, and template systems
 * Extracted from index.js per _02-refactor.md Phase 1 specification
 */

import { SessionInitializer } from './sessions/session-initializer.js'
import { WorkflowInitializer } from './workflows/workflow-initializer.js'
import { IntelligenceInitializer } from './intelligence/intelligence-initializer.js'
import { TemplateInitializer } from './templates/template-initializer.js'
import { MemoryInitializer } from './memory/memory-initializer.js'
import { PluginLoader } from './plugins/plugin-loader.js'
import { universalContextSystem } from './universal-context-system.js'

export class CoreInitializer {
  constructor() {
    this.sessionInitializer = new SessionInitializer()
    this.workflowInitializer = new WorkflowInitializer()
    this.intelligenceInitializer = new IntelligenceInitializer()
    this.templateInitializer = new TemplateInitializer()
    this.memoryInitializer = new MemoryInitializer()
    this.pluginLoader = new PluginLoader()
  }

  /**
   * Initialize all core systems and return unified dependencies
   */
  async initializeCore() {
    // Initialize all core systems
    const sessionData = await this.sessionInitializer.initializeSession()
    const workflowData = await this.workflowInitializer.initializeWorkflows()
    const intelligenceData = await this.intelligenceInitializer.initializeIntelligence()
    const templateData = await this.templateInitializer.initializeTemplates()
    
    // Initialize memory core package with tight coupling
    const memoryData = await this.memoryInitializer.initializeMemory()

    // Initialize optional plugins (after core packages)
    const coreSystems = { 
      universalContextSystem,
      memoryManager: memoryData.memoryManager
    }
    await this.pluginLoader.initializePlugins(coreSystems)

    // Return unified dependencies object for command execution
    return {
      ...sessionData,
      ...workflowData,
      ...intelligenceData,
      ...templateData,
      ...memoryData,
      universalContextSystem,
      pluginLoader: this.pluginLoader,
      debugLogger: console,
    }
  }
}
