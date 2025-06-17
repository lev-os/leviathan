/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                     FLOWMIND CONTEXT VALIDATION SCHEMA                    ║
 * ║                    Zod-based validation for YAML contexts                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * Implements comprehensive validation for FlowMind contexts using Zod.
 * Follows YAML-first principles - validates structure without normalization.
 */

import { z } from 'zod'

// ===========================
// BASE SCHEMAS
// ===========================

const MetadataSchema = z.object({
  type: z.enum(['agent', 'workflow', 'pattern', 'type', 'theme', 'preference', 'tool', 'validation', 'instance']),
  id: z.string().min(1, "ID is required"),
  name: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high']).optional(),
  time_estimate: z.string().optional(),
  author: z.string().optional()
})

const TriggerSchema = z.object({
  when: z.string().optional(),
  when_semantic: z.string().optional(),
  if: z.string().optional(),
  and_semantic: z.string().optional(),
  while_semantic: z.string().optional(),
  confidence_threshold: z.number().min(0).max(1).optional()
})

const IntegrationSchema = z.object({
  complements: z.array(z.string()).optional(),
  conflicts_with: z.array(z.string()).optional(),
  follows_well: z.array(z.string()).optional(),
  leads_to: z.array(z.string()).optional(),
  requires: z.array(z.string()).optional()
})

const ValidationConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  context: z.string().optional(),
  confidence_required: z.number().min(0).max(1).optional().default(0.8),
  instruction: z.string().optional(),
  tools_required: z.array(z.string()).optional(),
  validation_criteria: z.record(z.string()).optional(),
  challenge_patterns: z.array(z.string()).optional()
})

// ===========================
// AGENT SCHEMAS
// ===========================

const EndpointSchema = z.object({
  prompt_template: z.string().optional(),
  system_prompt: z.string().optional(), // Legacy support
  capabilities: z.array(z.string()).optional(),
  enhanced_workflows: z.record(z.object({
    workflow_reference: z.string(),
    auto_trigger_conditions: z.array(z.string()).optional(),
    context_injection: z.record(z.any()).optional()
  })).optional(),
  verbosity_modes: z.record(z.any()).optional(),
  templates: z.record(z.string()).optional()
})

const MemoryConfigSchema = z.object({
  type: z.enum(['working', 'episodic', 'semantic', 'procedural']).optional(),
  retention_policy: z.enum(['session', 'persistent', 'contextual']).optional(),
  sharing_boundary: z.enum(['private', 'team', 'public']).optional(),
  max_entries: z.number().positive().optional(),
  compression_strategy: z.string().optional()
})

const AgentConfigSchema = z.object({
  type: z.string().optional(),
  model: z.string().optional(),
  endpoints: z.record(EndpointSchema).optional(),
  system_prompt: z.string().optional(), // Legacy support
  capabilities: z.array(z.string()).optional(),
  memory_config: MemoryConfigSchema.optional(),
  triggers: z.array(TriggerSchema).optional(),
  enhanced_workflows: z.record(z.any()).optional(), // Legacy support
  verbosity_modes: z.record(z.any()).optional()
})

// ===========================
// WORKFLOW SCHEMAS
// ===========================

const WorkflowStepSchema = z.object({
  step: z.number().positive(),
  name: z.string(),
  role: z.string().optional(),
  agent: z.string().optional(),
  description: z.string().optional(),
  mindset: z.string().optional(),
  primary_methods: z.array(z.string()).optional(),
  inputs_from_previous: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  success_criteria: z.array(z.string()).optional(),
  time_estimate: z.string().optional(),
  when_complete: z.string().optional(),
  prompt: z.string().optional(),
  instructions: z.string().optional(),
  personalities: z.array(z.string()).optional(),
  conditions: z.record(z.any()).optional(),
  context_injection: z.record(z.any()).optional()
})

const WorkflowCoordinationSchema = z.object({
  iteration_triggers: z.array(TriggerSchema).optional(),
  parallel_activities: z.array(z.string()).optional(),
  decision_points: z.array(z.object({
    step: z.number(),
    decision: z.string(),
    criteria: z.array(z.string())
  })).optional()
})

const WorkflowConfigSchema = z.object({
  role: z.string().optional(),
  workflow_overview: z.string().optional(),
  steps: z.array(WorkflowStepSchema).optional(),
  workflow_steps: z.array(WorkflowStepSchema).optional(), // Legacy support
  workflow_coordination: WorkflowCoordinationSchema.optional(),
  success_metrics: z.record(z.any()).optional(),
  common_pitfalls: z.array(z.string()).optional(),
  integration: IntegrationSchema.optional()
})

// ===========================
// PATTERN SCHEMAS
// ===========================

const PatternConfigSchema = z.object({
  role: z.string().optional(),
  framework_overview: z.string().optional(),
  core_principles: z.array(z.string()).optional(),
  thinking_process: z.record(z.any()).optional(),
  application_domains: z.record(z.any()).optional(),
  practical_techniques: z.record(z.any()).optional(),
  output_structure: z.record(z.any()).optional(),
  warning_signs: z.array(z.string()).optional(),
  validation_protocol: z.record(z.any()).optional(),
  template: z.string().optional(),
  prompt: z.string().optional(),
  category: z.string().optional(),
  methods: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional()
})

// ===========================
// TYPE SCHEMAS
// ===========================

const TypeConfigSchema = z.object({
  purpose: z.string().optional(),
  characteristics: z.array(z.string()).optional(),
  lifecycle: z.record(z.any()).optional(),
  relationships: z.record(z.any()).optional(),
  properties: z.record(z.any()).optional()
})

