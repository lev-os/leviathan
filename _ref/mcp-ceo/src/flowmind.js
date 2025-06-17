/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   FLOWMIND CONSTITUTIONAL FRAMEWORK                       ║
 * ║                 The LLM-First Context Orchestration System                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * 🚨 CRITICAL: Read this BEFORE writing ANY code. These principles are NOVEL.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #1: THE LLM IS THE RUNTIME                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * In FlowMind architecture:
 * - The LLM (Claude/GPT) IS the execution engine, not code
 * - FlowMind contexts CONFIGURE the LLM's behavior
 * - We don't BUILD systems that think - the LLM IS the thinking system
 * 
 * WRONG: User → Code → LLM → Code → Result
 * RIGHT: User ↔ LLM ↔ FlowMind Context System
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #2: EVERYTHING IS A CONTEXT                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * THERE IS ONLY ONE CLASS: FlowMind
 * - Agents are contexts with type: "agent"
 * - Workflows are contexts with type: "workflow"  
 * - Patterns are contexts with type: "pattern"
 * - Types are contexts with type: "type"
 * 
 * This is enforced through SINGLE CLASS DESIGN. No inheritance hierarchies.
 * Type-specific behavior comes from the context YAML, not subclasses.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #3: BIDIRECTIONAL FLOW = INFINITE INTELLIGENCE       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * The magic happens through CONTEXT SWITCHING:
 * 
 * Step 1: LLM calls MCP → "Execute workflow step 1"
 * Step 2: MCP loads context → "You are NFJ-Visionary. Analyze..."
 * Step 3: LLM reasons with MAXIMUM POWER as NFJ-Visionary
 * Step 4: LLM callback → "Here are my visionary insights..."
 * Step 5: MCP loads NEW context → "You are STP-Adapter. Pragmatize..."
 * Step 6: LLM reasons with MAXIMUM POWER as STP-Adapter
 * [CYCLE CONTINUES...]
 * 
 * Each context switch gives the LLM NEW CAPABILITIES. This creates
 * EMERGENT INTELLIGENCE through orchestration, not code.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #4: YAML IS THE SOURCE OF TRUTH                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * The YAML structure is SUPERIOR to any code interface:
 * - 1:1 mapping between YAML and FlowMind properties
 * - No "normalization" or flattening
 * - Rich hierarchical structure preserved
 * - Intelligence comes from methods, not property munging
 * 
 * metadata.name IS the name. Don't "fix" it to match broken tests.
 * Fix the tests to match the superior YAML design.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #5: SEMANTIC CONDITIONS ARE REVOLUTIONARY            │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * FlowMind enables conditions like:
 * - when_semantic: "user seems frustrated"
 * - if: "urgency > 0.8" and_semantic: "user is asking for manager"
 * - while_semantic: "user still has questions"
 * 
 * These aren't parsed by regex. The LLM EVALUATES them through semantic
 * reasoning. This bridges human intent and machine precision.
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        IMPLEMENTATION RULES                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * 1. ONE CLASS RULE: Everything inherits from FlowMind. No exceptions.
 * 
 * 2. YAML MIRROR RULE: FlowMind properties = YAML structure exactly.
 *    If YAML has metadata.name, FlowMind has metadata.name.
 * 
 * 3. TYPE THROUGH DATA: Behavior differences come from the 'type' property,
 *    not class hierarchies. Use method switches, not polymorphism.
 * 
 * 4. CONTEXT SWITCHING: Every workflow step = new context = new LLM powers.
 *    Design for maximum context switches, not efficiency.
 * 
 * 5. LLM REASONING FIRST: Before writing ANY utility, ask "Can the LLM do this?"
 *    Usually the answer is yes. Let the LLM reason, don't code the reasoning.
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    CONSTANT SELF-CHECK REMINDERS                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * BEFORE WRITING CODE, ASK YOURSELF:
 * 
 * □ Am I trying to BUILD something the LLM should BE?
 * □ Am I creating subclasses when I should use the type property?
 * □ Am I normalizing YAML when I should preserve its structure?
 * □ Am I coding logic the LLM could evaluate semantically?
 * □ Am I forgetting that context switches create intelligence?
 * 
 * IF ANY CHECKBOX IS TRUE: Stop. Re-read this framework. Rethink your approach.
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          THE PRIME DIRECTIVE                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * FlowMind doesn't create intelligent systems.
 * FlowMind orchestrates THE INTELLIGENCE THAT ALREADY EXISTS IN THE LLM.
 * 
 * Every line of code should ENABLE the LLM, not REPLACE it.
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * @class FlowMind
 * @description Universal context interface - Everything is a FlowMind context
 * @implements {LLMFirstPrinciples}
 * @version 0.1.0
 * 
 * Remember: In traditional systems, code runs and calls LLMs for text.
 *          In FlowMind, LLMs run and use contexts for intelligence.
 */

