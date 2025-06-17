# Core Engine Architecture: Assembly & Discovery Engine

*Synthesized from ADR-004, ADR-005, and ADR-006*

## Overview

The core engine layer provides intelligent prompt assembly, clean interfaces for extensibility, and automatic protocol discovery. This layer transforms raw context components into optimized system prompts and establishes the execution foundation for semantic workflows.

## Core Architectural Decisions

### ADR-004: Prompt Assembler Engine

**Problem**: Need intelligent system to convert context data into optimized system prompts with step integration and previous results synthesis.

**Solution**: Modular prompt assembly engine with template system and context synthesis capabilities.

#### PromptAssembler Class
```javascript
class PromptAssembler {
  constructor(config = {}) {
    this.templates = new TemplateRegistry()
    this.synthesizer = new ContextSynthesizer()
    this.config = config
  }
  
  async assemble(contextData, stepConfig, previousResults) {
    const sections = await Promise.all([
      this.buildHeader(contextData.metadata),
      this.buildCorePrompt(contextData),
      this.buildStepContext(stepConfig),
      this.buildPreviousContext(previousResults),
      this.buildInstructions(stepConfig)
    ])
    
    return this.synthesizer.combine(sections.filter(Boolean))
  }
}
```

#### Template System Structure
```
templates/
├── personality-base.template     # Core personality prompt
├── step-instructions.template    # Step-specific guidance  
├── previous-context.template     # Integration of prior results
└── custom/                      # Project-specific templates
    ├── flowmind-condition.template
    ├── semantic-evaluation.template
    └── natural-language-author.template
```

#### Context Synthesis Rules
1. **Personality Core** - Convert YAML agent_config to prompt
2. **Step Integration** - Inject step-specific instructions
3. **History Awareness** - Include relevant previous results
4. **Token Optimization** - Compress for LLM efficiency
5. **Constitutional Validation** - Ensure core principles
6. **FlowMind Preparation** - Ready for semantic reasoning integration

### ADR-005: Interface Specification

**Problem**: Need clean, stable interfaces for the context assembler system that integrate with the larger ecosystem.

**Solution**: Minimal, powerful interfaces that hide complexity and enable extensibility.

#### Main Public API
```javascript
import { ContextAssembler } from '@kingly/core'

// Simple instantiation
const assembler = new ContextAssembler({
  contextRoot: './contexts',
  protocols: ['agent', 'file', 'markdown', 'script', 'flowsense'], // NEW
  templates: './templates',
  optimization: 'balanced'
})

// Primary method (enhanced for FlowMind)
const result = await assembler.assemble({
  personality: 'cortisol_guardian',
  step: 1,
  previousResults: {...},
  context: {...},
  flowsense_definition: {...} // NEW: FlowMind workflow definition
})

// Enhanced result format
{
  prompt: 'Complete system prompt...',
  metadata: { 
    personality: 'cortisol_guardian', 
    type: 'agent',
    semantic_capabilities: ['emotion_detection', 'urgency_analysis'] // NEW
  },
  callback: 'Instructions for next step...',
  tokens: 1247,
  sources: ['file://contexts/agents/eeps/sfj-caregiver/context.yaml'],
  flowsense_context: {...} // NEW: Semantic reasoning context
}
```

#### Extension Points
```javascript
// Register custom loaders
assembler.registerLoader('flowsense', new FlowMindLoader()) // NEW

// Register protocol handlers  
assembler.registerProtocol('semantic', new SemanticProtocolHandler()) // NEW

// Add template transformers
assembler.addTransformer('semantic_optimize', new SemanticTokenOptimizer()) // NEW
```

#### Enhanced Configuration
```javascript
{
  contextRoot: './contexts',
  protocols: ['file', 'agent', 'markdown', 'script', 'flowsense'], // FlowMind support
  templates: './templates',
  cache: true,
  optimization: 'semantic_aware', // NEW: Semantic optimization
  semantic_config: { // NEW: Semantic reasoning configuration
    primary_llm: 'anthropic-claude-3',
    fallback_llm: 'openai-gpt-4',
    local_llm: 'phi-3-mini',
    confidence_threshold: 0.8
  }
}
```

