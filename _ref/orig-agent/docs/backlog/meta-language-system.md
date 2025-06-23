# 🔤 META-LANGUAGE SYSTEM SPECIFICATION

*Flexible rule definition supporting YAML, code, and natural language with LLM fallback*

## 📋 **BUSINESS CASE**

**Goal**: Universal rule definition system that allows contexts to define behaviors in YAML, code, or natural language
**Value**: Same context can use simple YAML rules for basic logic, external code for complex algorithms, and natural language for LLM-interpreted behaviors
**Priority**: High - Foundation for dynamic context behavior definition

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-META-001: Multi-Format Rule Support**
```yaml
Given: Context needs to define dynamic behavior rules
When: Rules are defined in context.yaml or external files
Then: System supports YAML rules, JavaScript/Python code, and natural language
And: Rules can reference external files for complex logic
And: Natural language rules fallback to LLM interpretation
And: All formats can be mixed within single context
```

### **AC-META-002: Dynamic Rule Evaluation**
```yaml
Given: Context with defined behavioral rules in any format
When: Context execution requires rule evaluation
Then: System evaluates rules in order of specificity (code > YAML > natural language)
And: Rule results determine context behavior and routing
And: Failed rule evaluation gracefully falls back to next format
```

### **AC-META-003: LLM Natural Language Fallback**
```yaml
Given: Rule defined in natural language (e.g., "escalate when user seems frustrated")
When: Rule needs evaluation during context execution
Then: LLM interprets natural language rule against current context
And: LLM provides boolean result with confidence score
And: Natural language rules enable non-technical rule definition
```

## Architecture

### Core Abstraction

```yaml
# Every context can reference dynamic behaviors
context.yaml:
  # Static definition
  metadata:
    type: "agent"
    
  # Dynamic behavior reference
  dynamic_behaviors: "./behaviors/agent-logic.kingly"
  
  # OR inline behaviors
  inline_behaviors:
    rules:
      - when: "complexity > 0.8"
        then: "escalate to architect"
```

### Supported Formats

```yaml
behavior_formats:
  yaml:
    extension: ".yaml, .yml"
    description: "Structured rule definitions"
    parser: "built-in"
    
  javascript:
    extension: ".js, .mjs"
    description: "Complex logic and calculations"
    parser: "plugin:js-executor"
    
  python:
    extension: ".py"
    description: "Data processing and ML"
    parser: "plugin:py-executor"
    
  natural_language:
    extension: ".md, .txt, inline"
    description: "Human-readable rules"
    parser: "llm-interpreter"
```

### Plugin Architecture

```javascript
// Behavior parser plugin interface
class BehaviorParser {
  canHandle(content, fileExtension) {
    // Return true if this parser handles the format
  }
  
  async parse(content, context) {
    // Return normalized behavior rules
    return {
      rules: [],
      imports: [],
      exports: []
    };
  }
}

// Example: JavaScript parser plugin
class JavaScriptParser extends BehaviorParser {
  canHandle(content, ext) {
    return ['.js', '.mjs'].includes(ext);
  }
  
  async parse(content, context) {
    // Safely execute JS in sandbox
    const sandbox = createSandbox(context);
    return sandbox.execute(content);
  }
}
```

## Rule Patterns

### YAML Rules

```yaml
# behaviors/smart-routing.yaml
rules:
  - name: "High complexity escalation"
    when:
      all:
        - "task.complexity > 0.8"
        - "task.type == 'architecture'"
    then:
      - action: "route"
        target: "agent://dev.architect"
        
  - name: "Security review trigger"
    when:
      any:
        - "files.include('auth')"
        - "files.include('crypto')"
        - "context.tags.includes('security')"
    then:
      - action: "require_review"
        reviewer: "agent://dev.security"
```

### JavaScript Behaviors

```javascript
// behaviors/adaptive-routing.js
export default {
  rules: [
    {
      name: "Adaptive complexity routing",
      when: (context) => {
        // Complex calculation
        const complexity = calculateWeightedComplexity(context);
        const userSkill = context.user.skill_level || 'intermediate';
        
        return complexity > THRESHOLDS[userSkill];
      },
      then: (context) => {
        return {
          action: 'route',
          target: selectOptimalAgent(context),
          confidence: context.analysis.confidence
        };
      }
    }
  ],
  
  // Reusable functions
  helpers: {
    calculateWeightedComplexity,
    selectOptimalAgent
  }
};
```

### Python Behaviors

```python
# behaviors/ml-routing.py
import numpy as np
from sklearn.model_selection import train_test_split

class MLRoutingBehavior:
    def __init__(self):
        self.model = self.load_model()
    
    def rules(self):
        return [{
            'name': 'ML-based routing',
            'when': self.should_trigger,
            'then': self.route_decision
        }]
    
    def should_trigger(self, context):
        # Use ML model for decision
        features = self.extract_features(context)
        probability = self.model.predict_proba([features])[0][1]
        return probability > 0.7
    
    def route_decision(self, context):
        prediction = self.model.predict([self.extract_features(context)])
        return {
            'action': 'route',
            'target': f'agent://{prediction[0]}'
        }

# Export for Kingly
export = MLRoutingBehavior()
```

### Natural Language Rules