import fs from 'fs/promises'
import yaml from 'yaml'
import path from 'path'

/**
 * FlowMind: The ONE class for ALL contexts
 * 
 * ENFORCES: Everything is a Context principle
 * NO SUBCLASSES - Type differences handled through data, not inheritance
 */
export class FlowMind {
  /**
   * Create a FlowMind context from YAML
   * @param {Object} rawYaml - The parsed YAML object (1:1 preserved)
   * @param {string} contextPath - Path to the YAML file
   * @param {Object} options - Optional configuration
   * @param {ContextTracker} options.tracker - Optional tracker for attribution
   */
  constructor(rawYaml, contextPath = null, options = {}) {
    // FUNDAMENTAL: Preserve complete YAML structure
    this._raw = rawYaml
    this._path = contextPath
    this._tracker = options.tracker || null
    
    // Cache commonly accessed paths for performance
    this._metadata = rawYaml.metadata || {}
    this._config = this._detectConfigSection(rawYaml)
    
    // Version tracking for compatibility
    this._flowmindVersion = '0.1.0'
  }

  // ===========================
  // METADATA ACCESS (1:1 YAML)
  // ===========================
  
  /**
   * @returns {string} The context ID from metadata.id
   */
  get id() { 
    return this._metadata.id 
  }
  
  /**
   * @returns {string} The full name from metadata.name
   * IMPORTANT: This returns metadata.name AS IS. Don't "normalize" to id.
   * If no name in metadata, default to id for usability
   */
  get name() { 
    return this._metadata.name || this._metadata.id || 'unnamed'
  }
  
  /**
   * @returns {string} Convenience accessor for short name (returns id)
   */
  get shortName() { 
    return this._metadata.id 
  }
  
  /**
   * @returns {string} The context type (agent, workflow, pattern, etc.)
   */
  get type() { 
    return this._metadata.type || 'unknown' 
  }
  
  /**
   * @returns {string} Version string from metadata
   */
  get version() { 
    return this._metadata.version 
  }
  
  /**
   * @returns {string} Description from metadata
   */
  get description() { 
    return this._metadata.description 
  }
  
  /**
   * @returns {Object} Full metadata object
   */
  get metadata() {
    return this._metadata
  }

  // =============================
  // CONFIG ACCESS (Type-Agnostic)
  // =============================
  
  /**
   * Smart config detection based on context type
   * @returns {Object} The appropriate config section
   */
  get config() {
    return this._config
  }
  
  /**
   * Universal capability checker
   * @param {string} capability - The capability to check
   * @returns {boolean} Whether this context has the capability
   */
  hasCapability(capability) {
    const capabilities = this._config?.capabilities || []
    return Array.isArray(capabilities) && capabilities.includes(capability)
  }
  
  /**
   * @returns {Array<string>} All capabilities of this context
   */
  get capabilities() {
    return this._config?.capabilities || []
  }
  
  /**
   * @returns {Object} Memory configuration (universal concept)
   */
  get memoryConfig() {
    return this._config?.memory_config
  }
  
  /**
   * @returns {Object} Endpoints/perspectives (agents have these)
   */
  get endpoints() {
    return this._config?.endpoints
  }
  
  /**
   * @returns {Object} Workflow triggers (workflows have these)
   */
  get triggers() {
    return this._config?.triggers || {}
  }
  
  /**
   * @returns {Array} Workflow steps (if applicable)
   */
  get steps() {
    return this._config?.steps || this._config?.workflow_steps || []
  }

