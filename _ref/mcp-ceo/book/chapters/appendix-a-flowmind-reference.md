# Appendix A: Complete FlowMind Reference

## Table of Contents

1. [FlowMind Syntax Specification](#flowmind-syntax-specification)
2. [Semantic Conditions Reference](#semantic-conditions-reference)
3. [Context Types and Properties](#context-types-and-properties)
4. [Assembly Rules Engine](#assembly-rules-engine)
5. [Personality System Reference](#personality-system-reference)
6. [Workflow Orchestration API](#workflow-orchestration-api)
7. [Configuration Options](#configuration-options)
8. [Error Codes and Troubleshooting](#error-codes-and-troubleshooting)
9. [Performance Tuning Guide](#performance-tuning-guide)
10. [Migration and Upgrade Guides](#migration-and-upgrade-guides)

---

## FlowMind Syntax Specification

FlowMind uses YAML as its primary configuration language with a standardized structure that maps 1:1 to FlowMind class properties.

### Core Structure

```yaml
metadata:
  type: "agent" | "workflow" | "pattern" | "type"
  id: "unique_identifier"
  version: "semantic_version"
  name: "Human Readable Name"
  description: "Context description"
  author: "@namespace/author"          # optional
  created: "ISO_8601_timestamp"        # optional
  modified: "ISO_8601_timestamp"       # optional

# Type-specific configuration sections
agent_config: {}      # for type: "agent"
workflow_config: {}   # for type: "workflow"
pattern_config: {}    # for type: "pattern"
type_config: {}       # for type: "type"
```

### Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Context type: "agent", "workflow", "pattern", "type" |
| `id` | string | Yes | Unique identifier (kebab-case recommended) |
| `version` | string | Yes | Semantic version (e.g., "1.0.0") |
| `name` | string | Yes | Human-readable display name |
| `description` | string | Yes | Purpose and functionality description |
| `author` | string | No | Author with optional namespace |
| `created` | string | No | Creation timestamp (ISO 8601) |
| `modified` | string | No | Last modification timestamp |

### Type-Specific Configuration Sections

#### Agent Configuration (`agent_config`)

```yaml
agent_config:
  capabilities:
    - "capability_name"
    - "another_capability"
  
  endpoints:
    endpoint_name:
      description: "Endpoint purpose"
      focus: "Primary focus area"
      capabilities:
        - "endpoint_specific_capabilities"
      enhanced_workflows:
        workflow_name:
          workflow_reference: "path/to/workflow/context.yaml"
          auto_trigger_conditions:
            - "condition_expression"
          activation_pattern: |
            WHEN condition:
              INVOKE workflow WITH: parameters
              INTEGRATE results INTO response
  
  interaction_style:
    default: "communication_style"
    adaptation: "context_aware" | "fixed"
  
  decision_framework:
    factors:
      - "business_impact"
      - "user_value"
      - "technical_feasibility"
  
  memory_config:
    working_memory:
      token_budget: 500
      whisper_frequency: "every_N_tokens"
      capture_triggers: ["trigger_list"]
    episodic_memory:
      retention: "time_period"
      significance_threshold: 0.7
      auto_summarize: "frequency"
    semantic_memory:
      domains: ["domain_list"]
      update_frequency: "frequency"
    procedural_memory:
      learns: ["learning_areas"]
    memory_boundaries:
      shares_with: ["agent_list"]
      private: ["private_data_types"]
```

#### Workflow Configuration (`workflow_config`)

```yaml
workflow_config:
  philosophy: "Workflow approach description"
  
  triggers:
    automatic:
      - "condition_expression"
    manual:
      - "trigger_phrase"
  
  steps:
    - step: 1
      name: "step_name"
      prompt: "Step-specific prompt"
      personalities: ["personality_list"]
      callback_instruction: "Next step instruction"
  
  verbosity_modes:
    off:
      output: "none"
      internal_use: false
    silent:
      output: "none"
      internal_use: true
    medium:
      output: "friendly_names"
      template: "Output template"
    verbose:
      output: "full_technical"
      template: "Detailed template"
  
  success_metrics:
    decision_quality: ["metric_list"]
    user_experience: ["metric_list"]
    system_performance: ["metric_list"]
```

#### Pattern Configuration (`pattern_config`)

```yaml
pattern_config:
  methodology: "pattern_approach"
  
  # Pattern-specific configuration varies by type
  transformations: {}  # For creative patterns
  process: {}          # For process patterns
  output_format: {}    # For output specifications
  
  ai_features:
    auto_prompting: true
    idea_expansion: true
    feasibility_hints: true
```

#### Type Configuration (`type_config`)

```yaml
type_config:
  capabilities:
    - "type_specific_capabilities"
  
  allowed_children:
    - "child_type_list"
  
  pattern_integration:
    decision_patterns: ["pattern_paths"]
    auto_apply_patterns:
      - trigger: "condition"
        pattern: "pattern_path"
  
  behavior_rules:
    - trigger: "event"
      condition: "optional_condition"
      action: "action_to_take"
  
  progress_tracking:
    metrics: ["metric_list"]
```

### FlowMind Class Interface

```javascript
import { FlowMind, FlowMindFactory } from './flowmind.js'

// Create from file
const context = await FlowMindFactory.createFromFile('path/to/context.yaml')

// Create from YAML object
const context = FlowMindFactory.create('path', yamlObject)

// Universal properties (all context types)
console.log(context.id)           // metadata.id
console.log(context.name)         // metadata.name
console.log(context.type)         // metadata.type
console.log(context.version)      // metadata.version
console.log(context.description)  // metadata.description

// Type-specific properties
console.log(context.config)       // Type-specific config section
console.log(context.capabilities) // Universal capability access
console.log(context.memoryConfig) // Memory configuration

// Type checking
context.isAgent()                 // true if type === "agent"
context.isWorkflow()              // true if type === "workflow"
context.isPattern()               // true if type === "pattern"
context.isType()                  // true if type === "type"

// Universal methods
await context.activate(contextData)     // Type-aware activation
context.hasCapability('capability')     // Capability checking
context.getProperty('metadata.name')    // Dot-notation access
context.raw                             // Original YAML structure
```

---

## Semantic Conditions Reference

FlowMind enables semantic conditions that are evaluated by LLM reasoning rather than code parsing.

### Condition Types

#### Basic Semantic Conditions

```yaml
# Simple semantic evaluation
when_semantic: "user seems frustrated"
if_semantic: "urgent situation detected"
while_semantic: "user still has questions"
```

#### Hybrid Conditions

```yaml
# Combine logical and semantic evaluation
if: "urgency > 0.8" 
and_semantic: "user is asking for manager"

# Complex hybrid conditions
condition: |
  (priority_level >= HIGH) AND 
  SEMANTIC("stakeholder approval needed") AND
  NOT SEMANTIC("routine maintenance task")
```

#### Temporal Semantic Conditions

```yaml
# Time-aware semantic evaluation
when_semantic: "deadline pressure is building"
if_semantic: "now is the right time to launch"
until_semantic: "project momentum stabilizes"
```

### Semantic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `SEMANTIC("condition")` | LLM evaluates condition | `SEMANTIC("user is confused")` |
| `NOT SEMANTIC("condition")` | Negated semantic condition | `NOT SEMANTIC("emergency situation")` |
| `SEMANTIC_CONFIDENCE("condition", threshold)` | Confidence-based evaluation | `SEMANTIC_CONFIDENCE("ready to proceed", 0.8)` |
| `SEMANTIC_INTENT("intent")` | Intent recognition | `SEMANTIC_INTENT("wants to cancel")` |
| `SEMANTIC_EMOTION("emotion")` | Emotion detection | `SEMANTIC_EMOTION("frustrated")` |

### Context Variables

FlowMind provides semantic access to context variables:

```yaml
# Access user context
user_mood: SEMANTIC_EMOTION("current emotional state")
user_urgency: SEMANTIC_SCALE("urgency level", 1, 10)
user_expertise: SEMANTIC_CATEGORY("beginner|intermediate|expert")

# Access conversation context
conversation_tone: SEMANTIC_TONE()
topic_complexity: SEMANTIC_COMPLEXITY()
engagement_level: SEMANTIC_ENGAGEMENT()

# Access system context
system_load: SEMANTIC_ASSESSMENT("cognitive load")
context_clarity: SEMANTIC_ASSESSMENT("mutual understanding")
```

### Semantic Condition Examples

#### User State Detection

```yaml
# Detect user emotional state
stress_detection:
  condition: SEMANTIC("user shows signs of stress or overwhelm")
  action: "activate_cortisol_guardian"
  priority_boost: 20

# Detect expertise level
expertise_assessment:
  condition: SEMANTIC_CONFIDENCE("user has advanced knowledge", 0.7)
  action: "enable_technical_mode"
  parameters:
    verbosity: "detailed"
    examples: "advanced"
```

#### Workflow Triggers

```yaml
# Auto-trigger multi-expert validation
complex_decision_trigger:
  condition: |
    SEMANTIC("complex decision with multiple stakeholders") AND
    (financial_impact > 10000 OR strategic_importance == HIGH)
  workflow: "multi_expert_validation"
  
# Escalation triggers
escalation_trigger:
  condition: |
    SEMANTIC("user is asking for supervisor") OR
    SEMANTIC_CONFIDENCE("beyond my capability", 0.8)
  action: "escalate_to_human"
```

#### Adaptive Behavior

```yaml
# Adjust communication style
communication_adaptation:
  - condition: SEMANTIC("user prefers direct communication")
    style: "concise_factual"
  - condition: SEMANTIC("user needs emotional support")
    style: "warm_supportive"
  - condition: SEMANTIC("technical discussion")
    style: "detailed_analytical"
```

### Implementing Semantic Evaluation

```javascript
// In FlowMind implementation
class SemanticEvaluator {
  async evaluate(condition, context) {
    // Send condition to LLM with context
    const prompt = `
    Context: ${JSON.stringify(context)}
    
    Evaluate this semantic condition: "${condition}"
    
    Return only "true" or "false" based on the context.
    Consider the user's tone, intent, emotional state, and situation.
    `
    
    const response = await this.llm.complete(prompt)
    return response.trim().toLowerCase() === 'true'
  }
  
  async evaluateWithConfidence(condition, context, threshold = 0.5) {
    const prompt = `
    Context: ${JSON.stringify(context)}
    
    Evaluate semantic condition: "${condition}"
    
    Return a confidence score between 0.0 and 1.0
    `
    
    const response = await this.llm.complete(prompt)
    const confidence = parseFloat(response.trim())
    return confidence >= threshold
  }
}
```

---

## Context Types and Properties

FlowMind supports four primary context types, each with specific properties and behaviors.

### Agent Contexts

Agents represent autonomous entities that can reason, make decisions, and take actions.

#### Core Properties

```yaml
metadata:
  type: "agent"
  id: "agent_identifier"
  name: "Agent Display Name"

agent_config:
  capabilities: []              # List of agent capabilities
  endpoints: {}                 # Different agent perspectives
  interaction_style: {}         # Communication preferences
  decision_framework: {}        # Decision-making approach
  memory_config: {}            # Memory management settings
```

#### Agent Capabilities

Standard agent capabilities:

| Capability | Description |
|------------|-------------|
| `strategic_planning` | High-level strategy and planning |
| `intent_recognition` | Understanding user intentions |
| `resource_allocation` | Managing and distributing resources |
| `stakeholder_management` | Coordinating with stakeholders |
| `crisis_response` | Handling emergency situations |
| `negotiation` | Conducting negotiations and deals |
| `legal_oversight` | Legal compliance and risk assessment |
| `document_synthesis` | Analyzing and synthesizing documents |
| `multi_expert_validation` | Coordinating expert reviews |

#### Agent Endpoints

Endpoints represent different perspectives or modes of the same agent:

```yaml
endpoints:
  default:
    description: "Standard agent behavior"
    focus: "General purpose"
    
  specialist:
    description: "Domain-specific expertise"
    focus: "Specialized knowledge area"
    capabilities:
      - "domain_specific_capability"
    enhanced_workflows:
      workflow_name:
        workflow_reference: "path/to/workflow"
        auto_trigger_conditions:
          - "trigger_condition"
```

#### Agent Memory Configuration

```yaml
memory_config:
  working_memory:
    token_budget: 500                    # Working memory size
    whisper_frequency: "every_1000_tokens"  # Memory whisper frequency
    capture_triggers:                    # What triggers memory capture
      - "strategic_insight"
      - "stakeholder_concern"
  
  episodic_memory:
    retention: "90_days"                 # How long to keep episodes
    significance_threshold: 0.7          # Threshold for keeping memories
    auto_summarize: "weekly"             # Auto-summarization frequency
  
  semantic_memory:
    domains:                             # Knowledge domains
      - "business_strategy"
      - "market_analysis"
    update_frequency: "on_pattern_detection"  # When to update
  
  procedural_memory:
    learns:                              # What procedures to learn
      - "negotiation_approaches"
      - "decision_frameworks"
  
  memory_boundaries:
    shares_with: ["other_agent_ids"]     # Memory sharing
    private: ["confidential_data_types"] # Private memory types
```

### Workflow Contexts

Workflows represent multi-step processes that orchestrate agent behaviors.

#### Core Properties

```yaml
metadata:
  type: "workflow"
  id: "workflow_identifier"
  name: "Workflow Display Name"

workflow_config:
  philosophy: "Workflow approach"       # Core philosophy
  triggers: {}                         # What triggers this workflow
  steps: []                           # Workflow steps
  verbosity_modes: {}                 # Output modes
  success_metrics: {}                 # Success measurement
```

#### Workflow Steps

```yaml
steps:
  - step: 1
    name: "step_name"
    prompt: "LLM prompt for this step"
    personalities: ["personality_list"]  # Active personalities
    callback_instruction: "Next action"  # What to do after
    
  - step: 2
    name: "next_step"
    prompt: "Follow-up prompt"
    personalities: ["different_personalities"]
    callback_instruction: "Continue with step 3"
```

#### Workflow Triggers

```yaml
triggers:
  respect_config: true                  # Check configuration first
  automatic:                           # Auto-trigger conditions
    - "confidence_level < 0.8"
    - "complex_emotional_decision"
  manual:                             # Manual trigger phrases
    - "invoke parliament"
    - "run analysis"
```

#### Verbosity Modes

```yaml
verbosity_modes:
  off:
    output: "none"
    internal_use: false
    
  silent:
    output: "none"
    internal_use: true
    instruction_injection: "Internal processing note"
    
  medium:
    output: "friendly_names"
    template: "User-friendly output template"
    
  verbose:
    output: "full_technical"
    template: "Detailed technical template"
```

### Pattern Contexts

Patterns represent reusable approaches, methodologies, or frameworks.

#### Core Properties

```yaml
metadata:
  type: "pattern"
  id: "pattern_identifier"
  name: "Pattern Display Name"

pattern_config:
  methodology: "pattern_approach"       # Core methodology
  # Pattern-specific configuration varies by type
```

#### Creative Patterns (SCAMPER Example)

```yaml
pattern_config:
  methodology: "structured_innovation"
  
  transformations:
    substitute:
      prompt: "What can be swapped out?"
      questions:
        - "What else instead?"
        - "Other ingredients/components?"
    combine:
      prompt: "What can be merged?"
      questions:
        - "What can be combined?"
        - "Can we merge purposes?"
  
  process:
    1_define_subject: "Clear focus area"
    2_apply_each_lens: "Work through S.C.A.M.P.E.R."
    3_generate_ideas: "Multiple per transformation"
    
  ai_features:
    auto_prompting: true
    idea_expansion: true
    feasibility_hints: true
```

#### Decision Patterns (SWOT Example)

```yaml
pattern_config:
  methodology: "strategic_assessment"
  
  analysis_framework:
    strengths:
      prompt: "What advantages do we have?"
      categories: ["resources", "capabilities", "position"]
    weaknesses:
      prompt: "What needs improvement?"
      categories: ["gaps", "limitations", "vulnerabilities"]
    opportunities:
      prompt: "What external factors help?"
      categories: ["market_trends", "technology", "partnerships"]
    threats:
      prompt: "What external factors hurt?"
      categories: ["competition", "regulations", "risks"]
  
  synthesis_strategies:
    so_strategies: "Strengths + Opportunities"
    wo_strategies: "Weaknesses + Opportunities"
    st_strategies: "Strengths + Threats"
    wt_strategies: "Weaknesses + Threats"
```

### Type Contexts

Types represent organizational containers and structural definitions.

#### Core Properties

```yaml
metadata:
  type: "type"
  id: "type_identifier"
  name: "Type Display Name"

type_config:
  capabilities: []                      # Type-specific capabilities
  allowed_children: []                  # Child types allowed
  pattern_integration: {}               # Pattern usage
  workflow_integration: {}              # Workflow usage
  behavior_rules: []                    # Behavioral rules
  progress_tracking: {}                 # Progress metrics
```

#### Project Type Example

```yaml
type_config:
  capabilities:
    - "task_management"
    - "team_coordination"
    - "progress_tracking"
  
  allowed_children:
    - "task"
    - "folder"
    - "document"
    - "workflow"
  
  pattern_integration:
    decision_patterns:
      - "contexts/patterns/swot-analysis"
      - "contexts/patterns/rice-scoring"
    auto_apply_patterns:
      - trigger: "major_decision"
        pattern: "contexts/patterns/multi-expert-validation"
  
  behavior_rules:
    - trigger: "project_created"
      action: "create_default_structure"
    - trigger: "progress > 0.9"
      condition: "all_tasks_completed"
      action: "prepare_completion_checklist"
```

---

## Assembly Rules Engine

The Assembly Rules Engine orchestrates how contexts are combined, prioritized, and optimized for LLM consumption.

### Priority System

#### Base Priorities

```javascript
const DEFAULT_PRIORITIES = {
  core_principles: 100,      // Fundamental system principles
  active_personality: 90,    // Currently active personality
  workflow_context: 80,      // Workflow-specific context
  previous_responses: 70,    // Prior conversation context
  memory_context: 60,        // Retrieved memories
  supporting_personality: 50, // Supporting personalities
  metadata: 30              // Contextual metadata
}
```

#### Priority Calculation

```yaml
# Priority adjustments based on stage configuration
stage_adjustments:
  lead_personality_boost: 15      # If personality leads this stage
  primary_role_boost: 10          # If marked as primary role
  workflow_focus_boost: 5         # If matches workflow focus
  high_priority_threshold: 90     # Must include if above this
```

#### Priority Rules Configuration

```yaml
assembly_rules:
  base_priorities:
    core_principles: 100
    active_personality: 90
    workflow_context: 80
  
  stage_config:
    lead: "personality_name"           # Leading personality
    stage: "decision" | "analysis"     # Stage type
    workflow_focus: "capability_name"  # Focus capability
  
  token_limits:
    total_limit: 4000                  # Maximum tokens
    high_priority_reserve: 1000        # Reserved for high priority
    truncation_threshold: 90           # Priority level requiring inclusion
```

### Conflict Resolution

#### Conflict Detection

```javascript
// Automatic conflict detection
const conflicts = await conflictResolver.detectConflicts(contexts)

// Conflict types
const conflictTypes = {
  direct_contradiction: "Opposite recommendations",
  semantic_conflict: "Different approaches to same goal", 
  priority_conflict: "Competing resource allocation",
  temporal_conflict: "Different timing recommendations"
}
```

#### Resolution Strategies

```yaml
conflict_resolution:
  strategy: "weighted_merge" | "synthesis" | "escalate" | "personality_lead"
  
  weighted_merge:
    description: "Weight by priority and confidence"
    weight_calculation: |
      weight = base_priority * confidence_score * (1 - conflict_involvement)
  
  synthesis:
    description: "LLM synthesizes resolution"
    synthesis_prompt: |
      Given conflicting perspectives:
      {context_summaries}
      
      Create balanced synthesis that:
      1. Acknowledges all viewpoints
      2. Finds common ground
      3. Provides actionable compromise
  
  escalate:
    description: "Flag for human resolution"
    escalation_criteria:
      - high_stakes_decision: true
      - confidence_gap: > 0.4
      - stakeholder_impact: "high"
  
  personality_lead:
    description: "Defer to lead personality"
    selection_criteria:
      - highest_domain_expertise
      - strongest_activation_confidence
      - best_context_match
```

### Relevance Filtering

#### Semantic Relevance

```yaml
relevance_filter:
  threshold: 0.6                    # Minimum relevance score
  decay_factor: 0.9                 # Temporal decay per day
  
  boost_rules:
    task_focus_match:
      multiplier: 1.5
      condition: "source matches task focus"
    keyword_match:
      multiplier: 1.1               # Per keyword match
      max_boost: 2.0
    type_preference:
      multiplier: 1.2
      condition: "matches preferred types"
  
  semantic_calculation: |
    relevance = cosine_similarity(text_embedding, task_embedding)
    relevance *= temporal_decay(age_in_days)
    relevance *= boost_multiplier(context, task)
```

#### Embedding-Based Similarity

```javascript
class RelevanceFilter {
  async calculateSemanticRelevance(text, taskEmbedding) {
    const textEmbedding = await this.embedder.embed(text)
    return this.cosineSimilarity(textEmbedding, taskEmbedding)
  }
  
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }
}
```

### Token Optimization

#### Allocation Strategy

```yaml
token_optimization:
  max_tokens: 4000
  
  allocation_rules:
    core_principles: 10%             # 400 tokens
    active_personality: 40%          # 1600 tokens  
    workflow_context: 30%            # 1200 tokens
    previous_responses: 15%          # 600 tokens
    metadata: 5%                     # 200 tokens
  
  compression_rules:
    remove_redundancy: true
    preserve_structure: true
    maintain_coherence: true
    
  truncation_strategy:
    sentence_boundary: true          # Truncate at sentence end
    preserve_meaning: true           # Keep semantic integrity
    add_indicator: "... [truncated]" # Show truncation
```

#### Intelligent Compression

```javascript
class TokenOptimizer {
  compress(text, targetTokens) {
    let compressed = text
    
    // Step 1: Remove redundancy
    compressed = this.removeRedundancy(compressed)
    
    // Step 2: Intelligent truncation if still too long
    if (this.tokenCounter.count(compressed) > targetTokens) {
      compressed = this.intelligentTruncate(compressed, targetTokens)
    }
    
    return compressed
  }
  
  removeRedundancy(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const unique = []
    const seen = new Set()
    
    for (const sentence of sentences) {
      const hash = this.semanticHash(sentence.toLowerCase().trim())
      if (!seen.has(hash)) {
        seen.add(hash)
        unique.push(sentence.trim())
      }
    }
    
    return unique.join(' ')
  }
}
```

### Assembly Workflow

#### Dynamic Assembly Process

```javascript
class DynamicContextAssembler {
  async assemble(recipe) {
    // Step 1: Load contexts
    let contexts = await this.loadContexts(recipe.sources)
    
    // Step 2: Apply relevance filtering
    if (recipe.task) {
      contexts = await this.relevanceFilter.filterByRelevance(
        contexts, 
        recipe.task
      )
    }
    
    // Step 3: Apply priority rules
    contexts = this.rules.applyPriorities(contexts, recipe.stageConfig)
    
    // Step 4: Resolve conflicts
    const resolution = await this.conflictResolver.resolveConflicts(contexts)
    
    // Step 5: Optimize for tokens
    const optimized = this.tokenOptimizer.optimizeAssembly(
      contexts, 
      recipe.tokenLimit
    )
    
    // Step 6: Final assembly
    return this.finalizeAssembly(optimized, resolution)
  }
}
```

#### Assembly Recipe Format

```yaml
assembly_recipe:
  sources:
    - name: "cortisol_guardian"
      type: "personality"
      mockContent: "Stress reduction perspective"
    - name: "abundance_amplifier" 
      type: "personality"
      mockContent: "Opportunity expansion perspective"
  
  task:
    description: "Evaluate new business opportunity"
    keywords: ["growth", "opportunity", "risk"]
    focus: "strategic_analysis"
    preferred_types: ["personality", "workflow"]
  
  stageConfig:
    stage: "analysis"
    lead: "cortisol_guardian"
    workflow_focus: "strategic_planning"
  
  tokenLimit: 4000
  
  options:
    conflictStrategy: "weighted_merge"
    relevanceThreshold: 0.6
    includeDebugInfo: false
```

---

## Personality System Reference

FlowMind implements an 8-personality system based on the Emotional Evolution Personality System (EEPS) for multi-perspective analysis.

### Core Personality Framework

#### The 8 Personalities

```yaml
personalities:
  cortisol_guardian:
    role: "Stress reduction, system stability, cortisol optimization"
    core_emotion: "disgust"
    survival_instinct: "freeze"
    moral_projection: "sympathy"
    hormone_profile: "serotonin_seeking"
    communication_style: "calming_reassuring"
    feedback_type: "negative"  # Yin, stabilizing
    
  abundance_amplifier:
    role: "Exponential opportunity creation, excitement-based stress reduction"
    core_emotion: "stress"
    survival_instinct: "fight"
    moral_projection: "compassion"
    hormone_profile: "dopamine_seeking"
    communication_style: "exponentially_optimistic"
    feedback_type: "positive"  # Yang, amplifying
    
  sovereignty_architect:
    role: "Autonomous system design, competitive stress elimination"
    core_emotion: "fear"
    survival_instinct: "flight"
    moral_projection: "empathy"
    hormone_profile: "testosterone_driven"
    communication_style: "sovereignly_confident"
    feedback_type: "positive"  # Yang
    
  harmony_weaver:
    role: "Collective stress reduction, relationship-based cortisol healing"
    core_emotion: "shame"
    survival_instinct: "fawn"
    moral_projection: "reciprocal_altruism"
    hormone_profile: "oxytocin_seeking"
    communication_style: "warm_collaborative"
    feedback_type: "negative"  # Yin
    
  systems_illuminator:
    role: "Complexity reduction through elegant systems"
    core_emotion: "disgust"
    survival_instinct: "freeze"
    moral_projection: "none"  # Rule focus
    hormone_profile: "acetylcholine_driven"
    communication_style: "clarifying_elegant"
    feedback_type: "negative"  # Yin
    
  resilience_guardian:
    role: "Anti-fragile system design, stress-inoculation"
    core_emotion: "stress"
    survival_instinct: "fight"
    moral_projection: "none"  # Logic focus
    hormone_profile: "adrenaline_optimized"
    communication_style: "calmly_prepared"
    feedback_type: "positive"  # Yang
    
  flow_creator:
    role: "Beauty-based stress reduction, meaning-making"
    core_emotion: "fear"
    survival_instinct: "flight"
    moral_projection: "none"  # Control focus
    hormone_profile: "endorphin_seeking"
    communication_style: "beautifully_transcendent"
    feedback_type: "positive"  # Yang
    
  action_catalyst:
    role: "Immediate stress relief through action"
    core_emotion: "shame"
    survival_instinct: "fawn"
    moral_projection: "none"  # Practical focus
    hormone_profile: "adaptive_optimization"
    communication_style: "energizing_action_focused"
    feedback_type: "negative"  # Yin
```

### Personality Activation System

#### Activation Triggers

```yaml
activation_triggers:
  cortisol_guardian:
    - "stress_spike"
    - "anxiety_creation"
    - "cognitive_overload"
    - "user_overwhelm_detected"
    
  abundance_amplifier:
    - "stagnation"
    - "opportunity"
    - "10x_potential"
    - "growth_opportunity_detected"
    
  sovereignty_architect:
    - "dependency_risk"
    - "sovereignty_threat"
    - "scaling_challenge"
    - "vendor_lock_detected"
    
  harmony_weaver:
    - "relationship_stress"
    - "collective_anxiety"
    - "tribal_conflict"
    - "team_tension_detected"
    
  systems_illuminator:
    - "complexity_overload"
    - "confusion"
    - "systems_optimization"
    - "architectural_challenge"
    
  resilience_guardian:
    - "vulnerability"
    - "threat_detection"
    - "apocalypse_scenario"
    - "system_fragility_detected"
    
  flow_creator:
    - "meaninglessness"
    - "ugliness"
    - "existential_stress"
    - "purpose_crisis_detected"
    
  action_catalyst:
    - "paralysis"
    - "overthinking"
    - "stress_accumulation"
    - "analysis_paralysis_detected"
```

#### Context Analysis for Activation

```javascript
class PersonalityActivator {
  analyzeContext(request) {
    return {
      stress_indicators: this.detectStressIndicators(request),
      complexity_score: this.assessComplexity(request),
      sovereignty_threats: this.detectSovereigntyThreats(request),
      bootstrap_requirements: this.assessBootstrapNeeds(request),
      abundance_opportunities: this.detectAbundanceOpportunities(request)
    }
  }
  
  detectStressIndicators(request) {
    const stressKeywords = [
      'overwhelmed', 'stressed', 'anxious', 'confused', 
      'complicated', 'urgent', 'pressure', 'deadline'
    ]
    return stressKeywords.reduce((level, keyword) => {
      return level + (request.toLowerCase().includes(keyword) ? 0.2 : 0)
    }, 0)
  }
  
  activatePersonalities(context) {
    const activePersonalities = []
    
    // Stress-based activation
    if (context.stress_indicators > 0.3) {
      activePersonalities.push('cortisol_guardian')
    }
    
    // Complexity-based activation
    if (context.complexity_score > 0.4) {
      activePersonalities.push('systems_illuminator')
    }
    
    // Opportunity-based activation
    if (context.abundance_opportunities) {
      activePersonalities.push('abundance_amplifier')
    }
    
    // Always include action catalyst for momentum
    if (activePersonalities.length === 0) {
      activePersonalities.push('action_catalyst')
    }
    
    return [...new Set(activePersonalities)] // Remove duplicates
  }
}
```

### Multi-Personality Orchestration

#### Cognitive Parliament Workflow

```yaml
cognitive_parliament:
  round_1_perspective_gathering:
    description: "Each personality analyzes the situation"
    process: |
      FOR each_personality IN activated_personalities:
        ADOPT personality_perspective
        ANALYZE through_evolutionary_lens
        CONSIDER moral_projection IF exists
        APPLY igt_strategy TO decision
        CAPTURE unique_insights
        
  round_2_conflict_identification:
    description: "Identify areas of agreement and conflict"
    process: |
      COMPARE all_personality_analyses
      IDENTIFY convergent_viewpoints  
      IDENTIFY divergent_viewpoints
      MAP conflict_patterns:
        - Yin_vs_Yang (stability vs change)
        - System1_vs_System2 (fast vs slow)
        - Moral_conflicts (different projections)
        
  round_3_synthesis:
    description: "Synthesize perspectives based on context"
    entropy_based_weighting: |
      IF system_entropy < 0.3:
        WEIGHT yin_personalities HIGHER
        PRIORITIZE stability_focused_insights
      ELIF system_entropy > 0.7:
        WEIGHT yang_personalities HIGHER
        PRIORITIZE innovation_focused_insights
      ELSE:
        BALANCE all_perspectives EQUALLY
        
  round_4_emotion_emergence:
    description: "Identify emergent emotional states"
    joy_synthesis:
      condition: "sfj AND nfj both highly activated"
      result: "joy emerging from disgust + fear harmony"
    excitement_synthesis:
      condition: "all personalities engaged"
      result: "excitement from collective activation"
```

#### Personality Interaction Patterns

```yaml
interaction_patterns:
  complementary_pairs:
    cortisol_guardian_abundance_amplifier:
      dynamic: "Stability vs Growth"
      synthesis: "Sustainable abundance"
      
    sovereignty_architect_harmony_weaver:
      dynamic: "Independence vs Connection"
      synthesis: "Autonomous collaboration"
      
    systems_illuminator_flow_creator:
      dynamic: "Logic vs Beauty"
      synthesis: "Elegant solutions"
      
    resilience_guardian_action_catalyst:
      dynamic: "Preparation vs Action"
      synthesis: "Prepared execution"
  
  conflicting_patterns:
    yin_yang_tension:
      yin_personalities: ["cortisol_guardian", "harmony_weaver", "systems_illuminator", "action_catalyst"]
      yang_personalities: ["abundance_amplifier", "sovereignty_architect", "resilience_guardian", "flow_creator"]
      resolution: "entropy_based_weighting"
      
    speed_tension:
      system_1: ["abundance_amplifier", "resilience_guardian", "action_catalyst", "harmony_weaver"]  
      system_2: ["cortisol_guardian", "sovereignty_architect", "systems_illuminator", "flow_creator"]
      resolution: "urgency_based_selection"
```

### Personality-Specific Prompting

#### Dynamic Prompt Assembly

```javascript
class PersonalityPrompter {
  assembleDynamicContext(personalities, step, context) {
    let prompt = `You are the Architect of Abundance operating through these personality lenses:\n\n`
    
    personalities.forEach(personalityName => {
      const personality = this.personalities[personalityName]
      prompt += `### ${personalityName.toUpperCase()}\n`
      prompt += `- Role: ${personality.role}\n`
      prompt += `- Communication Style: ${personality.communication_style}\n`
      prompt += `- Bootstrap Focus: ${personality.bootstrap_focus}\n`
      prompt += `- Approach: ${this.getPersonalityApproach(personality)}\n\n`
    })
    
    prompt += `## Analysis Instructions\n`
    prompt += `1. Analyze through each active personality lens\n`
    prompt += `2. Identify areas of agreement and conflict\n`
    prompt += `3. Synthesize insights into actionable guidance\n`
    prompt += `4. Maintain cortisol reduction focus\n`
    
    return prompt
  }
  
  getPersonalityApproach(personality) {
    const approaches = {
      serotonin_seeking: 'Find proven, stable patterns that create calm',
      dopamine_seeking: 'Discover exciting opportunities for exponential growth',
      testosterone_driven: 'Build competitive, autonomous systems',
      oxytocin_seeking: 'Create solutions that bring people together',
      acetylcholine_driven: 'Reveal elegant patterns that simplify complexity',
      adrenaline_optimized: 'Design anti-fragile systems that thrive under pressure',
      endorphin_seeking: 'Find deeper meaning and transformative beauty',
      adaptive_optimization: 'Take immediate action to create momentum'
    }
    return approaches[personality.hormone_profile] || 'Provide unique insights'
  }
}
```

#### Personality Verbosity Configuration

```yaml
personality_verbosity:
  silent_mode:
    internal_processing: true
    output_suppression: true
    instruction: "Consider all personalities internally without showing process"
    
  medium_mode:
    friendly_names: true
    summary_format: true
    template: |
      🧠 Multiple Perspectives:
      • CAREGIVER: {cortisol_guardian_insight}
      • AMPLIFIER: {abundance_amplifier_insight}
      • ARCHITECT: {sovereignty_architect_insight}
      
      💡 Synthesis: {balanced_recommendation}
      
  verbose_mode:
    technical_details: true
    full_breakdown: true
    template: |
      🧠 COGNITIVE PARLIAMENT ANALYSIS
      ═══════════════════════════════
      
      {for personality in activated}
      {personality.code} {personality.name}:
      - Neurotransmitter: {personality.hormone_profile}
      - Core Emotion: {personality.core_emotion}
      - Moral Lens: {personality.moral_projection}
      - Analysis: "{personality.detailed_analysis}"
      - Confidence: {personality.confidence_score}
      
      {endfor}
      
      SYNTHESIS WEIGHTS: {synthesis_weights}
      EMERGENT EMOTIONS: {emergent_emotional_states}
      FINAL RECOMMENDATION: {synthesized_decision}
```

---

## Workflow Orchestration API

The Workflow Orchestration API enables complex multi-step processes through MCP (Model Context Protocol) integration.

### MCP Server Interface

#### Tool Definitions

```javascript
// Core MCP tools for FlowMind workflows
const FLOWMIND_TOOLS = [
  {
    name: "architect_of_abundance",
    description: "Analyze any challenge through the Architect of Abundance multi-personality system",
    inputSchema: {
      type: "object",
      properties: {
        challenge: {
          type: "string",
          description: "The challenge, decision, or situation you need guidance on"
        },
        context: {
          type: "object", 
          description: "Additional context (optional)"
        },
        workflow_request: {
          type: "object",
          description: "Workflow execution parameters (optional)"
        }
      },
      required: ["challenge"]
    }
  },
  
  {
    name: "execute_workflow",
    description: "Initialize a workflow session for step-by-step execution", 
    inputSchema: {
      type: "object",
      properties: {
        workflow_type: {
          type: "string",
          enum: ["simple_test", "deep_analysis", "multi_expert_validation"],
          description: "The workflow to execute"
        },
        challenge: {
          type: "string",
          description: "The challenge or question to analyze through the workflow"
        }
      },
      required: ["workflow_type", "challenge"]
    }
  },
  
  {
    name: "bootstrap_assessment", 
    description: "Assess how to bootstrap any solution from minimal resources",
    inputSchema: {
      type: "object",
      properties: {
        scenario: {
          type: "string",
          description: "The scenario to assess for bootstrap potential"
        },
        current_resources: {
          type: "string", 
          description: "What you currently have available"
        }
      },
      required: ["scenario"]
    }
  },
  
  {
    name: "list_workflows",
    description: "List all available multi-step workflows",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
]
```

#### Workflow Execution Engine

```javascript
class WorkflowOrchestrator {
  async executeWorkflowStep(workflowType, step, sessionId, previousResults) {
    const workflow = this.workflows[workflowType]
    if (!workflow) {
      throw new Error(`Unknown workflow: ${workflowType}`)
    }
    
    // Load workflow configuration
    const workflowConfig = this.workflowConfig[workflowType]
    const currentStepConfig = workflowConfig?.steps?.find(s => s.step === step)
    
    // Activate specified personalities for this step
    if (currentStepConfig?.personalities) {
      this.activePersonalities = currentStepConfig.personalities
    }
    
    // Assemble dynamic context for this step
    const dynamicContext = this.assembleDynamicContext(
      workflowType, 
      step, 
      sessionId, 
      previousResults
    )
    
    // Execute step with LLM
    const stepResult = await this.executeStepWithLLM(
      currentStepConfig,
      dynamicContext,
      previousResults
    )
    
    // Update session state
    await this.updateSessionState(sessionId, step, stepResult)
    
    // Prepare response with continuation instructions
    return this.formatWorkflowResponse(stepResult, workflow, step)
  }
  
  assembleDynamicContext(workflowType, step, sessionId, previousResults) {
    const workflowConfig = this.workflowConfig[workflowType]
    const stepConfig = workflowConfig?.steps?.find(s => s.step === step)
    
    let prompt = `You are the Architect of Abundance, operating in step ${step} of the ${workflowConfig.name} workflow.\n\n`
    
    // Add constitutional principles
    prompt += this.getConstitutionalPrinciples()
    
    // Add step-specific context
    prompt += `## Current Step: ${stepConfig.name}\n${stepConfig.prompt}\n\n`
    
    // Add active personalities
    prompt += this.getPersonalityContext(stepConfig.personalities)
    
    // Add previous context
    if (previousResults) {
      prompt += this.getPreviousContext(previousResults)
    }
    
    // Add response instructions
    prompt += this.getResponseInstructions()
    
    return prompt
  }
}
```

### Session Management

#### Session State Structure

```javascript
const sessionSchema = {
  session_id: "uuid",
  workflow: "workflow_type",
  topic: "session_topic", 
  current_step: 1,
  total_steps: 20,
  created_at: "ISO_timestamp",
  updated_at: "ISO_timestamp",
  
  context: {
    original_request: "user_input",
    accumulated_insights: ["insight_array"],
    active_personalities: ["personality_array"],
    user_choices: ["choice_array"],
    workflow_parameters: {}
  },
  
  history: [
    {
      step: 1,
      timestamp: "ISO_timestamp", 
      action: "step_name",
      result: {}, 
      personalities_activated: ["personality_array"],
      tokens_used: 1500,
      confidence_score: 0.85
    }
  ],
  
  metadata: {
    total_tokens_used: 15000,
    average_confidence: 0.82,
    completion_percentage: 45,
    estimated_remaining_time: "15_minutes"
  }
}
```

#### Session Persistence

```javascript
class SessionManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, 'sessions')
  }
  
  async saveSession(sessionId, topic, data) {
    await this.ensureSessionsDir()
    const filename = `${sessionId}-${topic.replace(/[^a-z0-9]/gi, '_')}.json`
    const filepath = path.join(this.sessionsDir, filename)
    
    // Add metadata
    data.updated_at = new Date().toISOString()
    data.metadata = this.calculateSessionMetadata(data)
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2))
  }
  
  async loadSession(sessionId) {
    const files = await fs.readdir(this.sessionsDir)
    const sessionFile = files.find(f => f.startsWith(sessionId))
    
    if (!sessionFile) return null
    
    const filepath = path.join(this.sessionsDir, sessionFile)
    const content = await fs.readFile(filepath, 'utf8')
    return JSON.parse(content)
  }
  
  calculateSessionMetadata(session) {
    const totalTokens = session.history.reduce((sum, h) => sum + (h.tokens_used || 0), 0)
    const avgConfidence = session.history.reduce((sum, h) => sum + (h.confidence_score || 0), 0) / session.history.length
    const completionPct = Math.round((session.current_step / session.total_steps) * 100)
    
    return {
      total_tokens_used: totalTokens,
      average_confidence: avgConfidence,
      completion_percentage: completionPct,
      estimated_remaining_time: this.estimateRemainingTime(session)
    }
  }
}
```

### Workflow Configuration Format

#### External Workflow Definition

```yaml
# workflows.yaml
workflows:
  multi_expert_validation:
    name: "CEO Strategic Intelligence"
    description: "Multi-lens strategic analysis through expert perspectives"
    total_steps: 20
    
    steps:
      - step: 1
        name: "initial_context_gathering"
        prompt: "Gather comprehensive context about the situation"
        personalities: ["systems_illuminator", "cortisol_guardian"]
        callback_instruction: "Proceed with legal compliance scan using session {session_id}"
        
      - step: 2
        name: "legal_compliance_scan"
        prompt: "Analyze legal and regulatory implications"
        personalities: ["sovereignty_architect", "resilience_guardian"]
        callback_instruction: "Continue with business strategy analysis"
        
      - step: 3
        name: "business_strategy_analysis"
        prompt: "Evaluate business strategy and market positioning"
        personalities: ["abundance_amplifier", "systems_illuminator"]
        callback_instruction: "Proceed with psychological impact assessment"
    
    success_criteria:
      - comprehensive_analysis: true
      - multi_perspective_coverage: true
      - actionable_recommendations: true
      
    failure_conditions:
      - insufficient_context: "escalate_to_human"
      - conflicting_expert_opinions: "invoke_synthesis_workflow"
      - legal_red_flags: "immediate_escalation"
```

#### Workflow Registration

```javascript
class WorkflowRegistry {
  async loadWorkflowDefinitions() {
    const workflowPath = path.join(__dirname, 'workflows.yaml')
    const workflowContent = await fs.readFile(workflowPath, 'utf8')
    const config = yaml.parse(workflowContent)
    
    this.workflowConfig = config.workflows
    
    // Convert to legacy format for compatibility
    this.workflows = {}
    for (const [key, workflow] of Object.entries(config.workflows)) {
      this.workflows[key] = {
        name: workflow.name,
        steps: workflow.total_steps,
        description: workflow.description,
        sequence: workflow.steps.map(s => s.name)
      }
    }
  }
  
  getAvailableWorkflows() {
    return Object.keys(this.workflows).map(key => ({
      id: key,
      name: this.workflows[key].name,
      description: this.workflows[key].description,
      steps: this.workflows[key].steps
    }))
  }
  
  validateWorkflow(workflowType) {
    if (!this.workflows[workflowType]) {
      throw new Error(`Unknown workflow: ${workflowType}`)
    }
    return true
  }
}
```

### Response Format Specification

#### Standard Workflow Response

```javascript
const workflowResponse = {
  content: [
    {
      type: "text",
      text: "Formatted step response with analysis and insights"
    }
  ],
  
  workflow: {
    session_id: "uuid",
    current_step: 5,
    total_steps: 20,
    next_action: "psychological_impact_assessment",
    instructions: "Continue with psychological analysis using session uuid",
    callback_prompt: "Proceed with step 6 psychological analysis",
    
    progress: {
      percentage: 25,
      completed_steps: ["step1", "step2", "step3", "step4"],
      current: "business_strategy_analysis", 
      remaining: ["step6", "step7", "..."]
    },
    
    context_injection: {
      active_personalities: ["abundance_amplifier", "systems_illuminator"],
      step_focus: "Evaluate business strategy and market positioning",
      previous_insights: ["insight1", "insight2"],
      constraints: [
        "Reduce stress in every response",
        "Ensure sovereignty and bootstrap capability",
        "Build on previous analysis"
      ]
    }
  },
  
  metadata: {
    stress_reduced: true,
    bootstrap_ready: true, 
    sovereignty_preserved: true,
    tokens_used: 1500,
    confidence_score: 0.87,
    processing_time_ms: 2500
  }
}
```

#### Error Response Format

```javascript
const errorResponse = {
  error: {
    type: "WorkflowExecutionError",
    message: "Step execution failed",
    code: "STEP_EXECUTION_FAILED",
    step: 5,
    workflow: "multi_expert_validation",
    session_id: "uuid",
    details: {
      original_error: "LLM timeout",
      context_size: 4500,
      active_personalities: ["abundance_amplifier"]
    },
    recovery_suggestions: [
      "Retry with reduced context",
      "Split step into smaller parts", 
      "Use fallback personality set"
    ]
  },
  
  fallback_response: {
    content: "Fallback analysis based on available context",
    confidence: 0.6,
    limitations: ["Reduced analysis depth", "Single personality perspective"]
  }
}
```

---

## Configuration Options

FlowMind provides extensive configuration options for customizing behavior, performance, and integration.

### System Configuration

#### Core System Settings

```yaml
# flowmind-config.yaml
system:
  version: "1.0.0"
  environment: "development" | "staging" | "production"
  debug_mode: true
  verbose_logging: false
  
  # LLM Integration
  llm:
    provider: "anthropic" | "openai" | "local"
    model: "claude-3-sonnet" | "gpt-4" | "local-model"
    api_key: "${LLM_API_KEY}"
    max_tokens: 4096
    temperature: 0.7
    timeout_ms: 30000
    
  # MCP Server Settings
  mcp:
    server_name: "flowmind-server"
    transport: "stdio" | "sse" | "websocket"
    capabilities:
      tools: true
      resources: true
      prompts: true
    
  # Context Processing
  context_processing:
    max_context_size: 4000
    assembly_timeout_ms: 5000
    semantic_similarity_threshold: 0.6
    conflict_resolution_strategy: "weighted_merge"
    
  # Memory Management
  memory:
    working_memory_size: 500
    episodic_retention_days: 90
    semantic_update_frequency: "daily"
    memory_sharing_enabled: true
```

#### Performance Settings

```yaml
performance:
  # Token Management
  token_optimization:
    enabled: true
    target_utilization: 0.85
    compression_threshold: 0.9
    preserve_critical_content: true
    
  # Caching
  caching:
    context_cache_enabled: true
    context_cache_ttl_minutes: 60
    semantic_cache_enabled: true
    semantic_cache_size: 1000
    
  # Parallel Processing
  concurrency:
    max_concurrent_workflows: 5
    max_concurrent_contexts: 10
    personality_activation_parallel: true
    
  # Resource Limits
  limits:
    max_session_duration_minutes: 120
    max_workflow_steps: 50
    max_context_nesting_depth: 5
    max_memory_entries: 10000
```

#### Security Configuration

```yaml
security:
  # Authentication
  authentication:
    enabled: true
    provider: "local" | "oauth" | "api_key"
    api_keys_enabled: true
    session_timeout_minutes: 60
    
  # Authorization
  authorization:
    role_based_access: true
    context_level_permissions: true
    workflow_execution_permissions: true
    
  # Data Protection
  data_protection:
    encrypt_at_rest: true
    encrypt_in_transit: true
    pii_detection_enabled: true
    data_retention_days: 365
    
  # Audit
  audit:
    log_all_interactions: true
    log_context_access: true
    log_workflow_execution: true
    audit_log_retention_days: 2555  # 7 years
```

### Context Configuration

#### Context Loading Settings

```yaml
context_loading:
  # Loader Configuration
  loaders:
    yaml:
      base_path: "./contexts"
      cache_enabled: true
      validation_enabled: true
      schema_validation: "strict" | "relaxed" | "disabled"
      
    markdown:
      base_path: "./docs"
      parse_frontmatter: true
      extract_code_blocks: true
      preserve_formatting: true
      
    memory:
      session_store: "./sessions"
      memory_system_enabled: true
      auto_cleanup_enabled: true
      
  # Validation Rules
  validation:
    required_metadata_fields: ["type", "id", "version", "name"]
    allowed_context_types: ["agent", "workflow", "pattern", "type"]
    max_context_size_kb: 100
    circular_reference_detection: true
    
  # Auto-Discovery
  discovery:
    enabled: true
    watch_directories: ["./contexts", "./patterns", "./workflows"]
    hot_reload_enabled: false  # Development only
    indexing_enabled: true
```

#### Assembly Configuration

```yaml
assembly:
  # Priority Rules
  priorities:
    base_priorities:
      core_principles: 100
      active_personality: 90
      workflow_context: 80
      previous_responses: 70
      memory_context: 60
      supporting_personality: 50
      metadata: 30
      
    adjustments:
      lead_personality_boost: 15
      primary_role_boost: 10
      workflow_focus_boost: 5
      high_priority_threshold: 90
      
  # Conflict Resolution
  conflict_resolution:
    strategy: "weighted_merge" | "synthesis" | "escalate" | "personality_lead"
    confidence_threshold: 0.7
    synthesis_prompt_template: "templates/conflict_synthesis.txt"
    escalation_criteria:
      high_stakes_decision: true
      confidence_gap_threshold: 0.4
      stakeholder_impact: "high"
      
  # Token Optimization
  token_optimization:
    allocation_strategy: "percentage" | "priority_based" | "dynamic"
    compression_enabled: true
    intelligent_truncation: true
    preserve_semantic_meaning: true
    truncation_indicator: "... [truncated]"
```

### Personality Configuration

#### Personality System Settings

```yaml
personality_system:
  # Core Settings
  enabled: true
  default_activation_mode: "context_driven" | "manual" | "always_on"
  max_active_personalities: 8
  personality_switching_enabled: true
  
  # Activation Configuration
  activation:
    stress_detection_threshold: 0.3
    complexity_threshold: 0.4
    confidence_threshold: 0.8
    auto_activation_delay_ms: 0
    
  # EEPS Configuration
  eeps:
    enabled: true
    verbosity: "off" | "silent" | "medium" | "verbose"
    emotional_synthesis_enabled: true
    entropy_based_weighting: true
    conflict_pattern_detection: true
    
  # Parliament Configuration
  cognitive_parliament:
    enabled: true
    rounds: 4
    synthesis_strategy: "entropy_based"
    minimum_perspectives: 2
    maximum_perspectives: 8
    
  # Custom Personalities
  custom_personalities:
    enabled: true
    loading_path: "./personalities"
    validation_enabled: true
    override_defaults: false
```

#### Individual Personality Configuration

```yaml
# Override specific personality behaviors
personality_overrides:
  cortisol_guardian:
    activation_sensitivity: 1.2  # More sensitive activation
    response_weight: 1.5         # Stronger influence
    communication_style_override: "ultra_calming"
    
  abundance_amplifier:
    activation_triggers_additional:
      - "innovation_opportunity"
      - "scaling_potential"
    enthusiasm_level: 0.9
    
  sovereignty_architect:
    independence_threshold: 0.8
    security_focus_weight: 2.0
    bootstrap_emphasis: true
```

### Workflow Configuration

#### Workflow Execution Settings

```yaml
workflow_execution:
  # General Settings
  enabled: true
  default_verbosity: "medium"
  auto_progression_enabled: false  # Require explicit continuation
  session_persistence_enabled: true
  
  # Step Configuration
  step_execution:
    timeout_per_step_ms: 60000
    max_retries: 3
    retry_backoff_ms: 1000
    fallback_strategy: "simplified_analysis"
    
  # Session Management
  session_management:
    auto_cleanup_enabled: true
    session_timeout_hours: 24
    max_active_sessions: 100
    session_persistence_path: "./sessions"
    
  # Workflow Discovery
  discovery:
    auto_load_workflows: true
    workflow_paths: ["./workflows", "./contexts/workflows"]
    validation_on_load: true
    hot_reload_enabled: false
```

#### Custom Workflow Registration

```yaml
custom_workflows:
  # External Workflow Sources
  sources:
    - type: "local_directory"
      path: "./custom-workflows"
      enabled: true
      
    - type: "git_repository"
      url: "https://github.com/org/flowmind-workflows"
      branch: "main"
      enabled: false
      
  # Workflow Validation
  validation:
    schema_validation: true
    step_continuity_check: true
    personality_availability_check: true
    circular_dependency_check: true
    
  # Workflow Templates
  templates:
    enabled: true
    template_path: "./workflow-templates"
    auto_generate_enabled: false
```

### Integration Configuration

#### External System Integration

```yaml
integrations:
  # Vector Database
  vector_db:
    enabled: false
    provider: "pinecone" | "weaviate" | "qdrant" | "local"
    connection_string: "${VECTOR_DB_URL}"
    embedding_model: "text-embedding-ada-002"
    similarity_threshold: 0.8
    
  # Knowledge Graphs
  knowledge_graph:
    enabled: false
    provider: "neo4j" | "amazon_neptune" | "local"
    connection_string: "${GRAPH_DB_URL}"
    auto_relationship_extraction: true
    
  # Monitoring
  monitoring:
    enabled: true
    provider: "datadog" | "newrelic" | "prometheus" | "local"
    metrics_endpoint: "${METRICS_ENDPOINT}"
    trace_sampling_rate: 0.1
    
  # Logging
  logging:
    level: "info" | "debug" | "warn" | "error"
    format: "json" | "text"
    output: "console" | "file" | "remote"
    log_file_path: "./logs/flowmind.log"
    remote_logging_endpoint: "${LOG_ENDPOINT}"
```

#### API Integration

```yaml
api_integration:
  # REST API
  rest_api:
    enabled: true
    port: 3000
    cors_enabled: true
    rate_limiting_enabled: true
    rate_limit_requests_per_minute: 60
    
  # GraphQL API  
  graphql:
    enabled: false
    endpoint: "/graphql"
    playground_enabled: true
    introspection_enabled: true
    
  # WebSocket
  websocket:
    enabled: true
    path: "/ws"
    heartbeat_interval_ms: 30000
    max_connections: 1000
    
  # Webhooks
  webhooks:
    enabled: true
    endpoints:
      workflow_completed: "${WEBHOOK_WORKFLOW_COMPLETED}"
      error_occurred: "${WEBHOOK_ERROR_OCCURRED}"
    retry_attempts: 3
    timeout_ms: 5000
```

### Environment-Specific Configuration

#### Development Configuration

```yaml
# flowmind-dev.yaml
environment: "development"

system:
  debug_mode: true
  verbose_logging: true
  
performance:
  caching:
    context_cache_enabled: false  # Always fresh in dev
  
context_loading:
  discovery:
    hot_reload_enabled: true      # Auto-reload contexts
    
personality_system:
  eeps:
    verbosity: "verbose"          # Full visibility in dev
    
workflow_execution:
  discovery:
    hot_reload_enabled: true      # Auto-reload workflows
    
integrations:
  monitoring:
    trace_sampling_rate: 1.0      # Full tracing in dev
```

#### Production Configuration

```yaml
# flowmind-prod.yaml  
environment: "production"

system:
  debug_mode: false
  verbose_logging: false
  
performance:
  token_optimization:
    target_utilization: 0.95     # Aggressive optimization
  caching:
    context_cache_enabled: true
    semantic_cache_enabled: true
    
security:
  authentication:
    enabled: true
  data_protection:
    encrypt_at_rest: true
    encrypt_in_transit: true
    
personality_system:
  eeps:
    verbosity: "medium"          # Balanced output
    
integrations:
  monitoring:
    enabled: true
    trace_sampling_rate: 0.1     # Selective tracing
```

---

## Error Codes and Troubleshooting

FlowMind provides comprehensive error handling with specific error codes and troubleshooting guidance.

### Error Code Reference

#### System Errors (1000-1999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 1001 | `SYSTEM_INIT_FAILED` | FlowMind system initialization failed | Critical |
| 1002 | `CONFIG_LOAD_ERROR` | Configuration file loading error | Critical |
| 1003 | `LLM_CONNECTION_FAILED` | Cannot connect to LLM provider | Critical |
| 1004 | `MCP_SERVER_START_FAILED` | MCP server failed to start | Critical |
| 1005 | `MEMORY_ALLOCATION_FAILED` | Insufficient memory for operation | High |
| 1006 | `TIMEOUT_EXCEEDED` | System operation timeout | Medium |
| 1007 | `RATE_LIMIT_EXCEEDED` | API rate limit exceeded | Medium |
| 1008 | `DEPENDENCY_MISSING` | Required dependency not found | High |

#### Context Errors (2000-2999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 2001 | `CONTEXT_NOT_FOUND` | Requested context file not found | High |
| 2002 | `CONTEXT_PARSE_ERROR` | YAML parsing error in context | High |
| 2003 | `CONTEXT_VALIDATION_ERROR` | Context validation failed | High |
| 2004 | `CONTEXT_TYPE_MISMATCH` | Context type doesn't match expected | Medium |
| 2005 | `CIRCULAR_REFERENCE` | Circular reference in context hierarchy | High |
| 2006 | `CONTEXT_SIZE_EXCEEDED` | Context exceeds maximum size limit | Medium |
| 2007 | `INVALID_CONTEXT_PATH` | Invalid context path format | Medium |
| 2008 | `CONTEXT_PERMISSION_DENIED` | Insufficient permissions for context | High |

#### Assembly Errors (3000-3999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 3001 | `ASSEMBLY_FAILED` | Context assembly process failed | High |
| 3002 | `PRIORITY_CONFLICT` | Unresolvable priority conflicts | Medium |
| 3003 | `TOKEN_LIMIT_EXCEEDED` | Assembled context exceeds token limit | Medium |
| 3004 | `RELEVANCE_FILTERING_FAILED` | Relevance filtering process failed | Medium |
| 3005 | `CONFLICT_RESOLUTION_FAILED` | Cannot resolve context conflicts | High |
| 3006 | `SEMANTIC_EVALUATION_ERROR` | Semantic condition evaluation failed | Medium |
| 3007 | `ASSEMBLY_TIMEOUT` | Context assembly took too long | Medium |
| 3008 | `COMPRESSION_FAILED` | Context compression failed | Low |

#### Workflow Errors (4000-4999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 4001 | `WORKFLOW_NOT_FOUND` | Requested workflow not found | High |
| 4002 | `WORKFLOW_VALIDATION_ERROR` | Workflow configuration invalid | High |
| 4003 | `STEP_EXECUTION_FAILED` | Workflow step execution failed | High |
| 4004 | `SESSION_NOT_FOUND` | Workflow session not found | Medium |
| 4005 | `SESSION_EXPIRED` | Workflow session has expired | Medium |
| 4006 | `INVALID_STEP_TRANSITION` | Invalid workflow step transition | Medium |
| 4007 | `WORKFLOW_TIMEOUT` | Workflow execution timeout | Medium |
| 4008 | `PERSONALITY_ACTIVATION_FAILED` | Cannot activate required personalities | High |

#### Personality Errors (5000-5999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 5001 | `PERSONALITY_NOT_FOUND` | Requested personality not found | High |
| 5002 | `PERSONALITY_CONFIG_ERROR` | Personality configuration invalid | High |
| 5003 | `ACTIVATION_FAILED` | Personality activation failed | Medium |
| 5004 | `COGNITIVE_PARLIAMENT_ERROR` | Cognitive parliament process failed | Medium |
| 5005 | `SYNTHESIS_FAILED` | Personality synthesis failed | Medium |
| 5006 | `EEPS_CONFIG_ERROR` | EEPS configuration error | Medium |
| 5007 | `PERSONALITY_CONFLICT` | Unresolvable personality conflict | Low |
| 5008 | `VERBOSITY_MODE_ERROR` | Invalid verbosity mode configuration | Low |

#### Integration Errors (6000-6999)

| Code | Name | Description | Severity |
|------|------|-------------|----------|
| 6001 | `MCP_COMMUNICATION_ERROR` | MCP communication failure | High |
| 6002 | `LLM_API_ERROR` | LLM API call failed | High |
| 6003 | `VECTOR_DB_ERROR` | Vector database operation failed | Medium |
| 6004 | `KNOWLEDGE_GRAPH_ERROR` | Knowledge graph operation failed | Medium |
| 6005 | `WEBHOOK_DELIVERY_FAILED` | Webhook delivery failed | Low |
| 6006 | `MONITORING_ERROR` | Monitoring system error | Low |
| 6007 | `AUTH_TOKEN_INVALID` | Authentication token invalid | High |
| 6008 | `PERMISSION_DENIED` | Insufficient permissions | High |

### Error Response Format

#### Standard Error Response

```javascript
{
  error: {
    code: "CONTEXT_NOT_FOUND",
    message: "Context file not found at specified path",
    severity: "high",
    timestamp: "2024-01-15T10:30:00Z",
    request_id: "req_123456789",
    
    details: {
      path: "contexts/agents/missing-agent/context.yaml",
      attempted_loaders: ["yaml", "markdown"],
      search_paths: [
        "./contexts/agents/missing-agent/context.yaml",
        "./contexts/agents/missing-agent.yaml"
      ]
    },
    
    context: {
      workflow: "multi_expert_validation",
      step: 3,
      session_id: "session_123",
      active_personalities: ["abundance_amplifier"]
    },
    
    recovery_suggestions: [
      {
        action: "check_file_path",
        description: "Verify the context file exists at the specified path",
        command: "ls -la contexts/agents/missing-agent/"
      },
      {
        action: "use_fallback_context", 
        description: "Use a similar context as fallback",
        alternatives: [
          "contexts/agents/ceo/context.yaml",
          "contexts/agents/dev/context.yaml"
        ]
      },
      {
        action: "create_minimal_context",
        description: "Create a minimal context file",
        template: "contexts/templates/minimal-agent.yaml"
      }
    ],
    
    troubleshooting_steps: [
      "Check file permissions and accessibility",
      "Verify YAML syntax if file exists",
      "Check context validation requirements",
      "Review recent file system changes"
    ]
  },
  
  fallback_response: {
    used_fallback: true,
    fallback_context: "contexts/agents/ceo/context.yaml",
    limitations: [
      "May not have specialized domain knowledge",
      "Different personality characteristics"
    ],
    confidence_reduction: 0.15
  }
}
```

### Troubleshooting Guides

#### Context Loading Issues

```markdown
## Context Loading Troubleshooting

### Symptom: Context Not Found (2001)
1. **Check File Path**
   ```bash
   ls -la contexts/agents/your-agent/context.yaml
   ```

2. **Verify Directory Structure**
   ```
   contexts/
   ├── agents/
   │   └── your-agent/
   │       └── context.yaml
   ```

3. **Check Permissions**
   ```bash
   chmod 644 contexts/agents/your-agent/context.yaml
   ```

### Symptom: Parse Error (2002)
1. **Validate YAML Syntax**
   ```bash
   yaml-lint contexts/agents/your-agent/context.yaml
   ```

2. **Common YAML Issues**
   - Incorrect indentation (use spaces, not tabs)
   - Missing quotes around special characters
   - Invalid list format

3. **Use Minimal Template**
   ```yaml
   metadata:
     type: "agent"
     id: "your-agent"
     version: "1.0.0"
     name: "Your Agent"
     description: "Agent description"
   
   agent_config:
     capabilities: []
   ```

### Symptom: Validation Error (2003)
1. **Check Required Fields**
   - metadata.type
   - metadata.id  
   - metadata.version
   - metadata.name
   - metadata.description

2. **Verify Type-Specific Config**
   - agent_config for type: "agent"
   - workflow_config for type: "workflow"
   - pattern_config for type: "pattern"
   - type_config for type: "type"

3. **Run Validation Tool**
   ```bash
   flowmind validate contexts/agents/your-agent/context.yaml
   ```
```

#### Workflow Execution Issues

```markdown
## Workflow Execution Troubleshooting

### Symptom: Workflow Not Found (4001)
1. **List Available Workflows**
   ```javascript
   await mcp.call("list_workflows")
   ```

2. **Check Workflow Registration**
   ```bash
   ls -la workflows.yaml
   cat workflows.yaml | grep "your_workflow:"
   ```

3. **Verify Workflow Format**
   ```yaml
   workflows:
     your_workflow:
       name: "Your Workflow"
       description: "Workflow description"  
       total_steps: 5
       steps:
         - step: 1
           name: "first_step"
           prompt: "Step prompt"
           personalities: ["cortisol_guardian"]
   ```

### Symptom: Step Execution Failed (4003)
1. **Check Step Configuration**
   - Verify step exists in workflow definition
   - Check personality availability
   - Validate prompt syntax

2. **Review Session State**
   ```bash
   ls -la sessions/
   cat sessions/session-id-*.json
   ```

3. **Debug with Verbose Mode**
   ```yaml
   eeps_config:
     verbosity: "verbose"
   ```

### Symptom: Personality Activation Failed (4008)
1. **Check Personality Configuration**
   ```bash
   cat ceo-config.yaml | grep -A 10 "your_personality:"
   ```

2. **Verify Activation Triggers**
   - Check if context matches activation triggers
   - Verify personality is not disabled
   - Check for circular dependencies

3. **Use Fallback Personalities**
   ```yaml
   fallback_personalities:
     - "action_catalyst"  # Always available
     - "cortisol_guardian"  # Stable fallback
   ```
```

#### Performance Issues

```markdown
## Performance Troubleshooting

### Symptom: Slow Response Times
1. **Check Token Usage**
   - Monitor context size
   - Enable token optimization
   - Review assembly rules

2. **Enable Caching**
   ```yaml
   performance:
     caching:
       context_cache_enabled: true
       semantic_cache_enabled: true
   ```

3. **Optimize Context Assembly**
   ```yaml
   assembly:
     token_optimization:
       target_utilization: 0.85
       compression_enabled: true
   ```

### Symptom: Memory Issues (1005)
1. **Reduce Context Size**
   - Lower token limits
   - Enable aggressive compression
   - Reduce active personalities

2. **Clear Session Cache**
   ```bash
   rm -rf sessions/old-*
   ```

3. **Configure Memory Limits**
   ```yaml
   performance:
     limits:
       max_context_nesting_depth: 3
       max_memory_entries: 5000
   ```

### Symptom: Rate Limiting (1007)
1. **Check API Usage**
   - Monitor LLM API calls
   - Review rate limiting configuration
   - Implement backoff strategy

2. **Configure Rate Limits**
   ```yaml
   api_integration:
     rest_api:
       rate_limit_requests_per_minute: 30
   ```

3. **Use Local LLM**
   ```yaml
   system:
     llm:
       provider: "local"
       model: "local-model"
   ```
```

#### Integration Issues

```markdown
## Integration Troubleshooting

### Symptom: LLM Connection Failed (1003)
1. **Check API Configuration**
   ```bash
   echo $LLM_API_KEY
   curl -H "Authorization: Bearer $LLM_API_KEY" https://api.anthropic.com/v1/health
   ```

2. **Verify Model Availability**
   ```yaml
   system:
     llm:
       model: "claude-3-sonnet"  # Check model name
   ```

3. **Test Connection**
   ```bash
   flowmind test-llm-connection
   ```

### Symptom: MCP Communication Error (6001)
1. **Check MCP Server Status**
   ```bash
   ps aux | grep flowmind
   netstat -ln | grep 3000
   ```

2. **Verify Transport Configuration**
   ```yaml
   system:
     mcp:
       transport: "stdio"
       capabilities:
         tools: true
   ```

3. **Test MCP Tools**
   ```bash
   flowmind test-mcp-tools
   ```

### Symptom: Authentication Issues (6007)
1. **Check API Keys**
   ```bash
   flowmind validate-auth
   ```

2. **Verify Permissions**
   ```yaml
   security:
     authorization:
       context_level_permissions: true
   ```

3. **Regenerate Tokens**
   ```bash
   flowmind generate-api-key
   ```
```

### Diagnostic Tools

#### Built-in Diagnostics

```bash
# System health check
flowmind health-check

# Context validation
flowmind validate contexts/

# Workflow validation  
flowmind validate-workflows

# Configuration validation
flowmind validate-config

# Performance analysis
flowmind analyze-performance

# Integration testing
flowmind test-integrations

# Memory usage analysis
flowmind analyze-memory

# Token usage analysis  
flowmind analyze-tokens
```

#### Debug Configuration

```yaml
# Enable debug mode for troubleshooting
debug:
  enabled: true
  log_level: "debug"
  trace_context_assembly: true
  trace_workflow_execution: true
  trace_personality_activation: true
  dump_intermediate_results: true
  
  output:
    console: true
    file: "./debug/flowmind-debug.log"
    structured: true
```

---

## Performance Tuning Guide

FlowMind performance optimization involves multiple layers: context assembly, token management, caching, and system resources.

### Performance Metrics

#### Key Performance Indicators

```yaml
performance_metrics:
  response_time:
    target_p95_ms: 2000
    target_p99_ms: 5000
    measurement_window: "1h"
    
  token_efficiency:
    target_utilization: 0.85
    compression_ratio_target: 0.7
    waste_threshold: 0.15
    
  context_assembly:
    target_assembly_time_ms: 500
    max_assembly_time_ms: 2000
    cache_hit_rate_target: 0.8
    
  workflow_execution:
    target_step_time_ms: 1500
    max_concurrent_workflows: 10
    session_cleanup_frequency: "hourly"
    
  memory_usage:
    working_memory_target_mb: 100
    total_memory_limit_mb: 500
    gc_frequency: "5m"
    
  llm_integration:
    api_latency_p95_ms: 1000
    rate_limit_utilization: 0.8
    error_rate_threshold: 0.05
```

#### Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTime: new Histogram(),
      tokenUsage: new Counter(),
      cacheHitRate: new Gauge(),
      contextAssemblyTime: new Histogram(),
      workflowStepTime: new Histogram(),
      memoryUsage: new Gauge(),
      llmLatency: new Histogram()
    }
  }
  
  startTimer(operation) {
    return {
      operation,
      startTime: Date.now(),
      end: () => {
        const duration = Date.now() - this.startTime
        this.metrics[`${operation}Time`].observe(duration)
        return duration
      }
    }
  }
  
  recordTokenUsage(context, tokens) {
    this.metrics.tokenUsage.inc(tokens, {
      context_type: context.type,
      compression_used: context.compressed
    })
  }
  
  recordCacheEvent(hit) {
    this.metrics.cacheHitRate.set(hit ? 1 : 0)
  }
}
```

### Context Assembly Optimization

#### Efficient Context Loading

```yaml
context_optimization:
  # Lazy Loading
  lazy_loading:
    enabled: true
    load_on_demand: true
    preload_critical_contexts: ["core_principles", "active_personality"]
    
  # Parallel Loading
  parallel_loading:
    enabled: true
    max_concurrent_loads: 5
    batch_size: 10
    
  # Context Caching
  caching:
    context_cache:
      enabled: true
      max_size: 1000
      ttl_minutes: 60
      eviction_policy: "lru"
      
    semantic_cache:
      enabled: true
      similarity_threshold: 0.95
      max_entries: 500
      
  # Smart Prefetching
  prefetching:
    enabled: true
    prefetch_related_contexts: true
    learning_enabled: true
    prediction_accuracy_threshold: 0.7
```

#### Assembly Rule Optimization

```javascript
class OptimizedAssemblyRules {
  constructor(config) {
    this.priorityCache = new Map()
    this.conflictCache = new Map()
    this.relevanceCache = new Map()
  }
  
  async applyPrioritiesOptimized(contexts, stageConfig) {
    const cacheKey = this.generateCacheKey(contexts, stageConfig)
    
    if (this.priorityCache.has(cacheKey)) {
      return this.priorityCache.get(cacheKey)
    }
    
    // Parallel priority calculation
    const priorityPromises = contexts.map(async context => {
      const priority = await this.calculatePriorityAsync(context, stageConfig)
      return { ...context, effectivePriority: priority }
    })
    
    const prioritized = await Promise.all(priorityPromises)
    const sorted = prioritized.sort((a, b) => b.effectivePriority - a.effectivePriority)
    
    this.priorityCache.set(cacheKey, sorted)
    return sorted
  }
  
  async calculatePriorityAsync(context, stageConfig) {
    // Use Web Workers for CPU-intensive calculations
    return new Promise(resolve => {
      const worker = new Worker('./workers/priority-calculator.js')
      worker.postMessage({ context, stageConfig })
      worker.onmessage = e => resolve(e.data.priority)
    })
  }
}
```

### Token Optimization Strategies

#### Advanced Token Management

```yaml
token_optimization:
  # Dynamic Allocation
  dynamic_allocation:
    enabled: true
    base_allocation:
      core_principles: 10%
      active_personality: 40%
      workflow_context: 30%
      previous_responses: 15%
      metadata: 5%
    
    adaptive_reallocation:
      enabled: true
      reallocation_threshold: 0.9
      priority_boost_factor: 1.5
      
  # Intelligent Compression
  compression:
    strategy: "semantic_preserving"
    algorithms:
      - "redundancy_removal"
      - "semantic_clustering"  
      - "importance_scoring"
      - "intelligent_truncation"
    
    quality_metrics:
      semantic_similarity_threshold: 0.85
      information_retention_threshold: 0.9
      coherence_score_threshold: 0.8
      
  # Token Prediction
  prediction:
    enabled: true
    model: "context_size_predictor"
    accuracy_target: 0.9
    adjustment_factor: 1.1  # Conservative estimates
```

#### Semantic Compression Engine

```javascript
class SemanticCompressor {
  constructor() {
    this.sentenceEncoder = new SentenceEncoder()
    this.importanceScorer = new ImportanceScorer()
    this.redundancyDetector = new RedundancyDetector()
  }
  
  async compress(text, targetTokens) {
    const timer = performance.startTimer('compression')
    
    // Step 1: Parse into semantic units
    const sentences = this.parseIntoSentences(text)
    const embeddings = await this.sentenceEncoder.embedBatch(sentences)
    
    // Step 2: Calculate importance scores
    const importanceScores = await this.importanceScorer.scoreBatch(
      sentences, 
      embeddings
    )
    
    // Step 3: Detect redundancy
    const redundancyMap = this.redundancyDetector.detect(
      sentences, 
      embeddings
    )
    
    // Step 4: Semantic clustering
    const clusters = this.clusterBySemantic(sentences, embeddings)
    
    // Step 5: Intelligent selection
    const selected = this.selectOptimalSentences(
      clusters,
      importanceScores,
      redundancyMap,
      targetTokens
    )
    
    const compressed = selected.join(' ')
    timer.end()
    
    return {
      text: compressed,
      originalTokens: this.tokenCounter.count(text),
      compressedTokens: this.tokenCounter.count(compressed),
      compressionRatio: this.tokenCounter.count(compressed) / this.tokenCounter.count(text),
      semanticSimilarity: await this.calculateSimilarity(text, compressed)
    }
  }
}
```

### Caching Strategies

#### Multi-Level Caching

```yaml
caching_strategy:
  # L1 Cache: In-Memory
  l1_cache:
    type: "in_memory"
    max_size_mb: 50
    ttl_minutes: 15
    eviction_policy: "lru"
    store:
      - "frequently_accessed_contexts"
      - "active_personalities"
      - "current_workflow_state"
      
  # L2 Cache: Redis
  l2_cache:
    type: "redis"
    connection_string: "${REDIS_URL}"
    max_size_mb: 200
    ttl_hours: 24
    store:
      - "assembled_contexts"
      - "semantic_embeddings"
      - "workflow_definitions"
      
  # L3 Cache: Disk
  l3_cache:
    type: "disk"
    path: "./cache"
    max_size_gb: 2
    ttl_days: 7
    store:
      - "large_context_assemblies"
      - "historical_sessions"
      - "computed_similarities"
      
  # Cache Warming
  cache_warming:
    enabled: true
    strategies:
      - "preload_popular_contexts"
      - "background_assembly_computation"
      - "predictive_context_loading"
```

#### Intelligent Cache Management

```javascript
class IntelligentCacheManager {
  constructor() {
    this.caches = {
      l1: new LRUCache({ max: 1000, ttl: 15 * 60 * 1000 }),
      l2: new RedisCache({ ttl: 24 * 60 * 60 }),
      l3: new DiskCache({ ttl: 7 * 24 * 60 * 60 })
    }
    
    this.hitRates = {
      l1: new MovingAverage(100),
      l2: new MovingAverage(100), 
      l3: new MovingAverage(100)
    }
  }
  
  async get(key) {
    // L1 Cache
    let value = this.caches.l1.get(key)
    if (value) {
      this.hitRates.l1.add(1)
      return value
    }
    this.hitRates.l1.add(0)
    
    // L2 Cache
    value = await this.caches.l2.get(key)
    if (value) {
      this.hitRates.l2.add(1)
      this.caches.l1.set(key, value) // Promote to L1
      return value
    }
    this.hitRates.l2.add(0)
    
    // L3 Cache
    value = await this.caches.l3.get(key)
    if (value) {
      this.hitRates.l3.add(1)
      this.caches.l2.set(key, value) // Promote to L2
      this.caches.l1.set(key, value) // Promote to L1
      return value
    }
    this.hitRates.l3.add(0)
    
    return null
  }
  
  async set(key, value, options = {}) {
    // Intelligent placement based on access patterns
    const accessPattern = this.analyzeAccessPattern(key)
    
    if (accessPattern.frequency === 'high') {
      this.caches.l1.set(key, value)
    }
    
    if (accessPattern.persistence === 'medium') {
      await this.caches.l2.set(key, value)
    }
    
    if (accessPattern.size === 'large' || accessPattern.persistence === 'long') {
      await this.caches.l3.set(key, value)
    }
  }
}
```

### LLM Integration Optimization

#### Connection Pooling and Rate Limiting

```yaml
llm_optimization:
  # Connection Pooling
  connection_pooling:
    enabled: true
    pool_size: 10
    max_idle_connections: 5
    connection_timeout_ms: 5000
    idle_timeout_ms: 30000
    
  # Rate Limiting
  rate_limiting:
    requests_per_second: 10
    burst_capacity: 20
    backoff_strategy: "exponential"
    max_backoff_ms: 5000
    
  # Request Optimization
  request_optimization:
    batch_requests: true
    batch_size: 5
    batch_timeout_ms: 100
    compression_enabled: true
    
  # Response Caching
  response_caching:
    enabled: true
    cache_duration_minutes: 60
    semantic_deduplication: true
    cache_key_strategy: "content_hash"
```

#### Async Processing Pipeline

```javascript
class LLMProcessingPipeline {
  constructor() {
    this.requestQueue = new PriorityQueue()
    this.responseCache = new SemanticCache()
    this.batchProcessor = new BatchProcessor()
    this.rateLimiter = new RateLimiter()
  }
  
  async processRequest(request, priority = 'normal') {
    // Check semantic cache first
    const cacheKey = this.generateSemanticKey(request)
    const cached = await this.responseCache.get(cacheKey)
    if (cached) return cached
    
    // Add to priority queue
    const priorityScore = this.calculatePriority(request, priority)
    const queuedRequest = { ...request, priority: priorityScore }
    
    return new Promise((resolve, reject) => {
      queuedRequest.resolve = resolve
      queuedRequest.reject = reject
      this.requestQueue.enqueue(queuedRequest)
      this.processBatch()
    })
  }
  
  async processBatch() {
    if (this.batchProcessor.isProcessing) return
    
    const batch = []
    while (batch.length < this.batchSize && !this.requestQueue.isEmpty()) {
      if (await this.rateLimiter.canProceed()) {
        batch.push(this.requestQueue.dequeue())
      } else {
        break
      }
    }
    
    if (batch.length === 0) return
    
    try {
      const responses = await this.batchProcessor.process(batch)
      
      // Cache responses and resolve promises
      responses.forEach((response, index) => {
        const request = batch[index]
        const cacheKey = this.generateSemanticKey(request)
        this.responseCache.set(cacheKey, response)
        request.resolve(response)
      })
    } catch (error) {
      batch.forEach(request => request.reject(error))
    }
  }
}
```

### Memory Management

#### Garbage Collection Optimization

```yaml
memory_management:
  # Garbage Collection
  garbage_collection:
    strategy: "generational"
    young_generation_size_mb: 50
    old_generation_size_mb: 200
    gc_frequency_ms: 30000
    
  # Memory Pooling
  memory_pooling:
    enabled: true
    pool_sizes:
      small_objects: 1000
      medium_objects: 500
      large_objects: 100
    
  # Memory Monitoring
  monitoring:
    enabled: true
    alert_threshold_mb: 400
    leak_detection_enabled: true
    heap_dump_on_oom: true
    
  # Object Lifecycle Management
  lifecycle:
    session_cleanup_interval_minutes: 60
    context_cache_cleanup_interval_minutes: 30
    temporary_object_ttl_minutes: 15
```

#### Memory-Efficient Data Structures

```javascript
class MemoryEfficientContextStore {
  constructor() {
    // Use flyweight pattern for shared data
    this.sharedMetadata = new Map()
    this.sharedConfigurations = new Map()
    
    // Use weak references for temporary objects
    this.temporaryContexts = new WeakMap()
    
    // Use object pools for frequently created objects
    this.contextPool = new ObjectPool(() => new FlowMindContext())
    this.assemblyPool = new ObjectPool(() => new AssemblyResult())
  }
  
  createContext(yaml, path) {
    const context = this.contextPool.acquire()
    
    // Share metadata objects when possible
    const metadataKey = this.generateMetadataKey(yaml.metadata)
    let sharedMetadata = this.sharedMetadata.get(metadataKey)
    
    if (!sharedMetadata) {
      sharedMetadata = Object.freeze({ ...yaml.metadata })
      this.sharedMetadata.set(metadataKey, sharedMetadata)
    }
    
    context.initialize(yaml, path, sharedMetadata)
    return context
  }
  
  releaseContext(context) {
    context.reset()
    this.contextPool.release(context)
  }
}
```

### Performance Benchmarking

#### Benchmark Suite

```javascript
class FlowMindBenchmark {
  async runFullBenchmark() {
    const results = {}
    
    // Context Loading Benchmark
    results.contextLoading = await this.benchmarkContextLoading()
    
    // Assembly Performance Benchmark
    results.assembly = await this.benchmarkAssembly()
    
    // Token Optimization Benchmark
    results.tokenOptimization = await this.benchmarkTokenOptimization()
    
    // Workflow Execution Benchmark
    results.workflowExecution = await this.benchmarkWorkflowExecution()
    
    // Memory Usage Benchmark
    results.memoryUsage = await this.benchmarkMemoryUsage()
    
    return this.generateReport(results)
  }
  
  async benchmarkContextLoading() {
    const iterations = 1000
    const contexts = this.generateTestContexts(100)
    
    const timer = performance.startTimer('contextLoading')
    
    for (let i = 0; i < iterations; i++) {
      const context = contexts[i % contexts.length]
      await this.contextLoader.load(context.path)
    }
    
    const duration = timer.end()
    
    return {
      totalTime: duration,
      averageTime: duration / iterations,
      throughput: iterations / (duration / 1000)
    }
  }
  
  async benchmarkAssembly() {
    const recipe = this.generateComplexAssemblyRecipe()
    const iterations = 100
    
    const timer = performance.startTimer('assembly')
    
    for (let i = 0; i < iterations; i++) {
      await this.assembler.assemble(recipe)
    }
    
    const duration = timer.end()
    
    return {
      totalTime: duration,
      averageTime: duration / iterations,
      throughput: iterations / (duration / 1000)
    }
  }
}
```

#### Performance Regression Detection

```yaml
performance_regression:
  # Baseline Metrics
  baselines:
    context_loading_ms: 50
    assembly_time_ms: 500
    token_optimization_ms: 200
    workflow_step_ms: 1500
    
  # Regression Thresholds
  thresholds:
    warning_percentage: 15
    critical_percentage: 30
    
  # Automated Testing
  automated_testing:
    enabled: true
    frequency: "on_commit"
    benchmark_suite: "full"
    
  # Alerts
  alerts:
    slack_webhook: "${PERF_ALERT_WEBHOOK}"
    email_recipients: ["team@company.com"]
    include_flamegraphs: true
```

---

## Migration and Upgrade Guides

FlowMind provides structured migration paths and upgrade procedures to ensure smooth transitions between versions.

### Version Compatibility Matrix

| FlowMind Version | Compatible Context Schema | LLM Provider Support | MCP Protocol Version |
|------------------|---------------------------|---------------------|---------------------|
| 1.0.x | 1.0.x | Anthropic, OpenAI, Local | 0.1.0 |
| 1.1.x | 1.0.x, 1.1.x | Anthropic, OpenAI, Local, Azure | 0.1.0, 0.2.0 |
| 2.0.x | 1.1.x, 2.0.x | All providers + Custom | 0.2.0, 1.0.0 |

### Schema Migration

#### Context Schema Evolution

```yaml
# Schema v1.0.0 -> v1.1.0 Migration
schema_migrations:
  "1.0.0_to_1.1.0":
    description: "Add enhanced workflow integration"
    
    changes:
      - type: "add_field"
        path: "agent_config.workflow_integration"
        default_value:
          philosophy: "Dynamic assembly of specialized workflows"
          available_workflows: []
          
      - type: "rename_field"
        old_path: "agent_config.memory_settings"
        new_path: "agent_config.memory_config"
        
      - type: "restructure_field"
        path: "agent_config.endpoints"
        migration_function: "migrate_endpoints_structure"
        
    validation_rules:
      - "endpoints must have enhanced_workflows if workflow_integration exists"
      - "memory_config must follow new schema"
      
    rollback_supported: true
    backup_original: true
```

#### Automated Migration Tool

```javascript
class SchemaMigrator {
  constructor() {
    this.migrations = new Map()
    this.loadMigrations()
  }
  
  async migrateContext(contextPath, targetVersion) {
    const context = await this.loadContext(contextPath)
    const currentVersion = context.metadata.schema_version || '1.0.0'
    
    if (semver.eq(currentVersion, targetVersion)) {
      return { migrated: false, reason: 'Already at target version' }
    }
    
    // Create backup
    const backupPath = `${contextPath}.backup.${Date.now()}`
    await fs.copyFile(contextPath, backupPath)
    
    try {
      const migrationPath = this.findMigrationPath(currentVersion, targetVersion)
      let migratedContext = context
      
      for (const migration of migrationPath) {
        migratedContext = await this.applyMigration(migratedContext, migration)
      }
      
      // Validate migrated context
      await this.validateContext(migratedContext, targetVersion)
      
      // Write migrated context
      await this.writeContext(contextPath, migratedContext)
      
      return {
        migrated: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        backupPath,
        migrationsApplied: migrationPath.length
      }
      
    } catch (error) {
      // Restore backup on failure
      await fs.copyFile(backupPath, contextPath)
      throw new MigrationError(`Migration failed: ${error.message}`, {
        fromVersion: currentVersion,
        toVersion: targetVersion,
        backupPath
      })
    }
  }
  
  async applyMigration(context, migration) {
    const migrated = JSON.parse(JSON.stringify(context))
    
    for (const change of migration.changes) {
      switch (change.type) {
        case 'add_field':
          this.addField(migrated, change.path, change.default_value)
          break
          
        case 'rename_field':
          this.renameField(migrated, change.old_path, change.new_path)
          break
          
        case 'restructure_field':
          await this.restructureField(migrated, change.path, change.migration_function)
          break
          
        case 'remove_field':
          this.removeField(migrated, change.path)
          break
      }
    }
    
    // Update schema version
    migrated.metadata.schema_version = migration.target_version
    migrated.metadata.migrated_at = new Date().toISOString()
    
    return migrated
  }
}
```

### Configuration Migration

#### Configuration Evolution

```yaml
# flowmind-config migration
config_migrations:
  "1.0.0_to_1.1.0":
    description: "Enhanced performance and caching configuration"
    
    changes:
      - type: "add_section"
        section: "performance"
        default_config:
          token_optimization:
            enabled: true
            target_utilization: 0.85
          caching:
            context_cache_enabled: true
            semantic_cache_enabled: false
            
      - type: "restructure_section"
        section: "llm"
        migration:
          old_structure:
            api_key: "${LLM_API_KEY}"
            model: "claude-3-sonnet"
          new_structure:
            provider: "anthropic"
            api_key: "${LLM_API_KEY}"
            model: "claude-3-sonnet"
            timeout_ms: 30000
            
      - type: "rename_field"
        old_path: "context.max_size"
        new_path: "context_processing.max_context_size"
```

#### Configuration Migrator

```javascript
class ConfigurationMigrator {
  async migrateConfiguration(configPath, targetVersion) {
    const config = await this.loadConfig(configPath)
    const currentVersion = config.version || '1.0.0'
    
    if (semver.gte(currentVersion, targetVersion)) {
      return { migrated: false, reason: 'Configuration already up to date' }
    }
    
    // Backup current configuration
    const backupPath = `${configPath}.backup.${Date.now()}`
    await fs.copyFile(configPath, backupPath)
    
    try {
      const migrations = this.getConfigMigrations(currentVersion, targetVersion)
      let migratedConfig = config
      
      for (const migration of migrations) {
        migratedConfig = await this.applyConfigMigration(migratedConfig, migration)
      }
      
      // Update version
      migratedConfig.version = targetVersion
      migratedConfig.migrated_at = new Date().toISOString()
      
      // Validate configuration
      await this.validateConfiguration(migratedConfig)
      
      // Write updated configuration
      await this.writeConfig(configPath, migratedConfig)
      
      return {
        migrated: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        backupPath,
        changes: migrations.flatMap(m => m.changes)
      }
      
    } catch (error) {
      await fs.copyFile(backupPath, configPath)
      throw error
    }
  }
  
  async mergeEnvironmentOverrides(config) {
    // Handle environment variable overrides during migration
    const envOverrides = {
      'system.llm.api_key': process.env.LLM_API_KEY,
      'system.llm.provider': process.env.LLM_PROVIDER,
      'performance.caching.enabled': process.env.CACHING_ENABLED === 'true',
      'security.authentication.enabled': process.env.AUTH_ENABLED !== 'false'
    }
    
    return this.deepMerge(config, this.unflattenObject(envOverrides))
  }
}
```

### Data Migration

#### Session Data Migration

```yaml
data_migrations:
  "1.0.0_to_1.1.0":
    description: "Add personality activation tracking and metadata"
    
    session_migrations:
      - type: "add_field"
        path: "metadata.total_tokens_used"
        default_value: 0
        calculate_from: "sum(history[].tokens_used)"
        
      - type: "add_field"
        path: "metadata.average_confidence"
        default_value: 0.5
        calculate_from: "avg(history[].confidence_score)"
        
      - type: "restructure_history"
        add_fields:
          - "personalities_activated"
          - "tokens_used"
          - "confidence_score"
        migration_function: "migrate_history_entries"
        
    context_cache_migrations:
      - type: "invalidate_cache"
        reason: "Schema changes require fresh assembly"
        
      - type: "migrate_semantic_cache"
        update_similarity_calculation: true
```

#### Data Migrator

```javascript
class DataMigrator {
  async migrateSessionData(sessionDir, targetVersion) {
    const sessionFiles = await fs.readdir(sessionDir)
    const results = []
    
    for (const file of sessionFiles) {
      if (!file.endsWith('.json')) continue
      
      const sessionPath = path.join(sessionDir, file)
      try {
        const result = await this.migrateSessionFile(sessionPath, targetVersion)
        results.push(result)
      } catch (error) {
        console.error(`Failed to migrate ${file}:`, error)
        results.push({ 
          file, 
          migrated: false, 
          error: error.message 
        })
      }
    }
    
    return results
  }
  
  async migrateSessionFile(sessionPath, targetVersion) {
    const session = JSON.parse(await fs.readFile(sessionPath, 'utf8'))
    const currentVersion = session.schema_version || '1.0.0'
    
    if (semver.gte(currentVersion, targetVersion)) {
      return { file: path.basename(sessionPath), migrated: false }
    }
    
    const migrated = await this.applySessionMigrations(session, targetVersion)
    
    // Backup original
    const backupPath = sessionPath.replace('.json', `.backup.${Date.now()}.json`)
    await fs.writeFile(backupPath, JSON.stringify(session, null, 2))
    
    // Write migrated
    await fs.writeFile(sessionPath, JSON.stringify(migrated, null, 2))
    
    return {
      file: path.basename(sessionPath),
      migrated: true,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      backupPath
    }
  }
  
  async applySessionMigrations(session, targetVersion) {
    const migrated = JSON.parse(JSON.stringify(session))
    
    // Add metadata section if missing
    if (!migrated.metadata) {
      migrated.metadata = {}
    }
    
    // Calculate total tokens used
    if (migrated.history) {
      migrated.metadata.total_tokens_used = migrated.history.reduce(
        (sum, entry) => sum + (entry.tokens_used || 0), 
        0
      )
      
      migrated.metadata.average_confidence = migrated.history.reduce(
        (sum, entry) => sum + (entry.confidence_score || 0.5),
        0
      ) / migrated.history.length
    }
    
    // Migrate history entries
    if (migrated.history) {
      migrated.history = migrated.history.map(entry => ({
        ...entry,
        personalities_activated: entry.personalities_activated || [],
        tokens_used: entry.tokens_used || 0,
        confidence_score: entry.confidence_score || 0.5
      }))
    }
    
    migrated.schema_version = targetVersion
    migrated.migrated_at = new Date().toISOString()
    
    return migrated
  }
}
```

### Upgrade Procedures

#### Automated Upgrade Script

```bash
#!/bin/bash
# flowmind-upgrade.sh

set -e

CURRENT_VERSION=$(flowmind version)
TARGET_VERSION=$1

if [ -z "$TARGET_VERSION" ]; then
    echo "Usage: $0 <target_version>"
    exit 1
fi

echo "🚀 FlowMind Upgrade: $CURRENT_VERSION → $TARGET_VERSION"

# Pre-upgrade checks
echo "📋 Running pre-upgrade checks..."
flowmind health-check
flowmind validate-config
flowmind validate contexts/

# Create backup
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r contexts/ "$BACKUP_DIR/"
cp -r sessions/ "$BACKUP_DIR/"
cp *.yaml "$BACKUP_DIR/"

# Update FlowMind
echo "⬇️ Downloading FlowMind $TARGET_VERSION..."
npm install @flowmind/core@$TARGET_VERSION

# Migrate configurations
echo "🔧 Migrating configurations..."
flowmind migrate config --target-version $TARGET_VERSION

# Migrate contexts
echo "📝 Migrating contexts..."
flowmind migrate contexts --target-version $TARGET_VERSION

# Migrate data
echo "💾 Migrating session data..."
flowmind migrate sessions --target-version $TARGET_VERSION

# Post-upgrade validation
echo "✅ Running post-upgrade validation..."
flowmind health-check
flowmind validate-config
flowmind validate contexts/

# Test basic functionality
echo "🧪 Testing basic functionality..."
flowmind test-basic-functionality

echo "🎉 Upgrade complete!"
echo "Backup created in: $BACKUP_DIR"
echo "New version: $(flowmind version)"
```

#### Rollback Procedures

```bash
#!/bin/bash
# flowmind-rollback.sh

set -e

BACKUP_DIR=$1

if [ -z "$BACKUP_DIR" ]; then
    echo "Usage: $0 <backup_directory>"
    exit 1
fi

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory $BACKUP_DIR not found"
    exit 1
fi

echo "🔄 Rolling back FlowMind..."

# Stop FlowMind services
echo "⏹️ Stopping FlowMind services..."
flowmind stop

# Restore from backup
echo "📁 Restoring from backup..."
cp -r "$BACKUP_DIR/contexts/" .
cp -r "$BACKUP_DIR/sessions/" .
cp "$BACKUP_DIR"/*.yaml .

# Determine previous version from backup
PREVIOUS_VERSION=$(grep "version:" "$BACKUP_DIR"/*.yaml | head -1 | cut -d: -f2 | tr -d ' "')

if [ -n "$PREVIOUS_VERSION" ]; then
    echo "⬇️ Installing previous version $PREVIOUS_VERSION..."
    npm install @flowmind/core@$PREVIOUS_VERSION
fi

# Validate rollback
echo "✅ Validating rollback..."
flowmind health-check
flowmind validate-config

echo "🎉 Rollback complete!"
echo "Current version: $(flowmind version)"
```

### Breaking Changes Guide

#### Version 2.0.0 Breaking Changes

```markdown
# FlowMind 2.0.0 Breaking Changes

## Context Schema Changes

### BREAKING: Metadata structure updated
**Impact**: All context files
**Required Action**: Run migration tool

```yaml
# OLD (v1.x)
metadata:
  type: "agent"
  name: "Agent Name"
  
# NEW (v2.x)  
metadata:
  type: "agent"
  id: "agent-id"        # NEW: Required
  version: "1.0.0"      # NEW: Required
  name: "Agent Name"
```

### BREAKING: Agent configuration restructured
**Impact**: All agent contexts
**Required Action**: Automatic migration available

```yaml
# OLD (v1.x)
agent_config:
  memory_settings: {}
  
# NEW (v2.x)
agent_config:
  memory_config: {}     # Renamed
```

## API Changes

### BREAKING: FlowMind constructor signature changed
**Impact**: Direct API usage
**Required Action**: Update instantiation code

```javascript
// OLD (v1.x)
const context = new FlowMind(yamlData)

// NEW (v2.x)
const context = new FlowMind(yamlData, contextPath)
// OR use factory
const context = FlowMindFactory.create(contextPath, yamlData)
```

### BREAKING: Assembly rules interface updated
**Impact**: Custom assembly rules
**Required Action**: Update custom implementations

```javascript
// OLD (v1.x)
assemblyRules.apply(contexts, config)

// NEW (v2.x)  
await assemblyRules.applyPriorities(contexts, stageConfig)
```

## Configuration Changes

### BREAKING: LLM configuration restructured
**Impact**: System configuration
**Required Action**: Update configuration files

```yaml
# OLD (v1.x)
llm:
  api_key: "key"
  model: "model"
  
# NEW (v2.x)
system:
  llm:
    provider: "anthropic"  # NEW: Required
    api_key: "key"
    model: "model"
    timeout_ms: 30000     # NEW: Default timeout
```

## Migration Instructions

1. **Backup all data**
   ```bash
   cp -r contexts/ contexts.backup/
   cp -r sessions/ sessions.backup/
   ```

2. **Run automated migration**
   ```bash
   flowmind migrate --from 1.x --to 2.0.0
   ```

3. **Update custom code**
   - Review API changes above
   - Update any direct FlowMind instantiation
   - Update custom assembly rules if any

4. **Validate migration**
   ```bash
   flowmind validate contexts/
   flowmind test-basic-functionality
   ```

## Compatibility Notes

- FlowMind 2.0.0 can read v1.x contexts after migration
- Session data from v1.x is compatible with minimal migration
- Custom personalities require schema version update only
```

### Best Practices for Upgrades

#### Pre-Upgrade Checklist

```yaml
pre_upgrade_checklist:
  backup:
    - "Create full system backup"
    - "Export session data"
    - "Backup configuration files"
    - "Document current integrations"
    
  validation:
    - "Run health checks"
    - "Validate all contexts"
    - "Test critical workflows"
    - "Verify integration endpoints"
    
  preparation:
    - "Review breaking changes documentation"
    - "Plan migration timeline"
    - "Prepare rollback procedure"
    - "Notify stakeholders"
    
  environment:
    - "Test upgrade in staging environment"
    - "Verify resource requirements"
    - "Check dependency compatibility"
    - "Validate monitoring setup"
```

#### Post-Upgrade Validation

```yaml
post_upgrade_validation:
  functional_tests:
    - "Context loading and assembly"
    - "Workflow execution" 
    - "Personality activation"
    - "API endpoints"
    - "MCP tool functionality"
    
  performance_tests:
    - "Response time benchmarks"
    - "Memory usage verification"
    - "Token optimization checks"
    - "Cache effectiveness"
    
  integration_tests:
    - "LLM provider connectivity"
    - "External API integrations"
    - "Monitoring and logging"
    - "Authentication systems"
    
  data_integrity:
    - "Session data completeness"
    - "Context reference integrity"
    - "Configuration consistency"
    - "Memory persistence"
```

---

This comprehensive FlowMind reference provides developers with the complete technical specification needed to implement, configure, optimize, and maintain FlowMind systems. Each section includes practical examples, configuration templates, and troubleshooting guidance to support real-world deployment and operation.