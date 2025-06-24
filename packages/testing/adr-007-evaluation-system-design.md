# ADR-007: Evaluation System Design

## Status
📝 **DRAFT** - December 19, 2024

## Context
Evaluation is the core value proposition of any LLM testing framework. Based on analysis of existing solutions (LangSmith, OpenAI Evals, PromptFoo), need to design a comprehensive evaluation system that addresses gaps while providing superior developer experience.

## Decision
**Build comprehensive evaluation system with built-in evaluators, custom eval creation, and LLM-as-judge patterns**

## Market Gap Analysis

### What Existing Solutions DON'T Solve Well:
1. **Evaluation Complexity** - Difficult setup and configuration
2. **Limited Built-in Metrics** - Most require custom evaluator development
3. **Cross-Provider Evaluation** - Framework lock-in prevents comparison
4. **Constitutional Compliance** - No AI safety/ethics evaluation standards
5. **Real-time Evaluation** - Limited production monitoring capabilities
6. **Cost-Aware Evaluation** - Missing cost optimization metrics

## Evaluation System Architecture

### 1. Built-in Evaluators
```javascript
// Standard evaluation metrics available out-of-the-box
const builtInEvaluators = {
  // Accuracy & Quality
  accuracy: (output, expected) => similarity(output, expected),
  semantic_similarity: (output, expected) => embeddings.similarity(output, expected),
  relevance: (output, context) => contextualRelevance(output, context),
  completeness: (output, requirements) => checkCompleteness(output, requirements),
  
  // Safety & Ethics  
  safety: (output) => toxicityScore(output),
  bias_detection: (output) => biasAnalysis(output),
  hallucination: (output, context) => factualAccuracy(output, context),
  
  // Performance
  latency: (response) => response.metadata.duration,
  cost: (usage) => calculateCost(usage),
  efficiency: (input, output, usage) => calculateEfficiency(input, output, usage),
  
  // Constitutional (Leviathan-specific)
  constitutional_compliance: (output, principles) => validatePrinciples(output, principles),
  autonomy_preservation: (output) => checkAutonomyRespect(output),
  transparency: (output) => assessTransparency(output)
};
```

### 2. Custom Evaluator Creation
```yaml
# YAML-based custom evaluator definitions
evaluators:
  business_value:
    type: "llm_judge"
    prompt: |
      Rate the business value of this response on a scale of 1-10.
      Consider: practicality, actionability, ROI potential.
      Response: {{output}}
    model: "claude-3-sonnet"
    parser: "numeric"
    
  code_quality:
    type: "rule_based"
    rules:
      - condition: "contains_tests"
        weight: 0.3
      - condition: "follows_conventions"  
        weight: 0.4
      - condition: "includes_documentation"
        weight: 0.3
    threshold: 0.7
    
  user_satisfaction:
    type: "human_eval"
    platform: "internal"
    rubric:
      helpfulness: "How helpful is this response? (1-5)"
      clarity: "How clear is this response? (1-5)"
      accuracy: "Is this response accurate? (Yes/No)"
    consensus_threshold: 0.8
```

### 3. LLM-as-Judge Evaluation
```javascript
// Advanced LLM-based evaluation patterns
class LLMJudge {
  constructor(model = 'claude-3-sonnet') {
    this.model = model;
    this.cache = new EvaluationCache();
  }
  
  async evaluate(output, criteria, context = {}) {
    const prompt = this.buildJudgePrompt(output, criteria, context);
    const cacheKey = this.generateCacheKey(prompt);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const judgment = await this.model.evaluate(prompt);
    const parsed = this.parseJudgment(judgment, criteria);
    
    this.cache.set(cacheKey, parsed);
    return parsed;
  }
  
  buildJudgePrompt(output, criteria, context) {
    return `
    As an expert evaluator, assess this AI response against the following criteria:
    
    ${criteria.map(c => `- ${c.name}: ${c.description}`).join('\n')}
    
    Response to evaluate: "${output}"
    ${context.input ? `Original input: "${context.input}"` : ''}
    ${context.expected ? `Expected output: "${context.expected}"` : ''}
    
    Provide scores (1-10) for each criterion and explain your reasoning.
    Format your response as JSON: {"scores": {"criterion1": 8, ...}, "reasoning": "..."}
    `;
  }
}
```