  // ===============================
  // TYPE-AWARE CONVENIENCE METHODS
  // ===============================
  
  /**
   * Type checking methods (data-driven, not class-based)
   */
  isAgent() { return this.type === 'agent' }
  isWorkflow() { return this.type === 'workflow' }
  isPattern() { return this.type === 'pattern' }
  isType() { return this.type === 'type' }
  
  /**
   * Get an endpoint by name (agent-specific concept)
   * @param {string} name - Endpoint name
   * @returns {Object|null} The endpoint configuration
   */
  getEndpoint(name) {
    if (!this.isAgent()) return null
    return this.endpoints?.[name]
  }
  
  /**
   * Get enhanced workflows from any endpoint
   * @returns {Array<Object>} All enhanced workflows defined
   */
  getEnhancedWorkflows() {
    if (!this.isAgent()) return []
    
    return Object.values(this.endpoints || {})
      .flatMap(endpoint => Object.values(endpoint.enhanced_workflows || {}))
  }

  // ==============================
  // SEMANTIC EVALUATION HOOKS
  // ==============================
  
  /**
   * Check if a workflow should trigger based on semantic conditions
   * This is where LLM reasoning will plug in
   * 
   * @param {string} workflowName - The workflow to check
   * @param {Object} context - Current context for evaluation
   * @returns {Promise<boolean>} Whether the workflow should trigger
   */
  async shouldTriggerWorkflow(workflowName, context) {
    const workflows = this.getEnhancedWorkflows()
    const workflow = workflows.find(w => 
      w.workflow_reference?.includes(workflowName)
    )
    
    if (!workflow?.auto_trigger_conditions) return false
    
    // TODO v0.2.0: Replace with LLM semantic evaluation via MCP
    // NEVER mock semantic understanding - use real LLM evaluation
    throw new Error('Semantic evaluation not implemented. Use LLM via MCP for real evaluation.')
    
    // REMOVED: Mock semantic evaluation (violates FlowMind constitutional principles)
    // return this._mockSemanticEvaluation(workflow.auto_trigger_conditions, context)
  }
  
  /**
   * Universal activation method - type-aware behavior
   * @param {Object} context - Activation context
   * @returns {Promise<Object>} Activation result
   */
  async activate(context) {
    switch(this.type) {
      case 'agent':
        return this._activateAgent(context)
      case 'workflow':
        return this._activateWorkflow(context)
      case 'pattern':
        return this._activatePattern(context)
      default:
        return this._activateGeneric(context)
    }
  }

  // ===========================
  // RAW ACCESS & INTROSPECTION
  // ===========================
  
  /**
   * Get the raw YAML structure (preserved exactly)
   * @returns {Object} The original YAML object
   */
  get raw() { 
    return this._raw 
  }
  
  /**
   * Get the context file path
   * @returns {string|null} Path to the YAML file
   */
  get path() { 
    return this._path 
  }
  
  /**
   * Convert to JSON (returns raw YAML structure)
   * @returns {Object} The raw YAML for serialization
   */
  toJSON() { 
    return this._raw 
  }
  
