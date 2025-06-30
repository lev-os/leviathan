/**
 * FlowMind Base Class - The foundation of bi-directional orchestration
 * 
 * FUNDAMENTAL TRUTHS:
 * 1. The LLM is the runtime, not code
 * 2. Everything is a context (agents, workflows, patterns)
 * 3. No inheritance hierarchies - behavior comes from YAML
 * 4. 1:1 mapping between YAML and FlowMind properties
 * 5. Enables semantic conditions and LLM evaluation
 */

export class FlowMind {
  constructor(yamlData) {
    // Preserve original structure first
    this._raw = yamlData;
    this._type = yamlData.metadata?.type || 'unknown';
    this._id = yamlData.metadata?.id || 'unnamed';
    
    // Direct 1:1 mapping - no normalization or flattening
    // But avoid overwriting our own getters
    for (const [key, value] of Object.entries(yamlData)) {
      if (!['metadata', 'type', 'id', 'raw'].includes(key)) {
        this[key] = value;
      }
    }
  }

  /**
   * Get the type of this FlowMind context
   */
  get type() {
    return this._type;
  }

  /**
   * Get the unique identifier
   */
  get id() {
    return this._id;
  }

  /**
   * Check if this is a specific type
   */
  is(type) {
    return this._type === type;
  }

  /**
   * Get metadata
   */
  get metadata() {
    return this._raw.metadata || {};
  }

  /**
   * Get the raw YAML data
   */
  get raw() {
    return this._raw;
  }

  /**
   * Extract workflow configuration
   */
  get workflowConfig() {
    return this.workflow_config || this.workflowConfig || {};
  }

  /**
   * Extract steps for workflows
   */
  get steps() {
    // Support multiple step formats from different workflow types
    if (this.workflow_config?.steps) {
      return this.workflow_config.steps;
    }
    if (this.workflow_config?.analysis_rounds) {
      // Convert analysis rounds to steps (e.g., cognitive parliament)
      return Object.entries(this.workflow_config.analysis_rounds).map(([key, value]) => ({
        id: key,
        name: value.description || key,
        ...value
      }));
    }
    if (this.workflow_config?.tier_structure) {
      // Convert tiers to steps (e.g., three-tier research)
      return Object.entries(this.workflow_config.tier_structure).map(([key, value]) => ({
        id: key,
        ...value
      }));
    }
    return [];
  }

  /**
   * Get execution flow configuration
   */
  get executionFlow() {
    return this.workflow_config?.execution_flow || {};
  }

  /**
   * Get triggers for this context
   */
  get triggers() {
    return this.workflow_config?.triggers || {};
  }

  /**
   * Check if a semantic condition is met
   * NOTE: This is evaluated by the LLM, not code!
   */
  hasSemanticCondition(condition) {
    // @llm-note: The LLM evaluates these conditions through reasoning
    // We just check if they exist in the configuration
    const triggers = this.triggers;
    
    if (triggers.manual?.includes(condition)) return true;
    if (triggers.automatic?.includes(condition)) return true;
    if (triggers.semantic?.includes(condition)) return true;
    
    return false;
  }

  /**
   * Get personality system configuration (for cognitive parliament)
   */
  get personalitySystem() {
    return this.workflow_config?.personality_system || {};
  }

  /**
   * Get tool configuration
   */
  get toolConfig() {
    return this.tool_config || {};
  }

  /**
   * Get agent configuration
   */
  get agentConfig() {
    return this.agent_config || {};
  }

  /**
   * Get pattern configuration
   */
  get patternConfig() {
    return this.pattern_config || {};
  }

  /**
   * Convert to context for LLM injection
   */
  toContext() {
    return {
      type: this.type,
      id: this.id,
      metadata: this.metadata,
      config: this._raw,
      // @llm-note: This context configures YOUR behavior when injected
    };
  }

  /**
   * Check if this context can handle a request
   * NOTE: Actual evaluation happens in the LLM!
   */
  canHandle(request) {
    // @llm-note: This is a placeholder - the LLM decides if it can handle
    // based on semantic understanding of the request and context
    return {
      checkTriggers: this.triggers,
      checkType: this.type,
      semanticEvaluation: 'REQUIRES_LLM_REASONING'
    };
  }
}

// Export factory function for creating FlowMind contexts
export function createFlowMind(yamlData) {
  return new FlowMind(yamlData);
}