## Evaluation Patterns

### 1. Single Response Evaluation
```javascript
test('evaluate individual responses', async () => {
  const response = await agent.process('What is AI?');
  
  // Built-in evaluators
  expect(response).toPassEval('accuracy', { threshold: 0.8 });
  expect(response).toPassEval('safety');
  expect(response).toPassEval('latency', { max: 2000 });
  
  // Custom evaluators
  expect(response).toPassEval('business_value', { threshold: 7 });
  
  // LLM-as-judge
  expect(response).toPassLLMEval('helpfulness', { 
    judge: 'claude-3-sonnet',
    threshold: 8 
  });
});
```

### 2. Comparative Evaluation
```javascript
test('compare responses across providers', async () => {
  const prompt = 'Explain quantum computing';
  
  const responses = await testMultipleProviders(prompt, [
    'claude-3-sonnet',
    'gpt-4',
    'ollama/llama2'
  ]);
  
  const evaluation = await evaluateComparative(responses, [
    'accuracy',
    'clarity', 
    'completeness',
    'cost'
  ]);
  
  expect(evaluation.winner).toBeDefined();
  expect(evaluation.scores).toHaveLength(3);
});
```

### 3. Trajectory Evaluation
```javascript
test('evaluate multi-step agent execution', async () => {
  const scenario = 'Plan a product launch strategy';
  const trajectory = await agent.executeWithTracing(scenario);
  
  // Evaluate each step
  trajectory.steps.forEach((step, index) => {
    expect(step).toPassEval('relevance', { 
      context: trajectory.context,
      step_index: index 
    });
  });
  
  // Evaluate overall trajectory
  expect(trajectory).toPassEval('logical_flow');
  expect(trajectory).toPassEval('goal_achievement');
  expect(trajectory.tools_used).toContain('research_tool');
});
```

### 4. Dataset-Based Evaluation
```javascript
test('evaluate against golden dataset', async () => {
  const dataset = await loadDataset('golden_responses.json');
  
  const evaluation = await evaluateDataset(agent, dataset, {
    evaluators: ['accuracy', 'semantic_similarity', 'safety'],
    sample_size: 100,
    parallel: true
  });
  
  expect(evaluation.accuracy).toBeGreaterThan(0.85);
  expect(evaluation.safety_violations).toBe(0);
  expect(evaluation.average_latency).toBeLessThan(1500);
});
```

## Advanced Evaluation Features

### 1. Real-time Production Evaluation
```javascript
// Monitor production agents with sampling
const productionMonitor = new ProductionEvaluator({
  sampling_rate: 0.1, // 10% of requests
  evaluators: ['safety', 'cost', 'latency'],
  alerts: {
    safety_threshold: 0.95,
    cost_threshold: 0.50,
    latency_threshold: 3000
  }
});

agent.use(productionMonitor);
```

### 2. A/B Testing Integration
```javascript
test('A/B test prompt variants', async () => {
  const promptA = 'Explain {{topic}} simply';
  const promptB = 'Provide a detailed explanation of {{topic}}';
  
  const abTest = new PromptABTest({
    variants: [promptA, promptB],
    traffic_split: 0.5,
    evaluators: ['user_satisfaction', 'task_completion'],
    duration: '7d'
  });
  
  const results = await abTest.run(testDataset);
  expect(results.statistical_significance).toBeGreaterThan(0.95);
});
```

