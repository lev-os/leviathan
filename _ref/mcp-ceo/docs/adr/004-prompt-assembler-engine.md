# ADR-004: Prompt Assembler Engine

## Status
Approved

## Context
Need intelligent system to convert context data into optimized system prompts with step integration and previous results synthesis.

## Decision
Create modular prompt assembly engine with template system and context synthesis capabilities.

## Design

### PromptAssembler Class
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

### Template System
```javascript
// Support multiple prompt formats
templates/
├── personality-base.template     # Core personality prompt
├── step-instructions.template    # Step-specific guidance  
├── previous-context.template     # Integration of prior results
└── custom/                      # Project-specific templates
```

### Context Synthesis Rules
1. **Personality Core** - Convert YAML agent_config to prompt
2. **Step Integration** - Inject step-specific instructions
3. **History Awareness** - Include relevant previous results
4. **Token Optimization** - Compress for LLM efficiency
5. **Constitutional Validation** - Ensure core principles

### Extensibility Points
- Custom template loaders
- Context transformation plugins
- Token optimization strategies
- Output format adapters

## Benefits
- Intelligent prompt construction
- Reusable template system
- Context-aware assembly
- Token efficiency
- Extensible architecture

## Implementation
Core assembler first, then template system, then optimization features.