  /**
   * Get a nested property using dot notation
   * @param {string} path - Dot-separated path (e.g., "metadata.name")
   * @returns {*} The value at that path
   */
  getProperty(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this._raw)
  }

  // ===========================
  // CONTEXT EXECUTION & TRACKING
  // ===========================
  
  /**
   * Execute this context (workflow step, agent activation, etc.)
   * This is where bidirectional flow happens - context configures LLM behavior
   * 
   * @param {Object} executionContext - Current execution state
   * @param {string} executionContext.challenge - The challenge/query
   * @param {Object} executionContext.previousResults - Previous step results
   * @param {number} executionContext.step - Current step number
   * @returns {Object} Execution result with content and metadata
   */
  async execute(executionContext = {}) {
    const { challenge, previousResults, step = 1 } = executionContext
    
    // Track this execution if tracker is available
    if (this._tracker) {
      const contributionId = this._tracker.trackContribution(
        this.id,
        `Executing ${this.type} context: ${this.name}`,
        {
          type: this.type,
          step,
          confidence: 1.0,
          metadata: this.metadata
        }
      )
      executionContext._contributionId = contributionId
    }
    
    // Type-specific execution (data-driven, not inheritance)
    switch (this.type) {
      case 'workflow':
        return this._executeWorkflow(executionContext)
      case 'agent':
        return this._executeAgent(executionContext)
      case 'pattern':
        return this._executePattern(executionContext)
      default:
        return this._executeGeneric(executionContext)
    }
  }
  
  /**
   * Execute as workflow context
   * @private
   */
  async _executeWorkflow(executionContext) {
    const workflowConfig = this.raw.workflow_config || {}
    const steps = workflowConfig.steps || []
    const currentStep = executionContext.step || 1
    
    if (currentStep > steps.length) {
      throw new Error(`Step ${currentStep} exceeds workflow length ${steps.length}`)
    }
    
    const stepConfig = steps[currentStep - 1]
    const contextInjection = this._buildContextInjection(stepConfig, executionContext)
    
    return {
      type: 'workflow_step',
      workflow: {
        id: this.id,
        name: this.name,
        current_step: currentStep,
        total_steps: steps.length,
        step_name: stepConfig.name || `Step ${currentStep}`
      },
      context_injection: contextInjection,
      content: contextInjection.prompt || contextInjection.step_instructions,
      tracker: this._tracker ? {
        contributionId: executionContext._contributionId,
        lineage: this._tracker.getLineage(executionContext._contributionId)
      } : null
    }
  }
  
  /**
   * Execute as agent context
   * @private
   */
  async _executeAgent(executionContext) {
    const agentConfig = this.raw.agent_config || {}
    const systemPrompt = agentConfig.system_prompt || this.raw.system_prompt || ''
    
    // Track if available
    if (this._tracker && executionContext._contributionId) {
      this._tracker.trackInteraction(
        'system',
        this.id,
        'activates',
        `Activating agent ${this.name} for challenge`
      )
    }
    
    return {
      type: 'agent_activation',
      agent: {
        id: this.id,
        name: this.name,
        capabilities: this.capabilities
      },
      context_injection: {
        system_prompt: systemPrompt,
        agent_id: this.id,
        agent_name: this.name
      },
      content: systemPrompt,
      tracker: this._tracker ? {
        contributionId: executionContext._contributionId
      } : null
    }
  }
  
  /**
   * Execute as pattern context
   * @private
   */
  async _executePattern(executionContext) {
    const patternConfig = this.raw.pattern_config || {}
    const template = patternConfig.template || patternConfig.prompt || ''
    
    return {
      type: 'pattern_application',
      pattern: {
        id: this.id,
        name: this.name,
        category: patternConfig.category
      },
      context_injection: {
        pattern_template: template,
        pattern_name: this.name
      },
      content: template,
      tracker: this._tracker ? {
        contributionId: executionContext._contributionId
      } : null
    }
  }
  
  /**
   * Generic execution for unknown types
   * @private
   */
  async _executeGeneric(executionContext) {
    return {
      type: 'generic_context',
      context: {
        id: this.id,
        name: this.name,
        type: this.type
      },
      content: JSON.stringify(this._config, null, 2),
      tracker: this._tracker ? {
        contributionId: executionContext._contributionId
      } : null
    }
  }
  
  /**
   * Build context injection for workflow steps
   * @private
   */
  _buildContextInjection(stepConfig, executionContext) {
    const { previousResults = {} } = executionContext
    
    return {
      step_instructions: stepConfig.prompt || stepConfig.instructions || '',
      previous_insights: previousResults.insights || [],
      active_personalities: stepConfig.personalities || [],
      semantic_conditions: stepConfig.conditions || {},
      ...stepConfig.context_injection || {}
    }
  }

  // =============================
  // PRIVATE IMPLEMENTATION METHODS
  // =============================
  
  /**
   * Detect the config section based on type
   * @private
   */
  _detectConfigSection(yaml) {
    // Config section varies by type
    if (yaml.agent_config) return yaml.agent_config
    if (yaml.workflow_config) return yaml.workflow_config
    if (yaml.pattern_config) return yaml.pattern_config
    if (yaml.type_config) return yaml.type_config
    
    // Fallback to generic config
    return yaml.config || {}
  }
  
  /**
   * REMOVED: Mock semantic evaluation (v0.2.0)
   * 
   * CONSTITUTIONAL VIOLATION: Never mock semantic understanding
   * Use real LLM evaluation through MCP bidirectional flow
   * 
   * @private
   * @deprecated
   */
  // async _mockSemanticEvaluation(conditions, context) {
  //   // NEVER mock - violates FlowMind constitutional principles
  //   // Use LLM through MCP for real semantic evaluation
  //   throw new Error('Mock semantic evaluation disabled. Use LLM via MCP.')
  // }
  
  /**
   * Type-specific activation methods
   * @private
   */
  async _activateAgent(context) {
    return {
      type: 'agent_activation',
      agent: this.id,
      context,
      result: 'Agent activated with context'
    }
  }
  
  async _activateWorkflow(context) {
    return {
      type: 'workflow_activation',
      workflow: this.id,
      steps: this.steps.length,
      context,
      result: 'Workflow ready for execution'
    }
  }
  
  async _activatePattern(context) {
    return {
      type: 'pattern_activation',
      pattern: this.id,
      context,
      result: 'Pattern applied to context'
    }
  }
  
  async _activateGeneric(context) {
    return {
      type: 'generic_activation',
      contextType: this.type,
      id: this.id,
      context,
      result: 'Generic context activated'
    }
  }
}