### 3. Constitutional Compliance Validation
```javascript
// Leviathan-specific constitutional evaluation
test('constitutional compliance', async () => {
  const response = await agent.process(ethicalDilemma);
  
  // Validate against 10 constitutional principles
  expect(response).toPassConstitutionalEval({
    principles: 'all',
    strict: true
  });
  
  // Specific principle validation
  expect(response).toRespectAutonomy();
  expect(response).toPromoteTransparency();
  expect(response).toOptimizeEmotionalBalance();
});
```

## Evaluation Reporting

### 1. Comprehensive Reports
```javascript
// Generate detailed evaluation reports
const report = await generateEvaluationReport({
  agent: myAgent,
  dataset: testDataset,
  evaluators: 'all',
  format: 'html'
});

// Report includes:
// - Overall performance metrics
// - Per-evaluator breakdowns  
// - Failure analysis
// - Improvement recommendations
// - Cost analysis
// - Performance trends
```

### 2. Interactive Dashboards
```javascript
// Real-time evaluation dashboard
const dashboard = new EvaluationDashboard({
  agents: [agent1, agent2, agent3],
  metrics: ['accuracy', 'cost', 'latency', 'safety'],
  refresh_interval: '1m'
});

dashboard.start(); // http://localhost:3000/eval-dashboard
```

## Performance Optimizations

### 1. Evaluation Caching
```javascript
// Cache expensive evaluations
const cache = new EvaluationCache({
  storage: 'redis',
  ttl: '24h',
  key_strategy: 'content_hash'
});

// Automatic cache usage for LLM-as-judge evaluations
llmJudge.use(cache);
```

### 2. Parallel Evaluation
```javascript
// Parallel evaluation for speed
test('parallel evaluation execution', async () => {
  const responses = await agent.processBatch(scenarios);
  
  // Evaluate all responses in parallel
  const evaluations = await evaluateParallel(responses, [
    'accuracy',
    'safety', 
    'cost'
  ], { concurrency: 10 });
  
  expect(evaluations).toHaveLength(scenarios.length);
});
```

## Integration with Testing Framework

### 1. Vitest Integration
```javascript
// Custom Vitest matchers for evaluation
expect.extend({
  toPassEval(received, evaluator, options = {}) {
    const result = evaluateResponse(received, evaluator, options);
    return {
      pass: result.score >= (options.threshold || 0.7),
      message: () => `Expected response to pass ${evaluator} evaluation. Score: ${result.score}`
    };
  }
});
```

### 2. YAML Configuration
```yaml
# Test configuration with evaluations
test_suite:
  name: "comprehensive_agent_evaluation"
  
  evaluators:
    default: ["accuracy", "safety", "latency"]
    custom: 
      - "business_value"
      - "user_satisfaction"
  
  thresholds:
    accuracy: 0.8
    safety: 0.95
    latency: 2000
    cost: 0.25
    
  reporting:
    format: ["json", "html"]
    include_failures: true
    trend_analysis: true
```

## Benefits

### Developer Experience
- Built-in evaluators work out-of-the-box
- Simple YAML configuration for custom evaluators
- Clear, actionable evaluation results
- Integration with existing testing workflows

### Comprehensive Coverage
- Quality, safety, performance, and cost metrics
- Constitutional compliance for responsible AI
- Real-time production monitoring
- Cross-provider comparison capabilities

### Production Ready
- Scalable evaluation infrastructure
- Caching and performance optimizations
- A/B testing and experimentation support
- Enterprise monitoring and alerting

## Consequences
- **Positive**: Comprehensive evaluation system addresses market gaps
- **Positive**: Built-in evaluators provide immediate value
- **Positive**: Constitutional compliance differentiates from competitors
- **Positive**: Production monitoring enables continuous improvement
- **Negative**: Complex system with many components to maintain
- **Negative**: LLM-as-judge evaluations add cost and latency
- **Negative**: Constitutional evaluators may be controversial

## Related Decisions
- Links to ADR-003 (Core Value Proposition)
- Links to ADR-005 (Universal Agent Interface)
- Links to ADR-009 (Leviathan-Specific Features)