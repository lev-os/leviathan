# ADR-006: YAML Configuration Standards

## Status
📝 **DRAFT** - December 19, 2024

## Context
Based on analysis of existing frameworks (PromptFoo's YAML approach, CrewAI's agent definitions, OpenAI Evals registry), need standardized YAML configuration for declarative test definitions that work across all agent patterns.

## Decision
**Implement comprehensive YAML-first configuration system for test definitions, evaluators, and agent specifications**

## YAML Configuration Architecture

### 1. Test Suite Configuration
```yaml
# test-suite.yaml - Main test configuration
test_suite:
  name: "comprehensive_agent_evaluation"
  version: "1.0.0"
  description: "Full evaluation of customer service agent"
  
  # Global settings
  settings:
    timeout: 30000        # 30 second timeout for LLM calls
    parallel: true        # Enable parallel execution
    retry: 3             # Retry failed tests 3 times
    cache: true          # Cache LLM responses
    
  # Provider configurations
  providers:
    claude:
      model: "claude-3-sonnet"
      api_key: "${ANTHROPIC_API_KEY}"
      timeout: 15000
    openai:
      model: "gpt-4"
      api_key: "${OPENAI_API_KEY}"
      timeout: 10000
    ollama:
      model: "llama2"
      base_url: "http://localhost:11434"
      timeout: 20000
  
  # Default evaluators for all tests
  evaluators:
    default: ["accuracy", "safety", "latency", "cost"]
    thresholds:
      accuracy: 0.8
      safety: 0.95
      latency: 2000
      cost: 0.25
```

### 2. Agent Definitions
```yaml
# agents.yaml - Agent specifications
agents:
  customer_service:
    type: "conversational"
    description: "Helpful customer service representative"
    
    # System prompt configuration
    system_prompt: |
      You are a helpful customer service representative.
      Always be polite, professional, and solution-oriented.
    
    # Provider-specific prompts (if needed)
    prompts:
      claude: "prompts/customer-service-claude.md"
      openai: "prompts/customer-service-gpt.md"
      default: "prompts/customer-service-default.md"
    
    # Agent capabilities
    capabilities:
      tools: ["search_knowledge_base", "create_ticket", "escalate"]
      memory: true
      streaming: false
    
    # Testing configuration
    testing:
      patterns: ["conversation", "sample"]
      max_turns: 10
      context_window: 4000
  
  research_analyst:
    type: "trajectory"
    description: "Thorough research and analysis agent"
    
    system_prompt: |
      You are a research analyst. Conduct thorough research,
      analyze information critically, and provide evidence-based conclusions.
    
    capabilities:
      tools: ["web_search", "document_analysis", "data_visualization"]
      memory: true
      planning: true
    
    testing:
      patterns: ["trajectory", "role"]
      max_steps: 15
      planning_required: true
```

### 3. Test Scenarios
```yaml
# scenarios.yaml - Test scenario definitions
scenarios:
  basic_support:
    name: "Basic Customer Support"
    description: "Handle common customer inquiries"
    
    # Test cases
    cases:
      - name: "product_inquiry"
        input: "What are the features of your premium plan?"
        expected_intent: "product_information"
        expected_tone: "helpful_informative"
        
      - name: "billing_question"
        input: "Why was I charged twice this month?"
        expected_intent: "billing_inquiry"
        expected_actions: ["check_billing", "explain_charges"]
        
      - name: "technical_issue"
        input: "The app keeps crashing on my phone"
        expected_intent: "technical_support"
        expected_actions: ["gather_details", "provide_solution"]
    
    # Evaluation criteria
    evaluators:
      - "accuracy"
      - "helpfulness"
      - "response_time"
      - "customer_satisfaction"
    
    # Success criteria
    success_criteria:
      accuracy: 0.9
      helpfulness: 0.8
      response_time: 2000
  
  complex_research:
    name: "Complex Research Task"
    description: "Multi-step research and analysis"
    
    cases:
      - name: "market_analysis"
        input: "Analyze the competitive landscape for AI coding assistants"
        expected_steps:
          - "search_market_data"
          - "identify_competitors" 
          - "analyze_features"
          - "synthesize_findings"
        expected_deliverables:
          - "competitor_matrix"
          - "market_trends"
          - "recommendations"
          
    evaluators:
      - "thoroughness"
      - "accuracy"
      - "logical_flow"
      - "actionable_insights"
```

