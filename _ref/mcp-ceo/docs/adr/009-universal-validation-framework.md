# ADR-009: Universal Validation Framework
## Validation as First-Class Citizen in FlowMind

## Status
**ACCEPTED** - Core feature for v0.1.0

## Context
Every context can specify validation requirements. This happens through bidirectional flow - the LLM acts as the validator using validation contexts.

## Decision
Make validation a first-class citizen in every FlowMind context, with universal fallback and context switching for validation.

## Implementation

### FlowMind Validation Interface
```javascript
class FlowMind {
  // ... existing properties ...
  
  // Validation as first-class citizen
  get validation() {
    return this._raw.validation || { 
      context: "validation://universal-fallback" 
    }
  }
  
  get validationEnabled() {
    return this.validation.enabled !== false
  }
  
  get validationContext() {
    return this.validation.context
  }
}
```

### Context Schema with Validation
```yaml
metadata:
  type: "agent"
  id: "financial-advisor"
  
validation:
  context: "validation://financial-compliance"
  confidence_required: 0.95
  
agent_config:
  # ... agent configuration ...
```

### Validation Options
```yaml
# Option 1: Custom validation context
validation:
  context: "validation://domain-expert"

# Option 2: Disable validation
validation:
  enabled: false
  
# Option 3: Omit for universal fallback
# (validation section absent = use universal)
```

### Universal Fallback Validator
```yaml
# contexts/validation/universal-fallback/context.yaml
metadata:
  type: "validation"
  id: "universal-fallback"
  name: "Universal Validation Checker"

validation_config:
  approach: "skeptical"
  prompt: |
    Someone requested something and received a response.
    Validate that what they wanted actually happened.
    
    Be constructively skeptical:
    - Did this address their request?
    - Is the response reasonable?
    - What would critics say?
    - What's missing?
    - How could it improve?
```

### Validation Through Bidirectional Flow
```javascript
class MCPWorkflowExecutor {
  async executeWithValidation(context, request, response) {
    // Step 1: Execute with context
    const result = await this.execute(context, request)
    
    // Step 2: Check if validation needed
    if (!context.validationEnabled) {
      return result
    }
    
    // Step 3: Load validation context
    const validator = await assembler.load(context.validationContext)
    
    // Step 4: Switch to validator persona
    const validationPrompt = `
You are ${validator.name}.

Request: ${request}
Response: ${result}

${validator.config.prompt}
`
    
    // Step 5: LLM validates as validator persona
    const validation = await mcp.executeAsContext(validator, validationPrompt)
    
    // Step 6: Return with validation
    return {
      result,
      validation,
      passed: validation.confidence >= (context.validation.confidence_required || 0.8)
    }
  }
}
```

## How It Works in Practice

1. **User Request** → MCP → Agent Context
2. **Agent Response** → Check validation requirements
3. **Load Validator** → Switch context to validator
4. **LLM Validates** → As validator persona
5. **Return Results** → With validation status

## Benefits

- **Universal Coverage** - Every context can be validated
- **Domain Flexibility** - Custom validators for specific needs
- **LLM-Native** - Validation through reasoning, not rules
- **Opt-in/out** - Full control over validation

## NOT in v0.1.0

- ❌ Coded validation rules
- ❌ Separate validation engine
- ❌ Complex validation DSL
- ✅ Simple context switching for validation

## Success Criteria

- Validation context accessible from any FlowMind
- Universal fallback works when not specified
- Custom validators load properly
- Validation happens through context switching
- Results include validation status

---

**This ADR establishes validation as a core FlowMind feature through bidirectional context switching, not a separate system.**