```markdown
# behaviors/customer-support.md

When a user seems frustrated (multiple failed attempts, words like "stuck" or "confused"):
- Switch to a more patient, explanatory tone
- Offer to break down the task into smaller steps
- Suggest taking a short break if they've been working for over an hour

If the conversation mentions "deadline" or "urgent":
- Prioritize speed over perfection
- Suggest the fastest path to completion
- Offer to parallelize tasks where possible

When dealing with authentication or security issues:
- Always route to the security specialist endpoint
- Never suggest temporary workarounds
- Emphasize the importance of proper security practices
```

## LLM Integration

### Natural Language Processing

```yaml
llm_rule_processing:
  when_no_pattern_matches:
    action: "send_to_llm"
    prompt: |
      Context: {context}
      Rule: {rule_text}
      
      Interpret this rule and return:
      - Condition to check
      - Action to take
      - Confidence level
      
  continuous_learning:
    successful_interpretations: "cache"
    pattern_extraction: "periodic"
    rule_suggestion: "on_repeated_use"
```

### Hybrid Rules

```yaml
# Mix structured and natural language
rules:
  - name: "Complex decision"
    when:
      structured:
        - "task.type == 'feature'"
        - "task.size > 'medium'"
      natural: "and the user seems unsure about the approach"
    then:
      structured:
        action: "create_subtasks"
      natural: "Break it down into bite-sized pieces they can tackle confidently"
```

## Import System

### Cross-Context Imports

```yaml
# Import behaviors from other contexts
imports:
  - from: "agent://ceo"
    import: ["complexity_assessment", "strategic_routing"]
    
  - from: "pattern://agile"
    import: "sprint_rules"
    
  - from: "@kingly/stdlib"
    import: ["common_patterns", "utility_rules"]

# Use imported rules
rules:
  - name: "Sprint task check"
    when: "sprint_rules.is_sprint_task(context)"
    then: "apply_sprint_workflow"
```

### URL-Based Imports

```yaml
imports:
  # Local context
  - from: "context://./utils"
  
  # Registry
  - from: "@community/routing-pro"
  
  # Direct URL
  - from: "https://rules.company.com/v2/security"
  
  # Git
  - from: "github://org/rules#main"
```

## Execution Model

### Rule Evaluation Order

```yaml
evaluation:
  order:
    1_inline_structured: "YAML rules in context"
    2_inline_natural: "Natural language in context"
    3_referenced_files: "External behavior files"
    4_imported_rules: "Rules from other contexts"
    
  conflict_resolution:
    strategy: "first_match"  # or "all_matches", "highest_confidence"
    precedence: "local_over_imported"
```

### Sandboxed Execution

```yaml
security:
  code_execution:
    sandbox: "required"
    permissions: "explicit"
    resource_limits:
      memory: "100MB"
      cpu: "1 core"
      time: "5 seconds"
      
  capability_access:
    filesystem: "read_only"
    network: "denied"
    context_access: "current_only"
```

## Examples

### Complete Behavior File

```javascript
// behaviors/intelligent-dev.js
import { calculateComplexity } from '@kingly/analysis';

export const config = {
  name: "Intelligent Development Behaviors",
  version: "1.0.0"
};

export const rules = [
  {
    name: "Auto-architect for complex tasks",
    when: async (context) => {
      const complexity = await calculateComplexity(context.task);
      return complexity > 0.8 && context.task.type === 'implementation';
    },
    then: {
      action: 'include_endpoint',
      endpoint: 'architect',
      message: 'This looks complex. Engaging architect perspective...'
    }
  },
  
  {
    name: "Security review for sensitive files",
    when: (context) => {
      const sensitivePatterns = [/auth/, /crypto/, /password/, /token/];
      return context.files.some(file => 
        sensitivePatterns.some(pattern => pattern.test(file))
      );
    },
    then: [
      { action: 'add_reviewer', reviewer: 'agent://dev.security' },
      { action: 'add_context', context: '@kingly/security-checklist' }
    ]
  }
];

// Natural language rules can be embedded too
export const naturalRules = `
  When someone is learning a new technology:
  - Be extra patient and explanatory
  - Provide more context and examples
  - Link to learning resources
  - Celebrate small wins
`;
```

### Context Using Multiple Formats

```yaml
# context.yaml
metadata:
  type: "agent"
  id: "smart-dev"

# Inline YAML rules
inline_behaviors:
  rules:
    - when: "simple_check"
      then: "quick_action"

# Reference to JS logic
dynamic_behaviors: "./behaviors/intelligent-dev.js"

# Natural language rules
additional_rules: |
  If the user seems stuck after 3 attempts,
  suggest a different approach or offer to 
  break down the problem differently.

# Import from other contexts  
imports:
  - from: "pattern://debugging"
    import: "systematic_debug_rules"
```

## Benefits

- **Flexibility**: Use the right tool for each rule type
- **Power**: Full programming languages when needed
- **Simplicity**: Natural language for simple rules
- **Composability**: Import and combine behaviors
- **Safety**: Sandboxed execution
- **Evolution**: LLM interprets unknown patterns

---

*The meta-language system ensures that anyone can define intelligent behaviors in the way that makes most sense for their use case, while the LLM provides a universal fallback for natural language rules.*