### ADR-006: Protocol Auto-Discovery System

**Problem**: Protocol analysis revealed that auto-discovery eliminates need for personality mappings by having contexts self-describe their addressing.

**Solution**: Intelligent auto-discovery where contexts declare their own protocols via metadata.

#### Enhanced Context Self-Description
```yaml
# contexts/agents/eeps/sfj-caregiver/context.yaml
metadata:
  type: "agent"
  id: "sfj-caregiver"
  protocols:
    - "agent://cortisol_guardian"
    - "agent://stress_reduction"
    - "agent://eeps/sfj-caregiver"
    - "flowmind://stress_management" # NEW: FlowMind workflows
  aliases: ["cortisol_guardian", "stress_guardian"]
  capabilities: # NEW: Semantic capabilities
    - "emotion_detection"
    - "stress_analysis" 
    - "cortisol_optimization"
  semantic_triggers: # NEW: Automatic activation conditions
    - "user shows stress signals"
    - "overwhelm detected"
    - "urgent pacing needed"
```

#### Enhanced Agent Protocol Auto-Discovery
```javascript
class AgentProtocol {
  constructor() {
    this.index = new Map() // Query → context path
    this.aliases = new Map() // Alias → canonical path
    this.capabilities = new Map() // Capability → context paths
    this.semanticTriggers = new Map() // Trigger → context paths
    this.buildIndex()
  }
  
  async buildIndex() {
    const contexts = await this.scanContexts('./contexts/agents')
    for (const context of contexts) {
      const metadata = context.metadata
      
      // Standard protocol registration
      for (const protocol of metadata.protocols || []) {
        this.index.set(protocol, context.path)
      }
      
      // Capability-based discovery (NEW)
      for (const capability of metadata.capabilities || []) {
        if (!this.capabilities.has(capability)) {
          this.capabilities.set(capability, [])
        }
        this.capabilities.get(capability).push(context.path)
      }
      
      // Semantic trigger registration (NEW)
      for (const trigger of metadata.semantic_triggers || []) {
        if (!this.semanticTriggers.has(trigger)) {
          this.semanticTriggers.set(trigger, [])
        }
        this.semanticTriggers.get(trigger).push(context.path)
      }
    }
  }
  
  async resolve(path, fragment) {
    // Try direct protocol match
    const contextPath = this.index.get(`agent://${path}`) || 
                        this.aliases.get(path)
    
    if (contextPath) {
      return this.loadContext(contextPath, fragment)
    }
    
    // Try capability-based match (NEW)
    const capabilityMatches = this.capabilities.get(path)
    if (capabilityMatches && capabilityMatches.length > 0) {
      return this.loadContext(capabilityMatches[0], fragment) // Use first match
    }
    
    // Try semantic trigger match (NEW)
    const triggerMatches = await this.semanticMatch(path)
    if (triggerMatches.length > 0) {
      return this.loadContext(triggerMatches[0], fragment)
    }
    
    // Fallback to fuzzy matching
    const fuzzyMatch = await this.fuzzyMatch(path)
    if (!fuzzyMatch) throw new Error(`Agent not found: ${path}`)
    
    return this.loadContext(fuzzyMatch, fragment)
  }
  
  // NEW: Semantic matching for natural language queries
  async semanticMatch(query) {
    const matches = []
    for (const [trigger, contexts] of this.semanticTriggers) {
      const similarity = await this.calculateSemantic Similarity(query, trigger)
      if (similarity > 0.7) { // Configurable threshold
        matches.push(...contexts)
      }
    }
    return matches
  }
}
```

## Core Engine Components

### 1. Enhanced ContextSynthesizer
```javascript
class ContextSynthesizer {
  constructor(config) {
    this.config = config
    this.semanticEvaluator = new SemanticEvaluator(config.semantic_config) // NEW
  }
  
  async combine(sections) {
    // Traditional assembly
    let combined = this.traditionalCombine(sections)
    
    // NEW: Semantic enhancement
    if (this.hasSemanticCapabilities(sections)) {
      combined = await this.enhanceWithSemanticContext(combined)
    }
    
    return this.optimize(combined)
  }
  