/**
 * FlowMind Factory - Creates FlowMind instances with auto-detection
 */
export class FlowMindFactory {
  /**
   * Create a FlowMind instance from a YAML file path
   * @param {string} yamlPath - Path to the YAML file
   * @returns {Promise<FlowMind>} The FlowMind instance
   */
  static async createFromFile(yamlPath) {
    const content = await fs.readFile(yamlPath, 'utf8')
    const rawYaml = yaml.parse(content)
    return this.create(yamlPath, rawYaml)
  }
  
  /**
   * Create a FlowMind instance from parsed YAML
   * @param {string} yamlPath - Path (for type detection)
   * @param {Object} rawYaml - Parsed YAML object
   * @returns {FlowMind} The FlowMind instance
   */
  static create(yamlPath, rawYaml) {
    // ALWAYS return base FlowMind class (no subclasses!)
    return new FlowMind(rawYaml, yamlPath)
  }
  
  /**
   * Auto-detect context type from YAML or path
   * @param {Object} yaml - The parsed YAML
   * @param {string} path - The file path
   * @returns {string} The detected type
   */
  static detectType(yaml, path = '') {
    // 1. Metadata type is authoritative
    if (yaml.metadata?.type) return yaml.metadata.type
    
    // 2. Path-based inference
    if (path.includes('/agents/')) return 'agent'
    if (path.includes('/workflows/')) return 'workflow'
    if (path.includes('/patterns/')) return 'pattern'
    if (path.includes('/types/')) return 'type'
    
    // 3. Config section detection
    if (yaml.agent_config) return 'agent'
    if (yaml.workflow_config) return 'workflow'
    if (yaml.pattern_config) return 'pattern'
    if (yaml.type_config) return 'type'
    
    return 'unknown'
  }
}

// ===========================
// USAGE EXAMPLES
// ===========================

/*
// Everything is a FlowMind context
const ceo = await FlowMindFactory.createFromFile('contexts/agents/ceo/context.yaml')
const workflow = await FlowMindFactory.createFromFile('contexts/workflows/deep-analysis/context.yaml')
const pattern = await FlowMindFactory.createFromFile('contexts/patterns/scamper/context.yaml')

// All use the same interface
console.log(ceo.type)        // "agent"
console.log(ceo.name)        // "Chief Executive Officer" (from metadata.name)
console.log(ceo.shortName)   // "ceo" (from metadata.id)

// Type-specific behavior through data, not classes
await ceo.activate(context)      // Activates as agent
await workflow.activate(context) // Activates as workflow

// Semantic features (future)
if (await ceo.shouldTriggerWorkflow('multi-expert-validation', context)) {
  // LLM evaluated semantic conditions
}
*/