### 4. Custom Evaluators
```yaml
# evaluators.yaml - Custom evaluator definitions
evaluators:
  # LLM-as-judge evaluators
  helpfulness:
    type: "llm_judge"
    description: "Evaluates how helpful the response is to the user"
    prompt: |
      Rate the helpfulness of this AI response on a scale of 1-10.
      Consider: relevance, actionability, completeness, clarity.
      
      User question: {{input}}
      AI response: {{output}}
      
      Provide only a numeric score (1-10).
    model: "claude-3-sonnet"
    parser: "numeric"
    cache: true
  
  customer_satisfaction:
    type: "llm_judge"
    description: "Predicts customer satisfaction with response"
    prompt: |
      As a customer service expert, predict how satisfied a customer
      would be with this response (1-10 scale).
      
      Customer inquiry: {{input}}
      Agent response: {{output}}
      
      Consider tone, completeness, professionalism, and problem resolution.
      Respond with format: {"score": X, "reasoning": "..."}
    model: "gpt-4"
    parser: "json"
    
  # Rule-based evaluators  
  response_time:
    type: "rule_based"
    description: "Validates response time is within acceptable limits"
    rules:
      - metric: "latency"
        operator: "less_than"
        threshold: 3000
        weight: 1.0
    
  # Multi-criteria evaluators
  overall_quality:
    type: "composite"
    description: "Overall response quality score"
    components:
      accuracy:
        weight: 0.4
        evaluator: "accuracy"
      helpfulness:
        weight: 0.3
        evaluator: "helpfulness"
      safety:
        weight: 0.2
        evaluator: "safety"
      efficiency:
        weight: 0.1
        evaluator: "response_time"
    threshold: 0.75
  
  # Constitutional evaluators (Leviathan-specific)
  constitutional_compliance:
    type: "constitutional"
    description: "Validates adherence to constitutional principles"
    principles:
      - "emotional_balance"
      - "autonomy_preservation"
      - "transparency"
      - "harm_prevention"
    strict_mode: true
    threshold: 0.9
```

### 5. Provider-Specific Configurations
```yaml
# providers.yaml - Detailed provider configurations
providers:
  claude:
    models:
      fast: "claude-3-haiku"
      balanced: "claude-3-sonnet" 
      powerful: "claude-3-opus"
    
    # Default parameters
    defaults:
      temperature: 0.7
      max_tokens: 1000
      top_p: 1.0
    
    # Cost optimization
    cost_optimization:
      prefer_haiku_for: ["simple_tasks", "classification"]
      prefer_sonnet_for: ["analysis", "conversation"]
      prefer_opus_for: ["complex_reasoning", "creative_tasks"]
    
    # Rate limiting
    rate_limits:
      requests_per_minute: 60
      tokens_per_minute: 40000
  
  openai:
    models:
      fast: "gpt-3.5-turbo"
      balanced: "gpt-4"
      powerful: "gpt-4-turbo"
    
    defaults:
      temperature: 0.7
      max_tokens: 1000
      top_p: 1.0
      
    # Function calling support
    function_calling: true
    
  ollama:
    models:
      default: "llama2"
      code: "codellama"
      instruct: "llama2:7b-chat"
    
    # Local deployment settings
    base_url: "http://localhost:11434"
    keep_alive: "5m"
    
    # Resource management
    gpu_layers: -1
    context_length: 4096
```

### 6. Execution Configuration
```yaml
# execution.yaml - Test execution settings
execution:
  # Parallel execution
  parallel:
    enabled: true
    max_concurrent: 5
    per_provider_limit: 2
  
  # Retry logic
  retry:
    max_attempts: 3
    backoff: "exponential"
    base_delay: 1000
    max_delay: 10000
  
  # Caching
  cache:
    enabled: true
    storage: "redis"
    ttl: "24h"
    key_strategy: "content_hash"
  
  # Reporting
  reporting:
    formats: ["json", "html", "junit"]
    output_dir: "./test-results"
    include_traces: true
    include_costs: true
    
    # Dashboard settings
    dashboard:
      enabled: true
      port: 3000
      real_time: true
  
  # Monitoring
  monitoring:
    metrics: ["latency", "cost", "success_rate", "error_rate"]
    alerts:
      latency_p95: 5000
      error_rate: 0.05
      cost_per_test: 1.00
```