  // NEW: Enhance prompts with semantic reasoning capabilities
  async enhanceWithSemanticContext(prompt) {
    const semanticInstructions = `
You have semantic reasoning capabilities enabled. This means you can:
1. Evaluate natural language conditions like "when user is frustrated"
2. Assess emotional states and urgency levels  
3. Make adaptive decisions based on contextual understanding
4. Provide confidence scores for semantic evaluations

When encountering semantic conditions, reason through them step-by-step and provide confidence levels.
    `
    
    return prompt + '\n\n' + semanticInstructions
  }
}
```

### 2. FlowMind Loader Integration
```javascript
class FlowMindLoader extends BaseLoader {
  async parse(rawData, context) {
    const flowDefinition = yaml.parse(rawData)
    
    // Validate FlowMind syntax
    await this.validateFlowMind(flowDefinition)
    
    // Convert to executable format
    const executable = await this.compileFlowMind(flowDefinition)
    
    return {
      type: 'flowsense_workflow',
      definition: flowDefinition,
      executable: executable,
      semantic_conditions: this.extractSemanticConditions(flowDefinition)
    }
  }
  
  async validateFlowMind(definition) {
    // Validate against FlowMind schema
    const schema = await this.loadFlowMindSchema()
    return this.validateAgainstSchema(definition, schema)
  }
  
  extractSemanticConditions(definition) {
    const conditions = []
    
    const traverse = (obj) => {
      if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (key.includes('semantic') || key.includes('when_')) {
            conditions.push(value)
          }
          if (typeof value === 'object') {
            traverse(value)
          }
        }
      }
    }
    
    traverse(definition)
    return conditions
  }
}
```

### 3. Semantic Protocol Handler
```javascript
class SemanticProtocolHandler extends BaseProtocol {
  async resolve(path, fragment, query) {
    // semantic://emotion_detection?confidence=0.8
    const params = this.parseQuery(query)
    const confidence = params.confidence || 0.8
    
    switch (path) {
      case 'emotion_detection':
        return this.createEmotionDetectionContext(confidence)
      case 'urgency_analysis':
        return this.createUrgencyAnalysisContext(confidence)
      case 'frustration_assessment':
        return this.createFrustrationAssessmentContext(confidence)
      default:
        throw new Error(`Unknown semantic capability: ${path}`)
    }
  }
  
  createEmotionDetectionContext(confidence) {
    return {
      type: 'semantic_capability',
      capability: 'emotion_detection',
      confidence_threshold: confidence,
      instructions: `
Analyze the emotional state of the user based on their language, tone, and context.
Provide emotion classification and confidence score.
Only activate responses if confidence > ${confidence}.
      `,
      evaluation_prompt: `
Rate the user's emotional state on these dimensions:
- Frustration (0-1)
- Anger (0-1) 
- Satisfaction (0-1)
- Urgency (0-1)
- Engagement (0-1)

Provide confidence score for each assessment.
      `
    }
  }
}
```

## Discovery Benefits (Enhanced)

1. **Zero Configuration** - No mapping files needed
2. **Semantic Discovery** - Find agents by capability or natural language
3. **Multiple Addresses** - One context, many ways to reach it
4. **Fuzzy + Semantic Matching** - Both keyword and meaning-based discovery
5. **Self-Organizing** - System discovers structure and capabilities automatically
6. **FlowMind Ready** - Automatic detection of semantic reasoning workflows

## Core Engine Architecture Impact

This core engine layer enables:

1. **Intelligent Assembly** - Context-aware prompt construction with semantic enhancement
2. **Extensible Discovery** - Multiple discovery methods from exact to semantic matching
3. **FlowMind Integration** - Native support for semantic control flow workflows
4. **Clean Interfaces** - Stable APIs that hide complexity while enabling power users
5. **Capability-Based Routing** - Automatic agent selection based on required capabilities

The core engine bridges the foundation layer's protocol system with the revolutionary FlowMind semantic reasoning layer, providing the execution infrastructure needed for semantic-aware AI workflows.

---

*Next: [03-flowsense-revolution.md](./03-flowsense-revolution.md) - Semantic Control Flow Language*