// ===========================
// THEME SCHEMAS
// ===========================

const ThemeConfigSchema = z.object({
  colors: z.record(z.string()).optional(),
  typography: z.record(z.string()).optional(),
  components: z.record(z.any()).optional(),
  animations: z.record(z.any()).optional()
})

// ===========================
// TOOL SCHEMAS
// ===========================

const ToolConfigSchema = z.object({
  functionality: z.string().optional(),
  methods: z.array(z.string()).optional(),
  integration_points: z.array(z.string()).optional(),
  configuration: z.record(z.any()).optional()
})

// ===========================
// PREFERENCE SCHEMAS
// ===========================

const PreferenceConfigSchema = z.object({
  interface_preferences: z.record(z.any()).optional(),
  interaction_style: z.record(z.any()).optional(),
  default_behaviors: z.record(z.any()).optional()
})

// ===========================
// UNIVERSAL CONTEXT SCHEMA
// ===========================

const ContextSchema = z.object({
  metadata: MetadataSchema,
  
  // Type-specific configs (only one should be present)
  agent_config: AgentConfigSchema.optional(),
  workflow_config: WorkflowConfigSchema.optional(),
  pattern_config: PatternConfigSchema.optional(),
  type_config: TypeConfigSchema.optional(),
  theme_config: ThemeConfigSchema.optional(),
  tool_config: ToolConfigSchema.optional(),
  preference_config: PreferenceConfigSchema.optional(),
  validation_config: ValidationConfigSchema.optional(),
  
  // Universal optional sections
  context: z.record(z.any()).optional(), // For pattern contexts
  config: z.record(z.any()).optional(),   // Generic fallback
  
  // Common optional fields
  triggers: z.array(TriggerSchema).optional(),
  integration: IntegrationSchema.optional(),
  validation: ValidationConfigSchema.optional(),
  
  // Legacy support
  system_prompt: z.string().optional(), // Should be deprecated
  capabilities: z.array(z.string()).optional()
}).refine((data) => {
  // Ensure type-specific config exists for the declared type
  const type = data.metadata.type
  const configKeys = {
    'agent': 'agent_config',
    'workflow': 'workflow_config', 
    'pattern': 'pattern_config',
    'type': 'type_config',
    'theme': 'theme_config',
    'tool': 'tool_config',
    'preference': 'preference_config',
    'validation': 'validation_config'
  }
  
  const expectedConfigKey = configKeys[type]
  if (expectedConfigKey && !data[expectedConfigKey] && !data.config && !data.context) {
    return false
  }
  
  return true
}, {
  message: "Context must have appropriate config section for its type"
})

// ===========================
// VALIDATION FUNCTIONS
// ===========================

/**
 * Validate a context YAML object
 * @param {Object} contextData - Parsed YAML object
 * @param {string} filePath - Path to the file (for context in errors)
 * @returns {Object} Validation result with success/error info
 */
export function validateContext(contextData, filePath = 'unknown') {
  try {
    const validated = ContextSchema.parse(contextData)
    return {
      success: true,
      data: validated,
      errors: [],
      warnings: getValidationWarnings(validated)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
          filePath
        })),
        warnings: []
      }
    }
    
    return {
      success: false,
      data: null,
      errors: [{
        path: 'root',
        message: error.message,
        code: 'unknown_error',
        filePath
      }],
      warnings: []
    }
  }
}

/**
 * Generate validation warnings for best practices
 * @param {Object} context - Validated context data
 * @returns {Array} Array of warning objects
 */
function getValidationWarnings(context) {
  const warnings = []
  
  // Check for legacy system_prompt usage
  if (context.system_prompt || context.agent_config?.system_prompt) {
    warnings.push({
      type: 'legacy_pattern',
      message: 'Using embedded system_prompt. Consider migrating to template-based approach.',
      suggestion: 'Move prompt to templates/ directory and reference via prompt_template'
    })
  }
  
  // Check for missing descriptions
  if (!context.metadata.description) {
    warnings.push({
      type: 'missing_metadata',
      message: 'Missing description in metadata',
      suggestion: 'Add description for better context discovery'
    })
  }
  
  // Check for missing integration info
  if (!context.integration && context.metadata.type !== 'instance') {
    warnings.push({
      type: 'missing_integration',
      message: 'No integration information provided',
      suggestion: 'Add integration section to show relationships with other contexts'
    })
  }
  
  return warnings
}

/**
 * Validate multiple contexts and return summary
 * @param {Array} contexts - Array of {data, filePath} objects
 * @returns {Object} Summary of validation results
 */
export function validateContexts(contexts) {
  const results = contexts.map(({ data, filePath }) => 
    validateContext(data, filePath)
  )
  
  const summary = {
    total: results.length,
    valid: results.filter(r => r.success).length,
    invalid: results.filter(r => !r.success).length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    results
  }
  
  return summary
}

/**
 * Schema exports for type-specific validation
 */
export const schemas = {
  Context: ContextSchema,
  Metadata: MetadataSchema,
  AgentConfig: AgentConfigSchema,
  WorkflowConfig: WorkflowConfigSchema,
  PatternConfig: PatternConfigSchema,
  ValidationConfig: ValidationConfigSchema,
  Endpoint: EndpointSchema,
  WorkflowStep: WorkflowStepSchema,
  Trigger: TriggerSchema,
  Integration: IntegrationSchema
}