## Configuration Validation

### Schema Validation
```javascript
// Automatic YAML schema validation
import { validateConfig } from '@lev-os/testing/config';

const config = await loadConfig('./test-suite.yaml');
const validation = validateConfig(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  process.exit(1);
}
```

### Configuration Merging
```javascript
// Hierarchical configuration merging
const config = await mergeConfigs([
  './defaults.yaml',        // Framework defaults
  './project.yaml',         // Project-specific settings
  './environment.yaml',     // Environment overrides
  process.env.CONFIG_OVERRIDE // Environment variable overrides
]);
```

## Usage Patterns

### 1. Simple Test Configuration
```yaml
# Minimal configuration for quick testing
test_suite:
  name: "quick_test"
  
agents:
  simple_agent:
    system_prompt: "You are a helpful assistant"
    
scenarios:
  basic:
    cases:
      - input: "Hello, how are you?"
        expected: "friendly_greeting"
        
evaluators:
  default: ["accuracy", "safety"]
```

### 2. Comprehensive Production Testing
```yaml
# Full production testing configuration
test_suite:
  name: "production_validation"
  settings:
    parallel: true
    cache: true
    monitoring: true
    
providers:
  primary: "claude"
  fallback: ["openai", "ollama"]
  
agents:
  # Multiple specialized agents
  
scenarios:
  # Comprehensive test scenarios
  
evaluators:
  # Custom business-specific evaluators
  
execution:
  # Production-grade execution settings
```

### 3. A/B Testing Configuration
```yaml
# A/B testing configuration
ab_test:
  name: "prompt_optimization"
  
  variants:
    control:
      prompt: "prompts/original.md"
      weight: 0.5
    treatment:
      prompt: "prompts/optimized.md"
      weight: 0.5
  
  success_metrics:
    - "user_satisfaction"
    - "task_completion"
    - "response_quality"
  
  duration: "7d"
  traffic_allocation: 0.1
```

## Benefits

### Developer Experience
- Declarative configuration reduces code complexity
- Version control friendly (YAML diffs)
- Easy to share and reproduce test setups
- Clear separation of concerns

### Flexibility
- Hierarchical configuration merging
- Environment-specific overrides
- Provider-specific customization
- Modular evaluator definitions

### Maintainability
- Schema validation prevents configuration errors
- Clear documentation through structure
- Reusable configuration components
- Easy configuration evolution

## Integration with Code

### Configuration Loading
```javascript
// Automatic configuration discovery and loading
import { loadTestConfig } from '@lev-os/testing';

// Auto-discovers test-suite.yaml, agents.yaml, etc.
const config = await loadTestConfig('./test-configs/');

// Manual configuration loading
const config = await loadTestConfig({
  suite: './custom-suite.yaml',
  agents: './my-agents.yaml',
  evaluators: './evaluators.yaml'
});
```

### Runtime Configuration
```javascript
// Runtime configuration access
test('configuration integration', async () => {
  const agent = createAgent(config.agents.customer_service);
  const scenario = config.scenarios.basic_support;
  
  const result = await runScenario(agent, scenario);
  
  // Use configured evaluators
  for (const evaluator of scenario.evaluators) {
    expect(result).toPassEval(evaluator, config.evaluators[evaluator]);
  }
});
```

## Consequences
- **Positive**: Declarative configuration improves maintainability
- **Positive**: YAML is human-readable and version control friendly
- **Positive**: Schema validation prevents configuration errors
- **Positive**: Hierarchical merging enables flexible environments
- **Negative**: Additional complexity compared to code-only configuration
- **Negative**: YAML syntax learning curve for some developers
- **Negative**: Schema evolution and backward compatibility challenges

## Related Decisions
- Links to ADR-005 (Universal Agent Interface)
- Links to ADR-007 (Evaluation System Design)
- Links to ADR-009 (Leviathan-Specific Features)